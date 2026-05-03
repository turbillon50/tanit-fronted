"use client"

import { useEffect, useState } from "react"
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
          api.balanceSnapshots(200).catch(() => null),
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
    const id = setInterval(load, 15000)
    return () => { mounted = false; clearInterval(id) }
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
    const fullSeries = [...snapshots, { id: -1, balance: String(lastBal), equity: null, available: null, note: null, created_at: new Date().toISOString() }]
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

        {/* Equity Curve */}
        <div className="glass-panel rounded-xl p-5">
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Equity Curve
          </h2>
          {curvePoints.length === 0 ? (
            <p className="text-xs text-muted-foreground">Cargando snapshots…</p>
          ) : (
            <div className="relative h-48 w-full">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                <path d={path} fill="none" stroke="currentColor" strokeWidth="0.6" className="text-primary" />
                <path d={path + ` L 100 100 L 0 100 Z`} fill="currentColor" opacity="0.1" className="text-primary" />
              </svg>
              <div className="absolute top-2 left-2 text-[10px] text-muted-foreground">
                Peak ${peakBal.toFixed(2)}
              </div>
              <div className="absolute bottom-2 left-2 text-[10px] text-muted-foreground">
                ${Math.min(...curvePoints.map((p) => p.v)).toFixed(2)}
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
              <p className="text-[10px] text-muted-foreground uppercase">Hoy</p>
              <p className={`text-sm font-bold ${totalReturn >= 0 ? "text-success" : "text-destructive"}`}>
                ${lastBal.toFixed(2)} ({totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(2)}%)
              </p>
            </div>
          </div>
        </div>

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
