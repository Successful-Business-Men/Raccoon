"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Loader2,
  AlertTriangle,
  Users,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/Container";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { cn } from "@/lib/cn";
import { emptyProfile, loadProfile, type Profile } from "@/lib/profile";

type Verdict =
  | "likely_normal_for_regimen"
  | "borderline_ask_doctor"
  | "outside_hrt_explanation";

interface LabInterpretation {
  verdict: Verdict;
  headline: string;
  explanation: string;
  ask_doctor_about: string;
}

const COMMON_LABS = [
  { name: "Hematocrit", unit: "%" },
  { name: "Hemoglobin", unit: "g/dL" },
  { name: "Estradiol", unit: "pg/mL" },
  { name: "Testosterone (total)", unit: "ng/dL" },
  { name: "Prolactin", unit: "ng/mL" },
  { name: "ALT", unit: "U/L" },
  { name: "Creatinine", unit: "mg/dL" },
  { name: "Potassium", unit: "mEq/L" },
  { name: "TSH", unit: "mIU/L" },
];

export function ContinuityClient() {
  const [profile, setProfile] = useState<Profile>(emptyProfile());
  const [loaded, setLoaded] = useState(false);
  const [labName, setLabName] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<LabInterpretation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProfile(loadProfile());
    setLoaded(true);
  }, []);

  const hasProfile =
    profile.medications.length > 0 || profile.hormone_regimen_summary.length > 0;

  async function check() {
    if (!labName.trim() || !value.trim() || busy) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/labs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lab_name: labName.trim(),
          value: value.trim(),
          unit: unit.trim(),
          profile: {
            medications: profile.medications,
            surgeries: profile.surgeries,
            hormone_regimen_summary: profile.hormone_regimen_summary,
            sex_assigned_at_birth: profile.sex_assigned_at_birth,
            age: profile.age,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Couldn't get an answer right now.");
      } else {
        setResult(data as LabInterpretation);
      }
    } catch (e: any) {
      setError(e?.message || "Network error.");
    } finally {
      setBusy(false);
    }
  }

  function pickLab(l: { name: string; unit: string }) {
    setLabName(l.name);
    setUnit(l.unit);
    setResult(null);
    setError(null);
  }

  return (
    <div className="page-ocean">
      <PageHero
        eyebrow="Lab check"
        title="A weird number isn't always a problem."
        description="Type in a blood test value. We'll tell you if it's expected for someone on your hormones, or if it's worth flagging to your doctor. Not medical advice — just translation."
      />

      <Container className="pb-16">
        <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
          {/* Left: input */}
          <div className="flex flex-col gap-6">
            {!loaded ? null : !hasProfile && (
              <div className="glass rounded-card p-6 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-status-restricted" />
                <div className="text-meta text-ink-secondary leading-relaxed">
                  <span className="text-ink-primary font-bold">
                    Heads up — we don't know your regimen yet.
                  </span>{" "}
                  We'll still answer, but it'll be generic. Add your hormones
                  on the <Link href="/places" className="underline">profile page</Link>{" "}
                  for a tailored read.
                </div>
              </div>
            )}

            <div className="glass rounded-card p-7">
              <h2 className="text-subsection">Common tests</h2>
              <p className="mt-1 text-meta text-ink-secondary">
                Pick one to autofill, or type your own.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {COMMON_LABS.map((l) => (
                  <Pill
                    key={l.name}
                    selected={labName === l.name}
                    onClick={() => pickLab(l)}
                  >
                    {l.name}
                  </Pill>
                ))}
              </div>
            </div>

            <div className="glass rounded-card p-7">
              <h2 className="text-subsection">Your result</h2>
              <div className="mt-5 grid sm:grid-cols-[2fr_1fr_1fr] gap-3">
                <Field label="Test name">
                  <input
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    placeholder="Hematocrit, estradiol, …"
                    className="w-full rounded-btn border border-divider bg-surface px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </Field>
                <Field label="Value">
                  <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="52.4"
                    inputMode="decimal"
                    className="w-full rounded-btn border border-divider bg-surface px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </Field>
                <Field label="Unit">
                  <input
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="%, pg/mL"
                    className="w-full rounded-btn border border-divider bg-surface px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </Field>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="text-meta text-ink-secondary">
                  Reads your stored regimen — never leaves the request.
                </div>
                <Button
                  onClick={check}
                  disabled={!labName.trim() || !value.trim() || busy}
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Checking…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Check this value
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <div className="mt-5 rounded-card bg-status-banned/10 px-4 py-3 text-meta text-status-banned">
                  {error}
                </div>
              )}

              {result && <ResultCard result={result} />}
            </div>
          </div>

          {/* Right: community context */}
          <aside className="lg:sticky lg:top-24 lg:self-start flex flex-col gap-6">
            <div className="glass rounded-card p-7">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-ink-primary" />
                <h2 className="text-subsection">The missing book</h2>
              </div>
              <p className="mt-3 text-meta text-ink-secondary leading-relaxed">
                Medical textbooks have ranges for "men" and "women" — not
                "person on estradiol for 4 years." Doctors are guessing at
                your normal because nobody collected the data.
              </p>
              <p className="mt-3 text-meta text-ink-secondary leading-relaxed">
                Every person who opts in on their profile drops one
                anonymous puzzle piece into the box. The interpretations
                here get sharper as that pile grows. The book that should
                exist — you're helping build it.
              </p>
              <div className="mt-5">
                <Link href="/places">
                  <Button variant="secondary" size="sm">
                    Open my profile
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-card bg-surface-inset p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-ink-primary" />
                <div className="text-meta text-ink-secondary leading-relaxed">
                  <div className="text-ink-primary text-meta font-bold mb-1">
                    This is not medical advice.
                  </div>
                  Seagull translates "is this number weird?" into context.
                  Diagnosis and treatment decisions belong with your
                  clinician. For an emergency, call 911 or{" "}
                  <span className="text-ink-primary font-bold">Trans Lifeline 877-565-8860</span>.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-meta uppercase tracking-[0.12em] text-ink-secondary">
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

