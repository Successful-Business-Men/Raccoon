"use client";

import { forwardRef, useEffect, useState } from "react";
import Link from "next/link";
import { Printer, ClipboardList } from "lucide-react";
import { Container } from "@/components/Container";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/Button";
import { Pill } from "@/components/Pill";
import { AuroraOverlay } from "@/components/ui/aurora-background";
import {
  emptyProfile,
  loadProfile,
  type Profile,
} from "@/lib/profile";

const QUICK_REASONS = [
  "My arm hurts.",
  "I have a sore throat.",
  "I'm here for a yearly physical.",
  "I sprained my ankle.",
  "I have a rash.",
  "I'm having migraines.",
  "I have chest pain.",
  "Followup on a previous visit.",
];

export function DocumentClient() {
  const [profile, setProfile] = useState<Profile>(emptyProfile());
  const [reason, setReason] = useState("");
  const [extraContext, setExtraContext] = useState("");
  const [goals, setGoals] = useState<string[]>(["", "", ""]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setLoaded(true);
  }, []);

  const hasProfile =
    profile.medications.length > 0 ||
    profile.surgeries.length > 0 ||
    profile.hormone_regimen_summary.length > 0;

  function setGoal(i: number, v: string) {
    setGoals((g) => g.map((x, idx) => (idx === i ? v : x)));
  }

  function print() {
    window.print();
  }

  return (
    <div className="page-ocean">
      <AuroraOverlay variant="amber" />
      <PageHero
        title={<>Hand It To The Front Desk<br />The Doctor Reads It In 30 Seconds</>}
        description="One card. Allergies, today's reason, your ranked goals, and the body context that EHRs get wrong. Print it, screenshot it, or show it on your phone."
      />

      <Container className="pb-16">
        {!loaded ? null : !hasProfile ? (
          <div className="glass rounded-card p-7 flex items-start gap-4">
            <ClipboardList className="h-7 w-7 shrink-0 text-status-restricted" />
            <div>
              <h2 className="text-subsection">Set Up Your Profile First</h2>
              <p className="mt-2 text-meta text-ink-secondary leading-relaxed">
                Box 2 pulls from your medications and surgical history. Add at
                least one, or a regimen summary, then come back.
              </p>
              <div className="mt-4">
                <Link href="/places">
                  <Button size="sm">Go to your profile</Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left: inputs */}
            <div className="flex flex-col gap-6 print:hidden">
              <div className="text-meta uppercase tracking-[0.12em] text-ink-secondary">
                Your Visit
              </div>

              <div className="glass rounded-card p-7">
                <h2 className="text-subsection">Today's Reason</h2>
                <p className="mt-1 text-meta text-ink-secondary">
                  In your own words. Plain language is best.
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="My arm has been hurting for three days after I fell off my bike."
                  className="mt-4 w-full rounded-btn border border-divider bg-surface px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  {QUICK_REASONS.map((r) => (
                    <Pill key={r} onClick={() => setReason(r)}>
                      {r}
                    </Pill>
                  ))}
                </div>
              </div>

              <div className="glass rounded-card p-7">
                <h2 className="text-subsection">Top 3 Goals For Today</h2>
                <p className="mt-1 text-meta text-ink-secondary">
                  Ranked. If the visit runs short, the doctor handles #1 first.
                </p>
                <div className="mt-4 space-y-2">
                  {goals.map((g, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-btn border border-divider bg-surface px-3 py-2"
                    >
                      <span className="text-meta font-bold text-accent w-5 shrink-0">
                        {i + 1}.
                      </span>
                      <input
                        value={g}
                        onChange={(e) => setGoal(i, e.target.value)}
                        placeholder={
                          i === 0
                            ? "e.g. Refill my estradiol"
                            : i === 1
                            ? "e.g. Look at my ankle"
                            : "e.g. Flu shot if there's time"
                        }
                        className="flex-1 bg-transparent text-body focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-card p-7">
                <h2 className="text-subsection">Anything Else?</h2>
                <p className="mt-1 text-meta text-ink-secondary">
                  Recent injuries, sensitivities, anything the doctor should see
                  at a glance. Optional.
                </p>
                <textarea
                  value={extraContext}
                  onChange={(e) => setExtraContext(e.target.value)}
                  rows={3}
                  placeholder="Currently 8 weeks postop from top surgery. Needles trigger panic; please warn before drawing."
                  className="mt-4 w-full rounded-btn border border-divider bg-surface px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>

              <div className="glass rounded-card p-5 flex items-center justify-between gap-4">
                <div className="text-meta text-ink-secondary">
                  The card updates as you type.
                </div>
                <Button onClick={print} disabled={!reason.trim()}>
                  <Printer className="h-4 w-4" /> Print card
                </Button>
              </div>
            </div>

            {/* Right: printable card */}
            <div className="lg:sticky lg:top-24 lg:self-start flex flex-col gap-3">
              <div className="text-meta uppercase tracking-[0.12em] text-ink-secondary print:hidden">
                Preview
              </div>
              <PrintableCard
                profile={profile}
                reason={reason}
                extraContext={extraContext}
                goals={goals}
              />
            </div>
          </div>
        )}
      </Container>

      <style jsx global>{`
        @media print {
          @page {
            size: letter;
            margin: 0.4in;
          }
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .page-ocean::before,
          .page-ocean::after {
            display: none !important;
          }
          body * {
            visibility: hidden !important;
          }
          .printable-card,
          .printable-card * {
            visibility: visible !important;
          }
          .printable-card {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: auto !important;
            margin: 0 !important;
            width: auto !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}

const PrintableCard = forwardRef<
  HTMLDivElement,
  { profile: Profile; reason: string; extraContext: string; goals: string[] }
>(function PrintableCard({ profile, reason, extraContext, goals }, ref) {
  const name = profile.display_name.trim();
  const pronouns = profile.pronouns.trim();
  const age = profile.age.trim();
  const sex = profile.sex_assigned_at_birth;
  const meds = profile.medications;
  const surgeries = profile.surgeries;
  const regimen = profile.hormone_regimen_summary.trim();
  const allergies = profile.allergies.filter((a) => a.substance.trim());
  const inventory = profile.anatomical_inventory.trim();
  const filledGoals = goals.map((g) => g.trim()).filter(Boolean);

  const demographicBits = [
    age && `age ${age}`,
    sex && `${sex} at birth`,
  ].filter(Boolean);

  return (
    <div
      ref={ref}
      className="printable-card glass-strong rounded-card p-8 shadow-cardHover bg-white"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b divider-soft pb-4">
        <div className="min-w-0">
          <div className="text-meta uppercase tracking-[0.18em] text-ink-secondary">
            Previsit Card
          </div>
          <div className="mt-1 text-card">
            {name || "Patient"}
            {pronouns && (
              <span className="ml-2 text-meta text-ink-secondary font-normal">
                ({pronouns})
              </span>
            )}
          </div>
          {demographicBits.length > 0 && (
            <div className="mt-0.5 text-meta text-ink-secondary">
              {demographicBits.join(" · ")}
            </div>
          )}
        </div>
        <div className="text-meta text-ink-secondary text-right shrink-0">
          {new Date().toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Allergies strip — first because it changes prescribing */}
      {allergies.length > 0 && (
        <div className="mt-4 rounded-card border-2 border-status-banned/80 bg-status-banned/5 p-4">
          <div className="text-meta uppercase tracking-[0.12em] text-status-banned font-bold">
            Allergies
          </div>
          <ul className="mt-2 space-y-0.5 text-meta text-ink-primary">
            {allergies.map((a) => (
              <li key={a.id}>
                <span className="font-bold">{a.substance}</span>
                {a.reaction && (
                  <span className="text-ink-secondary"> — {a.reaction}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Anatomical inventory — addresses gendered EHR defaults */}
      {inventory && (
        <div className="mt-3 rounded-card border border-divider bg-surface-inset/40 p-3">
          <span className="text-meta uppercase tracking-[0.12em] text-ink-secondary font-bold">
            Anatomy ·{" "}
          </span>
          <span className="text-meta text-ink-primary">{inventory}</span>
        </div>
      )}

      {/* Clinician preamble */}
      <div className="mt-4 text-meta text-ink-secondary leading-relaxed">
        <span className="text-ink-primary font-bold">For the clinician:</span>{" "}
        Box 1 is today&apos;s chief complaint. Box 2 is hormone context,
        included so it doesn&apos;t get mistaken for the cause. Please assess
        them separately.
      </div>

      {/* Box 1 */}
      <div className="mt-4 rounded-card border-2 border-accent/70 p-5">
        <div className="text-meta uppercase tracking-[0.12em] text-accent font-bold">
          Box 1 · Today I Am Here Because
        </div>
        <p className="mt-2 text-body text-ink-primary whitespace-pre-wrap leading-relaxed">
          {reason || "…"}
        </p>
        {filledGoals.length > 0 && (
          <div className="mt-4">
            <div className="text-meta uppercase tracking-[0.1em] text-ink-secondary font-bold">
              Goals for today (ranked)
            </div>
            <ol className="mt-2 space-y-0.5 text-meta text-ink-primary list-decimal pl-5">
              {filledGoals.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Box 2 */}
      <div className="mt-4 rounded-card border-2 border-ink-secondary/40 p-5 bg-surface-inset/40">
        <div className="text-meta uppercase tracking-[0.12em] text-ink-secondary font-bold">
          Box 2 · Hormone Context (Not Today&apos;s Reason)
        </div>
        <div className="mt-3 space-y-2 text-meta text-ink-primary leading-relaxed">
          {regimen && <p>{regimen}</p>}
          {meds.length > 0 && (
            <div>
              <div className="uppercase tracking-[0.1em] text-ink-secondary text-[11px]">
                Medications
              </div>
              <ul className="mt-1 list-disc pl-5 space-y-0.5">
                {meds.map((m) => (
                  <li key={m.id}>{m.description || "…"}</li>
                ))}
              </ul>
            </div>
          )}
          {surgeries.length > 0 && (
            <div>
              <div className="uppercase tracking-[0.1em] text-ink-secondary text-[11px]">
                Surgical History
              </div>
              <ul className="mt-1 list-disc pl-5 space-y-0.5">
                {surgeries.map((s) => (
                  <li key={s.id}>
                    {s.description || "…"}
                    {s.date && (
                      <span className="text-ink-secondary"> · {s.date}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {extraContext.trim() && (
        <div className="mt-4 rounded-card border border-divider p-5">
          <div className="text-meta uppercase tracking-[0.12em] text-ink-secondary">
            Other Context
          </div>
          <p className="mt-2 text-meta text-ink-primary whitespace-pre-wrap leading-relaxed">
            {extraContext}
          </p>
        </div>
      )}

      <div className="mt-5 pt-4 border-t divider-soft text-meta text-ink-secondary leading-relaxed">
        Made by the patient with Seagull. A self report, not a medical record.
      </div>
    </div>
  );
});
