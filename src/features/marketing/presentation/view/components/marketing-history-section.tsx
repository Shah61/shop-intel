"use client"

import * as React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTheme } from "next-themes"
import {
    Clock,
    Image as ImageIcon,
    Film,
    Trash2,
    Download,
    X,
    Eye,
    Sparkles,
    AlertTriangle,
} from "lucide-react"
import {
    listHistory,
    deleteHistoryItem,
    clearAllHistory,
    getHistoryBlobUrl,
    downloadHistoryBlob,
    formatRelative,
    formatBytes,
    subscribeHistory,
    type HistoryItem,
    type ImageHistoryItem,
    type VideoHistoryItem,
} from "@/src/features/marketing/presentation/view/lib/marketing-history"

function getAccent(): string {
    if (typeof window === "undefined") return "#7c3aed"
    return (
        getComputedStyle(document.documentElement).getPropertyValue("--preset-primary").trim() ||
        "#7c3aed"
    )
}

type FilterTab = "all" | "image" | "video"

/* ════════════════════════════════════════════
   Section
   ════════════════════════════════════════════ */
export function MarketingHistorySection({ isMobile }: { isMobile?: boolean } = {}) {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"
    const accent = getAccent()
    const [items, setItems] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<FilterTab>("all")
    const [preview, setPreview] = useState<HistoryItem | null>(null)
    const [confirmClear, setConfirmClear] = useState(false)

    const refresh = useCallback(async () => {
        setLoading(true)
        const list = await listHistory()
        setItems(list)
        setLoading(false)
    }, [])

    useEffect(() => {
        refresh()
        const off = subscribeHistory(() => {
            refresh()
        })
        const onWindow = () => refresh()
        window.addEventListener("pulse-marketing-history-changed", onWindow)
        return () => {
            off()
            window.removeEventListener("pulse-marketing-history-changed", onWindow)
        }
    }, [refresh])

    const filtered = useMemo(() => {
        if (filter === "all") return items
        return items.filter((i) => i.type === filter)
    }, [items, filter])

    const counts = useMemo(() => {
        let img = 0
        let vid = 0
        let bytes = 0
        for (const i of items) {
            bytes += i.bytes || 0
            if (i.type === "image") img++
            else vid++
        }
        return { img, vid, bytes }
    }, [items])

    const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
    const cardBg = isDark
        ? "linear-gradient(135deg, rgba(26, 34, 44, 0.85), rgba(35, 45, 56, 0.78))"
        : "rgba(0,0,0,0.018)"
    const subtle = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"
    const textPrimary = "hsl(var(--foreground))"
    const textSecondary = "hsl(var(--muted-foreground))"

    const tabs: { id: FilterTab; label: string; count: number; icon: React.ReactNode }[] = [
        { id: "all", label: "All", count: items.length, icon: <Sparkles size={13} /> },
        { id: "image", label: "Images", count: counts.img, icon: <ImageIcon size={13} /> },
        { id: "video", label: "Videos", count: counts.vid, icon: <Film size={13} /> },
    ]

    return (
        <section
            style={{
                marginTop: isMobile ? 24 : 36,
                paddingTop: isMobile ? 18 : 24,
                borderTop: `1px solid ${borderColor}`,
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                    marginBottom: 16,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 11,
                            background: `${accent}18`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Clock size={17} color={accent} />
                    </div>
                    <div>
                        <h3
                            style={{
                                margin: 0,
                                fontSize: 16,
                                fontWeight: 700,
                                color: textPrimary,
                                letterSpacing: "-0.01em",
                            }}
                        >
                            Your history
                        </h3>
                        <p style={{ margin: "2px 0 0", fontSize: 11.5, color: textSecondary }}>
                            {items.length === 0
                                ? "Generations you create will be saved here, on this device."
                                : `${counts.img} image${counts.img === 1 ? "" : "s"} · ${counts.vid} video${
                                      counts.vid === 1 ? "" : "s"
                                  } · ${formatBytes(counts.bytes)}`}
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {/* Tabs */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            padding: 3,
                            borderRadius: 10,
                            background: subtle,
                            gap: 2,
                        }}
                    >
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setFilter(t.id)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                    padding: "6px 12px",
                                    borderRadius: 8,
                                    border: "none",
                                    background: filter === t.id ? (isDark ? "#0a0815" : "#fff") : "transparent",
                                    color: filter === t.id ? textPrimary : textSecondary,
                                    fontSize: 11.5,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    boxShadow: filter === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                                    transition: "background 0.15s ease",
                                }}
                            >
                                {t.icon}
                                <span>{t.label}</span>
                                <span
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: filter === t.id ? accent : textSecondary,
                                        opacity: t.count === 0 ? 0.5 : 1,
                                    }}
                                >
                                    {t.count}
                                </span>
                            </button>
                        ))}
                    </div>
                    {items.length > 0 && (
                        <button
                            onClick={() => setConfirmClear(true)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "8px 12px",
                                borderRadius: 9,
                                border: `1px solid ${borderColor}`,
                                background: "transparent",
                                color: textSecondary,
                                fontSize: 11.5,
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "inherit",
                            }}
                            title="Clear all history"
                        >
                            <Trash2 size={13} /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Body */}
            {loading && items.length === 0 ? (
                <SkeletonGrid isDark={isDark} />
            ) : filtered.length === 0 ? (
                <EmptyState filter={filter} isDark={isDark} accent={accent} />
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: isMobile
                            ? "repeat(auto-fill, minmax(160px, 1fr))"
                            : "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: isMobile ? 10 : 14,
                    }}
                >
                    {filtered.map((item) => (
                        <HistoryCard
                            key={item.id}
                            item={item}
                            isDark={isDark}
                            accent={accent}
                            cardBg={cardBg}
                            borderColor={borderColor}
                            textPrimary={textPrimary}
                            textSecondary={textSecondary}
                            onPreview={() => setPreview(item)}
                            onDelete={async () => {
                                if (confirm("Remove this from history?")) {
                                    await deleteHistoryItem(item.id)
                                }
                            }}
                            onDownload={async () => {
                                if (item.type === "image") {
                                    await downloadHistoryBlob(item.fullBlobId, `${slugify(item.title)}.png`)
                                } else {
                                    for (let i = 0; i < item.clipBlobIds.length; i++) {
                                        await downloadHistoryBlob(
                                            item.clipBlobIds[i],
                                            `${slugify(item.title)}-clip-${i + 1}.mp4`
                                        )
                                        await new Promise((r) => setTimeout(r, 700))
                                    }
                                }
                            }}
                        />
                    ))}
                </div>
            )}

            {preview && (
                <PreviewModal item={preview} isDark={isDark} accent={accent} onClose={() => setPreview(null)} />
            )}

            {confirmClear && (
                <ConfirmClearModal
                    isDark={isDark}
                    accent={accent}
                    onCancel={() => setConfirmClear(false)}
                    onConfirm={async () => {
                        await clearAllHistory()
                        setConfirmClear(false)
                    }}
                />
            )}
        </section>
    )
}

