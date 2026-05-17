// PubMed E-utilities — free, no auth required, rate-limited at 3 req/sec.
// Docs: https://www.ncbi.nlm.nih.gov/books/NBK25500/

const BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

export interface PubmedCitation {
  pmid: string;
  title: string;
  authors: string[];
  source: string;
  year: string;
  url: string;
}

export async function searchPubmed(
  query: string,
  limit = 3,
  signal?: AbortSignal
): Promise<PubmedCitation[]> {
  if (!query.trim()) return [];
  const searchUrl =
    `${BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}` +
    `&retmax=${limit}&sort=date&retmode=json`;
  const sRes = await fetch(searchUrl, { signal, next: { revalidate: 21600 } as any });
  if (!sRes.ok) return [];
  const sData = await sRes.json().catch(() => null);
  const ids: string[] = sData?.esearchresult?.idlist || [];
  if (!ids.length) return [];

  const summaryUrl =
    `${BASE}/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`;
  const dRes = await fetch(summaryUrl, { signal, next: { revalidate: 21600 } as any });
  if (!dRes.ok) return [];
  const dData = await dRes.json().catch(() => null);
  const docs = dData?.result;
  if (!docs) return [];

  const out: PubmedCitation[] = [];
  for (const pmid of ids) {
    const r = docs[pmid];
    if (!r) continue;
    out.push({
      pmid,
      title: String(r?.title || ""),
      authors: Array.isArray(r?.authors)
        ? r.authors.slice(0, 3).map((a: any) => String(a?.name || ""))
        : [],
      source: String(r?.fulljournalname || r?.source || ""),
      year: String(r?.pubdate || "").slice(0, 4),
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    });
  }
  return out;
}

// Build a focused query: lab + trans-HRT terms + recent filter.
export function buildLabEvidenceQuery(labName: string, regimen: string): string {
  const hrtTerms =
    /testosterone/i.test(regimen)
      ? "(testosterone[tiab] OR \"gender-affirming hormone\"[tiab])"
      : /estradiol|estrogen|spironolactone/i.test(regimen)
      ? "(estradiol[tiab] OR \"gender-affirming hormone\"[tiab])"
      : "\"gender-affirming hormone\"[tiab]";
  const lab = `"${labName.replace(/"/g, "")}"[tiab]`;
  return `${lab} AND ${hrtTerms} AND (transgender[tiab] OR transsexual[tiab] OR \"gender dysphoria\"[tiab]) AND \"last 10 years\"[dp]`;
}
