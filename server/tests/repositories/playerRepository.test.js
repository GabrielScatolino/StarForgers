jest.mock('../../src/models/Player', () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}))

const Player = require('../../src/models/Player')
const repository = require('../../src/repositories/playerRepository')
const mockQuery = require('../helpers/mockQuery')

describe('playerRepository', () => {
  it('findAll ordena, pagina e traduz o campo de ranking', async () => {
    const query = mockQuery(['a', 'b'])
    Player.find.mockReturnValue(query)

    const result = await repository.findAll({ sort: 'lifetimeEarned', order: 'desc', skip: 10, limit: 5 })

    expect(result).toEqual(['a', 'b'])
    expect(query.sort).toHaveBeenCalledWith({ 'game.lifetimeEarned': -1, _id: -1 })
    expect(query.skip).toHaveBeenCalledWith(10)
    expect(query.limit).toHaveBeenCalledWith(5)
  })

  it('findAll usa ordem crescente quando pedido', async () => {
    const query = mockQuery([])
    Player.find.mockReturnValue(query)
    await repository.findAll({ sort: 'name', order: 'asc', skip: 0, limit: 50 })
    expect(query.sort).toHaveBeenCalledWith({ name: 1, _id: 1 })
  })

  it('count conta os documentos', async () => {
    Player.countDocuments.mockResolvedValue(7)
    await expect(repository.count()).resolves.toBe(7)
  })

  it('findById busca pelo id', async () => {
    Player.findById.mockResolvedValue({ id: '1' })
    await expect(repository.findById('1')).resolves.toEqual({ id: '1' })
    expect(Player.findById).toHaveBeenCalledWith('1')
  })

  it('create grava os dados', async () => {
    Player.create.mockResolvedValue({ id: '1' })
    await repository.create({ name: 'Nova' })
    expect(Player.create).toHaveBeenCalledWith({ name: 'Nova' })
  })

  it('update usa $set, devolve o documento novo e roda as validações', async () => {
    Player.findByIdAndUpdate.mockResolvedValue({ id: '1' })
    await repository.update('1', { name: 'Nova' })
    expect(Player.findByIdAndUpdate).toHaveBeenCalledWith(
      '1',
      { $set: { name: 'Nova' } },
      { new: true, runValidators: true },
    )
  })

  it('remove apaga pelo id', async () => {
    Player.findByIdAndDelete.mockResolvedValue({ id: '1' })
    await repository.remove('1')
    expect(Player.findByIdAndDelete).toHaveBeenCalledWith('1')
  })
})
