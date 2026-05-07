"use client"

import { useState, useMemo, useRef } from "react"
import { cn } from "@/lib/utils"

export type Timeframe = "1H" | "6H" | "24H" | "7D" | "30D" | "ALL"

export interface BalanceSnapshot {
  id: number
  balance: string
  createdAt: string
}

interface EquityCurveProps {
  snapshots: BalanceSnapshot[]
  currentBalance: number
  /** Optional override of the peak (useful when current > all snapshots) */
  peakBalance?: number
  /** ms since epoch — defaults to now */
  nowTs?: number
  className?: string
}

/**
 * Premium equity curve — black canvas, gold line with halo, gradient fill,
 * drawdown zone, grid labels, tooltip on touch/hover.
 *
 * Trading-station feel — inspired by Bloomberg / TradingView dark themes.
 */
export function EquityCurve({
  snapshots,
  currentBalance,
  peakBalance,
  nowTs = Date.now(),
  className,
}: EquityCurveProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("ALL")
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const filtered = useMemo(() => {
    if (timeframe === "ALL") return snapshots
    const winMs: Record<Exclude<Timeframe, "ALL">, number> = {
      "1H": 60 * 60 * 1000,
      "6H": 6 * 60 * 60 * 1000,
      "24H": 24 * 60 * 60 * 1000,
      "7D": 7 * 24 * 60 * 60 * 1000,
      "30D": 30 * 24 * 60 * 60 * 1000,
    }
    const cutoff = nowTs - winMs[timeframe]
    return snapshots.filter(s => new Date(s.createdAt).getTime() >= cutoff)
  }, [snapshots, timeframe, nowTs])

  const series = useMemo(() => {
    const arr = [...filtered, {
      id: -1,
      balance: String(currentBalance),
      createdAt: new Date(nowTs).toISOString(),
    }]
    return arr.map(s => ({
      v: parseFloat(s.balance),
      t: new Date(s.createdAt).getTime(),
    }))
  }, [filtered, currentBalance, nowTs])

  if (series.length < 2) {
    return (
      <div className={cn("rounded-xl border border-zinc-800 bg-zinc-950/60 p-6 text-center", className)}>
        <p className="text-sm text-zinc-500">Esperando más data para la curva…</p>
      </div>
    )
  }

  const firstV = series[0].v
  const lastV = series[series.length - 1].v
  const peakV = peakBalance ?? Math.max(...series.map(s => s.v))
  const totalReturn = firstV > 0 ? ((lastV - firstV) / firstV) * 100 : 0
  const drawdownFromPeak = peakV > 0 ? ((peakV - lastV) / peakV) * 100 : 0
  const isProfit = lastV >= firstV

  // Smart auto-scale: si hay un outlier muy alto (peak histórico vs valor
  // actual aplastado abajo), recortamos el rango visible al P5–P95 de la
  // serie + headroom hacia el peak. Antes la línea quedaba pegada al fondo
  // cuando el cliff de drawdown era grande (peak $144 pero data actual $47).
  const rawValues = series.map(s => s.v)
  const sortedV = [...rawValues].sort((a, b) => a - b)
  const visibleMin = sortedV[Math.floor(sortedV.length * 0.02)] ?? sortedV[0]
  const visibleMax = sortedV[Math.floor(sortedV.length * 0.98)] ?? sortedV[sortedV.length - 1]
  // Si el peak es muy externo al rango visible, lo metemos dentro pero sin
  // exagerar (clamp) — así la línea ocupa los 2/3 superiores del chart y
  // el peak aparece arriba como referencia.
  const dataRange = visibleMax - visibleMin || 1
  const padding = dataRange * 0.15
  const minV = visibleMin - padding
  // Solo metemos peak en el chart si está cerca; si no, tope del chart =
  // visibleMax con padding (peak aparece como dashed line dentro)
  const peakInRange = peakV <= visibleMax + dataRange * 2
  const maxV = peakInRange ? Math.max(visibleMax + padding, peakV + padding * 0.5) : visibleMax + padding
  const range = maxV - minV || 1

  const W = 720
  const H = 240
  const padX = 8
  const padY = 12

  const xFor = (i: number) => padX + (i / (series.length - 1)) * (W - 2 * padX)
  const yFor = (v: number) => {
    const clamped = Math.max(minV, Math.min(maxV, v))
    return padY + (1 - (clamped - minV) / range) * (H - 2 * padY)
  }
  const peakY = yFor(peakV)
  const peakOffChart = peakV > maxV

  const linePath = "M " + series.map((s, i) => `${xFor(i).toFixed(1)} ${yFor(s.v).toFixed(1)}`).join(" L ")
  const fillPath = `${linePath} L ${xFor(series.length - 1).toFixed(1)} ${H - padY} L ${xFor(0).toFixed(1)} ${H - padY} Z`

  const showDrawdownZone = peakV > lastV && drawdownFromPeak > 0.5

  const gridLevels = 4
  const grid = Array.from({ length: gridLevels + 1 }, (_, i) => {
    const v = maxV - (range * i) / gridLevels
    return { v, y: yFor(v) }
  })

  function handlePointer(e: React.PointerEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const ratio = x / rect.width
    const idx = Math.round(ratio * (series.length - 1))
    setHoverIdx(Math.max(0, Math.min(series.length - 1, idx)))
  }

  const tfButtons: Timeframe[] = ["1H", "6H", "24H", "7D", "30D", "ALL"]

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900/50 backdrop-blur-sm overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgb(245,158,11,0.8)] animate-pulse" />
            <h3 className="text-sm font-semibold tracking-wide text-zinc-100">Equity Curve</h3>
            <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">
              · {snapshots.length} snapshots · live
            </span>
          </div>
        </div>
        <div className="text-right">
          <p
            className={cn(
              "text-lg font-bold tabular-nums tracking-tight",
              isProfit ? "text-emerald-400" : "text-red-400"
            )}
          >
            {isProfit ? "+" : ""}
            {totalReturn.toFixed(2)}%
          </p>
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Total return</p>
        </div>
      </div>

      <div className="flex items-center gap-1 px-5 pb-3">
        {tfButtons.map(tf => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors tabular-nums",
              timeframe === tf
                ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            )}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="px-5 pb-2 relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-[240px] cursor-crosshair touch-none"
          onPointerMove={handlePointer}
          onPointerLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(251,191,36)" stopOpacity="0.35" />
              <stop offset="60%" stopColor="rgb(245,158,11)" stopOpacity="0.10" />
              <stop offset="100%" stopColor="rgb(245,158,11)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(239,68,68)" stopOpacity="0.25" />
              <stop offset="80%" stopColor="rgb(239,68,68)" stopOpacity="0.04" />
              <stop offset="100%" stopColor="rgb(239,68,68)" stopOpacity="0" />
            </linearGradient>
            <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.9" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {grid.map((g, i) => (
            <g key={i}>
              <line
                x1={padX}
                y1={g.y}
                x2={W - padX}
                y2={g.y}
                stroke="rgb(63,63,70)"
                strokeWidth="0.5"
                strokeDasharray="2,4"
                opacity="0.5"
              />
              <text
                x={padX + 4}
                y={g.y - 3}
                fontSize="10"
                fill="rgb(113,113,122)"
                fontFamily="ui-monospace, monospace"
              >
                ${g.v.toFixed(2)}
              </text>
            </g>
          ))}

          {showDrawdownZone && !peakOffChart && (
            <>
              <line
                x1={padX}
                y1={peakY}
                x2={W - padX}
                y2={peakY}
                stroke="rgb(239,68,68)"
                strokeWidth="0.5"
                strokeDasharray="3,3"
                opacity="0.5"
              />
              <text
                x={W - padX - 4}
                y={peakY - 4}
                fontSize="9"
                fill="rgb(239,68,68)"
                opacity="0.7"
                textAnchor="end"
                fontFamily="ui-monospace, monospace"
              >
                Peak ${peakV.toFixed(2)}
              </text>
            </>
          )}
          {/* Peak off-chart indicator — cuando el cliff es tan grande que
              peak no cabe en el viewport actual. Aparece como banderola
              superior con la cifra. */}
          {peakOffChart && (
            <g>
              <line
                x1={padX}
                y1={padY + 1}
                x2={W - padX}
                y2={padY + 1}
                stroke="rgb(239,68,68)"
                strokeWidth="0.5"
                strokeDasharray="2,3"
                opacity="0.6"
              />
              <text
                x={W - padX - 4}
                y={padY + 12}
                fontSize="9"
                fill="rgb(239,68,68)"
                opacity="0.8"
                textAnchor="end"
                fontFamily="ui-monospace, monospace"
              >
                ↑ Peak ${peakV.toFixed(2)} (fuera de rango · −{drawdownFromPeak.toFixed(1)}%)
              </text>
            </g>
          )}

          <path
            d={fillPath}
            fill={isProfit ? "url(#goldGradient)" : "url(#redGradient)"}
          />

          <path
            d={linePath}
            fill="none"
            stroke={isProfit ? "rgb(245,158,11)" : "rgb(239,68,68)"}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#lineGlow)"
          />

          {(() => {
            const last = series[series.length - 1]
            const lx = xFor(series.length - 1)
            const ly = yFor(last.v)
            const color = isProfit ? "rgb(251,191,36)" : "rgb(248,113,113)"
            return (
              <>
                <circle cx={lx} cy={ly} r="4" fill={color} opacity="0.18">
                  <animate attributeName="r" values="4;6;4" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle cx={lx} cy={ly} r="2.4" fill={color} />
              </>
            )
          })()}

          {hoverIdx !== null && series[hoverIdx] && (() => {
            const s = series[hoverIdx]
            const cx = xFor(hoverIdx)
            const cy = yFor(s.v)
            const tooltipX = cx > W / 2 ? cx - 110 : cx + 10
            return (
              <>
                <line
                  x1={cx}
                  y1={padY}
                  x2={cx}
                  y2={H - padY}
                  stroke="rgb(245,158,11)"
                  strokeWidth="0.8"
                  opacity="0.5"
                  strokeDasharray="2,2"
                />
                <circle cx={cx} cy={cy} r="4" fill="rgb(245,158,11)" />
                <circle cx={cx} cy={cy} r="2" fill="rgb(10,10,12)" />
                <g transform={`translate(${tooltipX}, ${Math.max(8, cy - 30)})`}>
                  <rect width="100" height="42" rx="4" fill="rgb(15,15,18)" stroke="rgb(63,63,70)" strokeWidth="0.5" />
                  <text x="8" y="16" fontSize="11" fill="rgb(245,158,11)" fontFamily="ui-monospace, monospace" fontWeight="600">
                    ${s.v.toFixed(2)}
                  </text>
                  <text x="8" y="32" fontSize="9" fill="rgb(161,161,170)" fontFamily="ui-monospace, monospace">
                    {new Date(s.t).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                  </text>
                </g>
              </>
            )
          })()}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-3 px-5 pb-5 pt-2 border-t border-zinc-900/50">
        <FooterStat label="Inicio" value={`$${firstV.toFixed(2)}`} />
        <FooterStat label="Pico" value={`$${peakV.toFixed(2)}`} accent="amber" />
        <FooterStat
          label="Ahora"
          value={`$${lastV.toFixed(2)}`}
          accent={isProfit ? "emerald" : "red"}
          sub={firstV > 0 ? `${isProfit ? "+" : ""}${totalReturn.toFixed(2)}%` : undefined}
        />
      </div>
    </div>
  )
}

function FooterStat({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: "amber" | "emerald" | "red"
}) {
  const valColor =
    accent === "amber" ? "text-amber-300" :
    accent === "emerald" ? "text-emerald-400" :
    accent === "red" ? "text-red-400" :
    "text-zinc-100"
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">{label}</p>
      <p className={cn("text-base font-bold tabular-nums", valColor)}>{value}</p>
      {sub && (
        <p className={cn("text-[10px] tabular-nums mt-0.5", valColor)}>{sub}</p>
      )}
    </div>
  )
}
