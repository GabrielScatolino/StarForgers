import Icon, { Crystal } from '../components/Icon'
import PlanetPicker from '../components/PlanetPicker'
import UpgradeCard from '../components/UpgradeCard'
import { useGame } from '../context/GameContext'
import { PRESTIGE_MIN_RUN, getPlanet } from '../data/gameData'
import { formatNumber } from '../utils/format'
import { generatorCost, prestigeGain } from '../utils/gameLogic'

export default function Shop() {
  const { game, buyGenerator, buyClickUpgrade, prestige } = useGame()
  const planet = getPlanet(game.activePlanet)
  const gain = prestigeGain(game)

  const handlePrestige = () => {
    const ok = window.confirm(
      `Criar um Novo Universo? Você perde cristais, planetas, frota e melhorias, mas ganha ${gain} de matéria escura (+${gain * 10}% permanente em tudo). Seu total coletado e o ranking são mantidos.`,
    )
    if (ok) prestige()
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">
          <Icon name="cart3" /> Loja
        </h1>
        <span className="badge text-bg-info fs-5">
          <Crystal value={formatNumber(game.crystals)} />
        </span>
      </div>

      <div className="mb-4">
        <PlanetPicker />
      </div>

      <h2 className="h5 mb-3">Frota automática de {planet.name}</h2>
      <div className="row g-3 mb-5">
        {planet.generators.map((g) => {
          const owned = game.generators[g.id] || 0
          const cost = generatorCost(g, owned)
          return (
            <div key={g.id} className="col-md-6 col-lg-4">
              <UpgradeCard
                icon={g.icon}
                name={g.name}
                desc={g.desc}
                extra={`Produz ${formatNumber(g.cps)} por segundo cada`}
                cost={cost}
                owned={owned}
                canBuy={game.crystals >= cost}
                onBuy={() => buyGenerator(g.id)}
              />
            </div>
          )
        })}
      </div>

      <h2 className="h5 mb-3">Melhorias de clique de {planet.name}</h2>
      <div className="row g-3 mb-5">
        {planet.clickUpgrades.map((u) => {
          const bought = game.clickUpgrades.includes(u.id)
          return (
            <div key={u.id} className="col-md-6 col-lg-4">
              <UpgradeCard
                icon={u.icon}
                name={u.name}
                desc={u.desc}
                cost={u.cost}
                soldOut={bought}
                canBuy={!bought && game.crystals >= u.cost}
                onBuy={() => buyClickUpgrade(u.id)}
              />
            </div>
          )
        })}
      </div>

      <h2 className="h5 mb-3">Novo Universo (prestígio)</h2>
      <div className="card border-warning">
        <div className="card-body">
          <p className="mb-2">
            Reinicie sua colônia e ganhe <strong>matéria escura</strong>: cada ponto aumenta em 10% tudo que você
            produz, para sempre.
          </p>
          <p className="text-body-secondary small">
            Disponível após coletar {formatNumber(PRESTIGE_MIN_RUN)} cristais em um mesmo universo. Nesta rodada você
            coletou {formatNumber(game.runEarned)}. Universos criados: {game.universes}.
          </p>
          <button className="btn btn-warning" disabled={gain === 0} onClick={handlePrestige}>
            <Icon name="arrow-repeat" /> {gain === 0 ? 'Ainda não disponível' : `Renascer e ganhar ${gain} de matéria escura`}
          </button>
        </div>
      </div>
    </div>
  )
}
