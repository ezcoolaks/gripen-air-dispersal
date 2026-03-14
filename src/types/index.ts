// ── GEOGRAPHIC ──────────────────────────────────────────────────────────────
export interface LatLng {
  lat: number
  lng: number
}

export interface BoundingBox {
  north: number
  south: number
  east: number
  west: number
}

// ── DISPERSAL ZONES ─────────────────────────────────────────────────────────
export type SurfaceType = 'highway' | 'forest-road' | 'motorway' | 'airfield' | 'gravel'
export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type EntropyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY HIGH'

export interface DisposalZone {
  id: string
  name: string
  shortName: string
  coordinates: LatLng
  surfaceType: SurfaceType
  surfaceDescription: string
  stripLengthM: number
  stripWidthM: number
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'

  // Scoring dimensions (0-100)
  scores: {
    surface: number
    logistics: number
    threat: number   // lower = better (threat exposure)
    flexibility: number
    entropy: number
  }

  // Composite
  compositeScore: number
  rank: number

  // Logistics
  fuelDistanceKm: number
  munitionsDistanceKm: number
  logisticsRoute: string
  farpAvailable: boolean

  // Threat
  threatExposure: number  // 0-100%
  iadsExposure: ThreatLevel
  isrRisk: ThreatLevel

  // Timing
  timeWindowOpen: string   // "+47 MIN"
  timeWindowClose: string  // "+107 MIN"
  timeWindowMinutes: [number, number]
  fuzzyOffsetMin: number   // ±N minutes unpredictability window

  // Unpredictability
  entropyScore: number
  lastUsedHoursAgo: number | null
  historicalUseCount: number
  entropyLevel: EntropyLevel

  // Rationale
  rationaleSummary: string
  rationaleDetail: string
  tags: string[]
  warnings: string[]
}

// ── THREAT ENVIRONMENT ──────────────────────────────────────────────────────
export interface ThreatBubble {
  id: string
  label: string
  type: 'IADS' | 'RADAR' | 'EW' | 'SAM' | 'PATROL'
  coordinates: LatLng
  radiusKm: number
  threatLevel: ThreatLevel
  active: boolean
  notes: string
}

export interface SatelliteOverpass {
  estimatedMinutes: number
  confidence: 'LOW' | 'MEDIUM' | 'HIGH'
  windowDurationMin: number
}

export interface ThreatEnvironment {
  overallLevel: ThreatLevel
  bubbles: ThreatBubble[]
  satOverpass: SatelliteOverpass
  isrPatrolActive: boolean
  elintActivity: ThreatLevel
  iadsNECoverage: ThreatLevel
}

// ── OPERATIONAL CONSTRAINTS ─────────────────────────────────────────────────
export interface OperationalConstraints {
  aircraftAvailable: number
  aircraftTotal: number
  pilotsReady: number
  pilotsTotal: number
  fuelStatus: 'FULL' | 'SUFFICIENT' | 'LOW' | 'CRITICAL'
  fuelPercentage: number
  maintenanceWindowStart: string | null
  maintenanceWindowEnd: string | null
  weatherCeilingFt: number
  weatherVismKm: number
  munitionsLoads: {
    air2air: number
    air2ground: number
    recce: number
  }
}

// ── FACTOR WEIGHTS ──────────────────────────────────────────────────────────
export interface FactorWeights {
  stealth: number       // 0-100
  logistics: number     // 0-100
  surface: number       // 0-100
  redeploy: number      // 0-100
  entropy: number       // 0-100
}

// ── METRICS ─────────────────────────────────────────────────────────────────
export interface SystemMetrics {
  unpredictabilityScore: number   // 0-100
  threatExposure: number          // 0-100
  operationalReadiness: number    // 0-100
  patternRisk: number             // 0-100
  informationAsymmetry: number    // 0-100 (composite for gauge)
}

// ── AI CHAT ─────────────────────────────────────────────────────────────────
export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  isStreaming?: boolean
}

// ── OPERATIONAL HISTORY ─────────────────────────────────────────────────────
export interface DispersalEvent {
  id: string
  zoneId: string
  zoneName: string
  timestamp: Date
  duration: number  // hours
  outcome: 'SUCCESSFUL' | 'COMPROMISED' | 'ABORTED'
}

// ── APP STATE ────────────────────────────────────────────────────────────────
export type AppPhase = 'STANDBY' | 'PLANNING' | 'COMPUTING' | 'EXECUTION' | 'DISPERSED'

export interface AppState {
  phase: AppPhase
  weights: FactorWeights
  constraints: OperationalConstraints
  threats: ThreatEnvironment
  recommendations: DisposalZone[]
  selectedZoneId: string | null
  metrics: SystemMetrics | null
  history: DispersalEvent[]
  chat: ChatMessage[]
  lastGeneratedAt: Date | null
  mapLayers: {
    threats: boolean
    routes: boolean
    zones: boolean
    terrain: boolean
  }
}
