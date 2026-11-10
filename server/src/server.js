// Ponto de partida: conecta ao MongoDB e liga o servidor HTTP.
const createApp = require('./app')
const config = require('./config')
const { connectDatabase, disconnectDatabase } = require('./config/database')
const Player = require('./models/Player')

async function start() {
  await connectDatabase()
  await Player.init() // garante que os índices (nome único) existam
  console.info('MongoDB conectado.')

  const server = createApp().listen(config.port, () => {
    console.info(`API rodando em http://localhost:${config.port}`)
    console.info(`Documentação (Swagger): http://localhost:${config.port}/api-docs`)
  })

  const shutdown = async () => {
    console.info('Encerrando...')
    server.close()
    await disconnectDatabase()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

start().catch((err) => {
  console.error('Falha ao iniciar a API:', err.message)
  process.exit(1)
})