const VERDICT_META: Record<
  Verdict,
  { label: string; icon: typeof CheckCircle2; color: string; dot: string }
> = {
  likely_normal_for_regimen: {
    label: "Likely normal for your regimen",
    icon: CheckCircle2,
    color: "text-status-protected",
    dot: "bg-status-protected",
  },
  borderline_ask_doctor: {
    label: "Borderline — worth a quick ask",
    icon: HelpCircle,
    color: "text-status-restricted",
    dot: "bg-status-restricted",
  },
  outside_hrt_explanation: {
    label: "Hormones don't explain this — ask your doctor",
    icon: AlertTriangle,
    color: "text-status-banned",
    dot: "bg-status-banned",
  },
};

function ResultCard({ result }: { result: LabInterpretation }) {
  const meta = VERDICT_META[result.verdict] || VERDICT_META.borderline_ask_doctor;
  const Icon = meta.icon;
  return (
    <div className="mt-6 rounded-card border border-divider bg-surface-inset/30 p-6">
      <div className="flex items-center gap-3">
        <span className={cn("h-2.5 w-2.5 rounded-full", meta.dot)} />
        <span className={cn("text-meta font-bold uppercase tracking-[0.12em]", meta.color)}>
          {meta.label}
        </span>
      </div>
      <div className="mt-3 flex items-start gap-3">
        <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", meta.color)} />
        <div className="text-body text-ink-primary font-bold leading-snug">
          {result.headline}
        </div>
      </div>
      <p className="mt-3 text-meta text-ink-primary leading-relaxed">
        {result.explanation}
      </p>
      {result.ask_doctor_about && (
        <div className="mt-4 rounded-btn border border-divider bg-surface px-4 py-3">
          <div className="text-meta uppercase tracking-[0.12em] text-ink-secondary">
            Bring this up
          </div>
          <p className="mt-1 text-meta text-ink-primary">{result.ask_doctor_about}</p>
        </div>
      )}
    </div>
  );
}
