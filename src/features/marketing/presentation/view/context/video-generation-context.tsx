"use client"

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react"
import { useTheme } from "next-themes"
import {
    Film,
    X,
    Check,
    ChevronUp,
    Download,
    ArrowRight,
    Sparkles,
    Cat,
    AlertTriangle,
} from "lucide-react"
import { saveVideoProjectToHistory } from "@/src/features/marketing/presentation/view/lib/marketing-history"

/* ════════════════════════════════════════════
   Types
   ════════════════════════════════════════════ */
export interface VideoClip {
    id: string
    fromPanelId: string
    toPanelId: string
    status: "queued" | "submitting" | "polling" | "complete" | "failed"
    pollingUrl?: string
    videoUrl?: string
    error?: string
}

export interface VideoSettings {
    resolution: "480p" | "720p" | "1080p"
    duration: number
}

export interface PanelSnapshot {
    id: string
    title: string
    description: string
    enhancedUrl: string | null
}

interface StartArgs {
    panels: PanelSnapshot[]
    settings: VideoSettings
}

interface ContextValue {
    clips: VideoClip[]
    panels: PanelSnapshot[]
    settings: VideoSettings | null
    isGenerating: boolean
    isModalOpen: boolean
    isSnackbarVisible: boolean
    startGeneration: (args: StartArgs) => void
    openModal: () => void
    closeModal: () => void
    dismissSnackbar: () => void
    downloadAllClips: () => Promise<void>
    resetAll: () => void
}

const Ctx = createContext<ContextValue | null>(null)

export function useVideoGeneration() {
    const v = useContext(Ctx)
    if (!v) throw new Error("useVideoGeneration must be used within VideoGenerationProvider")
    return v
}

/* ════════════════════════════════════════════
   Helpers
   ════════════════════════════════════════════ */
function getAccent(): string {
    if (typeof window === "undefined") return "#7c3aed"
    return (
        getComputedStyle(document.documentElement).getPropertyValue("--preset-primary").trim() ||
        "#7c3aed"
    )
}

const PURR_LOADING_LINES = [
    "Cooking up your purrfect video…",
    "Herding cats and frames…",
    "Stretching the pixels into shape…",
    "Pawing through the render queue…",
    "Almost meowdone…",
    "Mixing a little catnip into the timeline…",
    "Stitching scenes with whisker-precision…",
]

function proxiedSrc(url?: string): string | undefined {
    if (!url) return undefined
    if (url.startsWith("data:") || url.startsWith("blob:")) return url
    return `/api/proxy-video?url=${encodeURIComponent(url)}`
}

function downloadUrl(url: string, filename: string): string {
    return `/api/proxy-video?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`
}

/* ════════════════════════════════════════════
   Provider
   ════════════════════════════════════════════ */
