import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Swords, Plus } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import Button from './ui/Button'

export default function Navbar() {
  const { token, user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    setOpen(false)
    await logout()
    navigate('/login')
  }

  // Close menu on navigation
  function handleLink() { setOpen(false) }

  return (
    <nav className="sticky top-0 z-50 px-6 py-3">

      {/* ── DESKTOP ── */}
      <div className="flex items-center justify-between">
        <Link to="/" className="font-cinzel font-bold text-xl tracking-tight text-white drop-shadow flex items-center gap-2">
          <Swords size={22} aria-hidden="true" /> TCG Manager
        </Link>

        {/* Desktop links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/"       className="text-sm font-medium text-white/90 hover:text-white transition-colors drop-shadow">Home</Link>
          <Link to="/events" className="text-sm font-medium text-white/90 hover:text-white transition-colors drop-shadow">Events</Link>
          <Link to="/stats"  className="text-sm font-medium text-white/90 hover:text-white transition-colors drop-shadow">Leaderboard</Link>

          {token ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-white/90 hover:text-white transition-colors drop-shadow">Dashboard</Link>
              <Link to="/profile"   className="text-sm font-medium text-white/90 hover:text-white transition-colors drop-shadow">{user?.name ?? 'Profile'}</Link>
              {user?.role === 'organizer' && (
                <Button to="/dashboard" state={{ openCreate: true }} size="sm" className="py-1.5">
                  <Plus size={14} aria-hidden="true" /> Create Event
                </Button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 rounded-full text-sm font-bold text-white bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="px-4 py-1.5 rounded-full text-sm font-bold border-2 border-white/70 text-white hover:bg-white/20 transition-colors">Login</Link>
              <Link to="/register" className="px-4 py-1.5 rounded-full text-sm font-bold text-white bg-white/20 hover:bg-white/30 border border-white/40 transition-colors">Register</Link>
            </>
          )}
        </div>

        {/* Hamburger — visible on mobile only */}
        <button
          onClick={() => setOpen(o => !o)}
          className="md:hidden flex flex-col gap-1.5 p-1 cursor-pointer"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className={`block w-5 h-0.5 bg-white transition-transform origin-center ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white transition-transform origin-center ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* ── MOBILE MENU ── */}
      {open && (
        <div className="md:hidden mt-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4 flex flex-col gap-1">
          <Link to="/"          onClick={handleLink} className="px-3 py-2 rounded-xl text-sm font-medium text-ink hover:bg-mist/60 transition-colors">Home</Link>
          <Link to="/events"    onClick={handleLink} className="px-3 py-2 rounded-xl text-sm font-medium text-ink hover:bg-mist/60 transition-colors">Events</Link>
          <Link to="/stats"     onClick={handleLink} className="px-3 py-2 rounded-xl text-sm font-medium text-ink hover:bg-mist/60 transition-colors">Leaderboard</Link>

          {token ? (
            <>
              {user?.role === 'organizer' && (
                <Button to="/dashboard" state={{ openCreate: true }} onClick={handleLink} className="mb-1">
                  <Plus size={16} aria-hidden="true" /> Create Event
                </Button>
              )}
              <Link to="/dashboard" onClick={handleLink} className="px-3 py-2 rounded-xl text-sm font-medium text-ink hover:bg-mist/60 transition-colors">Dashboard</Link>
              <Link to="/profile"   onClick={handleLink} className="px-3 py-2 rounded-xl text-sm font-medium text-ink hover:bg-mist/60 transition-colors">{user?.name ?? 'Profile'}</Link>
              <div className="border-t border-mist mt-1 pt-1">
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2 mt-1 pt-1 border-t border-mist">
              <Link to="/login"    onClick={handleLink} className="flex-1 text-center px-4 py-2 rounded-full text-sm font-bold border-2 border-primary text-primary hover:bg-mist/50 transition-colors">Login</Link>
              <Link to="/register" onClick={handleLink} className="flex-1 text-center px-4 py-2 rounded-full text-sm font-bold text-white bg-primary hover:bg-primary-deep transition-colors">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
