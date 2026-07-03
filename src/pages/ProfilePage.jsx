import { useState, useEffect, useContext } from 'react'
import api from '../api/axios'
import { AuthContext } from '../context/AuthContext'
import SkyBanner from '../components/SkyBanner'
import PageScreen from '../components/PageScreen'
import { inputCls, labelCls } from '../utils/formStyles'

export default function ProfilePage() {
  const { updateUser } = useContext(AuthContext)

  // ── STATE ──
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

  // ── DATA FETCHING ── loads the current user's profile + game list to populate the form
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

  // ── HANDLERS ──
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)
    try {
      const res = await api.put('/me', form)
      const updated = res.data.data ?? res.data
      setProfile(updated)
      updateUser({ name: updated.name })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  if (loading)   return <PageScreen message="Loading..." />
  if (loadError) return <PageScreen message="Could not load profile. Please try again." />

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-500 via-sky-300 to-sky-100">

      <SkyBanner eyebrow={profile?.name} title="Profile Settings" subtitle="Manage your account information" />

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 py-10" style={{ animation: 'fadeInUp 0.35s ease-out both' }}>
        <div className="bg-white/85 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-sm">
          <p className="font-cinzel text-xs font-bold text-[#334155] uppercase tracking-widest mb-6">
            Profile Information
          </p>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-5">
              Profile updated successfully.
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Name</label>
                <input type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" value={profile?.email ?? ''} disabled
                  className="w-full bg-white/50 border border-white/40 rounded-lg px-3 py-2 text-sm text-[#334155]/60 cursor-not-allowed" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Country</label>
                <input type="text" value={form.country}
                  onChange={e => setForm({ ...form, country: e.target.value })}
                  placeholder="e.g. Spain" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Favourite Game</label>
                <select value={form.favorite_game_id}
                  onChange={e => setForm({ ...form, favorite_game_id: e.target.value })}
                  className={inputCls}>
                  <option value="">Select a game</option>
                  {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Bio</label>
              <textarea value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                rows={4} placeholder="Tell other players about yourself..."
                className={inputCls} />
            </div>

            <button type="submit" disabled={saving}
              className="bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-50 text-white px-6 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer shadow-sm">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
