"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Shield, Scale, Flame } from "lucide-react"

const strategies = [
  {
    id: "conservative",
    name: "Conservative",
    icon: Shield,
    description: "Lower risk, stable returns",
    maxLeverage: "5x",
    maxExposure: "30%",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
  },
  {
    id: "balanced",
    name: "Balanced",
    icon: Scale,
    description: "Moderate risk/reward balance",
    maxLeverage: "15x",
    maxExposure: "50%",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/30",
  },
  {
    id: "aggressive",
    name: "Aggressive",
    icon: Flame,
    description: "Higher risk, potential for higher returns",
    maxLeverage: "50x",
    maxExposure: "80%",
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
  },
]

export function StrategyMode() {
  const [selected, setSelected] = useState("balanced")

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50">
        <h3 className="text-sm font-semibold text-foreground">Strategy Mode</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Risk profile configuration</p>
      </div>

      {/* Strategy Options */}
      <div className="p-5 space-y-3">
        {strategies.map((strategy) => {
          const Icon = strategy.icon
          const isSelected = selected === strategy.id
          
          return (
            <button
              key={strategy.id}
              onClick={() => setSelected(strategy.id)}
              className={cn(
                "w-full p-4 rounded-lg border transition-all text-left",
                isSelected
                  ? cn(strategy.bg, strategy.border, "ring-1", strategy.border.replace("border", "ring"))
                  : "bg-muted/20 border-border/30 hover:bg-muted/40"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg", isSelected ? strategy.bg : "bg-muted/50")}>
                  <Icon className={cn("h-5 w-5", isSelected ? strategy.color : "text-muted-foreground")} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={cn("font-semibold", isSelected ? strategy.color : "text-foreground")}>
                      {strategy.name}
                    </span>
                    {isSelected && (
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full", strategy.bg, strategy.color)}>
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{strategy.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[10px] text-muted-foreground">
                      Max Leverage: <span className="text-foreground">{strategy.maxLeverage}</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Max Exposure: <span className="text-foreground">{strategy.maxExposure}</span>
                    </span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer Note */}
      <div className="px-5 py-3 border-t border-border/50 bg-muted/10">
        <p className="text-[10px] text-muted-foreground text-center">
          Strategy mode affects position sizing recommendations and risk alerts
        </p>
      </div>
    </div>
  )
}
