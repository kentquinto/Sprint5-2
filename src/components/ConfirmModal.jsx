import { useEffect, useRef, useId } from 'react'
import Button from './ui/Button'

export default function ConfirmModal({ title, message, error, confirmLabel, danger = false, loading, onConfirm, onCancel, children }) {
  const dialogRef = useRef(null)
  const titleId = useId()

  // Escape closes the dialog — except while the action is in flight,
  // so the user can't dismiss a request that's already running.
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && !loading) onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel, loading])

  // Move keyboard focus into the dialog on open (first input if there is
  // one, otherwise the first button) and give it back to whatever had it
  // when the dialog closes.
  useEffect(() => {
    const previouslyFocused = document.activeElement
    const first = dialogRef.current?.querySelector('input, select, textarea, button')
    first?.focus()
    return () => previouslyFocused?.focus?.()
  }, [])

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white/90 backdrop-blur-md border border-white/60 rounded-2xl shadow-xl w-full max-w-sm p-6"
      >
        <h2 id={titleId} className="text-lg font-bold text-ink mb-2">{title}</h2>
        <p className="text-sm text-ink-soft mb-4">{message}</p>
        <form onSubmit={e => { e.preventDefault(); onConfirm() }}>
          {children}
          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">
              {error}
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="px-4 font-normal">
              Cancel
            </Button>
            <Button type="submit" variant={danger ? 'danger' : 'primary'} disabled={loading} className="px-4">
              {loading ? `${confirmLabel}...` : confirmLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
