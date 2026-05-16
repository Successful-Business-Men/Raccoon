"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowUp, Download, Loader2, MapPin } from "lucide-react";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { cn } from "@/lib/cn";
import type { IncidentPacket, ProtectionRecord, SeedIncident } from "@/types";
import { getPlace } from "@/lib/score";
import { appendIncident } from "@/lib/placeIncidents";

type ChatMsg = { role: "user" | "assistant"; content: string };

const OPENER: ChatMsg = {
  role: "assistant",
  content:
    "What kind of incident are you documenting? You can type freely, or pick a category to start.",
};

const CATEGORY_CHIPS: Array<{ label: string; value: string }> = [
  {
    label: "Violence or threat to safety",
    value: "I'd like to document a violent incident or threat to my safety.",
  },
  {
    label: "Education (Title IX)",
    value: "I'd like to document an incident at a school or university.",
  },
  { label: "Housing", value: "I'd like to document a housing incident." },
  { label: "Employment", value: "I'd like to document an employment incident." },
  { label: "Healthcare", value: "I'd like to document a healthcare incident." },
  {
    label: "Public accommodation",
    value: "I'd like to document a public accommodation incident.",
  },
  { label: "Other", value: "I'd like to document another kind of incident." },
];

export function DocumentClient() {
  const params = useSearchParams();
  const placeId = params.get("place_id") || undefined;
  const place = useMemo(() => (placeId ? getPlace(placeId) : undefined), [placeId]);

  const [messages, setMessages] = useState<ChatMsg[]>(() =>
    place
      ? [
          {
            role: "assistant",
            content: `Documenting an incident at ${place.name} (${place.city}, ${place.state_code}). What kind of incident are you documenting? You can type freely, or pick a category.`,
          },
        ]
      : [OPENER]
  );
  const [packet, setPacket] = useState<IncidentPacket>(() =>
    place
      ? {
          incident_location_city: place.city,
          incident_location_state: place.state_code,
        }
      : {}
  );
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [savedToPlace, setSavedToPlace] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // When the packet hits "ready" and we have a place_id, write the
  // incident to the local Safety Score feed so the score updates live.
  useEffect(() => {
    if (!place || savedToPlace) return;
    if (!isPacketReady(packet)) return;
    const incident: SeedIncident = {
      date: packet.incident_date || new Date().toISOString().slice(0, 10),
      severity: "medium",
      type: packet.incident_type || "other",
      source: "user_report",
      summary: (packet.summary || packet.what_happened || "User-reported incident").slice(0, 240),
    };
    appendIncident(place.place_id, incident);
    setSavedToPlace(true);
  }, [packet, place, savedToPlace]);

  // Auto-scroll
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamingText]);

  async function send(userText: string) {
    if (!userText.trim() || busy) return;
    setInput("");
    const userMsg: ChatMsg = { role: "user", content: userText };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setBusy(true);
    setStreamingText("");

    try {
      const res = await fetch("/api/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Drop the seeded opener from the wire — server uses its own system prompt.
          messages: nextMessages
            .slice(1)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Server error (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";
        for (const evt of events) {
          if (!evt.startsWith("data: ")) continue;
          const json = evt.slice(6);
          try {
            const data = JSON.parse(json);
            if (data.type === "text") {
              assistantText += data.delta;
              setStreamingText(assistantText);
            } else if (data.type === "packet_update") {
              setPacket((p) => mergePacket(p, data.patch));
            } else if (data.type === "error") {
              assistantText +=
                (assistantText ? "\n\n" : "") + "*An error occurred. Please try again.*";
              setStreamingText(assistantText);
            }
          } catch {
            // ignore malformed chunks
          }
        }
      }

      if (assistantText.trim()) {
        setMessages((m) => [...m, { role: "assistant", content: assistantText }]);
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Something went wrong reaching the server. Please try again in a moment.",
        },
      ]);
    } finally {
      setStreamingText("");
      setBusy(false);
    }
  }

  const showOpenerChips = messages.length === 1 && !busy;
  const packetReady = isPacketReady(packet);

  return (
    <Container className="py-12">
      <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
        {/* Chat column */}
        <div className="flex flex-col min-h-[70vh]">
          <header className="mb-6">
            <h1 className="text-section">Document an incident</h1>
            <p className="mt-3 text-lede text-ink-secondary">
              I&apos;ll ask a few questions and build a structured packet you can
              hand to a lawyer or filing agency.
            </p>
            {place && (
              <div className="mt-5 rounded-card bg-surface-inset p-4 flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 shrink-0 text-ink-primary" />
                <div className="flex-1 text-meta">
                  <div className="text-ink-primary font-bold">
                    Filing at {place.name}
                  </div>
                  <div className="text-ink-secondary">
                    {place.address} · {place.city}, {place.state_code} ·{" "}
                    {savedToPlace ? (
                      <Link
                        href={`/places`}
                        className="text-status-protected underline-offset-4 hover:underline"
                      >
                        Added to Safety Score ↗
                      </Link>
                    ) : (
                      "will feed the Safety Score once the packet is filled"
                    )}
                  </div>
                </div>
              </div>
            )}
          </header>

          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto pr-1 space-y-4 pb-6"
          >
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} text={m.content} />
            ))}
            {streamingText && <Bubble role="assistant" text={streamingText} streaming />}
            {busy && !streamingText && (
              <div className="flex items-center gap-2 text-ink-secondary text-meta">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
              </div>
            )}
          </div>

          {showOpenerChips && (
            <div className="flex flex-wrap gap-2 pb-4">
              {CATEGORY_CHIPS.map((c) => (
                <Pill key={c.label} onClick={() => send(c.value)}>
                  {c.label}
                </Pill>
              ))}
            </div>
          )}

          <ChatInput
            value={input}
            onChange={setInput}
            onSend={() => send(input)}
            disabled={busy}
          />
        </div>

        {/* Packet preview column */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <PacketPreview packet={packet} ready={packetReady} />
        </aside>
      </div>
    </Container>
  );
}

