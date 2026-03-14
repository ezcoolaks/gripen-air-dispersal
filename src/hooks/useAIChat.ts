import { useCallback, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { streamTacticalAdvisor } from '@/lib/anthropic'

export function useAIChat() {
  const { chat, weights, constraints, threats, recommendations, addMessage, updateLastAssistantMessage } =
    useAppStore()
  const isStreamingRef = useRef(false)

  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim() || isStreamingRef.current) return

      // Add user message
      addMessage('user', userText.trim())

      // Add placeholder for assistant
      addMessage('assistant', '')
      isStreamingRef.current = true

      let accumulated = ''

      await streamTacticalAdvisor(
        userText,
        chat,
        { weights, constraints, threats, recommendations },
        {
          onToken: (token) => {
            accumulated += token
            updateLastAssistantMessage(accumulated)
          },
          onComplete: (full) => {
            updateLastAssistantMessage(full)
            isStreamingRef.current = false
          },
          onError: (err) => {
            const errorMsg =
              err.message.includes('VITE_OPENROUTER_API_KEY')
                ? '⚠ **API key not configured.** Add `VITE_OPENROUTER_API_KEY=sk-or-v1-...` to your `.env.local` file and restart the dev server. Get a free key at openrouter.ai/keys'
                : `⚠ OpenRouter error: ${err.message}`
            updateLastAssistantMessage(errorMsg)
            isStreamingRef.current = false
          },
        }
      )
    },
    [chat, weights, constraints, threats, recommendations, addMessage, updateLastAssistantMessage]
  )

  return { sendMessage, isStreaming: isStreamingRef.current }
}
