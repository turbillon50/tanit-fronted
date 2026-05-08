"use client"

import { useEffect, useState } from "react"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { api, type BalanceSnapshot } from "@/lib/api"
import { cn } from "@/lib/utils"

/**
 * Curva de equity en vivo — la "curva infinita" que Luis quiere ver siempre.
 *
 * Carga snapshots de balance del backend (`/api/tanit/balance-snapshots`) y los
 * pinta como area chart minimalista. Auto-refresh cada 15s.
 *
 * Estética: dark, una sola serie, gradiente ámbar suave en el fill, línea fina
 * en el stroke. Sin grids, sin labels invasivos. Tooltip discreto.
 */
export function EquityCurve({ className, height = 180 }: { className?: string; height?: number }) {
  const [snaps, setSnaps] = useState<BalanceSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const r = await api.balanceSnapshots(500)
        if (!mounted) return
        setSnaps(r.snapshots ?? [])
        setError(null)
      } catch (e) {
        if (!mounted) return
        setError(e instanceof Error ? e.message : "Error cargando curva")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 15_000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  const data = snaps
    .slice()
    .reverse()
    .map((s) => ({
      ts: s.createdAt,
      equity: parseFloat(s.equity ?? s.balance ?? "0") || 0,
    }))

  const first = data[0]?.equity ?? 0
  const last = data[data.length - 1]?.equity ?? 0
  const delta = last - first
  const deltaPct = first > 0 ? (delta / first) * 100 : 0
  const positive = delta >= 0

  return (
    <div className={cn("rounded-xl border border-zinc-900/80 bg-zinc-950/40 p-4", className)}>
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Equity</span>
          <span className="text-2xl font-semibold tabular-nums text-zinc-100 mt-0.5">
            {loading && data.length === 0 ? "—" : `$${last.toFixed(2)}`}
          </span>
        </div>
        {data.length > 1 && (
          <div className={cn("text-xs tabular-nums font-medium", positive ? "text-emerald-400" : "text-rose-400")}>
            {positive ? "+" : ""}${delta.toFixed(2)} ({positive ? "+" : ""}{deltaPct.toFixed(2)}%)
          </div>
        )}
      </div>

      <div style={{ width: "100%", height }}>
        {error ? (
          <div className="h-full flex items-center justify-center text-xs text-rose-400/80 px-3 text-center">
            {error}
          </div>
        ) : data.length < 2 ? (
          <div className="h-full flex items-center justify-center text-xs text-zinc-600">
            {loading ? "cargando…" : "construyendo histórico…"}
          </div>
        ) : (
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <defs>
                <linearGradient id="eqfill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="ts" hide />
              <YAxis domain={["dataMin", "dataMax"]} hide />
              <Tooltip
                cursor={{ stroke: "#52525b", strokeWidth: 1, strokeDasharray: "2 2" }}
                contentStyle={{
                  background: "#09090b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  fontSize: "11px",
                }}
                labelStyle={{ color: "#a1a1aa", fontSize: "10px" }}
                itemStyle={{ color: "#fafafa" }}
                formatter={(v: number) => [`$${v.toFixed(4)}`, "equity"]}
                labelFormatter={(ts: string) => new Date(ts).toLocaleString()}
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="#f59e0b"
                strokeWidth={1.5}
                fill="url(#eqfill)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
