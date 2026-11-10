const notFound = require('../../src/middlewares/notFound')
const { NotFoundError } = require('../../src/utils/errors')

describe('notFound', () => {
  it('encaminha um NotFoundError com o método e a URL', () => {
    const next = jest.fn()
    notFound({ method: 'GET', originalUrl: '/api/xyz' }, {}, next)
    const err = next.mock.calls[0][0]
    expect(err).toBeInstanceOf(NotFoundError)
    expect(err.message).toBe('Rota GET /api/xyz não encontrada.')
  })
})
