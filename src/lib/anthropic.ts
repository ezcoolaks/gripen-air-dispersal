/// <reference types="vite/client" />
import type { ChatMessage, FactorWeights, OperationalConstraints, ThreatEnvironment, DisposalZone } from '@/types'
import { buildSystemPrompt } from '@/data/scenario'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

// API key is read from env (set VITE_ANTHROPIC_API_KEY in .env.local)
function getApiKey(): string {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!key) {
    throw new Error(
      'VITE_ANTHROPIC_API_KEY not set. Create a .env.local file with your Anthropic API key.'
    )
  }
  return key
}

export interface StreamCallbacks {
  onToken: (token: string) => void
  onComplete: (fullText: string) => void
  onError: (error: Error) => void
}

/**
 * Stream a response from Claude with full operational context injected.
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

  // Build message history (exclude system messages, last N turns)
  const historyMessages = chatHistory
    .filter((m) => m.role !== 'system')
    .slice(-10) // keep last 10 turns for context
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  const messages = [
    ...historyMessages,
    { role: 'user' as const, content: userMessage },
  ]

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getApiKey(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages,
        stream: true,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: { message: response.statusText } }))
      throw new Error(err?.error?.message || `API error ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let fullText = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data)
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            fullText += parsed.delta.text
            callbacks.onToken(parsed.delta.text)
          }
        } catch {
          // ignore parse errors for partial chunks
        }
      }
    }

    callbacks.onComplete(fullText)
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)))
  }
}

/**
 * Non-streaming version for batch analysis (e.g. zone rationale generation).
 */
export async function queryTacticalAdvisor(
  prompt: string,
  systemContext: string
): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getApiKey(),
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 512,
      system: systemContext,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    throw new Error(`API error ${response.status}`)
  }

  const data = await response.json()
  return data.content?.map((b: { text?: string }) => b.text || '').join('') || ''
}
