"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useTheme } from "next-themes"
import {
    Pencil, Type, Plus, Trash2, Sparkles, Download, Play, GripVertical,
    ChevronDown, ChevronUp, Search, Copy, Star, Wand2, Image as ImageIcon, Film,
    RotateCcw, Eraser, Minus, X, Check, Layers, MessageSquare, Save,
    Maximize2, Minimize2, Eye, EyeOff, Upload, ArrowLeft, Camera, Palette,
    ArrowRight, Zap, Grid3X3, Move, FileImage, Package, RefreshCw,
} from "lucide-react"
import { useVideoGeneration } from "../context/video-generation-context"
import { saveImageToHistory } from "../lib/marketing-history"
import { MarketingHistorySection } from "./marketing-history-section"

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

interface VideoSettings {
    resolution: "480p" | "720p" | "1080p"
    duration: number // seconds, 3-10
}

interface SceneTemplate {
    id: string
    title: string
    subtitle: string
    prompt: string
    imageUrl: string
    category: string
    uses: number
    rating: number
}

type TextViewState = "gallery" | "upload" | "generating" | "result"

/* ════════════════════════════════════════════
   Scene Templates
   ════════════════════════════════════════════ */
const SCENE_TEMPLATES: SceneTemplate[] = [
    {
        id: "t1", title: "Outdoor Autumn Scene", subtitle: "Warm foliage & natural textures",
        prompt: "Outdoor autumn scene, featuring a moss-covered stone ledge in the foreground. Softly blurred background of warm red and orange foliage with a hint of light rain. Product placed naturally on the ledge with soft golden hour lighting.",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
        category: "Nature", uses: 14200, rating: 4.9,
    },
    {
        id: "t2", title: "Minimal Studio Float", subtitle: "Clean & airy product hero",
        prompt: "A premium product floating in mid-air with dramatic studio lighting, soft shadows beneath, and a clean warm beige gradient background. Hyper-realistic, 8K quality, commercial photography style.",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        category: "Studio", uses: 12400, rating: 4.9,
    },
    {
        id: "t3", title: "Velvet Noir Showcase", subtitle: "Dramatic dark product shot",
        prompt: "Product on a dark velvet surface with dramatic single-point lighting from above. Deep black background with subtle warm reflections. Luxury editorial feel, sharp focus on product, rich contrast.",
        imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop",
        category: "Dark", uses: 9800, rating: 4.8,
    },
    {
        id: "t4", title: "Morning Sunlight Room", subtitle: "Warm oak floor & window light",
        prompt: "Warm oak wooden floor, white wall behind, gentle morning sunlight creating diagonal lines across the scene. Product placed casually with natural shadows. Cozy, lifestyle feel with golden warm tones.",
        imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=300&fit=crop",
        category: "Interior", uses: 11000, rating: 4.8,
    },
    {
        id: "t5", title: "Wildflower Meadow", subtitle: "Open field with soft breeze",
        prompt: "Product placed on a glass surface in an open wildflower meadow. Tall grass swaying gently, scattered purple and yellow wildflowers. Overcast sky providing soft even lighting. Dreamy, editorial feel.",
        imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400&h=600&fit=crop",
        category: "Nature", uses: 8600, rating: 4.7,
    },
    {
        id: "t6", title: "Coffee Bean Bed", subtitle: "Rich dark roast backdrop",
        prompt: "Product emerging from a pile of roasted coffee beans. Dark dramatic background with single spotlight from above. Rich brown tones, sharp product focus, aromatic visual storytelling.",
        imageUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop",
        category: "Food", uses: 7200, rating: 4.7,
    },
    {
        id: "t7", title: "Water Splash Fresh", subtitle: "Dynamic liquid energy",
        prompt: "Product partially submerged in crystal clear water with dynamic splash frozen in time. Soft peach background. Droplets catching light like tiny diamonds. Fresh, clean, energetic feel.",
        imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
        category: "Dynamic", uses: 10500, rating: 4.8,
    },
    {
        id: "t8", title: "Rose Petal Wall", subtitle: "Lush floral abundance",
        prompt: "Product placed in front of a dense wall of fresh pink and white roses. Soft diffused lighting, romantic and luxurious feel. Petals in various stages of bloom creating rich texture.",
        imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400&h=400&fit=crop&q=80",
        category: "Floral", uses: 13800, rating: 4.9,
    },
    {
        id: "t9", title: "Emerald Velvet Chair", subtitle: "Modern interior vignette",
        prompt: "Product placed on a plush emerald green velvet chair in a minimal room. Sheer white curtains with warm sunlight streaming through creating stripe shadows on wooden floor.",
        imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=300&fit=crop",
        category: "Interior", uses: 9200, rating: 4.7,
    },
    {
        id: "t10", title: "Ocean Cliff Edge", subtitle: "Dramatic coastal setting",
        prompt: "Product displayed on a white marble pedestal at the edge of a sea cliff. Vast ocean stretching to the horizon. Clear blue sky, gentle sea breeze. Epic, aspirational, freedom.",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop",
        category: "Nature", uses: 6800, rating: 4.6,
    },
]



/* ════════════════════════════════════════════
   useMediaQuery hook
   ════════════════════════════════════════════ */
function useMediaQuery() {
    const [screen, setScreen] = useState<"mobile" | "tablet" | "desktop">("desktop")
    useEffect(() => {
        const check = () => {
            const w = window.innerWidth
            if (w < 640) setScreen("mobile")
            else if (w < 1024) setScreen("tablet")
            else setScreen("desktop")
        }
        check()
        window.addEventListener("resize", check)
        return () => window.removeEventListener("resize", check)
    }, [])
    return screen
}

/* ════════════════════════════════════════════
   Shared helpers
   ════════════════════════════════════════════ */
function getAccent() {
    if (typeof window === "undefined") return "#7c3aed"
    return getComputedStyle(document.documentElement).getPropertyValue("--preset-primary").trim() || "#7c3aed"
}


/* ════════════════════════════════════════════
   Custom Brush Slider — looks pretty everywhere
   ════════════════════════════════════════════ */
   function BrushSlider({ value, min, max, onChange, width, accent, isDark }: {
    value: number; min: number; max: number; onChange: (v: number) => void
    width: number; accent: string; isDark: boolean
}) {
    const trackRef = useRef<HTMLDivElement>(null)
    const [dragging, setDragging] = useState(false)
    const [hovered, setHovered] = useState(false)

    const percent = ((value - min) / (max - min)) * 100

    const updateFromClientX = useCallback((clientX: number) => {
        const track = trackRef.current
        if (!track) return
        const rect = track.getBoundingClientRect()
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
        const next = Math.round(min + ratio * (max - min))
        if (next !== value) onChange(next)
    }, [min, max, value, onChange])

    useEffect(() => {
        if (!dragging) return
        const handleMove = (e: MouseEvent | TouchEvent) => {
            const x = "touches" in e ? e.touches[0].clientX : e.clientX
            updateFromClientX(x)
        }
        const handleUp = () => setDragging(false)
        window.addEventListener("mousemove", handleMove)
        window.addEventListener("mouseup", handleUp)
        window.addEventListener("touchmove", handleMove, { passive: false })
        window.addEventListener("touchend", handleUp)
        return () => {
            window.removeEventListener("mousemove", handleMove)
            window.removeEventListener("mouseup", handleUp)
            window.removeEventListener("touchmove", handleMove)
            window.removeEventListener("touchend", handleUp)
        }
    }, [dragging, updateFromClientX])

    const handleStart = (clientX: number) => {
        setDragging(true)
        updateFromClientX(clientX)
    }

    const trackBg = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"
    const thumbActive = dragging || hovered

    return (
        <div
            ref={trackRef}
            onMouseDown={(e) => handleStart(e.clientX)}
            onTouchStart={(e) => handleStart(e.touches[0].clientX)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width, height: 20, position: "relative",
                cursor: "pointer", display: "flex", alignItems: "center",
                touchAction: "none", userSelect: "none",
            }}
        >
            {/* Track background */}
            <div style={{
                position: "absolute", left: 0, right: 0, height: 4,
                borderRadius: 999, background: trackBg,
            }} />
            {/* Track filled */}
            <div style={{
                position: "absolute", left: 0, height: 4,
                width: `${percent}%`, borderRadius: 999,
                background: `linear-gradient(90deg, ${accent}cc, ${accent})`,
                transition: dragging ? "none" : "width 0.1s ease",
            }} />
            {/* Thumb */}
            <div style={{
                position: "absolute",
                left: `calc(${percent}% - ${thumbActive ? 8 : 7}px)`,
                width: thumbActive ? 16 : 14, height: thumbActive ? 16 : 14,
                borderRadius: "50%", background: accent,
                border: `2px solid ${isDark ? "#1a1025" : "#fff"}`,
                boxShadow: thumbActive
                    ? `0 0 0 4px ${accent}25, 0 2px 8px rgba(0,0,0,0.25)`
                    : `0 2px 6px rgba(0,0,0,0.2)`,
                transition: dragging ? "none" : "all 0.15s ease",
                pointerEvents: "none",
            }} />
        </div>
    )
}

