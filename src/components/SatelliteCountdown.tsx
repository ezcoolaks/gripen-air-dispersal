import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'

export function SatelliteCountdown() {
  const { threats } = useAppStore()
  const [secondsLeft, setSecondsLeft] = useState(threats.satOverpass.estimatedMinutes * 60)

  useEffect(() => { setSecondsLeft(threats.satOverpass.estimatedMinutes * 60) }, [threats.satOverpass.estimatedMinutes])
  useEffect(() => {
    const interval = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(interval)
  }, [])

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const pct = secondsLeft / (threats.satOverpass.estimatedMinutes * 60)
  const urgency = mins < 5 ? 'var(--danger)' : mins < 15 ? 'var(--warn)' : 'var(--accent)'
  const label = secondsLeft === 0 ? 'OVERPASS NOW' : `SAT T-${mins}:${secs.toString().padStart(2, '0')}`

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '5px 8px', marginBottom: 6,
      background: 'var(--bg2)', border: `1px solid ${urgency}35`, borderRadius: 4,
    }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: urgency, letterSpacing: '0.06em', flexShrink: 0, animation: mins < 5 ? 'pulse 1s ease-in-out infinite' : undefined }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 1 }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', background: urgency, borderRadius: 1, transition: 'width 1s linear' }} />
      </div>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)', flexShrink: 0 }}>
        {threats.satOverpass.confidence}
      </span>
    </div>
  )
}
