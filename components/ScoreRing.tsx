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
  size = 76,
  stroke = 6,
  className,
}: {
  score: SafetyScore;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  // Always show the credible interval: a low-confidence range track
  // behind the point estimate arc. So users see both number and margin.
  const fillFraction = score.point_estimate / 100;
  const lowFraction = score.confidence_low / 100;
  const highFraction = score.confidence_high / 100;
  const fillDash = `${c * fillFraction} ${c}`;
  const intervalDash = `${c * (highFraction - lowFraction)} ${c}`;
  const intervalOffset = -c * lowFraction;
  const color = TIER_STROKE[score.tier];

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
          strokeWidth={stroke}
        />
        {/* Credible interval band (translucent) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeOpacity={0.18}
          strokeWidth={stroke}
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
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={fillDash}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={cn("text-[20px] font-bold leading-none", TIER_TEXT[score.tier])}>
          {score.point_estimate}
        </div>
        <div className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-ink-secondary leading-none">
          ±{Math.round((score.confidence_high - score.confidence_low) / 2)}
        </div>
      </div>
    </div>
  );
}
