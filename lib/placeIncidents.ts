"use client";

import type { SeedIncident } from "@/types";

// Local persistence for incidents filed via /document with a ?place_id=.
// In a real build this lives in Supabase, gated by RLS and moderation.
// For the demo we keep it in localStorage so the feedback loop is visible
// without any backend.

const KEY = "seagull_place_incidents";

type Bag = Record<string, SeedIncident[]>;

function readAll(): Bag {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function writeAll(bag: Bag) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(bag));
}

export function getIncidents(place_id: string): SeedIncident[] {
  return readAll()[place_id] || [];
}

export function appendIncident(place_id: string, incident: SeedIncident) {
  const bag = readAll();
  bag[place_id] = [...(bag[place_id] || []), incident];
  writeAll(bag);
}

export function getAllUserIncidents(): Bag {
  return readAll();
}
