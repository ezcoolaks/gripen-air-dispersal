import { useAppStore } from '@/lib/store'
import { MetricsPanel } from './MetricsPanel'
import { RecommendationCards } from './RecommendationCards'
import { AIAdvisorPanel } from './AIAdvisorPanel'
import { HistoryLog } from './HistoryLog'
import { SatelliteCountdown } from './SatelliteCountdown'
import { ZoneDetailModal } from './ZoneDetailModal'
import { formatZuluShort } from '@/lib/utils'

export function RecommendationsPanel() {
  const { lastGeneratedAt } = useAppStore()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minWidth: 0,
      overflow: 'hidden',
      background: 'var(--panel)',
      borderLeft: '1px solid var(--border)',
    }}>
      {/* Panel header */}
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
        <span>◈ AI RECOMMENDATIONS</span>
        <span style={{ color: 'var(--text2)' }}>
          {lastGeneratedAt ? formatZuluShort(lastGeneratedAt) : '--:--Z'}
        </span>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        <SatelliteCountdown />
        <MetricsPanel />

        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          letterSpacing: '0.12em',
          color: 'var(--text2)',
          marginBottom: 8,
        }}>
          TOP DISPERSAL RECOMMENDATIONS
        </div>

        <RecommendationCards />
        <ZoneDetailModal />
        <HistoryLog />
      </div>

      {/* AI advisor pinned to bottom */}
      <AIAdvisorPanel />
    </div>
  )
}
