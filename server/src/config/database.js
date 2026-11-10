const mongoose = require('mongoose')
const config = require('./index')

// Se o banco cair, as operações falham em 3 s (e viram erro 503) em vez de ficarem penduradas
mongoose.set('bufferTimeoutMS', 3000)

async function connectDatabase(uri = config.mongoUri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  return mongoose.connection
}

async function disconnectDatabase() {
  await mongoose.disconnect()
}

module.exports = { connectDatabase, disconnectDatabase }
