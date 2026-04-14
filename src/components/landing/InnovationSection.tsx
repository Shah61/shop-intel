import { useRef, useEffect, useCallback } from 'react'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface DepthItem {
  el: HTMLDivElement
  xPct: number
  yPct: number
  z: number
  w: number
  h: number
}

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────

const IS_MOBILE =
  typeof window !== 'undefined' && window.innerWidth < 768
const IS_TABLET =
  typeof window !== 'undefined' &&
  window.innerWidth >= 768 &&
  window.innerWidth < 1024

function featureImage(file: string) {
  const base = "/"
  const root = base.endsWith('/') ? base : `${base}/`
  return `${root}images/features/${file.replace(/^\/+/, '')}`
}

const IMAGE_URLS = [
  featureImage('Sales.png'),
  featureImage('Intelligence.png'),
  featureImage('Marketing.png'),
  featureImage('Inventory.png'),
  featureImage('Physical.png'),
  featureImage('Affiliates.png'),
  featureImage('User-Activity.png'),
  featureImage('Branches.png'),
]

const LABELS = [
  { num: '01', title: 'Sales' },
  { num: '02', title: 'Intelligence' },
  { num: '03', title: 'Marketing' },
  { num: '04', title: 'Inventory' },
  { num: '05', title: 'Physical Stores' },
  { num: '06', title: 'Affiliates' },
  { num: '07', title: 'User Activity' },
  { num: '08', title: 'Branches' },
]

const DESKTOP_LAYOUTS = [
  { xPct: -28, yPct: -14, w: 720, h: 470 },
  { xPct: 28, yPct: 14, w: 720, h: 470 },
  { xPct: 26, yPct: -18, w: 740, h: 480 },
  { xPct: -26, yPct: 18, w: 740, h: 480 },
  { xPct: -30, yPct: -10, w: 700, h: 460 },
  { xPct: 30, yPct: 12, w: 700, h: 460 },
  { xPct: 40, yPct: -26, w: 730, h: 475 },
  { xPct: -40, yPct: 26, w: 730, h: 475 },
]

const TABLET_LAYOUTS = [
  { xPct: -24, yPct: -12, w: 500, h: 330 },
  { xPct: 24, yPct: 12, w: 500, h: 330 },
  { xPct: 22, yPct: -16, w: 520, h: 340 },
  { xPct: -22, yPct: 16, w: 520, h: 340 },
  { xPct: -26, yPct: -8, w: 480, h: 320 },
  { xPct: 26, yPct: 10, w: 480, h: 320 },
  { xPct: 34, yPct: -22, w: 510, h: 335 },
  { xPct: -34, yPct: 22, w: 510, h: 335 },
]

const MOBILE_LAYOUTS = [
  { xPct: -18, yPct: -10, w: 320, h: 210 },
  { xPct: 18, yPct: 10, w: 320, h: 210 },
  { xPct: 16, yPct: -14, w: 330, h: 220 },
  { xPct: -16, yPct: 14, w: 330, h: 220 },
  { xPct: -20, yPct: -8, w: 310, h: 205 },
  { xPct: 20, yPct: 8, w: 310, h: 205 },
]

const LAYOUTS = IS_MOBILE
  ? MOBILE_LAYOUTS
  : IS_TABLET
    ? TABLET_LAYOUTS
    : DESKTOP_LAYOUTS
const NUM_IMAGES = IS_MOBILE ? 6 : 8
const NUM_PAIRS = IS_MOBILE ? 3 : 4
const PERSPECTIVE = IS_MOBILE ? 600 : 700
const LABEL_HEIGHT = 44
const SCROLL_HEIGHT_VH = IS_MOBILE ? 200 : 250

const Z_START = 500
const Z_SPAN = IS_MOBILE ? 2500 : 3500
const CAMERA_MAX = Z_START + Z_SPAN - 400

