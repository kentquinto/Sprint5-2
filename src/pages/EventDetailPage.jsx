import { useState, useEffect, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import { AuthContext } from '../context/AuthContext'

const STATUS_COLORS = {
  upcoming: 'bg-yellow-100 text-yellow-800',
  ongoing: 'bg-green-100 text-green-800',
  finished: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
}

function ConfirmModal({ action, eventTitle, onConfirm, onCancel, loading }) {
  const isJoining = action === 'join'
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          {isJoining ? 'Join Event?' : 'Leave Event?'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {isJoining
            ? `You are about to join "${eventTitle}". Are you sure?`
            : `You are about to leave "${eventTitle}". Are you sure?`}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded text-sm text-white font-medium transition-colors cursor-pointer disabled:opacity-50 ${
              isJoining
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {loading
              ? isJoining ? 'Joining...' : 'Leaving...'
              : isJoining ? 'Yes, join' : 'Yes, leave'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EventDetailPage() {
  const { id } = useParams()
  const { token, user } = useContext(AuthContext)

  const [event, setEvent] = useState(null)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingAction, setPendingAction] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [id])

  async function fetchAll() {
    setLoading(true)
    try {
      const [eventRes, participantsRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/events/${id}/participants`),
      ])
      setEvent(eventRes.data.data ?? eventRes.data)
      const parts = participantsRes.data.data ?? participantsRes.data ?? []
      setParticipants(parts)
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
      } else {
        await api.delete(`/events/${id}/participants`)
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

  if (loading) return <p className="text-center text-gray-400 py-20">Loading...</p>
  if (!event) return <p className="text-center text-gray-400 py-20">Event not found.</p>

  const isParticipant = participants.some(p => Number(p.id) === Number(user?.id))
  const isCreator = Number(event.creator?.id) === Number(user?.id)
  const canJoin = token && !isCreator && !isParticipant &&
    (event.status === 'upcoming' || event.status === 'ongoing')

  return (
    <>
      {pendingAction && (
        <ConfirmModal
          action={pendingAction}
          eventTitle={event.title}
          onConfirm={handleConfirm}
          onCancel={() => setPendingAction(null)}
          loading={actionLoading}
        />
      )}

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-gray-800 rounded-lg px-8 py-10 mb-6 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            {event.game?.name}
          </p>
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <p className="text-gray-400 text-sm">
            Organized by{' '}
            <Link to={`/players/${event.creator?.id}`} className="text-blue-400 hover:underline">
              {event.creator?.name}
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[event.status]}`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {event.game?.name}
            </span>
          </div>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Event Details
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-6">
            <p>📍 {event.location}</p>
            <p>📅 {new Date(event.date_time).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric',
            })} · {new Date(event.date_time).toLocaleTimeString('en-GB', {
              hour: '2-digit', minute: '2-digit',
            })}</p>
            <p>💰 {event.entry_fee > 0 ? `€${event.entry_fee}` : 'Free entry'}</p>
            <p>👥 {event.participants_count} / {event.max_players} players</p>
          </div>

          {event.description && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Description
              </p>
              <p className="text-sm text-gray-700 mb-6">{event.description}</p>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {!token && (
            <Link
              to="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-medium transition-colors"
            >
              Login to Join
            </Link>
          )}

          {canJoin && (
            <button
              onClick={() => setPendingAction('join')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-medium transition-colors cursor-pointer"
            >
              Join Event
            </button>
          )}

          {token && isParticipant && (
            <button
              onClick={() => setPendingAction('leave')}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded text-sm font-medium transition-colors cursor-pointer"
            >
              Leave Event
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Participants ({participants.length})
          </p>
          {participants.length === 0 ? (
            <p className="text-sm text-gray-400">No participants yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {participants.map(p => (
                <Link
                  key={p.id}
                  to={`/players/${p.id}`}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full transition-colors"
                >
                  {p.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
