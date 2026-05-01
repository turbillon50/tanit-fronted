"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, AlertTriangle, X, ChevronDown } from "lucide-react"

const positionsData = [
  {
    id: "1",
    symbol: "BTC/USDT",
    side: "long",
    size: "0.5 BTC",
    sizeUsd: 33921.25,
    entryPrice: 66420.00,
    markPrice: 67842.50,
    leverage: 10,
    liquidationPrice: 59778.00,
    liquidationProximity: 12.3,
    unrealizedPnl: 711.25,
    pnlPercent: 2.14,
    margin: 3321.00,
    marginRatio: 42,
    funding: -12.40,
    openTime: "2h 15m",
  },
  {
    id: "2",
    symbol: "ETH/USDT",
    side: "long",
    size: "5 ETH",
    sizeUsd: 17609.00,
    entryPrice: 3480.00,
    markPrice: 3521.80,
    leverage: 5,
    liquidationPrice: 2784.00,
    liquidationProximity: 20.9,
    unrealizedPnl: 209.00,
    pnlPercent: 1.20,
    margin: 3480.00,
    marginRatio: 28,
    funding: -4.20,
    openTime: "5h 42m",
  },
  {
    id: "3",
    symbol: "SOL/USDT",
    side: "short",
    size: "100 SOL",
    sizeUsd: 14832.00,
    entryPrice: 152.40,
    markPrice: 148.32,
    leverage: 3,
    liquidationPrice: 203.20,
    liquidationProximity: 36.9,
    unrealizedPnl: 408.00,
    pnlPercent: 2.68,
    margin: 5080.00,
    marginRatio: 18,
    funding: 2.80,
    openTime: "12h 8m",
  },
]

