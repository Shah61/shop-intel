"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

import { NAV_LINKS } from "./constants/landing"

const HEADER_LOGO_DELAY_MS = 100
const HEADER_NAV_LINK_DELAYS_MS = [200, 260, 320] as const
const DEMO_BUTTON_DELAY_MS = 400
const SCROLL_SHRINK_PX = 24

const ROUTE_MAP: Record<string, string> = {
  "Our Features": "/home/features",
  "Why Pulse": "/home/why-choose-us",
  Pricing: "/home/pricing",
}

export function LandingNavBar() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [compact, setCompact] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [demoHovered, setDemoHovered] = useState(false)

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > SCROLL_SHRINK_PX)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false) }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    window.addEventListener("scroll", close, { once: true, passive: true })
    return () => window.removeEventListener("scroll", close)
  }, [menuOpen])

  return (
    <>
      {/* Shimmer keyframes */}
      <style>{`
        @keyframes demo-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes demo-glow-pulse {
          0%, 100% { box-shadow: 0 0 12px rgba(167,139,250,0.3), 0 0 24px rgba(232,121,249,0.15); }
          50% { box-shadow: 0 0 20px rgba(167,139,250,0.5), 0 0 40px rgba(232,121,249,0.25); }
        }
      `}</style>

      <nav className="fixed top-0 right-0 left-0 z-50 flex w-full justify-center px-3 pt-3 pb-2 md:px-4 md:pt-5 md:pb-3">
        <div
          className={`flex w-full items-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-2.5 backdrop-blur-2xl transition-[max-width,background-color] duration-300 ease-out md:gap-10 md:px-12 md:py-3.5 ${
            compact
              ? "max-w-[min(42rem,calc(100%-1rem))] bg-white/[0.06] md:max-w-3xl"
              : "max-w-[min(73.6rem,calc(100%-1rem))] md:max-w-[min(73.6rem,calc(100%-2rem))]"
          }`}
        >
          <Link
            href="/home"
            className="landing-header-in shrink-0 bg-gradient-to-br from-violet-400 via-fuchsia-400 to-pink-300 bg-clip-text text-[20px] font-bold tracking-[5px] text-transparent uppercase sm:text-[22px] md:text-[28px] md:tracking-[6px]"
            style={{ fontFamily: "'DM Sans', monospace", animationDelay: `${HEADER_LOGO_DELAY_MS}ms` }}
          >
            Pulse
          </Link>

          {/* Desktop nav links */}
          <div className="ml-auto hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link, i) => {
              const cls = `landing-header-in cursor-pointer text-[15px] font-normal transition-colors duration-200 ${
                hoveredLink === link ? "text-white/95" : "text-white/70 hover:text-white/85"
              }`
              const style = { animationDelay: `${HEADER_NAV_LINK_DELAYS_MS[i] ?? 200}ms` }
              const href = ROUTE_MAP[link]
              if (href) {
                return (
                  <Link key={link} href={href} onMouseEnter={() => setHoveredLink(link)} onMouseLeave={() => setHoveredLink(null)} className={cls} style={style}>
                    {link}
                  </Link>
                )
              }
              return (
                <a key={link} href="#" onMouseEnter={() => setHoveredLink(link)} onMouseLeave={() => setHoveredLink(null)} className={cls} style={style}>
                  {link}
                </a>
              )
            })}

            {/* Demo Button */}
            <Link
              href="/sign-in"
              className={`relative overflow-hidden rounded-full px-6 py-2 text-[13px] font-semibold text-white transition-all duration-300 ${demoHovered ? "demo-btn-hover" : ""}`}
              style={{
                animationName: "landing-header-in",
                animationDuration: "0.55s",
                animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                animationFillMode: "forwards",
                animationDelay: `${DEMO_BUTTON_DELAY_MS}ms`,
                opacity: 0,
                background: demoHovered
                  ? "linear-gradient(135deg, #8b5cf6, #d946ef, #8b5cf6)"
                  : "linear-gradient(135deg, #7c3aed, #c026d3)",
                backgroundSize: demoHovered ? "200% auto" : "100% auto",
                boxShadow: demoHovered
                  ? "0 0 20px rgba(167,139,250,0.5), 0 0 40px rgba(232,121,249,0.25)"
                  : "0 4px 16px rgba(124,58,237,0.3)",
                transform: demoHovered ? "scale(1.05)" : "scale(1)",
              }}
              
              
              onMouseEnter={() => setDemoHovered(true)}
              onMouseLeave={() => setDemoHovered(false)}
            >
              {/* Shine sweep */}
              <span
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.2) 55%, transparent 65%)",
                  backgroundSize: "250% 100%",
                  animation: demoHovered ? "demo-shimmer 1.2s ease-in-out infinite" : "none",
                  opacity: demoHovered ? 1 : 0,
                  transition: "opacity 0.3s ease",
                }}
              />
              <span className="relative z-10 flex items-center gap-1.5">
                Demo
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform duration-300" style={{ transform: demoHovered ? "translateX(2px)" : "translateX(0)" }}>
                  <path d="M5.5 3L9.5 7L5.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Hamburger */}
          <button className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl transition-colors active:bg-white/10 md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label={menuOpen ? "Close menu" : "Open menu"}>
            <div className="relative flex h-[18px] w-[22px] flex-col justify-between">
              <span className={`block h-[1.5px] w-full origin-center rounded-full bg-white/80 transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${menuOpen ? "translate-y-[8px] rotate-45" : ""}`} />
              <span className={`block h-[1.5px] w-full rounded-full bg-white/80 transition-all duration-200 ${menuOpen ? "scale-x-0 opacity-0" : "opacity-100"}`} />
              <span className={`block h-[1.5px] w-full origin-center rounded-full bg-white/80 transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${menuOpen ? "-translate-y-[8px] -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-40 transition-all duration-300 md:hidden ${menuOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"}`}>
        <div className={`absolute inset-0 bg-[#0a0815]/90 backdrop-blur-2xl transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setMenuOpen(false)} />
        <div className="relative flex h-full flex-col items-center justify-center gap-10">
          {NAV_LINKS.map((link, i) => {
            const href = ROUTE_MAP[link]
            const cls = "text-[20px] font-medium tracking-wide transition-all duration-300 text-white/75 active:text-white hover:text-white"
            const style = { transitionDelay: menuOpen ? `${80 + i * 50}ms` : "0ms", opacity: menuOpen ? 1 : 0, transform: menuOpen ? "translateY(0)" : "translateY(12px)" }
            if (href) {
              return <Link key={link} href={href} className={cls} style={style} onClick={() => setMenuOpen(false)}>{link}</Link>
            }
            return <a key={link} href="#" className={cls} style={style} onClick={() => setMenuOpen(false)}>{link}</a>
          })}

          {/* Mobile Demo Button */}
          <Link
            href="/sign-in"
            className="mt-2 rounded-full px-8 py-3 text-[16px] font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #c026d3)",
              boxShadow: "0 8px 32px rgba(124,58,237,0.4)",
              transitionDelay: menuOpen ? `${80 + NAV_LINKS.length * 50}ms` : "0ms",
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? "translateY(0)" : "translateY(12px)",
              transition: "all 0.3s ease",
            }}
            onClick={() => setMenuOpen(false)}
          >
            Demo →
          </Link>
        </div>
      </div>
    </>
  )
}