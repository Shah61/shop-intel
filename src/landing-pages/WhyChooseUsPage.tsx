import { useEffect, useRef, useState, useCallback } from "react"

import { LandingNavBar } from "../components/landing/LandingNavBar"

function publicImage(path: string) {
  const base = "/"
  const root = base.endsWith("/") ? base : `${base}/`
  return `${root}${path.replace(/^\/+/, "")}`
}

const BACKGROUND_AVIF = publicImage("images/bg1.avif")
const BG_IMAGE_SRCSET = [
  `${BACKGROUND_AVIF} 512w`,
  `${BACKGROUND_AVIF} 1024w`,
  `${BACKGROUND_AVIF} 1440w`,
].join(", ")

/* ─── Section data ─── */
interface SectionItem {
  heading: string
  body: string
  icon: string
}
interface Section {
  tag: string
  title: string
  titleHtml: string
  subtitle: string
  items: SectionItem[]
  bentoLayout: "hero" | "grid-a" | "grid-b"
}

const SECTIONS: Section[] = [
  {
    tag: "Pulse",
    title: "Why choose us",
    titleHtml: `On a <em>professional</em> note`,
    subtitle: "Why choose us",
    items: [],
    bentoLayout: "hero",
  },
  {
    tag: "Intelligence",
    title: "Intelligence & Revenue",
    titleHtml: `Intelligence that drives <em>revenue</em>`,
    subtitle: "Unified command center",
    items: [
      {
        heading: "One view, every channel",
        body: "Shopee, TikTok, Shopify, WooCommerce — unified so you stop guessing which channel is actually winning.",
        icon: "◎",
      },
      {
        heading: "AI-powered analyst",
        body: "An Intelligence workspace you can talk to like a senior analyst — trends, deep analysis, competitive radar, and CS signals.",
        icon: "◈",
      },
      {
        heading: "Marketing velocity",
        body: "AI Storyboard turns ideas into structured concepts before budget hits the account. Ship, measure, refine, scale.",
        icon: "△",
      },
    ],
    bentoLayout: "grid-a",
  },
  {
    tag: "Operations",
    title: "Operations & Growth",
    titleHtml: `Built for <em>operators</em>, not slide designers`,
    subtitle: "Operational excellence",
    items: [
      {
        heading: "Inventory that protects your brand",
        body: "Spans digital shelves, warehouses, and physical stores with NinjaVan delivery visibility baked in.",
        icon: "▣",
      },
      {
        heading: "Physical retail, first-class",
        body: "Analytics, orders, SKU, staff, discounts — reported with the same seriousness as your online channels.",
        icon: "⬡",
      },
      {
        heading: "Affiliates that scale transparently",
        body: "When everyone sees the same truth, you spend less time negotiating reality and more time recruiting winners.",
        icon: "◇",
      },
    ],
    bentoLayout: "grid-b",
  },
  {
    tag: "Culture",
    title: "Accountability & Trust",
    titleHtml: `Accountability that builds <em>trust</em>`,
    subtitle: "A stronger culture",
    items: [
      {
        heading: "An honest record",
        body: "User Activity gives you a clear timeline — who did what, when — so reviews and investigations aren't built on memory.",
        icon: "◉",
      },
      {
        heading: "Branches that coach",
        body: "Compare performance across revenue, traffic, and staff. 'Good store / bad store' becomes actionable coaching.",
        icon: "⬢",
      },
      {
        heading: "One place to run it all",
        body: "See the whole picture, ask sharper questions, move faster, and protect the brand you're building every day.",
        icon: "✦",
      },
    ],
    bentoLayout: "grid-a",
  },
]

