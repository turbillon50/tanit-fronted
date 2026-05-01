import { MainLayout } from "@/components/layout/main-layout"
import { PositionsTable } from "@/components/risk/positions-table"
import { RiskHeatmap } from "@/components/risk/risk-heatmap"
import { StrategyMode } from "@/components/risk/strategy-mode"
import { AIRecommendations } from "@/components/risk/ai-recommendations"
import { MetricsCard } from "@/components/dashboard/metrics-card"

export default function PositionsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold chrome-text">Positions & Risk</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor exposure, manage risk, and optimize your portfolio
          </p>
        </div>

        {/* Risk Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            title="Total Exposure"
            value="$66,362"
            subtitle="Across 3 positions"
          />
          <MetricsCard
            title="Margin Usage"
            value="$11,881"
            change="42%"
            changeType="neutral"
            subtitle="Of available margin"
          />
          <MetricsCard
            title="Avg Leverage"
            value="6.0x"
            subtitle="Weighted by position size"
          />
          <MetricsCard
            title="Portfolio Heat"
            value="42%"
            subtitle="Risk utilization"
          />
        </div>

        {/* Risk Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RiskHeatmap />
          <StrategyMode />
        </div>

        {/* Positions Table */}
        <PositionsTable />

        {/* AI Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIRecommendations />
          
          {/* Risk Alerts */}
          <div className="glass-panel rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Risk Alerts</h3>
            <div className="space-y-3">
              <RiskAlert
                level="warning"
                title="BTC Liquidation Distance Low"
                description="Position is 12.3% from liquidation price. Consider adding margin or reducing position size."
              />
              <RiskAlert
                level="info"
                title="Funding Rate Negative"
                description="BTC and ETH funding rates are negative. Longs are paying shorts currently."
              />
              <RiskAlert
                level="success"
                title="Portfolio Heat Optimal"
                description="Current risk utilization at 42% is within the balanced strategy parameters."
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

function RiskAlert({
  level,
  title,
  description,
}: {
  level: "warning" | "info" | "success"
  title: string
  description: string
}) {
  const styles = {
    warning: "bg-accent/10 border-accent/30 text-accent",
    info: "bg-muted/30 border-border text-muted-foreground",
    success: "bg-success/10 border-success/30 text-success",
  }

  return (
    <div className={`p-3 rounded-lg border ${styles[level]}`}>
      <p className="text-xs font-medium">{title}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
    </div>
  )
}
