import type {
  ContinuityIntake,
  RiskAssessment,
  RiskLevel,
} from "@/types";

const TIMELINE_DAYS: Record<ContinuityIntake["timeline"], number> = {
  immediate: 30,
  soon: 90,
  planning: 180,
  exploring: 365,
};

const MED_DEPENDENT = new Set<ContinuityIntake["care_types"][number]>([
  "hrt",
  "surgery_aftercare",
  "mental_health",
]);

const LEVELS: RiskLevel[] = ["low", "moderate", "high", "critical"];

function shift(level: RiskLevel, delta: number): RiskLevel {
  const idx = LEVELS.indexOf(level);
  const next = Math.max(0, Math.min(LEVELS.length - 1, idx + delta));
  return LEVELS[next];
}

export interface RiskResult {
  level: RiskLevel;
  assessment: RiskAssessment;
}

export function riskOf(intake: ContinuityIntake): RiskResult {
  const medDependent = intake.care_types.some((c) => MED_DEPENDENT.has(c));
  const window = TIMELINE_DAYS[intake.timeline];

  if (!medDependent) {
    return {
      level: "low",
      assessment: {
        reasons: ["No medication-dependent care selected."],
        inputs: {
          supplyDays:
            intake.medication_supply_days == null
              ? "unknown"
              : intake.medication_supply_days,
          moveWindowDays: window,
          telehealthCounts: intake.telehealth_available === "yes",
          medDependentCare: false,
        },
      },
    };
  }

  const reasons: string[] = [];
  const supplyKnown =
    intake.medication_supply_days != null &&
    intake.medication_supply_days >= 0;
  const supply = supplyKnown ? (intake.medication_supply_days as number) : 30;
  if (!supplyKnown) reasons.push("Supply unknown — assumed 30 days.");

  const gap = window - supply;
  let level: RiskLevel;
  if (gap <= -30) {
    level = "low";
    reasons.push(
      `Supply (${supply}d) outlasts move window (${window}d) by ${-gap}d.`
    );
  } else if (gap <= 0) {
    level = "moderate";
    reasons.push(
      `Supply (${supply}d) covers move window (${window}d) with ${-gap}d to spare.`
    );
  } else if (gap <= 30) {
    level = "high";
    reasons.push(
      `Supply (${supply}d) runs out ~${gap}d before move window closes (${window}d).`
    );
  } else {
    level = "critical";
    reasons.push(
      `Supply (${supply}d) runs out ~${gap}d before move window closes (${window}d).`
    );
  }

  const telehealthHelps = intake.telehealth_available === "yes";
  if (telehealthHelps && level !== "critical") {
    const before = level;
    level = shift(level, -1);
    reasons.push(
      `Cross-state telehealth available: ${before} → ${level} (one notch).`
    );
  } else if (telehealthHelps && level === "critical") {
    reasons.push(
      "Cross-state telehealth available, but the gap is too wide to rely on it alone."
    );
  }

  if (intake.care_types.includes("surgery_aftercare") && supply < 14) {
    const before = level;
    level = shift(level, +1);
    reasons.push(
      `Surgery aftercare with <14d supply: ${before} → ${level} (post-op interruption risk).`
    );
  }

  return {
    level,
    assessment: {
      reasons,
      inputs: {
        supplyDays: supplyKnown ? supply : "unknown",
        moveWindowDays: window,
        telehealthCounts: telehealthHelps,
        medDependentCare: true,
      },
    },
  };
}
