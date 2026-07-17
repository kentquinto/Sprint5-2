import Card from './ui/Card'

// Full-screen status view. Shows a spinner while loading; pass `error` to
// show a plain message instead (no spinner) for failure/empty states.
export default function PageScreen({ message, error = false }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-500 via-sky-300 to-sky-100 flex items-center justify-center px-4">
      <Card className="px-8 py-6 flex items-center gap-3">
        {!error && (
          <span className="w-5 h-5 border-2 border-mist border-t-primary rounded-full animate-spin shrink-0" aria-hidden="true" />
        )}
        <p className="text-sm font-semibold text-ink-soft">{message}</p>
      </Card>
    </div>
  )
}
