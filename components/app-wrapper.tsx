"use client"

import { ThemeProvider } from "@/components/providers/theme-provider"
import { SettingsProvider } from "@/components/providers/settings-provider"
import { NavigationProvider } from "@/components/providers/navigation-context"

/**
 * AppWrapper — providers globales sin splash.
 * El splash y el branding viejo de V·Tanit fueron borrados;
 * la app ahora arranca directo en VO Trading sin cinematic.
 */
export function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <NavigationProvider>{children}</NavigationProvider>
      </SettingsProvider>
    </ThemeProvider>
  )
}
