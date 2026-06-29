import { useState, useEffect, useContext } from 'react'
import api from '../api/axios'
import { AuthContext } from '../context/AuthContext'

export default function ProfilePage() {
  const { setUser } = useContext(AuthContext)

  const [profile, setProfile] = useState(null)
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', bio: '', country: '', favorite_game_id: '',
  })

  useEffect(() => {
    Promise.all([
      api.get('/me'),
      api.get('/games'),
    ]).then(([meRes, gamesRes]) => {
      const data = meRes.data.data ?? meRes.data
      setProfile(data)
      setForm({
        name: data.name ?? '',
        bio: data.bio ?? '',
        country: data.country ?? '',
        favorite_game_id: data.favorite_game?.id ?? '',
      })
      setGames(gamesRes.data.data ?? gamesRes.data)
    }).catch(() => setLoadError(true)).finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)
    try {
      const res = await api.put('/me', form)
      const updated = res.data.data ?? res.data
      setProfile(updated)
      setUser(prev => prev ? { ...prev, name: updated.name } : prev)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-center text-gray-400 py-20">Loading...</p>
  if (loadError) return <p className="text-center text-red-400 py-20">Could not load profile. Please try again.</p>

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile Settings</h1>
      <p className="text-sm text-gray-500 mb-8">Manage your account information</p>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-6">
          Profile Information
        </p>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded px-4 py-3 mb-5">
            Profile updated successfully.
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3 mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</label>
              <input
                type="email"
                value={profile?.email ?? ''}
                disabled
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Country</label>
              <input
                type="text"
                value={form.country}
                onChange={e => setForm({ ...form, country: e.target.value })}
                placeholder="e.g. Spain"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Favourite Game</label>
              <select
                value={form.favorite_game_id}
                onChange={e => setForm({ ...form, favorite_game_id: e.target.value })}
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
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              rows={4}
              placeholder="Tell other players about yourself..."
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded text-sm font-medium transition-colors cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
