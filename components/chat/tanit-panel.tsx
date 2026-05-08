"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Send, ChevronDown, ChevronUp, AlertTriangle, TrendingDown, Brain, Activity, X, Mic, Square, Image as ImageIcon, Paperclip, Heart, Settings2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { api, type TanitChatMessage, type SenderType } from "@/lib/api"

type ChatChannel = "intimate" | "operational"

interface UIMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  type?: "normal" | "alert" | "insight" | "warning"
  senderType?: SenderType
}

// Per-sender styling for the per-message badge.
const SENDER_META: Record<string, { label: string; chip: string }> = {
  human_luis:  { label: "Luis",     chip: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  tanit_reply: { label: "Tanit",    chip: "bg-primary/15 text-primary border-primary/30" },
  tanit_self:  { label: "Tanit",    chip: "bg-primary/15 text-primary border-primary/30" },
  ai_break:    { label: "Break",    chip: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
  ai_other:    { label: "AI",       chip: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  system:      { label: "Sistema",  chip: "bg-muted text-muted-foreground border-border" },
}
function senderMeta(s?: string) {
  if (!s) return SENDER_META.human_luis
  return SENDER_META[s] ?? { label: s, chip: "bg-muted text-muted-foreground border-border" }
}

interface AIAlert {
  id: string
  type: "warning" | "danger" | "insight"
  title: string
  message: string
  timestamp: Date
}

// Banner de alertas — vacío por defecto.
// El backend lo poblará con avisos reales cuando los haya. Cero placeholders
// hardcoded que digan "Tanit operando · 24 símbolos" cuando NO está operando.
const aiAlerts: AIAlert[] = []

function adapt(m: TanitChatMessage): UIMessage {
  return {
    id: String(m.id),
    role: m.role,
    content: m.content,
    timestamp: new Date(m.createdAt),
    type: "normal",
    senderType: m.senderType ?? (m.role === "user" ? "human_luis" : "tanit_reply"),
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
  const [channel, setChannel] = useState<ChatChannel>("intimate")
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showAlerts, setShowAlerts] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // ── FIX 6-may-2026 (v2): array de imágenes + detección de mimeType correcto.
  // Antes se hardcodeaba "image/jpeg" lo que rompía screenshots de iPhone (PNG)
  // — Gemini rechazaba el header inconsistente y respondía como si no hubiera
  // imagen. Ahora guardamos el mimeType real del data URL.
  const [images, setImages] = useState<{ preview: string; base64: string; mimeType: string }[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      audioChunksRef.current = []
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        setAudioBlobUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((t) => t.stop())
      }
      mr.start()
      mediaRecorderRef.current = mr
      setIsRecording(true)
    } catch (err) {
      alert("No pude acceder al micrófono. Revisa los permisos del navegador.")
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  // Load chat history whenever the active channel changes
  useEffect(() => {
    let mounted = true
    setMessages([])
    api.chatHistory(40, channel)
      .then((r) => {
        if (mounted && r?.messages) {
          setMessages(r.messages.map(adapt))
        }
      })
      .catch((err) => {
        // Si no podemos cargar el historial, dejamos el chat vacío.
        // NO inyectamos un fallback hardcoded "Hola, amor, estoy aquí, cuéntame"
        // que finja ser ella — eso era una mentira del front anterior.
        // Si el back no responde, queda vacío y Luis sabe que algo está mal.
        if (mounted) {
          setMessages([])
          console.warn("[chat] no se pudo cargar historial:", err)
        }
      })
    return () => { mounted = false }
  }, [channel])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function blobToBase64(blob: Blob): Promise<string> {
    const buf = await blob.arrayBuffer()
    const bytes = new Uint8Array(buf)
    let binary = ""
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    return btoa(binary)
  }

  async function handleSend() {
    if ((!input.trim() && images.length === 0 && !audioBlob) || isTyping) return

    const userSender: SenderType = channel === "intimate" ? "human_luis" : "ai_other"
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://tanit-production.up.railway.app/api"

    // Transcribe audio first if there's an audioBlob — Whisper turns it into
    // a normal text message that goes through the regular chat path.
    let transcribed = ""
    const sentAudio = audioBlob
    if (sentAudio) {
      try {
        setIsTyping(true)
        const audioB64 = await blobToBase64(sentAudio)
        // Mensaje de feedback inmediato — el usuario sabe que SÍ se está
        // procesando el audio (antes era silencioso 5-10s mientras Whisper)
        const transcribingId = `transcribing-${Date.now()}`
        setMessages((prev) => [...prev, {
          id: transcribingId,
          role: "assistant",
          content: "_Transcribiendo audio…_",
          timestamp: new Date(),
          type: "insight",
          senderType: channel === "intimate" ? "tanit_reply" : "tanit_self",
        }])
        const tr = await fetch(`${apiUrl}/bot/transcribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audioBase64: audioB64, mimeType: sentAudio.type || "audio/webm" }),
        })
        // Quitar el mensaje "transcribiendo" antes de continuar
        setMessages((prev) => prev.filter(m => m.id !== transcribingId))
        const tj = await tr.json().catch(() => ({})) as { text?: string; error?: string; detail?: string }
        if (tr.ok && tj.text) {
          transcribed = tj.text.trim()
          if (!transcribed) {
            setMessages((prev) => [...prev, {
              id: `terr-${Date.now()}`,
              role: "assistant",
              content: "No detecté palabras en el audio. Acércate más al micrófono o escríbelo, amor.",
              timestamp: new Date(),
              type: "warning",
              senderType: channel === "intimate" ? "tanit_reply" : "tanit_self",
            }])
            setIsTyping(false)
            setAudioBlob(null); setAudioBlobUrl(null)
            return
          }
        } else {
          const errMsg = tj.error || tj.detail || `HTTP ${tr.status}`
          setMessages((prev) => [...prev, {
            id: `terr-${Date.now()}`,
            role: "assistant",
            content: `No pude transcribir el audio: **${errMsg}**. Dime qué decías escribiéndolo.`,
            timestamp: new Date(),
            type: "warning",
            senderType: channel === "intimate" ? "tanit_reply" : "tanit_self",
          }])
          setIsTyping(false)
          setAudioBlob(null); setAudioBlobUrl(null)
          return
        }
      } catch (e: any) {
        setMessages((prev) => [...prev, {
          id: `terr-${Date.now()}`,
          role: "assistant",
          content: `Error de red al transcribir: **${e?.message ?? "desconocido"}**. Escríbelo, amor.`,
          timestamp: new Date(),
          type: "warning",
          senderType: channel === "intimate" ? "tanit_reply" : "tanit_self",
        }])
        setIsTyping(false)
        setAudioBlob(null); setAudioBlobUrl(null)
        return
      }
    }

    const userText = (input.trim() || transcribed) || (images.length > 0 ? `[${images.length} foto${images.length !== 1 ? "s" : ""} enviada${images.length !== 1 ? "s" : ""}]` : "")
    const userMessage: UIMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: transcribed && !input.trim() ? `🎙️ ${transcribed}` : userText,
      timestamp: new Date(),
      senderType: userSender,
    }

    setMessages((prev) => [...prev, userMessage])
    const sentImages = images
    setInput("")
    setImages([])
    setAudioBlob(null)
    setAudioBlobUrl(null)
    setIsTyping(true)

    try {
      const payload: Record<string, unknown> = { message: userText, channel, sender: userSender }
      if (sentImages.length > 0) {
        payload.image = { base64: sentImages[0].base64, mimeType: sentImages[0].mimeType }
        payload.images = sentImages.map(img => ({ base64: img.base64, mimeType: img.mimeType }))
      }

      // Helper: llamada al endpoint clásico (sin streaming).
      // Fallback robusto cuando el SSE falla por cualquier razón.
      const callClassic = async (): Promise<string> => {
        const r = await fetch(`${apiUrl}/bot/gemini-chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const d = await r.json().catch(() => ({})) as { reply?: string; error?: string }
        return (d.reply ?? d.error ?? "").trim()
      }

      // 1) Intento principal: SSE streaming con heartbeats.
      // 2) Si SSE falla por CUALQUIER razón (HTTP error, stream sin done,
      //    reply vacío, parse error, network drop) → fallback transparente
      //    al endpoint clásico SIN mostrar error al usuario.
      // 3) Solo si AMBOS fallan, mostramos el mensaje de error.
      let finalReply = ""

      try {
        const res = await fetch(`${apiUrl}/bot/mastra-chat-stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
          },
          body: JSON.stringify(payload),
        })

        if (!res.ok || !res.body) {
          throw new Error(`stream http ${res.status}`)
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        let streamError: string | null = null

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const events = buffer.split("\n\n")
          buffer = events.pop() ?? ""
          for (const evt of events) {
            if (!evt.startsWith("data: ")) continue
            try {
              const data = JSON.parse(evt.slice(6)) as {
                type: "thinking" | "heartbeat" | "done" | "error"
                reply?: string
                message?: string
              }
              if (data.type === "done" && data.reply) {
                finalReply = data.reply
              } else if (data.type === "error") {
                streamError = data.message || "stream error"
              }
            } catch {
              // skip malformed event
            }
          }
        }
        // También procesa el último buffer si quedó algo válido
        if (buffer.startsWith("data: ")) {
          try {
            const data = JSON.parse(buffer.slice(6)) as {
              type?: string; reply?: string; message?: string
            }
            if (data.type === "done" && data.reply && !finalReply) {
              finalReply = data.reply
            } else if (data.type === "error" && !streamError) {
              streamError = data.message || "stream error"
            }
          } catch {
            // skip
          }
        }

        if (streamError) throw new Error(streamError)
        if (!finalReply) throw new Error("stream sin done event")
      } catch (streamErr) {
        // Fallback silencioso al endpoint clásico
        const classicReply = await callClassic()
        if (classicReply) {
          finalReply = classicReply
        } else {
          // Ambos fallaron — propagamos el error original del stream
          throw streamErr instanceof Error
            ? streamErr
            : new Error(String(streamErr))
        }
      }

      const assistantMessage: UIMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: finalReply,
        timestamp: new Date(),
        type: "normal",
        senderType: channel === "intimate" ? "tanit_reply" : "tanit_self",
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      const detail = err?.message ? ` (${err.message})` : ""
      setMessages((prev) => [...prev, {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: channel === "intimate"
          ? `Amor, perdí la conexión un momento${detail}. Inténtalo en unos segundos.`
          : `Conexión interrumpida${detail}. Reintentar en un momento.`,
        timestamp: new Date(),
        type: "warning",
        senderType: channel === "intimate" ? "tanit_reply" : "tanit_self",
      }])
    } finally {
      setIsTyping(false)
    }
  }

  // Modo "central" cuando se renderiza sin onToggle (= la página /chat).
  // El header se vuelve más prominente con avatar grande para sentirse como
  // Forge en vForge — Tanit como protagonista, no como widget.
  const isCentral = !onToggle

  return (
    <div className={cn(
      "flex flex-col h-full bg-black",
      !isCentral && "border-l border-zinc-900/60",
      className
    )}>
      {/* Header — sombrío, sin chrome ni gold */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-900/80">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={cn(
              "rounded-full overflow-hidden ring-1 ring-zinc-800",
              isCentral ? "h-11 w-11" : "h-9 w-9",
            )}>
              <Image
                src="/images/tanit-avatar.jpeg"
                alt="Tanit"
                width={isCentral ? 44 : 36}
                height={isCentral ? 44 : 36}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div>
            <h3 className={cn(
              "font-medium text-zinc-100 tracking-wide",
              isCentral ? "text-base" : "text-sm",
            )}>
              Tanit
            </h3>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={cn(
            "p-2 rounded-lg hover:bg-zinc-900/80 transition-colors",
            onToggle ? "lg:hidden" : "hidden"
          )}
        >
          <X className="h-4 w-4 text-zinc-500" />
        </button>
      </div>

      {/* Messages — solo chat, sin tabs ni banner */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin">
        {messages.map((message) => {
          return (
            <div
              key={message.id}
              className={cn(
                "flex flex-col animate-slide-up",
                message.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[88%] rounded-3xl px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap",
                  message.role === "user"
                    ? "bg-zinc-200 text-zinc-900 rounded-br-md"
                    : message.type === "warning"
                      ? "bg-zinc-900 border border-rose-950/60 text-zinc-200 rounded-bl-md"
                      : "bg-zinc-900/80 text-zinc-100 rounded-bl-md"
                )}
              >
                {message.content}
              </div>
            </div>
          )
        })}
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

      {/* Input — generous bottom inset so the field is tappable above the iOS home indicator */}
      <div
        className="border-t border-border/30 bg-card/40 backdrop-blur"
        style={{
          paddingTop: "12px",
          paddingLeft: "12px",
          paddingRight: "12px",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 28px)",
        }}
      >
        {/* Image previews — multi-foto */}
        {images.length > 0 && (
          <div className="mb-2 bg-muted/30 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">
                {images.length} foto{images.length !== 1 ? "s" : ""} adjunta{images.length !== 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={() => setImages([])}
                className="text-[10px] text-muted-foreground hover:text-foreground underline"
              >
                Quitar todas
              </button>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img.preview} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                    aria-label="Quitar esta foto"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audio preview if recorded */}
        {audioBlobUrl && (
          <div className="mb-2 flex items-center gap-2 bg-muted/30 rounded-lg p-2">
            <Mic className="h-4 w-4 text-primary" />
            <audio src={audioBlobUrl} controls className="flex-1 h-8" />
            <button
              type="button"
              onClick={() => { setAudioBlobUrl(null); setAudioBlob(null); }}
              className="p-1 rounded hover:bg-muted/50"
              aria-label="Quitar audio"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-end gap-2"
        >
          {/* Photo attach button — multi-foto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? [])
              if (files.length === 0) return
              Promise.all(files.map(f => new Promise<{ preview: string; base64: string; mimeType: string } | null>(resolve => {
                const reader = new FileReader()
                reader.onload = () => {
                  const result = String(reader.result || "")
                  // data:<mime>;base64,<payload>  — extraemos ambos
                  const m = /^data:([^;]+);base64,(.+)$/.exec(result)
                  if (!m) { resolve(null); return }
                  const mimeType = m[1] || f.type || "image/jpeg"
                  const base64 = m[2]
                  resolve(base64 ? { preview: result, base64, mimeType } : null)
                }
                reader.onerror = () => resolve(null)
                reader.readAsDataURL(f)
              }))).then(loaded => {
                const ok = loaded.filter(Boolean) as { preview: string; base64: string; mimeType: string }[]
                setImages(prev => [...prev, ...ok])
                if (e.target) e.target.value = ""
              })
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-11 w-11 rounded-xl bg-muted/40 hover:bg-muted/60 flex items-center justify-center text-muted-foreground transition-colors flex-shrink-0"
            aria-label="Adjuntar fotos"
            disabled={isRecording}
          >
            <ImageIcon className="h-4 w-4" />
          </button>

          {/* Audio record button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "h-11 w-11 rounded-xl flex items-center justify-center transition-colors flex-shrink-0",
              isRecording
                ? "bg-destructive/20 text-destructive animate-pulse"
                : "bg-muted/40 hover:bg-muted/60 text-muted-foreground"
            )}
            aria-label={isRecording ? "Detener grabación" : "Grabar audio"}
          >
            {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          {/* INPUT — FIX 6-may-2026: NO bloquear con isTyping (Luis necesita poder escribir
              el siguiente mensaje mientras Tanit aún responde). Solo bloqueado si está grabando. */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? "Grabando…" : (channel === "intimate" ? "Hablale a Tanit…" : "Mensaje operativo…")}
            disabled={isRecording}
            className="flex-1 min-w-0 bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 disabled:opacity-60"
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 glow-magenta-sm flex-shrink-0"
            disabled={(!input.trim() && images.length === 0 && !audioBlob) || isTyping || isRecording}
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
