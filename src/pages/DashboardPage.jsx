import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { AuthContext } from '../context/AuthContext'
import { STATUS_COLORS, capitalize, formatDate } from '../utils/statusColors'
import ConfirmModal from '../components/ConfirmModal'
import SkyBanner from '../components/SkyBanner'
import EventForm from '../components/EventForm'
import Toast from '../components/Toast'

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

      <Toast message={toast} onDone={() => setToast('')} />

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
          <EventForm
            form={form}
            setForm={setForm}
            games={games}
            editingId={editingId}
            formError={formError}
            formLoading={formLoading}
            onSubmit={handleSubmit}
            onCancel={cancelForm}
          />
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
