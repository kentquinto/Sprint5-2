import { useNavigate } from 'react-router-dom'
import ConfirmModal from './ConfirmModal'

// "You need to log in" prompt used wherever a guest clicks an auth-only link.
export default function LoginPromptModal({ open, onClose, message = 'You need to log in to view player profiles.' }) {
  const navigate = useNavigate()

  if (!open) return null
  return (
    <ConfirmModal
      title="Login Required"
      message={message}
      confirmLabel="Log In"
      onConfirm={() => navigate('/login')}
      onCancel={onClose}
    />
  )
}
