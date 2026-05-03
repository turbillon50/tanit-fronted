"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { MetricsCard } from "@/components/dashboard/metrics-card"
import { Shield, AlertTriangle, Activity } from "lucide-react"
import { api, type PortfolioPosition, type PortfolioBalance, type PortfolioStats } from "@/lib/api"

export default function PositionsPage() {
  const [positions, setPositions] = useState<PortfolioPosition[]>([])
  const [balance, setBalance] = useState<PortfolioBalance | null>(null)
  const [stats, setStats] = useState<PortfolioStats | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [p, b, s] = await Promise.all([
          api.positions().catch(() => []),
          api.balance().catch(() => null),
          api.stats().catch(() => null),
        ])
        if (!mounted) return
        setPositions(p)
        if (b) setBalance(b)
        if (s) setStats(s)
      } catch {}
    }
    load()
    const id = setInterval(load, 8000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  // Compute real metrics
  const totalNotional = positions.reduce(
    (s, p) => s + Math.abs(p.size * p.entryPrice),
    0,
  )
  const totalUnrealized = positions.reduce((s, p) => s + p.unrealizedPnl, 0)
  const equity = balance?.totalEquity ?? 0
  const marginUsed = equity - (balance?.availableBalance ?? 0)
  const marginPct = equity > 0 ? Math.round((marginUsed / equity) * 100) : 0
  const maxLev = positions.length > 0 ? Math.max(...positions.map((p) => p.leverage)) : 0

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold chrome-text">Positions & Risk</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Posiciones en vivo de Bybit · {positions.length} abiertas
          </p>
        </div>

        {/* Risk Metrics — REAL */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            title="Total Exposure"
            value={`$${totalNotional.toFixed(2)}`}
            subtitle={`${positions.length} posiciones abiertas`}
          />
          <MetricsCard
            title="Margin Usage"
            value={`$${marginUsed.toFixed(2)}`}
            change={`${marginPct}%`}
          />
          <MetricsCard
            title="Unrealized PnL"
            value={`${totalUnrealized >= 0 ? "+" : ""}$${totalUnrealized.toFixed(4)}`}
            change={`Equity $${equity.toFixed(2)}`}
          />
          <MetricsCard
            title="Max Leverage"
            value={maxLev > 0 ? `${maxLev}x` : "—"}
            change={maxLev > 20 ? "⚠️ Alto" : maxLev > 10 ? "Medio" : "Bajo"}
          />
        </div>

        {/* Positions Table — REAL */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2 bg-gradient-to-r from-primary/5 to-transparent">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Open Positions</h2>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary">
              {positions.length}
            </span>
          </div>

          {positions.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No open positions.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Tanit está escaneando 24 símbolos cada 3 segundos.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/20 text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Symbol</th>
                    <th className="text-left px-4 py-2 font-medium">Side</th>
                    <th className="text-right px-4 py-2 font-medium">Size</th>
                    <th className="text-right px-4 py-2 font-medium">Entry</th>
                    <th className="text-right px-4 py-2 font-medium">Mark</th>
                    <th className="text-right px-4 py-2 font-medium">Lev</th>
                    <th className="text-right px-4 py-2 font-medium">PnL</th>
                    <th className="text-right px-4 py-2 font-medium">Liq</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p) => {
                    const isLong = p.side === "Buy"
                    const pnlColor = p.unrealizedPnl >= 0 ? "text-success" : "text-destructive"
                    const isHighLev = p.leverage > 20
                    return (
                      <tr key={p.symbol} className="border-t border-border/20 hover:bg-muted/10">
                        <td className="px-4 py-2 font-bold text-foreground">
                          {p.symbol.replace("USDT", "")}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={
                              isLong
                                ? "px-2 py-0.5 rounded text-[10px] font-bold bg-success/15 text-success"
                                : "px-2 py-0.5 rounded text-[10px] font-bold bg-destructive/15 text-destructive"
                            }
                          >
                            {isLong ? "LONG" : "SHORT"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right font-mono">{p.size}</td>
                        <td className="px-4 py-2 text-right font-mono">{p.entryPrice}</td>
                        <td className="px-4 py-2 text-right font-mono">{p.markPrice}</td>
                        <td className={`px-4 py-2 text-right font-bold ${isHighLev ? "text-warning" : "text-foreground"}`}>
                          {p.leverage}x
                        </td>
                        <td className={`px-4 py-2 text-right font-bold ${pnlColor}`}>
                          {p.unrealizedPnl >= 0 ? "+" : ""}${p.unrealizedPnl.toFixed(4)}
                        </td>
                        <td className="px-4 py-2 text-right font-mono text-warning">
                          {p.liquidationPrice.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Performance Summary */}
        {stats && stats.totalTrades > 0 && (
          <div className="glass-panel rounded-xl p-5">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Performance histórica
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Trades</p>
                <p className="text-lg font-bold">{stats.totalTrades}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Win Rate</p>
                <p className="text-lg font-bold">{stats.winRate}%</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Profit Factor</p>
                <p className={`text-lg font-bold ${stats.profitFactor >= 1 ? "text-success" : "text-destructive"}`}>
                  {stats.profitFactor.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Total PnL</p>
                <p className={`text-lg font-bold ${stats.totalPnl >= 0 ? "text-success" : "text-destructive"}`}>
                  {stats.totalPnl >= 0 ? "+" : ""}${stats.totalPnl.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning if any leverage is too high */}
        {maxLev > 20 && (
          <div className="glass-panel rounded-xl p-4 border border-warning/30 bg-warning/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-warning">Alto leverage detectado</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Una posición está a {maxLev}x. Verifica que sea intencional. Recuerda la lección crítica
                  del 22 de abril: leverage sin cooldown destruyó el capital.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
