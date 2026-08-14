"use client"

/*
 * Shop Intel Agent — Claude-style agentic AI workspace (dummy).
 * Left: conversation with visible agentic steps (Thinking…, web searches,
 * data reads, analysis) and streaming answers.
 * Right: Artifacts panel that opens when the agent produces a deliverable.
 * Special ability: "walk me through the personal marketing module" launches
 * a spotlight guided tour of the Personal Marketing Hub.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTheme } from "next-themes"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceDot,
} from "recharts"
import {
    Sparkles, Send, Globe, Database, BarChart3, Compass, Check, Plus,
    FileText, X, Copy, Download, PanelRightClose, Lightbulb, Search,
    ArrowUpRight, Zap, Map, Terminal, AlertTriangle, Mail, Package,
    CheckCircle2, Radar, ListChecks, ShieldCheck, MousePointerClick, type LucideIcon,
} from "lucide-react"
import { useAgentTour } from "@/src/core/shared/view/components/agent-tour"

/* ─────────────────────────── Types ─────────────────────────── */

type StepIcon = "think" | "search" | "read" | "chart" | "nav" | "scan"

interface AgentStep {
    icon: StepIcon
    label: string
    detail?: string
    sources?: string[]
    duration: number
}

interface Artifact {
    id: string
    title: string
    subtitle: string
    kind: "report" | "chart" | "table" | "dashboard" | "email"
    markdown?: string
}

interface PlanItem {
    label: string
    stepIndex: number
}

interface Scenario {
    steps: AgentStep[]
    response: string
    artifact?: Artifact
    action?: "start-marketing-tour" | "start-campaign-demo"
    plan?: PlanItem[]
}

interface RunStep {
    step: AgentStep
    status: "pending" | "running" | "done"
}

interface Msg {
    id: number
    role: "user" | "assistant"
    text: string
    steps: RunStep[]
    plan?: (PlanItem & { done: boolean })[]
    artifactId?: string
    streaming: boolean
}

interface UIT {
    pageBg: string; border: string; panel: string; text: string; sub: string; faint: string
    userBubble: string; inputBg: string; stepBg: string; chip: string; artifactBg: string
    codeBg: string; shadow: string
}

/* ─────────────────────────── Dummy scenarios ─────────────────────────── */

const CHART_DATA = [
    { m: "Feb", spend: 3200, revenue: 9800 },
    { m: "Mar", spend: 4100, revenue: 12400 },
    { m: "Apr", spend: 3800, revenue: 11900 },
    { m: "May", spend: 5200, revenue: 16800 },
    { m: "Jun", spend: 4900, revenue: 18200 },
    { m: "Jul", spend: 5600, revenue: 21500 },
]

/* Inventory autopilot — PO draft rows */
const REORDER_ROWS = [
    { sku: "GLW-SRM-30", name: "Glow Serum 30ml", stock: 14, cover: "3 days", qty: 240, cost: 2880, status: "CRITICAL", why: "Sales velocity +38% after TikTok live · stockout projected Jul 13" },
    { sku: "HYD-MST-50", name: "Hydra Mist 50ml", stock: 42, cover: "6 days", qty: 180, cost: 1620, status: "LOW", why: "Below 7-day safety cover · supplier lead time is 5 days" },
    { sku: "CLN-FOAM-100", name: "Clean Foam 100ml", stock: 66, cover: "9 days", qty: 120, cost: 960, status: "LOW", why: "Raya bundle dependency · demand forecast +22%" },
    { sku: "NGT-CRM-50", name: "Night Cream 50ml", stock: 210, cover: "31 days", qty: 0, cost: 0, status: "OK", why: "Healthy cover · no action needed" },
] as const

/* Store health monitor */
const SPEND_14D = [
    { d: "27", v: 178 }, { d: "28", v: 165 }, { d: "29", v: 182 }, { d: "30", v: 171 },
    { d: "01", v: 190 }, { d: "02", v: 176 }, { d: "03", v: 185 }, { d: "04", v: 168 },
    { d: "05", v: 179 }, { d: "06", v: 188 }, { d: "07", v: 174 }, { d: "08", v: 181 },
    { d: "09", v: 186 }, { d: "10", v: 412 },
]
const MONITOR_KPIS = [
    { l: "Today's Ad Spend", v: "RM412", delta: "+142%", bad: true, spark: [150, 160, 155, 170, 165, 180, 175, 168, 172, 180, 190, 178, 412], c: "#ef4444" },
    { l: "Blended ROAS", v: "2.1×", delta: "−38%", bad: true, spark: [3.4, 3.5, 3.3, 3.6, 3.4, 3.5, 3.2, 3.4, 3.3, 3.1, 3.0, 2.8, 2.1], c: "#f59e0b" },
    { l: "CTR", v: "1.9%", delta: "+0.2pp", bad: false, spark: [1.6, 1.7, 1.65, 1.7, 1.75, 1.7, 1.8, 1.75, 1.8, 1.85, 1.8, 1.85, 1.9], c: "#10b981" },
    { l: "Orders (24h)", v: "63", delta: "+8%", bad: false, spark: [48, 52, 50, 55, 53, 58, 54, 57, 56, 60, 58, 61, 63], c: "#10b981" },
]
const ANOMALY_CHECKS = [
    { t: "09:41", label: "Facebook spend vs 30-day baseline", status: "FLAGGED", why: "+142% deviation — campaign “Glow Retarget” budget cap was removed at 09:12", conf: "92%" },
    { t: "09:41", label: "TikTok spend vs baseline", status: "PASS", why: "Within ±1.2σ of expected range", conf: "99%" },
    { t: "09:40", label: "Checkout conversion rate", status: "PASS", why: "3.1% — stable vs last week", conf: "97%" },
    { t: "09:40", label: "Inventory sync latency", status: "WATCH", why: "Shopee sync 14 min behind — auto-retry scheduled", conf: "81%" },
]

/* Email studio variants */
const EMAIL_VARIANTS = [
    {
        id: "A", openRate: "41%", subject: "Your skin called — it wants the Glow Restart ✨",
        preheader: "21 days to your best skin. Bundle inside.",
        headline: "Restart your glow in 21 days",
        body: "Real customers. Real skin. Real results in three weeks. The Glow Restart bundle pairs our best-selling serum with the routine 12,000+ customers swear by — and this week it ships free.",
        cta: "Claim my bundle",
    },
    {
        id: "B", openRate: "37%", subject: "3 weeks. No filter. Watch what happens.",
        preheader: "The transformation everyone's posting about.",
        headline: "The 21-day transformation",
        body: "You've seen the before-and-afters all over TikTok. Now it's your turn. The Glow Restart bundle gives you the exact routine — serum, mist and foam — at 20% off for launch week only.",
        cta: "Start my 21 days",
    },
    {
        id: "C", openRate: "33%", subject: "We saved you a Glow Restart bundle, Aisyah",
        preheader: "Reserved for 48 hours. Free shipping applied.",
        headline: "Your bundle is reserved",
        body: "As one of our earliest customers, you get first access to the Glow Restart bundle before it goes public — with free express shipping already applied at checkout.",
        cta: "Unlock early access",
    },
]

