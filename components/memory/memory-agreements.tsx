"use client"

import { cn } from "@/lib/utils"
import { Shield, Check, AlertCircle } from "lucide-react"

const agreements = [
  {
    id: "1",
    title: "Maximum Position Size",
    description: "No single position shall exceed 30% of total portfolio value",
    status: "active",
    createdAt: "Dec 15, 2025",
    lastChecked: "Today, 14:32",
    isViolated: false,
  },
  {
    id: "2",
    title: "Maximum Leverage",
    description: "Leverage shall not exceed 15x on any position in balanced mode",
    status: "active",
    createdAt: "Dec 15, 2025",
    lastChecked: "Today, 14:32",
    isViolated: true,
    violation: "BTC position at 10x (within limits)",
  },
  {
    id: "3",
    title: "Stop Loss Requirement",
    description: "All positions must have a stop loss within 10% of entry price",
    status: "active",
    createdAt: "Dec 10, 2025",
    lastChecked: "Today, 14:32",
    isViolated: false,
  },
  {
    id: "4",
    title: "Cooldown After Loss",
    description: "Wait 30 minutes before opening new positions after a losing trade",
    status: "active",
    createdAt: "Jan 2, 2026",
    lastChecked: "Today, 14:32",
    isViolated: false,
  },
  {
    id: "5",
    title: "Daily Loss Limit",
    description: "Stop trading if daily losses exceed 5% of portfolio",
    status: "active",
    createdAt: "Dec 1, 2025",
    lastChecked: "Today, 14:32",
    isViolated: false,
  },
]

export function MemoryAgreements() {
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Trading Agreements</h3>
        </div>
        <span className="text-xs text-muted-foreground">{agreements.length} active rules</span>
      </div>

      {/* Agreements List */}
      <div className="divide-y divide-border/30">
        {agreements.map((agreement) => (
          <div key={agreement.id} className="p-4 hover:bg-muted/10 transition-colors">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                  agreement.isViolated ? "bg-destructive/10" : "bg-success/10"
                )}
              >
                {agreement.isViolated ? (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <Check className="h-4 w-4 text-success" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-medium text-foreground">{agreement.title}</h4>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-medium",
                      agreement.isViolated
                        ? "bg-destructive/10 text-destructive"
                        : "bg-success/10 text-success"
                    )}
                  >
                    {agreement.isViolated ? "Check" : "Compliant"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{agreement.description}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                  <span>Created: {agreement.createdAt}</span>
                  <span>•</span>
                  <span>Last checked: {agreement.lastChecked}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Agreement */}
      <div className="px-5 py-4 border-t border-border/50 bg-muted/10">
        <button className="w-full px-4 py-2.5 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-xs text-muted-foreground hover:text-primary transition-colors">
          + Add New Agreement
        </button>
      </div>
    </div>
  )
}
