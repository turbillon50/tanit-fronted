"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

interface ThemeContextType {
  theme: Theme
  resolvedTheme: "dark" | "light"
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    const stored = localStorage.getItem("vtanit-theme") as Theme | null
    if (stored) {
      setTheme(stored)
    }
  }, [])

  useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = (newTheme: "dark" | "light") => {
      root.classList.remove("light", "dark")
      root.classList.add(newTheme)
      setResolvedTheme(newTheme)
    }

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      applyTheme(systemTheme)

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? "dark" : "light")
      }
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    } else {
      applyTheme(theme)
    }
  }, [theme])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem("vtanit-theme", newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
