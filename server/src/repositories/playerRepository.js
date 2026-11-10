// Única camada que conversa com o MongoDB. O restante da API não conhece o Mongoose,
// então trocar de banco no futuro significa mexer só neste arquivo.
const Player = require('../models/Player')

// Nomes aceitos na API -> campos reais no documento
const SORT_FIELD_MAP = {
  createdAt: 'createdAt',
  name: 'name',
  lifetimeEarned: 'game.lifetimeEarned',
}

function findAll({ sort, order, skip, limit }) {
  const direction = order === 'asc' ? 1 : -1
  // O _id no final garante uma ordem estável entre páginas quando há empates
  return Player.find()
    .sort({ [SORT_FIELD_MAP[sort]]: direction, _id: direction })
    .skip(skip)
    .limit(limit)
}

function count() {
  return Player.countDocuments()
}

function findById(id) {
  return Player.findById(id)
}

function create(data) {
  return Player.create(data)
}

function update(id, changes) {
  return Player.findByIdAndUpdate(id, { $set: changes }, { new: true, runValidators: true })
}

function remove(id) {
  return Player.findByIdAndDelete(id)
}

module.exports = { findAll, count, findById, create, update, remove, SORT_FIELD_MAP }
