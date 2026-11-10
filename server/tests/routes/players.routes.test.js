// Testa a API inteira por HTTP (rotas, validação, serviço, controller e erros),
// trocando só o repositório (o banco) por um falso.
jest.mock('../../src/repositories/playerRepository')

const request = require('supertest')
const repository = require('../../src/repositories/playerRepository')
const createApp = require('../../src/app')
const { validGame, makePlayer, VALID_ID } = require('../helpers/fixtures')

const app = createApp()

describe('GET /api/players', () => {
  it('lista com metadados de paginação', async () => {
    repository.findAll.mockResolvedValue([makePlayer()])
    repository.count.mockResolvedValue(1)

    const res = await request(app).get('/api/players?sort=lifetimeEarned&order=desc&limit=10')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.meta).toEqual({ total: 1, page: 1, limit: 10, pages: 1 })
    expect(repository.findAll).toHaveBeenCalledWith({ sort: 'lifetimeEarned', order: 'desc', skip: 0, limit: 10 })
  })

  it('responde 400 para parâmetros inválidos', async () => {
    const res = await request(app).get('/api/players?limit=1000')
    expect(res.status).toBe(400)
    expect(res.body.error.details[0].field).toBe('limit')
  })
})

describe('POST /api/players', () => {
  it('cria e responde 201 com Location', async () => {
    repository.create.mockResolvedValue(makePlayer())

    const res = await request(app).post('/api/players').send({ name: 'Capitão Pug', emblem: 'rocket-takeoff' })

    expect(res.status).toBe(201)
    expect(res.headers.location).toBe(`/api/players/${VALID_ID}`)
    expect(res.body.id).toBe(VALID_ID)
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Capitão Pug' }))
  })

  it('responde 400 com os campos inválidos', async () => {
    const res = await request(app).post('/api/players').send({ name: 'a' })
    expect(res.status).toBe(400)
    expect(res.body.error.message).toBe('Dados inválidos.')
    expect(res.body.error.details.map((d) => d.field)).toEqual(['name', 'emblem'])
    expect(repository.create).not.toHaveBeenCalled()
  })

  it('responde 409 quando o nome já existe', async () => {
    repository.create.mockRejectedValue(Object.assign(new Error('dup'), { code: 11000, keyPattern: { name: 1 } }))
    const res = await request(app).post('/api/players').send({ name: 'Nova', emblem: 'fire' })
    expect(res.status).toBe(409)
    expect(res.body.error.message).toBe('Já existe um piloto com esse nome.')
  })

  it('responde 400 para JSON malformado', async () => {
    const res = await request(app).post('/api/players').set('Content-Type', 'application/json').send('{ruim')
    expect(res.status).toBe(400)
    expect(res.body.error.message).toMatch(/JSON/)
  })

  it('responde 413 para corpo grande demais', async () => {
    const res = await request(app)
      .post('/api/players')
      .send({ name: 'Nova', emblem: 'fire', lixo: 'x'.repeat(200 * 1024) })
    expect(res.status).toBe(413)
  })

  it('responde 503 quando o banco está fora do ar', async () => {
    repository.create.mockRejectedValue(Object.assign(new Error('x'), { name: 'MongoNetworkError' }))
    const res = await request(app).post('/api/players').send({ name: 'Nova', emblem: 'fire' })
    expect(res.status).toBe(503)
  })

  it('responde 500 sem vazar detalhes de erros inesperados', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    repository.create.mockRejectedValue(new Error('senha do banco: 1234'))
    const res = await request(app).post('/api/players').send({ name: 'Nova', emblem: 'fire' })
    expect(res.status).toBe(500)
    expect(JSON.stringify(res.body)).not.toMatch(/senha/)
    spy.mockRestore()
  })
})

describe('GET /api/players/:id', () => {
  it('devolve o piloto', async () => {
    repository.findById.mockResolvedValue(makePlayer())
    const res = await request(app).get(`/api/players/${VALID_ID}`)
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Capitão Pug')
  })

  it('responde 404 quando não existe', async () => {
    repository.findById.mockResolvedValue(null)
    const res = await request(app).get(`/api/players/${VALID_ID}`)
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: { status: 404, message: 'Piloto não encontrado.' } })
  })

  it('responde 400 para id inválido', async () => {
    const res = await request(app).get('/api/players/abc')
    expect(res.status).toBe(400)
  })
})

describe('PUT /api/players/:id', () => {
  it('substitui os dados', async () => {
    repository.update.mockResolvedValue(makePlayer({ name: 'Nova' }))
    const res = await request(app)
      .put(`/api/players/${VALID_ID}`)
      .send({ name: 'Nova', emblem: 'fire', game: validGame() })
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Nova')
  })

  it('exige o objeto completo', async () => {
    const res = await request(app).put(`/api/players/${VALID_ID}`).send({ name: 'Nova' })
    expect(res.status).toBe(400)
  })
})

describe('PATCH /api/players/:id', () => {
  it('altera só o que foi enviado', async () => {
    repository.update.mockResolvedValue(makePlayer({ game: { ...validGame(), crystals: 999 } }))
    const res = await request(app).patch(`/api/players/${VALID_ID}`).send({ game: { ...validGame(), crystals: 999 } })
    expect(res.status).toBe(200)
    expect(repository.update).toHaveBeenCalledWith(VALID_ID, { game: { ...validGame(), crystals: 999 } })
  })

  it('responde 404 quando o piloto não existe', async () => {
    repository.update.mockResolvedValue(null)
    const res = await request(app).patch(`/api/players/${VALID_ID}`).send({ name: 'Nova' })
    expect(res.status).toBe(404)
  })

  it('responde 400 sem nenhum campo', async () => {
    const res = await request(app).patch(`/api/players/${VALID_ID}`).send({})
    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/players/:id', () => {
  it('remove e responde 204', async () => {
    repository.remove.mockResolvedValue(makePlayer())
    const res = await request(app).delete(`/api/players/${VALID_ID}`)
    expect(res.status).toBe(204)
    expect(res.text).toBe('')
  })

  it('responde 404 quando não existe', async () => {
    repository.remove.mockResolvedValue(null)
    const res = await request(app).delete(`/api/players/${VALID_ID}`)
    expect(res.status).toBe(404)
  })

  it('responde 400 para id inválido', async () => {
    const res = await request(app).delete('/api/players/xyz')
    expect(res.status).toBe(400)
  })
})
