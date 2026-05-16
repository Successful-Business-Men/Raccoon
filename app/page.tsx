import Image from "next/image";
import Link from "next/link";
import { FileText, Map as MapIcon, Route, ArrowRight, ShieldCheck } from "lucide-react";
import { Container } from "@/components/Container";
import { IconBadge } from "@/components/IconBadge";
import { GlassButton, GlassFilter } from "@/components/ui/liquid-glass";
import { WaveBackground } from "@/components/WaveBackground";

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
    <section className="relative isolate -mt-16 pt-16 overflow-hidden ocean-hero">
      <WaveBackground />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-64 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0.95) 100%)",
        }}
      />
      <GlassFilter />

      <Container>
        <div className="relative mx-auto max-w-[860px] text-center pt-28 pb-section">
          <div className="mb-8 inline-flex items-center gap-2 rounded-chip glass-inset px-4 py-1.5 text-meta text-sea-ink/80">
            <span className="h-1.5 w-1.5 rounded-full bg-sea-deep" />
            Free, private, no signup — built with the trans community
          </div>
          <h1 className="text-hero text-balance text-sea-ink">
            A toolkit for trans Americans navigating discrimination
            and shifting laws.
          </h1>
          <p className="mt-6 text-lede text-sea-ink text-balance max-w-[560px] mx-auto">
            Document discrimination, score businesses, plan a move,
            check your state.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <GlassButton href="/places" ariaLabel="Check a Safety Score">
              <span className="inline-flex items-center gap-2 text-body font-medium text-sea-ink">
                Check a Safety Score
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </span>
            </GlassButton>
            <GlassButton href="/document" ariaLabel="Document an incident">
              <span className="inline-flex items-center gap-2 text-body font-medium text-sea-ink">
                Document an incident
              </span>
            </GlassButton>
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
      desc: "A transparent score from state law, corporate policy, and first-party reports.",
    },
    {
      href: "/document",
      icon: FileText,
      title: "Document an incident",
      desc: "Record housing, employment, healthcare, or public-accommodation discrimination.",
    },
    {
      href: "/map",
      icon: MapIcon,
      title: "Check your state",
      desc: "Current law on gender-affirming care, ID changes, and shield laws.",
    },
    {
      href: "/continuity",
      icon: Route,
      title: "Plan continuity of care",
      desc: "Records, insurance, and timing — so a move doesn't break your care.",
    },
  ];
  return (
    <section className="pb-section">
      <Container>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-stretch">
          {tools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group relative flex h-full flex-col glass rounded-card p-7 hover:shadow-cardHover hover:-translate-y-0.5 transition-all duration-200 ease-out"
            >
              <IconBadge>
                <t.icon className="h-6 w-6" strokeWidth={1.75} />
              </IconBadge>
              <h3 className="mt-5 text-card tracking-tight">
                {t.title}
              </h3>
              <p className="mt-3 text-body text-ink-secondary leading-relaxed">{t.desc}</p>
              <div className="mt-auto pt-6 inline-flex items-center gap-1.5 text-meta text-ink-primary">
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
  // MAP's source PNG embeds a "movement advancement project" subtitle row, so
  // the main wordmark only fills ~60% of its bounding box. A small scale nudge
  // brings its visual height in line with the other marks.
  const orgs = [
    { name: "Movement Advancement Project", src: "/logos/map.png", scale: 1.2 },
    { name: "Lambda Legal", src: "/logos/lambda-legal.png", scale: 1 },
    { name: "KFF", src: "/logos/kff.png", scale: 1 },
    { name: "Trans Legal Defense and Education Fund", src: "/logos/tldef.png", scale: 1 },
  ];
  const track = [...orgs, ...orgs];
  return (
    <section className="pb-section">
      <Container>
        <div className="text-center">
          <div className="text-meta uppercase tracking-[0.18em] text-ink-secondary">
            Built with data from
          </div>
        </div>
      </Container>
      <div
        className="mt-8 overflow-hidden w-full"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%)",
        }}
      >
        <div className="flex w-max items-center animate-marquee">
          {track.map((o, i) => (
            <div
              key={`${o.name}-${i}`}
              className="relative h-16 w-48 shrink-0 mr-24"
            >
              <Image
                src={o.src}
                alt={o.name}
                fill
                sizes="192px"
                className="object-contain"
                style={
                  o.scale !== 1
                    ? { transform: `scale(${o.scale})` }
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
