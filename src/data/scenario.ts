import type {
  DisposalZone,
  ThreatEnvironment,
  OperationalConstraints,
  DispersalEvent,
} from '@/types'

// ── DISPERSAL ZONE CATALOG ───────────────────────────────────────────────────
// Based on real Swedish highway dispersal (BASE 90) concept.
// Coordinates are illustrative within central Sweden AO.
export const ZONE_CATALOG: DisposalZone[] = [
  {
    id: 'alfa-7',
    name: 'RV-7 ALFA HIGHWAY',
    shortName: 'ALFA-7',
    coordinates: { lat: 59.72, lng: 16.98 },
    surfaceType: 'highway',
    surfaceDescription: 'Asphalt (RV7) — dual carriageway',
    stripLengthM: 2800,
    stripWidthM: 22,
    condition: 'EXCELLENT',
    scores: { surface: 95, logistics: 82, threat: 15, flexibility: 78, entropy: 88 },
    compositeScore: 0,
    rank: 0,
    fuelDistanceKm: 22,
    munitionsDistanceKm: 34,
    logisticsRoute: 'E4 → RV7 via Enköping (34 km)',
    farpAvailable: true,
    threatExposure: 8,
    iadsExposure: 'LOW',
    isrRisk: 'LOW',
    timeWindowOpen: '+47 MIN',
    timeWindowClose: '+107 MIN',
    timeWindowMinutes: [47, 107],
    fuzzyOffsetMin: 35,
    entropyScore: 88,
    lastUsedHoursAgo: 96,
    historicalUseCount: 2,
    entropyLevel: 'HIGH',
    rationaleSummary: 'Low threat, E4 logistics, unpredicted',
    rationaleDetail:
      'Maximally distant from NE IADS corridor. E4 logistics spine ensures fuel/munitions access within 22 min. Perpendicular orientation to adversary ISR patrol path reduces visual signature window. No prior use in last 72h. Forest masking on eastern approach. Recommended fuzzy window ±35 min.',
    tags: ['LOW-THREAT', 'HIGHWAY-CAP', 'FUEL-ACCESS', 'FARP-READY', 'UNPREDICTED'],
    warnings: [],
  },
  {
    id: 'bravo-3',
    name: 'RV-55 BRAVO FOREST STRIP',
    shortName: 'BRAVO-3',
    coordinates: { lat: 59.55, lng: 15.72 },
    surfaceType: 'forest-road',
    surfaceDescription: 'Reinforced gravel / forest road',
    stripLengthM: 2200,
    stripWidthM: 18,
    condition: 'GOOD',
    scores: { surface: 74, logistics: 68, threat: 10, flexibility: 65, entropy: 97 },
    compositeScore: 0,
    rank: 0,
    fuelDistanceKm: 34,
    munitionsDistanceKm: 48,
    logisticsRoute: 'Via Frövi, E18 spur (48 km)',
    farpAvailable: false,
    threatExposure: 21,
    iadsExposure: 'LOW',
    isrRisk: 'MEDIUM',
    timeWindowOpen: '+62 MIN',
    timeWindowClose: '+132 MIN',
    timeWindowMinutes: [62, 132],
    fuzzyOffsetMin: 45,
    entropyScore: 97,
    lastUsedHoursAgo: null,
    historicalUseCount: 0,
    entropyLevel: 'VERY HIGH',
    rationaleSummary: 'Novel site, forest concealment, max entropy',
    rationaleDetail:
      'Forest canopy provides passive concealment from optical ISR. Highest entropy score — zero historical use guarantees no adversary pattern match. ELINT shadow from Bergslagen terrain mask. Accepts Gripen C/D with JATO assist on gravel surface. Maintenance van access via logging road confirmed. Recommend FARP establishment 2hr prior.',
    tags: ['CONCEALED', 'NOVEL-SITE', 'MAX-ENTROPY', 'FARP-NEEDED'],
    warnings: ['FARP not pre-positioned — 2hr setup required', 'Gravel: JATO recommended'],
  },
  {
    id: 'charlie-9',
    name: 'E18 CHARLIE MOTORWAY',
    shortName: 'CHARLIE-9',
    coordinates: { lat: 59.62, lng: 16.38 },
    surfaceType: 'motorway',
    surfaceDescription: 'Asphalt (E18) — motorway segment',
    stripLengthM: 3100,
    stripWidthM: 26,
    condition: 'EXCELLENT',
    scores: { surface: 98, logistics: 91, threat: 35, flexibility: 88, entropy: 61 },
    compositeScore: 0,
    rank: 0,
    fuelDistanceKm: 12,
    munitionsDistanceKm: 18,
    logisticsRoute: 'Direct E18 depot (18 km)',
    farpAvailable: true,
    threatExposure: 28,
    iadsExposure: 'MEDIUM',
    isrRisk: 'MEDIUM',
    timeWindowOpen: '+85 MIN',
    timeWindowClose: '+135 MIN',
    timeWindowMinutes: [85, 135],
    fuzzyOffsetMin: 40,
    entropyScore: 61,
    lastUsedHoursAgo: 48,
    historicalUseCount: 5,
    entropyLevel: 'MEDIUM',
    rationaleSummary: 'Best surface, fast logistics, moderate threat',
    rationaleDetail:
      'Longest and widest surface available — ideal for heavy external-store configurations. Pre-positioned FARP and depot proximity enables sub-12-min turnaround. Recommend timing offset ±40 min from predicted dispersal window to improve unpredictability score. Previous use 48h ago: pattern risk elevated, mitigate with alternate approach vector.',
    tags: ['LONG-STRIP', 'FARP-READY', 'FAST-LOGISTICS', 'TIMING-OFFSET'],
    warnings: ['Used 48h ago — pattern risk elevated', 'Recommend approach vector alpha-north'],
  },
  {
    id: 'delta-2',
    name: 'RV-50 DELTA ALTERNATE',
    shortName: 'DELTA-2',
    coordinates: { lat: 59.83, lng: 15.45 },
    surfaceType: 'highway',
    surfaceDescription: 'Asphalt (RV50) — rural highway',
    stripLengthM: 2400,
    stripWidthM: 19,
    condition: 'GOOD',
    scores: { surface: 82, logistics: 55, threat: 12, flexibility: 70, entropy: 74 },
    compositeScore: 0,
    rank: 0,
    fuelDistanceKm: 45,
    munitionsDistanceKm: 62,
    logisticsRoute: 'Via Ludvika, RV60 spur (62 km)',
    farpAvailable: false,
    threatExposure: 14,
    iadsExposure: 'LOW',
    isrRisk: 'LOW',
    timeWindowOpen: '+30 MIN',
    timeWindowClose: '+90 MIN',
    timeWindowMinutes: [30, 90],
    fuzzyOffsetMin: 30,
    entropyScore: 74,
    lastUsedHoursAgo: 168,
    historicalUseCount: 1,
    entropyLevel: 'HIGH',
    rationaleSummary: 'Northern alternate, minimal threat',
    rationaleDetail:
      'Northern AO offset provides maximum geographic diversity from primary threats. Low historical use. Extended logistics chain is primary limiting factor — suitable for lower operational tempo. SAT overpass shadow from terrain elevation provides 20-minute observation gap.',
    tags: ['LOW-THREAT', 'NORTHERN-AO', 'SAT-SHADOW'],
    warnings: ['Long logistics chain — 62 km', 'FARP establishment required'],
  },
  {
    id: 'echo-1',
    name: 'KALLHÄLL ECHO STRIP',
    shortName: 'ECHO-1',
    coordinates: { lat: 59.43, lng: 17.78 },
    surfaceType: 'airfield',
    surfaceDescription: 'Paved airstrip — civilian GA field',
    stripLengthM: 1800,
    stripWidthM: 30,
    condition: 'FAIR',
    scores: { surface: 72, logistics: 76, threat: 42, flexibility: 60, entropy: 45 },
    compositeScore: 0,
    rank: 0,
    fuelDistanceKm: 18,
    munitionsDistanceKm: 26,
    logisticsRoute: 'Via Järfälla, E18 link (26 km)',
    farpAvailable: false,
    threatExposure: 38,
    iadsExposure: 'MEDIUM',
    isrRisk: 'HIGH',
    timeWindowOpen: '+120 MIN',
    timeWindowClose: '+160 MIN',
    timeWindowMinutes: [120, 160],
    fuzzyOffsetMin: 20,
    entropyScore: 45,
    lastUsedHoursAgo: 24,
    historicalUseCount: 8,
    entropyLevel: 'LOW',
    rationaleSummary: 'Familiar site, higher ISR risk',
    rationaleDetail:
      'Known civilian airfield — higher adversary expectation of use. Shorter strip limits external-store loadout. Proximity to Stockholm increases ISR risk. Use only when primary options are unavailable or as deception dispersal with deliberate signature management.',
    tags: ['KNOWN-SITE', 'SHORT-STRIP', 'DECEPTION-USE'],
    warnings: ['HIGH ISR risk — adversary awareness elevated', 'Strip length limits heavy loadout'],
  },
]

