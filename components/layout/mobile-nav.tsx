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
} from "lucide-react"

const navItems = [
  {
    title: "Home",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Terminal",
    href: "/terminal",
    icon: LineChart,
  },
  {
    title: "Risk",
    href: "/positions",
    icon: ShieldAlert,
  },
  {
    title: "Memory",
    href: "/memory",
    icon: Brain,
  },
  {
    title: "Soul",
    href: "/soul",
    icon: Heart,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-sidebar/95 backdrop-blur-lg border-t border-sidebar-border">
      <div className="flex items-center overflow-x-auto scrollbar-none py-2 px-1 safe-area-pb">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const isSoul = item.href === "/soul"
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[56px] flex-shrink-0",
                isActive
                  ? isSoul ? "text-primary" : "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5", 
                isActive && "glow-magenta-text",
                isSoul && isActive && "fill-primary/30"
              )} />
              <span className="text-[10px] font-medium">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
