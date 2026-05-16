import Link from "next/link";
import { FileText, Map as MapIcon, Route, ArrowRight } from "lucide-react";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { IconBadge } from "@/components/IconBadge";
import { Logo } from "@/components/Logo";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ToolCards />
      <TrustSection />
    </>
  );
}

function Hero() {
  return (
    <section className="pt-24 pb-section">
      <Container>
        <div className="mx-auto max-w-[820px] text-center">
          <div className="mb-10 flex justify-center">
            <Logo size={144} />
          </div>
          <h1 className="text-hero text-balance">
            Resourceful tools for hostile terrain
          </h1>
          <p className="mt-6 text-[19px] leading-relaxed text-ink-secondary text-balance max-w-[640px] mx-auto">
            Three tools to help you document discrimination, understand your
            state&apos;s laws, and plan for care continuity. Free, private, built
            with the trans community in mind.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href="/document">
                Start documenting
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/map">See the care map</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ToolCards() {
  const tools = [
    {
      href: "/document",
      icon: FileText,
      title: "Document an incident",
      desc: "Capture a structured record of housing, employment, healthcare, or public accommodation discrimination.",
    },
    {
      href: "/map",
      icon: MapIcon,
      title: "Check your state",
      desc: "See the current legal landscape for gender-affirming care, ID changes, and shield laws.",
    },
    {
      href: "/continuity",
      icon: Route,
      title: "Plan continuity of care",
      desc: "Organize records, insurance, and timing for a move — without losing access to your care.",
    },
  ];
  return (
    <section className="pb-section">
      <Container>
        <div className="grid gap-6 md:grid-cols-3">
          {tools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group relative bg-surface rounded-card shadow-card p-8 hover:shadow-cardHover hover:-translate-y-0.5 transition-all duration-200 ease-out"
            >
              <IconBadge>
                <t.icon className="h-7 w-7" strokeWidth={1.75} />
              </IconBadge>
              <h3 className="mt-6 text-[22px] font-semibold tracking-tight">
                {t.title}
              </h3>
              <p className="mt-2 text-ink-secondary leading-relaxed">{t.desc}</p>
              <div className="mt-8 inline-flex items-center gap-1.5 text-meta font-medium text-ink-primary">
                Open
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

function TrustSection() {
  const orgs = [
    "Movement Advancement Project",
    "Lambda Legal",
    "KFF",
    "Trans Legal Defense and Education Fund",
  ];
  return (
    <section className="pb-section">
      <Container>
        <div className="bg-surface-inset rounded-card p-10 text-center">
          <div className="text-meta uppercase tracking-[0.18em] text-ink-secondary">
            Built with data from
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[15px] text-ink-primary">
            {orgs.map((o) => (
              <span key={o} className="font-medium">
                {o}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
