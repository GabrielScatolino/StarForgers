import { useState } from 'react'
import { EMBLEMS } from '../data/gameData'
import Icon from './Icon'

const MIN_NAME = 3
const MAX_NAME = 16

// Formulário com inputs controlados: o estado do React é a "fonte da verdade" dos campos
export default function PlayerForm({ onSubmit, existingNames = [] }) {
  const [name, setName] = useState('')
  const [emblem, setEmblem] = useState(EMBLEMS[0])
  const [touched, setTouched] = useState(false)

  const trimmed = name.trim()
  let error = ''
  if (trimmed.length < MIN_NAME) error = `O nome precisa ter pelo menos ${MIN_NAME} letras.`
  else if (existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase()))
    error = 'Já existe um piloto com esse nome.'

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (error) return
    onSubmit({ name: trimmed, emblem })
    setName('')
    setTouched(false)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-3">
        <label htmlFor="playerName" className="form-label">Nome do piloto</label>
        <input
          id="playerName"
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

      <button type="submit" className="btn btn-primary w-100">
        <Icon name="rocket-takeoff" /> Criar piloto e decolar
      </button>
    </form>
  )
}
