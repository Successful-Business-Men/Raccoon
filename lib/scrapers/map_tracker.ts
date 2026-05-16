import type { StateCareData } from "@/types";

/**
 * Movement Advancement Project (MAP) equality-map scraper.
 *
 * TODO: read MAP's state-by-state equality-map JSON/HTML (or licensed feed)
 * and map their categories to our CareStatus values:
 *   high → PROTECTED, medium → LEGAL, fair → RESTRICTED,
 *   low → BANNED, negative → BANNED.
 */
export async function scrapeMap(): Promise<Partial<StateCareData>[]> {
  return [];
}
