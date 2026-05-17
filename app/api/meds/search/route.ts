import { approximateMatch } from "@/lib/external/rxnorm";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q || q.length < 2) {
    return new Response(JSON.stringify({ candidates: [] }), {
      headers: { "content-type": "application/json" },
    });
  }
  try {
    const candidates = await approximateMatch(q, 6);
    return new Response(JSON.stringify({ candidates }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ candidates: [], error: e?.message }), {
      headers: { "content-type": "application/json" },
    });
  }
}
