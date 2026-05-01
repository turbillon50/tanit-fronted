import { MainLayout } from "@/components/layout/main-layout"
import { EquityCurve } from "@/components/analytics/equity-curve"
import { PnLChart } from "@/components/analytics/pnl-chart"
import { PerformanceMetrics, DetailedMetrics } from "@/components/analytics/performance-metrics"
import { MetricsCard } from "@/components/dashboard/metrics-card"
import { Download, FileText, Calendar } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold chrome-text">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Comprehensive performance analysis • Simulated data
            </p>
          </div>
          
          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <button className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Calendar className="h-4 w-4" />
              Last 90 Days
            </button>
            <button className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <FileText className="h-4 w-4" />
              PDF Report
            </button>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-medium hover:bg-primary/90 transition-colors glow-magenta-sm">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            title="Total Return"
            value="+184.6%"
            change="+$184,621"
            changeType="positive"
            subtitle="Since inception"
          />
          <MetricsCard
            title="Win Rate"
            value="68%"
            change="156W / 73L"
            changeType="positive"
            subtitle="229 total trades"
          />
          <MetricsCard
            title="Profit Factor"
            value="2.14"
            change="Target: 1.5"
            changeType="positive"
            subtitle="Above benchmark"
          />
          <MetricsCard
            title="Max Drawdown"
            value="-12.4%"
            change="Within limits"
            changeType="neutral"
            subtitle="Peak to trough"
          />
        </div>

        {/* Equity Curve */}
        <EquityCurve />

        {/* PnL & Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PnLChart />
          
          {/* Drawdown Chart Placeholder */}
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50">
              <h3 className="text-sm font-semibold text-foreground">Drawdown</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Portfolio decline from peaks</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <DrawdownBar label="Current" value={3.2} max={20} />
                <DrawdownBar label="Max (Feb 8)" value={12.4} max={20} isMax />
                <DrawdownBar label="Avg" value={5.8} max={20} />
              </div>
              
              <div className="mt-6 p-4 rounded-lg bg-muted/20">
                <p className="text-xs text-muted-foreground">
                  Current drawdown is <span className="text-success font-medium">3.2%</span> from the all-time high of <span className="text-foreground font-medium">$296,420</span>. 
                  Maximum drawdown of 12.4% occurred on February 8th during a market-wide correction.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Win Rate & Distribution */}
        <PerformanceMetrics />

        {/* Detailed Metrics */}
        <DetailedMetrics />

        {/* Recent Performance */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <h3 className="text-sm font-semibold text-foreground">Recent Trade History</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Last 10 trades</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="px-4 py-3 text-left text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Pair</th>
                  <th className="px-4 py-3 text-left text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Side</th>
                  <th className="px-4 py-3 text-left text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Entry</th>
                  <th className="px-4 py-3 text-left text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Exit</th>
                  <th className="px-4 py-3 text-right text-[10px] text-muted-foreground uppercase tracking-wider font-medium">PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                <TradeRow date="Apr 30" pair="BTC/USDT" side="long" entry="$66,420" exit="$67,842" pnl="+$1,422" />
                <TradeRow date="Apr 29" pair="ETH/USDT" side="long" entry="$3,480" exit="$3,521" pnl="+$205" />
                <TradeRow date="Apr 28" pair="SOL/USDT" side="short" entry="$152" exit="$148" pnl="+$400" />
                <TradeRow date="Apr 27" pair="BTC/USDT" side="short" entry="$67,800" exit="$68,200" pnl="-$400" />
                <TradeRow date="Apr 26" pair="ETH/USDT" side="long" entry="$3,320" exit="$3,480" pnl="+$800" />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

function DrawdownBar({ label, value, max, isMax = false }: { label: string; value: number; max: number; isMax?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={`text-xs font-medium ${isMax ? "text-destructive" : "text-foreground"}`}>
          -{value}%
        </span>
      </div>
      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${isMax ? "bg-destructive" : "bg-accent"}`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  )
}

function TradeRow({ date, pair, side, entry, exit, pnl }: { 
  date: string
  pair: string
  side: "long" | "short"
  entry: string
  exit: string
  pnl: string
}) {
  const isProfit = pnl.startsWith("+")
  
  return (
    <tr className="hover:bg-muted/10 transition-colors">
      <td className="px-4 py-3 text-xs text-foreground">{date}</td>
      <td className="px-4 py-3 text-xs font-medium text-foreground">{pair}</td>
      <td className="px-4 py-3">
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
          side === "long" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
        }`}>
          {side}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{entry}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{exit}</td>
      <td className={`px-4 py-3 text-xs font-semibold text-right ${isProfit ? "text-success" : "text-destructive"}`}>
        {pnl}
      </td>
    </tr>
  )
}
