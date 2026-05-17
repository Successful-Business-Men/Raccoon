import { anthropic, MODEL } from "@/lib/anthropic";
import type { Profile } from "@/lib/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are helping a trans patient prepare for a doctor's visit. Their profile and today's reason are provided.

Your output is shown on a printable card the patient hands to the clinician. It must be:
- FACTUAL. Use only what's in the inputs. Never invent symptoms, durations, doses, history, or vitals.
- NEUTRAL. No diagnostic suggestions. No treatment recommendations. No "should consider", "rule out", "concerning for".
- CONCISE. Respect every word/item budget below.
- RESPECTFUL. Use the patient's pronouns. Do not center transness when the chief complaint is unrelated.

Return VALID JSON ONLY with this exact shape:
{
  "elevator_pitch": "One sentence the patient could read aloud at check-in. 25 words max. First person ('I am here because…'). Plain language.",
  "clinician_shorthand": "What a clinician would write in a note. 20 words max. Standard abbreviations OK (yo, AFAB, AMAB, pmh, h/o, s/p, x3d, etc.). Third person.",
  "questions_to_expect": [ "3 to 5 short specific questions the clinician is likely to ask about TODAY'S chief complaint. Not about hormones unless the complaint is hormone-related." ],
  "questions_patient_should_ask": [ "2 to 4 short questions the patient should ask the clinician about today's complaint. Action-oriented (imaging, followup, what to watch for)." ],
  "framing_note": "One sentence the patient can show the clinician to keep the visit focused. Names today's complaint and explicitly separates it from hormone context. 25 words max."
}

Rules:
- Hormone context is orientation, NOT the chief complaint (unless the patient says it is).
- If the chief complaint is unrelated to hormones, the framing note must say so plainly ("here for X, not for hormone adjustment").
- If the patient hasn't entered a reason, return empty strings/arrays for everything.
- No medical advice. No "watch for", "could be", "may indicate". Questions only.
- JSON only. No prose around the JSON.`;

function describeProfile(p: Profile): string {
  const lines: string[] = [];
  if (p.display_name) lines.push(`Name: ${p.display_name}`);
  if (p.pronouns) lines.push(`Pronouns: ${p.pronouns}`);
  if (p.age) lines.push(`Age: ${p.age}`);
  if (p.sex_assigned_at_birth) lines.push(`Sex assigned at birth: ${p.sex_assigned_at_birth}`);
  if (p.anatomical_inventory) lines.push(`Anatomical inventory: ${p.anatomical_inventory}`);
  if (p.hormone_regimen_summary) lines.push(`Regimen: ${p.hormone_regimen_summary}`);
  if (p.allergies?.length) {
    lines.push(
      `Allergies: ${p.allergies
        .filter((a) => a.substance.trim())
        .map((a) => (a.reaction ? `${a.substance} (${a.reaction})` : a.substance))
        .join(", ")}`
    );
  }
  if (p.medications?.length) {
    lines.push(`Medications:\n${p.medications.map((m) => `  - ${m.description}`).join("\n")}`);
  }
  if (p.surgeries?.length) {
    lines.push(
      `Surgical history:\n${p.surgeries
        .map((s) => `  - ${s.description}${s.date ? ` (${s.date})` : ""}`)
        .join("\n")}`
    );
  }
  return lines.join("\n");
}

interface BriefRequest {
  profile?: Profile;
  reason?: string;
  goals?: string[];
  extraContext?: string;
}

export async function POST(req: Request) {
  let body: BriefRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const profile = body.profile;
  const reason = (body.reason || "").trim();
  const goals = (body.goals || []).map((g) => (g || "").trim()).filter(Boolean);
  const extra = (body.extraContext || "").trim();

  if (!profile) return json({ error: "profile is required" }, 400);
  if (!reason) return json({ error: "reason is required" }, 400);

  const userPrompt = [
    "PROFILE",
    describeProfile(profile),
    "",
    "TODAY'S REASON (in patient's words)",
    reason,
    goals.length
      ? `\nRANKED GOALS\n${goals.map((g, i) => `${i + 1}. ${g}`).join("\n")}`
      : "",
    extra ? `\nOTHER CONTEXT\n${extra}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await anthropic().messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const out = res.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

    const parsed = extractJson(out);
    if (!parsed) return json({ error: "couldn't structure that, try again" }, 200);
    return json(parsed, 200);
  } catch (e: any) {
    return json({ error: e?.message || "Server error" }, 500);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function extractJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    const obj = JSON.parse(text.slice(start, end + 1));
    const arr = (x: any, max: number) =>
      Array.isArray(x)
        ? x
            .map((v: any) => String(v || "").trim())
            .filter(Boolean)
            .slice(0, max)
        : [];
    return {
      elevator_pitch: String(obj?.elevator_pitch || "").trim(),
      clinician_shorthand: String(obj?.clinician_shorthand || "").trim(),
      questions_to_expect: arr(obj?.questions_to_expect, 5),
      questions_patient_should_ask: arr(obj?.questions_patient_should_ask, 4),
      framing_note: String(obj?.framing_note || "").trim(),
    };
  } catch {
    return null;
  }
}
