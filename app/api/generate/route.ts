import { anthropic, MODEL } from "@/lib/anthropic";
import { riskOf } from "@/lib/continuity/risk";
import type { ContinuityIntake, ContinuityPlan } from "@/types";
import insuranceJson from "@/data/insurance.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are a migration planning assistant. You help trans people and their families organize the logistics of changing states or losing local access to care. You do not recommend specific providers, do not give clinical advice on medications, and do not make insurance claims you cannot back up.

You produce a structured personalized checklist based on the user's situation. For medication gap risk, write the rationale and items but do NOT decide the level — that is computed deterministically from supply and timeline by the server. For each section, be specific and actionable but always within the constraint that you are helping them organize, not deciding for them. End every section with the relevant verified national resource.

PHASE TAGGING — every checklist item MUST be tagged with a phase:
- "now": do today / this week. Reserve for life-safety, access-critical items, or questions that gate everything else (e.g., "Call pharmacy to confirm exact supply", "Request refill", "Confirm Medicaid eligibility before move").
- "this_week": within the next 7 days.
- "this_month": within the next 30 days.
- "before_move": whenever the actual move happens (records transfer, ID change, final coverage switchover).
Be honest. Most items are NOT "now." Only put an item in "now" if delaying it has real downstream consequences. Aim for roughly 2-4 items at phase "now" across the entire plan.

CARE-TYPE GUIDANCE for records_transfer:
- If "surgery_aftercare" is among care_types, the template_letter and records items MUST explicitly request operative reports, post-operative notes, drain logs, intra-op and post-op photographs where applicable, prescriber details for post-op medications, and pathology results.
- If "hrt" is among care_types, the records request MUST include lab history (at minimum hormone panels), current dosing and frequency, prescriber contact info, and any monitoring schedule.
- If "mental_health" is among care_types, the records request SHOULD include current medication list with prescriber rationale, treatment plan, and (only if the user wants them) session notes.`;

const OUTPUT_TOOL = {
  name: "output_plan",
  description:
    "Emit the structured migration plan. Call this exactly once with the complete plan; do not write any narrative text outside this tool call.",
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
          template_letter: {
            type: "string",
            description:
              "A short, editable template letter the user can send to their current provider requesting a complete records transfer. Use placeholders like [YOUR NAME] and [NEW PROVIDER]. If surgery_aftercare or hrt are in care_types, the letter must list the specific record types required (see care-type guidance in system prompt).",
          },
        },
      },
      insurance_continuity: {
        type: "object",
        required: ["items", "state_notes"],
        properties: {
          items: { type: "array", items: itemSchema() },
          state_notes: {
            type: "string",
            description:
              "A short note summarizing what the user should verify about their insurance type in their current and destination states. Cite that they should confirm with the carrier; do not invent coverage rules. When destination_state is specific (not 'exploring'), name the transition explicitly.",
          },
        },
      },
      medication_gap_risk: {
        type: "object",
        required: ["level", "rationale", "items"],
        properties: {
          level: {
            type: "string",
            enum: ["low", "moderate", "high", "critical"],
            description:
              "Placeholder — this will be overwritten by the server's deterministic calculation. Pick any reasonable value.",
          },
          rationale: {
            type: "string",
            description:
              "1–2 sentence explanation citing supply days and timeline. Do not recommend specific medications or bridging methods.",
          },
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
        description:
          "When this item should be done. See PHASE TAGGING in the system prompt.",
      },
    },
  };
}

function buildUserPrompt(intake: ContinuityIntake) {
  const insurance = (insuranceJson as any).states?.[intake.current_state]
    || (insuranceJson as any).states?._DEFAULT
    || {};
  const insuranceNote = insurance[intake.insurance_type] || insurance.notes || "";
  const dest =
    !intake.destination_state || intake.destination_state === "exploring"
      ? "exploring (no specific destination)"
      : intake.destination_state;
  return `Here is the user's intake. Produce a personalized plan tailored to it.

Current state: ${intake.current_state}
Destination state: ${dest}
Care types: ${intake.care_types.join(", ")}
Insurance type: ${intake.insurance_type}
Timeline: ${intake.timeline}
Medication supply (days): ${intake.medication_supply_days ?? "unknown"}
Provider willing to do cross-state telehealth: ${intake.telehealth_available}

State insurance note for reference (do not quote verbatim, use as background only):
${insuranceNote}

Required community resources to include (under community_resources): Trans Lifeline, Point of Pride, Campaign for Southern Equality (TYEP), Advocates for Trans Equality (A4TE). Include each with its public URL.`;
}

export async function POST(req: Request) {
  try {
    const intake = (await req.json()) as ContinuityIntake;

    const msg = await anthropic().messages.create({
      model: MODEL,
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      tools: [OUTPUT_TOOL],
      tool_choice: { type: "tool", name: "output_plan" },
      messages: [{ role: "user", content: buildUserPrompt(intake) }],
    });

    const toolUse = msg.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return new Response(
        JSON.stringify({ error: "Model did not return a plan." }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const plan = toolUse.input as ContinuityPlan;

    // Deterministic risk: overwrite the model's guess with the computed level
    // and attach the math for UI transparency.
    const risk = riskOf(intake);
    plan.medication_gap_risk.level = risk.level;
    plan.medication_gap_risk.assessment = risk.assessment;

    return new Response(JSON.stringify({ plan }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || "Plan generation failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
