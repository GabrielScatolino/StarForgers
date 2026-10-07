import { Navigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

// Protege as páginas do jogo: sem piloto selecionado, volta para o início
export default function RequirePlayer({ children }) {
  const { player, loading } = useGame()

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-info" role="status" />
        <p className="mt-3 text-body-secondary">Carregando sua colônia...</p>
      </div>
    )
  }

  if (!player) return <Navigate to="/" replace />
  return children
}
