jest.mock('mongoose', () => ({
  set: jest.fn(),
  connect: jest.fn().mockResolvedValue(),
  disconnect: jest.fn().mockResolvedValue(),
  connection: { name: 'conexao' },
}))

const mongoose = require('mongoose')
const { connectDatabase, disconnectDatabase } = require('../../src/config/database')

describe('database', () => {
  it('conecta com a URI informada', async () => {
    const connection = await connectDatabase('mongodb://teste/db')
    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://teste/db', { serverSelectionTimeoutMS: 5000 })
    expect(connection).toBe(mongoose.connection)
  })

  it('usa a URI da configuração por padrão', async () => {
    await connectDatabase()
    expect(mongoose.connect).toHaveBeenCalledWith(expect.stringMatching(/^mongodb/), expect.any(Object))
  })

  it('desconecta', async () => {
    await disconnectDatabase()
    expect(mongoose.disconnect).toHaveBeenCalled()
  })
})
