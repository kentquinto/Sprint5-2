import CloudLayer from './CloudLayer'

export default function SkyBanner({ eyebrow, title, subtitle, height = 200 }) {
  return (
    <div className="relative overflow-hidden" style={{ height }}>
      <CloudLayer />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        {eyebrow && (
          <p className="font-cinzel text-xs font-bold uppercase tracking-widest text-white/70 mb-2" style={{ letterSpacing: '0.2em' }}>
            {eyebrow}
          </p>
        )}
        <h1 className="text-4xl font-bold text-white drop-shadow-lg">{title}</h1>
        {subtitle && (
          <p className="text-white/80 mt-2 text-sm drop-shadow">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
