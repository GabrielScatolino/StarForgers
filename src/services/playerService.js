// Camada de dados dos jogadores, agora falando com a API REST (antes era o localStorage).
// As assinaturas das funções são as mesmas de antes, então as páginas quase não mudaram.
//
//   Create -> createPlayer      (POST   /players)
//   Read   -> getPlayers/getPlayer (GET /players, /players/:id)
//   Update -> updatePlayer      (PATCH  /players/:id)
//   Delete -> deletePlayer      (DELETE /players/:id)

import { createInitialGameState } from '../utils/gameLogic'
import { ApiError, request } from './apiClient'

// Lista os pilotos. Para o ranking global: { sort: 'lifetimeEarned', order: 'desc' }
export async function getPlayers({ sort = 'createdAt', order = 'asc', limit = 100 } = {}) {
  const query = new URLSearchParams({ sort, order, limit: String(limit) })
  const { data } = await request(`/players?${query}`)
  return data
}

// Devolve o piloto, ou null se ele não existe mais (as demais falhas são lançadas)
export async function getPlayer(id) {
  try {
    return await request(`/players/${id}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

export function createPlayer({ name, emblem }) {
  return request('/players', { method: 'POST', body: { name, emblem, game: createInitialGameState() } })
}

// Envia só o que mudou (ex.: { game } no autosave, ou { name, emblem } na edição)
export function updatePlayer(id, changes, { keepalive = false } = {}) {
  return request(`/players/${id}`, { method: 'PATCH', body: changes, keepalive })
}

export async function deletePlayer(id) {
  await request(`/players/${id}`, { method: 'DELETE' })
}
