// Decorative sun + drifting clouds, absolutely positioned inside the nearest
// `relative` ancestor. One default cloud set for banners/full pages; scenes
// with tuned layouts (HomePage) pass their own `clouds`.
const DEFAULT_CLOUDS = [
  { src: '/images/items/cloud2.png', w: 180, t: 30, dur: '70s', delay: '-15s' },
  { src: '/images/items/cloud1.png', w: 140, t: 10, dur: '50s', delay: '-5s'  },
  { src: '/images/items/cloud4.png', w: 100, t: 60, dur: '45s', delay: '-30s' },
  { src: '/images/items/cloud3.png', w: 160, t: 18, dur: '60s', delay: '-42s' },
]

export default function CloudLayer({ clouds = DEFAULT_CLOUDS, sun = { width: 64, top: 20, right: '6%' } }) {
  return (
    <>
      <img
        src="/images/items/sun.png" alt="" draggable={false}
        className="absolute select-none pointer-events-none"
        style={{ width: sun.width, top: sun.top, right: sun.right }}
      />
      {clouds.map(({ src, w, t, dur, delay }, i) => (
        <img
          key={i} src={src} alt="" draggable={false}
          className="absolute select-none pointer-events-none"
          style={{ width: w, top: t, animation: `cloudDrift ${dur} linear infinite`, animationDelay: delay }}
        />
      ))}
    </>
  )
}
