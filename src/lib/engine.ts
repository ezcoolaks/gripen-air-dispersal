import type { DisposalZone, FactorWeights, SystemMetrics, OperationalConstraints, ThreatEnvironment } from '@/types'
import { ZONE_CATALOG } from '@/data/scenario'

// ── SCORING ENGINE ────────────────────────────────────────────────────────────

/**
 * Normalise factor weights to sum to 1.0
 */
function normaliseWeights(w: FactorWeights): Record<keyof FactorWeights, number> {
  const total = w.stealth + w.logistics + w.surface + w.redeploy + w.entropy
  if (total === 0) return { stealth: 0.2, logistics: 0.2, surface: 0.2, redeploy: 0.2, entropy: 0.2 }
  return {
    stealth: w.stealth / total,
    logistics: w.logistics / total,
    surface: w.surface / total,
    redeploy: w.redeploy / total,
    entropy: w.entropy / total,
  }
}

/**
 * Compute composite score for a zone given operator weights.
 * Returns 0-100.
 */
function scoreZone(zone: DisposalZone, nw: Record<keyof FactorWeights, number>): number {
  const stealthScore = 100 - zone.scores.threat   // invert: lower threat = higher stealth score
  const logisticsScore = zone.scores.logistics
  const surfaceScore = zone.scores.surface
  const redeployScore = zone.scores.flexibility
  const entropyScore = zone.entropyScore

  const composite =
    stealthScore * nw.stealth +
    logisticsScore * nw.logistics +
    surfaceScore * nw.surface +
    redeployScore * nw.redeploy +
    entropyScore * nw.entropy

  return Math.round(composite)
}

/**
 * Apply entropy / unpredictability modifiers.
 * Zones not used recently get a bonus; zones with high historical use get a penalty.
 */
function applyEntropyModifier(zone: DisposalZone, entropyWeight: number): number {
  let modifier = 0

  // Novelty bonus: never used
  if (zone.lastUsedHoursAgo === null) modifier += 8
  // Recency bonus: not used in 5+ days
  else if (zone.lastUsedHoursAgo > 120) modifier += 5
  // Recent use penalty
  else if (zone.lastUsedHoursAgo < 24) modifier -= 10
  else if (zone.lastUsedHoursAgo < 48) modifier -= 5

  // Historical use frequency penalty
  if (zone.historicalUseCount > 6) modifier -= 8
  else if (zone.historicalUseCount > 3) modifier -= 3

  // Scale modifier by entropy weight importance
  return Math.round(modifier * (entropyWeight / 100))
}

/**
 * Main recommendation engine.
 * Returns sorted, scored zones with rank assigned.
 */
export function computeRecommendations(
  weights: FactorWeights,
  _constraints: OperationalConstraints,
  _threats: ThreatEnvironment
): DisposalZone[] {
  const nw = normaliseWeights(weights)

  const scored: DisposalZone[] = ZONE_CATALOG.map((zone) => {
    const base = scoreZone(zone, nw)
    const entropyMod = applyEntropyModifier(zone, weights.entropy)
    const compositeScore = Math.max(0, Math.min(100, base + entropyMod))
    return { ...zone, compositeScore }
  })

  // Sort descending by composite score
  scored.sort((a, b) => b.compositeScore - a.compositeScore)

  // Assign ranks
  return scored.map((z, i) => ({ ...z, rank: i + 1 }))
}

// ── METRICS ENGINE ────────────────────────────────────────────────────────────

/**
 * Compute overall system metrics from top recommendations and context.
 */
