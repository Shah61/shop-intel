"use client"

import { useState, useEffect, useCallback } from "react"
import { useTheme } from "next-themes"
import { X, Moon, Sun, Eye, AlignRight, Minimize2, Info } from "lucide-react"

export type NavLayout = "vertical" | "horizontal" | "mini"
export type NavColor = "integrate" | "apparent"
export type PresetColor = "green" | "blue" | "purple" | "cyan" | "orange" | "red"
type FontFamily = "Public Sans" | "Inter" | "DM Sans" | "Nunito Sans"

export const PRESET_COLORS: Record<PresetColor, { primary: string; light: string; lighter: string; pastel: string; gradient: string }> = {
    green: { primary: "#22c55e", light: "#16a34a", lighter: "#4ade80", pastel: "#d1fae5", gradient: "linear-gradient(135deg, #16a34a, #22c55e)" },
    blue: { primary: "#3b82f6", light: "#2563eb", lighter: "#60a5fa", pastel: "#dbeafe", gradient: "linear-gradient(135deg, #2563eb, #3b82f6)" },
    purple: { primary: "#7c3aed", light: "#6d28d9", lighter: "#a78bfa", pastel: "#edc9ff", gradient: "linear-gradient(135deg, #6d28d9, #7c3aed)" },
    cyan: { primary: "#06b6d4", light: "#0891b2", lighter: "#22d3ee", pastel: "#cffafe", gradient: "linear-gradient(135deg, #0891b2, #06b6d4)" },
    orange: { primary: "#d97706", light: "#b45309", lighter: "#f59e0b", pastel: "#fef3c7", gradient: "linear-gradient(135deg, #b45309, #d97706)" },
    red: { primary: "#ef4444", light: "#dc2626", lighter: "#f87171", pastel: "#fee2e2", gradient: "linear-gradient(135deg, #dc2626, #ef4444)" },
}

const FONT_STACKS: Record<FontFamily, string> = {
    "Public Sans": "'Public Sans', -apple-system, sans-serif",
    "Inter": "'Inter', -apple-system, sans-serif",
    "DM Sans": "'DM Sans', -apple-system, sans-serif",
    "Nunito Sans": "'Nunito Sans', -apple-system, sans-serif",
}

const FONT_URLS: Record<FontFamily, string> = {
    "Public Sans": "https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800&display=swap",
    "Inter": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
    "DM Sans": "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap",
    "Nunito Sans": "https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800&display=swap",
}

export function getStored<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback
    try {
        const val = localStorage.getItem(key)
        return val ? JSON.parse(val) : fallback
    } catch { return fallback }
}

/** Returns "r, g, b" for use in rgba(var(--preset-primary-rgb), 0.12) */
export function hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `${r}, ${g}, ${b}`
}

export function dispatchLayoutChange() {
    window.dispatchEvent(new Event("layout-settings-changed"))
}

interface Props {
    open: boolean
    onClose: () => void
}

