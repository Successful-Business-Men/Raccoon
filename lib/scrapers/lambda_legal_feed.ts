import type { StateCareData } from "@/types";

/**
 * Lambda Legal case-tracker scraper.
 *
 * TODO: parse Lambda Legal's case-tracking pages or RSS feed. For each
 * active case touching gender-affirming care, ID changes, or shield laws,
 * mark the relevant state procedure as IN_LITIGATION until resolved.
 */
export async function scrapeLambdaLegal(): Promise<Partial<StateCareData>[]> {
  return [];
}
