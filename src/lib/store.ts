import { create } from 'zustand'
import type {
  AppState,
  AppPhase,
  FactorWeights,
  ChatMessage,
  DisposalZone,
  SystemMetrics,
} from '@/types'
import {
  DEFAULT_CONSTRAINTS,
  DEFAULT_THREATS,
  MOCK_HISTORY,
} from '@/data/scenario'
import { computeRecommendations, computeMetrics } from '@/lib/engine'

// Simple uuid fallback that doesn't require the crypto module
function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

interface AppActions {
  // Phase
  setPhase: (phase: AppPhase) => void

  // Weights
  setWeight: (key: keyof FactorWeights, value: number) => void
  setWeights: (weights: FactorWeights) => void

  // Recommendations
  generateRecommendations: () => void
  selectZone: (id: string | null) => void

  // Map layers
  toggleLayer: (layer: keyof AppState['mapLayers']) => void

  // Chat
  addMessage: (role: 'user' | 'assistant', content: string) => ChatMessage
  updateLastAssistantMessage: (content: string) => void
  setMessageStreaming: (id: string, streaming: boolean) => void
  clearChat: () => void

  // Metrics
  setMetrics: (metrics: SystemMetrics) => void
}

const DEFAULT_WEIGHTS: FactorWeights = {
  stealth: 70,
  logistics: 55,
  surface: 80,
  redeploy: 60,
  entropy: 85,
}

const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'init-0',
    role: 'assistant',
    content:
      '**Gripen Dispersal AI online.** Mission context loaded — central Sweden AO, EXERCISE NORD WIND. Generate recommendations and query me for tactical analysis, threat assessment, or alternative courses of action.',
    timestamp: new Date(),
  },
]

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  // ── INITIAL STATE ──────────────────────────────────────────────────────────
  phase: 'STANDBY',
  weights: DEFAULT_WEIGHTS,
  constraints: DEFAULT_CONSTRAINTS,
  threats: DEFAULT_THREATS,
  recommendations: [],
  selectedZoneId: null,
  metrics: null,
  history: MOCK_HISTORY,
  chat: INITIAL_CHAT,
  lastGeneratedAt: null,
  mapLayers: {
    threats: true,
    routes: true,
    zones: true,
    terrain: true,
  },

  // ── ACTIONS ────────────────────────────────────────────────────────────────
  setPhase: (phase) => set({ phase }),

  setWeight: (key, value) =>
    set((state) => ({ weights: { ...state.weights, [key]: value } })),

  setWeights: (weights) => set({ weights }),

  generateRecommendations: () => {
    const { weights, constraints, threats } = get()
    set({ phase: 'COMPUTING' })

    // Simulate async computation delay for UX
    setTimeout(() => {
      const recs = computeRecommendations(weights, constraints, threats)
      const metrics = computeMetrics(recs, weights, constraints)

      set({
        recommendations: recs,
        selectedZoneId: recs[0]?.id ?? null,
        metrics,
        phase: 'EXECUTION',
        lastGeneratedAt: new Date(),
      })
    }, 1200)
  },

  selectZone: (id) => set({ selectedZoneId: id }),

  toggleLayer: (layer) =>
    set((state) => ({
      mapLayers: { ...state.mapLayers, [layer]: !state.mapLayers[layer] },
    })),

  addMessage: (role, content) => {
    const msg: ChatMessage = {
      id: uid(),
      role,
      content,
      timestamp: new Date(),
      isStreaming: role === 'assistant',
    }
    set((state) => ({ chat: [...state.chat, msg] }))
    return msg
  },

  updateLastAssistantMessage: (content) =>
    set((state) => {
      const chat = [...state.chat]
      for (let i = chat.length - 1; i >= 0; i--) {
        if (chat[i].role === 'assistant') {
          chat[i] = { ...chat[i], content, isStreaming: false }
          break
        }
      }
      return { chat }
    }),

  setMessageStreaming: (id, streaming) =>
    set((state) => ({
      chat: state.chat.map((m) =>
        m.id === id ? { ...m, isStreaming: streaming } : m
      ),
    })),

  clearChat: () => set({ chat: INITIAL_CHAT }),

  setMetrics: (metrics) => set({ metrics }),
}))
