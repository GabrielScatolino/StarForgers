import { formatNumber } from '../utils/format'
import Icon, { Crystal } from './Icon'

// Card genérico de compra, usado tanto por geradores quanto por melhorias de clique
export default function UpgradeCard({ icon, name, desc, cost, owned, canBuy, soldOut, onBuy, extra }) {
  return (
    <div className={`card h-100 upgrade-card${canBuy ? ' affordable' : ''}${soldOut ? ' opacity-50' : ''}`}>
      <div className="card-body d-flex flex-column">
        <div className="d-flex align-items-start gap-3">
          <span className="upgrade-icon">
            <Icon name={icon} />
          </span>
          <div className="flex-grow-1">
            <h3 className="h6 mb-1">{name}</h3>
            <p className="small text-body-secondary mb-1">{desc}</p>
            {extra && <p className="small text-info mb-0">{extra}</p>}
          </div>
          {owned !== undefined && (
            <span className="badge text-bg-secondary" title="Quantidade que você possui">
              x{owned}
            </span>
          )}
        </div>
        <button
          className={`btn mt-3 ${canBuy ? 'btn-success' : 'btn-outline-secondary'}`}
          disabled={!canBuy}
          onClick={onBuy}
        >
          {soldOut ? (
            <>
              <Icon name="check-circle" /> Comprado
            </>
          ) : (
            <>
              Comprar · <Crystal value={formatNumber(cost)} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
