import { cn } from "@/lib/cn";

export function Logo({
  size = 64,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/seagull.png"
      alt="Seagull"
      style={{ height: size, width: "auto" }}
      className={cn("shrink-0 select-none object-contain", className)}
    />
  );
}
