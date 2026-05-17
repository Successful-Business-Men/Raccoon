"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save, ShieldCheck } from "lucide-react";
import { Container } from "@/components/Container";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { cn } from "@/lib/cn";
import {
  emptyProfile,
  loadProfile,
  newId,
  prettyRoute,
  saveProfile,
  type HormoneRoute,
  type LabValue,
  type Medication,
  type Profile,
  type Surgery,
} from "@/lib/profile";

const ROUTE_OPTIONS: Array<{ id: HormoneRoute; label: string }> = [
  { id: "injection_im", label: "IM injection" },
  { id: "injection_subq", label: "subQ injection" },
  { id: "patch", label: "Patch" },
  { id: "gel", label: "Gel" },
  { id: "oral", label: "Oral" },
  { id: "implant", label: "Implant" },
  { id: "other", label: "Other" },
];

export function PlacesClient() {
  const [profile, setProfile] = useState<Profile>(emptyProfile());
  const [loaded, setLoaded] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveProfile(profile);
  }, [profile, loaded]);

  function flashSaved() {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1400);
  }

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  function addMed() {
    setProfile((p) => ({
      ...p,
      medications: [
        ...p.medications,
        { id: newId(), name: "", dose: "", route: "", frequency: "", started: "" },
      ],
    }));
  }
  function updateMed(id: string, patch: Partial<Medication>) {
    setProfile((p) => ({
      ...p,
      medications: p.medications.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  }
  function removeMed(id: string) {
    setProfile((p) => ({ ...p, medications: p.medications.filter((m) => m.id !== id) }));
  }

  function addSurgery() {
    setProfile((p) => ({
      ...p,
      surgeries: [...p.surgeries, { id: newId(), name: "", date: "", notes: "" }],
    }));
  }
  function updateSurgery(id: string, patch: Partial<Surgery>) {
    setProfile((p) => ({
      ...p,
      surgeries: p.surgeries.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }
  function removeSurgery(id: string) {
    setProfile((p) => ({ ...p, surgeries: p.surgeries.filter((s) => s.id !== id) }));
  }

  function addLab() {
    setProfile((p) => ({
      ...p,
      recent_labs: [
        ...p.recent_labs,
        { id: newId(), name: "", value: "", unit: "", date: "" },
      ],
    }));
  }
  function updateLab(id: string, patch: Partial<LabValue>) {
    setProfile((p) => ({
      ...p,
      recent_labs: p.recent_labs.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  }
  function removeLab(id: string) {
    setProfile((p) => ({ ...p, recent_labs: p.recent_labs.filter((l) => l.id !== id) }));
  }

  return (
    <div className="page-ocean">
      <PageHero
        eyebrow="Your profile"
        title="Type it once. Use it everywhere."
        description="Meds, surgeries, recent labs. Lives in your browser. Never sent to a server. The Pre-visit Card and Lab Check both read from this."
      >
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-meta text-sea-ink/75">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-ink-primary font-bold">Local-only</span> by default
          </span>
          <span className={cn("transition-opacity", savedFlash ? "opacity-100" : "opacity-0")}>
            <span className="text-status-protected font-bold">Saved</span>
          </span>
        </div>
      </PageHero>

      <Container className="pb-16">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Left column: forms */}
          <div className="flex flex-col gap-6">
            <Section title="About you" subtitle="Optional — used to personalize your visit card.">
              <div className="grid sm:grid-cols-2 gap-4">
                <TextField
                  label="Name (or what you go by)"
                  value={profile.display_name}
                  onChange={(v) => update("display_name", v)}
                  onCommit={flashSaved}
                />
                <TextField
                  label="Pronouns"
                  value={profile.pronouns}
                  onChange={(v) => update("pronouns", v)}
                  onCommit={flashSaved}
                  placeholder="she/her, they/them, …"
                />
                <TextField
                  label="Age"
                  value={profile.age}
                  onChange={(v) => update("age", v)}
                  onCommit={flashSaved}
                  inputMode="numeric"
                />
                <div>
                  <FieldLabel>Sex assigned at birth</FieldLabel>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["male", "female", "intersex"] as const).map((s) => (
                      <Pill
                        key={s}
                        selected={profile.sex_assigned_at_birth === s}
                        onClick={() => {
                          update(
                            "sex_assigned_at_birth",
                            profile.sex_assigned_at_birth === s ? "" : s
                          );
                          flashSaved();
                        }}
                      >
                        {s[0].toUpperCase() + s.slice(1)}
                      </Pill>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <FieldLabel>One-line regimen summary (optional)</FieldLabel>
                <textarea
                  value={profile.hormone_regimen_summary}
                  onChange={(e) => update("hormone_regimen_summary", e.target.value)}
                  onBlur={flashSaved}
                  rows={2}
                  placeholder="e.g. Estradiol valerate IM, spironolactone PO. Started Jan 2022."
                  className="mt-2 w-full rounded-btn border border-divider bg-surface px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
            </Section>

            <Section
              title="Medications"
              subtitle="Hormones, blockers, anything you want a doctor to know about."
              action={
                <Button size="sm" variant="secondary" onClick={addMed}>
                  <Plus className="h-4 w-4" /> Add med
                </Button>
              }
            >
              {profile.medications.length === 0 ? (
                <EmptyHint>No medications yet. Click "Add med" to start.</EmptyHint>
              ) : (
                <div className="space-y-4">
                  {profile.medications.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-card border border-divider bg-surface-inset/40 p-4"
                    >
                      <div className="grid sm:grid-cols-2 gap-3">
                        <TextField
                          label="Name"
                          value={m.name}
                          onChange={(v) => updateMed(m.id, { name: v })}
                          onCommit={flashSaved}
                          placeholder="Estradiol, testosterone, spironolactone…"
                        />
                        <TextField
                          label="Dose"
                          value={m.dose}
                          onChange={(v) => updateMed(m.id, { dose: v })}
                          onCommit={flashSaved}
                          placeholder="4 mg, 200 mg, 0.1 mL…"
                        />
                        <TextField
                          label="Frequency"
                          value={m.frequency}
                          onChange={(v) => updateMed(m.id, { frequency: v })}
                          onCommit={flashSaved}
                          placeholder="weekly, twice daily…"
                        />
                        <TextField
                          label="Started"
                          value={m.started}
                          onChange={(v) => updateMed(m.id, { started: v })}
                          onCommit={flashSaved}
                          placeholder="Jan 2022"
                        />
                      </div>
                      <div className="mt-3">
                        <FieldLabel>Route</FieldLabel>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {ROUTE_OPTIONS.map((r) => (
                            <Pill
                              key={r.id}
                              selected={m.route === r.id}
                              onClick={() => {
                                updateMed(m.id, { route: m.route === r.id ? "" : r.id });
                                flashSaved();
                              }}
                            >
                              {r.label}
                            </Pill>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => removeMed(m.id)}
                          className="inline-flex items-center gap-1.5 text-meta text-ink-secondary hover:text-status-banned"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section
              title="Surgical history"
              subtitle="Past gender-affirming procedures, or anything else relevant."
              action={
                <Button size="sm" variant="secondary" onClick={addSurgery}>
                  <Plus className="h-4 w-4" /> Add surgery
                </Button>
              }
            >
              {profile.surgeries.length === 0 ? (
                <EmptyHint>No surgeries logged.</EmptyHint>
              ) : (
                <div className="space-y-4">
                  {profile.surgeries.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-card border border-divider bg-surface-inset/40 p-4"
                    >
                      <div className="grid sm:grid-cols-2 gap-3">
                        <TextField
                          label="Procedure"
                          value={s.name}
                          onChange={(v) => updateSurgery(s.id, { name: v })}
                          onCommit={flashSaved}
                          placeholder="Top surgery, orchiectomy, …"
                        />
                        <TextField
                          label="Date"
                          value={s.date}
                          onChange={(v) => updateSurgery(s.id, { date: v })}
                          onCommit={flashSaved}
                          placeholder="2023-08"
                        />
                      </div>
                      <div className="mt-3">
                        <FieldLabel>Notes (optional)</FieldLabel>
                        <textarea
                          value={s.notes || ""}
                          onChange={(e) => updateSurgery(s.id, { notes: e.target.value })}
                          onBlur={flashSaved}
                          rows={2}
                          className="mt-2 w-full rounded-btn border border-divider bg-surface px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-accent/30"
                        />
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => removeSurgery(s.id)}
                          className="inline-flex items-center gap-1.5 text-meta text-ink-secondary hover:text-status-banned"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section
              title="Recent labs"
              subtitle="Latest blood work. Adds context when a new number looks off."
              action={
                <Button size="sm" variant="secondary" onClick={addLab}>
                  <Plus className="h-4 w-4" /> Add lab
                </Button>
              }
            >
              {profile.recent_labs.length === 0 ? (
                <EmptyHint>No labs logged yet.</EmptyHint>
              ) : (
                <div className="space-y-4">
                  {profile.recent_labs.map((l) => (
                    <div
                      key={l.id}
                      className="rounded-card border border-divider bg-surface-inset/40 p-4 grid sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-end"
                    >
                      <TextField
                        label="Test"
                        value={l.name}
                        onChange={(v) => updateLab(l.id, { name: v })}
                        onCommit={flashSaved}
                        placeholder="Estradiol, Hgb, …"
                      />
                      <TextField
                        label="Value"
                        value={l.value}
                        onChange={(v) => updateLab(l.id, { value: v })}
                        onCommit={flashSaved}
                      />
                      <TextField
                        label="Unit"
                        value={l.unit}
                        onChange={(v) => updateLab(l.id, { unit: v })}
                        onCommit={flashSaved}
                        placeholder="pg/mL, ng/dL…"
                      />
                      <TextField
                        label="Date"
                        value={l.date}
                        onChange={(v) => updateLab(l.id, { date: v })}
                        onCommit={flashSaved}
                        placeholder="2025-03"
                      />
                      <button
                        onClick={() => removeLab(l.id)}
                        className="inline-flex items-center justify-center h-10 w-10 text-ink-secondary hover:text-status-banned"
                        aria-label="Remove lab"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* Right column: privacy + community sharing */}
          <aside className="lg:sticky lg:top-24 lg:self-start flex flex-col gap-6">
            <div className="glass rounded-card p-7">
              <h2 className="text-subsection">Your data, your machine</h2>
              <p className="mt-3 text-meta text-ink-secondary leading-relaxed">
                Everything you type here is saved only in this browser. Clear
                it any time by removing site data. Nothing leaves your device
                unless you opt in below.
              </p>
              <div className="mt-5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (confirm("Clear all profile data from this browser?")) {
                      setProfile(emptyProfile());
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" /> Clear all data
                </Button>
              </div>
            </div>

            <div className="glass rounded-card p-7">
              <h2 className="text-subsection">Help the next person</h2>
              <p className="mt-3 text-meta text-ink-secondary leading-relaxed">
                The medical books mostly have ranges for "men" and "women" —
                not "person on testosterone for 3 years." Doctors are guessing
                at your normal because nobody collected the data. We can
                change that. If you opt in, your numbers (no name, no face)
                join a growing reference set the Lab Check uses to tell people
                what normal actually looks like.
              </p>
              <label className="mt-5 flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.share_anonymously}
                  onChange={(e) => {
                    update("share_anonymously", e.target.checked);
                    flashSaved();
                  }}
                  className="mt-1 h-4 w-4 rounded border-divider"
                />
                <span className="text-meta text-ink-primary">
                  Share my labs and regimen anonymously to improve the
                  reference data
                </span>
              </label>
            </div>

            <div className="glass rounded-card p-7">
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4 text-ink-secondary" />
                <span className="text-meta text-ink-secondary">
                  Saves automatically as you type.
                </span>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-card p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-subsection">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-meta text-ink-secondary">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-meta uppercase tracking-[0.12em] text-ink-secondary">
      {children}
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  onCommit,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onCommit?: () => void;
  placeholder?: string;
  inputMode?: "text" | "numeric";
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onCommit}
        placeholder={placeholder}
        inputMode={inputMode}
        className="mt-2 w-full rounded-btn border border-divider bg-surface px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-card bg-surface-inset px-5 py-4 text-meta text-ink-secondary">
      {children}
    </div>
  );
}
