const { AppError, ValidationError, NotFoundError, ConflictError } = require('../../src/utils/errors')

describe('erros da aplicação', () => {
  it('AppError guarda status e detalhes', () => {
    const err = new AppError('falhou', 418, [{ field: 'x' }])
    expect(err).toBeInstanceOf(Error)
    expect(err.status).toBe(418)
    expect(err.details).toEqual([{ field: 'x' }])
    expect(err.name).toBe('AppError')
  })

  it('AppError usa 500 por padrão', () => {
    expect(new AppError('x').status).toBe(500)
  })

  it('ValidationError tem status 400 e mensagem padrão', () => {
    const err = new ValidationError()
    expect(err.status).toBe(400)
    expect(err.message).toBe('Dados inválidos.')
  })

  it('NotFoundError tem status 404', () => {
    expect(new NotFoundError().status).toBe(404)
    expect(new NotFoundError('sumiu').message).toBe('sumiu')
  })

  it('ConflictError tem status 409', () => {
    expect(new ConflictError().status).toBe(409)
  })
})
