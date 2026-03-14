import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import type { FactorWeights } from '@/types'
import { whatIfAnalysis } from '@/lib/engine'

const WEIGHT_KEYS: { key: keyof FactorWeights; label: string }[] = [
  { key: 'stealth',   label: 'Stealth' },
  { key: 'logistics', label: 'Logistics' },
  { key: 'surface',   label: 'Surface' },
  { key: 'redeploy',  label: 'Redeploy' },
  { key: 'entropy',   label: 'Entropy' },
]

export function WhatIfPanel() {
  const { weights, recommendations } = useAppStore()
  const [modWeights, setModWeights] = useState<FactorWeights>({ ...weights })

  // Reset when base weights change
  useEffect(() => { setModWeights({ ...weights }) }, [weights])

  const hasRecs = recommendations.length > 0
  const results = hasRecs
    ? whatIfAnalysis(weights, modWeights, recommendations)
    : []

  const isDirty = WEIGHT_KEYS.some(({ key }) => modWeights[key] !== weights[key])

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: 10,
        letterSpacing: '0.12em',
        color: 'var(--text2)',
        marginBottom: 8,
        paddingBottom: 6,
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span>WHAT-IF ANALYSIS</span>
        {isDirty && (
          <button
            onClick={() => setModWeights({ ...weights })}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 2,
              color: 'var(--text2)',
              fontFamily: 'var(--mono)',
              fontSize: 9,
              padding: '1px 6px',
              cursor: 'pointer',
              letterSpacing: '0.06em',
            }}
          >
            RESET
          </button>
        )}
      </div>

      {/* Modified weight sliders */}
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 4,
        padding: '10px 12px',
        marginBottom: 8,
      }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text2)', marginBottom: 8, letterSpacing: '0.08em' }}>
          HYPOTHETICAL WEIGHTS
        </div>
        {WEIGHT_KEYS.map(({ key, label }) => (
          <div key={key} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: 'var(--text2)' }}>{label}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text2)' }}>
                  {weights[key]}
                </span>
                <span style={{ color: 'var(--border)', fontSize: 10 }}>→</span>
                <span style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  color: modWeights[key] !== weights[key] ? 'var(--warn)' : 'var(--accent)',
                  minWidth: 24,
                  textAlign: 'right',
                }}>
                  {modWeights[key]}
                </span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={modWeights[key]}
              onChange={(e) => setModWeights(w => ({ ...w, [key]: parseInt(e.target.value) }))}
            />
          </div>
        ))}
      </div>

      {/* Delta results */}
      {!hasRecs ? (
        <div style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--mono)', textAlign: 'center', padding: '12px 0' }}>
          Generate recommendations first
        </div>
      ) : (
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text2)', marginBottom: 6, letterSpacing: '0.08em' }}>
            SCORE IMPACT (TOP 5 ZONES)
          </div>
          {results.map((r) => {
            const deltaColor = r.delta > 5 ? 'var(--accent)' : r.delta < -5 ? 'var(--danger)' : 'var(--warn)'
            const deltaSign = r.delta > 0 ? '+' : ''
            return (
              <div key={r.zoneId} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 8px',
                marginBottom: 4,
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                fontSize: 11,
              }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text2)', width: 64, flexShrink: 0 }}>
                  {r.zoneName}
                </span>
                <div style={{ flex: 1, position: 'relative', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                  <div style={{
                    position: 'absolute',
                    left: `${r.baseScore}%`,
                    top: 0,
                    width: 2,
                    height: 4,
                    background: 'var(--text2)',
                    borderRadius: 1,
                  }} />
                  <div style={{
                    position: 'absolute',
                    left: `${Math.min(r.baseScore, r.adjustedScore)}%`,
                    width: `${Math.abs(r.delta)}%`,
                    height: 4,
                    background: deltaColor,
                    borderRadius: 2,
                    opacity: 0.6,
                  }} />
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: deltaColor, width: 32, textAlign: 'right', flexShrink: 0 }}>
                  {deltaSign}{r.delta}
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text2)', width: 50, textAlign: 'right', flexShrink: 0 }}>
                  {r.keyDriver}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
