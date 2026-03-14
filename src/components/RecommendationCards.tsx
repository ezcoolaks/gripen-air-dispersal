import type { DisposalZone } from '@/types'
import { useAppStore } from '@/lib/store'
import { scoreColor, entropyColor, threatColor } from '@/lib/utils'

const RANK_COLORS = ['#00c88c', '#00a8f0', '#7090a8']

export function RecommendationCards() {
  const { recommendations, selectedZoneId, selectZone, phase } = useAppStore()

  if (phase === 'STANDBY' || phase === 'PLANNING') {
    return (
      <div style={{ textAlign: 'center', padding: '20px 8px', color: 'var(--text2)', fontFamily: 'var(--mono)', fontSize: 10 }}>
        AWAITING PARAMETER INPUT<br />
        <span style={{ color: 'rgba(112,144,168,0.5)', marginTop: 4, display: 'block' }}>
          Set weights and press GENERATE
        </span>
      </div>
    )
  }

  if (phase === 'COMPUTING') {
    return (
      <div style={{ textAlign: 'center', padding: '20px 8px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>
          COMPUTING...
        </div>
        <LoadingBar />
      </div>
    )
  }

  return (
    <div>
      {recommendations.slice(0, 3).map((zone, idx) => (
        <CompactRecCard
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

function CompactRecCard({ zone, rank, isSelected, color, onClick }: {
  zone: DisposalZone; rank: number; isSelected: boolean; color: string; onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className="fadein"
      style={{
        background: 'var(--bg2)',
        border: `1px solid ${isSelected ? color : 'var(--border)'}`,
        borderRadius: 4, marginBottom: 6, cursor: 'pointer',
        transition: 'border-color 0.2s', overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 8px', background: `${color}0d`,
        borderBottom: `1px solid ${color}20`,
      }}>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: 11, background: color,
          color: '#0a0d12', padding: '1px 5px', borderRadius: 2, fontWeight: 700, flexShrink: 0,
        }}>#{rank + 1}</span>
        <span style={{ fontSize: 13, fontWeight: 600, flex: 1, color: 'var(--text)', letterSpacing: '0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {zone.shortName}
        </span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color, flexShrink: 0 }}>
          {zone.compositeScore}
        </span>
      </div>

      {/* 2-col stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, padding: '6px 8px 4px' }}>
        <StatCell label="Surface" value={`${zone.stripLengthM}m`} />
        <StatCell label="Window" value={zone.timeWindowOpen} valueColor="var(--warn)" />
        <StatCell label="Threat" value={`${zone.threatExposure}%`} valueColor={threatColor(zone.iadsExposure)} />
        <StatCell label="Entropy" value={zone.entropyLevel} valueColor={entropyColor(zone.entropyLevel)} />
      </div>

      {/* Rationale — single short line */}
      <div style={{
        margin: '0 8px 6px',
        padding: '4px 6px',
        background: `${color}08`,
        borderLeft: `2px solid ${color}`,
        borderRadius: '0 2px 2px 0',
        fontSize: 13,
        color: 'var(--text2)',
        lineHeight: 1.4,
      }}>
        {zone.rationaleSummary}
      </div>

      {/* Warnings — compact */}
      {zone.warnings.map((w) => (
        <div key={w} style={{
          margin: '0 8px 4px',
          fontSize: 13, color: 'var(--warn)',
          paddingLeft: 6, borderLeft: '2px solid var(--warn)',
        }}>
          ⚠ {w}
        </div>
      ))}

      {/* Tags — small pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, padding: '0 8px 6px' }}>
        {zone.tags.slice(0, 4).map((tag) => (
          <span key={tag} style={{
            fontSize: 11, fontFamily: 'var(--mono)', padding: '1px 5px',
            borderRadius: 2, background: `${color}10`, color,
            border: `1px solid ${color}25`, letterSpacing: '0.04em',
          }}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function StatCell({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text2)', marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: 13, fontFamily: 'var(--mono)', color: valueColor ?? 'var(--text)' }}>{value}</div>
    </div>
  )
}

function LoadingBar() {
  return (
    <div style={{ height: 2, background: 'rgba(0,200,140,0.1)', borderRadius: 1, overflow: 'hidden', width: '80%', margin: '0 auto' }}>
      <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 1, animation: 'loadbar 1.2s ease-in-out infinite' }} />
      <style>{`@keyframes loadbar{0%{width:0%;margin-left:0}50%{width:60%;margin-left:20%}100%{width:0%;margin-left:100%}}`}</style>
    </div>
  )
}
