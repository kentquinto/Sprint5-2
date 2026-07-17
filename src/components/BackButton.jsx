import { useNavigate, useLocation } from 'react-router-dom'

// Goes back in history when there is one; deep links opened directly
// (location.key === 'default') fall back to a sensible route instead.
export default function BackButton({ fallback = '/events', className = '' }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <button
      onClick={() => location.key !== 'default' ? navigate(-1) : navigate(fallback)}
      className={`text-sm text-white/80 hover:text-white inline-block transition-colors cursor-pointer ${className}`}
    >
      ← Back
    </button>
  )
}
