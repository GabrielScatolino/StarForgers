import { createContext, useCallback, useContext, useMemo, useState } from 'react'

// Guarda a mensagem de erro atual para qualquer parte do app mostrar ao usuário
// (o <ErrorBanner /> exibe, e qualquer componente pode chamar showError).
const ErrorContext = createContext(null)

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null)

  const showError = useCallback((input) => {
    setError({ message: input instanceof Error ? input.message : String(input) })
  }, [])

  // Sem argumento, limpa qualquer erro. Com uma mensagem, limpa só se for essa mesma
  // (assim uma recuperação do autosave não apaga um erro de outra ação).
  const clearError = useCallback((onlyMessage) => {
    setError((current) => (onlyMessage === undefined || current?.message === onlyMessage ? null : current))
  }, [])

  const value = useMemo(() => ({ error, showError, clearError }), [error, showError, clearError])
  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
}

export function useError() {
  const ctx = useContext(ErrorContext)
  if (!ctx) throw new Error('useError deve ser usado dentro de <ErrorProvider>')
  return ctx
}
