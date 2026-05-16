import type {
  CareStatus,
  ProcedureKey,
  ProcedureStatus,
  StateCareData,
} from "@/types";

// DECISION: this is *placeholder* seed data so the map renders end-to-end.
// Robert will replace with real, sourced data Saturday afternoon.
// Statuses are assigned by a deterministic hash so the visual variety
// exercises the legend and color system, but do NOT treat these values
// as authoritative.

const STATES: Array<[string, string]> = [
  ["AL", "Alabama"],
  ["AK", "Alaska"],
  ["AZ", "Arizona"],
  ["AR", "Arkansas"],
  ["CA", "California"],
  ["CO", "Colorado"],
  ["CT", "Connecticut"],
  ["DE", "Delaware"],
  ["FL", "Florida"],
  ["GA", "Georgia"],
  ["HI", "Hawaii"],
  ["ID", "Idaho"],
  ["IL", "Illinois"],
  ["IN", "Indiana"],
  ["IA", "Iowa"],
  ["KS", "Kansas"],
  ["KY", "Kentucky"],
  ["LA", "Louisiana"],
  ["ME", "Maine"],
  ["MD", "Maryland"],
  ["MA", "Massachusetts"],
  ["MI", "Michigan"],
  ["MN", "Minnesota"],
  ["MS", "Mississippi"],
  ["MO", "Missouri"],
  ["MT", "Montana"],
  ["NE", "Nebraska"],
  ["NV", "Nevada"],
  ["NH", "New Hampshire"],
  ["NJ", "New Jersey"],
  ["NM", "New Mexico"],
  ["NY", "New York"],
  ["NC", "North Carolina"],
  ["ND", "North Dakota"],
  ["OH", "Ohio"],
  ["OK", "Oklahoma"],
  ["OR", "Oregon"],
  ["PA", "Pennsylvania"],
  ["RI", "Rhode Island"],
  ["SC", "South Carolina"],
  ["SD", "South Dakota"],
  ["TN", "Tennessee"],
  ["TX", "Texas"],
  ["UT", "Utah"],
  ["VT", "Vermont"],
  ["VA", "Virginia"],
  ["WA", "Washington"],
  ["WV", "West Virginia"],
  ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
  ["DC", "District of Columbia"],
];

export const PROCEDURE_KEYS: ProcedureKey[] = [
  "hrt_adult",
  "hrt_minor",
  "puberty_blockers",
  "surgery_adult",
  "surgery_minor",
  "id_marker_change",
  "shield_law",
];

export const PROCEDURE_LABELS: Record<ProcedureKey, string> = {
  hrt_adult: "HRT (adults)",
  hrt_minor: "HRT (minors)",
  puberty_blockers: "Puberty blockers",
  surgery_adult: "Surgery (adults)",
  surgery_minor: "Surgery (minors)",
  id_marker_change: "ID document changes",
  shield_law: "Shield laws",
};

const PLACEHOLDER_DATE = "2025-10-15";
const PLACEHOLDER_NOTE =
  "Best-effort snapshot based on widely-reported 2024–2025 state policy. Verify the current statute and any active litigation before acting.";

// DECISION: bucketing each state into one of four policy profiles based on
// publicly-reported patterns (HRC, ACLU, MAP, KFF) circa 2024–2025. This is
// *not* an adjudication of current law in any state — laws move week to
// week — but it's calibrated enough that the map doesn't show California
// as banned or Tennessee as protected. Replace per-state, per-procedure
// once verified sourced data is paste-ready.
type Bucket = "AFFIRMING" | "NEUTRAL" | "RESTRICTIVE" | "HOSTILE";

