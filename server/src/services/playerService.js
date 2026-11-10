// Regras de negócio: valida a entrada, chama o repositório e decide quando algo "não existe".
const repository = require('../repositories/playerRepository')
const validator = require('../validators/playerValidator')
const { NotFoundError } = require('../utils/errors')

const PLAYER_NOT_FOUND = 'Piloto não encontrado.'

async function list(query) {
  const { page, limit, sort, order } = validator.validateListQuery(query)
  const [data, total] = await Promise.all([
    repository.findAll({ sort, order, skip: (page - 1) * limit, limit }),
    repository.count(),
  ])
  return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } }
}

async function getById(id) {
  validator.validateId(id)
  const player = await repository.findById(id)
  if (!player) throw new NotFoundError(PLAYER_NOT_FOUND)
  return player
}

async function create(body) {
  const data = validator.validateCreate(body)
  return repository.create(data)
}

async function update(id, body, { partial = false } = {}) {
  validator.validateId(id)
  const changes = validator.validateUpdate(body, { partial })
  const player = await repository.update(id, changes)
  if (!player) throw new NotFoundError(PLAYER_NOT_FOUND)
  return player
}

async function remove(id) {
  validator.validateId(id)
  const player = await repository.remove(id)
  if (!player) throw new NotFoundError(PLAYER_NOT_FOUND)
}

module.exports = { list, getById, create, update, remove }
