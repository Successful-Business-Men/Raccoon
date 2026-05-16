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

const STATUSES: CareStatus[] = [
  "PROTECTED",
  "LEGAL",
  "RESTRICTED",
  "BANNED",
  "IN_LITIGATION",
];

const PLACEHOLDER_DATE = "2025-10-15";
const PLACEHOLDER_NOTE = "Placeholder data — replace with verified source.";

function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function statusFor(code: string, procedure: ProcedureKey): CareStatus {
  return STATUSES[hash(code + ":" + procedure) % STATUSES.length];
}

function placeholderProcedures(
  code: string
): Record<ProcedureKey, ProcedureStatus> {
  const out = {} as Record<ProcedureKey, ProcedureStatus>;
  for (const p of PROCEDURE_KEYS) {
    out[p] = {
      status: statusFor(code, p),
      last_updated: PLACEHOLDER_DATE,
      sources: ["https://example.org/placeholder-source"],
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
