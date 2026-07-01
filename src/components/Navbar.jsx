import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Navbar() {
  const { token, user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-3"
    >
      <Link to="/" className="font-cinzel font-bold text-xl tracking-tight text-white drop-shadow">
        ⚔️ TCG Manager
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/"       className="text-sm font-medium text-white/90 hover:text-white transition-colors drop-shadow">Home</Link>
        <Link to="/events" className="text-sm font-medium text-white/90 hover:text-white transition-colors drop-shadow">Events</Link>
        <Link to="/stats"  className="text-sm font-medium text-white/90 hover:text-white transition-colors drop-shadow">Leaderboard</Link>

        {token ? (
          <>
            <Link to="/dashboard" className="text-sm font-medium text-white/90 hover:text-white transition-colors drop-shadow">Dashboard</Link>
            <Link to="/profile"   className="text-sm font-medium text-white/90 hover:text-white transition-colors drop-shadow">{user?.name ?? 'Profile'}</Link>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 rounded-full text-sm font-bold text-white bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-full text-sm font-bold border-2 border-white/70 text-white hover:bg-white/20 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-1.5 rounded-full text-sm font-bold text-white bg-white/20 hover:bg-white/30 border border-white/40 transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
