import { ReactNode } from "react";
import { Container } from "@/components/Container";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate -mt-16 pt-16 overflow-hidden ocean-hero">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(60% 60% at 20% 20%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%), radial-gradient(50% 50% at 80% 30%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 65%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(234,246,255,0) 0%, rgba(234,246,255,0.55) 55%, rgba(244,250,254,1) 100%)",
        }}
      />
      <Container className="relative">
        <div className="pt-12 pb-20 max-w-[760px]">
          {eyebrow && (
            <div className="text-meta uppercase tracking-[0.18em] text-sea-ink/70 mb-3">
              {eyebrow}
            </div>
          )}
          <h1 className="text-section text-balance text-sea-ink">{title}</h1>
          {description && (
            <p className="mt-4 text-lede text-sea-ink/80 text-balance">
              {description}
            </p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </Container>
    </section>
  );
}
