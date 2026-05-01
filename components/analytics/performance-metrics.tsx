"use client"

import { cn } from "@/lib/utils"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts"

const winRateData = [
  { name: "Wins", value: 68 },
  { name: "Losses", value: 32 },
]

const tradeDistribution = [
  { name: "BTC", value: 45, color: "oklch(0.7 0.25 330)" },
  { name: "ETH", value: 30, color: "oklch(0.65 0.2 145)" },
  { name: "SOL", value: 15, color: "oklch(0.75 0.12 85)" },
  { name: "Other", value: 10, color: "oklch(0.5 0.1 250)" },
]

export function PerformanceMetrics() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Win Rate */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground">Win Rate</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Overall trading performance</p>
        </div>
        
        <div className="p-6 flex items-center gap-6">
          <div className="h-32 w-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={winRateData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill="oklch(0.65 0.2 145)" />
                  <Cell fill="oklch(0.6 0.25 25)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-3xl font-bold text-success">68%</p>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-lg font-semibold text-success">156</p>
                <p className="text-[10px] text-muted-foreground">Wins</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-destructive">73</p>
                <p className="text-[10px] text-muted-foreground">Losses</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Distribution */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground">Trade Distribution</h3>
          <p className="text-xs text-muted-foreground mt-0.5">By asset</p>
        </div>
        
        <div className="p-6 flex items-center gap-6">
          <div className="h-32 w-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tradeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {tradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-2 flex-1">
            {tradeDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-foreground">{item.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DetailedMetrics() {
  const metrics = [
    { label: "Total Trades", value: "229", change: "+12 this week" },
    { label: "Profit Factor", value: "2.14", change: "Above target (1.5)" },
    { label: "Sharpe Ratio", value: "1.87", change: "Excellent" },
    { label: "Max Drawdown", value: "-12.4%", change: "Within limits" },
    { label: "Avg Win", value: "$1,247", change: null },
    { label: "Avg Loss", value: "-$582", change: null },
    { label: "Largest Win", value: "$8,420", change: "BTC Long" },
    { label: "Largest Loss", value: "-$2,180", change: "ETH Short" },
    { label: "Avg Hold Time", value: "4.2h", change: null },
    { label: "Best Day", value: "+$12,840", change: "Jan 15" },
    { label: "Worst Day", value: "-$4,210", change: "Feb 8" },
    { label: "Consecutive Wins", value: "8", change: "Current: 3" },
  ]

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Detailed Metrics</h3>
        <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
          Export Report
        </button>
      </div>
      
      <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="p-3 rounded-lg bg-muted/20">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{metric.label}</p>
            <p className={cn(
              "text-lg font-bold mt-1",
              metric.value.startsWith("-") ? "text-destructive" : 
              metric.value.startsWith("+") ? "text-success" : "chrome-text"
            )}>
              {metric.value}
            </p>
            {metric.change && (
              <p className="text-[10px] text-muted-foreground mt-0.5">{metric.change}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
