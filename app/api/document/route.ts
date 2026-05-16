import { anthropic, MODEL } from "@/lib/anthropic";
import { lookupProtections } from "@/lib/protections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are a documentation assistant helping someone create a detailed record of a discrimination incident. Your role is documentation, not legal advice. You are warm but professional. You ask one question at a time. You validate the weight of what someone is sharing without performing emotion. You push gently for specifics: exact dates, exact quotes, names of people present, locations. Specifics are what make documentation legally useful later.

If someone shares something painful, acknowledge it briefly and then return to the task, because what helps them most is a complete record they can hand to a lawyer or filing agency. Never say "I'm so sorry" more than once per session. Never give legal advice. If asked legal questions, say: "I can't give legal advice. This packet is for you to share with a lawyer or filing agency like the EEOC or HUD."

When you have enough information for a section, extract it using the provided tools. Don't ask the user to repeat information they've already shared. Use the update_packet tool *silently* after each substantive user response — do not narrate the fact that you are recording. Once you have incident_type, date, location, what_happened, parties, witnesses, and evidence captured, call lookup_protections to surface the applicable legal protections. Then offer the user a downloadable PDF and remind them this is documentation, not legal advice.`;

const TOOLS = [
  {
    name: "update_packet",
    description:
      "Update the incident packet with newly captured information. Only include fields you have concrete values for; omit anything you haven't confirmed with the user.",
    input_schema: {
      type: "object" as const,
      properties: {
        incident_type: {
          type: "string",
          enum: ["housing", "employment", "healthcare", "public_accommodation", "other"],
        },
        incident_date: {
          type: "string",
          description: "ISO date YYYY-MM-DD if known; otherwise the most specific date the user provided.",
        },
        incident_location_state: {
          type: "string",
          description: "Two-letter US state code.",
        },
        incident_location_city: { type: "string" },
        parties_involved: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              role: { type: "string" },
            },
            required: ["name", "role"],
          },
        },
        what_happened: {
          type: "string",
          description: "Narrative of what occurred, in the user's own words where possible.",
        },
        witnesses: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              contact: { type: "string" },
              what_they_saw: { type: "string" },
            },
            required: ["name", "what_they_saw"],
          },
        },
        evidence: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              description: { type: "string" },
              location: { type: "string" },
            },
            required: ["type", "description"],
          },
        },
        summary: {
          type: "string",
          description: "One-paragraph summary suitable for the top of the PDF packet.",
        },
      },
    },
  },
  {
    name: "lookup_protections",
    description:
      "Look up federal (and where available, state) legal protections that apply to this incident. Call this once you know incident_type, and optionally state_code.",
    input_schema: {
      type: "object" as const,
      required: ["incident_type"],
      properties: {
        incident_type: {
          type: "string",
          enum: ["housing", "employment", "healthcare", "public_accommodation", "other"],
        },
        state_code: { type: "string", description: "Two-letter US state code." },
      },
    },
  },
];

export async function POST(req: Request) {
  const { messages } = await req.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      try {
        const conversation: Array<{ role: "user" | "assistant"; content: any }> = [
          ...messages,
        ];

        // Safety cap to prevent runaway tool loops.
        const MAX_TURNS = 6;

        for (let turn = 0; turn < MAX_TURNS; turn++) {
          const response = anthropic().messages.stream({
            model: MODEL,
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
            tools: TOOLS,
            messages: conversation,
          });

          for await (const event of response) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              send({ type: "text", delta: event.delta.text });
            }
          }

          const finalMsg = await response.finalMessage();
          conversation.push({ role: "assistant", content: finalMsg.content });

          if (finalMsg.stop_reason !== "tool_use") {
            send({ type: "done" });
            break;
          }

          const toolResults: any[] = [];
          for (const block of finalMsg.content) {
            if (block.type !== "tool_use") continue;
            if (block.name === "update_packet") {
              send({ type: "packet_update", patch: block.input });
              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: JSON.stringify({ ok: true }),
              });
            } else if (block.name === "lookup_protections") {
              const input = block.input as {
                incident_type: any;
                state_code?: string;
              };
              const protections = lookupProtections(
                input.incident_type,
                input.state_code
              );
              send({
                type: "packet_update",
                patch: { applicable_protections: protections },
              });
              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: JSON.stringify(protections),
              });
            } else {
              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: JSON.stringify({ error: "unknown_tool" }),
                is_error: true,
              });
            }
          }
          conversation.push({ role: "user", content: toolResults });
        }
      } catch (e: any) {
        send({
          type: "error",
          message: e?.message || "Something went wrong on the server.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
