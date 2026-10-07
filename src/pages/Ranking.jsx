import { useEffect, useState } from 'react'
import Icon, { Crystal, Emblem } from '../components/Icon'
import { useGame } from '../context/GameContext'
import { getPlayers } from '../services/playerService'
import { formatNumber } from '../utils/format'
import { rankTitle } from '../utils/gameLogic'

const MEDAL_COLORS = ['text-warning', 'text-secondary', 'text-danger-emphasis']

export default function Ranking() {
  const { player, game } = useGame()
  const [players, setPlayers] = useState([])

  useEffect(() => {
    getPlayers().then(setPlayers)
  }, [])

  // O jogador atual usa o estado ao vivo (o salvamento é periódico)
  const rows = players
    .map((p) => ({ ...p, game: p.id === player.id ? game : p.game }))
    .sort((a, b) => b.game.lifetimeEarned - a.game.lifetimeEarned)

  return (
    <div className="container py-4">
      <h1 className="h3 mb-1">
        <Icon name="trophy" /> Ranking
      </h1>
      <p className="text-body-secondary">
        Classificação pelo total de cristais coletados. Por enquanto só os pilotos deste navegador aparecem; na
        próxima etapa o ranking será global.
      </p>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Piloto</th>
              <th>Patente</th>
              <th className="text-end">Total coletado</th>
              <th className="text-end d-none d-md-table-cell">Planetas</th>
              <th className="text-end d-none d-md-table-cell">Universos</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={p.id} className={p.id === player.id ? 'table-info' : ''}>
                <td>{i < 3 ? <Icon name="trophy-fill" className={MEDAL_COLORS[i]} /> : i + 1}</td>
                <td>
                  <Emblem value={p.emblem} /> {p.name}
                  {p.id === player.id && <span className="badge text-bg-info ms-2">você</span>}
                </td>
                <td>{rankTitle(p.game.lifetimeEarned)}</td>
                <td className="text-end">
                  <Crystal value={formatNumber(p.game.lifetimeEarned)} />
                </td>
                <td className="text-end d-none d-md-table-cell">{p.game.planets?.length ?? 1}</td>
                <td className="text-end d-none d-md-table-cell">{p.game.universes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
