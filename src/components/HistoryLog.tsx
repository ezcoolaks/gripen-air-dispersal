import { useAppStore } from '@/lib/store'
import { formatZuluShort } from '@/lib/utils'
import type { DispersalEvent } from '@/types'

export function HistoryLog() {
  const { history } = useAppStore()

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: 10,
        letterSpacing: '0.12em',
        color: 'var(--text2)',
        marginBottom: 8,
        paddingBottom: 6,
        borderBottom: '1px solid var(--border)',
      }}>
        DISPERSAL HISTORY (LAST 7 DAYS)
      </div>
      {history.slice(0, 6).map((event) => (
        <HistoryRow key={event.id} event={event} />
      ))}
    </div>
  )
}

function HistoryRow({ event }: { event: DispersalEvent }) {
  const outcomeColor =
    event.outcome === 'SUCCESSFUL'
      ? 'var(--accent)'
      : event.outcome === 'COMPROMISED'
      ? 'var(--danger)'
      : 'var(--warn)'

  const hoursAgo = Math.round((Date.now() - event.timestamp.getTime()) / 3_600_000)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '5px 8px',
      marginBottom: 4,
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 4,
      fontSize: 11,
    }}>
      <div style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: outcomeColor,
        flexShrink: 0,
      }} />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ color: 'var(--text)', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {event.zoneName}
        </div>
        <div style={{ color: 'var(--text2)', fontSize: 10, fontFamily: 'var(--mono)' }}>
          {hoursAgo}h ago · {event.duration}h
        </div>
      </div>
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: 9,
        padding: '1px 5px',
        borderRadius: 2,
        background: `${outcomeColor}15`,
        color: outcomeColor,
        border: `1px solid ${outcomeColor}35`,
        flexShrink: 0,
      }}>
        {event.outcome.slice(0, 4)}
      </div>
    </div>
  )
}
