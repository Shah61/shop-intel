import { useEffect, useRef, useState } from 'react'

const CARD_COUNT = 24

/**
 * Software / systems / dev — Unsplash photos.
 * License: https://unsplash.com/license — free for commercial/non-commercial use.
 */
const IMAGE_IDS = [
  'photo-1460925895917-afdab827c52f',
  'photo-1551288049-bebda4e38f71',
  'photo-1517694712202-14dd9538aa97',
  'photo-1498050108023-c5249f4df085',
  'photo-1551434678-e076c223a692',
  'photo-1555949963-aa79dcee981c',
  'photo-1544197150-b99a580bb7a8',
  'photo-1516321318423-f06f85e504b3',
  'photo-1488590528505-98d2b5aba04b',
  'photo-1522071820081-009f0129c71c',
  'photo-1611224923853-80b023f02d71',
  'photo-1555066931-4365d14bab8c',
  'photo-1504384308090-c894fdcc538d',
  'photo-1526374965328-7f61d4dc18c5',
  'photo-1581291518857-4e27b48ff24e',
  'photo-1573164713714-d95e436ab8d6',
  'photo-1587620962725-abab7fe55159',
  'photo-1633265486064-086b219458ec',
  'photo-1517245386807-bb43f82c33c4',
  'photo-1451187580459-43490279c0fa',
  'photo-1518770660439-4636190af475',
  'photo-1563986768609-322da13575f3',
  'photo-1535223289827-42f1e9919769',
  'photo-1516116216624-53e697fedbea',
] as const

