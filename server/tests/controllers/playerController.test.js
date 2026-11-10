jest.mock('../../src/services/playerService')

const service = require('../../src/services/playerService')
const controller = require('../../src/controllers/playerController')
const { makePlayer, VALID_ID } = require('../helpers/fixtures')

// Resposta falsa do Express com métodos encadeáveis
function mockRes() {
  const res = {}
  res.status = jest.fn(() => res)
  res.json = jest.fn(() => res)
  res.send = jest.fn(() => res)
  res.location = jest.fn(() => res)
  return res
}

describe('playerController', () => {
  it('list repassa a query e responde com o resultado', async () => {
    const payload = { data: [], meta: { total: 0 } }
    service.list.mockResolvedValue(payload)
    const res = mockRes()
    await controller.list({ query: { page: '1' } }, res)
    expect(service.list).toHaveBeenCalledWith({ page: '1' })
    expect(res.json).toHaveBeenCalledWith(payload)
  })

  it('getById responde com o piloto', async () => {
    service.getById.mockResolvedValue(makePlayer())
    const res = mockRes()
    await controller.getById({ params: { id: VALID_ID } }, res)
    expect(service.getById).toHaveBeenCalledWith(VALID_ID)
    expect(res.json).toHaveBeenCalledWith(makePlayer())
  })

  it('create responde 201 com o header Location', async () => {
    service.create.mockResolvedValue(makePlayer())
    const res = mockRes()
    await controller.create({ body: { name: 'Nova' }, baseUrl: '/api/players' }, res)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.location).toHaveBeenCalledWith(`/api/players/${VALID_ID}`)
    expect(res.json).toHaveBeenCalledWith(makePlayer())
  })

  it('replace atualiza por completo (PUT)', async () => {
    service.update.mockResolvedValue(makePlayer())
    const res = mockRes()
    await controller.replace({ params: { id: VALID_ID }, body: { a: 1 } }, res)
    expect(service.update).toHaveBeenCalledWith(VALID_ID, { a: 1 }, { partial: false })
    expect(res.json).toHaveBeenCalledWith(makePlayer())
  })

  it('patch atualiza parcialmente (PATCH)', async () => {
    service.update.mockResolvedValue(makePlayer())
    const res = mockRes()
    await controller.patch({ params: { id: VALID_ID }, body: { a: 1 } }, res)
    expect(service.update).toHaveBeenCalledWith(VALID_ID, { a: 1 }, { partial: true })
  })

  it('remove responde 204 sem corpo', async () => {
    service.remove.mockResolvedValue()
    const res = mockRes()
    await controller.remove({ params: { id: VALID_ID } }, res)
    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.send).toHaveBeenCalledWith()
  })

  it('propaga erros do serviço (o Express 5 os envia ao middleware de erros)', async () => {
    service.getById.mockRejectedValue(new Error('falhou'))
    await expect(controller.getById({ params: { id: VALID_ID } }, mockRes())).rejects.toThrow('falhou')
  })
})
