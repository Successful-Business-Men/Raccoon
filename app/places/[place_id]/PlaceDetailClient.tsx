"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  MapPin,
  ExternalLink,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Container } from "@/components/Container";
import { ScoreRing } from "@/components/ScoreRing";
import { cn } from "@/lib/cn";
import type { PlaceRecord, SafetyTier, SeedIncident } from "@/types";
import { scorePlace, TIER_DESCRIPTION, TIER_LABEL } from "@/lib/score";
import { getIncidents } from "@/lib/placeIncidents";

const TIER_TEXT_COLOR: Record<SafetyTier, string> = {
  green: "text-status-protected",
  yellow: "text-status-restricted",
  red: "text-status-banned",
};

const TIER_DOT: Record<SafetyTier, string> = {
  green: "bg-status-protected",
  yellow: "bg-status-restricted",
  red: "bg-status-banned",
};

const TIER_HEX: Record<SafetyTier, string> = {
  green: "#34C759",
  yellow: "#FF9500",
  red: "#FF3B30",
};

export function PlaceDetailClient({ place }: { place: PlaceRecord }) {
  const [extras, setExtras] = useState<SeedIncident[]>([]);

  useEffect(() => {
    setExtras(getIncidents(place.place_id));
    function refresh() {
      setExtras(getIncidents(place.place_id));
    }
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [place.place_id]);

  const score = useMemo(
    () => scorePlace({ place, extra_incidents: extras }),
    [place, extras]
  );

  const allIncidents = useMemo(() => {
    const list = [
      ...(place.seed_incidents || []).map((i) => ({ ...i, isUser: false })),
      ...extras.map((i) => ({ ...i, isUser: true })),
    ];
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [place, extras]);

  return (
    <Container className="py-10" size="page">
      <Link
        href="/places"
        className="inline-flex items-center gap-1.5 text-meta text-ink-secondary hover:text-ink-primary mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Safety Score
      </Link>

      {/* Hero */}
      <div className="glass rounded-card p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          <div className="flex-1 min-w-0">
            <div className="text-meta uppercase tracking-[0.12em] text-ink-secondary">
              {place.category}
              {place.chain ? ` · ${place.chain}` : ""}
            </div>
            <h1 className="mt-2 text-section">{place.name}</h1>
            <div className="mt-3 flex items-start gap-2 text-ink-secondary">
              <MapPin className="h-4 w-4 mt-1 shrink-0" />
              <div>
                <div>{place.address}</div>
                <div>
                  {place.city}, {place.state_code}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-chip bg-surface-inset px-3 py-1.5 text-meta",
                  TIER_TEXT_COLOR[score.tier]
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", TIER_DOT[score.tier])} />
                {TIER_LABEL[score.tier]}
              </span>
              <span className="text-meta text-ink-secondary">
                {allIncidents.length}{" "}
                {allIncidents.length === 1 ? "report on record" : "reports on record"}
              </span>
            </div>

            <p className="mt-4 text-ink-secondary leading-relaxed max-w-[55ch]">
              {TIER_DESCRIPTION[score.tier]}
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4 shrink-0">
            <ScoreRing score={score} size={160} stroke={12} />
            <ConfidenceBar score={score} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Signals */}
        <section className="glass rounded-card p-7">
          <h2 className="text-[18px] font-bold tracking-tight mb-1">
            Signals moving this score
          </h2>
          <p className="text-meta text-ink-secondary mb-5">
            Each signal&apos;s contribution to the final score, sorted by
            absolute impact.
          </p>
          <SignalWaterfall score={score} />
        </section>

        {/* Timeline */}
        <section className="glass rounded-card p-7">
          <h2 className="text-[18px] font-bold tracking-tight mb-1">
            Incident timeline
          </h2>
          <p className="text-meta text-ink-secondary mb-5">
            Time-decayed: a report from 18 months ago counts roughly half as
            much as a fresh one.
          </p>
          <Timeline incidents={allIncidents} />
        </section>
      </div>

      {/* CTA */}
      <section className="mt-6 rounded-card bg-accent text-white p-7">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-[18px] font-bold">Had an experience here?</h3>
            <p className="text-[14px] text-white/75 mt-1 max-w-[60ch]">
              Filing a documentation packet through Seagull adds a verified
              first-party signal that updates this score in real time.
            </p>
          </div>
          <Link
            href={`/document?place_id=${encodeURIComponent(place.place_id)}`}
            className="inline-flex items-center justify-center gap-2 rounded-btn bg-white text-ink-primary px-5 py-3 text-[14px] font-bold hover:bg-surface-inset transition-colors shrink-0"
          >
            <FileText className="h-4 w-4" />
            Report an experience
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-card bg-surface-inset p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-ink-primary" />
          <div className="text-meta text-ink-secondary leading-relaxed">
            <strong className="text-ink-primary">Not a verdict.</strong> The
            score is a posterior estimate with a credible interval, derived from
            transparent inputs. Verify before acting. Businesses can claim a
            profile and respond; reports are moderated before counting in
            production.
          </div>
        </div>
      </section>
    </Container>
  );
}

function ConfidenceBar({
  score,
}: {
  score: ReturnType<typeof scorePlace>;
}) {
  const color = TIER_HEX[score.tier];
  return (
    <div className="w-full md:w-[280px]">
      <div className="text-meta uppercase tracking-[0.12em] text-ink-secondary mb-2 text-center md:text-right">
        80% credible interval
      </div>
      <div className="relative h-2 rounded-full bg-surface-inset overflow-hidden">
        <div
          className="absolute top-0 bottom-0 rounded-full opacity-30"
          style={{
            left: `${score.confidence_low}%`,
            right: `${100 - score.confidence_high}%`,
            backgroundColor: color,
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-3 rounded-full ring-2 ring-white"
          style={{
            left: `${score.point_estimate}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-ink-secondary tabular-nums">
        <span>{score.confidence_low}</span>
        <span className="font-bold text-ink-primary">{score.point_estimate}</span>
        <span>{score.confidence_high}</span>
      </div>
    </div>
  );
}

function SignalWaterfall({ score }: { score: ReturnType<typeof scorePlace> }) {
  const max = Math.max(
    1,
    ...score.components.map((c) => Math.abs(c.contribution))
  );
  return (
    <ul className="space-y-4">
      {score.components.map((c, i) => {
        const pct = (Math.abs(c.contribution) / max) * 100;
        const positive = c.contribution > 0;
        const zero = c.contribution === 0;
        const color = positive
          ? "bg-status-protected"
          : zero
            ? "bg-ink-secondary/30"
            : "bg-status-banned";
        return (
          <li key={i}>
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "min-w-[44px] text-right text-meta font-bold tabular-nums shrink-0",
                  positive
                    ? "text-status-protected"
                    : zero
                      ? "text-ink-secondary"
                      : "text-status-banned"
                )}
              >
                {positive ? "+" : ""}
                {Math.round(c.contribution)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] text-ink-primary leading-snug">
                  {c.label}
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-surface-inset overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", color)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1.5 text-meta text-ink-secondary">
                  {c.source_url ? (
                    <a
                      href={c.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
                    >
                      {c.source}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    c.source
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Timeline({
  incidents,
}: {
  incidents: Array<SeedIncident & { isUser: boolean }>;
}) {
  if (incidents.length === 0) {
    return (
      <div className="text-meta text-ink-secondary py-6 text-center">
        No incidents on record. The score reflects state law and corporate
        policy only.
      </div>
    );
  }
  return (
    <ol className="relative pl-5 space-y-5 border-l divider-soft">
      {incidents.map((inc, i) => (
        <li key={i} className="relative">
          <span
            className={cn(
              "absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-surface",
              inc.severity === "high"
                ? "bg-status-banned"
                : inc.severity === "medium"
                  ? "bg-status-restricted"
                  : "bg-ink-secondary"
            )}
          />
          <div className="flex items-center gap-2 text-meta text-ink-secondary">
            <Calendar className="h-3 w-3" />
            <span className="tabular-nums">{inc.date}</span>
            <span className="text-ink-primary uppercase tracking-[0.1em] text-[11px] font-bold">
              {inc.severity}
            </span>
            {inc.isUser && (
              <span className="ml-1 rounded-chip bg-surface-inset px-2 py-0.5 text-[10px] uppercase tracking-[0.1em]">
                You
              </span>
            )}
          </div>
          <div className="mt-1 text-[14px] text-ink-primary leading-snug">
            {inc.summary}
          </div>
          <div className="mt-1 text-meta text-ink-secondary">
            {inc.type.replace("_", " ")} · {inc.source.replace("_", " ")}
            {inc.source_url ? (
              <>
                {" "}
                ·{" "}
                <a
                  href={inc.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline-offset-4 hover:underline"
                >
                  source
                </a>
              </>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
