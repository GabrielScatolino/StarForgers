import { Link } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { PLANETS } from '../data/gameData'
import Icon from './Icon'
import PlanetOrb from './PlanetOrb'

// Faixa para escolher entre os planetas já colonizados. Compartilhada entre Jogo e Loja.
export default function PlanetPicker() {
  const { game, selectPlanet } = useGame()
  const colonized = PLANETS.filter((p) => game.planets.includes(p.id))
  const hasMore = colonized.length < PLANETS.length

  return (
    <div className="planet-picker d-flex flex-wrap justify-content-center gap-2" role="tablist" aria-label="Planetas">
      {colonized.map((planet) => {
        const active = planet.id === game.activePlanet
        return (
          <button
            key={planet.id}
            role="tab"
            aria-selected={active}
            className={`planet-chip btn ${active ? 'active' : ''}`}
            onClick={() => selectPlanet(planet.id)}
          >
            <PlanetOrb planet={planet} size={32} />
            <span>{planet.name}</span>
          </button>
        )
      })}
      {hasMore && (
        <Link to="/galaxia" className="planet-chip btn btn-outline-secondary">
          <Icon name="plus-lg" />
          <span>Colonizar</span>
        </Link>
      )}
    </div>
  )
}
