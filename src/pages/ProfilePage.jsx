import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe, updateProfile, changePassword, deleteAccount } from '../api/me'
import { getFormErrors } from '../api/errors'
import { getGames } from '../api/games'
import { AuthContext } from '../context/AuthContext'
import PageShell from '../components/PageShell'
import SkyBanner from '../components/SkyBanner'
import PageScreen from '../components/PageScreen'
import ConfirmModal from '../components/ConfirmModal'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Field from '../components/ui/Field'
import usePageTitle from '../hooks/usePageTitle'
import { labelCls } from '../utils/formStyles'

const EMPTY_PW_FORM = { current_password: '', password: '', password_confirmation: '' }

export default function ProfilePage() {
  const { user, updateUser, clearSession } = useContext(AuthContext)
  const navigate = useNavigate()
  usePageTitle('Profile Settings')

  // ── STATE ──
  const [profile, setProfile] = useState(null)
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

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
    setFieldErrors({})
    setSuccess(false)
    setSaving(true)
    try {
      const updated = await updateProfile(form)
      setProfile(updated)
      updateUser({ name: updated.name })
      setSuccess(true)
    } catch (err) {
      const { fieldErrors: fields, message } = getFormErrors(err, 'Could not save changes.')
      setFieldErrors(fields)
      setError(message)
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
      const { fieldErrors: fields, message } = getFormErrors(err, 'Could not update password.')
      setPwFieldErrors(fields)
      setPwError(message)
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
      const { fieldErrors: fields, message } = getFormErrors(err, 'Could not delete account.')
      setDeleteError(fields.password?.[0] ?? message)
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
    <PageShell>

      <SkyBanner eyebrow={profile?.name} title="Profile Settings" subtitle="Manage your account information" />

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6" style={{ animation: 'fadeInUp 0.35s ease-out both' }}>

        {/* ── PROFILE INFORMATION ── */}
        <Card className="p-6">
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
              <Field label="Name" name="name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required errors={fieldErrors} />
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" value={profile?.email ?? ''} disabled
                  className="w-full bg-white/50 border border-white/40 rounded-lg px-3 py-2 text-sm text-ink-soft/60 cursor-not-allowed" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Country" name="country" value={form.country}
                onChange={e => setForm({ ...form, country: e.target.value })}
                placeholder="e.g. Spain" errors={fieldErrors} />
              <Field label="Favourite Game" name="favorite_game_id" as="select" value={form.favorite_game_id}
                onChange={e => setForm({ ...form, favorite_game_id: e.target.value })}
                errors={fieldErrors}>
                <option value="">Select a game</option>
                {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </Field>
            </div>

            <Field label="Bio" name="bio" as="textarea" value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              rows={4} placeholder="Tell other players about yourself..." errors={fieldErrors} />

            <Button type="submit" disabled={saving} className="px-6">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Card>

        {/* ── CHANGE PASSWORD ── */}
        <Card className="p-6">
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
            <Field label="Current Password" name="current_password" type="password"
              value={pwForm.current_password}
              onChange={e => setPwForm({ ...pwForm, current_password: e.target.value })}
              required autoComplete="current-password" errors={pwFieldErrors} />

            <div className="grid grid-cols-2 gap-4">
              <Field label="New Password" name="password" type="password"
                value={pwForm.password}
                onChange={e => setPwForm({ ...pwForm, password: e.target.value })}
                required autoComplete="new-password" errors={pwFieldErrors} />
              <Field label="Confirm New Password" name="password_confirmation" type="password"
                value={pwForm.password_confirmation}
                onChange={e => setPwForm({ ...pwForm, password_confirmation: e.target.value })}
                required autoComplete="new-password" errors={pwFieldErrors} />
            </div>

            <Button type="submit" disabled={pwSaving} className="px-6">
              {pwSaving ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </Card>

        {/* ── DANGER ZONE ── */}
        <Card variant="danger" className="p-6">
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
        </Card>
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
              autoComplete="current-password"
              className="w-full bg-white border border-mist rounded-lg px-3 py-2 text-sm text-ink placeholder-slate-400 focus:outline-none focus:border-primary"
            />
          </div>
        </ConfirmModal>
      )}
    </PageShell>
  )
}
