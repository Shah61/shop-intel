"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

import { HEADER_LOGO_DELAY_MS, HEADER_NAV_LINK_DELAYS_MS } from "./constants/landing-motion"
import { NAV_LINKS } from "./constants/landing" 

const SCROLL_SHRINK_PX = 24

const ROUTE_MAP: Record<string, string> = {
  "Our Features": "/home/features",
  "Why Pulse": "/home/why-choose-us",
  Pricing: "/home/pricing",
}

export function LandingHeader() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [compact, setCompact] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > SCROLL_SHRINK_PX)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileMenuOpen])

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileMenuOpen(false) }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  function renderLink(link: string, i: number, isMobile = false) {
    const baseClass = isMobile
      ? "text-[18px] font-medium transition-colors duration-200 text-white/80 hover:text-white active:text-white"
      : `landing-header-in cursor-pointer text-[14px] font-normal transition-colors duration-200 sm:text-[15px] ${
          hoveredLink === link ? "text-white/95" : "text-white/70 hover:text-white/85"
        }`
    const style = isMobile ? {} : { animationDelay: `${HEADER_NAV_LINK_DELAYS_MS[i]}ms` }
    const onClick = isMobile ? () => setMobileMenuOpen(false) : undefined

    const href = ROUTE_MAP[link]
    if (href) {
      return (
        <Link key={link} href={href} onMouseEnter={() => setHoveredLink(link)} onMouseLeave={() => setHoveredLink(null)} className={baseClass} style={style} onClick={onClick}>
          {link}
        </Link>
      )
    }
    return (
      <a key={link} href="#" onMouseEnter={() => setHoveredLink(link)} onMouseLeave={() => setHoveredLink(null)} className={baseClass} style={style} onClick={onClick}>
        {link}
      </a>
    )
  }

  return (
    <>
      <nav className="fixed top-0 right-0 left-0 z-50 flex w-full justify-center px-3 pt-3 pb-2 sm:px-4 sm:pt-5 sm:pb-3">
        <div
          className={`flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-xl transition-[max-width] duration-300 ease-out sm:gap-6 sm:px-7 sm:py-3 md:gap-10 md:px-12 md:py-3.5 ${
            compact
              ? "max-w-[min(42rem,calc(100%-1rem))] sm:max-w-3xl"
              : "max-w-[min(73.6rem,calc(100%-1rem))] md:max-w-[min(73.6rem,calc(100%-2rem))]"
          }`}
        >
          <div
            className="landing-header-in shrink-0 bg-gradient-to-br from-violet-400 via-fuchsia-400 to-pink-300 bg-clip-text text-[20px] font-bold tracking-[6px] text-transparent uppercase sm:text-[24px] md:text-[28px]"
            style={{ fontFamily: "'DM Sans', monospace", animationDelay: `${HEADER_LOGO_DELAY_MS}ms` }}
          >
            Pulse
          </div>

          <div className="ml-auto hidden gap-5 md:flex md:gap-8">
            {NAV_LINKS.map((link, i) => renderLink(link, i))}
          </div>

          <button className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10 md:hidden" onClick={() => setMobileMenuOpen((v) => !v)} aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}>
            <div className="relative flex h-5 w-5 flex-col items-center justify-center">
              <span className={`absolute h-[1.5px] w-5 rounded-full bg-white/80 transition-all duration-300 ${mobileMenuOpen ? "rotate-45" : "-translate-y-[5px]"}`} />
              <span className={`absolute h-[1.5px] w-5 rounded-full bg-white/80 transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : "opacity-100"}`} />
              <span className={`absolute h-[1.5px] w-5 rounded-full bg-white/80 transition-all duration-300 ${mobileMenuOpen ? "-rotate-45" : "translate-y-[5px]"}`} />
            </div>
          </button>
        </div>
      </nav>

      <div className={`fixed inset-0 z-40 flex flex-col bg-[#0a0815]/95 backdrop-blur-2xl transition-all duration-300 md:hidden ${mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}>
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          {NAV_LINKS.map((link, i) => renderLink(link, i, true))}
        </div>
      </div>
    </>
  )
}