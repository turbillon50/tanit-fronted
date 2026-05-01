"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  LineChart,
  ShieldAlert,
  Brain,
  Heart,
  BarChart3,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { useTheme } from "@/components/providers/theme-provider"
import { SettingsDrawer } from "@/components/settings/settings-drawer"

const navItems = [
  {
    title: "Command Center",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Trading Terminal",
    href: "/terminal",
    icon: LineChart,
  },
  {
    title: "Positions & Risk",
    href: "/positions",
    icon: ShieldAlert,
  },
  {
    title: "Tanit Memory",
    href: "/memory",
    icon: Brain,
  },
  {
    title: "Tanit Soul",
    href: "/soul",
    icon: Heart,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden glass-panel p-2 rounded-lg"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6 text-foreground" />
      </button>

      {/* Mobile Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 lg:hidden glass-panel p-2 rounded-lg"
        aria-label="Toggle theme"
      >
        {resolvedTheme === "dark" ? (
          <Sun className="h-5 w-5 text-foreground" />
        ) : (
          <Moon className="h-5 w-5 text-foreground" />
        )}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden glow-magenta-sm">
                <Image
                  src="/images/votan-logo.jpeg"
                  alt="V•Tanit"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold chrome-text">V•Tanit</h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent">
                  AI Trading Intelligence
                </p>
              </div>
            </Link>
            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 lg:hidden text-muted-foreground hover:text-foreground"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const isSoulPage = item.href === "/soul"
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary glow-magenta-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5", 
                    isActive && "text-primary",
                    isSoulPage && isActive && "fill-primary/30"
                  )} />
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              )
            })}
          </nav>

          {/* Status Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="glass-panel rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Tanit Status</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
                  <span className="text-xs text-primary">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Memory</span>
                <span className="text-xs text-success">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Execution</span>
                <span className="text-xs text-accent">Locked</span>
              </div>
            </div>
          </div>

          {/* Theme Toggle & Settings */}
          <div className="p-4 border-t border-sidebar-border space-y-2">
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-3 px-4 py-2 w-full text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-sidebar-accent"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="text-sm">{resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
            <button 
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-3 px-4 py-2 w-full text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-sidebar-accent"
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm">Settings</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Settings Drawer */}
      <SettingsDrawer isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
