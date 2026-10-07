// Regras do jogo em funções puras (sem React), fáceis de testar e de explicar.
import {
  COST_GROWTH,
  FIRST_PLANET_ID,
  GAME_VERSION,
  GENERATORS,
  PRESTIGE_MIN_RUN,
  RANKS,
  getPlanet,
} from '../data/gameData'

export function createInitialGameState() {
  return {
    version: GAME_VERSION,
    crystals: 0,
    lifetimeEarned: 0, // total coletado em toda a vida (usado no ranking)
    runEarned: 0, // total coletado desde o último "Novo Universo"
    clicks: 0,
    planets: [FIRST_PLANET_ID], // planetas já colonizados
    activePlanet: FIRST_PLANET_ID, // planeta que está sendo exibido
    generators: {}, // { 'pedrinha-g1': 3 }
    clickUpgrades: [], // ids comprados
    darkMatter: 0, // bônus permanente do prestígio
    universes: 0, // quantas vezes renasceu
    lastSaved: Date.now(),
  }
}

// Saves antigos (versão 1) tinham uma frota única. Aproveitamos o que dá e descartamos o resto.
const LEGACY_IDS = {
  drone: 'pedrinha-g1',
  satelite: 'pedrinha-g2',
  estacao: 'pedrinha-g3',
  laser1: 'pedrinha-c1',
  laser2: 'pedrinha-c2',
}

export function migrateGameState(raw) {
  const base = createInitialGameState()
  if (!raw) return base
  if (raw.version === GAME_VERSION) return { ...base, ...raw }

  const generators = {}
  Object.entries(raw.generators ?? {}).forEach(([oldId, count]) => {
    if (LEGACY_IDS[oldId]) generators[LEGACY_IDS[oldId]] = count
  })
  const clickUpgrades = (raw.clickUpgrades ?? []).map((id) => LEGACY_IDS[id]).filter(Boolean)

  return {
    ...base,
    crystals: raw.crystals ?? 0,
    lifetimeEarned: raw.lifetimeEarned ?? 0,
    runEarned: raw.runEarned ?? 0,
    clicks: raw.clicks ?? 0,
    darkMatter: raw.darkMatter ?? 0,
    universes: raw.universes ?? 0,
    lastSaved: raw.lastSaved ?? Date.now(),
    generators,
    clickUpgrades,
  }
}

export function generatorCost(gen, owned) {
  return Math.ceil(gen.baseCost * Math.pow(COST_GROWTH, owned))
}

// Cada ponto de matéria escura dá +10% em tudo
export function prestigeMultiplier(state) {
  return 1 + state.darkMatter * 0.1
}

// Cristais por clique em um planeta específico
export function clickPower(state, planetId) {
  const planet = getPlanet(planetId)
  const bonus = planet.clickUpgrades
    .filter((u) => state.clickUpgrades.includes(u.id))
    .reduce((sum, u) => sum + u.bonus, 0)
  return (planet.clickBase + bonus) * prestigeMultiplier(state)
}

// Cristais por segundo de um planeta (ou de todos, se nenhum for informado)
export function cps(state, planetId) {
  const gens = planetId ? getPlanet(planetId).generators : GENERATORS
  const base = gens.reduce((sum, g) => sum + g.cps * (state.generators[g.id] || 0), 0)
  return base * prestigeMultiplier(state)
}

// Matéria escura que o jogador ganharia renascendo agora
export function prestigeGain(state) {
  if (state.runEarned < PRESTIGE_MIN_RUN) return 0
  return Math.floor(Math.sqrt(state.runEarned / PRESTIGE_MIN_RUN))
}

export function isColonized(state, planetId) {
  return state.planets.includes(planetId)
}

export function rankTitle(lifetimeEarned) {
  return [...RANKS].reverse().find((r) => lifetimeEarned >= r.min)?.title ?? RANKS[0].title
}

// Adiciona cristais ganhos (clique, tick ou offline) atualizando os totais
export function earn(state, amount) {
  return {
    ...state,
    crystals: state.crystals + amount,
    lifetimeEarned: state.lifetimeEarned + amount,
    runEarned: state.runEarned + amount,
  }
}
