# Care Map — Research Prompt

You are researching US state laws on gender-affirming healthcare and ID document policy to populate the Seagull app's Care Map. Your output is a drop-in replacement for [data/care_status.ts](../data/care_status.ts).

**Verification date:** 2026-05-16 (today). Every record must reflect law in effect on or before this date. Treat anything you cannot confirm as still active as of this date with skepticism — flag it in `notes` and pick the closest applicable status.

## Output

Return one TypeScript file in a single fenced ```ts code block. It must be a drop-in replacement for `data/care_status.ts`:

- Same imports from `@/types`
- Same exports, same names: `PROCEDURE_KEYS`, `PROCEDURE_LABELS`, `CARE_STATUS`, `CARE_STATUS_BY_CODE`, `getLastDataUpdate`, `STATE_OPTIONS`
- `CARE_STATUS` must be a literal array of 51 `StateCareData` records (50 states + DC, in the same order as the current file) with **real, researched values** — no hash function, no placeholder URLs, no `"Placeholder data — replace with verified source."` notes
- Must pass `tsc --noEmit`

The receiving repo will overwrite `data/care_status.ts` with your output verbatim. Anything you leave wrong ships.

## Schema (don't change)

```ts
type CareStatus = "PROTECTED" | "LEGAL" | "RESTRICTED" | "BANNED" | "IN_LITIGATION";

type ProcedureKey =
  | "hrt_adult"
  | "hrt_minor"
  | "puberty_blockers"
  | "surgery_adult"
  | "surgery_minor"
  | "id_marker_change"
  | "shield_law";

interface ProcedureStatus {
  status: CareStatus;
  last_updated: string;   // ISO date "YYYY-MM-DD" — the day you verified the source
  sources: string[];      // 1+ real URLs (deep-link to state page or case, not homepages)
  notes?: string;         // 1–2 sentences plain English, naming the statute/EO/case if known
}

interface StateCareData {
  state_code: string;
  state_name: string;
  procedures: Record<ProcedureKey, ProcedureStatus>;
  related_orgs?: Array<{ name: string; url: string }>;
}
```

## Procedure scope (exact)

| Key | Scope |
|---|---|
| `hrt_adult` | Hormone therapy (estrogen / testosterone / anti-androgens) for adults 18+ |
| `hrt_minor` | Hormone therapy for anyone under 18 |
| `puberty_blockers` | GnRH agonists (Lupron, Supprelin) for minors |
| `surgery_adult` | Gender-affirming surgery (top, bottom, facial) for adults 18+ |
| `surgery_minor` | Gender-affirming surgery for anyone under 18 |
| `id_marker_change` | Updating gender marker on state driver's license, state ID, *or* birth certificate (use the most-restrictive of the three; cite which) |
| `shield_law` | Statute, EO, or AG opinion declining cooperation with out-of-state prosecution / civil action / subpoena targeting gender-affirming care provided lawfully in-state |

## Status rubrics (apply per procedure type)

### Care procedures (HRT, blockers, surgery)
- **PROTECTED** — Explicit state statute or EO affirms the right to this care; insurance non-discrimination is required; no parental-consent traps for adults.
- **LEGAL** — Available with no state-level restriction; no affirmative protection either.
- **RESTRICTED** — Material barrier short of a ban (mandatory waiting period, narrow-exception ban, age-cap that doesn't fully prohibit, prior-auth carve-outs that block Medicaid coverage, etc.). **Use this for "ban for new patients, grandfathered for current."**
- **BANNED** — Statute prohibits this care for this population; criminal, civil, or licensing penalties for providers. Currently enforceable.
- **IN_LITIGATION** — A ban exists *on the books* but is **currently enjoined**, or a final ruling is pending that will decide enforceability. Do **not** use this for "law was passed and is being challenged but is still in force" — that's still BANNED.

### `id_marker_change`
- **PROTECTED** — Self-attestation; no court order, no surgery requirement, no physician letter.
- **LEGAL** — Available with a reasonable requirement (e.g., physician letter only, or court order obtainable without surgery).
- **RESTRICTED** — Court order *and* proof of surgery, or other significant barrier; X marker unavailable.
- **BANNED** — Statute bars updates entirely, or fixes the marker to sex assigned at birth.
- **IN_LITIGATION** — Current rule is enjoined or under active challenge.

### `shield_law`
- **PROTECTED** — Comprehensive statute: blocks subpoenas, blocks extradition, blocks medical-board cooperation, protects providers and patients.
- **LEGAL** — Partial protection (EO-level only, or covers some but not all of: subpoenas / extradition / licensing).
- **RESTRICTED** — No shield in place but no hostile cooperation laws either.
- **BANNED** — State has an **anti-shield law** (actively requires cooperation with out-of-state prosecutions, or criminalizes traveling for care).
- **IN_LITIGATION** — Pending or enjoined.

## Required research sources

For every record, cross-check against **at least one** of these and link a deep page (not a homepage):

1. **Movement Advancement Project (MAP)** — https://www.lgbtmap.org/equality-maps
   - Use the per-state profile and per-policy maps (healthcare laws, ID documents, shield laws, religious exemption laws).
2. **KFF state policy tracker** — https://www.kff.org/state-category/lgbtq-health-policy/
   - Use especially for Medicaid coverage and pediatric care restrictions.
3. **Lambda Legal** — https://lambdalegal.org/cases/
   - Use for litigation status. Cite the specific case page if `IN_LITIGATION`.
4. **ACLU Legislative Attacks** — https://www.aclu.org/legislative-attacks-on-lgbtq-rights
   - Use for active bills, recently-signed laws, and the litigation picture.

When the underlying statute / executive order / case ruling is identifiable, **prefer the primary source** (legislature, state code, court docket, AG opinion) in `sources` and put MAP/KFF/Lambda/ACLU as corroborating links.

## Anti-hallucination rules

- **Never fabricate a URL.** Every URL in `sources[]` must be one you actually retrieved during research. If a deep link is unstable, link the parent page.
- **Never fabricate a statute citation or case name.** If you cannot name it, leave it out of `notes`.
- **Disagreement between sources:** prefer the more recent one. If recency is the same, prefer MAP > KFF > Lambda Legal > ACLU > advocacy summaries. Note the disagreement in `notes`.
- **Pre-enforcement / passed but not yet effective:** apply the rubric to *current* state on 2026-05-16. If a ban was signed but doesn't take effect until later in 2026, status is currently `LEGAL` or `RESTRICTED` per the rubric; mention the effective date in `notes`.
- **Enjoined ban:** status is `IN_LITIGATION`, not `BANNED`. State the injunction and which court issued it in `notes`.
- **Cannot verify:** apply your best-fit status per rubric and set `notes` to start with `"Unverified — "` followed by what you tried and why you couldn't confirm. **Still include real source URLs** — the URL of the place you checked is fine.

## Field requirements

- **`last_updated`** — The date you verified the record. ISO `YYYY-MM-DD`. Default `2026-05-16`. If you found a more recent policy change on a later date that you also verified, use that.
- **`sources`** — At least one URL. No `example.org`. No homepages alone (e.g., `https://www.lgbtmap.org/` is not acceptable as the only source — use the per-state or per-policy deep link).
- **`notes`** — 1–2 sentences. Name the statute, EO, or case if known. Cite the effective date of the controlling rule. Mention enforcement status if it isn't the obvious default.
- **`related_orgs`** — Optional. If you find a state-specific legal helpdesk, trans health clinic network, or community org with a working website, include 1–3. Don't pad. Skip the field entirely (omit it) if nothing solid.

