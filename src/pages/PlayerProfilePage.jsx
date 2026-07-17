import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getPlayer } from '../api/players'
import PageShell from '../components/PageShell'
import SkyBanner from '../components/SkyBanner'
import PageScreen from '../components/PageScreen'
import Card from '../components/ui/Card'
import usePageTitle from '../hooks/usePageTitle'

export default function PlayerProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  // ── STATE ──
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  usePageTitle(player?.name)

  // ── DATA FETCHING ── public profile for whichever player id is in the URL
  useEffect(() => {
    getPlayer(id)
      .then(setPlayer)
      .catch(() => setError('Player not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageScreen message="Loading player..." />
  if (error)   return <PageScreen message={error} error />

  return (
    <PageShell>
      <SkyBanner
        eyebrow="Player Profile"
        title={player.name}
        subtitle={player.country || undefined}
      />

      <div className="max-w-3xl mx-auto px-6 py-8" style={{ animation: 'fadeInUp 0.35s ease-out both' }}>
        <button onClick={() => location.key !== 'default' ? navigate(-1) : navigate('/events')} className="text-sm text-white/80 hover:text-white mb-6 inline-block transition-colors cursor-pointer">
          ← Back
        </button>

        <Card className="p-6 mb-4">
          <div className="flex justify-around text-center mb-6">
            <div>
              <p className="text-3xl font-bold text-primary">{player.organized_events_count}</p>
              <p className="font-cinzel text-xs text-ink-soft/60 uppercase tracking-wide mt-1">Organized</p>
            </div>
            <div className="w-px bg-mist" />
            <div>
              <p className="text-3xl font-bold text-primary">{player.joined_events_count}</p>
              <p className="font-cinzel text-xs text-ink-soft/60 uppercase tracking-wide mt-1">Joined</p>
            </div>
          </div>

          <div className="border-t border-mist pt-4 grid grid-cols-2 gap-6">
            <div>
              <p className="font-cinzel text-xs font-semibold text-ink-soft/60 uppercase tracking-wide mb-1">Bio</p>
              <p className="text-sm text-ink-soft">{player.bio || 'No bio yet.'}</p>
            </div>
            <div>
              <p className="font-cinzel text-xs font-semibold text-ink-soft/60 uppercase tracking-wide mb-1">Favourite Game</p>
              <p className="text-sm text-ink-soft">{player.favorite_game?.name || 'Not set'}</p>
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  )
}
