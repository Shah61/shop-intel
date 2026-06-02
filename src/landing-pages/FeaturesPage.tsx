import { useEffect } from "react"

import FeaturesOrbitalHero from "../components/features/FeaturesOrbitalHero"
import { LandingNavBar } from "../components/landing/LandingNavBar"
import AdsFeaturesScrollStack from "../components/features/AdsFeaturesScrollStack"

import FAQSection from "./FaqSection"
import Footer from "./Footer"

function publicImage(path: string) {
  const base = "/"
  const root = base.endsWith("/") ? base : `${base}/`
  return `${root}${path.replace(/^\/+/, "")}`
}

/** Same asset + treatment as home / Why Choose Us hero. */
const BACKGROUND_AVIF = publicImage("images/bg1.avif")
const BG_IMAGE_SRCSET = [
  `${BACKGROUND_AVIF} 512w`,
  `${BACKGROUND_AVIF} 1024w`,
  `${BACKGROUND_AVIF} 1440w`,
].join(", ")

const FEATURE_IMG = {
  sales: publicImage("images/features/Sales.png"),
  marketing: publicImage("images/features/Marketing.png"),
  intelligence: publicImage("images/features/Intelligence.png"),
  inventory: publicImage("images/features/Inventory.png"),
  physical: publicImage("images/features/Physical.png"),
  affiliates: publicImage("images/features/Affiliates.png"),
  userActivity: publicImage("images/features/User-Activity.png"),
  branches: publicImage("images/features/Branches.png"),
} as const

