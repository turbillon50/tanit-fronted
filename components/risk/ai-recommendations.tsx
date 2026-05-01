"use client"

import { cn } from "@/lib/utils"
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Shield } from "lucide-react"

const recommendations = [
  {
    id: "1",
    type: "reduce",
    priority: "high",
    title: "Consider Reducing BTC Leverage",
    description: "Current 10x leverage on BTC position is above the balanced strategy threshold. Consider reducing to 7x to maintain risk parameters.",
    action: "Reduce leverage",
    icon: AlertTriangle,
  },
  {
    id: "2",
    type: "hold",
    priority: "medium",
    title: "ETH Position Well-Balanced",
    description: "5x leverage with 21% distance to liquidation is within acceptable risk parameters. No action required.",
    action: "Monitor",
    icon: CheckCircle2,
  },
  {
    id: "3",
    type: "opportunity",
    priority: "low",
    title: "SOL Short Performing Well",
    description: "Consider taking partial profits. Position up 2.68% with favorable funding rate. Suggest closing 30% of position.",
    action: "Take profits",
    icon: TrendingUp,
  },
  {
    id: "4",
    type: "diversify",
    priority: "medium",
    title: "Portfolio Concentration Warning",
    description: "42% exposure in single asset (BTC). Consider diversifying into uncorrelated assets to reduce portfolio risk.",
    action: "Diversify",
    icon: Shield,
  },
]

const priorityStyles = {
  high: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    badge: "bg-destructive/20 text-destructive",
  },
  medium: {
    bg: "bg-accent/10",
    border: "border-accent/30",
    badge: "bg-accent/20 text-accent",
  },
  low: {
    bg: "bg-success/10",
    border: "border-success/30",
    badge: "bg-success/20 text-success",
  },
}

export function AIRecommendations() {
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Tanit Recommendations</h3>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">AI Analysis</span>
      </div>

      {/* Recommendations */}
      <div className="divide-y divide-border/30">
        {recommendations.map((rec) => {
          const Icon = rec.icon
          const styles = priorityStyles[rec.priority as keyof typeof priorityStyles]
          
          return (
            <div key={rec.id} className="p-4 hover:bg-muted/10 transition-colors">
              <div className="flex gap-3">
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", styles.bg)}>
                  <Icon className={cn("h-5 w-5", rec.priority === "high" ? "text-destructive" : rec.priority === "medium" ? "text-accent" : "text-success")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-medium text-foreground">{rec.title}</h4>
                    <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium uppercase", styles.badge)}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{rec.description}</p>
                  <button className="mt-2 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                    {rec.action} →
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border/50 bg-muted/10">
        <p className="text-[10px] text-center text-muted-foreground">
          Recommendations are based on your risk profile and market conditions
        </p>
      </div>
    </div>
  )
}
