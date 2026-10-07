// Camada de dados dos jogadores.
//
// Todas as funções são ASSÍNCRONAS (retornam Promise) de propósito: hoje os dados
// ficam no localStorage, mas na Sprint 3 basta trocar o corpo de cada função por
// um fetch() para a API REST, sem mexer nas páginas nem nos componentes.
//
//   Create -> createPlayer      (POST   /players)
//   Read   -> getPlayers/getPlayer (GET /players, /players/:id)
//   Update -> updatePlayer      (PUT    /players/:id)
//   Delete -> deletePlayer      (DELETE /players/:id)

import { createInitialGameState } from '../utils/gameLogic'

const STORAGE_KEY = 'colonia-espacial:players'

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeAll(players) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players))
}

export async function getPlayers() {
  return readAll()
}

export async function getPlayer(id) {
  return readAll().find((p) => p.id === id) ?? null
}

export async function createPlayer({ name, emblem }) {
  const player = {
    id: crypto.randomUUID(),
    name: name.trim(),
    emblem,
    createdAt: Date.now(),
    game: createInitialGameState(),
  }
  writeAll([...readAll(), player])
  return player
}

export async function updatePlayer(id, changes) {
  const players = readAll()
  const index = players.findIndex((p) => p.id === id)
  if (index === -1) return null
  players[index] = { ...players[index], ...changes }
  writeAll(players)
  return players[index]
}

export async function deletePlayer(id) {
  writeAll(readAll().filter((p) => p.id !== id))
}
