import { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import Button from '../components/ui/Button'
import CloudLayer from '../components/CloudLayer'
import usePageTitle from '../hooks/usePageTitle'

// ─── SPRITE HELPER ──────────────────────────────────────────────────────────
// Decorative image (clouds, trees, bushes, sun). pointer-events-none so it
// never blocks clicks on interactive elements underneath.
function Sprite({ src, style, className = '' }) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className={['absolute select-none pointer-events-none', className].filter(Boolean).join(' ')}
      style={style}
    />
  )
}

// ─── SCENE DATA ─────────────────────────────────────────────────────────────
// Defined outside the component so these arrays aren't recreated every render.

// w = width (px), t = top (px), dur = drift cycle, delay = start offset
// (negative delays stagger clouds so they don't all start at the left edge)
const CLOUDS = [
  { src: '/images/items/cloud2.png', w: 190, t: 40,  dur: '70s', delay: '-22s' },
  { src: '/images/items/cloud1.png', w: 150, t: 12,  dur: '50s', delay: '-8s'  },
  { src: '/images/items/cloud4.png', w: 110, t: 70,  dur: '45s', delay: '-33s' },
  { src: '/images/items/cloud3.png', w: 170, t: 20,  dur: '60s', delay: '-48s' },
  { src: '/images/items/cloud6.png', w: 100, t: 85,  dur: '55s', delay: '-5s'  },
]

// Blurred ovals on the grass that drift in sync with the clouds above.
// b = bottom (px from ground)
const CLOUD_SHADOWS = [
  { w: 180, h: 20, b: 106, opacity: 0.13, blur: 5, dur: '70s', delay: '-22s' },
  { w: 140, h: 16, b: 108, opacity: 0.11, blur: 4, dur: '50s', delay: '-8s'  },
  { w: 100, h: 13, b: 107, opacity: 0.09, blur: 4, dur: '45s', delay: '-33s' },
  { w: 160, h: 18, b: 106, opacity: 0.12, blur: 5, dur: '60s', delay: '-48s' },
  { w: 88,  h: 12, b: 108, opacity: 0.08, blur: 3, dur: '55s', delay: '-5s'  },
]

// Low-opacity trees behind the houses, to fake distance/depth.
const BG_TREES = [
  { h: 110, b: 115, l: '10%', cls: 'opacity-20' },
  { h: 95,  b: 112, l: '21%', cls: 'opacity-15' },
  { h: 105, b: 114, l: '32%', cls: 'opacity-20' },
  { h: 95,  b: 112, l: '40%', cls: 'opacity-15' },
  { h: 120, b: 116, l: '53%', cls: 'opacity-20' },
  { h: 100, b: 112, l: '62%', cls: 'opacity-15' },
  { h: 110, b: 115, l: '78%', cls: 'opacity-20' },
  { h: 100, b: 112, l: '88%', cls: 'opacity-15' },
]

// The 3 clickable buildings. floatDelay staggers their idle shake animation.
// label + desc show in the speech bubble when a house is clicked.
const HOUSES = [
  {
    src: '/images/houses/house1.png',    h: 103, bottom: 50,  left: '8%',  floatDelay: '0s',
    label: 'Only the bold survive here.',
    desc:  'Enter the tournament grounds. Battle the finest duelists, collect your victories, and claim the throne.',
  },
  {
    src: '/images/houses/houseAlt1.png', h: 77, bottom: 109, left: '44%', transform: 'translateX(-50%)', floatDelay: '0.7s',
    label: 'Welcome to the guild hall!',
    desc:  'Browse events from across the realm, secure your spot before they fill up, or rally your crew and run your own tournament.',
  },
  {
    src: '/images/houses/house2.png',    h: 80, bottom: 107, left: '68%', floatDelay: '1.4s',
    label: 'Whispers speak of a great champion...',
    desc:  'Could it be you? The hall of records tracks every player, every event, every victory. Your legacy starts now.',
  },
]

