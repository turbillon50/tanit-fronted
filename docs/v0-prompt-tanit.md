# Prompt maestro para v0.dev — Tanit / VO Trading frontend

> **Operador:** Luis Humberto · **Fase Forge:** 3 (generación visual) · **Capa:** 1 (descriptive prompt)
> Pega la sección **2** primero en un chat NUEVO de v0.dev. Luego usa los prompts de la sección **3** uno por uno. Si algo no queda exacto, refina con la sección **4**. Al final: **Sync to GitHub** apuntando al repo `turbillon50/tanit-fronted` rama `main`.

---

## 1) Cómo usarlo

1. Entra a [v0.dev](https://v0.dev) → **New Chat**.
2. Pega el **PROMPT MAESTRO** completo (sección 2). v0 genera el shell + `/chat`.
3. Después dale **Add a screen** y pega cada prompt de pantalla en orden.
4. Para refinar tipografía, animaciones o el logo exacto, usa la sección **4** sobre el componente seleccionado.
5. **Deploy to Vercel** desde v0 → da URL `*.vercel.app` automática.
6. **Sync to GitHub** → rama `main` del repo `turbillon50/tanit-fronted`.

> **Regla v0:** no le pidas las 5 pantallas de un golpe; pierde detalle. Una pantalla por turno.

---

## 2) PROMPT MAESTRO (pega esto entero, primero)

````
Build a premium, mobile-first conversational dashboard called **VO Trading**
— a personal AI trader with persistent memory. The user is Luis. The AI he
talks to is named **Tanit** and is presented as a partner / strategist, not
a bot. The visual language must feel like a fusion of Claude.ai, Linear,
and Vercel: deep black background, monochrome surfaces, single accent in
warm amber, Geist typography, ultra-tight letter-spacing, generous negative
space, glass surfaces, premium feel. NO emojis in UI copy. NO marketing
fluff. NO "AI-powered" labels.

# STACK (v0 defaults work)
- Next.js 16 App Router · TypeScript strict · Tailwind CSS 4 · shadcn/ui
- framer-motion 12 for transitions · lucide-react for icons
- recharts 2 for charts
- Geist Sans (body) + Geist Mono (numbers, hashes, code)
- All UI copy in **Mexican Spanish** (warm but technical, no Spain Spanish)

# DESIGN TOKENS (define in globals.css as CSS variables)
Colors:
  --bg            #000000   (pure black, nothing darker exists)
  --bg-1          #0A0A0A   (cards)
  --bg-2          #111111   (elevated cards)
  --bg-3          #161616   (input fields)
  --bg-elev       #1C1C1C   (hover states)
  --fg            #FAFAFA   (primary text)
  --fg-1          #A1A1A1   (secondary text)
  --fg-2          #71717A   (muted, captions)
  --fg-3          #52525B   (most muted, dividers)
  --border        #1F1F1F   (default 1px borders)
  --border-1      #27272A   (slightly stronger)
  --border-2      #3F3F46   (focus rings)

  --amber         #F59E0B   (THE accent. Used sparingly: equity curve,
                              brand "O", active states, send button)
  --amber-soft    rgba(245,158,11,0.10)
  --amber-glow    rgba(245,158,11,0.35)

  --success       #10B981   (positive PnL, online status)
  --warning       #F5A524   (rate limits, warnings)
  --error         #F43F5E   (errors, kill-switch active, negative PnL)

Typography:
  - Body: Geist Sans, weights 400/500/600, letter-spacing -0.005em
  - Headings: Geist Sans 600, letter-spacing -0.02em to -0.04em (large)
  - Mono: Geist Mono for ALL numbers (balance, prices, PnL),
    timestamps, IDs, addresses, code blocks
  - Tabular nums via `font-feature-settings: 'tnum'` on every number cell
  - NO weights bolder than 600. NO italic anywhere.

