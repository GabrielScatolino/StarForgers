// Planeta desenhado só com CSS (gradientes). A aparência vem de `planet.surface` e `planet.glow`.
export default function PlanetOrb({ planet, size = 96, className = '' }) {
  const ringStyle = { borderWidth: Math.max(2, Math.round(size * 0.04)) }

  return (
    <div className={`orb-wrap ${className}`.trim()} style={{ width: size, height: size }}>
      {planet.ring && <div className="orb-ring orb-ring-back" style={ringStyle} />}
      <div
        className="orb"
        style={{
          background: planet.surface,
          boxShadow: `0 0 ${size / 5}px ${planet.glow}66, inset -${size / 12}px -${size / 12}px ${size / 5}px rgba(0,0,0,.55)`,
        }}
      />
      {planet.ring && <div className="orb-ring orb-ring-front" style={ringStyle} />}
    </div>
  )
}