const FADE_FAR = IS_MOBILE ? 3000 : 4000
const FADE_FAR_RANGE = IS_MOBILE ? 2000 : 3000
const CULL_FAR = IS_MOBILE ? 5000 : 8000

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function InnovationSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const builtRef = useRef(false)
  const isVisibleRef = useRef(false)
  const itemsRef = useRef<DepthItem[]>([])

  // Build DOM once
  useEffect(() => {
    if (builtRef.current) return
    builtRef.current = true

    const viewport = viewportRef.current
    if (!viewport) return

    const items: DepthItem[] = []

    for (let i = 0; i < NUM_IMAGES; i++) {
      const layout = LAYOUTS[i]
      const pairIndex = Math.floor(i / 2)

      const el = document.createElement('div')
      el.className = 'depth-image'
      el.style.cssText = `
        position:absolute;
        width:${layout.w}px;
        height:${layout.h + LABEL_HEIGHT}px;
        visibility:hidden;
        opacity:0;
        contain:strict;
        transform:translate3d(0,0,0);
        backface-visibility:hidden;
        transform-origin:0 0;
      `

      const img = document.createElement('img')
      img.src = IMAGE_URLS[i]
      img.alt = LABELS[i].title
      img.loading = 'lazy'
      img.decoding = 'async'
      img.style.cssText = `
        width:100%;
        height:${layout.h}px;
        object-fit:contain;
        object-position:center;
        display:block;
        border-radius:8px;
      `
      el.appendChild(img)

      const label = document.createElement('div')
      label.style.cssText = `
        display:flex;
        align-items:baseline;
        gap:8px;
        padding-top:10px;
        font-family:'Playfair Display',serif;
        pointer-events:none;
      `
      label.innerHTML = `
        <span style="font-size:11px;font-weight:400;letter-spacing:0.15em;color:rgba(255,255,255,0.4);text-transform:uppercase">${LABELS[i].num}</span>
        <span style="font-size:${IS_MOBILE ? 13 : 15}px;font-weight:700;letter-spacing:0.04em;color:rgba(255,255,255,0.85)">${LABELS[i].title}</span>
      `
      el.appendChild(label)

      viewport.appendChild(el)

      const zPos = Z_START + (pairIndex / (NUM_PAIRS - 1)) * Z_SPAN

      items.push({
        el,
        xPct: layout.xPct,
        yPct: layout.yPct,
        z: zPos,
        w: layout.w,
        h: layout.h + LABEL_HEIGHT,
      })
    }

    itemsRef.current = items
  }, [])

  // IntersectionObserver — skip work when section is off-screen
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting
      },
      { threshold: 0, rootMargin: '100px 0px' },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  const render = useCallback((progress: number) => {
    const viewport = viewportRef.current
    if (!viewport) return

    const items = itemsRef.current
    if (items.length === 0) return

    const cameraZ = progress * CAMERA_MAX
    const cx = viewport.clientWidth / 2
    const cy = viewport.clientHeight / 2
    const vw = viewport.clientWidth
    const vh = viewport.clientHeight

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const el = item.el
      const dz = item.z - cameraZ

      // Cull: behind camera or too far ahead
      if (dz < -100 || dz > CULL_FAR) {
        if (el.style.visibility !== 'hidden') {
          el.style.cssText = `
            position:absolute;
            width:${item.w}px;
            height:${item.h}px;
            visibility:hidden;
            opacity:0;
            contain:strict;
            transform:translate3d(0,0,0);
            backface-visibility:hidden;
            transform-origin:0 0;
            will-change:auto;
          `
        }
        continue
      }

      const baseX = (item.xPct / 100) * vw
      const baseY = (item.yPct / 100) * vh

      const projScale = PERSPECTIVE / (PERSPECTIVE + dz)
      const projX = cx + baseX * projScale - (item.w * projScale) / 2
      const projY = cy + baseY * projScale - (item.h * projScale) / 2

      let opacity = 1
      if (dz > FADE_FAR)
        opacity = Math.max(0, 1 - (dz - FADE_FAR) / FADE_FAR_RANGE)
      if (dz < 200) opacity = Math.max(0, dz / 200)

      el.style.cssText = `
        position:absolute;
        width:${item.w}px;
        height:${item.h}px;
        visibility:visible;
        opacity:${opacity};
        contain:strict;
        transform:translate3d(${projX}px,${projY}px,0) scale(${projScale});
        backface-visibility:hidden;
        transform-origin:0 0;
        z-index:${Math.round(10000 - dz)};
        will-change:transform;
      `
    }
  }, [])

  useEffect(() => {
    if (itemsRef.current.length === 0) {
      const id = requestAnimationFrame(() => {})
      return () => cancelAnimationFrame(id)
    }

    let ticking = false

    const onScroll = () => {
      if (!isVisibleRef.current) return
      if (ticking) return
      ticking = true

      requestAnimationFrame(() => {
        ticking = false
        const section = sectionRef.current
        if (!section) return

        const rect = section.getBoundingClientRect()
        const scrollable = section.offsetHeight - window.innerHeight

        if (scrollable <= 0) {
          render(0)
          return
        }

        const progress = Math.max(0, Math.min(1, -rect.top / scrollable))
        render(progress)

        const centerEl = section.querySelector(
          '[data-center-text]',
        ) as HTMLElement
        if (centerEl) {
          const fadeOut = Math.max(0, 1 - progress / 0.15)
          centerEl.style.opacity = `${fadeOut}`
          centerEl.style.visibility = fadeOut < 0.01 ? 'hidden' : 'visible'
        }
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => window.removeEventListener('scroll', onScroll)
  })

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{
        height: `${SCROLL_HEIGHT_VH}vh`,
        background: '#0a0a0a',
      }}
    >
      <div
        ref={viewportRef}
        className="sticky top-0 left-0 h-screen w-full overflow-hidden"
      >
        <div
          data-center-text
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{
            zIndex: 9999,
            willChange: 'opacity',
            backfaceVisibility: 'hidden',
          }}
        >
          <div
            className="absolute"
            style={{
              width: IS_MOBILE ? '300px' : '600px',
              height: IS_MOBILE ? '200px' : '300px',
              background:
                'radial-gradient(ellipse at center, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.7) 40%, transparent 70%)',
              transform: 'translate3d(0,0,0)',
            }}
          />
          <div className="relative text-center">
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 400,
                fontSize: IS_MOBILE
                  ? 'clamp(1.8rem, 8vw, 2.8rem)'
                  : 'clamp(2.5rem, 6vw, 5.5rem)',
                lineHeight: 1.15,
                letterSpacing: '0.02em',
                color: '#fff',
              }}
            >
              PULSE
              <br />
              Product Tour
            </h2>
          </div>
        </div>
      </div>
    </section>
  )
}