"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  AlertTriangle,
  FileText,
  ExternalLink,
  ArrowUpDown,
  ArrowRight,
} from "lucide-react";
import { Container } from "@/components/Container";
import { Pill } from "@/components/Pill";
import { ScoreRing } from "@/components/ScoreRing";
import { cn } from "@/lib/cn";
import type {
  PlaceRecord,
  SafetyScore,
  SafetyTier,
  SeedIncident,
} from "@/types";
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

const TIER_FILTERS: Array<{ id: "all" | SafetyTier; label: string }> = [
  { id: "all", label: "All tiers" },
  { id: "green", label: "Affirming" },
  { id: "yellow", label: "Limited data" },
  { id: "red", label: "Concerns" },
];

type SortKey = "score_asc" | "score_desc" | "name" | "incidents";
const SORTS: Array<{ id: SortKey; label: string }> = [
  { id: "score_asc", label: "Lowest score first" },
  { id: "score_desc", label: "Highest score first" },
  { id: "incidents", label: "Most reports first" },
  { id: "name", label: "Name (A–Z)" },
];

export function PlacesClient({ places }: { places: PlaceRecord[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [tier, setTier] = useState<"all" | SafetyTier>("all");
  const [sort, setSort] = useState<SortKey>("score_asc");
  const [userIncidents, setUserIncidents] = useState<Record<string, SeedIncident[]>>({});

  useEffect(() => {
    setUserIncidents(getAllUserIncidents());
    function onFocus() {
      setUserIncidents(getAllUserIncidents());
    }
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onFocus);
    };
  }, []);

  const scored = useMemo(() => {
    return places.map((p) => ({
      place: p,
      score: scorePlace({ place: p, extra_incidents: userIncidents[p.place_id] || [] }),
    }));
  }, [places, userIncidents]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = scored.filter(({ place, score }) => {
      if (category !== "All" && place.category !== category) return false;
      if (tier !== "all" && score.tier !== tier) return false;
      if (!q) return true;
      return (
        place.name.toLowerCase().includes(q) ||
        place.city.toLowerCase().includes(q) ||
        place.state_code.toLowerCase().includes(q) ||
        (place.chain || "").toLowerCase().includes(q)
      );
    });
    list.sort((a, b) => {
      switch (sort) {
        case "score_asc":
          return a.score.point_estimate - b.score.point_estimate;
        case "score_desc":
          return b.score.point_estimate - a.score.point_estimate;
        case "incidents":
          return b.score.incident_count - a.score.incident_count;
        case "name":
          return a.place.name.localeCompare(b.place.name);
      }
    });
    return list;
  }, [scored, query, category, tier, sort]);

  const tierCounts = useMemo(() => {
    const counts: Record<SafetyTier, number> = { green: 0, yellow: 0, red: 0 };
    for (const { score } of scored) counts[score.tier]++;
    return counts;
  }, [scored]);

  return (
    <Container className="py-12">
      <header className="mb-8 max-w-prose">
        <h1 className="text-section">Safety Score</h1>
        <p className="mt-3 text-ink-secondary leading-relaxed">
          A decision aid for physical businesses — combining state legal
          posture, corporate non-discrimination policy, and first-party incident
          reports filed through Seagull. Each score shows its receipts.
        </p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-meta text-ink-secondary">
          <TierTally tier="green" label="Affirming" count={tierCounts.green} />
          <TierTally tier="yellow" label="Limited data" count={tierCounts.yellow} />
          <TierTally tier="red" label="Active concerns" count={tierCounts.red} />
        </div>
      </header>

      {/* Search + sort */}
      <div className="glass rounded-card p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-secondary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, chain, city, or state"
              className="w-full pl-11 pr-4 py-3 rounded-btn border border-divider bg-surface focus:outline-none focus:ring-2 focus:ring-accent/30 text-[15px]"
            />
          </div>
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-secondary pointer-events-none" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="pl-10 pr-8 py-3 rounded-btn border border-divider bg-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-accent/30 appearance-none"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-meta text-ink-secondary mr-1">Tier</span>
          {TIER_FILTERS.map((t) => (
            <Pill key={t.id} selected={tier === t.id} onClick={() => setTier(t.id)}>
              {t.label}
            </Pill>
          ))}
          <span className="mx-2 h-4 w-px bg-divider" aria-hidden />
          <span className="text-meta text-ink-secondary mr-1">Category</span>
          {CATEGORIES.map((c) => (
            <Pill key={c} selected={category === c} onClick={() => setCategory(c)}>
              {c}
            </Pill>
          ))}
        </div>

        <div className="mt-4 text-meta text-ink-secondary">
          Showing {filtered.length} of {scored.length} places
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map(({ place, score }) => (
          <PlaceCard key={place.place_id} place={place} score={score} />
        ))}
        {filtered.length === 0 && (
          <div className="md:col-span-2 rounded-card bg-surface-inset p-8 text-center text-ink-secondary">
            No places match. Try a different filter.
          </div>
        )}
      </div>

      <Methodology />
    </Container>
  );
}

