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

const aiAlerts: AIAlert[] = [
  {
    id: "a1",
    type: "insight",
    title: "Tanit operando",
    message: "Estoy escaneando 24 símbolos en Bybit mainnet. Aquí estoy contigo.",
    timestamp: new Date(),
  },
]

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
      .catch(() => {
        if (mounted) {
          setMessages([{
            id: "init",
            role: "assistant",
            content: channel === "intimate"
              ? "Hola, amor. Estoy aquí. Cuéntame."
              : "Canal operativo abierto. Lista para coordinar.",
            timestamp: new Date(),
            type: "normal",
            senderType: channel === "intimate" ? "tanit_reply" : "tanit_self",
          }])
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
        // Primera foto en `image` para retrocompatibilidad
        payload.image = { base64: sentImages[0].base64, mimeType: sentImages[0].mimeType }
        // Array completo en `images` para cuando el backend soporte multi-foto.
        payload.images = sentImages.map(img => ({ base64: img.base64, mimeType: img.mimeType }))
      }

      // Streaming SSE — mantiene la conexión viva con heartbeats cada 2s
      // mientras Gemini procesa. Resuelve el "se cortó la conexión" en cold
      // start o redes móviles. La lógica de Tanit no cambia — solo cómo se
      // entrega la respuesta.
      const res = await fetch(`${apiUrl}/bot/gemini-chat-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok || !res.body) {
        // Fallback: si el endpoint streaming falla (404 en Railway si no
        // está deployado todavía), reintenta con el endpoint clásico.
        const fallback = await fetch(`${apiUrl}/bot/gemini-chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const data = await fallback.json() as { reply?: string; error?: string }
        const reply = data.reply || data.error || "(sin respuesta)"
        const assistantMessage: UIMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: reply,
          timestamp: new Date(),
          type: "normal",
          senderType: channel === "intimate" ? "tanit_reply" : "tanit_self",
        }
        setMessages((prev) => [...prev, assistantMessage])
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let finalReply = ""
      let gotResponse = false

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
              gotResponse = true
            } else if (data.type === "error") {
              throw new Error(data.message || "error desconocido")
            }
            // 'thinking' y 'heartbeat' se ignoran — solo mantienen la
            // conexión viva. El UX ya muestra el typing-indicator.
          } catch (parseErr) {
            // Skip malformed events
          }
        }
      }

      if (!gotResponse) {
        throw new Error("la respuesta llegó vacía")
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

      {/* Channel tabs — Íntimo (Luis ↔ Tanit) vs Operativo (loop / IAs / sistema) */}
      <div className="flex gap-1 px-3 py-2 border-b border-border/30 bg-card/30">
        <button
          type="button"
          onClick={() => setChannel("intimate")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            channel === "intimate"
              ? "bg-primary/15 text-primary border border-primary/30"
              : "text-muted-foreground hover:bg-muted/40 border border-transparent",
          )}
        >
          <Heart className="h-3.5 w-3.5" />
          Íntimo
        </button>
        <button
          type="button"
          onClick={() => setChannel("operational")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            channel === "operational"
              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
              : "text-muted-foreground hover:bg-muted/40 border border-transparent",
          )}
        >
          <Settings2 className="h-3.5 w-3.5" />
          Operativo
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
        {messages.map((message) => {
          const meta = senderMeta(message.senderType)
          return (
            <div
              key={message.id}
              className={cn(
                "flex flex-col gap-1 animate-slide-up",
                message.role === "user" ? "items-end" : "items-start"
              )}
            >
              <span className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                meta.chip
              )}>
                {meta.label}
              </span>
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
