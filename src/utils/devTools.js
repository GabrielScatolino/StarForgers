// Comandos do modo desenvolvedor: funções puras que recebem o estado e devolvem um novo estado.
// Servem para testar o jogo sem esperar horas (e para demonstrar tudo na apresentação).
import { PLANETS, getPlanet } from '../data/gameData'
import { cps, createInitialGameState, earn } from './gameLogic'

export const DEV_COMMANDS = {
  // Dá cristais (conta para o total e para o ranking)
  addCrystals: (state, amount) => earn(state, amount),

  // Avança o tempo: entrega o que a colônia produziria em N segundos
  warp: (state, seconds) => earn(state, cps(state) * seconds),

  // Coloniza todos os planetas de uma vez
  unlockAllPlanets: (state) => ({ ...state, planets: PLANETS.map((p) => p.id) }),

  // Dá N unidades de cada gerador do planeta informado
  fillFleet: (state, planetId, amount = 25) => {
    const generators = { ...state.generators }
    getPlanet(planetId).generators.forEach((g) => {
      generators[g.id] = (generators[g.id] || 0) + amount
    })
    return { ...state, generators }
  },

  // Compra todas as melhorias de clique do planeta informado
  buyAllClickUpgrades: (state, planetId) => {
    const ids = getPlanet(planetId).clickUpgrades.map((u) => u.id)
    return { ...state, clickUpgrades: [...new Set([...state.clickUpgrades, ...ids])] }
  },

  addDarkMatter: (state, amount) => ({ ...state, darkMatter: state.darkMatter + amount }),

  // Recomeça do zero (mantém só o nome e o emblema, que ficam fora do estado do jogo)
  resetProgress: () => createInitialGameState(),
}
