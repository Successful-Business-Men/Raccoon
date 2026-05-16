import { cn } from "@/lib/cn";
import type { SafetyScore, SafetyTier } from "@/types";

const TIER_STROKE: Record<SafetyTier, string> = {
  green: "#34C759",
  yellow: "#FF9500",
  red: "#FF3B30",
};

const TIER_TEXT: Record<SafetyTier, string> = {
  green: "text-status-protected",
  yellow: "text-status-restricted",
  red: "text-status-banned",
};

export function ScoreRing({
  score,
  size = 128,
  stroke,
  className,
}: {
  score: SafetyScore;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  const strokeWidth = stroke ?? Math.max(6, Math.round(size * 0.085));
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const fillFraction = score.point_estimate / 100;
  const lowFraction = score.confidence_low / 100;
  const highFraction = score.confidence_high / 100;
  const fillDash = `${c * fillFraction} ${c}`;
  const intervalDash = `${c * (highFraction - lowFraction)} ${c}`;
  const intervalOffset = -c * lowFraction;
  const color = TIER_STROKE[score.tier];

  const numberSize = Math.round(size * 0.42);
  const marginSize = Math.max(10, Math.round(size * 0.11));
  const halfInterval = Math.round(
    (score.confidence_high - score.confidence_low) / 2
  );

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-label={`Safety Score ${score.point_estimate} of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#F0F0F2"
          strokeWidth={strokeWidth}
        />
        {/* Credible interval band (translucent) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeOpacity={0.18}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={intervalDash}
          strokeDashoffset={intervalOffset}
        />
        {/* Point estimate (solid) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={fillDash}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className={cn(
            "font-black leading-none tabular-nums tracking-tight",
            TIER_TEXT[score.tier]
          )}
          style={{ fontSize: numberSize }}
        >
          {score.point_estimate}
        </div>
        <div
          className="mt-1 uppercase tracking-[0.14em] text-ink-secondary leading-none font-medium tabular-nums"
          style={{ fontSize: marginSize }}
        >
          ±{halfInterval}
        </div>
      </div>
    </div>
  );
}