export function VideoGenerationProvider({ children }: { children: ReactNode }) {
    const [clips, setClips] = useState<VideoClip[]>([])
    const [panels, setPanels] = useState<PanelSnapshot[]>([])
    const [settings, setSettings] = useState<VideoSettings | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [snackbarDismissed, setSnackbarDismissed] = useState(false)
    const generationIdRef = useRef(0)

    const isGenerating = useMemo(
        () =>
            clips.length > 0 &&
            clips.some((c) => c.status === "queued" || c.status === "submitting" || c.status === "polling"),
        [clips]
    )
    const allDone = useMemo(
        () => clips.length > 0 && clips.every((c) => c.status === "complete" || c.status === "failed"),
        [clips]
    )
    const isSnackbarVisible = clips.length > 0 && !snackbarDismissed

    const updateClip = useCallback((id: string, patch: Partial<VideoClip>) => {
        setClips((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
    }, [])

    // Persist a finished project to local history exactly once per generation.
    const archivedRef = useRef<string | null>(null)
    useEffect(() => {
        if (clips.length === 0 || !settings) return
        if (!clips.every((c) => c.status === "complete" || c.status === "failed")) return
        const ready = clips.filter((c) => c.status === "complete" && c.videoUrl)
        if (ready.length === 0) return
        const fingerprint = clips.map((c) => c.id).join("|")
        if (archivedRef.current === fingerprint) return
        archivedRef.current = fingerprint

        const sceneEnhancedDataUrls = panels
            .map((p) => p.enhancedUrl)
            .filter((u): u is string => Boolean(u))

        saveVideoProjectToHistory({
            videoUrls: ready.map((c) => c.videoUrl!),
            sceneEnhancedDataUrls,
            durationPerClip: settings.duration,
            resolution: settings.resolution,
        }).catch((e) => console.warn("[history] saveVideo failed:", e))
    }, [clips, panels, settings])

    const startGeneration = useCallback(
        ({ panels: ps, settings: s }: StartArgs) => {
            const valid = ps.filter((p) => p.enhancedUrl)
            if (valid.length < 2) return

            const newClips: VideoClip[] = []
            for (let i = 0; i < valid.length - 1; i++) {
                newClips.push({
                    id: `clip-${i}-${Date.now()}`,
                    fromPanelId: valid[i].id,
                    toPanelId: valid[i + 1].id,
                    status: "queued",
                })
            }

            const myGenId = ++generationIdRef.current
            setPanels(valid)
            setSettings(s)
            setClips(newClips)
            setIsModalOpen(true)
            setSnackbarDismissed(false)

            // Run all clips in parallel
            newClips.forEach(async (clip) => {
                const fromPanel = valid.find((p) => p.id === clip.fromPanelId)!
                const toPanel = valid.find((p) => p.id === clip.toPanelId)!

                try {
                    if (myGenId !== generationIdRef.current) return
                    updateClip(clip.id, { status: "submitting" })

                    const fromLabel =
                        fromPanel.description?.trim() || fromPanel.title?.trim() || "the first scene"
                    const toLabel =
                        toPanel.description?.trim() || toPanel.title?.trim() || "the next scene"
                    const motionPrompt = [
                        `Cinematic image-to-video transition. The first frame shows: ${fromLabel}. The last frame shows: ${toLabel}.`,
                        `Animate naturally from the first frame to the last frame — smooth camera motion, realistic subject movement, consistent lighting between scenes.`,
                        `CRITICAL: The product/hero subject must remain visually IDENTICAL across the entire clip — same shape, colors, labels, branding, and proportions as shown in the input frames. Do not redesign or restyle the product.`,
                        `${s.duration}s, ${s.resolution}, premium commercial-quality footage.`,
                    ].join(" ")

                    const submitRes = await fetch("/api/generate-video", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            firstFrameUrl: fromPanel.enhancedUrl,
                            lastFrameUrl: toPanel.enhancedUrl,
                            resolution: s.resolution,
                            duration: s.duration,
                            prompt: motionPrompt,
                        }),
                    })
                    if (!submitRes.ok) {
                        const err = await submitRes.json().catch(() => ({}))
                        throw new Error(err.error || "Submit failed")
                    }

                    const submitData = await submitRes.json()
                    if (process.env.NODE_ENV !== 'production') {
                        console.log('[startGeneration] submit response:', submitData)
                    }

                    const pollingUrl: string | null =
                        submitData?.pollingUrl ||
                        submitData?.polling_url ||
                        submitData?.url ||
                        null

                    if (!pollingUrl || typeof pollingUrl !== 'string') {
                        console.error('[startGeneration] no usable pollingUrl in submit response:', submitData)
                        throw new Error(
                            `No polling URL returned. Got: ${JSON.stringify(submitData).slice(0, 200)}`
                        )
                    }

                    if (myGenId !== generationIdRef.current) return
                    updateClip(clip.id, { status: "polling", pollingUrl })

                    const maxAttempts = 60
                    for (let attempt = 0; attempt < maxAttempts; attempt++) {
                        await new Promise((r) => setTimeout(r, 5000))
                        if (myGenId !== generationIdRef.current) return

                        const pollRes = await fetch("/api/poll-video", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ pollingUrl: String(pollingUrl) }),
                        })
                        if (!pollRes.ok) continue
                        const { status, videoUrls, error } = await pollRes.json()

                        if (status === "completed" && videoUrls?.length > 0) {
                            updateClip(clip.id, { status: "complete", videoUrl: videoUrls[0] })
                            return
                        }
                        if (status === "failed") throw new Error(error || "Generation failed")
                    }
                    throw new Error("Timed out after 5 minutes")
                } catch (err) {
                    if (myGenId !== generationIdRef.current) return
                    console.error(`Clip ${clip.id} failed:`, err)
                    updateClip(clip.id, {
                        status: "failed",
                        error: (err as Error).message,
                    })
                }
            })
        },
        [updateClip]
    )

    const openModal = useCallback(() => {
        setIsModalOpen(true)
        setSnackbarDismissed(false)
    }, [])

    const closeModal = useCallback(() => setIsModalOpen(false), [])
    const dismissSnackbar = useCallback(() => setSnackbarDismissed(true), [])

    const resetAll = useCallback(() => {
        generationIdRef.current++
        setClips([])
        setPanels([])
        setSettings(null)
        setIsModalOpen(false)
        setSnackbarDismissed(false)
    }, [])

    const downloadAllClips = useCallback(async () => {
        const ready = clips.filter((c) => c.status === "complete" && c.videoUrl)
        for (let i = 0; i < ready.length; i++) {
            const c = ready[i]
            const filename = `pulse-clip-${i + 1}.mp4`
            const a = document.createElement("a")
            a.href = downloadUrl(c.videoUrl!, filename)
            a.download = filename
            document.body.appendChild(a)
            a.click()
            a.remove()
            if (i < ready.length - 1) await new Promise((r) => setTimeout(r, 800))
        }
    }, [clips])

    const value: ContextValue = {
        clips,
        panels,
        settings,
        isGenerating,
        isModalOpen,
        isSnackbarVisible,
        startGeneration,
        openModal,
        closeModal,
        dismissSnackbar,
        downloadAllClips,
        resetAll,
    }

    return (
        <Ctx.Provider value={value}>
            {children}
            <VideoSnackbar />
            {isModalOpen && <VideoGenerationModal />}
            <SharedKeyframes />
        </Ctx.Provider>
    )
}

