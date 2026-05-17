"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type GlassEffectProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  target?: string;
  ariaLabel?: string;
};

export const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = "",
  style = {},
  href,
  target,
  ariaLabel,
}) => {
  const glassStyle: React.CSSProperties = {
    boxShadow:
      "0 8px 24px rgba(15, 42, 61, 0.18), 0 2px 6px rgba(15, 42, 61, 0.10)",
    transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
    ...style,
  };

  const content = (
    <div
      className={cn(
        "relative flex overflow-hidden cursor-pointer transition-all duration-700 text-sea-ink",
        className
      )}
      style={glassStyle}
    >
      {/* Refractive backdrop */}
      <div
        className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
        style={{
          backdropFilter: "blur(6px) saturate(140%)",
          WebkitBackdropFilter: "blur(6px) saturate(140%)",
          filter: "url(#seagull-glass-distortion)",
          isolation: "isolate",
        }}
      />
      {/* Frosted white tint */}
      <div
        className="absolute inset-0 z-10 rounded-[inherit]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.18) 100%)",
        }}
      />
      {/* Inner specular highlights */}
      <div
        className="absolute inset-0 z-20 rounded-[inherit] overflow-hidden"
        style={{
          boxShadow:
            "inset 1px 1px 0 0 rgba(255,255,255,0.7), inset -1px -1px 0 0 rgba(255,255,255,0.45)",
        }}
      />
      <div className="relative z-30 w-full">{children}</div>
    </div>
  );

  if (href) {
    const isExternal = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        aria-label={ariaLabel}
        target={target ?? (isExternal ? "_blank" : undefined)}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="inline-block"
      >
        {content}
      </a>
    );
  }
  return content;
};

export type DockItem = {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
};

export const GlassDock: React.FC<{
  items: DockItem[];
  className?: string;
}> = ({ items, className }) => (
  <GlassEffect
    className={cn(
      "rounded-[28px] p-2.5 hover:p-3 hover:rounded-[32px]",
      className
    )}
  >
    <div className="flex items-center justify-center gap-2 px-1">
      {items.map((item) => {
        const inner = (
          <div
            className="group relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500 hover:scale-110"
            style={{
              transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
            }}
            aria-label={item.label}
            title={item.label}
          >
            <span className="text-sea-ink/85 group-hover:text-sea-ink transition-colors">
              {item.icon}
            </span>
          </div>
        );
        if (item.href) {
          return (
            <a
              key={item.label}
              href={item.href}
              aria-label={item.label}
              className="block"
            >
              {inner}
            </a>
          );
        }
        return (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            aria-label={item.label}
          >
            {inner}
          </button>
        );
      })}
    </div>
  </GlassEffect>
);

export const GlassButton: React.FC<{
  children: React.ReactNode;
  href?: string;
  className?: string;
  ariaLabel?: string;
}> = ({ children, href, className, ariaLabel }) => (
  <GlassEffect
    href={href}
    ariaLabel={ariaLabel}
    className={cn("rounded-[28px] px-9 py-5", className)}
  >
    <div>{children}</div>
  </GlassEffect>
);

export const GlassFilter: React.FC = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden>
    <filter
      id="seagull-glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.002 0.006"
        numOctaves="1"
        seed="11"
        result="turbulence"
      />
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
      </feComponentTransfer>
      <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
      <feSpecularLighting
        in="softMap"
        surfaceScale="5"
        specularConstant="1"
        specularExponent="100"
        lightingColor="white"
        result="specLight"
      >
        <fePointLight x="-200" y="-200" z="300" />
      </feSpecularLighting>
      <feComposite
        in="specLight"
        operator="arithmetic"
        k1="0"
        k2="1"
        k3="1"
        k4="0"
        result="litImage"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="120"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);
