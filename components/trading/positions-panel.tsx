"use client"

import { cn } from "@/lib/utils"

const mockPositions = [
  {
    id: "1",
    symbol: "BTC/USDT",
    side: "long",
    size: "0.5 BTC",
    entryPrice: "66,420.00",
    markPrice: "67,842.50",
    leverage: "10x",
    liquidationPrice: "59,778.00",
    unrealizedPnl: "+$711.25",
    pnlPercent: "+2.14%",
    margin: "$3,321.00",
  },
  {
    id: "2",
    symbol: "ETH/USDT",
    side: "long",
    size: "5 ETH",
    entryPrice: "3,480.00",
    markPrice: "3,521.80",
    leverage: "5x",
    liquidationPrice: "2,784.00",
    unrealizedPnl: "+$209.00",
    pnlPercent: "+1.20%",
    margin: "$3,480.00",
  },
  {
    id: "3",
    symbol: "SOL/USDT",
    side: "short",
    size: "100 SOL",
    entryPrice: "152.40",
    markPrice: "148.32",
    leverage: "3x",
    liquidationPrice: "203.20",
    unrealizedPnl: "+$408.00",
    pnlPercent: "+2.68%",
    margin: "$5,080.00",
  },
]

export function PositionsPanel() {
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Open Positions</h3>
        <span className="text-xs text-muted-foreground">{mockPositions.length} active</span>
      </div>

      {/* Positions */}
      <div className="divide-y divide-border/30">
        {mockPositions.map((position) => (
          <div key={position.id} className="p-4 hover:bg-muted/10 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{position.symbol}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-medium uppercase",
                    position.side === "long"
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {position.side}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-medium">
                  {position.leverage}
                </span>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    position.unrealizedPnl.startsWith("+") ? "text-success" : "text-destructive"
                  )}
                >
                  {position.unrealizedPnl}
                </p>
                <p
                  className={cn(
                    "text-xs",
                    position.pnlPercent.startsWith("+") ? "text-success" : "text-destructive"
                  )}
                >
                  {position.pnlPercent}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">Size</p>
                <p className="text-foreground font-medium">{position.size}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Entry</p>
                <p className="text-foreground font-medium">${position.entryPrice}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mark</p>
                <p className="text-foreground font-medium">${position.markPrice}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Liq. Price</p>
                <p className="text-destructive/80 font-medium">${position.liquidationPrice}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border/50 bg-muted/10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Total Margin Used</span>
          <span className="text-foreground font-medium">$11,881.00</span>
        </div>
      </div>
    </div>
  )
}
