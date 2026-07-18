// The standard page-level content surface — every white panel should be one
// of these so the look stays consistent. Pass padding via className.
// Borderless by default; only the danger variant keeps a border so
// destructive sections stand out. (Small list items keep their own
// rounded-xl styling; Card is for panels.)
const VARIANTS = {
  default: '',
  danger: 'border border-red-200',
}

export default function Card({ variant = 'default', className = '', children, ...props }) {
  return (
    <div
      className={`bg-white/85 backdrop-blur-sm rounded-2xl shadow-sm ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
