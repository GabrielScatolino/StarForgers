import { Route, Routes } from 'react-router-dom'
import DevPanel from './components/DevPanel'
import NavBar from './components/NavBar'
import RequirePlayer from './components/RequirePlayer'
import Galaxy from './pages/Galaxy'
import Game from './pages/Game'
import Home from './pages/Home'
import Ranking from './pages/Ranking'
import Shop from './pages/Shop'

export default function App() {
  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jogo" element={<RequirePlayer><Game /></RequirePlayer>} />
          <Route path="/loja" element={<RequirePlayer><Shop /></RequirePlayer>} />
          <Route path="/galaxia" element={<RequirePlayer><Galaxy /></RequirePlayer>} />
          <Route path="/ranking" element={<RequirePlayer><Ranking /></RequirePlayer>} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <DevPanel />
    </>
  )
}
