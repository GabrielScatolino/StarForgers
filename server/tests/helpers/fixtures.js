// Dados de exemplo compartilhados pelos testes
const validGame = () => ({
  version: 2,
  crystals: 1190,
  lifetimeEarned: 2160,
  runEarned: 2160,
  clicks: 355,
  planets: ['pedrinha'],
  activePlanet: 'pedrinha',
  generators: { 'pedrinha-g1': 13 },
  clickUpgrades: ['pedrinha-c1'],
  darkMatter: 0,
  universes: 0,
  lastSaved: 1793000000000,
})

const VALID_ID = '671f9c2e8a1b2c3d4e5f6a7b'

const makePlayer = (overrides = {}) => ({
  id: VALID_ID,
  name: 'Capitão Pug',
  emblem: 'rocket-takeoff',
  game: validGame(),
  ...overrides,
})

module.exports = { validGame, makePlayer, VALID_ID }
