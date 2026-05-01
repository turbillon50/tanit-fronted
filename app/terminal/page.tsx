"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { TradingChart } from "@/components/trading/trading-chart"
import { OrderBook } from "@/components/trading/order-book"
import { PositionsPanel } from "@/components/trading/positions-panel"
import { TradingControls } from "@/components/trading/trading-controls"
import { RecentTrades } from "@/components/trading/recent-trades"
import { cn } from "@/lib/utils"
import { Gauge, AlertTriangle, Radio } from "lucide-react"

export default function TerminalPage() {
  const [riskLevel, setRiskLevel] = useState(42)

  // Simulate risk level fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setRiskLevel(prev => {
        const delta = (Math.random() - 0.5) * 5
        return Math.max(10, Math.min(90, prev + delta))
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const riskStatus = riskLevel < 30 ? "low" : riskLevel < 60 ? "medium" : "high"

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold chrome-text">Live Trading Terminal</h1>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-destructive/10 border border-destructive/30">
                <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-[10px] font-bold text-destructive uppercase tracking-wider">LIVE</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Professional trading interface • Simulation Mode • Execution Locked
            </p>
          </div>
          
          {/* Risk Meter */}
          <RiskMeter level={riskLevel} status={riskStatus} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Chart Area */}
          <div className="lg:col-span-8">
            <TradingChart />
          </div>

          {/* Order Book */}
          <div className="lg:col-span-4">
            <OrderBook />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Positions Panel */}
          <div className="lg:col-span-8">
            <PositionsPanel />
          </div>

          {/* Trading Controls */}
          <div className="lg:col-span-4">
            <TradingControls />
          </div>
        </div>

        {/* Recent Trades & Market Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentTrades />
          <MarketStats />
        </div>
      </div>
    </MainLayout>
  )
}

function RiskMeter({ level, status }: { level: number; status: "low" | "medium" | "high" }) {
  return (
    <div className={cn(
      "glass-panel rounded-xl px-4 py-3 shadow-cinematic transition-all",
      status === "high" && "glass-panel-danger animate-pulse-danger"
    )}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {status === "high" ? (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          ) : (
            <Gauge className={cn(
              "h-4 w-4",
              status === "low" ? "text-success" : "text-warning"
            )} />
          )}
          <span className="text-xs text-muted-foreground font-medium">Risk Level</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-32 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                status === "low" && "bg-success glow-success",
                status === "medium" && "bg-warning glow-warning",
                status === "high" && "bg-destructive glow-danger"
              )}
              style={{ width: `${level}%` }}
            />
          </div>
          <span className={cn(
            "text-sm font-bold font-mono min-w-[3rem]",
            status === "low" && "text-success",
            status === "medium" && "text-warning",
            status === "high" && "text-destructive"
          )}>
            {level.toFixed(0)}%
          </span>
        </div>
        {status === "high" && (
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-destructive/20 text-destructive uppercase tracking-wider">
            Danger
          </span>
        )}
      </div>
    </div>
  )
}

function MarketStats() {
  const [stats, setStats] = useState({
    volume: 2.47,
    high: 68420.00,
    low: 66180.50,
    openInterest: 847,
    fundingRate: 0.0042,
    nextFunding: "2h 14m"
  })

  // Simulate stats update
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        volume: prev.volume + (Math.random() - 0.5) * 0.05,
        fundingRate: prev.fundingRate + (Math.random() - 0.5) * 0.0005,
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glass-panel rounded-xl overflow-hidden shadow-cinematic">
      <div className="px-5 py-3 border-b border-border/30 flex items-center justify-between bg-gradient-to-r from-card to-transparent">
        <h3 className="text-sm font-bold text-foreground">Market Statistics</h3>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] text-muted-foreground">Updating...</span>
        </div>
      </div>
      <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatItem label="24h Volume" value={`$${stats.volume.toFixed(2)}B`} />
        <StatItem label="24h High" value={`$${stats.high.toLocaleString()}`} isHigh />
        <StatItem label="24h Low" value={`$${stats.low.toLocaleString()}`} isLow />
        <StatItem label="Open Interest" value={`$${stats.openInterest}M`} />
        <StatItem 
          label="Funding Rate" 
          value={`${stats.fundingRate >= 0 ? "+" : ""}${(stats.fundingRate * 100).toFixed(4)}%`}
          highlight={stats.fundingRate > 0.005 ? "warning" : stats.fundingRate < 0 ? "success" : undefined}
        />
        <StatItem label="Next Funding" value={stats.nextFunding} />
      </div>
    </div>
  )
}

function StatItem({ 
  label, 
  value, 
  isHigh, 
  isLow,
  highlight 
}: { 
  label: string
  value: string
  isHigh?: boolean
  isLow?: boolean
  highlight?: "success" | "warning" | "destructive"
}) {
  return (
    <div className="p-3 rounded-lg bg-muted/20">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={cn(
        "text-sm font-bold font-mono mt-1",
        isHigh && "text-success",
        isLow && "text-destructive",
        highlight === "success" && "text-success",
        highlight === "warning" && "text-warning",
        highlight === "destructive" && "text-destructive",
        !isHigh && !isLow && !highlight && "text-foreground"
      )}>
        {value}
      </p>
    </div>
  )
}
