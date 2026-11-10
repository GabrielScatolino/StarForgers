const Player = require('../../src/models/Player')
const { validGame } = require('../helpers/fixtures')

// Roda a validação e devolve o erro (ou undefined se o documento é válido)
async function validationErrorOf(data) {
  try {
    await new Player(data).validate()
  } catch (err) {
    return err
  }
  return undefined
}

describe('modelo Player', () => {
  it('valida um piloto correto', async () => {
    expect(await validationErrorOf({ name: 'Nova', emblem: 'fire', game: validGame() })).toBeUndefined()
  })

  it('exige nome, emblema e jogo', async () => {
    const error = await validationErrorOf({})
    expect(Object.keys(error.errors).sort()).toEqual(['emblem', 'game', 'name'])
  })

  it('limita o tamanho do nome', async () => {
    const short = await validationErrorOf({ name: 'ab', emblem: 'x', game: {} })
    expect(short.errors.name).toBeDefined()
    const long = await validationErrorOf({ name: 'a'.repeat(17), emblem: 'x', game: {} })
    expect(long.errors.name).toBeDefined()
  })

  it('expõe "id" e esconde "_id" e "__v" no JSON', () => {
    const player = new Player({ name: 'Nova', emblem: 'fire', game: validGame() })
    const json = player.toJSON()
    expect(json.id).toBe(String(player._id))
    expect(json._id).toBeUndefined()
    expect(json.__v).toBeUndefined()
  })

  it('mantém objetos vazios dentro do jogo', () => {
    const player = new Player({ name: 'Nova', emblem: 'fire', game: { ...validGame(), generators: {} } })
    expect(player.toJSON().game.generators).toEqual({})
  })

  it('declara índice único para o nome', () => {
    const nameIndex = Player.schema.indexes().find(([fields]) => fields.name === 1)
    expect(nameIndex[1].unique).toBe(true)
  })
})
