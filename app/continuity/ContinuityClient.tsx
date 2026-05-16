"use client";

import { useState } from "react";
import { Loader2, Download, BookmarkPlus, Shield } from "lucide-react";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { cn } from "@/lib/cn";
import { STATE_OPTIONS } from "@/data/care_status";
import type {
  CareType,
  ContinuityIntake,
  ContinuityPlan,
  InsuranceType,
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

const RISK_STYLES: Record<RiskLevel, { dot: string; label: string }> = {
  low: { dot: "bg-status-protected", label: "Low risk" },
  moderate: { dot: "bg-status-legal", label: "Moderate risk" },
  high: { dot: "bg-status-restricted", label: "High risk" },
  critical: { dot: "bg-status-banned", label: "Critical risk" },
};

export function ContinuityClient() {
  const [intake, setIntake] = useState<ContinuityIntake>({
    current_state: "",
    destination_state: "",
    care_types: [],
    insurance_type: "employer",
    timeline: "planning",
    medication_supply_days: undefined,
    telehealth_available: "unsure",
  });
  const [plan, setPlan] = useState<ContinuityPlan | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container size="plan" className="py-12">
      <header className="mb-10">
        <h1 className="text-section">Plan continuity of care</h1>
        <p className="mt-3 text-ink-secondary leading-relaxed">
          Tell us where you are and what you need. We&apos;ll generate a
          personalized checklist for records, insurance, medication risk, and
          legal steps.
        </p>
      </header>

      <div className="rounded-card bg-surface-inset p-5 mb-10 flex gap-3 items-start text-meta text-ink-secondary">
        <Shield className="h-5 w-5 mt-0.5 shrink-0 text-ink-primary" />
        <div>
          Seagull does <strong className="text-ink-primary">not</strong> recommend
          specific providers, does not bridge medications, and does not give
          clinical advice. We help you organize your own plan.
        </div>
      </div>

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
            <FormCard label="Medication supply" hint="In days. Optional.">
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

      {plan && <PlanView plan={plan} intake={intake} onEdit={() => setPlan(null)} />}
    </Container>
  );
}

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
    <div className="rounded-card bg-surface shadow-card p-7">
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
      {allowExploring && <option value="exploring">Exploring (no specific state)</option>}
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

function PlanView({
  plan,
  intake,
  onEdit,
}: {
  plan: ContinuityPlan;
  intake: ContinuityIntake;
  onEdit: () => void;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [letter, setLetter] = useState(plan.records_transfer.template_letter);
  const [downloading, setDownloading] = useState(false);
  const [savePrompt, setSavePrompt] = useState(false);

  function toggle(key: string) {
    setChecked((c) => ({ ...c, [key]: !c[key] }));
  }

  async function downloadPDF() {
    setDownloading(true);
    try {
      const planForPDF: ContinuityPlan = {
        ...plan,
        records_transfer: { ...plan.records_transfer, template_letter: letter },
      };
      const res = await fetch("/api/continuity/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planForPDF, intake }),
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
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download PDF
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setSavePrompt(true)}>
            <BookmarkPlus className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <PlanSection title="1. Records transfer">
        <Checklist
          items={plan.records_transfer.items}
          prefix="records"
          checked={checked}
          onToggle={toggle}
        />
        <div className="mt-6">
          <div className="text-[15px] font-medium mb-2">Template letter</div>
          <textarea
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            rows={8}
            className="w-full rounded-btn border border-divider bg-surface p-4 text-[14px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/30 font-mono"
          />
        </div>
      </PlanSection>

      <PlanSection title="2. Insurance continuity">
        <Checklist
          items={plan.insurance_continuity.items}
          prefix="insurance"
          checked={checked}
          onToggle={toggle}
        />
        <p className="mt-4 text-meta text-ink-secondary leading-relaxed">
          {plan.insurance_continuity.state_notes}
        </p>
      </PlanSection>

      <PlanSection title="3. Medication gap risk">
        <div className="flex items-center gap-3 mb-3">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-chip px-3 py-1.5 text-meta",
              "bg-surface-inset"
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                RISK_STYLES[plan.medication_gap_risk.level].dot
              )}
            />
            {RISK_STYLES[plan.medication_gap_risk.level].label}
          </span>
        </div>
        <p className="text-[15px] text-ink-primary leading-relaxed mb-4">
          {plan.medication_gap_risk.rationale}
        </p>
        <Checklist
          items={plan.medication_gap_risk.items}
          prefix="meds"
          checked={checked}
          onToggle={toggle}
        />
      </PlanSection>

      <PlanSection title="4. Finding new care">
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
        <Checklist
          items={plan.finding_new_care.items}
          prefix="find"
          checked={checked}
          onToggle={toggle}
        />
      </PlanSection>

      <PlanSection title="5. Legal and ID">
        <Checklist
          items={plan.legal_and_id.items}
          prefix="legal"
          checked={checked}
          onToggle={toggle}
        />
      </PlanSection>

      <PlanSection title="6. Community resources">
        <div className="space-y-4">
          {plan.community_resources.items.map((r, i) => (
            <div key={i} className="rounded-btn bg-surface-inset p-4">
              <div className="font-medium">{r.name}</div>
              {r.note && <div className="text-meta text-ink-secondary mt-1">{r.note}</div>}
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

      {savePrompt && <SaveDialog plan={plan} intake={intake} onClose={() => setSavePrompt(false)} />}
    </div>
  );
}

function PlanSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card bg-surface shadow-card p-7">
      <h3 className="text-[20px] font-semibold tracking-tight mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Checklist({
  items,
  prefix,
  checked,
  onToggle,
}: {
  items: Array<{ title: string; detail: string }>;
  prefix: string;
  checked: Record<string, boolean>;
  onToggle: (k: string) => void;
}) {
  return (
    <ul className="space-y-3">
      {items.map((it, i) => {
        const key = `${prefix}:${i}`;
        const isDone = !!checked[key];
        return (
          <li key={key}>
            <button
              type="button"
              onClick={() => onToggle(key)}
              className="w-full text-left flex gap-3 items-start group"
            >
              <span
                className={cn(
                  "mt-1 h-5 w-5 shrink-0 rounded border transition-colors flex items-center justify-center",
                  isDone ? "bg-accent border-accent" : "border-divider group-hover:border-ink-primary"
                )}
              >
                {isDone && (
                  <svg viewBox="0 0 16 16" className="h-3 w-3 text-white" fill="none">
                    <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className={cn("flex-1", isDone && "text-ink-secondary line-through")}>
                <span className="block text-[15px] font-medium">{it.title}</span>
                <span className="block text-meta text-ink-secondary mt-0.5">{it.detail}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

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
      // Stash the plan locally so the post-magic-link page can pick it up.
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-surface rounded-card shadow-card p-8 max-w-md w-full">
        <h3 className="text-[20px] font-semibold tracking-tight">Save your plan</h3>
        <p className="text-meta text-ink-secondary mt-2">
          We&apos;ll email a magic link. Your plan is stored encrypted at rest and only
          accessible to you.
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
            {error && <div className="mt-3 text-meta text-status-banned">{error}</div>}
          </>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          {!sent && (
            <Button size="sm" onClick={send} disabled={sending || !email.includes("@")}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Send link
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
