import { useCallback, useEffect, useState } from 'react'
import Icon, { Crystal, Emblem } from '../components/Icon'
import { useError } from '../context/ErrorContext'
import { useGame } from '../context/GameContext'
import { getPlayers } from '../services/playerService'
import { formatNumber } from '../utils/format'
import { rankTitle } from '../utils/gameLogic'

const MEDAL_COLORS = ['text-warning', 'text-secondary', 'text-danger-emphasis']

export default function Ranking() {
  const { player, game } = useGame()
  const { showError, clearError } = useError()
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  // READ: o servidor já devolve ordenado pelo total coletado
  const load = useCallback(async () => {
    setLoading(true)
    clearError()
    try {
      setPlayers(await getPlayers({ sort: 'lifetimeEarned', order: 'desc', limit: 100 }))
      setFailed(false)
    } catch (err) {
      setFailed(true)
      showError(err)
    } finally {
      setLoading(false)
    }
  }, [showError, clearError])

  useEffect(() => {
    load()
  }, [load])

  // O jogador atual usa o estado ao vivo (o salvamento no servidor é periódico)
  const rows = players
    .map((p) => ({ ...p, game: p.id === player.id ? game : p.game }))
    .sort((a, b) => b.game.lifetimeEarned - a.game.lifetimeEarned)

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-start gap-3">
        <div>
          <h1 className="h3 mb-1">
            <Icon name="trophy" /> Ranking global
          </h1>
          <p className="text-body-secondary">
            Todos os pilotos cadastrados no servidor, classificados pelo total de cristais coletados.
          </p>
        </div>
        <button className="btn btn-outline-info btn-sm text-nowrap" onClick={load} disabled={loading}>
          <Icon name="arrow-clockwise" /> Atualizar
        </button>
      </div>

      {loading && players.length === 0 ? (
        <div className="text-center py-4">
          <div className="spinner-border text-info" role="status" />
          <p className="mt-2 text-body-secondary">Carregando ranking...</p>
        </div>
      ) : failed && players.length === 0 ? (
        <div className="alert alert-warning">Não foi possível carregar o ranking. Use o botão Atualizar para tentar de novo.</div>
      ) : (
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
      )}
    </div>
  )
}