const scenarios = {
    tour: {
        steps: [
            { icon: "think", label: "Thinking", detail: "Understanding what you want to learn", duration: 1600 },
            { icon: "read", label: "Scanning workspace modules", detail: "sales · intelligence · marketing · inventory", duration: 1200 },
            { icon: "nav", label: "Found Personal Marketing Hub", detail: "/marketing · campaign manager", duration: 1000 },
            { icon: "chart", label: "Building guided tour", detail: "5 stops · heading, KPIs, spend chart, velocity, actions", duration: 1400 },
        ],
        response:
            "Perfect — let's do a **guided walkthrough of the Personal Marketing Hub**.\n\nI'll take you to the page and spotlight each section one at a time:\n\n1. **The hub itself** — what it's for\n2. **Summary cards** — your spend & campaign KPIs at a glance\n3. **Spend Overview** — how spending moves over time\n4. **Spend Velocity** — your daily / weekly / monthly burn rate\n5. **New Campaign** — where you create your next campaign\n\nYou can ask me questions at any stop. Taking you there now…",
        action: "start-marketing-tour",
    } as Scenario,

    sales: {
        steps: [
            { icon: "think", label: "Thinking", detail: "Breaking the question into data pulls", duration: 1500 },
            { icon: "read", label: "Reading sales data", detail: "TikTok, Shopee, Shopify, WooCommerce · last 90 days", duration: 1600 },
            { icon: "chart", label: "Analyzing 1,284 orders", detail: "Aggregating spend vs revenue by month", duration: 1700 },
            { icon: "search", label: "Searching the web", detail: '"malaysia e-commerce benchmark ROAS 2026"', sources: ["statista.com", "similarweb.com", "techinasia.com"], duration: 1900 },
        ],
        response:
            "Here's what stands out from your last 6 months:\n\n- **Revenue is up 119%** (RM9.8K → RM21.5K/month) while ad spend only grew 75% — your efficiency is improving.\n- **ROAS climbed from 3.1× to 3.8×**, comfortably above the ~2.9× Malaysian e-commerce benchmark I found.\n- **May–Jul acceleration** lines up with your TikTok campaign push; Shopee stayed flat.\n\nI've put the full snapshot in the artifact on the right, including the spend-vs-revenue trend.",
        artifact: {
            id: "sales-snapshot",
            title: "Cross-Platform Sales Snapshot",
            subtitle: "Spend vs revenue · Feb – Jul 2026",
            kind: "chart",
        },
    } as Scenario,

    research: {
        steps: [
            { icon: "think", label: "Thinking", detail: "Planning a competitor research pass", duration: 1500 },
            { icon: "search", label: "Searching the web", detail: '"malaysia skincare D2C brands pricing 2026"', sources: ["shopee.com.my", "zalora.com.my", "vogue.sg"], duration: 2000 },
            { icon: "search", label: "Searching the web", detail: '"tiktok shop beauty top sellers MY"', sources: ["tiktok.com", "similarweb.com"], duration: 1700 },
            { icon: "chart", label: "Synthesizing findings", detail: "Comparing 4 competitors across price, promo cadence, channels", duration: 1600 },
        ],
        response:
            "Done — I researched the competitive landscape and compiled a brief.\n\n**Headline findings:**\n\n- Your closest competitor runs **flash promos every 11 days** on average; you run roughly one a month.\n- Category price band is **RM39–RM89**; your hero SKU sits right at the median, so you have headroom for a premium line.\n- Two of four competitors now push **>60% of content to TikTok Shop** — matching where your own growth is coming from.\n\nThe full brief with per-competitor breakdowns is in the artifact panel.",
        artifact: {
            id: "competitor-brief",
            title: "Competitor & Market Brief",
            subtitle: "4 competitors · pricing, promos, channels",
            kind: "report",
            markdown: `## Competitor & Market Brief

**Scope:** Malaysian skincare D2C · compiled ${"July 2026"}

---

### 1. Pricing landscape

| Brand | Hero SKU | Price | Promo cadence |
|---|---|---|---|
| GlowLab MY | Serum 30ml | RM59 | every 11 days |
| Seri Ayu | Moisturizer | RM45 | every 18 days |
| DermaKita | Cleanser set | RM89 | monthly |
| **You** | Serum 30ml | **RM55** | monthly |

### 2. Channel mix
- TikTok Shop is now the **primary discovery channel** for 2 of 4 competitors.
- Shopee remains the volume channel, but growth has flattened category-wide.
- Only DermaKita invests meaningfully in YouTube long-form.

### 3. Opportunities
1. **Increase promo cadence** to bi-weekly to match category rhythm.
2. **Launch a premium tier** (RM79–89) — you're under-priced vs. perceived quality.
3. **Double down on TikTok live** — competitors average 3 lives/week vs. your 1.

### 4. Risks
- GlowLab's aggressive couponing may compress category margins in Q4.
- Watch for Raya-season inventory battles starting late Q1.`,
        },
    } as Scenario,

    campaign: {
        steps: [
            { icon: "think", label: "Thinking", detail: "Sketching campaign angles from your data", duration: 1600 },
            { icon: "read", label: "Reading marketing history", detail: "Top performers · best hooks · spend efficiency", duration: 1500 },
            { icon: "search", label: "Searching the web", detail: '"beauty campaign trends malaysia Q3 2026"', sources: ["thedrum.com", "marketing-interactive.com"], duration: 1800 },
        ],
        response:
            "I drafted a campaign brief built around what already works for you — your best-performing content was **short UGC-style testimonial clips**, so the concept leans into that.\n\nKey numbers I'd commit to:\n\n- **Budget:** RM4,500 over 21 days\n- **Primary channel:** TikTok (60%), supporting on Instagram Reels (25%) and Facebook (15%)\n- **Target:** 3.5× ROAS based on your trailing performance\n\nFull brief with hooks, timeline and creative checklist is in the artifact.",
        artifact: {
            id: "campaign-brief",
            title: "Glow Restart — Campaign Brief",
            subtitle: "21-day multi-channel launch plan",
            kind: "report",
            markdown: `## Campaign Brief — "Glow Restart"

**Duration:** 21 days · **Budget:** RM4,500 · **Goal:** 3.5× ROAS

---

### Concept
Real customers, real skin, 15-second transformations. UGC-style testimonial clips cut for TikTok-first distribution.

### Channel plan
| Channel | Budget | Format |
|---|---|---|
| TikTok | RM2,700 | Spark Ads on 6 UGC clips |
| Instagram | RM1,125 | Reels + Stories retargeting |
| Facebook | RM675 | Lookalike conversion campaign |

### Hooks to test
1. "I almost gave up on my skin until…"
2. "POV: your skincare finally works"
3. "3 weeks. No filter. Watch."

### Timeline
- **Days 1–3:** Soft launch, RM80/day, gather signal
- **Days 4–14:** Scale winners to RM250/day
- **Days 15–21:** Retargeting push + bundle offer

### Creative checklist
- [ ] 6 UGC clips (15s, vertical, captions burned in)
- [ ] 3 static carousel variants
- [ ] Landing page A/B: bundle vs. single SKU`,
        },
    } as Scenario,

    autopilot: {
        plan: [
            { label: "Pull your best-performing settings", stepIndex: 0 },
            { label: "Plan the campaign draft", stepIndex: 1 },
            { label: "Take the wheel — fill the form live, you approve", stepIndex: 2 },
        ],
        steps: [
            { icon: "read", label: "Pulling winning settings", detail: "June top performer · TikTok Spark Ads · 3.8× ROAS", duration: 1500 },
            { icon: "think", label: "Thinking", detail: "Sizing budget and flight length from your history", duration: 1600 },
            { icon: "nav", label: "Engaging autopilot", detail: "Requesting UI control · campaign builder", duration: 1300 },
        ],
        response:
            "Watch this — I'll build the campaign **right in the UI, live**. You'll see my cursor:\n\n1. Open the **Personal Marketing Hub** and click **New Campaign**\n2. Type the campaign name, first item, budget and flight length — using your best-performing June settings\n3. Write the description and **hand control back to you**\n\nI'll fill everything but I **never press Create myself** — the final click is always yours. You can hit *Take over* at any moment. Engaging autopilot now…",
        action: "start-campaign-demo",
    } as Scenario,

    inventory: {
        plan: [
            { label: "Scan all SKUs across warehouses", stepIndex: 0 },
            { label: "Compute days-of-cover per SKU", stepIndex: 1 },
            { label: "Flag stockout risks", stepIndex: 2 },
            { label: "Draft purchase order for approval", stepIndex: 3 },
        ],
        steps: [
            { icon: "scan", label: "Running stock scan", detail: "342 SKUs · 3 warehouses · KL, Penang, JB", duration: 1700 },
            { icon: "chart", label: "Computing days-of-cover", detail: "Velocity-weighted over trailing 28 days", duration: 1600 },
            { icon: "think", label: "Thinking", detail: "Cross-checking supplier lead times against stockout dates", duration: 1500 },
            { icon: "read", label: "Drafting purchase order", detail: "3 SKUs flagged · RM5,460 estimated", duration: 1400 },
        ],
        response:
            "Autopilot check complete — **3 of 342 SKUs need action**.\n\n- **Glow Serum 30ml is critical**: 3 days of cover left and your TikTok live pushed velocity up 38%. With a 5-day supplier lead time, you'd stock out before replenishment lands.\n- **Hydra Mist** and **Clean Foam** are both below safety cover, and Clean Foam is a dependency of the Raya bundle.\n\nI've drafted the purchase order with suggested quantities and my reasoning for each line. **I won't send anything without your approval** — review and approve it in the artifact panel.",
        artifact: {
            id: "reorder-plan",
            title: "Reorder Plan — PO Draft",
            subtitle: "3 SKUs flagged · awaiting your approval",
            kind: "table",
        },
    } as Scenario,

    anomaly: {
        steps: [
            { icon: "scan", label: "Sweeping live metrics", detail: "Spend, ROAS, CTR, orders, sync health · all platforms", duration: 1700 },
            { icon: "chart", label: "Comparing against baselines", detail: "30-day rolling window · seasonality adjusted", duration: 1700 },
            { icon: "think", label: "Thinking", detail: "Isolating the driver behind the deviation", duration: 1600 },
        ],
        response:
            "I ran a full sweep — **one anomaly needs your attention** (92% confidence):\n\n- **Facebook ad spend spiked +142%** against your 30-day baseline. I traced it to the *Glow Retarget* campaign — its **budget cap was removed at 09:12** this morning, and ROAS has dropped to 2.1× as spend outran conversions.\n- Everything else passed: TikTok spend, checkout conversion and order volume are all within normal range. Shopee inventory sync is 14 minutes behind, but I've scheduled an auto-retry.\n\nThe full monitor is in the artifact — every check includes *why* it passed or was flagged, with my confidence on each.",
        artifact: {
            id: "store-health",
            title: "Store Health Monitor",
            subtitle: "Live sweep · 09:41 today · 1 flag, 1 watch",
            kind: "dashboard",
        },
    } as Scenario,

    email: {
        steps: [
            { icon: "think", label: "Thinking", detail: "Choosing an angle from your best-selling bundle", duration: 1500 },
            { icon: "read", label: "Reading customer segments", detail: "2,340 subscribers · 3 segments by recency", duration: 1400 },
            { icon: "search", label: "Searching the web", detail: '"email subject line benchmarks beauty 2026"', sources: ["mailchimp.com", "klaviyo.com"], duration: 1800 },
        ],
        response:
            "Drafted! I wrote the **Glow Restart launch email** and rendered a live preview — with **3 subject line variants**, each with a predicted open rate based on your list's history and industry benchmarks:\n\n- **A — playful** (predicted 41% open): leans on your brand voice, strongest for your engaged segment\n- **B — social proof** (37%): rides the TikTok transformation angle\n- **C — personalized scarcity** (33%): best for win-back, feels exclusive\n\nFlip between variants in the artifact panel. My recommendation: **send A to engaged, C to lapsed** — split sends beat single-subject blasts on your list by ~9% historically.",
        artifact: {
            id: "email-creative",
            title: "Glow Restart — Launch Email",
            subtitle: "Rendered preview · 3 variants",
            kind: "email",
        },
    } as Scenario,

    fallback: {
        steps: [
            { icon: "think", label: "Thinking", detail: "Working out the best way to help", duration: 1700 },
            { icon: "read", label: "Checking your workspace", detail: "Recent sales, campaigns and inventory signals", duration: 1400 },
        ],
        response:
            "Happy to dig into that. As your agentic assistant I can plan multi-step work on my own — a few things I'm good at:\n\n- **Guided tours** — try *\"walk me through the Personal Marketing module\"* and I'll explain every section live on screen.\n- **Autopilot** — say *\"run an inventory autopilot check\"* and I'll scan stock and draft a purchase order for your approval.\n- **Monitoring** — ask me to *\"monitor my store for anomalies\"* for a live sweep with a decision log.\n- **Analysis** — ask about your *sales performance* for a chart artifact.\n- **Creation** — ask for a *campaign brief* or a *launch email* with rendered A/B/C variants.\n- **Research** — ask me to *research competitors* and I'll compile a brief from web searches.\n\nWhat would you like to start with?",
    } as Scenario,
}

