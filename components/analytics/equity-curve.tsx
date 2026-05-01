"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

// Generate mock equity curve data
const generateEquityData = () => {
  const data = []
  let equity = 100000
  const startDate = new Date("2025-01-01")
  
  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    // Simulate realistic equity curve with some volatility
    const dailyReturn = (Math.random() - 0.45) * 0.03
    equity = equity * (1 + dailyReturn)
    
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      equity: Math.round(equity),
      benchmark: 100000 + i * 500, // Simple benchmark line
    })
  }
  
  return data
}

const equityData = generateEquityData()

export function EquityCurve() {
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Equity Curve</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Portfolio value over time</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-4 rounded bg-primary" />
            <span className="text-[10px] text-muted-foreground">Portfolio</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-4 rounded bg-muted-foreground/30" />
            <span className="text-[10px] text-muted-foreground">Benchmark</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={equityData}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.7 0.25 330)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.7 0.25 330)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
            />
            <Area
              type="monotone"
              dataKey="benchmark"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1}
              fill="none"
              strokeDasharray="5 5"
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="oklch(0.7 0.25 330)"
              strokeWidth={2}
              fill="url(#equityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="px-5 py-3 border-t border-border/50 bg-muted/10 grid grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Starting</p>
          <p className="text-sm font-semibold text-foreground">$100,000</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Current</p>
          <p className="text-sm font-semibold text-success">$284,621</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Peak</p>
          <p className="text-sm font-semibold text-foreground">$296,420</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Return</p>
          <p className="text-sm font-semibold text-success">+184.6%</p>
        </div>
      </div>
    </div>
  )
}
