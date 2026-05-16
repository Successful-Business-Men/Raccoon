import type { StateCareData } from "@/types";

/**
 * LegiScan scraper.
 *
 * TODO: hit the LegiScan API for bills tagged "gender affirming care",
 * "transgender", "shield law" etc. across all 50 states + DC, classify each
 * by procedure key, and emit Partial<StateCareData> records.
 */
export async function scrapeLegiscan(): Promise<Partial<StateCareData>[]> {
  return [];
}