export function PositionsTable() {
  const [positions, setPositions] = useState(positionsData)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prev => prev.map(p => ({
        ...p,
        markPrice: p.markPrice + (Math.random() - 0.5) * (p.markPrice * 0.001),
        unrealizedPnl: p.unrealizedPnl + (Math.random() - 0.5) * 10,
      })))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const totalExposure = positions.reduce((sum, p) => sum + p.sizeUsd, 0)
  const totalMargin = positions.reduce((sum, p) => sum + p.margin, 0)
  const totalPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0)

  const hasHighRiskPosition = positions.some(p => p.liquidationProximity < 15)

  return (
    <div className={cn(
      "glass-panel rounded-xl overflow-hidden shadow-cinematic",
      hasHighRiskPosition && "border-destructive/30"
    )}>
      {/* Header */}
      <div className={cn(
        "px-5 py-4 border-b border-border/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4",
        hasHighRiskPosition && "bg-gradient-to-r from-destructive/5 to-transparent"
      )}>
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Active Positions</h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary">
                {positions.length}
              </span>
              {hasHighRiskPosition && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-destructive/20 text-destructive text-[10px] font-bold animate-pulse">
                  <AlertTriangle className="h-3 w-3" />
                  HIGH RISK
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Real-time position monitoring</p>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="flex items-center gap-4 lg:gap-6">
          <SummaryItem label="Exposure" value={`$${totalExposure.toLocaleString()}`} />
          <SummaryItem label="Margin" value={`$${totalMargin.toLocaleString()}`} />
          <SummaryItem 
            label="Total PnL" 
            value={`${totalPnl >= 0 ? "+" : ""}$${totalPnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            highlight={totalPnl >= 0 ? "success" : "destructive"}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/20 bg-muted/10">
              <th className="px-4 py-3 text-left text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                Symbol
              </th>
              <th className="px-4 py-3 text-left text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                Size
              </th>
              <th className="px-4 py-3 text-left text-[10px] text-muted-foreground uppercase tracking-wider font-bold hidden md:table-cell">
                Entry / Mark
              </th>
              <th className="px-4 py-3 text-left text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                Leverage
              </th>
              <th className="px-4 py-3 text-left text-[10px] text-muted-foreground uppercase tracking-wider font-bold hidden lg:table-cell">
                Liquidation
              </th>
              <th className="px-4 py-3 text-right text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                PnL
              </th>
              <th className="px-4 py-3 text-center text-[10px] text-muted-foreground uppercase tracking-wider font-bold w-10">
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {positions.map((position) => {
              const isDanger = position.liquidationProximity < 15
              const isExpanded = expandedRow === position.id

              return (
                <>
                  <tr 
                    key={position.id} 
                    className={cn(
                      "hover:bg-muted/10 transition-colors cursor-pointer",
                      isDanger && "bg-destructive/5 hover:bg-destructive/10"
                    )}
                    onClick={() => setExpandedRow(isExpanded ? null : position.id)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {isDanger && (
                          <div className="p-1 rounded bg-destructive/20 animate-pulse-danger">
                            <AlertTriangle className="h-3 w-3 text-destructive" />
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-bold text-foreground">{position.symbol}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={cn(
                                "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                                position.side === "long"
                                  ? "bg-success/10 text-success"
                                  : "bg-destructive/10 text-destructive"
                              )}
                            >
                              {position.side}
                            </span>
                            <span className="text-[10px] text-muted-foreground">• {position.openTime}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-foreground">{position.size}</p>
                      <p className="text-[10px] text-muted-foreground">${position.sizeUsd.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-sm text-foreground font-mono">${position.entryPrice.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">${position.markPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-bold",
                        position.leverage >= 10 ? "bg-destructive/20 text-destructive" : 
                        position.leverage >= 5 ? "bg-warning/20 text-warning" : 
                        "bg-accent/20 text-accent"
                      )}>
                        {position.leverage}x
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-mono",
                          isDanger ? "text-destructive font-bold" : "text-muted-foreground"
                        )}>
                          ${position.liquidationPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1 w-16 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all",
                              position.liquidationProximity > 30 ? "bg-success" : 
                              position.liquidationProximity > 15 ? "bg-warning" : 
                              "bg-destructive animate-pulse"
                            )}
                            style={{ width: `${Math.min(position.liquidationProximity * 2, 100)}%` }}
                          />
                        </div>
                        <span className={cn(
                          "text-[10px] font-bold",
                          isDanger ? "text-destructive" : "text-muted-foreground"
                        )}>
                          {position.liquidationProximity}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p
                        className={cn(
                          "text-sm font-bold flex items-center justify-end gap-1",
                          position.unrealizedPnl >= 0 ? "text-success" : "text-destructive"
                        )}
                      >
                        {position.unrealizedPnl >= 0 ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                        {position.unrealizedPnl >= 0 ? "+" : ""}${Math.abs(position.unrealizedPnl).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      <p
                        className={cn(
                          "text-[10px] font-semibold",
                          position.pnlPercent >= 0 ? "text-success" : "text-destructive"
                        )}
                      >
                        {position.pnlPercent >= 0 ? "+" : ""}{position.pnlPercent}%
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <ChevronDown className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        isExpanded && "rotate-180"
                      )} />
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-muted/5">
                      <td colSpan={7} className="px-4 py-4">
                        <ExpandedPositionDetails position={position} />
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Liquidation Warning Banner */}
      {hasHighRiskPosition && (
        <div className="p-4 border-t border-destructive/30 bg-gradient-to-r from-destructive/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/20 animate-pulse-danger">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-destructive">LIQUIDATION RISK DETECTED</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                One or more positions are approaching liquidation. Consider reducing leverage or adding margin.
              </p>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-destructive/20 border border-destructive/30 text-xs font-bold text-destructive hover:bg-destructive/30 transition-colors">
              Review Risk
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryItem({ label, value, highlight }: { label: string; value: string; highlight?: "success" | "destructive" }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={cn(
        "text-sm font-bold",
        highlight === "success" && "text-success",
        highlight === "destructive" && "text-destructive",
        !highlight && "text-foreground"
      )}>
        {value}
      </p>
    </div>
  )
}

function ExpandedPositionDetails({ position }: { position: typeof positionsData[0] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 glass-panel-dark rounded-lg">
      <DetailItem label="Entry Price" value={`$${position.entryPrice.toLocaleString()}`} />
      <DetailItem label="Mark Price" value={`$${position.markPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
      <DetailItem label="Margin Used" value={`$${position.margin.toLocaleString()}`} />
      <DetailItem label="Margin Ratio" value={`${position.marginRatio}%`} highlight={position.marginRatio > 40 ? "warning" : undefined} />
      <DetailItem label="Liquidation Price" value={`$${position.liquidationPrice.toLocaleString()}`} highlight={position.liquidationProximity < 15 ? "destructive" : undefined} />
      <DetailItem label="Liq. Distance" value={`${position.liquidationProximity}%`} highlight={position.liquidationProximity < 15 ? "destructive" : position.liquidationProximity < 25 ? "warning" : "success"} />
      <DetailItem label="Funding" value={`${position.funding >= 0 ? "+" : ""}$${position.funding.toFixed(2)}`} highlight={position.funding < 0 ? "destructive" : "success"} />
      <DetailItem label="Open Duration" value={position.openTime} />
    </div>
  )
}

function DetailItem({ label, value, highlight }: { label: string; value: string; highlight?: "success" | "warning" | "destructive" }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={cn(
        "text-sm font-semibold font-mono mt-0.5",
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
