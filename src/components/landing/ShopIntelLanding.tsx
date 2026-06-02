import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'

import AIAdvisorTour from './AIAdvisorTour'
import HumanityThroughAISection from './HumanityThroughAISection'
import InnovationSection from './InnovationSection'
import RealTimeIntelligenceSection from './RealTimeIntelligenceSection'
import GetWorkDoneSection from './GetWorkDoneSection'
import ContactSection from './ContactSection'
import { LandingNavBar } from './LandingNavBar'
import Footer from '../../landing-pages/Footer'

// ─────────────────────────────────────────────
// Images
// ─────────────────────────────────────────────
function publicImage(name: string) {
  const base = "/"
  const root = base.endsWith('/') ? base : `${base}/`
  return `${root}images/${name.replace(/^\/+/, '')}`
}

const LANDING_IMAGES = {
  backgroundAvif: publicImage('bg1.avif'),
  dashboard: publicImage('dashboard.png'),
  leftSide: publicImage('leftside.png'),
  rightSide: publicImage('rightside.png'),
}

const BG_IMAGE_SRCSET = [
  `${LANDING_IMAGES.backgroundAvif} 512w`,
  `${LANDING_IMAGES.backgroundAvif} 1024w`,
  `${LANDING_IMAGES.backgroundAvif} 1440w`,
].join(', ')

// ─────────────────────────────────────────────
const HERO_FEATURE_LABELS = [
  'AI-Powered Analytics',
  'Real-Time Tracking',
  'Smart Reports',
  'Team Insights',
]

// Motion delays (ms)
const DASHBOARD_DELAY_MS = 500
const SIDE_LEFT_DELAY_MS = 700
const SIDE_RIGHT_DELAY_MS = 800
const BOTTOM_LABELS_DELAY_MS = 900

function letterDelayMs(i: number) {
  return 50 + i * 40
}

// ─────────────────────────────────────────────
// HERO — Gradient letter animation
// ─────────────────────────────────────────────
const WHITE = '255, 255, 255'

type LetterGrad = { ch: string; a0: number; a1: number }

const INTELLIGENCE_LETTERS: LetterGrad[] = [
  { ch: 'I', a0: 0.16, a1: 0.4 },
  { ch: 'N', a0: 0.2, a1: 0.5 },
  { ch: 'T', a0: 0.22, a1: 0.54 },
  { ch: 'E', a0: 0.3, a1: 0.64 },
  { ch: 'L', a0: 0.34, a1: 0.7 },
  { ch: 'L', a0: 0.52, a1: 1 },
  { ch: 'I', a0: 0.58, a1: 1 },
  { ch: 'G', a0: 0.6, a1: 1 },
  { ch: 'E', a0: 0.62, a1: 1 },
  { ch: 'N', a0: 0.24, a1: 0.54 },
  { ch: 'C', a0: 0.21, a1: 0.5 },
  { ch: 'E', a0: 0.16, a1: 0.4 },
]

// ─────────────────────────────────────────────
// WHY Pulse — Section data
// ─────────────────────────────────────────────
interface WhySection {
  title: ReactNode
  body: ReactNode
}

const WHY_SECTIONS: WhySection[] = [
  {
    title: 'Run every channel from one workspace',
    body: (
      <>
        Pulse brings your sales channels, campaign performance, inventory, and
        retail operations into one command center so your team can decide and
        execute faster without jumping across disconnected tools.
      </>
    ),
  },
  {
    title: (
      <>
        Built for your operating
        <br className="hidden sm:inline" />
        {' '}rhythm
      </>
    ),
    body: (
      <>
        Every business runs differently. Pulse gives you flexible dashboards and
        workflows so operators, marketers, and managers can focus on the same
        numbers while still working in the way{' '}
        <strong className="font-bold text-white">you</strong> want. Use
        structured views and AI summaries to align teams without adding more
        reporting overhead.
      </>
    ),
  },
  {
    title: (
      <>
        Real-time clarity for
        <br className="hidden sm:inline" />
        {' '}every team
      </>
    ),
    body: (
      <>
        Pulse keeps your team in sync with live operational visibility across
        revenue, fulfillment, marketing, and branch performance. That means
        decisions feel{' '}
        <strong className="font-bold text-white">
          faster and more confident.
        </strong>{' '}
        Everyone gets the context they need to move, without waiting on manual
        updates.
      </>
    ),
  },
]

