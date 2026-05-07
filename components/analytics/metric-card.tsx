"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

export type MetricHealth = "good" | "neutral" | "warning" | "danger"

interface MetricCardProps {
  label: string
  value: string
  hint?: string
  health?: MetricHealth
  icon?: ReactNode
  /** Mini sparkline values (0-1 normalized or raw — auto-scaled). Optional. */
  spark?: number[]
  /** Forces a + sign on positive numeric strings */
  prefix?: string
}

/**
 * Premium metric card — black/chrome/gold theme.
 *
 * Health colors paint the icon background, the hint text, and a subtle
 * left-border accent. The big number stays chrome silver to keep the
 * trading-station feel; only the health context wears color.
 */
export function MetricCard({
  label,
  value,
  hint,
  health = "neutral",
  icon,
  spark,
  prefix,
}: MetricCardProps) {
  const healthClasses: Record<MetricHealth, { iconBg: string; hintText: string; border: string; glow: string }> = {
    good: {
      iconBg: "bg-success/15 text-success ring-1 ring-success/30",
      hintText: "text-success",
      border: "border-l-success/40",
      glow: "shadow-[inset_4px_0_0_-2px_rgb(16,185,129,0.6)]",
    },
    neutral: {
      iconBg: "bg-zinc-800/80 text-zinc-300 ring-1 ring-zinc-700",
      hintText: "text-zinc-400",
      border: "border-l-zinc-700",
      glow: "",
    },
    warning: {
      iconBg: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
      hintText: "text-amber-400",
      border: "border-l-amber-500/50",
      glow: "shadow-[inset_4px_0_0_-2px_rgb(245,158,11,0.6)]",
    },
    danger: {
      iconBg: "bg-red-500/15 text-red-400 ring-1 ring-red-500/40",
      hintText: "text-red-400",
      border: "border-l-red-500/60",
      glow: "shadow-[inset_4px_0_0_-2px_rgb(239,68,68,0.7)]",
    },
  }

  const h = healthClasses[health]

  return (
    <div
      className={cn(
        "relative rounded-xl border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-sm p-4 overflow-hidden",
        "transition-shadow duration-300",
        h.glow,
      )}
    >
      {/* Subtle gold halo top-right when health is good */}
      {health === "good" && (
        <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
          {label}
        </span>
        {icon && (
          <div className={cn("p-1.5 rounded-lg flex-shrink-0", h.iconBg)}>
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline gap-1.5">
          {prefix && (
            <span className="text-zinc-500 text-sm tabular-nums">{prefix}</span>
          )}
          <p
            className={cn(
              "text-3xl font-bold tabular-nums tracking-tight",
              health === "danger" ? "text-red-400" :
              health === "warning" ? "text-amber-300" :
              "text-zinc-100"
            )}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {value}
          </p>
        </div>

        {hint && (
          <p className={cn("text-[11px] tabular-nums leading-tight", h.hintText)}>
            {hint}
          </p>
        )}

        {spark && spark.length > 1 && (
          <Sparkline values={spark} health={health} />
        )}
      </div>
    </div>
  )
}

/**
 * Tiny sparkline — 60 wide × 18 tall. Color follows health.
 * Last point gets a glowing dot.
 */
function Sparkline({ values, health }: { values: number[]; health: MetricHealth }) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1 || 1)) * 60
    const y = 18 - ((v - min) / range) * 18
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  const color =
    health === "good" ? "rgb(16,185,129)" :
    health === "danger" ? "rgb(239,68,68)" :
    health === "warning" ? "rgb(245,158,11)" :
    "rgb(161,161,170)"

  const last = points[points.length - 1]
  const [lx, ly] = last ? last.split(",").map(Number) : [0, 9]

  return (
    <svg viewBox="0 0 60 18" className="w-16 h-4 mt-1">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <circle cx={lx} cy={ly} r="1.6" fill={color}>
        <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

/**
 * Helpers for callers to compute the right health from a number.
 * Convention chosen for trading metrics:
 */
export function healthFromDrawdown(pct: number): MetricHealth {
  if (pct < 5) return "good"
  if (pct < 15) return "warning"
  return "danger"
}

export function healthFromWinRate(pct: number): MetricHealth {
  if (pct >= 55) return "good"
  if (pct >= 45) return "neutral"
  if (pct >= 35) return "warning"
  return "danger"
}

export function healthFromProfitFactor(pf: number): MetricHealth {
  if (pf >= 1.5) return "good"
  if (pf >= 1) return "neutral"
  if (pf >= 0.7) return "warning"
  return "danger"
}

export function healthFromReturn(pct: number): MetricHealth {
  if (pct >= 0) return "good"
  if (pct >= -10) return "warning"
  return "danger"
}

/**
 * Format a USD amount for display: "$1,234.56" or "-$1,234.56".
 */
export function formatUsd(n: number, withSign = false): string {
  const abs = Math.abs(n).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  if (withSign && n > 0) return `+${abs}`
  if (n < 0) return `-${abs}`
  return abs
}