/* ════════════════════════════════════════════
   Shared keyframes (snackbar + modal)
   ════════════════════════════════════════════ */
function SharedKeyframes() {
    return (
        <style>{`
@keyframes pulse-snack-in {
  0% { transform: translateX(120%) scale(0.92); opacity: 0; }
  60% { transform: translateX(-4%) scale(1.01); opacity: 1; }
  100% { transform: translateX(0) scale(1); opacity: 1; }
}
@keyframes pulse-paw-bounce {
  0%, 100% { transform: translateY(0) rotate(-6deg); }
  50% { transform: translateY(-2px) rotate(4deg); }
}
@keyframes pulse-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes pulse-spinner {
  to { transform: rotate(360deg); }
}
@keyframes pulse-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes pulse-rise-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse-pop {
  0% { transform: scale(0.8); }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
        `}</style>
    )
}

/* ════════════════════════════════════════════
   Cat-themed Snackbar (top-right, Apple-ish)
   ════════════════════════════════════════════ */
function VideoSnackbar() {
    const ctx = useVideoGeneration()
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"
    const accent = getAccent()
    const [lineIdx, setLineIdx] = useState(0)
    const [autoHidden, setAutoHidden] = useState(false)

    const completed = ctx.clips.filter((c) => c.status === "complete" && c.videoUrl)
    const failed = ctx.clips.filter((c) => c.status === "failed")
    const allDone =
        ctx.clips.length > 0 && ctx.clips.every((c) => c.status === "complete" || c.status === "failed")
    const allFailed = ctx.clips.length > 0 && ctx.clips.every((c) => c.status === "failed")
    const allComplete =
        ctx.clips.length > 0 && ctx.clips.every((c) => c.status === "complete")
    const progress = ctx.clips.length > 0 ? (completed.length + failed.length) / ctx.clips.length : 0

    // Rotate purr-loading lines every 4s while generating
    useEffect(() => {
        if (!ctx.isGenerating) return
        const t = setInterval(() => setLineIdx((i) => (i + 1) % PURR_LOADING_LINES.length), 4000)
        return () => clearInterval(t)
    }, [ctx.isGenerating])

    // Auto-hide success state after 12s of no interaction
    useEffect(() => {
        if (!allComplete) {
            setAutoHidden(false)
            return
        }
        const t = setTimeout(() => setAutoHidden(true), 12000)
        return () => clearTimeout(t)
    }, [allComplete])

    if (!ctx.isSnackbarVisible || ctx.isModalOpen) return null
    if (autoHidden) return null

    const bg = isDark ? "rgba(28, 22, 42, 0.85)" : "rgba(255, 255, 255, 0.85)"
    const border = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"
    const textPrimary = isDark ? "#fff" : "#0f172a"
    const textSecondary = isDark ? "rgba(255,255,255,0.65)" : "rgba(15,23,42,0.6)"

    const headline = allFailed
        ? "Hairball alert"
        : allComplete
        ? "Your video is meowdone!"
        : allDone
        ? `${completed.length}/${ctx.clips.length} clips ready`
        : PURR_LOADING_LINES[lineIdx]

    const subline = allFailed
        ? "Generation hiccupped — tap to see what happened"
        : allComplete
        ? "Tap to watch — purr-fect work, chef"
        : allDone
        ? `${failed.length} clip${failed.length === 1 ? "" : "s"} couldn't finish`
        : `${completed.length} of ${ctx.clips.length} clips paw-ready`

    const iconColor = allFailed ? "#ef4444" : allComplete ? "#22c55e" : accent

    return (
        <div
            role="status"
            aria-live="polite"
            style={{
                position: "fixed",
                top: 18,
                right: 18,
                zIndex: 10000,
                width: "min(360px, calc(100vw - 36px))",
                animation: "pulse-snack-in 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
        >
            <button
                onClick={ctx.openModal}
                style={{
                    all: "unset",
                    display: "block",
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "14px 14px 12px",
                    borderRadius: 18,
                    background: bg,
                    backdropFilter: "blur(28px) saturate(180%)",
                    WebkitBackdropFilter: "blur(28px) saturate(180%)",
                    border: `1px solid ${border}`,
                    boxShadow: isDark
                        ? "0 12px 40px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.3)"
                        : "0 12px 40px rgba(15,23,42,0.18), 0 2px 6px rgba(15,23,42,0.06)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                }}
            >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    {/* Icon */}
                    <div
                        style={{
                            position: "relative",
                            width: 36,
                            height: 36,
                            borderRadius: 11,
                            background: `${iconColor}1a`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            animation:
                                ctx.isGenerating ? "pulse-paw-bounce 1.4s ease-in-out infinite" : "pulse-pop 0.4s ease",
                        }}
                    >
                        {allFailed ? (
                            <AlertTriangle size={18} color={iconColor} />
                        ) : allComplete ? (
                            <Cat size={20} color={iconColor} />
                        ) : (
                            <Cat size={20} color={iconColor} />
                        )}
                        {ctx.isGenerating && (
                            <div
                                aria-hidden
                                style={{
                                    position: "absolute",
                                    inset: -3,
                                    borderRadius: 13,
                                    border: `2px solid ${iconColor}`,
                                    borderTopColor: "transparent",
                                    animation: "pulse-spinner 1.1s linear infinite",
                                }}
                            />
                        )}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                            style={{
                                fontSize: 13.5,
                                fontWeight: 700,
                                color: textPrimary,
                                lineHeight: 1.2,
                                letterSpacing: "-0.01em",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {headline}
                        </div>
                        <div
                            style={{
                                marginTop: 2,
                                fontSize: 11.5,
                                color: textSecondary,
                                lineHeight: 1.35,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {subline}
                        </div>
                    </div>

                    {/* Right side action */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            flexShrink: 0,
                            alignSelf: "center",
                        }}
                    >
                        {allComplete && (
                            <span
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: accent,
                                    padding: "6px 10px",
                                    borderRadius: 999,
                                    background: `${accent}1a`,
                                }}
                            >
                                Watch
                            </span>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                ctx.dismissSnackbar()
                            }}
                            style={{
                                all: "unset",
                                width: 22,
                                height: 22,
                                borderRadius: 999,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                color: textSecondary,
                            }}
                            aria-label="Dismiss"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                {ctx.clips.length > 0 && (
                    <div
                        style={{
                            marginTop: 10,
                            height: 4,
                            borderRadius: 999,
                            overflow: "hidden",
                            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
                        }}
                    >
                        <div
                            style={{
                                height: "100%",
                                width: `${Math.max(progress * 100, ctx.isGenerating ? 8 : 0)}%`,
                                borderRadius: 999,
                                background: ctx.isGenerating
                                    ? `linear-gradient(90deg, ${accent}55, ${accent}, ${accent}55)`
                                    : allFailed
                                    ? "#ef4444"
                                    : "#22c55e",
                                backgroundSize: "200% 100%",
                                animation: ctx.isGenerating ? "pulse-shimmer 1.6s linear infinite" : undefined,
                                transition: "width 0.5s ease",
                            }}
                        />
                    </div>
                )}
            </button>
        </div>
    )
}

/* ════════════════════════════════════════════
   Video Generation Modal (full)
   ════════════════════════════════════════════ */
function VideoGenerationModal() {
    const ctx = useVideoGeneration()
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"
    const accent = getAccent()
    const [currentClipIndex, setCurrentClipIndex] = useState(0)
    const [playbackError, setPlaybackError] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 640)
        check()
        window.addEventListener("resize", check)
        return () => window.removeEventListener("resize", check)
    }, [])

    const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
    const textPrimary = "hsl(var(--foreground))"
    const textSecondary = "hsl(var(--muted-foreground))"

    const completedClips = ctx.clips.filter((c) => c.status === "complete" && c.videoUrl)
    const failedClips = ctx.clips.filter((c) => c.status === "failed")
    const allDone =
        ctx.clips.length > 0 && ctx.clips.every((c) => c.status === "complete" || c.status === "failed")
    const allComplete =
        ctx.clips.length > 0 && ctx.clips.every((c) => c.status === "complete")
    const progress = ctx.clips.length > 0 ? (completedClips.length + failedClips.length) / ctx.clips.length : 0

    const currentSrc = proxiedSrc(completedClips[currentClipIndex]?.videoUrl)

    const handleVideoEnd = () => {
        if (currentClipIndex < completedClips.length - 1) {
            setCurrentClipIndex(currentClipIndex + 1)
        } else {
            setCurrentClipIndex(0)
        }
    }

    useEffect(() => {
        setPlaybackError(null)
        if (videoRef.current && completedClips[currentClipIndex]) {
            videoRef.current.load()
            videoRef.current.play().catch(() => {})
        }
    }, [currentClipIndex, completedClips.length])

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9500,
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                animation: "pulse-fade-in 0.25s ease",
            }}
            onClick={ctx.closeModal}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "min(720px, 100%)",
                    maxHeight: "90vh",
                    overflow: "auto",
                    borderRadius: 20,
                    background: isDark ? "#1a1025" : "#fff",
                    border: `1px solid ${borderColor}`,
                    padding: isMobile ? 18 : 28,
                    animation: "pulse-rise-in 0.3s ease",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 20,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: `${accent}15`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Film size={18} color={accent} />
                        </div>
                        <div>
                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: 16,
                                    fontWeight: 700,
                                    color: textPrimary,
                                }}
                            >
                                {allComplete
                                    ? "Video is meowdone"
                                    : allDone
                                    ? "Generation Complete"
                                    : "Generating Video"}
                            </h3>
                            <p style={{ margin: "2px 0 0", fontSize: 11, color: textSecondary }}>
                                {allComplete
                                    ? `${completedClips.length} clip${
                                          completedClips.length === 1 ? "" : "s"
                                      } stitched into one storyboard`
                                    : allDone
                                    ? `${completedClips.length} of ${ctx.clips.length} clips ready`
                                    : `Seedance is rendering your scenes — this takes 1–3 minutes per clip`}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <button
                            onClick={ctx.closeModal}
                            title="Hide to snackbar"
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: textSecondary,
                                padding: 4,
                                display: "flex",
                            }}
                        >
                            <ChevronUp size={18} />
                        </button>
                        <button
                            onClick={() => {
                                ctx.closeModal()
                                ctx.dismissSnackbar()
                            }}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: textSecondary,
                                padding: 4,
                                display: "flex",
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Player */}
                {completedClips.length > 0 && (
                    <div
                        style={{
                            marginBottom: 20,
                            borderRadius: 14,
                            overflow: "hidden",
                            background: "#000",
                            aspectRatio: "16/9",
                            position: "relative",
                        }}
                    >
                        <video
                            ref={videoRef}
                            key={currentSrc}
                            src={currentSrc}
                            controls
                            autoPlay
                            playsInline
                            preload="auto"
                            onEnded={handleVideoEnd}
                            onError={(e) => {
                                const err = (e.currentTarget as HTMLVideoElement).error
                                console.error("[VideoModal] playback error", err, "src:", currentSrc)
                                setPlaybackError(
                                    err?.code === 4
                                        ? "This clip's URL couldn't be loaded by the browser. Try opening it in a new tab."
                                        : err?.message || "Couldn't load this video."
                                )
                            }}
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                bottom: 50,
                                left: "50%",
                                transform: "translateX(-50%)",
                                display: "flex",
                                gap: 4,
                            }}
                        >
                            {completedClips.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentClipIndex(i)}
                                    style={{
                                        width: i === currentClipIndex ? 24 : 8,
                                        height: 4,
                                        borderRadius: 2,
                                        border: "none",
                                        background: i === currentClipIndex ? "#fff" : "rgba(255,255,255,0.4)",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                    }}
                                />
                            ))}
                        </div>
                        {playbackError && (
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "rgba(0,0,0,0.78)",
                                    color: "#fff",
                                    padding: 16,
                                    textAlign: "center",
                                    gap: 10,
                                }}
                            >
                                <div style={{ fontSize: 13, fontWeight: 700 }}>Playback failed</div>
                                <div style={{ fontSize: 11, opacity: 0.8, maxWidth: 360 }}>{playbackError}</div>
                                {completedClips[currentClipIndex]?.videoUrl && (
                                    <a
                                        href={completedClips[currentClipIndex]!.videoUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ fontSize: 11, color: accent, textDecoration: "underline" }}
                                    >
                                        Open original URL
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Progress bar */}
                {!allDone && (
                    <div style={{ marginBottom: 20 }}>
                        <div
                            style={{
                                height: 6,
                                borderRadius: 3,
                                background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    width: `${progress * 100}%`,
                                    background: `linear-gradient(90deg, ${accent}, ${accent}cc)`,
                                    transition: "width 0.5s ease",
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Clip list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                    {ctx.clips.map((clip, i) => {
                        const fromPanel = ctx.panels.find((p) => p.id === clip.fromPanelId)
                        const toPanel = ctx.panels.find((p) => p.id === clip.toPanelId)
                        const fromIdx = ctx.panels.findIndex((p) => p.id === clip.fromPanelId)
                        const toIdx = ctx.panels.findIndex((p) => p.id === clip.toPanelId)

                        return (
                            <div
                                key={clip.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "10px 12px",
                                    borderRadius: 10,
                                    background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                                    border: `1px solid ${borderColor}`,
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                                    {fromPanel?.enhancedUrl && (
                                        <img
                                            src={fromPanel.enhancedUrl}
                                            alt=""
                                            style={{ width: 32, height: 24, borderRadius: 4, objectFit: "cover" }}
                                        />
                                    )}
                                    <ArrowRight size={12} color={textSecondary} />
                                    {toPanel?.enhancedUrl && (
                                        <img
                                            src={toPanel.enhancedUrl}
                                            alt=""
                                            style={{ width: 32, height: 24, borderRadius: 4, objectFit: "cover" }}
                                        />
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: textPrimary }}>
                                        Clip {i + 1}: Scene {fromIdx + 1} → Scene {toIdx + 1}
                                    </div>
                                    <div style={{ fontSize: 10, color: textSecondary, marginTop: 1 }}>
                                        {clip.status === "queued" && "Queued..."}
                                        {clip.status === "submitting" && "Submitting to Seedance..."}
                                        {clip.status === "polling" && "Rendering... this can take a few minutes"}
                                        {clip.status === "complete" && "Ready to play"}
                                        {clip.status === "failed" && (clip.error || "Failed")}
                                    </div>
                                </div>
                                <div style={{ flexShrink: 0 }}>
                                    {(clip.status === "queued" ||
                                        clip.status === "submitting" ||
                                        clip.status === "polling") && (
                                        <div
                                            style={{
                                                width: 16,
                                                height: 16,
                                                border: `2px solid ${accent}`,
                                                borderTopColor: "transparent",
                                                borderRadius: "50%",
                                                animation: "pulse-spinner 0.8s linear infinite",
                                            }}
                                        />
                                    )}
                                    {clip.status === "complete" && (
                                        <div
                                            style={{
                                                width: 22,
                                                height: 22,
                                                borderRadius: "50%",
                                                background: "#22c55e",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Check size={13} color="#fff" strokeWidth={3} />
                                        </div>
                                    )}
                                    {clip.status === "failed" && (
                                        <div
                                            style={{
                                                width: 22,
                                                height: 22,
                                                borderRadius: "50%",
                                                background: "#ef4444",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <X size={13} color="#fff" strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Footer */}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                    {allDone && completedClips.length > 0 && (
                        <button
                            onClick={() => {
                                void ctx.downloadAllClips()
                            }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "9px 16px",
                                borderRadius: 10,
                                border: `1px solid ${borderColor}`,
                                background: "transparent",
                                color: textPrimary,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "inherit",
                            }}
                        >
                            <Download size={14} />
                            {completedClips.length > 1 ? `Download ${completedClips.length} clips` : "Download video"}
                        </button>
                    )}
                    <button
                        onClick={ctx.closeModal}
                        style={{
                            padding: "9px 18px",
                            borderRadius: 10,
                            border: "none",
                            background: accent,
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "inherit",
                        }}
                    >
                        {allDone ? "Done" : "Hide"}
                    </button>
                </div>
            </div>
        </div>
    )
}
