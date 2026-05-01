"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { cn } from "@/lib/utils"
import { Brain, Zap, Activity, Radio, TrendingUp, TrendingDown, AlertTriangle, ChevronRight, Shield } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function HomePage() {
  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Compact Hero */}
        <div className="glass-panel rounded-xl p-5 shadow-cinematic relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl overflow-hidden border border-border/50 shadow-cinematic">
                <Image
                  src="/images/votan-logo.jpeg"
                  alt="V•Tanit"
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold chrome-text">Command Center</h1>
                <p className="text-xs text-muted-foreground mt-0.5">AI Trading Intelligence • Real-time Monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge label="System" value="Online" status="success" />
              <StatusBadge label="Memory" value="Active" status="success" />
              <StatusBadge label="Execution" value="Locked" status="warning" />
            </div>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Portfolio Value"
            value="$284,621.45"
            change="+2.4%"
            changeType="positive"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <MetricCard
            title="Unrealized PnL"
            value="+$3,847.22"
            change="+1.37%"
            changeType="positive"
            icon={<Activity className="h-4 w-4" />}
          />
          <MetricCard
            title="Portfolio Heat"
            value="42%"
            change="Medium Risk"
            changeType="neutral"
            icon={<Shield className="h-4 w-4" />}
            showRiskBar
            riskLevel={42}
          />
        </div>

        {/* Active Positions Summary */}
        <div className="glass-panel rounded-xl overflow-hidden shadow-cinematic">
          <div className="px-5 py-3 border-b border-border/30 flex items-center justify-between bg-gradient-to-r from-card to-transparent">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Active Positions</h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary">3</span>
            </div>
            <Link href="/positions" className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/20">
            <PositionRow
              symbol="BTC/USDT"
              side="long"
              size="0.5 BTC"
              pnl="+$711.25"
              pnlPercent="+2.14%"
              leverage="10x"
              liquidationProximity={12.3}
            />
            <PositionRow
              symbol="ETH/USDT"
              side="long"
              size="5 ETH"
              pnl="+$209.00"
              pnlPercent="+1.20%"
              leverage="5x"
              liquidationProximity={20.9}
            />
            <PositionRow
              symbol="SOL/USDT"
              side="short"
              size="100 SOL"
              pnl="+$408.00"
              pnlPercent="+2.68%"
              leverage="3x"
              liquidationProximity={36.9}
            />
          </div>
        </div>

        {/* Tanit Decisions & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Tanit Decisions */}
          <div className="glass-panel rounded-xl overflow-hidden shadow-cinematic">
            <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2 bg-gradient-to-r from-primary/5 to-transparent">
              <Brain className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Recent Tanit Decisions</h3>
            </div>
            <div className="p-4 space-y-3">
              <DecisionItem
                type="insight"
                title="Position Analysis"
                description="BTC showing strength. Maintained current exposure."
                time="2m ago"
              />
              <DecisionItem
                type="warning"
                title="Risk Alert Triggered"
                description="Reduced ETH leverage from 7x to 5x per risk rules."
                time="15m ago"
              />
              <DecisionItem
                type="action"
                title="Memory Updated"
                description="Recorded preference: Avoid trading during high funding."
                time="1h ago"
              />
              <DecisionItem
                type="insight"
                title="Market Observation"
                description="Detected consolidation pattern on 4H timeframe."
                time="2h ago"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-panel rounded-xl overflow-hidden shadow-cinematic">
            <div className="px-5 py-3 border-b border-border/30 bg-gradient-to-r from-card to-transparent">
              <h3 className="text-sm font-bold text-foreground">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-2">
              <QuickAction
                href="/terminal"
                title="Open Terminal"
                description="Live trading interface"
                icon={<Radio className="h-4 w-4" />}
              />
              <QuickAction
                href="/positions"
                title="Manage Risk"
                description="Positions & exposure"
                icon={<Shield className="h-4 w-4" />}
              />
              <QuickAction
                href="/memory"
                title="View Memory"
                description="Lessons & agreements"
                icon={<Brain className="h-4 w-4" />}
              />
              <QuickAction
                href="/analytics"
                title="Analytics"
                description="Performance metrics"
                icon={<Activity className="h-4 w-4" />}
              />
            </div>
          </div>
        </div>

        {/* Market Tickers */}
        <div className="glass-panel rounded-xl overflow-hidden shadow-cinematic">
          <div className="px-5 py-3 border-b border-border/30 flex items-center justify-between bg-gradient-to-r from-card to-transparent">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
              <h3 className="text-sm font-bold text-foreground">Live Markets</h3>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">Updating...</span>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <LiveTicker symbol="BTC/USDT" price={67842.50} change={2.14} />
            <LiveTicker symbol="ETH/USDT" price={3521.80} change={1.87} />
            <LiveTicker symbol="SOL/USDT" price={148.32} change={-0.42} />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

