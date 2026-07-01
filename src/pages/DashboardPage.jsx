import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { AuthContext } from '../context/AuthContext'
import { STATUS_COLORS, capitalize, formatDate } from '../utils/statusColors'
import ConfirmModal from '../components/ConfirmModal'
import SkyBanner from '../components/SkyBanner'
import { inputCls, labelCls } from '../utils/formStyles'

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

  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetchAll()
    api.get('/games').then(res => setGames(res.data.data ?? res.data)).catch(() => {})
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
        setToast('Event updated successfully!')
      } else {
        await api.post('/events', form)
        setToast('Event created successfully!')
      }
      setTimeout(() => setToast(''), 3500)
      cancelForm()
      fetchAll()
    } catch (err) {
      setFormError(err.response?.data?.message ?? 'Something went wrong.')
    } finally {
      setFormLoading(false)
    }
  }

  async function confirmDelete() {
    setDeleteLoading(true)
    setDeleteError('')
    try {
      await api.delete(`/events/${deleteId}`)
      setDeleteId(null)
      setToast('Event deleted.')
      setTimeout(() => setToast(''), 3500)
      fetchAll()
    } catch (err) {
      setDeleteError(err.response?.data?.message ?? 'Could not delete event.')
      setDeleteLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-500 via-sky-300 to-sky-100">
      {deleteId && (
        <ConfirmModal
          title="Delete Event?"
          message={deleteError || "This action cannot be undone. Are you sure you want to delete this event?"}
          confirmLabel="Delete"
          danger
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => { setDeleteId(null); setDeleteError('') }}
        />
      )}

      <SkyBanner eyebrow="Welcome back!" title={user?.name ?? ''} pageTitle="Dashboard" subtitle="Manage your events and track your activity" />

      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 bg-white/90 backdrop-blur-md border border-white/60 text-[#0F172A] text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2"
          style={{ animation: 'fadeInUp 0.3s ease-out both' }}
        >
          <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0" />
          {toast}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8" style={{ animation: 'fadeInUp 0.35s ease-out both' }}>
        {/* Create Event button */}
        {!showForm && (
          <div className="flex justify-end mb-6">
            <button
              onClick={openCreate}
              className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-5 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer shadow-sm"
            >
              + Create Event
            </button>
          </div>
        )}

        {/* Event Form */}
        {showForm && (
          <div className="bg-white/85 backdrop-blur-sm border border-white/60 rounded-2xl p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-bold text-[#0F172A] mb-6">
              {editingId ? 'Edit Event' : 'Create an Event'}
            </h2>
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                {formError}
              </div>
            )}
            <form
              onSubmit={handleSubmit}
              onKeyDown={e => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') e.preventDefault() }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Event Title</label>
                  <input type="text" value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    required placeholder="e.g. Local tournament" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Game</label>
                  <select value={form.game_id}
                    onChange={e => setForm({ ...form, game_id: e.target.value })}
                    required className={inputCls}>
                    <option value="">Select a game</option>
                    {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3} placeholder="Describe your event..." className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Location</label>
                <input type="text" value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  required placeholder="e.g. Barcelona Game Store" className={inputCls} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Date & Time</label>
                  <input type="datetime-local" value={form.date_time}
                    onChange={e => setForm({ ...form, date_time: e.target.value })}
                    required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Max Players</label>
                  <input type="number" value={form.max_players}
                    onChange={e => setForm({ ...form, max_players: Number(e.target.value) })}
                    required min={2} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Entry Fee (€)</label>
                  <input type="number" value={form.entry_fee}
                    onChange={e => setForm({ ...form, entry_fee: Number(e.target.value) })}
                    required min={0} step="0.01" className={inputCls} />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={formLoading}
                  className="bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-50 text-white px-5 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer">
                  {formLoading ? 'Saving...' : editingId ? 'Save Changes' : 'Create Event'}
                </button>
                <button type="button" onClick={cancelForm}
                  className="border border-white/60 bg-white/50 text-[#334155] hover:bg-white/70 px-5 py-2 rounded-full text-sm transition-colors cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Event lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="font-cinzel text-xs font-bold text-white/80 uppercase tracking-widest mb-4">
              Created Events
            </h2>
            {loading ? (
              <p className="text-sm text-white/70">Loading...</p>
            ) : organizedEvents.length === 0 ? (
              <p className="text-sm text-white/70">You haven't created any events yet.</p>
            ) : (
              <div className="space-y-3">
                {organizedEvents.map(event => (
                  <div key={event.id} className="bg-white/85 backdrop-blur-sm border border-white/60 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Link to={`/events/${event.id}`}
                          className="font-semibold text-[#0F172A] hover:text-[#2563EB] text-sm transition-colors">
                          {event.title}
                        </Link>
                        <p className="text-xs text-[#334155]/70 mt-0.5">
                          {event.game?.name} · {formatDate(event.date_time)}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[event.status]}`}>
                        {capitalize(event.status)}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => openEdit(event)}
                        className="text-xs border border-[#DCEEFF] text-[#2563EB] hover:bg-[#DCEEFF] px-3 py-1 rounded-full transition-colors cursor-pointer">
                        Edit
                      </button>
                      <button onClick={() => { setDeleteId(event.id); setDeleteError('') }}
                        className="text-xs border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1 rounded-full transition-colors cursor-pointer">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-cinzel text-xs font-bold text-white/80 uppercase tracking-widest mb-4">
              Joined Events
            </h2>
            {loading ? (
              <p className="text-sm text-white/70">Loading...</p>
            ) : joinedEvents.length === 0 ? (
              <p className="text-sm text-white/70">You haven't joined any events yet.</p>
            ) : (
              <div className="space-y-3">
                {joinedEvents.map(event => (
                  <Link key={event.id} to={`/events/${event.id}`}
                    className="block bg-white/85 backdrop-blur-sm border border-white/60 rounded-xl p-4 shadow-sm hover:border-[#60A5FA] transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0F172A] text-sm">{event.title}</p>
                        <p className="text-xs text-[#334155]/70 mt-0.5">
                          {event.game?.name} · {formatDate(event.date_time)}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[event.status]}`}>
                        {capitalize(event.status)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
