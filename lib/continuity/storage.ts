import type { ContinuityIntake, ContinuityPlan } from "@/types";

const KEY = "seagull_continuity_v2";
const SCHEMA_VERSION = 2;

export interface StoredState {
  schemaVersion: number;
  intake: ContinuityIntake;
  plan: ContinuityPlan | null;
  checked: Record<string, boolean>;
  step?: number;
  updatedAt: number;
}

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadLocal(): StoredState | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.schemaVersion !== SCHEMA_VERSION) return null;
    if (!parsed.intake) return null;
    return {
      schemaVersion: SCHEMA_VERSION,
      intake: parsed.intake,
      plan: parsed.plan ?? null,
      checked: parsed.checked ?? {},
      step: parsed.step,
      updatedAt: parsed.updatedAt ?? 0,
    };
  } catch {
    return null;
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function saveLocal(state: Omit<StoredState, "schemaVersion" | "updatedAt">) {
  if (!isBrowser()) return;
  const payload: StoredState = {
    ...state,
    schemaVersion: SCHEMA_VERSION,
    updatedAt: Date.now(),
  };
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(payload));
    } catch {
      // Quota or private mode — silently drop. Plan still works in-memory.
    }
  }, 400);
}

export function saveLocalImmediate(
  state: Omit<StoredState, "schemaVersion" | "updatedAt">
) {
  if (!isBrowser()) return;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  const payload: StoredState = {
    ...state,
    schemaVersion: SCHEMA_VERSION,
    updatedAt: Date.now(),
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // Quota or private mode — silently drop.
  }
}

export function clearLocal() {
  if (!isBrowser()) return;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  try {
    window.localStorage.removeItem(KEY);
    // Also wipe any legacy/transient keys this feature uses.
    window.localStorage.removeItem("seagull_pending_plan");
  } catch {
    // ignore
  }
}

export function hasLocal(): boolean {
  return loadLocal() !== null;
}
