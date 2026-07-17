import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe, updateProfile, changePassword, deleteAccount } from '../api/me'
import { getGames } from '../api/games'
import { AuthContext } from '../context/AuthContext'
import SkyBanner from '../components/SkyBanner'
import PageScreen from '../components/PageScreen'
import ConfirmModal from '../components/ConfirmModal'
import Button from '../components/ui/Button'
import { inputCls, labelCls } from '../utils/formStyles'

const EMPTY_PW_FORM = { current_password: '', password: '', password_confirmation: '' }

export default function ProfilePage() {
  const { user, updateUser, clearSession } = useContext(AuthContext)
  const navigate = useNavigate()

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

  // change password form — own state so its errors never mix with the profile form
  const [pwForm, setPwForm] = useState(EMPTY_PW_FORM)
  const [pwFieldErrors, setPwFieldErrors] = useState({}) // 422 errors keyed by field
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)

  // delete account modal
  const [showDelete, setShowDelete] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  const isOrganizer = user?.role === 'organizer'

  // ── DATA FETCHING ── loads the current user's profile + game list to populate the form
  useEffect(() => {
    Promise.all([
      getMe(),
      getGames(),
    ]).then(([me, gameList]) => {
      setProfile(me)
      setForm({
        name: me.name ?? '',
        bio: me.bio ?? '',
        country: me.country ?? '',
        favorite_game_id: me.favorite_game?.id ?? '',
      })
      setGames(gameList)
    }).catch(() => setLoadError(true)).finally(() => setLoading(false))
  }, [])

  // ── HANDLERS ──
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)
    try {
      const updated = await updateProfile(form)
      setProfile(updated)
      updateUser({ name: updated.name })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPwError('')
    setPwFieldErrors({})
    setPwSuccess(false)
    setPwSaving(true)
    try {
      await changePassword(pwForm)
      setPwSuccess(true)
      setPwForm(EMPTY_PW_FORM)
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errors) {
        setPwFieldErrors(err.response.data.errors)
      } else {
        setPwError(err.response?.data?.message ?? 'Could not update password.')
      }
    } finally {
      setPwSaving(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleteError('')
    setDeleteLoading(true)
    try {
      await deleteAccount(deletePassword)
      // token is invalid server-side now — clear locally, no /logout call
      clearSession()
      navigate('/')
    } catch (err) {
      setDeleteError(
        err.response?.data?.errors?.password?.[0]
        ?? err.response?.data?.message
        ?? 'Could not delete account.'
      )
      setDeleteLoading(false)
    }
  }

  function closeDeleteModal() {
    setShowDelete(false)
    setDeletePassword('')
    setDeleteError('')
  }

  if (loading)   return <PageScreen message="Loading profile..." />
  if (loadError) return <PageScreen message="Could not load profile. Please try again." error />

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-500 via-sky-300 to-sky-100">

      <SkyBanner eyebrow={profile?.name} title="Profile Settings" subtitle="Manage your account information" />

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6" style={{ animation: 'fadeInUp 0.35s ease-out both' }}>
        <div className="bg-white/85 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-sm">
          <p className="font-cinzel text-xs font-bold text-ink-soft uppercase tracking-widest mb-6">
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
                  className="w-full bg-white/50 border border-white/40 rounded-lg px-3 py-2 text-sm text-ink-soft/60 cursor-not-allowed" />
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

            <Button type="submit" disabled={saving} className="px-6">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </div>

        {/* ── CHANGE PASSWORD ── */}
        <div className="bg-white/85 backdrop-blur-sm border border-white/60 rounded-2xl p-6 shadow-sm">
          <p className="font-cinzel text-xs font-bold text-ink-soft uppercase tracking-widest mb-6">
            Change Password
          </p>

          {pwSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-5">
              Password updated successfully.
            </div>
          )}
          {pwError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              {pwError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Current Password</label>
              <input type="password" value={pwForm.current_password}
                onChange={e => setPwForm({ ...pwForm, current_password: e.target.value })}
                required autoComplete="current-password" className={inputCls} />
              {pwFieldErrors.current_password && (
                <p className="text-xs text-red-600 mt-1">{pwFieldErrors.current_password[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>New Password</label>
                <input type="password" value={pwForm.password}
                  onChange={e => setPwForm({ ...pwForm, password: e.target.value })}
                  required autoComplete="new-password" className={inputCls} />
                {pwFieldErrors.password && (
                  <p className="text-xs text-red-600 mt-1">{pwFieldErrors.password[0]}</p>
                )}
              </div>
              <div>
                <label className={labelCls}>Confirm New Password</label>
                <input type="password" value={pwForm.password_confirmation}
                  onChange={e => setPwForm({ ...pwForm, password_confirmation: e.target.value })}
                  required autoComplete="new-password" className={inputCls} />
              </div>
            </div>

            <Button type="submit" disabled={pwSaving} className="px-6">
              {pwSaving ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </div>

        {/* ── DANGER ZONE ── */}
        <div className="bg-white/85 backdrop-blur-sm border border-red-200 rounded-2xl p-6 shadow-sm">
          <p className="font-cinzel text-xs font-bold text-red-600 uppercase tracking-widest mb-3">
            Danger Zone
          </p>
          <p className="text-sm text-ink-soft mb-1">
            Permanently delete your account. This cannot be undone.
          </p>
          <p className="text-xs text-ink-soft/70 mb-4">
            {isOrganizer
              ? 'All tournaments you organized will be deleted, including every player registration in them. Your registrations in other events will also be removed.'
              : 'Your registrations in events will be removed. The events themselves are not affected.'}
          </p>
          <Button variant="danger-outline" onClick={() => setShowDelete(true)}>
            Delete Account
          </Button>
        </div>
      </div>

      {/* ── DELETE ACCOUNT MODAL ── */}
      {showDelete && (
        <ConfirmModal
          title="Delete Account?"
          message={isOrganizer
            ? 'This permanently deletes your account and all tournaments you organized. Enter your password to confirm.'
            : 'This permanently deletes your account. Enter your password to confirm.'}
          error={deleteError}
          confirmLabel="Delete"
          danger
          loading={deleteLoading}
          onConfirm={handleDeleteAccount}
          onCancel={closeDeleteModal}
        >
          <div className="mb-4">
            <label className={labelCls}>Your Password</label>
            <input
              type="password"
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              required
              autoFocus
              autoComplete="current-password"
              className="w-full bg-white border border-mist rounded-lg px-3 py-2 text-sm text-ink placeholder-slate-400 focus:outline-none focus:border-primary"
            />
          </div>
        </ConfirmModal>
      )}
    </div>
  )
}
