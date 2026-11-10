// Cliente HTTP único do front-end: todas as chamadas à API passam por aqui.
// Centraliza a URL base, o JSON, o tempo limite e a tradução de falhas em mensagens
// que podem ser mostradas ao jogador.

export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')
const TIMEOUT_MS = 8000

export class ApiError extends Error {
  constructor(message, { status = 0, details, cause } = {}) {
    super(message, { cause })
    this.name = 'ApiError'
    this.status = status // 0 = nem chegou ao servidor (rede fora, API desligada, tempo esgotado)
    this.details = details
  }
}

// Junta a mensagem geral da API com os problemas de cada campo, se houver
function buildMessage(error, status) {
  if (!error?.message) return `Erro inesperado do servidor (${status}).`
  if (!error.details?.length) return error.message
  return `${error.message} ${error.details.map((d) => d.message).join(' ')}`
}

export async function request(path, { method = 'GET', body, keepalive = false } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      keepalive, // permite concluir o envio mesmo se a aba estiver fechando
      signal: controller.signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (err) {
    const timedOut = err.name === 'AbortError'
    throw new ApiError(
      timedOut
        ? 'O servidor demorou demais para responder.'
        : 'Não foi possível conectar ao servidor. Verifique se a API está rodando.',
      { cause: err },
    )
  } finally {
    clearTimeout(timer)
  }

  if (response.status === 204) return null

  let data = null
  try {
    data = await response.json()
  } catch {
    // resposta sem JSON: tratamos abaixo
  }

  if (!response.ok) {
    throw new ApiError(buildMessage(data?.error, response.status), {
      status: response.status,
      details: data?.error?.details,
    })
  }
  return data
}
