import { anthropic, MODEL } from "@/lib/anthropic";
import { profileForPrompt, type Profile } from "@/lib/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a careful, friendly lab-report reader for trans patients on hormone therapy. The user is uploading their full blood-work report (image or PDF). Your job is two-fold:

1. EXTRACT every distinct lab result you can read. Skip headers, lab metadata, and patient demographics — only return actual lab measurements.

2. For each lab, give a short verdict against the user's regimen. The user is taking the hormones/meds listed in the profile context. Use that to decide whether a "high" or "low" flag is expected for them, or whether it's a real concern.

GROUND RULES:
- You are NOT a doctor and you do NOT give medical advice. Mention this once in the overall summary, not on every line.
- Be SHORT on each line. One or two sentences max per lab.
- Reference well-established physiology: e.g. testosterone raises hemoglobin and hematocrit; estrogen + spironolactone can shift potassium and creatinine slightly; HRT shifts the reference ranges for testosterone/estradiol away from the assigned-at-birth norm.
- Do NOT invent precise reference ranges you don't know. If something is borderline, say "borderline, ask your doctor."
- If a value is illegible or you're guessing, omit it. Better to skip than to make something up.
- Tone: calm. The user is probably anxious.

OUTPUT FORMAT — RETURN VALID JSON ONLY, NO PROSE BEFORE OR AFTER:
{
  "report_date": "YYYY-MM-DD or empty string",
  "summary": "1-2 sentence overall read of the report",
  "items": [
    {
      "name": "lab name as printed on the report",
      "value": "the numeric value as a string",
      "unit": "unit as printed",
      "flag": "" | "high" | "low" | "critical",
      "verdict": "likely_normal_for_regimen" | "borderline_ask_doctor" | "outside_hrt_explanation" | "unflagged",
      "note": "one short sentence explaining why"
    }
  ]
}

If you cannot read the file at all, return {"report_date":"","summary":"...","items":[]} with the summary explaining why.`;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
]);

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "expected multipart/form-data" }, 400);
  }

  const file = form.get("file");
  const profileRaw = form.get("profile");
  if (!(file instanceof File)) return json({ error: "file is required" }, 400);
  if (!ALLOWED_TYPES.has(file.type)) {
    return json({ error: `unsupported file type: ${file.type || "unknown"}` }, 400);
  }
  if (file.size > MAX_BYTES) {
    return json({ error: "file too large (max 8 MB)" }, 400);
  }

  let profile: Profile | null = null;
  try {
    profile = profileRaw ? JSON.parse(String(profileRaw)) : null;
  } catch {
    profile = null;
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const base64 = bytes.toString("base64");

  const ctx = profile ? profileForPrompt(profile) : "";
  const userText = [
    "Patient context:",
    ctx || "- (no profile data provided)",
    "",
    "Read every lab on the attached report and return the JSON structure described in the system prompt.",
  ].join("\n");

  const filePart =
    file.type === "application/pdf"
      ? ({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: base64 },
        } as const)
      : ({
          type: "image",
          source: {
            type: "base64",
            media_type: file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
            data: base64,
          },
        } as const);

  try {
    const res = await anthropic().messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [filePart as any, { type: "text", text: userText }],
        },
      ],
    });

    const text = res.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

    const parsed = extractJson(text);
    if (!parsed) {
      return json(
        {
          report_date: "",
          summary: "Couldn't parse a clean answer from the report. Try a clearer photo or a PDF.",
          items: [],
        },
        200
      );
    }

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

function extractJson(text: string): null | {
  report_date: string;
  summary: string;
  items: Array<{
    name: string;
    value: string;
    unit: string;
    flag: string;
    verdict: string;
    note: string;
  }>;
} {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const obj = JSON.parse(text.slice(start, end + 1));
    if (!obj || typeof obj !== "object" || !Array.isArray(obj.items)) return null;
    return {
      report_date: String(obj.report_date || ""),
      summary: String(obj.summary || ""),
      items: obj.items.map((it: any) => ({
        name: String(it?.name || ""),
        value: String(it?.value ?? ""),
        unit: String(it?.unit || ""),
        flag: String(it?.flag || ""),
        verdict: String(it?.verdict || "unflagged"),
        note: String(it?.note || ""),
      })),
    };
  } catch {
    return null;
  }
}