const imageSrcs = IMAGE_IDS.map(
  (id) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=200&q=80`,
)

function easeOutQuart(t: number) {
  return 1 - (1 - t) ** 4
}
function easeOutQuint(t: number) {
  return 1 - (1 - t) ** 5
}
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}
function clamp01(t: number) {
  return Math.max(0, Math.min(1, t))
}

function getAngle(i: number) {
  return (i / CARD_COUNT) * Math.PI * 2 - Math.PI / 2
}

/** Returns responsive dimensions based on the smaller viewport axis. */
function getResponsiveSizes(viewW: number, viewH: number) {
  const minDim = Math.min(viewW, viewH)

  // Radius: keep generous so text fits inside the ring on all screens.
  // On phones we use ~42-44% of the smaller axis; on desktop the original 270.
  let radius: number
  if (viewW < 480) {
    // phones — need enough room for the center text
    radius = Math.max(130, minDim * 0.42)
  } else if (viewW < 768) {
    // large phones / small tablets
    radius = Math.max(160, minDim * 0.38)
  } else if (viewW < 1024) {
    // iPads
    radius = Math.max(200, minDim * 0.34)
  } else {
    // desktop — original value
    radius = 270
  }

  // Card size: scale proportionally, but never below 50% on tiny screens
  const scale = radius / 270
  const cardW = Math.round(62 * Math.max(scale, 0.5))
  const cardH = Math.round(46 * Math.max(scale, 0.5))
  const cardR = Math.round(5 * Math.max(scale, 0.7))

  return { radius, cardW, cardH, cardR }
}

type FeaturesOrbitalHeroProps = {
  className?: string
}

export default function FeaturesOrbitalHero({
  className,
}: FeaturesOrbitalHeroProps) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    const sceneRoot = sceneRef.current
    const canvasRoot = canvasRef.current
    if (!sceneRoot || !canvasRoot) return

    const ctx = canvasRoot.getContext('2d')
    if (!ctx) return

    const c = ctx

    let cancelled = false
    let animationFrameId = 0
    let W = 0
    let H = 0
    let cx = 0
    let cy = 0
    let dpr = 1

    // Responsive sizes — recalculated on resize
    let sizes = getResponsiveSizes(window.innerWidth, window.innerHeight)

    const topPos = {
      x: Math.cos(-Math.PI / 2) * sizes.radius,
      y: Math.sin(-Math.PI / 2) * sizes.radius,
    }

    const cards = Array.from({ length: CARD_COUNT }, (_, i) => {
      const a = getAngle(i)
      return {
        revealed: false,
        revealTime: 0,
        startX: topPos.x,
        startY: topPos.y,
        targetX: Math.cos(a) * sizes.radius,
        targetY: Math.sin(a) * sizes.radius,
        angle: a,
      }
    })

    function resize() {
      dpr = window.devicePixelRatio || 1
      const rect = sceneRoot!.getBoundingClientRect()
      W = rect.width
      H = rect.height
      canvasRoot!.width = W * dpr
      canvasRoot!.height = H * dpr
      canvasRoot!.style.width = `${W}px`
      canvasRoot!.style.height = `${H}px`
      cx = W / 2
      cy = H / 2

      // Recalculate responsive sizes
      sizes = getResponsiveSizes(W, H)

      // Update card targets for new radius
      const newTopPos = {
        x: Math.cos(-Math.PI / 2) * sizes.radius,
        y: Math.sin(-Math.PI / 2) * sizes.radius,
      }
      topPos.x = newTopPos.x
      topPos.y = newTopPos.y

      for (let i = 0; i < CARD_COUNT; i++) {
        const a = getAngle(i)
        cards[i].targetX = Math.cos(a) * sizes.radius
        cards[i].targetY = Math.sin(a) * sizes.radius
        // Update start positions for unrevealed cards
        if (!cards[i].revealed) {
          cards[i].startX = topPos.x
          cards[i].startY = topPos.y
        }
      }
    }

    resize()
    window.addEventListener('resize', resize)

    const images: HTMLImageElement[] = []
    let loadedCount = 0

    function tryBegin() {
      if (cancelled) return
      if (loadedCount >= CARD_COUNT) begin()
    }

    imageSrcs.forEach((src) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = src
      img.onload = () => {
        loadedCount++
        tryBegin()
      }
      img.onerror = () => {
        loadedCount++
        tryBegin()
      }
      images.push(img)
    })

    let phase:
      | 'loading'
      | 'seedRising'
      | 'seedPause'
      | 'seedToTop'
      | 'bursting'
      | 'orbiting' = 'loading'
    let seedX = 0
    let seedY = 220
    let seedScale = 0.5
    let seedOpacity = 0
    let burstStartTime = 0
    let orbitAngle = 0
    let orbitSpeed = 0
    const uiShownRef = { current: false }
    let t0 = 0

    function drawCard(
      px: number,
      py: number,
      scale: number,
      opacity: number,
      img: HTMLImageElement | undefined,
    ) {
      if (opacity < 0.01 || scale < 0.01) return
      c.save()
      c.globalAlpha = opacity
      c.translate(px * dpr, py * dpr)
      c.scale(scale * dpr, scale * dpr)

      const w = sizes.cardW
      const h = sizes.cardH

      c.shadowColor = 'rgba(0,0,0,0.25)'
      c.shadowBlur = 12
      c.shadowOffsetY = 3

      c.beginPath()
      c.roundRect(-w / 2, -h / 2, w, h, sizes.cardR)
      c.closePath()
      c.fillStyle = '#1a1a24'
      c.fill()
      c.shadowColor = 'transparent'

      c.strokeStyle = 'rgba(255,255,255,0.08)'
      c.lineWidth = 0.5
      c.stroke()

      c.clip()
      if (img?.complete && img.naturalWidth) {
        const imgR = img.naturalWidth / img.naturalHeight
        const cardR = w / h
        let sw: number
        let sh: number
        let sx: number
        let sy: number
        if (imgR > cardR) {
          sh = img.naturalHeight
          sw = sh * cardR
          sx = (img.naturalWidth - sw) / 2
          sy = 0
        } else {
          sw = img.naturalWidth
          sh = sw / cardR
          sx = 0
          sy = (img.naturalHeight - sh) / 2
        }
        c.drawImage(img, sx, sy, sw, sh, -w / 2, -h / 2, w, h)
      }
      c.restore()
    }

    function begin() {
      if (cancelled) return
      t0 = performance.now()
      phase = 'seedRising'
      loop()
    }

    function loop() {
      if (cancelled) return

      const now = performance.now()
      const elapsed = now - t0

      c.setTransform(1, 0, 0, 1, 0, 0)
      c.clearRect(0, 0, canvasRoot!.width, canvasRoot!.height)

      if (phase === 'seedRising') {
        const t = clamp01(elapsed / 1100)
        const e = easeOutQuart(t)
        seedY = lerp(220, 0, e)
        seedScale = lerp(0.5, 1, e)
        seedOpacity = clamp01(elapsed / 250)
        if (t >= 1) phase = 'seedPause'
      }

      if (phase === 'seedPause') {
        seedY = 0
        seedScale = 1
        seedOpacity = 1
        if (elapsed > 1450) phase = 'seedToTop'
      }

      if (phase === 'seedToTop') {
        const t = clamp01((elapsed - 1450) / 650)
        const e = easeInOutCubic(t)
        seedX = lerp(0, topPos.x, e)
        seedY = lerp(0, topPos.y, e)
        seedScale = 1
        seedOpacity = 1
        if (t >= 1) {
          phase = 'bursting'
          burstStartTime = now
          cards[0].revealed = true
          cards[0].revealTime = now
        }
      }

      if (phase === 'bursting') {
        const burstElapsed = now - burstStartTime
        const stagger = 55
        const shouldReveal = Math.min(
          CARD_COUNT,
          Math.floor(burstElapsed / stagger) + 1,
        )
        for (let i = 0; i < shouldReveal; i++) {
          if (!cards[i].revealed) {
            cards[i].revealed = true
            cards[i].revealTime = now
          }
        }
        if (shouldReveal >= CARD_COUNT) {
          const lastAge = now - cards[CARD_COUNT - 1].revealTime
          if (lastAge > 500) phase = 'orbiting'
        }
      }

      if (phase === 'orbiting') {
        orbitSpeed = lerp(orbitSpeed, 0.0025, 0.012)
        orbitAngle += orbitSpeed
        if (!uiShownRef.current) {
          uiShownRef.current = true
          if (!cancelled) setHeroVisible(true)
        }
      }

      if (phase === 'bursting' || phase === 'orbiting') {
        for (let i = 0; i < CARD_COUNT; i++) {
          const card = cards[i]
          if (!card.revealed) continue

          const age = (now - card.revealTime) / 1000
          let x: number
          let y: number
          let scale: number
          let opacity: number

          if (phase === 'orbiting' && age > 0.5) {
            const angle = card.angle + orbitAngle
            x = Math.cos(angle) * sizes.radius
            y = Math.sin(angle) * sizes.radius
            scale = 1
            opacity = 1
          } else {
            const t = clamp01(age / 0.5)
            const e = easeOutQuint(t)
            const orbA = phase === 'orbiting' ? orbitAngle : 0
            const finalAngle = card.angle + orbA
            const finalX = Math.cos(finalAngle) * sizes.radius
            const finalY = Math.sin(finalAngle) * sizes.radius

            x = lerp(card.startX, finalX, e)
            y = lerp(card.startY, finalY, e)
            scale = lerp(0.4, 1, easeOutQuart(clamp01(age / 0.3)))
            opacity = clamp01(age / 0.1)
          }

          drawCard(
            cx + x,
            cy + y,
            scale,
            opacity,
            images[i % images.length],
          )
        }
      } else {
        drawCard(cx + seedX, cy + seedY, seedScale, seedOpacity, images[0])
      }

      animationFrameId = requestAnimationFrame(loop)
    }

    if (loadedCount >= CARD_COUNT) begin()

    return () => {
      cancelled = true
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section
      className={`relative w-full overflow-hidden ${className ?? 'min-h-dvh'}`}
      aria-label="Our features"
    >
      <div ref={sceneRef} className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 z-[5] h-full w-full"
          aria-hidden
        />

        {/* Center text — responsive sizing */}
        <div
          className={`pointer-events-none absolute top-1/2 left-1/2 z-10 w-[min(88vw,420px)] -translate-x-1/2 -translate-y-1/2 text-center transition-opacity duration-[1200ms] ease-in-out ${
            heroVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="mb-0.5 text-[18px] font-normal text-white/50 sm:text-[22px] md:text-[26px]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Discover
          </div>
          <h1
            className="mb-2.5 text-[28px] font-bold text-white sm:mb-3 sm:text-[36px] md:mb-3.5 md:text-[42px]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Our Features
          </h1>
          <p className="mb-5 px-2 text-[12px] leading-[1.7] text-white/45 sm:mb-6 sm:px-0 sm:text-[13px]">
            Powerful tools designed to accelerate your workflow
            <br />
            and transform the way you build.
          </p>
          <button
            type="button"
            className="pointer-events-auto inline-block cursor-pointer rounded-[28px] border-none bg-white px-6 py-3 text-[12.5px] font-semibold text-[#0a0a0f] shadow-[0_6px_28px_rgba(0,0,0,0.3)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_36px_rgba(255,255,255,0.15)] sm:px-[30px] sm:py-[13px] sm:text-[13.5px]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Explore Features
          </button>
        </div>
      </div>
    </section>
  )
}