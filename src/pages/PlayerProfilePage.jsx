import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'

export default function PlayerProfilePage() {
  const { id } = useParams()
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/players/${id}`)
      .then(res => setPlayer(res.data.data ?? res.data))
      .catch(() => setError('Player not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="text-center text-gray-400 py-20">Loading...</p>
  if (error) return <p className="text-center text-gray-400 py-20">{error}</p>

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link to="/events" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Events
      </Link>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Player Profile
        </p>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{player.name}</h1>
            {player.country && (
              <p className="text-sm text-gray-500 mt-1">📍 {player.country}</p>
            )}
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{player.organized_events_count}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Organized</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{player.joined_events_count}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Joined</p>
            </div>
          </div>
        </div>

        <hr className="my-4 border-gray-100" />

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Bio</p>
            <p className="text-sm text-gray-700">{player.bio || 'No bio yet.'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Favourite Game</p>
            <p className="text-sm font-medium text-gray-900">
              {player.favorite_game?.name || 'Not set'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