export default function FeaturesPage() {
  useEffect(() => {
    const prev = document.title
    document.title = "Our Features | Pulse"
    return () => {
      document.title = prev
    }
  }, [])

  useEffect(() => {
    const scrollToFaq = () => {
      if (window.location.hash !== "#faq") return
      const el = document.getElementById("faq")
      if (!el) return
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    scrollToFaq()
    window.addEventListener("hashchange", scrollToFaq)
    return () => window.removeEventListener("hashchange", scrollToFaq)
  }, [])

  const sections = [
    {
      title: "Sales",
      description:
        "Your revenue story shouldn't live in five different tabs and ten spreadsheets. Pulse pulls TikTok, Shopee, Shopify, WooCommerce, and your Overview into one command center—so you see momentum, drag, and opportunity in the same breath.",
      image: FEATURE_IMG.sales,
      livesInside: [
        "Unified Revenue Engine — TikTok, Shopee, Shopify, WooCommerce, and more—every sales channel in one command center.",
        "Channel Intelligence — Instantly understand which platforms, products, and campaigns are driving real revenue.",
        "Conversion Insights — Go beyond orders—see what actually influences buying decisions and repeat purchases.",
      ],
      aiDoes: [
        'Turns noisy charts into a plain-English exec brief (“what moved, why it matters, what to do Monday”).',
        "Spots anomalies—a channel softening, a SKU stalling—before they show up in your bank account.",
        'Helps you compare narratives across platforms (“Shopee is discount-led; Shopify is bundle-led”) so strategy isn’t vibes.',
        "Drafts investor- or partner-ready summaries from your latest numbers.",
      ],
    },
    {
      title: "Marketing",
      description:
        "Marketing isn't more assets—it's clarity: who you're talking to, what you're testing, and what to ship next. This module is built for operators who want creative velocity and accountability.",
      image: FEATURE_IMG.marketing,
      livesInside: [
        "Multi-Channel Marketing — Facebook, TikTok, Shopee Ads, and beyond—track performance across every acquisition channel.",
        "Campaign Intelligence — Know what’s running, what’s working, and where budget is being wasted—without switching tabs.",
        "Creative System — Plan, test, and scale ad creatives with structured workflows and AI-powered storyboarding.",
      ],
      aiDoes: [
        "Storyboards concepts—hooks, scenes, captions, and CTA options—so you're not staring at a blank canvas.",
        "Generates copy variants for tests (angles, tones, lengths) tuned to your product and promo.",
        'Proposes creative matrices: “winning claim × offer × format” so A/B tests feel intentional, not random.',
        "Summarizes what to kill, keep, or scale from performance language (not just metrics).",
      ],
    },
    {
      title: "Intelligence",
      description:
        "This is where Pulse stops being a dashboard and starts being a thinking partner—research, analysis, service, and competitive pressure… in one brain that never sleeps.",
      image: FEATURE_IMG.intelligence,
      livesInside: [
        "AI Assistant — Ask anything about your business and get answers grounded in your real data—not generic advice.",
        "Market Intelligence — Track trends, competitors, and opportunities before they become obvious.",
        "Deep Analysis — Understand the “why” behind your numbers—drivers, risks, and growth levers.",
        "Customer Signals — Feedback, sentiment, and support insights unified into one clear view.",
      ],
      aiDoes: [
        "Answers in natural language with traceable logic—briefs, checklists, and next steps.",
        'Builds trend memos (“here’s the pattern, here’s the risk, here’s the play”).',
        "Produces analysis packs: hypotheses, supporting evidence, and what would falsify them.",
        "Drafts competitive battlecards—messaging, counterpoints, and differentiation angles.",
        "Helps CS teams with reply scaffolding, tone control, and consistent policy-safe wording.",
      ],
    },
    {
      title: "Inventory",
      description:
        'Stock is trust. This module makes sure digital shelves, warehouses, and fulfillment reality don’t disagree—because nothing erodes LTV faster than “sorry, actually we’re out.”',
      image: FEATURE_IMG.inventory,
      livesInside: [
        "Unified Inventory System — Sync stock across warehouse, retail, and online channels in real time.",
        "Fulfillment Visibility — Track deliveries, logistics, and order movement across providers like NinjaVan.",
        "Stock Intelligence — Know what’s running low, overstocked, or at risk—before it affects revenue.",
      ],
      aiDoes: [
        "Explains stock risk in human terms—what will stock out first, what's falsely “safe,” and why.",
        'Turns logs into stories (“this SKU destabilized after promo X”) for ops reviews.',
        "Suggests replenishment narratives tied to lead times, seasonality, and channel demand.",
        "Flags fulfillment friction patterns from delivery data before CS hears about them.",
      ],
    },
    {
      title: "Physical",
      description:
        'Your stores aren’t “offline Shopify.” They’re a parallel engine—catalog, collections, discounts, staff, SKU reality, and orders—that deserves the same precision as your ads.',
      image: FEATURE_IMG.physical,
      livesInside: [
        "Retail Analytics — Store performance with the same clarity and depth as your online channels.",
        "Merchandising System — Products, categories, and collections organized around how customers actually shop.",
        "Operational Control — Orders, discounts, staff, and SKU-level data—all in one unified retail system.",
      ],
      aiDoes: [
        'Writes store manager briefs: priorities, risks, and “do this today” actions.',
        "Surfaces assortment insights—what to push front-of-store, what to retire quietly.",
        "Helps design promo logic that protects margin (not just top-line spikes).",
        "Drafts SOP-friendly summaries for staff huddles and training.",
      ],
    },
    {
      title: "Affiliates",
      description:
        "Partnerships scale when the program is transparent, fast to pay, and impossible to game. This is the control room for people who sell for you.",
      image: FEATURE_IMG.affiliates,
      livesInside: [
        "Affiliate Management — Track partners, performance, and contribution to your revenue.",
        "Commission Engine — Flexible, transparent rules that scale with your program.",
        "Payout System — Fast, accurate payouts without manual tracking or disputes.",
      ],
      aiDoes: [
        "Explains partner performance like a GM would: who to nurture, who to retrain, who to sunset.",
        "Drafts partner comms: activation nudges, promo kits, and policy reminders in the right tone.",
        "Surfaces commission edge cases before they become disputes.",
        "Proposes incentive experiments that reward behavior you actually want repeated.",
      ],
    },
    {
      title: "User Activity",
      description:
        "Behavior is the raw signal of product-market fit. This surface turns clicks, sessions, and admin actions into accountability—who did what, when, and what it implies.",
      image: FEATURE_IMG.userActivity,
      livesInside: [
        "Activity Intelligence — Track every action across your team and users with a clear, searchable timeline.",
        "Operational Visibility — Know who did what, when, and how it impacts your business.",
        "Behavior Insights — Identify patterns, friction points, and opportunities from real user activity.",
      ],
      aiDoes: [
        'Summarizes “what changed this week” across users and actions—perfect for leadership standups.',
        'Helps investigate incidents with plain-language timelines (“here’s the sequence, here’s the likely root”).',
        "Drafts compliance-friendly notes for audits without sounding robotic.",
        "Suggests where friction hides based on repeated patterns (not single outliers).",
      ],
    },
    {
      title: "Branches",
      description:
        "Multi-location brands don't fail from lack of data—they fail from uneven interpretation. This module makes every branch legible on a map and in the numbers: revenue, traffic, people, and comparison.",
      image: FEATURE_IMG.branches,
      livesInside: [
        "Multi-Location Overview — Monitor performance across all branches from a single dashboard.",
        "Revenue & Traffic Insights — Understand how each location performs and why.",
        "Branch Comparison — Benchmark locations to identify leaders, gaps, and opportunities for growth.",
      ],
      aiDoes: [
        'Produces regional playbooks: “Branch A wins on conversion; Branch B wins on traffic—here’s the swap lesson.”',
        "Writes manager coaching notes grounded in their branch's actual metrics.",
        "Explains map + KPI combos so expansion decisions aren't gut-only.",
        "Drafts HQ-to-field communications that feel specific, not corporate spam.",
      ],
    },
  ]

  return (
    <div className="font-dm-sans w-full bg-[#0a0815] text-white">
      <LandingNavBar />

      {/* Full-viewport bg (matches home hero) behind Discover / orbital hero */}
      <div className="relative z-0 flex min-h-dvh w-full flex-col pt-[5.25rem] md:pt-24">
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
        <FeaturesOrbitalHero className="relative z-10 min-h-0 flex-1" />
      </div>

      <AdsFeaturesScrollStack sections={sections} />

      <FAQSection workDoneBackdrop />

      <Footer />
    </div>
  )
}