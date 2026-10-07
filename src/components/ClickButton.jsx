import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { getPlanet } from '../data/gameData'
import { formatNumber } from '../utils/format'
import { clickPower } from '../utils/gameLogic'
import PlanetOrb from './PlanetOrb'

const ORB_SIZE = 240

// Botão principal: o planeta ativo. Clique gera cristais e mostra um "+N" flutuante
export default function ClickButton() {
  const { game, click } = useGame()
  const [floaters, setFloaters] = useState([])
  const planet = getPlanet(game.activePlanet)
  const power = clickPower(game, planet.id)

  const handleClick = (e) => {
    click()
    const rect = e.currentTarget.getBoundingClientRect()
    const id = crypto.randomUUID()
    const x = e.clientX ? e.clientX - rect.left : rect.width / 2
    const y = e.clientY ? e.clientY - rect.top : rect.height / 2
    setFloaters((list) => [...list, { id, x, y }])
    setTimeout(() => setFloaters((list) => list.filter((f) => f.id !== id)), 900)
  }

  return (
    <div className="text-center">
      <button
        className="orb-button"
        style={{ width: ORB_SIZE, height: ORB_SIZE }}
        onClick={handleClick}
        aria-label={`Minerar cristais em ${planet.name}`}
      >
        <PlanetOrb planet={planet} size={ORB_SIZE} />
        {floaters.map((f) => (
          <span key={f.id} className="floater" style={{ left: f.x, top: f.y }}>
            +{formatNumber(power)}
          </span>
        ))}
      </button>
      <h2 className="h4 mt-4 mb-0">{planet.name}</h2>
      <p className="text-body-secondary mb-0">{planet.type} · clique para minerar</p>
    </div>
  )
}
