import type { IncidentType, ProtectionRecord, ProtectionsFile } from "@/types";
import protectionsJson from "@/data/protections.json";

// The JSON file uses a flexible shape so Robert can paste records in;
// at runtime we coerce to ProtectionsFile.
const data = protectionsJson as unknown as ProtectionsFile;

export function lookupProtections(
  incidentType: IncidentType,
  stateCode?: string
): ProtectionRecord[] {
  const federal = (data.federal || []).filter((r) =>
    r.incident_types.includes(incidentType)
  );
  if (!stateCode) return federal;
  const states = (data.states && (data.states as Record<string, ProtectionRecord[]>)[stateCode]) || [];
  const stateMatches = states.filter((r) => r.incident_types.includes(incidentType));
  return [...stateMatches, ...federal];
}
