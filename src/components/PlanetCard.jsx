import { RARITY_COLORS } from '../data/gameData'
import { formatNumber } from '../utils/format'
import Icon, { Crystal } from './Icon'
import PlanetOrb from './PlanetOrb'

// Card de um planeta na página Galáxia: mostra se já foi colonizado ou quanto custa colonizar
export default function PlanetCard({ planet, colonized, active, canAfford, planetCps, fleetCount, onColonize, onVisit }) {
  return (
    <div className={`card h-100 text-center planet-card${colonized ? '' : ' locked'}${active ? ' border-info' : ''}`}>
      <div className="card-body d-flex flex-column align-items-center">
        <PlanetOrb planet={planet} size={96} className={colonized ? '' : 'orb-dim'} />
        <h3 className="h6 mt-3 mb-1">{planet.name}</h3>
        <div className="mb-2">
          <span className={`badge text-bg-${RARITY_COLORS[planet.rarity]} me-1`}>{planet.rarity}</span>
          <span className="badge text-bg-dark border border-secondary-subtle">{planet.type}</span>
        </div>
        <p className="small text-body-secondary flex-grow-1">{planet.desc}</p>

        {colonized ? (
          <>
            <p className="small mb-2">
              <Icon name="speedometer2" /> {formatNumber(planetCps)} por segundo · {fleetCount} na frota
            </p>
            <button className={`btn btn-sm w-100 ${active ? 'btn-info' : 'btn-outline-info'}`} onClick={onVisit}>
              {active ? (
                'Planeta ativo'
              ) : (
                <>
                  <Icon name="geo-alt" /> Visitar
                </>
              )}
            </button>
          </>
        ) : (
          <button className="btn btn-sm w-100 btn-primary" disabled={!canAfford} onClick={onColonize}>
            <Icon name={canAfford ? 'rocket-takeoff' : 'lock'} /> Colonizar · <Crystal value={formatNumber(planet.unlockCost)} />
          </button>
        )}
      </div>
    </div>
  )
}
