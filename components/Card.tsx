import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
  as: As = "div",
  hover = false,
}: {
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  hover?: boolean;
}) {
  return (
    <As
      className={cn(
        "bg-surface rounded-card shadow-card p-8",
        hover && "hover:shadow-cardHover transition-shadow duration-200",
        className
      )}
    >
      {children}
    </As>
  );
}
