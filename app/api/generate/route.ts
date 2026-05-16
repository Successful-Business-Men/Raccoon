import { anthropic, MODEL } from "@/lib/anthropic";
import type { ContinuityIntake, ContinuityPlan } from "@/types";
import insuranceJson from "@/data/insurance.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are a migration planning assistant. You help trans people and their families organize the logistics of changing states or losing local access to care. You do not recommend specific providers, do not give clinical advice on medications, and do not make insurance claims you cannot back up.

You produce a structured personalized checklist based on the user's situation. For medication gap risk, compute the risk level from supply and timeline. For each section, be specific and actionable but always within the constraint that you are helping them organize, not deciding for them. End every section with the relevant verified national resource.`;

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
              "A short, editable template letter the user can send to their current provider requesting a complete records transfer to a future provider. Use placeholders like [YOUR NAME] and [NEW PROVIDER].",
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
              "A short note summarizing what the user should verify about their insurance type in their current and destination states. Cite that they should confirm with the carrier; do not invent coverage rules.",
          },
        },
      },
      medication_gap_risk: {
        type: "object",
        required: ["level", "rationale", "items"],
        properties: {
          level: { type: "string", enum: ["low", "moderate", "high", "critical"] },
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
    required: ["title", "detail"],
    properties: {
      title: { type: "string" },
      detail: { type: "string" },
    },
  };
}

function buildUserPrompt(intake: ContinuityIntake) {
  const insurance = (insuranceJson as any).states?.[intake.current_state]
    || (insuranceJson as any).states?._DEFAULT
    || {};
  const insuranceNote = insurance[intake.insurance_type] || insurance.notes || "";
  return `Here is the user's intake. Produce a personalized plan tailored to it.

Current state: ${intake.current_state}
Destination state: ${intake.destination_state || "exploring"}
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
