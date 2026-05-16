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
  | "violence"
  | "education"
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

// ─── Safety Score (route 4) ───────────────────────────────────────────────
export type PlaceCategory =
  | "Restaurant"
  | "Retail"
  | "Healthcare"
  | "Pharmacy"
  | "Bar/Nightlife"
  | "Hotel/Lodging"
  | "Service"
  | "Other";

export type IncidentSeverity = "low" | "medium" | "high";

export interface SeedIncident {
  date: string; // ISO
  severity: IncidentSeverity;
  type: IncidentType;
  source: "user_report" | "news" | "litigation";
  source_url?: string;
  summary: string; // brief, neutral, factual
}

export interface PlaceRecord {
  place_id: string;
  name: string;
  category: PlaceCategory;
  address: string;
  city: string;
  state_code: string;
  lat?: number;
  lng?: number;
  chain?: string;
  cei_score?: number; // 0–100 from HRC CEI
  cei_year?: number;
  cei_url?: string;
  seed_incidents?: SeedIncident[];
}

export type SafetyTier = "green" | "yellow" | "red";

export interface ScoreComponent {
  label: string;
  contribution: number; // signed, +/- effect on the score
  source: string;
  source_url?: string;
  observed_at?: string;
}

export interface SafetyScore {
  point_estimate: number; // 0–100
  confidence_low: number;
  confidence_high: number;
  confidence: number; // 0–100, how much data we have
  tier: SafetyTier;
  components: ScoreComponent[];
  incident_count: number;
}
