import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon, { Crystal, Emblem } from '../components/Icon'
import PlayerForm from '../components/PlayerForm'
import { useGame } from '../context/GameContext'
import { createPlayer, deletePlayer, getPlayers } from '../services/playerService'
import { formatDate, formatNumber } from '../utils/format'
import { rankTitle } from '../utils/gameLogic'

export default function Home() {
  const { player, login, logout } = useGame()
  const navigate = useNavigate()
  const [players, setPlayers] = useState([])

  const refresh = () => getPlayers().then(setPlayers)

  useEffect(() => {
    refresh()
  }, [])

  const handleCreate = async (data) => {
    const created = await createPlayer(data)
    await refresh()
    login(created.id)
    navigate('/jogo')
  }

  const handlePlay = (id) => {
    login(id)
    navigate('/jogo')
  }

  const handleDelete = async (p) => {
    if (!window.confirm(`Excluir o piloto "${p.name}"? Todo o progresso será perdido.`)) return
    if (player?.id === p.id) logout()
    await deletePlayer(p.id)
    refresh()
  }

  return (
    <div className="container py-4">
      <header className="text-center mb-5">
        <h1 className="display-5 fw-bold">
          <Icon name="rocket-takeoff" className="text-info" /> StarForgers
        </h1>
        <p className="lead text-body-secondary">
          Minere cristais, colonize planetas e expanda sua colônia pela galáxia.
        </p>
      </header>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card">
            <div className="card-body">
              <h2 className="h5 mb-3">Novo piloto</h2>
              <PlayerForm onSubmit={handleCreate} existingNames={players.map((p) => p.name)} />
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <h2 className="h5 mb-3">Pilotos cadastrados ({players.length})</h2>
          {players.length === 0 ? (
            <div className="alert alert-secondary">
              Nenhum piloto ainda. Crie o primeiro ao lado e comece a sua colônia!
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {players.map((p) => (
                <div key={p.id} className={`card${player?.id === p.id ? ' border-info' : ''}`}>
                  <div className="card-body d-flex align-items-center gap-3 flex-wrap">
                    <span className="fs-2 text-info">
                      <Emblem value={p.emblem} />
                    </span>
                    <div className="flex-grow-1">
                      <h3 className="h6 mb-0">{p.name}</h3>
                      <small className="text-body-secondary">
                        {rankTitle(p.game.lifetimeEarned)} · <Crystal value={formatNumber(p.game.lifetimeEarned)} /> no
                        total · desde {formatDate(p.createdAt)}
                      </small>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-primary btn-sm" onClick={() => handlePlay(p.id)}>
                        {player?.id === p.id ? 'Continuar' : 'Jogar'}
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(p)}
                        aria-label={`Excluir ${p.name}`}
                      >
                        <Icon name="trash" /> Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
