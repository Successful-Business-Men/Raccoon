"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save, ShieldCheck, Sparkles, ChevronDown, Loader2, Wand2 } from "lucide-react";
import { Container } from "@/components/Container";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { cn } from "@/lib/cn";
import {
  emptyProfile,
  loadProfile,
  newId,
  saveProfile,
  type LabValue,
  type Medication,
  type Profile,
  type Surgery,
} from "@/lib/profile";

export function PlacesClient() {
  const [profile, setProfile] = useState<Profile>(emptyProfile());
  const [loaded, setLoaded] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    setAboutOpen(Boolean(p.display_name || p.pronouns || p.age || p.sex_assigned_at_birth));
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
      medications: [...p.medications, { id: newId(), description: "" }],
    }));
  }
  function updateMed(id: string, description: string) {
    setProfile((p) => ({
      ...p,
      medications: p.medications.map((m) => (m.id === id ? { ...m, description } : m)),
    }));
  }
  function removeMed(id: string) {
    setProfile((p) => ({ ...p, medications: p.medications.filter((m) => m.id !== id) }));
  }

  function addSurgery() {
    setProfile((p) => ({
      ...p,
      surgeries: [...p.surgeries, { id: newId(), description: "", date: "" }],
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

  function applySmartFill(result: {
    regimen_summary: string;
    medications: Array<{ description: string }>;
    surgeries: Array<{ description: string; date: string }>;
  }) {
    setProfile((p) => ({
      ...p,
      hormone_regimen_summary: result.regimen_summary || p.hormone_regimen_summary,
      medications: [
        ...p.medications,
        ...result.medications.map((m) => ({ id: newId(), description: m.description })),
      ],
      surgeries: [
        ...p.surgeries,
        ...result.surgeries.map((s) => ({ id: newId(), description: s.description, date: s.date })),
      ],
    }));
    flashSaved();
  }

  return (
    <div className="page-ocean">
      <PageHero
        eyebrow="Your profile"
        title="Type it once. Use it everywhere."
        description="The Pre-visit Card and Lab Check both read from this. Lives in your browser. Never sent to a server unless you opt in below."
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
          <div className="flex flex-col gap-6">
            <SmartFill onApply={applySmartFill} />

            <Section
              title="Medications"
              subtitle="One line each. Don't worry about formatting — write it like you'd tell a friend."
              action={
                <Button size="sm" variant="secondary" onClick={addMed}>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              }
            >
              {profile.medications.length === 0 ? (
                <EmptyHint>
                  No medications yet. Use "Smart fill" above, or click "Add".
                </EmptyHint>
              ) : (
                <div className="space-y-2">
                  {profile.medications.map((m) => (
                    <MedRow
                      key={m.id}
                      med={m}
                      onChange={(v) => updateMed(m.id, v)}
                      onCommit={flashSaved}
                      onRemove={() => removeMed(m.id)}
                    />
                  ))}
                </div>
              )}
            </Section>

            <Section
              title="Surgical history"
              subtitle="Past gender-affirming procedures, or anything else relevant."
              action={
                <Button size="sm" variant="secondary" onClick={addSurgery}>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              }
            >
              {profile.surgeries.length === 0 ? (
                <EmptyHint>No surgeries logged.</EmptyHint>
              ) : (
                <div className="space-y-2">
                  {profile.surgeries.map((s) => (
                    <SurgeryRow
                      key={s.id}
                      surgery={s}
                      onChange={(patch) => updateSurgery(s.id, patch)}
                      onCommit={flashSaved}
                      onRemove={() => removeSurgery(s.id)}
                    />
                  ))}
                </div>
              )}
            </Section>

            <Section
              title="Recent labs"
              subtitle="Optional. Adds context when a new number looks off."
              action={
                <Button size="sm" variant="secondary" onClick={addLab}>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              }
            >
              {profile.recent_labs.length === 0 ? (
                <EmptyHint>
                  No labs logged. You can also just upload a blood-work PDF in Lab Check.
                </EmptyHint>
              ) : (
                <div className="space-y-2">
                  {profile.recent_labs.map((l) => (
                    <LabRow
                      key={l.id}
                      lab={l}
                      onChange={(patch) => updateLab(l.id, patch)}
                      onCommit={flashSaved}
                      onRemove={() => removeLab(l.id)}
                    />
                  ))}
                </div>
              )}
            </Section>

            <Disclosure
              open={aboutOpen}
              onToggle={() => setAboutOpen((v) => !v)}
              label="About you (optional)"
              hint="Only used to personalize the visit card."
            >
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
            </Disclosure>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start flex flex-col gap-6">
            <div className="glass rounded-card p-7">
              <h2 className="text-subsection">Your data, your machine</h2>
              <p className="mt-3 text-meta text-ink-secondary leading-relaxed">
                Everything you type is saved only in this browser. The smart-fill
                feature sends just the text you paste to Claude and nothing else.
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
                Medical books mostly have ranges for "men" and "women" — not
                "person on estradiol for 4 years." Opt in and your numbers (no
                name, no face) join a reference set the Lab Check uses to tell
                people what normal actually looks like.
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
                  Share my labs and regimen anonymously
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

function SmartFill({
  onApply,
}: {
  onApply: (r: {
    regimen_summary: string;
    medications: Array<{ description: string }>;
    surgeries: Array<{ description: string; date: string }>;
  }) => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    if (!text.trim() || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/profile/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        setErr(data?.error || "Couldn't parse that.");
      } else {
        onApply(data);
        setText("");
      }
    } catch (e: any) {
      setErr(e?.message || "Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass rounded-card p-7">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-accent" />
        <h2 className="text-subsection">Smart fill</h2>
      </div>
      <p className="mt-2 text-meta text-ink-secondary leading-relaxed">
        Describe your regimen and history in a sentence or two. We'll fill in
        the structured fields below so you don't have to.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="e.g. I'm on estradiol valerate 4mg IM weekly and spiro 100mg twice daily, started July 2022. Had top surgery in March 2024."
        className="mt-4 w-full rounded-btn border border-divider bg-surface px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-meta text-ink-secondary">
          Adds to your profile — doesn't replace anything you already typed.
        </span>
        <Button onClick={run} disabled={!text.trim() || busy}>
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Parsing…
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" /> Fill from this
            </>
          )}
        </Button>
      </div>
      {err && (
        <div className="mt-3 text-meta text-status-banned">{err}</div>
      )}
    </div>
  );
}

function MedRow({
  med,
  onChange,
  onCommit,
  onRemove,
}: {
  med: Medication;
  onChange: (v: string) => void;
  onCommit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-btn border border-divider bg-surface px-3 py-2">
      <input
        value={med.description}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onCommit}
        placeholder="e.g. Estradiol 4 mg IM weekly since Jan 2022"
        className="flex-1 bg-transparent text-body focus:outline-none"
      />
      <button
        onClick={onRemove}
        className="text-ink-secondary hover:text-status-banned p-1"
        aria-label="Remove medication"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function SurgeryRow({
  surgery,
  onChange,
  onCommit,
  onRemove,
}: {
  surgery: Surgery;
  onChange: (patch: Partial<Surgery>) => void;
  onCommit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-btn border border-divider bg-surface px-3 py-2">
      <input
        value={surgery.description}
        onChange={(e) => onChange({ description: e.target.value })}
        onBlur={onCommit}
        placeholder="e.g. Top surgery"
        className="flex-[2] bg-transparent text-body focus:outline-none"
      />
      <input
        value={surgery.date}
        onChange={(e) => onChange({ date: e.target.value })}
        onBlur={onCommit}
        placeholder="2024-03"
        className="flex-[1] min-w-0 bg-transparent text-body text-ink-secondary focus:outline-none border-l border-divider pl-2"
      />
      <button
        onClick={onRemove}
        className="text-ink-secondary hover:text-status-banned p-1"
        aria-label="Remove surgery"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function LabRow({
  lab,
  onChange,
  onCommit,
  onRemove,
}: {
  lab: LabValue;
  onChange: (patch: Partial<LabValue>) => void;
  onCommit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-2 rounded-btn border border-divider bg-surface px-3 py-2">
      <input
        value={lab.name}
        onChange={(e) => onChange({ name: e.target.value })}
        onBlur={onCommit}
        placeholder="Test"
        className="bg-transparent text-body focus:outline-none"
      />
      <input
        value={lab.value}
        onChange={(e) => onChange({ value: e.target.value })}
        onBlur={onCommit}
        placeholder="Value"
        className="bg-transparent text-body focus:outline-none border-l border-divider pl-2"
      />
      <input
        value={lab.unit}
        onChange={(e) => onChange({ unit: e.target.value })}
        onBlur={onCommit}
        placeholder="Unit"
        className="bg-transparent text-body focus:outline-none border-l border-divider pl-2"
      />
      <input
        value={lab.date}
        onChange={(e) => onChange({ date: e.target.value })}
        onBlur={onCommit}
        placeholder="Date"
        className="bg-transparent text-body text-ink-secondary focus:outline-none border-l border-divider pl-2"
      />
      <button
        onClick={onRemove}
        className="text-ink-secondary hover:text-status-banned p-1"
        aria-label="Remove lab"
      >
        <Trash2 className="h-4 w-4" />
      </button>
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

function Disclosure({
  open,
  onToggle,
  label,
  hint,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-7 py-5 hover:bg-surface-inset/40 transition-colors text-left"
      >
        <div>
          <div className="text-subsection text-ink-primary">{label}</div>
          {hint && <div className="mt-0.5 text-meta text-ink-secondary">{hint}</div>}
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-ink-secondary transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="border-t divider-soft px-7 py-6">{children}</div>}
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
