import { adverseEventSnapshot, recentRecalls } from "@/lib/external/openfda";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { drugs?: string[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  const drugs = (body.drugs || []).map((d) => String(d || "").trim()).filter(Boolean);
  if (!drugs.length) return json({ items: [] });

  const items = await Promise.all(
    drugs.map(async (drug) => {
      try {
        const [recalls, adverse] = await Promise.all([
          recentRecalls(drug, 3),
          adverseEventSnapshot(drug),
        ]);
        return { drug, recalls, adverse };
      } catch {
        return { drug, recalls: [], adverse: null };
      }
    })
  );

  return json({ items });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
