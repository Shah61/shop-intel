"use client"

/**
 * Marketing-history persistence.
 *
 * Backed by IndexedDB (cookies max out at ~4KB and localStorage at ~5MB —
 * neither can hold real videos). We split the records into:
 *
 *   - `meta`  — lightweight per-item metadata + small thumbnail data URLs
 *   - `blobs` — heavy Blobs (full-resolution images, MP4 clips) keyed by id
 *
 * Listing the history only touches `meta` so it stays fast even with a lot
 * of saved generations. Full bytes are loaded lazily when the user opens
 * the preview modal or hits download.
 */

const DB_NAME = "pulse-marketing-history"
const DB_VERSION = 1
const STORE_META = "meta"
const STORE_BLOBS = "blobs"

export type HistoryType = "image" | "video"

export interface ImageHistoryItem {
    id: string
    type: "image"
    title: string
    description: string
    sceneIndex: number
    thumbDataUrl: string
    fullBlobId: string
    bytes: number
    createdAt: number
}

export interface VideoHistoryItem {
    id: string
    type: "video"
    title: string
    thumbDataUrl: string
    sceneThumbDataUrls: string[]
    clipBlobIds: string[]
    clipCount: number
    durationPerClip: number
    resolution: string
    bytes: number
    createdAt: number
}

export type HistoryItem = ImageHistoryItem | VideoHistoryItem

/* ────────────────────────────────────────────────
   IndexedDB plumbing
   ──────────────────────────────────────────────── */
function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === "undefined") {
            reject(new Error("IndexedDB unavailable"))
            return
        }
        const req = indexedDB.open(DB_NAME, DB_VERSION)
        req.onupgradeneeded = () => {
            const db = req.result
            if (!db.objectStoreNames.contains(STORE_META)) {
                const meta = db.createObjectStore(STORE_META, { keyPath: "id" })
                meta.createIndex("createdAt", "createdAt", { unique: false })
            }
            if (!db.objectStoreNames.contains(STORE_BLOBS)) {
                db.createObjectStore(STORE_BLOBS, { keyPath: "id" })
            }
        }
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}

function tx(db: IDBDatabase, stores: string[], mode: IDBTransactionMode) {
    return db.transaction(stores, mode)
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}

/* ────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────── */
function makeId(prefix: string): string {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
    const res = await fetch(dataUrl)
    return res.blob()
}

/** Resize a data URL down to a small JPEG thumbnail via an offscreen canvas. */
async function makeThumb(sourceDataUrl: string, maxDim = 320, quality = 0.78): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
            const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1)
            const w = Math.max(1, Math.round(img.width * ratio))
            const h = Math.max(1, Math.round(img.height * ratio))
            const canvas = document.createElement("canvas")
            canvas.width = w
            canvas.height = h
            const ctx = canvas.getContext("2d")
            if (!ctx) {
                resolve(sourceDataUrl)
                return
            }
            ctx.drawImage(img, 0, 0, w, h)
            try {
                resolve(canvas.toDataURL("image/jpeg", quality))
            } catch {
                resolve(sourceDataUrl)
            }
        }
        img.onerror = () => reject(new Error("Couldn't load image for thumbnail"))
        img.src = sourceDataUrl
    })
}

/* ────────────────────────────────────────────────
   Public mutations
   ──────────────────────────────────────────────── */

async function putMeta(item: HistoryItem) {
    const db = await openDb()
    await reqToPromise(tx(db, [STORE_META], "readwrite").objectStore(STORE_META).put(item))
    db.close()
}

async function putBlob(id: string, blob: Blob) {
    const db = await openDb()
    await reqToPromise(tx(db, [STORE_BLOBS], "readwrite").objectStore(STORE_BLOBS).put({ id, blob }))
    db.close()
}

async function getBlobRecord(id: string): Promise<Blob | null> {
    const db = await openDb()
    const rec = await reqToPromise<{ id: string; blob: Blob } | undefined>(
        tx(db, [STORE_BLOBS], "readonly").objectStore(STORE_BLOBS).get(id) as IDBRequest<
            { id: string; blob: Blob } | undefined
        >
    )
    db.close()
    return rec?.blob ?? null
}

async function delMeta(id: string) {
    const db = await openDb()
    await reqToPromise(tx(db, [STORE_META], "readwrite").objectStore(STORE_META).delete(id))
    db.close()
}

async function delBlob(id: string) {
    const db = await openDb()
    await reqToPromise(tx(db, [STORE_BLOBS], "readwrite").objectStore(STORE_BLOBS).delete(id))
    db.close()
}

/* ────────────────────────────────────────────────
   Public API
   ──────────────────────────────────────────────── */

export async function saveImageToHistory(args: {
    dataUrl: string
    title: string
    description: string
    sceneIndex: number
}): Promise<ImageHistoryItem> {
    const blob = await dataUrlToBlob(args.dataUrl)
    const thumb = await makeThumb(args.dataUrl, 360, 0.78).catch(() => args.dataUrl)
    const id = makeId("img")
    const fullBlobId = `${id}-full`
    await putBlob(fullBlobId, blob)
    const item: ImageHistoryItem = {
        id,
        type: "image",
        title: (args.title || `Scene ${args.sceneIndex + 1}`).trim(),
        description: args.description?.trim() || "",
        sceneIndex: args.sceneIndex,
        thumbDataUrl: thumb,
        fullBlobId,
        bytes: blob.size,
        createdAt: Date.now(),
    }
    await putMeta(item)
    notify()
    return item
}