const STATE_BUCKET: Record<string, Bucket> = {
  // AFFIRMING — shield laws and/or no active restrictions on adult care
  CA: "AFFIRMING", NY: "AFFIRMING", MA: "AFFIRMING", CT: "AFFIRMING",
  NJ: "AFFIRMING", MD: "AFFIRMING", WA: "AFFIRMING", OR: "AFFIRMING",
  IL: "AFFIRMING", CO: "AFFIRMING", NM: "AFFIRMING", MN: "AFFIRMING",
  VT: "AFFIRMING", RI: "AFFIRMING", DE: "AFFIRMING", HI: "AFFIRMING",
  NV: "AFFIRMING", DC: "AFFIRMING", ME: "AFFIRMING", NH: "AFFIRMING",
  // NEUTRAL — no major affirmative or restrictive action
  PA: "NEUTRAL", MI: "NEUTRAL", VA: "NEUTRAL", AZ: "NEUTRAL",
  WI: "NEUTRAL", AK: "NEUTRAL",
  // RESTRICTIVE — limits, especially for minors; status often contested
  KS: "RESTRICTIVE", IN: "RESTRICTIVE", IA: "RESTRICTIVE", MT: "RESTRICTIVE",
  ND: "RESTRICTIVE", UT: "RESTRICTIVE", KY: "RESTRICTIVE", WV: "RESTRICTIVE",
  OH: "RESTRICTIVE", NE: "RESTRICTIVE", NC: "RESTRICTIVE", SD: "RESTRICTIVE",
  // HOSTILE — enacted minor-care bans and broader restrictions
  TX: "HOSTILE", FL: "HOSTILE", AL: "HOSTILE", AR: "HOSTILE",
  LA: "HOSTILE", OK: "HOSTILE", SC: "HOSTILE", TN: "HOSTILE",
  MS: "HOSTILE", GA: "HOSTILE", ID: "HOSTILE", WY: "HOSTILE",
  MO: "HOSTILE",
};

const BUCKET_PROFILE: Record<Bucket, Record<ProcedureKey, CareStatus>> = {
  AFFIRMING: {
    hrt_adult: "PROTECTED",
    hrt_minor: "PROTECTED",
    puberty_blockers: "PROTECTED",
    surgery_adult: "PROTECTED",
    surgery_minor: "LEGAL",
    id_marker_change: "PROTECTED",
    shield_law: "PROTECTED",
  },
  NEUTRAL: {
    hrt_adult: "LEGAL",
    hrt_minor: "LEGAL",
    puberty_blockers: "LEGAL",
    surgery_adult: "LEGAL",
    surgery_minor: "RESTRICTED",
    id_marker_change: "LEGAL",
    shield_law: "LEGAL",
  },
  RESTRICTIVE: {
    hrt_adult: "LEGAL",
    hrt_minor: "RESTRICTED",
    puberty_blockers: "RESTRICTED",
    surgery_adult: "LEGAL",
    surgery_minor: "BANNED",
    id_marker_change: "RESTRICTED",
    shield_law: "IN_LITIGATION",
  },
  HOSTILE: {
    hrt_adult: "RESTRICTED",
    hrt_minor: "BANNED",
    puberty_blockers: "BANNED",
    surgery_adult: "RESTRICTED",
    surgery_minor: "BANNED",
    id_marker_change: "RESTRICTED",
    shield_law: "BANNED",
  },
};

function placeholderProcedures(
  code: string
): Record<ProcedureKey, ProcedureStatus> {
  const bucket = STATE_BUCKET[code] ?? "NEUTRAL";
  const profile = BUCKET_PROFILE[bucket];
  const out = {} as Record<ProcedureKey, ProcedureStatus>;
  for (const p of PROCEDURE_KEYS) {
    out[p] = {
      status: profile[p],
      last_updated: PLACEHOLDER_DATE,
      sources: [
        "https://www.lgbtmap.org/equality-maps",
        "https://www.lambdalegal.org",
      ],
      notes: PLACEHOLDER_NOTE,
    };
  }
  return out;
}

export const CARE_STATUS: StateCareData[] = STATES.map(([code, name]) => ({
  state_code: code,
  state_name: name,
  procedures: placeholderProcedures(code),
  related_orgs: [],
}));

export const CARE_STATUS_BY_CODE: Record<string, StateCareData> = Object.fromEntries(
  CARE_STATUS.map((s) => [s.state_code, s])
);

export function getLastDataUpdate(): string {
  let latest = "0000-00-00";
  for (const s of CARE_STATUS) {
    for (const p of PROCEDURE_KEYS) {
      const d = s.procedures[p].last_updated;
      if (d > latest) latest = d;
    }
  }
  return latest;
}

export const STATE_OPTIONS: Array<{ code: string; name: string }> = STATES.map(
  ([code, name]) => ({ code, name })
);
