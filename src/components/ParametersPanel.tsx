import { useAppStore } from '@/lib/store'
import type { FactorWeights } from '@/types'
import { threatColor } from '@/lib/utils'

const WEIGHT_KEYS: { key: keyof FactorWeights; label: string }[] = [
  { key: 'stealth', label: 'Stealth / Low Detection' },
  { key: 'logistics', label: 'Logistics Access' },
  { key: 'surface', label: 'Surface Suitability' },
  { key: 'redeploy', label: 'Redeployment Speed' },
  { key: 'entropy', label: 'Unpredictability (Entropy)' },
]

export function ParametersPanel() {
  const { weights, setWeight, constraints, threats, generateRecommendations, phase } = useAppStore()
  const isComputing = phase === 'COMPUTING'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--panel)', borderRight: '1px solid var(--border)' }}>
      <PanelHeader title="◈ OPERATIONAL PARAMETERS" sub="v2.4.1" />
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>

        {/* Weight sliders */}
        <SectionTitle>FACTOR WEIGHTING</SectionTitle>
        {WEIGHT_KEYS.map(({ key, label }) => (
          <SliderRow
            key={key}
            label={label}
            value={weights[key]}
            onChange={(v) => setWeight(key, v)}
          />
        ))}

        {/* Operational constraints */}
        <SectionTitle style={{ marginTop: 20 }}>OPERATIONAL CONSTRAINTS</SectionTitle>
        <StatusRow icon="✈" label="Aircraft Availability" value={`${constraints.aircraftAvailable}/${constraints.aircraftTotal}`} level="LOW" />
        <StatusRow icon="⛽" label="Fuel Status" value={constraints.fuelStatus} level={constraints.fuelPercentage > 60 ? 'LOW' : 'HIGH'} />
        <StatusRow icon="👤" label="Pilot Readiness" value={`${constraints.pilotsReady}/${constraints.pilotsTotal}`} level={constraints.pilotsReady < constraints.pilotsTotal ? 'MEDIUM' : 'LOW'} />
        <StatusRow
          icon="🔧"
          label="Maintenance Window"
          value={constraints.maintenanceWindowStart ? `${constraints.maintenanceWindowStart}–${constraints.maintenanceWindowEnd}Z` : 'NONE'}
          level={constraints.maintenanceWindowStart ? 'MEDIUM' : 'LOW'}
        />
        <StatusRow icon="🌧" label={`Weather Ceiling`} value={`${constraints.weatherCeilingFt}ft / ${constraints.weatherVismKm}km`} level={constraints.weatherCeilingFt < 1000 ? 'HIGH' : 'LOW'} />

        {/* Threat environment */}
        <SectionTitle style={{ marginTop: 20 }}>THREAT ENVIRONMENT</SectionTitle>
        <StatusRow icon="📡" label="IADS Coverage NE" value={threats.iadsNECoverage} level={threats.iadsNECoverage} />
        <StatusRow icon="🛰" label={`SAT Overpass (EST)`} value={`+${threats.satOverpass.estimatedMinutes} MIN`} level="MEDIUM" />
        <StatusRow icon="🔭" label="Adversary ISR Patrol" value={threats.isrPatrolActive ? 'ACTIVE' : 'NOT DET'} level={threats.isrPatrolActive ? 'MEDIUM' : 'LOW'} />
        <StatusRow icon="📻" label="ELINT Activity" value={threats.elintActivity} level={threats.elintActivity} />

        {/* Generate button */}
        <button
          onClick={generateRecommendations}
          disabled={isComputing}
          style={{
            width: '100%',
            marginTop: 16,
            padding: '10px 0',
            background: isComputing ? 'rgba(0,200,140,0.08)' : 'transparent',
            border: '1px solid var(--accent)',
            borderRadius: 4,
            color: isComputing ? 'var(--text2)' : 'var(--accent)',
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
            cursor: isComputing ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isComputing ? '▶ COMPUTING...' : '▶ GENERATE RECOMMENDATIONS'}
        </button>
      </div>
    </div>
  )
}

/* ── SUB-COMPONENTS ── */

function PanelHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{
      padding: '10px 14px',
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--border)',
      fontFamily: 'var(--mono)',
      fontSize: 10,
      letterSpacing: '0.12em',
      color: 'var(--accent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <span>{title}</span>
      {sub && <span style={{ color: 'var(--text2)' }}>{sub}</span>}
    </div>
  )
}

function SectionTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      fontFamily: 'var(--mono)',
      fontSize: 10,
      letterSpacing: '0.12em',
      color: 'var(--text2)',
      marginBottom: 8,
      paddingBottom: 6,
      borderBottom: '1px solid var(--border)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function SliderRow({ label, value, onChange }: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', minWidth: 28, textAlign: 'right' }}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
      />
    </div>
  )
}

function StatusRow({ icon, label, value, level }: {
  icon: string
  label: string
  value: string
  level: string
}) {
  const color = threatColor(level)
  const bg = `${color}18`
  const border = `1px solid ${color}40`

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
      <span style={{ fontSize: 13, width: 18 }}>{icon}</span>
      <span style={{ flex: 1, color: 'var(--text)', letterSpacing: '0.02em' }}>{label}</span>
      <span style={{
        fontFamily: 'var(--mono)',
        fontSize: 10,
        padding: '1px 6px',
        borderRadius: 2,
        fontWeight: 700,
        background: bg,
        color,
        border,
      }}>
        {value}
      </span>
    </div>
  )
}
