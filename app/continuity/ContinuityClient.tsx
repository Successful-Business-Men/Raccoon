"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookmarkPlus,
  Download,
  FileText,
  Info,
  Loader2,
  MapPin,
  RotateCcw,
  Shield,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { cn } from "@/lib/cn";
import { STATE_OPTIONS } from "@/data/care_status";
import { documentsForCareTypes } from "@/data/required_documents";
import {
  PHASE_LABELS,
  PHASE_ORDER,
  flattenPlan,
  itemsByPhase,
  phaseOf,
  topNowItems,
  type ChecklistSectionKey,
  type FlatItem,
} from "@/lib/continuity/phases";
import {
  clearLocal,
  loadLocal,
  saveLocal,
  saveLocalImmediate,
} from "@/lib/continuity/storage";
import type {
  CareType,
  ContinuityIntake,
  ContinuityPlan,
  InsuranceType,
  Phase,
  RiskLevel,
  TelehealthAvailability,
  Timeline,
} from "@/types";
import { supabaseBrowser } from "@/lib/supabase/client";

const CARE_TYPES: Array<{ id: CareType; label: string }> = [
  { id: "hrt", label: "HRT" },
  { id: "surgery_aftercare", label: "Surgery aftercare" },
  { id: "mental_health", label: "Mental health" },
  { id: "primary_care", label: "Primary care" },
  { id: "reproductive_health", label: "Reproductive health" },
  { id: "other", label: "Other" },
];

const INSURANCE_TYPES: Array<{ id: InsuranceType; label: string }> = [
  { id: "employer", label: "Employer" },
  { id: "marketplace", label: "Marketplace (ACA)" },
  { id: "medicaid", label: "Medicaid" },
  { id: "medicare", label: "Medicare" },
  { id: "uninsured", label: "Uninsured" },
  { id: "other", label: "Other" },
];

const TIMELINES: Array<{ id: Timeline; label: string }> = [
  { id: "immediate", label: "Immediate (within 30 days)" },
  { id: "soon", label: "Soon (1–3 months)" },
  { id: "planning", label: "Planning (3–6 months)" },
  { id: "exploring", label: "Exploring (no firm timeline)" },
];

const TELEHEALTH: Array<{ id: TelehealthAvailability; label: string }> = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
  { id: "unsure", label: "Unsure" },
  { id: "na", label: "Not applicable" },
];

const RISK_STYLES: Record<
  RiskLevel,
  { dot: string; bg: string; ring: string; label: string }
> = {
  low: {
    dot: "bg-status-protected",
    bg: "bg-status-protected/10",
    ring: "ring-status-protected/30",
    label: "Low risk",
  },
  moderate: {
    dot: "bg-status-legal",
    bg: "bg-status-legal/15",
    ring: "ring-status-legal/40",
    label: "Moderate risk",
  },
  high: {
    dot: "bg-status-restricted",
    bg: "bg-status-restricted/10",
    ring: "ring-status-restricted/30",
    label: "High risk",
  },
  critical: {
    dot: "bg-status-banned",
    bg: "bg-status-banned/10",
    ring: "ring-status-banned/30",
    label: "Critical risk",
  },
};

const DEFAULT_INTAKE: ContinuityIntake = {
  current_state: "",
  destination_state: "",
  care_types: [],
  insurance_type: "employer",
  timeline: "planning",
  medication_supply_days: undefined,
  telehealth_available: "unsure",
};

