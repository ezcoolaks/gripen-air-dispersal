import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { generateTimingWindow } from '@/lib/engine'
import { formatZuluShort } from '@/lib/utils'

export function BriefingExport() {
  const { recommendations, metrics, weights, constraints, threats, lastGeneratedAt } = useAppStore()
  const [copied, setCopied] = useState(false)

  const canExport = recommendations.length > 0

  function buildBriefing(): string {
    const now = new Date()
    const top3 = recommendations.slice(0, 3)
    const lines: string[] = []

    lines.push('═══════════════════════════════════════════════════════════════')
    lines.push('   GRIPEN DISPERSAL AI — TACTICAL BRIEFING')
    lines.push(`   Generated: ${formatZuluShort(now)} Z  |  Exercise NORD WIND`)
    lines.push('═══════════════════════════════════════════════════════════════')
    lines.push('')
    lines.push('1. SITUATION')
    lines.push('─────────────────────────────────────────────────────────────')
    lines.push(`   a. AO: Central Sweden`)
    lines.push(`   b. Threat Environment: ${threats.overallLevel}`)
    lines.push(`      - NE IADS Coverage: ${threats.iadsNECoverage}`)
    lines.push(`      - ISR Patrol: ${threats.isrPatrolActive ? 'ACTIVE (90-min cycle)' : 'NOT DETECTED'}`)
    lines.push(`      - Satellite Overpass: T+${threats.satOverpass.estimatedMinutes} MIN (${threats.satOverpass.confidence} conf.)`)
    lines.push(`      - ELINT Activity: ${threats.elintActivity}`)
    lines.push(`   c. Friendly Forces:`)
    lines.push(`      - Aircraft Available: ${constraints.aircraftAvailable}/${constraints.aircraftTotal}`)
    lines.push(`      - Pilots Ready: ${constraints.pilotsReady}/${constraints.pilotsTotal}`)
    lines.push(`      - Fuel: ${constraints.fuelStatus} (${constraints.fuelPercentage}%)`)
    lines.push(`      - Maintenance Window: ${constraints.maintenanceWindowStart ?? 'NONE'}–${constraints.maintenanceWindowEnd ?? ''}`)
    lines.push(`      - Weather: ${constraints.weatherCeilingFt}ft ceiling / ${constraints.weatherVismKm}km visibility`)
    lines.push('')

    lines.push('2. MISSION')
    lines.push('─────────────────────────────────────────────────────────────')
    lines.push(`   Execute dispersal operation to maximize information asymmetry`)
    lines.push(`   advantage over adversary. Maintain operational readiness while`)
    lines.push(`   denying predictable dispersal patterns.`)
    lines.push('')

    lines.push('3. EXECUTION')
    lines.push('─────────────────────────────────────────────────────────────')
    lines.push(`   a. Commander's Intent: Unpredictable dispersal, maintain`)
    lines.push(`      combat readiness, exploit logistics corridors.`)
    lines.push('')
    lines.push(`   b. AI Optimization Metrics:`)
    if (metrics) {
      lines.push(`      - Unpredictability Score: ${metrics.unpredictabilityScore}%`)
      lines.push(`      - Threat Exposure:        ${metrics.threatExposure}%`)
      lines.push(`      - Operational Readiness:  ${metrics.operationalReadiness}%`)
      lines.push(`      - Pattern Risk:           ${metrics.patternRisk}%`)
      lines.push(`      - Information Asymmetry:  ${metrics.informationAsymmetry} / 100`)
    }
    lines.push('')
    lines.push(`   c. Factor Weights Applied:`)
    lines.push(`      - Stealth:     ${weights.stealth}%`)
    lines.push(`      - Logistics:   ${weights.logistics}%`)
    lines.push(`      - Surface:     ${weights.surface}%`)
    lines.push(`      - Redeploy:    ${weights.redeploy}%`)
    lines.push(`      - Entropy:     ${weights.entropy}%`)
    lines.push('')

    lines.push(`   d. Recommended Dispersal Zones (Priority Order):`)
    lines.push('')

    top3.forEach((zone, idx) => {
      const timing = generateTimingWindow(zone)
      lines.push(`   ┌─ OPTION ${idx + 1}: ${zone.name} [SCORE: ${zone.compositeScore}] ─────`)
      lines.push(`   │  Surface:   ${zone.surfaceDescription}`)
      lines.push(`   │  Strip:     ${zone.stripLengthM}m × ${zone.stripWidthM}m (${zone.condition})`)
      lines.push(`   │  Window:    ${timing.earliest} – ${timing.latest} (fuzzy ±${zone.fuzzyOffsetMin} min)`)
      lines.push(`   │  Logistics: ${zone.logisticsRoute}`)
      lines.push(`   │  Fuel Dist: ${zone.fuelDistanceKm} km  |  Mun Dist: ${zone.munitionsDistanceKm} km`)
      lines.push(`   │  FARP:      ${zone.farpAvailable ? 'Pre-positioned' : 'Requires 2hr setup'}`)
      lines.push(`   │  Threat:    ${zone.iadsExposure} IADS / ${zone.isrRisk} ISR (${zone.threatExposure}% exposure)`)
      lines.push(`   │  Entropy:   ${zone.entropyLevel} (${zone.entropyScore}/100)`)
      lines.push(`   │  Rationale: ${zone.rationaleSummary}`)
      if (zone.warnings.length > 0) {
        zone.warnings.forEach(w => lines.push(`   │  ⚠ WARNING: ${w}`))
      }
      lines.push(`   └${'─'.repeat(55)}`)
      lines.push('')
    })

    lines.push('4. SUSTAINMENT')
    lines.push('─────────────────────────────────────────────────────────────')
    lines.push(`   - Primary logistics: E4 corridor`)
    lines.push(`   - Alternate: E18 spur via Frövi`)
    lines.push(`   - FARP pre-positioned at: ${top3.filter(z => z.farpAvailable).map(z => z.shortName).join(', ') || 'None'}`)
    lines.push(`   - Maintenance deconfliction: avoid ${constraints.maintenanceWindowStart}–${constraints.maintenanceWindowEnd}Z`)
    lines.push('')

    lines.push('5. COMMAND & SIGNAL')
    lines.push('─────────────────────────────────────────────────────────────')
    lines.push(`   - Recommended window expires: T+${top3[0]?.timeWindowMinutes[1] ?? '??'} MIN`)
    lines.push(`   - Next AI update cycle: T+30 MIN`)
    lines.push(`   - Pattern deconfliction: re-run engine before repeat use of any zone`)
    lines.push('')
    lines.push('═══════════════════════════════════════════════════════════════')
    lines.push(`   CLASSIFICATION: EXERCISE ONLY — UNCLASSIFIED`)
    lines.push(`   Generated by: GRIPEN DISPERSAL AI v2.4.1 — ${formatZuluShort(now)}Z`)
    lines.push('═══════════════════════════════════════════════════════════════')

    return lines.join('\n')
  }

  function handleCopy() {
    const text = buildBriefing()
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  function handleDownload() {
    const text = buildBriefing()
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gripen-dispersal-briefing-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
      <button
        onClick={handleCopy}
        disabled={!canExport}
        style={{
          flex: 1,
          padding: '7px 0',
          background: copied ? 'rgba(0,200,140,0.12)' : 'transparent',
          border: `1px solid ${copied ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 4,
          color: copied ? 'var(--accent)' : canExport ? 'var(--text2)' : 'rgba(112,144,168,0.3)',
          fontFamily: 'var(--mono)',
          fontSize: 10,
          letterSpacing: '0.08em',
          cursor: canExport ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
        }}
      >
        {copied ? '✓ COPIED' : '⎘ COPY BRIEFING'}
      </button>
      <button
        onClick={handleDownload}
        disabled={!canExport}
        style={{
          flex: 1,
          padding: '7px 0',
          background: 'transparent',
          border: `1px solid ${canExport ? 'var(--border)' : 'rgba(112,144,168,0.15)'}`,
          borderRadius: 4,
          color: canExport ? 'var(--text2)' : 'rgba(112,144,168,0.3)',
          fontFamily: 'var(--mono)',
          fontSize: 10,
          letterSpacing: '0.08em',
          cursor: canExport ? 'pointer' : 'not-allowed',
        }}
      >
        ↓ DOWNLOAD .TXT
      </button>
    </div>
  )
}
