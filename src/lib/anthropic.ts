/// <reference types="vite/client" />
import type { ChatMessage, FactorWeights, OperationalConstraints, ThreatEnvironment, DisposalZone } from '@/types'
import { buildSystemPrompt } from '@/data/scenario'

// ── OpenRouter config ────────────────────────────────────────────────────────
// OpenRouter exposes an OpenAI-compatible endpoint.
// Docs: https://openrouter.ai/docs
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Default model — Claude Sonnet via OpenRouter.
// Any model slug from https://openrouter.ai/models works here, e.g.:
//   'anthropic/claude-sonnet-4-5'
//   'openai/gpt-4o'
//   'meta-llama/llama-3.1-70b-instruct'
const DEFAULT_MODEL = 'anthropic/claude-sonnet-4-5'

// Site info sent to OpenRouter (shown in their usage dashboard)
const SITE_URL  = 'http://localhost:3000'
const SITE_NAME = 'Gripen Dispersal AI'

// ── Key helper ───────────────────────────────────────────────────────────────
function getApiKey(): string {
  const key = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!key) {
    throw new Error(
      'VITE_OPENROUTER_API_KEY not set.\n' +
      'Create a .env.local file and add:\n' +
      'VITE_OPENROUTER_API_KEY=sk-or-v1-...'
    )
  }
  return key
}

function getModel(): string {
  // Allow override via env, e.g. VITE_OPENROUTER_MODEL=openai/gpt-4o
  return import.meta.env.VITE_OPENROUTER_MODEL || DEFAULT_MODEL
}

// ── Shared headers ────────────────────────────────────────────────────────────
function buildHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getApiKey()}`,
    'HTTP-Referer': SITE_URL,
    'X-Title': SITE_NAME,
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface StreamCallbacks {
  onToken: (token: string) => void
  onComplete: (fullText: string) => void
  onError: (error: Error) => void
}

// ── Streaming chat ────────────────────────────────────────────────────────────
/**
 * Stream a response from the AI advisor via OpenRouter SSE.
 * OpenRouter uses the OpenAI chat completions format:
 *   data: {"choices":[{"delta":{"content":"token"}}]}
 */
export async function streamTacticalAdvisor(
  userMessage: string,
  chatHistory: ChatMessage[],
  context: {
    weights: FactorWeights
    constraints: OperationalConstraints
    threats: ThreatEnvironment
    recommendations: DisposalZone[]
  },
  callbacks: StreamCallbacks
): Promise<void> {
  const systemPrompt = buildSystemPrompt(
    context.weights as unknown as Record<string, number>,
    context.constraints,
    context.threats,
    context.recommendations
  )

  // Build OpenAI-format message array: system first, then history, then new user msg
  const historyMessages = chatHistory
    .filter((m) => m.role !== 'system')
    .slice(-10)
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...historyMessages,
    { role: 'user' as const, content: userMessage },
  ]

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({
        model: getModel(),
        max_tokens: 1024,
        messages,
        stream: true,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: { message: response.statusText } }))
      throw new Error(err?.error?.message || `OpenRouter error ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body from OpenRouter')

    const decoder = new TextDecoder()
    let fullText = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data)
          // OpenAI SSE format: choices[0].delta.content
          const token = parsed?.choices?.[0]?.delta?.content
          if (token) {
            fullText += token
            callbacks.onToken(token)
          }
        } catch {
          // ignore malformed chunks
        }
      }
    }

    callbacks.onComplete(fullText)
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)))
  }
}

// ── Non-streaming (batch) ─────────────────────────────────────────────────────
/**
 * Single-turn query without streaming — used for zone rationale generation.
 */
export async function queryTacticalAdvisor(
  prompt: string,
  systemContext: string
): Promise<string> {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({
      model: getModel(),
      max_tokens: 512,
      messages: [
        { role: 'system', content: systemContext },
        { role: 'user',   content: prompt },
      ],
      stream: false,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(err?.error?.message || `OpenRouter error ${response.status}`)
  }

  const data = await response.json()
  // OpenAI format: choices[0].message.content
  return data?.choices?.[0]?.message?.content ?? ''
}
