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

      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 340px',
        flex: 1,
        overflow: 'hidden',
      }}>
        <ParametersPanel />
        <TacticalMap />
        <RecommendationsPanel />
      </div>
    </div>
  )
}
