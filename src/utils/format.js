const SUFFIXES = ['', 'mil', 'mi', 'bi', 'tri', 'quad', 'quint']

// Formata números grandes: 1234 -> "1,23 mil", 5_600_000 -> "5,60 mi"
export function formatNumber(value) {
  if (value < 1000) {
    return value < 10 && value % 1 !== 0
      ? value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
      : Math.floor(value).toLocaleString('pt-BR')
  }
  const tier = Math.min(Math.floor(Math.log10(value) / 3), SUFFIXES.length - 1)
  const scaled = value / Math.pow(1000, tier)
  return `${scaled.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${SUFFIXES[tier]}`
}

export function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('pt-BR')
}

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}min`
  if (m > 0) return `${m}min`
  return `${Math.floor(seconds)}s`
}
