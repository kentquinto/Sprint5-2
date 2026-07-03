import { useEffect } from 'react'

export default function Toast({ message, onDone, duration = 3500 }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDone, duration)
    return () => clearTimeout(t)
  }, [message])

  if (!message) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-50 bg-white/90 backdrop-blur-md border border-white/60 text-[#0F172A] text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2"
      style={{ animation: 'fadeInUp 0.3s ease-out both' }}
    >
      <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0" />
      {message}
    </div>
  )
}
