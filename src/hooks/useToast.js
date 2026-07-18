import { useContext } from 'react'
import { ToastContext } from '../context/ToastContext'

// Returns showToast(message) — the app-wide toast trigger.
export default function useToast() {
  return useContext(ToastContext)
}
