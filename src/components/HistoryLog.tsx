import { useAppStore } from '@/lib/store'
import type { DispersalEvent } from '@/types'

export function HistoryLog() {
  const { history } = useAppStore()

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em',
        color: 'var(--text2)', marginBottom: 5, paddingBottom: 4,
        borderBottom: '1px solid var(--border)',
      }}>
        RECENT DISPERSALS
      </div>
      {history.slice(0, 4).map((event) => <HistoryRow key={event.id} event={event} />)}
    </div>
  )
}

function HistoryRow({ event }: { event: DispersalEvent }) {
  const color = event.outcome === 'SUCCESSFUL' ? 'var(--accent)' : event.outcome === 'COMPROMISED' ? 'var(--danger)' : 'var(--warn)'
  const hoursAgo = Math.round((Date.now() - event.timestamp.getTime()) / 3_600_000)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '4px 6px', marginBottom: 3,
      background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 3,
    }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ flex: 1, color: 'var(--text)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {event.zoneName}
      </span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)', flexShrink: 0 }}>
        {hoursAgo}h
      </span>
      <span style={{
        fontFamily: 'var(--mono)', fontSize: 11, padding: '1px 4px', borderRadius: 2,
        background: `${color}15`, color, border: `1px solid ${color}30`, flexShrink: 0,
      }}>
        {event.outcome.slice(0, 4)}
      </span>
    </div>
  )
}
