import { ReactNode } from "react";
import { Container } from "@/components/Container";

export function PageHero({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Container className="relative pt-20 pb-14">
      <div className="max-w-[760px]">
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
