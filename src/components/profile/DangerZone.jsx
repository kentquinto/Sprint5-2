import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteAccount } from '../../api/me'
import { getFormErrors } from '../../api/errors'
import { AuthContext } from '../../context/AuthContext'
import ConfirmModal from '../ConfirmModal'
import Button from '../ui/Button'
import Card from '../ui/Card'
import { labelCls } from '../../utils/formStyles'

// Password-confirmed account deletion. Owns the modal and the session
// cleanup; the warning copy adapts to the user's role.
export default function DangerZone() {
  const { user, clearSession } = useContext(AuthContext)
  const navigate = useNavigate()

  const [showModal, setShowModal] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isOrganizer = user?.role === 'organizer'

  async function handleDelete() {
    setError('')
    setLoading(true)
    try {
      await deleteAccount(password)
      // token is invalid server-side now — clear locally, no /logout call
      clearSession()
      navigate('/')
    } catch (err) {
      const { fieldErrors: fields, message } = getFormErrors(err, 'Could not delete account.')
      setError(fields.password?.[0] ?? message)
      setLoading(false)
    }
  }

  function closeModal() {
    setShowModal(false)
    setPassword('')
    setError('')
  }

  return (
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
      <Button variant="danger-outline" onClick={() => setShowModal(true)}>
        Delete Account
      </Button>

      {showModal && (
        <ConfirmModal
          title="Delete Account?"
          message={isOrganizer
            ? 'This permanently deletes your account and all tournaments you organized. Enter your password to confirm.'
            : 'This permanently deletes your account. Enter your password to confirm.'}
          error={error}
          confirmLabel="Delete"
          danger
          loading={loading}
          onConfirm={handleDelete}
          onCancel={closeModal}
        >
          <div className="mb-4">
            <label className={labelCls}>Your Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-white border border-mist rounded-lg px-3 py-2 text-sm text-ink placeholder-slate-400 focus:outline-none focus:border-primary"
            />
          </div>
        </ConfirmModal>
      )}
    </Card>
  )
}