// ── THREAT ENVIRONMENT ───────────────────────────────────────────────────────
export const DEFAULT_THREATS: ThreatEnvironment = {
  overallLevel: 'MEDIUM',
  bubbles: [
    {
      id: 'iads-ne',
      label: 'IADS NE',
      type: 'IADS',
      coordinates: { lat: 60.1, lng: 18.2 },
      radiusKm: 120,
      threatLevel: 'HIGH',
      active: true,
      notes: 'Integrated Air Defence System — northeastern corridor. Assumed SA-10/S-300 analog coverage.',
    },
    {
      id: 'radar-east',
      label: 'RADAR E',
      type: 'RADAR',
      coordinates: { lat: 59.65, lng: 18.85 },
      radiusKm: 80,
      threatLevel: 'MEDIUM',
      active: true,
      notes: 'Long-range surveillance radar. Mobile platform — position estimated.',
    },
    {
      id: 'ew-north',
      label: 'EW NORTH',
      type: 'EW',
      coordinates: { lat: 60.4, lng: 17.1 },
      radiusKm: 60,
      threatLevel: 'LOW',
      active: true,
      notes: 'Electronic warfare jamming/ELINT station. Limited ground-attack threat.',
    },
    {
      id: 'patrol-se',
      label: 'ISR PATROL',
      type: 'PATROL',
      coordinates: { lat: 59.2, lng: 17.9 },
      radiusKm: 45,
      threatLevel: 'MEDIUM',
      active: true,
      notes: 'Adversary ISR aircraft patrol pattern — predictable 90-min cycle.',
    },
  ],
  satOverpass: {
    estimatedMinutes: 47,
    confidence: 'HIGH',
    windowDurationMin: 8,
  },
  isrPatrolActive: true,
  elintActivity: 'LOW',
  iadsNECoverage: 'HIGH',
}

