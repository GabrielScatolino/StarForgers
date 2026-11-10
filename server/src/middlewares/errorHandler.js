// Ponto único de tratamento de erros: converte qualquer erro em uma resposta JSON padronizada
//   { "error": { "status": 404, "message": "...", "details": [...] } }
const mongoose = require('mongoose')
const { AppError } = require('../utils/errors')

const DB_UNAVAILABLE_NAMES = [
  'MongooseServerSelectionError',
  'MongoServerSelectionError',
  'MongoNetworkError',
  'MongoNetworkTimeoutError',
]

function isDatabaseUnavailable(err) {
  return (
    DB_UNAVAILABLE_NAMES.includes(err.name) ||
    (err.name === 'MongooseError' && /buffering timed out/i.test(err.message))
  )
}

// Descobre status, mensagem e detalhes para cada tipo de erro conhecido
function normalizeError(err) {
  if (err instanceof AppError) {
    return { status: err.status, message: err.message, details: err.details }
  }
  if (err.type === 'entity.parse.failed') {
    return { status: 400, message: 'O corpo da requisição não é um JSON válido.' }
  }
  if (err.type === 'entity.too.large') {
    return { status: 413, message: 'O corpo da requisição é grande demais.' }
  }
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }))
    return { status: 400, message: 'Dados inválidos.', details }
  }
  if (err instanceof mongoose.Error.CastError) {
    return { status: 400, message: 'Identificador ou valor em formato inválido.' }
  }
  if (err.code === 11000) {
    const isName = err.keyPattern && err.keyPattern.name
    return {
      status: 409,
      message: isName ? 'Já existe um piloto com esse nome.' : 'Já existe um registro com esse valor.',
    }
  }
  if (isDatabaseUnavailable(err)) {
    return { status: 503, message: 'Banco de dados indisponível no momento. Tente novamente em instantes.' }
  }
  return { status: 500, message: 'Erro interno do servidor.' }
}

// O Express reconhece um middleware de erros pelos 4 parâmetros (mesmo o último sem uso)
function errorHandler(err, _req, res, _next) {
  const { status, message, details } = normalizeError(err)
  if (status >= 500 && status !== 503) console.error(err)
  const body = { error: { status, message } }
  if (details) body.error.details = details
  res.status(status).json(body)
}

module.exports = errorHandler
module.exports.normalizeError = normalizeError
