"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { cn } from "@/lib/cn";

const TOOL_LINKS = [
  { href: "/places", label: "Your Profile" },
  { href: "/document", label: "Previsit Card" },
  { href: "/continuity", label: "Lab Check" },
  { href: "/map", label: "Care Map" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 glass-nav">
      <Container>
        <nav className="flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            aria-label="Seagull — Home"
            className="flex items-center gap-2.5 text-sea-ink"
          >
            <Logo size={36} />
            <span className="font-display font-medium text-[22px] leading-none tracking-tight">
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
      aria-current={active ? "page" : undefined}
      className={cn(
        "px-3 py-2 text-meta font-medium rounded-btn transition-colors",
        active
          ? "bg-white/80 text-sea-ink shadow-[inset_0_0_0_1px_rgba(15,42,61,0.08)]"
          : "text-sea-ink/75 hover:text-sea-ink hover:bg-white/55"
      )}
    >
      {children}
    </Link>
  );
}