function Bubble({
  role,
  text,
  streaming,
}: {
  role: "user" | "assistant";
  text: string;
  streaming?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-card px-5 py-3.5 text-body leading-relaxed whitespace-pre-wrap",
          isUser
            ? "glass-inset text-ink-primary"
            : "glass text-ink-primary"
        )}
      >
        {text}
        {streaming && <span className="inline-block w-2 h-4 ml-0.5 bg-ink-primary/40 animate-pulse align-middle" />}
      </div>
    </div>
  );
}

function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
}) {
  return (
    <div className="glass rounded-card p-3 flex items-end gap-2 border border-divider/30">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="Type a reply…"
        rows={1}
        className="flex-1 resize-none bg-transparent px-3 py-2 text-body placeholder:text-ink-secondary focus:outline-none"
        style={{ minHeight: 40, maxHeight: 160 }}
        disabled={disabled}
      />
      <Button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        size="sm"
        aria-label="Send"
        className="h-10 w-10 p-0"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </div>
  );
}

function PacketPreview({ packet, ready }: { packet: IncidentPacket; ready: boolean }) {
  const [downloading, setDownloading] = useState(false);
  async function download() {
    setDownloading(true);
    try {
      const res = await fetch("/api/document/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packet }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "seagull-incident-packet.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Couldn't generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="glass rounded-card p-7">
      <div className="flex items-center justify-between">
        <h2 className="text-subsection">Your packet</h2>
        {ready && (
          <Button size="sm" onClick={download} disabled={downloading}>
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            PDF
          </Button>
        )}
      </div>

      <div className="mt-5 divide-y divider-soft">
        <Field label="Incident type" value={prettyIncidentType(packet.incident_type)} />
        <Field
          label="Date and location"
          value={
            [packet.incident_date, packet.incident_location_city, packet.incident_location_state]
              .filter(Boolean)
              .join(" · ") || null
          }
        />
        <Field label="What happened" value={packet.what_happened} clamp />
        <Field
          label="Parties involved"
          value={
            packet.parties_involved && packet.parties_involved.length
              ? packet.parties_involved
                  .map((p) => `${p.name}${p.role ? ` (${p.role})` : ""}`)
                  .join("\n")
              : null
          }
        />
        <Field
          label="Witnesses"
          value={
            packet.witnesses && packet.witnesses.length
              ? packet.witnesses
                  .map((w) => `${w.name}${w.contact ? ` · ${w.contact}` : ""}`)
                  .join("\n")
              : null
          }
        />
        <Field
          label="Evidence"
          value={
            packet.evidence && packet.evidence.length
              ? packet.evidence.map((e) => `${e.type}: ${e.description}`).join("\n")
              : null
          }
        />
        <Field
          label="Applicable protections"
          value={
            packet.applicable_protections && packet.applicable_protections.length
              ? packet.applicable_protections
                  .map((p: ProtectionRecord) => p.title)
                  .join("\n")
              : null
          }
        />
      </div>

      {!ready && (
        <p className="mt-6 text-meta text-ink-secondary">
          Sections fill in as we go.
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  clamp,
}: {
  label: string;
  value: string | null | undefined;
  clamp?: boolean;
}) {
  return (
    <div className="py-3">
      <div className="text-meta uppercase tracking-[0.12em] text-ink-secondary">
        {label}
      </div>
      <div
        className={cn(
          "mt-1.5 text-body whitespace-pre-wrap",
          value ? "text-ink-primary" : "text-ink-secondary",
          clamp && "line-clamp-4"
        )}
      >
        {value || "Not yet captured"}
      </div>
    </div>
  );
}

function isPacketReady(p: IncidentPacket): boolean {
  return Boolean(
    p.incident_type && p.what_happened && (p.parties_involved?.length || p.evidence?.length)
  );
}

function prettyIncidentType(t: IncidentPacket["incident_type"]): string | null {
  if (!t) return null;
  return (
    {
      violence: "Violence or threat to safety",
      education: "Education (Title IX)",
      housing: "Housing",
      employment: "Employment",
      healthcare: "Healthcare",
      public_accommodation: "Public accommodation",
      other: "Other",
    }[t] || null
  );
}

function mergePacket(prev: IncidentPacket, patch: any): IncidentPacket {
  return {
    ...prev,
    ...patch,
    // Concatenate arrays rather than replace, so multiple updates accumulate.
    parties_involved: dedupBy(
      [...(prev.parties_involved || []), ...(patch.parties_involved || [])],
      (p) => `${p.name}|${p.role}`
    ),
    witnesses: dedupBy(
      [...(prev.witnesses || []), ...(patch.witnesses || [])],
      (w) => `${w.name}|${w.contact || ""}`
    ),
    evidence: dedupBy(
      [...(prev.evidence || []), ...(patch.evidence || [])],
      (e) => `${e.type}|${e.description}`
    ),
    applicable_protections:
      patch.applicable_protections || prev.applicable_protections,
  };
}

function dedupBy<T>(arr: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}
