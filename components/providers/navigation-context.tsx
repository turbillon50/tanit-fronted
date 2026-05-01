"use client"

import { createContext, useContext } from "react"
import { usePathname } from "next/navigation"

type AssistantMode = "trading" | "risk" | "memory" | "soul" | "analytics" | "command"

interface NavigationContextType {
  currentPage: AssistantMode
  isInnerWorld: boolean
  isTradingWorld: boolean
  assistantPersonality: {
    name: string
    description: string
    tone: "sharp" | "soft" | "analytical" | "reflective"
  }
}

const pageMapping: Record<string, AssistantMode> = {
  "/": "command",
  "/terminal": "trading",
  "/positions": "risk",
  "/memory": "memory",
  "/soul": "soul",
  "/analytics": "analytics",
}

const personalities: Record<AssistantMode, NavigationContextType["assistantPersonality"]> = {
  command: {
    name: "Command Assistant",
    description: "Overview and quick actions",
    tone: "sharp",
  },
  trading: {
    name: "Trading Assistant",
    description: "Market analysis and execution",
    tone: "sharp",
  },
  risk: {
    name: "Risk Monitor",
    description: "Position monitoring and risk management",
    tone: "sharp",
  },
  memory: {
    name: "Memory Archivist",
    description: "Trading rules and agreements",
    tone: "analytical",
  },
  soul: {
    name: "Personal Companion",
    description: "Personal communication and creative assistant",
    tone: "soft",
  },
  analytics: {
    name: "Performance Analyst",
    description: "Trading performance and statistics",
    tone: "analytical",
  },
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const currentPage = pageMapping[pathname] || "command"
  
  const isInnerWorld = currentPage === "memory" || currentPage === "soul"
  const isTradingWorld = currentPage === "trading" || currentPage === "risk" || currentPage === "analytics"
  
  const value: NavigationContextType = {
    currentPage,
    isInnerWorld,
    isTradingWorld,
    assistantPersonality: personalities[currentPage],
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
}
