import Image from "next/image";
import Link from "next/link";
import { FileText, Map as MapIcon, FlaskConical, ArrowRight, ArrowDown, User, ExternalLink } from "lucide-react";
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
            A Translator Between You And Your Doctor.
          </h1>
          <p className="mt-6 text-lede text-sea-ink text-balance max-w-[560px] mx-auto">
            Type your meds once. Hand the doctor a card that keeps today&apos;s
            complaint separate from your hormone context — in 30 seconds.
            Tell whether a weird lab number is from HRT, or from something
            else worth asking about. Backed by live data from
            <span className="font-bold"> RxNorm</span>,
            <span className="font-bold"> openFDA</span>, and
            <span className="font-bold"> PubMed</span>.
          </p>

          <div className="mt-10 flex items-center justify-center">
            <GlassButton
              href="#tools"
              ariaLabel="See the tools — jump to all four"
            >
              <span className="inline-flex items-center gap-2 text-body font-medium text-sea-ink">
                See the tools
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
      title: "Your Profile",
      desc: "Meds, surgeries, last labs. Stays in your browser. Type it once, use it everywhere.",
    },
    {
      href: "/document",
      icon: FileText,
      title: "Previsit Card",
      desc: "Two boxes for the doctor — today's complaint, and hormone context — so the right thing gets looked at.",
    },
    {
      href: "/continuity",
      icon: FlaskConical,
      title: "Lab Check",
      desc: "Type in a weird number. Find out if it's from your hormones — or something separate worth asking about.",
    },
    {
      href: "/map",
      icon: MapIcon,
      title: "Care Map",
      desc: "See where your state stands on gender-affirming care, ID changes, and shield laws.",
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
  const sources = [
    {
      tag: "Medications",
      name: "RxNorm",
      org: "U.S. National Library of Medicine",
      role: "Real drug names, with autocomplete as you type.",
      url: "https://rxnav.nlm.nih.gov/",
    },
    {
      tag: "Recalls",
      name: "openFDA",
      org: "U.S. Food & Drug Administration",
      role: "Live drug recalls and adverse event reports.",
      url: "https://open.fda.gov/apis/drug/",
    },
    {
      tag: "Studies",
      name: "PubMed",
      org: "National Center for Biotechnology Information",
      role: "Trans HRT research citations, on demand.",
      url: "https://eutils.ncbi.nlm.nih.gov/",
    },
  ];
  return (
    <section className="pb-section">
      <Container>
        <div className="text-center max-w-[640px] mx-auto">
          <div className="inline-flex items-center gap-2.5">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-meta uppercase tracking-[0.18em] font-medium text-ink-secondary">
              Live Sources
            </span>
          </div>
          <p className="mt-4 text-body text-ink-secondary leading-snug">
            Every reading is cross-checked against public medical databases — nothing here is invented.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`${s.name} — ${s.org}. Opens in a new tab.`}
              className="group relative flex flex-col glass rounded-card p-7 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea-deep focus-visible:ring-offset-2"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center rounded-chip bg-sea-foam/70 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] font-bold text-sea-deep">
                  {s.tag}
                </span>
                <ExternalLink
                  className="h-3.5 w-3.5 text-ink-secondary/50 transition-all duration-200 group-hover:text-sea-deep group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </div>

              <div className="mt-5 text-card text-sea-ink leading-tight">
                {s.name}
              </div>
              <div className="mt-1 text-meta text-ink-secondary">{s.org}</div>

              <div className="mt-5 h-px w-full bg-gradient-to-r from-sea-mist/70 via-sea-mist/20 to-transparent" />

              <p className="mt-4 text-meta text-ink-primary leading-relaxed">
                {s.role}
              </p>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
