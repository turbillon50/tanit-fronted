"use client"

import { useState, useEffect, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { cn } from "@/lib/utils"
import { Gauge, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { api, type PortfolioPosition, type PortfolioBalance } from "@/lib/api"

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "AVAXUSDT", "LINKUSDT", "XRPUSDT", "DOGEUSDT", "ADAUSDT", "ATOMUSDT", "BCHUSDT", "LTCUSDT", "TONUSDT"]

interface Ticker {
  symbol: string
  price: number
  change24h: number
  changePercent24h: number
  high24h: number
  low24h: number
  volume24h: number
  markPrice: number
  indexPrice: number
}

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tanit-production.up.railway.app/api"

async function fetchTicker(symbol: string): Promise<Ticker | null> {
  try {
    const r = await fetch(`${API_URL}/market/ticker?symbol=${symbol}`, { cache: "no-store" })
    if (!r.ok) return null
    return await r.json()
  } catch { return null }
}

async function fetchCandles(symbol: string, interval: string): Promise<Candle[]> {
  try {
    const r = await fetch(`${API_URL}/market/candles?symbol=${symbol}&interval=${interval}`, { cache: "no-store" })
    if (!r.ok) return []
    const j = await r.json()
    return Array.isArray(j) ? j : (j.candles || [])
  } catch { return [] }
}

async function fetchFunding(symbol: string): Promise<number | null> {
  try {
    const r = await fetch(`${API_URL}/market/funding-rate?symbol=${symbol}`, { cache: "no-store" })
    if (!r.ok) return null
    const j = await r.json()
    return typeof j.fundingRate === "number" ? j.fundingRate : (typeof j === "number" ? j : null)
  } catch { return null }
}

export default function TerminalPage() {
  const [symbol, setSymbol] = useState("BTCUSDT")
  const [interval, setInterval_] = useState("15")
  const [ticker, setTicker] = useState<Ticker | null>(null)
  const [candles, setCandles] = useState<Candle[]>([])
  const [funding, setFunding] = useState<number | null>(null)
  const [balance, setBalance] = useState<PortfolioBalance | null>(null)
  const [positions, setPositions] = useState<PortfolioPosition[]>([])

  // Poll ticker + balance every 3s, candles every 30s
  useEffect(() => {
    let mounted = true
    let tickerTimer: ReturnType<typeof setInterval> | null = null
    let candleTimer: ReturnType<typeof setInterval> | null = null
    let stateTimer: ReturnType<typeof setInterval> | null = null

    async function loadAll() {
      const [t, c, f] = await Promise.all([
        fetchTicker(symbol),
        fetchCandles(symbol, interval),
        fetchFunding(symbol),
      ])
      if (!mounted) return
      if (t) setTicker(t)
      if (c.length > 0) setCandles(c)
      if (f !== null) setFunding(f)
    }

    async function loadState() {
      const [b, p] = await Promise.all([
        api.balance().catch(() => null),
        api.positions().catch(() => []),
      ])
      if (!mounted) return
      if (b) setBalance(b)
      setPositions(p)
    }

    loadAll()
    loadState()
    tickerTimer = setInterval(async () => {
      const t = await fetchTicker(symbol)
      if (mounted && t) setTicker(t)
    }, 3000)
    candleTimer = setInterval(async () => {
      const c = await fetchCandles(symbol, interval)
      if (mounted && c.length > 0) setCandles(c)
    }, 30000)
    stateTimer = setInterval(loadState, 8000)

    return () => {
      mounted = false
      if (tickerTimer) clearInterval(tickerTimer)
      if (candleTimer) clearInterval(candleTimer)
      if (stateTimer) clearInterval(stateTimer)
    }
  }, [symbol, interval])

  const equity = balance?.totalEquity ?? 0
  const used = equity - (balance?.availableBalance ?? 0)
  const riskLevel = equity > 0 ? Math.min(100, Math.round((used / equity) * 100)) : 0
  const riskStatus: "low" | "medium" | "high" =
    riskLevel < 30 ? "low" : riskLevel < 60 ? "medium" : "high"

  const isPositive = (ticker?.changePercent24h ?? 0) >= 0

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold chrome-text">Live Trading Terminal</h1>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-success/10 border border-success/30">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] font-bold text-success uppercase tracking-wider">LIVE · MAINNET</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time data from Bybit · {positions.length} open positions · Tanit autonomous
            </p>
          </div>

          <RiskMeter level={riskLevel} status={riskStatus} />
        </div>

        {/* Symbol selector + Interval */}
        <div className="glass-panel rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 flex-1">
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="bg-input border border-border rounded-lg px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {SYMBOLS.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
            <div className="flex flex-col">
              <span className="text-2xl font-bold chrome-text">
                {ticker ? `$${ticker.price.toLocaleString("en-US", { maximumFractionDigits: ticker.price < 10 ? 4 : 2 })}` : "—"}
              </span>
              {ticker && (
                <span className={cn(
                  "text-xs font-bold",
                  isPositive ? "text-success" : "text-destructive"
                )}>
                  {isPositive ? "+" : ""}{ticker.changePercent24h.toFixed(2)}%
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {["1", "5", "15", "60", "240", "D"].map((i) => (
              <button
                key={i}
                onClick={() => setInterval_(i)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  interval === i
                    ? "bg-primary text-primary-foreground glow-magenta-sm"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                )}
              >
                {i === "60" ? "1h" : i === "240" ? "4h" : i === "D" ? "1D" : `${i}m`}
              </button>
            ))}
          </div>
        </div>

        {/* Candle chart — REAL */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border/30 flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">{symbol} · {interval}m</h2>
            {ticker && (
              <div className="text-[10px] text-muted-foreground">
                24h Vol: ${(ticker.volume24h / 1e3).toFixed(2)}k · H ${ticker.high24h.toFixed(2)} · L ${ticker.low24h.toFixed(2)}
              </div>
            )}
          </div>
          <CandleChart candles={candles} />
        </div>

        {/* Open positions table */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border/30">
            <h2 className="text-sm font-bold text-foreground">Open Positions ({positions.length})</h2>
          </div>
          {positions.length === 0 ? (
            <p className="px-5 py-6 text-center text-xs text-muted-foreground">
              No open positions. Tanit is scanning the market.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/20 text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2">Symbol</th>
                    <th className="text-left px-4 py-2">Side</th>
                    <th className="text-right px-4 py-2">Size</th>
                    <th className="text-right px-4 py-2">Entry</th>
                    <th className="text-right px-4 py-2">Mark</th>
                    <th className="text-right px-4 py-2">Lev</th>
                    <th className="text-right px-4 py-2">PnL</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p) => {
                    const isLong = p.side === "Buy"
                    const pnlColor = p.unrealizedPnl >= 0 ? "text-success" : "text-destructive"
                    return (
                      <tr key={p.symbol} className="border-t border-border/20">
                        <td className="px-4 py-2 font-bold">{p.symbol.replace("USDT", "")}</td>
                        <td className="px-4 py-2">
                          <span className={isLong ? "px-2 py-0.5 rounded text-[10px] font-bold bg-success/15 text-success" : "px-2 py-0.5 rounded text-[10px] font-bold bg-destructive/15 text-destructive"}>
                            {isLong ? "LONG" : "SHORT"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right font-mono">{p.size}</td>
                        <td className="px-4 py-2 text-right font-mono">{p.entryPrice}</td>
                        <td className="px-4 py-2 text-right font-mono">{p.markPrice}</td>
                        <td className={`px-4 py-2 text-right font-bold ${p.leverage > 20 ? "text-warning" : ""}`}>{p.leverage}x</td>
                        <td className={`px-4 py-2 text-right font-bold ${pnlColor}`}>
                          {p.unrealizedPnl >= 0 ? "+" : ""}${p.unrealizedPnl.toFixed(4)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Market stats — REAL */}
        <MarketStats ticker={ticker} funding={funding} />
      </div>
    </MainLayout>
  )
}

function CandleChart({ candles }: { candles: Candle[] }) {
  const dims = { width: 800, height: 300, paddingY: 20, paddingX: 8, volumeHeight: 50 }

  const layout = useMemo(() => {
    if (candles.length === 0) return null
    const slice = candles.slice(-80)
    const allHighs = slice.map((c) => c.high)
    const allLows = slice.map((c) => c.low)
    const max = Math.max(...allHighs)
    const min = Math.min(...allLows)
    const range = max - min || 1
    const candleAreaH = dims.height - dims.volumeHeight - dims.paddingY * 2
    const xStep = (dims.width - dims.paddingX * 2) / slice.length
    const candleW = Math.max(2, xStep * 0.6)
    const maxVol = Math.max(...slice.map((c) => c.volume), 1)

    return slice.map((c, i) => {
      const x = dims.paddingX + i * xStep + xStep / 2
      const yHigh = dims.paddingY + ((max - c.high) / range) * candleAreaH
      const yLow = dims.paddingY + ((max - c.low) / range) * candleAreaH
      const yOpen = dims.paddingY + ((max - c.open) / range) * candleAreaH
      const yClose = dims.paddingY + ((max - c.close) / range) * candleAreaH
      const isUp = c.close >= c.open
      const volH = (c.volume / maxVol) * dims.volumeHeight
      const volY = dims.height - dims.paddingY - volH
      return { x, yHigh, yLow, yOpen, yClose, isUp, candleW, volH, volY, max, min }
    })
  }, [candles])

  if (!layout || layout.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center">
        <p className="text-xs text-muted-foreground">Cargando velas en vivo…</p>
      </div>
    )
  }

  const max = layout[0].max
  const min = layout[0].min

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${dims.width} ${dims.height}`} preserveAspectRatio="none" className="w-full h-72">
        {/* Horizontal grid */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={dims.paddingX}
            x2={dims.width - dims.paddingX}
            y1={dims.paddingY + t * (dims.height - dims.volumeHeight - dims.paddingY * 2)}
            y2={dims.paddingY + t * (dims.height - dims.volumeHeight - dims.paddingY * 2)}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-border"
            opacity="0.3"
            strokeDasharray="2 4"
          />
        ))}
        {/* Candles */}
        {layout.map((c, i) => (
          <g key={i}>
            <line x1={c.x} x2={c.x} y1={c.yHigh} y2={c.yLow} stroke={c.isUp ? "#10b981" : "#ef4444"} strokeWidth="1" />
            <rect
              x={c.x - c.candleW / 2}
              y={Math.min(c.yOpen, c.yClose)}
              width={c.candleW}
              height={Math.max(1, Math.abs(c.yClose - c.yOpen))}
              fill={c.isUp ? "#10b981" : "#ef4444"}
            />
            <rect x={c.x - c.candleW / 2} y={c.volY} width={c.candleW} height={c.volH} fill={c.isUp ? "#10b981" : "#ef4444"} opacity="0.4" />
          </g>
        ))}
      </svg>
      <div className="absolute top-2 right-3 text-[10px] text-muted-foreground font-mono">${max.toFixed(2)}</div>
      <div className="absolute bottom-16 right-3 text-[10px] text-muted-foreground font-mono">${min.toFixed(2)}</div>
    </div>
  )
}

function RiskMeter({ level, status }: { level: number; status: "low" | "medium" | "high" }) {
  return (
    <div className={cn(
      "glass-panel rounded-xl px-4 py-3 transition-all",
      status === "high" && "glass-panel-danger animate-pulse-danger"
    )}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {status === "high" ? (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          ) : (
            <Gauge className={cn("h-4 w-4", status === "low" ? "text-success" : "text-warning")} />
          )}
          <span className="text-xs text-muted-foreground font-medium">Margin Used</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-32 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                status === "low" && "bg-success",
                status === "medium" && "bg-warning",
                status === "high" && "bg-destructive"
              )}
              style={{ width: `${level}%` }}
            />
          </div>
          <span className={cn(
            "text-sm font-bold font-mono min-w-[3rem]",
            status === "low" && "text-success",
            status === "medium" && "text-warning",
            status === "high" && "text-destructive"
          )}>
            {level}%
          </span>
        </div>
      </div>
    </div>
  )
}

function MarketStats({ ticker, funding }: { ticker: Ticker | null; funding: number | null }) {
  if (!ticker) {
    return (
      <div className="glass-panel rounded-xl p-5">
        <p className="text-xs text-muted-foreground">Cargando datos de mercado…</p>
      </div>
    )
  }
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border/30 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Market Stats · {ticker.symbol}</h3>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] text-muted-foreground">Live</span>
        </div>
      </div>
      <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatItem label="Last Price" value={`$${ticker.price.toFixed(2)}`} />
        <StatItem
          label="24h Change"
          value={`${ticker.changePercent24h >= 0 ? "+" : ""}${ticker.changePercent24h.toFixed(2)}%`}
          highlight={ticker.changePercent24h >= 0 ? "success" : "destructive"}
        />
        <StatItem label="24h Volume" value={`${(ticker.volume24h / 1e3).toFixed(2)}k`} />
        <StatItem label="24h High" value={`$${ticker.high24h.toFixed(2)}`} highlight="success" />
        <StatItem label="24h Low" value={`$${ticker.low24h.toFixed(2)}`} highlight="destructive" />
        <StatItem
          label="Funding Rate"
          value={funding !== null ? `${funding >= 0 ? "+" : ""}${(funding * 100).toFixed(4)}%` : "—"}
          highlight={funding !== null ? (funding > 0.0005 ? "warning" : funding < -0.0005 ? "success" : undefined) : undefined}
        />
        <StatItem label="Mark Price" value={`$${ticker.markPrice.toFixed(2)}`} />
        <StatItem label="Index Price" value={`$${ticker.indexPrice.toFixed(2)}`} />
      </div>
    </div>
  )
}

function StatItem({ label, value, highlight }: { label: string; value: string; highlight?: "success" | "warning" | "destructive" }) {
  return (
    <div className="p-3 rounded-lg bg-muted/20">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={cn(
        "text-sm font-bold font-mono mt-1",
        highlight === "success" && "text-success",
        highlight === "warning" && "text-warning",
        highlight === "destructive" && "text-destructive",
        !highlight && "text-foreground"
      )}>
        {value}
      </p>
    </div>
  )
}

// Suppress unused import warnings
void TrendingUp
void TrendingDown
