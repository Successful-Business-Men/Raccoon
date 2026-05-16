import { cn } from "@/lib/cn";

export function IconBadge({
  children,
  className,
  size = 64,
}: {
  children: React.ReactNode;
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-surface-inset rounded-icon text-ink-primary",
        className
      )}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}
