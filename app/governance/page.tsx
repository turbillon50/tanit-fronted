"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface GuardrailEvent {
  id: number
  eventType: string
  symbol: string | null
  requested: unknown
  enforced: unknown
  lessonRef: string | null
  createdAt: string
}

interface EvolutionRow {
  id: number
  param: string
  oldValue: string | null
  newValue: string | null
  reason: string | null
  expectedImpact: string | null
  validationWindowSize: number
  validationStartedAt: string
  validationCompletedAt: string | null
  actualOutcome: string | null
  predictionAccurate: boolean | null
  consecutiveFailures: number
  needsHumanReview: boolean
  createdAt: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tanit-production.up.railway.app/api"

const EVENT_LABEL: Record<string, { label: string; tone: "warning" | "blocked" | "info" }> = {
  SL_TOO_TIGHT: { label: "SL muy cerrado", tone: "warning" },
  TP_UNREACHABLE: { label: "TP inalcanzable", tone: "warning" },
  BLUE_CHIP_AVOID_BLOCKED: { label: "Avoid bluechip bloqueado", tone: "blocked" },
  LEV_COOLDOWN: { label: "Leverage cooldown", tone: "blocked" },
  EQUITY_PROTECTION: { label: "Equity protection", tone: "blocked" },
}

export default function GovernancePage() {
  const [events, setEvents] = useState<GuardrailEvent[]>([])
  const [needsReview, setNeedsReview] = useState<EvolutionRow[]>([])
  const [recentEvolutions, setRecentEvolutions] = useState<EvolutionRow[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const [evRes, nrRes, evolRes] = await Promise.all([
        fetch(`${API_URL}/tanit/guardrail-events?limit=50`, { cache: "no-store" }).then(r => r.json()).catch(() => null),
        fetch(`${API_URL}/tanit/evolutions?needs_review=true&limit=50`, { cache: "no-store" }).then(r => r.json()).catch(() => null),
        fetch(`${API_URL}/tanit/evolutions?limit=20`, { cache: "no-store" }).then(r => r.json()).catch(() => null),
      ])
      if (evRes?.events) setEvents(evRes.events)
      if (nrRes?.evolutions) setNeedsReview(nrRes.evolutions)
      if (evolRes?.evolutions) setRecentEvolutions(evolRes.evolutions)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [])

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold chrome-text flex items-center gap-3">
              <Shield className="h-7 w-7 text-primary" />
              Governance
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tesis v4.1 — guardrails activos · evoluciones a revisar · auditoría de decisiones
            </p>
          </div>
          <div className="glass-panel rounded-lg px-4 py-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${needsReview.length > 0 ? "bg-warning animate-pulse" : "bg-success"}`} />
              <span className="text-xs font-medium">
                {needsReview.length > 0 ? `${needsReview.length} pendiente${needsReview.length === 1 ? "" : "s"} de revisión` : "Todo operando bien"}
              </span>
            </div>
          </div>
        </div>

        {/* Needs human review — banner si hay */}
        {needsReview.length > 0 && (
          <div className="glass-panel rounded-xl p-5 border border-warning/40 bg-warning/5">
            <h2 className="text-sm font-bold text-warning flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4" />
              Evoluciones marcadas para revisión humana ({needsReview.length})
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Tanit modificó estos parámetros y la predicción falló 3 veces consecutivas. Revisa el contexto antes de que ella siga ajustándolos sola.
            </p>
            <div className="space-y-3">
              {needsReview.map(ev => (
                <div key={ev.id} className="border-l-2 border-warning pl-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-foreground">{ev.param}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {ev.oldValue ?? "?"} → {ev.newValue ?? "?"}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/20 text-warning font-bold">
                      {ev.consecutiveFailures} fallos consecutivos
                    </span>
                  </div>
                  {ev.expectedImpact && <p className="text-xs text-muted-foreground mt-1">Predicción: {ev.expectedImpact}</p>}
                  {ev.actualOutcome && <p className="text-xs text-destructive mt-0.5">Realidad: {ev.actualOutcome}</p>}
                  <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono">
                    id={ev.id} · {new Date(ev.createdAt).toLocaleString("es-MX", { timeZone: "America/Cancun" })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent guardrail events */}
        <div className="glass-panel rounded-xl p-5">
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Eventos guardrail recientes
            <span className="text-[10px] text-muted-foreground font-normal">· últimos 50</span>
          </h2>
          {loading ? (
            <p className="text-xs text-muted-foreground">Cargando…</p>
          ) : events.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="h-8 w-8 text-success/50 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Sin eventos guardrail registrados — Tanit está operando dentro de sus inviolables.
              </p>
            </div>
          ) : (
            <ul className="space-y-2 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {events.map(e => {
                const meta = EVENT_LABEL[e.eventType] ?? { label: e.eventType, tone: "info" as const }
                const toneClass =
                  meta.tone === "blocked" ? "border-destructive/40 bg-destructive/5" :
                  meta.tone === "warning" ? "border-warning/30 bg-warning/5" :
                  "border-border/30 bg-muted/5"
                return (
                  <li key={e.id} className={`border-l-2 pl-3 py-2 rounded-r ${toneClass}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-foreground">{meta.label}</span>
                      {e.symbol && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-mono">{e.symbol}</span>}
                      <span className="text-[10px] text-muted-foreground/70 ml-auto">
                        {new Date(e.createdAt).toLocaleString("es-MX", { timeZone: "America/Cancun" })}
                      </span>
                    </div>
                    {e.lessonRef && <p className="text-[10px] text-muted-foreground mt-1 italic">{e.lessonRef}</p>}
                    <div className="flex gap-3 text-[10px] text-muted-foreground mt-1 font-mono">
                      <span>req: {JSON.stringify(e.requested).slice(0, 80)}</span>
                      <span>→</span>
                      <span>enforced: {JSON.stringify(e.enforced).slice(0, 80)}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Recent evolutions (validation pipeline) */}
        <div className="glass-panel rounded-xl p-5">
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Pipeline de validación de evoluciones
            <span className="text-[10px] text-muted-foreground font-normal">· últimas 20</span>
          </h2>
          {recentEvolutions.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin evoluciones registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/20 text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Param</th>
                    <th className="text-left px-3 py-2 font-medium">Cambio</th>
                    <th className="text-left px-3 py-2 font-medium">Predicción</th>
                    <th className="text-left px-3 py-2 font-medium">Estado</th>
                    <th className="text-right px-3 py-2 font-medium">Cuándo</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvolutions.map(ev => {
                    const status =
                      ev.validationCompletedAt == null ? { label: "Validando", color: "text-warning" } :
                      ev.predictionAccurate ? { label: "✓ Acertó", color: "text-success" } :
                      { label: "✗ Falló", color: "text-destructive" }
                    return (
                      <tr key={ev.id} className="border-t border-border/20 hover:bg-muted/10">
                        <td className="px-3 py-2 font-mono">{ev.param}</td>
                        <td className="px-3 py-2 font-mono text-[10px]">
                          {ev.oldValue ?? "?"} → {ev.newValue ?? "?"}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {ev.expectedImpact ?? "—"}
                        </td>
                        <td className={`px-3 py-2 font-bold ${status.color}`}>
                          {status.label}
                          {ev.consecutiveFailures > 0 && ev.consecutiveFailures < 3 && (
                            <span className="text-[10px] text-muted-foreground ml-1">({ev.consecutiveFailures}×)</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right text-[10px] text-muted-foreground/70 font-mono">
                          {new Date(ev.createdAt).toLocaleString("es-MX", { timeZone: "America/Cancun", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground/60 text-center">
          Tesis v4.1 · Los inviolables vienen de las propias lecciones críticas de Tanit · No es jaula, es chasis y FIA
        </p>
      </div>
    </MainLayout>
  )
}
