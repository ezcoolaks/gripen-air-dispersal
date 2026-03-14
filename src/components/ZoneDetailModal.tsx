import { useAppStore } from '@/lib/store'
import { scoreColor, threatColor, entropyColor } from '@/lib/utils'
import { generateTimingWindow } from '@/lib/engine'
import type { DisposalZone } from '@/types'

export function ZoneDetailModal() {
  const { recommendations, selectedZoneId, selectZone } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)

  const zone = recommendations.find((z) => z.id === selectedZoneId)

  if (!zone || !isOpen) {
    return (
      <button
        onClick={() => zone && setIsOpen(true)}
        disabled={!zone}
        style={{
          width: '100%',
          marginTop: 8,
          padding: '7px 0',
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: 4,
          color: zone ? 'var(--text2)' : 'rgba(112,144,168,0.3)',
          fontFamily: 'var(--mono)',
          fontSize: 10,
          letterSpacing: '0.08em',
          cursor: zone ? 'pointer' : 'not-allowed',
        }}
      >
        ◉ ZONE DETAIL REPORT
      </button>
    )
  }

  return <Modal zone={zone} onClose={() => setIsOpen(false)} />
}

import { useState } from 'react'

function Modal({ zone, onClose }: { zone: DisposalZone; onClose: () => void }) {
  const timing = generateTimingWindow(zone)
  const RANK_COLORS = ['#00c88c', '#00a8f0', '#7090a8', '#888', '#666']
  const color = RANK_COLORS[zone.rank - 1] ?? '#7090a8'

  // Radar chart data (pentagon) for 5 dimensions
  const dims = [
    { label: 'Surface', value: zone.scores.surface },
    { label: 'Logistics', value: zone.scores.logistics },
    { label: 'Stealth', value: 100 - zone.scores.threat },
    { label: 'Flexibility', value: zone.scores.flexibility },
    { label: 'Entropy', value: zone.entropyScore },
  ]

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{
        background: 'var(--panel)',
        border: `1px solid ${color}`,
        borderRadius: 6,
        width: '100%',
        maxWidth: 720,
        maxHeight: '90vh',
        overflowY: 'auto',
        fontFamily: 'var(--sans)',
      }}>
        {/* Header */}
        <div style={{
          padding: '12px 16px',
          background: `${color}12`,
          borderBottom: `1px solid ${color}30`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, background: color, color: '#0a0d12', padding: '2px 7px', borderRadius: 2, fontWeight: 700 }}>
            RANK #{zone.rank}
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.06em', flex: 1, color: 'var(--text)' }}>
            {zone.name}
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, color }}>{zone.compositeScore}</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 18, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Left column */}
          <div>
            <Section title="SURFACE & INFRASTRUCTURE">
              <Row label="Type" value={zone.surfaceType.toUpperCase()} />
              <Row label="Description" value={zone.surfaceDescription} />
              <Row label="Strip Length" value={`${zone.stripLengthM} m`} />
              <Row label="Strip Width" value={`${zone.stripWidthM} m`} />
              <Row label="Condition" value={zone.condition} valueColor={zone.condition === 'EXCELLENT' ? 'var(--accent)' : zone.condition === 'GOOD' ? 'var(--blue)' : 'var(--warn)'} />
            </Section>

            <Section title="TIMING WINDOW" style={{ marginTop: 14 }}>
              <Row label="Nominal Departure" value={timing.nominal} valueColor="var(--warn)" />
              <Row label="Earliest" value={timing.earliest} />
              <Row label="Latest" value={timing.latest} />
              <Row label="Fuzzy Jitter" value={`±${zone.fuzzyOffsetMin} min`} valueColor="var(--accent)" />
              <div style={{ marginTop: 8, padding: '6px 8px', background: 'rgba(0,200,140,0.05)', borderLeft: '2px solid var(--accent)', borderRadius: '0 2px 2px 0', fontSize: 11, color: 'var(--text2)', lineHeight: 1.5 }}>
                {timing.rationale}
              </div>
            </Section>

            <Section title="LOGISTICS" style={{ marginTop: 14 }}>
              <Row label="Route" value={zone.logisticsRoute} />
              <Row label="Fuel Distance" value={`${zone.fuelDistanceKm} km`} />
              <Row label="Munitions Distance" value={`${zone.munitionsDistanceKm} km`} />
              <Row label="FARP Status" value={zone.farpAvailable ? 'PRE-POSITIONED ✓' : 'REQUIRES SETUP'} valueColor={zone.farpAvailable ? 'var(--accent)' : 'var(--warn)'} />
            </Section>
          </div>

          {/* Right column */}
          <div>
            <Section title="THREAT ASSESSMENT">
              <Row label="IADS Exposure" value={zone.iadsExposure} valueColor={threatColor(zone.iadsExposure)} />
              <Row label="ISR Risk" value={zone.isrRisk} valueColor={threatColor(zone.isrRisk)} />
              <Row label="Threat Exposure" value={`${zone.threatExposure}%`} valueColor={threatColor(zone.threatExposure > 30 ? 'HIGH' : zone.threatExposure > 15 ? 'MEDIUM' : 'LOW')} />
            </Section>

            <Section title="UNPREDICTABILITY" style={{ marginTop: 14 }}>
              <Row label="Entropy Score" value={`${zone.entropyScore} / 100`} valueColor={entropyColor(zone.entropyLevel)} />
              <Row label="Level" value={zone.entropyLevel} valueColor={entropyColor(zone.entropyLevel)} />
              <Row label="Last Used" value={zone.lastUsedHoursAgo !== null ? `${zone.lastUsedHoursAgo}h ago` : 'NEVER'} valueColor={zone.lastUsedHoursAgo === null ? 'var(--accent)' : undefined} />
              <Row label="Historical Uses" value={`${zone.historicalUseCount}×`} />
            </Section>

            {/* Pentagon chart */}
            <Section title="DIMENSION RADAR" style={{ marginTop: 14 }}>
              <PentagonChart dims={dims} color={color} />
            </Section>
          </div>
        </div>

        {/* Full rationale */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text2)', marginBottom: 8 }}>
            TACTICAL RATIONALE
          </div>
          <div style={{
            padding: '10px 12px',
            background: `${color}08`,
            borderLeft: `2px solid ${color}`,
            borderRadius: '0 4px 4px 0',
            fontSize: 12,
            color: 'var(--text)',
            lineHeight: 1.65,
          }}>
            {zone.rationaleDetail}
          </div>

          {zone.warnings.length > 0 && (
            <div style={{ marginTop: 10 }}>
              {zone.warnings.map((w) => (
                <div key={w} style={{ padding: '6px 10px', background: 'rgba(240,168,0,0.06)', borderLeft: '2px solid var(--warn)', borderRadius: '0 4px 4px 0', marginBottom: 4, fontSize: 12, color: 'var(--warn)' }}>
                  ⚠ {w}
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 12 }}>
            {zone.tags.map((tag) => (
              <span key={tag} style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 8px', borderRadius: 2, background: `${color}12`, color, border: `1px solid ${color}30`, letterSpacing: '0.06em' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children, style }: { title: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--text2)', marginBottom: 6, paddingBottom: 4, borderBottom: '1px solid var(--border)' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
      <span style={{ color: 'var(--text2)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: valueColor ?? 'var(--text)', textAlign: 'right', maxWidth: '55%' }}>{value}</span>
    </div>
  )
}

function PentagonChart({ dims, color }: { dims: { label: string; value: number }[]; color: string }) {
  const size = 140
  const cx = size / 2
  const cy = size / 2
  const r = 52

  function polarPt(i: number, scale: number): [number, number] {
    const angle = (i / dims.length) * 2 * Math.PI - Math.PI / 2
    return [
      cx + r * scale * Math.cos(angle),
      cy + r * scale * Math.sin(angle),
    ]
  }

  // Web lines
  const webLevels = [0.25, 0.5, 0.75, 1.0]

  const dataPts = dims.map((d, i) => polarPt(i, d.value / 100))
  const dataPath = dataPts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ') + ' Z'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
      {/* Web */}
      {webLevels.map((lvl) => {
        const pts = dims.map((_, i) => polarPt(i, lvl))
        const path = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ') + ' Z'
        return <path key={lvl} d={path} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />
      })}

      {/* Spokes */}
      {dims.map((_, i) => {
        const [x, y] = polarPt(i, 1)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />
      })}

      {/* Data polygon */}
      <path d={dataPath} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={1.5} />

      {/* Data points */}
      {dataPts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill={color} />
      ))}

      {/* Labels */}
      {dims.map((d, i) => {
        const [x, y] = polarPt(i, 1.28)
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'Share Tech Mono', monospace"
            fontSize={8}
            fill="var(--text2)"
          >
            {d.label}
          </text>
        )
      })}
    </svg>
  )
}
