import { cn } from "@/lib/cn";
import type { CareStatus } from "@/types";

const STATUS_STYLES: Record<CareStatus, { dot: string; label: string; ring: string }> = {
  PROTECTED: { dot: "bg-status-protected", label: "Protected", ring: "ring-status-protected" },
  LEGAL: { dot: "bg-status-legal", label: "Legal", ring: "ring-status-legal" },
  RESTRICTED: { dot: "bg-status-restricted", label: "Restricted", ring: "ring-status-restricted" },
  BANNED: { dot: "bg-status-banned", label: "Banned", ring: "ring-status-banned" },
  IN_LITIGATION: { dot: "bg-status-litigation", label: "In litigation", ring: "ring-status-litigation" },
};

export function StatusPill({ status, className }: { status: CareStatus; className?: string }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-btn bg-white/80 px-3 py-2 text-meta font-medium text-sea-ink ring-1 ring-inset",
        s.ring,
        className
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function Pill({
  children,
  className,
  selected,
  onClick,
  as,
}: {
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
  onClick?: () => void;
  as?: "button" | "span";
}) {
  const Comp: any = as ?? (onClick ? "button" : "span");
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-chip px-3 py-1.5 text-meta transition-colors",
        selected
          ? "bg-accent text-white"
          : "bg-surface-inset text-ink-primary hover:bg-[#F0F0F2]",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </Comp>
  );
}

export function statusLabel(status: CareStatus) {
  return STATUS_STYLES[status].label;
}
