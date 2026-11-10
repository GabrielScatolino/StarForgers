// Validação dos dados que chegam pela API. Funções puras: recebem o corpo da requisição e
// devolvem os dados limpos, ou lançam ValidationError com a lista de campos inválidos.
const { ValidationError } = require('../utils/errors')

const NAME_MIN = 3
const NAME_MAX = 16
const EMBLEM_MAX = 40
const MAX_LIST_ITEMS = 100
const ID_PATTERN = /^[a-f\d]{24}$/i

const SORT_FIELDS = ['createdAt', 'name', 'lifetimeEarned']
const SORT_ORDERS = ['asc', 'desc']
const DEFAULT_LIMIT = 50
const MAX_LIMIT = 100

const GAME_NUMBER_FIELDS = ['crystals', 'lifetimeEarned', 'runEarned', 'clicks', 'darkMatter', 'universes']

const isPlainObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value)
const isNonNegativeNumber = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0

function throwIfErrors(errors) {
  if (errors.length > 0) throw new ValidationError('Dados inválidos.', errors)
}

function validateId(id) {
  if (typeof id !== 'string' || !ID_PATTERN.test(id)) {
    throw new ValidationError('O identificador informado é inválido.', [
      { field: 'id', message: 'Deve ter 24 caracteres hexadecimais.' },
    ])
  }
  return id
}

function checkName(name, errors) {
  if (typeof name !== 'string') {
    errors.push({ field: 'name', message: 'O nome é obrigatório e deve ser um texto.' })
    return undefined
  }
  const trimmed = name.trim()
  if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX) {
    errors.push({ field: 'name', message: `O nome deve ter entre ${NAME_MIN} e ${NAME_MAX} caracteres.` })
    return undefined
  }
  return trimmed
}

function checkEmblem(emblem, errors) {
  if (typeof emblem !== 'string' || emblem.trim().length === 0 || emblem.trim().length > EMBLEM_MAX) {
    errors.push({ field: 'emblem', message: `O emblema é obrigatório (até ${EMBLEM_MAX} caracteres).` })
    return undefined
  }
  return emblem.trim()
}

function checkGame(game, errors) {
  if (!isPlainObject(game)) {
    errors.push({ field: 'game', message: 'O estado do jogo deve ser um objeto.' })
    return undefined
  }
  const before = errors.length

  GAME_NUMBER_FIELDS.forEach((field) => {
    if (!isNonNegativeNumber(game[field])) {
      errors.push({ field: `game.${field}`, message: 'Deve ser um número maior ou igual a zero.' })
    }
  })

  const isStringList = (list) =>
    Array.isArray(list) &&
    list.length <= MAX_LIST_ITEMS &&
    list.every((item) => typeof item === 'string' && item.length > 0 && item.length <= 60)

  if (!isStringList(game.planets) || game.planets.length === 0) {
    errors.push({ field: 'game.planets', message: 'Deve ser uma lista não vazia de textos.' })
  }
  if (!isStringList(game.clickUpgrades)) {
    errors.push({ field: 'game.clickUpgrades', message: 'Deve ser uma lista de textos.' })
  }
  if (typeof game.activePlanet !== 'string' || game.activePlanet.length === 0) {
    errors.push({ field: 'game.activePlanet', message: 'Deve ser um texto não vazio.' })
  }
  if (
    !isPlainObject(game.generators) ||
    Object.keys(game.generators).length > MAX_LIST_ITEMS ||
    !Object.values(game.generators).every(isNonNegativeNumber)
  ) {
    errors.push({ field: 'game.generators', message: 'Deve ser um objeto com quantidades numéricas (>= 0).' })
  }

  return errors.length === before ? game : undefined
}

// Estado inicial usado quando o cliente cria um piloto sem informar `game`
function defaultGame() {
  return {
    version: 2,
    crystals: 0,
    lifetimeEarned: 0,
    runEarned: 0,
    clicks: 0,
    planets: ['pedrinha'],
    activePlanet: 'pedrinha',
    generators: {},
    clickUpgrades: [],
    darkMatter: 0,
    universes: 0,
    lastSaved: Date.now(),
  }
}

// POST /players
function validateCreate(body) {
  if (!isPlainObject(body)) throw new ValidationError('O corpo da requisição deve ser um objeto JSON.')
  const errors = []
  const name = checkName(body.name, errors)
  const emblem = checkEmblem(body.emblem, errors)
  const game = body.game === undefined ? defaultGame() : checkGame(body.game, errors)
  throwIfErrors(errors)
  return { name, emblem, game }
}

// PUT /players/:id (substitui tudo) e PATCH /players/:id (só o que foi enviado)
function validateUpdate(body, { partial }) {
  if (!isPlainObject(body)) throw new ValidationError('O corpo da requisição deve ser um objeto JSON.')
  const errors = []
  const changes = {}
  const fields = [
    ['name', checkName],
    ['emblem', checkEmblem],
    ['game', checkGame],
  ]

  fields.forEach(([field, check]) => {
    if (body[field] === undefined && partial) return
    const value = check(body[field], errors)
    if (value !== undefined) changes[field] = value
  })

  throwIfErrors(errors)
  if (Object.keys(changes).length === 0) {
    throw new ValidationError('Envie ao menos um campo para atualizar (name, emblem ou game).')
  }
  return changes
}

// GET /players?page=&limit=&sort=&order=
function validateListQuery(query = {}) {
  const errors = []
  const page = query.page === undefined ? 1 : Number(query.page)
  const limit = query.limit === undefined ? DEFAULT_LIMIT : Number(query.limit)
  const sort = query.sort === undefined ? 'createdAt' : query.sort
  const order = query.order === undefined ? 'asc' : query.order

  if (!Number.isInteger(page) || page < 1) {
    errors.push({ field: 'page', message: 'Deve ser um inteiro maior ou igual a 1.' })
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    errors.push({ field: 'limit', message: `Deve ser um inteiro entre 1 e ${MAX_LIMIT}.` })
  }
  if (!SORT_FIELDS.includes(sort)) {
    errors.push({ field: 'sort', message: `Valores aceitos: ${SORT_FIELDS.join(', ')}.` })
  }
  if (!SORT_ORDERS.includes(order)) {
    errors.push({ field: 'order', message: `Valores aceitos: ${SORT_ORDERS.join(', ')}.` })
  }

  throwIfErrors(errors)
  return { page, limit, sort, order }
}

module.exports = {
  validateId,
  validateCreate,
  validateUpdate,
  validateListQuery,
  defaultGame,
  SORT_FIELDS,
  SORT_ORDERS,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  NAME_MIN,
  NAME_MAX,
}
