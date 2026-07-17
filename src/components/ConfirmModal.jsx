import Button from './ui/Button'

export default function ConfirmModal({ title, message, error, confirmLabel, danger = false, loading, onConfirm, onCancel, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white/90 backdrop-blur-md border border-white/60 rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-ink mb-2">{title}</h2>
        <p className="text-sm text-ink-soft mb-4">{message}</p>
        <form onSubmit={e => { e.preventDefault(); onConfirm() }}>
          {children}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">
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
