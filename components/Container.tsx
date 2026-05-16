import { cn } from "@/lib/cn";

export function Container({
  className,
  children,
  size = "page",
}: {
  className?: string;
  children: React.ReactNode;
  size?: "page" | "prose" | "plan";
}) {
  const max =
    size === "prose" ? "max-w-prose" : size === "plan" ? "max-w-plan" : "max-w-page";
  return (
    <div className={cn("mx-auto w-full px-6", max, className)}>{children}</div>
  );
}
