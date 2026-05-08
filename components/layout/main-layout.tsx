"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { LiveSidebar } from "@/components/dashboard/live-sidebar"
import { StatusBar } from "@/components/dashboard/status-bar"
import { LineChart, X } from "lucide-react"
import { EquityCurve } from "@/components/dashboard/equity-curve"
import { BalanceWidget } from "@/components/dashboard/balance-widget"
import { PositionsMini } from "@/components/dashboard/positions-mini"

/**
 * Layout principal — 3 columnas + status bar inferior.
 *
 *  ┌────────────────────────────────────────────────────────┐
 *  │ Sidebar │      Children (chat o página)        │ Live  │
 *  │ (nav)   │                                       │ (vivo)│
 *  ├────────────────────────────────────────────────────────┤
 *  │              Status bar (sistema · pnl)               │
 *  └────────────────────────────────────────────────────────┘
 *
 * Desktop: sidebar 64 + content + live 80.
 * Mobile: solo content + status bar; sidebar y live como overlays.
 */
export function MainLayout({ children }: { children: React.ReactNode }) {
  const [liveOpen, setLiveOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <Sidebar />

      <main className="lg:pl-64 lg:pr-80 min-h-screen pb-12 lg:pb-12">
        {children}
      </main>

      <LiveSidebar />
      <StatusBar />

      {/* Mobile button — abre el live sidebar en sheet */}
      <button
        type="button"
        onClick={() => setLiveOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-40 h-10 w-10 rounded-full bg-zinc-900/80 border border-zinc-800/60 flex items-center justify-center text-amber-400 backdrop-blur"
        aria-label="Ver live"
      >
        <LineChart className="h-5 w-5" />
      </button>

      {/* Mobile live sheet */}
      {liveOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            onClick={() => setLiveOpen(false)}
          />
          <aside className="relative ml-auto h-full w-[88vw] max-w-sm border-l border-zinc-900/80 bg-black flex flex-col">
            <div className="px-5 py-4 border-b border-zinc-900/80 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                Live · Tanit Trading
              </span>
              <button
                onClick={() => setLiveOpen(false)}
                className="text-zinc-500 hover:text-zinc-200"
                aria-label="Cerrar live"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <EquityCurve />
              <BalanceWidget />
              <PositionsMini />
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
