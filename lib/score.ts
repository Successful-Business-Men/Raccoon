import type {
  CareStatus,
  PlaceRecord,
  SafetyScore,
  SafetyTier,
  ScoreComponent,
  SeedIncident,
} from "@/types";
import { CARE_STATUS_BY_CODE } from "@/data/care_status";
import placesData from "@/data/places.json";

const PLACES: PlaceRecord[] = (placesData as any).places;

export function getPlace(place_id: string): PlaceRecord | undefined {
  return PLACES.find((p) => p.place_id === place_id);
}

export function listPlaces(): PlaceRecord[] {
  return PLACES;
}

// ─── Bayesian-ish scoring ────────────────────────────────────────────────
// Returns a 0–100 score with a credible interval, a tier, and the
// specific components that moved the score.

const STATE_BASELINE: Record<CareStatus, number> = {
  PROTECTED: 75,
  LEGAL: 65,
  IN_LITIGATION: 55,
  RESTRICTED: 45,
  BANNED: 30,
};

// Procedures we average for the state baseline. Public-accommodation
// safety correlates more with adult-affirming + shield law posture than
// pediatric-specific procedures, so we weight those higher.
const STATE_PROCEDURE_WEIGHTS: Record<string, number> = {
  hrt_adult: 0.25,
  surgery_adult: 0.2,
  id_marker_change: 0.2,
  shield_law: 0.2,
  hrt_minor: 0.05,
  puberty_blockers: 0.05,
  surgery_minor: 0.05,
};

const SEVERITY_WEIGHT: Record<SeedIncident["severity"], number> = {
  low: 4,
  medium: 10,
  high: 22,
};

const SOURCE_WEIGHT: Record<SeedIncident["source"], number> = {
  litigation: 1.0, // verified through courts
  news: 0.8, // reported but not adjudicated
  user_report: 0.7, // first-party but unverified
};

const INCIDENT_HALF_LIFE_MONTHS = 18;
const NOW = () => new Date();

function monthsBetween(iso: string, now: Date): number {
  const then = new Date(iso);
  return (
    (now.getFullYear() - then.getFullYear()) * 12 +
    (now.getMonth() - then.getMonth())
  );
}

function timeDecay(iso: string, now: Date): number {
  const m = Math.max(0, monthsBetween(iso, now));
  // Linear decay to 0 at 2× half-life, clamped.
  return Math.max(0, 1 - m / (INCIDENT_HALF_LIFE_MONTHS * 2));
}

function stateBaseline(state_code: string): {
  value: number;
  label: string;
} {
  const s = CARE_STATUS_BY_CODE[state_code];
  if (!s) return { value: 55, label: "State baseline (unknown state)" };
  let sum = 0;
  for (const [proc, weight] of Object.entries(STATE_PROCEDURE_WEIGHTS)) {
    const status = s.procedures[proc as keyof typeof s.procedures]?.status;
    if (!status) continue;
    sum += STATE_BASELINE[status] * weight;
  }
  return {
    value: Math.round(sum),
    label: `${s.state_name} legal landscape`,
  };
}

function ceiAdjustment(cei?: number): number {
  if (cei === undefined) return 0;
  // Pivot at 80. Strong policies > 80 push score up; missing/anti-LGBTQ
  // policies (CEI 0) pull down. Capped so chain CEI never *dominates*
  // the location-specific signal.
  if (cei >= 80) return 12;
  if (cei >= 60) return 4;
  if (cei >= 40) return -4;
  return -12; // 0–39: refused to participate or scored very low
}

function tierFor(score: number, confidence: number): SafetyTier {
  if (confidence < 30) return "yellow";
  if (score >= 65) return "green";
  if (score >= 45) return "yellow";
  return "red";
}

export interface ScoreInputs {
  place: PlaceRecord;
  /** Additional incidents (e.g. ones filed via /document during the session). */
  extra_incidents?: SeedIncident[];
}

export function scorePlace({ place, extra_incidents = [] }: ScoreInputs): SafetyScore {
  const now = NOW();
  const components: ScoreComponent[] = [];

  // ── State baseline ────────────────────────────────────────────────
  const base = stateBaseline(place.state_code);
  let score = base.value;
  components.push({
    label: base.label,
    contribution: base.value - 50, // expressed relative to neutral midpoint
    source: "Care Map — Seagull",
    observed_at: undefined,
  });

  // ── Chain CEI ─────────────────────────────────────────────────────
  if (place.cei_score !== undefined) {
    const adj = ceiAdjustment(place.cei_score);
    score += adj;
    components.push({
      label: `${place.chain ?? place.name} — HRC CEI ${place.cei_score}/100${
        place.cei_year ? ` (${place.cei_year})` : ""
      }`,
      contribution: adj,
      source: "Human Rights Campaign Corporate Equality Index",
      source_url: place.cei_url,
    });
  }

  // ── Incidents (seed + extra) ──────────────────────────────────────
  const all_incidents = [...(place.seed_incidents ?? []), ...extra_incidents];
  let incident_penalty = 0;
  for (const inc of all_incidents) {
    const decay = timeDecay(inc.date, now);
    const raw = SEVERITY_WEIGHT[inc.severity] * SOURCE_WEIGHT[inc.source];
    const weighted = raw * decay;
    incident_penalty += weighted;
    components.push({
      label: `${inc.severity.toUpperCase()} ${inc.type.replace("_", " ")} — ${inc.summary.slice(0, 80)}${
        inc.summary.length > 80 ? "…" : ""
      }`,
      contribution: -weighted,
      source: `${inc.source.replace("_", " ")} · ${inc.date}`,
      source_url: inc.source_url,
      observed_at: inc.date,
    });
  }
  // Cap incident impact so any single report can never alone flip a
  // green place to red without corroboration.
  incident_penalty = Math.min(incident_penalty, 35);
  score -= incident_penalty;

  // ── Clamp ─────────────────────────────────────────────────────────
  score = Math.round(Math.max(0, Math.min(100, score)));

  // ── Confidence ────────────────────────────────────────────────────
  let confidence = 25; // state data alone
  if (place.cei_score !== undefined) confidence += 25;
  confidence += Math.min(30, all_incidents.length * 8);
  if (place.chain) confidence += 5;
  confidence = Math.min(100, confidence);

  // Credible interval: tighter when confidence is high.
  const margin = Math.round((100 - confidence) / 2.5);
  const confidence_low = Math.max(0, score - margin);
  const confidence_high = Math.min(100, score + margin);

  return {
    point_estimate: score,
    confidence,
    confidence_low,
    confidence_high,
    tier: tierFor(score, confidence),
    components: components.sort(
      (a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)
    ),
    incident_count: all_incidents.length,
  };
}

export const TIER_LABEL: Record<SafetyTier, string> = {
  green: "Affirming evidence",
  yellow: "Limited data",
  red: "Active concerns",
};

export const TIER_DESCRIPTION: Record<SafetyTier, string> = {
  green: "Signals suggest a low-risk environment. Verify before acting.",
  yellow: "Not enough first-party data to be confident. Treat the score as provisional.",
  red: "Multiple signals indicate elevated risk. Consider alternatives or proceed with care.",
};
