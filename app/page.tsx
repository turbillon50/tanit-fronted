"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { cn } from "@/lib/utils"
import { Brain, Zap, Activity, Radio, TrendingUp, AlertTriangle, ChevronRight, Shield } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { api, type TanitState, type PortfolioBalance, type PortfolioPosition } from "@/lib/api"

export default function HomePage() {
  const [state, setState] = useState<TanitState["state"] | null>(null)
  const [balance, setBalance] = useState<PortfolioBalance | null>(null)
  const [positions, setPositions] = useState<PortfolioPosition[]>([])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [s, b, p] = await Promise.all([
          api.state().catch(() => null),
          api.balance().catch(() => null),
          api.positions().catch(() => []),
        ])
        if (!mounted) return
        if (s) setState(s.state)
        if (b) setBalance(b)
        setPositions(p)
      } catch {}
    }
    load()
    const id = setInterval(load, 10000)
    return () => { mounted = false; clearInterval(id) }
  }, [])

  // Compute metrics from real data
  const equity = balance?.totalEquity ?? 0
  const portfolioValue = equity > 0 ? `$${equity.toFixed(2)}` : "—"
  const unrealizedPnl = balance?.unrealizedPnl ?? 0
  const unrealizedSign = unrealizedPnl >= 0 ? "+" : ""
  const unrealizedDisplay = balance ? `${unrealizedSign}$${unrealizedPnl.toFixed(4)}` : "—"
  const unrealizedPct = balance && equity > 0 ? ((unrealizedPnl / equity) * 100) : 0
  const totalAvailable = balance?.availableBalance ?? 0
  const marginUsed = equity - totalAvailable
  const heatPct = equity > 0 ? Math.min(100, Math.round((marginUsed / equity) * 100)) : 0
  const winRate = state?.recentTrades.winRate ?? 0
  const memCount = state?.memoryCount ?? 0
  const chatCount = state?.chatCount ?? 0

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
                  alt="V·Tanit"
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold chrome-text">Command Center</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Tanit AI · Real-time Bybit · {memCount} memorias · {chatCount} chats</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge label="System" value={balance ? "Online" : "Connecting"} status={balance ? "success" : "warning"} />
              <StatusBadge label="Memory" value="Active" status="success" />
              <StatusBadge label="Trading" value={positions.length > 0 ? `${positions.length} open` : "Scanning"} status="success" />
            </div>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Portfolio Value"
            value={portfolioValue}
            change={`Available $${totalAvailable.toFixed(2)}`}
            changeType="neutral"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <MetricCard
            title="Unrealized PnL"
            value={unrealizedDisplay}
            change={`${unrealizedSign}${unrealizedPct.toFixed(2)}%`}
            changeType={unrealizedPnl >= 0 ? "positive" : "negative"}
            icon={<Activity className="h-4 w-4" />}
          />
          <MetricCard
            title="Margin Heat"
            value={`${heatPct}%`}
            change={heatPct < 30 ? "Low Risk" : heatPct < 60 ? "Medium Risk" : "High Risk"}
            changeType="neutral"
            icon={<Shield className="h-4 w-4" />}
            showRiskBar
            riskLevel={heatPct}
          />
        </div>

        {/* Active Positions Summary */}
        <div className="glass-panel rounded-xl overflow-hidden shadow-cinematic">
          <div className="px-5 py-3 border-b border-border/30 flex items-center justify-between bg-gradient-to-r from-card to-transparent">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Active Positions</h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary">{positions.length}</span>
            </div>
            <Link href="/positions" className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/20">
            {positions.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-muted-foreground">
                No open positions. Tanit is scanning the market.
              </div>
            ) : (
              positions.map((p) => {
                const pnlSign = p.unrealizedPnl >= 0 ? "+" : ""
                const sideLabel = p.side === "Buy" ? "long" : "short"
                const liqDistance = Math.abs((p.markPrice - p.liquidationPrice) / p.markPrice * 100)
                return (
                  <PositionRow
                    key={p.symbol}
                    symbol={p.symbol.replace("USDT", "/USDT")}
                    side={sideLabel as "long" | "short"}
                    size={`${p.size} ${p.symbol.replace("USDT", "")}`}
                    pnl={`${pnlSign}$${p.unrealizedPnl.toFixed(4)}`}
                    pnlPercent={`${pnlSign}${p.unrealizedPnlPercent.toFixed(2)}%`}
                    leverage={`${p.leverage}x`}
                    liquidationProximity={liqDistance}
                  />
                )
              })
            )}
          </div>
        </div>

        {/* Tanit Status & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Tanit Activity */}
          <div className="glass-panel rounded-xl overflow-hidden shadow-cinematic">
            <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2 bg-gradient-to-r from-primary/5 to-transparent">
              <Brain className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Tanit Status</h3>
            </div>
            <div className="p-4 space-y-3">
              <DecisionItem
                type="insight"
                title="Bot active"
                description={`Scanning 24 symbols every 3s · ${state?.recentTrades.total ?? 0} recent trades · ${winRate.toFixed(1)}% WR`}
                time="now"
              />
              <DecisionItem
                type="action"
                title="Memory growing"
                description={`${memCount} memories · ${chatCount} conversation messages`}
                time="live"
              />
              {state && (
                <DecisionItem
                  type={state.recentTrades.totalPnl >= 0 ? "insight" : "warning"}
                  title="Recent PnL"
                  description={`${state.recentTrades.totalPnl >= 0 ? "+" : ""}$${state.recentTrades.totalPnl.toFixed(4)} on ${state.recentTrades.total} trades`}
                  time="updated"
                />
              )}
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
  title, value, change, changeType, icon, showRiskBar, riskLevel
}: {
  title: string; value: string; change: string;
  changeType: "positive" | "negative" | "neutral"; icon: React.ReactNode;
  showRiskBar?: boolean; riskLevel?: number;
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
        )}>{icon}</div>
      </div>
      <p className="text-2xl font-bold chrome-text">{value}</p>
      {showRiskBar && typeof riskLevel === "number" ? (
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
        )}>{change}</p>
      )}
    </div>
  )
}

