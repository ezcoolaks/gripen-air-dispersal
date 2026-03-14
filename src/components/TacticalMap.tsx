import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import { useAppStore } from '@/lib/store'
import type { DisposalZone, ThreatBubble } from '@/types'
import { threatColor, scoreColor } from '@/lib/utils'
import { MAP_CONFIG } from '@/data/scenario'

// Fix Leaflet default icon paths broken by Vite bundling
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const CURRENT_BASE: [number, number] = [59.65, 16.85]

export function TacticalMap() {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const layerGroupsRef = useRef<Record<string, L.LayerGroup>>({})

  const { recommendations, selectedZoneId, threats, mapLayers, selectZone, phase } = useAppStore()

  // ── INIT MAP ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const map = L.map(containerRef.current, {
      center: [MAP_CONFIG.center.lat, MAP_CONFIG.center.lng],
      zoom: MAP_CONFIG.zoom,
      zoomControl: true,
      attributionControl: false,
    })

    // Dark tile layer (CartoDB Dark Matter)
    L.tileLayer(MAP_CONFIG.tileUrl, {
      attribution: MAP_CONFIG.tileAttribution,
      maxZoom: 18,
    }).addTo(map)

    // Create layer groups
    const groups = {
      threats: L.layerGroup().addTo(map),
      zones: L.layerGroup().addTo(map),
      routes: L.layerGroup().addTo(map),
      base: L.layerGroup().addTo(map),
    }
    layerGroupsRef.current = groups

    // Add current base marker (always visible)
    addBaseMarker(groups.base)

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // ── THREAT LAYER ──────────────────────────────────────────────────────────
  useEffect(() => {
    const group = layerGroupsRef.current.threats
    if (!group) return
    group.clearLayers()
    if (!mapLayers.threats) return

    threats.bubbles.forEach((bubble) => {
      renderThreatBubble(group, bubble)
    })
  }, [threats, mapLayers.threats])

  // ── ZONE LAYER ────────────────────────────────────────────────────────────
  useEffect(() => {
    const group = layerGroupsRef.current.zones
    const routeGroup = layerGroupsRef.current.routes
    if (!group || !routeGroup) return

    group.clearLayers()
    routeGroup.clearLayers()

    if (!mapLayers.zones || phase !== 'EXECUTION') return

    const top3 = recommendations.slice(0, 3)
    top3.forEach((zone, idx) => {
      renderZoneMarker(group, zone, idx, selectedZoneId === zone.id, () => selectZone(zone.id))
    })

    // Route from base to selected zone
    if (mapLayers.routes) {
      const selected = recommendations.find((z) => z.id === selectedZoneId)
      if (selected) {
        renderRouteLine(routeGroup, selected)
      }
    }
  }, [recommendations, selectedZoneId, mapLayers.zones, mapLayers.routes, phase, selectZone])

  // ── LAYER VISIBILITY ──────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    Object.entries(layerGroupsRef.current).forEach(([key, group]) => {
      const visible = key === 'base' || mapLayers[key as keyof typeof mapLayers] !== false
      if (visible) {
        if (!map.hasLayer(group)) map.addLayer(group)
      } else {
        if (map.hasLayer(group)) map.removeLayer(group)
      }
    })
  }, [mapLayers])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minWidth: 0, overflow: 'hidden' }}>
      <div className="scanlines" />
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <MapLegend />
      <MapControls />
    </div>
  )
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function addBaseMarker(group: L.LayerGroup) {
  const icon = L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center">
        <div style="position:absolute;width:24px;height:24px;border-radius:50%;border:1.5px solid #f0a800;opacity:0.5;animation:pulse 2s ease-in-out infinite"></div>
        <div style="width:8px;height:8px;border-radius:50%;background:#f0a800;box-shadow:0 0 8px #f0a800"></div>
      </div>
      <style>@keyframes pulse{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(1.4);opacity:0.2}}</style>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

  const marker = L.marker(CURRENT_BASE, { icon })
  marker.bindTooltip('<strong style="color:#f0a800;font-family:monospace">BASE CHARLIE</strong><br><span style="color:#7090a8;font-size:11px">Current position</span>', {
    permanent: false,
    className: 'tactical-tooltip',
    direction: 'right',
  })
  group.addLayer(marker)
}

function renderThreatBubble(group: L.LayerGroup, bubble: ThreatBubble) {
  const color = threatColor(bubble.threatLevel)

  // Filled area
  const circle = L.circle([bubble.coordinates.lat, bubble.coordinates.lng], {
    radius: bubble.radiusKm * 1000,
    color,
    fillColor: color,
    fillOpacity: 0.06,
    weight: 0.8,
    dashArray: '5 5',
    opacity: 0.5,
  })

  circle.bindTooltip(
    `<strong style="color:${color};font-family:monospace">${bubble.label}</strong><br>
     <span style="color:#7090a8;font-size:11px">${bubble.type} — ${bubble.threatLevel}</span><br>
     <span style="color:#c8d8e8;font-size:11px">${bubble.notes}</span>`,
    { className: 'tactical-tooltip', sticky: true }
  )

  group.addLayer(circle)

  // Label marker
  const labelIcon = L.divIcon({
    className: '',
    html: `<div style="font-family:monospace;font-size:10px;color:${color};letter-spacing:0.08em;white-space:nowrap;text-shadow:0 0 8px ${color}40">${bubble.label}</div>`,
    iconAnchor: [20, 0],
  })
  group.addLayer(L.marker([bubble.coordinates.lat, bubble.coordinates.lng], { icon: labelIcon, interactive: false }))
}

