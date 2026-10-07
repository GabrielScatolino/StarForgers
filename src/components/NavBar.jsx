import { NavLink, useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'
import { formatNumber } from '../utils/format'
import Icon, { Crystal, Emblem } from './Icon'

export default function NavBar() {
  const { player, game, logout } = useGame()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active fw-bold' : ''}`

  return (
    <nav className="navbar navbar-expand-md border-bottom border-secondary-subtle sticky-top bg-body">
      <div className="container">
        <NavLink to="/" className="navbar-brand fw-bold">
          <Icon name="rocket-takeoff" className="text-info" /> StarForgers
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Abrir menu"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink to="/" end className={linkClass}>Início</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/jogo" className={linkClass}>Jogo</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/loja" className={linkClass}>Loja</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/galaxia" className={linkClass}>Galáxia</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/ranking" className={linkClass}>Ranking</NavLink>
            </li>
          </ul>

          {player && game && (
            <div className="d-flex align-items-center gap-2">
              <span className="badge text-bg-info fs-6">
                <Crystal value={formatNumber(game.crystals)} />
              </span>
              <span className="text-body-secondary small">
                <Emblem value={player.emblem} /> {player.name}
              </span>
              <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                <Icon name="box-arrow-right" /> Trocar piloto
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
