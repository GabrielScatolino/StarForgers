// Documentação da API no padrão OpenAPI 3, exibida pelo Swagger UI em /api-docs.
const exampleGame = {
  version: 2,
  crystals: 1190,
  lifetimeEarned: 2160,
  runEarned: 2160,
  clicks: 355,
  planets: ['pedrinha'],
  activePlanet: 'pedrinha',
  generators: { 'pedrinha-g1': 13, 'pedrinha-g2': 3 },
  clickUpgrades: ['pedrinha-c1'],
  darkMatter: 0,
  universes: 0,
  lastSaved: 1793000000000,
}

const examplePlayer = {
  id: '671f9c2e8a1b2c3d4e5f6a7b',
  name: 'Capitão Pug',
  emblem: 'rocket-takeoff',
  game: exampleGame,
  createdAt: '2026-10-28T19:00:00.000Z',
  updatedAt: '2026-10-28T19:30:00.000Z',
}

const errorResponse = (description, status, message, details) => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Error' },
      example: { error: { status, message, ...(details && { details }) } },
    },
  },
})

const idParameter = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Identificador do piloto (ObjectId do MongoDB, 24 caracteres hexadecimais).',
  schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$', example: examplePlayer.id },
}

const invalidId = errorResponse('Identificador inválido.', 400, 'O identificador informado é inválido.', [
  { field: 'id', message: 'Deve ter 24 caracteres hexadecimais.' },
])
const notFound = errorResponse('Piloto não encontrado.', 404, 'Piloto não encontrado.')
const duplicateName = errorResponse('Já existe um piloto com esse nome.', 409, 'Já existe um piloto com esse nome.')
const validation = errorResponse('Dados inválidos.', 400, 'Dados inválidos.', [
  { field: 'name', message: 'O nome deve ter entre 3 e 16 caracteres.' },
])
const unavailable = errorResponse(
  'Banco de dados indisponível.',
  503,
  'Banco de dados indisponível no momento. Tente novamente em instantes.',
)

const playerBody = (description, required) => ({
  required: true,
  description,
  content: {
    'application/json': {
      schema: { $ref: required ? '#/components/schemas/PlayerInput' : '#/components/schemas/PlayerPatch' },
    },
  },
})

