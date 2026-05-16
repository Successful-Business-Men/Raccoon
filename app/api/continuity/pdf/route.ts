import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { ContinuityPDF } from "@/lib/pdf/continuity";
import type { ContinuityIntake, ContinuityPlan } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { plan, intake } = (await req.json()) as {
      plan: ContinuityPlan;
      intake: ContinuityIntake;
    };
    const element = createElement(ContinuityPDF, { plan, intake });
    // @ts-expect-error — renderToBuffer accepts our DocumentProps element.
    const buffer = await renderToBuffer(element);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="seagull-continuity-plan.pdf"',
      },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || "PDF render failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
