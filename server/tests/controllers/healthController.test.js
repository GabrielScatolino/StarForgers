// Troca o mongoose por um objeto simples para controlar o estado da conexão
jest.mock('mongoose', () => ({ connection: { readyState: 0 } }))

const mongoose = require('mongoose')
const { check } = require('../../src/controllers/healthController')

function mockRes() {
  const res = {}
  res.status = jest.fn(() => res)
  res.json = jest.fn(() => res)
  return res
}

describe('healthController', () => {
  it('responde 200 quando o banco está conectado', () => {
    mongoose.connection.readyState = 1
    const res = mockRes()
    check({}, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'ok', database: 'connected' }))
  })

  it('responde 503 quando o banco está desconectado', () => {
    mongoose.connection.readyState = 0
    const res = mockRes()
    check({}, res)
    expect(res.status).toHaveBeenCalledWith(503)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'degraded', database: 'disconnected' }))
  })

  it('trata estados desconhecidos', () => {
    mongoose.connection.readyState = 99
    const res = mockRes()
    check({}, res)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ database: 'unknown' }))
  })
})
