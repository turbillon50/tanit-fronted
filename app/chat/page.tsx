"use client"

import { TanitPanel } from "@/components/chat/tanit-panel"
import { MainLayout } from "@/components/layout/main-layout"

/**
 * Tanit central — el cuarto donde Luis habla con Tanit.
 *
 * Inspirado en `vforge.site/forge`: el chat es el alma de la app.
 *
 * Layout:
 *  - Mobile: full screen, padding top para que el hamburger del Sidebar
 *    no tape el header del chat
 *  - Desktop: max-w-3xl centrado, full height
 *
 * MainLayout detecta `/chat` y oculta:
 *  - el right-sidebar TanitPanel (sería Tanit por duplicado)
 *  - el TanitMobileButton flotante
 *  - el TanitMobileSheet
 *  - removes el padding-right destinado al sidebar derecho
 */
export default function ChatPage() {
  return (
    <MainLayout>
      <div className="flex h-[calc(100dvh-4rem)] lg:h-screen pt-12 lg:pt-0">
        <div className="flex-1 mx-auto w-full max-w-3xl flex flex-col">
          <TanitPanel className="flex-1 border-l-0" />
        </div>
      </div>
    </MainLayout>
  )
}