export function computeMetrics(
  recommendations: DisposalZone[],
  weights: FactorWeights,
  constraints: OperationalConstraints
): SystemMetrics {
  const top3 = recommendations.slice(0, 3)

  // Unpredictability: average entropy of top 3, boosted by weight
  const avgEntropy = top3.reduce((s, z) => s + z.entropyScore, 0) / (top3.length || 1)
  const unpredictabilityScore = Math.min(99, Math.round(avgEntropy * 0.7 + weights.entropy * 0.3))

  // Threat exposure: average threat of top 3 (lower = better displayed as exposure %)
  const avgThreat = top3.reduce((s, z) => s + z.threatExposure, 0) / (top3.length || 1)
  const threatExposure = Math.round(avgThreat)

  // Operational readiness: from constraints
  const pilotFactor = (constraints.pilotsReady / constraints.pilotsTotal) * 100
  const acFactor = (constraints.aircraftAvailable / constraints.aircraftTotal) * 100
  const fuelFactor = constraints.fuelPercentage
  const operationalReadiness = Math.round((pilotFactor + acFactor + fuelFactor) / 3)

  // Pattern risk: inverse of avg entropy for top zone, modulated by history
  const top = recommendations[0]
  let patternRisk = top ? Math.max(0, 100 - top.entropyScore) : 50
  if (top?.lastUsedHoursAgo && top.lastUsedHoursAgo < 48) patternRisk = Math.min(99, patternRisk + 20)
  patternRisk = Math.round(patternRisk)

  // Information asymmetry composite (the headline gauge)
  const informationAsymmetry = Math.min(99, Math.round(
    unpredictabilityScore * 0.45 +
    (100 - threatExposure) * 0.25 +
    operationalReadiness * 0.2 +
    (100 - patternRisk) * 0.1
  ))

  return {
    unpredictabilityScore,
    threatExposure,
    operationalReadiness,
    patternRisk,
    informationAsymmetry,
  }
}

// ── TIMING ENGINE ─────────────────────────────────────────────────────────────

/**
 * Generate fuzzy timing recommendations for a dispersal operation.
 * Applies ±N minute jitter to prevent pattern recognition.
 */
export function generateTimingWindow(zone: DisposalZone): {
  nominal: string
  earliest: string
  latest: string
  rationale: string
} {
  const now = new Date()
  const offsetMin = zone.timeWindowMinutes[0]
  const closeMin = zone.timeWindowMinutes[1]
  const fuzzy = zone.fuzzyOffsetMin

  const nominalTime = new Date(now.getTime() + offsetMin * 60 * 1000)
  const earliestTime = new Date(now.getTime() + Math.max(15, offsetMin - fuzzy) * 60 * 1000)
  const latestTime = new Date(now.getTime() + (closeMin + fuzzy) * 60 * 1000)

  const fmt = (d: Date) =>
    `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}Z`

  return {
    nominal: fmt(nominalTime),
    earliest: fmt(earliestTime),
    latest: fmt(latestTime),
    rationale: `Fuzzy window ±${fuzzy} min applied. Nominal T+${offsetMin} min, effective envelope ${earliestTime.getUTCHours()}:${earliestTime.getUTCMinutes()}–${latestTime.getUTCHours()}:${latestTime.getUTCMinutes()}Z to deny adversary pattern lock.`,
  }
}

// ── WHAT-IF ANALYSIS ──────────────────────────────────────────────────────────

export interface WhatIfResult {
  zoneId: string
  zoneName: string
  baseScore: number
  adjustedScore: number
  delta: number
  keyDriver: string
}

/**
 * Analyse how a weight change affects zone rankings.
 */
export function whatIfAnalysis(
  currentWeights: FactorWeights,
  modifiedWeights: FactorWeights,
  zones: DisposalZone[]
): WhatIfResult[] {
  const currentNW = normaliseWeights(currentWeights)
  const modifiedNW = normaliseWeights(modifiedWeights)

  return zones.slice(0, 5).map((zone) => {
    const base = scoreZone(zone, currentNW)
    const adjusted = scoreZone(zone, modifiedNW)
    const delta = adjusted - base

    // Find which factor changed most significantly for this zone
    const factors: [string, number][] = [
      ['Stealth', (modifiedNW.stealth - currentNW.stealth) * (100 - zone.scores.threat)],
      ['Logistics', (modifiedNW.logistics - currentNW.logistics) * zone.scores.logistics],
      ['Surface', (modifiedNW.surface - currentNW.surface) * zone.scores.surface],
      ['Redeployment', (modifiedNW.redeploy - currentNW.redeploy) * zone.scores.flexibility],
      ['Entropy', (modifiedNW.entropy - currentNW.entropy) * zone.entropyScore],
    ]
    factors.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    const keyDriver = factors[0][0]

    return {
      zoneId: zone.id,
      zoneName: zone.shortName,
      baseScore: Math.round(base),
      adjustedScore: Math.round(adjusted),
      delta: Math.round(delta),
      keyDriver,
    }
  })
}