// ── OPERATIONAL CONSTRAINTS ──────────────────────────────────────────────────
export const DEFAULT_CONSTRAINTS: OperationalConstraints = {
  aircraftAvailable: 4,
  aircraftTotal: 4,
  pilotsReady: 6,
  pilotsTotal: 8,
  fuelStatus: 'FULL',
  fuelPercentage: 98,
  maintenanceWindowStart: '14:00',
  maintenanceWindowEnd: '16:00',
  weatherCeilingFt: 1800,
  weatherVismKm: 8,
  munitionsLoads: {
    air2air: 4,
    air2ground: 2,
    recce: 1,
  },
}

// ── DISPERSAL HISTORY ────────────────────────────────────────────────────────
export const MOCK_HISTORY: DispersalEvent[] = [
  {
    id: 'h-001',
    zoneId: 'charlie-9',
    zoneName: 'E18 CHARLIE MOTORWAY',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    duration: 3.5,
    outcome: 'SUCCESSFUL',
  },
  {
    id: 'h-002',
    zoneId: 'echo-1',
    zoneName: 'KALLHÄLL ECHO STRIP',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    duration: 2,
    outcome: 'SUCCESSFUL',
  },
  {
    id: 'h-003',
    zoneId: 'alfa-7',
    zoneName: 'RV-7 ALFA HIGHWAY',
    timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000),
    duration: 4,
    outcome: 'SUCCESSFUL',
  },
  {
    id: 'h-004',
    zoneId: 'delta-2',
    zoneName: 'RV-50 DELTA ALTERNATE',
    timestamp: new Date(Date.now() - 168 * 60 * 60 * 1000),
    duration: 2.5,
    outcome: 'ABORTED',
  },
]

