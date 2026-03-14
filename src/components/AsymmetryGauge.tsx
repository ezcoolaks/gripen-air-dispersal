interface GaugeProps {
  value: number // 0-100
  size?: number
}

export function AsymmetryGauge({ value, size = 180 }: GaugeProps) {
  // Add vertical padding so arc strokes (strokeWidth=10) don't clip at edges
  const pad = 10
  const h = size * 0.56 + pad
  const cx = size / 2
  const cy = h - 12 - pad / 2
  const r = size * 0.39

  // Arc path: sweeps from left to right (180° arc)
  const startAngle = -180
  const endAngle = 0
  const filled = (value / 100) * 180

  function polarToXY(angleDeg: number, radius: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    }
  }

  function arcPath(fromDeg: number, toDeg: number, radius: number) {
    const start = polarToXY(fromDeg, radius)
    const end = polarToXY(toDeg, radius)
    const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 1 ${end.x} ${end.y}`
  }

  const trackPath = arcPath(-180, 0, r)
  const fillPath = arcPath(-180, -180 + filled, r)

  // Needle
  const needleAngle = -180 + (value / 100) * 180
  const needleTip = polarToXY(needleAngle, r - 14)
  const needleBase1 = polarToXY(needleAngle + 90, 5)
  const needleBase2 = polarToXY(needleAngle - 90, 5)

  const color = value >= 70 ? '#00c88c' : value >= 45 ? '#f0a800' : '#e04040'

  return (
    <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`}>
      <defs>
        <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e04040" />
          <stop offset="40%" stopColor="#f0a800" />
          <stop offset="100%" stopColor="#00c88c" />
        </linearGradient>
      </defs>

      {/* Track */}
      <path
        d={trackPath}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={10}
        strokeLinecap="round"
      />

      {/* Filled arc */}
      <path
        d={fillPath}
        fill="none"
        stroke="url(#gaugeGrad)"
        strokeWidth={10}
        strokeLinecap="round"
        style={{ transition: 'd 0.8s ease, stroke-dashoffset 0.8s ease' }}
      />

      {/* Tick marks */}
      {[0, 25, 50, 75, 100].map((pct) => {
        const angle = -180 + (pct / 100) * 180
        const inner = polarToXY(angle, r - 16)
        const outer = polarToXY(angle, r - 8)
        return (
          <line
            key={pct}
            x1={inner.x} y1={inner.y}
            x2={outer.x} y2={outer.y}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1}
          />
        )
      })}

      {/* Needle */}
      <polygon
        points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${cx},${cy} ${needleBase2.x},${needleBase2.y}`}
        fill={color}
        opacity={0.9}
        style={{ transition: 'all 0.8s ease' }}
      />
      <circle cx={cx} cy={cy} r={5} fill={color} />
      <circle cx={cx} cy={cy} r={3} fill="var(--bg2)" />

      {/* Value text */}
      <text
        x={cx}
        y={cy - 28}
        textAnchor="middle"
        fontFamily="'Share Tech Mono', monospace"
        fontSize={22}
        fontWeight={700}
        fill={color}
        style={{ transition: 'fill 0.5s' }}
      >
        {value}
      </text>

      {/* Labels */}
      <text x={12} y={h} textAnchor="middle" fontFamily="'Share Tech Mono', monospace" fontSize={9} fill="rgba(224,64,64,0.7)">LOW</text>
      <text x={cx} y={h - (r - 6)} textAnchor="middle" fontFamily="'Share Tech Mono', monospace" fontSize={9} fill="rgba(240,168,0,0.7)">MED</text>
      <text x={size - 12} y={h} textAnchor="end" fontFamily="'Share Tech Mono', monospace" fontSize={9} fill="rgba(0,200,140,0.7)">HIGH</text>
    </svg>
  )
}
