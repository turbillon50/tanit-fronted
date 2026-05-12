"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Activity, ShieldAlert, Wifi, WifiOff } from "lucide-react"

/**
 * Status bar inferior fixed — siempre visible, contexto del sistema.
 *
 * Muestra:
 *  - Estado del agente Tanit (online/connecting/error)
 *  - Estado Bybit (conectado/desconectado)
 *  - Memoria activa (mensajes en mastra_messages)
 *  - Posiciones abiertas + PnL día
 *  - Indicador de kill-switch si está activo
 *
 * Auto-refresh 5s. Mobile: layout compacto, scroll horizontal.
 */
export function StatusBar() {
  const [data, setData] = useState<{
    online: boolean
    bybitOnline: boolean
    memoryCount: number
    chatCount: number
    positions: number
    pnlDay: number
    killSwitch: boolean
  }>({
    online: false,
    bybitOnline: false,
    memoryCount: 0,
    chatCount: 0,
    positions: 0,
    pnlDay: 0,
    killSwitch: false,
  })

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [s, b, p, k] = await Promise.all([
          api.state().catch(() => null),
          api.balance().catch(() => null),
          api.positions().catch(() => []),
          api.killSwitch().catch(() => null),
        ])
        if (!mounted) return
        // PnL realista: si hay posiciones abiertas, suma unrealized de cada una.
        // Si no, totalPnl de los trades recientes que el back ya calcula.
        // Antes mostraba `b?.unrealizedPnl` que solo refleja un instante del balance,
        // no del día real.
        const positionsArr = Array.isArray(p) ? p : []
        const livePnl = positionsArr.reduce((sum, pos) => sum + (pos?.unrealizedPnl ?? 0), 0)
        const tradePnl = s?.state.recentTrades.totalPnl ?? 0
        const pnlDay = positionsArr.length > 0 ? livePnl : tradePnl
        setData({
          online: !!s?.ok,
          bybitOnline: !!b,
          memoryCount: s?.state.memoryCount ?? 0,
          chatCount: s?.state.chatCount ?? 0,
          positions: positionsArr.length,
          pnlDay,
          killSwitch: !!k?.killSwitch,
        })
      } catch {}
    }
    load()
    const id = setInterval(load, 5_000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 lg:left-64 border-t border-zinc-900/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="px-4 lg:px-6 py-2 flex items-center gap-4 lg:gap-6 overflow-x-auto text-[11px]">
        {/* Tanit online */}
        <Pill
          icon={<Activity className="h-3 w-3" />}
          label="Tanit"
          value={data.online ? "online" : "off"}
          tone={data.online ? "ok" : "warn"}
        />

        {/* Bybit */}
        <Pill
          icon={data.bybitOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          label="Bybit"
          value={data.bybitOnline ? "live" : "off"}
          tone={data.bybitOnline ? "ok" : "warn"}
        />

        {/* Memoria */}
        <Pill
          label="Memoria"
          value={`${data.memoryCount} · ${data.chatCount} chats`}
          tone="muted"
        />

        {/* Posiciones */}
        <Pill
          label="Pos"
          value={String(data.positions)}
          tone={data.positions > 0 ? "accent" : "muted"}
        />

        {/* PnL */}
        <Pill
          label="PnL"
          value={`${data.pnlDay >= 0 ? "+" : ""}$${data.pnlDay.toFixed(2)}`}
          tone={data.pnlDay >= 0 ? "ok" : "bad"}
        />

        {/* Kill switch — leído de /admin/kill-switch en tiempo real */}
        {data.killSwitch && (
          <Pill
            icon={<ShieldAlert className="h-3 w-3" />}
            label="HALT"
            value="ACTIVE"
            tone="bad"
          />
        )}
      </div>
    </div>
  )
}

function Pill({
  icon,
  label,
  value,
  tone,
}: {
  icon?: React.ReactNode
  label: string
  value: string
  tone: "ok" | "warn" | "bad" | "accent" | "muted"
}) {
  const colors = {
    ok: "text-emerald-400",
    warn: "text-amber-400",
    bad: "text-rose-400",
    accent: "text-amber-300",
    muted: "text-zinc-400",
  }[tone]

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      {icon && <span className={colors}>{icon}</span>}
      <span className="text-zinc-500">{label}</span>
      <span className={cn("font-medium tabular-nums", colors)}>{value}</span>
    </div>
  )
}
