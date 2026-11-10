const v = require('../../src/validators/playerValidator')
const { ValidationError } = require('../../src/utils/errors')
const { validGame, VALID_ID } = require('../helpers/fixtures')

// Captura os detalhes (campos inválidos) do erro lançado
function detailsOf(fn) {
  try {
    fn()
  } catch (err) {
    expect(err).toBeInstanceOf(ValidationError)
    return err.details
  }
  throw new Error('Era esperado que lançasse ValidationError')
}

describe('validateId', () => {
  it('aceita um ObjectId válido', () => {
    expect(v.validateId(VALID_ID)).toBe(VALID_ID)
  })

  it.each([['abc'], [''], [123], [undefined], ['zzzzzzzzzzzzzzzzzzzzzzzz'], [`${VALID_ID}0`]])(
    'rejeita %p',
    (id) => {
      expect(() => v.validateId(id)).toThrow(ValidationError)
    },
  )
})

describe('validateCreate', () => {
  it('aceita nome, emblema e jogo válidos e limpa os espaços', () => {
    const result = v.validateCreate({ name: '  Nova  ', emblem: ' fire ', game: validGame() })
    expect(result.name).toBe('Nova')
    expect(result.emblem).toBe('fire')
    expect(result.game).toEqual(validGame())
  })

  it('usa o estado inicial padrão quando o jogo não é enviado', () => {
    const { game } = v.validateCreate({ name: 'Nova', emblem: 'fire' })
    expect(game).toEqual(expect.objectContaining({ crystals: 0, planets: ['pedrinha'], activePlanet: 'pedrinha' }))
  })

  it('rejeita corpo que não é objeto', () => {
    expect(() => v.validateCreate(null)).toThrow(ValidationError)
    expect(() => v.validateCreate([])).toThrow(ValidationError)
    expect(() => v.validateCreate('texto')).toThrow(ValidationError)
  })

  it('informa todos os campos inválidos de uma vez', () => {
    const details = detailsOf(() => v.validateCreate({ name: 'ab', emblem: '' }))
    expect(details.map((d) => d.field)).toEqual(['name', 'emblem'])
  })

  it('rejeita nome que não é texto ou é longo demais', () => {
    expect(() => v.validateCreate({ name: 42, emblem: 'x' })).toThrow(ValidationError)
    expect(() => v.validateCreate({ name: 'a'.repeat(17), emblem: 'x' })).toThrow(ValidationError)
  })

  it('rejeita emblema que não é texto ou é longo demais', () => {
    expect(() => v.validateCreate({ name: 'Nova', emblem: 7 })).toThrow(ValidationError)
    expect(() => v.validateCreate({ name: 'Nova', emblem: 'e'.repeat(41) })).toThrow(ValidationError)
  })
})

