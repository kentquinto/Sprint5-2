import PageShell from './PageShell'
import CloudLayer from './CloudLayer'

// Full-viewport sky with centered content — used by auth pages and 404.
export default function SkyPage({ children }) {
  return (
    <PageShell className="relative overflow-hidden flex items-center justify-center px-4 py-10">
      <CloudLayer sun={{ width: 72, top: 24, right: '7%' }} />
      {children}
    </PageShell>
  )
}
