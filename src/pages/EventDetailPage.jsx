import { useState, useEffect, useContext } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../api/axios'
import { AuthContext } from '../context/AuthContext'
import { getGameImage } from '../utils/gameImages'
import { STATUS_COLORS, capitalize, formatDate } from '../utils/statusColors'
import ConfirmModal from '../components/ConfirmModal'
import Toast from '../components/Toast'
import PageScreen from '../components/PageScreen'

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user } = useContext(AuthContext)

  const [event, setEvent] = useState(null)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingAction, setPendingAction] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => { fetchAll() }, [id])

  async function fetchAll() {
    setLoading(true)
    try {
      const [eventRes, participantsRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/events/${id}/participants`),
      ])
      const eventData = eventRes.data.data ?? eventRes.data
      setEvent(eventData)
      setParticipants(participantsRes.data.data ?? participantsRes.data ?? [])
      document.title = `${eventData.title} — TCG Manager`
    } catch {
      setError('Could not load event.')
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm() {
    setError('')
    setActionLoading(true)
    try {
      if (pendingAction === 'join') {
        await api.post(`/events/${id}/participants`)
        setToast('You have joined the event!')
      } else {
        await api.delete(`/events/${id}/participants`)
        setToast('You have left the event.')
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

  if (loading) return <PageScreen message="Loading..." />
  if (!event)  return <PageScreen message="Event not found." />

  const isParticipant = participants.some(p => Number(p.id) === Number(user?.id))
  const isCreator = Number(event.creator?.id) === Number(user?.id)
  const canJoin = token && !isCreator && !isParticipant &&
    (event.status === 'upcoming' || event.status === 'ongoing')

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-500 via-sky-300 to-sky-100">
      <Toast message={toast} onDone={() => setToast('')} />

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

      <div className="max-w-4xl mx-auto px-6 py-8" style={{ animation: 'fadeInUp 0.35s ease-out both' }}>
        <button onClick={() => location.key !== 'default' ? navigate(-1) : navigate('/events')} className="text-sm text-white/80 hover:text-white mb-4 inline-block transition-colors cursor-pointer">
          ← Back
        </button>

        {/* Game image banner */}
        <div className="relative rounded-2xl overflow-hidden mb-6 bg-gray-800 h-44 shadow-sm">
          {getGameImage(event.game?.id) && (
            <img src={getGameImage(event.game?.id)} alt={event.game?.name}
              className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent flex flex-col justify-end px-6 pb-5 text-white">
            <p className="font-cinzel text-xs font-bold uppercase tracking-widest text-white/80 mb-1 drop-shadow">
              {event.game?.name}
            </p>
            <h1 className="text-2xl font-bold leading-tight drop-shadow">{event.title}</h1>
            <p className="text-white/70 text-xs mt-1 drop-shadow">
              by{' '}
              <Link to={`/players/${event.creator?.id}`} className="text-[#93C5FD] hover:underline">
                {event.creator?.name}
              </Link>
            </p>
          </div>
        </div>

        {/* Event details */}
        <div className="bg-white/85 backdrop-blur-sm border border-white/60 rounded-2xl p-6 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[event.status]}`}>
              {capitalize(event.status)}
            </span>
            <span className="font-cinzel text-xs font-semibold text-[#334155]/60 uppercase tracking-wide">
              {event.game?.name}
            </span>
          </div>

          <p className="font-cinzel text-xs font-semibold text-[#334155]/60 uppercase tracking-wide mb-3">
            Event Details
          </p>
          <div className="space-y-2 text-sm text-[#334155] mb-6">
            <p>📍 {event.location}</p>
            <p>📅 {formatDate(event.date_time)} · {new Date(event.date_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
            <p>💰 {event.entry_fee > 0 ? `€${event.entry_fee}` : 'Free entry'}</p>
            <p>👥 {event.participants_count} / {event.max_players} players</p>
          </div>

          {event.description && (
            <>
              <p className="font-cinzel text-xs font-semibold text-[#334155]/60 uppercase tracking-wide mb-2">
                Description
              </p>
              <p className="text-sm text-[#334155] mb-6">{event.description}</p>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {!token && (
            <Link to="/login"
              className="inline-block bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-5 py-2 rounded-full text-sm font-bold transition-colors shadow-sm">
              Login to Join
            </Link>
          )}
          {canJoin && (
            <button onClick={() => setPendingAction('join')}
              className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-5 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer shadow-sm">
              Join Event
            </button>
          )}
          {token && isParticipant && (
            <button onClick={() => setPendingAction('leave')}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer shadow-sm">
              Leave Event
            </button>
          )}
        </div>

        {/* Participants */}
        <div className="bg-white/85 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-sm">
          <p className="font-cinzel text-xs font-semibold text-[#334155]/60 uppercase tracking-wide mb-4">
            Participants ({participants.length})
          </p>
          {participants.length === 0 ? (
            <p className="text-sm text-[#334155]/60">No participants yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {participants.map(p => (
                <Link key={p.id} to={`/players/${p.id}`}
                  className="bg-white/70 hover:bg-white text-[#0F172A] text-sm px-3 py-1 rounded-full border border-[#DCEEFF] hover:border-[#60A5FA] transition-colors">
                  {p.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
