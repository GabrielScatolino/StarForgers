import { useError } from '../context/ErrorContext'
import Icon from './Icon'

// Aviso de erro fixo no topo da tela, visível em qualquer página
export default function ErrorBanner() {
  const { error, clearError } = useError()
  if (!error) return null

  return (
    <div className="error-banner" role="alert">
      <div className="alert alert-danger shadow d-flex align-items-start gap-2 mb-0">
        <Icon name="exclamation-triangle-fill" className="mt-1" />
        <div className="flex-grow-1">{error.message}</div>
        <button type="button" className="btn-close" aria-label="Fechar aviso" onClick={() => clearError()} />
      </div>
    </div>
  )
}
