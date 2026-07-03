import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import SkyPage from '../components/SkyPage'

export default function NotFoundPage() {
  useEffect(() => { document.title = '404 — TCG Manager' }, [])

  return (
    <SkyPage>
      <div className="text-center" style={{ animation: 'fadeInUp 0.35s ease-out both' }}>
        <p className="font-cinzel text-7xl font-black text-white/30 mb-2">404</p>
        <h1 className="text-2xl font-bold text-white drop-shadow-lg mb-2">Page not found</h1>
        <p className="text-white/70 text-sm mb-8">This path leads nowhere, traveller.</p>
        <Link
          to="/"
          className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-full font-bold text-sm transition-colors shadow-lg"
        >
          Back to Home
        </Link>
      </div>
    </SkyPage>
  )
}
