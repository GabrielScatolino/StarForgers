import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon, { Crystal, Emblem } from '../components/Icon'
import PlayerForm from '../components/PlayerForm'
import { useError } from '../context/ErrorContext'
import { useGame } from '../context/GameContext'
import { createPlayer, deletePlayer, getPlayers, updatePlayer } from '../services/playerService'
import { formatDate, formatNumber } from '../utils/format'
import { rankTitle } from '../utils/gameLogic'

export default function Home() {
  const { player, login, logout, syncProfile } = useGame()
  const { showError, clearError } = useError()
  const navigate = useNavigate()

  const [players, setPlayers] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [listFailed, setListFailed] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // READ: busca os pilotos na API
  const refresh = useCallback(async () => {
    setLoadingList(true)
    try {
      setPlayers(await getPlayers())
      setListFailed(false)
    } catch (err) {
      setListFailed(true)
      showError(err)
    } finally {
      setLoadingList(false)
    }
  }, [showError])

  useEffect(() => {
    refresh()
  }, [refresh])

  // CREATE
  const handleCreate = async (data) => {
    clearError()
    try {
      const created = await createPlayer(data)
      login(created.id)
      navigate('/jogo')
      return true
    } catch (err) {
      showError(err)
      return false
    }
  }

  const handlePlay = (id) => {
    login(id)
    navigate('/jogo')
  }

  // UPDATE: só nome e emblema (o progresso do jogo é salvo pelo autosave)
  const handleUpdate = async (target, data) => {
    clearError()
    try {
      const updated = await updatePlayer(target.id, data)
      setPlayers((list) => list.map((p) => (p.id === target.id ? updated : p)))
      if (player?.id === target.id) syncProfile({ name: updated.name, emblem: updated.emblem })
      setEditingId(null)
      return true
    } catch (err) {
      showError(err)
      return false
    }
  }

  // DELETE
  const handleDelete = async (target) => {
    if (!window.confirm(`Excluir o piloto "${target.name}"? Todo o progresso será perdido.`)) return
    clearError()
    try {
      await deletePlayer(target.id)
      if (player?.id === target.id) logout({ saveFirst: false })
      setPlayers((list) => list.filter((p) => p.id !== target.id))
    } catch (err) {
      showError(err)
    }
  }

  return (
    <div className="container py-4">
      <header className="text-center mb-5">
        <h1 className="display-5 fw-bold">
          <Icon name="rocket-takeoff" className="text-info" /> Colônia Espacial
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

          {loadingList && players.length === 0 ? (
            <div className="text-center py-4">
              <div className="spinner-border text-info" role="status" />
              <p className="mt-2 text-body-secondary">Buscando pilotos...</p>
            </div>
          ) : listFailed ? (
            <div className="alert alert-warning d-flex align-items-center justify-content-between gap-3">
              <span>Não foi possível carregar a lista de pilotos.</span>
              <button className="btn btn-sm btn-outline-warning" onClick={refresh} disabled={loadingList}>
                <Icon name="arrow-clockwise" /> Tentar de novo
              </button>
            </div>
          ) : players.length === 0 ? (
            <div className="alert alert-secondary">
              Nenhum piloto ainda. Crie o primeiro ao lado e comece a sua colônia!
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {players.map((p) => (
                <div key={p.id} className={`card${player?.id === p.id ? ' border-info' : ''}`}>
                  <div className="card-body">
                    {editingId === p.id ? (
                      <PlayerForm
                        initial={{ name: p.name, emblem: p.emblem }}
                        existingNames={players.filter((x) => x.id !== p.id).map((x) => x.name)}
                        submitLabel="Salvar alterações"
                        submitIcon="check-lg"
                        resetOnSuccess={false}
                        onSubmit={(data) => handleUpdate(p, data)}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <div className="d-flex align-items-center gap-3 flex-wrap">
                        <span className="fs-2 text-info">
                          <Emblem value={p.emblem} />
                        </span>
                        <div className="flex-grow-1">
                          <h3 className="h6 mb-0">{p.name}</h3>
                          <small className="text-body-secondary">
                            {rankTitle(p.game.lifetimeEarned)} · <Crystal value={formatNumber(p.game.lifetimeEarned)} />{' '}
                            no total · desde {formatDate(p.createdAt)}
                          </small>
                        </div>
                        <div className="d-flex gap-2">
                          <button className="btn btn-primary btn-sm" onClick={() => handlePlay(p.id)}>
                            {player?.id === p.id ? 'Continuar' : 'Jogar'}
                          </button>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => setEditingId(p.id)}
                            aria-label={`Editar ${p.name}`}
                          >
                            <Icon name="pencil-square" /> Editar
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
                    )}
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
