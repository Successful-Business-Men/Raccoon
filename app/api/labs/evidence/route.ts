import { buildLabEvidenceQuery, searchPubmed } from "@/lib/external/pubmed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { lab_name?: string; regimen?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  const lab = (body.lab_name || "").trim();
  const regimen = (body.regimen || "").trim();
  if (!lab) return json({ citations: [] });
  try {
    const query = buildLabEvidenceQuery(lab, regimen);
    let citations = await searchPubmed(query, 3);
    if (citations.length === 0) {
      // Fall back to a broader query — sometimes the strict trans/HRT filter
      // returns nothing for less-studied labs. Drop the HRT clause.
      const fallback = `"${lab}"[tiab] AND (transgender[tiab] OR \"gender-affirming\"[tiab])`;
      citations = await searchPubmed(fallback, 3);
    }
    return json({ citations, query });
  } catch (e: any) {
    return json({ citations: [], error: e?.message });
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
