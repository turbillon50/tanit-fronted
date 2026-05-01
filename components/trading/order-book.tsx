"use client"

import { cn } from "@/lib/utils"

// Generate mock order book data
const generateOrders = (basePrice: number, side: "ask" | "bid") => {
  const orders = []
  const priceStep = side === "ask" ? 10 : -10
  let price = basePrice + (side === "ask" ? 50 : -50)
  
  for (let i = 0; i < 10; i++) {
    orders.push({
      price: price.toFixed(2),
      size: (Math.random() * 5 + 0.1).toFixed(4),
      total: (Math.random() * 50000 + 5000).toFixed(2),
      depth: Math.random() * 100,
    })
    price += priceStep
  }
  
  return side === "ask" ? orders.reverse() : orders
}

const asks = generateOrders(67842.50, "ask")
const bids = generateOrders(67842.50, "bid")

export function OrderBook() {
  return (
    <div className="glass-panel rounded-xl overflow-hidden h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50">
        <h3 className="text-sm font-semibold text-foreground">Order Book</h3>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 px-4 py-2 text-xs text-muted-foreground border-b border-border/30">
        <span>Price (USDT)</span>
        <span className="text-right">Size (BTC)</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (Sell Orders) */}
      <div className="divide-y divide-border/10">
        {asks.map((order, idx) => (
          <div
            key={`ask-${idx}`}
            className="relative grid grid-cols-3 px-4 py-1.5 text-xs hover:bg-muted/20"
          >
            <div
              className="absolute inset-0 bg-destructive/10"
              style={{ width: `${order.depth}%`, right: 0, left: "auto" }}
            />
            <span className="relative text-destructive font-mono">{order.price}</span>
            <span className="relative text-right text-foreground font-mono">{order.size}</span>
            <span className="relative text-right text-muted-foreground font-mono">{order.total}</span>
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="px-4 py-2 bg-muted/20 border-y border-border/30">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold chrome-text">$67,842.50</span>
          <span className="text-xs text-muted-foreground">Spread: 0.02%</span>
        </div>
      </div>

      {/* Bids (Buy Orders) */}
      <div className="divide-y divide-border/10">
        {bids.map((order, idx) => (
          <div
            key={`bid-${idx}`}
            className="relative grid grid-cols-3 px-4 py-1.5 text-xs hover:bg-muted/20"
          >
            <div
              className="absolute inset-0 bg-success/10"
              style={{ width: `${order.depth}%`, right: 0, left: "auto" }}
            />
            <span className="relative text-success font-mono">{order.price}</span>
            <span className="relative text-right text-foreground font-mono">{order.size}</span>
            <span className="relative text-right text-muted-foreground font-mono">{order.total}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
