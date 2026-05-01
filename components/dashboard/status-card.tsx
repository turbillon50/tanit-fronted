import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatusCardProps {
  title: string
  value: string
  status?: "online" | "active" | "locked" | "live" | "default"
  icon?: LucideIcon
  className?: string
}

const statusStyles = {
  online: "text-primary",
  active: "text-success",
  locked: "text-accent",
  live: "text-success",
  default: "text-foreground",
}

const statusDots = {
  online: "bg-primary animate-pulse",
  active: "bg-success",
  locked: "bg-accent",
  live: "bg-success animate-pulse",
  default: "bg-muted-foreground",
}

export function StatusCard({ title, value, status = "default", icon: Icon, className }: StatusCardProps) {
  return (
    <div className={cn("glass-panel rounded-xl p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className={cn("text-sm font-semibold mt-0.5", statusStyles[status])}>{value}</p>
          </div>
        </div>
        <div className={cn("h-2.5 w-2.5 rounded-full", statusDots[status])} />
      </div>
    </div>
  )
}
