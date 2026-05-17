import { cn } from "@/lib/cn";
import type { CareStatus } from "@/types";

const STATUS_STYLES: Record<CareStatus, { dot: string; label: string }> = {
  PROTECTED: { dot: "bg-status-protected", label: "Protected" },
  LEGAL: { dot: "bg-status-legal", label: "Legal" },
  RESTRICTED: { dot: "bg-status-restricted", label: "Restricted" },
  BANNED: { dot: "bg-status-banned", label: "Banned" },
  IN_LITIGATION: { dot: "bg-status-litigation", label: "In litigation" },
};

export function StatusPill({ status, className }: { status: CareStatus; className?: string }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-btn bg-white/80 px-3 py-2 text-meta font-medium text-sea-ink shadow-[inset_0_0_0_1px_rgba(15,42,61,0.08)]",
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