/* ════════════════════════════════════════════
   Drawing Canvas Component (PRESERVED)
   ════════════════════════════════════════════ */
   function DrawingCanvas({
    panel, onUpdate, onRemove, index, totalPanels, onMoveUp, onMoveDown, isDark, previousPanel,
}: {
    panel: CanvasPanel; onUpdate: (updates: Partial<CanvasPanel>) => void; onRemove: () => void
    index: number; totalPanels: number; onMoveUp: () => void; onMoveDown: () => void; isDark: boolean
    previousPanel: CanvasPanel | null
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fullscreenCanvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [tool, setTool] = useState<"pen" | "eraser">("pen")
    const [brushSize, setBrushSize] = useState(3)
    const [isDescribing, setIsDescribing] = useState(false)
    const [hasDrawn, setHasDrawn] = useState(!!panel.dataUrl)
    const [viewMode, setViewMode] = useState<"sketch" | "enhanced">("sketch")
    const [collapsed, setCollapsed] = useState(false)
    const [fullscreen, setFullscreen] = useState(false)
    const lastPoint = useRef<{ x: number; y: number } | null>(null)
    const CANVAS_W = 400; const CANVAS_H = 300; const FS_CANVAS_W = 1200; const FS_CANVAS_H = 800
    const activeCanvasRef = fullscreen ? fullscreenCanvasRef : canvasRef

    const initCanvas = useCallback((canvas: HTMLCanvasElement | null, w: number, h: number, dataUrl: string | null) => {
        if (!canvas) return; const ctx = canvas.getContext("2d"); if (!ctx) return
        canvas.width = w; canvas.height = h; ctx.fillStyle = isDark ? "#1a1025" : "#ffffff"; ctx.fillRect(0, 0, w, h)
        if (dataUrl) { const img = new window.Image(); img.onload = () => { ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h) }; img.src = dataUrl }
    }, [isDark])

    useEffect(() => { initCanvas(canvasRef.current, CANVAS_W, CANVAS_H, panel.dataUrl) }, [isDark, panel.dataUrl, initCanvas])
    useEffect(() => { if (fullscreen) initCanvas(fullscreenCanvasRef.current, FS_CANVAS_W, FS_CANVAS_H, panel.dataUrl) }, [fullscreen, initCanvas, panel.dataUrl])
        useEffect(() => {
            if (panel.enhancedUrl && !panel.isEnhancing) {
              setViewMode("enhanced")
            }
          }, [panel.enhancedUrl, panel.isEnhancing])
          
        
    const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        const canvas = activeCanvasRef.current; if (!canvas) return { x: 0, y: 0 }
        const rect = canvas.getBoundingClientRect(); const scaleX = canvas.width / rect.width; const scaleY = canvas.height / rect.height
        if ("touches" in e) { const touch = e.touches[0] || e.changedTouches[0]; return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY } }
        return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
    }, [activeCanvasRef])

    const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        // Only call preventDefault for mouse events. React attaches touch listeners as
        // passive by default, so preventDefault on touch is a no-op and emits a warning.
        // The canvas already uses `touch-action: none` to stop page scrolling.
        if (!("touches" in e)) e.preventDefault()
        setIsDrawing(true); const pos = getPos(e); lastPoint.current = pos
        const ctx = activeCanvasRef.current?.getContext("2d"); if (!ctx) return
        ctx.beginPath(); ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2)
        ctx.fillStyle = tool === "eraser" ? (isDark ? "#1a1025" : "#ffffff") : (isDark ? "#e5e7eb" : "#1a1025"); ctx.fill()
    }, [getPos, brushSize, tool, isDark, activeCanvasRef])

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return
        if (!("touches" in e)) e.preventDefault()
        const ctx = activeCanvasRef.current?.getContext("2d"); if (!ctx || !lastPoint.current) return
        const pos = getPos(e); ctx.beginPath(); ctx.moveTo(lastPoint.current.x, lastPoint.current.y); ctx.lineTo(pos.x, pos.y)
        ctx.strokeStyle = tool === "eraser" ? (isDark ? "#1a1025" : "#ffffff") : (isDark ? "#e5e7eb" : "#1a1025")
        ctx.lineWidth = tool === "eraser" ? brushSize * 3 : brushSize; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke()
        lastPoint.current = pos
    }, [isDrawing, getPos, brushSize, tool, isDark, activeCanvasRef])

    const endDraw = useCallback(() => {
        if (!isDrawing) return; setIsDrawing(false); lastPoint.current = null; setHasDrawn(true)
        const canvas = activeCanvasRef.current; if (canvas) onUpdate({ dataUrl: canvas.toDataURL() })
    }, [isDrawing, onUpdate, activeCanvasRef])

    const clearCanvas = () => {
        const canvas = activeCanvasRef.current; if (!canvas) return
        const ctx = canvas.getContext("2d"); if (!ctx) return
        ctx.fillStyle = isDark ? "#1a1025" : "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        setHasDrawn(false)
        setViewMode("sketch")
        onUpdate({ dataUrl: null }) // ← removed `enhancedUrl: null`
    }

    const handleEnhance = async () => {
        if (!hasDrawn || !panel.dataUrl) return
        onUpdate({ isEnhancing: true })
    
        try {
            const res = await fetch('/api/refine-drawing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageDataUrl: panel.dataUrl,
                    title: panel.title,
                    description: panel.description,
                    sceneIndex: index,
                    // Only send previous if it has been enhanced (we link to the polished output)
                    previousEnhancedUrl: previousPanel?.enhancedUrl ?? null,
                }),
            })
    
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                console.error('Enhance failed:', err)
                alert(`Enhancement failed: ${err.error || res.statusText}`)
                onUpdate({ isEnhancing: false })
                return
            }
    
            const { enhancedUrl } = await res.json()
            onUpdate({ isEnhancing: false, enhancedUrl })

            // Persist to history (fire & forget — never blocks the UX)
            if (enhancedUrl) {
                saveImageToHistory({
                    dataUrl: enhancedUrl,
                    title: panel.title,
                    description: panel.description,
                    sceneIndex: index,
                }).catch((e) => console.warn("[history] saveImage failed:", e))
            }
        } catch (err) {
            console.error('Enhance error:', err)
            alert('Enhancement failed — check console')
            onUpdate({ isEnhancing: false })
        }
    }
    const exitFullscreen = () => { const fsCanvas = fullscreenCanvasRef.current; if (fsCanvas) onUpdate({ dataUrl: fsCanvas.toDataURL() }); setFullscreen(false) }
    useEffect(() => { if (!fullscreen) return; const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") exitFullscreen() }; window.addEventListener("keydown", handleKey); return () => window.removeEventListener("keydown", handleKey) }, [fullscreen])

    const accent = getAccent()
    const cardBg = isDark ? "linear-gradient(135deg, rgba(26, 34, 44, 0.9), rgba(35, 45, 56, 0.85))" : "rgba(0,0,0,0.02)"
    const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
    const textPrimary = "hsl(var(--foreground))"; const textSecondary = "hsl(var(--muted-foreground))"

    const canvasEvents = { onMouseDown: startDraw, onMouseMove: draw, onMouseUp: endDraw, onMouseLeave: endDraw, onTouchStart: startDraw, onTouchMove: draw, onTouchEnd: endDraw }

    const toolbarButtons = (size: "sm" | "lg") => {
        const s = size === "lg"
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {([{ id: "pen" as const, icon: <Pencil size={s ? 16 : 15} />, label: "Pen" }, { id: "eraser" as const, icon: <Eraser size={s ? 16 : 15} />, label: "Eraser" }]).map((tl) => (
                        <button key={tl.id} onClick={() => setTool(tl.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: s ? "8px 16px" : "6px 12px", borderRadius: s ? 10 : 8, border: `1px solid ${tool === tl.id ? accent : borderColor}`, background: tool === tl.id ? `${accent}18` : "transparent", color: tool === tl.id ? accent : textSecondary, fontSize: s ? 13 : 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s ease" }}>{tl.icon} {tl.label}</button>
                    ))}
<div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 6 }}>
                        <Minus size={12} color={textSecondary} />
                        <BrushSlider
                            value={brushSize}
                            min={1}
                            max={fullscreen ? 20 : 12}
                            onChange={setBrushSize}
                            width={s ? 100 : 70}
                            accent={accent}
                            isDark={isDark}
                        />
                        <Plus size={12} color={textSecondary} />
                        <span style={{ fontSize: 11, color: textSecondary, marginLeft: 2, minWidth: 22, fontVariantNumeric: "tabular-nums" }}>{brushSize}px</span>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button onClick={clearCanvas} style={{ display: "flex", alignItems: "center", gap: 5, padding: s ? "8px 16px" : "6px 12px", borderRadius: s ? 10 : 8, border: `1px solid ${borderColor}`, background: "transparent", color: textSecondary, fontSize: s ? 13 : 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}><RotateCcw size={s ? 15 : 14} /> Clear</button>
                    <button onClick={handleEnhance} disabled={!hasDrawn || panel.isEnhancing} style={{ display: "flex", alignItems: "center", gap: 5, padding: s ? "8px 18px" : "6px 14px", borderRadius: s ? 10 : 8, border: "none", background: hasDrawn ? accent : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"), color: hasDrawn ? "#fff" : textSecondary, fontSize: s ? 13 : 12, fontWeight: 700, cursor: hasDrawn ? "pointer" : "default", fontFamily: "inherit", opacity: panel.isEnhancing ? 0.6 : 1, transition: "all 0.2s ease" }}><Sparkles size={s ? 15 : 14} /> Enhance</button>
                </div>
            </div>
        )
    }

    const enhancingOverlay = (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, backdropFilter: "blur(4px)", borderRadius: 14, zIndex: 5 }}>
            <div style={{ width: 40, height: 40, border: `3px solid ${accent}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin-enhance 0.8s linear infinite" }} />
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>AI is enhancing...</span>
        </div>
    )

    if (fullscreen) {
        return (
            <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: isDark ? "#0a0612" : "#f0f1f3", display: "flex", flexDirection: "column", animation: "fadeInUp 0.3s ease" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: `1px solid ${borderColor}`, background: isDark ? "rgba(255,255,255,0.02)" : "#fff", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 800 }}>{index + 1}</div>
                        <input value={panel.title} onChange={(e) => onUpdate({ title: e.target.value })} placeholder={`Scene ${index + 1}`} style={{ background: "transparent", border: "none", outline: "none", fontSize: 17, fontWeight: 700, color: textPrimary, width: 220, fontFamily: "inherit" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button onClick={exitFullscreen} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: "none", background: accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}><Minimize2 size={15} /> Done</button>
                    </div>
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflow: "auto" }}>
                <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: `1px solid ${borderColor}`, boxShadow: `0 8px 40px ${isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.1)"}` }}>
    <canvas ref={fullscreenCanvasRef} style={{ display: "block", cursor: tool === "eraser" ? "cell" : "crosshair", touchAction: "none", maxWidth: "100%", maxHeight: "calc(100vh - 180px)", objectFit: "contain" }} {...canvasEvents} />
    {panel.isEnhancing && enhancingOverlay}
    {panel.enhancedUrl && !panel.isEnhancing && viewMode === "enhanced" && (
        <div style={{ position: "absolute", inset: 0, zIndex: 4, animation: "fadeIn 0.4s ease" }}>
            <img
                src={panel.enhancedUrl}
                alt="Enhanced"
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", background: isDark ? "#0a0612" : "#f0f1f3" }}
            />
            <button
                onClick={() => setViewMode("sketch")}
                style={{
                    position: "absolute", top: 12, right: 12,
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "8px 14px", borderRadius: 10, border: "none",
                    background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
                    color: "#fff", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit",
                }}
            >
                <Pencil size={14} /> See sketch
            </button>
        </div>
    )}
    {panel.enhancedUrl && !panel.isEnhancing && viewMode === "sketch" && (
        <button
            onClick={() => setViewMode("enhanced")}
            style={{
                position: "absolute", top: 12, right: 12, zIndex: 4,
                display: "flex", alignItems: "center", gap: 5,
                padding: "8px 14px", borderRadius: 10, border: "none",
                background: `${accent}dd`, backdropFilter: "blur(8px)",
                color: "#fff", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: `0 4px 14px ${accent}40`,
            }}
        >
            <Sparkles size={14} /> See generated
        </button>
    )}
</div>
                </div>
                <div style={{ padding: "14px 24px 18px", borderTop: `1px solid ${borderColor}`, background: isDark ? "rgba(255,255,255,0.02)" : "#fff", flexShrink: 0 }}>
                    {toolbarButtons("lg")}
                </div>
            </div>
        )
    }

    if (collapsed) {
        return (
            <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}`, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", cursor: "pointer" }} onClick={() => setCollapsed(false)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 800 }}>{index + 1}</div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{panel.title || `Scene ${index + 1}`}</span>
                    </div>
                    <Eye size={15} color={textSecondary} />
                </div>
            </div>
        )
    }

    return (
        <div style={{ background: cardBg, borderRadius: 20, border: `1px solid ${borderColor}`, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${borderColor}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 800 }}>{index + 1}</div>
                    {previousPanel?.enhancedUrl && (
    <div
        title={`Linked to Scene ${index} — product will stay consistent`}
        style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "4px 8px", borderRadius: 6,
            background: `${accent}15`,
            color: accent,
            fontSize: 10, fontWeight: 700,
            letterSpacing: "0.02em",
        }}
    >
        <Layers size={11} /> Linked
    </div>
)}
                    <input value={panel.title} onChange={(e) => onUpdate({ title: e.target.value })} placeholder={`Scene ${index + 1}`} style={{ background: "transparent", border: "none", outline: "none", fontSize: 15, fontWeight: 700, color: textPrimary, width: 160, fontFamily: "inherit" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button onClick={() => setCollapsed(true)} style={{ background: "none", border: "none", cursor: "pointer", color: textSecondary, padding: 4, display: "flex", borderRadius: 6 }}><EyeOff size={15} /></button>
                    <button onClick={() => setFullscreen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: textSecondary, padding: 4, display: "flex", borderRadius: 6 }}><Maximize2 size={15} /></button>
                    <div style={{ width: 1, height: 16, background: borderColor, margin: "0 2px" }} />
                    <button onClick={onMoveUp} disabled={index === 0} style={{ background: "none", border: "none", cursor: index === 0 ? "default" : "pointer", opacity: index === 0 ? 0.3 : 1, color: textSecondary, padding: 4, display: "flex", borderRadius: 6 }}><ChevronUp size={16} /></button>
                    <button onClick={onMoveDown} disabled={index === totalPanels - 1} style={{ background: "none", border: "none", cursor: index === totalPanels - 1 ? "default" : "pointer", opacity: index === totalPanels - 1 ? 0.3 : 1, color: textSecondary, padding: 4, display: "flex", borderRadius: 6 }}><ChevronDown size={16} /></button>
                    <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4, display: "flex", borderRadius: 6 }}><Trash2 size={16} /></button>
                </div>
            </div>
            <div style={{ padding: 16 }}>
            <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: `1px solid ${borderColor}` }}>
    <canvas ref={canvasRef} style={{ width: "100%", height: "auto", display: "block", cursor: tool === "eraser" ? "cell" : "crosshair", touchAction: "none" }} {...canvasEvents} />
    {panel.isEnhancing && enhancingOverlay}
    {panel.enhancedUrl && !panel.isEnhancing && viewMode === "enhanced" && (
    <div style={{ position: "absolute", inset: 0, zIndex: 4, animation: "fadeIn 0.4s ease" }}>
        <img
            src={panel.enhancedUrl}
            alt="Enhanced"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <button
            onClick={() => setViewMode("sketch")}
            style={{
                position: "absolute", top: 8, right: 8,
                display: "flex", alignItems: "center", gap: 4,
                padding: "6px 10px", borderRadius: 8, border: "none",
                background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
                color: "#fff", fontSize: 11, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
            }}
        >
            <Pencil size={12} /> See sketch
        </button>
    </div>
)}

{panel.enhancedUrl && !panel.isEnhancing && viewMode === "sketch" && (
    <button
        onClick={() => setViewMode("enhanced")}
        style={{
            position: "absolute", top: 8, right: 8, zIndex: 4,
            display: "flex", alignItems: "center", gap: 4,
            padding: "6px 10px", borderRadius: 8, border: "none",
            background: `${accent}dd`, backdropFilter: "blur(8px)",
            color: "#fff", fontSize: 11, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
            boxShadow: `0 4px 14px ${accent}40`,
        }}
    >
        <Sparkles size={12} /> See generated
    </button>
)}
    {!hasDrawn && !panel.dataUrl && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", color: textSecondary, gap: 6 }}>
            <Pencil size={28} strokeWidth={1.5} /><span style={{ fontSize: 13, fontWeight: 500 }}>Sketch your scene here</span>
        </div>
    )}
</div>
                <div style={{ marginTop: 12 }}>{toolbarButtons("sm")}</div>
                <div style={{ marginTop: 14 }}>
                    <button onClick={() => setIsDescribing(!isDescribing)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: textSecondary, fontSize: 12, fontWeight: 600, fontFamily: "inherit", padding: 0 }}>
                        <MessageSquare size={14} />{panel.description ? "Edit description" : "Add description"}<ChevronDown size={13} style={{ transform: isDescribing ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                    </button>
                    {isDescribing && <textarea value={panel.description} onChange={(e) => onUpdate({ description: e.target.value })} placeholder="Describe what this scene is about..." rows={3} style={{ width: "100%", marginTop: 8, padding: 12, borderRadius: 10, border: `1px solid ${borderColor}`, background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", color: textPrimary, fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.5 }} onFocus={(e) => (e.currentTarget.style.borderColor = accent)} onBlur={(e) => (e.currentTarget.style.borderColor = borderColor)} />}
                    {panel.description && !isDescribing && <p style={{ fontSize: 12, color: textSecondary, margin: "6px 0 0", lineHeight: 1.4, fontStyle: "italic" }}>&ldquo;{panel.description}&rdquo;</p>}
                </div>
            </div>
        </div>
    )
}

/* ════════════════════════════════════════════
   Shooting Star Puzzle Animation (FIXED)
   Uses position:absolute within canvas container.
   Stars fly from outside edges INTO the grid.
   Canvas overflow is visible so stars show outside.
   ════════════════════════════════════════════ */
const GRID_COLS = 8
const GRID_ROWS = 6
const TOTAL_PIECES = GRID_COLS * GRID_ROWS

interface PieceData {
    uid: string
    index: number
    col: number
    row: number
    imgSrc: string
    startX: number
    startY: number
}

function ShootingStarPiece({ piece, onLanded, pieceW, pieceH, canvasW, canvasH, accent }: {
    piece: PieceData
    onLanded: (idx: number) => void
    pieceW: number; pieceH: number; canvasW: number; canvasH: number; accent: string
}) {
    const [phase, setPhase] = useState<"shooting" | "landing" | "landed">("shooting")
    const { col, row, index } = piece
    const targetX = col * pieceW
    const targetY = row * pieceH

    useEffect(() => {
        if (phase === "shooting") {
            const t = setTimeout(() => setPhase("landing"), 60)
            return () => clearTimeout(t)
        }
        if (phase === "landing") {
            const t = setTimeout(() => { setPhase("landed"); onLanded(index) }, 900)
            return () => clearTimeout(t)
        }
    }, [phase, index, onLanded])

    const isShooting = phase === "shooting"
    const isLanding = phase === "landing"
    const isLanded = phase === "landed"
    const curX = isShooting ? piece.startX : targetX
    const curY = isShooting ? piece.startY : targetY
    const trailAngle = Math.atan2(targetY - piece.startY, targetX - piece.startX) + Math.PI

    return (
        <>
            {/* Star trail */}
            {!isLanded && (
                <div style={{
                    position: "absolute", left: curX + pieceW / 2, top: curY + pieceH / 2,
                    width: 0, height: 0, zIndex: 100, pointerEvents: "none",
                    transition: isLanding ? "left 0.85s cubic-bezier(0.22,0.61,0.36,1), top 0.85s cubic-bezier(0.22,0.61,0.36,1)" : "none",
                }}>
                    <div style={{
                        position: "absolute", width: isLanding ? 5 : 8, height: isLanding ? 5 : 8,
                        borderRadius: "50%",
                        background: `radial-gradient(circle, #fff 0%, ${accent} 50%, transparent 70%)`,
                        boxShadow: `0 0 14px 5px ${accent}88, 0 0 35px 12px ${accent}33`,
                        transform: "translate(-50%,-50%)", transition: "width 0.3s, height 0.3s",
                    }} />
                    <div style={{
                        position: "absolute", width: isLanding ? 55 : 0, height: 2,
                        background: `linear-gradient(90deg, ${accent}bb, ${accent}44, transparent)`,
                        transform: `translate(2px, -1px) rotate(${trailAngle}rad)`,
                        transformOrigin: "left center", transition: "width 0.15s ease-out", filter: "blur(0.5px)",
                    }} />
                </div>
            )}
            {/* Image piece */}
            <div style={{
                position: "absolute", left: curX, top: curY, width: pieceW, height: pieceH,
                zIndex: isLanded ? 10 : 99, pointerEvents: "none",
                transition: isLanding
                    ? "left 0.85s cubic-bezier(0.22,0.61,0.36,1), top 0.85s cubic-bezier(0.22,0.61,0.36,1), opacity 0.3s, transform 0.85s cubic-bezier(0.22,0.61,0.36,1)"
                    : "none",
                opacity: isLanded ? 1 : isLanding ? 0.9 : 0,
                transform: isLanded ? "scale(1)" : isLanding ? "scale(1.06)" : "scale(0.3)",
                backgroundImage: `url(${piece.imgSrc})`,
                backgroundPosition: `-${col * pieceW}px -${row * pieceH}px`,
                backgroundSize: `${canvasW}px ${canvasH}px`,
            }} />
            {/* Landing flash */}
            {isLanded && (
                <div style={{
                    position: "absolute", left: targetX - 6, top: targetY - 6,
                    width: pieceW + 12, height: pieceH + 12, borderRadius: 3,
                    background: `radial-gradient(circle, ${accent}55 0%, transparent 70%)`,
                    animation: "starLandFlash 0.4s ease-out forwards",
                    pointerEvents: "none", zIndex: 11,
                }} />
            )}
        </>
    )
}