// ─── PAGE COMPONENT ─────────────────────────────────────────────────────────
export default function HomePage() {
  const { token } = useContext(AuthContext)

  const [activeHouse, setActiveHouse] = useState(null) // index of open speech bubble, or null

  usePageTitle()

  return (
    // Dark green base color visible below the ground strip
    <div className="min-h-screen" style={{ backgroundColor: '#14532d' }}>

    {/* Full viewport minus navbar (48px). Click anywhere to dismiss a speech bubble. */}
    <div
      className="relative overflow-hidden"
      style={{ height: 'calc(100vh - 48px)' }}
      onClick={() => setActiveHouse(null)}
    >

      {/* ── SKY ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-500 via-sky-300 to-sky-100" />

      {/* ── SUN + CLOUDS ── scene-tuned positions; shadows below stay in sync
          because they reuse the same dur/delay values */}
      <CloudLayer clouds={CLOUDS} sun={{ width: 80, top: 28, right: '7%' }} />

      {/* ── WAVE ── blends the sky gradient into the ground below */}
      <svg className="absolute w-full select-none pointer-events-none" style={{ bottom: 108 }}
        viewBox="0 0 1440 70" preserveAspectRatio="none">
        <path d="M0,50 C240,10 480,70 720,35 C960,0 1200,60 1440,25 L1440,70 L0,70 Z" fill="#16a34a" />
      </svg>

      {/* ── GROUND ── */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: 118, background: 'linear-gradient(to bottom, #16a34a, #14532d)' }} />

      {/* ── CLOUD SHADOWS ── */}
      {CLOUD_SHADOWS.map(({ w, h, b, opacity, blur, dur, delay }, i) => (
        <div key={i} className="absolute select-none pointer-events-none" style={{
          width: w, height: h, bottom: b, borderRadius: '50%',
          background: `rgba(0,0,0,${opacity})`, filter: `blur(${blur}px)`,
          animation: `cloudDrift ${dur} linear infinite`, animationDelay: delay,
        }} />
      ))}

      {/* ── BACKGROUND TREES ── */}
      {BG_TREES.map(({ h, b, l, cls }, i) => (
        <Sprite key={i} src="/images/items/tree.png" className={cls} style={{ height: h, bottom: b, left: l }} />
      ))}

      {/* ── FOREGROUND LEFT ── no zIndex needed, sits behind the hero overlay naturally */}
      <Sprite src="/images/items/tree.png"  style={{ height: 212, bottom: 15,  left: '-2%' }} />
      <Sprite src="/images/items/bush1.png" style={{ height: 53,  bottom: 67,  left: '10%' }} />
      <Sprite src="/images/items/tree.png"  style={{ height: 129, bottom: 104, left: '24%' }} />
      <Sprite src="/images/items/bush1.png" style={{ height: 43,  bottom: 61,  left: '15%' }} />

      {/* ── HOUSES ── zIndex: 20 keeps them above the hero text overlay so
          hover/click still work; floatDelay staggers each house's shake loop. */}
      {HOUSES.map(({ src, h, bottom, left, transform, floatDelay, label, desc }, i) => (
        <div
          key={i}
          className="absolute cursor-pointer transition-transform duration-200 origin-bottom hover:scale-[1.1]"
          style={{ height: h, bottom, left, transform, zIndex: 20 }}
          onClick={e => { e.stopPropagation(); setActiveHouse(activeHouse === i ? null : i) }}
        >
          <img
            src={src} alt="" draggable={false}
            className="h-full select-none"
            style={{ animation: `houseShake 3s ease-in-out infinite`, animationDelay: floatDelay }}
          />

          {/* "Tap here" badge — hidden while this house's bubble is open */}
          {activeHouse !== i && (
            <div className="absolute left-full -translate-x-1/2 -top-7 whitespace-nowrap"
              style={{ animation: 'badgePulse 3s ease-in-out infinite', animationDelay: floatDelay }}>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full shadow-md border border-amber-100/60" style={{ background: '#FFF8EE', color: '#92400e' }}>
                Tap here!
              </span>
            </div>
          )}

          {/* Speech bubble — zIndex: 30 floats it above everything else in the scene */}
          {activeHouse === i && (
            <div
              className="absolute"
              style={{ bottom: '110%', left: '50%', width: 200, zIndex: 30,
                animation: 'popIn 0.22s ease-out forwards' }}
            >
              <div className="bg-white/90 backdrop-blur-sm border border-white/60 rounded-2xl p-4 shadow-xl">
                <p className="font-cinzel font-bold text-ink text-sm mb-1">{label}</p>
                <p className="text-xs text-ink-soft leading-relaxed">{desc}</p>
              </div>
              {/* zero-size box with only top/left/right borders = CSS triangle arrow */}
              <div className="mx-auto" style={{
                width: 0, height: 0,
                borderLeft: '9px solid transparent',
                borderRight: '9px solid transparent',
                borderTop: '9px solid rgba(255,255,255,0.9)',
              }} />
            </div>
          )}
        </div>
      ))}

      {/* ── FOREGROUND RIGHT ── zIndex: 25 puts these in front of the houses (20) */}
      <Sprite src="/images/items/tree.png"  style={{ height: 165, bottom: 56,  right: '30%', zIndex: 25 }} />
      <Sprite src="/images/items/bush1.png" style={{ height: 34,  bottom: 100, right: '23%', zIndex: 25 }} />
      <Sprite src="/images/items/bush1.png" style={{ height: 23,  bottom: 100, right: '1%'  }} />
      <Sprite src="/images/items/tree.png"  style={{ height: 150, bottom: 97,  right: '2%'  }} />

      {/* ── HERO TEXT OVERLAY ── centered title + CTAs; pb-36 keeps text clear of the houses below */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pb-36">
        <p className="font-cinzel text-xs font-bold uppercase text-white/80 mb-3 drop-shadow" style={{ letterSpacing: '0.2em' }}>
          Welcome to TCG Manager!
        </p>
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
          Your TCG Tournament Hub
        </h1>
        <p className="text-white/90 text-lg max-w-xl mb-8 drop-shadow">
          Organize and join Trading Card Game tournaments for Pokémon, Yu-Gi-Oh!, Magic: The Gathering, and more!
        </p>
        {/* Login button is hidden when the user is already logged in */}
        <div className="flex gap-4">
          <Button to="/events" size="lg" className="shadow-lg">
            Browse Events
          </Button>
          {!token && (
            <Button to="/login" variant="glass" size="lg">
              Login
            </Button>
          )}
        </div>
      </div>

    </div>
    </div>
  )
}
