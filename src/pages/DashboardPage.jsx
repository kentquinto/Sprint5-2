import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { AuthContext } from '../context/AuthContext'

const STATUS_COLORS = {
  upcoming: 'bg-yellow-100 text-yellow-800',
  ongoing: 'bg-green-100 text-green-800',
  finished: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
}

const EMPTY_FORM = {
  title: '', description: '', location: '',
  date_time: '', max_players: 16, entry_fee: 0, game_id: '',
}

export default function DashboardPage() {
  const { user } = useContext(AuthContext)

  const [organizedEvents, setOrganizedEvents] = useState([])
  const [joinedEvents, setJoinedEvents] = useState([])
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    fetchAll()
    api.get('/games').then(res => setGames(res.data.data ?? res.data))
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [orgRes, joinRes] = await Promise.all([
        api.get('/me/organized-events'),
        api.get('/me/joined-events'),
      ])
      setOrganizedEvents(orgRes.data.data ?? orgRes.data)
      setJoinedEvents(joinRes.data.data ?? joinRes.data)
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowForm(true)
  }

  function openEdit(event) {
    setEditingId(event.id)
    setForm({
      title: event.title,
      description: event.description ?? '',
      location: event.location,
      date_time: event.date_time?.slice(0, 16) ?? '',
      max_players: event.max_players,
      entry_fee: event.entry_fee,
      game_id: event.game?.id ?? '',
    })
    setFormError('')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)
    try {
      if (editingId) {
        await api.put(`/events/${editingId}`, form)
      } else {
        await api.post('/events', form)
      }
      cancelForm()
      fetchAll()
    } catch (err) {
      setFormError(err.response?.data?.message ?? 'Something went wrong.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this event?')) return
    try {
      await api.delete(`/events/${id}`)
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.message ?? 'Could not delete event.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-gray-500">Welcome back!</p>
          <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
        </div>
        {!showForm && (
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors cursor-pointer"
          >
            + Create Event
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            {editingId ? 'Edit Event' : 'Create an Event'}
          </h2>
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3 mb-4">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Event Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="e.g. Local tournament"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Game</label>
                <select
                  value={form.game_id}
                  onChange={e => setForm({ ...form, game_id: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select a game</option>
                  {games.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Describe your event..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                required
                placeholder="e.g. Barcelona Game Store"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={form.date_time}
                  onChange={e => setForm({ ...form, date_time: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Max Players</label>
                <input
                  type="number"
                  value={form.max_players}
                  onChange={e => setForm({ ...form, max_players: e.target.value })}
                  required
                  min={2}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Entry Fee (€)</label>
                <input
                  type="number"
                  value={form.entry_fee}
                  onChange={e => setForm({ ...form, entry_fee: e.target.value })}
                  required
                  min={0}
                  step="0.01"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={formLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded text-sm font-medium transition-colors cursor-pointer"
              >
                {formLoading ? 'Saving...' : editingId ? 'Save Changes' : 'Create Event'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-5 py-2 rounded text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Created Events
          </h2>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : organizedEvents.length === 0 ? (
            <p className="text-sm text-gray-400">You haven't created any events yet.</p>
          ) : (
            <div className="space-y-3">
              {organizedEvents.map(event => (
                <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/events/${event.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 text-sm"
                      >
                        {event.title}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {event.game?.name} · {new Date(event.date_time).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[event.status]}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => openEdit(event)}
                      className="text-xs border border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-1 rounded transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-xs border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1 rounded transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Joined Events
          </h2>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : joinedEvents.length === 0 ? (
            <p className="text-sm text-gray-400">You haven't joined any events yet.</p>
          ) : (
            <div className="space-y-3">
              {joinedEvents.map(event => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{event.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {event.game?.name} · {new Date(event.date_time).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[event.status]}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