export function ContinuityClient() {
  const [intake, setIntake] = useState<ContinuityIntake>(DEFAULT_INTAKE);
  const [plan, setPlan] = useState<ContinuityPlan | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [showRestored, setShowRestored] = useState(false);
  const [panicOpen, setPanicOpen] = useState(false);
  const [savePrompt, setSavePrompt] = useState(false);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    const saved = loadLocal();
    if (saved) {
      setIntake(saved.intake);
      setPlan(saved.plan);
      setChecked(saved.checked);
      if (saved.plan) setShowRestored(true);
    }
    setHydrated(true);
  }, []);

  // Persist on any meaningful change (debounced inside saveLocal).
  useEffect(() => {
    if (!hydrated) return;
    saveLocal({ intake, plan, checked });
  }, [intake, plan, checked, hydrated]);

  // Esc key opens panic confirm (but not when focus is in a form field).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      const isField =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        (e.target as HTMLElement | null)?.isContentEditable;
      if (isField) return;
      if (loadLocal()) setPanicOpen(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function panicClear() {
    clearLocal();
    setIntake(DEFAULT_INTAKE);
    setPlan(null);
    setChecked({});
    setError(null);
    setShowRestored(false);
    setPanicOpen(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!intake.current_state) {
      setError("Please pick your current state.");
      return;
    }
    if (intake.care_types.length === 0) {
      setError("Please choose at least one care type.");
      return;
    }
    setError(null);
    setSubmitting(true);
    setPlan(null);
    setChecked({});
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(intake),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Plan generation failed.");
      }
      const data = (await res.json()) as { plan: ContinuityPlan };
      setPlan(data.plan);
      setShowRestored(false);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container size="plan" className="py-12">
      <header className="mb-8">
        <h1 className="text-section">Plan continuity of care</h1>
        <p className="mt-3 text-ink-secondary leading-relaxed">
          Tell us where you are and what you need. We&apos;ll generate a
          personalized checklist — records, insurance, medication risk, legal —
          with the most urgent steps surfaced first.
        </p>
      </header>

      <div className="rounded-card bg-surface-inset p-5 mb-6 flex gap-3 items-start text-meta text-ink-secondary">
        <Shield className="h-5 w-5 mt-0.5 shrink-0 text-ink-primary" />
        <div>
          <div>
            Your plan lives in <strong className="text-ink-primary">this browser</strong>.
            Seagull never sees it unless you choose to sync. Hit{" "}
            <kbd className="rounded border border-divider bg-surface px-1.5 py-0.5 text-[11px] font-medium">
              Esc
            </kbd>{" "}
            to wipe everything instantly.
          </div>
          <div className="mt-1">
            Seagull does <strong className="text-ink-primary">not</strong>{" "}
            recommend specific providers, bridge medications, or give clinical
            advice. We help you organize your own plan.
          </div>
        </div>
      </div>

      {showRestored && plan && (
        <div className="rounded-btn bg-status-protected/10 border border-status-protected/30 px-4 py-3 mb-6 flex items-center justify-between gap-3 text-meta">
          <span>
            Restored your plan from this browser. Progress and edits saved.
          </span>
          <button
            type="button"
            onClick={() => setShowRestored(false)}
            className="text-ink-secondary hover:text-ink-primary underline-offset-4 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {!plan && (
        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FormCard label="Current state">
              <StateSelect
                value={intake.current_state}
                onChange={(v) => setIntake({ ...intake, current_state: v })}
                placeholder="Select your current state"
              />
            </FormCard>

            <FormCard label="Destination" hint="Optional — pick 'exploring' if undecided.">
              <StateSelect
                value={intake.destination_state || ""}
                onChange={(v) => setIntake({ ...intake, destination_state: v })}
                placeholder="Select destination"
                allowExploring
              />
            </FormCard>
          </div>

          <FormCard label="Current care types" hint="Select all that apply.">
            <div className="flex flex-wrap gap-2">
              {CARE_TYPES.map((c) => {
                const selected = intake.care_types.includes(c.id);
                return (
                  <Pill
                    key={c.id}
                    selected={selected}
                    onClick={() =>
                      setIntake({
                        ...intake,
                        care_types: selected
                          ? intake.care_types.filter((x) => x !== c.id)
                          : [...intake.care_types, c.id],
                      })
                    }
                  >
                    {c.label}
                  </Pill>
                );
              })}
            </div>
          </FormCard>

          <div className="grid gap-6 md:grid-cols-2">
            <FormCard label="Current insurance">
              <RadioGroup
                options={INSURANCE_TYPES}
                value={intake.insurance_type}
                onChange={(v) =>
                  setIntake({ ...intake, insurance_type: v as InsuranceType })
                }
              />
            </FormCard>

            <FormCard label="Timeline">
              <RadioGroup
                options={TIMELINES}
                value={intake.timeline}
                onChange={(v) => setIntake({ ...intake, timeline: v as Timeline })}
              />
            </FormCard>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FormCard label="Medication supply" hint="In days. Leave blank if you don't know.">
              <input
                type="number"
                min={0}
                value={intake.medication_supply_days ?? ""}
                onChange={(e) =>
                  setIntake({
                    ...intake,
                    medication_supply_days: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="w-full rounded-btn border border-divider bg-surface px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="e.g. 60"
              />
            </FormCard>

            <FormCard label="Telehealth across state lines" hint="Will your current provider continue care?">
              <RadioGroup
                options={TELEHEALTH}
                value={intake.telehealth_available}
                onChange={(v) =>
                  setIntake({
                    ...intake,
                    telehealth_available: v as TelehealthAvailability,
                  })
                }
              />
            </FormCard>
          </div>

          {error && (
            <div className="rounded-btn bg-status-banned/10 px-4 py-3 text-meta text-status-banned">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting} size="lg">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                </>
              ) : (
                "Generate my migration plan"
              )}
            </Button>
          </div>
        </form>
      )}

      {plan && (
        <PlanView
          plan={plan}
          intake={intake}
          checked={checked}
          onToggle={(k) => setChecked((c) => ({ ...c, [k]: !c[k] }))}
          onPlanUpdate={(p, i) => {
            setPlan(p);
            if (i) setIntake(i);
            setShowRestored(false);
          }}
          onLetterChange={(letter) =>
            setPlan({
              ...plan,
              records_transfer: { ...plan.records_transfer, template_letter: letter },
            })
          }
          onEdit={() => {
            setPlan(null);
            setChecked({});
          }}
          onOpenSave={() => setSavePrompt(true)}
          onOpenPanic={() => setPanicOpen(true)}
        />
      )}

      {savePrompt && plan && (
        <SaveDialog
          plan={plan}
          intake={intake}
          onClose={() => setSavePrompt(false)}
        />
      )}

      {panicOpen && (
        <PanicConfirm
          onCancel={() => setPanicOpen(false)}
          onConfirm={panicClear}
        />
      )}
    </Container>
  );
}

// ─── Plan view ───────────────────────────────────────────────────────────

function PlanView({
  plan,
  intake,
  checked,
  onToggle,
  onPlanUpdate,
  onLetterChange,
  onEdit,
  onOpenSave,
  onOpenPanic,
}: {
  plan: ContinuityPlan;
  intake: ContinuityIntake;
  checked: Record<string, boolean>;
  onToggle: (key: string) => void;
  onPlanUpdate: (plan: ContinuityPlan, intake?: ContinuityIntake) => void;
  onLetterChange: (letter: string) => void;
  onEdit: () => void;
  onOpenSave: () => void;
  onOpenPanic: () => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [phaseFilter, setPhaseFilter] = useState<"all" | Phase>("all");

  const next3 = useMemo(() => topNowItems(plan, 3), [plan]);
  const byPhase = useMemo(() => itemsByPhase(plan), [plan]);
  const counts = useMemo(() => {
    const c: Record<Phase, number> = {
      now: byPhase.now.length,
      this_week: byPhase.this_week.length,
      this_month: byPhase.this_month.length,
      before_move: byPhase.before_move.length,
    };
    return c;
  }, [byPhase]);

  async function downloadPDF() {
    setDownloading(true);
    try {
      const res = await fetch("/api/continuity/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, intake }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "seagull-continuity-plan.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Couldn't generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <h2 className="text-section">Your migration plan</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={onEdit}>
            Edit answers
          </Button>
          <Button size="sm" onClick={downloadPDF} disabled={downloading}>
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download PDF
          </Button>
          <Button size="sm" variant="secondary" onClick={onOpenSave}>
            <BookmarkPlus className="h-4 w-4" />
            Sync to cloud
          </Button>
          <Button size="sm" variant="ghost" onClick={onOpenPanic}>
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      <RiskHero plan={plan} />

      {next3.length > 0 && (
        <NextThree items={next3} checked={checked} onToggle={onToggle} />
      )}

      <PhaseTabs
        value={phaseFilter}
        onChange={setPhaseFilter}
        counts={counts}
      />

      <Sections
        plan={plan}
        intake={intake}
        phaseFilter={phaseFilter}
        checked={checked}
        onToggle={onToggle}
        onLetterChange={onLetterChange}
      />

      <RefineBox
        intake={intake}
        plan={plan}
        onSuccess={(p, i) => onPlanUpdate(p, i)}
      />
    </div>
  );
}

// ─── Risk hero with shown math ───────────────────────────────────────────

function RiskHero({ plan }: { plan: ContinuityPlan }) {
  const [open, setOpen] = useState(false);
  const risk = plan.medication_gap_risk;
  const styles = RISK_STYLES[risk.level];
  const assessment = risk.assessment;

  return (
    <div
      className={cn(
        "rounded-card p-7 ring-1 transition-colors",
        styles.bg,
        styles.ring
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-meta text-ink-secondary uppercase tracking-wide">
            Medication gap risk
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className={cn("h-3 w-3 rounded-full", styles.dot)} />
            <span className="text-[28px] font-semibold leading-none">
              {styles.label}
            </span>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed max-w-xl">
            {risk.rationale}
          </p>
        </div>
        {assessment && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 text-meta text-ink-secondary hover:text-ink-primary underline-offset-4 hover:underline"
          >
            <Info className="h-3.5 w-3.5" />
            {open ? "Hide the math" : "How was this computed?"}
          </button>
        )}
      </div>

      {assessment && open && (
        <div className="mt-5 rounded-btn bg-surface p-4 text-meta space-y-3">
          <div className="text-ink-secondary">
            Risk is computed from your inputs, <em>not</em> by AI.
          </div>
          <div className="font-mono text-[12px] leading-relaxed text-ink-primary">
            supplyDays:{" "}
            <span className="font-semibold">
              {typeof assessment.inputs.supplyDays === "number"
                ? `${assessment.inputs.supplyDays}d`
                : "unknown"}
            </span>
            {"  ·  "}
            moveWindow:{" "}
            <span className="font-semibold">
              {assessment.inputs.moveWindowDays}d
            </span>
            {"  ·  "}
            telehealth:{" "}
            <span className="font-semibold">
              {assessment.inputs.telehealthCounts ? "yes" : "no"}
            </span>
            {"  ·  "}
            medDependent:{" "}
            <span className="font-semibold">
              {assessment.inputs.medDependentCare ? "yes" : "no"}
            </span>
          </div>
          <ul className="space-y-1.5 list-disc pl-5 text-ink-primary">
            {assessment.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Next 3 Actions hero ─────────────────────────────────────────────────

function NextThree({
  items,
  checked,
  onToggle,
}: {
  items: FlatItem[];
  checked: Record<string, boolean>;
  onToggle: (k: string) => void;
}) {
  return (
    <div className="glass rounded-card p-7 border-l-4 border-accent">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4 text-ink-primary" />
        <h3 className="text-[20px] font-semibold tracking-tight">
          Next {items.length === 1 ? "action" : `${items.length} actions`}
        </h3>
      </div>
      <p className="text-meta text-ink-secondary mb-5">
        If you do nothing else today, do these.
      </p>
      <ul className="space-y-4">
        {items.map((it) => (
          <NextItem
            key={it.key}
            item={it}
            done={!!checked[it.key]}
            onToggle={() => onToggle(it.key)}
          />
        ))}
      </ul>
    </div>
  );
}

function NextItem({
  item,
  done,
  onToggle,
}: {
  item: FlatItem;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left flex gap-3 items-start group"
      >
        <span
          className={cn(
            "mt-1 h-5 w-5 shrink-0 rounded border transition-colors flex items-center justify-center",
            done
              ? "bg-accent border-accent"
              : "border-divider group-hover:border-ink-primary"
          )}
        >
          {done && (
            <svg viewBox="0 0 16 16" className="h-3 w-3 text-white" fill="none">
              <path
                d="M3 8.5l3 3 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className={cn("flex-1", done && "text-ink-secondary line-through")}>
          <span className="flex items-center gap-2">
            <span className="text-[16px] font-semibold">{item.title}</span>
            <span className="rounded-chip bg-surface-inset px-2 py-0.5 text-[11px] text-ink-secondary uppercase tracking-wide">
              {item.sectionLabel}
            </span>
          </span>
          <span className="block text-meta text-ink-secondary mt-1">
            {item.detail}
          </span>
        </span>
      </button>
    </li>
  );
}

// ─── Phase tabs ──────────────────────────────────────────────────────────

function PhaseTabs({
  value,
  onChange,
  counts,
}: {
  value: "all" | Phase;
  onChange: (v: "all" | Phase) => void;
  counts: Record<Phase, number>;
}) {
  const total =
    counts.now + counts.this_week + counts.this_month + counts.before_move;
  const tabs: Array<{ id: "all" | Phase; label: string; count: number }> = [
    { id: "all", label: "All", count: total },
    ...PHASE_ORDER.map((p) => ({
      id: p,
      label: PHASE_LABELS[p],
      count: counts[p],
    })),
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            "inline-flex items-center gap-2 rounded-chip px-3 py-1.5 text-meta transition-colors",
            value === t.id
              ? "bg-accent text-white"
              : "bg-surface-inset text-ink-primary hover:bg-[#F0F0F2]"
          )}
        >
          <span>{t.label}</span>
          <span
            className={cn(
              "rounded-full px-1.5 text-[11px]",
              value === t.id ? "bg-white/20" : "bg-surface text-ink-secondary"
            )}
          >
            {t.count}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Sections (filterable by phase) ──────────────────────────────────────

function Sections({
  plan,
  intake,
  phaseFilter,
  checked,
  onToggle,
  onLetterChange,
}: {
  plan: ContinuityPlan;
  intake: ContinuityIntake;
  phaseFilter: "all" | Phase;
  checked: Record<string, boolean>;
  onToggle: (key: string) => void;
  onLetterChange: (letter: string) => void;
}) {
  const all = useMemo(() => flattenPlan(plan), [plan]);

  function filterFor(section: ChecklistSectionKey): FlatItem[] {
    return all
      .filter((i) => i.section === section)
      .filter((i) => phaseFilter === "all" || phaseOf(i) === phaseFilter);
  }

  const sections = [
    {
      key: "records_transfer" as const,
      title: "1. Records transfer",
      body: (
        <>
          <FilteredChecklist
            items={filterFor("records_transfer")}
            checked={checked}
            onToggle={onToggle}
          />
          {phaseFilter === "all" && (
            <div className="mt-6">
              <div className="text-[15px] font-medium mb-2">Template letter</div>
              <textarea
                value={plan.records_transfer.template_letter}
                onChange={(e) => onLetterChange(e.target.value)}
                rows={8}
                className="w-full rounded-btn border border-divider bg-surface p-4 text-[14px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/30 font-mono"
              />
            </div>
          )}
        </>
      ),
    },
    {
      key: "insurance_continuity" as const,
      title: "2. Insurance continuity",
      body: (
        <>
          <FilteredChecklist
            items={filterFor("insurance_continuity")}
            checked={checked}
            onToggle={onToggle}
          />
          {phaseFilter === "all" && (
            <>
              <p className="mt-4 text-meta text-ink-secondary leading-relaxed">
                {plan.insurance_continuity.state_notes}
              </p>
              {intake.destination_state &&
                intake.destination_state !== "exploring" && (
                  <Link
                    href={`/map?state=${intake.destination_state}`}
                    className="mt-4 inline-flex items-center gap-2 text-meta text-ink-primary underline-offset-4 hover:underline"
                  >
                    <MapPin className="h-4 w-4" />
                    Check {intake.destination_state}&apos;s current care status
                  </Link>
                )}
            </>
          )}
        </>
      ),
    },
    {
      key: "medication_gap_risk" as const,
      title: "3. Medication gap items",
      body: (
        <FilteredChecklist
          items={filterFor("medication_gap_risk")}
          checked={checked}
          onToggle={onToggle}
        />
      ),
    },
    {
      key: "finding_new_care" as const,
      title: "5. Finding new care",
      body: (
        <>
          {phaseFilter === "all" && (
            <>
              <div className="text-[15px] font-medium mb-2">Questions to ask</div>
              <ul className="list-disc pl-5 space-y-1.5 mb-4 text-ink-primary">
                {plan.finding_new_care.questions_to_ask.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
              <div className="text-[15px] font-medium mb-2">Red flags</div>
              <ul className="list-disc pl-5 space-y-1.5 mb-4 text-ink-primary">
                {plan.finding_new_care.red_flags.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </>
          )}
          <FilteredChecklist
            items={filterFor("finding_new_care")}
            checked={checked}
            onToggle={onToggle}
          />
        </>
      ),
    },
    {
      key: "legal_and_id" as const,
      title: "6. Legal and ID",
      body: (
        <FilteredChecklist
          items={filterFor("legal_and_id")}
          checked={checked}
          onToggle={onToggle}
        />
      ),
    },
  ];

  // Documents section slots between "3. Medication gap items" (sections[2])
  // and "5. Finding new care". Always renders in the "all" view as reference
  // material; hidden when filtering by phase (the phase tabs are for
  // time-sensitive checklist items, not static docs).
  const docsSlotIndex = sections.findIndex((s) => s.key === "finding_new_care");

  return (
    <div className="space-y-8">
      {sections.map((s, i) => {
        const items = filterFor(s.key);
        const node =
          phaseFilter !== "all" && items.length === 0 ? null : (
            <PlanSection title={s.title}>{s.body}</PlanSection>
          );
        const docsHere =
          i === docsSlotIndex && phaseFilter === "all" ? (
            <DocumentsSection careTypes={intake.care_types} />
          ) : null;
        return (
          <Fragment key={s.key}>
            {docsHere}
            {node}
          </Fragment>
        );
      })}

      {phaseFilter === "all" && (
        <PlanSection title="7. Community resources">
          <div className="space-y-4">
            {plan.community_resources.items.map((r, i) => (
              <div key={i} className="rounded-btn bg-surface-inset p-4">
                <div className="font-medium">{r.name}</div>
                {r.note && (
                  <div className="text-meta text-ink-secondary mt-1">{r.note}</div>
                )}
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-meta text-ink-primary underline-offset-4 hover:underline mt-1 inline-block"
                >
                  {r.url}
                </a>
              </div>
            ))}
          </div>
        </PlanSection>
      )}
    </div>
  );
}

function FilteredChecklist({
  items,
  checked,
  onToggle,
}: {
  items: FlatItem[];
  checked: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="text-meta text-ink-secondary italic">
        No items in this phase for this section.
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {items.map((it) => {
        const isDone = !!checked[it.key];
        return (
          <li key={it.key}>
            <button
              type="button"
              onClick={() => onToggle(it.key)}
              className="w-full text-left flex gap-3 items-start group"
            >
              <span
                className={cn(
                  "mt-1 h-5 w-5 shrink-0 rounded border transition-colors flex items-center justify-center",
                  isDone
                    ? "bg-accent border-accent"
                    : "border-divider group-hover:border-ink-primary"
                )}
              >
                {isDone && (
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3 w-3 text-white"
                    fill="none"
                  >
                    <path
                      d="M3 8.5l3 3 7-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span
                className={cn(
                  "flex-1",
                  isDone && "text-ink-secondary line-through"
                )}
              >
                <span className="flex items-center gap-2 flex-wrap">
                  <span className="text-[15px] font-medium">{it.title}</span>
                  <PhaseChip phase={phaseOf(it)} />
                </span>
                <span className="block text-meta text-ink-secondary mt-0.5">
                  {it.detail}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function PhaseChip({ phase }: { phase: Phase }) {
  const tone: Record<Phase, string> = {
    now: "bg-status-banned/10 text-status-banned",
    this_week: "bg-status-restricted/10 text-status-restricted",
    this_month: "bg-status-legal/15 text-ink-primary",
    before_move: "bg-surface-inset text-ink-secondary",
  };
  return (
    <span
      className={cn(
        "rounded-chip px-2 py-0.5 text-[11px] uppercase tracking-wide",
        tone[phase]
      )}
    >
      {PHASE_LABELS[phase]}
    </span>
  );
}

function PlanSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-card p-7">
      <h3 className="text-[20px] font-semibold tracking-tight mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ─── Refinement box ──────────────────────────────────────────────────────

function RefineBox({
  intake,
  plan,
  onSuccess,
}: {
  intake: ContinuityIntake;
  plan: ContinuityPlan;
  onSuccess: (plan: ContinuityPlan, intake?: ContinuityIntake) => void;
}) {
  const [delta, setDelta] = useState("");
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<string[]>([]);
  const previousPlanRef = useRef<ContinuityPlan | null>(null);

  async function refine() {
    if (!delta.trim()) return;
    setError(null);
    setRefining(true);
    previousPlanRef.current = plan;
    try {
      const res = await fetch("/api/continuity/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intake, plan, delta }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Refinement failed.");
      }
      const data = (await res.json()) as {
        plan: ContinuityPlan;
        intake: ContinuityIntake;
        applied: string[];
      };
      setApplied(data.applied || []);
      onSuccess(data.plan, data.intake);
      setDelta("");
    } catch (e: any) {
      setError(e?.message || "Refinement failed.");
    } finally {
      setRefining(false);
    }
  }

  function revert() {
    if (previousPlanRef.current) {
      onSuccess(previousPlanRef.current);
      previousPlanRef.current = null;
      setApplied([]);
    }
  }

  return (
    <div className="rounded-card bg-surface-inset p-6 border border-divider">
      <div className="flex items-center gap-2 mb-1">
        <RotateCcw className="h-4 w-4 text-ink-primary" />
        <h3 className="text-[18px] font-semibold tracking-tight">
          Update my plan
        </h3>
      </div>
      <p className="text-meta text-ink-secondary mb-4">
        Situation changed? Type the update — e.g.{" "}
        <em>&quot;My move is now in 2 weeks not 3 months&quot;</em>,{" "}
        <em>&quot;I got 90 days of supply&quot;</em>,{" "}
        <em>&quot;I lost my insurance&quot;</em>.
      </p>
      <textarea
        value={delta}
        onChange={(e) => setDelta(e.target.value)}
        rows={3}
        placeholder="Describe what changed…"
        className="w-full rounded-btn border border-divider bg-surface p-4 text-[15px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
      {applied.length > 0 && (
        <div className="mt-3 text-meta text-ink-secondary">
          Applied automatically: {applied.join("; ")}.{" "}
          {previousPlanRef.current && (
            <button
              type="button"
              onClick={revert}
              className="text-ink-primary underline-offset-4 hover:underline"
            >
              Use previous version
            </button>
          )}
        </div>
      )}
      {error && (
        <div className="mt-3 rounded-btn bg-status-banned/10 px-4 py-2 text-meta text-status-banned">
          {error}
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <Button
          size="sm"
          onClick={refine}
          disabled={refining || !delta.trim()}
        >
          {refining ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Updating…
            </>
          ) : (
            "Update my plan"
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Panic clear confirm ─────────────────────────────────────────────────

function PanicConfirm({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="glass rounded-card p-7 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-2">
          <Trash2 className="h-5 w-5 text-status-banned" />
          <h3 className="text-[18px] font-semibold tracking-tight">
            Clear everything?
          </h3>
        </div>
        <p className="text-meta text-ink-secondary leading-relaxed">
          Your plan, intake, and progress will be erased from this browser. This
          can&apos;t be undone — but if you&apos;ve synced to cloud, your saved
          copy stays safe.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={onConfirm}>
            <Trash2 className="h-4 w-4" />
            Clear everything
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Form primitives (unchanged from prior version) ──────────────────────

function FormCard({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-card p-7">
      <div className="text-[16px] font-medium">{label}</div>
      {hint && <div className="text-meta text-ink-secondary mt-1">{hint}</div>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function StateSelect({
  value,
  onChange,
  placeholder,
  allowExploring = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  allowExploring?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-btn border border-divider bg-surface px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-accent/30"
    >
      <option value="">{placeholder || "Select"}</option>
      {allowExploring && (
        <option value="exploring">Exploring (no specific state)</option>
      )}
      {STATE_OPTIONS.map((s) => (
        <option key={s.code} value={s.code}>
          {s.name}
        </option>
      ))}
    </select>
  );
}

function RadioGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ id: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-2">
      {options.map((o) => (
        <label
          key={o.id}
          className={cn(
            "flex items-center gap-3 rounded-btn px-4 py-3 border cursor-pointer transition-colors",
            value === o.id
              ? "bg-surface-inset border-accent/30"
              : "bg-surface border-divider hover:bg-surface-inset"
          )}
        >
          <input
            type="radio"
            checked={value === o.id}
            onChange={() => onChange(o.id)}
            className="h-4 w-4 accent-accent"
          />
          <span className="text-[15px]">{o.label}</span>
        </label>
      ))}
    </div>
  );
}

// ─── Documents to bring ──────────────────────────────────────────────────

function DocumentsSection({ careTypes }: { careTypes: CareType[] }) {
  const groups = documentsForCareTypes(careTypes);
  if (groups.length === 0) return null;
  return (
    <PlanSection title="4. Documents to bring">
      <p className="text-meta text-ink-secondary leading-relaxed mb-5">
        Exactly what to walk into the pharmacy or your new clinic with. Static
        reference — verify locally before relying on it.
      </p>
      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g.care_type}>
            <div className="text-[15px] font-semibold tracking-tight">
              {g.label}
            </div>
            {g.intro && (
              <p className="text-meta text-ink-secondary mt-1 leading-relaxed">
                {g.intro}
              </p>
            )}
            <ul className="mt-3 space-y-3">
              {g.documents.map((d, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span
                    className={cn(
                      "mt-0.5 h-5 w-5 shrink-0 rounded flex items-center justify-center",
                      d.flag === "critical"
                        ? "bg-status-banned/15 text-status-banned"
                        : d.flag === "controlled_substance"
                        ? "bg-status-restricted/15 text-status-restricted"
                        : "bg-surface-inset text-ink-secondary"
                    )}
                  >
                    {d.flag ? (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    ) : (
                      <FileText className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[15px] font-medium">
                      {d.title}
                    </span>
                    <span className="block text-meta text-ink-secondary mt-0.5 leading-relaxed">
                      {d.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PlanSection>
  );
}

// ─── Save / cloud sync dialog ────────────────────────────────────────────

function SaveDialog({
  plan,
  intake,
  onClose,
}: {
  plan: ContinuityPlan;
  intake: ContinuityIntake;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setError(null);
    setSending(true);
    try {
      const supabase = supabaseBrowser();
      if (!supabase) {
        throw new Error(
          "Sign-in isn't configured yet. You can still download the PDF."
        );
      }
      saveLocalImmediate({ intake, plan, checked: {} });
      window.localStorage.setItem(
        "seagull_pending_plan",
        JSON.stringify({ plan, intake })
      );
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/continuity`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      setError(e?.message || "Couldn't send magic link.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        className="glass rounded-card p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[20px] font-semibold tracking-tight">
          Sync to cloud
        </h3>
        <p className="text-meta text-ink-secondary mt-2">
          Encrypted backup so you can pick up this plan on another device.
          We&apos;ll email a magic link. Your local copy stays even if you
          don&apos;t sync.
        </p>
        {sent ? (
          <p className="mt-6 text-[15px]">
            Check your email for a sign-in link. You can close this dialog.
          </p>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-4 w-full rounded-btn border border-divider bg-surface px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            {error && (
              <div className="mt-3 text-meta text-status-banned">{error}</div>
            )}
          </>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          {!sent && (
            <Button
              size="sm"
              onClick={send}
              disabled={sending || !email.includes("@")}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Send link
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
