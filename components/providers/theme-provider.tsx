"use client"

import { createContext, useContext, useEffect } from "react"

// TANIT vive solo en dark. La paleta black/chrome/gold pierde su identidad
// en modo claro, así que removimos la opción light. Mantenemos el provider
// para no romper imports existentes — pero `theme` siempre es "dark".

interface ThemeContextType {
  theme: "dark"
  resolvedTheme: "dark"
  setTheme: (_: "dark" | "light" | "system") => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light")
    root.classList.add("dark")
  }, [])

  // setTheme es no-op a propósito — la app no permite light.
  return (
    <ThemeContext.Provider value={{ theme: "dark", resolvedTheme: "dark", setTheme: () => {} }}>
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
