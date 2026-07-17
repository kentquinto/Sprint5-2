import { useState } from 'react'
import { changePassword } from '../../api/me'
import { getFormErrors } from '../../api/errors'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Field from '../ui/Field'

const EMPTY_FORM = { current_password: '', password: '', password_confirmation: '' }

// Fully self-contained: the token stays valid after a change, so nothing
// outside this card needs to know it happened.
export default function ChangePasswordForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setSuccess(false)
    setSaving(true)
    try {
      await changePassword(form)
      setSuccess(true)
      setForm(EMPTY_FORM)
    } catch (err) {
      const { fieldErrors: fields, message } = getFormErrors(err, 'Could not update password.')
      setFieldErrors(fields)
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="p-6">
      <p className="font-cinzel text-xs font-bold text-ink-soft uppercase tracking-widest mb-6">
        Change Password
      </p>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-5">
          Password updated successfully.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Current Password" name="current_password" type="password"
          value={form.current_password}
          onChange={e => setForm({ ...form, current_password: e.target.value })}
          required autoComplete="current-password" errors={fieldErrors} />

        <div className="grid grid-cols-2 gap-4">
          <Field label="New Password" name="password" type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required autoComplete="new-password" errors={fieldErrors} />
          <Field label="Confirm New Password" name="password_confirmation" type="password"
            value={form.password_confirmation}
            onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
            required autoComplete="new-password" errors={fieldErrors} />
        </div>

        <Button type="submit" disabled={saving} className="px-6">
          {saving ? 'Updating...' : 'Update Password'}
        </Button>
      </form>
    </Card>
  )
}
