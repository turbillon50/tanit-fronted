"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Activity, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"

interface DashboardData {
  balance: number | null
  positions: Array<{
    symbol: string
    side: "Buy" | "Sell"
    size: number
    entryPrice: number
    markPrice: number
    unrealizedPnl: number
    leverage: number
    stopLoss?: number | null
  }> | null
  motor: {
    hasCampaign: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    campaign: any | null
    timeLeftMinutes: number | null
  } | null
  killSwitch: boolean
  wsSymbols: number
  recentReports: Array<{
    id: number
    category: string
    importance: string | null
    content: string
    createdAt: string
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    balance: null,
    positions: null,
    motor: null,
    killSwitch: false,
    wsSymbols: 0,
    recentReports: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [bal, pos, motor, ks, ws, reports] = await Promise.all([
          api.balance().catch(() => null),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          api.positions().catch(() => null) as Promise<any>,
          api.motorEjecutorStatus().catch(() => null),
          api.killSwitch().catch(() => null),
          api.wsStatus().catch(() => null),
          api.reports(7).catch(() => null),
        ])
        if (!mounted) return
        setData({
          balance: bal?.totalEquity ?? null,
          positions: Array.isArray(pos) ? pos : null,
          motor: motor?.motor ?? null,
          killSwitch: !!ks?.active,
          wsSymbols: ws?.count ?? 0,
          recentReports: reports?.reports?.slice(0, 10) ?? [],
        })
      } catch {}
      finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 5_000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  const totalPnl = data.positions?.reduce((s, p) => s + (p.unrealizedPnl ?? 0), 0) ?? 0

  return (
    <MainLayout>
      <div className="h-[calc(100vh-3rem)] overflow-y-auto p-6 lg:p-8 space-y-6 pt-16 lg:pt-6">
        <h1 className="text-2xl font-medium text-zinc-100">Dashboard</h1>

        {/* Top cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card label="Equity" value={data.balance != null ? `$${data.balance.toFixed(2)}` : loading ? "…" : "—"} icon={<TrendingUp className="h-4 w-4" />} />
          <Card label="PnL no realizado" value={`${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(4)}`} icon={totalPnl >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-400" /> : <TrendingDown className="h-4 w-4 text-rose-400" />} tone={totalPnl >= 0 ? "ok" : "bad"} />
          <Card label="Posiciones" value={String(data.positions?.length ?? 0)} icon={<Activity className="h-4 w-4" />} />
          <Card label="Kill Switch" value={data.killSwitch ? "ACTIVO" : "off"} icon={<AlertTriangle className="h-4 w-4" />} tone={data.killSwitch ? "bad" : "ok"} />
        </div>

        {/* Motor Ejecutor */}
        <Section title="Motor Ejecutor (campaign activa)">
          {data.motor?.hasCampaign && data.motor.campaign ? (
            <div className="text-sm space-y-1 text-zinc-300">
              <p><b>Símbolo:</b> {data.motor.campaign.symbol} {data.motor.campaign.direction.toUpperCase()}</p>
              <p><b>Leverage:</b> {data.motor.campaign.leverage}x</p>
              <p><b>SL:</b> ${data.motor.campaign.slPrice} {data.motor.campaign.tp1Price ? `· TP1: $${data.motor.campaign.tp1Price}` : ""}</p>
              <p><b>Frecuencia:</b> cada {data.motor.campaign.frequencySeconds}s · Quedan {data.motor.timeLeftMinutes?.toFixed(1)} min</p>
              <p><b>Trades:</b> {data.motor.campaign.tradesExecuted} ejecutados / {data.motor.campaign.tradesFailed} fallidos / cap {data.motor.campaign.maxTrades}</p>
              <p className="text-xs text-zinc-500 italic">Razón: {data.motor.campaign.reason}</p>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Sin campaign activa. Tanit no ha instruido al motor todavía.</p>
          )}
        </Section>

        {/* Posiciones abiertas */}
        <Section title="Posiciones abiertas">
          {data.positions && data.positions.length > 0 ? (
            <div className="space-y-2">
              {data.positions.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-md bg-zinc-900/60 px-3 py-2 text-sm">
                  <div>
                    <span className="font-medium text-zinc-200">{p.symbol}</span>
                    <span className={cn("ml-2 text-xs px-2 py-0.5 rounded", p.side === "Buy" ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300")}>
                      {p.side === "Buy" ? "LONG" : "SHORT"}
                    </span>
                    <span className="ml-2 text-xs text-zinc-500">{p.leverage}x · qty {p.size}</span>
                  </div>
                  <div className="text-right">
                    <div className={cn("font-medium", p.unrealizedPnl >= 0 ? "text-emerald-400" : "text-rose-400")}>
                      {p.unrealizedPnl >= 0 ? "+" : ""}${p.unrealizedPnl.toFixed(4)}
                    </div>
                    <div className="text-[11px] text-zinc-500">entry ${p.entryPrice} → mark ${p.markPrice}</div>
                    {p.stopLoss == null || p.stopLoss === 0 ? (
                      <div className="text-[11px] text-amber-400">⚠ sin SL</div>
                    ) : (
                      <div className="text-[11px] text-zinc-500">SL ${p.stopLoss}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Sin posiciones.</p>
          )}
        </Section>

        {/* Reportes recientes */}
        <Section title="Reportes recientes (últimos 7 días)" badge={`${data.recentReports.length}`}>
          {data.recentReports.length > 0 ? (
            <div className="space-y-2">
              {data.recentReports.map((r) => (
                <div key={r.id} className="rounded-md bg-zinc-900/60 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/15 text-primary font-medium">{r.category}</span>
                    <span className="text-xs text-zinc-500">{new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-zinc-300 text-[13px] leading-snug">{r.content.length > 400 ? r.content.slice(0, 400) + "…" : r.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Sin reportes nuevos. Tanit los guardará aquí cuando los genere.</p>
          )}
        </Section>

        {/* Footer info */}
        <div className="text-xs text-zinc-600 pt-4">
          WebSocket Bybit: <b>{data.wsSymbols}</b> símbolos · refresh cada 5s
        </div>
      </div>
    </MainLayout>
  )
}

function Card({ label, value, icon, tone = "neutral" }: { label: string; value: string; icon?: React.ReactNode; tone?: "ok" | "bad" | "neutral" }) {
  return (
    <div className={cn(
      "rounded-lg p-4 border",
      tone === "ok" ? "bg-emerald-500/5 border-emerald-500/20" :
      tone === "bad" ? "bg-rose-500/5 border-rose-500/20" :
      "bg-zinc-900/60 border-zinc-800",
    )}>
      <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-1">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-medium text-zinc-100">{value}</div>
    </div>
  )
}

function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-zinc-200">{title}</h2>
        {badge && <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{badge}</span>}
      </div>
      {children}
    </div>
  )
}
