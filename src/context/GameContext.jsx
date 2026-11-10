import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { CLICK_UPGRADES, GENERATORS, OFFLINE_CAP_SECONDS, getPlanet } from '../data/gameData'
import { DEV_COMMANDS } from '../utils/devTools'
import {
  clickPower,
  cps,
  createInitialGameState,
  earn,
  generatorCost,
  isColonized,
  migrateGameState,
  prestigeGain,
} from '../utils/gameLogic'
import { getPlayer, updatePlayer } from '../services/playerService'
import { useError } from './ErrorContext'

const CURRENT_PLAYER_KEY = 'colonia-espacial:currentPlayer'
const TICK_MS = 100
const AUTOSAVE_MS = 5000
const SAVE_ERROR = 'Não foi possível salvar o seu progresso no servidor. Vamos tentar de novo automaticamente.'

// Reducer: toda mudança no estado do jogo passa por aqui (previsível e fácil de explicar)
function gameReducer(state, action) {
  if (action.type === 'LOAD') return action.game
  if (state === null) return state

  switch (action.type) {
    case 'TICK':
      return earn(state, cps(state) * action.seconds)

    case 'CLICK':
      return { ...earn(state, clickPower(state, state.activePlanet)), clicks: state.clicks + 1 }

    case 'SELECT_PLANET':
      return isColonized(state, action.id) ? { ...state, activePlanet: action.id } : state

    case 'COLONIZE': {
      const planet = getPlanet(action.id)
      if (isColonized(state, planet.id) || state.crystals < planet.unlockCost) return state
      return {
        ...state,
        crystals: state.crystals - planet.unlockCost,
        planets: [...state.planets, planet.id],
        activePlanet: planet.id,
      }
    }

    case 'BUY_GENERATOR': {
      const gen = GENERATORS.find((g) => g.id === action.id)
      if (!gen || !isColonized(state, gen.planetId)) return state
      const owned = state.generators[gen.id] || 0
      const cost = generatorCost(gen, owned)
      if (state.crystals < cost) return state
      return {
        ...state,
        crystals: state.crystals - cost,
        generators: { ...state.generators, [gen.id]: owned + 1 },
      }
    }

    case 'BUY_CLICK_UPGRADE': {
      const upgrade = CLICK_UPGRADES.find((u) => u.id === action.id)
      if (!upgrade || !isColonized(state, upgrade.planetId)) return state
      if (state.clickUpgrades.includes(upgrade.id) || state.crystals < upgrade.cost) return state
      return {
        ...state,
        crystals: state.crystals - upgrade.cost,
        clickUpgrades: [...state.clickUpgrades, upgrade.id],
      }
    }

    case 'PRESTIGE': {
      const gain = prestigeGain(state)
      if (gain === 0) return state
      return {
        ...createInitialGameState(),
        lifetimeEarned: state.lifetimeEarned,
        clicks: state.clicks,
        darkMatter: state.darkMatter + gain,
        universes: state.universes + 1,
      }
    }

    case 'DEV': {
      const command = DEV_COMMANDS[action.command]
      return command ? command(state, ...action.args) : state
    }

    default:
      return state
  }
}

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [game, dispatch] = useReducer(gameReducer, null)
  const [player, setPlayer] = useState(null) // { id, name, emblem }
  const [currentId, setCurrentId] = useState(() => localStorage.getItem(CURRENT_PLAYER_KEY))
  const [offlineReport, setOfflineReport] = useState(null)
  const [loadError, setLoadError] = useState(null) // falha ao abrir o piloto (ex.: API fora do ar)
  const [loadAttempt, setLoadAttempt] = useState(0) // muda para forçar uma nova tentativa de carregar
  const { showError, clearError } = useError()

  // "Carregando" é derivado: há um piloto escolhido, mas ele ainda não terminou de abrir.
  // Calculado direto (e não em um useEffect) para que, no mesmo instante em que o usuário
  // clica em "Jogar", as páginas já saibam que devem esperar em vez de redirecionar para o início.
  const loading = Boolean(currentId) && player?.id !== currentId && !loadError

  const gameRef = useRef(null)
  const loadedIdRef = useRef(null)
  const savingRef = useRef(false)
  const pendingSaveRef = useRef(false)
  const saveFailedRef = useRef(false)

  useEffect(() => {
    gameRef.current = game
  }, [game])

  // Envia o jogo atual para a API. Só um envio por vez: se chegar outro pedido durante um
  // envio, ele fica pendente e roda logo depois (assim nenhuma alteração fica para trás).
  const save = useCallback(
    async function saveGame({ keepalive = false } = {}) {
      const id = loadedIdRef.current
      const current = gameRef.current
      if (!id || !current) return
      if (savingRef.current) {
        pendingSaveRef.current = true
        return
      }

      savingRef.current = true
      try {
        await updatePlayer(id, { game: { ...current, lastSaved: Date.now() } }, { keepalive })
        if (saveFailedRef.current) {
          saveFailedRef.current = false
          clearError(SAVE_ERROR)
        }
      } catch {
        saveFailedRef.current = true
        showError(SAVE_ERROR)
      } finally {
        savingRef.current = false
        if (pendingSaveRef.current) {
          pendingSaveRef.current = false
          saveGame({ keepalive })
        }
      }
    },
    [showError, clearError],
  )

  // Carrega o jogador selecionado, migra saves antigos e aplica o ganho offline
  useEffect(() => {
    let cancelled = false
    loadedIdRef.current = null
    setLoadError(null)

    if (!currentId) {
      setPlayer(null)
      dispatch({ type: 'LOAD', game: null })
      return
    }

    getPlayer(currentId)
      .then((found) => {
        if (cancelled) return
        if (!found) {
          // O piloto foi removido do servidor: esquece a seleção
          localStorage.removeItem(CURRENT_PLAYER_KEY)
          setCurrentId(null)
          return
        }
        let loaded = migrateGameState(found.game)
        const elapsed = Math.min((Date.now() - loaded.lastSaved) / 1000, OFFLINE_CAP_SECONDS)
        const gain = cps(loaded) * elapsed
        if (elapsed > 30 && gain > 0) {
          loaded = earn(loaded, gain)
          setOfflineReport({ seconds: elapsed, gain })
        }
        loadedIdRef.current = found.id
        saveFailedRef.current = false
        setPlayer({ id: found.id, name: found.name, emblem: found.emblem })
        dispatch({ type: 'LOAD', game: loaded })
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(err.message)
      })

    return () => {
      cancelled = true
    }
  }, [currentId, loadAttempt])

  // Loop do jogo: usa o tempo real decorrido, então funciona mesmo com a aba em segundo plano
  useEffect(() => {
    if (!player) return
    let last = Date.now()
    const timer = setInterval(() => {
      const now = Date.now()
      dispatch({ type: 'TICK', seconds: (now - last) / 1000 })
      last = now
    }, TICK_MS)
    return () => clearInterval(timer)
  }, [player])

  // Autosave periódico + ao fechar/esconder a aba (keepalive deixa o envio terminar mesmo fechando)
  useEffect(() => {
    if (!player) return
    const timer = setInterval(() => save(), AUTOSAVE_MS)
    const onUnload = () => save({ keepalive: true })
    const onHide = () => document.visibilityState === 'hidden' && save({ keepalive: true })
    window.addEventListener('beforeunload', onUnload)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      clearInterval(timer)
      window.removeEventListener('beforeunload', onUnload)
      document.removeEventListener('visibilitychange', onHide)
      save()
    }
  }, [player, save])

  // Salva logo após compras, colonização e prestígio (sem esperar os 5 s)
  useEffect(() => {
    if (game) save()
  }, [game?.clickUpgrades, game?.generators, game?.planets, game?.universes, save]) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(
    (id) => {
      save()
      localStorage.setItem(CURRENT_PLAYER_KEY, id)
      setCurrentId(id)
    },
    [save],
  )

  // saveFirst: false é usado ao excluir o piloto atual (não faz sentido salvar quem acabou de ser apagado)
  const logout = useCallback(
    ({ saveFirst = true } = {}) => {
      if (saveFirst) save()
      loadedIdRef.current = null
      localStorage.removeItem(CURRENT_PLAYER_KEY)
      setCurrentId(null)
    },
    [save],
  )

  const value = useMemo(
    () => ({
      player,
      game,
      loading,
      loadError,
      reload: () => setLoadAttempt((n) => n + 1),
      offlineReport,
      clearOfflineReport: () => setOfflineReport(null),
      totalCps: game ? cps(game) : 0,
      login,
      logout,
      syncProfile: (changes) => setPlayer((current) => (current ? { ...current, ...changes } : current)),
      click: () => dispatch({ type: 'CLICK' }),
      selectPlanet: (id) => dispatch({ type: 'SELECT_PLANET', id }),
      colonize: (id) => dispatch({ type: 'COLONIZE', id }),
      buyGenerator: (id) => dispatch({ type: 'BUY_GENERATOR', id }),
      buyClickUpgrade: (id) => dispatch({ type: 'BUY_CLICK_UPGRADE', id }),
      prestige: () => dispatch({ type: 'PRESTIGE' }),
      dev: (command, ...args) => dispatch({ type: 'DEV', command, args }),
    }),
    [player, game, loading, loadError, offlineReport, login, logout],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame deve ser usado dentro de <GameProvider>')
  return ctx
}
