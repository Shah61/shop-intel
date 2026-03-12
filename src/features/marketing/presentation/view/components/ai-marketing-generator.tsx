"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useTheme } from "next-themes"
import {
    Pencil, Type, Plus, Trash2, Sparkles, Download, Play, GripVertical,
    ChevronDown, ChevronUp, Search, Copy, Star, Wand2, Image, Film,
    RotateCcw, Eraser, Minus, X, Check, Layers, MessageSquare, Save,
    Maximize2, Minimize2, Eye, EyeOff,
} from "lucide-react"

/* ════════════════════════════════════════════
   Types
   ════════════════════════════════════════════ */
interface CanvasPanel {
    id: string
    title: string
    description: string
    dataUrl: string | null
    enhancedUrl: string | null
    isEnhancing: boolean
}

interface PromptTemplate {
    id: string
    title: string
    category: "image" | "video"
    prompt: string
    rating: number
    uses: number
}

/* ════════════════════════════════════════════
   Mock prompt library
   ════════════════════════════════════════════ */
const PROMPT_LIBRARY: PromptTemplate[] = [
    { id: "1", title: "Product Showcase Hero", category: "image", prompt: "A premium product floating in mid-air with dramatic studio lighting, soft shadows, and a clean gradient background. Hyper-realistic, 8K quality, commercial photography style.", rating: 4.9, uses: 12400 },
    { id: "2", title: "Lifestyle Scene", category: "image", prompt: "A lifestyle photograph of a person naturally using the product in a beautiful modern home. Warm natural lighting, bokeh background, authentic and aspirational feel.", rating: 4.8, uses: 9800 },
    { id: "3", title: "Explainer Video Script", category: "video", prompt: "Create a 30-second explainer video script: Hook (3s) → Problem statement (5s) → Solution intro (5s) → 3 key benefits (10s) → Social proof (3s) → CTA (4s). Energetic, modern tone.", rating: 4.9, uses: 15200 },
    { id: "4", title: "Flat Lay Composition", category: "image", prompt: "A beautiful flat lay arrangement on a marble surface with the product at the center, surrounded by complementary props. Overhead shot, soft diffused lighting, Instagram-worthy aesthetic.", rating: 4.7, uses: 8600 },
    { id: "5", title: "Before & After Split", category: "image", prompt: "A clean before/after split-screen comparison showing transformation. Left side muted and dull, right side vibrant and polished. Minimalist design with subtle divider line.", rating: 4.6, uses: 7200 },
    { id: "6", title: "UGC-Style Testimonial", category: "video", prompt: "Script for a 15-second UGC-style testimonial video: Selfie angle, natural setting. 'I've been using [product] for [time] and honestly...' Structure: reaction → benefit → recommendation. Casual, authentic.", rating: 4.8, uses: 11000 },
    { id: "7", title: "Cinematic Brand Story", category: "video", prompt: "A 60-second cinematic brand story: Opening with an emotional hook, journey through the brand's mission, showcasing craftsmanship and quality, ending with an inspiring call to action. Film-grain aesthetic.", rating: 4.9, uses: 6500 },
    { id: "8", title: "Social Media Carousel", category: "image", prompt: "Design a 5-slide carousel post. Slide 1: Bold hook question. Slides 2-4: Tips with icons and short text. Slide 5: CTA with brand colors. Clean, modern, consistent visual style throughout.", rating: 4.7, uses: 13800 },
]

/* ════════════════════════════════════════════
   Drawing Canvas Component
   ════════════════════════════════════════════ */
