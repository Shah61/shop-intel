import { useEffect, useState, useRef, useCallback } from "react"

import { LandingNavBar } from "../components/landing/LandingNavBar"
import Footer from "./Footer"

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

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

type BillingMode = "monthly" | "annually" | "purchase"

interface Plan {
  tier: string
  name: string
  description: string
  monthly: string
  annually: string
  purchase: string
  popular?: boolean
  features: string[]
}

const PLANS: Plan[] = [
  {
    tier: "A",
    name: "Basic",
    description: "Best for growing brands getting started.",
    monthly: "XXXXXX",
    annually: "XXXXXX",
    purchase: "XXXXXX",
    features: [
      "Sales View & Overview Dashboard",
      "Inventory Management",
      "Personnel Marketing",
      "Facebook Marketing Integration",
      "TikTok Shop Integration",
      "Shopee Integration",
      "Other Marketplace Connections",
      "Marketing Campaign Tools",
    ],
  },
  {
    tier: "B",
    name: "Intermediate",
    description: "Best for scaling businesses.",
    monthly: "XXXXXX",
    annually: "XXXXXX",
    purchase: "XXXXXX",
    popular: true,
    features: [
      "All Basic Plan features",
      "Affiliate Management",
      "Affiliate Payouts & Commissions",
      "Advanced Reporting & Analytics",
      "Customizable Dashboards",
      "Priority Support",
      "Unlimited Users",
    ],
  },
  {
    tier: "C",
    name: "Premium",
    description: "Full power for enterprise operators.",
    monthly: "XXXXXX",
    annually: "XXXXXX",
    purchase: "XXXXXX",
    features: [
      "All Intermediate features",
      "AI Intelligence & Assistant",
      "Trends & Competitor Analysis",
      "Customer Service Insights",
      "Physical Retail Analytics",
      "Physical Store Management",
      "Branch Performance Tracking",
      "AI Storyboard",
    ],
  },
]

interface ComparisonSection {
  title: string
  rows: {
    feature: string
    basic: boolean | string
    intermediate: boolean | string
    premium: boolean | string
  }[]
}

const COMPARISON: ComparisonSection[] = [
  {
    title: "KEY DETAILS",
    rows: [
      { feature: "Monthly Fee", basic: "XXXXXX", intermediate: "XXXXXX", premium: "XXXXXX" },
      { feature: "Annual Fee", basic: "XXXXXX", intermediate: "XXXXXX", premium: "XXXXXX" },
      { feature: "One-Time Purchase", basic: "XXXXXX", intermediate: "XXXXXX", premium: "XXXXXX" },
    ],
  },
  {
    title: "SALES & CHANNELS",
    rows: [
      { feature: "Sales View & Overview", basic: true, intermediate: true, premium: true },
      { feature: "TikTok Shop Integration", basic: true, intermediate: true, premium: true },
      { feature: "Shopee Integration", basic: true, intermediate: true, premium: true },
      { feature: "Shopify / WooCommerce", basic: true, intermediate: true, premium: true },
      { feature: "Other Marketplace Connections", basic: true, intermediate: true, premium: true },
    ],
  },
  {
    title: "MARKETING",
    rows: [
      { feature: "Personnel Marketing", basic: true, intermediate: true, premium: true },
      { feature: "Facebook Marketing", basic: true, intermediate: true, premium: true },
      { feature: "Marketing Campaign Tools", basic: true, intermediate: true, premium: true },
      { feature: "AI Storyboard", basic: false, intermediate: false, premium: true },
    ],
  },
  {
    title: "OPERATIONS",
    rows: [
      { feature: "Inventory Management", basic: true, intermediate: true, premium: true },
      { feature: "NinjaVan Delivery Visibility", basic: true, intermediate: true, premium: true },
      { feature: "Affiliate Management", basic: false, intermediate: true, premium: true },
      { feature: "Affiliate Payouts & Commissions", basic: false, intermediate: true, premium: true },
    ],
  },
  {
    title: "INTELLIGENCE",
    rows: [
      { feature: "AI Assistant", basic: false, intermediate: false, premium: true },
      { feature: "Trends & Analysis", basic: false, intermediate: false, premium: true },
      { feature: "Competitor Tracking", basic: false, intermediate: false, premium: true },
      { feature: "Customer Service Insights", basic: false, intermediate: false, premium: true },
    ],
  },
  {
    title: "PHYSICAL RETAIL & BRANCHES",
    rows: [
      { feature: "Physical Store Analytics", basic: false, intermediate: false, premium: true },
      { feature: "Store Products & Categories", basic: false, intermediate: false, premium: true },
      { feature: "Store Orders & Collections", basic: false, intermediate: false, premium: true },
      { feature: "Store Staff & Discounts", basic: false, intermediate: false, premium: true },
      { feature: "Branch Performance Tracking", basic: false, intermediate: false, premium: true },
    ],
  },
  {
    title: "PLATFORM & SUPPORT",
    rows: [
      { feature: "Customizable Dashboards", basic: false, intermediate: true, premium: true },
      { feature: "Advanced Reporting", basic: false, intermediate: true, premium: true },
      { feature: "User Activity Logs", basic: true, intermediate: true, premium: true },
      { feature: "Unlimited Users", basic: false, intermediate: true, premium: true },
      { feature: "Priority Support", basic: false, intermediate: true, premium: true },
      { feature: "Dedicated Account Manager", basic: false, intermediate: false, premium: true },
    ],
  },
]