function renderZoneMarker(
  group: L.LayerGroup,
  zone: DisposalZone,
  rank: number,
  isSelected: boolean,
  onClick: () => void
) {
  const colors = ['#00c88c', '#00a8f0', '#7090a8']
  const color = colors[rank] ?? '#7090a8'
  const size = isSelected ? 18 : 14
  const glowColor = isSelected ? color : 'transparent'

  // Zone circle
  const circle = L.circle([zone.coordinates.lat, zone.coordinates.lng], {
    radius: 8000,
    color,
    fillColor: color,
    fillOpacity: isSelected ? 0.18 : 0.08,
    weight: isSelected ? 1.5 : 0.8,
    dashArray: isSelected ? undefined : '4 4',
  })
  circle.on('click', onClick)
  group.addLayer(circle)

  // Marker
  const icon = L.divIcon({
    className: '',
    html: `
      <div onclick="" style="cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px">
        <div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid ${color};box-shadow:0 0 ${isSelected ? 12 : 4}px ${glowColor};display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:9px;font-weight:bold;color:#0a0d12">#${rank + 1}</div>
        <div style="font-family:monospace;font-size:10px;color:${color};letter-spacing:0.06em;white-space:nowrap;background:rgba(10,13,18,0.85);padding:1px 4px;border-radius:2px">${zone.shortName}</div>
      </div>
    `,
    iconSize: [60, 36],
    iconAnchor: [30, 8],
  })

  const marker = L.marker([zone.coordinates.lat, zone.coordinates.lng], { icon })
  marker.on('click', onClick)
  marker.bindTooltip(
    `<strong style="color:${color};font-family:monospace">${zone.name}</strong><br>
     <span style="color:#7090a8;font-size:11px">Score: ${zone.compositeScore} | ${zone.surfaceDescription}</span><br>
     <span style="color:#c8d8e8;font-size:11px">Strip: ${zone.stripLengthM}m × ${zone.stripWidthM}m</span><br>
     <span style="color:#f0a800;font-size:11px">Window: ${zone.timeWindowOpen} → ${zone.timeWindowClose}</span>`,
    { className: 'tactical-tooltip', direction: 'right' }
  )
  group.addLayer(marker)
}

function renderRouteLine(group: L.LayerGroup, zone: DisposalZone) {
  const line = L.polyline(
    [CURRENT_BASE, [zone.coordinates.lat, zone.coordinates.lng]],
    {
      color: '#00c88c',
      weight: 1,
      opacity: 0.4,
      dashArray: '8 6',
    }
  )
  group.addLayer(line)

  // Distance label at midpoint
  const mid: L.LatLngExpression = [
    (CURRENT_BASE[0] + zone.coordinates.lat) / 2,
    (CURRENT_BASE[1] + zone.coordinates.lng) / 2,
  ]
  const distKm = Math.round(
    L.latLng(CURRENT_BASE).distanceTo(L.latLng([zone.coordinates.lat, zone.coordinates.lng])) / 1000
  )
  const midIcon = L.divIcon({
    className: '',
    html: `<div style="font-family:monospace;font-size:10px;color:rgba(0,200,140,0.7);background:rgba(10,13,18,0.8);padding:1px 5px;border-radius:2px;white-space:nowrap">${distKm} km</div>`,
    iconAnchor: [24, 8],
  })
  group.addLayer(L.marker(mid, { icon: midIcon, interactive: false }))
}

// ── MAP UI OVERLAYS ───────────────────────────────────────────────────────────

function MapLegend() {
  const items = [
    { color: '#00c88c', label: 'Recommended Zone' },
    { color: '#00a8f0', label: 'Alternate Zone' },
    { color: '#e04040', label: 'Threat Coverage' },
    { color: '#f0a800', label: 'Current Position' },
    { color: 'rgba(200,216,232,0.35)', label: 'Terrain / Roads' },
  ]
  return (
    <div style={{
      position: 'absolute',
      bottom: 16,
      left: 16,
      background: 'rgba(10,13,18,0.88)',
      border: '1px solid var(--border)',
      borderRadius: 4,
      padding: '8px 12px',
      zIndex: 1000,
      pointerEvents: 'none',
    }}>
      {items.map(({ color, label }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text2)', letterSpacing: '0.06em' }}>{label}</span>
        </div>
      ))}
    </div>
  )
}

function MapControls() {
  const { toggleLayer, mapLayers } = useAppStore()

  const buttons: { layer: keyof typeof mapLayers; icon: string; title: string }[] = [
    { layer: 'threats', icon: '☣', title: 'Toggle threat zones' },
    { layer: 'routes', icon: '⊞', title: 'Toggle route lines' },
    { layer: 'zones', icon: '◎', title: 'Toggle dispersal zones' },
  ]

  return (
    <div style={{
      position: 'absolute',
      bottom: 16,
      right: 56,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      zIndex: 1000,
    }}>
      {buttons.map(({ layer, icon, title }) => (
        <button
          key={layer}
          title={title}
          onClick={() => toggleLayer(layer)}
          style={{
            width: 32,
            height: 32,
            background: mapLayers[layer] ? 'rgba(0,200,140,0.15)' : 'var(--bg2)',
            border: `1px solid ${mapLayers[layer] ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 4,
            color: mapLayers[layer] ? 'var(--accent)' : 'var(--text2)',
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