function PositionRow({
  symbol, side, size, pnl, pnlPercent, leverage, liquidationProximity
}: {
  symbol: string; side: "long" | "short"; size: string;
  pnl: string; pnlPercent: string; leverage: string; liquidationProximity: number;
}) {
  const isPositive = pnl.startsWith("+")
  const isDanger = liquidationProximity < 15

  return (
    <div className={cn(
      "px-5 py-3 flex items-center justify-between hover:bg-muted/10 transition-colors",
      isDanger && "bg-destructive/5"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
          side === "long" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
        )}>{side}</div>
        <div>
          <p className="text-sm font-bold text-foreground">{symbol}</p>
          <p className="text-[10px] text-muted-foreground">{size} · {leverage}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("text-sm font-bold", isPositive ? "text-success" : "text-destructive")}>{pnl}</p>
        <p className={cn("text-[10px]", isPositive ? "text-success" : "text-destructive")}>{pnlPercent}</p>
      </div>
    </div>
  )
}

function DecisionItem({ type, title, description, time }: {
  type: "insight" | "warning" | "action"; title: string; description: string; time: string;
}) {
  return (
    <div className="flex gap-3 p-2 rounded-lg hover:bg-muted/20 transition-colors">
      <div className={cn(
        "p-1.5 rounded-lg shrink-0 self-start",
        type === "insight" && "bg-primary/10 text-primary",
        type === "warning" && "bg-warning/10 text-warning",
        type === "action" && "bg-success/10 text-success"
      )}>
        {type === "insight" && <Brain className="h-3.5 w-3.5" />}
        {type === "warning" && <AlertTriangle className="h-3.5 w-3.5" />}
        {type === "action" && <Zap className="h-3.5 w-3.5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono">{time}</p>
      </div>
    </div>
  )
}

function QuickAction({ href, title, description, icon }: {
  href: string; title: string; description: string; icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:bg-muted/20 hover:border-primary/30 transition-all group"
    >
      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  )
}