// ─────────────────────────────────────────────
// SCROLL REVEAL HOOK + WRAPPER
// ─────────────────────────────────────────────
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.unobserve(el)
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible] as const
}

function ScrollReveal({
  children,
  animation = 'slide-up',
  delay = 0,
  threshold = 0.15,
  className = '',
}: {
  children: ReactNode
  animation?: string
  delay?: number
  threshold?: number
  className?: string
}) {
  const [ref, visible] = useScrollReveal(threshold)
  return (
    <div
      ref={ref}
      className={`why-sr why-sr-${animation} ${visible ? 'why-sr-go' : ''} ${className}`}
      style={{ '--why-d': `${delay}s` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
// SMALL REUSABLE PIECES
// ─────────────────────────────────────────────

function CheckCircleIcon({ id = 'cg' }: { id?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={`url(#${id})`}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function CircleProgress({
  percent,
  label,
  color,
}: {
  percent: number
  label: string
  color: string
}) {
  const r = 30
  const c = 2 * Math.PI * r
  const off = c - (percent / 100) * c
  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2">
      <div className="relative h-[52px] w-[52px] sm:h-[60px] sm:w-[60px] md:h-[68px] md:w-[68px]">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 68 68"
          className="-rotate-90"
        >
          <circle
            cx="34"
            cy="34"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="4.5"
          />
          <circle
            cx="34"
            cy="34"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="4.5"
            strokeDasharray={c}
            strokeDashoffset={off}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white sm:text-xs">
          {percent}%
        </div>
      </div>
      <span className="text-[10px] font-medium text-white/50 sm:text-[11px]">{label}</span>
    </div>
  )
}

// ═════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════

export default function PulseLanding() {
  const [activeWhyIdx, setActiveWhyIdx] = useState(0)
  const [whySectionInView, setWhySectionInView] = useState(false)
  const [indicatorLeft, setIndicatorLeft] = useState(0)
  const [indicatorTop, setIndicatorTop] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const whyRefs = useRef<(HTMLDivElement | null)[]>([])
  const whySectionRef = useRef<HTMLElement | null>(null)
  const stickyCardsRef = useRef<HTMLDivElement | null>(null)

  // Detect mobile/tablet for layout changes
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Track which text block is active (desktop only — scroll-driven)
  useEffect(() => {
    if (isMobile) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = whyRefs.current.indexOf(entry.target as HTMLDivElement)
            if (idx !== -1) setActiveWhyIdx(idx)
          }
        })
      },
      { threshold: 0.35, rootMargin: '-20% 0px -20% 0px' }
    )
    whyRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })
    return () => observer.disconnect()
  }, [isMobile])

  // Track whether section is in view (for dots indicator — desktop only)
  useEffect(() => {
    if (isMobile) return
    const el = whySectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setWhySectionInView(entry.isIntersecting),
      { threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isMobile])

  const updateIndicatorPosition = useCallback(() => {
    if (isMobile) return
    const el = whySectionRef.current
    if (!el) return
    const container = el.querySelector('.why-container')
    if (!container) return
    const cRect = container.getBoundingClientRect()
    setIndicatorLeft(cRect.left + 40)

    const cards = stickyCardsRef.current
    if (cards) {
      const r = cards.getBoundingClientRect()
      setIndicatorTop(r.top + r.height / 2)
    }
  }, [isMobile])

  useEffect(() => {
    if (isMobile) return
    updateIndicatorPosition()
    window.addEventListener('resize', updateIndicatorPosition)
    window.addEventListener('scroll', updateIndicatorPosition, { passive: true })
    return () => {
      window.removeEventListener('resize', updateIndicatorPosition)
      window.removeEventListener('scroll', updateIndicatorPosition)
    }
  }, [updateIndicatorPosition, isMobile])

  useLayoutEffect(() => {
    if (isMobile || !whySectionInView) return
    updateIndicatorPosition()
    requestAnimationFrame(updateIndicatorPosition)
  }, [whySectionInView, updateIndicatorPosition, isMobile])

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash
      if (hash !== "#real-time-intelligence" && hash !== "#contact") return
      const id = hash.slice(1)
      const el = document.getElementById(id)
      if (!el) return
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    scrollToHash()
    window.addEventListener("hashchange", scrollToHash)
    return () => window.removeEventListener("hashchange", scrollToHash)
  }, [])

  return (
    <div className="font-dm-sans relative min-h-screen overscroll-none bg-[#0a0815]">
      <LandingNavBar />

      {/* ── WHY SECTION SCROLL ANIMATION STYLES ── */}
      <style>{`
        .why-sr { will-change: opacity, transform; }

        .why-sr-slide-up {
          opacity: 0;
          transform: translateY(70px);
          transition: opacity 0.8s cubic-bezier(0.33, 0, 0.2, 1),
                      transform 0.8s cubic-bezier(0.33, 0, 0.2, 1);
          transition-delay: var(--why-d, 0s);
        }
        .why-sr-slide-up.why-sr-go {
          opacity: 1;
          transform: translateY(0);
        }

        .why-sr-slide-left {
          opacity: 0;
          transform: translateX(-80px);
          transition: opacity 0.8s cubic-bezier(0.33, 0, 0.2, 1),
                      transform 0.8s cubic-bezier(0.33, 0, 0.2, 1);
          transition-delay: var(--why-d, 0s);
        }
        .why-sr-slide-left.why-sr-go {
          opacity: 1;
          transform: translateX(0);
        }

        .why-sr-slide-right {
          opacity: 0;
          transform: translateX(80px);
          transition: opacity 0.85s cubic-bezier(0.33, 0, 0.2, 1),
                      transform 0.85s cubic-bezier(0.33, 0, 0.2, 1);
          transition-delay: var(--why-d, 0s);
        }
        .why-sr-slide-right.why-sr-go {
          opacity: 1;
          transform: translateX(0);
        }

        .why-sr-slide-down {
          opacity: 0;
          transform: translateY(-60px);
          transition: opacity 0.8s cubic-bezier(0.33, 0, 0.2, 1),
                      transform 0.8s cubic-bezier(0.33, 0, 0.2, 1);
          transition-delay: var(--why-d, 0s);
        }
        .why-sr-slide-down.why-sr-go {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* ══════════════════════════════════════
          SECTION 1 — HERO
          ══════════════════════════════════════ */}
      <section className="relative pt-[4.5rem] sm:pt-[5.25rem] md:min-h-screen md:pt-24">
        {/* Background image */}
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          aria-hidden
        >
          <img
            src={LANDING_IMAGES.backgroundAvif}
            srcSet={BG_IMAGE_SRCSET}
            sizes="100vw"
            alt=""
            decoding="async"
            fetchPriority="high"
            className="h-full min-h-full w-full object-cover object-center opacity-50"
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center pt-0 md:min-h-[calc(100dvh-6rem)]">
          <div
            className="font-plus-jakarta relative z-[1] mt-2 inline-flex select-none flex-wrap justify-center gap-x-0.5 px-3 text-center font-extrabold uppercase sm:gap-x-1 sm:px-4 md:gap-x-1.5 md:px-0"
            style={{
              fontSize: 'clamp(36px, 11vw, 160px)',
              lineHeight: 1.1,
              letterSpacing: '0.02em',
            }}
          >
            {INTELLIGENCE_LETTERS.map((props, i) => (
              <span
                key={`${props.ch}-${i}`}
                className="landing-letter-in inline-block"
                style={{ animationDelay: `${letterDelayMs(i)}ms` }}
              >
                <span
                  className="inline-block bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(90deg, rgba(${WHITE}, ${props.a0}), rgba(${WHITE}, ${props.a1}))`,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                  }}
                >
                  {props.ch}
                </span>
              </span>
            ))}
          </div>

          <div className="relative z-[2] mx-auto mt-4 w-full max-w-[980px] px-4 sm:mt-6 sm:px-6 md:mt-8">
            <div className="relative mx-auto w-full max-w-[860px]">
              <div
                className="landing-slide-up relative z-10 mx-auto w-full"
                style={{ animationDelay: `${DASHBOARD_DELAY_MS}ms` }}
              >
                <img
                  src={LANDING_IMAGES.dashboard}
                  alt="Pulse analytics dashboard"
                  className="mx-auto block w-full rounded-xl shadow-[0_24px_80px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.08)] sm:rounded-2xl"
                  sizes="(min-width: 1024px) 860px, 100vw"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
              </div>

              <div className="absolute bottom-0 left-0 z-20 hidden w-[min(42%,260px)] max-w-[280px] -translate-x-[48%] -translate-y-[4%] sm:block sm:w-[min(38%,240px)] sm:-translate-x-[50%] md:w-[min(42%,260px)] md:-translate-x-[52%] lg:w-[min(38%,300px)] lg:-translate-x-[68%] lg:-translate-y-[6%]">
                <div
                  className="landing-from-left"
                  style={{ animationDelay: `${SIDE_LEFT_DELAY_MS}ms` }}
                >
                  <img
                    src={LANDING_IMAGES.leftSide}
                    alt="Pulse assistant"
                    className="block w-full rounded-xl"
                    sizes="(min-width: 1024px) 280px, 38vw"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>

              <div className="absolute top-0 right-0 z-20 hidden w-[min(42%,260px)] max-w-[280px] translate-x-[48%] -translate-y-[4%] sm:block sm:w-[min(38%,240px)] sm:translate-x-[50%] md:w-[min(42%,260px)] md:translate-x-[52%] lg:w-[min(38%,300px)] lg:translate-x-[68%] lg:-translate-y-[6%]">
                <div
                  className="landing-from-right"
                  style={{ animationDelay: `${SIDE_RIGHT_DELAY_MS}ms` }}
                >
                  <img
                    src={LANDING_IMAGES.rightSide}
                    alt="Branch performance"
                    className="block w-full rounded-xl"
                    sizes="(min-width: 1024px) 280px, 38vw"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className="landing-bottom-fade mx-auto grid w-full max-w-[900px] grid-cols-2 gap-x-6 gap-y-3 px-6 pt-8 pb-6 sm:flex sm:justify-center sm:gap-10 sm:px-10 sm:pt-12 sm:pb-10 md:gap-16 md:pt-20 md:pb-[60px] lg:gap-20"
            style={{ animationDelay: `${BOTTOM_LABELS_DELAY_MS}ms` }}
          >
            {HERO_FEATURE_LABELS.map((label) => (
              <div
                key={label}
                className="text-center text-xs font-medium text-white/40 sm:text-sm"
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div
          className="absolute right-0 bottom-0 left-0 z-10 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(140,100,200,0.3) 30%, rgba(140,100,200,0.3) 70%, transparent 100%)',
          }}
        />
      </section>



      {/* ══════════════════════════════════════
          SECTION 3 — WHY Pulse (ANIMATED)
          ══════════════════════════════════════ */}
      <section ref={whySectionRef} className="relative z-10 w-full bg-black">
        <div className="mx-auto max-w-[1280px] overflow-visible px-4 pt-8 pb-8 sm:px-6 sm:pt-10 sm:pb-12 lg:px-8 lg:pt-16 lg:pb-20">
          <div className="why-container overflow-visible rounded-2xl border border-white/[0.055] bg-[#100e1b] px-5 py-8 sm:rounded-3xl sm:px-8 sm:py-10 md:px-10 md:py-14 lg:py-[70px] lg:pr-[60px] lg:pl-[100px]">

            {/* Fixed dots — desktop only */}
            {!isMobile && whySectionInView && (
              <div
                className="pointer-events-none fixed z-50 flex flex-col items-center gap-1.5"
                style={{
                  left: `${indicatorLeft}px`,
                  top: `${indicatorTop}px`,
                  transform: 'translateY(-50%)',
                }}
              >
                {[0, 1, 2].map((idx) => {
                  const isActive = idx === activeWhyIdx
                  return (
                    <div
                      key={idx}
                      className="transition-all duration-[450ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                      style={{
                        width: isActive ? '3px' : '5px',
                        height: isActive ? '32px' : '5px',
                        borderRadius: isActive ? '3px' : '50%',
                        background: isActive
                          ? 'linear-gradient(180deg, #a78bfa, #e879f9)'
                          : 'rgba(255,255,255,0.25)',
                      }}
                    />
                  )
                })}
              </div>
            )}

            {/* ── MOBILE / TABLET LAYOUT (<1024px) ── */}
            {isMobile ? (
              <div className="flex flex-col gap-10 sm:gap-14">
                {WHY_SECTIONS.map((s, idx) => (
                  <div key={idx} className="flex flex-col gap-8">
                    {/* Text content — each piece slides up staggered */}
                    <div>
                      <ScrollReveal animation="slide-up" delay={0} threshold={0.1}>
                        <div className="mb-4 inline-flex w-fit items-center gap-[7px] self-start rounded-full border border-white/[0.07] bg-white/[0.055] px-3.5 py-[6px] sm:px-4 sm:py-[7px]">
                          <CheckCircleIcon id={`wz${idx}`} />
                          <span className="text-[12px] font-medium text-white/85 sm:text-[13px]">
                            Why Pulse
                          </span>
                        </div>
                      </ScrollReveal>

                      <ScrollReveal animation="slide-up" delay={0.1} threshold={0.1}>
                        <h2
                          className="mb-4 text-white sm:mb-5"
                          style={{
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: 'clamp(24px, 5vw, 40px)',
                            fontWeight: 400,
                            lineHeight: 1.2,
                            letterSpacing: '-0.3px',
                          }}
                        >
                          {s.title}
                        </h2>
                      </ScrollReveal>

                      <ScrollReveal animation="slide-up" delay={0.2} threshold={0.1}>
                        <p className="max-w-[500px] text-[14px] leading-[1.75] text-white/45 sm:text-[15px] sm:leading-[1.85]">
                          {s.body}
                        </p>
                      </ScrollReveal>
                    </div>

                    {/* Cards — slide up below first text block */}
                    {idx === 0 && (
                      <ScrollReveal animation="slide-up" delay={0.15} threshold={0.1}>
                        <div className="mx-auto w-full max-w-[380px]">
                          <WhyPulseCards />
                        </div>
                      </ScrollReveal>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* ── DESKTOP LAYOUT (>=1024px) ── */
              <div className="flex items-start gap-[50px] overflow-visible">
                {/* Left column: scrolling text */}
                <div className="flex-[1_1_55%]">
                  {WHY_SECTIONS.map((s, idx) => (
                    <div
                      key={idx}
                      ref={(el) => {
                        whyRefs.current[idx] = el
                      }}
                      className="flex min-h-[80vh] flex-col justify-center"
                      style={{
                        paddingBottom: idx < 2 ? '80px' : '40px',
                      }}
                    >
                      {/* Badge slides from left */}
                      <ScrollReveal animation="slide-left" delay={0} threshold={0.2}>
                        <div className="mb-[18px] inline-flex w-fit items-center gap-[7px] self-start rounded-full border border-white/[0.07] bg-white/[0.055] px-4 py-[7px]">
                          <CheckCircleIcon id={`wz${idx}`} />
                          <span className="text-[13px] font-medium text-white/85">
                            Why Pulse
                          </span>
                        </div>
                      </ScrollReveal>

                      {/* Title slides from left, slightly delayed */}
                      <ScrollReveal animation="slide-left" delay={0.1} threshold={0.2}>
                        <h2
                          className="mb-6 text-white"
                          style={{
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: 'clamp(28px, 3.2vw, 44px)',
                            fontWeight: 400,
                            lineHeight: 1.18,
                            letterSpacing: '-0.3px',
                          }}
                        >
                          {s.title}
                        </h2>
                      </ScrollReveal>

                      {/* Body slides up */}
                      <ScrollReveal animation="slide-up" delay={0.2} threshold={0.2}>
                        <p className="max-w-[500px] text-[15px] leading-[1.85] text-white/45">
                          {s.body}
                        </p>
                      </ScrollReveal>
                    </div>
                  ))}
                </div>

                {/* Right column: sticky dashboard cards — slides from right */}
                <div
                  ref={stickyCardsRef}
                  className="sticky top-[max(1.5rem,12vh)] flex-[0_0_380px] self-start overflow-visible"
                >
                  <ScrollReveal animation="slide-right" delay={0.15} threshold={0.1}>
                    <div className="relative overflow-visible">
                      <div
                        className="pointer-events-none absolute top-1/2 left-1/2 z-0 min-h-[min(520px,160%)] w-[220%] min-w-[440px] max-w-[800px] -translate-x-1/2 -translate-y-1/2"
                        style={{
                          background:
                            'radial-gradient(ellipse 52% 46% at 50% 48%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 14%, rgba(71,56,74,0.62) 36%, rgba(71,56,74,0.28) 52%, rgba(71,56,74,0.08) 65%, transparent 78%)',
                          filter: 'blur(52px)',
                        }}
                        aria-hidden
                      />
                      <div className="relative z-[1]">
                        <WhyPulseCards />
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
      SECTION 2 — Innovation / AI
      ══════════════════════════════════════ */}
      <InnovationSection />

      {/* SECTION 4 — AI Advisor product tour */}
      <AIAdvisorTour />

      {/* SECTION 5 — Real Time Intelligence */}
      <RealTimeIntelligenceSection />

      {/* SECTION 6 — Humanity Through AI */}
      <HumanityThroughAISection />

      {/* SECTION 7 — Get work done CTA */}
      <GetWorkDoneSection />

      {/* SECTION 8 — Contact */}
      <ContactSection />

      <Footer />
    </div>
  )
}


// ─────────────────────────────────────────────
// Extracted card stack component (reused in both layouts)
// ─────────────────────────────────────────────
function WhyPulseCards() {
  return (
    <>
      {/* Goals card (back) */}
      <div className="w-full rounded-2xl border border-white/[0.09] bg-[#1d1b27] px-5 pt-5 pb-4 shadow-[0_4px_40px_rgba(0,0,0,0.35)] sm:px-[26px] sm:pt-[26px] sm:pb-[22px]">
        <h3 className="mb-4 text-lg font-bold text-white sm:mb-[18px] sm:text-xl">
          Goals
        </h3>
        {[
          {
            w: '75%',
            bg: 'linear-gradient(90deg, #e879f9, #f472b6, #c084fc, rgba(255,255,255,0.35))',
            label: 'Revenue',
          },
          {
            w: '58%',
            bg: 'linear-gradient(90deg, #818cf8, #a78bfa, rgba(200,180,255,0.45))',
            label: 'Marketing',
          },
          {
            w: '42%',
            bg: 'linear-gradient(90deg, #6366f1, #818cf8, rgba(180,170,255,0.35))',
            label: 'Inventory',
          },
          {
            w: '28%',
            bg: 'linear-gradient(90deg, #a78bfa, #c4b5fd)',
            label: 'Branches',
          },
        ].map((b, i) => (
          <div key={i} className={i < 3 ? 'mb-2.5 sm:mb-3' : ''}>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="h-[12px] flex-1 overflow-hidden rounded-[7px] bg-white/5 sm:h-[13px]">
                <div
                  className="h-full rounded-[7px]"
                  style={{ width: b.w, background: b.bg }}
                />
              </div>
              <span className="min-w-[60px] text-right text-[11px] font-medium text-white/[0.65] sm:min-w-[72px] sm:text-xs">
                {b.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Reading Goals card (front, overlapping) */}
      <div className="relative z-[2] mx-auto -mt-[50px] w-[92%] rounded-2xl border border-white/[0.1] bg-[#1d1b27] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.4)] sm:-mt-[60px] sm:p-[22px]">
        {/* Header */}
        <div className="mb-3 flex items-center gap-[9px] sm:mb-4">
          <div className="flex h-[24px] w-[24px] items-center justify-center rounded-md bg-violet-500/[0.18] sm:h-[26px] sm:w-[26px]">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a78bfa"
              strokeWidth="2.2"
              className="sm:h-[14px] sm:w-[14px]"
            >
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
          </div>
          <span className="text-[14px] font-bold text-white sm:text-[15px]">
            Weekly Operations
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-4 flex items-center gap-[8px] sm:mb-5 sm:gap-[10px]">
          <div className="h-[12px] flex-1 overflow-hidden rounded-[9px] bg-white/5 sm:h-[14px]">
            <div
              className="h-full w-[70%] rounded-[9px]"
              style={{
                background:
                  'linear-gradient(90deg, #e879f9, #c084fc, #818cf8, rgba(200,200,255,0.45))',
              }}
            />
          </div>
          <span className="whitespace-nowrap text-[11px] font-medium text-white/60 sm:text-xs">
            35 tracked signals
          </span>
        </div>

        {/* Circle progress rings */}
        <div className="mb-3 flex justify-between px-0.5 sm:mb-4 sm:px-1">
          <CircleProgress percent={45} label="Sales" color="#a78bfa" />
          <CircleProgress percent={14} label="Ads" color="#6366f1" />
          <CircleProgress percent={20} label="Stock" color="#818cf8" />
          <CircleProgress percent={21} label="Stores" color="#4f46e5" />
        </div>

        {/* Footer */}
        <div className="rounded-[10px] border border-white/[0.06] bg-white/[0.04] py-[9px] text-center text-[11px] font-medium text-white/[0.55] sm:py-[11px] sm:text-xs">
          Updated in real time
        </div>
      </div>
    </>
  )
}