import { useRef, useEffect, useState, KeyboardEvent } from 'react'
import { useAppStore } from '@/lib/store'
import { useAIChat } from '@/hooks/useAIChat'
import { renderMarkdown } from '@/lib/utils'

// Quick-access tactical prompts
const QUICK_PROMPTS = [
  'Compare top 2 zones',
  'Assess satellite risk window',
  'Suggest timing deception plan',
  'What if we increase entropy weight?',
  'FARP setup requirements for Bravo-3',
]

export function AIAdvisorPanel() {
  const { chat, clearChat } = useAppStore()
  const { sendMessage } = useAIChat()
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isSending) return
    setInput('')
    setIsSending(true)
    await sendMessage(text)
    setIsSending(false)
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      borderTop: '1px solid var(--border)',
      background: 'var(--bg2)',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 14px',
        background: 'var(--bg2)',
        borderTop: '1px solid var(--border)',
        fontFamily: 'var(--mono)',
        fontSize: 10,
        letterSpacing: '0.12em',
        color: 'var(--accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span>◈ AI TACTICAL ADVISOR</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--text2)', fontSize: 9 }}>CLAUDE</span>
          <button
            onClick={clearChat}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 2,
              color: 'var(--text2)',
              fontFamily: 'var(--mono)',
              fontSize: 9,
              padding: '1px 6px',
              cursor: 'pointer',
              letterSpacing: '0.06em',
            }}
          >
            CLR
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        maxHeight: 220,
        overflowY: 'auto',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {chat.map((msg) => (
          <div
            key={msg.id}
            className="fadein"
            style={{
              fontSize: 12,
              lineHeight: 1.55,
              padding: '7px 10px',
              borderRadius: 4,
              maxWidth: '95%',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              background:
                msg.role === 'user'
                  ? 'rgba(0,168,240,0.1)'
                  : 'rgba(0,200,140,0.05)',
              border:
                msg.role === 'user'
                  ? '1px solid rgba(0,168,240,0.2)'
                  : '1px solid var(--border)',
              color: msg.role === 'user' ? 'var(--text)' : 'var(--text2)',
            }}
          >
            {msg.isStreaming && msg.content === '' ? (
              <TypingIndicator />
            ) : (
              <div
                className="chat-content"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
              />
            )}
            {msg.isStreaming && msg.content !== '' && (
              <span style={{
                display: 'inline-block',
                width: 6,
                height: 12,
                background: 'var(--accent)',
                marginLeft: 2,
                animation: 'blink 1s ease-in-out infinite',
                verticalAlign: 'middle',
              }} />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div style={{
        padding: '4px 12px',
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap',
        borderTop: '1px solid rgba(0,200,140,0.08)',
      }}>
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => {
              setInput(p)
            }}
            style={{
              fontSize: 10,
              fontFamily: 'var(--mono)',
              padding: '2px 7px',
              borderRadius: 2,
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text2)',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              transition: 'all 0.15s',
            }}
            onMouseOver={(e) => {
              (e.target as HTMLElement).style.borderColor = 'rgba(0,200,140,0.4)'
              ;(e.target as HTMLElement).style.color = 'var(--accent)'
            }}
            onMouseOut={(e) => {
              ;(e.target as HTMLElement).style.borderColor = 'var(--border)'
              ;(e.target as HTMLElement).style.color = 'var(--text2)'
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderTop: '1px solid var(--border)',
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask tactical advisor..."
          disabled={isSending}
          style={{
            flex: 1,
            background: 'var(--bg3)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '6px 10px',
            color: 'var(--text)',
            fontFamily: 'var(--sans)',
            fontSize: 12,
            outline: 'none',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        />
        <button
          onClick={handleSend}
          disabled={isSending || !input.trim()}
          style={{
            background: isSending ? 'var(--text2)' : 'var(--accent)',
            color: '#0a0d12',
            border: 'none',
            borderRadius: 4,
            padding: '6px 14px',
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '0.08em',
            cursor: isSending ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            transition: 'background 0.2s',
          }}
        >
          {isSending ? '...' : 'SEND'}
        </button>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: 4 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'var(--accent)',
            display: 'inline-block',
            animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
