import { anthropic, MODEL } from "@/lib/anthropic";
import { riskOf } from "@/lib/continuity/risk";
import type {
  ContinuityIntake,
  ContinuityPlan,
  Timeline,
} from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMELINE_KEYWORDS: Array<{ re: RegExp; value: Timeline }> = [
  { re: /\bimmediate(ly)?\b|\bright now\b|\bASAP\b/i, value: "immediate" },
  { re: /\bsoon\b|\bnext\s*(\d+\s*)?month\b/i, value: "soon" },
  { re: /\bplanning\b|\bin\s*\d+\s*months?\b/i, value: "planning" },
  { re: /\bexploring\b|\bno (firm|specific) timeline\b/i, value: "exploring" },
];

// Light intake auto-update from natural-language delta. Conservative: only
// patterns we can recognize unambiguously. Everything else is passed through
// to the model as free-text context.
function applyDelta(
  intake: ContinuityIntake,
  delta: string
): { intake: ContinuityIntake; applied: string[] } {
  const applied: string[] = [];
  const next: ContinuityIntake = { ...intake };

  const supplyMatch = delta.match(/(\d{1,3})\s*(day|days|d)\b/i);
  if (supplyMatch) {
    const days = parseInt(supplyMatch[1], 10);
    if (!Number.isNaN(days) && days >= 0 && days <= 365) {
      next.medication_supply_days = days;
      applied.push(`medication_supply_days → ${days}`);
    }
  }

  for (const { re, value } of TIMELINE_KEYWORDS) {
    if (re.test(delta)) {
      next.timeline = value;
      applied.push(`timeline → ${value}`);
      break;
    }
  }

  if (/\bno (longer )?insurance\b|\blost (my )?insurance\b/i.test(delta)) {
    next.insurance_type = "uninsured";
    applied.push("insurance_type → uninsured");
  }

  return { intake: next, applied };
}

const SYSTEM_PROMPT = `You are updating an existing migration plan for a trans person navigating state-to-state care. The user has had a situation change. Produce a complete revised plan that preserves what still applies and updates what changed. If the delta affects supply or timeline, recompute everything downstream. Same guardrails as the initial plan: no specific providers, no clinical advice, no invented coverage rules.

PHASE TAGGING applies identically: every item gets "now", "this_week", "this_month", or "before_move". Aim for 2-4 items at "now" total.

The server will recompute medication_gap_risk.level deterministically — write the rationale and items but pick any value for level.`;

const OUTPUT_TOOL = {
  name: "output_plan",
  description:
    "Emit the revised migration plan. Same shape as the initial plan.",
  input_schema: {
    type: "object" as const,
    required: [
      "records_transfer",
      "insurance_continuity",
      "medication_gap_risk",
      "finding_new_care",
      "legal_and_id",
      "community_resources",
    ],
    properties: {
      records_transfer: {
        type: "object",
        required: ["items", "template_letter"],
        properties: {
          items: { type: "array", items: itemSchema() },
          template_letter: { type: "string" },
        },
      },
      insurance_continuity: {
        type: "object",
        required: ["items", "state_notes"],
        properties: {
          items: { type: "array", items: itemSchema() },
          state_notes: { type: "string" },
        },
      },
      medication_gap_risk: {
        type: "object",
        required: ["level", "rationale", "items"],
        properties: {
          level: {
            type: "string",
            enum: ["low", "moderate", "high", "critical"],
          },
          rationale: { type: "string" },
          items: { type: "array", items: itemSchema() },
        },
      },
      finding_new_care: {
        type: "object",
        required: ["questions_to_ask", "red_flags", "items"],
        properties: {
          questions_to_ask: { type: "array", items: { type: "string" } },
          red_flags: { type: "array", items: { type: "string" } },
          items: { type: "array", items: itemSchema() },
        },
      },
      legal_and_id: {
        type: "object",
        required: ["items"],
        properties: { items: { type: "array", items: itemSchema() } },
      },
      community_resources: {
        type: "object",
        required: ["items"],
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              required: ["name", "url"],
              properties: {
                name: { type: "string" },
                url: { type: "string" },
                note: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
};

function itemSchema() {
  return {
    type: "object" as const,
    required: ["title", "detail", "phase"],
    properties: {
      title: { type: "string" },
      detail: { type: "string" },
      phase: {
        type: "string",
        enum: ["now", "this_week", "this_month", "before_move"],
      },
    },
  };
}

function buildUserPrompt(
  intake: ContinuityIntake,
  prior: ContinuityPlan,
  delta: string,
  applied: string[]
) {
  return `The user's prior plan and current intake are below. The user has provided a free-text update describing what changed. Produce a complete revised plan that reflects the change. Preserve items that still apply.

== Current intake (after auto-applying recognized changes) ==
Current state: ${intake.current_state}
Destination state: ${intake.destination_state || "exploring"}
Care types: ${intake.care_types.join(", ")}
Insurance type: ${intake.insurance_type}
Timeline: ${intake.timeline}
Medication supply (days): ${intake.medication_supply_days ?? "unknown"}
Cross-state telehealth: ${intake.telehealth_available}

Auto-applied from delta: ${applied.length ? applied.join("; ") : "(none — delta is free-text only)"}

== User's update ==
${delta.trim()}

== Prior plan (for reference; revise rather than start over) ==
${JSON.stringify(prior, null, 2)}

Output the revised plan. Same community resources requirement as initial plan: Trans Lifeline, Point of Pride, Campaign for Southern Equality (TYEP), Advocates for Trans Equality (A4TE).`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      intake: ContinuityIntake;
      plan: ContinuityPlan;
      delta: string;
    };
    if (!body?.intake || !body?.plan || !body?.delta?.trim()) {
      return new Response(
        JSON.stringify({ error: "intake, plan, and non-empty delta are required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { intake: nextIntake, applied } = applyDelta(body.intake, body.delta);

    const msg = await anthropic().messages.create({
      model: MODEL,
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      tools: [OUTPUT_TOOL],
      tool_choice: { type: "tool", name: "output_plan" },
      messages: [
        {
          role: "user",
          content: buildUserPrompt(nextIntake, body.plan, body.delta, applied),
        },
      ],
    });

    const toolUse = msg.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return new Response(
        JSON.stringify({ error: "Model did not return a plan." }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const plan = toolUse.input as ContinuityPlan;
    const risk = riskOf(nextIntake);
    plan.medication_gap_risk.level = risk.level;
    plan.medication_gap_risk.assessment = risk.assessment;

    return new Response(
      JSON.stringify({ plan, intake: nextIntake, applied }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || "Refinement failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
