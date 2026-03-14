# GRIPEN · DISPERSAL AI

> **AI-Driven Dispersal Advisor for Gripen Operations**  
> Hackathon Demo — Exercise NORD WIND

A real-time tactical decision-support system that uses AI to recommend unpredictable yet operationally optimal dispersal locations and timing windows for Gripen fighter operations, implementing the Swedish Air Force **BASE 90** concept.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        GRIPEN DISPERSAL AI                       │
├──────────────┬──────────────────────────┬────────────────────────┤
│  PARAMETERS  │      TACTICAL MAP         │   RECOMMENDATIONS      │
│  PANEL       │   (Leaflet + CartoDB)     │   PANEL                │
│              │                           │                        │
│ • Factor     │ • Dark terrain tiles      │ • 4× KPI metrics       │
│   sliders    │ • Threat bubbles          │ • Asymmetry gauge      │
│ • Constraints│ • Dispersal zones         │ • Top 3 rec cards      │
│ • Threat env │ • Route lines             │ • Dispersal history    │
│ • GENERATE   │ • Layer toggles           │                        │
│              │                           │ ── AI ADVISOR ──       │
│              │                           │ • Claude (streaming)   │
│              │                           │ • Quick prompts        │
│              │                           │ • Tactical context     │
└──────────────┴──────────────────────────┴────────────────────────┘
```

### Key Modules

| File | Purpose |
|------|---------|
| `src/lib/engine.ts` | Core scoring & recommendation engine |
| `src/lib/anthropic.ts` | Claude API client with SSE streaming |
| `src/lib/store.ts` | Zustand global state management |
| `src/data/scenario.ts` | Zone catalog, threat data, AI system prompt |
| `src/components/TacticalMap.tsx` | Leaflet map with tactical overlays |
| `src/components/ParametersPanel.tsx` | Operator weight sliders & constraints |
| `src/components/RecommendationCards.tsx` | Scored dispersal zone cards |
| `src/components/AIAdvisorPanel.tsx` | Streaming Claude chat interface |
| `src/components/AsymmetryGauge.tsx` | SVG information asymmetry gauge |

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure API key

```bash
cp .env.example .env.local
# Edit .env.local and set your Anthropic API key:
# VITE_ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run development server

```bash
npm run dev
# → http://localhost:3000
```

### 4. Build for production

```bash
npm run build
npm run preview
```

---

## AI Optimization Engine

### Scoring Formula

Each dispersal zone receives a **composite score (0–100)**:

```
composite = (stealthScore × w_stealth)
          + (logisticsScore × w_logistics)
          + (surfaceScore × w_surface)
          + (flexibilityScore × w_redeploy)
          + (entropyScore × w_entropy)
```

Where weights are operator-configured and normalized to sum to 1.0.

### Entropy / Unpredictability Modifiers

| Condition | Score Modifier |
|-----------|---------------|
| Never used (novel site) | +8 pts |
| Not used in 5+ days | +5 pts |
| Used in last 48h | −5 pts |
| Used in last 24h | −10 pts |
| Historical use > 6× | −8 pts |
| Historical use > 3× | −3 pts |

All modifiers are scaled by the operator's entropy weight setting.

### Timing Windows

Each zone has:
- **Nominal window**: Recommended departure relative to current time
- **Fuzzy offset**: ±N minutes applied to prevent adversary pattern lock
- **Satellite deconfliction**: Windows avoid estimated overpass ±15 min

### Information Asymmetry Score

The headline gauge (0–100) is a weighted composite:

```
IAS = unpredictability × 0.45
    + (100 − threatExposure) × 0.25
    + operationalReadiness × 0.20
    + (100 − patternRisk) × 0.10
```

---

## Dispersal Zone Catalog

| Zone | Type | Strip | Entropy | Threat |
|------|------|-------|---------|--------|
| ALFA-7 (RV-7) | Highway | 2800m | HIGH (88) | LOW (8%) |
| BRAVO-3 (RV-55) | Forest road | 2200m | VERY HIGH (97) | MEDIUM (21%) |
| CHARLIE-9 (E18) | Motorway | 3100m | MEDIUM (61) | MEDIUM (28%) |
| DELTA-2 (RV-50) | Highway | 2400m | HIGH (74) | LOW (14%) |
| ECHO-1 (Kallhäll) | GA airfield | 1800m | LOW (45) | HIGH (38%) |

---

## Threat Environment

Simulated adversary order of battle for central Sweden AO:

- **IADS NE**: SA-10/S-300 analog, 120km radius, HIGH threat
- **RADAR E**: Mobile long-range surveillance, 80km, MEDIUM
- **EW NORTH**: Electronic warfare/ELINT station, 60km, LOW
- **ISR PATROL**: Predictable 90-minute patrol cycle, MEDIUM

---

## AI Tactical Advisor

The Claude integration injects full operational context into every query:

- Current threat environment snapshot
- Platform availability and constraints
- Active recommendations with scores
- Operator weight priorities
- Dispersal history for pattern analysis

The advisor responds with military brevity and can:
- Compare dispersal zones tactically
- Analyze satellite deconfliction windows
- Suggest timing deception plans
- Assess FARP establishment requirements
- Recommend approach vector selection

---

## Extending for Production

### Add Real Map Data
Replace `MAP_CONFIG.tileUrl` with classified terrain tiles, connect to STANAG 4559 WMS feeds, or integrate Försvarsmakten GIS services.

### Real Threat Data
Replace `DEFAULT_THREATS` with live LINK 16 / J-series message feeds, or integrate with SIMT/C2IS threat tracks.

### Historical Pattern Analysis
Replace `MOCK_HISTORY` with a backend database. The `lastUsedHoursAgo` and `historicalUseCount` fields drive the entropy modifier — real operational logs will significantly improve unpredictability scoring.

### Multi-Aircraft Deconfliction
Extend the engine to accept multiple Gripen formations and ensure dispersal zones aren't double-allocated within the same time window.

### Backend API
Move the Anthropic API call to a secure backend proxy (e.g. Node.js/FastAPI) to avoid exposing the API key in the browser. The `src/lib/anthropic.ts` module is designed for easy proxy substitution — change the `ANTHROPIC_API_URL` constant to point to your backend.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS + CSS custom properties |
| State management | Zustand |
| Map | Leaflet + react-leaflet (CartoDB Dark Matter tiles) |
| AI | Anthropic Claude (claude-sonnet-4) with SSE streaming |
| Fonts | Rajdhani (UI) + Share Tech Mono (tactical data) |

---

## Hackathon Demo Script

1. **Open the app** — show the dark tactical map with threat overlays
2. **Adjust weights** — push entropy slider to max, drop logistics
3. **Hit GENERATE** — watch zones appear on map with routing
4. **Click BRAVO-3** — highlight the novel-site, max-entropy recommendation
5. **Ask the AI**: *"Compare ALFA-7 vs BRAVO-3 given the satellite overpass in 47 minutes"*
6. **Show the gauge** — point out the Information Asymmetry Score
7. **Toggle layers** — demonstrate threat vs route overlay controls

---

*Built for HACKATHON 2025 · Swedish Air Force Innovation Challenge*