function StatusBadge({ label, value, status }: { label: string; value: string; status: "success" | "warning" | "danger" }) {
  return (
    <div className={cn(
      "px-3 py-1.5 rounded-lg border flex items-center gap-2",
      status === "success" && "bg-success/5 border-success/30",
      status === "warning" && "bg-warning/5 border-warning/30",
      status === "danger" && "bg-destructive/5 border-destructive/30"
    )}>
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        status === "success" && "bg-success animate-pulse",
        status === "warning" && "bg-warning",
        status === "danger" && "bg-destructive animate-pulse"
      )} />
      <span className="text-[10px] text-muted-foreground">{label}:</span>
      <span className={cn(
        "text-xs font-bold",
        status === "success" && "text-success",
        status === "warning" && "text-warning",
        status === "danger" && "text-destructive"
      )}>{value}</span>
    </div>
  )
}

function MetricCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon,
  showRiskBar,
  riskLevel
}: { 
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon: React.ReactNode
  showRiskBar?: boolean
  riskLevel?: number
}) {
  return (
    <div className="glass-panel rounded-xl p-4 shadow-cinematic">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{title}</span>
        <div className={cn(
          "p-1.5 rounded-lg",
          changeType === "positive" && "bg-success/10 text-success",
          changeType === "negative" && "bg-destructive/10 text-destructive",
          changeType === "neutral" && "bg-muted text-muted-foreground"
        )}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold chrome-text">{value}</p>
      {showRiskBar && riskLevel ? (
        <div className="mt-2">
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                riskLevel < 30 && "bg-success",
                riskLevel >= 30 && riskLevel < 60 && "bg-warning",
                riskLevel >= 60 && "bg-destructive"
              )}
              style={{ width: `${riskLevel}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{change}</p>
        </div>
      ) : (
        <p className={cn(
          "text-xs font-semibold mt-1",
          changeType === "positive" && "text-success",
          changeType === "negative" && "text-destructive",
          changeType === "neutral" && "text-muted-foreground"
        )}>
          {change}
        </p>
      )}
    </div>
  )
}

function PositionRow({
  symbol,
  side,
  size,
  pnl,
  pnlPercent,
  leverage,
  liquidationProximity
}: {
  symbol: string
  side: "long" | "short"
  size: string
  pnl: string
  pnlPercent: string
  leverage: string
  liquidationProximity: number
}) {
  const isPositive = pnl.startsWith("+")
  const isDanger = liquidationProximity < 15

  return (
    <div className={cn(
      "px-5 py-3 flex items-center justify-between hover:bg-muted/10 transition-colors",
      isDanger && "bg-destructive/5"
    )}>
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{symbol}</span>
            <span className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
              side === "long" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}>
              {side}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent/10 text-accent">
              {leverage}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{size}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {isDanger && (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-destructive/10 animate-pulse-danger">
            <AlertTriangle className="h-3 w-3 text-destructive" />
            <span className="text-[10px] font-bold text-destructive">{liquidationProximity}% to liq</span>
          </div>
        )}
        <div className="text-right">
          <p className={cn(
            "text-sm font-bold flex items-center gap-1",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {pnl}
          </p>
          <p className={cn(
            "text-[10px]",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {pnlPercent}
          </p>
        </div>
      </div>
    </div>
  )
}

function DecisionItem({ type, title, description, time }: { type: "insight" | "warning" | "action"; title: string; description: string; time: string }) {
  return (
    <div className={cn(
      "p-3 rounded-lg border transition-all",
      type === "insight" && "bg-primary/5 border-primary/20",
      type === "warning" && "bg-warning/5 border-warning/20",
      type === "action" && "bg-muted/50 border-border/30"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className={cn(
            "text-xs font-semibold",
            type === "insight" && "text-primary",
            type === "warning" && "text-warning",
            type === "action" && "text-foreground"
          )}>
            {title}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
        </div>
        <span className="text-[10px] text-muted-foreground">{time}</span>
      </div>
    </div>
  )
}

function QuickAction({ href, title, description, icon }: { href: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-primary/20 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-[10px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  )
}

function LiveTicker({ symbol, price, change }: { symbol: string; price: number; change: number }) {
  const [currentPrice, setCurrentPrice] = useState(price)
  const [flash, setFlash] = useState(false)
  const isPositive = change >= 0

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const delta = (Math.random() - 0.5) * (price * 0.001)
        setFlash(true)
        setTimeout(() => setFlash(false), 300)
        return prev + delta
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [price])

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
      <div>
        <p className="text-sm font-semibold text-foreground">{symbol}</p>
        <p className={cn(
          "text-lg font-bold font-mono chrome-text transition-all",
          flash && "animate-number-update"
        )}>
          ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
      <div className={cn(
        "px-2 py-1 rounded text-xs font-bold",
        isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
      )}>
        {isPositive ? "+" : ""}{change}%
      </div>
    </div>
  )
}
