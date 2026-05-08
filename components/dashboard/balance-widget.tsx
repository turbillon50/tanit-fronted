"use client"

import { useEffect, useState } from "react"
import { api, type PortfolioBalance } from "@/lib/api"
import { cn } from "@/lib/utils"

/**
 * Widget compacto de balance — números crudos, auto-refresh 10s.
 * Equity, available, unrealized PnL.
 */
export function BalanceWidget({ className }: { className?: string }) {
  const [b, setB] = useState<PortfolioBalance | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await api.balance()
        if (!mounted) return
        setB(data)
        setError(null)
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "—")
      }
    }
    load()
    const id = setInterval(load, 10_000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  if (error) {
    return (
      <div className={cn("rounded-xl border border-zinc-900/80 bg-zinc-950/40 p-4", className)}>
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Bybit</span>
        <p className="text-xs text-rose-400/80 mt-2">{error}</p>
      </div>
    )
  }

  const equity = b?.totalEquity ?? 0
  const available = b?.availableBalance ?? 0
  const upnl = b?.unrealizedPnl ?? 0
  const upnlPositive = upnl >= 0

  return (
    <div className={cn("rounded-xl border border-zinc-900/80 bg-zinc-950/40 p-4 space-y-3", className)}>
      <div>
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Disponible</span>
        <p className="text-base font-medium tabular-nums text-zinc-200 mt-0.5">
          {b ? `$${available.toFixed(2)}` : "—"}
        </p>
      </div>
      <div>
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">PnL no realizado</span>
        <p className={cn(
          "text-base font-medium tabular-nums mt-0.5",
          b ? (upnlPositive ? "text-emerald-400" : "text-rose-400") : "text-zinc-200"
        )}>
          {b ? `${upnlPositive ? "+" : ""}$${upnl.toFixed(4)}` : "—"}
        </p>
      </div>
    </div>
  )
}