/* ═══════════════════════════════════════════
   ANIMATION HOOKS
   ═══════════════════════════════════════════ */

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, visible }
}

function useMouseGlow() {
  const ref = useRef<HTMLDivElement>(null)
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--glow-x", `${e.clientX - rect.left}px`)
    el.style.setProperty("--glow-y", `${e.clientY - rect.top}px`)
  }, [])
  return { ref, onMouseMove }
}

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════ */

function AnimatedCheck({ visible, delay }: { visible: boolean; delay: number }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mx-auto">
      <path
        d="M5 10.5L8.5 14L15 7"
        stroke="#a78bfa"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="20"
        strokeDashoffset={visible ? 0 : 20}
        style={{ transition: `stroke-dashoffset 0.5s cubic-bezier(.4,0,.2,1) ${delay}s` }}
      />
    </svg>
  )
}

function CellValue({ value, visible, delay }: { value: boolean | string; visible: boolean; delay: number }) {
  if (typeof value === "string") {
    return (
      <span
        className="text-sm font-medium text-white/80"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: `opacity 0.4s ease ${delay}s, transform 0.4s ease ${delay}s`,
        }}
      >
        {value}
      </span>
    )
  }
  if (value) return <AnimatedCheck visible={visible} delay={delay} />
  return (
    <span className="text-white/10" style={{ opacity: visible ? 1 : 0, transition: `opacity 0.3s ease ${delay}s` }}>
      —
    </span>
  )
}

