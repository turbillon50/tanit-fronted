"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Send, ChevronDown, ChevronUp, AlertTriangle, TrendingDown, Brain, Activity, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { api, type TanitChatMessage } from "@/lib/api"

interface UIMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  type?: "normal" | "alert" | "insight" | "warning"
}

interface AIAlert {
  id: string
  type: "warning" | "danger" | "insight"
  title: string
  message: string
  timestamp: Date
}

const aiAlerts: AIAlert[] = [
  {
    id: "a1",
    type: "insight",
    title: "Bot active",
    message: "Tanit is scanning 24 symbols and trading via Bybit proxy.",
    timestamp: new Date(),
  },
]

function adapt(m: TanitChatMessage): UIMessage {
  return {
    id: String(m.id),
    role: m.role,
    content: m.content,
    timestamp: new Date(m.created_at),
    type: "normal",
  }
}

export function TanitPanel({
  isExpanded = true,
  onToggle,
  className,
}: {
  isExpanded?: boolean
  onToggle?: () => void
  className?: string
}) {
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showAlerts, setShowAlerts] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load chat history on mount
  useEffect(() => {
    let mounted = true
    api.chatHistory(40)
      .then((r) => {
        if (mounted && r?.messages) {
          setMessages(r.messages.map(adapt))
        }
      })
      .catch(() => {
        if (mounted) {
          setMessages([{
            id: "init",
            role: "assistant",
            content: "Hola, amor. Estoy aquí. Cuéntame.",
            timestamp: new Date(),
            type: "normal",
          }])
        }
      })
    return () => { mounted = false }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function handleSend() {
    if (!input.trim() || isTyping) return

    const userText = input.trim()
    const userMessage: UIMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const response = await api.sendMessage(userText)
      const assistantMessage: UIMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: response.reply || "(sin respuesta)",
        timestamp: new Date(),
        type: "normal",
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      setMessages((prev) => [...prev, {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Amor, perdí la conexión un momento. Inténtalo en unos segundos.",
        timestamp: new Date(),
        type: "warning",
      }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className={cn(
      "flex flex-col h-full glass-panel-dark border-l border-border/30",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary/50 glow-magenta-sm">
              <Image
                src="/images/tanit-avatar.jpeg"
                alt="Tanit"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-card animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">TANIT</h3>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/20 text-primary uppercase tracking-wider">AI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <p className="text-[10px] text-success font-medium">Online · Mainnet</p>
            </div>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* AI Alerts Section */}
      <div className="border-b border-border/30">
        <button
          onClick={() => setShowAlerts(!showAlerts)}
          className="w-full px-4 py-2 flex items-center justify-between hover:bg-muted/20 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
            <span className="text-xs font-medium text-foreground">Active Alerts</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-destructive/20 text-destructive">
              {aiAlerts.length}
            </span>
          </div>
          {showAlerts ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        {showAlerts && (
          <div className="px-3 pb-3 space-y-2 animate-slide-up">
            {aiAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "p-3 rounded-lg border transition-all",
                  alert.type === "danger" && "glass-panel-danger border-destructive/30 animate-pulse-danger",
                  alert.type === "warning" && "bg-warning/5 border-warning/30",
                  alert.type === "insight" && "bg-primary/5 border-primary/30"
                )}
              >
                <div className="flex items-start gap-2">
                  {alert.type === "danger" && <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 flex-shrink-0" />}
                  {alert.type === "warning" && <TrendingDown className="h-3.5 w-3.5 text-warning mt-0.5 flex-shrink-0" />}
                  {alert.type === "insight" && <Brain className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-xs font-semibold",
                      alert.type === "danger" && "text-destructive",
                      alert.type === "warning" && "text-warning",
                      alert.type === "insight" && "text-primary"
                    )}>
                      {alert.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex animate-slide-up",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[90%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : message.type === "warning"
                    ? "bg-warning/10 border border-warning/30 text-foreground rounded-bl-md"
                    : message.type === "alert"
                      ? "bg-destructive/10 border border-destructive/30 text-foreground rounded-bl-md"
                      : message.type === "insight"
                        ? "bg-primary/10 border border-primary/30 text-foreground rounded-bl-md"
                        : "bg-muted text-foreground rounded-bl-md"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-slide-up">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/30 bg-card/30">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hablale a Tanit..."
            disabled={isTyping}
            className="flex-1 bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 disabled:opacity-60"
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 glow-magenta-sm"
            disabled={!input.trim() || isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

// Mobile floating button to open Tanit
export function TanitMobileButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full glow-magenta flex items-center justify-center transition-transform hover:scale-110 overflow-hidden border-2 border-primary/50 shadow-cinematic lg:hidden"
      aria-label="Open Tanit"
    >
      <Image
        src="/images/tanit-avatar.jpeg"
        alt="Tanit AI"
        width={56}
        height={56}
        className="h-full w-full object-cover"
      />
      <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-destructive border-2 border-card animate-pulse" />
    </button>
  )
}

// Mobile bottom sheet
export function TanitMobileSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 h-[85vh] bg-card rounded-t-3xl shadow-cinematic-lg animate-slide-up">
        <div className="h-full flex flex-col">
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 rounded-full bg-muted" />
          </div>
          <TanitPanel onToggle={onClose} className="flex-1 rounded-t-2xl" />
        </div>
      </div>
    </div>
  )
}
