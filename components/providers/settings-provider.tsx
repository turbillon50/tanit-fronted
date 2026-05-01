"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface Settings {
  splashEnabled: boolean
  assistantMode: "compact" | "expanded"
  dataMode: "simulation" | "api-pending"
  voiceStatus: "pending"
  imageGenStatus: "pending"
  bybitStatus: "pending"
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
}

const defaultSettings: Settings = {
  splashEnabled: true,
  assistantMode: "expanded",
  dataMode: "simulation",
  voiceStatus: "pending",
  imageGenStatus: "pending",
  bybitStatus: "pending",
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  useEffect(() => {
    const stored = localStorage.getItem("vtanit-settings")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSettings((prev) => ({ ...prev, ...parsed }))
      } catch (e) {
        console.error("Failed to parse settings:", e)
      }
    }
  }, [])

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...updates }
      localStorage.setItem("vtanit-settings", JSON.stringify(newSettings))
      return newSettings
    })
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