function ShootingStarAnimation({ template, onComplete, isDark, screen }: {
    template: SceneTemplate; onComplete: () => void; isDark: boolean; screen: string
}) {
    const [imgLoaded, setImgLoaded] = useState(false)
    const [launched, setLaunched] = useState<PieceData[]>([])
    const [landed, setLanded] = useState(new Set<number>())
    const hasStartedRef = useRef(false)
    const [complete, setComplete] = useState(false)
    const orderRef = useRef<number[]>([])
    const indexRef = useRef(0)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const accent = getAccent()
    const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
    const textPrimary = "hsl(var(--foreground))"
    const textSecondary = "hsl(var(--muted-foreground))"
    const isMobile = screen === "mobile"
    const isTablet = screen === "tablet"
    
    const canvasW = isMobile ? Math.min(340, (typeof window !== "undefined" ? window.innerWidth : 400) - 48)
        : isTablet ? Math.min(420, (typeof window !== "undefined" ? window.innerWidth : 600) - 64)
        : 480
    const canvasH = Math.round(canvasW * 0.75)
    const pieceW = canvasW / GRID_COLS
    const pieceH = canvasH / GRID_ROWS

    const particles = useMemo(() =>
        Array.from({ length: 16 }, (_, i) => ({
            w: 1 + (i * 7 % 3), h: 1 + (i * 7 % 3),
            left: `${(i * 37 + 13) % 100}%`, top: `${(i * 53 + 7) % 100}%`,
            opacity: 0.12 + (i % 5) * 0.06, dur: 4 + (i % 6), delay: (i * 0.7) % 5,
        })), [])

    const handleLanded = useCallback((idx: number) => {
        setLanded(prev => {
            const next = new Set(prev)
            next.add(idx)
            if (next.size === TOTAL_PIECES) {
                setTimeout(() => { setComplete(true); setTimeout(onComplete, 1400) }, 300)
            }
            return next
        })
    }, [onComplete])

    // Auto-start once
    useEffect(() => {
        if (!imgLoaded || hasStartedRef.current) return
        hasStartedRef.current = true
        indexRef.current = 0

        const order = Array.from({ length: TOTAL_PIECES }, (_, i) => i)
        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]]
        }
        orderRef.current = order

        const launchNext = () => {
            if (indexRef.current >= TOTAL_PIECES) return
            const pieceIdx = orderRef.current[indexRef.current]
            const col = pieceIdx % GRID_COLS
            const row = Math.floor(pieceIdx / GRID_COLS)
            const angle = Math.random() * Math.PI * 2
            const dist = 400 + Math.random() * 350
            const startX = col * pieceW + Math.cos(angle) * dist
            const startY = row * pieceH + Math.sin(angle) * dist

            setLaunched(prev => [...prev, {
                uid: `p-${indexRef.current}-${pieceIdx}`,
                index: pieceIdx, col, row,
                imgSrc: template.imageUrl,
                startX, startY,
            }])
            indexRef.current++
            timerRef.current = setTimeout(launchNext, 150 + Math.random() * 100)
        }
        timerRef.current = setTimeout(launchNext, 400)
        return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }, [imgLoaded, pieceW, pieceH, template.imageUrl])

    // Preload
    useEffect(() => {
        const img = new window.Image()
        img.crossOrigin = "anonymous"
        img.onload = () => setImgLoaded(true)
        img.src = template.imageUrl
    }, [template.imageUrl])

    const progress = landed.size / TOTAL_PIECES

    return (
        <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 20, padding: isMobile ? "16px 4px" : "20px",
            animation: "fadeInUp 0.5s ease both", position: "relative", width: "100%",
        }}>
            {/* Ambient particles */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden", borderRadius: 20 }}>
                {particles.map((p, i) => (
                    <div key={`amb-${i}`} style={{
                        position: "absolute", width: p.w, height: p.h, borderRadius: "50%",
                        background: accent, opacity: p.opacity, left: p.left, top: p.top,
                        animation: `starFloat ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
                    }} />
                ))}
            </div>

            {/* Title */}
            <div style={{ textAlign: "center", zIndex: 2 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: textPrimary, margin: "0 0 2px" }}>Composing your scene</p>
                <p style={{ fontSize: 11, color: textSecondary, margin: 0, opacity: 0.6, letterSpacing: "0.08em" }}>Each star carries a fragment of the image</p>
            </div>

            {/* Canvas - overflow:visible lets stars fly in from outside */}
            <div style={{
                width: canvasW, height: canvasH, position: "relative",
                border: `1px solid ${borderColor}`, borderRadius: 14,
                background: isDark ? "rgba(10,8,25,0.8)" : "rgba(245,243,248,0.8)",
                boxShadow: complete ? `0 0 50px 16px ${accent}22` : `0 0 24px 6px ${accent}06`,
                transition: "box-shadow 1s ease", zIndex: 2,
                overflow: "visible",
            }}>
                {/* Clip for grid lines only */}
                <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 13, pointerEvents: "none" }}>
                    {!complete && Array.from({ length: GRID_COLS - 1 }).map((_, i) => (
                        <div key={`gv-${i}`} style={{ position: "absolute", left: (i + 1) * pieceW, top: 0, width: 1, height: "100%", background: isDark ? `${accent}08` : `${accent}06` }} />
                    ))}
                    {!complete && Array.from({ length: GRID_ROWS - 1 }).map((_, i) => (
                        <div key={`gh-${i}`} style={{ position: "absolute", top: (i + 1) * pieceH, left: 0, height: 1, width: "100%", background: isDark ? `${accent}08` : `${accent}06` }} />
                    ))}
                </div>

                {/* Star pieces */}
                {launched.map((piece) => (
                    <ShootingStarPiece
                        key={piece.uid} piece={piece} onLanded={handleLanded}
                        pieceW={pieceW} pieceH={pieceH} canvasW={canvasW} canvasH={canvasH} accent={accent}
                    />
                ))}

                {/* Done overlay */}
                {complete && (
                    <div style={{
                        position: "absolute", inset: 0, zIndex: 50, borderRadius: 13,
                        display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden",
                    }}>
                        <div style={{
                            padding: "10px 24px", marginBottom: 14,
                            background: isDark ? "rgba(6,6,15,0.7)" : "rgba(255,255,255,0.85)",
                            backdropFilter: "blur(8px)", borderRadius: 20,
                            color: textPrimary, fontSize: 12, fontWeight: 700,
                            display: "flex", alignItems: "center", gap: 6,
                            animation: "fadeInUp 0.8s ease-out 0.3s both",
                            border: `1px solid ${borderColor}`,
                        }}>
                            <Check size={14} color={accent} /> Image Revealed
                        </div>
                    </div>
                )}
            </div>

            {/* Progress */}
            <div style={{ width: canvasW, maxWidth: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 2 }}>
                <div style={{ width: "100%", height: 3, borderRadius: 3, overflow: "hidden", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
                    <div style={{
                        height: "100%", borderRadius: 3, width: `${progress * 100}%`,
                        background: complete ? "#22c55e" : `linear-gradient(90deg, ${accent}, ${accent}cc)`,
                        transition: "width 0.3s ease, background 0.5s ease",
                        boxShadow: `0 0 8px ${accent}44`,
                    }} />
                </div>
                <span style={{ fontSize: 11, color: textSecondary, opacity: 0.5, fontVariantNumeric: "tabular-nums" }}>
                    {complete ? "Complete" : `${landed.size} / ${TOTAL_PIECES} fragments`}
                </span>
            </div>
        </div>
    )
}

/* ════════════════════════════════════════════
   Template Card - ALL BIG
   ════════════════════════════════════════════ */
   function TemplateCard({ template, onClick, isDark }: {
    template: SceneTemplate; onClick: () => void; isDark: boolean
}) {
    const [hovered, setHovered] = useState(false)
    const [imgLoaded, setImgLoaded] = useState(false)
    const [isTouchDevice, setIsTouchDevice] = useState(false)
    const [touchRevealed, setTouchRevealed] = useState(false)
    const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
    const accent = getAccent()

    useEffect(() => {
        setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0)
    }, [])

    // Close overlay when tapping outside
    useEffect(() => {
        if (!touchRevealed) return
        const handleOutside = (e: TouchEvent) => {
            const target = e.target as HTMLElement
            if (!target.closest(`[data-card-id="${template.id}"]`)) {
                setTouchRevealed(false)
            }
        }
        document.addEventListener("touchstart", handleOutside)
        return () => document.removeEventListener("touchstart", handleOutside)
    }, [touchRevealed, template.id])

    const handleClick = () => {
        if (isTouchDevice) {
            if (!touchRevealed) {
                setTouchRevealed(true)
                return
            }
            // Second tap — open
            setTouchRevealed(false)
            onClick()
        } else {
            onClick()
        }
    }

    const showOverlay = isTouchDevice ? touchRevealed : hovered

    return (
        <div data-card-id={template.id} onClick={handleClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            style={{
                position: "relative", borderRadius: 18, overflow: "hidden", cursor: "pointer",
                border: `1px solid ${showOverlay ? (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)") : borderColor}`,
                transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)", transform: showOverlay ? "translateY(-2px)" : "none",
                boxShadow: showOverlay ? (isDark ? "0 12px 40px rgba(0,0,0,0.4)" : "0 12px 40px rgba(0,0,0,0.12)") : "none",
                aspectRatio: "4 / 3",
            }}>
            <img src={template.imageUrl} alt={template.title} onLoad={() => setImgLoaded(true)} style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover",
                transition: "transform 0.5s ease, filter 0.5s ease", transform: showOverlay ? "scale(1.05)" : "scale(1)",
                filter: showOverlay ? "brightness(0.35)" : "brightness(0.75)", opacity: imgLoaded ? 1 : 0,
            }} />
            {!imgLoaded && <div style={{ position: "absolute", inset: 0, background: isDark ? "#1a1a2e" : "#e5e5e5" }} />}
            <div style={{ position: "absolute", top: 12, left: 12, zIndex: 3, padding: "4px 10px", borderRadius: 8, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "0.04em", textTransform: "uppercase" }}>{template.category}</div>
            <div style={{ position: "absolute", top: 12, right: 12, zIndex: 3, display: "flex", alignItems: "center", gap: 3, padding: "4px 8px", borderRadius: 6, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}><Star size={9} fill="rgba(255,255,255,0.8)" color="rgba(255,255,255,0.8)" />{template.rating}</div>
            {/* Bottom info — visible when overlay is hidden */}
            <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, padding: "50px 18px 16px",
                background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
                opacity: showOverlay ? 0 : 1, transition: "opacity 0.3s ease",
            }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{template.title}</h3>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{template.subtitle}</p>
            </div>
            {/* Overlay with description + CTA */}
            <div style={{
                position: "absolute", inset: 0, zIndex: 4, display: "flex", flexDirection: "column", justifyContent: "center",
                padding: "24px 22px", opacity: showOverlay ? 1 : 0, transition: "opacity 0.3s ease",
                pointerEvents: showOverlay ? "auto" : "none",
            }}>
                <p style={{ fontSize: 14, color: "#fff", lineHeight: 1.65, fontWeight: 500, margin: "0 0 16px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical" as const }}>{template.prompt}</p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: accent, color: "#fff", fontSize: 13, fontWeight: 700, width: "fit-content", boxShadow: `0 4px 14px ${accent}40` }}>
                    <Sparkles size={14} /> {isTouchDevice ? "Tap again to use" : "Use this scene"}
                </div>
            </div>
        </div>
    )
}