/* ─── Bento card component ─── */
function BentoCard({
  item,
  size = "normal",
  delay = 0,
  isVisible,
}: {
  item: SectionItem
  size?: "normal" | "wide" | "tall"
  delay?: number
  isVisible: boolean
}) {
  const sizeClasses =
    size === "wide"
      ? "md:col-span-2"
      : size === "tall"
        ? "md:row-span-2"
        : ""

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-500 hover:border-purple-500/30 hover:bg-white/[0.05] ${sizeClasses}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s cubic-bezier(.4,0,.2,1) ${delay}s, transform 0.7s cubic-bezier(.4,0,.2,1) ${delay}s, border-color 0.3s, background-color 0.3s`,
      }}
    >
      {/* Hover glow */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(167,139,250,0.06), transparent 60%)",
        }}
      />
      {/* Icon */}
      <div
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-lg"
        style={{
          background: "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(232,121,249,0.1))",
          color: "#c084fc",
        }}
      >
        {item.icon}
      </div>
      <h3 className="mb-2 text-[16px] font-semibold text-white">{item.heading}</h3>
      <p className="text-[13.5px] leading-relaxed text-white/45">{item.body}</p>

      {/* Bottom accent line on hover */}
      <div
        className="absolute bottom-0 left-6 right-6 h-px scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{
          background: "linear-gradient(90deg, transparent, #a78bfa, #e879f9, transparent)",
        }}
      />
    </div>
  )
}

/* ─── Bento grid layouts ─── */
function BentoGridA({ items, isVisible }: { items: SectionItem[]; isVisible: boolean }) {
  return (
    <div className="grid w-full max-w-[560px] grid-cols-1 gap-4 md:grid-cols-2">
      <BentoCard item={items[0]} size="wide" delay={0.1} isVisible={isVisible} />
      <BentoCard item={items[1]} delay={0.25} isVisible={isVisible} />
      <BentoCard item={items[2]} delay={0.35} isVisible={isVisible} />
    </div>
  )
}

function BentoGridB({ items, isVisible }: { items: SectionItem[]; isVisible: boolean }) {
  return (
    <div className="grid w-full max-w-[560px] grid-cols-1 gap-4 md:grid-cols-2">
      <BentoCard item={items[0]} delay={0.1} isVisible={isVisible} />
      <BentoCard item={items[1]} size="tall" delay={0.2} isVisible={isVisible} />
      <BentoCard item={items[2]} delay={0.35} isVisible={isVisible} />
    </div>
  )
}

/* ─── Main page ─── */
export default function WhyChooseUsPage() {
  const [active, setActive] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [slideVisible, setSlideVisible] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const lastScrollTime = useRef(0)

  useEffect(() => {
    const prev = document.title
    document.title = "Why Choose Us | Pulse"
    return () => {
      document.title = prev
    }
  }, [])

  const goTo = useCallback(
    (next: number) => {
      if (isAnimating || next < 0 || next >= SECTIONS.length) return
      const now = Date.now()
      if (now - lastScrollTime.current < 1000) return
      lastScrollTime.current = now

      setIsAnimating(true)
      setSlideVisible(false)

      // After exit animation, swap slide and enter
      setTimeout(() => {
        setActive(next)
        // Brief pause then reveal
        requestAnimationFrame(() => {
          setTimeout(() => {
            setSlideVisible(true)
            setIsAnimating(false)
          }, 80)
        })
      }, 550)
    },
    [active, isAnimating],
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (Math.abs(e.deltaY) < 20) return
      goTo(e.deltaY > 0 ? active + 1 : active - 1)
    }

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
    }
    const onTouchEnd = (e: TouchEvent) => {
      const dy = touchStartY.current - e.changedTouches[0].clientY
      if (Math.abs(dy) > 50) goTo(dy > 0 ? active + 1 : active - 1)
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault()
        goTo(active + 1)
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault()
        goTo(active - 1)
      }
    }

    el.addEventListener("wheel", onWheel, { passive: false })
    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchend", onTouchEnd, { passive: true })
    window.addEventListener("keydown", onKey)
    return () => {
      el.removeEventListener("wheel", onWheel)
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("keydown", onKey)
    }
  }, [active, goTo])

  const section = SECTIONS[active]

  const emGradientOpen =
    '<em style="font-style:italic;display:inline-block;padding:0.06em 0.14em 0.02em 0.08em;margin:0 -0.06em;box-decoration-break:clone;-webkit-box-decoration-break:clone;background:linear-gradient(135deg,#a78bfa,#e879f9);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">'

  return (
    <div className="font-dm-sans w-full text-white">
      <LandingNavBar />

      <div
        ref={containerRef}
        className="relative z-0 flex h-dvh w-full flex-col overflow-x-clip overflow-y-hidden"
        tabIndex={0}
        style={{ outline: "none" }}
      >
        {/* Only page background: bg1.avif (same treatment as home hero) */}
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          aria-hidden
        >
          <img
            src={BACKGROUND_AVIF}
            srcSet={BG_IMAGE_SRCSET}
            sizes="100vw"
            alt=""
            decoding="async"
            fetchPriority="high"
            className="h-full min-h-full w-full object-cover object-center opacity-50"
          />
        </div>

        {/* ─── Slide content ─── */}
        <div
          className="relative z-10 flex flex-1 items-center justify-center overflow-visible px-6 pt-20 md:px-12"
          style={{
            opacity: slideVisible ? 1 : 0,
            transform: slideVisible ? "translateX(0)" : "translateX(-80px)",
            transition:
              "opacity 0.55s cubic-bezier(.4,0,.2,1), transform 0.6s cubic-bezier(.4,0,.2,1)",
          }}
        >
          {section.bentoLayout === "hero" ? (
            /* ── HERO ── */
            <div className="flex max-w-3xl flex-col items-center text-center">
              <p
                className="mb-3 text-base font-normal tracking-wider text-white/30"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Pulse
              </p>
              <h1
                className="px-1 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.12] tracking-tight text-white sm:px-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
                dangerouslySetInnerHTML={{
                  __html: section.titleHtml.replace(/<em>/g, emGradientOpen),
                }}
              />
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/45">
                One workspace for revenue, campaigns, inventory, and AI that
                turns noise into next actions — built for operators who outgrow
                spreadsheets.
              </p>

              {/* Mini bento preview */}
              <div className="mt-12 grid w-full max-w-lg grid-cols-3 gap-3">
                {["Sales & Channels", "AI Intelligence", "Operations"].map(
                  (label, i) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-center backdrop-blur-sm transition-colors hover:border-purple-500/20"
                      style={{
                        opacity: slideVisible ? 1 : 0,
                        transform: slideVisible
                          ? "translateY(0)"
                          : "translateY(20px)",
                        transition: `opacity 0.6s ease ${0.3 + i * 0.12}s, transform 0.6s ease ${0.3 + i * 0.12}s`,
                      }}
                    >
                      <div
                        className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg text-sm"
                        style={{
                          background: `linear-gradient(135deg, ${["rgba(167,139,250,0.2)", "rgba(232,121,249,0.2)", "rgba(129,140,248,0.2)"][i]}, transparent)`,
                          color: ["#a78bfa", "#e879f9", "#818cf8"][i],
                        }}
                      >
                        {["◎", "◈", "▣"][i]}
                      </div>
                      <span className="text-xs font-medium text-white/50">
                        {label}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          ) : (
            /* ── CONTENT SLIDES ── */
            <div className="flex w-full max-w-5xl flex-col items-center gap-10 md:flex-row md:items-center md:gap-16">
              {/* Left: text */}
              <div className="flex-1 text-center md:text-left">
                <p
                  className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-purple-400/60"
                  style={{
                    opacity: slideVisible ? 1 : 0,
                    transition: "opacity 0.5s ease 0.1s",
                  }}
                >
                  {section.subtitle}
                </p>
                <h2
                  className="mb-2 px-0.5 text-[clamp(1.6rem,3.5vw,2.5rem)] font-bold leading-[1.12] text-white sm:px-1"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    opacity: slideVisible ? 1 : 0,
                    transform: slideVisible
                      ? "translateY(0)"
                      : "translateY(16px)",
                    transition:
                      "opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: section.titleHtml.replace(/<em>/g, emGradientOpen),
                  }}
                />
              </div>

              {/* Right: bento grid */}
              <div className="w-full flex-shrink-0 md:w-auto">
                {section.bentoLayout === "grid-a" ? (
                  <BentoGridA
                    items={section.items}
                    isVisible={slideVisible}
                  />
                ) : (
                  <BentoGridB
                    items={section.items}
                    isVisible={slideVisible}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Scroll hint */}
        {active < SECTIONS.length - 1 && (
          <div
            className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1"
            style={{
              opacity: slideVisible ? 0.3 : 0,
              transition: "opacity 0.6s ease 0.8s",
            }}
          >
            <span className="text-[11px] uppercase tracking-[0.12em] text-white/40">
              Scroll
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="animate-bounce"
            >
              <path
                d="M3 5L7 9L11 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="text-white/30"
              />
            </svg>
          </div>
        )}

        {/* CTA on last slide */}
        {active === SECTIONS.length - 1 && slideVisible && (
          <div
            className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2"
            style={{
              opacity: slideVisible ? 1 : 0,
              transform: slideVisible
                ? "translateY(0) translateX(-50%)"
                : "translateY(16px) translateX(-50%)",
              transition: "opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s",
            }}
          >
            <button
              className="rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #d946ef)",
                boxShadow: "0 8px 32px rgba(124,58,237,0.3)",
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 12px 40px rgba(124,58,237,0.5)"
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 8px 32px rgba(124,58,237,0.3)"
              }}
            >
              Get Started with Pulse
            </button>
          </div>
        )}
      </div>

    </div>
  )
}