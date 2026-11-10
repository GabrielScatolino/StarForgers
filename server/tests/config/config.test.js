describe('config', () => {
  const original = { ...process.env }

  afterEach(() => {
    process.env = { ...original }
    jest.resetModules()
  })

  it('usa valores padrão quando não há variáveis de ambiente', () => {
    delete process.env.PORT
    delete process.env.MONGODB_URI
    delete process.env.CORS_ORIGIN
    jest.doMock('dotenv', () => ({ config: jest.fn() }))
    const config = require('../../src/config')
    expect(config.port).toBe(3000)
    expect(config.mongoUri).toMatch(/^mongodb:\/\//)
    expect(config.corsOrigins).toEqual(['http://localhost:5173'])
  })

  it('lê as variáveis de ambiente', () => {
    process.env.PORT = '4000'
    process.env.MONGODB_URI = 'mongodb://banco/teste'
    process.env.CORS_ORIGIN = 'http://a.com, http://b.com'
    jest.doMock('dotenv', () => ({ config: jest.fn() }))
    const config = require('../../src/config')
    expect(config.port).toBe(4000)
    expect(config.mongoUri).toBe('mongodb://banco/teste')
    expect(config.corsOrigins).toEqual(['http://a.com', 'http://b.com'])
  })

  it('parseOrigins ignora itens vazios', () => {
    jest.doMock('dotenv', () => ({ config: jest.fn() }))
    expect(require('../../src/config').parseOrigins('a, ,b,')).toEqual(['a', 'b'])
  })
})