/* ════════════════════════════════════════════
   Upload Screen
   ════════════════════════════════════════════ */
function UploadScreen({ template, onGenerate, onBack, isDark, screen }: {
    template: SceneTemplate; onGenerate: () => void; onBack: () => void; isDark: boolean; screen: string
}) {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const accent = getAccent()
    const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
    const textPrimary = "hsl(var(--foreground))"; const textSecondary = "hsl(var(--muted-foreground))"
    const cardBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"
    const isMobile = screen === "mobile"
    const isTablet = screen === "tablet"
    
    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) return
        const reader = new FileReader(); reader.onload = (e) => setUploadedImage(e.target?.result as string); reader.readAsDataURL(file)
    }

    return (
        <div style={{ animation: "fadeInUp 0.4s ease both", display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8, flexShrink: 0 }}>
                <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 10, border: `1px solid ${borderColor}`, background: "transparent", color: textSecondary, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}><ArrowLeft size={14} /> Back</button>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{template.title}</span>
                    <span style={{ padding: "3px 8px", borderRadius: 6, background: `${accent}12`, fontSize: 10, fontWeight: 700, color: accent }}>{template.category}</span>
                </div>
            </div>
            <div style={{ flex: 1, minHeight: 0, overflow: "auto", WebkitOverflowScrolling: "touch" }}>
                <div style={{ display: "flex", gap: 16, flexDirection: (isMobile || isTablet) ? "column" : "row" }}>
                    <div style={{ flex: (isMobile || isTablet) ? "none" : 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
                        <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", border: `1px solid ${borderColor}`, aspectRatio: "4 / 3" }}>
                            <img src={template.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%)" }} />
                            <div style={{ position: "absolute", bottom: 12, left: 14, display: "flex", alignItems: "center", gap: 5 }}>
                                <Star size={11} fill="#f59e0b" color="#f59e0b" />
                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{template.rating} · {template.uses.toLocaleString()} uses</span>
                            </div>
                        </div>
                        <div style={{ background: cardBg, borderRadius: 14, border: `1px solid ${borderColor}`, padding: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                                <Palette size={14} color={accent} />
                                <span style={{ fontSize: 12, fontWeight: 700, color: textPrimary }}>Scene Recipe</span>
                            </div>
                            <p style={{ fontSize: 12, color: textPrimary, lineHeight: 1.6, margin: 0, opacity: 0.8 }}>{template.prompt}</p>
                        </div>
                        {!isMobile && (
                            <div style={{ display: "flex", gap: 8 }}>
                                {[{ n: "1", label: "Upload product" }, { n: "2", label: "AI removes bg" }, { n: "3", label: "Scene composed" }].map((s) => (
                                    <div key={s.n} style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: cardBg, border: `1px solid ${borderColor}` }}>
                                        <div style={{ width: 24, height: 24, borderRadius: 7, background: `${accent}10`, display: "flex", alignItems: "center", justifyContent: "center", color: accent, fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{s.n}</div>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: textSecondary }}>{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div style={{ flex: (isMobile || isTablet) ? "none" : 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
                        <div style={{ flex: 1, background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}`, padding: 16, display: "flex", flexDirection: "column", minHeight: isMobile ? 220 : isTablet ? 260 : 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                                <Package size={14} color={accent} />
                                <span style={{ fontSize: 12, fontWeight: 700, color: textPrimary }}>Your Product</span>
                            </div>
                            <div onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                                style={{
                                    flex: 1, borderRadius: 14, border: `2px dashed ${dragOver ? accent : borderColor}`,
                                    background: dragOver ? `${accent}08` : "transparent", cursor: "pointer", transition: "all 0.2s ease",
                                    overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                    position: "relative", minHeight: isMobile ? 150 : 0,
                                }}>
                                {uploadedImage ? (
                                    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
                                        <img src={uploadedImage} alt="Product" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 10 }} />
                                        <button onClick={(e) => { e.stopPropagation(); setUploadedImage(null) }} style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 7, background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={12} /></button>
                                        <div style={{ position: "absolute", bottom: 8, left: 8, padding: "3px 10px", borderRadius: 6, background: "rgba(34,197,94,0.15)", color: "#22c55e", fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}><Check size={10} /> Ready</div>
                                    </div>
                                ) : (
                                    <div style={{ padding: "24px 16px", textAlign: "center" }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${accent}10`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}><Upload size={20} color={accent} /></div>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: textPrimary, margin: "0 0 3px" }}>Drop your product image</p>
                                        <p style={{ fontSize: 11, color: textSecondary, margin: "0 0 14px" }}>PNG, JPG · transparent bg recommended</p>
                                        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 16px", borderRadius: 8, background: `${accent}10`, color: accent, fontSize: 11, fontWeight: 700 }}><FileImage size={13} /> Browse files</div>
                                    </div>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
                        </div>
                        <button onClick={onGenerate} disabled={!uploadedImage} style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            padding: "14px 24px", borderRadius: 14, border: "none", width: "100%", flexShrink: 0,
                            background: uploadedImage ? `linear-gradient(135deg, ${accent}, ${accent}dd)` : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"),
                            color: uploadedImage ? "#fff" : textSecondary, fontSize: 14, fontWeight: 700,
                            cursor: uploadedImage ? "pointer" : "default", fontFamily: "inherit",
                            boxShadow: uploadedImage ? `0 6px 24px ${accent}35` : "none", transition: "all 0.3s ease",
                        }}><Sparkles size={17} /> Generate Image</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ════════════════════════════════════════════
   Result Screen
   ════════════════════════════════════════════ */
function ResultScreen({ template, onBack, onRegenerate, isDark, screen }: {
    template: SceneTemplate; onBack: () => void; onRegenerate: () => void; isDark: boolean; screen: string
}) {
    const accent = getAccent()
    const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
    const textPrimary = "hsl(var(--foreground))"; const textSecondary = "hsl(var(--muted-foreground))"
    const isMobile = screen === "mobile"

    return (
        <div style={{ animation: "fadeInUp 0.5s ease both", display: "flex", flexDirection: "column", height: "100%" }}>
            <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 10, border: `1px solid ${borderColor}`, background: "transparent", color: textSecondary, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 16, alignSelf: "flex-start", flexShrink: 0 }}><ArrowLeft size={14} /> Back</button>
            <div style={{ borderRadius: 18, border: `1px solid ${borderColor}`, overflow: "hidden", background: isDark ? "rgba(255,255,255,0.02)" : "#fff", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                <div style={{ position: "relative", flex: 1, minHeight: isMobile ? 200 : 280 }}>
                    <img src={template.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", padding: "8px 16px", borderRadius: 10, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", color: "#fff", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}><Check size={14} /> {template.title}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "12px 14px" : "14px 18px", borderTop: `1px solid ${borderColor}`, flexWrap: "wrap", gap: 8, flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: textSecondary, fontSize: 12 }}><Sparkles size={14} color={accent} /><span>Generated</span></div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button onClick={onRegenerate} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 14px", borderRadius: 9, border: `1px solid ${borderColor}`, background: "transparent", color: textPrimary, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}><RefreshCw size={13} /> Redo</button>
                        <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 14px", borderRadius: 9, border: `1px solid ${borderColor}`, background: "transparent", color: textPrimary, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}><Copy size={13} /> Prompt</button>
                        <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 16px", borderRadius: 9, border: "none", background: accent, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 14px ${accent}35` }}><Download size={13} /> Download</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ════════════════════════════════════════════
   Video Generation Modal + Snackbar — see
   src/features/marketing/.../context/video-generation-context.tsx
   ════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   Main Export
   ════════════════════════════════════════════ */
export default function AIMarketingGenerator({ onLayoutChange }: { onLayoutChange?: (locked: boolean) => void } = {}) {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"
    const screen = useMediaQuery()
    const [mode, setMode] = useState<"drawing" | "text">("drawing")
    const [panels, setPanels] = useState<CanvasPanel[]>([])
    const [videoSettings, setVideoSettings] = useState<VideoSettings>({ resolution: "720p", duration: 5 })
    const [showVideoSettings, setShowVideoSettings] = useState(false)
    const videoGen = useVideoGeneration()
    const isGenerating = videoGen.isGenerating

    const [textView, setTextView] = useState<TextViewState>("gallery")
    const [selectedTemplate, setSelectedTemplate] = useState<SceneTemplate | null>(null)

    const accent = getAccent()
    const cardBg = isDark ? "linear-gradient(135deg, rgba(26, 34, 44, 0.9), rgba(35, 45, 56, 0.85))" : "rgba(0,0,0,0.02)"
    const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
    const textPrimary = "hsl(var(--foreground))"; const textSecondary = "hsl(var(--muted-foreground))"
    const isMobile = screen === "mobile"
    const isTablet = screen === "tablet"
    const isEmptyDrawing = mode === "drawing" && panels.length === 0

useEffect(() => {
    onLayoutChange?.(isEmptyDrawing)
}, [isEmptyDrawing, onLayoutChange])

    const addPanel = () => { setPanels(prev => [...prev, { id: `panel-${Date.now()}`, title: `Scene ${prev.length + 1}`, description: "", dataUrl: null, enhancedUrl: null, isEnhancing: false }]) }
    const updatePanel = (id: string, updates: Partial<CanvasPanel>) => { setPanels(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p)) }
    const removePanel = (id: string) => { setPanels(prev => prev.filter(p => p.id !== id)) }
    const movePanel = (from: number, to: number) => { setPanels(prev => { const arr = [...prev]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item); return arr }) }
    const handleGenerateVideo = () => {
        const validPanels = panels.filter(p => p.enhancedUrl)
        if (validPanels.length < 2) {
            alert("You need at least 2 enhanced scenes to generate a video. Sketch and click Enhance on each scene first.")
            return
        }
        videoGen.startGeneration({
            panels: validPanels.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                enhancedUrl: p.enhancedUrl,
            })),
            settings: videoSettings,
        })
    }
    const handleSelectTemplate = (t: SceneTemplate) => { setSelectedTemplate(t); setTextView("upload") }
    const handleGenerate = () => { setTextView("generating") }
    const handleGenerationComplete = useCallback(() => { setTextView("result") }, [])
    const handleBackToGallery = () => { setTextView("gallery"); setSelectedTemplate(null) }

    useEffect(() => { if (mode === "text") { setTextView("gallery"); setSelectedTemplate(null) } }, [mode])

    // 2x2 on desktop, 2 on tablet, 1 on mobile
    const galleryGridCols = isMobile ? "1fr" : "repeat(auto-fill, minmax(420px, 1fr))"
    return (
        <div style={{
            fontFamily: "inherit", display: "flex", flexDirection: "column",
            ...(isEmptyDrawing
                ? { height: "100%", maxHeight: "100%", overflow: "hidden" }
                : { minHeight: "100%" }
            ),
            padding: isMobile ? "12px" : isTablet ? "16px" : "20px", boxSizing: "border-box",
        }}>
            <style>{`
                @keyframes spin-enhance { to { transform: rotate(360deg); } }
                .brush-slider {
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    border-radius: 999px;
    background: rgba(128,128,128,0.25);
    outline: none;
    cursor: pointer;
    transition: background 0.2s;
}
.brush-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--brush-thumb-color, #7c3aed);
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    transition: transform 0.15s ease;
}
.brush-slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
}
.brush-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--brush-thumb-color, #7c3aed);
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.25);
}
.brush-slider::-moz-range-track {
    height: 4px;
    border-radius: 999px;
    background: rgba(128,128,128,0.25);
}
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes starFloat {
                    0% { transform: translateY(0px) scale(1); }
                    100% { transform: translateY(-15px) scale(1.4); }
                }
                @keyframes starSparkle0 {
                    0% { transform: translate(0,0); opacity: 1; }
                    100% { transform: translate(-15px, -20px); opacity: 0; }
                }
                @keyframes starSparkle1 {
                    0% { transform: translate(0,0); opacity: 1; }
                    100% { transform: translate(5px, -25px); opacity: 0; }
                }
                @keyframes starSparkle2 {
                    0% { transform: translate(0,0); opacity: 1; }
                    100% { transform: translate(18px, -15px); opacity: 0; }
                }
                @keyframes starLandFlash {
                    0% { opacity: 1; transform: scale(1); }
                    100% { opacity: 0; transform: scale(1.5); }
                }
            `}</style>

            {/* Mode toggle */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                padding: 3, borderRadius: 12, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                width: "fit-content", margin: "0 auto 16px", flexShrink: 0,
            }}>
                {([
                    { id: "drawing" as const, icon: <Pencil size={14} />, label: isMobile ? "Draw" : "Drawing Mode" },
                    { id: "text" as const, icon: <ImageIcon size={14} />, label: isMobile ? "Text" : "Text Mode" },
                ]).map((m) => (
                    <button key={m.id} onClick={() => setMode(m.id)} style={{
                        display: "flex", alignItems: "center", gap: 6, padding: isMobile ? "8px 14px" : "9px 20px", borderRadius: 9, border: "none",
                        background: mode === m.id ? accent : "transparent", color: mode === m.id ? "#fff" : textSecondary,
                        fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                        boxShadow: mode === m.id ? `0 4px 14px ${accent}40` : "none",
                    }}>{m.icon} {m.label}</button>
                ))}
            </div>

{/* Content */}
<div style={{ flex: 1, minHeight: 0, overflow: isEmptyDrawing ? "hidden" : "auto", display: "flex", flexDirection: "column" }}>
                {mode === "drawing" && (
                    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                        {panels.length === 0 ? (
                            <div style={{ textAlign: "center", padding: isMobile ? "40px 16px" : "50px 20px", borderRadius: 20, border: `2px dashed ${borderColor}`, background: cardBg, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                <div style={{ width: 56, height: 56, borderRadius: 18, margin: "0 auto 18px", background: `${accent}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><Layers size={24} color={accent} /></div>
                                <h3 style={{ fontSize: 17, fontWeight: 700, color: textPrimary, margin: "0 0 6px" }}>Create Your Storyboard</h3>
                                <p style={{ fontSize: 12, color: textSecondary, margin: "0 0 20px", maxWidth: 380, lineHeight: 1.6 }}>Add canvas panels, sketch your scenes, and let AI enhance them into polished marketing visuals.</p>
                                <button onClick={addPanel} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 24px", borderRadius: 12, border: "none", background: accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 14px ${accent}40` }}><Plus size={16} /> Add First Canvas</button>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? "280px" : "360px"}, 1fr))`, gap: 16, flex: 1, overflow: "auto", paddingBottom: 12, WebkitOverflowScrolling: "touch" }}>
                                {panels.map((panel, i) => (
    <DrawingCanvas
        key={panel.id}
        panel={panel}
        index={i}
        totalPanels={panels.length}
        previousPanel={i > 0 ? panels[i - 1] : null}
        onUpdate={(u) => updatePanel(panel.id, u)}
        onRemove={() => removePanel(panel.id)}
        onMoveUp={() => movePanel(i, i - 1)}
        onMoveDown={() => movePanel(i, i + 1)}
        isDark={isDark}
    />
))}
                                    <button onClick={addPanel} style={{ minHeight: 200, borderRadius: 20, border: `2px dashed ${borderColor}`, background: cardBg, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: textSecondary, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>
                                        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${accent}12`, display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={20} color={accent} /></div>Add Canvas
                                    </button>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, padding: isMobile ? "12px 14px" : "14px 18px", borderRadius: 14, background: cardBg, border: `1px solid ${borderColor}`, flexWrap: "wrap", gap: 10, flexShrink: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: textSecondary, fontSize: 12 }}><Layers size={14} /><span><strong style={{ color: textPrimary }}>{panels.length}</strong> scene{panels.length !== 1 ? "s" : ""}</span></div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
    <button 
        onClick={() => setShowVideoSettings(!showVideoSettings)}
        style={{ display: "flex", alignItems: "center", gap: 5, padding: "9px 14px", borderRadius: 10, border: `1px solid ${borderColor}`, background: "transparent", color: textPrimary, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
    >
        <Film size={14} /> {videoSettings.resolution} · {videoSettings.duration}s
    </button>
    <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "9px 16px", borderRadius: 10, border: `1px solid ${borderColor}`, background: "transparent", color: textPrimary, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
        <Save size={14} /> Save
    </button>
    <button onClick={handleGenerateVideo} disabled={isGenerating} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${accent}, ${accent}dd)`, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 14px ${accent}35`, opacity: isGenerating ? 0.7 : 1 }}>
        {isGenerating ? <><div style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin-enhance 0.6s linear infinite" }} /> Generating...</> : <><Film size={14} /> Generate Video</>}
    </button>
</div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {mode === "text" && (
                    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                        {textView === "gallery" && (
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, animation: "fadeInUp 0.35s ease both" }}>
                                <div style={{ marginBottom: 14, flexShrink: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                        <Palette size={18} color={accent} />
                                        <h2 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, margin: 0 }}>Scene Templates</h2>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: accent, background: `${accent}12`, padding: "2px 8px", borderRadius: 5 }}>{SCENE_TEMPLATES.length}</span>
                                    </div>
                                    <p style={{ fontSize: 12, color: textSecondary, margin: 0 }}>Choose a scene, upload your product, let AI compose the shot.</p>
                                </div>
                                <div style={{ flex: 1, overflow: "auto", minHeight: 0, WebkitOverflowScrolling: "touch" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: galleryGridCols, gap: isMobile ? 12 : 16, paddingBottom: 20 }}>
                                        {SCENE_TEMPLATES.map((t) => (
                                            <TemplateCard key={t.id} template={t} onClick={() => handleSelectTemplate(t)} isDark={isDark} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {textView === "upload" && selectedTemplate && (
                            <UploadScreen template={selectedTemplate} onGenerate={handleGenerate} onBack={handleBackToGallery} isDark={isDark} screen={screen} />
                        )}
                        {textView === "generating" && selectedTemplate && (
                            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible" }}>
                                <ShootingStarAnimation template={selectedTemplate} onComplete={handleGenerationComplete} isDark={isDark} screen={screen} />
                            </div>
                        )}
                        {textView === "result" && selectedTemplate && (
                            <ResultScreen template={selectedTemplate} onBack={handleBackToGallery} onRegenerate={handleGenerate} isDark={isDark} screen={screen} />
                        )}
                    </div>
                )}
            </div>

            {/* Video Settings Popover */}
            {showVideoSettings && (
                <div
                    onClick={() => setShowVideoSettings(false)}
                    style={{
                        position: "fixed", inset: 0, zIndex: 9000,
                        background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        animation: "fadeIn 0.2s ease",
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "min(420px, 92vw)", borderRadius: 18,
                            background: isDark ? "#1a1025" : "#fff",
                            border: `1px solid ${borderColor}`,
                            padding: 24, animation: "fadeInUp 0.25s ease",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Film size={18} color={accent} />
                                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: textPrimary }}>Video Settings</h3>
                            </div>
                            <button onClick={() => setShowVideoSettings(false)} style={{ background: "none", border: "none", cursor: "pointer", color: textSecondary, padding: 4, display: "flex" }}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Resolution */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: textPrimary, marginBottom: 8 }}>Resolution</label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                                {([
                                    { id: "480p" as const, label: "480p" },
                                    { id: "720p" as const, label: "720p" },
                                    { id: "1080p" as const, label: "1080p" },
                                ]).map((r) => (
                                    <button
                                        key={r.id}
                                        onClick={() => setVideoSettings(s => ({ ...s, resolution: r.id }))}
                                        style={{
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            padding: "12px 8px", borderRadius: 10,
                                            border: `1.5px solid ${videoSettings.resolution === r.id ? accent : borderColor}`,
                                            background: videoSettings.resolution === r.id ? `${accent}15` : "transparent",
                                            color: videoSettings.resolution === r.id ? accent : textPrimary,
                                            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                                            transition: "all 0.15s ease",
                                        }}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Duration */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <label style={{ fontSize: 12, fontWeight: 700, color: textPrimary }}>Duration per clip</label>
                                <span style={{ fontSize: 12, fontWeight: 700, color: accent, fontVariantNumeric: "tabular-nums" }}>{videoSettings.duration}s</span>
                            </div>
                            <BrushSlider
                                value={videoSettings.duration}
                                min={3}
                                max={10}
                                onChange={(v) => setVideoSettings(s => ({ ...s, duration: v }))}
                                width={372}
                                accent={accent}
                                isDark={isDark}
                            />
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: textSecondary }}>
                                <span>3s</span><span>10s</span>
                            </div>
                        </div>

                        {/* Summary */}
                        <div style={{ padding: 12, borderRadius: 10, background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", marginBottom: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: textSecondary }}>
                                <span>Clips to generate</span>
                                <span style={{ color: textPrimary, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{Math.max(0, panels.filter(p => p.enhancedUrl).length - 1)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowVideoSettings(false)}
                            style={{
                                width: "100%", padding: "12px", borderRadius: 12, border: "none",
                                background: accent, color: "#fff", fontSize: 13, fontWeight: 700,
                                cursor: "pointer", fontFamily: "inherit",
                            }}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

            {/* Video Generation Modal + Snackbar are rendered globally via VideoGenerationProvider */}

            {/* History — saved generations on this device */}
            {!isEmptyDrawing && <MarketingHistorySection isMobile={isMobile} />}
        </div>
    )
}