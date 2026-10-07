import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import PlanetCard from '../components/PlanetCard'
import { useGame } from '../context/GameContext'
import { PLANETS } from '../data/gameData'
import { cps, isColonized } from '../utils/gameLogic'

export default function Galaxy() {
  const { game, colonize, selectPlanet } = useGame()
  const navigate = useNavigate()
  const percent = Math.round((game.planets.length / PLANETS.length) * 100)

  const handleColonize = (id) => {
    colonize(id)
    navigate('/jogo')
  }

  const handleVisit = (id) => {
    selectPlanet(id)
    navigate('/jogo')
  }

  return (
    <div className="container py-4">
      <h1 className="h3 mb-1">
        <Icon name="stars" /> Galáxia
      </h1>
      <p className="text-body-secondary">
        Colonize novos planetas com cristais. Cada planeta tem sua própria frota e melhorias, e quanto mais distante,
        maior o rendimento. Um Novo Universo reinicia suas colônias.
      </p>

      <div className="progress mb-4" role="progressbar" aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100">
        <div className="progress-bar bg-info" style={{ width: `${Math.max(percent, 8)}%` }}>
          {game.planets.length}/{PLANETS.length} colonizados
        </div>
      </div>

      <div className="row g-3">
        {PLANETS.map((planet) => {
          const colonized = isColonized(game, planet.id)
          const fleetCount = planet.generators.reduce((sum, g) => sum + (game.generators[g.id] || 0), 0)
          return (
            <div key={planet.id} className="col-12 col-sm-6 col-lg-4">
              <PlanetCard
                planet={planet}
                colonized={colonized}
                active={game.activePlanet === planet.id}
                canAfford={game.crystals >= planet.unlockCost}
                planetCps={cps(game, planet.id)}
                fleetCount={fleetCount}
                onColonize={() => handleColonize(planet.id)}
                onVisit={() => handleVisit(planet.id)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
