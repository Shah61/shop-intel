"use client"

/*
 * Agent Tour — global guided-tour engine driven by the AI Agent.
 * Renders a darkened overlay with a smooth "torchlight" spotlight cutout,
 * a floating explanation tooltip (Prev / Next / Skip / step counter) and a
 * floating AI assistant that keeps answering questions during the tour.
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, GripHorizontal, Send, Sparkles, X } from "lucide-react"

/* ─────────────────────────── Tour definitions ─────────────────────────── */

export type TourId = "personal-marketing"

interface TourStep {
    selector: string
    title: string
    text: string
    /** Canned answer the floating assistant gives when asked about this step */
    qa: string
}

interface TourDef {
    path: string
    label: string
    steps: TourStep[]
}

const TOURS: Record<TourId, TourDef> = {
    "personal-marketing": {
        path: "/marketing",
        label: "Personal Marketing Hub",
        steps: [
            {
                selector: '[data-tour="pm-heading"]',
                title: "Personal Marketing Hub",
                text: "This is your Personal Marketing Hub, where you can manage campaign spending and performance across every platform.",
                qa: "The hub aggregates every campaign you run — Facebook, Instagram, TikTok, YouTube, Google and more — into one place. Everything you see below (cards, charts, campaign lists) reacts to the date range and platform filters in the top-right corner.",
            },
            {
                selector: '[data-tour="pm-summary-cards"]',
                title: "Summary Cards",
                text: "These cards give you a quick overview of total spending, campaign items, active items, average cost and connected platforms.",
                qa: "Each card is computed live from your campaign data: Total Spend sums every item's cost, Active Items counts campaigns currently running, and Platforms counts the distinct channels you've linked. The numbers animate whenever the filters change.",
            },
            {
                selector: '[data-tour="pm-spend-chart"]',
                title: "Spend Overview",
                text: "This chart shows how your marketing spending changes over time.",
                qa: "You can switch between Area, Line and Bar views with the buttons at the top-right of the chart, and toggle between Daily and Monthly aggregation. The Total / Avg / Peak stats above the chart update with your selected date range.",
            },
            {
                selector: '[data-tour="pm-spend-velocity"]',
                title: "Spend Velocity",
                text: "Spend Velocity shows your current daily, weekly and monthly spending rate, including how long your budget may last.",
                qa: "It's your burn rate: the daily figure comes from active campaigns' cost divided by their duration, then projected to weekly and monthly. Budget Runway estimates how many days of spend remain before your committed budget is used up.",
            },
            {
                selector: '[data-tour="pm-new-campaign"]',
                title: "New Campaign",
                text: "Use this button when you are ready to create a new marketing campaign.",
                qa: "Clicking it opens the campaign builder — you name the campaign, add one or more marketing items with cost, duration and start date, and attach the platform links you want tracked. Metrics start flowing in automatically once links are added.",
            },
        ],
    },
}

/* ─────────────────────────── Autopilot demo scripts ─────────────────────────── */

export type DemoId = "create-campaign"

type DemoAction =
    | { type: "navigate"; path: string }
    | { type: "waitFor"; selector: string }
    | { type: "say"; text: string }
    | { type: "click"; selector: string; label?: string }
    | { type: "typeIn"; selector: string; text: string; label?: string }
    | { type: "pause"; ms: number }
    | { type: "done"; text: string }

const DEMOS: Record<DemoId, DemoAction[]> = {
    "create-campaign": [
        { type: "navigate", path: "/marketing" },
        { type: "waitFor", selector: '[data-tour="pm-new-campaign"]' },
        { type: "say", text: "Opening the campaign builder" },
        { type: "pause", ms: 600 },
        { type: "click", selector: '[data-tour="pm-new-campaign"]', label: "Opening the campaign builder" },
        { type: "waitFor", selector: '[data-agent="mk-campaign-name"]' },
        { type: "pause", ms: 700 },
        { type: "typeIn", selector: '[data-agent="mk-campaign-name"]', text: "Raya Glow Launch", label: "Naming the campaign" },
        { type: "typeIn", selector: '[data-agent="mk-item-name"]', text: "TikTok Spark Ads — UGC Clips", label: "Adding the first item" },
        { type: "typeIn", selector: '[data-agent="mk-item-cost"]', text: "2700", label: "Budget from your best ROAS config" },
        { type: "typeIn", selector: '[data-agent="mk-item-duration"]', text: "21", label: "Setting a 21-day flight" },
        { type: "typeIn", selector: '[data-agent="mk-item-desc"]', text: "Six UGC testimonial clips boosted via Spark Ads. Budget mirrors our June top performer (3.8x ROAS).", label: "Writing the description" },
        { type: "pause", ms: 500 },
        { type: "done", text: "Draft ready! I filled everything from your best-performing settings. Review it and press Create Campaign — I never submit without your approval." },
    ],
}

