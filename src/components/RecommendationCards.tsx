import type { DisposalZone } from '@/types'
import { useAppStore } from '@/lib/store'
import { scoreColor, entropyColor, threatColor } from '@/lib/utils'

const RANK_COLORS = ['#00c88c', '#00a8f0', '#7090a8']

export function RecommendationCards() {
  const { recommendations, selectedZoneId, selectZone, phase } = useAppStore()

  if (phase === 'STANDBY' || phase === 'PLANNING') {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text2)', fontFamily: 'var(--mono)', fontSize: 11 }}>
        AWAITING PARAMETER INPUT<br />
        <span style={{ color: 'rgba(112,144,168,0.5)', marginTop: 6, display: 'block' }}>
          Set weights and press GENERATE
        </span>
      </div>
    )
  }

  if (phase === 'COMPUTING') {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', marginBottom: 12 }}>
          COMPUTING OPTIMAL DISPERSAL...
        </div>
        <LoadingBar />
      </div>
    )
  }

  const top3 = recommendations.slice(0, 3)

  return (
    <div>
      {top3.map((zone, idx) => (
        <RecCard
          key={zone.id}
          zone={zone}
          rank={idx}
          isSelected={selectedZoneId === zone.id}
          color={RANK_COLORS[idx] ?? '#7090a8'}
          onClick={() => selectZone(zone.id)}
        />
      ))}
    </div>
  )
}

function RecCard({
  zone,
  rank,
  isSelected,
  color,
  onClick,
}: {
  zone: DisposalZone
  rank: number
  isSelected: boolean
  color: string
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className="fadein"
      style={{
        background: 'var(--bg2)',
        border: `1px solid ${isSelected ? color : 'var(--border)'}`,
        borderRadius: 4,
        marginBottom: 8,
        cursor: 'pointer',
        transition: 'border-color 0.2s',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 10px',
        background: `${color}0d`,
        borderBottom: `1px solid ${color}22`,
      }}>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          background: color,
          color: '#0a0d12',
          padding: '1px 5px',
          borderRadius: 2,
          fontWeight: 700,
        }}>
          #{rank + 1}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', flex: 1, color: 'var(--text)' }}>
          {zone.name}
        </span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color }}>
          {zone.compositeScore}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '8px 10px' }}>
        <DataRow label="TYPE" value={zone.surfaceDescription} />
        <DataRow label="STRIP" value={`${zone.stripLengthM}m × ${zone.stripWidthM}m (${zone.condition})`} />
        <DataRow label="WINDOW" value={`${zone.timeWindowOpen} → ${zone.timeWindowClose}`} valueColor="var(--warn)" />
        <DataRow label="FUZZY ±" value={`${zone.fuzzyOffsetMin} MIN`} valueColor="var(--accent)" />
        <DataRow label="LOGISTICS" value={zone.logisticsRoute} />
        <DataRow
          label="THREAT EXP"
          value={`${zone.threatExposure}%`}
          valueColor={threatColor(zone.iadsExposure)}
        />
        <DataRow
          label="ENTROPY"
          value={`${zone.entropyLevel} (${zone.entropyScore})`}
          valueColor={entropyColor(zone.entropyLevel)}
        />
        {zone.farpAvailable && (
          <DataRow label="FARP" value="PRE-POSITIONED" valueColor="var(--accent)" />
        )}

        {/* Mini score bars */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', marginTop: 8, marginBottom: 8 }}>
          {Object.entries(zone.scores).map(([k, v]) => (
            <MiniBar key={k} label={k.toUpperCase()} value={k === 'threat' ? 100 - v : v} />
          ))}
        </div>

        {/* Rationale */}
        <div style={{
          padding: '6px 8px',
          background: `${color}08`,
          borderLeft: `2px solid ${color}`,
          borderRadius: '0 2px 2px 0',
          fontSize: 11,
          color: 'var(--text2)',
          lineHeight: 1.55,
          marginBottom: zone.warnings.length > 0 ? 8 : 0,
        }}>
          <strong style={{ color, fontWeight: 600 }}>Recommended because:</strong> {zone.rationaleDetail}
        </div>

        {/* Warnings */}
        {zone.warnings.map((w) => (
          <div key={w} style={{
            marginTop: 4,
            padding: '4px 8px',
            background: 'rgba(240,168,0,0.06)',
            borderLeft: '2px solid var(--warn)',
            borderRadius: '0 2px 2px 0',
            fontSize: 11,
            color: 'var(--warn)',
          }}>
            ⚠ {w}
          </div>
        ))}

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
          {zone.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                fontFamily: 'var(--mono)',
                padding: '2px 6px',
                borderRadius: 2,
                background: `${color}12`,
                color,
                border: `1px solid ${color}30`,
                letterSpacing: '0.06em',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function DataRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 11 }}>
      <span style={{ color: 'var(--text2)', letterSpacing: '0.04em' }}>{label}</span>
      <span style={{ fontFamily: 'var(--mono)', color: valueColor ?? 'var(--text)', fontSize: 10 }}>{value}</span>
    </div>
  )
}

function MiniBar({ label, value }: { label: string; value: number }) {
  const color = scoreColor(value)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{label}</span>
        <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color }}>{value}</span>
      </div>
      <div style={{ height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 1 }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 1, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

function LoadingBar() {
  return (
    <div style={{ height: 2, background: 'rgba(0,200,140,0.1)', borderRadius: 1, overflow: 'hidden', width: '80%', margin: '0 auto' }}>
      <div style={{
        height: '100%',
        background: 'var(--accent)',
        borderRadius: 1,
        animation: 'loadbar 1.2s ease-in-out infinite',
      }} />
      <style>{`@keyframes loadbar{0%{width:0%;margin-left:0}50%{width:60%;margin-left:20%}100%{width:0%;margin-left:100%}}`}</style>
    </div>
  )
}
