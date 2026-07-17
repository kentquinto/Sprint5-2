import { useState, useContext } from 'react'
import { updateProfile } from '../../api/me'
import { getFormErrors } from '../../api/errors'
import { AuthContext } from '../../context/AuthContext'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Field from '../ui/Field'
import { labelCls } from '../../utils/formStyles'

// Edit name / country / bio / favourite game. Owns its own form state and
// submit; notifies the page via onUpdated so the banner stays in sync.
export default function ProfileInfoForm({ profile, games, onUpdated }) {
  const { updateUser } = useContext(AuthContext)

  const [form, setForm] = useState({
    name: profile.name ?? '',
    bio: profile.bio ?? '',
    country: profile.country ?? '',
    favorite_game_id: profile.favorite_game?.id ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setSuccess(false)
    setSaving(true)
    try {
      const updated = await updateProfile(form)
      updateUser({ name: updated.name })
      onUpdated?.(updated)
      setSuccess(true)
    } catch (err) {
      const { fieldErrors: fields, message } = getFormErrors(err, 'Could not save changes.')
      setFieldErrors(fields)
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
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
            <input type="email" value={profile.email ?? ''} disabled
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
  )
}
