import type {
  CareStatus,
  ProcedureKey,
  ProcedureStatus,
  StateCareData,
} from "@/types";

// Data current as of 2026-05-16. Researched against:
//   - Movement Advancement Project (MAP)  https://www.mapresearch.org/equality-maps
//   - KFF Gender-Affirming Care Policy Tracker
//   - Lambda Legal case tracker
//   - ACLU Legislative Attacks tracker
// See /prompts/care_status_research.md for the rubric and methodology.
// The law in some states changes weekly. Treat this file as a snapshot;
// the cron in /lib/scrapers will keep it fresh, but verify before acting.

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

// Source URLs — deep links to per-policy MAP maps + corroborating trackers.
const MAP_YOUTH_BANS =
  "https://www.mapresearch.org/equality-maps/healthcare/youth_medical_care_bans";
const MAP_SHIELD =
  "https://www.mapresearch.org/equality-maps/healthcare/trans_shield_laws";
const MAP_ID =
  "https://mapresearch.org/equality-map/identity-document-laws-and-policies/";
const MAP_MEDICAID =
  "https://mapresearch.org/equality-map/medicaid-coverage-of-transgender-related-health-care/";
const KFF_TRACKER =
  "https://www.kff.org/lgbtq/gender-affirming-care-policy-tracker/";
const ACLU_TRACKER = "https://www.aclu.org/legislative-attacks-on-lgbtq-rights";
const LAMBDA_CASES = "https://lambdalegal.org/cases/";
const SKRMETTI_RULING =
  "https://www.aclu.org/press-releases/aclu-lambda-legal-respond-to-supreme-court-ruling-in-u-s-v-skrmetti";
const STATELINE_WV =
  "https://stateline.org/2026/04/24/court-ruling-limiting-adult-gender-affirming-medicaid-coverage-could-have-national-impacts/";

const VERIFIED = "2026-05-16";

function r(
  status: CareStatus,
  sources: string[],
  notes?: string
): ProcedureStatus {
  return notes
    ? { status, last_updated: VERIFIED, sources, notes }
    : { status, last_updated: VERIFIED, sources };
}

