import type { Profile, Surgery } from "./profile";

function parseFlexibleDate(s: string): Date | null {
  if (!s) return null;
  const m = s.trim().match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/);
  if (m) {
    const y = parseInt(m[1]);
    const mo = m[2] ? parseInt(m[2]) - 1 : 5;
    const d = m[3] ? parseInt(m[3]) : 15;
    return new Date(y, mo, d);
  }
  const t = Date.parse(s);
  return isNaN(t) ? null : new Date(t);
}

export function postopDuration(date: string): string | null {
  const parsed = parseFlexibleDate(date);
  if (!parsed) return null;
  const diffMs = Date.now() - parsed.getTime();
  if (diffMs < 0) return null;
  const days = Math.floor(diffMs / 86_400_000);
  if (days < 14) return `${days} day${days === 1 ? "" : "s"} postop`;
  const weeks = Math.floor(days / 7);
  if (weeks < 16) return `${weeks} weeks postop`;
  const months = Math.floor(days / 30.44);
  if (months < 24) return `${months} months postop`;
  const years = Math.floor(days / 365.25);
  return `${years} year${years === 1 ? "" : "s"} postop`;
}

export function hormoneDuration(regimen: string): string | null {
  if (!regimen) return null;
  const since = regimen.match(/(?:since|started(?:\s+in)?)\s+(?:\w+\s+)?(\d{4})/i);
  const iso = regimen.match(/\b(\d{4})-(\d{1,2})\b/);
  const yearStr = since?.[1] || iso?.[1];
  if (!yearStr) return null;
  const year = parseInt(yearStr);
  const thisYear = new Date().getFullYear();
  if (year < 1950 || year > thisYear) return null;
  const diff = thisYear - year;
  if (diff === 0) return "started this year";
  return `${diff} year${diff === 1 ? "" : "s"} on regimen`;
}

export interface ScreeningReminder {
  label: string;
  detail: string;
}

export function screeningReminders(p: Profile): ScreeningReminder[] {
  const inv = p.anatomical_inventory.toLowerCase();
  const surgeryText = p.surgeries.map((s) => s.description).join(" ").toLowerCase();
  const age = parseInt(p.age) || 0;
  const sex = p.sex_assigned_at_birth;
  const out: ScreeningReminder[] = [];

  const removedOrAbsent = (organ: string) =>
    new RegExp(`(no|removed|absent|without)\\s+${organ}`).test(inv) ||
    (organ === "cervix" && /hysterectomy/.test(surgeryText)) ||
    (organ === "breast" && /(top\s+surgery|mastectomy)/.test(surgeryText));

  const hasOrgan = (organ: string, defaultSex: "male" | "female") => {
    if (removedOrAbsent(organ)) return false;
    if (inv.includes(organ)) return true;
    if (!inv && sex === defaultSex) return true;
    return false;
  };

  if (age >= 21 && age <= 65 && hasOrgan("cervix", "female")) {
    out.push({ label: "Pap", detail: "every 3–5 yr · 21–65" });
  }
  if (age >= 40 && age <= 74 && hasOrgan("breast", "female")) {
    out.push({ label: "Mammogram", detail: "every 2 yr · 40–74" });
  }
  if (age >= 55 && age <= 69 && hasOrgan("prostate", "male")) {
    out.push({ label: "Prostate (shared decision)", detail: "55–69" });
  }
  if (age >= 45 && age <= 75) {
    out.push({ label: "Colorectal", detail: "every 1–10 yr · 45–75" });
  }
  return out;
}

export function annotateSurgeries(surgeries: Surgery[]) {
  return surgeries.map((s) => ({
    ...s,
    postop: postopDuration(s.date),
  }));
}

export function compactSummary(p: Profile, reason: string): string {
  const name = p.display_name.trim() || "Patient";
  const demo = [p.age && `${p.age}y`, p.sex_assigned_at_birth && `${p.sex_assigned_at_birth[0].toUpperCase()}AB`]
    .filter(Boolean)
    .join(" ");
  const allergies = p.allergies.filter((a) => a.substance.trim()).map((a) => a.substance).join(", ");
  const r = reason.trim().split(/\s+/).slice(0, 14).join(" ");
  return [
    demo ? `${name} · ${demo}` : name,
    r ? `Reason: ${r}${reason.split(/\s+/).length > 14 ? "…" : ""}` : null,
    allergies ? `Allergies: ${allergies}` : "No known allergies",
  ]
    .filter(Boolean)
    .join("\n");
}
