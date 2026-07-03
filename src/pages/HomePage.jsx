import { Link } from 'react-router-dom'
import { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'

// ─── SPRITE HELPER ──────────────────────────────────────────────────────────
// Reusable component for all decorative images (clouds, trees, bushes, sun).
// pointer-events-none so they never block clicks on interactive elements.
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
// Static arrays defined outside the component so they are only created once,
// not re-created on every render.

// Clouds: w = width (px), t = top (px), dur = drift cycle, delay = start offset.
// Negative delays make clouds appear mid-animation on load (not all at the left edge).
const CLOUDS = [
  { src: '/images/items/cloud2.png', w: 190, t: 40,  dur: '70s', delay: '-22s' },
  { src: '/images/items/cloud1.png', w: 150, t: 12,  dur: '50s', delay: '-8s'  },
  { src: '/images/items/cloud4.png', w: 110, t: 70,  dur: '45s', delay: '-33s' },
  { src: '/images/items/cloud3.png', w: 170, t: 20,  dur: '60s', delay: '-48s' },
  { src: '/images/items/cloud6.png', w: 100, t: 85,  dur: '55s', delay: '-5s'  },
]

// Cloud shadows: blurred dark ovals on the grass that drift in sync with clouds above.
// b = bottom (px from ground), opacity + blur control how soft the shadow looks.
const CLOUD_SHADOWS = [
  { w: 180, h: 20, b: 106, opacity: 0.13, blur: 5, dur: '70s', delay: '-22s' },
  { w: 140, h: 16, b: 108, opacity: 0.11, blur: 4, dur: '50s', delay: '-8s'  },
  { w: 100, h: 13, b: 107, opacity: 0.09, blur: 4, dur: '45s', delay: '-33s' },
  { w: 160, h: 18, b: 106, opacity: 0.12, blur: 5, dur: '60s', delay: '-48s' },
  { w: 88,  h: 12, b: 108, opacity: 0.08, blur: 3, dur: '55s', delay: '-5s'  },
]

// Background trees: low opacity to simulate distance / depth behind the houses.
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

// Houses: the 3 clickable buildings sitting on the ground.
// floatDelay staggers the shake animation so they don't all wiggle at the same time.
// label + desc are shown inside the speech bubble when a house is clicked.
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

  // activeHouse: index (0–2) of the house whose speech bubble is open, or null if none
  const [activeHouse, setActiveHouse] = useState(null)

  useEffect(() => { document.title = 'TCG Manager' }, [])

  return (
    // Outer div sets the dark green base color visible below the ground strip
    <div className="min-h-screen" style={{ backgroundColor: '#14532d' }}>

    {/* Scene container — full viewport height minus the navbar (48px).
        Clicking anywhere on the scene dismisses any open speech bubble. */}
    <div
      className="relative overflow-hidden"
      style={{ height: 'calc(100vh - 48px)' }}
      onClick={() => setActiveHouse(null)}
    >

      {/* ── SKY ── gradient from deep blue at the top to pale sky at the horizon */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-500 via-sky-300 to-sky-100" />

      {/* ── SUN ── fixed in the top-right corner of the scene */}
      <Sprite src="/images/items/sun.png" style={{ width: 80, top: 28, right: '7%' }} />

      {/* ── CLOUDS ── drift left-to-right using the cloudDrift keyframe in index.css */}
      {CLOUDS.map(({ src, w, t, dur, delay }, i) => (
        <Sprite key={i} src={src} style={{ width: w, top: t, animation: `cloudDrift ${dur} linear infinite`, animationDelay: delay }} />
      ))}

      {/* ── WAVE ── SVG curve that blends the sky gradient into the green ground below */}
      <svg className="absolute w-full select-none pointer-events-none" style={{ bottom: 108 }}
        viewBox="0 0 1440 70" preserveAspectRatio="none">
        <path d="M0,50 C240,10 480,70 720,35 C960,0 1200,60 1440,25 L1440,70 L0,70 Z" fill="#16a34a" />
      </svg>

      {/* ── GROUND ── the green grass strip at the bottom of the scene */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: 118, background: 'linear-gradient(to bottom, #16a34a, #14532d)' }} />

      {/* ── CLOUD SHADOWS ── blurred ovals on the grass that drift in sync with the clouds above */}
      {CLOUD_SHADOWS.map(({ w, h, b, opacity, blur, dur, delay }, i) => (
        <div key={i} className="absolute select-none pointer-events-none" style={{
          width: w, height: h, bottom: b, borderRadius: '50%',
          background: `rgba(0,0,0,${opacity})`, filter: `blur(${blur}px)`,
          animation: `cloudDrift ${dur} linear infinite`, animationDelay: delay,
        }} />
      ))}

      {/* ── BACKGROUND TREES ── faint trees to create a depth / distance effect */}
      {BG_TREES.map(({ h, b, l, cls }, i) => (
        <Sprite key={i} src="/images/items/tree.png" className={cls} style={{ height: h, bottom: b, left: l }} />
      ))}

      {/* ── FOREGROUND LEFT ── full-size trees and bushes on the left side.
          No zIndex needed — they sit naturally behind the hero overlay. */}
      <Sprite src="/images/items/tree.png"  style={{ height: 212, bottom: 15,  left: '-2%' }} />
      <Sprite src="/images/items/bush1.png" style={{ height: 53,  bottom: 67,  left: '10%' }} />
      <Sprite src="/images/items/tree.png"  style={{ height: 129, bottom: 104, left: '24%' }} />
      <Sprite src="/images/items/bush1.png" style={{ height: 43,  bottom: 61,  left: '15%' }} />

      {/* ── HOUSES ── the 3 interactive buildings sitting on the ground.
          zIndex: 20 keeps them above the hero text overlay (absolute inset-0),
          which is required for hover scaling and click events to work.
          Each house runs the houseShake keyframe on an infinite loop, with a
          staggered floatDelay so they don't wiggle in unison. */}
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

          {/* Click me badge — hidden when speech bubble is open */}
          {activeHouse !== i && (
            <div className="absolute left-full -translate-x-1/2 -top-7 whitespace-nowrap"
              style={{ animation: 'badgePulse 3s ease-in-out infinite', animationDelay: floatDelay }}>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full shadow-md border border-amber-100/60" style={{ background: '#FFF8EE', color: '#92400e' }}>
                Tap here!
              </span>
            </div>
          )}

          {/* Speech bubble — only renders when this house is the active one.
              zIndex: 30 so it floats above every other element in the scene.
              The small triangle div below the card is the CSS arrow pointing down. */}
          {activeHouse === i && (
            <div
              className="absolute"
              style={{ bottom: '110%', left: '50%', width: 200, zIndex: 30,
                animation: 'popIn 0.22s ease-out forwards' }}
            >
              <div className="bg-white/90 backdrop-blur-sm border border-white/60 rounded-2xl p-4 shadow-xl">
                <p className="font-cinzel font-bold text-[#0F172A] text-sm mb-1">{label}</p>
                <p className="text-xs text-[#334155] leading-relaxed">{desc}</p>
              </div>
              {/* CSS triangle trick: a zero-size box with only top/left/right borders creates the arrow shape */}
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

      {/* ── FOREGROUND RIGHT ── trees and bushes on the right side.
          zIndex: 25 places them in front of the houses (zIndex: 20) so they
          overlap correctly and reinforce the layered 2D depth look. */}
      <Sprite src="/images/items/tree.png"  style={{ height: 165, bottom: 56,  right: '30%', zIndex: 25 }} />
      <Sprite src="/images/items/bush1.png" style={{ height: 34,  bottom: 100, right: '23%', zIndex: 25 }} />
      <Sprite src="/images/items/bush1.png" style={{ height: 23,  bottom: 100, right: '1%'  }} />
      <Sprite src="/images/items/tree.png"  style={{ height: 150, bottom: 97,  right: '2%'  }} />

      {/* ── HERO TEXT OVERLAY ── centered title + CTA buttons on top of the whole scene.
          absolute inset-0 fills the scene area; pb-36 pushes text upward so it
          doesn't overlap the houses sitting at the bottom. */}
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
          <Link to="/events"
            className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-8 py-3 rounded-full font-bold text-sm transition-colors shadow-lg">
            Browse Events
          </Link>
          {!token && (
            <Link to="/login"
              className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/60 px-8 py-3 rounded-full font-bold text-sm transition-colors shadow-lg backdrop-blur-sm">
              Login
            </Link>
          )}
        </div>
      </div>

    </div>
    </div>
  )
}
