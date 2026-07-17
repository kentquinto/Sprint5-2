// The app-wide page background: full-height sky gradient. Every routed page
// wraps its content in one of these so the backdrop is defined in one place.
export default function PageShell({ className = '', children }) {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-sky-500 via-sky-300 to-sky-100 ${className}`}>
      {children}
    </div>
  )
}
