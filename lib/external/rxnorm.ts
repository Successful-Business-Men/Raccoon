// RxNorm — the NIH/NLM standard drug vocabulary. Free, public, no auth.
// Docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/RxNormAPIs.html

const BASE = "https://rxnav.nlm.nih.gov/REST";

export interface RxNormCandidate {
  rxcui: string;
  name: string;
  score: number;
}

export async function approximateMatch(
  term: string,
  maxEntries = 6,
  signal?: AbortSignal
): Promise<RxNormCandidate[]> {
  if (!term.trim()) return [];
  const url = `${BASE}/approximateTerm.json?term=${encodeURIComponent(
    term.trim()
  )}&maxEntries=${maxEntries}`;
  const res = await fetch(url, { signal, next: { revalidate: 86400 } as any });
  if (!res.ok) return [];
  const data = await res.json().catch(() => null);
  const cands: any[] = data?.approximateGroup?.candidate || [];
  // RxNorm sometimes returns multiple rows for the same rxcui — dedupe.
  const seen = new Set<string>();
  const out: RxNormCandidate[] = [];
  for (const c of cands) {
    const rxcui = String(c?.rxcui || "");
    if (!rxcui || seen.has(rxcui)) continue;
    seen.add(rxcui);
    out.push({
      rxcui,
      name: String(c?.name || c?.term || ""),
      score: Number(c?.score || 0),
    });
  }
  return out;
}

export async function rxcuiProperties(
  rxcui: string,
  signal?: AbortSignal
): Promise<{ name: string; synonym: string; tty: string } | null> {
  const url = `${BASE}/rxcui/${encodeURIComponent(rxcui)}/properties.json`;
  const res = await fetch(url, { signal, next: { revalidate: 86400 } as any });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  const p = data?.properties;
  if (!p) return null;
  return {
    name: String(p.name || ""),
    synonym: String(p.synonym || ""),
    tty: String(p.tty || ""),
  };
}
