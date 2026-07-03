import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { getGameImage } from '../utils/gameImages'
import { STATUS_COLORS, capitalize, formatDate } from '../utils/statusColors'
import SkyBanner from '../components/SkyBanner'
import { compactInputCls } from '../utils/formStyles'

export default function EventsPage() {
  // ── STATE ──
  const [events, setEvents] = useState([])
  const [games, setGames] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeGame, setActiveGame] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('newest') // client-side only, doesn't hit the API

  // form = live input values, appliedFilters = what was last submitted/debounced.
  // Kept separate so typing doesn't refetch on every keystroke (except search, which debounces).
  const [form, setForm] = useState({ search: '', date: '', price: '', status: '' })
  const [appliedFilters, setAppliedFilters] = useState({})

  // ── DATA FETCHING ──
  useEffect(() => {
    api.get('/games').then(res => setGames(res.data.data ?? res.data))
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [appliedFilters, activeGame, page])

  // Debounce search — fires 400ms after the user stops typing
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      setAppliedFilters(prev => {
        const next = { ...prev }
        if (form.search) next.search = form.search
        else delete next.search
        return next
      })
    }, 400)
    return () => clearTimeout(t)
  }, [form.search])

  // ── HANDLERS ──
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

  // ── DERIVED ── sort happens client-side on the current page of results
  const sortedEvents = [...events].sort((a, b) => {
    if (sort === 'newest')   return new Date(b.date_time) - new Date(a.date_time)
    if (sort === 'oldest')   return new Date(a.date_time) - new Date(b.date_time)
    if (sort === 'cheapest') return a.entry_fee - b.entry_fee
    if (sort === 'popular')  return b.participants_count - a.participants_count
    return 0
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-500 via-sky-300 to-sky-100">

      <SkyBanner title="All Events" subtitle="Browse and join TCG tournaments near you!" />

      <div className="max-w-7xl mx-auto px-6 py-8" style={{ animation: 'fadeInUp 0.35s ease-out both' }}>

        {/* ── FILTER BAR ── search/date/price/status inputs + sort dropdown + game pills */}
        <div className="mb-6 bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl px-4 py-2.5 shadow-sm">
          <form onSubmit={handleApplyFilters} className="flex gap-2 items-center overflow-x-auto">
            <input
              type="text"
              placeholder="Search events..."
              value={form.search}
              onChange={e => setForm({ ...form, search: e.target.value })}
              className={`${compactInputCls} w-1/2 min-w-[140px]`}
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
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className={compactInputCls}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="cheapest">Cheapest</option>
              <option value="popular">Most Popular</option>
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
          <div className="flex gap-2 mt-2.5 overflow-x-auto pb-0.5">
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

        {/* ── EVENTS GRID ── */}
        {loading ? (
          <p className="text-center text-white/80 py-16">Loading events...</p>
        ) : events.length === 0 ? (
          /* ── EMPTY STATE ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl px-10 py-10 shadow-sm max-w-sm">
              <p className="font-cinzel font-bold text-[#0F172A] text-sm mb-1">No events found</p>
              <p className="text-xs text-[#334155]/70">
                {hasActiveFilters ? 'Try adjusting or clearing your filters.' : 'No tournaments have been created yet.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-xs text-[#2563EB] hover:underline cursor-pointer"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map((event, i) => {
              const img = getGameImage(event.game?.id)
              return (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="bg-white/85 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                style={{ animation: 'fadeInUp 0.4s ease-out both', animationDelay: `${i * 0.07}s` }}
              >
                <div className="relative h-20 bg-gray-800 overflow-hidden">
                  {img && <img src={img} alt={event.game?.name} className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end px-3 py-2">
                    <p className="text-xs font-bold text-white uppercase tracking-widest drop-shadow">{event.game?.name}</p>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[event.status]}`}>
                      {capitalize(event.status)}
                    </span>
                    {event.participants_count >= event.max_players && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                        Full
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-[#0F172A] text-sm mt-2 mb-1.5 leading-snug">{event.title}</h3>
                  <div className="space-y-0.5 text-xs text-[#334155]">
                    <p>📍 {event.location}</p>
                    <p>📅 {formatDate(event.date_time)}</p>
                    <p>💰 {event.entry_fee > 0 ? `€${event.entry_fee}` : 'Free entry'}</p>
                    <p>👥 {event.participants_count} / {event.max_players} players</p>
                  </div>
                </div>
              </Link>
            )})}
          </div>
        )}

        {/* ── PAGINATION ── */}
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
