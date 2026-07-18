import { Component } from 'react'
import PageShell from './PageShell'
import Card from './ui/Card'
import Button from './ui/Button'

// Catches unexpected render errors anywhere below it and shows a recoverable
// screen instead of a blank page. Class component because React error
// boundaries have no hook equivalent.
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // Surface the crash in the console for debugging — the UI stays friendly
    console.error('Unexpected render error:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <PageShell className="flex items-center justify-center px-4">
        <Card className="px-10 py-10 max-w-sm text-center">
          <p className="font-cinzel font-bold text-ink text-sm mb-1">Something went wrong</p>
          <p className="text-xs text-ink-soft/70 mb-4">
            An unexpected error occurred. Reloading the page usually fixes it.
          </p>
          <Button size="sm" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </Card>
      </PageShell>
    )
  }
}
