import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { getGameImage } from '../utils/gameImages'
import { STATUS_COLORS, capitalize, formatDate } from '../utils/statusColors'
import SkyBanner from '../components/SkyBanner'
import { compactInputCls } from '../utils/formStyles'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [games, setGames] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeGame, setActiveGame] = useState('')
  const [page, setPage] = useState(1)

  const [form, setForm] = useState({ search: '', date: '', price: '', status: '' })
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
      setEvents(res.data.data ?? res.data)
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
    if (form.date)   active.date   = form.date
    if (form.price)  active.price  = form.price
    if (form.status) active.status = form.status
    setAppliedFilters(active)
  }

  function handleClearFilters() {
    setForm({ search: '', date: '', price: '', status: '' })
    setAppliedFilters({})
    setActiveGame('')
    setPage(1)
  }

  function handleGamePill(gameId) {
    setActiveGame(gameId === '' ? '' : Number(gameId))
    setPage(1)
  }

  const hasActiveFilters = Object.keys(appliedFilters).length > 0 || activeGame !== ''

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-500 via-sky-300 to-sky-100">

      <SkyBanner title="All Events" subtitle="Browse and join TCG tournaments near you!" />

      <div className="max-w-7xl mx-auto px-6 py-8" style={{ animation: 'fadeInUp 0.35s ease-out both' }}>

        {/* Compact inline filter bar */}
        <div className="mb-6">
          <form onSubmit={handleApplyFilters} className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              placeholder="Search events..."
              value={form.search}
              onChange={e => setForm({ ...form, search: e.target.value })}
              className={`${compactInputCls} flex-1 min-w-[140px]`}
            />
            <input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className={compactInputCls}
            />
            <select
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              className={compactInputCls}
            >
              <option value="">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
            <select
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              className={compactInputCls}
            >
              <option value="">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="finished">Finished</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              type="submit"
              className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-bold px-4 py-1.5 rounded-full transition-colors cursor-pointer shadow-sm"
            >
              Apply
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm text-[#334155]/70 hover:text-[#334155] underline cursor-pointer transition-colors"
              >
                Clear
              </button>
            )}
          </form>

          {/* Game pills */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-0.5">
            <button
              onClick={() => handleGamePill('')}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                activeGame === ''
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white/60 text-[#0F172A] border-[#DCEEFF] hover:border-[#60A5FA]'
              }`}
            >
              All
            </button>
            {games.map(game => (
              <button
                key={game.id}
                onClick={() => handleGamePill(game.id)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                  activeGame === Number(game.id)
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-white/60 text-[#0F172A] border-[#DCEEFF] hover:border-[#60A5FA]'
                }`}
              >
                {game.name}
              </button>
            ))}
          </div>
        </div>

        {/* Events grid */}
        {loading ? (
          <p className="text-center text-white/80 py-16">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-center text-white/80 py-16">No events found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, i) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="bg-white/85 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                style={{ animation: 'fadeInUp 0.4s ease-out both', animationDelay: `${i * 0.07}s` }}
              >
                <div className="relative h-20 bg-gray-800 overflow-hidden">
                  {getGameImage(event.game?.id) && (
                    <img src={getGameImage(event.game?.id)} alt={event.game?.name} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end px-3 py-2">
                    <p className="text-xs font-bold text-white uppercase tracking-widest drop-shadow">{event.game?.name}</p>
                  </div>
                </div>
                <div className="p-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[event.status]}`}>
                    {capitalize(event.status)}
                  </span>
                  <h3 className="font-bold text-[#0F172A] text-sm mt-2 mb-1.5 leading-snug">{event.title}</h3>
                  <div className="space-y-0.5 text-xs text-[#334155]">
                    <p>📍 {event.location}</p>
                    <p>📅 {formatDate(event.date_time)}</p>
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
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors cursor-pointer ${
                  p === meta.current_page
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-white/70 text-[#0F172A] border-white/60 hover:border-[#60A5FA]'
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
