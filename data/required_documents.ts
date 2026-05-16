import type { CareType } from "@/types";

export interface RequiredDocument {
  title: string;
  detail: string;
  flag?: "critical" | "controlled_substance";
}

export interface RequiredDocumentsGroup {
  care_type: CareType;
  label: string;
  intro?: string;
  documents: RequiredDocument[];
}

// Static reference for documents you'll need on hand to actually fill
// prescriptions or continue care after a move. Sources: DEA Title 21 CFR 1306
// (controlled substance refills), state pharmacy board guidance, common
// surgical aftercare hand-off practice. Verify locally — this is reference,
// not legal advice.
export const REQUIRED_DOCUMENTS: RequiredDocumentsGroup[] = [
  {
    care_type: "hrt",
    label: "Hormone replacement therapy (HRT)",
    intro:
      "Testosterone is a Schedule III controlled substance under federal law. Estrogen, spironolactone, and progesterone are not controlled. Bring more, not less.",
    documents: [
      {
        title: "Active prescription (or prescriber contact)",
        detail:
          "A current Rx written within the last 12 months, plus your prescriber's name, NPI number, and phone. Many new providers will call to verify before continuing care.",
      },
      {
        title: "Government-issued photo ID matching the name on your prescription",
        flag: "critical",
        detail:
          "If your legal name differs from the name your provider uses, bring a court order for the name change or a letter from your provider noting the alias. Pharmacies can refuse to fill if the names don't match — especially for testosterone.",
      },
      {
        title: "Testosterone: new in-state prescription within ~6 months",
        flag: "controlled_substance",
        detail:
          "Federal DEA rules let Schedule III refills happen up to 5 times within 6 months of the original Rx. After that, or if you're moving long-term, get a new prescription from a provider licensed in your destination state. Some states (e.g. NY, FL) impose stricter limits on out-of-state controlled-substance prescriptions.",
      },
      {
        title: "Insurance card or self-pay plan",
        detail:
          "Bring your insurance card. If switching plans, know your new member ID before the gap window starts. GoodRx and Mark Cuban Cost Plus Drugs cover most HRT formulations cash-pay if insurance lapses.",
      },
      {
        title: "Last 12 months of lab results",
        detail:
          "Estradiol, total/free testosterone, CBC, comprehensive metabolic panel, lipid panel. A new prescriber will usually want these before writing a continuation Rx.",
      },
      {
        title: "List of current medications with doses and start dates",
        detail:
          "Include hormone formulation (e.g. estradiol valerate 4mg sublingual twice daily, testosterone cypionate 100mg/mL IM weekly). Generic name + brand if known.",
      },
    ],
  },
  {
    care_type: "surgery_aftercare",
    label: "Surgery aftercare",
    documents: [
      {
        title: "Operative report and discharge summary",
        detail:
          "Request both from the hospital or surgical center where you had the procedure. A new provider can't safely manage aftercare without knowing what was done.",
      },
      {
        title: "Letter from your surgeon for continuing care",
        detail:
          "Ask your surgeon's office for a continuation-of-care letter that names the procedure, date, expected recovery milestones, and any follow-up procedures still needed (e.g. revisions, dilation schedules).",
      },
      {
        title: "Photos and notes on your current healing stage",
        detail:
          "Date-stamped photos and a written log of drain output, dilation schedule, wound status. Bring these to your first aftercare visit.",
      },
      {
        title: "Pre-authorization paperwork (if revision is pending)",
        detail:
          "If a revision or staged procedure is planned, transfer the existing prior-authorization to your new insurance carrier early — re-approval can take 30–90 days.",
      },
    ],
  },
  {
    care_type: "mental_health",
    label: "Mental health",
    documents: [
      {
        title: "Continuation-of-care letter from your current therapist or psychiatrist",
        detail:
          "Should name your current diagnosis, treatment goals, medications, and any safety planning. This is the single most useful thing to walk in with.",
      },
      {
        title: "Active prescription for psychiatric medications",
        detail:
          "Most psychiatric meds (SSRIs, SNRIs, mood stabilizers) are not controlled. Stimulants for ADHD (Adderall, Vyvanse, Ritalin) ARE Schedule II — they cannot be refilled across state lines and require a new Rx from an in-state provider every time.",
        flag: "controlled_substance",
      },
      {
        title: "PSYPACT note (if seeing a psychologist remotely)",
        detail:
          "If your psychologist is in a PSYPACT state and you're moving to one, they may be able to continue care remotely. Check the PSYPACT map at psypact.org before assuming.",
      },
    ],
  },
  {
    care_type: "primary_care",
    label: "Primary care",
    documents: [
      {
        title: "Signed medical records release",
        detail:
          "Sign a HIPAA-compliant release at your current provider's office authorizing transfer to your new clinic. Most offices fulfill within 30 days — start early.",
      },
      {
        title: "Immunization records",
        detail:
          "Pull these from your state's immunization registry if your current provider can't produce them quickly. Many states have a public-facing portal.",
      },
      {
        title: "Current medication list with prescribers and pharmacies",
        detail:
          "Include over-the-counter and supplements. A printout from your current pharmacy's app is usually fastest.",
      },
      {
        title: "Most recent annual labs and any chronic-condition records",
        detail:
          "Especially diabetes, hypertension, thyroid, HIV care. Pull last two years if possible.",
      },
    ],
  },
  {
    care_type: "reproductive_health",
    label: "Reproductive health",
    documents: [
      {
        title: "Birth control prescription or device records",
        detail:
          "For IUDs or implants, bring the brand, insertion date, and expected removal/replacement date. For oral contraceptives, an active Rx.",
      },
      {
        title: "Pap, HPV, and STI screening history",
        detail:
          "Most recent results plus dates. Some states have tightened access — having records on hand reduces re-screening delays.",
      },
      {
        title: "Pregnancy-related records (if applicable)",
        detail:
          "Prenatal records, ultrasound reports, and any maternal-fetal medicine consults. Move these early in pregnancy — late transfers complicate continuity.",
      },
      {
        title: "Documentation of any prior abortion or miscarriage care",
        detail:
          "Hand-carry these. Don't rely on cross-state portal access. Some states' record-sharing has been restricted in the post-Dobbs landscape.",
        flag: "critical",
      },
    ],
  },
  {
    care_type: "other",
    label: "Other care",
    documents: [
      {
        title: "Most recent records for the condition being managed",
        detail:
          "At minimum: diagnosis, current treatment plan, medications, recent labs or imaging, prescriber contact info.",
      },
      {
        title: "Active prescriptions and pharmacy history",
        detail:
          "Printout from your current pharmacy showing all fills over the last 12 months.",
      },
      {
        title: "Government-issued photo ID and insurance card",
        detail: "Both required at almost every clinic and pharmacy intake.",
      },
    ],
  },
];

export function documentsForCareTypes(
  careTypes: CareType[]
): RequiredDocumentsGroup[] {
  if (careTypes.length === 0) return [];
  return REQUIRED_DOCUMENTS.filter((g) => careTypes.includes(g.care_type));
}
