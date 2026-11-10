const mongoose = require('mongoose')

const STATES = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }

// Diz se a API está de pé e se o banco está conectado
function check(_req, res) {
  const database = STATES[mongoose.connection.readyState] ?? 'unknown'
  const healthy = database === 'connected'
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    database,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  })
}

module.exports = { check }
