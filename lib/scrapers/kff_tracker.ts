import type { StateCareData } from "@/types";

/**
 * KFF state policy scraper.
 *
 * TODO: pull KFF's state-level coverage trackers for gender-affirming care
 * under Medicaid and pediatric care, and emit Partial<StateCareData>
 * records keyed on the right procedure (hrt_minor, surgery_minor, etc.).
 */
export async function scrapeKff(): Promise<Partial<StateCareData>[]> {
  return [];
}
