import { scrapeLegiscan } from "@/lib/scrapers/legiscan";
import { scrapeLambdaLegal } from "@/lib/scrapers/lambda_legal_feed";
import { scrapeMap } from "@/lib/scrapers/map_tracker";
import { scrapeKff } from "@/lib/scrapers/kff_tracker";
import { supabaseService } from "@/lib/supabase/server";
import type { StateCareData } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return new Response("CRON_SECRET not configured", { status: 500 });
  }
  const provided = req.headers.get("authorization") || "";
  if (provided !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const [legiscan, lambda, map, kff] = await Promise.allSettled([
    scrapeLegiscan(),
    scrapeLambdaLegal(),
    scrapeMap(),
    scrapeKff(),
  ]);

  const results = { legiscan, lambda, map, kff };
  const updates: Partial<StateCareData>[] = [
    ...(legiscan.status === "fulfilled" ? legiscan.value : []),
    ...(lambda.status === "fulfilled" ? lambda.value : []),
    ...(map.status === "fulfilled" ? map.value : []),
    ...(kff.status === "fulfilled" ? kff.value : []),
  ];

  // TODO: merge `updates` into Supabase `care_status` table by state_code,
  // preserving the strictest current status across sources and stamping
  // last_updated. For now we just log and return the counts.
  const svc = supabaseService();
  if (svc) {
    // await svc.from("care_status_updates").insert({ payload: updates });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      counts: {
        legiscan: legiscan.status === "fulfilled" ? legiscan.value.length : 0,
        lambda: lambda.status === "fulfilled" ? lambda.value.length : 0,
        map: map.status === "fulfilled" ? map.value.length : 0,
        kff: kff.status === "fulfilled" ? kff.value.length : 0,
      },
      results,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