## Coverage required

All **51 jurisdictions × 7 procedures = 357 records**. Every cell populated. No `// TODO`, no `null`, no `"see notes"`. The current file is the structural template — match its export shape exactly.

State order (use this exact ordering for `CARE_STATUS`):

AL, AK, AZ, AR, CA, CO, CT, DE, FL, GA, HI, ID, IL, IN, IA, KS, KY, LA, ME, MD, MA, MI, MN, MS, MO, MT, NE, NV, NH, NJ, NM, NY, NC, ND, OH, OK, OR, PA, RI, SC, SD, TN, TX, UT, VT, VA, WA, WV, WI, WY, DC

## Structural example (format only — do NOT copy the values; research them)

```ts
{
  state_code: "XX",
  state_name: "Example State",
  procedures: {
    hrt_adult: {
      status: "LEGAL",
      last_updated: "2026-05-16",
      sources: [
        "https://www.lgbtmap.org/equality-maps/healthcare_laws/policies/XX",
      ],
      notes: "No state-level restriction; no affirmative protection on the books.",
    },
    hrt_minor: {
      status: "BANNED",
      last_updated: "2026-05-16",
      sources: [
        "https://example-legislature.gov/bill/SB-NNN-2024",
        "https://www.lgbtmap.org/equality-maps/healthcare_laws/policies/XX",
      ],
      notes: "SB NNN (2024) prohibits hormone therapy for minors; effective 2024-07-01. Felony for providers.",
    },
    puberty_blockers: { status: "BANNED", last_updated: "2026-05-16", sources: [/* … */], notes: "Same SB NNN (2024)." },
    surgery_adult: { status: "LEGAL", last_updated: "2026-05-16", sources: [/* … */] },
    surgery_minor: { status: "BANNED", last_updated: "2026-05-16", sources: [/* … */], notes: "Same SB NNN (2024)." },
    id_marker_change: {
      status: "RESTRICTED",
      last_updated: "2026-05-16",
      sources: [
        "https://www.lgbtmap.org/equality-maps/identity_document_laws/birth_certificate/XX",
      ],
      notes: "Court order plus proof of surgery required to amend birth certificate; license follows same rule.",
    },
    shield_law: {
      status: "RESTRICTED",
      last_updated: "2026-05-16",
      sources: [
        "https://www.lgbtmap.org/equality-maps/shield_laws/XX",
      ],
      notes: "No shield law on the books; no anti-shield law either.",
    },
  },
}
```

Values above are illustrative of *shape*, not facts. Replace every field with researched truth.

## Process suggestion

1. Open MAP's per-policy maps (healthcare, ID documents, shield laws, religious exemptions) and pull each state's current status into a working table.
2. Cross-check against KFF for Medicaid and pediatric-care nuance.
3. For any "ban" status, check Lambda Legal + ACLU for an active injunction → that flips status to `IN_LITIGATION`.
4. For ambiguous or recently-changed states, confirm against the state legislature page or the underlying ruling.
5. Assemble the file. Sort by the state ordering above. Verify every URL resolves before pasting.