Spacing: 8pt grid (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96)
Radius: sm 6, md 10, lg 14, xl 18, full 9999
Transitions: 120ms ease-out, 240ms ease-out, 320ms ease-out (cubic-bezier(0.16, 1, 0.3, 1))
Shadows: NO drop shadows. Only 1px borders for elevation. Glow effect only
on the amber accent (box-shadow: 0 0 24px var(--amber-glow)).

# BRAND / LOGO (component <VoTradingLogo size="sm|md|lg" />)

The logo is text-only with one iconic touch:
- The letter "V" is rendered in chrome silver gradient (top #E8E8EC → mid
  #3B3E46 → bottom #C5C8D0), 3D-beveled feel via subtle linear-gradient
  overlay. Slightly larger than the rest, italic skewX(-2deg).
- The "O" between V and Trading is replaced with a luminous amber RING:
  14-20px circle (size depends), 2px stroke in #F59E0B, with a soft glow
  (box-shadow: 0 0 12px rgba(245,158,11,0.6) + inset 0 0 4px rgba(245,158,11,0.4)).
  Inside the ring is empty (transparent). The ring sits perfectly between
  V and Trading like the "o" in V-O-Trading.
- The word "Trading" follows in chrome silver gradient (same as V), letter-
  spacing -0.01em, weight 500.
- Below in tiny uppercase amber: "IA DESIGN TRADER" letter-spacing 0.32em,
  weight 500, opacity 0.85.

Layout: V Ring Trading on one line, "IA DESIGN TRADER" centered below.
Sizes: sm = 28px V-height, md = 56px, lg = 96px.

If you receive a PNG image (Luis will upload `vo-trading.png` to /public/images
during sync), prefer that PNG via next/image and fall back to the SVG version
above only if the file doesn't exist.

# LAYOUT (responsive)

## Desktop ≥ 1024px (lg breakpoint)
Three columns + a fixed bottom status bar.

  ┌─────────────┬────────────────────────────┬──────────────┐
  │ LeftSidebar │      ChatPanel (main)      │ LiveSidebar  │
  │   w-64      │      flex-1 max-w-3xl      │   w-80       │
  │             │                            │              │
  │  · Brand    │   conversation w/ Tanit    │  EquityCurve │
  │  · Nav      │   sticky header,           │  Balance     │
  │  · Settings │   scrollable history,      │  Positions   │
  │             │   composer at bottom       │  Status mini │
  └─────────────┴────────────────────────────┴──────────────┘
  ┌──────────────────────────────────────────────────────────┐
  │ StatusBar fixed, h-12, bg-black/80 backdrop-blur         │
  └──────────────────────────────────────────────────────────┘

## Tablet 768–1023px
Two columns: LeftSidebar collapsible into icons-only (w-16) + ChatPanel.
LiveSidebar accessible via floating button top-right.

## Mobile < 768px
Full-screen chat. LeftSidebar = drawer from left (hamburger top-left).
LiveSidebar = drawer from right (chart icon top-right). StatusBar fixed
bottom but more compact (truncated pills, scrollable horizontally).

# COMPONENT INVENTORY (build these as separate files in components/)

## <LeftSidebar />
- Top: <VoTradingLogo size="sm" />
- Nav vertical: 3 items max
  · Hablar con Tanit (icon: MessageCircle, active state amber-soft bg)
  · Decisiones (icon: ListChecks)
  · Tanit Memoria (icon: Brain)
- Bottom: Settings cog
- Background: #000, border-r border #1F1F1F.

## <ChatPanel />
Sticky header (h-14):
  · Avatar 36×36 round (border ring border-1)
  · "Tanit" in Geist Sans 600 + tiny status dot pulsing green when online
  · No subtitle, no extra metadata
  · Right side: only a small kill-switch button (Shield icon, normally
    fg-2; when kill_switch_global=true, becomes red with subtle pulse)

Conversation area (scrollable, padding 24px):
  · Messages alternate. Luis right-aligned, Tanit left-aligned.
  · Tanit bubble: bg #111111 (bg-1), text fg, max-width 80%, radius lg,
    padding 14px 18px, no border. Subtle entry animation (translateY 8px
    + opacity, 240ms).
  · Luis bubble: bg #1C1C1C (bg-elev), text fg, max-width 80%, radius lg,
    padding 14px 18px.
  · NO sender name labels above bubbles. NO timestamps inline.
  · A faint timestamp appears ONLY on hover (group-hover) below the bubble,
    Mono, fg-3, 11px.
  · For long Tanit responses, render markdown: **bold** = fg + weight 500,
    `inline code` = bg-3 mono fg-1 padding 2px 6px radius 4px,
    code blocks = bg-3 padding 12px radius lg with copy button.
  · "Thinking" indicator: three dots animating (240ms stagger, scale 0.8↔1.2).

Composer (fixed bottom of panel):
  · Container: bg-1 radius xl border 1px border, padding 8px, gap 8px
  · Image attach button (icon: ImageIcon, fg-2 hover:fg)
  · Voice record button (icon: Mic, when recording becomes red with pulse)
  · Textarea: flex-1, no border, bg transparent, placeholder "Háblale a
    Tanit…" in fg-3, autoexpands 1→6 lines, font Geist Sans
  · Send button: 40×40 round, bg amber on focus/active, glow on hover.
    Icon: Send (paper plane), fg becomes #000 on amber bg.
  · Cmd/Ctrl+Enter or Enter (not Shift+Enter) sends.

## <LiveSidebar />
Top heading: "Live · VO Trading" in fg-2 mono uppercase tracking-wider 11px.
Three stacked cards, each: bg-1 border 1px radius lg padding 16px:

### EquityCurve card
  · Heading "Equity" fg-2 mono uppercase 11px
  · Big number: equity in USD, Geist Mono 600 24px, tabular-nums
  · Right side same row: delta absolute + delta% in success/error
  · Below: 180-220px tall recharts AreaChart
    - Single series: equity over time
    - Gradient fill: from amber (top, opacity 0.45) to transparent (bottom)
    - Stroke 1.5px amber
    - No grid, no axes labels, no legends
    - Tooltip: bg-2 border-1 radius md mono 11px, formatted as
      "$XX.XXXX" + ISO timestamp on label

### BalanceWidget card
  · Two stacked rows:
    - "Disponible" (fg-2 mono 10px) + amount in fg Geist Mono 16px
    - "PnL no realizado" + amount colored success/error

### PositionsMini card
  · Heading "Posiciones" + count badge
  · List of up to 5 rows. Each row:
    - 2px tall vertical pill: green if Buy, red if Sell
    - Symbol stripped of USDT (e.g., "BTC")
    - Leverage tiny mono fg-3 (e.g., "3x")
    - Right-aligned: PnL with sign, mono, success/error
  · If more than 5: "+N más…" in fg-3 italic at bottom
  · If 0: "Ninguna abierta." fg-2

Footer of sidebar: tiny mono fg-3 "Datos en vivo · refresh 5–15s"

## <StatusBar /> (fixed bottom)
Single horizontal row of pills, each pill = icon + label + value
Pills (in order):
  1. Tanit:   pulse dot success/warning + "online"/"off"
  2. Bybit:   Wifi/WifiOff icon + "live"/"off" (warning if off)
  3. Memoria: "76 · 3809 chats" mono fg-2
  4. Pos:     count, amber if >0 else fg-2
  5. PnL:     ±$X.XX mono, success/error
  6. HALT:    only visible when kill_switch_global=true, ShieldAlert + "ACTIVE" red pulsing

Mobile: pills scroll horizontally, no truncation, smaller font 10px.

## <KillSwitchButton />
A small Shield icon button in the chat header. Three states:
  · Normal: fg-2, hover fg
  · Pressed (loading): pulse animation
  · Active (kill_switch_global=true): red with red-glow shadow, label "HALT"
On click: opens a confirm dialog "¿Activar kill switch global? Esto detendrá toda escritura a Bybit." with red Confirmar button.

## <ConfirmTradeDialog />
When Tanit invokes a write tool with `confirmado=false`, the response includes
`needs_confirmation_text`. The chat detects this and renders the Tanit bubble
with an inline confirm card BELOW her message:
  · bg-2 border amber radius lg padding 16px
  · The proposal text from Tanit
  · Two buttons: "Sí, autorizo" (amber bg) and "No, cancela" (transparent border)
  · Clicking either sends a follow-up message back to the chat with the choice.

# COPY (Mexican Spanish, warm-technical)
- "Háblale a Tanit…" (composer placeholder)
- "Tanit está pensando…" (loading state)
- "Sin posiciones abiertas" (positions empty)
- "Construyendo histórico…" (equity curve no data yet)
- "Conexión perdida — reintentando" (when SSE breaks)
- "Sí, autorizo" / "No, cancela" (confirm buttons)
- NO "Hello", NO "Welcome", NO emojis in UI chrome.

# ROUTES
- `/`         → redirect server-side to `/chat`
- `/chat`     → main view (this is what we're building)
- `/decisions` → list of last 50 entries from `/api/decisions/recent`,
                  one card each: timestamp, decision_type, symbol, verdict
                  (badge: executed=green, blocked=red, needs_confirmation=amber,
                  rejected=fg-2), thesis snippet, expandable for full context jsonb
- `/memoria`  → grid of personal_memories + recent tanit_memory entries

# API ENDPOINTS the frontend calls (all already exist on the backend)
- POST  `${NEXT_PUBLIC_API_URL}/bot/mastra-chat-stream` — SSE chat stream.
        Body: { message, channel, sender_type, resourceId, threadId }
        Events: { type: "thinking" | "heartbeat" | "token" | "done" | "error" }
- GET   `${NEXT_PUBLIC_API_URL}/bot/mastra-history?limit=50&channel=intimate`
- GET   `${NEXT_PUBLIC_API_URL}/portfolio/balance`
- GET   `${NEXT_PUBLIC_API_URL}/portfolio/positions`
- GET   `${NEXT_PUBLIC_API_URL}/tanit/balance-snapshots?limit=200`
- GET   `${NEXT_PUBLIC_API_URL}/tanit/state`
NEXT_PUBLIC_API_URL defaults to `https://tanit-production.up.railway.app/api`.

# QUALITY GATES (must pass before sync to GitHub)
- [ ] Mobile (iPhone 14 simulator) renders cleanly, no horizontal scroll
- [ ] Tab navigation works (every interactive element keyboard-accessible)
- [ ] Color contrast AA on all text vs backgrounds
- [ ] No console.log, no TODO comments
- [ ] All copy in Mexican Spanish, no English leftover from defaults
- [ ] Geist fonts loaded, fallback Inter only as last resort
- [ ] Logo `<VoTradingLogo />` renders correctly in 3 sizes
- [ ] Equity curve renders with mock data of 50 points if API empty

Generate the shell + LeftSidebar + ChatPanel + LiveSidebar + StatusBar + the
`/chat` page now. Use mock data for the chat (3 sample messages between Luis
and Tanit) and 50 mock points for the equity curve. The `<VoTradingLogo />`
component should be SVG inline as described.
````

---

## 3) PROMPTS DE PANTALLA (uno por turno, después del maestro)

### 3.1 — Pantalla `/decisions`
````
Add a new screen at /decisions. Render a list of decision cards, paginated
(50 per page). Each card:
  · bg-1 border-1 border 1px radius lg padding 16px
  · Top row: timestamp (Geist Mono fg-3 11px) + decision_type chip
    (open_long → green-pill, open_short → red-pill, close_position → amber,
    set_stops → fg-2, cancel_all → fg-2) + symbol mono
  · Verdict badge right-aligned:
    executed → success bg-soft
    blocked → error bg-soft
    needs_confirmation → amber bg-soft
    rejected → fg-2 bg-soft
  · Body: thesis text (Geist Sans fg-1 14px), max 3 lines, line-clamp
  · Expandable: click anywhere on card opens drawer with full context jsonb
    syntax-highlighted (use shiki or prism, theme github-dark-default)

Header of page: total count + filter chips (All · Executed · Blocked · Needs
confirmation), each filter is a toggle.
````

### 3.2 — Pantalla `/memoria`
````
Add a screen at /memoria with two sections:

1. "Memorias personales" — fetch /api/tanit/personal-memories. Render as a
   grid (2 cols on desktop, 1 on mobile). Each card:
   · bg-1 padding 20px radius xl border-1
   · Title in Geist Sans 600 16px
   · Type chip (uppercase mono 10px tracking-wider amber)
   · Content body Geist Sans 14px fg-1, line-clamp 6
   · Footer: created_at relative ("hace 3 días")

2. "Directivas activas" — fetch /api/tanit/memories?category=core_identity etc.
   Render as a flat list grouped by category. Each entry: bullet, content
   truncated to 200 chars with "ver más" expandable.
````

---

## 4) PROMPTS DE REFINAMIENTO (sólo si v0 no llegó)

### 4.1 — Si el logo no quedó como descrito
````
Replace the entire <VoTradingLogo /> component with this exact JSX:

```tsx
"use client"
import { cn } from "@/lib/utils"

export function VoTradingLogo({ size = "md", className }: { size?: "sm"|"md"|"lg"; className?: string }) {
  const dim = size === "sm" ? 28 : size === "lg" ? 96 : 56
  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      <span
        className="font-[Geist_Sans] font-semibold tracking-tight"
        style={{
          fontSize: dim,
          lineHeight: 1,
          background: "linear-gradient(180deg, #E8E8EC 0%, #9CA0AA 35%, #3B3E46 55%, #C5C8D0 80%, #1A1C20 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          transform: "skewX(-2deg)",
        }}
      >
        V
      </span>
      <span
        aria-hidden
        style={{
          width: dim * 0.42,
          height: dim * 0.42,
          borderRadius: "50%",
          border: `${Math.max(2, dim * 0.04)}px solid #F59E0B`,
          boxShadow: "0 0 12px rgba(245,158,11,0.6), inset 0 0 4px rgba(245,158,11,0.4)",
        }}
      />
      <span
        className="font-[Geist_Sans] font-medium"
        style={{
          fontSize: dim,
          lineHeight: 1,
          letterSpacing: "-0.01em",
          background: "linear-gradient(180deg, #E8E8EC 0%, #9CA0AA 35%, #3B3E46 55%, #C5C8D0 80%, #1A1C20 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        Trading
      </span>
    </div>
  )
}
```

If a PNG file at /public/images/vo-trading.png exists, prefer rendering
that PNG via next/image with width = dim * 3, height = dim, alt = "VO Trading".
Fall back to the SVG version only if next/image errors.
````

### 4.2 — Si el equity curve se ve muy técnico
````
Replace the EquityCurve recharts AreaChart with the following exact config:
- ResponsiveContainer width="100%" height={200}
- AreaChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
- defs:
    linearGradient id="eqfill" x1="0" y1="0" x2="0" y2="1"
      stop offset="0%"  stopColor="#F59E0B" stopOpacity={0.45}
      stop offset="100%" stopColor="#F59E0B" stopOpacity={0}
- XAxis dataKey="ts" hide
- YAxis domain={["dataMin","dataMax"]} hide
- Tooltip: cursor stroke=#52525B strokeWidth=1 strokeDasharray="2 2",
           contentStyle: bg #0A0A0A border 1px #27272A radius 8 padding "6px 10px" fontSize 11
- Area type="monotone" dataKey="equity" stroke="#F59E0B" strokeWidth={1.5}
       fill="url(#eqfill)" isAnimationActive={false}

Above the chart, add a tiny header row:
  - Left: "Equity" uppercase mono 10px tracking-wider fg-2
  - Right: nothing (the big number lives below the header, before the chart)
````

### 4.3 — Si el chat panel está cortado por el header en mobile
````
On the ChatPanel root container, replace any padding with this exact
structure:

<div className="flex flex-col h-[100dvh] bg-black">
  <header className="sticky top-0 z-20 flex items-center gap-3 px-5 h-14
                     bg-black/80 backdrop-blur border-b border-[#1F1F1F]">
    {/* avatar + name + kill-switch button */}
  </header>
  <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
    {/* messages */}
  </div>
  <div className="border-t border-[#1F1F1F] bg-black/80 backdrop-blur px-3 py-3">
    {/* composer */}
  </div>
</div>

The status bar's bottom-0 fixed positioning means the chat panel must NOT
have its own pb to compensate — the StatusBar's height is added to the
chat's visible area via CSS variable --status-bar-h: 48px on desktop, 40px
on mobile. The chat container subtracts that with calc(100dvh - var(--status-bar-h))
on its h.
````

### 4.4 — Si los markdown bloques de código en chat no tienen estilo
````
For markdown rendering inside Tanit's bubbles, install react-markdown +
remark-gfm. Configure components:

  code: ({ inline, children }) => inline
    ? <code className="bg-[#161616] text-[#A1A1A1] font-[Geist_Mono] text-[12px] px-1.5 py-0.5 rounded">{children}</code>
    : <pre className="bg-[#161616] border border-[#27272A] rounded-lg p-3 overflow-x-auto"><code className="font-[Geist_Mono] text-[12px] text-[#FAFAFA]">{children}</code></pre>
  strong: ({ children }) => <strong className="font-medium text-[#FAFAFA]">{children}</strong>
  a: ({ href, children }) => <a href={href} className="text-[#F59E0B] underline underline-offset-2 hover:text-[#FBBF24]" target="_blank" rel="noopener noreferrer">{children}</a>
  ul: ({ children }) => <ul className="list-disc pl-6 space-y-1">{children}</ul>
  ol: ({ children }) => <ol className="list-decimal pl-6 space-y-1">{children}</ol>

Do NOT add line breaks via <br/>. Trust the markdown.
````

---

## 5) Después de v0 → Sync to GitHub

1. En v0, click **Sync to GitHub**.
2. Selecciona el repo `turbillon50/tanit-fronted`.
3. Branch: `main` (Vercel auto-deploya `main` a `tanit.work`).
4. Confirma.
5. **Espera 30s a que Vercel deploye**, refresca `tanit.work`, valida los quality gates manualmente.
6. Si algo en el código merece refactor (ej. mover componentes, dividir client/server, integrar con `lib/api.ts`), eso lo hace **Claude Code en una rama feature** — tú no debes editar a mano lo que vino de v0 sin avisar.

---

## 6) Lo que YO (Claude Code) hago después del sync

- Reviso `lib/api.ts` y verifico que los hooks coinciden con la lista de endpoints en sección 2.
- Si v0 no cableó SSE para el chat-stream, lo cableo en un componente client `useChatStream(message, threadId)` con `fetch` + `ReadableStream` parsing (no `EventSource` porque Mastra usa POST).
- Conecto la `<ConfirmTradeDialog />` al flujo: cuando un mensaje de Tanit incluya marcador `[TOOL_NEEDS_CONFIRMATION]` (que el frontend extrae de `done.reply`), renderizo el dialog y al confirmar mando un nuevo mensaje al chat con el texto `"sí, autorizo"`.
- Aseguro que Vercel env tenga `NEXT_PUBLIC_API_URL = https://tanit-production.up.railway.app/api`.
- PR en draft → "Ready for review" cuando todos los quality gates pasen.

**NO** voy a inventar componentes nuevos ni cambiar copy ni rediseñar layouts. Eso es Capa 1 (v0). Mi capa es 3.
