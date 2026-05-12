"use client"

import { useEffect, useState } from "react"
import { TanitPanel } from "@/components/chat/tanit-panel"
import { ThreadSidebar } from "@/components/chat/thread-sidebar"
import { MainLayout } from "@/components/layout/main-layout"
import { api } from "@/lib/api"

/**
 * Chat con Tanit — el centro de la app.
 *
 * Sistema de conversaciones tipo ChatGPT (commit 2026-05-12):
 *  - Sidebar izquierdo con lista de threads (ThreadSidebar).
 *  - Panel central con la conversación seleccionada (TanitPanel).
 *  - Auto-crear un thread la primera vez si la cuenta no tiene ninguno.
 *  - Estado persistido en localStorage para que al volver, Luis caiga
 *    en la última conversación que tenía abierta.
 *
 * Antes el chat no separaba por threads — todo iba a `${channel}-main`
 * por default y se veía como un río continuo de TODA la historia.
 */
const LS_KEY = "tanit:lastThreadId"

export default function ChatPage() {
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Bootstrap: cargar último thread usado, o crear uno si no hay ninguno.
  useEffect(() => {
    let mounted = true
    async function init() {
      try {
        const r = await api.listThreads("luis", 50)
        if (!mounted) return
        const threads = r.threads ?? []
        const lastUsed = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null
        const fromStorage = lastUsed && threads.find((t) => t.id === lastUsed) ? lastUsed : null
        if (fromStorage) {
          setCurrentThreadId(fromStorage)
        } else if (threads.length > 0) {
          setCurrentThreadId(threads[0].id)
        } else {
          // Cuenta sin threads — crear el primero.
          const c = await api.createThread("luis", "Conversación nueva")
          if (mounted && c.threadId) setCurrentThreadId(c.threadId)
        }
      } catch (e) {
        console.warn("[chat-page] init failed:", (e as Error).message)
      } finally {
        if (mounted) setInitialized(true)
      }
    }
    init()
    return () => { mounted = false }
  }, [])

  // Persistir threadId actual en localStorage para que al volver, abra el mismo.
  useEffect(() => {
    if (typeof window !== "undefined" && currentThreadId) {
      localStorage.setItem(LS_KEY, currentThreadId)
    }
  }, [currentThreadId])

  return (
    <MainLayout>
      <div className="flex h-[calc(100dvh-3rem)] lg:h-[calc(100vh-3rem)] pt-14 lg:pt-0">
        {/* Sidebar de conversaciones — escondido en mobile, visible md+. */}
        <ThreadSidebar
          currentThreadId={currentThreadId}
          onSelect={setCurrentThreadId}
          className="hidden md:flex w-64 flex-shrink-0"
        />

        {/* Panel central del chat */}
        <div className="flex-1 mx-auto w-full max-w-3xl flex flex-col">
          {initialized && (
            <TanitPanel
              threadId={currentThreadId}
              className="flex-1 border-l-0"
            />
          )}
          {!initialized && (
            <div className="flex-1 flex items-center justify-center text-xs text-zinc-500">
              Cargando conversaciones…
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
