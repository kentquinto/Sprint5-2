import { useState, useEffect, useContext, useCallback } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { MapPin, Calendar, Coins, Users } from 'lucide-react'
import { getEvent, getParticipants, joinEvent, leaveEvent } from '../api/events'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { AuthContext } from '../context/AuthContext'
import { getGameImage } from '../utils/gameImages'
import { STATUS_COLORS } from '../utils/statusColors'
import { capitalize, formatDate } from '../utils/format'
import ConfirmModal from '../components/ConfirmModal'
import LoginPromptModal from '../components/LoginPromptModal'
import PageScreen from '../components/PageScreen'
import usePageTitle from '../hooks/usePageTitle'
import useToast from '../hooks/useToast'

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user } = useContext(AuthContext)
  const showToast = useToast()

  // ── STATE ──
  const [event, setEvent] = useState(null)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingAction, setPendingAction] = useState(null) // 'join' | 'leave' | null — drives the confirm modal
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  usePageTitle(event?.title)

  // ── DATA FETCHING ──
  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const eventData = await getEvent(id)
      setEvent(eventData)
    } catch {
      setError('Could not load event.')
      setLoading(false)
      return
    }

    // Participants require auth — a logged-out visitor still sees the event,
    // just not the participants list.
    if (token) {
      try {
        setParticipants(await getParticipants(id))
      } catch {
        setParticipants([])
      }
    }
    setLoading(false)
  }, [id, token])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── HANDLERS ── join/leave, confirmed via the pending-action modal
  async function handleConfirm() {
    setError('')
    setActionLoading(true)
    try {
      if (pendingAction === 'join') {
        await joinEvent(id)
        showToast('You have joined the event!')
      } else {
        await leaveEvent(id)
        showToast('You have left the event.')
      }
      setPendingAction(null)
      await fetchAll()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong.')
      setPendingAction(null)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <PageScreen message="Loading event..." />
  if (!event)  return <PageScreen message="Event not found." error />

  // ── DERIVED ── who's viewing and what actions they're allowed to take
  const isParticipant = participants.some(p => Number(p.id) === Number(user?.id))
  const isCreator = Number(event.creator?.id) === Number(user?.id)
  const isFull = event.participants_count >= event.max_players
  const canJoin = token && !isCreator && !isParticipant && !isFull &&
    (event.status === 'upcoming' || event.status === 'ongoing')
  const gameImg = getGameImage(event.game?.name)

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-500 via-sky-300 to-sky-100">
      {pendingAction && (
        <ConfirmModal
          title={pendingAction === 'join' ? 'Join Event?' : 'Leave Event?'}
          message={pendingAction === 'join'
            ? `You are about to join "${event.title}". Are you sure?`
            : `You are about to leave "${event.title}". Are you sure?`}
          confirmLabel={pendingAction === 'join' ? 'Yes, join' : 'Yes, leave'}
          danger={pendingAction === 'leave'}
          loading={actionLoading}
          onConfirm={handleConfirm}
          onCancel={() => setPendingAction(null)}
        />
      )}

      <LoginPromptModal open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />

      <div className="max-w-4xl mx-auto px-6 py-8" style={{ animation: 'fadeInUp 0.35s ease-out both' }}>
        <button onClick={() => location.key !== 'default' ? navigate(-1) : navigate('/events')} className="text-sm text-white/80 hover:text-white mb-4 inline-block transition-colors cursor-pointer">
          ← Back
        </button>

        {/* Game image banner */}
        <div className="relative rounded-2xl overflow-hidden mb-6 bg-gray-800 h-44 shadow-sm">
          {gameImg && (
            <img src={gameImg} alt={event.game?.name}
              className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent flex flex-col justify-end px-6 pb-5 text-white">
            <p className="font-cinzel text-xs font-bold uppercase tracking-widest text-white/80 mb-1 drop-shadow">
              {event.game?.name}
            </p>
            <h1 className="text-2xl font-bold leading-tight drop-shadow">{event.title}</h1>
            <p className="text-white/70 text-xs mt-1 drop-shadow">
              by{' '}
              <Link to={`/players/${event.creator?.id}`} className="text-sky-300 hover:underline"
                onClick={e => { if (!token) { e.preventDefault(); setShowLoginPrompt(true) } }}>
                {event.creator?.name}
              </Link>
            </p>
          </div>
        </div>

        {/* Event details + join/leave actions */}
        <Card className="p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[event.status]}`}>
                {capitalize(event.status)}
              </span>
              {isFull && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-600">
                  Full
                </span>
              )}
            </div>
            <span className="font-cinzel text-xs font-semibold text-ink-soft/60 uppercase tracking-wide">
              {event.game?.name}
            </span>
          </div>

          <p className="font-cinzel text-xs font-semibold text-ink-soft/60 uppercase tracking-wide mb-3">
            Event Details
          </p>
          <div className="space-y-2 text-sm text-ink-soft mb-6">
            <p className="flex items-center gap-2"><MapPin size={15} className="shrink-0 text-ink-soft/60" aria-hidden="true" />{event.location}</p>
            <p className="flex items-center gap-2"><Calendar size={15} className="shrink-0 text-ink-soft/60" aria-hidden="true" />{formatDate(event.date_time)} · {new Date(event.date_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="flex items-center gap-2"><Coins size={15} className="shrink-0 text-ink-soft/60" aria-hidden="true" />{event.entry_fee > 0 ? `€${event.entry_fee}` : 'Free entry'}</p>
            <div>
              <p className="mb-1 flex items-center gap-2"><Users size={15} className="shrink-0 text-ink-soft/60" aria-hidden="true" />{event.participants_count} / {event.max_players} players</p>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min((event.participants_count / event.max_players) * 100, 100)}%`,
                    background: isFull ? 'var(--color-red-500)' : event.participants_count / event.max_players >= 0.75 ? 'var(--color-amber-500)' : 'var(--color-primary)',
                  }}
                />
              </div>
            </div>
          </div>

          {event.description && (
            <>
              <p className="font-cinzel text-xs font-semibold text-ink-soft/60 uppercase tracking-wide mb-2">
                Description
              </p>
              <p className="text-sm text-ink-soft mb-6">{event.description}</p>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {token && !isCreator && !isParticipant && isFull && (
            <p className="text-sm text-red-500 font-semibold">This event is full.</p>
          )}
          {!token && (
            <Button to="/login">Login to Join</Button>
          )}
          {canJoin && (
            <Button onClick={() => setPendingAction('join')}>Join Event</Button>
          )}
          {token && isParticipant && (
            <Button variant="danger" onClick={() => setPendingAction('leave')}>Leave Event</Button>
          )}
        </Card>

        {/* Participants list — names link to profiles; requires login to view */}
        <Card className="p-6">
          <p className="font-cinzel text-xs font-semibold text-ink-soft/60 uppercase tracking-wide mb-4">
            Participants ({event.participants_count})
          </p>
          {!token ? (
            <p className="text-sm text-ink-soft/60">
              <Link to="/login" className="text-primary hover:underline font-medium">Login</Link> to view participants.
            </p>
          ) : participants.length === 0 ? (
            <p className="text-sm text-ink-soft/60">No participants yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {participants.map(p => (
                <Link key={p.id} to={`/players/${p.id}`}
                  className="bg-white/70 hover:bg-white text-ink text-sm px-3 py-1 rounded-full border border-mist hover:border-sky-bright transition-colors">
                  {p.name}
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
