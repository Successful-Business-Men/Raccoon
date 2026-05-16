// Shared types for Seagull data shapes.

// ─── Care Map ─────────────────────────────────────────────────────────────
export type CareStatus =
  | "PROTECTED"
  | "LEGAL"
  | "RESTRICTED"
  | "BANNED"
  | "IN_LITIGATION";

export type ProcedureKey =
  | "hrt_adult"
  | "hrt_minor"
  | "puberty_blockers"
  | "surgery_adult"
  | "surgery_minor"
  | "id_marker_change"
  | "shield_law";

export interface ProcedureStatus {
  status: CareStatus;
  last_updated: string; // ISO date string (YYYY-MM-DD)
  sources: string[];
  notes?: string;
}

export interface StateCareData {
  state_code: string;
  state_name: string;
  procedures: Record<ProcedureKey, ProcedureStatus>;
  related_orgs?: Array<{ name: string; url: string }>; // TODO: populate later
}

// ─── Documentation Agent ──────────────────────────────────────────────────
export type IncidentType =
  | "housing"
  | "employment"
  | "healthcare"
  | "public_accommodation"
  | "other";

export interface Party {
  name: string;
  role: string;
}

export interface Witness {
  name: string;
  contact?: string;
  what_they_saw: string;
}

export interface EvidenceItem {
  type: string;
  description: string;
  location: string;
}

export interface IncidentPacket {
  incident_type?: IncidentType;
  incident_date?: string;
  incident_location_state?: string;
  incident_location_city?: string;
  parties_involved?: Party[];
  what_happened?: string;
  witnesses?: Witness[];
  evidence?: EvidenceItem[];
  applicable_protections?: ProtectionRecord[];
  summary?: string;
}

// ─── Protections (route 1 data shape) ─────────────────────────────────────
export interface ProtectionRecord {
  jurisdiction: "federal" | "state";
  state_code?: string;
  incident_types: IncidentType[];
  title: string;
  citation: string;
  url: string;
  summary: string;
  effective_date?: string;
}

export interface ProtectionsFile {
  federal: ProtectionRecord[];
  states: Record<string, ProtectionRecord[]>; // keyed by state code
}

// ─── Continuity Planner ───────────────────────────────────────────────────
export type CareType =
  | "hrt"
  | "surgery_aftercare"
  | "mental_health"
  | "primary_care"
  | "reproductive_health"
  | "other";

export type InsuranceType =
  | "employer"
  | "marketplace"
  | "medicaid"
  | "medicare"
  | "uninsured"
  | "other";

export type Timeline = "immediate" | "soon" | "planning" | "exploring";

export type TelehealthAvailability = "yes" | "no" | "unsure" | "na";

export interface ContinuityIntake {
  current_state: string;
  destination_state?: string | "exploring";
  care_types: CareType[];
  insurance_type: InsuranceType;
  timeline: Timeline;
  medication_supply_days?: number;
  telehealth_available: TelehealthAvailability;
}

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export interface ChecklistItem {
  title: string;
  detail: string;
  done?: boolean;
}

export interface ContinuityPlan {
  records_transfer: {
    items: ChecklistItem[];
    template_letter: string;
  };
  insurance_continuity: {
    items: ChecklistItem[];
    state_notes: string;
  };
  medication_gap_risk: {
    level: RiskLevel;
    rationale: string;
    items: ChecklistItem[];
  };
  finding_new_care: {
    questions_to_ask: string[];
    red_flags: string[];
    items: ChecklistItem[];
  };
  legal_and_id: {
    items: ChecklistItem[];
  };
  community_resources: {
    items: Array<{ name: string; url: string; note?: string }>;
  };
}

// ─── Insurance data shape (route 3) ───────────────────────────────────────
export interface InsuranceFile {
  states: Record<
    string,
    {
      employer?: string;
      marketplace?: string;
      medicaid?: string;
      medicare?: string;
      uninsured?: string;
      notes?: string;
    }
  >;
}
