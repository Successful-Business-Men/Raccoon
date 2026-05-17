// Profile data lives entirely in the browser. The whole point of this app is
// "type it once" — nothing gets posted to a server unless the user explicitly
// opts in to anonymous community sharing.

export type HormoneRoute =
  | "injection_im"
  | "injection_subq"
  | "patch"
  | "gel"
  | "oral"
  | "implant"
  | "other";

export interface Medication {
  id: string;
  name: string;
  dose: string;
  route: HormoneRoute | "";
  frequency: string;
  started: string;
}

export interface Surgery {
  id: string;
  name: string;
  date: string;
  notes?: string;
}

export interface LabValue {
  id: string;
  name: string;
  value: string;
  unit: string;
  date: string;
}

export interface Profile {
  display_name: string;
  pronouns: string;
  age: string;
  sex_assigned_at_birth: "male" | "female" | "intersex" | "";
  hormone_regimen_summary: string;
  medications: Medication[];
  surgeries: Surgery[];
  recent_labs: LabValue[];
  share_anonymously: boolean;
}

const STORAGE_KEY = "seagull_profile_v1";

export function emptyProfile(): Profile {
  return {
    display_name: "",
    pronouns: "",
    age: "",
    sex_assigned_at_birth: "",
    hormone_regimen_summary: "",
    medications: [],
    surgeries: [],
    recent_labs: [],
    share_anonymously: false,
  };
}

export function loadProfile(): Profile {
  if (typeof window === "undefined") return emptyProfile();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProfile();
    return { ...emptyProfile(), ...JSON.parse(raw) };
  } catch {
    return emptyProfile();
  }
}

export function saveProfile(p: Profile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function summarizeProfile(p: Profile): string {
  const parts: string[] = [];
  if (p.medications.length) {
    parts.push(
      "Medications: " +
        p.medications
          .map((m) =>
            [m.name, m.dose, prettyRoute(m.route), m.frequency, m.started && `since ${m.started}`]
              .filter(Boolean)
              .join(" · ")
          )
          .join("; ")
    );
  }
  if (p.surgeries.length) {
    parts.push(
      "Surgical history: " +
        p.surgeries.map((s) => [s.name, s.date].filter(Boolean).join(" · ")).join("; ")
    );
  }
  if (p.recent_labs.length) {
    parts.push(
      "Recent labs: " +
        p.recent_labs
          .map((l) => `${l.name} ${l.value}${l.unit ? " " + l.unit : ""} (${l.date})`)
          .join("; ")
    );
  }
  return parts.join(". ");
}

export function prettyRoute(r: HormoneRoute | ""): string {
  if (!r) return "";
  return (
    {
      injection_im: "IM injection",
      injection_subq: "subQ injection",
      patch: "patch",
      gel: "gel",
      oral: "oral",
      implant: "implant",
      other: "other route",
    } satisfies Record<HormoneRoute, string>
  )[r];
}
