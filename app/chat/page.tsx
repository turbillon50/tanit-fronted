"use client"

import { TanitPanel } from "@/components/chat/tanit-panel"
import { MainLayout } from "@/components/layout/main-layout"

/**
 * Tanit central — el cuarto donde Luis habla con Tanit.
 *
 * Inspirado en `vforge.site/forge`: el chat es el alma de la app, ocupa
 * el viewport entero del área de contenido (descontando sidebar +
 * mobile bottom nav). En desktop max-w-4xl para que se sienta enfocado;
 * en mobile usa todo el ancho.
 *
 * El TanitPanel sin `onToggle` esconde el close button — porque aquí
 * NO se cierra: ESTA es la pantalla principal.
 */
export default function ChatPage() {
  return (
    <MainLayout>
      <div className="-mx-3 -my-2 sm:-mx-6 sm:-my-4 lg:-mx-8 lg:-my-6 h-[calc(100vh-4rem)] sm:h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] flex">
        <div className="flex-1 mx-auto w-full max-w-4xl flex flex-col">
          <TanitPanel className="flex-1" />
        </div>
      </div>
    </MainLayout>
  )
}
