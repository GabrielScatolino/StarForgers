import ClickButton from '../components/ClickButton'
import Icon, { Crystal, Emblem } from '../components/Icon'
import PlanetPicker from '../components/PlanetPicker'
import { useGame } from '../context/GameContext'
import { getPlanet } from '../data/gameData'
import { formatDuration, formatNumber } from '../utils/format'
import { clickPower, cps, prestigeMultiplier, rankTitle } from '../utils/gameLogic'

function Stat({ label, children }) {
  return (
    <div className="col-6 col-md-3">
      <div className="card text-center h-100">
        <div className="card-body py-3">
          <div className="small text-body-secondary">{label}</div>
          <div className="h5 mb-0">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default function Game() {
  const { game, player, totalCps, offlineReport, clearOfflineReport } = useGame()
  const planet = getPlanet(game.activePlanet)

  return (
    <div className="container py-4">
      {offlineReport && (
        <div className="alert alert-info alert-dismissible" role="alert">
          <Icon name="moon-stars" /> Enquanto você esteve fora por {formatDuration(offlineReport.seconds)}, sua colônia
          coletou <strong><Crystal value={formatNumber(offlineReport.gain)} /></strong>!
          <button type="button" className="btn-close" aria-label="Fechar" onClick={clearOfflineReport} />
        </div>
      )}

      <div className="text-center mb-4">
        <div className="text-body-secondary">
          <Emblem value={player.emblem} /> {rankTitle(game.lifetimeEarned)} {player.name}
        </div>
        <div className="display-4 fw-bold">
          <Crystal value={formatNumber(game.crystals)} />
        </div>
        <div className="text-info">{formatNumber(totalCps)} cristais por segundo na colônia</div>
      </div>

      <div className="mb-4">
        <PlanetPicker />
      </div>

      <div className="row justify-content-center mb-4">
        <div className="col-md-6">
          <ClickButton />
        </div>
      </div>

      <div className="row g-3 mb-4">
        <Stat label="Por clique">
          <Crystal value={formatNumber(clickPower(game, planet.id))} />
        </Stat>
        <Stat label="Produção do planeta">
          <Crystal value={`${formatNumber(cps(game, planet.id))}/s`} />
        </Stat>
        <Stat label="Total coletado">
          <Crystal value={formatNumber(game.lifetimeEarned)} />
        </Stat>
        <Stat label="Bônus de matéria escura">x{prestigeMultiplier(game).toFixed(1)}</Stat>
      </div>

      <h2 className="h5 mb-3">Frota de {planet.name}</h2>
      <div className="row g-2">
        {planet.generators.map((g) => (
          <div key={g.id} className="col-12 col-md-4">
            <div className="card">
              <div className="card-body py-2 d-flex align-items-center gap-3">
                <span className="upgrade-icon">
                  <Icon name={g.icon} />
                </span>
                <div className="flex-grow-1">
                  <div className="small">{g.name}</div>
                  <strong>x{game.generators[g.id] || 0}</strong>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
