import { useClock } from '@/hooks/useClock'
import { useAppStore } from '@/lib/store'

export function TopBar() {
  const clock = useClock()
  const { phase, constraints, threats } = useAppStore()

  return (
    <div
      style={{
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 16px',
        height: 44,
        fontFamily: 'var(--mono)',
        fontSize: 11,
        letterSpacing: '0.08em',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        GRIPEN·DISPERSAL·AI
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

      <Stat label="MISSION" value="EXERCISE NORD WIND" />
      <Stat label="AO" value="CENTRAL SWEDEN" />
      <Stat label="PHASE" value={phase} highlight={phase === 'COMPUTING'} warn={phase === 'EXECUTION'} />
      <Stat label="AC" value={`${constraints.aircraftAvailable}/${constraints.aircraftTotal}`} />
      <Stat label="THREAT" value={threats.overallLevel} warn={threats.overallLevel === 'HIGH' || threats.overallLevel === 'CRITICAL'} />

      {/* Status dot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text2)' }}>
        <span
          className="pulse"
          style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }}
        />
        AI ENGINE ACTIVE
      </div>

      {/* Clock */}
      <div style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: 12, letterSpacing: '0.1em' }}>
        {clock}
      </div>
    </div>
  )
}

function Stat({ label, value, highlight, warn }: {
  label: string
  value: string
  highlight?: boolean
  warn?: boolean
}) {
  const color = highlight ? 'var(--blue)' : warn ? 'var(--warn)' : 'var(--accent)'
  return (
    <div style={{ color: 'var(--text2)' }}>
      {label}: <span style={{ color }}>{value}</span>
    </div>
  )
}
