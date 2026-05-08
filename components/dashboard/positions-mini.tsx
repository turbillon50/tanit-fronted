"use client"

import { useEffect, useState } from "react"
import { api, type PortfolioPosition } from "@/lib/api"
import { cn } from "@/lib/utils"

/**
 * Lista compacta de posiciones abiertas para sidebar derecho.
 * Auto-refresh cada 8s.
 */
export function PositionsMini({ className }: { className?: string }) {
  const [pos, setPos] = useState<PortfolioPosition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const r = await api.positions()
        if (!mounted) return
        setPos(r ?? [])
      } catch {} finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 8_000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  return (
    <div className={cn("rounded-xl border border-zinc-900/80 bg-zinc-950/40 p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Posiciones</span>
        <span className="text-[10px] tabular-nums text-zinc-600">
          {loading ? "…" : pos.length}
        </span>
      </div>

      {pos.length === 0 ? (
        <p className="text-xs text-zinc-600">{loading ? "cargando…" : "Ninguna abierta."}</p>
      ) : (
        <ul className="space-y-2">
          {pos.slice(0, 5).map((p) => {
            const upnl = p.unrealizedPnl ?? 0
            const upnlPos = upnl >= 0
            const symbol = p.symbol.replace("USDT", "")
            return (
              <li key={p.symbol} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      "w-1 h-3 rounded-full flex-shrink-0",
                      p.side === "Buy" ? "bg-emerald-400" : "bg-rose-400"
                    )}
                  />
                  <span className="font-medium text-zinc-200 truncate">{symbol}</span>
                  <span className="text-zinc-600 text-[10px]">{p.leverage}x</span>
                </div>
                <span
                  className={cn(
                    "tabular-nums font-medium",
                    upnlPos ? "text-emerald-400" : "text-rose-400"
                  )}
                >
                  {upnlPos ? "+" : ""}${upnl.toFixed(2)}
                </span>
              </li>
            )
          })}
          {pos.length > 5 && (
            <li className="text-[10px] text-zinc-600 pt-1">+{pos.length - 5} más…</li>
          )}
        </ul>
      )}
    </div>
  )
}