function pickScenario(input: string): Scenario {
    const q = input.toLowerCase()
    if (/(walk|tour|guide|take me|show me|explain|teach).*(marketing)|marketing.*(module|hub|tour|walk)/.test(q)) return scenarios.tour
    if (/(create|set ?up|build|make|launch|add|do).*(campaign)/.test(q) && !/brief|idea/.test(q)) return scenarios.autopilot
    if (/(inventor|stock|restock|reorder|supply|autopilot|purchase order)/.test(q)) return scenarios.inventory
    if (/(anomal|spike|alert|monitor|watch|unusual|health)/.test(q)) return scenarios.anomaly
    if (/(email|newsletter|edm|subject line|mailer)/.test(q)) return scenarios.email
    if (/(sale|revenue|tiktok|shopee|shopify|performance|roas)/.test(q)) return scenarios.sales
    if (/(competitor|research|market|trend|pricing|price)/.test(q)) return scenarios.research
    if (/(campaign|content|idea|creative|ad|brief|promo)/.test(q)) return scenarios.campaign
    return scenarios.fallback
}

/* ─────────────────────────── Small pieces ─────────────────────────── */

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const STEP_ICONS: Record<StepIcon, React.ReactNode> = {
    think: <Sparkles size={12} />,
    search: <Globe size={12} />,
    read: <Database size={12} />,
    chart: <BarChart3 size={12} />,
    nav: <Compass size={12} />,
    scan: <Terminal size={12} />,
}

const ARTIFACT_ICONS: Record<Artifact["kind"], LucideIcon> = {
    chart: BarChart3,
    report: FileText,
    table: Package,
    dashboard: Radar,
    email: Mail,
}

const SUGGESTIONS = [
    { icon: <Map size={15} />, title: "Walk me through the Personal Marketing module", sub: "Live guided tour with spotlight" },
    { icon: <MousePointerClick size={15} />, title: "Create a campaign for me", sub: "Autopilot — watch the AI drive the UI" },
    { icon: <Package size={15} />, title: "Run an inventory autopilot check", sub: "Mission plan → PO draft for your approval" },
    { icon: <Radar size={15} />, title: "Monitor my store for anomalies", sub: "Live sweep · decision log · confidence" },
    { icon: <BarChart3 size={15} />, title: "Analyze my sales performance", sub: "Cross-platform, last 6 months" },
    { icon: <Mail size={15} />, title: "Write my launch email", sub: "Rendered preview · A/B/C variants" },
    { icon: <Search size={15} />, title: "Research my competitors' pricing", sub: "Web research → compiled brief" },
]

const artifactSource = (a: Artifact): string => {
    switch (a.kind) {
        case "chart": return JSON.stringify({ artifact: a.id, generated_by: "shop-intel-agent", data: CHART_DATA }, null, 2)
        case "table": return JSON.stringify({ artifact: a.id, generated_by: "shop-intel-agent", requires_approval: true, po_draft: REORDER_ROWS }, null, 2)
        case "dashboard": return JSON.stringify({ artifact: a.id, generated_by: "shop-intel-agent", series: SPEND_14D, checks: ANOMALY_CHECKS }, null, 2)
        case "email": return JSON.stringify({ artifact: a.id, generated_by: "shop-intel-agent", variants: EMAIL_VARIANTS }, null, 2)
        default: return a.markdown || ""
    }
}

/* ─────────────────────────── Sparkline ─────────────────────────── */