export async function saveVideoProjectToHistory(args: {
    videoUrls: string[]                // OpenRouter URLs (will be fetched via proxy)
    sceneEnhancedDataUrls: string[]    // canvas enhanced images (data URLs) for thumbs
    title?: string
    durationPerClip: number
    resolution: string
}): Promise<VideoHistoryItem> {
    if (args.videoUrls.length === 0) throw new Error("No clips to save")

    // Snapshot blobs first — if any fetch fails we abort cleanly.
    const clipBlobs: Blob[] = []
    for (const u of args.videoUrls) {
        const proxied = u.startsWith("blob:") || u.startsWith("data:")
            ? u
            : `/api/proxy-video?url=${encodeURIComponent(u)}`
        const res = await fetch(proxied)
        if (!res.ok) throw new Error(`Couldn't archive clip: ${res.status}`)
        clipBlobs.push(await res.blob())
    }

    const id = makeId("vid")
    const clipBlobIds: string[] = []
    let totalBytes = 0
    for (let i = 0; i < clipBlobs.length; i++) {
        const blobId = `${id}-clip-${i}`
        await putBlob(blobId, clipBlobs[i])
        clipBlobIds.push(blobId)
        totalBytes += clipBlobs[i].size
    }

    const sceneThumbs = await Promise.all(
        args.sceneEnhancedDataUrls.slice(0, 6).map((u) =>
            makeThumb(u, 200, 0.72).catch(() => u)
        )
    )
    const cover = sceneThumbs[0] || ""

    const now = Date.now()
    const dateLabel = new Date(now).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    })
    const fallbackTitle = `Storyboard · ${dateLabel}`

    const item: VideoHistoryItem = {
        id,
        type: "video",
        title: args.title?.trim() || fallbackTitle,
        thumbDataUrl: cover,
        sceneThumbDataUrls: sceneThumbs,
        clipBlobIds,
        clipCount: clipBlobs.length,
        durationPerClip: args.durationPerClip,
        resolution: args.resolution,
        bytes: totalBytes,
        createdAt: now,
    }
    await putMeta(item)
    notify()
    return item
}

export async function listHistory(): Promise<HistoryItem[]> {
    if (typeof indexedDB === "undefined") return []
    try {
        const db = await openDb()
        const all = await reqToPromise<HistoryItem[]>(
            tx(db, [STORE_META], "readonly").objectStore(STORE_META).getAll() as IDBRequest<HistoryItem[]>
        )
        db.close()
        return [...all].sort((a, b) => b.createdAt - a.createdAt)
    } catch (err) {
        console.error("[marketing-history] list failed:", err)
        return []
    }
}

export async function deleteHistoryItem(id: string): Promise<void> {
    const db = await openDb()
    const meta = (await reqToPromise(
        tx(db, [STORE_META], "readonly").objectStore(STORE_META).get(id) as IDBRequest<HistoryItem | undefined>
    )) as HistoryItem | undefined
    db.close()

    if (meta) {
        if (meta.type === "image") await delBlob(meta.fullBlobId)
        else for (const bid of meta.clipBlobIds) await delBlob(bid)
    }
    await delMeta(id)
    notify()
}

export async function clearAllHistory(): Promise<void> {
    const db = await openDb()
    await reqToPromise(tx(db, [STORE_META], "readwrite").objectStore(STORE_META).clear())
    await reqToPromise(tx(db, [STORE_BLOBS], "readwrite").objectStore(STORE_BLOBS).clear())
    db.close()
    notify()
}

export async function getHistoryBlobUrl(blobId: string): Promise<string | null> {
    const blob = await getBlobRecord(blobId)
    if (!blob) return null
    return URL.createObjectURL(blob)
}

export async function downloadHistoryBlob(blobId: string, filename: string): Promise<void> {
    const blob = await getBlobRecord(blobId)
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1500)
}

/* ────────────────────────────────────────────────
   Pub-sub so React components reactively refresh
   ──────────────────────────────────────────────── */
type Listener = () => void
const listeners = new Set<Listener>()
function notify() {
    listeners.forEach((l) => {
        try {
            l()
        } catch {
            /* noop */
        }
    })
    if (typeof window !== "undefined") {
        try {
            window.dispatchEvent(new CustomEvent("pulse-marketing-history-changed"))
        } catch {
            /* noop */
        }
    }
}
export function subscribeHistory(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

/* ────────────────────────────────────────────────
   Convenience: relative time
   ──────────────────────────────────────────────── */
export function formatRelative(ts: number): string {
    const diff = Date.now() - ts
    const s = Math.floor(diff / 1000)
    if (s < 60) return "Just now"
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    if (d < 7) return `${d}d ago`
    return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

/** Format byte count as human-friendly string. */
export function formatBytes(n: number): string {
    if (n < 1024) return `${n} B`
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
    if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`
    return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
