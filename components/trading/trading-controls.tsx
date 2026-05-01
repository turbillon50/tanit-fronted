"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Lock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TradingControls() {
  const [orderType, setOrderType] = useState<"market" | "limit">("market")
  const [leverage, setLeverage] = useState(10)

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50">
        <h3 className="text-sm font-semibold text-foreground">Order Entry</h3>
      </div>

      {/* Warning Banner */}
      <div className="mx-4 mt-4 p-3 rounded-lg bg-accent/10 border border-accent/30 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-accent">Execution Locked</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Awaiting API connection. All orders are simulated.
          </p>
        </div>
      </div>

      {/* Order Type Toggle */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
          <button
            onClick={() => setOrderType("market")}
            className={cn(
              "flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors",
              orderType === "market"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Market
          </button>
          <button
            onClick={() => setOrderType("limit")}
            className={cn(
              "flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors",
              orderType === "limit"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Limit
          </button>
        </div>
      </div>

      {/* Order Form */}
      <div className="p-4 space-y-4">
        {/* Price Input (for Limit orders) */}
        {orderType === "limit" && (
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Price (USDT)</label>
            <input
              type="text"
              defaultValue="67,842.50"
              className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled
            />
          </div>
        )}

        {/* Size Input */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Size (BTC)</label>
          <input
            type="text"
            defaultValue="0.1"
            className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled
          />
        </div>

        {/* Leverage Slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-muted-foreground">Leverage</label>
            <span className="text-xs font-medium text-accent">{leverage}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary disabled:cursor-not-allowed"
            disabled
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>1x</span>
            <span>25x</span>
            <span>50x</span>
            <span>100x</span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="p-3 rounded-lg bg-muted/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Order Value</span>
            <span className="text-foreground">$6,784.25</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Required Margin</span>
            <span className="text-foreground">$678.43</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Estimated Fee</span>
            <span className="text-foreground">$3.39</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            disabled
            className="bg-success/20 text-success border border-success/30 hover:bg-success/30 cursor-not-allowed opacity-50"
          >
            <Lock className="h-3.5 w-3.5 mr-1.5" />
            Long
          </Button>
          <Button
            disabled
            className="bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 cursor-not-allowed opacity-50"
          >
            <Lock className="h-3.5 w-3.5 mr-1.5" />
            Short
          </Button>
        </div>

        {/* Close Position Button */}
        <Button
          disabled
          variant="outline"
          className="w-full border-border text-muted-foreground cursor-not-allowed opacity-50"
        >
          <Lock className="h-3.5 w-3.5 mr-1.5" />
          Close Position
        </Button>

        <p className="text-[10px] text-center text-muted-foreground">
          API pending • Simulation mode
        </p>
      </div>
    </div>
  )
}
