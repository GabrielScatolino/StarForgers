import { useId, useState } from 'react'
import { EMBLEMS } from '../data/gameData'
import Icon from './Icon'

const MIN_NAME = 3
const MAX_NAME = 16

// Formulário com inputs controlados: o estado do React é a "fonte da verdade" dos campos.
// Serve para criar (campos vazios) e para editar (passando `initial`).
// `onSubmit` pode ser assíncrono e deve devolver false se falhar (o formulário mantém o que foi digitado).
export default function PlayerForm({
  onSubmit,
  existingNames = [],
  initial = { name: '', emblem: EMBLEMS[0] },
  submitLabel = 'Criar piloto e decolar',
  submitIcon = 'rocket-takeoff',
  resetOnSuccess = true,
  onCancel,
}) {
  const inputId = useId()
  const [name, setName] = useState(initial.name)
  const [emblem, setEmblem] = useState(initial.emblem)
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const trimmed = name.trim()
  let error = ''
  if (trimmed.length < MIN_NAME) error = `O nome precisa ter pelo menos ${MIN_NAME} letras.`
  else if (existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase()))
    error = 'Já existe um piloto com esse nome.'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched(true)
    if (error || submitting) return

    setSubmitting(true)
    const ok = await onSubmit({ name: trimmed, emblem })
    setSubmitting(false)

    if (ok !== false && resetOnSuccess) {
      setName('')
      setTouched(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-3">
        <label htmlFor={inputId} className="form-label">Nome do piloto</label>
        <input
          id={inputId}
          type="text"
          className={`form-control${touched && error ? ' is-invalid' : ''}`}
          placeholder="Ex.: Capitão Nova"
          maxLength={MAX_NAME}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {touched && error && <div className="invalid-feedback">{error}</div>}
        <div className="form-text">{name.length}/{MAX_NAME} caracteres</div>
      </div>

      <div className="mb-3">
        <span className="form-label d-block">Emblema</span>
        <div className="d-flex flex-wrap gap-2">
          {EMBLEMS.map((e) => (
            <button
              key={e}
              type="button"
              className={`btn emblem-btn ${emblem === e ? 'btn-info' : 'btn-outline-secondary'}`}
              onClick={() => setEmblem(e)}
              aria-pressed={emblem === e}
              aria-label={`Emblema ${e}`}
            >
              <Icon name={e} />
            </button>
          ))}
        </div>
      </div>

      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary flex-grow-1" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm" aria-hidden="true" /> Enviando...
            </>
          ) : (
            <>
              <Icon name={submitIcon} /> {submitLabel}
            </>
          )}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={submitting}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