export default function LayoutDrawer({ open, onClose }: Props) {
    const { resolvedTheme, setTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    const [contrast, setContrast] = useState(() => getStored("layout-contrast", false))
    const [rtl, setRtl] = useState(() => getStored("layout-rtl", false))
    const [compact, setCompact] = useState(() => getStored("layout-compact", false))
    const [navLayout, setNavLayout] = useState<NavLayout>(() => getStored("layout-nav", "vertical"))
    const [navColor, setNavColor] = useState<NavColor>(() => getStored("layout-nav-color", "integrate"))
    const [preset, setPreset] = useState<PresetColor>(() => getStored("layout-preset", "purple"))
    const [fontFamily, setFontFamily] = useState<FontFamily>(() => getStored("layout-font", "Public Sans"))
    const [fontSize, setFontSize] = useState(() => getStored("layout-font-size", 16))

    const persist = useCallback((key: string, val: unknown) => {
        if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(val))
    }, [])

    useEffect(() => {
        document.documentElement.dir = rtl ? "rtl" : "ltr"
        persist("layout-rtl", rtl)
    }, [rtl, persist])

    useEffect(() => {
        document.documentElement.classList.toggle("high-contrast", contrast)
        persist("layout-contrast", contrast)
    }, [contrast, persist])

    useEffect(() => {
        document.documentElement.classList.toggle("compact-mode", compact)
        persist("layout-compact", compact)
    }, [compact, persist])

    useEffect(() => {
        document.documentElement.style.setProperty("--font-family", FONT_STACKS[fontFamily])
        document.body.style.fontFamily = FONT_STACKS[fontFamily]
        const linkId = "layout-font-link"
        let link = document.getElementById(linkId) as HTMLLinkElement | null
        if (!link) {
            link = document.createElement("link")
            link.id = linkId
            link.rel = "stylesheet"
            document.head.appendChild(link)
        }
        link.href = FONT_URLS[fontFamily]
        persist("layout-font", fontFamily)
    }, [fontFamily, persist])

    useEffect(() => {
        document.documentElement.style.setProperty("--base-font-size", `${fontSize}px`)
        document.documentElement.style.fontSize = `${fontSize}px`
        persist("layout-font-size", fontSize)
    }, [fontSize, persist])

    useEffect(() => {
        const c = PRESET_COLORS[preset]
        document.documentElement.style.setProperty("--preset-primary", c.primary)
        document.documentElement.style.setProperty("--preset-lighter", c.lighter)
        document.documentElement.style.setProperty("--preset-primary-rgb", hexToRgb(c.primary))
        persist("layout-preset", preset)
        dispatchLayoutChange()
    }, [preset, persist])

    useEffect(() => {
        persist("layout-nav", navLayout)
        dispatchLayoutChange()
    }, [navLayout, persist])

    useEffect(() => {
        persist("layout-nav-color", navColor)
        dispatchLayoutChange()
    }, [navColor, persist])

    const bg = isDark ? "#1a1025" : "#ffffff"
    const cardBg = isDark ? "linear-gradient(135deg, rgba(26, 34, 44, 0.9), rgba(35, 45, 56, 0.85))" : "rgba(0,0,0,0.03)"
    const border = isDark ? "rgba(124,58,237,0.12)" : "rgba(0,0,0,0.08)"
    const textPrimary = isDark ? "#e5e7eb" : "#111827"
    const textSecondary = isDark ? "#9ca3af" : "#6b7280"
    const accent = PRESET_COLORS[preset].primary

    const toggleStyle = (active: boolean): React.CSSProperties => ({
        width: 42, height: 22, borderRadius: 11,
        background: active ? accent : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
        position: "relative", cursor: "pointer", flexShrink: 0,
        transition: "background 0.3s ease", border: "none", padding: 0,
    })
    const toggleKnob = (active: boolean): React.CSSProperties => ({
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 2, left: active ? 22 : 2,
        transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
    })

    const sectionLabel: React.CSSProperties = {
        fontSize: 11, fontWeight: 700, color: textSecondary,
        textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px",
    }

    const drawerSide = rtl ? "left" : "right"
    const drawerTransformHidden = rtl ? "translateX(-100%)" : "translateX(100%)"
    const drawerBorder = rtl ? { borderRight: `1px solid ${border}` } : { borderLeft: `1px solid ${border}` }
    const drawerShadow = rtl ? "8px 0 30px rgba(0,0,0,0.2)" : "-8px 0 30px rgba(0,0,0,0.2)"

    return (
        <>
            {/* Backdrop — no blur, subtle dim */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0, zIndex: 9998,
                    background: "rgba(0,0,0,0.15)",
                    opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
                    transition: "opacity 0.3s ease",
                }}
            />

            {/* Drawer */}
            <div
                style={{
                    position: "fixed", top: 0, [drawerSide]: 0, bottom: 0,
                    width: 340, maxWidth: "90vw", zIndex: 9999,
                    background: bg, ...drawerBorder,
                    boxShadow: open ? drawerShadow : "none",
                    transform: open ? "translateX(0)" : drawerTransformHidden,
                    transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "flex", flexDirection: "column",
                    overflowY: "auto",
                }}
            >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: textPrimary }}>Settings</span>
                    <button
                        onClick={onClose}
                        style={{ background: "none", border: "none", cursor: "pointer", color: textSecondary, padding: 4, borderRadius: 8, display: "flex" }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: "20px", flex: 1 }}>

                    {/* ─── Toggle cards row ─── */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
                        <div style={{ background: cardBg, borderRadius: 14, padding: "14px 14px 12px", border: `1px solid ${border}` }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                {isDark ? <Moon size={18} color={textSecondary} /> : <Sun size={18} color={textSecondary} />}
                                <button style={toggleStyle(isDark)} onClick={() => setTheme(isDark ? "light" : "dark")}>
                                    <div style={toggleKnob(isDark)} />
                                </button>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>Mode</span>
                        </div>
                        <div style={{ background: cardBg, borderRadius: 14, padding: "14px 14px 12px", border: `1px solid ${border}` }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                <Eye size={18} color={textSecondary} />
                                <button style={toggleStyle(contrast)} onClick={() => setContrast(!contrast)}>
                                    <div style={toggleKnob(contrast)} />
                                </button>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>Contrast</span>
                        </div>
                        <div style={{ background: cardBg, borderRadius: 14, padding: "14px 14px 12px", border: `1px solid ${border}` }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                <AlignRight size={18} color={textSecondary} />
                                <button style={toggleStyle(rtl)} onClick={() => setRtl(!rtl)}>
                                    <div style={toggleKnob(rtl)} />
                                </button>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>Right to left</span>
                        </div>
                        <div style={{ background: cardBg, borderRadius: 14, padding: "14px 14px 12px", border: `1px solid ${border}` }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                <Minimize2 size={18} color={textSecondary} />
                                <button style={toggleStyle(compact)} onClick={() => setCompact(!compact)}>
                                    <div style={toggleKnob(compact)} />
                                </button>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>Compact</span>
                                <Info size={13} color={textSecondary} />
                            </div>
                        </div>
                    </div>

                    {/* ─── Nav section ─── */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: textPrimary, background: cardBg, border: `1px solid ${border}`, borderRadius: 20, padding: "4px 12px" }}>Nav</span>
                            <Info size={13} color={textSecondary} />
                        </div>
                        <div style={{ background: cardBg, borderRadius: 14, padding: 16, border: `1px solid ${border}` }}>
                            <p style={sectionLabel}>Layout</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
                                {(["vertical", "horizontal", "mini"] as NavLayout[]).map((l) => (
                                    <button
                                        key={l}
                                        onClick={() => setNavLayout(l)}
                                        style={{
                                            background: navLayout === l ? (isDark ? `${accent}22` : `${accent}14`) : "transparent",
                                            border: `1.5px solid ${navLayout === l ? accent : border}`,
                                            borderRadius: 12, padding: 10, cursor: "pointer",
                                            aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center",
                                            transition: "border-color 0.2s, background 0.2s",
                                        }}
                                    >
                                        {l === "vertical" && (
                                            <div style={{ display: "flex", gap: 4, width: "100%", height: "100%" }}>
                                                <div style={{ width: "28%", borderRadius: 4, background: navLayout === l ? accent : (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)") }} />
                                                <div style={{ flex: 1, borderRadius: 4, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }} />
                                            </div>
                                        )}
                                        {l === "horizontal" && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%", height: "100%" }}>
                                                <div style={{ height: "22%", borderRadius: 4, background: navLayout === l ? accent : (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)") }} />
                                                <div style={{ flex: 1, borderRadius: 4, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }} />
                                            </div>
                                        )}
                                        {l === "mini" && (
                                            <div style={{ display: "flex", gap: 4, width: "100%", height: "100%" }}>
                                                <div style={{ width: "14%", borderRadius: 4, background: navLayout === l ? accent : (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)") }} />
                                                <div style={{ flex: 1, borderRadius: 4, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }}>
                                                    <div style={{ width: "60%", height: "30%", borderRadius: 3, margin: "8% auto 0", background: navLayout === l ? `${accent}44` : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)") }} />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <p style={sectionLabel}>Color</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                {(["integrate", "apparent"] as NavColor[]).map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setNavColor(c)}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 8,
                                            padding: "10px 14px", borderRadius: 12, cursor: "pointer",
                                            background: navColor === c ? (isDark ? `${accent}1a` : `${accent}0e`) : "transparent",
                                            border: `1.5px solid ${navColor === c ? accent : border}`,
                                            transition: "border-color 0.2s, background 0.2s",
                                        }}
                                    >
                                        <div style={{
                                            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                                            background: c === "integrate" ? accent : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"),
                                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
                                        }}>
                                            <div style={{ width: 10, height: 2.5, borderRadius: 2, background: "rgba(255,255,255,0.8)" }} />
                                            <div style={{ width: 6, height: 2.5, borderRadius: 2, background: "rgba(255,255,255,0.5)" }} />
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: navColor === c ? textPrimary : textSecondary, textTransform: "capitalize" }}>
                                            {c}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ─── Presets ─── */}
                    <div style={{ marginBottom: 24 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: textPrimary, background: cardBg, border: `1px solid ${border}`, borderRadius: 20, padding: "4px 12px", display: "inline-flex", alignItems: "center", gap: 5 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={textSecondary} strokeWidth="2.5"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.3" /></svg>
                            Presets
                        </span>
                        <div style={{ background: cardBg, borderRadius: 14, padding: 16, border: `1px solid ${border}`, marginTop: 12 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                                {(Object.keys(PRESET_COLORS) as PresetColor[]).map((p) => {
                                    const active = preset === p
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => setPreset(p)}
                                            style={{
                                                aspectRatio: "1", borderRadius: 14, cursor: "pointer",
                                                background: active ? (isDark ? `${PRESET_COLORS[p].primary}20` : `${PRESET_COLORS[p].primary}12`) : "transparent",
                                                border: `1.5px solid ${active ? PRESET_COLORS[p].primary : border}`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                transition: "border-color 0.2s, background 0.2s, transform 0.2s",
                                                transform: active ? "scale(1.05)" : "scale(1)",
                                            }}
                                        >
                                            <div style={{
                                                width: 36, height: 36, borderRadius: 10,
                                                background: PRESET_COLORS[p].gradient,
                                                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                                                boxShadow: active ? `0 4px 14px ${PRESET_COLORS[p].primary}50` : "none",
                                                transition: "box-shadow 0.2s",
                                            }}>
                                                <div style={{ width: 14, height: 2.5, borderRadius: 2, background: "rgba(255,255,255,0.8)" }} />
                                                <div style={{ width: 10, height: 2.5, borderRadius: 2, background: "rgba(255,255,255,0.5)" }} />
                                                <div style={{ width: 14, height: 2.5, borderRadius: 2, background: "rgba(255,255,255,0.8)" }} />
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ─── Font ─── */}
                    <div style={{ marginBottom: 24 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: textPrimary, background: cardBg, border: `1px solid ${border}`, borderRadius: 20, padding: "4px 12px", display: "inline-block" }}>
                            Font
                        </span>
                        <div style={{ background: cardBg, borderRadius: 14, padding: 16, border: `1px solid ${border}`, marginTop: 12 }}>
                            <p style={sectionLabel}>Family</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                                {(["Public Sans", "Inter", "DM Sans", "Nunito Sans"] as FontFamily[]).map((f) => {
                                    const active = fontFamily === f
                                    return (
                                        <button
                                            key={f}
                                            onClick={() => setFontFamily(f)}
                                            style={{
                                                padding: "16px 10px", borderRadius: 12, cursor: "pointer",
                                                background: active ? (isDark ? `${accent}1a` : `${accent}0e`) : "transparent",
                                                border: `1.5px solid ${active ? accent : border}`,
                                                textAlign: "center",
                                                transition: "border-color 0.2s, background 0.2s",
                                            }}
                                        >
                                            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: FONT_STACKS[f], color: active ? accent : textSecondary, marginBottom: 4, lineHeight: 1 }}>
                                                A<span style={{ fontSize: 18 }}>a</span>
                                            </div>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: active ? textPrimary : textSecondary }}>{f}</span>
                                        </button>
                                    )
                                })}
                            </div>
                            <p style={sectionLabel}>Size</p>
                            <div>
                                <div style={{ textAlign: "center", marginBottom: 8 }}>
                                    <span style={{
                                        display: "inline-block", padding: "3px 12px", borderRadius: 8,
                                        background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                                        fontSize: 13, fontWeight: 700, color: textPrimary,
                                    }}>
                                        {fontSize}px
                                    </span>
                                </div>
                                <div style={{ position: "relative", height: 28, display: "flex", alignItems: "center" }}>
                                    <input
                                        type="range" min={12} max={20} step={1} value={fontSize}
                                        onChange={(e) => setFontSize(Number(e.target.value))}
                                        style={{ width: "100%", cursor: "pointer", accentColor: accent }}
                                    />
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                                    <span style={{ fontSize: 10, color: textSecondary }}>12px</span>
                                    <span style={{ fontSize: 10, color: textSecondary }}>20px</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .high-contrast { filter: contrast(1.15); }
                .compact-mode main { padding: 8px !important; }
                .compact-mode main > * { gap: 8px !important; }
                input[type="range"] { -webkit-appearance: none; appearance: none; height: 6px; border-radius: 3px; background: ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}; outline: none; }
                input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%; background: ${accent}; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.25); }
                input[type="range"]::-webkit-slider-runnable-track { background: linear-gradient(90deg, ${accent} 0%, ${accent} ${((fontSize - 12) / 8) * 100}%, ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} ${((fontSize - 12) / 8) * 100}%, ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} 100%); height: 6px; border-radius: 3px; }
            `}</style>
        </>
    )
}
