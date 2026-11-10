const express = require('express')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const config = require('./config')
const routes = require('./routes')
const openapi = require('./docs/openapi')
const notFound = require('./middlewares/notFound')
const errorHandler = require('./middlewares/errorHandler')

// Monta o app sem ligar o servidor nem o banco, o que facilita muito os testes.
function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.use(cors({ origin: config.corsOrigins }))
  app.use(express.json({ limit: config.bodyLimit }))

  app.get('/', (_req, res) => res.redirect('/api-docs'))
  app.get('/api-docs.json', (_req, res) => res.json(openapi))
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: 'Colônia Espacial API' }))
  app.use('/api', routes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}

module.exports = createApp
