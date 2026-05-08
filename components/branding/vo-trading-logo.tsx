"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { useState } from "react"

/**
 * VO Trading — branding público de la app SaaS.
 *
 * Si existe `/public/images/vo-trading.png` (Luis lo sube cuando quiera),
 * lo usa. Si no, fallback a un SVG inline que aproxima el render: V cromada
 * con bisel, O naranja luminosa circular, "Trading" en chrome con base
 * naranja "IA DESIGN TRADER".
 *
 * Siempre sobre fondo negro absoluto. Sin chips, sin badges, sin pretensión.
 */
export function VoTradingLogo({
  size = "md",
  withTagline = true,
  className,
}: {
  size?: "sm" | "md" | "lg"
  withTagline?: boolean
  className?: string
}) {
  const [imgFailed, setImgFailed] = useState(false)

  const dim = size === "sm" ? 80 : size === "lg" ? 240 : 140
  const txtSize =
    size === "sm" ? "text-[10px]" : size === "lg" ? "text-xs" : "text-[11px]"

  // Si Luis sube la imagen real al repo, la usamos.
  if (!imgFailed) {
    return (
      <div className={cn("relative flex items-center justify-center", className)}>
        <Image
          src="/images/vo-trading.png"
          alt="VO Trading — IA Design Trader"
          width={dim * 3}
          height={dim}
          className="select-none"
          onError={() => setImgFailed(true)}
          priority
        />
      </div>
    )
  }

  // Fallback SVG inline mientras no hay PNG.
  // Recreación aproximada del render: V chrome 3D + O naranja con halo.
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        viewBox="0 0 200 200"
        width={dim}
        height={dim}
        aria-label="VO Trading"
        className="select-none"
      >
        <defs>
          {/* Chrome gradient para la V */}
          <linearGradient id="vChrome" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8e8ec" />
            <stop offset="35%" stopColor="#9ca0aa" />
            <stop offset="55%" stopColor="#3b3e46" />
            <stop offset="80%" stopColor="#c5c8d0" />
            <stop offset="100%" stopColor="#1a1c20" />
          </linearGradient>
          <linearGradient id="vChromeEdge" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          {/* Naranja con glow para la O */}
          <radialGradient id="oGlow">
            <stop offset="0%" stopColor="#ffb86b" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#a05a05" />
          </radialGradient>
          <filter id="oBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* V cromada */}
        <path
          d="M 30 50 L 75 150 L 95 150 L 140 50 L 120 50 L 85 130 L 50 50 Z"
          fill="url(#vChrome)"
          stroke="#0a0a0c"
          strokeWidth="0.5"
        />
        {/* Bisel highlight superior izquierdo de la V */}
        <path
          d="M 30 50 L 50 50 L 75 113 L 65 145 Z"
          fill="url(#vChromeEdge)"
          opacity="0.4"
        />

        {/* O naranja con halo */}
        <circle cx="160" cy="100" r="20" fill="url(#oGlow)" filter="url(#oBlur)" opacity="0.55" />
        <circle
          cx="160"
          cy="100"
          r="14"
          fill="none"
          stroke="url(#oGlow)"
          strokeWidth="3.5"
        />
        <circle
          cx="160"
          cy="100"
          r="14"
          fill="none"
          stroke="#fff5e0"
          strokeWidth="0.5"
          opacity="0.7"
        />
      </svg>

      <div className="flex flex-col items-start">
        <span
          className="font-semibold tracking-wide bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-700 bg-clip-text text-transparent"
          style={{
            fontSize: size === "sm" ? "16px" : size === "lg" ? "32px" : "22px",
            letterSpacing: "0.02em",
          }}
        >
          Trading
        </span>
        {withTagline && (
          <span
            className={cn(
              "uppercase tracking-[0.3em] text-amber-500/90",
              txtSize,
            )}
          >
            IA Design Trader
          </span>
        )}
      </div>
    </div>
  )
}
