"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { TanitPanel, TanitMobileButton, TanitMobileSheet } from "@/components/chat/tanit-panel"
import { MobileNav } from "./mobile-nav"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isTanitOpen, setIsTanitOpen] = useState(false)
  const pathname = usePathname()

  // En /chat ya hay un Tanit panel central full-screen — no rendices
  // el right-sidebar, el botón flotante ni el mobile sheet (sería tener
  // Tanit por triplicado). Tampoco quites el padding right del content.
  const isOnChatPage = pathname === "/chat" || pathname?.startsWith("/chat/")

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Main Content Area */}
      <div className={isOnChatPage ? "lg:pl-64 min-h-screen" : "lg:pl-64 lg:pr-80 min-h-screen"}>
        <main className="min-h-screen">
          <div className={isOnChatPage ? "min-h-screen" : "p-4 lg:p-6 pt-16 lg:pt-6 pb-24 lg:pb-6"}>
            {children}
          </div>
        </main>
      </div>

      {/* Right-side TanitPanel — solo cuando NO estás ya en /chat */}
      {!isOnChatPage && (
        <div className="hidden lg:block fixed top-0 right-0 w-80 h-screen z-40">
          <TanitPanel isExpanded={true} />
        </div>
      )}

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Mobile Tanit Button & Sheet — solo cuando NO estás ya en /chat */}
      {!isOnChatPage && (
        <>
          <TanitMobileButton onClick={() => setIsTanitOpen(true)} />
          <TanitMobileSheet isOpen={isTanitOpen} onClose={() => setIsTanitOpen(false)} />
        </>
      )}
    </div>
  )
}
