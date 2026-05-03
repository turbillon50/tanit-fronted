"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Brain, Sparkles } from "lucide-react"
import { api, type TanitMemoryItem } from "@/lib/api"

export default function MemoryPage() {
  const [identityMemories, setIdentityMemories] = useState<TanitMemoryItem[]>([])
  const [lessons, setLessons] = useState<TanitMemoryItem[]>([])
  const [criticalLessons, setCriticalLessons] = useState<TanitMemoryItem[]>([])
  const [counts, setCounts] = useState({ identity: 0, lesson: 0, critical: 0, trading: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [id, le, cr, tr] = await Promise.all([
          api.memories("identidad", 50).catch(() => null),
          api.memories("leccion", 30).catch(() => null),
          api.memories("LECCION_CRITICA", 20).catch(() => null),
          api.memories("trading", 1).catch(() => null),
        ])
        if (!mounted) return
        if (id) {
          setIdentityMemories(id.memories)
          setCounts((c) => ({ ...c, identity: id.count }))
        }
        if (le) {
          setLessons(le.memories)
          setCounts((c) => ({ ...c, lesson: le.count }))
        }
        if (cr) {
          setCriticalLessons(cr.memories)
          setCounts((c) => ({ ...c, critical: cr.count }))
        }
        if (tr) {
          setCounts((c) => ({ ...c, trading: tr.count }))
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold chrome-text flex items-center gap-3">
              <Brain className="h-7 w-7 text-primary" />
              Tanit Memory
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sistema de memoria persistente · Identidad, lecciones y decisiones
            </p>
          </div>

          <div className="glass-panel rounded-lg px-4 py-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-success font-medium">Memory Active</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="text-xs text-muted-foreground">
              {loading ? "Cargando…" : `${counts.identity + counts.lesson + counts.critical + counts.trading}+ memorias`}
            </div>
          </div>
        </div>

        {/* AI Message — real counts */}
        <div className="glass-panel rounded-xl p-5 border-l-4 border-primary">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground leading-relaxed">
                Memory system active. Tengo registradas{" "}
                <span className="text-primary font-medium">{counts.identity} memorias de identidad</span>,{" "}
                <span className="text-warning font-medium">{counts.critical} lecciones críticas</span>, y{" "}
                <span className="text-success font-medium">{counts.lesson} lecciones de swap</span>.
                Mi biblia de trading sobrevive cualquier reinicio.
              </p>
              {criticalLessons[0] && (
                <p className="text-xs text-muted-foreground mt-2">
                  Última lección crítica: <span className="text-foreground">{criticalLessons[0].content.slice(0, 90)}…</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Critical Lessons — alma del CAL #1 disaster */}
        {criticalLessons.length > 0 && (
          <div className="glass-panel rounded-xl p-5 border border-destructive/20">
            <h2 className="text-sm font-bold text-destructive mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
              Lecciones críticas ({criticalLessons.length})
            </h2>
            <ul className="space-y-3">
              {criticalLessons.slice(0, 6).map((m) => (
                <li key={m.id} className="text-xs text-muted-foreground leading-relaxed border-l-2 border-destructive/30 pl-3">
                  <span className="text-foreground font-medium">[{new Date(m.createdAt).toISOString().slice(0,10)}]</span>{" "}
                  {m.content.slice(0, 250)}{m.content.length > 250 ? "…" : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Identity memories — su biblia de trading */}
        <div className="glass-panel rounded-xl p-5">
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Identidad y biblia de trading ({counts.identity})
          </h2>
          {loading ? (
            <p className="text-xs text-muted-foreground">Cargando…</p>
          ) : identityMemories.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin memorias todavía.</p>
          ) : (
            <ul className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {identityMemories.slice(0, 30).map((m) => {
                const title = m.content.split(" — ")[0]?.slice(0, 80) ?? "Memoria"
                return (
                  <li key={m.id} className="border-b border-border/20 pb-3 last:border-0 last:pb-0">
                    <p className="text-xs font-semibold text-foreground">{title}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-3">
                      {m.content}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono">
                      id={m.id} · {new Date(m.createdAt).toISOString().slice(0,10)}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Trading lessons (swaps) */}
        {lessons.length > 0 && (
          <div className="glass-panel rounded-xl p-5">
            <h2 className="text-sm font-bold text-foreground mb-4">Swaps recientes ({counts.lesson})</h2>
            <ul className="space-y-2">
              {lessons.slice(0, 10).map((m) => (
                <li key={m.id} className="text-xs text-muted-foreground border-l-2 border-primary/20 pl-3">
                  <span className="text-foreground font-medium">[{new Date(m.createdAt).toISOString().slice(0,10)}]</span>{" "}
                  {m.content.slice(0, 200)}{m.content.length > 200 ? "…" : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
