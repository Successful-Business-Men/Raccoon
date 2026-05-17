"use client";
import { cn } from "@/lib/cn";
import React from "react";

export type AuroraVariant = "sky" | "amber" | "emerald" | "violet";

interface AuroraOverlayProps extends React.HTMLProps<HTMLDivElement> {
  variant?: AuroraVariant;
  showRadialGradient?: boolean;
}

const VARIANT_CLASS: Record<AuroraVariant, string> = {
  sky: "aurora-sky",
  amber: "aurora-amber",
  emerald: "aurora-emerald",
  violet: "aurora-violet",
};

export const AuroraOverlay = ({
  className,
  variant = "sky",
  showRadialGradient = true,
  ...props
}: AuroraOverlayProps) => {
  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-0 overflow-hidden pointer-events-none aurora-overlay",
        VARIANT_CLASS[variant],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          `
          [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
          [--aurora:repeating-linear-gradient(100deg,var(--a1)_10%,var(--a2)_15%,var(--a3)_20%,var(--a4)_25%,var(--a1)_30%)]
          [background-image:var(--white-gradient),var(--aurora)]
          [background-size:300%,_200%]
          [background-position:50%_50%,50%_50%]
          filter blur-[10px] invert
          after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)]
          after:[background-size:200%,_100%]
          after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
          pointer-events-none
          absolute -inset-[10px] opacity-50 will-change-transform`,
          showRadialGradient && "aurora-mask"
        )}
      ></div>
    </div>
  );
};
