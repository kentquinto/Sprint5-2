import { useState, useEffect, useContext, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { getOrganizedEvents, getJoinedEvents } from '../api/me'
import { getGames } from '../api/games'
import { createEvent, updateEvent, deleteEvent } from '../api/events'
import { getFormErrors } from '../api/errors'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { AuthContext } from '../context/AuthContext'
import { STATUS_COLORS } from '../utils/statusColors'
import { capitalize, formatDate } from '../utils/format'
import ConfirmModal from '../components/ConfirmModal'
import PageShell from '../components/PageShell'
import SkyBanner from '../components/SkyBanner'
import EventForm from '../components/EventForm'
import usePageTitle from '../hooks/usePageTitle'
import useToast from '../hooks/useToast'

const EMPTY_FORM = {
  title: '', description: '', location: '',
  date_time: '', max_players: 16, entry_fee: 0, game_id: '',
}


export default function DashboardPage() {
  const { user } = useContext(AuthContext)
  const location = useLocation()
  const showToast = useToast()
  usePageTitle('Dashboard')

  // ── STATE ──
  const [organizedEvents, setOrganizedEvents] = useState([])
  const [joinedEvents, setJoinedEvents] = useState([])
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  // create/edit form — editingId null means "creating", set means "editing that event"
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [formFieldErrors, setFormFieldErrors] = useState({})
  const [formLoading, setFormLoading] = useState(false)

  // delete confirmation modal — deleteId set means the modal is open for that event
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // ── DATA FETCHING ──
  const fetchAll = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const isOrganizer = user?.role === 'organizer'
      const [organized, joined] = await Promise.all([
        isOrganizer ? getOrganizedEvents() : Promise.resolve(null),
        getJoinedEvents(),
      ])
      if (organized) setOrganizedEvents(organized)
      setJoinedEvents(joined)
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [user?.role])

  useEffect(() => { fetchAll() }, [fetchAll])

  useEffect(() => {
    getGames().then(setGames).catch(() => {})
  }, [])

  // ── FORM HANDLERS ──
  const openCreate = useCallback(() => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setFormFieldErrors({})
    setShowForm(true)
  }, [])

  // Navbar "Create Event" links here with openCreate state — open the form directly
  useEffect(() => {
    if (location.state?.openCreate && user?.role === 'organizer') openCreate()
  }, [location.state, user?.role, openCreate])

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
    setFormFieldErrors({})
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
    setFormFieldErrors({})
    setFormLoading(true)
    try {
      if (editingId) {
        await updateEvent(editingId, form)
        showToast('Event updated successfully!')
      } else {
        await createEvent(form)
        showToast('Event created successfully!')
      }
      cancelForm()
      await fetchAll()
    } catch (err) {
      const { fieldErrors: fields, message } = getFormErrors(err)
      setFormFieldErrors(fields)
      setFormError(message)
    } finally {
      setFormLoading(false)
    }
  }

  // ── DELETE HANDLER ──
  async function confirmDelete() {
    setDeleteLoading(true)
    setDeleteError('')
    try {
      await deleteEvent(deleteId)
      setDeleteId(null)
      showToast('Event deleted.')
      fetchAll()
    } catch (err) {
      setDeleteError(err.response?.data?.message ?? 'Could not delete event.')
      setDeleteLoading(false)
    }
  }

  return (
    <PageShell>
      {deleteId && (
        <ConfirmModal
          title="Delete Event?"
          message="This action cannot be undone. Are you sure you want to delete this event?"
          error={deleteError}
          confirmLabel="Delete"
          danger
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => { setDeleteId(null); setDeleteError('') }}
        />
      )}

      <SkyBanner eyebrow="Welcome back!" title={user?.name ?? ''} subtitle="Manage your events and track your activity" />

      <div className="max-w-6xl mx-auto px-6 py-8" style={{ animation: 'fadeInUp 0.35s ease-out both' }}>
        {/* Create Event button — organizers only, hidden while the form is open */}
        {!showForm && user?.role === 'organizer' && (
          <div className="flex justify-end mb-6">
            <Button onClick={openCreate}>
              <Plus size={16} aria-hidden="true" /> Create Event
            </Button>
          </div>
        )}

        {/* Event Form — shared between create and edit, keyed off editingId */}
        {showForm && (
          <EventForm
            form={form}
            setForm={setForm}
            games={games}
            editingId={editingId}
            formError={formError}
            fieldErrors={formFieldErrors}
            formLoading={formLoading}
            onSubmit={handleSubmit}
            onCancel={cancelForm}
          />
        )}

        {/* ── ERROR STATE ── shown in place of the lists when loading them failed */}
        {loadError ? (
          <div className="flex justify-center py-16">
            <Card className="px-10 py-10 max-w-sm text-center">
              <p className="font-cinzel font-bold text-ink text-sm mb-1">Could not load your events</p>
              <p className="text-xs text-ink-soft/70 mb-4">Check your connection and try again.</p>
              <Button size="sm" onClick={fetchAll}>Retry</Button>
            </Card>
          </div>
        ) : (
        <>
        {/* Event lists — left: events you organize (editable, organizers only), right: events you joined (read-only) */}
        <div className={user?.role === 'organizer'
          ? 'grid grid-cols-1 lg:grid-cols-2 gap-8'
          : 'max-w-xl mx-auto'
        }>
          {user?.role === 'organizer' && (
          <div>
            <h2 className="font-cinzel text-xs font-bold text-white/80 uppercase tracking-widest mb-4">
              Created Events <span className="text-white/40">({organizedEvents.length})</span>
            </h2>
            {loading ? (
              <div className="space-y-3" aria-label="Loading events">
                {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-24 rounded-xl bg-white/50" />)}
              </div>
            ) : organizedEvents.length === 0 ? (
              <p className="text-sm text-white/70">You haven't created any events yet.</p>
            ) : (
              <div className="space-y-3">
                {organizedEvents.map(event => (
                  <div key={event.id} className="bg-white/85 backdrop-blur-sm border border-white/60 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Link to={`/events/${event.id}`}
                          className="font-semibold text-ink hover:text-primary text-sm transition-colors">
                          {event.title}
                        </Link>
                        <p className="text-xs text-ink-soft/70 mt-0.5">
                          {event.game?.name} · {formatDate(event.date_time)}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[event.status]}`}>
                        {capitalize(event.status)}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="primary-outline" size="sm" onClick={() => openEdit(event)}>
                        Edit
                      </Button>
                      <Button variant="danger-outline" size="sm" onClick={() => { setDeleteId(event.id); setDeleteError('') }}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          <div>
            <h2 className="font-cinzel text-xs font-bold text-white/80 uppercase tracking-widest mb-4">
              Joined Events <span className="text-white/40">({joinedEvents.length})</span>
            </h2>
            {loading ? (
              <div className="space-y-3" aria-label="Loading events">
                {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-24 rounded-xl bg-white/50" />)}
              </div>
            ) : joinedEvents.length === 0 ? (
              <p className="text-sm text-white/70">You haven't joined any events yet.</p>
            ) : (
              <div className="space-y-3">
                {joinedEvents.map(event => (
                  <Link key={event.id} to={`/events/${event.id}`}
                    className="block bg-white/85 backdrop-blur-sm border border-white/60 rounded-xl p-4 shadow-sm hover:border-sky-bright transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink text-sm">{event.title}</p>
                        <p className="text-xs text-ink-soft/70 mt-0.5">
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
        </>
        )}
      </div>
    </PageShell>
  )
}
