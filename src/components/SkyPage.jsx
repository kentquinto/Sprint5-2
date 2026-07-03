const CLOUDS = [
  { src: '/images/items/cloud2.png', w: 180, t: 40,  dur: '70s', delay: '-22s' },
  { src: '/images/items/cloud1.png', w: 150, t: 10,  dur: '50s', delay: '-8s'  },
  { src: '/images/items/cloud4.png', w: 110, t: 70,  dur: '45s', delay: '-33s' },
  { src: '/images/items/cloud3.png', w: 160, t: 20,  dur: '60s', delay: '-48s' },
  { src: '/images/items/cloud6.png', w: 100, t: 55,  dur: '55s', delay: '-12s' },
]

export default function SkyPage({ children }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-sky-500 via-sky-300 to-sky-100 flex items-center justify-center px-4 py-10">
      <img
        src="/images/items/sun.png" alt="" draggable={false}
        className="absolute select-none pointer-events-none"
        style={{ width: 72, top: 24, right: '7%' }}
      />
      {CLOUDS.map(({ src, w, t, dur, delay }, i) => (
        <img key={i} src={src} alt="" draggable={false}
          className="absolute select-none pointer-events-none"
          style={{ width: w, top: t, animation: `cloudDrift ${dur} linear infinite`, animationDelay: delay }}
        />
      ))}
      {children}
    </div>
  )
}