function TierTally({
  tier,
  label,
  count,
}: {
  tier: SafetyTier;
  label: string;
  count: number;
}) {
  const dot = tier === "green" ? "bg-status-protected" : tier === "yellow" ? "bg-status-restricted" : "bg-status-banned";
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("h-2 w-2 rounded-full", dot)} />
      <span className="text-ink-primary font-bold">{count}</span> {label}
    </span>
  );
}

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

function PlaceCard({ place, score }: { place: PlaceRecord; score: SafetyScore }) {
  const [open, setOpen] = useState(false);
  const tierAccent: Record<SafetyTier, string> = {
    green: "before:bg-status-protected",
    yellow: "before:bg-status-restricted",
    red: "before:bg-status-banned",
  };

  return (
    <div
      className={cn(
        "relative glass rounded-card overflow-hidden hover:shadow-cardHover transition-shadow",
        "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1",
        tierAccent[score.tier]
      )}
    >
      <Link
        href={`/places/${place.place_id}`}
        className="block p-6 hover:bg-surface-inset/40 transition-colors"
      >
        <div className="flex items-center justify-between gap-5">
          <div className="min-w-0 flex-1">
            <div className="text-meta uppercase tracking-[0.12em] text-ink-secondary">
              {place.category} · {place.city}, {place.state_code}
            </div>
            <h3 className="mt-1.5 text-[20px] font-bold tracking-tight truncate">
              {place.name}
            </h3>
            <div className="mt-1 text-meta text-ink-secondary truncate">
              {place.address}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-meta">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-chip bg-surface-inset px-3 py-1 font-medium",
                  TIER_TEXT_COLOR[score.tier]
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", TIER_DOT[score.tier])} />
                {TIER_LABEL[score.tier]}
              </span>
              <span className="text-ink-secondary tabular-nums">
                {score.incident_count}{" "}
                {score.incident_count === 1 ? "report" : "reports"}
              </span>
            </div>
          </div>
          <ScoreRing score={score} size={128} className="shrink-0" />
        </div>

        <p className="mt-4 text-meta text-ink-secondary leading-relaxed">
          {TIER_DESCRIPTION[score.tier]}
        </p>
      </Link>

      <div className="border-t divider-soft px-6 py-3 flex flex-wrap gap-x-5 gap-y-2 items-center text-meta">
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 text-ink-primary hover:underline underline-offset-4"
        >
          Why this score?
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
          />
        </button>
        <Link
          href={`/document?place_id=${encodeURIComponent(place.place_id)}`}
          className="inline-flex items-center gap-1.5 text-ink-primary hover:underline underline-offset-4"
        >
          <FileText className="h-3.5 w-3.5" />
          Report an experience
        </Link>
        <Link
          href={`/places/${place.place_id}`}
          className="ml-auto inline-flex items-center gap-1 text-ink-primary hover:underline underline-offset-4"
        >
          Details
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {open && (
        <div className="border-t divider-soft bg-surface-inset px-6 py-5">
          <div className="text-meta uppercase tracking-[0.12em] text-ink-secondary mb-3">
            Signals moving this score
          </div>
          <ComponentList score={score} />
        </div>
      )}
    </div>
  );
}

export function ComponentList({ score }: { score: SafetyScore }) {
  return (
    <ul className="space-y-3">
      {score.components.map((c, i) => (
        <li key={i} className="flex items-start gap-3">
          <span
            className={cn(
              "mt-0.5 inline-block min-w-[44px] text-right text-meta font-bold tabular-nums",
              c.contribution > 0
                ? "text-status-protected"
                : c.contribution < 0
                  ? "text-status-banned"
                  : "text-ink-secondary"
            )}
          >
            {c.contribution > 0 ? "+" : ""}
            {Math.round(c.contribution)}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] text-ink-primary leading-snug">{c.label}</div>
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
