jest.mock('../../src/repositories/playerRepository')

const repository = require('../../src/repositories/playerRepository')
const service = require('../../src/services/playerService')
const { NotFoundError, ValidationError } = require('../../src/utils/errors')
const { validGame, makePlayer, VALID_ID } = require('../helpers/fixtures')

describe('playerService.list', () => {
  it('pagina e devolve metadados', async () => {
    repository.findAll.mockResolvedValue([makePlayer()])
    repository.count.mockResolvedValue(25)

    const result = await service.list({ page: '2', limit: '10', sort: 'lifetimeEarned', order: 'desc' })

    expect(repository.findAll).toHaveBeenCalledWith({ sort: 'lifetimeEarned', order: 'desc', skip: 10, limit: 10 })
    expect(result.meta).toEqual({ total: 25, page: 2, limit: 10, pages: 3 })
    expect(result.data).toHaveLength(1)
  })

  it('rejeita consulta inválida sem tocar no banco', async () => {
    await expect(service.list({ page: '-1' })).rejects.toBeInstanceOf(ValidationError)
    expect(repository.findAll).not.toHaveBeenCalled()
  })
})

describe('playerService.getById', () => {
  it('devolve o piloto', async () => {
    repository.findById.mockResolvedValue(makePlayer())
    await expect(service.getById(VALID_ID)).resolves.toEqual(makePlayer())
  })

  it('lança NotFoundError quando não existe', async () => {
    repository.findById.mockResolvedValue(null)
    await expect(service.getById(VALID_ID)).rejects.toBeInstanceOf(NotFoundError)
  })

  it('rejeita id inválido sem consultar o banco', async () => {
    await expect(service.getById('abc')).rejects.toBeInstanceOf(ValidationError)
    expect(repository.findById).not.toHaveBeenCalled()
  })
})

describe('playerService.create', () => {
  it('valida e grava', async () => {
    repository.create.mockResolvedValue(makePlayer())
    await service.create({ name: ' Nova ', emblem: 'fire', game: validGame() })
    expect(repository.create).toHaveBeenCalledWith({ name: 'Nova', emblem: 'fire', game: validGame() })
  })

  it('não grava dados inválidos', async () => {
    await expect(service.create({ name: 'a' })).rejects.toBeInstanceOf(ValidationError)
    expect(repository.create).not.toHaveBeenCalled()
  })
})

describe('playerService.update', () => {
  it('atualiza parcialmente', async () => {
    repository.update.mockResolvedValue(makePlayer({ name: 'Nova' }))
    const result = await service.update(VALID_ID, { name: 'Nova' }, { partial: true })
    expect(repository.update).toHaveBeenCalledWith(VALID_ID, { name: 'Nova' })
    expect(result.name).toBe('Nova')
  })

  it('exige todos os campos quando não é parcial (padrão)', async () => {
    await expect(service.update(VALID_ID, { name: 'Nova' })).rejects.toBeInstanceOf(ValidationError)
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('lança NotFoundError quando o piloto não existe', async () => {
    repository.update.mockResolvedValue(null)
    await expect(service.update(VALID_ID, { name: 'Nova' }, { partial: true })).rejects.toBeInstanceOf(NotFoundError)
  })

  it('rejeita id inválido', async () => {
    await expect(service.update('x', { name: 'Nova' }, { partial: true })).rejects.toBeInstanceOf(ValidationError)
  })
})

describe('playerService.remove', () => {
  it('remove o piloto', async () => {
    repository.remove.mockResolvedValue(makePlayer())
    await expect(service.remove(VALID_ID)).resolves.toBeUndefined()
    expect(repository.remove).toHaveBeenCalledWith(VALID_ID)
  })

  it('lança NotFoundError quando não existe', async () => {
    repository.remove.mockResolvedValue(null)
    await expect(service.remove(VALID_ID)).rejects.toBeInstanceOf(NotFoundError)
  })

  it('rejeita id inválido', async () => {
    await expect(service.remove('x')).rejects.toBeInstanceOf(ValidationError)
  })
})
