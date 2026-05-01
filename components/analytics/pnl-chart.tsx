"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

// Generate mock PnL data
const generatePnLData = (period: "daily" | "weekly" | "monthly") => {
  const data = []
  const count = period === "daily" ? 30 : period === "weekly" ? 12 : 6
  
  for (let i = 0; i < count; i++) {
    const pnl = (Math.random() - 0.4) * 5000
    data.push({
      label: period === "daily" 
        ? `Day ${i + 1}` 
        : period === "weekly" 
        ? `W${i + 1}` 
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
      pnl: Math.round(pnl),
      isPositive: pnl >= 0,
    })
  }
  
  return data
}

const periods = ["daily", "weekly", "monthly"] as const

export function PnLChart() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily")
  const data = generatePnLData(period)
  
  const totalPnL = data.reduce((sum, d) => sum + d.pnl, 0)
  const winningDays = data.filter((d) => d.pnl >= 0).length
  const losingDays = data.filter((d) => d.pnl < 0).length

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Profit & Loss</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Performance breakdown by period</p>
        </div>
        
        {/* Period Toggle */}
        <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors",
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[250px] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "PnL"]}
            />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isPositive ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="px-5 py-3 border-t border-border/50 bg-muted/10 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Total PnL</p>
          <p className={cn("text-sm font-semibold", totalPnL >= 0 ? "text-success" : "text-destructive")}>
            {totalPnL >= 0 ? "+" : ""}${totalPnL.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Winning</p>
          <p className="text-sm font-semibold text-success">{winningDays}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Losing</p>
          <p className="text-sm font-semibold text-destructive">{losingDays}</p>
        </div>
      </div>
    </div>
  )
}
