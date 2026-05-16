import Link from "next/link";
import { Container } from "./Container";
import { getLastDataUpdate } from "@/data/care_status";

export function Footer() {
  const lastUpdate = getLastDataUpdate();
  return (
    <footer className="mt-section border-t divider-soft bg-surface">
      <Container>
        <div className="py-12 grid gap-6 md:grid-cols-3 md:items-start">
          <div className="text-meta text-ink-secondary leading-relaxed">
            Seagull is not legal or medical advice. For emergencies, contact{" "}
            <a
              href="tel:18775658860"
              className="text-ink-primary underline-offset-2 hover:underline"
            >
              Trans Lifeline (877-565-8860)
            </a>
            .
          </div>

          <div className="flex gap-6 text-meta text-ink-secondary md:justify-center">
            <Link href="/about" className="hover:text-ink-primary">About</Link>
            <a href="#" className="hover:text-ink-primary">GitHub</a>
          </div>

          <div className="text-meta text-ink-secondary md:text-right">
            Last data update: {lastUpdate}
          </div>
        </div>
      </Container>
    </footer>
  );
}