describe('validação do estado do jogo', () => {
  const create = (game) => v.validateCreate({ name: 'Nova', emblem: 'fire', game })

  it('rejeita jogo que não é objeto', () => {
    expect(detailsOf(() => create('x'))[0].field).toBe('game')
    expect(detailsOf(() => create([]))[0].field).toBe('game')
  })

  it.each(['crystals', 'lifetimeEarned', 'runEarned', 'clicks', 'darkMatter', 'universes'])(
    'rejeita %s negativo, ausente ou fora do formato',
    (field) => {
      expect(detailsOf(() => create({ ...validGame(), [field]: -1 }))[0].field).toBe(`game.${field}`)
      expect(detailsOf(() => create({ ...validGame(), [field]: '10' }))[0].field).toBe(`game.${field}`)
      expect(detailsOf(() => create({ ...validGame(), [field]: Infinity }))[0].field).toBe(`game.${field}`)
      const missing = validGame()
      delete missing[field]
      expect(detailsOf(() => create(missing))[0].field).toBe(`game.${field}`)
    },
  )

  it('rejeita lista de planetas vazia ou com itens inválidos', () => {
    expect(detailsOf(() => create({ ...validGame(), planets: [] }))[0].field).toBe('game.planets')
    expect(detailsOf(() => create({ ...validGame(), planets: [1] }))[0].field).toBe('game.planets')
    expect(detailsOf(() => create({ ...validGame(), planets: 'a' }))[0].field).toBe('game.planets')
  })

  it('rejeita listas grandes demais', () => {
    const many = Array.from({ length: 101 }, (_, i) => `p${i}`)
    expect(detailsOf(() => create({ ...validGame(), planets: many }))[0].field).toBe('game.planets')
  })

  it('rejeita melhorias de clique inválidas', () => {
    expect(detailsOf(() => create({ ...validGame(), clickUpgrades: [1] }))[0].field).toBe('game.clickUpgrades')
  })

  it('rejeita planeta ativo inválido', () => {
    expect(detailsOf(() => create({ ...validGame(), activePlanet: '' }))[0].field).toBe('game.activePlanet')
    expect(detailsOf(() => create({ ...validGame(), activePlanet: 3 }))[0].field).toBe('game.activePlanet')
  })

  it('rejeita geradores inválidos', () => {
    expect(detailsOf(() => create({ ...validGame(), generators: [] }))[0].field).toBe('game.generators')
    expect(detailsOf(() => create({ ...validGame(), generators: { a: -1 } }))[0].field).toBe('game.generators')
    expect(detailsOf(() => create({ ...validGame(), generators: { a: 'x' } }))[0].field).toBe('game.generators')
    const many = Object.fromEntries(Array.from({ length: 101 }, (_, i) => [`g${i}`, 1]))
    expect(detailsOf(() => create({ ...validGame(), generators: many }))[0].field).toBe('game.generators')
  })

  it('aceita campos extras (o jogo pode evoluir)', () => {
    const game = { ...validGame(), conquista: true }
    expect(create(game).game.conquista).toBe(true)
  })
})

describe('validateUpdate', () => {
  it('PUT exige todos os campos', () => {
    const details = detailsOf(() => v.validateUpdate({ name: 'Nova' }, { partial: false }))
    expect(details.map((d) => d.field)).toEqual(['emblem', 'game'])
  })

  it('PUT aceita o objeto completo', () => {
    const changes = v.validateUpdate({ name: 'Nova', emblem: 'fire', game: validGame() }, { partial: false })
    expect(Object.keys(changes)).toEqual(['name', 'emblem', 'game'])
  })

  it('PATCH aceita só um campo', () => {
    expect(v.validateUpdate({ name: ' Nova ' }, { partial: true })).toEqual({ name: 'Nova' })
    expect(v.validateUpdate({ game: validGame() }, { partial: true })).toEqual({ game: validGame() })
  })

  it('PATCH valida os campos enviados', () => {
    expect(detailsOf(() => v.validateUpdate({ name: 'a' }, { partial: true }))[0].field).toBe('name')
  })

  it('PATCH sem nenhum campo é rejeitado', () => {
    expect(() => v.validateUpdate({}, { partial: true })).toThrow(/ao menos um campo/)
  })

  it('rejeita corpo que não é objeto', () => {
    expect(() => v.validateUpdate(undefined, { partial: true })).toThrow(ValidationError)
  })
})

describe('validateListQuery', () => {
  it('usa os valores padrão', () => {
    expect(v.validateListQuery()).toEqual({ page: 1, limit: v.DEFAULT_LIMIT, sort: 'createdAt', order: 'asc' })
    expect(v.validateListQuery({})).toEqual({ page: 1, limit: 50, sort: 'createdAt', order: 'asc' })
  })

  it('converte textos da URL em números', () => {
    const result = v.validateListQuery({ page: '2', limit: '10', sort: 'lifetimeEarned', order: 'desc' })
    expect(result).toEqual({ page: 2, limit: 10, sort: 'lifetimeEarned', order: 'desc' })
  })

  it('rejeita valores inválidos e lista todos os campos', () => {
    const details = detailsOf(() => v.validateListQuery({ page: '0', limit: '101', sort: 'x', order: 'y' }))
    expect(details.map((d) => d.field)).toEqual(['page', 'limit', 'sort', 'order'])
  })

  it('rejeita números fracionados ou textos', () => {
    expect(() => v.validateListQuery({ page: '1.5' })).toThrow(ValidationError)
    expect(() => v.validateListQuery({ limit: 'abc' })).toThrow(ValidationError)
  })
})
