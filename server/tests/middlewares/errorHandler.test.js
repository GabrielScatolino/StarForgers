const mongoose = require('mongoose')
const errorHandler = require('../../src/middlewares/errorHandler')
const { normalizeError } = errorHandler
const { AppError, ValidationError, NotFoundError } = require('../../src/utils/errors')

function mockRes() {
  const res = {}
  res.status = jest.fn(() => res)
  res.json = jest.fn(() => res)
  return res
}

describe('normalizeError', () => {
  it('respeita o status dos erros da aplicação', () => {
    expect(normalizeError(new NotFoundError('sumiu'))).toEqual({ status: 404, message: 'sumiu', details: undefined })
    const details = [{ field: 'name', message: 'curto' }]
    expect(normalizeError(new ValidationError('ruim', details))).toEqual({ status: 400, message: 'ruim', details })
    expect(normalizeError(new AppError('x', 418)).status).toBe(418)
  })

  it('traduz JSON malformado em 400', () => {
    const err = Object.assign(new SyntaxError('bad'), { type: 'entity.parse.failed' })
    expect(normalizeError(err)).toEqual({ status: 400, message: 'O corpo da requisição não é um JSON válido.' })
  })

  it('traduz corpo grande demais em 413', () => {
    expect(normalizeError({ type: 'entity.too.large' }).status).toBe(413)
  })

  it('traduz erro de validação do Mongoose em 400 com detalhes', () => {
    const err = new mongoose.Error.ValidationError()
    err.addError('name', new mongoose.Error.ValidatorError({ path: 'name', message: 'Path `name` is required.' }))
    const result = normalizeError(err)
    expect(result.status).toBe(400)
    expect(result.details).toEqual([{ field: 'name', message: 'Path `name` is required.' }])
  })

  it('traduz CastError do Mongoose em 400', () => {
    const err = new mongoose.Error.CastError('ObjectId', 'abc', '_id')
    expect(normalizeError(err).status).toBe(400)
  })

  it('traduz nome duplicado em 409 com mensagem específica', () => {
    const err = Object.assign(new Error('E11000'), { code: 11000, keyPattern: { name: 1 } })
    expect(normalizeError(err)).toEqual({ status: 409, message: 'Já existe um piloto com esse nome.' })
  })

  it('traduz outra chave duplicada em 409 genérico', () => {
    const err = Object.assign(new Error('E11000'), { code: 11000 })
    expect(normalizeError(err)).toEqual({ status: 409, message: 'Já existe um registro com esse valor.' })
  })

  it.each([['MongooseServerSelectionError'], ['MongoServerSelectionError'], ['MongoNetworkError'], ['MongoNetworkTimeoutError']])(
    'traduz %s em 503',
    (name) => {
      const err = Object.assign(new Error('sem banco'), { name })
      expect(normalizeError(err).status).toBe(503)
    },
  )

  it('traduz timeout do buffer do Mongoose em 503', () => {
    const err = Object.assign(new Error('Operation `players.find()` buffering timed out after 3000ms'), {
      name: 'MongooseError',
    })
    expect(normalizeError(err).status).toBe(503)
  })

  it('não confunde outros MongooseError com indisponibilidade', () => {
    const err = Object.assign(new Error('outra coisa'), { name: 'MongooseError' })
    expect(normalizeError(err).status).toBe(500)
  })

  it('esconde os detalhes de erros desconhecidos', () => {
    expect(normalizeError(new Error('segredo interno'))).toEqual({ status: 500, message: 'Erro interno do servidor.' })
  })
})

describe('errorHandler', () => {
  let errorSpy
  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => errorSpy.mockRestore())

  it('responde no formato padrão com detalhes', () => {
    const res = mockRes()
    const details = [{ field: 'name', message: 'curto' }]
    errorHandler(new ValidationError('Dados inválidos.', details), {}, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: { status: 400, message: 'Dados inválidos.', details } })
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('omite "details" quando não há', () => {
    const res = mockRes()
    errorHandler(new NotFoundError('sumiu'), {}, res, jest.fn())
    expect(res.json).toHaveBeenCalledWith({ error: { status: 404, message: 'sumiu' } })
  })

  it('registra no log apenas erros 500', () => {
    const res = mockRes()
    errorHandler(new Error('boom'), {}, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: { status: 500, message: 'Erro interno do servidor.' } })
    expect(errorSpy).toHaveBeenCalledTimes(1)
  })

  it('não registra 503 (banco fora do ar não é bug do código)', () => {
    const res = mockRes()
    errorHandler(Object.assign(new Error('x'), { name: 'MongoNetworkError' }), {}, res, jest.fn())
    expect(res.status).toHaveBeenCalledWith(503)
    expect(errorSpy).not.toHaveBeenCalled()
  })
})
