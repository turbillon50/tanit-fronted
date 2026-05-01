"use client"

import { cn } from "@/lib/utils"
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"

const heatmapData = [
  { asset: "BTC", leverage: 10, exposure: 42, risk: "high", liquidationProximity: 12.3, pnl: "+2.14%" },
  { asset: "ETH", leverage: 5, exposure: 28, risk: "medium", liquidationProximity: 20.9, pnl: "+1.20%" },
  { asset: "SOL", leverage: 3, exposure: 18, risk: "low", liquidationProximity: 36.9, pnl: "+2.68%" },
  { asset: "AVAX", leverage: 0, exposure: 0, risk: "none", liquidationProximity: 0, pnl: "—" },
  { asset: "LINK", leverage: 0, exposure: 0, risk: "none", liquidationProximity: 0, pnl: "—" },
  { asset: "ARB", leverage: 0, exposure: 0, risk: "none", liquidationProximity: 0, pnl: "—" },
]

export function RiskHeatmap() {
  const totalExposure = heatmapData.reduce((sum, item) => sum + item.exposure, 0)

  return (
    <div className="glass-panel rounded-xl overflow-hidden shadow-cinematic">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/30 bg-gradient-to-r from-card to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Risk Heatmap</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Position concentration by asset</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30">
            <span className="text-[10px] text-muted-foreground">Total Heat:</span>
            <span className={cn(
              "text-sm font-bold",
              totalExposure < 50 ? "text-success" : totalExposure < 75 ? "text-warning" : "text-destructive"
            )}>
              {totalExposure}%
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {heatmapData.map((item) => (
            <HeatmapCell key={item.asset} {...item} />
          ))}
        </div>
      </div>

      {/* Liquidation Zone Warning */}
      {heatmapData.some(item => item.liquidationProximity > 0 && item.liquidationProximity < 15) && (
        <div className="mx-5 mb-5 p-4 rounded-lg glass-panel-danger border border-destructive/40 animate-pulse-danger">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/20">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-bold text-destructive">LIQUIDATION ZONE</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                BTC position is {heatmapData[0].liquidationProximity}% away from liquidation. Consider reducing leverage.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="px-5 py-3 border-t border-border/30 bg-card/50">
        <div className="flex items-center justify-center gap-6">
          <LegendItem color="success" label="Low Risk" />
          <LegendItem color="warning" label="Medium" />
          <LegendItem color="destructive" label="High Risk" />
        </div>
      </div>
    </div>
  )
}

function HeatmapCell({ 
  asset, 
  leverage, 
  exposure, 
  risk, 
  liquidationProximity,
  pnl 
}: { 
  asset: string
  leverage: number
  exposure: number
  risk: string
  liquidationProximity: number
  pnl: string
}) {
  const isDanger = risk === "high" && liquidationProximity < 15
  const isPositive = pnl.startsWith("+")

  return (
    <div
      className={cn(
        "relative p-4 rounded-lg border transition-all hover:scale-[1.02]",
        risk === "none" && "bg-muted/20 border-muted/30",
        risk === "low" && "bg-success/10 border-success/30",
        risk === "medium" && "bg-warning/10 border-warning/30",
        risk === "high" && !isDanger && "bg-destructive/10 border-destructive/30",
        isDanger && "glass-panel-danger border-destructive/50 animate-pulse-danger"
      )}
    >
      {/* Danger indicator */}
      {isDanger && (
        <div className="absolute -top-1 -right-1 p-1 rounded-full bg-destructive glow-danger">
          <AlertTriangle className="h-3 w-3 text-destructive-foreground" />
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-foreground">{asset}</span>
        {leverage > 0 && (
          <span className={cn(
            "px-1.5 py-0.5 rounded text-[10px] font-bold",
            risk === "high" ? "bg-destructive/20 text-destructive" : "bg-accent/20 text-accent"
          )}>
            {leverage}x
          </span>
        )}
      </div>
      
      <div className="text-xl font-bold chrome-text">
        {exposure > 0 ? `${exposure}%` : "—"}
      </div>
      
      {exposure > 0 ? (
        <>
          <p className={cn(
            "text-[10px] font-semibold mt-1 flex items-center gap-1",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
            {pnl}
          </p>
          {liquidationProximity > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-1">
                <span>Liq. Distance</span>
                <span className={liquidationProximity < 15 ? "text-destructive font-bold" : ""}>
                  {liquidationProximity}%
                </span>
              </div>
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    liquidationProximity > 30 ? "bg-success" : liquidationProximity > 15 ? "bg-warning" : "bg-destructive"
                  )}
                  style={{ width: `${Math.min(liquidationProximity * 2, 100)}%` }}
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-[10px] text-muted-foreground mt-1">No position</p>
      )}
    </div>
  )
}

function LegendItem({ color, label }: { color: "success" | "warning" | "destructive"; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn(
        "h-2.5 w-2.5 rounded",
        color === "success" && "bg-success/60",
        color === "warning" && "bg-warning/60",
        color === "destructive" && "bg-destructive/60"
      )} />
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}
