// Erros da aplicação: cada um carrega o status HTTP que deve ser devolvido ao cliente.
class AppError extends Error {
  constructor(message, status = 500, details) {
    super(message)
    this.name = this.constructor.name
    this.status = status
    this.details = details
  }
}

class ValidationError extends AppError {
  constructor(message = 'Dados inválidos.', details) {
    super(message, 400, details)
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado.') {
    super(message, 404)
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflito com um recurso existente.') {
    super(message, 409)
  }
}

module.exports = { AppError, ValidationError, NotFoundError, ConflictError }
