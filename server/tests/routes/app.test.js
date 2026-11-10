const request = require('supertest')
const createApp = require('../../src/app')

const app = createApp()

describe('app', () => {
  it('redireciona a raiz para a documentação', async () => {
    const res = await request(app).get('/')
    expect(res.status).toBe(302)
    expect(res.headers.location).toBe('/api-docs')
  })

  it('serve a interface do Swagger', async () => {
    const res = await request(app).get('/api-docs/')
    expect(res.status).toBe(200)
    expect(res.text).toMatch(/swagger/i)
  })

  it('serve a especificação OpenAPI em JSON com todas as rotas do CRUD', async () => {
    const res = await request(app).get('/api-docs.json')
    expect(res.status).toBe(200)
    expect(res.body.openapi).toMatch(/^3\./)
    expect(Object.keys(res.body.paths['/players'])).toEqual(expect.arrayContaining(['get', 'post']))
    expect(Object.keys(res.body.paths['/players/{id}'])).toEqual(
      expect.arrayContaining(['get', 'put', 'patch', 'delete']),
    )
  })

  it('responde 404 em JSON para rotas inexistentes', async () => {
    const res = await request(app).get('/api/nada')
    expect(res.status).toBe(404)
    expect(res.body.error.message).toBe('Rota GET /api/nada não encontrada.')
  })

  it('GET /api/health responde 503 sem conexão com o banco', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(503)
    expect(res.body).toEqual(expect.objectContaining({ status: 'degraded', database: 'disconnected' }))
  })

  it('libera CORS para a origem configurada', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'http://localhost:5173')
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173')
  })

  it('não envia o header de CORS para origens não autorizadas', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'http://malicioso.com')
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('não expõe o header x-powered-by', async () => {
    const res = await request(app).get('/api/health')
    expect(res.headers['x-powered-by']).toBeUndefined()
  })
})
