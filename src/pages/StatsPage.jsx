import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

function LeaderboardTable({ title, rows, rankKey, nameKey, countKey, countLabel, linkPrefix }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide">{title}</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {rows.map((row, i) => (
          <div key={row.id ?? i} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold w-6 text-center ${
                i === 0 ? 'text-yellow-500' :
                i === 1 ? 'text-gray-400' :
                i === 2 ? 'text-amber-600' : 'text-gray-300'
              }`}>
                {i + 1}
              </span>
              {linkPrefix ? (
                <Link to={`${linkPrefix}/${row.id}`} className="text-sm text-blue-600 hover:underline font-medium">
                  {row[nameKey]}
                </Link>
              ) : (
                <span className="text-sm text-gray-800 font-medium">{row[nameKey]}</span>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {row[countKey]} <span className="text-xs text-gray-400">{countLabel}</span>
            </span>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-gray-400 px-5 py-4">No data yet.</p>
        )}
      </div>
    </div>
  )
}

export default function StatsPage() {
  const [players, setPlayers] = useState([])
  const [games, setGames] = useState([])
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/stats/players'),
      api.get('/stats/games'),
      api.get('/stats/organizers'),
    ]).then(([playersRes, gamesRes, organizersRes]) => {
      setPlayers(playersRes.data.data ?? playersRes.data)
      setGames(gamesRes.data.data ?? gamesRes.data)
      setOrganizers(organizersRes.data.data ?? organizersRes.data)
    }).catch(() => setLoadError(true)).finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-center text-gray-400 py-20">Loading stats...</p>
  if (loadError) return <p className="text-center text-red-400 py-20">Could not load stats. Please try again.</p>

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Leaderboard</h1>
      <p className="text-sm text-gray-500 mb-8">Top players, organizers, and most active games</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LeaderboardTable
          title="Top Players"
          rows={players}
          nameKey="name"
          countKey="joined_events_count"
          countLabel="events joined"
          linkPrefix="/players"
        />
        <LeaderboardTable
          title="Most Active Games"
          rows={games}
          nameKey="name"
          countKey="events_count"
          countLabel="events"
        />
        <LeaderboardTable
          title="Top Organizers"
          rows={organizers}
          nameKey="name"
          countKey="organized_events_count"
          countLabel="events organized"
          linkPrefix="/players"
        />
      </div>
    </div>
  )
}
