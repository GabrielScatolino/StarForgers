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

const CURRENT_PLAYER_KEY = 'colonia-espacial:currentPlayer'
const TICK_MS = 100
const AUTOSAVE_MS = 5000

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
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(CURRENT_PLAYER_KEY)))
  const [offlineReport, setOfflineReport] = useState(null)

  const gameRef = useRef(null)
  const loadedIdRef = useRef(null)

  useEffect(() => {
    gameRef.current = game
  }, [game])

  // Salva o jogo atual no "banco" (localStorage hoje, API na Sprint 3)
  const save = useCallback(() => {
    const id = loadedIdRef.current
    const current = gameRef.current
    if (!id || !current) return
    updatePlayer(id, { game: { ...current, lastSaved: Date.now() } })
  }, [])

  // Carrega o jogador selecionado, migra saves antigos e aplica o ganho offline
  useEffect(() => {
    let cancelled = false
    loadedIdRef.current = null

    if (!currentId) {
      setPlayer(null)
      dispatch({ type: 'LOAD', game: null })
      setLoading(false)
      return
    }

    setLoading(true)
    getPlayer(currentId).then((found) => {
      if (cancelled) return
      if (!found) {
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
      setPlayer({ id: found.id, name: found.name, emblem: found.emblem })
      dispatch({ type: 'LOAD', game: loaded })
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [currentId])

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

  // Autosave periódico + ao fechar/esconder a aba
  useEffect(() => {
    if (!player) return
    const timer = setInterval(save, AUTOSAVE_MS)
    const onHide = () => document.visibilityState === 'hidden' && save()
    window.addEventListener('beforeunload', save)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      clearInterval(timer)
      window.removeEventListener('beforeunload', save)
      document.removeEventListener('visibilitychange', onHide)
      save()
    }
  }, [player, save])

  // Salva imediatamente após compras, colonização e prestígio
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

  const logout = useCallback(() => {
    save()
    localStorage.removeItem(CURRENT_PLAYER_KEY)
    setCurrentId(null)
  }, [save])

  const value = useMemo(
    () => ({
      player,
      game,
      loading,
      offlineReport,
      clearOfflineReport: () => setOfflineReport(null),
      totalCps: game ? cps(game) : 0,
      login,
      logout,
      click: () => dispatch({ type: 'CLICK' }),
      selectPlanet: (id) => dispatch({ type: 'SELECT_PLANET', id }),
      colonize: (id) => dispatch({ type: 'COLONIZE', id }),
      buyGenerator: (id) => dispatch({ type: 'BUY_GENERATOR', id }),
      buyClickUpgrade: (id) => dispatch({ type: 'BUY_CLICK_UPGRADE', id }),
      prestige: () => dispatch({ type: 'PRESTIGE' }),
      dev: (command, ...args) => dispatch({ type: 'DEV', command, args }),
    }),
    [player, game, loading, offlineReport, login, logout],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame deve ser usado dentro de <GameProvider>')
  return ctx
}
