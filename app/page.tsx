import Image from "next/image";
import Link from "next/link";
import { FileText, Map as MapIcon, FlaskConical, ArrowRight, ArrowDown, User } from "lucide-react";
import { Container } from "@/components/Container";
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
          <h1 className="text-hero text-balance text-sea-ink">
            A translator between you and your doctor.
          </h1>
          <p className="mt-6 text-lede text-sea-ink text-balance max-w-[560px] mx-auto">
            Type your meds and surgeries once. Hand over a card that
            explains everything in 30 seconds. Find out if a weird
            blood test is actually a problem.
          </p>

          <div className="mt-10 flex items-center justify-center">
            <GlassButton
              href="#tools"
              ariaLabel="Explore the toolkit — jump to all four tools"
            >
              <span className="inline-flex items-center gap-2 text-body font-medium text-sea-ink">
                Explore the toolkit
                <ArrowDown className="h-4 w-4" strokeWidth={2} />
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
      icon: User,
      title: "Your profile",
      desc: "Meds, surgeries, last labs. Stored in your browser. Type it once, use it everywhere.",
    },
    {
      href: "/document",
      icon: FileText,
      title: "Pre-visit card",
      desc: "Hand it to the doctor. Two boxes: why you're here, and what is not why you're here.",
    },
    {
      href: "/continuity",
      icon: FlaskConical,
      title: "Lab check",
      desc: "A weird number? Type it in. Find out if it's normal for someone on your hormones — or worth asking about.",
    },
    {
      href: "/map",
      icon: MapIcon,
      title: "Care Map",
      desc: "Current law on gender-affirming care, ID changes, and shield laws in your state.",
    },
  ];
  return (
    <section id="tools" className="scroll-mt-24 pb-section">
      <Container>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-stretch">
          {tools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group relative flex h-full flex-col glass rounded-card p-7 overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-cardHover hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea-deep focus-visible:ring-offset-2"
            >
              {/* Decorative sea-tinted glow that brightens on hover */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-60 blur-2xl transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-110"
                style={{
                  background:
                    "radial-gradient(circle, rgba(125,211,252,0.55) 0%, rgba(186,230,253,0) 70%)",
                }}
              />

              {/* Icon — sea-tinted gradient badge */}
              <div
                className="relative flex h-14 w-14 items-center justify-center rounded-icon text-sea-ink transition-transform duration-300 ease-out group-hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(224,242,254,0.95) 0%, rgba(186,230,253,0.75) 50%, rgba(125,211,252,0.55) 100%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 0 1px rgba(255,255,255,0.5), 0 1px 2px rgba(15,42,61,0.06)",
                }}
              >
                <t.icon className="h-6 w-6" strokeWidth={1.75} />
              </div>

              <h3 className="relative mt-6 text-card tracking-tight text-sea-ink">
                {t.title}
              </h3>
              <p className="relative mt-2.5 text-body text-ink-secondary leading-relaxed">
                {t.desc}
              </p>

              {/* Divider + CTA chip */}
              <div className="relative mt-auto pt-6">
                <div className="h-px w-full bg-gradient-to-r from-sea-mist/70 via-sea-mist/25 to-transparent" />
                <div className="mt-4 inline-flex items-center gap-1.5 text-meta font-medium text-sea-ink transition-colors duration-200 group-hover:text-sea-deep">
                  Open
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                </div>
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
  const track = [...orgs, ...orgs, ...orgs, ...orgs];
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
