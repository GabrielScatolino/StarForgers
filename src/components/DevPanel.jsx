import { useEffect, useState } from 'react'
import { useGame } from '../context/GameContext'
import { getPlanet } from '../data/gameData'
import Icon from './Icon'

const STORAGE_KEY = 'colonia-espacial:devMode'
const SECRET_CODE = 'devmode' // digite isso em qualquer lugar (fora de campos de texto) para ligar/desligar

function readEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

// Modo desenvolvedor: painel escondido com atalhos para testar o jogo sem esperar.
export default function DevPanel() {
  const { game, dev } = useGame()
  const [enabled, setEnabled] = useState(readEnabled)
  const [open, setOpen] = useState(false)

  // Detecta o código secreto digitado no teclado
  useEffect(() => {
    let typed = ''
    const onKey = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key.length !== 1) return
      typed = (typed + e.key.toLowerCase()).slice(-SECRET_CODE.length)
      if (typed === SECRET_CODE) {
        typed = ''
        setEnabled((on) => {
          localStorage.setItem(STORAGE_KEY, on ? '0' : '1')
          return !on
        })
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!enabled || !game) return null

  const planet = getPlanet(game.activePlanet)

  const disable = () => {
    localStorage.setItem(STORAGE_KEY, '0')
    setEnabled(false)
    setOpen(false)
  }

  const reset = () => {
    if (window.confirm('Zerar TODO o progresso deste piloto?')) dev('resetProgress')
  }

  const actions = [
    { label: '+1 mil cristais', run: () => dev('addCrystals', 1_000) },
    { label: '+1 milhão', run: () => dev('addCrystals', 1_000_000) },
    { label: '+1 bilhão', run: () => dev('addCrystals', 1_000_000_000) },
    { label: 'Avançar 1 hora', run: () => dev('warp', 3600) },
    { label: 'Avançar 24 horas', run: () => dev('warp', 86400) },
    { label: 'Colonizar todos os planetas', run: () => dev('unlockAllPlanets') },
    { label: `+25 de cada na frota (${planet.name})`, run: () => dev('fillFleet', planet.id, 25) },
    { label: `Todas as melhorias de clique (${planet.name})`, run: () => dev('buyAllClickUpgrades', planet.id) },
    { label: '+5 matéria escura', run: () => dev('addDarkMatter', 5) },
  ]

  return (
    <div className="dev-panel">
      {open && (
        <div className="card shadow">
          <div className="card-header d-flex justify-content-between align-items-center">
            <strong>
              <Icon name="terminal" /> Modo desenvolvedor
            </strong>
            <button className="btn-close" aria-label="Fechar painel" onClick={() => setOpen(false)} />
          </div>
          <div className="card-body d-grid gap-2">
            {actions.map((a) => (
              <button key={a.label} className="btn btn-sm btn-outline-info text-start" onClick={a.run}>
                {a.label}
              </button>
            ))}
            <button className="btn btn-sm btn-outline-danger text-start" onClick={reset}>
              Zerar progresso
            </button>
            <button className="btn btn-sm btn-outline-secondary text-start" onClick={disable}>
              Desativar modo desenvolvedor
            </button>
            <div className="form-text">Para ligar de novo, digite &quot;{SECRET_CODE}&quot; em qualquer página.</div>
          </div>
        </div>
      )}
      <button className="btn btn-warning btn-sm fw-bold dev-toggle" onClick={() => setOpen((o) => !o)}>
        <Icon name="terminal" /> DEV
      </button>
    </div>
  )
}
