"use client"

import { EquityCurve } from "./equity-curve"
import { BalanceWidget } from "./balance-widget"
import { PositionsMini } from "./positions-mini"

/**
 * Sidebar derecho LIVE — la vista que Luis quiere siempre visible
 * mientras platica con Tanit. Equity curve infinita arriba, balance
 * + posiciones abajo. Auto-refresh interno por componente.
 *
 * Desktop only (lg+). En mobile se accede vía botoncito en el header.
 */
export function LiveSidebar() {
  return (
    <aside className="hidden lg:flex fixed top-0 right-0 h-screen w-80 z-30 border-l border-zinc-900/80 bg-black/60 backdrop-blur-md flex-col">
      <div className="px-5 py-4 border-b border-zinc-900/80">
        <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          Live · Tanit Trading
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <EquityCurve />
        <BalanceWidget />
        <PositionsMini />
      </div>

      <div className="px-5 py-3 border-t border-zinc-900/80 text-[10px] tracking-wider text-zinc-600">
        Datos en vivo · refresh 5–15s
      </div>
    </aside>
  )
}
