// The standard content surface — every white panel in the app should be one
// of these so the look stays consistent. Pass padding via className.
export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-white/85 backdrop-blur-sm border border-white/60 rounded-2xl shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
