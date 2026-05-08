"use client"

import { TanitPanel } from "@/components/chat/tanit-panel"
import { MainLayout } from "@/components/layout/main-layout"

/**
 * Chat con Tanit — el centro de la app.
 * MainLayout se encarga del sidebar izquierdo, el live sidebar derecho
 * y la status bar inferior. Aquí solo el chat al centro.
 */
export default function ChatPage() {
  return (
    <MainLayout>
      <div className="flex h-[calc(100dvh-3rem)] lg:h-[calc(100vh-3rem)] pt-14 lg:pt-0">
        <div className="flex-1 mx-auto w-full max-w-3xl flex flex-col">
          <TanitPanel className="flex-1 border-l-0" />
        </div>
      </div>
    </MainLayout>
  )
}
