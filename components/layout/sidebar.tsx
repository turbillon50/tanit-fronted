"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MessageCircle, Menu, X, Settings } from "lucide-react"
import { useState } from "react"
import { VoTradingLogo } from "@/components/branding/vo-trading-logo"
import { SettingsDrawer } from "@/components/settings/settings-drawer"

/**
 * Sidebar simplificado — solo "Hablar con Tanit" en producción pública.
 *
 * Las pantallas operativas (terminal, positions, analytics, memory, soul,
 * governance) eran del operador interno. Para la app SaaS pública solo queda
 * la conversación.
 */
const navItems = [
  {
    title: "Hablar con Tanit",
    href: "/chat",
    icon: MessageCircle,
    primary: true,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-zinc-900/80 backdrop-blur p-2 rounded-lg border border-zinc-800/60"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-zinc-300" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — sombrío, mínimo */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-black border-r border-zinc-900/80 z-50 transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo VO Trading */}
          <div className="p-6 border-b border-zinc-900/80">
            <Link href="/" className="block">
              <VoTradingLogo size="sm" withTagline />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 lg:hidden text-zinc-500 hover:text-zinc-200"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navegación — solo Tanit */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group",
                    isActive
                      ? "bg-zinc-900/80 text-zinc-100"
                      : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              )
            })}
          </nav>

          {/* Settings */}
          <div className="p-4 border-t border-zinc-900/80">
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-3 px-4 py-2 w-full text-zinc-500 hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-900/60"
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm">Settings</span>
            </button>
          </div>
        </div>
      </aside>

      <SettingsDrawer isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
