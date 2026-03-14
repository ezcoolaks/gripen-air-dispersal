import { useAppStore } from '@/lib/store'
import { AsymmetryGauge } from './AsymmetryGauge'

interface MetricCardProps {
  label: string
  value: number | null
  suffix?: string
  barColor: string
  invert?: boolean // if true, high value is bad (used for threat/pattern)
}

function MetricCard({ label, value, suffix = '%', barColor, invert = false }: MetricCardProps) {
  const display = value === null ? '--' : `${value}${suffix}`
  const pct = value ?? 0

  const color =
    value === null
      ? 'var(--text2)'
      : invert
      ? pct > 60
        ? '#e04040'
        : pct > 30
        ? '#f0a800'
        : '#00c88c'
      : pct >= 70
      ? '#00c88c'
      : pct >= 40
      ? '#f0a800'
      : '#e04040'

  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 4,
      padding: '10px 12px',
    }}>
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: 9,
        letterSpacing: '0.1em',
        color: 'var(--text2)',
        marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 22,
        fontWeight: 700,
        lineHeight: 1,
        color,
        transition: 'color 0.4s',
        fontFamily: 'var(--mono)',
      }}>
        {display}
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, marginTop: 6 }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: 2,
          background: barColor,
          transition: 'width 0.7s ease',
        }} />
      </div>
    </div>
  )
}

export function MetricsPanel() {
  const { metrics } = useAppStore()

  return (
    <div>
      {/* 2×2 grid of KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <MetricCard
          label="UNPREDICTABILITY"
          value={metrics?.unpredictabilityScore ?? null}
          barColor="var(--accent)"
        />
        <MetricCard
          label="THREAT EXPOSURE"
          value={metrics?.threatExposure ?? null}
          barColor="var(--danger)"
          invert
        />
        <MetricCard
          label="OPS READINESS"
          value={metrics?.operationalReadiness ?? null}
          barColor="var(--blue)"
        />
        <MetricCard
          label="PATTERN RISK"
          value={metrics?.patternRisk ?? null}
          barColor="var(--warn)"
          invert
        />
      </div>

      {/* Information asymmetry gauge */}
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: 10,
        letterSpacing: '0.12em',
        color: 'var(--text2)',
        marginBottom: 8,
        paddingBottom: 6,
        borderBottom: '1px solid var(--border)',
      }}>
        INFORMATION ASYMMETRY SCORE
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
        <AsymmetryGauge value={metrics?.informationAsymmetry ?? 0} size={200} />
      </div>
    </div>
  )
}
