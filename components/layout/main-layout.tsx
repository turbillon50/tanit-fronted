"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { TanitPanel, TanitMobileButton, TanitMobileSheet } from "@/components/chat/tanit-panel"
import { MobileNav } from "./mobile-nav"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isTanitOpen, setIsTanitOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="lg:pl-64 lg:pr-80 min-h-screen">
        <main className="min-h-screen">
          <div className="p-4 lg:p-6 pt-16 lg:pt-6 pb-24 lg:pb-6">
            {children}
          </div>
        </main>
      </div>

      {/* Tanit Panel - Fixed Right Side on Desktop */}
      <div className="hidden lg:block fixed top-0 right-0 w-80 h-screen z-40">
        <TanitPanel isExpanded={true} />
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Mobile Tanit Button & Sheet */}
      <TanitMobileButton onClick={() => setIsTanitOpen(true)} />
      <TanitMobileSheet isOpen={isTanitOpen} onClose={() => setIsTanitOpen(false)} />
    </div>
  )
}
