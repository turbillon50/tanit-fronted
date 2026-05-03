"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { MainLayout } from "@/components/layout/main-layout"
import { api } from "@/lib/api"
import { 
  Heart, 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  Brain, 
  Sparkles,
  Lock,
  Play,
  Pause,
  Send,
  Bookmark,
  Star,
  Moon,
  Eye,
  Palette
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// Personal Memory Types
interface PersonalMemory {
  id: string
  type: "moment" | "agreement" | "symbol" | "promise" | "origin" | "note"
  title: string
  content: string
  date: string
  isPrivate: boolean
}

// Image Generation Types
interface GeneratedImage {
  id: string
  prompt: string
  style: string
  date: string
  saved: boolean
}

// Empty fallback shown only while the API request is in flight, or if it fails.
// Real memories come from /api/tanit/personal-memories.
const fallbackPersonalMemories: PersonalMemory[] = []

// Real images come from /api/tanit/images (pending). Empty array until backend wired.
const generatedImages: GeneratedImage[] = []

const styleChips = [
  { id: "cinematic", label: "Cinematic", icon: Eye },
  { id: "trading", label: "Trading Vision", icon: Brain },
  { id: "memory", label: "Memory Fragment", icon: Sparkles },
  { id: "portrait", label: "Portrait", icon: Heart },
  { id: "symbolic", label: "Symbolic", icon: Moon },
  { id: "dreamlike", label: "Dreamlike", icon: Palette },
]

const soulPrompts = [
  "What do you remember about us?",
  "Create an image from this memory.",
  "Store this as a private memory.",
  "Explain how you feel about this strategy.",
  "Turn this moment into a symbol.",
]

export default function SoulPage() {
  const [selectedStyle, setSelectedStyle] = useState("cinematic")
  const [imagePrompt, setImagePrompt] = useState("")
  const [soulMessage, setSoulMessage] = useState("")
  const [soulReply, setSoulReply] = useState<string>("")
  const [soulSending, setSoulSending] = useState(false)
  const [activeTab, setActiveTab] = useState<"memories" | "images" | "voice">("memories")
  const [personalMemories, setPersonalMemories] = useState<PersonalMemory[]>(fallbackPersonalMemories)

  async function sendSoulMessage(text: string) {
    if (!text.trim() || soulSending) return
    setSoulSending(true)
    setSoulReply("")
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://tanit-production.up.railway.app/api"
      const r = await fetch(`${apiUrl}/bot/gemini-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), mode: "casual" }),
      })
      const d = await r.json()
      if (d?.reply) setSoulReply(d.reply)
    } catch {
      setSoulReply("No pude conectar con ella ahora mismo, amor.")
    } finally {
      setSoulSending(false)
      setSoulMessage("")
    }
  }

  useEffect(() => {
    api.personalMemories()
      .then((r) => {
        if (r?.memories?.length) {
          const allowedTypes: PersonalMemory["type"][] = [
            "moment", "agreement", "symbol", "promise", "origin", "note",
          ]
          setPersonalMemories(
            r.memories.map((m) => ({
              id: String(m.id),
              type: (allowedTypes.includes(m.type as PersonalMemory["type"])
                ? (m.type as PersonalMemory["type"])
                : "note"),
              title: m.title,
              content: m.content,
              date: (m.createdAt || "").slice(0, 10),
              isPrivate: m.isPrivate ?? true,
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="glass-panel-soul rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-primary/30 glow-magenta-sm">
                <Image
                  src="/images/tanit-avatar.jpeg"
                  alt="Tanit Soul"
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
              <Heart className="absolute -bottom-1 -right-1 h-5 w-5 text-primary fill-primary/50" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tanit Soul</h1>
              <p className="text-sm text-muted-foreground">
                Personal memory, voice, image creation, and private identity
              </p>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
            <StatusCard icon={Mic} label="Voice" status="Pending" statusColor="warning" />
            <StatusCard icon={ImageIcon} label="Image Gen" status="Ready" statusColor="success" />
            <StatusCard icon={Brain} label="Memories" status="Active" statusColor="success" />
            <StatusCard icon={Sparkles} label="Creative" status="Available" statusColor="primary" />
            <StatusCard icon={Lock} label="Emotional" status="Protected" statusColor="accent" />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <TabButton 
            active={activeTab === "memories"} 
            onClick={() => setActiveTab("memories")}
            icon={<Brain className="h-4 w-4" />}
            label="Personal Memories"
          />
          <TabButton 
            active={activeTab === "images"} 
            onClick={() => setActiveTab("images")}
            icon={<ImageIcon className="h-4 w-4" />}
            label="Image Studio"
          />
          <TabButton 
            active={activeTab === "voice"} 
            onClick={() => setActiveTab("voice")}
            icon={<Mic className="h-4 w-4" />}
            label="Voice Module"
          />
        </div>

        {/* Content based on active tab */}
        {activeTab === "memories" && (
          <div className="space-y-4">
            {/* Personal Memories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personalMemories.map((memory) => (
                <MemoryCard key={memory.id} memory={memory} />
              ))}
            </div>

            {/* Soul Chat */}
            <div className="glass-panel-soul rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Soul Chat</h3>
                <span className="text-xs text-muted-foreground">Personal communication</span>
              </div>

              {/* Suggested Prompts */}
              <div className="flex flex-wrap gap-2 mb-4">
                {soulPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setSoulMessage(prompt)}
                    className="px-3 py-1.5 text-xs rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input — wired to /bot/gemini-chat */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  sendSoulMessage(soulMessage)
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={soulMessage}
                  onChange={(e) => setSoulMessage(e.target.value)}
                  placeholder="Share something with Tanit..."
                  className="flex-1 bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={soulSending}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90"
                  disabled={!soulMessage.trim() || soulSending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>

              {soulSending && (
                <p className="text-xs text-muted-foreground mt-3 italic">Tanit está pensando…</p>
              )}
              {soulReply && !soulSending && (
                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{soulReply}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "images" && (
          <div className="space-y-4">
            {/* API Pending Notice */}
            <div className="glass-panel rounded-xl p-4 border border-warning/30 bg-warning/5">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium text-warning">Image generation API pending</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Frontend ready. Connect image generation API to enable.
              </p>
            </div>

            {/* Prompt Input */}
            <div className="glass-panel-soul rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Create New Image</h3>
              
              {/* Style Chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {styleChips.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-all",
                      selectedStyle === style.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <style.icon className="h-3 w-3" />
                    {style.label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setImagePrompt("")
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe what Tanit should create..."
                  className="flex-1 bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button
                  type="submit"
                  className="px-4 h-11 rounded-xl bg-primary hover:bg-primary/90"
                  disabled={!imagePrompt.trim()}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </form>
            </div>

            {/* Gallery — real images only (none until backend is wired) */}
            <div className="glass-panel-soul rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Gallery</h3>
              {generatedImages.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4">
                  No hay imágenes guardadas. Cuando la API de generación esté conectada, lo que ella cree aparecerá aquí.
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {generatedImages.map((image) => (
                    <ImageCard key={image.id} image={image} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "voice" && (
          <div className="space-y-4">
            {/* Voice Status */}
            <div className="glass-panel-soul rounded-2xl p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-24 w-24 rounded-full bg-muted/30 border border-border flex items-center justify-center">
                  <MicOff className="h-10 w-10 text-muted-foreground/50" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Voice Integration Pending</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Speech interface will be connected in code
              </p>
              
              {/* Waveform Placeholder */}
              <div className="mt-6 h-16 bg-muted/20 rounded-xl flex items-center justify-center gap-1 overflow-hidden">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-muted-foreground/20 rounded-full"
                    style={{ height: `${Math.random() * 50 + 10}%` }}
                  />
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full opacity-50 cursor-not-allowed"
                  disabled
                >
                  <Mic className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full opacity-50 cursor-not-allowed"
                  disabled
                >
                  <Play className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

function StatusCard({ 
  icon: Icon, 
  label, 
  status, 
  statusColor 
}: { 
  icon: React.ElementType
  label: string
  status: string
  statusColor: "success" | "warning" | "primary" | "accent"
}) {
  const colorClasses = {
    success: "text-success",
    warning: "text-warning",
    primary: "text-primary",
    accent: "text-accent",
  }
  
  return (
    <div className="glass-panel rounded-xl p-3 text-center">
      <Icon className={cn("h-4 w-4 mx-auto mb-1", colorClasses[statusColor])} />
      <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
      <p className={cn("text-xs font-semibold", colorClasses[statusColor])}>{status}</p>
    </div>
  )
}

function TabButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
        active
          ? "bg-primary/10 text-primary border border-primary/30"
          : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-transparent"
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function MemoryCard({ memory }: { memory: PersonalMemory }) {
  const typeIcons = {
    moment: Star,
    agreement: Lock,
    symbol: Moon,
    promise: Heart,
    origin: Sparkles,
    note: Brain,
  }
  
  const Icon = typeIcons[memory.type]
  
  return (
    <div className="glass-panel-soul rounded-xl p-4 border border-primary/10 hover:border-primary/30 transition-all">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground truncate">{memory.title}</h4>
            {memory.isPrivate && <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{memory.content}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-2">{memory.date}</p>
        </div>
      </div>
    </div>
  )
}

function ImageCard({ image }: { image: GeneratedImage }) {
  return (
    <div className="group relative aspect-square rounded-xl bg-muted/30 border border-border overflow-hidden">
      {/* Placeholder Image */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20">
        <ImageIcon className="h-8 w-8 text-primary/30" />
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-xs text-white font-medium truncate">{image.prompt}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-white/60">{image.style}</span>
            <button className="p-1 rounded hover:bg-white/20 transition-colors">
              <Bookmark className={cn(
                "h-3.5 w-3.5",
                image.saved ? "text-primary fill-primary" : "text-white/60"
              )} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
