"use client"

import { cn } from "@/lib/utils"

// Generate mock trade data
const generateTrades = () => {
  const trades = []
  let price = 67842.50
  
  for (let i = 0; i < 20; i++) {
    const isBuy = Math.random() > 0.5
    const priceChange = (Math.random() - 0.5) * 20
    price += priceChange
    
    trades.push({
      id: i,
      price: price.toFixed(2),
      size: (Math.random() * 2 + 0.01).toFixed(4),
      time: new Date(Date.now() - i * 3000).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      isBuy,
    })
  }
  
  return trades
}

const trades = generateTrades()

export function RecentTrades() {
  return (
    <div className="glass-panel rounded-xl overflow-hidden h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50">
        <h3 className="text-sm font-semibold text-foreground">Recent Trades</h3>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 px-4 py-2 text-xs text-muted-foreground border-b border-border/30">
        <span>Price (USDT)</span>
        <span className="text-right">Size (BTC)</span>
        <span className="text-right">Time</span>
      </div>

      {/* Trades */}
      <div className="max-h-[300px] overflow-y-auto divide-y divide-border/10">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="grid grid-cols-3 px-4 py-1.5 text-xs hover:bg-muted/20"
          >
            <span
              className={cn(
                "font-mono",
                trade.isBuy ? "text-success" : "text-destructive"
              )}
            >
              {trade.price}
            </span>
            <span className="text-right text-foreground font-mono">{trade.size}</span>
            <span className="text-right text-muted-foreground font-mono">{trade.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
