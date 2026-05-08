"use client"

import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { VoTradingLogo } from "@/components/branding/vo-trading-logo"
import { ArrowRight } from "lucide-react"

/**
 * Home pública — VO Trading SaaS.
 *
 * Sólo branding + CTA a la conversación.
 * Sin métricas operativas, sin posiciones, sin números públicos —
 * eso vive en la sesión privada de cada usuario.
 */
export default function HomePage() {
  return (
    <MainLayout>
      <div className="min-h-[calc(100dvh-4rem)] lg:min-h-screen flex items-center justify-center px-6 py-16 bg-black">
        <div className="max-w-3xl w-full flex flex-col items-center text-center gap-12">
          {/* Logo grande, centrado */}
          <VoTradingLogo size="lg" withTagline />

          {/* Pitch corto */}
          <div className="space-y-5 max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-100 leading-tight">
              Tu trader IA con memoria.
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
              Conversa con tu trader personal. Recuerda quién eres, qué quieres,
              y cada trade que ha hecho contigo. No es bot. No es calculadora.
              Es una pareja estratégica que aprende.
            </p>
          </div>

          {/* CTA */}
          <Link
            href="/chat"
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-zinc-100 text-zinc-900 hover:bg-white transition-colors font-medium text-base"
          >
            Empezar conversación
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <p className="text-xs text-zinc-600 tracking-wide">
            Construido sobre Mastra · Neon · Bybit · Gemini
          </p>
        </div>
      </div>
    </MainLayout>
  )
}
