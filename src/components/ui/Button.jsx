import { Link } from 'react-router-dom'

// The one source of truth for button styling. Renders a <Link> when given
// `to`, otherwise a <button>. Add variants here — never restyle in place.
const VARIANTS = {
  primary:          'bg-primary hover:bg-primary-deep text-white shadow-sm',
  danger:           'bg-red-500 hover:bg-red-600 text-white shadow-sm',
  'danger-outline': 'border border-red-200 text-red-600 hover:bg-red-50',
  'primary-outline': 'border border-mist text-primary hover:bg-mist/60',
  outline:          'border border-mist text-ink-soft hover:bg-mist/50',
  glass:            'bg-white/20 hover:bg-white/30 text-white border-2 border-white/60 backdrop-blur-sm shadow-lg',
}

const SIZES = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-5 py-2 text-sm',
  lg: 'px-8 py-3 text-sm',
}

export default function Button({ variant = 'primary', size = 'md', to, className = '', children, ...props }) {
  const cls = [
    'inline-flex items-center justify-center gap-1.5 rounded-full font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
    VARIANTS[variant],
    SIZES[size],
    className,
  ].join(' ')

  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>
  return <button className={cls} {...props}>{children}</button>
}
