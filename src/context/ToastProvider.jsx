import { useState, useCallback } from 'react'
import Toast from '../components/Toast'
import { ToastContext } from './ToastContext'

// App-wide toast: any page calls showToast('...') via useToast() instead of
// owning its own toast state and rendering its own <Toast>.
export function ToastProvider({ children }) {
  const [message, setMessage] = useState('')
  const showToast = useCallback(msg => setMessage(msg), [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Toast message={message} onDone={() => setMessage('')} />
    </ToastContext.Provider>
  )
}
