import { Link } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function HomePage() {
  const { token } = useContext(AuthContext)

  return (
    <div>
      <div className="relative overflow-hidden text-white">
        <img
          src="/images/ui/bannerwallpaper.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative flex flex-col items-center justify-center text-center px-6 py-32">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-3">
            Welcome to TCG Manager!
          </p>
          <h1 className="text-5xl font-bold mb-4">Your TCG Tournament Hub</h1>
          <p className="text-gray-300 text-lg max-w-xl mb-8">
            Organize and join Trading Card Game tournaments hosted by other players
            for Yu-Gi-Oh!, Pokémon, Magic: The Gathering, and more!
          </p>
          <div className="flex gap-4">
            <Link
              to="/events"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded font-medium text-sm transition-colors"
            >
              Browse Events
            </Link>
            {!token && (
              <Link
                to="/login"
                className="border border-white text-white hover:bg-white hover:text-gray-900 px-6 py-2.5 rounded font-medium text-sm transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Discover</p>
            <h3 className="font-bold text-gray-900 mb-2">Browse Events!</h3>
            <p className="text-sm text-gray-500">
              Find user-organised tournaments for Yu-Gi-Oh!, Pokémon, Magic: The Gathering, and more!
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Compete</p>
            <h3 className="font-bold text-gray-900 mb-2">Join & Compete!</h3>
            <p className="text-sm text-gray-500">
              Register for events with ease and track all your upcoming matches.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Organise</p>
            <h3 className="font-bold text-gray-900 mb-2">Host your own Tournaments!</h3>
            <p className="text-sm text-gray-500">
              Create and manage your own events, set entry fees, and track participants.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