function DrawingCanvas({
    panel,
    onUpdate,
    onRemove,
    index,
    totalPanels,
    onMoveUp,
    onMoveDown,
    isDark,
}: {
    panel: CanvasPanel
    onUpdate: (updates: Partial<CanvasPanel>) => void
    onRemove: () => void
    index: number
    totalPanels: number
    onMoveUp: () => void
    onMoveDown: () => void
    isDark: boolean
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fullscreenCanvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [tool, setTool] = useState<"pen" | "eraser">("pen")
    const [brushSize, setBrushSize] = useState(3)
    const [isDescribing, setIsDescribing] = useState(false)
    const [hasDrawn, setHasDrawn] = useState(!!panel.dataUrl)
    const [collapsed, setCollapsed] = useState(false)
    const [fullscreen, setFullscreen] = useState(false)
    const lastPoint = useRef<{ x: number; y: number } | null>(null)

    const CANVAS_W = 400
    const CANVAS_H = 300
    const FS_CANVAS_W = 1200
    const FS_CANVAS_H = 800

    const activeCanvasRef = fullscreen ? fullscreenCanvasRef : canvasRef

    const initCanvas = useCallback((canvas: HTMLCanvasElement | null, w: number, h: number, dataUrl: string | null) => {
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        canvas.width = w
        canvas.height = h
        ctx.fillStyle = isDark ? "#1a1025" : "#ffffff"
        ctx.fillRect(0, 0, w, h)
        if (dataUrl) {
            const img = new window.Image()
            img.onload = () => {
                ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h)
            }
            img.src = dataUrl
        }
    }, [isDark])

    useEffect(() => {
        initCanvas(canvasRef.current, CANVAS_W, CANVAS_H, panel.dataUrl)
    }, [isDark, panel.dataUrl, initCanvas])

    useEffect(() => {
        if (fullscreen) {
            initCanvas(fullscreenCanvasRef.current, FS_CANVAS_W, FS_CANVAS_H, panel.dataUrl)
        }
    }, [fullscreen, initCanvas, panel.dataUrl])

    const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        const canvas = activeCanvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        if ("touches" in e) {
            const touch = e.touches[0] || e.changedTouches[0]
            return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY }
        }
        return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
    }, [activeCanvasRef])

    const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault()
        setIsDrawing(true)
        const pos = getPos(e)
        lastPoint.current = pos
        const ctx = activeCanvasRef.current?.getContext("2d")
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2)
        ctx.fillStyle = tool === "eraser" ? (isDark ? "#1a1025" : "#ffffff") : (isDark ? "#e5e7eb" : "#1a1025")
        ctx.fill()
    }, [getPos, brushSize, tool, isDark, activeCanvasRef])

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return
        e.preventDefault()
        const ctx = activeCanvasRef.current?.getContext("2d")
        if (!ctx || !lastPoint.current) return
        const pos = getPos(e)
        ctx.beginPath()
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y)
        ctx.lineTo(pos.x, pos.y)
        ctx.strokeStyle = tool === "eraser" ? (isDark ? "#1a1025" : "#ffffff") : (isDark ? "#e5e7eb" : "#1a1025")
        ctx.lineWidth = tool === "eraser" ? brushSize * 3 : brushSize
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.stroke()
        lastPoint.current = pos
    }, [isDrawing, getPos, brushSize, tool, isDark, activeCanvasRef])

    const endDraw = useCallback(() => {
        if (!isDrawing) return
        setIsDrawing(false)
        lastPoint.current = null
        setHasDrawn(true)
        const canvas = activeCanvasRef.current
        if (canvas) onUpdate({ dataUrl: canvas.toDataURL() })
    }, [isDrawing, onUpdate, activeCanvasRef])

    const clearCanvas = () => {
        const canvas = activeCanvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.fillStyle = isDark ? "#1a1025" : "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        setHasDrawn(false)
        onUpdate({ dataUrl: null, enhancedUrl: null })
    }

    const handleEnhance = () => {
        if (!hasDrawn) return
        onUpdate({ isEnhancing: true })
        setTimeout(() => {
            onUpdate({ isEnhancing: false, enhancedUrl: panel.dataUrl })
        }, 2500)
    }

    const exitFullscreen = () => {
        const fsCanvas = fullscreenCanvasRef.current
        if (fsCanvas) {
            onUpdate({ dataUrl: fsCanvas.toDataURL() })
        }
        setFullscreen(false)
    }

    useEffect(() => {
        if (!fullscreen) return
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") exitFullscreen()
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [fullscreen])

    const accent = getComputedStyle(document.documentElement).getPropertyValue("--preset-primary").trim() || "#7c3aed"
    const cardBg = isDark ? "linear-gradient(135deg, rgba(26, 34, 44, 0.9), rgba(35, 45, 56, 0.85))" : "rgba(0,0,0,0.02)"
    const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
    const textPrimary = isDark ? "hsl(var(--foreground))" : "hsl(var(--foreground))"
    const textSecondary = "hsl(var(--muted-foreground))"

    const toolbarButtons = (size: "sm" | "lg") => {
        const s = size === "lg"
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {([
                        { id: "pen" as const, icon: <Pencil size={s ? 16 : 15} />, label: "Pen" },
                        { id: "eraser" as const, icon: <Eraser size={s ? 16 : 15} />, label: "Eraser" },
                    ]).map((tl) => (
                        <button
                            key={tl.id}
                            onClick={() => setTool(tl.id)}
                            style={{
                                display: "flex", alignItems: "center", gap: 5, padding: s ? "8px 16px" : "6px 12px",
                                borderRadius: s ? 10 : 8, border: `1px solid ${tool === tl.id ? accent : borderColor}`,
                                background: tool === tl.id ? `${accent}18` : "transparent",
                                color: tool === tl.id ? accent : textSecondary,
                                fontSize: s ? 13 : 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                transition: "all 0.2s ease",
                            }}
                        >
                            {tl.icon} {tl.label}
                        </button>
                    ))}
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 6 }}>
                        <Minus size={12} color={textSecondary} />
                        <input
                            type="range" min={1} max={fullscreen ? 20 : 12} value={brushSize}
                            onChange={(e) => setBrushSize(Number(e.target.value))}
                            style={{ width: s ? 90 : 60, cursor: "pointer", accentColor: accent }}
                        />
                        <Plus size={12} color={textSecondary} />
                        <span style={{ fontSize: 11, color: textSecondary, marginLeft: 2, minWidth: 22 }}>{brushSize}px</span>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button onClick={clearCanvas} style={{ display: "flex", alignItems: "center", gap: 5, padding: s ? "8px 16px" : "6px 12px", borderRadius: s ? 10 : 8, border: `1px solid ${borderColor}`, background: "transparent", color: textSecondary, fontSize: s ? 13 : 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        <RotateCcw size={s ? 15 : 14} /> Clear
                    </button>
                    <button onClick={handleEnhance} disabled={!hasDrawn || panel.isEnhancing} style={{
                        display: "flex", alignItems: "center", gap: 5, padding: s ? "8px 18px" : "6px 14px",
                        borderRadius: s ? 10 : 8, border: "none",
                        background: hasDrawn ? accent : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
                        color: hasDrawn ? "#fff" : textSecondary,
                        fontSize: s ? 13 : 12, fontWeight: 700, cursor: hasDrawn ? "pointer" : "default",
                        fontFamily: "inherit", opacity: panel.isEnhancing ? 0.6 : 1,
                        transition: "all 0.2s ease",
                    }}>
                        <Sparkles size={s ? 15 : 14} /> Enhance
                    </button>
                </div>
            </div>
        )
    }

    const canvasEvents = {
        onMouseDown: startDraw,
        onMouseMove: draw,
        onMouseUp: endDraw,
        onMouseLeave: endDraw,
        onTouchStart: startDraw,
        onTouchMove: draw,
        onTouchEnd: endDraw,
    }

    const enhancingOverlay = (
        <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
            backdropFilter: "blur(4px)", borderRadius: 14, zIndex: 5,
        }}>
            <div style={{ width: 40, height: 40, border: `3px solid ${accent}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin-enhance 0.8s linear infinite" }} />
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>AI is enhancing...</span>
        </div>
    )

    /* ─── Fullscreen overlay ─── */
    if (fullscreen) {
        return (
            <div style={{
                position: "fixed", inset: 0, zIndex: 10000,
                background: isDark ? "#0a0612" : "#f0f1f3",
                display: "flex", flexDirection: "column",
                animation: "fadeInUp 0.3s ease",
            }}>
                {/* Fullscreen header */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 24px",
                    borderBottom: `1px solid ${borderColor}`,
                    background: isDark ? "rgba(255,255,255,0.02)" : "#fff",
                    flexShrink: 0,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontSize: 15, fontWeight: 800,
                        }}>
                            {index + 1}
                        </div>
                        <input
                            value={panel.title}
                            onChange={(e) => onUpdate({ title: e.target.value })}
                            placeholder={`Scene ${index + 1}`}
                            style={{
                                background: "transparent", border: "none", outline: "none",
                                fontSize: 17, fontWeight: 700, color: textPrimary,
                                width: 220, fontFamily: "inherit",
                            }}
                        />
                        <span style={{ fontSize: 11, color: textSecondary, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", padding: "3px 10px", borderRadius: 6, fontWeight: 600 }}>
                            {FS_CANVAS_W} × {FS_CANVAS_H}
                        </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: textSecondary }}>Press <kbd style={{ padding: "1px 6px", borderRadius: 4, border: `1px solid ${borderColor}`, fontSize: 10, fontFamily: "monospace" }}>ESC</kbd> to exit</span>
                        <button
                            onClick={exitFullscreen}
                            style={{
                                display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                                borderRadius: 10, border: "none", background: accent,
                                color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                            }}
                        >
                            <Minimize2 size={15} /> Done
                        </button>
                    </div>
                </div>

                {/* Fullscreen canvas area */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflow: "auto" }}>
                    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: `1px solid ${borderColor}`, boxShadow: `0 8px 40px ${isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.1)"}`, maxWidth: "100%", maxHeight: "100%" }}>
                        <canvas
                            ref={fullscreenCanvasRef}
                            style={{ display: "block", cursor: tool === "eraser" ? "cell" : "crosshair", touchAction: "none", maxWidth: "100%", maxHeight: "calc(100vh - 180px)", objectFit: "contain" }}
                            {...canvasEvents}
                        />
                        {panel.isEnhancing && enhancingOverlay}
                    </div>
                </div>

                {/* Fullscreen toolbar + description */}
                <div style={{
                    padding: "14px 24px 18px", borderTop: `1px solid ${borderColor}`,
                    background: isDark ? "rgba(255,255,255,0.02)" : "#fff",
                    flexShrink: 0,
                }}>
                    {toolbarButtons("lg")}
                    {/* Inline description in fullscreen */}
                    <div style={{ marginTop: 12, display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <MessageSquare size={15} color={textSecondary} style={{ marginTop: 8, flexShrink: 0 }} />
                        <textarea
                            value={panel.description}
                            onChange={(e) => onUpdate({ description: e.target.value })}
                            placeholder="Describe this scene... (e.g., 'Character enters from the left, camera pans to reveal the product')"
                            rows={2}
                            style={{
                                flex: 1, padding: "8px 12px", borderRadius: 10,
                                border: `1px solid ${borderColor}`, background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                                color: textPrimary, fontSize: 13, fontFamily: "inherit",
                                resize: "none", outline: "none", lineHeight: 1.5,
                            }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
                            onBlur={(e) => (e.currentTarget.style.borderColor = borderColor)}
                        />
                    </div>
                </div>
            </div>
        )
    }

    /* ─── Collapsed / thumbnail view ─── */
    if (collapsed) {
        return (
            <div style={{
                background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}`,
                overflow: "hidden", transition: "all 0.3s ease",
            }}>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", cursor: "pointer",
                }} onClick={() => setCollapsed(false)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: 8,
                            background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontSize: 12, fontWeight: 800,
                        }}>
                            {index + 1}
                        </div>
                        {panel.dataUrl && (
                            <div style={{ width: 44, height: 33, borderRadius: 6, overflow: "hidden", border: `1px solid ${borderColor}`, flexShrink: 0 }}>
                                <img src={panel.dataUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                            </div>
                        )}
                        <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{panel.title || `Scene ${index + 1}`}</span>
                        {panel.description && (
                            <span style={{ fontSize: 11, color: textSecondary, fontStyle: "italic", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                — {panel.description}
                            </span>
                        )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {panel.enhancedUrl && <Sparkles size={13} color={accent} />}
                        <Eye size={15} color={textSecondary} />
                    </div>
                </div>
            </div>
        )
    }

    /* ─── Normal card view ─── */
    return (
        <div style={{
            background: cardBg,
            borderRadius: 20,
            border: `1px solid ${borderColor}`,
            overflow: "hidden",
            transition: "box-shadow 0.3s ease",
        }}>
            {/* Panel header */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 18px",
                borderBottom: `1px solid ${borderColor}`,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 14, fontWeight: 800,
                    }}>
                        {index + 1}
                    </div>
                    <input
                        value={panel.title}
                        onChange={(e) => onUpdate({ title: e.target.value })}
                        placeholder={`Scene ${index + 1}`}
                        style={{
                            background: "transparent", border: "none", outline: "none",
                            fontSize: 15, fontWeight: 700, color: textPrimary,
                            width: 160, fontFamily: "inherit",
                        }}
                    />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button onClick={() => setCollapsed(true)} title="Collapse" style={{ background: "none", border: "none", cursor: "pointer", color: textSecondary, padding: 4, display: "flex", borderRadius: 6, transition: "color 0.15s" }} onMouseOver={e => (e.currentTarget.style.color = textPrimary)} onMouseOut={e => (e.currentTarget.style.color = textSecondary)}>
                        <EyeOff size={15} />
                    </button>
                    <button onClick={() => setFullscreen(true)} title="Fullscreen" style={{ background: "none", border: "none", cursor: "pointer", color: textSecondary, padding: 4, display: "flex", borderRadius: 6, transition: "color 0.15s" }} onMouseOver={e => (e.currentTarget.style.color = textPrimary)} onMouseOut={e => (e.currentTarget.style.color = textSecondary)}>
                        <Maximize2 size={15} />
                    </button>
                    <div style={{ width: 1, height: 16, background: borderColor, margin: "0 2px" }} />
                    <button onClick={onMoveUp} disabled={index === 0} style={{ background: "none", border: "none", cursor: index === 0 ? "default" : "pointer", opacity: index === 0 ? 0.3 : 1, color: textSecondary, padding: 4, display: "flex", borderRadius: 6 }}>
                        <ChevronUp size={16} />
                    </button>
                    <button onClick={onMoveDown} disabled={index === totalPanels - 1} style={{ background: "none", border: "none", cursor: index === totalPanels - 1 ? "default" : "pointer", opacity: index === totalPanels - 1 ? 0.3 : 1, color: textSecondary, padding: 4, display: "flex", borderRadius: 6 }}>
                        <ChevronDown size={16} />
                    </button>
                    <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4, display: "flex", borderRadius: 6 }}>
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Canvas area */}
            <div style={{ padding: 16 }}>
                <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: `1px solid ${borderColor}` }}>
                    <canvas
                        ref={canvasRef}
                        style={{ width: "100%", height: "auto", display: "block", cursor: tool === "eraser" ? "cell" : "crosshair", touchAction: "none" }}
                        {...canvasEvents}
                    />
                    {panel.isEnhancing && enhancingOverlay}
                    {!hasDrawn && !panel.dataUrl && (
                        <div style={{
                            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center", pointerEvents: "none",
                            color: textSecondary, gap: 6,
                        }}>
                            <Pencil size={28} strokeWidth={1.5} />
                            <span style={{ fontSize: 13, fontWeight: 500 }}>Sketch your scene here</span>
                            <span style={{ fontSize: 11, color: textSecondary, opacity: 0.6 }}>or press expand for fullscreen drawing</span>
                        </div>
                    )}
                </div>

                {/* Toolbar */}
                <div style={{ marginTop: 12 }}>
                    {toolbarButtons("sm")}
                </div>

                {/* Description */}
                <div style={{ marginTop: 14 }}>
                    <button
                        onClick={() => setIsDescribing(!isDescribing)}
                        style={{
                            display: "flex", alignItems: "center", gap: 6, background: "none",
                            border: "none", cursor: "pointer", color: textSecondary,
                            fontSize: 12, fontWeight: 600, fontFamily: "inherit", padding: 0,
                        }}
                    >
                        <MessageSquare size={14} />
                        {panel.description ? "Edit description" : "Add description"}
                        <ChevronDown size={13} style={{ transform: isDescribing ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                    </button>
                    {isDescribing && (
                        <textarea
                            value={panel.description}
                            onChange={(e) => onUpdate({ description: e.target.value })}
                            placeholder="Describe what this scene is about... (e.g., 'Character enters from the left, camera pans to reveal the product')"
                            rows={3}
                            style={{
                                width: "100%", marginTop: 8, padding: 12, borderRadius: 10,
                                border: `1px solid ${borderColor}`, background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                                color: textPrimary, fontSize: 13, fontFamily: "inherit",
                                resize: "vertical", outline: "none", lineHeight: 1.5,
                            }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
                            onBlur={(e) => (e.currentTarget.style.borderColor = borderColor)}
                        />
                    )}
                    {panel.description && !isDescribing && (
                        <p style={{ fontSize: 12, color: textSecondary, margin: "6px 0 0", lineHeight: 1.4, fontStyle: "italic" }}>
                            &ldquo;{panel.description}&rdquo;
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════ */
export default function AIMarketingGenerator() {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"
    const [mode, setMode] = useState<"drawing" | "text">("drawing")
    const [panels, setPanels] = useState<CanvasPanel[]>([])
    const [textPrompt, setTextPrompt] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedContent, setGeneratedContent] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterCategory, setFilterCategory] = useState<"all" | "image" | "video">("all")

    const accent = typeof window !== "undefined" ? (getComputedStyle(document.documentElement).getPropertyValue("--preset-primary").trim() || "#7c3aed") : "#7c3aed"
    const cardBg = isDark ? "linear-gradient(135deg, rgba(26, 34, 44, 0.9), rgba(35, 45, 56, 0.85))" : "rgba(0,0,0,0.02)"
    const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
    const textPrimary = isDark ? "hsl(var(--foreground))" : "hsl(var(--foreground))"
    const textSecondary = "hsl(var(--muted-foreground))"
    const surfaceBg = isDark ? "#0f0a18" : "#f8f9fb"

    const addPanel = () => {
        setPanels(prev => [...prev, {
            id: `panel-${Date.now()}`,
            title: `Scene ${prev.length + 1}`,
            description: "",
            dataUrl: null,
            enhancedUrl: null,
            isEnhancing: false,
        }])
    }

    const updatePanel = (id: string, updates: Partial<CanvasPanel>) => {
        setPanels(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
    }

    const removePanel = (id: string) => {
        setPanels(prev => prev.filter(p => p.id !== id))
    }

    const movePanel = (fromIndex: number, toIndex: number) => {
        setPanels(prev => {
            const arr = [...prev]
            const [item] = arr.splice(fromIndex, 1)
            arr.splice(toIndex, 0, item)
            return arr
        })
    }

    const handleGenerateText = () => {
        if (!textPrompt.trim()) return
        setIsGenerating(true)
        setTimeout(() => {
            setGeneratedContent(
                `**Generated Marketing Content**\n\nBased on your prompt: "${textPrompt}"\n\n` +
                `Here's a compelling marketing copy that captures your brand's essence:\n\n` +
                `"Discover the future of [your product]. Crafted with precision, designed for impact. ` +
                `Join thousands who've already made the switch."\n\n` +
                `---\n\n**Suggested Visuals:**\n• Hero shot with dramatic lighting\n• Lifestyle scene showcasing real-world usage\n• Before/after comparison\n\n` +
                `**Recommended Platforms:** Instagram, TikTok, Facebook Ads\n**Estimated Reach:** 50K-200K impressions`
            )
            setIsGenerating(false)
        }, 2000)
    }

    const handleGenerateVideo = () => {
        if (panels.length === 0) return
        setIsGenerating(true)
        setTimeout(() => setIsGenerating(false), 3000)
    }

    const filteredPrompts = PROMPT_LIBRARY.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.prompt.toLowerCase().includes(searchQuery.toLowerCase())
        const matchCategory = filterCategory === "all" || p.category === filterCategory
        return matchSearch && matchCategory
    })

    return (
        <div style={{ minHeight: "100%", fontFamily: "inherit" }}>
            {/* Mode toggle */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 4, padding: 4, borderRadius: 14,
                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                width: "fit-content", margin: "0 auto 28px",
            }}>
                {([
                    { id: "drawing" as const, icon: <Pencil size={16} />, label: "Drawing Mode" },
                    { id: "text" as const, icon: <Type size={16} />, label: "Text Mode" },
                ]).map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 24px", borderRadius: 11, border: "none",
                            background: mode === m.id ? accent : "transparent",
                            color: mode === m.id ? "#fff" : textSecondary,
                            fontSize: 14, fontWeight: 600, cursor: "pointer",
                            fontFamily: "inherit",
                            transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                            boxShadow: mode === m.id ? `0 4px 14px ${accent}40` : "none",
                        }}
                    >
                        {m.icon} {m.label}
                    </button>
                ))}
            </div>

            {/* ════════ DRAWING MODE ════════ */}
            {mode === "drawing" && (
                <div>
                    {/* Panels grid */}
                    {panels.length === 0 ? (
                        <div style={{
                            textAlign: "center", padding: "60px 20px",
                            borderRadius: 24, border: `2px dashed ${borderColor}`,
                            background: cardBg,
                        }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: 20, margin: "0 auto 20px",
                                background: `${accent}15`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <Layers size={28} color={accent} />
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: textPrimary, margin: "0 0 8px" }}>
                                Create Your Storyboard
                            </h3>
                            <p style={{ fontSize: 13, color: textSecondary, margin: "0 0 24px", maxWidth: 400, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
                                Add canvas panels, sketch your scenes, and let AI enhance them into polished marketing visuals. Arrange them in sequence to generate a video.
                            </p>
                            <button
                                onClick={addPanel}
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: 8,
                                    padding: "12px 28px", borderRadius: 12, border: "none",
                                    background: accent, color: "#fff",
                                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                                    fontFamily: "inherit",
                                    boxShadow: `0 4px 14px ${accent}40`,
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 6px 20px ${accent}50` }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 14px ${accent}40` }}
                            >
                                <Plus size={18} /> Add First Canvas
                            </button>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 20 }}>
                                {panels.map((panel, i) => (
                                    <DrawingCanvas
                                        key={panel.id}
                                        panel={panel}
                                        index={i}
                                        totalPanels={panels.length}
                                        onUpdate={(u) => updatePanel(panel.id, u)}
                                        onRemove={() => removePanel(panel.id)}
                                        onMoveUp={() => movePanel(i, i - 1)}
                                        onMoveDown={() => movePanel(i, i + 1)}
                                        isDark={isDark}
                                    />
                                ))}

                                {/* Add canvas card */}
                                <button
                                    onClick={addPanel}
                                    style={{
                                        minHeight: 300, borderRadius: 20,
                                        border: `2px dashed ${borderColor}`,
                                        background: cardBg, cursor: "pointer",
                                        display: "flex", flexDirection: "column",
                                        alignItems: "center", justifyContent: "center", gap: 10,
                                        color: textSecondary, fontSize: 14, fontWeight: 600,
                                        fontFamily: "inherit",
                                        transition: "border-color 0.2s, background 0.2s",
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = `${accent}08` }}
                                    onMouseOut={(e) => { e.currentTarget.style.borderColor = borderColor; e.currentTarget.style.background = cardBg }}
                                >
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 14,
                                        background: `${accent}12`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        <Plus size={22} color={accent} />
                                    </div>
                                    Add Canvas
                                </button>
                            </div>

                            {/* Bottom actions */}
                            <div style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                marginTop: 28, padding: "20px 24px", borderRadius: 18,
                                background: cardBg, border: `1px solid ${borderColor}`,
                                flexWrap: "wrap", gap: 12,
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, color: textSecondary, fontSize: 13 }}>
                                    <Layers size={16} />
                                    <span><strong style={{ color: textPrimary }}>{panels.length}</strong> scene{panels.length !== 1 ? "s" : ""} in storyboard</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <button
                                        style={{
                                            display: "flex", alignItems: "center", gap: 6,
                                            padding: "10px 20px", borderRadius: 10,
                                            border: `1px solid ${borderColor}`,
                                            background: "transparent", color: textPrimary,
                                            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                        }}
                                    >
                                        <Save size={15} /> Save Draft
                                    </button>
                                    <button
                                        onClick={handleGenerateVideo}
                                        disabled={isGenerating}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 8,
                                            padding: "10px 24px", borderRadius: 10, border: "none",
                                            background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
                                            color: "#fff", fontSize: 13, fontWeight: 700,
                                            cursor: "pointer", fontFamily: "inherit",
                                            boxShadow: `0 4px 14px ${accent}35`,
                                            opacity: isGenerating ? 0.7 : 1,
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        {isGenerating ? (
                                            <><div style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin-enhance 0.6s linear infinite" }} /> Generating...</>
                                        ) : (
                                            <><Film size={16} /> Generate Video</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ════════ TEXT MODE ════════ */}
            {mode === "text" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
                    {/* Left: Text input & output */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Input card */}
                        <div style={{ background: cardBg, borderRadius: 20, border: `1px solid ${borderColor}`, padding: 24 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                <Wand2 size={18} color={accent} />
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: textPrimary, margin: 0 }}>Generate Content</h3>
                            </div>
                            <textarea
                                value={textPrompt}
                                onChange={(e) => setTextPrompt(e.target.value)}
                                placeholder="Describe what you want to create... (e.g., 'Create a TikTok ad for a luxury skincare product targeting young women, emphasizing natural ingredients and fast results')"
                                rows={6}
                                style={{
                                    width: "100%", padding: 16, borderRadius: 14,
                                    border: `1px solid ${borderColor}`,
                                    background: isDark ? "rgba(255,255,255,0.02)" : "#fff",
                                    color: textPrimary, fontSize: 14, fontFamily: "inherit",
                                    resize: "vertical", outline: "none", lineHeight: 1.6,
                                    transition: "border-color 0.2s",
                                }}
                                onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
                                onBlur={(e) => (e.currentTarget.style.borderColor = borderColor)}
                            />
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                                <span style={{ fontSize: 12, color: textSecondary }}>{textPrompt.length} characters</span>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        onClick={() => { setTextPrompt(""); setGeneratedContent(null) }}
                                        style={{
                                            padding: "9px 16px", borderRadius: 10, border: `1px solid ${borderColor}`,
                                            background: "transparent", color: textSecondary, fontSize: 13,
                                            fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                            display: "flex", alignItems: "center", gap: 5,
                                        }}
                                    >
                                        <X size={14} /> Clear
                                    </button>
                                    <button
                                        onClick={handleGenerateText}
                                        disabled={!textPrompt.trim() || isGenerating}
                                        style={{
                                            padding: "9px 20px", borderRadius: 10, border: "none",
                                            background: textPrompt.trim() ? accent : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
                                            color: textPrompt.trim() ? "#fff" : textSecondary,
                                            fontSize: 13, fontWeight: 700, cursor: textPrompt.trim() ? "pointer" : "default",
                                            fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
                                            boxShadow: textPrompt.trim() ? `0 4px 14px ${accent}35` : "none",
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        {isGenerating ? (
                                            <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin-enhance 0.6s linear infinite" }} /> Generating...</>
                                        ) : (
                                            <><Sparkles size={15} /> Generate</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Output card */}
                        {generatedContent && (
                            <div style={{ background: cardBg, borderRadius: 20, border: `1px solid ${borderColor}`, padding: 24, animation: "fadeInUp 0.4s ease" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <Check size={18} color="#22c55e" />
                                        <h3 style={{ fontSize: 15, fontWeight: 700, color: textPrimary, margin: 0 }}>Generated Content</h3>
                                    </div>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(generatedContent)}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                                                borderRadius: 8, border: `1px solid ${borderColor}`,
                                                background: "transparent", color: textSecondary,
                                                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                            }}
                                        >
                                            <Copy size={13} /> Copy
                                        </button>
                                        <button
                                            style={{
                                                display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                                                borderRadius: 8, border: "none",
                                                background: accent, color: "#fff",
                                                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                                            }}
                                        >
                                            <Download size={13} /> Export
                                        </button>
                                    </div>
                                </div>
                                <div style={{
                                    padding: 18, borderRadius: 14,
                                    background: isDark ? "rgba(255,255,255,0.02)" : "#fff",
                                    border: `1px solid ${borderColor}`,
                                    fontSize: 13, color: textPrimary, lineHeight: 1.7,
                                    whiteSpace: "pre-wrap",
                                }}>
                                    {generatedContent}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Prompt Library */}
                    <div style={{ background: cardBg, borderRadius: 20, border: `1px solid ${borderColor}`, overflow: "hidden" }}>
                        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${borderColor}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                <Star size={18} color={accent} />
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: textPrimary, margin: 0 }}>Prompt Library</h3>
                                <span style={{ fontSize: 11, fontWeight: 700, color: accent, background: `${accent}15`, padding: "2px 8px", borderRadius: 6 }}>
                                    TOP
                                </span>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <div style={{
                                    flex: 1, display: "flex", alignItems: "center", gap: 8,
                                    padding: "8px 12px", borderRadius: 10,
                                    background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
                                    border: `1px solid ${borderColor}`,
                                }}>
                                    <Search size={15} color={textSecondary} />
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search prompts..."
                                        style={{
                                            flex: 1, background: "transparent", border: "none", outline: "none",
                                            fontSize: 13, color: textPrimary, fontFamily: "inherit",
                                        }}
                                    />
                                </div>
                                <div style={{ display: "flex", gap: 4, padding: 3, borderRadius: 9, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}>
                                    {(["all", "image", "video"] as const).map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setFilterCategory(cat)}
                                            style={{
                                                padding: "5px 10px", borderRadius: 7, border: "none",
                                                background: filterCategory === cat ? accent : "transparent",
                                                color: filterCategory === cat ? "#fff" : textSecondary,
                                                fontSize: 11, fontWeight: 600, cursor: "pointer",
                                                fontFamily: "inherit", textTransform: "capitalize",
                                                transition: "all 0.2s ease",
                                            }}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div style={{ maxHeight: 520, overflowY: "auto", padding: "8px 12px" }}>
                            {filteredPrompts.map((prompt) => (
                                <div
                                    key={prompt.id}
                                    style={{
                                        padding: "14px 16px", borderRadius: 14, margin: "4px 0",
                                        border: `1px solid transparent`,
                                        cursor: "pointer",
                                        transition: "background 0.15s ease, border-color 0.15s ease",
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"; e.currentTarget.style.borderColor = borderColor }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent" }}
                                    onClick={() => setTextPrompt(prompt.prompt)}
                                >
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div style={{
                                                width: 24, height: 24, borderRadius: 7,
                                                background: prompt.category === "video" ? "rgba(239,68,68,0.12)" : `${accent}15`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}>
                                                {prompt.category === "video" ? <Film size={12} color="#ef4444" /> : <Image size={12} color={accent} />}
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>{prompt.title}</span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                            <Star size={11} color="#f59e0b" fill="#f59e0b" />
                                            <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b" }}>{prompt.rating}</span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 12, color: textSecondary, margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                        {prompt.prompt}
                                    </p>
                                    <span style={{ fontSize: 10, color: textSecondary, marginTop: 6, display: "inline-block" }}>
                                        {prompt.uses.toLocaleString()} uses
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin-enhance {
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
