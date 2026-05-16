"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, AlertTriangle, FileText, ExternalLink } from "lucide-react";
import { Container } from "@/components/Container";
import { Pill } from "@/components/Pill";
import { cn } from "@/lib/cn";
import type { PlaceRecord, SafetyScore, SafetyTier, SeedIncident } from "@/types";
import { scorePlace, TIER_DESCRIPTION, TIER_LABEL } from "@/lib/score";
import { getAllUserIncidents } from "@/lib/placeIncidents";

const CATEGORIES = [
  "All",
  "Restaurant",
  "Retail",
  "Healthcare",
  "Pharmacy",
  "Bar/Nightlife",
  "Hotel/Lodging",
  "Service",
] as const;

export function PlacesClient({ places }: { places: PlaceRecord[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [userIncidents, setUserIncidents] = useState<Record<string, SeedIncident[]>>({});

  useEffect(() => {
    setUserIncidents(getAllUserIncidents());
    function onStorage() {
      setUserIncidents(getAllUserIncidents());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const scored = useMemo(() => {
    return places.map((p) => ({
      place: p,
      score: scorePlace({ place: p, extra_incidents: userIncidents[p.place_id] || [] }),
    }));
  }, [places, userIncidents]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scored.filter(({ place }) => {
      if (category !== "All" && place.category !== category) return false;
      if (!q) return true;
      return (
        place.name.toLowerCase().includes(q) ||
        place.city.toLowerCase().includes(q) ||
        place.state_code.toLowerCase().includes(q) ||
        (place.chain || "").toLowerCase().includes(q)
      );
    });
  }, [scored, query, category]);

  return (
    <Container className="py-12">
      <header className="mb-8 max-w-prose">
        <h1 className="text-section">Safety Score</h1>
        <p className="mt-3 text-ink-secondary leading-relaxed">
          A decision aid for physical businesses — combining state legal
          posture, corporate non-discrimination policy, and first-party incident
          reports filed through Seagull. Each score shows its receipts.
        </p>
      </header>

      <div className="rounded-card bg-surface shadow-card p-5 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-secondary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, chain, city, or state code"
              className="w-full pl-11 pr-4 py-3 rounded-btn border border-divider bg-surface focus:outline-none focus:ring-2 focus:ring-accent/30 text-[15px]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Pill key={c} selected={category === c} onClick={() => setCategory(c)}>
                {c}
              </Pill>
            ))}
          </div>
        </div>
        <div className="mt-4 text-meta text-ink-secondary">
          {filtered.length} {filtered.length === 1 ? "place" : "places"} ·
          state baseline + HRC CEI + first-party incidents (incl. anything you file
          via Document)
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map(({ place, score }) => (
          <PlaceCard key={place.place_id} place={place} score={score} />
        ))}
        {filtered.length === 0 && (
          <div className="md:col-span-2 rounded-card bg-surface-inset p-8 text-center text-ink-secondary">
            No places match. Try a different search.
          </div>
        )}
      </div>

      <Methodology />
    </Container>
  );
}

const TIER_COLOR: Record<SafetyTier, { dot: string; ring: string; text: string }> = {
  green: { dot: "bg-status-protected", ring: "ring-status-protected/30", text: "text-status-protected" },
  yellow: { dot: "bg-status-restricted", ring: "ring-status-restricted/30", text: "text-status-restricted" },
  red: { dot: "bg-status-banned", ring: "ring-status-banned/30", text: "text-status-banned" },
};

function PlaceCard({ place, score }: { place: PlaceRecord; score: SafetyScore }) {
  const [open, setOpen] = useState(false);
  const color = TIER_COLOR[score.tier];

  return (
    <div className="rounded-card bg-surface shadow-card overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-meta uppercase tracking-[0.12em] text-ink-secondary">
              {place.category} · {place.city}, {place.state_code}
            </div>
            <h3 className="mt-1 text-[18px] font-bold tracking-tight truncate">
              {place.name}
            </h3>
            <div className="mt-1 text-meta text-ink-secondary truncate">
              {place.address}
            </div>
          </div>
          <ScoreDial score={score} color={color} />
        </div>

        <div className="mt-4 flex items-center gap-2 text-meta">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-chip bg-surface-inset px-3 py-1",
              color.text
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", color.dot)} />
            {TIER_LABEL[score.tier]}
          </span>
          <span className="text-ink-secondary">
            {score.incident_count} {score.incident_count === 1 ? "report" : "reports"}
          </span>
        </div>

        <p className="mt-3 text-meta text-ink-secondary">
          {TIER_DESCRIPTION[score.tier]}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 text-meta text-ink-primary hover:underline underline-offset-4"
          >
            Why this score?
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
          </button>
          <Link
            href={`/document?place_id=${encodeURIComponent(place.place_id)}`}
            className="ml-auto inline-flex items-center gap-1.5 text-meta text-ink-primary hover:underline underline-offset-4"
          >
            <FileText className="h-3.5 w-3.5" />
            Report an experience here
          </Link>
        </div>
      </div>

      {open && (
        <div className="border-t divider-soft bg-surface-inset px-6 py-5">
          <div className="text-meta uppercase tracking-[0.12em] text-ink-secondary mb-3">
            Signals moving this score
          </div>
          <ul className="space-y-3">
            {score.components.map((c, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-1 inline-block min-w-[44px] text-right text-meta font-bold",
                    c.contribution > 0 ? "text-status-protected" : c.contribution < 0 ? "text-status-banned" : "text-ink-secondary"
                  )}
                >
                  {c.contribution > 0 ? "+" : ""}
                  {Math.round(c.contribution)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-ink-primary leading-snug">
                    {c.label}
                  </div>
                  <div className="text-meta text-ink-secondary mt-0.5">
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
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-4 border-t divider-soft text-meta text-ink-secondary leading-relaxed">
            Score is a posterior estimate, not a verdict. The credible interval
            ({score.confidence_low}–{score.confidence_high}) reflects how much
            data we have. Always verify before acting.
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreDial({
  score,
  color,
}: {
  score: SafetyScore;
  color: { dot: string; ring: string; text: string };
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-icon bg-surface-inset ring-1",
        color.ring
      )}
      style={{ minWidth: 76, padding: "10px 14px" }}
    >
      <div className={cn("text-[28px] leading-none font-bold", color.text)}>
        {score.point_estimate}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-ink-secondary">
        ±{Math.round((score.confidence_high - score.confidence_low) / 2)}
      </div>
    </div>
  );
}

function Methodology() {
  return (
    <section className="mt-12 rounded-card bg-surface-inset p-7">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-ink-primary" />
        <div className="text-meta text-ink-secondary leading-relaxed">
          <div className="text-ink-primary text-[14px] font-bold mb-2">
            How the score works
          </div>
          <p>
            Start with a state-level prior from the Care Map (legal posture for
            adult-affirming care, ID changes, and shield laws). Update with the
            corporation&apos;s HRC Corporate Equality Index where available. Apply
            time-decayed penalties for first-party incident reports filed through
            Seagull, news, and litigation. The credible interval widens when data
            is sparse — &quot;Limited data&quot; is a respectable answer, not a
            failure mode.
          </p>
          <p className="mt-3">
            The score is a decision aid, not a verdict. Businesses can claim a
            profile and respond. Incident reports are moderated before they
            count toward the score in production.
          </p>
        </div>
      </div>
    </section>
  );
}
