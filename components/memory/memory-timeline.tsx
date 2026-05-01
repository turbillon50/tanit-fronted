"use client"

import { cn } from "@/lib/utils"
import { 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Brain, 
  Shield,
  Clock
} from "lucide-react"

const memoryEntries = [
  {
    id: "1",
    type: "lesson",
    title: "Avoid Low-Volume Entry Points",
    content: "Market analysis showed that entries during Asian session low-volume periods resulted in 67% more stop-loss hits. Adjusted strategy to prefer entries during London/NY overlap.",
    tags: ["strategy", "timing", "lesson"],
    timestamp: "Today, 14:32",
    icon: BookOpen,
  },
  {
    id: "2",
    type: "agreement",
    title: "Maximum Leverage Cap",
    content: "User agreed to maintain maximum 15x leverage on any single position as per the balanced risk strategy. This rule supersedes market conditions.",
    tags: ["risk", "agreement", "leverage"],
    timestamp: "Today, 11:15",
    icon: Shield,
  },
  {
    id: "3",
    type: "decision",
    title: "BTC Long Position Opened",
    content: "Entered long position at $66,420 with 10x leverage based on bullish divergence on 4H timeframe. Stop loss set at $59,778 (10% from entry).",
    tags: ["trade", "BTC", "decision"],
    timestamp: "Yesterday, 22:48",
    icon: TrendingUp,
  },
  {
    id: "4",
    type: "warning",
    title: "Overtrading Pattern Detected",
    content: "Analysis shows increased trading frequency after losses. Implemented 30-minute cool-down period after any losing trade to prevent emotional decisions.",
    tags: ["psychology", "warning", "discipline"],
    timestamp: "Yesterday, 15:20",
    icon: AlertTriangle,
  },
  {
    id: "5",
    type: "success",
    title: "SOL Short Target Reached",
    content: "Short position from $152.40 hit first target at $148.00. Took 30% profits as per scaling strategy. Remaining position trailing with stop at entry.",
    tags: ["trade", "SOL", "success"],
    timestamp: "2 days ago",
    icon: CheckCircle2,
  },
  {
    id: "6",
    type: "insight",
    title: "Correlation Analysis Update",
    content: "ETH/BTC correlation dropped to 0.72 from 0.89. This suggests potential for independent ETH movements. Adjusting position sizing to account for reduced correlation benefit.",
    tags: ["analysis", "correlation", "ETH"],
    timestamp: "3 days ago",
    icon: Brain,
  },
]

const typeStyles = {
  lesson: { bg: "bg-primary/10", color: "text-primary", dot: "bg-primary" },
  agreement: { bg: "bg-accent/10", color: "text-accent", dot: "bg-accent" },
  decision: { bg: "bg-success/10", color: "text-success", dot: "bg-success" },
  warning: { bg: "bg-destructive/10", color: "text-destructive", dot: "bg-destructive" },
  success: { bg: "bg-success/10", color: "text-success", dot: "bg-success" },
  insight: { bg: "bg-secondary/20", color: "text-secondary", dot: "bg-secondary" },
}

export function MemoryTimeline() {
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Memory Timeline</h3>
        </div>
        <span className="text-xs text-muted-foreground">{memoryEntries.length} entries</span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-7 top-0 bottom-0 w-px bg-border/50" />

        <div className="divide-y divide-border/30">
          {memoryEntries.map((entry) => {
            const Icon = entry.icon
            const styles = typeStyles[entry.type as keyof typeof typeStyles]
            
            return (
              <div key={entry.id} className="relative p-5 pl-14 hover:bg-muted/10 transition-colors">
                {/* Timeline dot */}
                <div className={cn("absolute left-5 top-6 h-4 w-4 rounded-full border-2 border-background", styles.dot)} />
                
                {/* Content */}
                <div className="flex items-start gap-3">
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", styles.bg)}>
                    <Icon className={cn("h-5 w-5", styles.color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-medium text-foreground">{entry.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{entry.timestamp}</p>
                      </div>
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium uppercase shrink-0", styles.bg, styles.color)}>
                        {entry.type}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {entry.content}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-muted/50 text-[10px] text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Load More */}
      <div className="px-5 py-4 border-t border-border/50 bg-muted/10 text-center">
        <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
          Load more entries
        </button>
      </div>
    </div>
  )
}
