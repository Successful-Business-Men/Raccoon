import Image from "next/image";
import Link from "next/link";
import { FileText, Map as MapIcon, Route, ArrowRight, ShieldCheck } from "lucide-react";
import { Container } from "@/components/Container";
import { IconBadge } from "@/components/IconBadge";
import { Logo } from "@/components/Logo";
import { GlassButton, GlassFilter } from "@/components/ui/liquid-glass";

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
      <video
        aria-hidden
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/wave-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
      >
        <source src="/wave.mp4" type="video/mp4" />
      </video>
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
              <h3 className="mt-5 text-[18px] font-bold tracking-tight">
                {t.title}
              </h3>
              <p className="mt-2 text-meta text-ink-secondary leading-relaxed">{t.desc}</p>
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
        <div className="bg-surface-inset rounded-card py-10 text-center">
          <div className="text-meta uppercase tracking-[0.18em] text-ink-secondary">
            Built with data from
          </div>
          <div
            className="mt-8 overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to right, transparent 0, #000 8%, #000 92%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0, #000 8%, #000 92%, transparent 100%)",
            }}
          >
            <div className="flex w-max items-center gap-16 animate-marquee">
              {track.map((o, i) => (
                <div
                  key={`${o.name}-${i}`}
                  className="relative h-16 w-48 shrink-0"
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
        </div>
      </Container>
    </section>
  );
}
