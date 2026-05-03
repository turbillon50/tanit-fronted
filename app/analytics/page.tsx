"use client"

import { useEffect, useRef, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { TrendingUp, BarChart3, Target, Zap } from "lucide-react"
import { api, type PortfolioStats, type BalanceSnapshot, type PortfolioPosition, type PortfolioBalance } from "@/lib/api"

export default function AnalyticsPage() {
  const [stats, setStats] = useState<PortfolioStats | null>(null)
  const [snapshots, setSnapshots] = useState<BalanceSnapshot[]>([])
  const [balance, setBalance] = useState<PortfolioBalance | null>(null)
  const [positions, setPositions] = useState<PortfolioPosition[]>([])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [s, sn, b, p] = await Promise.all([
          api.stats().catch(() => null),
          api.balanceSnapshots(500).catch(() => null),
          api.balance().catch(() => null),
          api.positions().catch(() => []),
        ])
        if (!mounted) return
        if (s) setStats(s)
        if (sn) setSnapshots(sn.snapshots ?? [])
        if (b) setBalance(b)
        setPositions(p)
      } catch {}
    }
    load()
    // Auto-refresh balance + positions every 5s for live feel; full snapshot reload every 30s
    const fastTimer = setInterval(async () => {
      try {
        const [b, p] = await Promise.all([
          api.balance().catch(() => null),
          api.positions().catch(() => []),
        ])
        if (!mounted) return
        if (b) setBalance(b)
        setPositions(p)
      } catch {}
    }, 5000)
    const slowTimer = setInterval(load, 30000)
    return () => { mounted = false; clearInterval(fastTimer); clearInterval(slowTimer) }
  }, [])

  // Equity curve from snapshots
  const firstBal = snapshots[0] ? parseFloat(snapshots[0].balance) : 0
  const lastBal = balance?.totalEquity ?? (snapshots[snapshots.length - 1] ? parseFloat(snapshots[snapshots.length - 1].balance) : 0)
  const peakBal = snapshots.length > 0 ? Math.max(...snapshots.map((s) => parseFloat(s.balance)), lastBal) : lastBal
  const totalReturn = firstBal > 0 ? ((lastBal - firstBal) / firstBal) * 100 : 0
  const drawdown = peakBal > 0 ? ((peakBal - lastBal) / peakBal) * 100 : 0

  // Build SVG path for equity curve
  const curvePoints: { x: number; y: number; v: number }[] = []
  if (snapshots.length > 0) {
    const allValues = [...snapshots.map((s) => parseFloat(s.balance)), lastBal]
    const min = Math.min(...allValues)
    const max = Math.max(...allValues)
    const range = max - min || 1
    const fullSeries = [...snapshots, { id: -1, balance: String(lastBal), equity: null, available: null, note: null, createdAt: new Date().toISOString() }]
    fullSeries.forEach((s, i) => {
      const x = (i / (fullSeries.length - 1 || 1)) * 100
      const y = 100 - ((parseFloat(s.balance) - min) / range) * 100
      curvePoints.push({ x, y, v: parseFloat(s.balance) })
    })
  }
  const path = curvePoints.length > 0
    ? "M " + curvePoints.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" L ")
    : ""

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold chrome-text flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-primary" />
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Performance real desde {snapshots.length} snapshots de balance
          </p>
        </div>

        {/* Top metrics — REAL */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Return"
            value={firstBal > 0 ? `${totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)}%` : "—"}
            change={firstBal > 0 ? `Started $${firstBal.toFixed(2)}` : "Awaiting first snapshot"}
            positive={totalReturn >= 0}
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <MetricCard
            title="Current Equity"
            value={`$${lastBal.toFixed(2)}`}
            change={`Peak $${peakBal.toFixed(2)}`}
            positive={true}
            icon={<Target className="h-4 w-4" />}
          />
          <MetricCard
            title="Drawdown"
            value={`${drawdown.toFixed(2)}%`}
            change={drawdown < 5 ? "Healthy" : drawdown < 15 ? "Watch" : "Critical"}
            positive={drawdown < 5}
            icon={<Zap className="h-4 w-4" />}
          />
          <MetricCard
            title="Win Rate"
            value={stats ? `${stats.winRate}%` : "—"}
            change={stats ? `${stats.totalTrades} trades · PF ${stats.profitFactor.toFixed(2)}` : "Loading"}
            positive={stats ? stats.winRate >= 40 : true}
            icon={<BarChart3 className="h-4 w-4" />}
          />
        </div>

        {/* Equity Curve — interactive: pinch to zoom, drag to pan */}
        <EquityCurveCard
          snapshots={snapshots}
          liveEquity={lastBal}
          firstBal={firstBal}
          peakBal={peakBal}
          totalReturn={totalReturn}
        />

        {/* Stats grid */}
        {stats && (
          <div className="glass-panel rounded-xl p-5">
            <h2 className="text-sm font-bold text-foreground mb-4">Performance Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat label="Total Trades" value={String(stats.totalTrades)} />
              <Stat label="Win Rate" value={`${stats.winRate}%`} />
              <Stat label="Profit Factor" value={stats.profitFactor.toFixed(2)} />
              <Stat label="Total PnL" value={`${stats.totalPnl >= 0 ? "+" : ""}$${stats.totalPnl.toFixed(4)}`} />
              <Stat label="Avg Win" value={`+$${stats.avgWin.toFixed(4)}`} />
              <Stat label="Avg Loss" value={`$${stats.avgLoss.toFixed(4)}`} />
              <Stat label="Best Trade" value={`+$${stats.bestTrade.toFixed(4)}`} />
              <Stat label="Worst Trade" value={`$${stats.worstTrade.toFixed(4)}`} />
            </div>
            <div className="mt-4 pt-4 border-t border-border/30">
              <p className="text-[10px] text-muted-foreground uppercase">Current Streak</p>
              <p
                className={`text-lg font-bold ${
                  stats.currentStreak > 0
                    ? "text-success"
                    : stats.currentStreak < 0
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {stats.currentStreak === 0
                  ? "—"
                  : stats.currentStreak > 0
                  ? `🟢 ${stats.currentStreak} wins en racha`
                  : `🔴 ${Math.abs(stats.currentStreak)} losses en racha`}
              </p>
            </div>
          </div>
        )}

        {/* Open positions snapshot */}
        {positions.length > 0 && (
          <div className="glass-panel rounded-xl p-5">
            <h2 className="text-sm font-bold text-foreground mb-3">
              Posiciones abiertas ahora ({positions.length})
            </h2>
            <ul className="space-y-1.5">
              {positions.map((p) => (
                <li key={p.symbol} className="flex items-center justify-between text-xs">
                  <span className="font-mono">
                    {p.symbol.replace("USDT", "")} · {p.side === "Buy" ? "LONG" : "SHORT"} {p.leverage}x
                  </span>
                  <span className={p.unrealizedPnl >= 0 ? "text-success" : "text-destructive"}>
                    {p.unrealizedPnl >= 0 ? "+" : ""}${p.unrealizedPnl.toFixed(4)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

/* ── Interactive Equity Curve — TIME-AXIS, pinch + pan + timeframe presets ─ */
type Timeframe = "1H" | "6H" | "24H" | "7D" | "30D" | "ALL"
const TIMEFRAME_MS: Record<Timeframe, number | null> = {
  "1H":  60 * 60 * 1000,
  "6H":  6 * 60 * 60 * 1000,
  "24H": 24 * 60 * 60 * 1000,
  "7D":  7 * 24 * 60 * 60 * 1000,
  "30D": 30 * 24 * 60 * 60 * 1000,
  "ALL": null,
}

function EquityCurveCard({
  snapshots,
  liveEquity,
  firstBal,
  peakBal,
  totalReturn,
}: {
  snapshots: BalanceSnapshot[]
  liveEquity: number
  firstBal: number
  peakBal: number
  totalReturn: number
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [timeframe, setTimeframe] = useState<Timeframe>("ALL")
  // Window in milliseconds — overridden by pinch zoom inside the timeframe.
  const [windowMs, setWindowMs] = useState<number | null>(null)
  // Pan: ms offset from "now" (0 = right edge is now; positive = window slides into past)
  const [panMs, setPanMs] = useState(0)

  const pointerStateRef = useRef<{
    pointers: Map<number, { x: number; y: number }>
    initialDistance: number | null
    initialWindowMs: number | null
    panStart: number | null
    panInitialMs: number
  }>({ pointers: new Map(), initialDistance: null, initialWindowMs: null, panStart: null, panInitialMs: 0 })

  // All points sorted by time, plus the current live equity at "now"
  const allPoints: { t: number; v: number }[] = []
  for (const s of snapshots) {
    const t = new Date(s.createdAt).getTime()
    if (!Number.isFinite(t)) continue
    allPoints.push({ t, v: parseFloat(s.balance) })
  }
  allPoints.sort((a, b) => a.t - b.t)
  const now = Date.now()
  if (liveEquity > 0) allPoints.push({ t: now, v: liveEquity })

  // Determine the time window
  const presetMs = TIMEFRAME_MS[timeframe]
  const effectiveWindowMs = windowMs
    ?? presetMs
    ?? (allPoints.length > 0 ? now - allPoints[0].t : 60_000)

  const tEnd = now - panMs
  const tStart = tEnd - effectiveWindowMs
  const visible = allPoints.filter((p) => p.t >= tStart && p.t <= tEnd)

  // Build SVG path against TIME on x-axis (so density honors real elapsed seconds)
  let path = ""
  let minV = 0, maxV = 0
  if (visible.length > 0) {
    const values = visible.map((p) => p.v)
    minV = Math.min(...values)
    maxV = Math.max(...values)
    const range = maxV - minV || 1
    path = "M " + visible.map((p) => {
      const x = ((p.t - tStart) / effectiveWindowMs) * 100
      const y = 100 - ((p.v - minV) / range) * 100
      return `${x.toFixed(2)} ${y.toFixed(2)}`
    }).join(" L ")
  }

  function setPreset(tf: Timeframe) {
    setTimeframe(tf)
    setWindowMs(null)
    setPanMs(0)
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    const s = pointerStateRef.current
    s.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (s.pointers.size === 2) {
      const [a, b] = Array.from(s.pointers.values())
      s.initialDistance = Math.hypot(a.x - b.x, a.y - b.y)
      s.initialWindowMs = effectiveWindowMs
    } else if (s.pointers.size === 1) {
      s.panStart = e.clientX
      s.panInitialMs = panMs
    }
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const s = pointerStateRef.current
    if (!s.pointers.has(e.pointerId)) return
    s.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (s.pointers.size === 2 && s.initialDistance && s.initialWindowMs) {
      const [a, b] = Array.from(s.pointers.values())
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      // pinch out (dist grows) → window shrinks → zoom IN
      const ratio = s.initialDistance / dist
      const minWindow = 60_000  // 1 minute floor
      const maxWindow = allPoints.length > 0 ? now - allPoints[0].t : 24 * 3600_000
      const newWindow = Math.max(minWindow, Math.min(maxWindow, s.initialWindowMs * ratio))
      setWindowMs(newWindow)
    } else if (s.pointers.size === 1 && s.panStart !== null && containerRef.current) {
      const w = containerRef.current.clientWidth
      const dx = e.clientX - s.panStart
      // drag right → see older data (panMs increases)
      const dms = -(dx / w) * effectiveWindowMs
      setPanMs(Math.max(0, s.panInitialMs + dms))
    }
  }

  function onPointerEnd(e: React.PointerEvent<HTMLDivElement>) {
    const s = pointerStateRef.current
    s.pointers.delete(e.pointerId)
    if (s.pointers.size < 2) { s.initialDistance = null; s.initialWindowMs = null }
    if (s.pointers.size === 0) s.panStart = null
  }

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    e.preventDefault()
    const factor = e.deltaY > 0 ? 1.2 : 1 / 1.2
    const minWindow = 60_000
    const maxWindow = allPoints.length > 0 ? now - allPoints[0].t : 24 * 3600_000
    setWindowMs(Math.max(minWindow, Math.min(maxWindow, effectiveWindowMs * factor)))
  }

  function resetView() {
    setWindowMs(null)
    setPanMs(0)
  }

  function fmtWindow(ms: number): string {
    if (ms < 90_000) return `${Math.round(ms / 1000)}s`
    if (ms < 90 * 60_000) return `${Math.round(ms / 60_000)}min`
    if (ms < 36 * 3600_000) return `${(ms / 3600_000).toFixed(1)}h`
    return `${(ms / 86400_000).toFixed(1)}d`
  }

  return (
    <div className="glass-panel rounded-xl p-5">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Equity Curve
          <span className="text-[10px] text-muted-foreground font-normal ml-1">
            · {snapshots.length} snapshots · live
          </span>
        </h2>
        <button
          onClick={resetView}
          className="px-2 py-1 rounded bg-muted/40 hover:bg-muted/60 text-xs"
          aria-label="Reset"
          title="Reset view"
        >⟲</button>
      </div>

      {/* Timeframe presets — separa la vista histórica de la minuto-a-minuto */}
      <div className="flex gap-1 mb-3 overflow-x-auto">
        {(Object.keys(TIMEFRAME_MS) as Timeframe[]).map((tf) => (
          <button
            key={tf}
            onClick={() => setPreset(tf)}
            className={
              "px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex-shrink-0 " +
              (timeframe === tf && windowMs === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/60")
            }
          >
            {tf}
          </button>
        ))}
      </div>

      {allPoints.length === 0 ? (
        <p className="text-xs text-muted-foreground">Cargando snapshots…</p>
      ) : (
        <div
          ref={containerRef}
          className="relative h-56 w-full touch-none select-none cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onPointerLeave={onPointerEnd}
          onWheel={onWheel}
          style={{ touchAction: "none" }}
        >
          {visible.length >= 2 ? (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              <path d={path} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              <path d={path + " L 100 100 L 0 100 Z"} fill="currentColor" opacity="0.12" className="text-primary" />
            </svg>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[11px] text-muted-foreground">
              Sin datos en esta ventana — prueba otro timeframe
            </div>
          )}
          <div className="absolute top-2 left-2 text-[10px] text-muted-foreground font-mono">
            ${maxV.toFixed(2)}
          </div>
          <div className="absolute bottom-2 left-2 text-[10px] text-muted-foreground font-mono">
            ${minV.toFixed(2)}
          </div>
          <div className="absolute top-2 right-2 text-[10px] text-muted-foreground">
            ventana {fmtWindow(effectiveWindowMs)} · {visible.length} pts
          </div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase">Inicio</p>
          <p className="text-sm font-bold">${firstBal.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase">Pico</p>
          <p className="text-sm font-bold">${peakBal.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase">Ahora</p>
          <p className={`text-sm font-bold ${totalReturn >= 0 ? "text-success" : "text-destructive"}`}>
            ${liveEquity.toFixed(2)} ({totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(2)}%)
          </p>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground/60 mt-2">
        💡 Pellizca con dos dedos para zoom fino · Arrastra para mover en el tiempo · Botones de timeframe para saltar rápido · Rueda del mouse en escritorio
      </p>
    </div>
  )
}

function MetricCard({
  title,
  value,
  change,
  positive,
  icon,
}: {
  title: string
  value: string
  change: string
  positive: boolean
  icon: React.ReactNode
}) {
  return (
    <div className="glass-panel rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className={`p-1.5 rounded-lg ${positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold chrome-text">{value}</p>
      <p className={`text-[10px] mt-1 ${positive ? "text-success" : "text-muted-foreground"}`}>{change}</p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
      <p className="text-sm font-bold mt-0.5">{value}</p>
    </div>
  )
}
