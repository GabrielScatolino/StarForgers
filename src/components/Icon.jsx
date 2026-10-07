// Ícone do Bootstrap Icons. Uso: <Icon name="gem" /> (nome sem o prefixo "bi-")
export default function Icon({ name, className = '' }) {
  return <i className={`bi bi-${name} ${className}`.trim()} aria-hidden="true" />
}

// Quantidade de cristais com o ícone ao lado: <Crystal value="1,2 mil" />
export function Crystal({ value, className = '' }) {
  return (
    <span className={`crystal ${className}`.trim()}>
      <Icon name="gem" /> {value}
    </span>
  )
}

// Emblema do piloto. Aceita nome de ícone (novo) ou um emoji (saves antigos).
export function Emblem({ value, className = '' }) {
  const isIcon = EMBLEM_ICON_PATTERN.test(value ?? '')
  return isIcon ? <Icon name={value} className={className} /> : <span className={className}>{value}</span>
}

const EMBLEM_ICON_PATTERN = /^[a-z0-9-]+$/