/* ─── Pricing card ─── */
function PricingCard({
  plan,
  billing,
  index,
  cardsVisible,
}: {
  plan: Plan
  billing: BillingMode
  index: number
  cardsVisible: boolean
}) {
  const price = billing === "monthly" ? plan.monthly : billing === "annually" ? plan.annually : plan.purchase
  const period = billing === "monthly" ? "/month" : billing === "annually" ? "/year" : " one-time"
  const { ref: glowRef, onMouseMove } = useMouseGlow()
  const d = 0.15 + index * 0.18 // base delay

  return (
    <div
      ref={glowRef}
      onMouseMove={onMouseMove}
      className="group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-500 hover:scale-[1.03]"
      style={{
        background: plan.popular
          ? "linear-gradient(180deg, rgba(124,58,237,0.15) 0%, rgba(10,8,21,0.95) 50%)"
          : "rgba(255,255,255,0.02)",
        borderColor: plan.popular ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.06)",
        opacity: cardsVisible ? 1 : 0,
        transform: cardsVisible ? "translateY(0) scale(1)" : "translateY(56px) scale(0.95)",
        transition: `opacity 0.8s cubic-bezier(.22,1,.36,1) ${d}s, transform 0.9s cubic-bezier(.22,1,.36,1) ${d}s, border-color 0.3s, box-shadow 0.3s`,
        willChange: "transform, opacity",
      }}
    >
      {/* Mouse glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "radial-gradient(350px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(167,139,250,0.07), transparent 60%)",
        }}
      />

      {/* Popular glow line */}
      {plan.popular && (
        <div
          className="pointer-events-none absolute -top-px left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, #a78bfa, #e879f9, #a78bfa, transparent)",
            opacity: cardsVisible ? 1 : 0,
            transform: cardsVisible ? "scaleX(1)" : "scaleX(0)",
            transition: `opacity 0.5s ease ${d + 0.5}s, transform 0.7s cubic-bezier(.22,1,.36,1) ${d + 0.4}s`,
          }}
        />
      )}

      <div className="relative px-7 pb-6 pt-7">
        {plan.popular && (
          <span
            className="mb-4 inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
            style={{
              background: "linear-gradient(135deg, rgba(167,139,250,0.2), rgba(232,121,249,0.15))",
              color: "#c084fc",
              border: "1px solid rgba(167,139,250,0.2)",
              opacity: cardsVisible ? 1 : 0,
              transform: cardsVisible ? "translateY(0) scale(1)" : "translateY(8px) scale(0.9)",
              transition: `opacity 0.5s ease ${d + 0.3}s, transform 0.5s cubic-bezier(.34,1.56,.64,1) ${d + 0.3}s`,
            }}
          >
            Most Popular
          </span>
        )}

        <div>
          <h3
            className="text-xl font-bold text-white"
            style={{
              opacity: cardsVisible ? 1 : 0,
              transform: cardsVisible ? "translateX(0)" : "translateX(-16px)",
              transition: `opacity 0.5s ease ${d + 0.15}s, transform 0.5s ease ${d + 0.15}s`,
            }}
          >
            {plan.name} Plan
          </h3>
          <p
            className="mt-1 text-sm text-white/40"
            style={{ opacity: cardsVisible ? 1 : 0, transition: `opacity 0.5s ease ${d + 0.25}s` }}
          >
            {plan.description}
          </p>
        </div>

        <div className="mt-6 flex items-baseline gap-1">
          <span
            className="text-4xl font-bold tracking-tight"
            style={{
              color: plan.popular ? "#fff" : "#e2e0ea",
              opacity: cardsVisible ? 1 : 0,
              transform: cardsVisible ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.6s ease ${d + 0.3}s, transform 0.7s cubic-bezier(.22,1,.36,1) ${d + 0.3}s`,
            }}
          >
            {price}
          </span>
          <span
            className="text-sm font-normal italic text-white/35"
            style={{ opacity: cardsVisible ? 1 : 0, transition: `opacity 0.5s ease ${d + 0.45}s` }}
          >
            {period}
          </span>
        </div>
      </div>

      {/* Divider draw-in */}
      <div className="mx-7 h-px overflow-hidden">
        <div
          className="h-full"
          style={{
            background: "rgba(255,255,255,0.06)",
            transform: cardsVisible ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "left",
            transition: `transform 0.7s cubic-bezier(.22,1,.36,1) ${d + 0.4}s`,
          }}
        />
      </div>

      {/* Features cascade */}
      <div className="flex flex-1 flex-col px-7 pb-7 pt-5">
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50"
          style={{ opacity: cardsVisible ? 1 : 0, transition: `opacity 0.4s ease ${d + 0.4}s` }}
        >
          Includes:
        </p>
        <ul className="flex flex-col gap-2.5">
          {plan.features.map((f, fi) => {
            const fD = d + 0.45 + fi * 0.06
            return (
              <li
                key={f}
                className="flex items-start gap-2.5"
                style={{
                  opacity: cardsVisible ? 1 : 0,
                  transform: cardsVisible ? "translateX(0)" : "translateX(-14px)",
                  transition: `opacity 0.4s ease ${fD}s, transform 0.4s ease ${fD}s`,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mt-0.5 flex-shrink-0">
                  <circle
                    cx="9" cy="9" r="8" stroke="#a78bfa" strokeWidth="1" opacity="0.4"
                    strokeDasharray="50.3"
                    strokeDashoffset={cardsVisible ? 0 : 50.3}
                    style={{ transition: `stroke-dashoffset 0.7s ease ${fD}s` }}
                  />
                  <path
                    d="M5.5 9.5L7.5 11.5L12.5 6.5"
                    stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray="14"
                    strokeDashoffset={cardsVisible ? 0 : 14}
                    style={{ transition: `stroke-dashoffset 0.4s ease ${fD + 0.18}s` }}
                  />
                </svg>
                <span className="text-[13.5px] leading-snug text-white/55">{f}</span>
              </li>
            )
          })}
        </ul>

        <div className="mt-auto pt-6">
          <button
            className="w-full rounded-xl py-3 text-sm font-semibold transition-all duration-300 hover:scale-[1.03]"
            style={{
              background: plan.popular ? "linear-gradient(135deg, #7c3aed, #d946ef)" : "rgba(255,255,255,0.05)",
              color: plan.popular ? "#fff" : "rgba(255,255,255,0.7)",
              border: plan.popular ? "none" : "1px solid rgba(255,255,255,0.08)",
              boxShadow: plan.popular ? "0 8px 32px rgba(124,58,237,0.3)" : "none",
              opacity: cardsVisible ? 1 : 0,
              transform: cardsVisible ? "translateY(0)" : "translateY(12px)",
              transition: `opacity 0.5s ease ${d + 0.8}s, transform 0.5s ease ${d + 0.8}s, box-shadow 0.3s`,
            }}
            onMouseEnter={(e) => {
              if (plan.popular) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 40px rgba(124,58,237,0.5)"
            }}
            onMouseLeave={(e) => {
              if (plan.popular) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(124,58,237,0.3)"
            }}
          >
            Request a Demo →
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Comparison block with row-by-row reveal ─── */
function ComparisonBlock({ section }: { section: ComparisonSection }) {
  const { ref, visible } = useReveal(0.08)

  return (
    <div ref={ref} className="mb-1">
      <div
        className="grid grid-cols-4 gap-0 rounded-t-lg px-6 py-3"
        style={{
          background: "rgba(167,139,250,0.04)",
          borderLeft: "2px solid rgba(167,139,250,0.2)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : "translateX(-24px)",
          transition: "opacity 0.55s cubic-bezier(.22,1,.36,1), transform 0.55s cubic-bezier(.22,1,.36,1)",
        }}
      >
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">
          {section.title}
        </span>
        <span />
        <span />
        <span />
      </div>

      {section.rows.map((row, ri) => {
        const rD = 0.1 + ri * 0.08
        return (
          <div
            key={row.feature}
            className="grid grid-cols-4 items-center gap-0 px-6 py-3.5 transition-colors duration-200 hover:bg-white/[0.02]"
            style={{
              borderBottom: ri < section.rows.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(14px)",
              transition: `opacity 0.5s ease ${rD}s, transform 0.5s ease ${rD}s`,
            }}
          >
            <span className="text-sm text-white/50">{row.feature}</span>
            <div className="text-center">
              <CellValue value={row.basic} visible={visible} delay={rD + 0.06} />
            </div>
            <div className="text-center">
              <CellValue value={row.intermediate} visible={visible} delay={rD + 0.12} />
            </div>
            <div className="text-center">
              <CellValue value={row.premium} visible={visible} delay={rD + 0.18} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingMode>("monthly")

  const [heroVisible, setHeroVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 150)
    return () => clearTimeout(t)
  }, [])

  const { ref: cardsRef, visible: cardsVisible } = useReveal(0.1)
  const { ref: compareHeadRef, visible: compareHeadVisible } = useReveal(0.2)
  const { ref: colHeaderRef, visible: colHeaderVisible } = useReveal(0.12)

  useEffect(() => {
    const prev = document.title
    document.title = "Pricing | ShopIntel"
    return () => { document.title = prev }
  }, [])

  return (
    <div className="font-dm-sans w-full bg-[#0a0815] text-white">
      <LandingNavBar />

      {/* ═══ HERO ═══ */}
      <div className="relative z-0 flex w-full flex-col items-center overflow-hidden pb-24 pt-32 md:pt-40">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
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

        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          {/* Badge */}
          <span
            className="mb-6 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em]"
            style={{
              border: "1px solid rgba(167,139,250,0.25)",
              color: "#a78bfa",
              background: "rgba(167,139,250,0.06)",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0) scale(1)" : "translateY(-14px) scale(0.9)",
              transition: "opacity 0.7s cubic-bezier(.22,1,.36,1) 0.1s, transform 0.7s cubic-bezier(.22,1,.36,1) 0.1s",
            }}
          >
            Pricing
          </span>

          {/* Title */}
          <h1
            className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight tracking-tight text-white"
            style={{
              fontFamily: "'Playfair Display', serif",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.8s cubic-bezier(.22,1,.36,1) 0.25s, transform 0.8s cubic-bezier(.22,1,.36,1) 0.25s",
            }}
          >
            Explore Our{" "}
            <em
              className="not-italic"
              style={{
                background: "linear-gradient(135deg, #a78bfa, #e879f9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontStyle: "italic",
              }}
            >
              Pricing Plans.
            </em>
          </h1>

          {/* Subtitle */}
          <p
            className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/40"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(18px)",
              transition: "opacity 0.7s ease 0.5s, transform 0.7s ease 0.5s",
            }}
          >
            Choose the plan that fits your scale. Subscribe monthly, commit annually, or purchase outright.
          </p>

          {/* Billing toggle */}
          <div
            className="mt-8 inline-flex items-center rounded-full p-1"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0) scale(1)" : "translateY(14px) scale(0.95)",
              transition: "opacity 0.6s ease 0.65s, transform 0.6s cubic-bezier(.22,1,.36,1) 0.65s",
            }}
          >
            {(["monthly", "annually", "purchase"] as BillingMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setBilling(mode)}
                className="relative rounded-full px-5 py-2 text-sm font-medium capitalize transition-all duration-300"
                style={{
                  background: billing === mode ? "linear-gradient(135deg, #7c3aed, #9333ea)" : "transparent",
                  color: billing === mode ? "#fff" : "rgba(255,255,255,0.45)",
                  boxShadow: billing === mode ? "0 4px 16px rgba(124,58,237,0.3)" : "none",
                }}
              >
                {mode === "purchase" ? "One-Time" : mode}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ PLAN CARDS ═══ */}
        <div
          ref={cardsRef}
          className="relative z-10 mx-auto mt-14 grid w-full max-w-5xl grid-cols-1 gap-5 px-6 md:grid-cols-3"
        >
          {PLANS.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} billing={billing} index={i} cardsVisible={cardsVisible} />
          ))}
        </div>
      </div>

      {/* ═══ COMPARISON TABLE ═══ */}
      <div className="relative px-6 pb-32 pt-16">
        <div className="mx-auto max-w-5xl">
          <h2
            ref={compareHeadRef}
            className="mb-16 text-center text-[clamp(1.6rem,4vw,2.8rem)] font-bold leading-tight text-white"
            style={{
              fontFamily: "'Playfair Display', serif",
              opacity: compareHeadVisible ? 1 : 0,
              transform: compareHeadVisible ? "translateY(0)" : "translateY(32px)",
              transition: "opacity 0.8s cubic-bezier(.22,1,.36,1), transform 0.8s cubic-bezier(.22,1,.36,1)",
            }}
          >
            Compare Our{" "}
            <em
              className="not-italic"
              style={{
                background: "linear-gradient(135deg, #a78bfa, #e879f9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontStyle: "italic",
              }}
            >
              Plans & Features
            </em>
          </h2>

          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Column headers */}
              <div
                ref={colHeaderRef}
                className="sticky top-0 z-20 mb-2 grid grid-cols-4 items-end gap-0 rounded-xl px-6 pb-4 pt-5"
                style={{ background: "rgba(10,8,21,0.95)", backdropFilter: "blur(12px)" }}
              >
                <div />
                {PLANS.map((plan, pi) => (
                  <div
                    key={plan.name}
                    className="text-center"
                    style={{
                      opacity: colHeaderVisible ? 1 : 0,
                      transform: colHeaderVisible ? "translateY(0)" : "translateY(18px)",
                      transition: `opacity 0.6s ease ${0.1 + pi * 0.14}s, transform 0.6s cubic-bezier(.22,1,.36,1) ${0.1 + pi * 0.14}s`,
                    }}
                  >
                    <h3 className="text-base font-bold text-white">{plan.name} Plan</h3>
                    <p className="mt-0.5 text-xs text-white/35">{plan.description}</p>
                    <button className="mt-3 text-sm font-medium transition-colors hover:text-purple-300" style={{ color: "#a78bfa" }}>
                      Request a Demo →
                    </button>
                  </div>
                ))}
              </div>

              {COMPARISON.map((section) => (
                <ComparisonBlock key={section.title} section={section} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}