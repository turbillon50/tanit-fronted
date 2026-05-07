"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  MessageCircle,
  LayoutDashboard,
  LineChart,
  ShieldAlert,
  Brain,
  Heart,
  BarChart3,
  Shield,
} from "lucide-react"

const navItems = [
  {
    title: "Tanit",
    href: "/chat",
    icon: MessageCircle,
    primary: true,
  },
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
  {
    title: "Gov",
    href: "/governance",
    icon: Shield,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-sidebar/95 backdrop-blur-lg border-t border-sidebar-border">
      <div className="flex items-center overflow-x-auto scrollbar-none py-2 px-1 safe-area-pb">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const isPrimary = "primary" in item && item.primary
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[56px] flex-shrink-0",
                isPrimary
                  ? isActive
                    ? "text-amber-300"
                    : "text-amber-400"
                  : isActive
                    ? "text-zinc-100"
                    : "text-zinc-500",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isPrimary && "drop-shadow-[0_0_6px_rgb(245,158,11,0.6)]",
                )}
              />
              <span className={cn("text-[10px]", isPrimary ? "font-bold" : "font-medium")}>
                {item.title}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