const playerResponse = (description) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Player' }, example: examplePlayer } },
})

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Colônia Espacial API',
    version: '1.0.0',
    description:
      'API RESTful do jogo **Colônia Espacial**. Gerencia os pilotos (jogadores) e o progresso salvo de cada um, ' +
      'com CRUD completo (criar, consultar, alterar e remover) em um banco MongoDB.\n\n' +
      'Todos os erros seguem o formato `{ "error": { "status", "message", "details?" } }`.',
  },
  servers: [{ url: '/api', description: 'Servidor atual' }],
  tags: [
    { name: 'Pilotos', description: 'CRUD de jogadores e do progresso do jogo' },
    { name: 'Sistema', description: 'Verificação de saúde da API' },
  ],
  paths: {
    '/players': {
      get: {
        tags: ['Pilotos'],
        summary: 'Lista os pilotos (com paginação e ordenação)',
        description:
          'Use `sort=lifetimeEarned&order=desc` para obter o **ranking global** por total de cristais coletados.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 }, description: 'Página.' },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
            description: 'Itens por página (máximo 100).',
          },
          {
            name: 'sort',
            in: 'query',
            schema: { type: 'string', enum: ['createdAt', 'name', 'lifetimeEarned'], default: 'createdAt' },
            description: 'Campo de ordenação.',
          },
          {
            name: 'order',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
            description: 'Sentido da ordenação.',
          },
        ],
        responses: {
          200: {
            description: 'Lista de pilotos.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PlayerList' },
                example: { data: [examplePlayer], meta: { total: 1, page: 1, limit: 50, pages: 1 } },
              },
            },
          },
          400: errorResponse('Parâmetros de consulta inválidos.', 400, 'Dados inválidos.', [
            { field: 'limit', message: 'Deve ser um inteiro entre 1 e 100.' },
          ]),
          503: unavailable,
        },
      },
      post: {
        tags: ['Pilotos'],
        summary: 'Cria um piloto',
        description:
          'O campo `game` é opcional: se não for enviado, o piloto começa com o estado inicial padrão do jogo.',
        requestBody: playerBody('Dados do novo piloto.', true),
        responses: {
          201: {
            ...playerResponse('Piloto criado.'),
            headers: { Location: { description: 'URL do piloto criado.', schema: { type: 'string' } } },
          },
          400: validation,
          409: duplicateName,
          413: errorResponse('Corpo grande demais.', 413, 'O corpo da requisição é grande demais.'),
          503: unavailable,
        },
      },
    },
    '/players/{id}': {
      get: {
        tags: ['Pilotos'],
        summary: 'Consulta um piloto pelo id',
        parameters: [idParameter],
        responses: { 200: playerResponse('Piloto encontrado.'), 400: invalidId, 404: notFound, 503: unavailable },
      },
      put: {
        tags: ['Pilotos'],
        summary: 'Substitui os dados de um piloto',
        description: 'Exige `name`, `emblem` e `game`. Para alterar só alguns campos, use `PATCH`.',
        parameters: [idParameter],
        requestBody: playerBody('Novos dados completos do piloto.', true),
        responses: {
          200: playerResponse('Piloto atualizado.'),
          400: validation,
          404: notFound,
          409: duplicateName,
          503: unavailable,
        },
      },
      patch: {
        tags: ['Pilotos'],
        summary: 'Altera parte dos dados de um piloto',
        description:
          'Envie apenas o que mudou, mas ao menos um campo. É o que o jogo usa para salvar o progresso (`game`) ' +
          'e para renomear o piloto.',
        parameters: [idParameter],
        requestBody: playerBody('Campos a alterar.', false),
        responses: {
          200: playerResponse('Piloto atualizado.'),
          400: validation,
          404: notFound,
          409: duplicateName,
          503: unavailable,
        },
      },
      delete: {
        tags: ['Pilotos'],
        summary: 'Remove um piloto',
        parameters: [idParameter],
        responses: { 204: { description: 'Piloto removido (sem conteúdo).' }, 400: invalidId, 404: notFound, 503: unavailable },
      },
    },
    '/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Verifica a saúde da API e do banco',
        responses: {
          200: {
            description: 'API e banco funcionando.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Health' },
                example: { status: 'ok', database: 'connected', uptime: 120, timestamp: '2026-10-28T19:00:00.000Z' },
              },
            },
          },
          503: {
            description: 'API no ar, mas o banco não está conectado.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Health' },
                example: { status: 'degraded', database: 'disconnected', uptime: 120, timestamp: '2026-10-28T19:00:00.000Z' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Game: {
        type: 'object',
        description: 'Estado do jogo. Campos adicionais são aceitos e guardados como enviados.',
        required: [
          'crystals', 'lifetimeEarned', 'runEarned', 'clicks', 'darkMatter', 'universes',
          'planets', 'activePlanet', 'generators', 'clickUpgrades',
        ],
        properties: {
          version: { type: 'integer', example: 2 },
          crystals: { type: 'number', minimum: 0, description: 'Cristais disponíveis para gastar.' },
          lifetimeEarned: { type: 'number', minimum: 0, description: 'Total coletado (usado no ranking).' },
          runEarned: { type: 'number', minimum: 0, description: 'Total coletado no universo atual.' },
          clicks: { type: 'number', minimum: 0 },
          darkMatter: { type: 'number', minimum: 0, description: 'Bônus permanente do prestígio.' },
          universes: { type: 'number', minimum: 0, description: 'Quantas vezes o jogador renasceu.' },
          planets: { type: 'array', minItems: 1, items: { type: 'string' }, description: 'Planetas colonizados.' },
          activePlanet: { type: 'string', example: 'pedrinha' },
          generators: {
            type: 'object',
            additionalProperties: { type: 'number', minimum: 0 },
            description: 'Quantidade comprada de cada gerador, por id.',
          },
          clickUpgrades: { type: 'array', items: { type: 'string' }, description: 'Melhorias de clique compradas.' },
          lastSaved: { type: 'integer', description: 'Timestamp (ms) do último salvamento.' },
        },
        example: exampleGame,
      },
      Player: {
        type: 'object',
        properties: {
          id: { type: 'string', example: examplePlayer.id },
          name: { type: 'string', minLength: 3, maxLength: 16, example: 'Capitão Pug' },
          emblem: { type: 'string', maxLength: 40, example: 'rocket-takeoff' },
          game: { $ref: '#/components/schemas/Game' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PlayerInput: {
        type: 'object',
        required: ['name', 'emblem'],
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 16, description: 'Único (ignora maiúsculas e acentos).' },
          emblem: { type: 'string', maxLength: 40 },
          game: { $ref: '#/components/schemas/Game' },
        },
        example: { name: 'Capitão Pug', emblem: 'rocket-takeoff' },
      },
      PlayerPatch: {
        type: 'object',
        minProperties: 1,
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 16 },
          emblem: { type: 'string', maxLength: 40 },
          game: { $ref: '#/components/schemas/Game' },
        },
        example: { name: 'Capitã Nova' },
      },
      PlayerList: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/Player' } },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              page: { type: 'integer' },
              limit: { type: 'integer' },
              pages: { type: 'integer' },
            },
          },
        },
      },
      Health: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['ok', 'degraded'] },
          database: { type: 'string', enum: ['connected', 'connecting', 'disconnecting', 'disconnected', 'unknown'] },
          uptime: { type: 'integer', description: 'Segundos desde que a API iniciou.' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              status: { type: 'integer', example: 400 },
              message: { type: 'string' },
              details: {
                type: 'array',
                description: 'Presente em erros de validação.',
                items: {
                  type: 'object',
                  properties: { field: { type: 'string' }, message: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
  },
}
