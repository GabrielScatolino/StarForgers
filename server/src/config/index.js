// Lê as variáveis de ambiente em um único lugar, com valores padrão para desenvolvimento.
require('dotenv').config({ quiet: true })

function parseOrigins(value) {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/colonia-espacial',
  corsOrigins: parseOrigins(process.env.CORS_ORIGIN || 'http://localhost:5173'),
  bodyLimit: '100kb',
  parseOrigins,
}
