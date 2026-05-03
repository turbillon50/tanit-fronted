/**
 * API client for Tanit backend.
 * Reads NEXT_PUBLIC_API_URL at build time. Falls back to localhost for dev.
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://tanit-production.up.railway.app/api";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      msg = j.error || j.message || msg;
    } catch {}
    throw new ApiError(res.status, msg);
  }
  return res.json() as Promise<T>;
}

export const apiGet  = <T>(path: string) => request<T>("GET", path);
export const apiPost = <T>(path: string, body?: unknown) => request<T>("POST", path, body);

// ─── Typed helpers for the routes the frontend uses ──────────────────────────

export interface TanitState {
  ok: boolean;
  state: {
    balance: string | null;
    equity: string | null;
    available: string | null;
    balanceUpdatedAt: string | null;
    recentTrades: {
      total: number;
      wins: number;
      losses: number;
      winRate: number;
      totalPnl: number;
    };
    memoryCount: number;
    chatCount: number;
    ts: string;
  };
}

export type ChatChannel = "intimate" | "operational" | "all";
export type SenderType =
  | "human_luis"
  | "tanit_reply"
  | "tanit_self"
  | "ai_break"
  | "ai_other"
  | "system"
  | string;

export interface TanitChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  actions: string | null;
  channel?: "intimate" | "operational";
  sender_type?: SenderType;
  created_at: string;
}

export interface PersonalMemory {
  id: number;
  type: string;
  title: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
}

export interface TanitMemoryItem {
  id: number;
  category: string;
  content: string;
  createdAt: string;
}

export interface PortfolioBalance {
  totalEquity: number;
  availableBalance: number;
  unrealizedPnl: number;
  totalWalletBalance: number;
  demoMode: boolean;
}

export interface PortfolioPosition {
  symbol: string;
  side: "Buy" | "Sell";
  size: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  liquidationPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  openedAt: number;
}

export interface PortfolioStats {
  totalTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  totalPnl: number;
  bestTrade: number;
  worstTrade: number;
  currentStreak: number;
}

export interface BalanceSnapshot {
  id: number;
  balance: string;
  equity: string | null;
  available: string | null;
  note: string | null;
  created_at: string;
}

export const api = {
  state: () => apiGet<TanitState>("/tanit/state"),
  chatHistory: (limit = 50, channel: ChatChannel = "intimate") =>
    apiGet<{ ok: boolean; channel: string; count: number; messages: TanitChatMessage[] }>(
      `/tanit/chat?limit=${limit}&channel=${channel}`
    ),
  sendMessage: (
    message: string,
    opts: { channel?: "intimate" | "operational"; sender?: SenderType } = {},
  ) =>
    apiPost<{ ok: boolean; channel: string; reply: string; actionsExecuted: unknown[] }>(
      "/bot/gemini-chat",
      { message, channel: opts.channel ?? "intimate", sender: opts.sender ?? "human_luis" }
    ),
  personalMemories: () =>
    apiGet<{ ok: boolean; count: number; memories: PersonalMemory[] }>(
      "/tanit/personal-memories"
    ),
  memories: (category?: string, limit = 100) => {
    const q = new URLSearchParams();
    if (category) q.set("category", category);
    q.set("limit", String(limit));
    return apiGet<{ ok: boolean; count: number; memories: TanitMemoryItem[] }>(
      `/tanit/memories?${q.toString()}`
    );
  },
  balance: () => apiGet<PortfolioBalance>("/portfolio/balance"),
  positions: () => apiGet<PortfolioPosition[]>("/portfolio/positions"),
  stats: () => apiGet<PortfolioStats>("/portfolio/stats"),
  balanceSnapshots: (limit = 200) =>
    apiGet<{ ok: boolean; count: number; snapshots: BalanceSnapshot[] }>(
      `/tanit/balance-snapshots?limit=${limit}`
    ),
};
