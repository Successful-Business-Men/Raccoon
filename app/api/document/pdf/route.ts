import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { IncidentPDF } from "@/lib/pdf/incident";
import type { IncidentPacket } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { packet } = (await req.json()) as { packet: IncidentPacket };
    const element = createElement(IncidentPDF, { packet });
    // @ts-expect-error — renderToBuffer accepts our DocumentProps element.
    const buffer = await renderToBuffer(element);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="seagull-incident-packet.pdf"',
      },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || "PDF render failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
