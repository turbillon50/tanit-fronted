"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { 
  X, 
  Moon, 
  Sun, 
  Monitor, 
  Sparkles, 
  MessageSquare, 
  Database, 
  Mic, 
  Image as ImageIcon, 
  Link2,
  ChevronRight
} from "lucide-react"
import { useTheme } from "@/components/providers/theme-provider"
import { useSettings } from "@/components/providers/settings-provider"
import { Button } from "@/components/ui/button"

interface SettingsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const { theme, setTheme } = useTheme()
  const { settings, updateSettings } = useSettings()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-card border-l border-border shadow-cinematic-lg animate-slide-in-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Settings</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Theme Section */}
            <SettingSection title="Appearance">
              <div className="grid grid-cols-3 gap-2">
                <ThemeButton
                  icon={<Moon className="h-4 w-4" />}
                  label="Dark"
                  active={theme === "dark"}
                  onClick={() => setTheme("dark")}
                />
                <ThemeButton
                  icon={<Sun className="h-4 w-4" />}
                  label="Light"
                  active={theme === "light"}
                  onClick={() => setTheme("light")}
                />
                <ThemeButton
                  icon={<Monitor className="h-4 w-4" />}
                  label="System"
                  active={theme === "system"}
                  onClick={() => setTheme("system")}
                />
              </div>
            </SettingSection>

            {/* Splash Screen */}
            <SettingSection title="Splash Screen">
              <SettingToggle
                icon={<Sparkles className="h-4 w-4 text-primary" />}
                label="Show splash on load"
                description="Premium animated intro"
                enabled={settings.splashEnabled}
                onChange={(enabled) => updateSettings({ splashEnabled: enabled })}
              />
            </SettingSection>

            {/* Assistant */}
            <SettingSection title="Assistant">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSettings({ assistantMode: "compact" })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                    settings.assistantMode === "compact"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs font-medium">Compact</span>
                </button>
                <button
                  onClick={() => updateSettings({ assistantMode: "expanded" })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                    settings.assistantMode === "expanded"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs font-medium">Expanded</span>
                </button>
              </div>
            </SettingSection>

            {/* Data Mode */}
            <SettingSection title="Data Mode">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                <Database className="h-4 w-4 text-accent" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Simulation Mode</p>
                  <p className="text-xs text-muted-foreground">Using mock data</p>
                </div>
                <span className="px-2 py-1 rounded text-[10px] font-bold bg-accent/20 text-accent uppercase">
                  Active
                </span>
              </div>
            </SettingSection>

            {/* Integrations */}
            <SettingSection title="Integrations">
              <div className="space-y-2">
                <IntegrationItem
                  icon={<Mic className="h-4 w-4" />}
                  label="Voice"
                  status="pending"
                />
                <IntegrationItem
                  icon={<ImageIcon className="h-4 w-4" />}
                  label="Image Generation"
                  status="pending"
                />
                <IntegrationItem
                  icon={<Link2 className="h-4 w-4" />}
                  label="Bybit Connection"
                  status="pending"
                />
              </div>
            </SettingSection>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              V•Tanit AI Trading Intelligence
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  )
}

function ThemeButton({ 
  icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

function SettingToggle({
  icon,
  label,
  description,
  enabled,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  description: string
  enabled: boolean
  onChange: (enabled: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
    >
      {icon}
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className={cn(
        "w-10 h-6 rounded-full p-1 transition-colors",
        enabled ? "bg-primary" : "bg-muted"
      )}>
        <div className={cn(
          "w-4 h-4 rounded-full bg-white transition-transform",
          enabled ? "translate-x-4" : "translate-x-0"
        )} />
      </div>
    </button>
  )
}

function IntegrationItem({
  icon,
  label,
  status,
}: {
  icon: React.ReactNode
  label: string
  status: "pending" | "connected" | "error"
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
      </div>
      <span className={cn(
        "px-2 py-1 rounded text-[10px] font-bold uppercase",
        status === "pending" && "bg-warning/20 text-warning",
        status === "connected" && "bg-success/20 text-success",
        status === "error" && "bg-destructive/20 text-destructive"
      )}>
        {status}
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
  )
}