/* ════════════════════════════════════════════
   Card
   ════════════════════════════════════════════ */
function HistoryCard({
    item,
    isDark,
    accent,
    cardBg,
    borderColor,
    textPrimary,
    textSecondary,
    onPreview,
    onDelete,
    onDownload,
}: {
    item: HistoryItem
    isDark: boolean
    accent: string
    cardBg: string
    borderColor: string
    textPrimary: string
    textSecondary: string
    onPreview: () => void
    onDelete: () => void
    onDownload: () => void
}) {
    const [hover, setHover] = useState(false)

    const subtitle =
        item.type === "image"
            ? item.description?.slice(0, 60) || `Scene ${item.sceneIndex + 1}`
            : `${item.clipCount} clip${item.clipCount === 1 ? "" : "s"} · ${item.resolution} · ${item.durationPerClip}s each`

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onPreview}
            role="button"
            style={{
                position: "relative",
                borderRadius: 14,
                overflow: "hidden",
                background: cardBg,
                border: `1px solid ${borderColor}`,
                cursor: "pointer",
                transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                transform: hover ? "translateY(-2px)" : "none",
                boxShadow: hover
                    ? isDark
                        ? "0 14px 36px rgba(0,0,0,0.4)"
                        : "0 14px 36px rgba(15,23,42,0.12)"
                    : "none",
                borderColor: hover ? `${accent}55` : borderColor,
            }}
        >
            {/* Thumbnail */}
            <div
                style={{
                    position: "relative",
                    aspectRatio: "16/10",
                    background: isDark ? "#0d0a14" : "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                }}
            >
                {item.thumbDataUrl ? (
                    <img
                        src={item.thumbDataUrl}
                        alt=""
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.4s ease",
                            transform: hover ? "scale(1.04)" : "scale(1)",
                        }}
                    />
                ) : (
                    <div style={{ color: textSecondary, fontSize: 11 }}>No preview</div>
                )}

                {/* Type badge */}
                <div
                    style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 8px",
                        borderRadius: 999,
                        background: isDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.85)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        color: textPrimary,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.02em",
                        textTransform: "uppercase",
                    }}
                >
                    {item.type === "image" ? <ImageIcon size={11} /> : <Film size={11} />}
                    <span>{item.type}</span>
                </div>

                {/* Video play affordance */}
                {item.type === "video" && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            pointerEvents: "none",
                        }}
                    >
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                background: "rgba(0,0,0,0.6)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: hover ? 1 : 0.85,
                                transform: hover ? "scale(1.06)" : "scale(1)",
                                transition: "all 0.2s ease",
                                backdropFilter: "blur(4px)",
                            }}
                        >
                            {/* triangle play icon */}
                            <div
                                style={{
                                    width: 0,
                                    height: 0,
                                    borderTop: "8px solid transparent",
                                    borderBottom: "8px solid transparent",
                                    borderLeft: "13px solid #fff",
                                    marginLeft: 3,
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Hover actions */}
                <div
                    style={{
                        position: "absolute",
                        right: 8,
                        bottom: 8,
                        display: "flex",
                        gap: 6,
                        opacity: hover ? 1 : 0,
                        transform: hover ? "translateY(0)" : "translateY(4px)",
                        transition: "all 0.18s ease",
                    }}
                >
                    <IconAction
                        title="Preview"
                        onClick={(e) => {
                            e.stopPropagation()
                            onPreview()
                        }}
                    >
                        <Eye size={13} />
                    </IconAction>
                    <IconAction
                        title="Download"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDownload()
                        }}
                    >
                        <Download size={13} />
                    </IconAction>
                    <IconAction
                        danger
                        title="Delete"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete()
                        }}
                    >
                        <Trash2 size={13} />
                    </IconAction>
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: "10px 12px 12px" }}>
                <div
                    style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: textPrimary,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        letterSpacing: "-0.01em",
                    }}
                    title={item.title}
                >
                    {item.title}
                </div>
                <div
                    style={{
                        fontSize: 11,
                        color: textSecondary,
                        marginTop: 2,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                    title={subtitle}
                >
                    {subtitle}
                </div>
                <div
                    style={{
                        marginTop: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: 10.5,
                        color: textSecondary,
                    }}
                >
                    <span>{formatRelative(item.createdAt)}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatBytes(item.bytes)}</span>
                </div>
            </div>
        </div>
    )
}

