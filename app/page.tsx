import Link from "next/link";
import { FileText, Map as MapIcon, Route, ArrowRight, ShieldCheck } from "lucide-react";
import { Container } from "@/components/Container";
import { IconBadge } from "@/components/IconBadge";
import { Logo } from "@/components/Logo";
import {
  GlassButton,
  GlassDock,
  GlassFilter,
  type DockItem,
} from "@/components/ui/liquid-glass";
import { cn } from "@/lib/cn";

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
  const dockItems: DockItem[] = [
    {
      icon: <ShieldCheck className="h-7 w-7" strokeWidth={1.6} />,
      label: "Safety Score",
      href: "/places",
    },
    {
      icon: <FileText className="h-7 w-7" strokeWidth={1.6} />,
      label: "Document an incident",
      href: "/document",
    },
    {
      icon: <MapIcon className="h-7 w-7" strokeWidth={1.6} />,
      label: "Care Map",
      href: "/map",
    },
    {
      icon: <Route className="h-7 w-7" strokeWidth={1.6} />,
      label: "Continuity",
      href: "/continuity",
    },
  ];

  return (
    <section className="relative isolate -mt-16 pt-16 overflow-hidden ocean-hero">
      <div
        aria-hidden
        className="absolute inset-0 ocean-waves pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.92) 100%)",
        }}
      />
      <GlassFilter />

      <Container>
        <div className="relative mx-auto max-w-[820px] text-center pt-20 pb-section">
          <div className="mb-8 flex justify-center">
            <Logo
              size={120}
              className="drop-shadow-[0_8px_24px_rgba(15,42,61,0.25)]"
            />
          </div>
          <h1 className="text-hero text-balance text-sea-ink">
            Resourceful tools for hostile terrain
          </h1>
          <p className="mt-5 text-[19px] leading-relaxed text-sea-ink/75 text-balance max-w-[640px] mx-auto">
            Three tools to help you document discrimination, understand your
            state&apos;s laws, and plan for care continuity. Free, private, built
            with the trans community in mind.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-6">
            <GlassDock items={dockItems} />

            <GlassButton href="/places" ariaLabel="Check a Safety Score">
              <span className="inline-flex items-center gap-2 text-[17px] font-medium text-sea-ink">
                Check a Safety Score
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </span>
            </GlassButton>

            <Link
              href="/document"
              className="text-meta text-sea-ink/70 hover:text-sea-ink underline-offset-4 hover:underline transition-colors"
            >
              Or document an incident →
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ToolCards() {
  const tools = [
    {
      href: "/places",
      icon: ShieldCheck,
      title: "Safety Score",
      desc: "Look up a physical business and see a transparent score from state law, corporate policy, and first-party reports.",
      featured: true,
    },
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "group relative bg-surface rounded-card shadow-card p-7 hover:shadow-cardHover hover:-translate-y-0.5 transition-all duration-200 ease-out",
                t.featured && "ring-1 ring-accent/20"
              )}
            >
              <IconBadge>
                <t.icon className="h-6 w-6" strokeWidth={1.75} />
              </IconBadge>
              <h3 className="mt-5 text-[18px] font-bold tracking-tight">
                {t.title}
              </h3>
              <p className="mt-2 text-meta text-ink-secondary leading-relaxed">{t.desc}</p>
              <div className="mt-6 inline-flex items-center gap-1.5 text-meta text-ink-primary">
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
