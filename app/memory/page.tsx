import { MainLayout } from "@/components/layout/main-layout"
import { MemoryTimeline } from "@/components/memory/memory-timeline"
import { MemorySearch } from "@/components/memory/memory-search"
import { MemoryAgreements } from "@/components/memory/memory-agreements"
import { Brain, Sparkles } from "lucide-react"

export default function MemoryPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold chrome-text flex items-center gap-3">
              <Brain className="h-7 w-7 text-primary" />
              Tanit Memory
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Persistent AI memory system • Agreements, lessons, and decisions
            </p>
          </div>
          
          {/* Memory Status */}
          <div className="glass-panel rounded-lg px-4 py-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-success font-medium">Memory Active</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="text-xs text-muted-foreground">
              Last sync: <span className="text-foreground">Just now</span>
            </div>
          </div>
        </div>

        {/* AI Message */}
        <div className="glass-panel rounded-xl p-5 border-l-4 border-primary">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground leading-relaxed">
                Memory system active. I have recorded <span className="text-primary font-medium">24 lessons learned</span>, 
                <span className="text-accent font-medium"> 8 active agreements</span>, and 
                <span className="text-success font-medium"> 156 trading decisions</span> from our sessions. 
                Your trading rules are being enforced in real-time.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Last memory update: Overtrading pattern detected - cool-down period implemented
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <MemorySearch />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline - Takes 2 columns */}
          <div className="lg:col-span-2">
            <MemoryTimeline />
          </div>

          {/* Agreements - Takes 1 column */}
          <div>
            <MemoryAgreements />
          </div>
        </div>

        {/* Trading Rules Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <RuleSummaryCard
            title="Position Limits"
            rules={["Max 30% single position", "Max 5 concurrent positions"]}
            status="compliant"
          />
          <RuleSummaryCard
            title="Risk Controls"
            rules={["Max 15x leverage", "10% stop loss required"]}
            status="compliant"
          />
          <RuleSummaryCard
            title="Loss Prevention"
            rules={["5% daily loss limit", "30min cooldown after loss"]}
            status="compliant"
          />
          <RuleSummaryCard
            title="Strategy Rules"
            rules={["No entries in low volume", "Prefer London/NY overlap"]}
            status="compliant"
          />
        </div>
      </div>
    </MainLayout>
  )
}

function RuleSummaryCard({
  title,
  rules,
  status,
}: {
  title: string
  rules: string[]
  status: "compliant" | "warning" | "violation"
}) {
  const statusColors = {
    compliant: "border-success/30 bg-success/5",
    warning: "border-accent/30 bg-accent/5",
    violation: "border-destructive/30 bg-destructive/5",
  }

  return (
    <div className={`glass-panel rounded-xl p-4 border ${statusColors[status]}`}>
      <h4 className="text-sm font-semibold text-foreground mb-3">{title}</h4>
      <ul className="space-y-2">
        {rules.map((rule, idx) => (
          <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            {rule}
          </li>
        ))}
      </ul>
    </div>
  )
}
