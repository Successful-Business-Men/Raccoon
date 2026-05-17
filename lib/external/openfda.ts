// OpenFDA — public FDA drug data. Free, no auth (240 req/min unauthenticated).
// Docs: https://open.fda.gov/apis/drug/

const BASE = "https://api.fda.gov";

export interface DrugRecall {
  recall_number: string;
  recall_initiation_date: string;
  status: string;
  classification: string;
  reason_for_recall: string;
  product_description: string;
  recalling_firm: string;
}

export interface DrugAdverseSummary {
  drug: string;
  total_reports: number;
  top_reactions: Array<{ term: string; count: number }>;
}

export async function recentRecalls(
  drug: string,
  limit = 3,
  signal?: AbortSignal
): Promise<DrugRecall[]> {
  if (!drug.trim()) return [];
  const term = drug.trim().toLowerCase().split(/\s+/)[0]; // first word, typically generic
  const search = `product_description:"${term}"`;
  const url =
    `${BASE}/drug/enforcement.json?search=${encodeURIComponent(search)}` +
    `&limit=${limit}&sort=recall_initiation_date:desc`;
  const res = await fetch(url, { signal, next: { revalidate: 21600 } as any });
  if (!res.ok) return [];
  const data = await res.json().catch(() => null);
  const results: any[] = data?.results || [];
  return results.map((r) => ({
    recall_number: String(r?.recall_number || ""),
    recall_initiation_date: String(r?.recall_initiation_date || ""),
    status: String(r?.status || ""),
    classification: String(r?.classification || ""),
    reason_for_recall: String(r?.reason_for_recall || ""),
    product_description: String(r?.product_description || ""),
    recalling_firm: String(r?.recalling_firm || ""),
  }));
}

export async function adverseEventSnapshot(
  drug: string,
  signal?: AbortSignal
): Promise<DrugAdverseSummary | null> {
  if (!drug.trim()) return null;
  const term = drug.trim().toLowerCase().split(/\s+/)[0];
  const search = `patient.drug.medicinalproduct:"${term}"`;
  const url =
    `${BASE}/drug/event.json?search=${encodeURIComponent(search)}` +
    `&count=patient.reaction.reactionmeddrapt.exact&limit=5`;
  const res = await fetch(url, { signal, next: { revalidate: 86400 } as any });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  const results: any[] = data?.results || [];
  if (!results.length) return null;
  return {
    drug,
    total_reports: results.reduce((acc, r) => acc + (Number(r?.count) || 0), 0),
    top_reactions: results.map((r) => ({
      term: String(r?.term || ""),
      count: Number(r?.count || 0),
    })),
  };
}
