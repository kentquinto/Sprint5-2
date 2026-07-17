const DEFAULT_CLOUDS = [
  { src: '/images/items/cloud2.png', w: 180, t: 30, dur: '70s', delay: '-15s' },
  { src: '/images/items/cloud1.png', w: 140, t: 10, dur: '50s', delay: '-5s'  },
  { src: '/images/items/cloud4.png', w: 100, t: 60, dur: '45s', delay: '-30s' },
  { src: '/images/items/cloud3.png', w: 160, t: 18, dur: '60s', delay: '-42s' },
]

export default function SkyBanner({ eyebrow, title, subtitle, clouds = DEFAULT_CLOUDS, height = 200 }) {
  return (
    <div className="relative overflow-hidden" style={{ height }}>
      <img src="/images/items/sun.png" alt="" draggable={false}
        className="absolute select-none pointer-events-none"
        style={{ width: 64, top: 20, right: '6%' }} />

      {clouds.map(({ src, w, t, dur, delay }, i) => (
        <img key={i} src={src} alt="" draggable={false}
          className="absolute select-none pointer-events-none"
          style={{ width: w, top: t, animation: `cloudDrift ${dur} linear infinite`, animationDelay: delay }} />
      ))}

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
