import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../api/axios'
import SkyBanner from '../components/SkyBanner'
import PageScreen from '../components/PageScreen'

export default function PlayerProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/players/${id}`)
      .then(res => setPlayer(res.data.data ?? res.data))
      .catch(() => setError('Player not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageScreen message="Loading..." />
  if (error)   return <PageScreen message={error} />

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-500 via-sky-300 to-sky-100">
      <SkyBanner
        eyebrow="Player Profile"
        title={player.name}
        subtitle={player.country ? `📍 ${player.country}` : undefined}
      />

      <div className="max-w-3xl mx-auto px-6 py-8" style={{ animation: 'fadeInUp 0.35s ease-out both' }}>
        <button onClick={() => location.key !== 'default' ? navigate(-1) : navigate('/events')} className="text-sm text-white/80 hover:text-white mb-6 inline-block transition-colors cursor-pointer">
          ← Back
        </button>

        <div className="bg-white/85 backdrop-blur-sm border border-white/60 rounded-2xl p-6 mb-4 shadow-sm">
          <div className="flex justify-around text-center mb-6">
            <div>
              <p className="text-3xl font-bold text-[#2563EB]">{player.organized_events_count}</p>
              <p className="font-cinzel text-xs text-[#334155]/60 uppercase tracking-wide mt-1">Organized</p>
            </div>
            <div className="w-px bg-[#DCEEFF]" />
            <div>
              <p className="text-3xl font-bold text-[#2563EB]">{player.joined_events_count}</p>
              <p className="font-cinzel text-xs text-[#334155]/60 uppercase tracking-wide mt-1">Joined</p>
            </div>
          </div>

          <div className="border-t border-[#DCEEFF] pt-4 grid grid-cols-2 gap-6">
            <div>
              <p className="font-cinzel text-xs font-semibold text-[#334155]/60 uppercase tracking-wide mb-1">Bio</p>
              <p className="text-sm text-[#334155]">{player.bio || 'No bio yet.'}</p>
            </div>
            <div>
              <p className="font-cinzel text-xs font-semibold text-[#334155]/60 uppercase tracking-wide mb-1">Favourite Game</p>
              <p className="text-sm font-medium text-[#0F172A]">{player.favorite_game?.name || 'Not set'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
