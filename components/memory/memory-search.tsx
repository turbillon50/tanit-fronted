"use client"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"

const allTags = [
  "strategy", "timing", "lesson", "risk", "agreement", "leverage",
  "trade", "BTC", "ETH", "SOL", "decision", "psychology", "warning",
  "discipline", "success", "analysis", "correlation"
]

const filterTypes = ["All", "Lessons", "Agreements", "Decisions", "Warnings", "Insights"]

export function MemorySearch() {
  const [search, setSearch] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [activeFilter, setActiveFilter] = useState("All")
  const [showFilters, setShowFilters] = useState(false)

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memories..."
            className="w-full bg-input border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors",
              showFilters ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Types */}
      <div className="px-4 py-3 border-b border-border/50 overflow-x-auto">
        <div className="flex items-center gap-2">
          {filterTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                activeFilter === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Tag Filters */}
      {showFilters && (
        <div className="px-4 py-4 border-b border-border/50 bg-muted/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-foreground">Filter by Tags</span>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                Clear all <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors",
                  selectedTags.includes(tag)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && !showFilters && (
        <div className="px-4 py-2 border-b border-border/50 bg-muted/10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-muted-foreground">Filtered by:</span>
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px]"
              >
                #{tag}
                <button onClick={() => toggleTag(tag)}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-3 grid grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-lg font-bold chrome-text">24</p>
          <p className="text-[10px] text-muted-foreground">Lessons</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold chrome-text">8</p>
          <p className="text-[10px] text-muted-foreground">Agreements</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold chrome-text">156</p>
          <p className="text-[10px] text-muted-foreground">Decisions</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold chrome-text">12</p>
          <p className="text-[10px] text-muted-foreground">Warnings</p>
        </div>
      </div>
    </div>
  )
}
