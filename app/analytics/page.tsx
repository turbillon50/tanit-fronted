"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { TrendingUp, BarChart3, Target, Zap, Activity, Flame } from "lucide-react"
import { api, type PortfolioStats, type BalanceSnapshot, type PortfolioPosition, type PortfolioBalance } from "@/lib/api"
import {
  MetricCard,
  healthFromDrawdown,
  healthFromWinRate,
  healthFromProfitFactor,
  healthFromReturn,
  formatUsd,
} from "@/components/analytics/metric-card"
import { EquityCurve } from "@/components/analytics/equity-curve"

export default function AnalyticsPage() {
  const [stats, setStats] = useState<PortfolioStats | null>(null)
  const [snapshots, setSnapshots] = useState<BalanceSnapshot[]>([])
  const [balance, setBalance] = useState<PortfolioBalance | null>(null)
  const [positions, setPositions] = useState<PortfolioPosition[]>([])
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())

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
        setLastUpdate(Date.now())
      } catch {}
    }
    load()
    const fastTimer = setInterval(async () => {
      try {
        const [b, p] = await Promise.all([
          api.balance().catch(() => null),
          api.positions().catch(() => []),
        ])
        if (!mounted) return
        if (b) setBalance(b)
        setPositions(p)
        setLastUpdate(Date.now())
      } catch {}
    }, 5000)
    const slowTimer = setInterval(load, 30000)
    return () => { mounted = false; clearInterval(fastTimer); clearInterval(slowTimer) }
  }, [])

  const firstBal = snapshots[0] ? parseFloat(snapshots[0].balance) : 0
  const lastBal = balance?.totalEquity ?? (snapshots[snapshots.length - 1] ? parseFloat(snapshots[snapshots.length - 1].balance) : 0)
  const peakBal = snapshots.length > 0 ? Math.max(...snapshots.map((s) => parseFloat(s.balance)), lastBal) : lastBal
  const totalReturn = firstBal > 0 ? ((lastBal - firstBal) / firstBal) * 100 : 0
  const drawdown = peakBal > 0 ? ((peakBal - lastBal) / peakBal) * 100 : 0
  const totalPnl = stats?.totalPnl ?? 0

  // Sparklines from recent snapshots
  const recentBalances = snapshots.slice(-30).map((s) => parseFloat(s.balance))

  return (
    <MainLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 border-b border-zinc-900 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-amber-400" />
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Analytics</h1>
            </div>
            <p className="text-xs text-zinc-500 mt-1 tracking-wide">
              <span className="text-zinc-400">{snapshots.length}</span> snapshots ·
              <span className="text-zinc-400 ml-1">{stats?.totalTrades ?? 0}</span> trades ·
              <span className="text-amber-400 ml-1 tabular-nums">
                actualizado {Math.floor((Date.now() - lastUpdate) / 1000)}s
              </span>
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-300">Mainnet</span>
          </div>
        </div>

        {/* Top metrics — health-aware */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            label="Total Return"
            value={firstBal > 0 ? `${totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)}%` : "—"}
            hint={firstBal > 0 ? `desde $${firstBal.toFixed(2)}` : "esperando primer snapshot"}
            health={healthFromReturn(totalReturn)}
            icon={<TrendingUp className="h-4 w-4" />}
            spark={recentBalances.length > 1 ? recentBalances : undefined}
          />
          <MetricCard
            label="Current Equity"
            value={`$${lastBal.toFixed(2)}`}
            hint={`peak $${peakBal.toFixed(2)}`}
            health="neutral"
            icon={<Target className="h-4 w-4" />}
          />
          <MetricCard
            label="Drawdown"
            value={`${drawdown.toFixed(2)}%`}
            hint={drawdown < 5 ? "Healthy" : drawdown < 15 ? "Watch" : "Critical"}
            health={healthFromDrawdown(drawdown)}
            icon={<Zap className="h-4 w-4" />}
          />
          <MetricCard
            label="Win Rate"
            value={stats ? `${stats.winRate.toFixed(1)}%` : "—"}
            hint={stats ? `${stats.totalTrades} trades · PF ${stats.profitFactor.toFixed(2)}` : "Cargando"}
            health={stats ? healthFromWinRate(stats.winRate) : "neutral"}
            icon={<BarChart3 className="h-4 w-4" />}
          />
        </div>

        {/* Equity Curve premium */}
        <EquityCurve
          snapshots={snapshots}
          currentBalance={lastBal}
          peakBalance={peakBal}
        />

        {/* Performance grid + extra stats */}
        {stats && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-400" />
                Performance Metrics
              </h2>
              {stats.currentStreak !== 0 && (
                <div
                  className={`text-[11px] font-bold tabular-nums px-2 py-1 rounded ${
                    stats.currentStreak > 0
                      ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30"
                      : "bg-red-500/10 text-red-400 ring-1 ring-red-500/30"
                  }`}
                >
                  {stats.currentStreak > 0
                    ? `🟢 ${stats.currentStreak} wins en racha`
                    : `🔴 ${Math.abs(stats.currentStreak)} losses en racha`}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <Stat label="Total Trades" value={String(stats.totalTrades)} />
              <Stat
                label="Profit Factor"
                value={stats.profitFactor.toFixed(2)}
                health={healthFromProfitFactor(stats.profitFactor)}
              />
              <Stat
                label="Total PnL"
                value={formatUsd(totalPnl, true)}
                health={totalPnl >= 0 ? "good" : "danger"}
                glow
              />
              <Stat
                label="Win Rate"
                value={`${stats.winRate.toFixed(1)}%`}
                health={healthFromWinRate(stats.winRate)}
              />
              <Stat label="Avg Win" value={formatUsd(stats.avgWin, true)} health="good" />
              <Stat label="Avg Loss" value={formatUsd(stats.avgLoss)} health="danger" />
              <Stat label="Best Trade" value={formatUsd(stats.bestTrade, true)} health="good" />
              <Stat label="Worst Trade" value={formatUsd(stats.worstTrade)} health="danger" />
            </div>
          </div>
        )}

        {/* Open positions */}
        {positions.length > 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
            <h2 className="text-sm font-bold text-zinc-100 mb-3 flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-400" />
              Posiciones abiertas
              <span className="text-zinc-500 font-normal text-xs">({positions.length})</span>
            </h2>
            <ul className="divide-y divide-zinc-900">
              {positions.map((p) => (
                <li key={p.symbol} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-zinc-100 font-bold tracking-wide">
                      {p.symbol.replace("USDT", "")}
                    </span>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                        p.side === "Buy"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {p.side === "Buy" ? "LONG" : "SHORT"}
                    </span>
                    <span className="text-[10px] text-zinc-500">{p.leverage}x</span>
                  </div>
                  <span
                    className={`tabular-nums font-bold text-sm ${
                      p.unrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
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

function Stat({
  label,
  value,
  health = "neutral",
  glow = false,
}: {
  label: string
  value: string
  health?: "good" | "neutral" | "warning" | "danger"
  glow?: boolean
}) {
  const valColor =
    health === "good" ? "text-emerald-400" :
    health === "warning" ? "text-amber-300" :
    health === "danger" ? "text-red-400" :
    "text-zinc-100"

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-1">{label}</p>
      <p
        className={`text-lg font-bold tabular-nums ${valColor} ${
          glow && health === "good" ? "drop-shadow-[0_0_8px_rgb(16,185,129,0.4)]" : ""
        } ${
          glow && health === "danger" ? "drop-shadow-[0_0_8px_rgb(239,68,68,0.4)]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  )
}
