"use client"

import { cn } from "@/lib/utils"
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Clock } from "lucide-react"

interface Insight {
  id: string
  type: "signal" | "warning" | "success" | "info"
  title: string
  description: string
  timestamp: string
}

const mockInsights: Insight[] = [
  {
    id: "1",
    type: "signal",
    title: "BTC Consolidation Pattern",
    description: "Price action suggests accumulation phase. Volume profile supports bullish bias above 67,400.",
    timestamp: "2 min ago",
  },
  {
    id: "2",
    type: "warning",
    title: "Elevated Market Volatility",
    description: "VIX equivalent metrics elevated. Consider reducing position sizes.",
    timestamp: "15 min ago",
  },
  {
    id: "3",
    type: "success",
    title: "Risk Parameters Optimal",
    description: "Current exposure within defined thresholds. Portfolio heat: 42%.",
    timestamp: "1 hour ago",
  },
  {
    id: "4",
    type: "info",
    title: "Memory Updated",
    description: "Lesson learned: Avoid entries during low-volume periods. Strategy adjusted.",
    timestamp: "3 hours ago",
  },
]

const typeIcons = {
  signal: TrendingUp,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Clock,
}

const typeStyles = {
  signal: {
    icon: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  warning: {
    icon: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
  success: {
    icon: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
  },
  info: {
    icon: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-muted",
  },
}

export function AIInsights() {
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">AI Insights</h3>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Live Analysis</span>
      </div>

      {/* Insights List */}
      <div className="divide-y divide-border/30">
        {mockInsights.map((insight) => {
          const Icon = typeIcons[insight.type]
          const styles = typeStyles[insight.type]
          
          return (
            <div key={insight.id} className="px-5 py-4 hover:bg-muted/20 transition-colors">
              <div className="flex gap-3">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", styles.bg)}>
                  <Icon className={cn("h-4 w-4", styles.icon)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-medium text-foreground truncate">{insight.title}</h4>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{insight.timestamp}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{insight.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border/50 bg-muted/20">
        <button className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">
          View All Insights
        </button>
      </div>
    </div>
  )
}