/* React-compatible programmatic input (works with controlled inputs) */
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set
    setter?.call(el, value)
    el.dispatchEvent(new Event("input", { bubbles: true }))
}

/* ─────────────────────────── Context ─────────────────────────── */

interface AgentTourContextValue {
    startTour: (id: TourId) => void
    startDemo: (id: DemoId) => void
    isTouring: boolean
}

const AgentTourContext = createContext<AgentTourContextValue>({ startTour: () => {}, startDemo: () => {}, isTouring: false })

export const useAgentTour = () => useContext(AgentTourContext)

type Phase = "idle" | "loading" | "active"

interface ChatMsg {
    role: "user" | "assistant"
    text: string
}

/* ─────────────────────────── Provider + overlay ─────────────────────────── */

export function AgentTourProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()

    const [phase, setPhase] = useState<Phase>("idle")
    const [tourId, setTourId] = useState<TourId | null>(null)
    const [stepIndex, setStepIndex] = useState(0)

    /* Floating assistant mini-chat */
    const [chat, setChat] = useState<ChatMsg[]>([])
    const [chatInput, setChatInput] = useState("")
    const [typing, setTyping] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)

    const spotRef = useRef<HTMLDivElement>(null)
    const tipRef = useRef<HTMLDivElement>(null)
    const animRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null)
    const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    /* Draggable floating assistant */
    const [asstPos, setAsstPos] = useState<{ x: number; y: number } | null>(null)
    const asstRef = useRef<HTMLDivElement>(null)
    const dragRef = useRef<{ dx: number; dy: number } | null>(null)

    const onAssistantDragStart = useCallback((e: React.PointerEvent) => {
        const el = asstRef.current
        if (!el) return
        e.preventDefault()
        const r = el.getBoundingClientRect()
        dragRef.current = { dx: e.clientX - r.left, dy: e.clientY - r.top }
        const onMove = (ev: PointerEvent) => {
            if (!dragRef.current || !asstRef.current) return
            const w = asstRef.current.offsetWidth
            const h = asstRef.current.offsetHeight
            const x = Math.max(8, Math.min(ev.clientX - dragRef.current.dx, window.innerWidth - w - 8))
            const y = Math.max(8, Math.min(ev.clientY - dragRef.current.dy, window.innerHeight - h - 8))
            setAsstPos({ x, y })
        }
        const onUp = () => {
            dragRef.current = null
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("pointerup", onUp)
        }
        window.addEventListener("pointermove", onMove)
        window.addEventListener("pointerup", onUp)
    }, [])

    const tour = tourId ? TOURS[tourId] : null

    /* ─── Autopilot demo state ─── */
    const [demoPhase, setDemoPhase] = useState<"idle" | "running" | "done">("idle")
    const [demoLabel, setDemoLabel] = useState("")
    const [demoDoneText, setDemoDoneText] = useState("")
    const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null)
    const demoCancelled = useRef(false)
    const cursorRef = useRef<HTMLDivElement>(null)
    const curPos = useRef({ x: 0, y: 0 })
    const targetPos = useRef({ x: 0, y: 0 })

    /* Cursor glide loop */
    useEffect(() => {
        if (demoPhase === "idle") return
        let raf = 0
        const tick = () => {
            const c = curPos.current
            const t = targetPos.current
            c.x += (t.x - c.x) * 0.13
            c.y += (t.y - c.y) * 0.13
            if (cursorRef.current) cursorRef.current.style.transform = `translate(${c.x}px, ${c.y}px)`
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [demoPhase])

    const endDemo = useCallback(() => {
        demoCancelled.current = true
        setDemoPhase("idle")
        setDemoLabel("")
        setDemoDoneText("")
        setRipple(null)
    }, [])

    const startDemo = useCallback(
        (id: DemoId) => {
            demoCancelled.current = false
            curPos.current = { x: window.innerWidth - 120, y: window.innerHeight - 120 }
            targetPos.current = { ...curPos.current }
            setDemoDoneText("")
            setDemoLabel("Engaging autopilot")
            setDemoPhase("running")

            const q = (sel: string) => document.querySelector(sel) as HTMLElement | null

            const moveCursorTo = (x: number, y: number) =>
                new Promise<void>((res) => {
                    targetPos.current = { x, y }
                    const check = () => {
                        if (demoCancelled.current) return res()
                        if (Math.hypot(curPos.current.x - x, curPos.current.y - y) < 5) res()
                        else requestAnimationFrame(check)
                    }
                    requestAnimationFrame(check)
                })

            const moveToEl = async (sel: string) => {
                const el = q(sel)
                if (!el) return null
                el.scrollIntoView({ behavior: "smooth", block: "center" })
                await new Promise((r) => setTimeout(r, 450))
                const rect = el.getBoundingClientRect()
                await moveCursorTo(rect.left + rect.width / 2, rect.top + rect.height / 2)
                return el
            }

            const waitForEl = (sel: string) =>
                new Promise<void>((res) => {
                    let tries = 0
                    const iv = setInterval(() => {
                        tries++
                        if (q(sel) || tries > 60 || demoCancelled.current) {
                            clearInterval(iv)
                            res()
                        }
                    }, 150)
                })

            const run = async () => {
                for (const action of DEMOS[id]) {
                    if (demoCancelled.current) return
                    switch (action.type) {
                        case "navigate":
                            if (window.location.pathname !== action.path) router.push(action.path)
                            break
                        case "waitFor":
                            await waitForEl(action.selector)
                            break
                        case "say":
                            setDemoLabel(action.text)
                            break
                        case "pause":
                            await new Promise((r) => setTimeout(r, action.ms))
                            break
                        case "click": {
                            if (action.label) setDemoLabel(action.label)
                            const el = await moveToEl(action.selector)
                            if (!el || demoCancelled.current) break
                            setRipple({ x: targetPos.current.x, y: targetPos.current.y, key: Date.now() })
                            await new Promise((r) => setTimeout(r, 220))
                            el.click()
                            break
                        }
                        case "typeIn": {
                            if (action.label) setDemoLabel(action.label)
                            const el = (await moveToEl(action.selector)) as HTMLInputElement | HTMLTextAreaElement | null
                            if (!el || demoCancelled.current) break
                            setRipple({ x: targetPos.current.x, y: targetPos.current.y, key: Date.now() })
                            el.focus()
                            setNativeValue(el, "")
                            for (const ch of action.text) {
                                if (demoCancelled.current) return
                                setNativeValue(el, el.value + ch)
                                await new Promise((r) => setTimeout(r, 38))
                            }
                            await new Promise((r) => setTimeout(r, 350))
                            break
                        }
                        case "done":
                            setDemoLabel("")
                            setDemoDoneText(action.text)
                            setDemoPhase("done")
                            break
                    }
                }
            }

            run()
        },
        [router]
    )

    /* Esc aborts autopilot */
    useEffect(() => {
        if (demoPhase === "idle") return
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && endDemo()
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [demoPhase, endDemo])

    const startTour = useCallback(
        (id: TourId) => {
            setTourId(id)
            setStepIndex(0)
            setPhase("loading")
            setChat([
                {
                    role: "assistant",
                    text: "Tour started! Use Next to move between sections — or ask me anything about what's highlighted.",
                },
            ])
            const def = TOURS[id]
            if (window.location.pathname !== def.path) router.push(def.path)
        },
        [router]
    )

    const endTour = useCallback(() => {
        setPhase("idle")
        setTourId(null)
        setStepIndex(0)
        setChat([])
        setChatInput("")
        setTyping(false)
        setAsstPos(null)
        animRef.current = null
        dragRef.current = null
        if (typingTimer.current) clearTimeout(typingTimer.current)
    }, [])

    /* Wait for the destination page + first target element to exist */
    useEffect(() => {
        if (phase !== "loading" || !tour) return
        if (pathname !== tour.path) return
        let tries = 0
        const iv = setInterval(() => {
            tries++
            if (document.querySelector(tour.steps[0].selector)) {
                clearInterval(iv)
                setPhase("active")
            } else if (tries > 60) {
                clearInterval(iv)
                endTour()
            }
        }, 160)
        return () => clearInterval(iv)
    }, [phase, pathname, tour, endTour])

    /* Scroll the current target into view on step change */
    useEffect(() => {
        if (phase !== "active" || !tour) return
        const el = document.querySelector(tour.steps[stepIndex].selector) as HTMLElement | null
        el?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, [phase, stepIndex, tour])

    /* Frame loop: smoothly interpolate spotlight + tooltip toward target rect */
    useEffect(() => {
        if (phase !== "active" || !tour) return
        let raf = 0
        const PAD = 10
        const tick = () => {
            const el = document.querySelector(tour.steps[stepIndex].selector) as HTMLElement | null
            if (el && spotRef.current) {
                const r = el.getBoundingClientRect()
                const target = { x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 }
                const a = animRef.current
                const k = 0.16
                const next = a
                    ? {
                          x: a.x + (target.x - a.x) * k,
                          y: a.y + (target.y - a.y) * k,
                          w: a.w + (target.w - a.w) * k,
                          h: a.h + (target.h - a.h) * k,
                      }
                    : target
                animRef.current = next
                const s = spotRef.current.style
                s.transform = `translate(${next.x}px, ${next.y}px)`
                s.width = `${next.w}px`
                s.height = `${next.h}px`
                s.opacity = "1"

                if (tipRef.current) {
                    const tw = tipRef.current.offsetWidth
                    const th = tipRef.current.offsetHeight
                    const vw = window.innerWidth
                    const vh = window.innerHeight
                    let tx = next.x + next.w / 2 - tw / 2
                    tx = Math.max(16, Math.min(tx, vw - tw - 16))
                    let ty = next.y + next.h + 18
                    if (ty + th > vh - 16) ty = next.y - th - 18
                    ty = Math.max(16, Math.min(ty, vh - th - 16))
                    tipRef.current.style.transform = `translate(${tx}px, ${ty}px)`
                    tipRef.current.style.opacity = "1"
                }
            }
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [phase, stepIndex, tour])

    /* Keyboard: Esc skips, arrows navigate */
    useEffect(() => {
        if (phase !== "active") return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") endTour()
            if (e.key === "ArrowRight") setStepIndex((i) => Math.min(i + 1, (tour?.steps.length ?? 1) - 1))
            if (e.key === "ArrowLeft") setStepIndex((i) => Math.max(i - 1, 0))
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [phase, tour, endTour])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [chat, typing])

    const askAssistant = () => {
        const q = chatInput.trim()
        if (!q || typing || !tour) return
        setChat((c) => [...c, { role: "user", text: q }])
        setChatInput("")
        setTyping(true)
        const answer = tour.steps[stepIndex].qa
        typingTimer.current = setTimeout(() => {
            setChat((c) => [...c, { role: "assistant", text: answer }])
            setTyping(false)
        }, 1100 + Math.random() * 600)
    }

    const step = tour && phase === "active" ? tour.steps[stepIndex] : null
    const isLast = tour ? stepIndex === tour.steps.length - 1 : false

    return (
        <AgentTourContext.Provider value={{ startTour, startDemo, isTouring: phase !== "idle" || demoPhase !== "idle" }}>
            {children}

            {/* ── Loading toast while navigating ── */}
            {phase === "loading" && tour && (
                <div
                    style={{
                        position: "fixed",
                        top: 24,
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 4000,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 18px",
                        borderRadius: 999,
                        background: "rgba(13,19,28,.92)",
                        border: "1px solid rgba(var(--preset-primary-rgb),.35)",
                        boxShadow: "0 12px 40px rgba(0,0,0,.45), 0 0 24px rgba(var(--preset-primary-rgb),.25)",
                        backdropFilter: "blur(12px)",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "'Outfit', -apple-system, sans-serif",
                        animation: "agt-fade-up .3s ease both",
                    }}
                >
                    <span
                        style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <Sparkles size={11} color="#fff" />
                    </span>
                    Taking you to the {tour.label}…
                    <span className="agt-dots" style={{ display: "inline-flex", gap: 3 }}>
                        <i /><i /><i />
                    </span>
                </div>
            )}

            {/* ── Active tour overlay ── */}
            {phase === "active" && tour && step && (
                <div style={{ position: "fixed", inset: 0, zIndex: 3000, fontFamily: "'Outfit', -apple-system, sans-serif" }}>
                    {/* Spotlight cutout — the giant box-shadow darkens everything around it */}
                    <div
                        ref={spotRef}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: 0,
                            height: 0,
                            opacity: 0,
                            borderRadius: 16,
                            boxShadow:
                                "0 0 0 200vmax rgba(4, 8, 16, .74), 0 0 0 3px rgba(var(--preset-primary-rgb), .85), 0 0 42px 6px rgba(var(--preset-primary-rgb), .4)",
                            pointerEvents: "none",
                            willChange: "transform, width, height",
                        }}
                    >
                        {/* soft inner glow */}
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: 16,
                                boxShadow: "inset 0 0 30px rgba(var(--preset-primary-rgb), .12)",
                            }}
                        />
                    </div>

                    {/* ── Explanation tooltip ── */}
                    <div
                        ref={tipRef}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            opacity: 0,
                            width: "min(400px, calc(100vw - 32px))",
                            background: "linear-gradient(160deg, #151d2c 0%, #101622 100%)",
                            border: "1px solid rgba(var(--preset-primary-rgb), .3)",
                            borderRadius: 18,
                            boxShadow: "0 24px 64px rgba(0,0,0,.55), 0 0 32px rgba(var(--preset-primary-rgb),.18)",
                            padding: "18px 20px 16px",
                            willChange: "transform",
                            color: "#fff",
                        }}
                    >
                        <div key={stepIndex} style={{ animation: "agt-fade-up .35s ease both" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                    <span
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: 9,
                                            background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            boxShadow: "0 4px 14px rgba(var(--preset-primary-rgb),.4)",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Sparkles size={13} color="#fff" />
                                    </span>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.2px" }}>{step.title}</div>
                                        <div style={{ fontSize: 9, fontWeight: 800, color: "var(--preset-lighter)", textTransform: "uppercase", letterSpacing: ".08em" }}>
                                            Guided tour · Step {stepIndex + 1} of {tour.steps.length}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={endTour}
                                    title="Skip tour"
                                    style={{
                                        width: 26,
                                        height: 26,
                                        borderRadius: 8,
                                        border: "1px solid rgba(255,255,255,.1)",
                                        background: "rgba(255,255,255,.05)",
                                        color: "rgba(255,255,255,.5)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        flexShrink: 0,
                                    }}
                                >
                                    <X size={13} />
                                </button>
                            </div>

                            <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,.78)" }}>{step.text}</p>

                            {/* Progress dots */}
                            <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
                                {tour.steps.map((_, i) => (
                                    <span
                                        key={i}
                                        onClick={() => setStepIndex(i)}
                                        style={{
                                            height: 4,
                                            borderRadius: 99,
                                            flex: i === stepIndex ? 2.6 : 1,
                                            background:
                                                i <= stepIndex
                                                    ? "linear-gradient(90deg, var(--preset-primary), var(--preset-lighter))"
                                                    : "rgba(255,255,255,.12)",
                                            cursor: "pointer",
                                            transition: "flex .35s cubic-bezier(.4,0,.2,1), background .25s ease",
                                        }}
                                    />
                                ))}
                            </div>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                <button
                                    onClick={endTour}
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        color: "rgba(255,255,255,.4)",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        padding: "8px 4px",
                                        fontFamily: "inherit",
                                    }}
                                >
                                    Skip tour
                                </button>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        onClick={() => setStepIndex((i) => Math.max(i - 1, 0))}
                                        disabled={stepIndex === 0}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 5,
                                            padding: "8px 14px",
                                            borderRadius: 10,
                                            border: "1px solid rgba(255,255,255,.12)",
                                            background: "rgba(255,255,255,.05)",
                                            color: stepIndex === 0 ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.75)",
                                            fontSize: 11,
                                            fontWeight: 700,
                                            cursor: stepIndex === 0 ? "default" : "pointer",
                                            fontFamily: "inherit",
                                        }}
                                    >
                                        <ArrowLeft size={12} />
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => (isLast ? endTour() : setStepIndex((i) => i + 1))}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 5,
                                            padding: "8px 18px",
                                            borderRadius: 10,
                                            border: "none",
                                            background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                                            color: "#fff",
                                            fontSize: 11,
                                            fontWeight: 800,
                                            cursor: "pointer",
                                            fontFamily: "inherit",
                                            boxShadow: "0 4px 16px rgba(var(--preset-primary-rgb),.35)",
                                        }}
                                    >
                                        {isLast ? "Finish" : "Next"}
                                        {!isLast && <ArrowRight size={12} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Floating AI assistant (draggable by its header) ── */}
                    <div
                        ref={asstRef}
                        style={{
                            position: "fixed",
                            ...(asstPos
                                ? { left: asstPos.x, top: asstPos.y, bottom: "auto", right: "auto" }
                                : { bottom: 20, right: 20 }),
                            width: "min(340px, calc(100vw - 32px))",
                            zIndex: 3005,
                            borderRadius: 20,
                            overflow: "hidden",
                            background: "linear-gradient(170deg, #161e2e 0%, #0f1622 100%)",
                            border: "1px solid rgba(var(--preset-primary-rgb), .28)",
                            boxShadow: "0 24px 64px rgba(0,0,0,.55), 0 0 28px rgba(var(--preset-primary-rgb),.14)",
                            animation: "agt-fade-up .4s ease both",
                        }}
                    >
                        {/* Header — drag handle */}
                        <div
                            onPointerDown={onAssistantDragStart}
                            title="Drag to move"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "12px 14px",
                                borderBottom: "1px solid rgba(255,255,255,.07)",
                                background: "rgba(var(--preset-primary-rgb), .07)",
                                cursor: dragRef.current ? "grabbing" : "grab",
                                touchAction: "none",
                                userSelect: "none",
                            }}
                        >
                            <GripHorizontal size={13} style={{ color: "rgba(255,255,255,.3)", flexShrink: 0 }} />
                            <span style={{ position: "relative", width: 34, height: 34, flexShrink: 0 }}>
                                <span
                                    style={{
                                        position: "absolute",
                                        inset: -3,
                                        borderRadius: "50%",
                                        border: "2px solid rgba(var(--preset-primary-rgb),.5)",
                                        animation: "agt-ring 2.2s ease-out infinite",
                                    }}
                                />
                                <span
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        borderRadius: "50%",
                                        background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 4px 16px rgba(var(--preset-primary-rgb),.45)",
                                    }}
                                >
                                    <Sparkles size={15} color="#fff" />
                                </span>
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: "-0.2px" }}>Shop Intel Agent</div>
                                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "rgba(255,255,255,.45)", fontWeight: 600 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                                    Guiding · {step.title}
                                </div>
                            </div>
                            <span
                                style={{
                                    fontSize: 9,
                                    fontWeight: 800,
                                    padding: "3px 8px",
                                    borderRadius: 6,
                                    background: "rgba(var(--preset-primary-rgb),.16)",
                                    border: "1px solid rgba(var(--preset-primary-rgb),.3)",
                                    color: "var(--preset-lighter)",
                                    letterSpacing: ".06em",
                                }}
                            >
                                {stepIndex + 1}/{tour.steps.length}
                            </span>
                        </div>

                        {/* Mini chat thread */}
                        <div style={{ maxHeight: 200, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                            {chat.slice(-6).map((m, i) => (
                                <div
                                    key={i}
                                    style={{
                                        alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                                        maxWidth: "88%",
                                        padding: "8px 11px",
                                        borderRadius: m.role === "user" ? "13px 13px 4px 13px" : "13px 13px 13px 4px",
                                        background:
                                            m.role === "user"
                                                ? "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))"
                                                : "rgba(255,255,255,.06)",
                                        border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,.07)",
                                        color: m.role === "user" ? "#fff" : "rgba(255,255,255,.8)",
                                        fontSize: 11.5,
                                        lineHeight: 1.55,
                                        animation: "agt-fade-up .3s ease both",
                                    }}
                                >
                                    {m.text}
                                </div>
                            ))}
                            {typing && (
                                <div
                                    style={{
                                        alignSelf: "flex-start",
                                        padding: "10px 13px",
                                        borderRadius: "13px 13px 13px 4px",
                                        background: "rgba(255,255,255,.06)",
                                        border: "1px solid rgba(255,255,255,.07)",
                                    }}
                                >
                                    <span className="agt-dots" style={{ display: "inline-flex", gap: 4 }}>
                                        <i /><i /><i />
                                    </span>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{ padding: "10px 12px 12px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    background: "rgba(255,255,255,.05)",
                                    border: "1px solid rgba(255,255,255,.1)",
                                    borderRadius: 12,
                                    padding: "4px 4px 4px 12px",
                                }}
                            >
                                <input
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && askAssistant()}
                                    placeholder={`Ask about ${step.title}…`}
                                    style={{
                                        flex: 1,
                                        minWidth: 0,
                                        background: "transparent",
                                        border: "none",
                                        outline: "none",
                                        color: "#fff",
                                        fontSize: 12,
                                        fontFamily: "inherit",
                                    }}
                                />
                                <button
                                    onClick={askAssistant}
                                    disabled={!chatInput.trim() || typing}
                                    style={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: 9,
                                        border: "none",
                                        background:
                                            chatInput.trim() && !typing
                                                ? "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))"
                                                : "rgba(255,255,255,.07)",
                                        color: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: chatInput.trim() && !typing ? "pointer" : "default",
                                        flexShrink: 0,
                                        transition: "background .2s ease",
                                    }}
                                >
                                    <Send size={13} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Autopilot overlay: AI cursor drives the real UI ── */}
            {demoPhase !== "idle" && (
                <div style={{ position: "fixed", inset: 0, zIndex: 3400, fontFamily: "'Outfit', -apple-system, sans-serif" }}>
                    {/* Transparent blocker — user input paused while the agent drives */}
                    <div style={{ position: "absolute", inset: 0, cursor: "none" }} />

                    {/* HUD */}
                    <div
                        style={{
                            position: "fixed",
                            top: 18,
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "9px 10px 9px 16px",
                            borderRadius: 999,
                            background: "rgba(13,19,28,.92)",
                            border: "1px solid rgba(var(--preset-primary-rgb),.35)",
                            boxShadow: "0 12px 40px rgba(0,0,0,.5), 0 0 24px rgba(var(--preset-primary-rgb),.25)",
                            backdropFilter: "blur(12px)",
                            zIndex: 3600,
                            animation: "agt-fade-up .3s ease both",
                        }}
                    >
                        <span style={{ position: "relative", display: "inline-flex", width: 9, height: 9 }}>
                            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#10b981", animation: "agt-ring 1.6s ease-out infinite" }} />
                            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#10b981" }} />
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: ".02em" }}>
                            Autopilot
                            <span style={{ color: "rgba(255,255,255,.45)", fontWeight: 600, marginLeft: 8 }}>
                                {demoLabel || (demoPhase === "done" ? "Handing control back to you" : "Working…")}
                            </span>
                        </span>
                        <button
                            onClick={endDemo}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "6px 13px",
                                borderRadius: 999,
                                border: "1px solid rgba(255,255,255,.15)",
                                background: "rgba(255,255,255,.08)",
                                color: "#fff",
                                fontSize: 10.5,
                                fontWeight: 800,
                                cursor: "pointer",
                                fontFamily: "inherit",
                            }}
                        >
                            <X size={11} />
                            {demoPhase === "done" ? "Done" : "Take over"}
                        </button>
                    </div>

                    {/* Click ripple */}
                    {ripple && (
                        <span
                            key={ripple.key}
                            style={{
                                position: "fixed",
                                left: ripple.x - 22,
                                top: ripple.y - 22,
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                border: "2.5px solid var(--preset-lighter)",
                                pointerEvents: "none",
                                zIndex: 3550,
                                animation: "agt-ripple .55s ease-out forwards",
                            }}
                        />
                    )}

                    {/* AI cursor */}
                    <div
                        ref={cursorRef}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            zIndex: 3500,
                            pointerEvents: "none",
                            willChange: "transform",
                            opacity: demoPhase === "done" ? 0 : 1,
                            transition: "opacity .6s ease",
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 2px 8px rgba(var(--preset-primary-rgb),.6))" }}>
                            <path d="M4 2 L20 12 L12.5 13.5 L9 21 Z" fill="var(--preset-primary)" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                        <div
                            style={{
                                position: "absolute",
                                left: 20,
                                top: 20,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "5px 11px",
                                borderRadius: 999,
                                whiteSpace: "nowrap",
                                background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                                boxShadow: "0 6px 20px rgba(var(--preset-primary-rgb),.45)",
                            }}
                        >
                            <Sparkles size={10} color="#fff" />
                            <span style={{ fontSize: 10.5, fontWeight: 800, color: "#fff" }}>{demoLabel || "Shop Intel Agent"}</span>
                        </div>
                    </div>

                    {/* Completion card */}
                    {demoPhase === "done" && (
                        <div
                            style={{
                                position: "fixed",
                                bottom: 26,
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "min(430px, calc(100vw - 32px))",
                                zIndex: 3600,
                                display: "flex",
                                gap: 12,
                                padding: "16px 18px",
                                borderRadius: 18,
                                background: "linear-gradient(160deg, #151d2c 0%, #101622 100%)",
                                border: "1px solid rgba(16,185,129,.4)",
                                boxShadow: "0 24px 64px rgba(0,0,0,.55), 0 0 28px rgba(16,185,129,.15)",
                                animation: "agt-fade-up .4s ease both",
                            }}
                        >
                            <span
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: "50%",
                                    flexShrink: 0,
                                    background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 4px 16px rgba(var(--preset-primary-rgb),.45)",
                                }}
                            >
                                <Sparkles size={15} color="#fff" />
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12.5, fontWeight: 800, color: "#10b981", marginBottom: 3 }}>Autopilot complete</div>
                                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "rgba(255,255,255,.78)" }}>{demoDoneText}</p>
                                <button
                                    onClick={endDemo}
                                    style={{
                                        marginTop: 10,
                                        padding: "7px 18px",
                                        borderRadius: 9,
                                        border: "none",
                                        background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                                        color: "#fff",
                                        fontSize: 11,
                                        fontWeight: 800,
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                        boxShadow: "0 4px 16px rgba(var(--preset-primary-rgb),.35)",
                                    }}
                                >
                                    Take it from here
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {(phase !== "idle" || demoPhase !== "idle") && (
                <style>{`
                    @keyframes agt-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes agt-ring { 0% { transform: scale(1); opacity: .8; } 100% { transform: scale(1.55); opacity: 0; } }
                    @keyframes agt-dot { 0%, 80%, 100% { transform: translateY(0); opacity: .35; } 40% { transform: translateY(-3px); opacity: 1; } }
                    .agt-dots i { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.7); display: inline-block; animation: agt-dot 1.2s infinite; }
                    .agt-dots i:nth-child(2) { animation-delay: .15s; }
                    .agt-dots i:nth-child(3) { animation-delay: .3s; }
                    @keyframes agt-ripple { 0% { transform: scale(.3); opacity: 1; } 100% { transform: scale(1.4); opacity: 0; } }
                `}</style>
            )}
        </AgentTourContext.Provider>
    )
}