export const CARE_STATUS: StateCareData[] = [
  {
    state_code: "AL",
    state_name: "Alabama",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID], "No state level restriction on HRT for adults. Medicaid has no explicit policy."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "Vulnerable Child Compassion and Protection Act (SB 184, 2022) prohibits prescribing HRT to minors; felony for providers."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "SB 184 (2022) bans puberty blockers for minors."),
      surgery_adult: r("LEGAL", [MAP_MEDICAID], "No state level restriction on adult surgery."),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "SB 184 (2022) bans gender affirming surgery for minors."),
      id_marker_change: r("BANNED", [MAP_ID], "Driver's license updates banned. Birth certificate requires proof of surgery."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law on the books and no anti shield statute."),
    },
  },
  {
    state_code: "AK",
    state_name: "Alaska",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID], "Medicaid explicitly covers gender affirming care. No state level restriction."),
      hrt_minor: r("LEGAL", [MAP_YOUTH_BANS], "No state ban on HRT for minors."),
      puberty_blockers: r("LEGAL", [MAP_YOUTH_BANS]),
      surgery_adult: r("LEGAL", [MAP_MEDICAID]),
      surgery_minor: r("LEGAL", [MAP_YOUTH_BANS]),
      id_marker_change: r("LEGAL", [MAP_ID], "Driver's license: physician letter from limited professionals. Birth certificate: administrative, no documentation."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law on the books."),
    },
  },
  {
    state_code: "AZ",
    state_name: "Arizona",
    procedures: {
      hrt_adult: r("RESTRICTED", [MAP_MEDICAID], "Care is legal but AHCCCS (Medicaid) explicitly excludes gender affirming care for all ages."),
      hrt_minor: r("LEGAL", [MAP_YOUTH_BANS], "No state ban on HRT for minors; Medicaid does not cover."),
      puberty_blockers: r("LEGAL", [MAP_YOUTH_BANS], "No state ban; Medicaid does not cover."),
      surgery_adult: r("RESTRICTED", [MAP_MEDICAID], "Medicaid excludes; care otherwise legal."),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "SB 1138 (2022) prohibits gender affirming surgery for minors. HRT and blockers are not restricted by this statute."),
      id_marker_change: r("RESTRICTED", [MAP_ID], "Driver's license policy is unclear/unwritten; birth certificate process is judicial discretion only."),
      shield_law: r("LEGAL", [MAP_SHIELD], "Executive Order 2023-15 provides shield protections, but no statutory shield law."),
    },
  },
  {
    state_code: "AR",
    state_name: "Arkansas",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID]),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER, SKRMETTI_RULING], "SAFE Act (Act 626, 2021) bans HRT for minors. Trial court injunction was reversed by 8th Circuit in August 2025 following U.S. v. Skrmetti; law is in effect."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("LEGAL", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("LEGAL", [MAP_ID], "Driver's license: physician letter (limited professionals). Birth certificate: administrative with physician documentation."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "CA",
    state_name: "California",
    procedures: {
      hrt_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD], "Insurance non discrimination required; Medicaid (Medi Cal) explicitly covers."),
      hrt_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      surgery_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("PROTECTED", [MAP_ID], "Self attestation for license and birth certificate; X marker available (Gender Recognition Act, SB 179, 2017)."),
      shield_law: r("PROTECTED", [MAP_SHIELD], "AB 1184 (2022) provides comprehensive shield protections."),
    },
  },
  {
    state_code: "CO",
    state_name: "Colorado",
    procedures: {
      hrt_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      hrt_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      surgery_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("PROTECTED", [MAP_ID], "Self attestation for license and birth certificate; X marker available."),
      shield_law: r("PROTECTED", [MAP_SHIELD], "HB 23-1071 (2023) shield law."),
    },
  },
  {
    state_code: "CT",
    state_name: "Connecticut",
    procedures: {
      hrt_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      hrt_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      surgery_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("PROTECTED", [MAP_ID], "Self attestation for license and birth certificate."),
      shield_law: r("PROTECTED", [MAP_SHIELD], "HB 5414 (2022) shield law."),
    },
  },
  {
    state_code: "DE",
    state_name: "Delaware",
    procedures: {
      hrt_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      hrt_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      surgery_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("RESTRICTED", [MAP_ID], "Driver's license has a burdensome process; birth certificate is administrative with no documentation."),
      shield_law: r("PROTECTED", [MAP_SHIELD], "SB 65 (2025) shield law."),
    },
  },
  {
    state_code: "FL",
    state_name: "Florida",
    procedures: {
      hrt_adult: r("RESTRICTED", [KFF_TRACKER, MAP_MEDICAID, ACLU_TRACKER], "SB 254 (2023) requires mandatory in person informed consent and bars nurse practitioners from prescribing; Medicaid excludes for all ages. Doe v. Ladapo pending at 11th Circuit; law in effect."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "SB 254 (2023) bans HRT for new minor patients; narrow grandfather exception."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("RESTRICTED", [KFF_TRACKER, MAP_MEDICAID], "Same SB 254 informed consent and NP restrictions; Medicaid excludes."),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("RESTRICTED", [MAP_ID], "Driver's license: 2024 DHSMV policy bars sex marker changes. Birth certificate: administrative with physician documentation."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law. Florida Board of Medicine rules are hostile to out of state care for minors."),
    },
  },
  {
    state_code: "GA",
    state_name: "Georgia",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID], "No state level adult restriction; Medicaid explicitly covers."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "SB 140 (2023) prohibits HRT and surgery for minors. Puberty blockers are specifically exempted."),
      puberty_blockers: r("LEGAL", [MAP_YOUTH_BANS], "Specifically exempted from SB 140 (2023)."),
      surgery_adult: r("LEGAL", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "SB 140 (2023)."),
      id_marker_change: r("BANNED", [MAP_ID], "Birth certificate updates banned; driver's license requires court order."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "HI",
    state_name: "Hawaii",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID], "No state level restriction. Hawaii has conflicting Medicaid policies, non discrimination law conflicts with a regulation excluding the care."),
      hrt_minor: r("LEGAL", [MAP_YOUTH_BANS]),
      puberty_blockers: r("LEGAL", [MAP_YOUTH_BANS]),
      surgery_adult: r("LEGAL", [MAP_MEDICAID]),
      surgery_minor: r("LEGAL", [MAP_YOUTH_BANS]),
      id_marker_change: r("LEGAL", [MAP_ID], "Driver's license: physician letter (wide professional range). Birth certificate: administrative, no documentation."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "ID",
    state_name: "Idaho",
    procedures: {
      hrt_adult: r("RESTRICTED", [MAP_MEDICAID], "Medicaid excludes for all ages."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "HB 71 (2023) Vulnerable Child Protection Act bans HRT, blockers, and surgery for minors; felony for providers."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("RESTRICTED", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("BANNED", [MAP_ID], "January 2026 court ruling created a de facto ban: state no longer amends birth certificates, and license updates require an amended birth certificate. X marker also banned."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "IL",
    state_name: "Illinois",
    procedures: {
      hrt_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      hrt_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      surgery_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("PROTECTED", [MAP_ID], "Self attestation for license and birth certificate."),
      shield_law: r("PROTECTED", [MAP_SHIELD], "HB 4664 (2023) shield law."),
    },
  },
  {
    state_code: "IN",
    state_name: "Indiana",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID], "No state level adult restriction; Medicaid has no explicit policy."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "SB 480 (2023) bans HRT, blockers, and surgery for minors."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("LEGAL", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("BANNED", [MAP_ID], "Driver's license: burdensome process. Birth certificate updates banned."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "IA",
    state_name: "Iowa",
    procedures: {
      hrt_adult: r("RESTRICTED", [MAP_MEDICAID], "Medicaid excludes for all ages."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "SF 538 (2023) bans HRT, blockers, and surgery for minors."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("RESTRICTED", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("RESTRICTED", [MAP_ID], "Driver's license: burdensome process. Birth certificate: administrative, no documentation."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "KS",
    state_name: "Kansas",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID], "Medicaid excludes for minors only; adult coverage unaffected."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "SB 233 (2024) bans HRT, blockers, and surgery for minors; passed over Governor's veto."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("LEGAL", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("BANNED", [MAP_ID], "AG opinion blocks driver's license updates; birth certificate updates banned."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "KY",
    state_name: "Kentucky",
    procedures: {
      hrt_adult: r("RESTRICTED", [MAP_MEDICAID], "Medicaid excludes for all ages."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "SB 150 (2023) bans HRT, blockers, and surgery for minors."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("RESTRICTED", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("BANNED", [MAP_ID], "Driver's license allows physician letter but birth certificate updates are banned."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "LA",
    state_name: "Louisiana",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID], "Medicaid has no explicit policy at state level; some MCOs cover."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "HB 648 (2024) Stop Harming Our Kids Act bans HRT, blockers, and surgery for minors."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("LEGAL", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("BANNED", [MAP_ID], "Driver's license allows physician letter; birth certificate updates are banned."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "ME",
    state_name: "Maine",
    procedures: {
      hrt_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      hrt_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      surgery_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("PROTECTED", [MAP_ID], "Self attestation for license and birth certificate."),
      shield_law: r("PROTECTED", [MAP_SHIELD], "LD 227 (2024) shield law."),
    },
  },
  {
    state_code: "MD",
    state_name: "Maryland",
    procedures: {
      hrt_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      hrt_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      surgery_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("PROTECTED", [MAP_ID], "Self attestation for license and birth certificate."),
      shield_law: r("PROTECTED", [MAP_SHIELD], "HB 808 (2024) shield law."),
    },
  },
  {
    state_code: "MA",
    state_name: "Massachusetts",
    procedures: {
      hrt_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      hrt_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      surgery_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("RESTRICTED", [MAP_ID], "Driver's license: self attestation. Birth certificate: administrative + proof of surgery required."),
      shield_law: r("PROTECTED", [MAP_SHIELD], "H 4359 (2022) shield law."),
    },
  },
  {
    state_code: "MI",
    state_name: "Michigan",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID], "No state level restriction; Medicaid explicitly covers."),
      hrt_minor: r("LEGAL", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("LEGAL", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("LEGAL", [MAP_MEDICAID]),
      surgery_minor: r("LEGAL", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("PROTECTED", [MAP_ID], "Self attestation for license and birth certificate."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law on the books."),
    },
  },
  {
    state_code: "MN",
    state_name: "Minnesota",
    procedures: {
      hrt_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      hrt_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      surgery_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("PROTECTED", [MAP_ID], "Self attestation for license and birth certificate."),
      shield_law: r("PROTECTED", [MAP_SHIELD], "HF 146 (2023) shield law."),
    },
  },
  {
    state_code: "MS",
    state_name: "Mississippi",
    procedures: {
      hrt_adult: r("RESTRICTED", [MAP_MEDICAID], "Medicaid excludes for minors only; adult coverage unaffected but care otherwise legal."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "HB 1125 (2023) Regulate Experimental Adolescent Procedures Act bans HRT, blockers, and surgery for minors."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("LEGAL", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("LEGAL", [MAP_ID], "Driver's license: physician letter. Birth certificate: administrative, no documentation."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "MO",
    state_name: "Missouri",
    procedures: {
      hrt_adult: r("RESTRICTED", [MAP_MEDICAID, ACLU_TRACKER], "Medicaid excludes for all ages. AG 2023 emergency rule imposed adult care conditions; rescinded by court but advisory pressure remains."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "SB 49 (2023) Missouri Save Adolescents from Experimentation Act bans HRT, blockers, and surgery for new minor patients. Grandfathered patients allowed."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("RESTRICTED", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("BANNED", [MAP_ID], "Driver's license updates banned; birth certificate requires court order + surgery."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "MT",
    state_name: "Montana",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID], "Medicaid explicitly covers gender affirming care."),
      hrt_minor: r("IN_LITIGATION", [MAP_YOUTH_BANS, LAMBDA_CASES, ACLU_TRACKER], "SB 99 (2023) bans HRT, blockers, surgery for minors but permanently enjoined May 2025 (Van Garderen v. Montana) on state constitutional privacy grounds; not reviewable under Skrmetti."),
      puberty_blockers: r("IN_LITIGATION", [MAP_YOUTH_BANS, LAMBDA_CASES]),
      surgery_adult: r("LEGAL", [MAP_MEDICAID]),
      surgery_minor: r("IN_LITIGATION", [MAP_YOUTH_BANS, LAMBDA_CASES]),
      id_marker_change: r("BANNED", [MAP_ID], "Driver's license updates banned; birth certificate requires court order plus surgery."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "NE",
    state_name: "Nebraska",
    procedures: {
      hrt_adult: r("RESTRICTED", [MAP_MEDICAID], "Medicaid excludes for all ages."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "LB 574 (2023) Let Them Grow Act restricts HRT and puberty blockers for minors with narrow exceptions; surgery banned outright."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("RESTRICTED", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("RESTRICTED", [MAP_ID], "Driver's license policy unclear; birth certificate: administrative with physician documentation."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "NV",
    state_name: "Nevada",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID], "Medicaid explicitly covers."),
      hrt_minor: r("LEGAL", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("LEGAL", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("LEGAL", [MAP_MEDICAID]),
      surgery_minor: r("LEGAL", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("LEGAL", [MAP_ID], "Driver's license: self attestation. Birth certificate: administrative, no documentation."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law on the books."),
    },
  },
  {
    state_code: "NH",
    state_name: "New Hampshire",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID], "Medicaid explicitly covers."),
      hrt_minor: r("LEGAL", [MAP_YOUTH_BANS], "Not restricted by HB 619 (2024), which targets surgery only."),
      puberty_blockers: r("LEGAL", [MAP_YOUTH_BANS]),
      surgery_adult: r("LEGAL", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "HB 619 (2024) bans gender affirming surgery for minors. HRT and blockers are not restricted by statute."),
      id_marker_change: r("LEGAL", [MAP_ID], "Driver's license: self attestation. Birth certificate: administrative with physician documentation."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "NJ",
    state_name: "New Jersey",
    procedures: {
      hrt_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      hrt_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      surgery_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("PROTECTED", [MAP_ID], "Self attestation for license and birth certificate."),
      shield_law: r("PROTECTED", [MAP_SHIELD], "A 1653 (2023) shield law."),
    },
  },
  {
    state_code: "NM",
    state_name: "New Mexico",
    procedures: {
      hrt_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      hrt_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      surgery_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("PROTECTED", [MAP_ID], "Self attestation for license and birth certificate."),
      shield_law: r("PROTECTED", [MAP_SHIELD], "HB 7 (2023) shield law."),
    },
  },
  {
    state_code: "NY",
    state_name: "New York",
    procedures: {
      hrt_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      hrt_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      surgery_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("PROTECTED", [MAP_ID], "Self attestation for license and birth certificate."),
      shield_law: r("PROTECTED", [MAP_SHIELD], "S 1066 (2023) shield law."),
    },
  },
  {
    state_code: "NC",
    state_name: "North Carolina",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID], "No state level adult restriction; Medicaid has no explicit policy."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "HB 808 (2023) bans HRT, blockers, and surgery for minors; passed over Governor's veto."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("LEGAL", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("LEGAL", [MAP_ID], "Driver's license: self attestation. Birth certificate: administrative, no documentation."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "ND",
    state_name: "North Dakota",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID], "Medicaid explicitly covers; no state level adult restriction."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "HB 1254 (2023) bans HRT, blockers, and surgery for minors."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("LEGAL", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("BANNED", [MAP_ID], "Birth certificate updates banned; X marker banned."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "OH",
    state_name: "Ohio",
    procedures: {
      hrt_adult: r("RESTRICTED", [MAP_MEDICAID], "Medicaid excludes for all ages. Adult care otherwise legal."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "HB 68 (2024) Saving Adolescents from Experimentation Act bans HRT, blockers, and surgery for minors."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("RESTRICTED", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("LEGAL", [MAP_ID], "Driver's license: self attestation. Birth certificate: administrative with physician documentation."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "OK",
    state_name: "Oklahoma",
    procedures: {
      hrt_adult: r("RESTRICTED", [MAP_MEDICAID, ACLU_TRACKER], "Medicaid excludes for all ages. SB 613 (2023) is being extended via 2026 legislation to age 26."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "SB 613 (2023) bans HRT, blockers, and surgery for minors."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("RESTRICTED", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("BANNED", [MAP_ID], "Driver's license updates banned; birth certificate updates banned."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "OR",
    state_name: "Oregon",
    procedures: {
      hrt_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      hrt_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      surgery_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("PROTECTED", [MAP_ID], "Self attestation for license and birth certificate."),
      shield_law: r("PROTECTED", [MAP_SHIELD], "HB 2002 (2023) shield law."),
    },
  },
  {
    state_code: "PA",
    state_name: "Pennsylvania",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID], "Medicaid explicitly covers; no state level restriction."),
      hrt_minor: r("LEGAL", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("LEGAL", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("LEGAL", [MAP_MEDICAID]),
      surgery_minor: r("LEGAL", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("PROTECTED", [MAP_ID], "Self attestation for license and birth certificate."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law on the books."),
    },
  },
  {
    state_code: "RI",
    state_name: "Rhode Island",
    procedures: {
      hrt_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      hrt_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      surgery_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("PROTECTED", [MAP_ID], "Self attestation for license and birth certificate."),
      shield_law: r("PROTECTED", [MAP_SHIELD], "S 305 (2024) shield law."),
    },
  },
  {
    state_code: "SC",
    state_name: "South Carolina",
    procedures: {
      hrt_adult: r("RESTRICTED", [MAP_MEDICAID], "Medicaid excludes for all ages."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "H 4624 (2024) bans HRT, blockers, and surgery for minors."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("RESTRICTED", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("BANNED", [MAP_ID], "Driver's license requires court order; birth certificate updates banned."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "SD",
    state_name: "South Dakota",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID], "No state level adult restriction; Medicaid has no explicit policy."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "HB 1080 (2023) bans HRT, blockers, and surgery for minors."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("LEGAL", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("RESTRICTED", [MAP_ID], "Driver's license requires court order; birth certificate process unclear/judicial discretion."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "TN",
    state_name: "Tennessee",
    procedures: {
      hrt_adult: r("RESTRICTED", [MAP_MEDICAID], "Medicaid excludes for all ages. Adult care otherwise legal."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER, SKRMETTI_RULING], "SB 1 (2023) bans HRT, blockers, surgery for minors. Upheld by U.S. Supreme Court in U.S. v. Skrmetti (June 2025)."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER, SKRMETTI_RULING]),
      surgery_adult: r("RESTRICTED", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER, SKRMETTI_RULING]),
      id_marker_change: r("LEGAL", [MAP_ID], "Driver's license: physician letter. Birth certificate: administrative, no documentation. Birth certificate path remains contested in court."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "TX",
    state_name: "Texas",
    procedures: {
      hrt_adult: r("RESTRICTED", [MAP_MEDICAID, ACLU_TRACKER], "Medicaid excludes for all ages. AG actively investigates providers; civil investigative demand pressure on out of state care."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "SB 14 (2023) bans HRT, blockers, and surgery for minors."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("RESTRICTED", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("BANNED", [MAP_ID], "Driver's license updates banned (2024 DPS policy); birth certificate requires court order plus surgery."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law. AG actively hostile to out of state care providers; no statutory anti shield but de facto hostile environment."),
    },
  },
  {
    state_code: "UT",
    state_name: "Utah",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID], "No state level adult restriction; Medicaid has no explicit policy."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "SB 16 (2023) bans HRT, blockers, and surgery for minors. Originally framed as a moratorium pending state study."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("LEGAL", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("BANNED", [MAP_ID], "Driver's license updates banned; birth certificate requires court order plus surgery; X marker banned."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "VT",
    state_name: "Vermont",
    procedures: {
      hrt_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      hrt_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      surgery_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("PROTECTED", [MAP_ID], "Self attestation for license and birth certificate."),
      shield_law: r("PROTECTED", [MAP_SHIELD], "S 37 (2023) shield law."),
    },
  },
  {
    state_code: "VA",
    state_name: "Virginia",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID], "Medicaid explicitly covers."),
      hrt_minor: r("LEGAL", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("LEGAL", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("LEGAL", [MAP_MEDICAID]),
      surgery_minor: r("LEGAL", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("LEGAL", [MAP_ID], "Driver's license: self attestation. Birth certificate: administrative with physician documentation."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "WA",
    state_name: "Washington",
    procedures: {
      hrt_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      hrt_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      surgery_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("PROTECTED", [MAP_ID], "Self attestation for license and birth certificate."),
      shield_law: r("PROTECTED", [MAP_SHIELD], "HB 1469 (2023) shield law."),
    },
  },
  {
    state_code: "WV",
    state_name: "West Virginia",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID], "Medicaid explicitly covers HRT for adults."),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "HB 2007 (2023) bans HRT, blockers, and surgery for minors with narrow severe depression exception."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("RESTRICTED", [STATELINE_WV, MAP_MEDICAID], "Anderson v. Crouch (4th Cir. March 2026) upheld WV Medicaid ban on adult gender affirming surgery, extending Skrmetti reasoning."),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("BANNED", [MAP_ID], "Driver's license updates banned; birth certificate requires court order plus surgery."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "WI",
    state_name: "Wisconsin",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID], "Medicaid explicitly covers; no state level restriction. Governor Evers has vetoed multiple care restriction bills."),
      hrt_minor: r("LEGAL", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("LEGAL", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("LEGAL", [MAP_MEDICAID]),
      surgery_minor: r("LEGAL", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("LEGAL", [MAP_ID], "Unverified, confirm specific birth certificate path. Driver's license updates available with physician documentation."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "WY",
    state_name: "Wyoming",
    procedures: {
      hrt_adult: r("LEGAL", [MAP_MEDICAID]),
      hrt_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER], "SF 99 (2024) Chloe's Law bans HRT, blockers, and surgery for minors."),
      puberty_blockers: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      surgery_adult: r("LEGAL", [MAP_MEDICAID]),
      surgery_minor: r("BANNED", [MAP_YOUTH_BANS, KFF_TRACKER]),
      id_marker_change: r("BANNED", [MAP_ID], "Driver's license requires court order; birth certificate updates banned."),
      shield_law: r("RESTRICTED", [MAP_SHIELD], "No shield law."),
    },
  },
  {
    state_code: "DC",
    state_name: "District of Columbia",
    procedures: {
      hrt_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      hrt_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      puberty_blockers: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      surgery_adult: r("PROTECTED", [MAP_MEDICAID, MAP_SHIELD]),
      surgery_minor: r("PROTECTED", [MAP_YOUTH_BANS, MAP_MEDICAID]),
      id_marker_change: r("PROTECTED", [MAP_ID], "Self attestation for license and birth certificate; X marker available."),
      shield_law: r("PROTECTED", [MAP_SHIELD], "DC Council enacted shield protections in 2023."),
    },
  },
];

export const CARE_STATUS_BY_CODE: Record<string, StateCareData> =
  Object.fromEntries(CARE_STATUS.map((s) => [s.state_code, s]));

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

export const STATE_OPTIONS: Array<{ code: string; name: string }> =
  CARE_STATUS.map((s) => ({ code: s.state_code, name: s.state_name }));