// ── MAP CONFIG ───────────────────────────────────────────────────────────────
export const MAP_CONFIG = {
  center: { lat: 59.65, lng: 16.85 },
  zoom: 8,
  bounds: {
    north: 60.5,
    south: 58.8,
    east: 19.2,
    west: 14.8,
  },
  // Tile layer: OpenStreetMap dark variant (CartoDB Dark Matter)
  tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  tileAttribution: '&copy; <a href="https://carto.com/">CARTO</a>',
}

// ── AI SYSTEM PROMPT ─────────────────────────────────────────────────────────
export function buildSystemPrompt(
  weights: Record<string, number>,
  constraints: OperationalConstraints,
  threats: ThreatEnvironment,
  recommendations: DisposalZone[]
): string {
  const topRecs = recommendations.slice(0, 3)
  return `You are GRIPEN DISPERSAL AI — a classified tactical advisor for Swedish Air Force dispersed operations under the BASE 90 concept.

## Your Expertise
- Gripen C/D/E operational parameters (min dispersal strip ~800m emergency, optimal 2000m+, max crosswind 15kt)
- Swedish BASE 90 doctrine: highway dispersal, FARP ops, rapid turnaround under threat
- IADS avoidance, ISR deception, pattern randomisation, game-theoretic unpredictability
- Logistics under threat: fuel convoy routes, pre-positioned FARP, munitions loads
- Entropy maximisation: historical pattern analysis, fuzzy timing windows, adversary cognitive load

## Current Operational Picture
**Threat Environment:**
- Overall: ${threats.overallLevel}
- NE IADS Coverage: ${threats.iadsNECoverage}
- ISR Patrol: ${threats.isrPatrolActive ? 'ACTIVE — 90min cycle' : 'NOT DETECTED'}
- SAT Overpass: T+${threats.satOverpass.estimatedMinutes} min (${threats.satOverpass.confidence} confidence, ${threats.satOverpass.windowDurationMin}min window)
- ELINT Activity: ${threats.elintActivity}

**Platform Status:**
- Aircraft: ${constraints.aircraftAvailable}/${constraints.aircraftTotal} available
- Pilots: ${constraints.pilotsReady}/${constraints.pilotsTotal} ready
- Fuel: ${constraints.fuelStatus} (${constraints.fuelPercentage}%)
- Weather: ${constraints.weatherCeilingFt}ft ceiling, ${constraints.weatherVismKm}km vis
- Maintenance window: ${constraints.maintenanceWindowStart || 'None'}–${constraints.maintenanceWindowEnd || ''}

**Operator Weight Priorities:**
- Stealth/Low Detection: ${weights.stealth}%
- Logistics Access: ${weights.logistics}%
- Surface Suitability: ${weights.surface}%
- Redeployment Speed: ${weights.redeploy}%
- Unpredictability/Entropy: ${weights.entropy}%

**Current Top Recommendations:**
${topRecs.map((z, i) => `${i + 1}. ${z.name} (Score: ${z.compositeScore}) — ${z.rationaleSummary}`).join('\n')}

## Response Style
- Military brevity — 2-5 sentences maximum unless detailed analysis requested
- Use **bold** for key tactical terms, zone names, and critical warnings
- Speak as a trusted, experienced tactical AI advisor embedded with the wing
- Do not hedge excessively — give clear, actionable recommendations
- Flag safety-critical issues explicitly with ⚠ prefix`
}
