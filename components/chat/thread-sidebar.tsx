"use client"

/**
 * Thread sidebar — lista de conversaciones tipo ChatGPT/Claude.
 *
 * Lee de /bot/threads (backend ya implementado). Cada thread es una
 * conversación persistente en mastra_threads + mastra_messages.
 *
 * Acciones:
 *   - Click en thread → seleccionar (cambia URL? por ahora solo state).
 *   - Botón "+" → POST /bot/threads → crear thread vacío y seleccionarlo.
 *   - Hover en thread → menú renombrar/eliminar.
 *   - Refresh manual con icono refresh (auto-refresh cada 30s también).
 */

import { useEffect, useState, useCallback } from "react"
import { Plus, MoreHorizontal, Pencil, Trash2, RefreshCw } from "lucide-react"
import { api, type ThreadInfo } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ThreadSidebarProps {
  currentThreadId: string | null
  onSelect: (threadId: string) => void
  onCreated?: (threadId: string) => void
  className?: string
}

function relativeTime(iso: string): string {
  try {
    const d = new Date(iso).getTime()
    const diffMs = Date.now() - d
    const diffMin = Math.floor(diffMs / 60_000)
    if (diffMin < 1) return "ahora"
    if (diffMin < 60) return `hace ${diffMin}m`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `hace ${diffH}h`
    const diffD = Math.floor(diffH / 24)
    if (diffD < 7) return `hace ${diffD}d`
    return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short" })
  } catch {
    return ""
  }
}

export function ThreadSidebar({
  currentThreadId,
  onSelect,
  onCreated,
  className,
}: ThreadSidebarProps) {
  const [threads, setThreads] = useState<ThreadInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  const load = useCallback(async () => {
    try {
      const r = await api.listThreads("luis", 50)
      setThreads(r.threads ?? [])
    } catch (e) {
      console.warn("[thread-sidebar] load threads failed:", (e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [load])

  async function handleNew() {
    try {
      const r = await api.createThread("luis")
      if (r?.threadId) {
        await load()
        onSelect(r.threadId)
        onCreated?.(r.threadId)
      }
    } catch (e) {
      console.warn("[thread-sidebar] create failed:", (e as Error).message)
    }
  }

  async function handleRename(id: string) {
    const title = renameValue.trim()
    if (!title) { setRenamingId(null); return }
    try {
      await api.renameThread(id, title)
      setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)))
    } catch (e) {
      console.warn("[thread-sidebar] rename failed:", (e as Error).message)
    } finally {
      setRenamingId(null)
      setRenameValue("")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta conversación? Los mensajes quedarán en la BD pero no aparecerán en la lista.")) return
    try {
      await api.deleteThread(id)
      setThreads((prev) => prev.filter((t) => t.id !== id))
      // Si la eliminada era la actual, elegir la primera disponible o crear una.
      if (currentThreadId === id) {
        const next = threads.find((t) => t.id !== id)
        if (next) onSelect(next.id)
        else handleNew()
      }
    } catch (e) {
      console.warn("[thread-sidebar] delete failed:", (e as Error).message)
    }
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-zinc-950/80 border-r border-zinc-900/80",
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900/80">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Conversaciones
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={load}
            className="p-1.5 rounded-md hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300"
            aria-label="Refrescar"
            title="Refrescar lista"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleNew}
            className="p-1.5 rounded-md hover:bg-primary/15 text-primary hover:text-primary"
            aria-label="Nueva conversación"
            title="Nueva conversación"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading && threads.length === 0 && (
          <div className="px-3 py-4 space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 rounded-md bg-zinc-900/50 animate-pulse" />
            ))}
          </div>
        )}
        {!loading && threads.length === 0 && (
          <div className="px-4 py-6 text-xs text-zinc-500 text-center">
            Sin conversaciones todavía.
            <br />
            <button
              onClick={handleNew}
              className="mt-2 text-primary hover:underline"
            >
              Crear la primera
            </button>
          </div>
        )}
        <ul className="py-1">
          {threads.map((t) => {
            const isActive = t.id === currentThreadId
            const isRenaming = renamingId === t.id
            const displayTitle = t.title || "Conversación nueva"
            return (
              <li key={t.id} className="px-2 py-0.5">
                <div
                  className={cn(
                    "group flex flex-col gap-1 rounded-md px-2.5 py-2 cursor-pointer transition-colors",
                    isActive
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-zinc-900 border border-transparent",
                  )}
                  onClick={() => !isRenaming && onSelect(t.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    {isRenaming ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => handleRename(t.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(t.id)
                          if (e.key === "Escape") { setRenamingId(null); setRenameValue("") }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-100 focus:outline-none focus:border-primary"
                      />
                    ) : (
                      <span
                        className={cn(
                          "flex-1 text-sm leading-tight truncate",
                          isActive ? "text-zinc-100 font-medium" : "text-zinc-300",
                        )}
                      >
                        {displayTitle}
                      </span>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 flex-shrink-0"
                          aria-label="Opciones"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            setRenamingId(t.id)
                            setRenameValue(displayTitle)
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-2" />
                          Renombrar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(t.id)
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {t.preview && !isRenaming && (
                    <span
                      className={cn(
                        "text-[11px] leading-snug truncate",
                        isActive ? "text-zinc-400" : "text-zinc-500",
                      )}
                    >
                      {t.preview}
                    </span>
                  )}

                  <div className="flex items-center justify-between gap-2 text-[10px] text-zinc-600">
                    <span>{t.messageCount} msg</span>
                    <span>{relativeTime(t.updatedAt)}</span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
