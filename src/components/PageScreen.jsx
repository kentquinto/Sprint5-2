import Card from './ui/Card'
import PageShell from './PageShell'

// Full-screen status view. Shows a spinner while loading; pass `error` to
// show a plain message instead (no spinner) for failure/empty states.
export default function PageScreen({ message, error = false }) {
  return (
    <PageShell className="flex items-center justify-center px-4">
      <Card className="px-8 py-6 flex items-center gap-3">
        {!error && (
          <span className="w-5 h-5 border-2 border-mist border-t-primary rounded-full animate-spin shrink-0" aria-hidden="true" />
        )}
        <p className="text-sm font-semibold text-ink-soft">{message}</p>
      </Card>
    </PageShell>
  )
}