function IconAction({
    children,
    onClick,
    title,
    danger,
}: {
    children: React.ReactNode
    onClick: (e: React.MouseEvent) => void
    title: string
    danger?: boolean
}) {
    return (
        <button
            onClick={onClick}
            title={title}
            style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                border: "none",
                background: danger ? "rgba(239,68,68,0.92)" : "rgba(0,0,0,0.65)",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(4px)",
                fontFamily: "inherit",
            }}
        >
            {children}
        </button>
    )
}

/* ════════════════════════════════════════════
   Empty / Skeleton
   ════════════════════════════════════════════ */
function EmptyState({ filter, isDark, accent }: { filter: FilterTab; isDark: boolean; accent: string }) {
    const messages: Record<FilterTab, string> = {
        all: "Sketch a scene and hit Enhance, or generate a video — they'll all show up here.",
        image: "Enhanced canvas images will land here so you can revisit or download them later.",
        video: "Once a storyboard finishes rendering, it gets archived here — even after you refresh.",
    }
    return (
        <div
            style={{
                padding: "32px 16px",
                textAlign: "center",
                borderRadius: 14,
                border: `1px dashed ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                color: "hsl(var(--muted-foreground))",
                fontSize: 12.5,
                lineHeight: 1.5,
                maxWidth: 540,
                margin: "0 auto",
            }}
        >
            <div
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `${accent}18`,
                    margin: "0 auto 10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Clock size={18} color={accent} />
            </div>
            <div style={{ fontWeight: 700, color: "hsl(var(--foreground))", marginBottom: 4 }}>
                Nothing here yet
            </div>
            <div>{messages[filter]}</div>
        </div>
    )
}

function SkeletonGrid({ isDark }: { isDark: boolean }) {
    const bg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 14,
            }}
        >
            {[0, 1, 2, 3].map((i) => (
                <div
                    key={i}
                    style={{
                        borderRadius: 14,
                        overflow: "hidden",
                        background: bg,
                        height: 220,
                        animation: `pulse-skeleton 1.6s ease-in-out ${i * 0.1}s infinite`,
                    }}
                />
            ))}
            <style>{`@keyframes pulse-skeleton { 0%,100% { opacity: 0.7 } 50% { opacity: 1 } }`}</style>
        </div>
    )
}

/* ════════════════════════════════════════════
   Preview modal — image or video
   ════════════════════════════════════════════ */
function PreviewModal({
    item,
    isDark,
    accent,
    onClose,
}: {
    item: HistoryItem
    isDark: boolean
    accent: string
    onClose: () => void
}) {
    return item.type === "image" ? (
        <ImagePreviewModal item={item} isDark={isDark} accent={accent} onClose={onClose} />
    ) : (
        <VideoPreviewModal item={item} isDark={isDark} accent={accent} onClose={onClose} />
    )
}

function ImagePreviewModal({
    item,
    isDark,
    accent,
    onClose,
}: {
    item: ImageHistoryItem
    isDark: boolean
    accent: string
    onClose: () => void
}) {
    const [src, setSrc] = useState<string | null>(null)
    useEffect(() => {
        let url: string | null = null
        let cancelled = false
        getHistoryBlobUrl(item.fullBlobId).then((u) => {
            if (cancelled) {
                if (u) URL.revokeObjectURL(u)
                return
            }
            url = u
            setSrc(u)
        })
        return () => {
            cancelled = true
            if (url) URL.revokeObjectURL(url)
        }
    }, [item.fullBlobId])

    return (
        <ModalShell isDark={isDark} onClose={onClose} title={item.title} subtitle={formatRelative(item.createdAt)}>
            <div
                style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    background: "#000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 260,
                    maxHeight: "60vh",
                    marginBottom: 16,
                }}
            >
                {src ? (
                    <img
                        src={src}
                        alt={item.title}
                        style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain" }}
                    />
                ) : (
                    <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Loading…</div>
                )}
            </div>
            {item.description && (
                <p
                    style={{
                        margin: "0 0 14px",
                        fontSize: 12.5,
                        color: "hsl(var(--muted-foreground))",
                        lineHeight: 1.5,
                    }}
                >
                    {item.description}
                </p>
            )}
            <ModalActions
                accent={accent}
                onClose={onClose}
                onDownload={() =>
                    downloadHistoryBlob(item.fullBlobId, `${slugify(item.title)}.png`)
                }
            />
        </ModalShell>
    )
}

function VideoPreviewModal({
    item,
    isDark,
    accent,
    onClose,
}: {
    item: VideoHistoryItem
    isDark: boolean
    accent: string
    onClose: () => void
}) {
    const [urls, setUrls] = useState<string[]>([])
    const [idx, setIdx] = useState(0)
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        let alive = true
        const created: string[] = []
        Promise.all(item.clipBlobIds.map((bid) => getHistoryBlobUrl(bid))).then((arr) => {
            const cleaned = arr.filter((u): u is string => Boolean(u))
            if (!alive) {
                cleaned.forEach((u) => URL.revokeObjectURL(u))
                return
            }
            cleaned.forEach((u) => created.push(u))
            setUrls(cleaned)
        })
        return () => {
            alive = false
            created.forEach((u) => URL.revokeObjectURL(u))
        }
    }, [item.clipBlobIds])

    useEffect(() => {
        if (videoRef.current && urls[idx]) {
            videoRef.current.load()
            videoRef.current.play().catch(() => {})
        }
    }, [idx, urls])

    const handleEnd = () => {
        if (idx < urls.length - 1) setIdx(idx + 1)
        else setIdx(0)
    }

    return (
        <ModalShell isDark={isDark} onClose={onClose} title={item.title} subtitle={`${formatRelative(item.createdAt)} · ${item.resolution} · ${item.durationPerClip}s/clip`}>
            <div
                style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    background: "#000",
                    aspectRatio: "16/9",
                    position: "relative",
                    marginBottom: 14,
                }}
            >
                {urls.length > 0 ? (
                    <video
                        ref={videoRef}
                        key={urls[idx]}
                        src={urls[idx]}
                        controls
                        autoPlay
                        playsInline
                        onEnded={handleEnd}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                ) : (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "rgba(255,255,255,0.6)",
                            fontSize: 12,
                        }}
                    >
                        Loading clip…
                    </div>
                )}
                {urls.length > 1 && (
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
                        {urls.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIdx(i)}
                                style={{
                                    width: i === idx ? 24 : 8,
                                    height: 4,
                                    borderRadius: 2,
                                    border: "none",
                                    background: i === idx ? "#fff" : "rgba(255,255,255,0.4)",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {item.sceneThumbDataUrls.length > 0 && (
                <div
                    style={{
                        display: "flex",
                        gap: 6,
                        marginBottom: 14,
                        overflowX: "auto",
                        paddingBottom: 4,
                    }}
                >
                    {item.sceneThumbDataUrls.map((u, i) => (
                        <img
                            key={i}
                            src={u}
                            alt=""
                            style={{
                                width: 64,
                                height: 44,
                                borderRadius: 8,
                                objectFit: "cover",
                                flexShrink: 0,
                                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                            }}
                        />
                    ))}
                </div>
            )}

            <ModalActions
                accent={accent}
                onClose={onClose}
                onDownload={async () => {
                    for (let i = 0; i < item.clipBlobIds.length; i++) {
                        await downloadHistoryBlob(
                            item.clipBlobIds[i],
                            `${slugify(item.title)}-clip-${i + 1}.mp4`
                        )
                        await new Promise((r) => setTimeout(r, 700))
                    }
                }}
                downloadLabel={
                    item.clipBlobIds.length > 1
                        ? `Download ${item.clipBlobIds.length} clips`
                        : "Download video"
                }
            />
        </ModalShell>
    )
}

/* ════════════════════════════════════════════
   Modal shells & actions
   ════════════════════════════════════════════ */
function ModalShell({
    isDark,
    onClose,
    title,
    subtitle,
    children,
}: {
    isDark: boolean
    onClose: () => void
    title: string
    subtitle?: string
    children: React.ReactNode
}) {
    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9400,
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                animation: "pulse-fade-in 0.2s ease",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "min(720px, 100%)",
                    maxHeight: "90vh",
                    overflow: "auto",
                    borderRadius: 20,
                    background: isDark ? "#1a1025" : "#fff",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                    padding: 22,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                    animation: "pulse-rise-in 0.25s ease",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 16,
                        marginBottom: 14,
                    }}
                >
                    <div>
                        <h3
                            style={{
                                margin: 0,
                                fontSize: 16,
                                fontWeight: 700,
                                color: "hsl(var(--foreground))",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            {title}
                        </h3>
                        {subtitle && (
                            <p style={{ margin: "2px 0 0", fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "hsl(var(--muted-foreground))",
                            padding: 4,
                            display: "flex",
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}

function ModalActions({
    accent,
    onClose,
    onDownload,
    downloadLabel = "Download",
}: {
    accent: string
    onClose: () => void
    onDownload?: () => void
    downloadLabel?: string
}) {
    return (
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
            {onDownload && (
                <button
                    onClick={onDownload}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "9px 16px",
                        borderRadius: 10,
                        border: `1px solid hsl(var(--border))`,
                        background: "transparent",
                        color: "hsl(var(--foreground))",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                    }}
                >
                    <Download size={14} /> {downloadLabel}
                </button>
            )}
            <button
                onClick={onClose}
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
                Done
            </button>
        </div>
    )
}

function ConfirmClearModal({
    isDark,
    accent,
    onCancel,
    onConfirm,
}: {
    isDark: boolean
    accent: string
    onCancel: () => void
    onConfirm: () => void
}) {
    return (
        <div
            onClick={onCancel}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9450,
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                animation: "pulse-fade-in 0.2s ease",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "min(420px, 100%)",
                    borderRadius: 18,
                    background: isDark ? "#1a1025" : "#fff",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                    padding: 22,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                    animation: "pulse-rise-in 0.25s ease",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: "rgba(239,68,68,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <AlertTriangle size={17} color="#ef4444" />
                    </div>
                    <div>
                        <h3
                            style={{
                                margin: 0,
                                fontSize: 15,
                                fontWeight: 700,
                                color: "hsl(var(--foreground))",
                            }}
                        >
                            Clear all history?
                        </h3>
                        <p
                            style={{
                                margin: "2px 0 0",
                                fontSize: 11.5,
                                color: "hsl(var(--muted-foreground))",
                            }}
                        >
                            This removes every saved image and video on this device. Cannot be undone.
                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18 }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: "9px 16px",
                            borderRadius: 10,
                            border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                            background: "transparent",
                            color: "hsl(var(--foreground))",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: "9px 16px",
                            borderRadius: 10,
                            border: "none",
                            background: "#ef4444",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "inherit",
                        }}
                    >
                        <Trash2 size={13} style={{ marginRight: 5, marginBottom: -2 }} /> Clear all
                    </button>
                </div>
            </div>
        </div>
    )
}

function slugify(s: string): string {
    return (
        s
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 60) || "item"
    )
}
