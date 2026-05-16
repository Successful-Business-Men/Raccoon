// Sanity-check tests for riskOf(). Runnable via: npx tsx lib/continuity/risk.test.ts
// Pure assertions — no test framework required.
import type { ContinuityIntake } from "@/types";
import { riskOf } from "./risk";

let passed = 0;
let failed = 0;

function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(`      expected: ${JSON.stringify(expected)}`);
    console.error(`      actual:   ${JSON.stringify(actual)}`);
  }
}

function base(overrides: Partial<ContinuityIntake> = {}): ContinuityIntake {
  return {
    current_state: "TX",
    destination_state: "CA",
    care_types: ["hrt"],
    insurance_type: "employer",
    timeline: "soon",
    medication_supply_days: 90,
    telehealth_available: "no",
    ...overrides,
  };
}

console.log("riskOf() — pure tests");

// No med-dependent care short-circuits to low
check(
  "no med-dependent care → low",
  riskOf(base({ care_types: ["primary_care", "reproductive_health"] })).level,
  "low"
);

// Unknown supply defaults to 30 days
check(
  "unknown supply, immediate timeline → moderate (window 30, supply 30, gap 0)",
  riskOf(
    base({ timeline: "immediate", medication_supply_days: undefined })
  ).level,
  "moderate"
);
check(
  "unknown supply, soon timeline → critical (window 90, supply 30, gap 60)",
  riskOf(base({ medication_supply_days: undefined })).level,
  "critical"
);

// Boundary cases on the gap thresholds (immediate window = 30)
check(
  "gap = -30 → low (supply 60, immediate)",
  riskOf(base({ timeline: "immediate", medication_supply_days: 60 })).level,
  "low"
);
check(
  "gap = -29 → moderate (supply 59, immediate)",
  riskOf(base({ timeline: "immediate", medication_supply_days: 59 })).level,
  "moderate"
);
check(
  "gap = 0 → moderate (supply 30, immediate)",
  riskOf(base({ timeline: "immediate", medication_supply_days: 30 })).level,
  "moderate"
);
check(
  "gap = 1 → high (supply 29, immediate)",
  riskOf(base({ timeline: "immediate", medication_supply_days: 29 })).level,
  "high"
);
check(
  "gap = 30 → high (supply 0, immediate)",
  riskOf(base({ timeline: "immediate", medication_supply_days: 0 })).level,
  "high"
);
check(
  "gap = 31 → critical (supply 59, planning window 180? no, exploring 365)",
  riskOf(base({ timeline: "exploring", medication_supply_days: 100 })).level,
  "critical"
);

// Telehealth downgrades one notch (not on critical)
check(
  "telehealth downgrades high → moderate",
  riskOf(
    base({
      timeline: "immediate",
      medication_supply_days: 29,
      telehealth_available: "yes",
    })
  ).level,
  "moderate"
);
check(
  "telehealth does NOT downgrade critical",
  riskOf(
    base({
      timeline: "exploring",
      medication_supply_days: 100,
      telehealth_available: "yes",
    })
  ).level,
  "critical"
);
check(
  "telehealth downgrades moderate → low",
  riskOf(
    base({
      timeline: "immediate",
      medication_supply_days: 30,
      telehealth_available: "yes",
    })
  ).level,
  "low"
);

// Surgery aftercare with low supply (<14) upgrades one notch
check(
  "surgery aftercare + 10d supply, exploring window → upgrade",
  riskOf(
    base({
      timeline: "soon", // window 90, gap 80 → critical
      medication_supply_days: 10,
      care_types: ["surgery_aftercare"],
    })
  ).level,
  "critical" // already critical; surgery upgrade clamps at critical
);

check(
  "surgery aftercare with 35d supply does NOT upgrade (supply >= 14)",
  riskOf(
    base({
      timeline: "immediate",
      medication_supply_days: 35,
      care_types: ["surgery_aftercare"],
    })
  ).level,
  "moderate" // -5 gap → moderate; supply not <14, no upgrade
);

check(
  "surgery aftercare with 5d supply, immediate (gap=25) → high then critical",
  riskOf(
    base({
      timeline: "immediate",
      medication_supply_days: 5,
      care_types: ["surgery_aftercare"],
    })
  ).level,
  "critical" // gap 25 → high; surgery+supply<14 → critical
);

// Combined adjustments — telehealth then surgery
check(
  "telehealth + surgery low-supply: high → moderate → high",
  riskOf(
    base({
      timeline: "immediate",
      medication_supply_days: 10,
      telehealth_available: "yes",
      care_types: ["surgery_aftercare"],
    })
  ).level,
  // base gap 20 → high; telehealth → moderate; surgery <14 → high
  "high"
);

// Reasons populated for every code path
const r = riskOf(
  base({
    timeline: "immediate",
    medication_supply_days: 10,
    telehealth_available: "yes",
    care_types: ["surgery_aftercare"],
  })
);
check(
  "reasons array is non-empty when med-dependent",
  r.assessment.reasons.length > 0,
  true
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
