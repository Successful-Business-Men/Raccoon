"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { cn } from "@/lib/cn";

const TOOL_LINKS = [
  { href: "/document", label: "Document" },
  { href: "/map", label: "Care Map" },
  { href: "/places", label: "Safety Score" },
  { href: "/continuity", label: "Continuity" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 glass-nav">
      <Container>
        <nav className="flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-ink-primary"
          >
            <Logo size={44} />
            <span className="font-display text-[22px] leading-none">
              Seagull
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {TOOL_LINKS.map((l) => (
              <NavLink key={l.href} href={l.href} active={pathname === l.href}>
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center">
            <NavLink href="/about" active={pathname === "/about"}>
              About
            </NavLink>
          </div>
        </nav>
      </Container>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-2 text-meta rounded-btn transition-colors",
        active
          ? "text-ink-primary bg-surface-inset"
          : "text-ink-secondary hover:text-ink-primary"
      )}
    >
      {children}
    </Link>
  );
}
