import { TopBar } from '@/components/TopBar'
import { ParametersPanel } from '@/components/ParametersPanel'
import { TacticalMap } from '@/components/TacticalMap'
import { RecommendationsPanel } from '@/components/RecommendationsPanel'

export default function App() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg)',
    }}>
      <TopBar />
      <div style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr 340px',
          minWidth: 900,
          height: '100%',
          minHeight: 0,
        }}>
          <ParametersPanel />
          <TacticalMap />
          <RecommendationsPanel />
        </div>
      </div>
    </div>
  )
}
