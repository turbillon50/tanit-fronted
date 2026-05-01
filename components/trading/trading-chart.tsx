"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

// Generate realistic candlestick data
const generateCandleData = () => {
  const data = []
  let price = 67500
  const times = []
  const now = new Date()
  
  for (let i = 49; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 15 * 60000)
    times.push(`${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`)
  }
  
  for (let i = 0; i < 50; i++) {
    const volatility = Math.random() * 400 + 100
    const open = price
    const change = (Math.random() - 0.48) * volatility
    const close = price + change
    const high = Math.max(open, close) + Math.random() * 150
    const low = Math.min(open, close) - Math.random() * 150
    const volume = Math.random() * 800 + 200

    data.push({
      time: times[i],
      open,
      high,
      low,
      close,
      volume,
      isUp: close >= open,
    })
    price = close
  }
  return data
}

const timeframes = ["1m", "5m", "15m", "1h", "4h", "1D"]
const assets = [
  { symbol: "BTC", name: "Bitcoin", price: 67842.50, change: 2.14 },
  { symbol: "ETH", name: "Ethereum", price: 3521.80, change: 1.87 },
  { symbol: "SOL", name: "Solana", price: 148.32, change: -0.42 },
]

export function TradingChart() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("15m")
  const [selectedAsset, setSelectedAsset] = useState(assets[0])
  const [candleData, setCandleData] = useState(generateCandleData)
  const [hoveredCandle, setHoveredCandle] = useState<number | null>(null)
  const [currentPrice, setCurrentPrice] = useState(selectedAsset.price)
  const [priceFlash, setPriceFlash] = useState(false)

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const change = (Math.random() - 0.5) * 20
        const newPrice = prev + change
        setPriceFlash(true)
        setTimeout(() => setPriceFlash(false), 300)
        return newPrice
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Calculate chart dimensions
  const chartHeight = 320
  const chartWidth = 100 // percentage
  const candleWidth = 1.6 // percentage
  const candleGap = 0.3

  // Find min/max for scaling
  const minPrice = Math.min(...candleData.map(d => d.low)) - 100
  const maxPrice = Math.max(...candleData.map(d => d.high)) + 100
  const priceRange = maxPrice - minPrice

  const scaleY = useCallback((price: number) => {
    return chartHeight - ((price - minPrice) / priceRange) * chartHeight
  }, [minPrice, priceRange, chartHeight])

  const maxVolume = Math.max(...candleData.map(d => d.volume))

  return (
    <div className="glass-panel rounded-xl overflow-hidden h-full shadow-cinematic">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/30 bg-gradient-to-r from-card to-transparent">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Asset Selector & Price */}
          <div className="flex items-center gap-4">
            <select
              value={selectedAsset.symbol}
              onChange={(e) => {
                const asset = assets.find((a) => a.symbol === e.target.value) || assets[0]
                setSelectedAsset(asset)
                setCurrentPrice(asset.price)
              }}
              className="bg-input border border-border rounded-lg px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {assets.map((asset) => (
                <option key={asset.symbol} value={asset.symbol}>
                  {asset.symbol}/USDT
                </option>
              ))}
            </select>
            <div>
              <div className="flex items-center gap-2">
                <p className={cn(
                  "text-2xl font-bold font-mono chrome-text transition-all",
                  priceFlash && "animate-number-update"
                )}>
                  ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className="relative flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-destructive/20 text-destructive">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className={cn(
                "text-xs font-semibold",
                selectedAsset.change >= 0 ? "text-success" : "text-destructive"
              )}>
                {selectedAsset.change >= 0 ? "+" : ""}{selectedAsset.change}%
              </p>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                  selectedTimeframe === tf
                    ? "bg-primary text-primary-foreground glow-magenta-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-[320px] lg:h-[380px] p-4 bg-gradient-to-b from-transparent to-card/30">
        {/* Price Grid Lines */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => (
            <line
              key={i}
              x1="0"
              y1={`${ratio * 100}%`}
              x2="100%"
              y2={`${ratio * 100}%`}
              stroke="rgba(255,255,255,0.03)"
              strokeDasharray="4 4"
            />
          ))}
        </svg>

        {/* Price Labels */}
        <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-between py-4 text-[10px] font-mono text-muted-foreground">
          <span>${(maxPrice / 1000).toFixed(1)}k</span>
          <span>${((maxPrice + minPrice) / 2 / 1000).toFixed(1)}k</span>
          <span>${(minPrice / 1000).toFixed(1)}k</span>
        </div>

        {/* Candlesticks */}
        <svg 
          className="w-full h-full" 
          viewBox={`0 0 100 ${chartHeight}`}
          preserveAspectRatio="none"
        >
          {/* Volume Bars */}
          {candleData.map((candle, i) => {
            const x = i * (candleWidth + candleGap) + candleGap
            const volumeHeight = (candle.volume / maxVolume) * 40
            return (
              <rect
                key={`vol-${i}`}
                x={x}
                y={chartHeight - volumeHeight}
                width={candleWidth}
                height={volumeHeight}
                fill={candle.isUp ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)"}
              />
            )
          })}

          {/* Candlesticks */}
          {candleData.map((candle, i) => {
            const x = i * (candleWidth + candleGap) + candleGap
            const centerX = x + candleWidth / 2
            const openY = scaleY(candle.open)
            const closeY = scaleY(candle.close)
            const highY = scaleY(candle.high)
            const lowY = scaleY(candle.low)
            const bodyTop = Math.min(openY, closeY)
            const bodyHeight = Math.abs(closeY - openY) || 1
            const isHovered = hoveredCandle === i

            return (
              <g 
                key={i}
                onMouseEnter={() => setHoveredCandle(i)}
                onMouseLeave={() => setHoveredCandle(null)}
                className="cursor-crosshair"
              >
                {/* Wick */}
                <line
                  x1={centerX}
                  y1={highY}
                  x2={centerX}
                  y2={lowY}
                  stroke={candle.isUp ? "#22c55e" : "#ef4444"}
                  strokeWidth={0.15}
                />
                {/* Body */}
                <rect
                  x={x}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={candle.isUp ? "#22c55e" : "#ef4444"}
                  opacity={isHovered ? 1 : 0.85}
                  rx={0.1}
                />
                {/* Hover highlight */}
                {isHovered && (
                  <rect
                    x={x - 0.2}
                    y={0}
                    width={candleWidth + 0.4}
                    height={chartHeight}
                    fill="rgba(255,255,255,0.02)"
                  />
                )}
              </g>
            )
          })}

          {/* Current Price Line */}
          <line
            x1="0"
            y1={scaleY(currentPrice)}
            x2="100"
            y2={scaleY(currentPrice)}
            stroke="rgba(236, 72, 153, 0.6)"
            strokeWidth={0.3}
            strokeDasharray="2 1"
          />
          <rect
            x="85"
            y={scaleY(currentPrice) - 4}
            width="15"
            height="8"
            fill="rgba(236, 72, 153, 0.8)"
            rx={1}
          />
        </svg>

        {/* Crosshair Tooltip */}
        {hoveredCandle !== null && (
          <div className="absolute top-4 left-4 glass-panel-dark rounded-lg p-3 text-xs space-y-1 animate-slide-up">
            <p className="text-muted-foreground">{candleData[hoveredCandle].time}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
              <span className="text-muted-foreground">O:</span>
              <span className="text-foreground">${candleData[hoveredCandle].open.toFixed(2)}</span>
              <span className="text-muted-foreground">H:</span>
              <span className="text-success">${candleData[hoveredCandle].high.toFixed(2)}</span>
              <span className="text-muted-foreground">L:</span>
              <span className="text-destructive">${candleData[hoveredCandle].low.toFixed(2)}</span>
              <span className="text-muted-foreground">C:</span>
              <span className={candleData[hoveredCandle].isUp ? "text-success" : "text-destructive"}>
                ${candleData[hoveredCandle].close.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer */}
      <div className="px-4 py-2 border-t border-border/30 bg-card/50">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span>Updating...</span>
          </div>
          <span>24h Vol: $2.4B</span>
          <span>H: $68,420</span>
          <span>L: $66,180</span>
        </div>
      </div>
    </div>
  )
}
