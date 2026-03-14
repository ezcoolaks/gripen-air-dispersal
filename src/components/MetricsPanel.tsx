import { useAppStore } from '@/lib/store'
import { AsymmetryGauge } from './AsymmetryGauge'

function MetricCard({ label, value, barColor, invert = false }: {
  label: string; value: number | null; barColor: string; invert?: boolean
}) {
  const pct = value ?? 0
  const color = value === null ? 'var(--text2)'
    : invert ? (pct > 60 ? '#e04040' : pct > 30 ? '#f0a800' : '#00c88c')
    : (pct >= 70 ? '#00c88c' : pct >= 40 ? '#f0a800' : '#e04040')

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '7px 8px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--text2)', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, color, fontFamily: 'var(--mono)', transition: 'color 0.4s' }}>
        {value === null ? '--' : `${value}%`}
      </div>
      <div style={{ height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 1, marginTop: 4 }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 1, background: barColor, transition: 'width 0.7s ease' }} />
      </div>
    </div>
  )
}

export function MetricsPanel() {
  const { metrics } = useAppStore()

  return (
    <div style={{ marginBottom: 10 }}>
      {/* 2×2 KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 8 }}>
        <MetricCard label="UNPREDICTABILITY" value={metrics?.unpredictabilityScore ?? null} barColor="var(--accent)" />
        <MetricCard label="THREAT EXPOSURE"  value={metrics?.threatExposure ?? null}        barColor="var(--danger)" invert />
        <MetricCard label="OPS READINESS"    value={metrics?.operationalReadiness ?? null}  barColor="var(--blue)" />
        <MetricCard label="PATTERN RISK"     value={metrics?.patternRisk ?? null}           barColor="var(--warn)" invert />
      </div>

      {/* Gauge — smaller size to save vertical space */}
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em',
        color: 'var(--text2)', marginBottom: 4, paddingBottom: 4,
        borderBottom: '1px solid var(--border)',
      }}>
        INFO ASYMMETRY SCORE
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
        <AsymmetryGauge value={metrics?.informationAsymmetry ?? 0} size={150} />
      </div>
      <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 8 }} />
    </div>
  )
}
