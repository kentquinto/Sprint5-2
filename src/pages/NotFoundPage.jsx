import { useEffect } from 'react'
import SkyPage from '../components/SkyPage'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  useEffect(() => { document.title = '404 — TCG Manager' }, [])

  return (
    <SkyPage>
      <div className="text-center" style={{ animation: 'fadeInUp 0.35s ease-out both' }}>
        <p className="font-cinzel text-7xl font-black text-white/30 mb-2">404</p>
        <h1 className="text-2xl font-bold text-white drop-shadow-lg mb-2">Page not found</h1>
        <p className="text-white/70 text-sm mb-8">This path leads nowhere, traveller.</p>
        <Button to="/" size="lg">
          Back to Home
        </Button>
      </div>
    </SkyPage>
  )
}
