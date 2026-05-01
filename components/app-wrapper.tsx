"use client"

import { useState, useEffect } from "react"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { SettingsProvider, useSettings } from "@/components/providers/settings-provider"
import { NavigationProvider } from "@/components/providers/navigation-context"
import { SplashScreen } from "@/components/splash/splash-screen"

function AppContent({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings()
  const [showSplash, setShowSplash] = useState(true)
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  useEffect(() => {
    // Check if this is the first load of the session
    const hasLoaded = sessionStorage.getItem("vtanit-loaded")
    if (hasLoaded) {
      setShowSplash(false)
      setIsFirstLoad(false)
    }
  }, [])

  const handleSplashComplete = () => {
    setShowSplash(false)
    sessionStorage.setItem("vtanit-loaded", "true")
  }

  // If splash is disabled or not first load, show content directly
  if (!settings.splashEnabled || !isFirstLoad) {
    return <>{children}</>
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <div className={showSplash ? "opacity-0" : "opacity-100 transition-opacity duration-500"}>
        {children}
      </div>
    </>
  )
}

export function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <NavigationProvider>
          <AppContent>{children}</AppContent>
        </NavigationProvider>
      </SettingsProvider>
    </ThemeProvider>
  )
}
