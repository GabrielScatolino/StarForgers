// Camada HTTP: traduz requisição -> serviço -> resposta. Nenhuma regra de negócio aqui.
// (No Express 5, erros de funções async vão sozinhos para o middleware de erros.)
const playerService = require('../services/playerService')

async function list(req, res) {
  res.json(await playerService.list(req.query))
}

async function getById(req, res) {
  res.json(await playerService.getById(req.params.id))
}

async function create(req, res) {
  const player = await playerService.create(req.body)
  res.status(201).location(`${req.baseUrl}/${player.id}`).json(player)
}

async function replace(req, res) {
  res.json(await playerService.update(req.params.id, req.body, { partial: false }))
}

async function patch(req, res) {
  res.json(await playerService.update(req.params.id, req.body, { partial: true }))
}

async function remove(req, res) {
  await playerService.remove(req.params.id)
  res.status(204).send()
}

module.exports = { list, getById, create, replace, patch, remove }
