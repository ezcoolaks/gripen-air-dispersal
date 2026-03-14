import { useAppStore } from '@/lib/store'
import type { FactorWeights } from '@/types'
import { threatColor } from '@/lib/utils'
import { BriefingExport } from './BriefingExport'
import { WhatIfPanel } from './WhatIfPanel'

const WEIGHT_KEYS: { key: keyof FactorWeights; label: string }[] = [
  { key: 'stealth',   label: 'Stealth' },
  { key: 'logistics', label: 'Logistics' },
  { key: 'surface',   label: 'Surface' },
  { key: 'redeploy',  label: 'Redeploy' },
  { key: 'entropy',   label: 'Entropy' },
]

export function ParametersPanel() {
  const { weights, setWeight, constraints, threats, generateRecommendations, phase } = useAppStore()
  const isComputing = phase === 'COMPUTING'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      minWidth: 0, overflow: 'hidden',
      background: 'var(--panel)', borderRight: '1px solid var(--border)',
    }}>
      <PanelHeader title="◈ PARAMETERS" sub="v2.4.1" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>

        <SectionTitle>FACTOR WEIGHTS</SectionTitle>
        {WEIGHT_KEYS.map(({ key, label }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)', width: 74, flexShrink: 0 }}>{label}</span>
            <input
              type="range" min={0} max={100} value={weights[key]}
              onChange={(e) => setWeight(key, parseInt(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--accent)', width: 24, textAlign: 'right', flexShrink: 0 }}>
              {weights[key]}
            </span>
          </div>
        ))}

        <SectionTitle style={{ marginTop: 14 }}>CONSTRAINTS</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 4 }}>
          <MiniStat label="Aircraft" value={`${constraints.aircraftAvailable}/${constraints.aircraftTotal}`} level="LOW" />
          <MiniStat label="Fuel" value={constraints.fuelStatus} level={constraints.fuelPercentage > 60 ? 'LOW' : 'HIGH'} />
          <MiniStat label="Pilots" value={`${constraints.pilotsReady}/${constraints.pilotsTotal}`} level={constraints.pilotsReady < constraints.pilotsTotal ? 'MEDIUM' : 'LOW'} />
          <MiniStat label="Wx ceiling" value={`${constraints.weatherCeilingFt}ft`} level={constraints.weatherCeilingFt < 1000 ? 'HIGH' : 'LOW'} />
        </div>
        {constraints.maintenanceWindowStart && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '4px 8px', background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 4, marginBottom: 4, fontSize: 13,
          }}>
            <span style={{ color: 'var(--text2)', fontSize: 10 }}>Maint. window</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--warn)' }}>
              {constraints.maintenanceWindowStart}–{constraints.maintenanceWindowEnd}Z
            </span>
          </div>
        )}

        <SectionTitle style={{ marginTop: 14 }}>THREATS</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          <MiniStat label="IADS NE" value={threats.iadsNECoverage} level={threats.iadsNECoverage} />
          <MiniStat label="SAT overpass" value={`+${threats.satOverpass.estimatedMinutes}m`} level="MEDIUM" />
          <MiniStat label="ISR patrol" value={threats.isrPatrolActive ? 'ACTIVE' : 'CLEAR'} level={threats.isrPatrolActive ? 'MEDIUM' : 'LOW'} />
          <MiniStat label="ELINT" value={threats.elintActivity} level={threats.elintActivity} />
        </div>

        <button
          onClick={generateRecommendations}
          disabled={isComputing}
          style={{
            width: '100%', marginTop: 14, padding: '9px 0',
            background: isComputing ? 'rgba(0,200,140,0.08)' : 'transparent',
            border: '1px solid var(--accent)', borderRadius: 4,
            color: isComputing ? 'var(--text2)' : 'var(--accent)',
            fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '0.1em',
            cursor: isComputing ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
          }}
        >
          {isComputing ? '▶ COMPUTING...' : '▶ GENERATE'}
        </button>

        <BriefingExport />
        <WhatIfPanel />
      </div>
    </div>
  )
}

function PanelHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{
      padding: '9px 12px', background: 'var(--bg2)',
      borderBottom: '1px solid var(--border)',
      fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.12em',
      color: 'var(--accent)', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', flexShrink: 0,
    }}>
      <span>{title}</span>
      {sub && <span style={{ color: 'var(--text2)' }}>{sub}</span>}
    </div>
  )
}

function SectionTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '0.12em',
      color: 'var(--text2)', marginBottom: 6, paddingBottom: 4,
      borderBottom: '1px solid var(--border)', ...style,
    }}>
      {children}
    </div>
  )
}

function MiniStat({ label, value, level }: { label: string; value: string; level: string }) {
  const color = threatColor(level)
  return (
    <div style={{
      padding: '5px 7px', background: 'var(--bg2)',
      border: '1px solid var(--border)', borderRadius: 4,
    }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text2)', marginBottom: 2, letterSpacing: '0.05em' }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color }}>
        {value}
      </div>
    </div>
  )
}
