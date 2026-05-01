import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricsCardProps {
  title: string
  value: string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  subtitle?: string
  className?: string
}

export function MetricsCard({
  title,
  value,
  change,
  changeType = "neutral",
  subtitle,
  className,
}: MetricsCardProps) {
  return (
    <div className={cn("glass-panel rounded-xl p-5", className)}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-bold chrome-text">{value}</span>
        {change && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-sm font-medium",
              changeType === "positive" && "text-success",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}
          >
            {changeType === "positive" && <TrendingUp className="h-3.5 w-3.5" />}
            {changeType === "negative" && <TrendingDown className="h-3.5 w-3.5" />}
            {change}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
