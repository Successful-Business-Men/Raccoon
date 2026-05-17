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
    <Container className="relative pt-20 pb-14">
      <div className="max-w-[760px]">
        {eyebrow && (
          <div className="text-meta uppercase tracking-[0.18em] text-sea-ink/70 mb-4 font-medium">
            {eyebrow}
          </div>
        )}
        <h1 className="text-section text-balance text-sea-ink">{title}</h1>
        {description && (
          <p className="mt-5 text-lede text-sea-ink/80 text-balance">
            {description}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </Container>
  );
}
