const { NotFoundError } = require('../utils/errors')

// Qualquer rota que nenhuma outra tratou cai aqui
function notFound(req, _res, next) {
  next(new NotFoundError(`Rota ${req.method} ${req.originalUrl} não encontrada.`))
}

module.exports = notFound
