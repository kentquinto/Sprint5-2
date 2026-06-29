import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { getGameImage } from '../utils/gameImages'

const STATUS_COLORS = {
  upcoming: 'bg-yellow-100 text-yellow-800',
  ongoing: 'bg-green-100 text-green-800',
  finished: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
}

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [games, setGames] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeGame, setActiveGame] = useState('')
  const [page, setPage] = useState(1)

  const [form, setForm] = useState({
    search: '',
    date: '',
    price: '',
    status: '',
  })
  const [appliedFilters, setAppliedFilters] = useState({})

  useEffect(() => {
    api.get('/games').then(res => setGames(res.data.data ?? res.data))
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [appliedFilters, activeGame, page])

  async function fetchEvents() {
    setLoading(true)
    try {
      const params = { ...appliedFilters }
      if (activeGame) params.game = activeGame
      if (page > 1) params.page = page
      const res = await api.get('/events', { params })
      setEvents(res.data.data)
      setMeta(res.data.meta)
    } finally {
      setLoading(false)
    }
  }

  function handleApplyFilters(e) {
    e.preventDefault()
    setPage(1)
    const active = {}
    if (form.search) active.search = form.search
    if (form.date) active.date = form.date
    if (form.price) active.price = form.price
    if (form.status) active.status = form.status
    setAppliedFilters(active)
  }

  function handleGamePill(gameId) {
    setActiveGame(gameId)
    setPage(1)
  }

  return (
    <div>
      <div className="relative overflow-hidden text-white py-16 px-6">
        <img
          src="/images/ui/bannerwallpaper.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative">
          <h1 className="text-4xl font-bold">All Events</h1>
          <p className="text-gray-200 mt-2">Browse and join TCG events!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={handleApplyFilters} className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Event title..."
            value={form.search}
            onChange={e => setForm({ ...form, search: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <input
            type="date"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <select
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">All Prices</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
          <select
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="finished">Finished</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-medium transition-colors cursor-pointer"
          >
            Filter
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => handleGamePill('')}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors cursor-pointer ${
              activeGame === ''
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            All Events
          </button>
          {games.map(game => (
            <button
              key={game.id}
              onClick={() => handleGamePill(game.id)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors cursor-pointer ${
                activeGame === game.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              {game.name}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-16">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No events found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="relative h-36 bg-gray-800 overflow-hidden">
                  {getGameImage(event.game?.id) && (
                    <img
                      src={getGameImage(event.game?.id)}
                      alt={event.game?.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-end px-4 py-3">
                    <p className="text-xs font-bold text-white uppercase tracking-widest">
                      {event.game?.name}
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[event.status]}`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                  <h3 className="font-bold text-gray-900 mt-3 mb-2">{event.title}</h3>
                  <div className="space-y-1 text-sm text-gray-500">
                    <p>📍 {event.location}</p>
                    <p>📅 {new Date(event.date_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p>💰 {event.entry_fee > 0 ? `€${event.entry_fee}` : 'Free entry'}</p>
                    <p>👥 {event.participants_count} / {event.max_players} players</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 rounded text-sm border transition-colors cursor-pointer ${
                  p === meta.current_page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
