import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import SkyBanner from '../components/SkyBanner'
import PageScreen from '../components/PageScreen'

// One entry per leaderboard tab; drives both the fetch and the render below
const TABLES = [
  { key: 'players',    title: 'Top Players',        nameKey: 'name', countKey: 'joined_events_count',    countLabel: 'events joined',    linkPrefix: '/players' },
  { key: 'games',      title: 'Most Active Games',  nameKey: 'name', countKey: 'events_count',           countLabel: 'events'                                   },
  { key: 'organizers', title: 'Top Organizers',     nameKey: 'name', countKey: 'organized_events_count', countLabel: 'events organized', linkPrefix: '/players' },
]

export default function StatsPage() {
  // ── STATE ──
  const [data, setData] = useState({ players: [], games: [], organizers: [] })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [active, setActive] = useState(0) // index into TABLES for the currently shown tab

  // ── DATA FETCHING ── all three leaderboards loaded together up front
  useEffect(() => {
    Promise.all([
      api.get('/stats/players'),
      api.get('/stats/games'),
      api.get('/stats/organizers'),
    ]).then(([p, g, o]) => {
      setData({
        players:    p.data.data ?? p.data,
        games:      g.data.data ?? g.data,
        organizers: o.data.data ?? o.data,
      })
    }).catch(() => setLoadError(true)).finally(() => setLoading(false))
  }, [])

  // ── HANDLERS ── wrap around the 3 tabs in either direction
  function prev() { setActive(a => (a - 1 + 3) % 3) }
  function next() { setActive(a => (a + 1) % 3) }

  if (loading)   return <PageScreen message="Loading stats..." />
  if (loadError) return <PageScreen message="Could not load stats. Please try again." />

  const { key, title, nameKey, countKey, countLabel, linkPrefix } = TABLES[active]
  const rows = data[key]

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-500 via-sky-300 to-sky-100">

      <SkyBanner title="Leaderboard" subtitle="Top players, organizers, and most active games" />

      <div className="max-w-2xl mx-auto px-6 py-10" style={{ animation: 'fadeInUp 0.35s ease-out both' }}>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prev}
            className="px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-white/60 text-sm font-medium text-[#0F172A] transition-colors cursor-pointer shadow-sm"
          >
            ← Prev
          </button>

          <div className="flex items-center gap-2">
            {TABLES.map((t, i) => (
              <button
                key={t.key}
                onClick={() => setActive(i)}
                className="cursor-pointer transition-all"
                style={{
                  width: i === active ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === active ? '#2563EB' : 'rgba(255,255,255,0.6)',
                  border: 'none',
                  padding: 0,
                }}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-white/60 text-sm font-medium text-[#0F172A] transition-colors cursor-pointer shadow-sm"
          >
            Next →
          </button>
        </div>

        {/* Active table */}
        <div className="bg-white/85 backdrop-blur-sm border border-white/60 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#DCEEFF] flex items-center justify-between">
            <h2 className="font-cinzel font-bold text-[#0F172A] text-sm uppercase tracking-wide">{title}</h2>
            <span className="text-xs text-[#334155]/50 font-cinzel">{active + 1} / 3</span>
          </div>
          <div className="divide-y divide-[#DCEEFF]/60">
            {rows.map((row, idx) => (
              <div key={row.id ?? idx} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold w-6 text-center ${
                    idx === 0 ? 'text-yellow-500' :
                    idx === 1 ? 'text-slate-400' :
                    idx === 2 ? 'text-amber-600' : 'text-slate-300'
                  }`}>
                    {idx + 1}
                  </span>
                  {linkPrefix ? (
                    <Link to={`${linkPrefix}/${row.id}`} className="text-sm font-medium text-[#2563EB] hover:underline">
                      {row[nameKey]}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-[#0F172A]">{row[nameKey]}</span>
                  )}
                </div>
                <span className="text-sm text-[#334155]">
                  {row[countKey]} <span className="text-xs text-[#334155]/60">{countLabel}</span>
                </span>
              </div>
            ))}
            {rows.length === 0 && (
              <p className="text-sm text-[#334155] px-5 py-4">No data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
