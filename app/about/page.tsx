import Link from "next/link";
import { Container } from "@/components/Container";

export const metadata = {
  title: "About — Seagull",
};

export default function AboutPage() {
  return (
    <Container size="prose" className="py-section">
      <h1 className="text-section">About Seagull</h1>

      <Section title="Mission">
        <p>
          Seagull is a small set of free, private tools for trans people and the
          people who love them — built for a moment when the legal terrain is
          changing faster than most of us can read about it. Our goal is calm
          competence: clear information you can act on, without alarm and without
          pretending the situation is simpler than it is.
        </p>
        <p>
          Seagull is not a law firm, a clinic, or a directory. It does not give
          legal advice, prescribe medicine, recommend specific providers, or
          bridge medications. It helps you document what happened, understand
          where the law currently stands in your state, and organize the
          logistics of a move so you don&apos;t lose continuity of care.
        </p>
      </Section>

      <Section title="Who built this">
        <p className="text-ink-secondary">
          [Placeholder — Robert, write a short paragraph here.]
        </p>
      </Section>

      <Section title="Data sources">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <a
              href="https://www.lgbtmap.org/equality-maps"
              className="underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Movement Advancement Project (MAP)
            </a>{" "}
            — equality maps and policy tracking.
          </li>
          <li>
            <a
              href="https://www.lambdalegal.org"
              className="underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Lambda Legal
            </a>{" "}
            — case tracking and the Help Desk.
          </li>
          <li>
            <a
              href="https://www.kff.org"
              className="underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              KFF
            </a>{" "}
            — state Medicaid coverage and policy analysis.
          </li>
          <li>
            <a
              href="https://www.translegaldefense.org"
              className="underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Trans Legal Defense and Education Fund
            </a>
          </li>
          <li>
            <a
              href="https://a4te.org"
              className="underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Advocates for Trans Equality (A4TE)
            </a>
          </li>
        </ul>
      </Section>

      <Section title="Privacy">
        <p>
          By default Seagull is anonymous. You get a session id stored only in
          your browser. If you choose to save a document or migration plan, we
          send a magic link to your email and store the saved data in Supabase,
          encrypted at rest, accessible only by your account.
        </p>
      </Section>

      <Section title="Disclaimers">
        <ul className="list-disc pl-6 space-y-2 text-ink-secondary">
          <li>Seagull is not legal advice. Hand any output to a lawyer or filing agency.</li>
          <li>Seagull is not medical advice. Do not change your meds based on this site.</li>
          <li>Verify before acting. The law in some states changes weekly.</li>
          <li>
            In crisis? Trans Lifeline:{" "}
            <a
              href="tel:18775658860"
              className="text-ink-primary underline-offset-4 hover:underline"
            >
              877-565-8860
            </a>
            .
          </li>
        </ul>
      </Section>

      <Section title="Contact">
        <p>
          <a
            href="mailto:hello@seagull.app"
            className="text-ink-primary underline-offset-4 hover:underline"
          >
            hello@seagull.app
          </a>
        </p>
      </Section>

      <div className="mt-16">
        <Link href="/" className="text-meta text-ink-secondary hover:text-ink-primary">
          ← Back to home
        </Link>
      </div>
    </Container>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-[22px] font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 text-ink-primary leading-relaxed">
        {children}
      </div>
    </section>
  );
}
