import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Calendar, Coins, Users } from 'lucide-react'
import { getEvents } from '../api/events'
import { getGames } from '../api/games'
import { getGameImage } from '../utils/gameImages'
import { STATUS_COLORS, capitalize, formatDate } from '../utils/statusColors'
import SkyBanner from '../components/SkyBanner'
import { EventCardSkeleton } from '../components/ui/Skeleton'
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

  // Every filter applies instantly on change; search is debounced so typing
  // doesn't refetch on every keystroke.
  const [filters, setFilters] = useState({ search: '', date: '', price: '', status: '' })
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // ── DATA FETCHING ──
  useEffect(() => {
    getGames().then(setGames)
  }, [])

  // Debounce search — fires 400ms after the user stops typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 400)
    return () => clearTimeout(t)
  }, [filters.search])

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (debouncedSearch) params.search = debouncedSearch
      if (filters.date)    params.date   = filters.date
      if (filters.price)   params.price  = filters.price
      if (filters.status)  params.status = filters.status
      if (activeGame)      params.game   = activeGame
      if (page > 1)        params.page   = page
      const { events: list, meta: pageMeta } = await getEvents(params)
      setEvents(list)
      setMeta(pageMeta)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, filters.date, filters.price, filters.status, activeGame, page])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  // ── HANDLERS ──
  function updateFilter(key, value) {
    setFilters(f => ({ ...f, [key]: value }))
    setPage(1)
  }

  function handleClearFilters() {
    setFilters({ search: '', date: '', price: '', status: '' })
    setActiveGame('')
    setPage(1)
  }

  function handleGamePill(gameId) {
    setActiveGame(gameId === '' ? '' : Number(gameId))
    setPage(1)
  }

  const hasActiveFilters = Object.values(filters).some(Boolean) || activeGame !== ''

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

        {/* ── FILTER BAR ── every control applies instantly; no submit step */}
        <div className="mb-6 bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl px-4 py-2.5 shadow-sm">
          <div className="flex gap-2 items-center overflow-x-auto">
            <input
              type="text"
              placeholder="Search events..."
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
              className={`${compactInputCls} w-1/2 min-w-[140px]`}
            />
            <input
              type="date"
              value={filters.date}
              onChange={e => updateFilter('date', e.target.value)}
              className={compactInputCls}
            />
            <select
              value={filters.price}
              onChange={e => updateFilter('price', e.target.value)}
              className={compactInputCls}
            >
              <option value="">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
            <select
              value={filters.status}
              onChange={e => updateFilter('status', e.target.value)}
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
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm text-ink-soft/70 hover:text-ink-soft underline cursor-pointer transition-colors shrink-0"
              >
                Clear
              </button>
            )}
          </div>

          {/* Game pills */}
          <div className="flex gap-2 mt-2.5 overflow-x-auto pb-0.5">
            <button
              onClick={() => handleGamePill('')}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                activeGame === ''
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white/60 text-ink border-mist hover:border-sky-bright'
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
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white/60 text-ink border-mist hover:border-sky-bright'
                }`}
              >
                {game.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── EVENTS GRID ── */}
        {loading ? (
          /* Skeleton cards keep the layout stable while events load */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Loading events">
            {Array.from({ length: 6 }, (_, i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : events.length === 0 ? (
          /* ── EMPTY STATE ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl px-10 py-10 shadow-sm max-w-sm">
              <p className="font-cinzel font-bold text-ink text-sm mb-1">No events found</p>
              <p className="text-xs text-ink-soft/70">
                {hasActiveFilters ? 'Try adjusting or clearing your filters.' : 'No tournaments have been created yet.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-xs text-primary hover:underline cursor-pointer"
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
                  <h3 className="font-bold text-ink text-sm mt-2 mb-1.5 leading-snug">{event.title}</h3>
                  <div className="space-y-1 text-xs text-ink-soft">
                    <p className="flex items-center gap-1.5"><MapPin size={13} className="shrink-0 text-ink-soft/60" aria-hidden="true" />{event.location}</p>
                    <p className="flex items-center gap-1.5"><Calendar size={13} className="shrink-0 text-ink-soft/60" aria-hidden="true" />{formatDate(event.date_time)}</p>
                    <p className="flex items-center gap-1.5"><Coins size={13} className="shrink-0 text-ink-soft/60" aria-hidden="true" />{event.entry_fee > 0 ? `€${event.entry_fee}` : 'Free entry'}</p>
                    <p className="flex items-center gap-1.5"><Users size={13} className="shrink-0 text-ink-soft/60" aria-hidden="true" />{event.participants_count} / {event.max_players} players</p>
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
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white/70 text-ink border-white/60 hover:border-sky-bright'
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