const Sparkline: React.FC<{ data: number[]; color: string; w?: number; h?: number }> = ({ data, color, w = 76, h = 26 }) => {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 3 - ((v - min) / range) * (h - 6)}`).join(" ")
    const last = data[data.length - 1]
    return (
        <svg width={w} height={h} style={{ overflow: "visible", flexShrink: 0 }}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
            <circle cx={w} cy={h - 3 - ((last - min) / range) * (h - 6)} r={2.5} fill={color} />
        </svg>
    )
}

/* ─────────────────────────── Reorder table artifact (approval gate) ─────────────────────────── */

const STATUS_COLORS: Record<string, string> = { CRITICAL: "#ef4444", LOW: "#f59e0b", WATCH: "#f59e0b", OK: "#10b981", PASS: "#10b981", FLAGGED: "#ef4444" }

const ReorderTableArtifact: React.FC<{ ui: UIT; isLight: boolean }> = ({ ui, isLight }) => {
    const [selected, setSelected] = useState<Set<string>>(() => new Set(REORDER_ROWS.filter((r) => r.qty > 0).map((r) => r.sku)))
    const [approved, setApproved] = useState(false)
    const total = REORDER_ROWS.filter((r) => selected.has(r.sku)).reduce((s, r) => s + r.cost, 0)

    const toggle = (sku: string, disabled: boolean) => {
        if (approved || disabled) return
        setSelected((s) => {
            const n = new Set(s)
            if (n.has(sku)) n.delete(sku)
            else n.add(sku)
            return n
        })
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {REORDER_ROWS.map((r) => {
                const c = STATUS_COLORS[r.status]
                const disabled = r.qty === 0
                const on = selected.has(r.sku)
                return (
                    <div
                        key={r.sku}
                        onClick={() => toggle(r.sku, disabled)}
                        style={{
                            borderRadius: 13, padding: "13px 15px",
                            border: `1px solid ${on && !disabled ? "rgba(var(--preset-primary-rgb),.4)" : ui.border}`,
                            background: on && !disabled ? "rgba(var(--preset-primary-rgb),.05)" : ui.stepBg,
                            cursor: disabled || approved ? "default" : "pointer",
                            opacity: disabled ? 0.55 : 1,
                            transition: "border-color .2s ease, background .2s ease",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                            {/* Checkbox */}
                            <span
                                style={{
                                    width: 17, height: 17, borderRadius: 5, flexShrink: 0,
                                    border: `1.5px solid ${on && !disabled ? "var(--preset-primary)" : (isLight ? "rgba(15,23,42,.25)" : "rgba(255,255,255,.25)")}`,
                                    background: on && !disabled ? "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))" : "transparent",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "background .15s ease",
                                }}
                            >
                                {on && !disabled && <Check size={11} color="#fff" strokeWidth={3} />}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                                    <span style={{ fontSize: 12.5, fontWeight: 800 }}>{r.name}</span>
                                    <span style={{ fontSize: 9.5, fontFamily: "ui-monospace, Menlo, monospace", color: ui.faint }}>{r.sku}</span>
                                    <span style={{ fontSize: 8.5, fontWeight: 900, padding: "2px 7px", borderRadius: 5, letterSpacing: ".05em", background: `${c}16`, border: `1px solid ${c}44`, color: c }}>
                                        {r.status}
                                    </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 5, marginTop: 5 }}>
                                    <Lightbulb size={10} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 2 }} />
                                    <span style={{ fontSize: 10.5, color: ui.faint, lineHeight: 1.5 }}>{r.why}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <div style={{ fontSize: 10, color: ui.faint }}>{r.stock} in stock · {r.cover}</div>
                                {r.qty > 0 && (
                                    <div style={{ fontSize: 13, fontWeight: 900, color: isLight ? "var(--preset-primary)" : "var(--preset-lighter)", marginTop: 2 }}>
                                        +{r.qty} units · RM{r.cost.toLocaleString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}

            {/* Approval gate */}
            {approved ? (
                <div
                    style={{
                        borderRadius: 14, padding: "18px 16px", textAlign: "center",
                        border: "1px solid rgba(16,185,129,.35)", background: "rgba(16,185,129,.07)",
                        animation: "ag-up .35s ease both",
                    }}
                >
                    <CheckCircle2 size={26} style={{ color: "#10b981", margin: "0 auto 8px" }} />
                    <div style={{ fontSize: 13, fontWeight: 800 }}>Purchase order PO-2607-114 drafted</div>
                    <div style={{ fontSize: 11, color: ui.faint, marginTop: 4, lineHeight: 1.6 }}>
                        Sent to your supplier inbox for confirmation. I'll track delivery and update stock levels automatically when it lands.
                    </div>
                </div>
            ) : (
                <div
                    style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                        padding: "13px 15px", borderRadius: 13, border: `1px solid ${ui.border}`, background: ui.stepBg,
                    }}
                >
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: ui.faint, textTransform: "uppercase", letterSpacing: ".05em" }}>PO total · {selected.size} lines</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: isLight ? "var(--preset-primary)" : "var(--preset-lighter)" }}>RM{total.toLocaleString()}</div>
                    </div>
                    <button
                        onClick={() => selected.size > 0 && setApproved(true)}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px",
                            borderRadius: 11, border: "none", fontFamily: "inherit",
                            background: selected.size > 0 ? "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))" : (isLight ? "rgba(15,23,42,.08)" : "rgba(255,255,255,.08)"),
                            color: selected.size > 0 ? "#fff" : ui.faint,
                            fontSize: 12, fontWeight: 800, cursor: selected.size > 0 ? "pointer" : "default",
                            boxShadow: selected.size > 0 ? "0 4px 16px rgba(var(--preset-primary-rgb),.35)" : "none",
                        }}
                    >
                        <ShieldCheck size={14} />
                        Approve purchase order
                    </button>
                </div>
            )}
        </div>
    )
}

/* ─────────────────────────── Store health dashboard artifact ─────────────────────────── */

const DashboardArtifact: React.FC<{ ui: UIT; isLight: boolean }> = ({ ui, isLight }) => {
    const score = 78
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Alert banner */}
            <div style={{ display: "flex", gap: 11, padding: "13px 15px", borderRadius: 13, border: "1px solid rgba(239,68,68,.35)", background: "rgba(239,68,68,.07)" }}>
                <AlertTriangle size={16} style={{ color: "#ef4444", flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12.5, fontWeight: 800 }}>Spend spike detected — Facebook</span>
                        <span style={{ fontSize: 8.5, fontWeight: 900, padding: "2px 7px", borderRadius: 5, background: "rgba(239,68,68,.15)", border: "1px solid rgba(239,68,68,.4)", color: "#ef4444", letterSpacing: ".05em" }}>HIGH</span>
                        <span style={{ fontSize: 8.5, fontWeight: 900, padding: "2px 7px", borderRadius: 5, background: "rgba(var(--preset-primary-rgb),.12)", border: "1px solid rgba(var(--preset-primary-rgb),.3)", color: isLight ? "var(--preset-primary)" : "var(--preset-lighter)", letterSpacing: ".05em" }}>92% CONFIDENCE</span>
                    </div>
                    <div style={{ fontSize: 11, color: ui.sub, lineHeight: 1.6, marginTop: 5 }}>
                        “Glow Retarget” budget cap removed at 09:12 — spend running +142% vs baseline while ROAS fell to 2.1×.
                    </div>
                    <div style={{ display: "flex", gap: 7, marginTop: 9 }}>
                        <button style={{ padding: "6px 13px", borderRadius: 8, border: "1px solid rgba(239,68,68,.5)", background: "rgba(239,68,68,.12)", color: "#ef4444", fontSize: 10.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                            Pause campaign
                        </button>
                        <button style={{ padding: "6px 13px", borderRadius: 8, border: `1px solid ${ui.border}`, background: ui.chip, color: ui.sub, fontSize: 10.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                            Restore RM180/day cap
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI grid with sparklines */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {MONITOR_KPIS.map((k, i) => (
                    <div key={i} style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${ui.border}`, background: ui.stepBg, animation: `ag-up .4s ease ${i * 0.06}s both` }}>
                        <div style={{ fontSize: 9, fontWeight: 800, color: ui.faint, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>{k.l}</div>
                        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
                            <div>
                                <div style={{ fontSize: 19, fontWeight: 900, lineHeight: 1 }}>{k.v}</div>
                                <div style={{ fontSize: 10, fontWeight: 800, color: k.bad ? "#ef4444" : "#10b981", marginTop: 4 }}>{k.delta} vs baseline</div>
                            </div>
                            <Sparkline data={k.spark} color={k.c} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Gauge + anomaly chart */}
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10 }}>
                <div style={{ padding: "14px 12px", borderRadius: 12, border: `1px solid ${ui.border}`, background: ui.stepBg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <div style={{ position: "relative", width: 84, height: 84 }}>
                        <svg width="84" height="84" viewBox="0 0 84 84">
                            <circle cx="42" cy="42" r="36" fill="none" stroke={isLight ? "rgba(15,23,42,.08)" : "rgba(255,255,255,.08)"} strokeWidth="7" />
                            <circle
                                cx="42" cy="42" r="36" fill="none" stroke="#f59e0b" strokeWidth="7"
                                strokeDasharray={`${(score / 100) * 226} 226`} strokeLinecap="round"
                                transform="rotate(-90 42 42)" style={{ transition: "stroke-dasharray 1s ease" }}
                            />
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 21, fontWeight: 900, color: "#f59e0b", lineHeight: 1 }}>{score}</span>
                            <span style={{ fontSize: 8, fontWeight: 800, color: ui.faint, textTransform: "uppercase", letterSpacing: ".06em" }}>/ 100</span>
                        </div>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", color: ui.faint }}>Store Health</div>
                </div>
                <div style={{ padding: "13px 12px 8px", borderRadius: 12, border: `1px solid ${ui.border}`, background: ui.stepBg }}>
                    <div style={{ fontSize: 11, fontWeight: 800, padding: "0 6px 8px" }}>Daily spend · anomaly marked</div>
                    <div style={{ height: 130 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={SPEND_14D} margin={{ top: 8, right: 12, left: -22, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="agMon" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--preset-primary)" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="var(--preset-primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="2 2" stroke={isLight ? "rgba(15,23,42,.07)" : "rgba(255,255,255,.05)"} vertical={false} />
                                <XAxis dataKey="d" tick={{ fontSize: 9, fill: isLight ? "rgba(15,23,42,.4)" : "rgba(255,255,255,.3)" }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 9, fill: isLight ? "rgba(15,23,42,.4)" : "rgba(255,255,255,.3)" }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: isLight ? "#fff" : "#141c2b", border: `1px solid ${ui.border}`, borderRadius: 10, fontSize: 11 }}
                                    formatter={(v: number) => [`RM${v}`, "Spend"]}
                                />
                                <Area type="monotone" dataKey="v" stroke="var(--preset-primary)" strokeWidth={2} fill="url(#agMon)" />
                                <ReferenceDot x="10" y={412} r={5} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Decision log */}
            <div style={{ borderRadius: 12, border: `1px solid ${ui.border}`, background: ui.stepBg, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 14px", borderBottom: `1px solid ${ui.border}` }}>
                    <ShieldCheck size={13} style={{ color: isLight ? "var(--preset-primary)" : "var(--preset-lighter)" }} />
                    <span style={{ fontSize: 11, fontWeight: 800 }}>Decision log</span>
                    <span style={{ fontSize: 10, color: ui.faint }}>— why each check passed or was flagged</span>
                </div>
                {ANOMALY_CHECKS.map((c, i) => {
                    const col = STATUS_COLORS[c.status]
                    return (
                        <div key={i} style={{ display: "flex", gap: 10, padding: "11px 14px", borderBottom: i < ANOMALY_CHECKS.length - 1 ? `1px solid ${ui.border}` : "none" }}>
                            <span style={{ fontSize: 9.5, fontFamily: "ui-monospace, Menlo, monospace", color: ui.faint, flexShrink: 0, marginTop: 2 }}>{c.t}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                                    <span style={{ fontSize: 11.5, fontWeight: 700 }}>{c.label}</span>
                                    <span style={{ fontSize: 8, fontWeight: 900, padding: "2px 6px", borderRadius: 4, background: `${col}16`, border: `1px solid ${col}44`, color: col, letterSpacing: ".05em" }}>{c.status}</span>
                                </div>
                                <div style={{ fontSize: 10.5, color: ui.faint, marginTop: 3, lineHeight: 1.5 }}>{c.why}</div>
                            </div>
                            <span style={{ fontSize: 9.5, fontWeight: 800, color: ui.sub, flexShrink: 0, marginTop: 2 }}>{c.conf}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

/* ─────────────────────────── Email creative artifact ─────────────────────────── */

const EmailArtifact: React.FC<{ ui: UIT; isLight: boolean }> = ({ ui, isLight }) => {
    const [vi, setVi] = useState(0)
    const [scheduled, setScheduled] = useState(false)
    const v = EMAIL_VARIANTS[vi]

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Variant switcher */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {EMAIL_VARIANTS.map((ev, i) => (
                    <button
                        key={ev.id}
                        onClick={() => setVi(i)}
                        style={{
                            padding: "10px 8px", borderRadius: 11, fontFamily: "inherit", cursor: "pointer",
                            border: `1px solid ${vi === i ? "rgba(var(--preset-primary-rgb),.55)" : ui.border}`,
                            background: vi === i ? "rgba(var(--preset-primary-rgb),.08)" : ui.stepBg,
                            transition: "border-color .2s ease, background .2s ease",
                        }}
                    >
                        <div style={{ fontSize: 12, fontWeight: 900, color: vi === i ? (isLight ? "var(--preset-primary)" : "var(--preset-lighter)") : ui.sub }}>
                            Variant {ev.id}
                        </div>
                        <div style={{ fontSize: 9.5, fontWeight: 700, color: ui.faint, marginTop: 3 }}>~{ev.openRate} open rate</div>
                    </button>
                ))}
            </div>

            {/* Rendered email preview */}
            <div key={vi} style={{ borderRadius: 14, border: `1px solid ${ui.border}`, overflow: "hidden", background: ui.stepBg, animation: "ag-up .3s ease both" }}>
                <div style={{ padding: "13px 16px", borderBottom: `1px solid ${ui.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 10, color: ui.faint, marginBottom: 7 }}>
                        <span>From: <b style={{ color: ui.sub }}>Shop Intel &lt;hello@shopintel.my&gt;</b></span>
                        <span>To: Engaged segment (1,204)</span>
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, lineHeight: 1.4 }}>{v.subject}</div>
                    <div style={{ fontSize: 11, color: ui.faint, marginTop: 3 }}>{v.preheader}</div>
                </div>
                <div style={{ padding: "30px 24px", textAlign: "center", background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))" }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,.75)", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8 }}>Shop Intel Beauty</div>
                    <div style={{ fontSize: 21, fontWeight: 900, color: "#fff", letterSpacing: "-0.4px", lineHeight: 1.25 }}>{v.headline}</div>
                </div>
                <div style={{ padding: "20px 24px 24px", textAlign: "center" }}>
                    <p style={{ margin: "0 0 18px", fontSize: 12.5, lineHeight: 1.75, color: ui.sub }}>{v.body}</p>
                    <span
                        style={{
                            display: "inline-block", padding: "11px 26px", borderRadius: 99,
                            background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                            color: "#fff", fontSize: 12.5, fontWeight: 800,
                            boxShadow: "0 6px 20px rgba(var(--preset-primary-rgb),.35)",
                        }}
                    >
                        {v.cta}
                    </span>
                    <div style={{ fontSize: 9, color: ui.faint, marginTop: 20 }}>
                        Shop Intel Sdn Bhd · Kuala Lumpur · Unsubscribe
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
                <button
                    style={{
                        flex: 1, padding: "10px 0", borderRadius: 11, border: `1px solid ${ui.border}`,
                        background: ui.chip, color: ui.sub, fontSize: 11.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                    }}
                >
                    Send test to me
                </button>
                <button
                    onClick={() => setScheduled(true)}
                    style={{
                        flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                        padding: "10px 0", borderRadius: 11, border: "none", fontFamily: "inherit",
                        background: scheduled ? "rgba(16,185,129,.14)" : "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                        color: scheduled ? "#10b981" : "#fff", fontSize: 11.5, fontWeight: 800,
                        cursor: "pointer", transition: "background .25s ease",
                        boxShadow: scheduled ? "none" : "0 4px 16px rgba(var(--preset-primary-rgb),.3)",
                    }}
                >
                    {scheduled ? (<><CheckCircle2 size={13} /> Scheduled · Thu 10 AM</>) : `Schedule Variant ${v.id}`}
                </button>
            </div>
        </div>
    )
}

/* ─────────────────────────── Main screen ─────────────────────────── */

let msgId = 0

const AgentScreen = () => {
    const { resolvedTheme } = useTheme()
    const isLight = resolvedTheme === "light"
    const { startTour, startDemo } = useAgentTour()

    const [messages, setMessages] = useState<Msg[]>([])
    const [input, setInput] = useState("")
    const [running, setRunning] = useState(false)
    const [artifacts, setArtifacts] = useState<Record<string, Artifact>>({})
    const [openArtifactId, setOpenArtifactId] = useState<string | null>(null)
    const [artifactTab, setArtifactTab] = useState<"preview" | "source">("preview")

    const scrollRef = useRef<HTMLDivElement>(null)
    const taRef = useRef<HTMLTextAreaElement>(null)
    const aliveRef = useRef(true)
    useEffect(() => {
        aliveRef.current = true
        return () => { aliveRef.current = false }
    }, [])

    const ui = useMemo<UIT>(
        () =>
            isLight
                ? {
                      pageBg: "#f7f8fb", border: "rgba(15,23,42,.08)", panel: "#ffffff",
                      text: "#0f172a", sub: "rgba(15,23,42,.55)", faint: "rgba(15,23,42,.35)",
                      userBubble: "rgba(var(--preset-primary-rgb),.09)", inputBg: "#ffffff",
                      stepBg: "rgba(15,23,42,.03)", chip: "#ffffff", artifactBg: "#ffffff",
                      codeBg: "rgba(15,23,42,.04)", shadow: "0 8px 30px rgba(15,23,42,.06)",
                  }
                : {
                      pageBg: "#0d131c", border: "rgba(255,255,255,.07)", panel: "#111927",
                      text: "rgba(255,255,255,.92)", sub: "rgba(255,255,255,.5)", faint: "rgba(255,255,255,.3)",
                      userBubble: "rgba(var(--preset-primary-rgb),.14)", inputBg: "#141c2b",
                      stepBg: "rgba(255,255,255,.03)", chip: "rgba(255,255,255,.04)", artifactBg: "#0f1724",
                      codeBg: "rgba(255,255,255,.05)", shadow: "0 8px 30px rgba(0,0,0,.35)",
                  },
        [isLight]
    )

    const scrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
        })
    }, [])

    const patchMsg = useCallback((id: number, patch: (m: Msg) => Msg) => {
        setMessages((ms) => ms.map((m) => (m.id === id ? patch(m) : m)))
    }, [])

    const send = useCallback(
        async (raw: string) => {
            const text = raw.trim()
            if (!text || running) return
            setInput("")
            if (taRef.current) taRef.current.style.height = "auto"
            setRunning(true)

            setMessages((ms) => [...ms, { id: ++msgId, role: "user", text, steps: [], streaming: false }])
            scrollToBottom()

            const scenario = pickScenario(text)
            const aId = ++msgId
            setMessages((ms) => [
                ...ms,
                {
                    id: aId,
                    role: "assistant",
                    text: "",
                    streaming: false,
                    steps: scenario.steps.map((s) => ({ step: s, status: "pending" as const })),
                    plan: scenario.plan?.map((p) => ({ ...p, done: false })),
                },
            ])
            await wait(350)

            /* Run agentic steps one by one */
            for (let i = 0; i < scenario.steps.length; i++) {
                if (!aliveRef.current) return
                patchMsg(aId, (m) => ({ ...m, steps: m.steps.map((s, j) => (j === i ? { ...s, status: "running" } : s)) }))
                scrollToBottom()
                await wait(scenario.steps[i].duration)
                patchMsg(aId, (m) => ({
                    ...m,
                    steps: m.steps.map((s, j) => (j === i ? { ...s, status: "done" } : s)),
                    plan: m.plan?.map((p) => (p.stepIndex === i ? { ...p, done: true } : p)),
                }))
            }

            /* Stream the response word by word */
            await wait(300)
            const words = scenario.response.split(" ")
            patchMsg(aId, (m) => ({ ...m, streaming: true }))
            for (let i = 0; i < words.length; i++) {
                if (!aliveRef.current) return
                const partial = words.slice(0, i + 1).join(" ")
                patchMsg(aId, (m) => ({ ...m, text: partial }))
                if (i % 6 === 0) scrollToBottom()
                await wait(26)
            }
            patchMsg(aId, (m) => ({ ...m, streaming: false }))

            /* Deliver artifact */
            if (scenario.artifact) {
                const art = scenario.artifact
                setArtifacts((a) => ({ ...a, [art.id]: art }))
                patchMsg(aId, (m) => ({ ...m, artifactId: art.id }))
                await wait(400)
                setOpenArtifactId(art.id)
                setArtifactTab("preview")
            }
            scrollToBottom()
            setRunning(false)

            /* Kick off the guided tour / autopilot */
            if (scenario.action === "start-marketing-tour") {
                await wait(1100)
                if (aliveRef.current) startTour("personal-marketing")
            } else if (scenario.action === "start-campaign-demo") {
                await wait(1100)
                if (aliveRef.current) startDemo("create-campaign")
            }
        },
        [running, patchMsg, scrollToBottom, startTour, startDemo]
    )

    const openArtifact = openArtifactId ? artifacts[openArtifactId] : null

    /* ─────────── render ─────────── */

    return (
        <>
            <style>{`
                @keyframes ag-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes ag-spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
                @keyframes ag-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
                @keyframes ag-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                @keyframes ag-slide-in { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
                .ag-shimmer {
                    background: linear-gradient(90deg, var(--preset-primary) 25%, var(--preset-lighter) 50%, var(--preset-primary) 75%);
                    background-size: 200% 100%;
                    -webkit-background-clip: text; background-clip: text; color: transparent;
                    animation: ag-shimmer 1.6s linear infinite;
                }
                .ag-md p { margin: 0 0 10px; } .ag-md p:last-child { margin-bottom: 0; }
                .ag-md ul, .ag-md ol { margin: 4px 0 10px; padding-left: 20px; display: flex; flex-direction: column; gap: 5px; }
                .ag-md strong { color: var(--preset-lighter); font-weight: 700; }
                .ag-md-light strong { color: var(--preset-primary); }
                .ag-md h2 { font-size: 17px; font-weight: 800; margin: 0 0 12px; letter-spacing: -0.3px; }
                .ag-md h3 { font-size: 13px; font-weight: 800; margin: 18px 0 8px; }
                .ag-md hr { border: none; border-top: 1px solid rgba(128,128,128,.2); margin: 14px 0; }
                .ag-md table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 8px 0 12px; }
                .ag-md th, .ag-md td { text-align: left; padding: 7px 10px; border-bottom: 1px solid rgba(128,128,128,.15); }
                .ag-md th { font-size: 10px; text-transform: uppercase; letter-spacing: .05em; opacity: .6; }
                .ag-scroll::-webkit-scrollbar { width: 8px; }
                .ag-scroll::-webkit-scrollbar-thumb { background: rgba(128,128,128,.25); border-radius: 99px; }
                .ag-scroll::-webkit-scrollbar-track { background: transparent; }
            `}</style>

            <div
                style={{
                    display: "flex",
                    height: "100dvh",
                    background: ui.pageBg,
                    color: ui.text,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif",
                    overflow: "hidden",
                }}
            >
                {/* ═══════════ LEFT: conversation ═══════════ */}
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                    {/* Header */}
                    <div
                        style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "14px 22px", borderBottom: `1px solid ${ui.border}`, flexShrink: 0,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                            <span
                                style={{
                                    width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                                    background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    boxShadow: "0 4px 18px rgba(var(--preset-primary-rgb),.35)",
                                }}
                            >
                                <Sparkles size={17} color="#fff" />
                            </span>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.3px" }}>Shop Intel Agent</span>
                                    <span
                                        style={{
                                            fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
                                            background: "rgba(var(--preset-primary-rgb),.12)",
                                            border: "1px solid rgba(var(--preset-primary-rgb),.25)",
                                            color: isLight ? "var(--preset-primary)" : "var(--preset-lighter)",
                                            letterSpacing: ".06em",
                                        }}
                                    >
                                        AGENTIC
                                    </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: ui.sub, fontWeight: 600, marginTop: 1 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                                    Online · plans and executes multi-step tasks
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => { setMessages([]); setOpenArtifactId(null); setArtifacts({}) }}
                            disabled={running}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px",
                                borderRadius: 10, border: `1px solid ${ui.border}`, background: ui.chip,
                                color: ui.sub, fontSize: 11.5, fontWeight: 700, cursor: running ? "default" : "pointer",
                                fontFamily: "inherit", opacity: running ? 0.5 : 1,
                            }}
                        >
                            <Plus size={13} />
                            New chat
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="ag-scroll" style={{ flex: 1, overflowY: "auto", padding: "26px 0 12px" }}>
                        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 22px", display: "flex", flexDirection: "column", gap: 26 }}>
                            {messages.length === 0 && (
                                /* ── Empty state ── */
                                <div style={{ paddingTop: "9vh", textAlign: "center", animation: "ag-up .5s ease both" }}>
                                    <div
                                        style={{
                                            width: 64, height: 64, borderRadius: 22, margin: "0 auto 18px",
                                            background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            boxShadow: "0 12px 40px rgba(var(--preset-primary-rgb),.4)",
                                        }}
                                    >
                                        <Sparkles size={28} color="#fff" />
                                    </div>
                                    <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 800, letterSpacing: "-0.6px" }}>
                                        How can I help you today?
                                    </h1>
                                    <p style={{ margin: "0 auto 30px", fontSize: 13.5, color: ui.sub, maxWidth: 440, lineHeight: 1.6 }}>
                                        I can research, analyze your store data, create deliverables — and even give you live guided tours of any module.
                                    </p>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10, textAlign: "left" }}>
                                        {SUGGESTIONS.map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => send(s.title)}
                                                style={{
                                                    display: "flex", alignItems: "flex-start", gap: 11, padding: "14px 16px",
                                                    borderRadius: 14, border: `1px solid ${ui.border}`, background: ui.panel,
                                                    cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                                                    transition: "border-color .2s ease, transform .2s ease, box-shadow .2s ease",
                                                    animation: `ag-up .5s ease ${0.08 + i * 0.06}s both`, boxShadow: ui.shadow,
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.borderColor = "rgba(var(--preset-primary-rgb),.45)"
                                                    e.currentTarget.style.transform = "translateY(-2px)"
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.borderColor = ui.border
                                                    e.currentTarget.style.transform = "translateY(0)"
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                                                        background: "rgba(var(--preset-primary-rgb),.12)",
                                                        color: isLight ? "var(--preset-primary)" : "var(--preset-lighter)",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                    }}
                                                >
                                                    {s.icon}
                                                </span>
                                                <span>
                                                    <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: ui.text, lineHeight: 1.4 }}>{s.title}</span>
                                                    <span style={{ display: "block", fontSize: 10.5, color: ui.faint, marginTop: 3 }}>{s.sub}</span>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((m) =>
                                m.role === "user" ? (
                                    /* ── User bubble ── */
                                    <div key={m.id} style={{ display: "flex", justifyContent: "flex-end", animation: "ag-up .35s ease both" }}>
                                        <div
                                            style={{
                                                maxWidth: "82%", padding: "11px 16px", borderRadius: "18px 18px 5px 18px",
                                                background: ui.userBubble, border: "1px solid rgba(var(--preset-primary-rgb),.22)",
                                                fontSize: 13.5, lineHeight: 1.6,
                                            }}
                                        >
                                            {m.text}
                                        </div>
                                    </div>
                                ) : (
                                    /* ── Assistant turn ── */
                                    <div key={m.id} style={{ display: "flex", gap: 12, animation: "ag-up .35s ease both" }}>
                                        <span
                                            style={{
                                                width: 30, height: 30, borderRadius: 10, flexShrink: 0, marginTop: 2,
                                                background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                boxShadow: "0 4px 14px rgba(var(--preset-primary-rgb),.3)",
                                            }}
                                        >
                                            <Sparkles size={14} color="#fff" />
                                        </span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            {/* Mission plan — live checklist the agent works through */}
                                            {m.plan && m.steps.some((s) => s.status !== "pending") && (
                                                <div
                                                    style={{
                                                        border: "1px solid rgba(var(--preset-primary-rgb),.25)",
                                                        borderRadius: 14, overflow: "hidden", marginBottom: 12,
                                                        background: "rgba(var(--preset-primary-rgb),.05)",
                                                        animation: "ag-up .35s ease both",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex", alignItems: "center", gap: 8,
                                                            padding: "10px 14px", borderBottom: "1px solid rgba(var(--preset-primary-rgb),.15)",
                                                        }}
                                                    >
                                                        <ListChecks size={13} style={{ color: isLight ? "var(--preset-primary)" : "var(--preset-lighter)" }} />
                                                        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: isLight ? "var(--preset-primary)" : "var(--preset-lighter)" }}>
                                                            Mission plan
                                                        </span>
                                                        <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 800, color: ui.faint }}>
                                                            {m.plan.filter((p) => p.done).length}/{m.plan.length}
                                                        </span>
                                                        <div style={{ width: 60, height: 4, borderRadius: 99, background: isLight ? "rgba(15,23,42,.08)" : "rgba(255,255,255,.1)", overflow: "hidden" }}>
                                                            <div
                                                                style={{
                                                                    height: "100%", borderRadius: 99,
                                                                    width: `${(m.plan.filter((p) => p.done).length / m.plan.length) * 100}%`,
                                                                    background: "linear-gradient(90deg, var(--preset-primary), var(--preset-lighter))",
                                                                    transition: "width .5s cubic-bezier(.4,0,.2,1)",
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                                                        {m.plan.map((p, pi) => {
                                                            const isNext = !p.done && m.plan!.findIndex((x) => !x.done) === pi
                                                            return (
                                                                <div key={pi} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                                                    {p.done ? (
                                                                        <CheckCircle2 size={14} style={{ color: "#10b981", flexShrink: 0 }} />
                                                                    ) : (
                                                                        <span
                                                                            style={{
                                                                                width: 12, height: 12, borderRadius: "50%", flexShrink: 0, margin: 1,
                                                                                border: `2px solid ${isNext ? "var(--preset-primary)" : (isLight ? "rgba(15,23,42,.2)" : "rgba(255,255,255,.2)")}`,
                                                                                boxShadow: isNext ? "0 0 8px rgba(var(--preset-primary-rgb),.6)" : "none",
                                                                            }}
                                                                        />
                                                                    )}
                                                                    <span
                                                                        style={{
                                                                            fontSize: 11.5, fontWeight: 600,
                                                                            color: p.done ? ui.faint : ui.text,
                                                                            textDecoration: p.done ? "line-through" : "none",
                                                                        }}
                                                                    >
                                                                        {p.label}
                                                                    </span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Agentic steps */}
                                            {m.steps.some((s) => s.status !== "pending") && (
                                                <div
                                                    style={{
                                                        border: `1px solid ${ui.border}`, borderRadius: 14, background: ui.stepBg,
                                                        padding: "12px 15px", marginBottom: m.text ? 14 : 0,
                                                        display: "flex", flexDirection: "column", gap: 10,
                                                    }}
                                                >
                                                    {m.steps.filter((s) => s.status !== "pending").map((s, i) => (
                                                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, animation: "ag-up .3s ease both" }}>
                                                            <span
                                                                style={{
                                                                    width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                                    background: s.status === "done" ? "rgba(16,185,129,.12)" : "rgba(var(--preset-primary-rgb),.12)",
                                                                    color: s.status === "done" ? "#10b981" : (isLight ? "var(--preset-primary)" : "var(--preset-lighter)"),
                                                                }}
                                                            >
                                                                {s.status === "done" ? (
                                                                    <Check size={12} />
                                                                ) : (
                                                                    <span style={{ display: "flex", animation: "ag-spin 1.1s linear infinite" }}>
                                                                        {STEP_ICONS[s.step.icon]}
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <div style={{ minWidth: 0 }}>
                                                                <span
                                                                    className={s.status === "running" && s.step.icon === "think" ? "ag-shimmer" : undefined}
                                                                    style={{
                                                                        fontSize: 12, fontWeight: 700,
                                                                        color: s.status === "running" && s.step.icon !== "think"
                                                                            ? (isLight ? "var(--preset-primary)" : "var(--preset-lighter)")
                                                                            : undefined,
                                                                    }}
                                                                >
                                                                    {s.step.label}
                                                                    {s.status === "running" ? "…" : ""}
                                                                </span>
                                                                {s.step.detail && (
                                                                    <div style={{ fontSize: 11, color: ui.faint, marginTop: 2 }}>{s.step.detail}</div>
                                                                )}
                                                                {s.step.sources && s.status === "done" && (
                                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
                                                                        {s.step.sources.map((src) => (
                                                                            <span
                                                                                key={src}
                                                                                style={{
                                                                                    display: "inline-flex", alignItems: "center", gap: 4,
                                                                                    padding: "2px 8px", borderRadius: 99, fontSize: 9.5, fontWeight: 700,
                                                                                    border: `1px solid ${ui.border}`, background: ui.chip, color: ui.sub,
                                                                                }}
                                                                            >
                                                                                <Globe size={8} />
                                                                                {src}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Answer text */}
                                            {m.text && (
                                                <div className={`ag-md ${isLight ? "ag-md-light" : ""}`} style={{ fontSize: 13.5, lineHeight: 1.7 }}>
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                                                    {m.streaming && (
                                                        <span
                                                            style={{
                                                                display: "inline-block", width: 8, height: 15, marginLeft: 2, borderRadius: 2,
                                                                background: "var(--preset-primary)", verticalAlign: "text-bottom",
                                                                animation: "ag-blink .9s step-end infinite",
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {/* Artifact chip */}
                                            {m.artifactId && artifacts[m.artifactId] && (
                                                <button
                                                    onClick={() => { setOpenArtifactId(m.artifactId!); setArtifactTab("preview") }}
                                                    style={{
                                                        display: "flex", alignItems: "center", gap: 12, marginTop: 14,
                                                        padding: "12px 15px", borderRadius: 13, width: "100%", maxWidth: 380,
                                                        border: "1px solid rgba(var(--preset-primary-rgb),.3)",
                                                        background: "rgba(var(--preset-primary-rgb),.07)",
                                                        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                                                        animation: "ag-up .35s ease both", transition: "border-color .2s ease",
                                                    }}
                                                    onMouseOver={(e) => (e.currentTarget.style.borderColor = "rgba(var(--preset-primary-rgb),.6)")}
                                                    onMouseOut={(e) => (e.currentTarget.style.borderColor = "rgba(var(--preset-primary-rgb),.3)")}
                                                >
                                                    <span
                                                        style={{
                                                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                                            background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                        }}
                                                    >
                                                        {React.createElement(ARTIFACT_ICONS[artifacts[m.artifactId].kind], { size: 16, color: "#fff" })}
                                                    </span>
                                                    <span style={{ flex: 1, minWidth: 0 }}>
                                                        <span style={{ display: "block", fontSize: 12.5, fontWeight: 800, color: ui.text }}>
                                                            {artifacts[m.artifactId].title}
                                                        </span>
                                                        <span style={{ display: "block", fontSize: 10.5, color: ui.faint, marginTop: 2 }}>
                                                            Artifact · click to open
                                                        </span>
                                                    </span>
                                                    <ArrowUpRight size={15} style={{ color: isLight ? "var(--preset-primary)" : "var(--preset-lighter)", flexShrink: 0 }} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            )}
                            <div style={{ height: 8 }} />
                        </div>
                    </div>

                    {/* Composer */}
                    <div style={{ flexShrink: 0, padding: "10px 22px calc(18px + env(safe-area-inset-bottom, 0px))" }}>
                        <div style={{ maxWidth: 760, margin: "0 auto" }}>
                            <div
                                style={{
                                    display: "flex", alignItems: "flex-end", gap: 10,
                                    background: ui.inputBg, border: `1px solid ${ui.border}`,
                                    borderRadius: 18, padding: "10px 10px 10px 18px", boxShadow: ui.shadow,
                                    transition: "border-color .2s ease",
                                }}
                            >
                                <textarea
                                    ref={taRef}
                                    value={input}
                                    rows={1}
                                    onChange={(e) => {
                                        setInput(e.target.value)
                                        e.target.style.height = "auto"
                                        e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px"
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault()
                                            send(input)
                                        }
                                    }}
                                    placeholder={running ? "Agent is working…" : "Ask anything — try “walk me through the Personal Marketing module”"}
                                    disabled={running}
                                    style={{
                                        flex: 1, minWidth: 0, resize: "none", border: "none", outline: "none",
                                        background: "transparent", color: ui.text, fontSize: 13.5, lineHeight: 1.6,
                                        fontFamily: "inherit", maxHeight: 140, padding: "4px 0",
                                    }}
                                />
                                <button
                                    onClick={() => send(input)}
                                    disabled={!input.trim() || running}
                                    style={{
                                        width: 38, height: 38, borderRadius: 13, border: "none", flexShrink: 0,
                                        background: input.trim() && !running
                                            ? "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))"
                                            : (isLight ? "rgba(15,23,42,.06)" : "rgba(255,255,255,.06)"),
                                        color: input.trim() && !running ? "#fff" : ui.faint,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        cursor: input.trim() && !running ? "pointer" : "default",
                                        transition: "background .2s ease",
                                        boxShadow: input.trim() && !running ? "0 4px 16px rgba(var(--preset-primary-rgb),.35)" : "none",
                                    }}
                                >
                                    <Send size={15} />
                                </button>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 9, fontSize: 10, color: ui.faint, fontWeight: 600 }}>
                                <Zap size={10} />
                                Agentic mode — the agent plans, searches and executes steps autonomously. Responses are simulated.
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════ RIGHT: Artifacts panel ═══════════ */}
                {openArtifact && (
                    <div
                        className="fixed inset-0 z-50 lg:static lg:z-auto"
                        style={{
                            width: undefined,
                            display: "flex", flexDirection: "column",
                            background: ui.artifactBg,
                            borderLeft: `1px solid ${ui.border}`,
                            animation: "ag-slide-in .35s cubic-bezier(.4,0,.2,1) both",
                        }}
                    >
                        <div className="w-full lg:w-[480px] xl:w-[540px]" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                            {/* Artifact header */}
                            <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "13px 18px", borderBottom: `1px solid ${ui.border}`, flexShrink: 0 }}>
                                <span
                                    style={{
                                        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                                        background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}
                                >
                                    {React.createElement(ARTIFACT_ICONS[openArtifact.kind], { size: 15, color: "#fff" })}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13.5, fontWeight: 800, letterSpacing: "-0.2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {openArtifact.title}
                                    </div>
                                    <div style={{ fontSize: 10.5, color: ui.faint }}>{openArtifact.subtitle}</div>
                                </div>
                                <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                                    {[
                                        { icon: <Copy size={13} />, title: "Copy" },
                                        { icon: <Download size={13} />, title: "Download" },
                                    ].map((b, i) => (
                                        <button
                                            key={i}
                                            title={b.title}
                                            style={{
                                                width: 28, height: 28, borderRadius: 8, border: `1px solid ${ui.border}`,
                                                background: ui.chip, color: ui.sub, display: "flex",
                                                alignItems: "center", justifyContent: "center", cursor: "pointer",
                                            }}
                                        >
                                            {b.icon}
                                        </button>
                                    ))}
                                    <button
                                        title="Close panel"
                                        onClick={() => setOpenArtifactId(null)}
                                        style={{
                                            width: 28, height: 28, borderRadius: 8, border: `1px solid ${ui.border}`,
                                            background: ui.chip, color: ui.sub, display: "flex",
                                            alignItems: "center", justifyContent: "center", cursor: "pointer",
                                        }}
                                    >
                                        <PanelRightClose size={13} className="hidden lg:block" />
                                        <X size={13} className="lg:hidden" />
                                    </button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div style={{ display: "flex", gap: 4, padding: "10px 18px 0", flexShrink: 0 }}>
                                {(["preview", "source"] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setArtifactTab(tab)}
                                        style={{
                                            padding: "6px 16px", borderRadius: 9, fontSize: 11, fontWeight: 800,
                                            textTransform: "capitalize", cursor: "pointer", fontFamily: "inherit", border: "none",
                                            ...(artifactTab === tab
                                                ? { background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))", color: "#fff", boxShadow: "0 3px 12px rgba(var(--preset-primary-rgb),.3)" }
                                                : { background: "transparent", color: ui.faint }),
                                        }}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Artifact body */}
                            <div className="ag-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 18px 24px" }}>
                                {artifactTab === "source" ? (
                                    <pre
                                        style={{
                                            margin: 0, padding: 16, borderRadius: 12, background: ui.codeBg,
                                            border: `1px solid ${ui.border}`, fontSize: 11, lineHeight: 1.7,
                                            whiteSpace: "pre-wrap", wordBreak: "break-word", color: ui.sub,
                                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                                        }}
                                    >
                                        {artifactSource(openArtifact)}
                                    </pre>
                                ) : openArtifact.kind === "table" ? (
                                    <ReorderTableArtifact ui={ui} isLight={isLight} />
                                ) : openArtifact.kind === "dashboard" ? (
                                    <DashboardArtifact ui={ui} isLight={isLight} />
                                ) : openArtifact.kind === "email" ? (
                                    <EmailArtifact ui={ui} isLight={isLight} />
                                ) : openArtifact.kind === "chart" ? (
                                    /* ── Chart artifact ── */
                                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                                            {[
                                                { l: "Total Revenue", v: "RM90.6K", c: "#10b981" },
                                                { l: "Total Spend", v: "RM26.8K", c: "var(--preset-primary)" },
                                                { l: "Blended ROAS", v: "3.4×", c: "#f59e0b" },
                                            ].map((k, i) => (
                                                <div key={i} style={{ padding: "13px 14px", borderRadius: 12, border: `1px solid ${ui.border}`, background: ui.stepBg }}>
                                                    <div style={{ fontSize: 9, fontWeight: 800, color: ui.faint, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 5 }}>{k.l}</div>
                                                    <div style={{ fontSize: 18, fontWeight: 900, color: k.c }}>{k.v}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ height: 260, padding: "16px 12px 8px", borderRadius: 14, border: `1px solid ${ui.border}`, background: ui.stepBg }}>
                                            <div style={{ fontSize: 12, fontWeight: 800, padding: "0 6px 10px" }}>Spend vs Revenue</div>
                                            <ResponsiveContainer width="100%" height="88%">
                                                <AreaChart data={CHART_DATA} margin={{ top: 5, right: 8, left: -14, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="agRev" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.28} />
                                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                                        </linearGradient>
                                                        <linearGradient id="agSpend" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="var(--preset-primary)" stopOpacity={0.28} />
                                                            <stop offset="100%" stopColor="var(--preset-primary)" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="2 2" stroke={isLight ? "rgba(15,23,42,.07)" : "rgba(255,255,255,.05)"} vertical={false} />
                                                    <XAxis dataKey="m" tick={{ fontSize: 10, fill: isLight ? "rgba(15,23,42,.4)" : "rgba(255,255,255,.3)" }} tickLine={false} axisLine={false} />
                                                    <YAxis tick={{ fontSize: 10, fill: isLight ? "rgba(15,23,42,.4)" : "rgba(255,255,255,.3)" }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v / 1000}K`} />
                                                    <Tooltip
                                                        contentStyle={{
                                                            background: isLight ? "#fff" : "#141c2b", border: `1px solid ${ui.border}`,
                                                            borderRadius: 10, fontSize: 11,
                                                        }}
                                                        formatter={(v: number) => `RM${v.toLocaleString()}`}
                                                    />
                                                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} fill="url(#agRev)" />
                                                    <Area type="monotone" dataKey="spend" name="Spend" stroke="var(--preset-primary)" strokeWidth={2} fill="url(#agSpend)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${ui.border}`, background: ui.stepBg }}>
                                            <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                                                <Lightbulb size={12} style={{ color: "#f59e0b" }} />
                                                Agent insights
                                            </div>
                                            {[
                                                "Revenue growth is outpacing spend growth — scale TikTok budget +20% while efficiency holds.",
                                                "Shopee revenue flat since April; consider reallocating RM800/mo to Reels retargeting.",
                                                "July peak coincided with the mid-year sale — book similar placements for 11.11 early.",
                                            ].map((t, i) => (
                                                <div key={i} style={{ display: "flex", gap: 8, fontSize: 11.5, lineHeight: 1.6, color: ui.sub, marginBottom: 6 }}>
                                                    <span style={{ color: isLight ? "var(--preset-primary)" : "var(--preset-lighter)", fontWeight: 900 }}>{i + 1}.</span>
                                                    {t}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    /* ── Report artifact ── */
                                    <div
                                        className={`ag-md ${isLight ? "ag-md-light" : ""}`}
                                        style={{
                                            fontSize: 12.5, lineHeight: 1.7, padding: "20px 22px",
                                            borderRadius: 14, border: `1px solid ${ui.border}`, background: ui.stepBg,
                                        }}
                                    >
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{openArtifact.markdown || ""}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default AgentScreen
