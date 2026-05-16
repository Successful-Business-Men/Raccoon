import type {
  ChecklistItem,
  ContinuityPlan,
  Phase,
} from "@/types";

export const PHASE_ORDER: Phase[] = [
  "now",
  "this_week",
  "this_month",
  "before_move",
];

export const PHASE_LABELS: Record<Phase, string> = {
  now: "Now",
  this_week: "This week",
  this_month: "This month",
  before_move: "Before you go",
};

export const PHASE_HINTS: Record<Phase, string> = {
  now: "Do today — life-safety and access-critical.",
  this_week: "Do within 7 days.",
  this_month: "Do within 30 days.",
  before_move: "Do before the actual move.",
};

export type ChecklistSectionKey =
  | "records_transfer"
  | "insurance_continuity"
  | "medication_gap_risk"
  | "finding_new_care"
  | "legal_and_id";

export interface FlatItem extends ChecklistItem {
  section: ChecklistSectionKey;
  sectionLabel: string;
  sectionIndex: number; // index within its section, for stable keys
  key: string; // "section:index"
}

const CHECKLIST_SECTIONS: Array<{
  key: ChecklistSectionKey;
  label: string;
  getItems: (p: ContinuityPlan) => ChecklistItem[];
}> = [
  {
    key: "records_transfer",
    label: "Records transfer",
    getItems: (p) => p.records_transfer.items,
  },
  {
    key: "insurance_continuity",
    label: "Insurance continuity",
    getItems: (p) => p.insurance_continuity.items,
  },
  {
    key: "medication_gap_risk",
    label: "Medication gap risk",
    getItems: (p) => p.medication_gap_risk.items,
  },
  {
    key: "finding_new_care",
    label: "Finding new care",
    getItems: (p) => p.finding_new_care.items,
  },
  {
    key: "legal_and_id",
    label: "Legal and ID",
    getItems: (p) => p.legal_and_id.items,
  },
];

export function flattenPlan(plan: ContinuityPlan): FlatItem[] {
  const out: FlatItem[] = [];
  for (const section of CHECKLIST_SECTIONS) {
    const items = section.getItems(plan);
    items.forEach((item, i) => {
      out.push({
        ...item,
        section: section.key,
        sectionLabel: section.label,
        sectionIndex: i,
        key: `${section.key}:${i}`,
      });
    });
  }
  return out;
}

export function phaseOf(item: ChecklistItem): Phase {
  return item.phase ?? "now";
}

const RISK_WEIGHT: Record<ChecklistSectionKey, number> = {
  medication_gap_risk: 0,
  legal_and_id: 1,
  insurance_continuity: 2,
  records_transfer: 3,
  finding_new_care: 4,
};

export function topNowItems(plan: ContinuityPlan, n = 3): FlatItem[] {
  return flattenPlan(plan)
    .filter((i) => phaseOf(i) === "now")
    .sort((a, b) => RISK_WEIGHT[a.section] - RISK_WEIGHT[b.section])
    .slice(0, n);
}

export function itemsByPhase(plan: ContinuityPlan): Record<Phase, FlatItem[]> {
  const buckets: Record<Phase, FlatItem[]> = {
    now: [],
    this_week: [],
    this_month: [],
    before_move: [],
  };
  for (const item of flattenPlan(plan)) {
    buckets[phaseOf(item)].push(item);
  }
  return buckets;
}
