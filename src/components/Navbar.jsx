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
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-blue-600 font-bold text-xl tracking-tight">
        TCG Manager
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
          Events
        </Link>
        {token ? (
          <>
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
              Dashboard
            </Link>
            <Link to="/profile" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
              {user?.name ?? 'Profile'}
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded text-sm transition-colors cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded text-sm transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
