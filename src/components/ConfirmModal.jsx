export default function ConfirmModal({ title, message, error, confirmLabel, danger = false, loading, onConfirm, onCancel, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white/90 backdrop-blur-md border border-white/60 rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-[#0F172A] mb-2">{title}</h2>
        <p className="text-sm text-[#334155] mb-4">{message}</p>
        <form onSubmit={e => { e.preventDefault(); onConfirm() }}>
          {children}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">
              {error}
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 rounded-full text-sm border border-[#DCEEFF] text-[#334155] hover:bg-[#DCEEFF]/50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-full text-sm text-white font-bold transition-colors cursor-pointer disabled:opacity-50 ${
                danger ? 'bg-red-500 hover:bg-red-600' : 'bg-[#2563EB] hover:bg-[#1d4ed8]'
              }`}
            >
              {loading ? `${confirmLabel}...` : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
