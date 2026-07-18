import { useEffect, useRef } from 'react'

export default function Toast({ message, onDone, duration = 3500 }) {
  // Track the latest onDone in a ref so the timer effect doesn't depend on
  // the callback's identity — parents pass inline arrows that change every
  // render, and re-running the effect would reset the countdown.
  const onDoneRef = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone })

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => onDoneRef.current(), duration)
    return () => clearTimeout(t)
  }, [message, duration])

  if (!message) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-50 bg-white/90 backdrop-blur-md text-ink text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-fade-in-up"
      role="status"
    >
      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
      {message}
    </div>
  )
}
