import { Navigate, useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import Icon from './Icon'

// Protege as páginas do jogo: sem piloto selecionado, volta para o início.
// Se a API estiver fora do ar ao abrir o piloto, mostra o erro com opção de tentar de novo.
export default function RequirePlayer({ children }) {
  const { player, loading, loadError, reload, logout } = useGame()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-info" role="status" />
        <p className="mt-3 text-body-secondary">Carregando sua colônia...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="container py-5" style={{ maxWidth: 560 }}>
        <div className="card border-danger">
          <div className="card-body text-center">
            <Icon name="cloud-slash" className="display-5 text-danger" />
            <h1 className="h5 mt-3">Não foi possível abrir sua colônia</h1>
            <p className="text-body-secondary">{loadError}</p>
            <div className="d-flex justify-content-center gap-2">
              <button className="btn btn-primary" onClick={reload}>
                <Icon name="arrow-clockwise" /> Tentar de novo
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  logout({ saveFirst: false })
                  navigate('/')
                }}
              >
                Voltar ao início
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!player) return <Navigate to="/" replace />
  return children
}
