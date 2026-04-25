"use client";

import { useState, useEffect } from "react";

/**
 * Shared stock-visit store backed by localStorage.
 * For the pitch/demo only — replace with TanStack mutations + queries for prod.
 */

export interface VisitBatch {
    expiryDate: string;
    quantity: number;
}

export interface VisitProduct {
    productId: string;
    productName: string;
    currentStock: number;
    batches: VisitBatch[];
}

export interface StockVisit {
    id: string;
    supermarketId: string;
    supermarketName: string;
    timestamp: string; // ISO
    notes?: string;
    photo?: string | null;
    products: VisitProduct[];
}

const VISITS_KEY = "stock-tracker:visits";
const SEED_VERSION_KEY = "stock-tracker:seed-version";
const CURRENT_SEED_VERSION = "2";

/* ─── Seed data: ~5 visits per store across recent weeks, so charts/tables have real data ─── */
function buildSeedVisits(): StockVisit[] {
    const now = Date.now();
    const hour = 1000 * 60 * 60;
    const day = hour * 24;

    // Helper to build ISO timestamps offset from "now"
    const t = (offsetMs: number) => new Date(now - offsetMs).toISOString();

    // Helper for future expiry dates
    const expiry = (daysAhead: number) =>
        new Date(now + daysAhead * day).toISOString().slice(0, 10);

    return [
        /* ───── AEON Shah Alam — declining stock, just went OOS ───── */
        {
            id: "v-aeon-1",
            supermarketId: "aeon-shah-alam",
            supermarketName: "AEON Shah Alam",
            timestamp: t(hour * 2),
            notes: "Shelf empty when I arrived. Store manager confirmed sold out Tuesday.",
            products: [
                { productId: "fresh-1l", productName: "Fresh Milk 1L", currentStock: 0, batches: [] },
                { productId: "low-fat-1l", productName: "Low Fat Milk 1L", currentStock: 12, batches: [{ expiryDate: expiry(18), quantity: 12 }] },
            ],
        },
        {
            id: "v-aeon-2",
            supermarketId: "aeon-shah-alam",
            supermarketName: "AEON Shah Alam",
            timestamp: t(day * 3 + hour * 4),
            notes: "Fresh Milk running low, flagged to store team.",
            products: [
                { productId: "fresh-1l", productName: "Fresh Milk 1L", currentStock: 14, batches: [{ expiryDate: expiry(12), quantity: 14 }] },
                { productId: "low-fat-1l", productName: "Low Fat Milk 1L", currentStock: 22, batches: [{ expiryDate: expiry(18), quantity: 22 }] },
            ],
        },
        {
            id: "v-aeon-3",
            supermarketId: "aeon-shah-alam",
            supermarketName: "AEON Shah Alam",
            timestamp: t(day * 7 + hour * 2),
            notes: "",
            products: [
                { productId: "fresh-1l", productName: "Fresh Milk 1L", currentStock: 48, batches: [{ expiryDate: expiry(16), quantity: 48 }] },
                { productId: "low-fat-1l", productName: "Low Fat Milk 1L", currentStock: 34, batches: [{ expiryDate: expiry(22), quantity: 34 }] },
            ],
        },
        {
            id: "v-aeon-4",
            supermarketId: "aeon-shah-alam",
            supermarketName: "AEON Shah Alam",
            timestamp: t(day * 14 + hour * 3),
            notes: "Stocked well after last delivery.",
            products: [
                { productId: "fresh-1l", productName: "Fresh Milk 1L", currentStock: 72, batches: [{ expiryDate: expiry(23), quantity: 72 }] },
                { productId: "low-fat-1l", productName: "Low Fat Milk 1L", currentStock: 56, batches: [{ expiryDate: expiry(29), quantity: 56 }] },
            ],
        },
        {
            id: "v-aeon-5",
            supermarketId: "aeon-shah-alam",
            supermarketName: "AEON Shah Alam",
            timestamp: t(day * 21 + hour * 5),
            notes: "",
            products: [
                { productId: "fresh-1l", productName: "Fresh Milk 1L", currentStock: 88, batches: [{ expiryDate: expiry(30), quantity: 88 }] },
                { productId: "low-fat-1l", productName: "Low Fat Milk 1L", currentStock: 64, batches: [{ expiryDate: expiry(36), quantity: 64 }] },
            ],
        },

        /* ───── Mydin Subang — slow mover, expiry stacking up ───── */
        {
            id: "v-mydin-1",
            supermarketId: "mydin-subang",
            supermarketName: "Mydin Subang",
            timestamp: t(hour * 5),
            notes: "Chocolate variant still slow. Competitor running 30% promo on shelf next to us.",
            products: [
                { productId: "choco-250", productName: "Chocolate Milk 250ml", currentStock: 48, batches: [{ expiryDate: expiry(8), quantity: 30 }, { expiryDate: expiry(15), quantity: 18 }] },
            ],
        },
        {
            id: "v-mydin-2",
            supermarketId: "mydin-subang",
            supermarketName: "Mydin Subang",
            timestamp: t(day * 4 + hour * 2),
            notes: "",
            products: [
                { productId: "choco-250", productName: "Chocolate Milk 250ml", currentStock: 54, batches: [{ expiryDate: expiry(12), quantity: 36 }, { expiryDate: expiry(19), quantity: 18 }] },
            ],
        },
        {
            id: "v-mydin-3",
            supermarketId: "mydin-subang",
            supermarketName: "Mydin Subang",
            timestamp: t(day * 10 + hour * 3),
            notes: "Sales dropped this week, only 6 units moved.",
            products: [
                { productId: "choco-250", productName: "Chocolate Milk 250ml", currentStock: 60, batches: [{ expiryDate: expiry(18), quantity: 60 }] },
            ],
        },
        {
            id: "v-mydin-4",
            supermarketId: "mydin-subang",
            supermarketName: "Mydin Subang",
            timestamp: t(day * 17 + hour * 4),
            notes: "",
            products: [
                { productId: "choco-250", productName: "Chocolate Milk 250ml", currentStock: 66, batches: [{ expiryDate: expiry(25), quantity: 66 }] },
            ],
        },
        {
            id: "v-mydin-5",
            supermarketId: "mydin-subang",
            supermarketName: "Mydin Subang",
            timestamp: t(day * 24 + hour * 2),
            notes: "Fresh delivery received.",
            products: [
                { productId: "choco-250", productName: "Chocolate Milk 250ml", currentStock: 72, batches: [{ expiryDate: expiry(32), quantity: 72 }] },
            ],
        },

        /* ───── Lotus's Klang — watchlist ───── */
        {
            id: "v-lotus-1",
            supermarketId: "lotus-klang",
            supermarketName: "Lotus's Klang",
            timestamp: t(day * 1 + hour * 2),
            notes: "",
            products: [
                { productId: "strawberry-250", productName: "Strawberry Milk 250ml", currentStock: 62, batches: [{ expiryDate: expiry(18), quantity: 32 }, { expiryDate: expiry(33), quantity: 30 }] },
            ],
        },
        {
            id: "v-lotus-2",
            supermarketId: "lotus-klang",
            supermarketName: "Lotus's Klang",
            timestamp: t(day * 6 + hour * 4),
            notes: "Strawberry moving slow — 8 units per week.",
            products: [
                { productId: "strawberry-250", productName: "Strawberry Milk 250ml", currentStock: 70, batches: [{ expiryDate: expiry(23), quantity: 40 }, { expiryDate: expiry(38), quantity: 30 }] },
            ],
        },
        {
            id: "v-lotus-3",
            supermarketId: "lotus-klang",
            supermarketName: "Lotus's Klang",
            timestamp: t(day * 13 + hour * 3),
            notes: "",
            products: [
                { productId: "strawberry-250", productName: "Strawberry Milk 250ml", currentStock: 78, batches: [{ expiryDate: expiry(30), quantity: 78 }] },
            ],
        },
        {
            id: "v-lotus-4",
            supermarketId: "lotus-klang",
            supermarketName: "Lotus's Klang",
            timestamp: t(day * 20 + hour * 5),
            notes: "Placed near tea aisle.",
            products: [
                { productId: "strawberry-250", productName: "Strawberry Milk 250ml", currentStock: 84, batches: [{ expiryDate: expiry(37), quantity: 84 }] },
            ],
        },
        {
            id: "v-lotus-5",
            supermarketId: "lotus-klang",
            supermarketName: "Lotus's Klang",
            timestamp: t(day * 27 + hour * 2),
            notes: "",
            products: [
                { productId: "strawberry-250", productName: "Strawberry Milk 250ml", currentStock: 90, batches: [{ expiryDate: expiry(44), quantity: 90 }] },
            ],
        },

        /* ───── Village Grocer Bangsar — strong performer ───── */
        {
            id: "v-village-1",
            supermarketId: "village-grocer-bangsar",
            supermarketName: "Village Grocer Bangsar",
            timestamp: t(day * 1 + hour * 4),
            notes: "Customer asked when 2L variant is launching.",
            products: [
                { productId: "fresh-1l", productName: "Fresh Milk 1L", currentStock: 42, batches: [{ expiryDate: expiry(22), quantity: 42 }] },
            ],
        },
        {
            id: "v-village-2",
            supermarketId: "village-grocer-bangsar",
            supermarketName: "Village Grocer Bangsar",
            timestamp: t(day * 5 + hour * 2),
            notes: "",
            products: [
                { productId: "fresh-1l", productName: "Fresh Milk 1L", currentStock: 68, batches: [{ expiryDate: expiry(27), quantity: 68 }] },
            ],
        },
        {
            id: "v-village-3",
            supermarketId: "village-grocer-bangsar",
            supermarketName: "Village Grocer Bangsar",
            timestamp: t(day * 12 + hour * 3),
            notes: "Sold 140 units in 7 days.",
            products: [
                { productId: "fresh-1l", productName: "Fresh Milk 1L", currentStock: 95, batches: [{ expiryDate: expiry(33), quantity: 95 }] },
            ],
        },
        {
            id: "v-village-4",
            supermarketId: "village-grocer-bangsar",
            supermarketName: "Village Grocer Bangsar",
            timestamp: t(day * 19 + hour * 2),
            notes: "",
            products: [
                { productId: "fresh-1l", productName: "Fresh Milk 1L", currentStock: 110, batches: [{ expiryDate: expiry(40), quantity: 110 }] },
            ],
        },
        {
            id: "v-village-5",
            supermarketId: "village-grocer-bangsar",
            supermarketName: "Village Grocer Bangsar",
            timestamp: t(day * 26 + hour * 5),
            notes: "New endcap placement secured.",
            products: [
                { productId: "fresh-1l", productName: "Fresh Milk 1L", currentStock: 120, batches: [{ expiryDate: expiry(47), quantity: 120 }] },
            ],
        },

        /* ───── Jaya Grocer KL — steady ───── */
        {
            id: "v-jaya-1",
            supermarketId: "jaya-grocer-kl",
            supermarketName: "Jaya Grocer KL",
            timestamp: t(day * 2 + hour * 2),
            notes: "",
            products: [
                { productId: "fresh-1l", productName: "Fresh Milk 1L", currentStock: 56, batches: [{ expiryDate: expiry(25), quantity: 50 }, { expiryDate: expiry(3), quantity: 6 }] },
            ],
        },
        {
            id: "v-jaya-2",
            supermarketId: "jaya-grocer-kl",
            supermarketName: "Jaya Grocer KL",
            timestamp: t(day * 8 + hour * 3),
            notes: "",
            products: [
                { productId: "fresh-1l", productName: "Fresh Milk 1L", currentStock: 72, batches: [{ expiryDate: expiry(30), quantity: 72 }] },
            ],
        },
        {
            id: "v-jaya-3",
            supermarketId: "jaya-grocer-kl",
            supermarketName: "Jaya Grocer KL",
            timestamp: t(day * 15 + hour * 4),
            notes: "",
            products: [
                { productId: "fresh-1l", productName: "Fresh Milk 1L", currentStock: 80, batches: [{ expiryDate: expiry(37), quantity: 80 }] },
            ],
        },
        {
            id: "v-jaya-4",
            supermarketId: "jaya-grocer-kl",
            supermarketName: "Jaya Grocer KL",
            timestamp: t(day * 22 + hour * 2),
            notes: "",
            products: [
                { productId: "fresh-1l", productName: "Fresh Milk 1L", currentStock: 86, batches: [{ expiryDate: expiry(44), quantity: 86 }] },
            ],
        },
        {
            id: "v-jaya-5",
            supermarketId: "jaya-grocer-kl",
            supermarketName: "Jaya Grocer KL",
            timestamp: t(day * 29 + hour * 3),
            notes: "Stable demand.",
            products: [
                { productId: "fresh-1l", productName: "Fresh Milk 1L", currentStock: 92, batches: [{ expiryDate: expiry(51), quantity: 92 }] },
            ],
        },
    ];
}

const SEED_VISITS: StockVisit[] = buildSeedVisits();

export function getVisits(): StockVisit[] {
    if (typeof window === "undefined") return [];
    try {
        const storedVersion = window.localStorage.getItem(SEED_VERSION_KEY);
        const raw = window.localStorage.getItem(VISITS_KEY);

        // Reseed on fresh install or version bump
        if (!raw || storedVersion !== CURRENT_SEED_VERSION) {
            window.localStorage.setItem(VISITS_KEY, JSON.stringify(SEED_VISITS));
            window.localStorage.setItem(SEED_VERSION_KEY, CURRENT_SEED_VERSION);
            return SEED_VISITS;
        }

        const parsed = JSON.parse(raw) as StockVisit[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function addVisit(visit: Omit<StockVisit, "id">): StockVisit {
    const full: StockVisit = { ...visit, id: `v-${Date.now()}` };
    if (typeof window === "undefined") return full;
    const current = getVisits();
    const next = [full, ...current];
    window.localStorage.setItem(VISITS_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("stock-visits-changed"));
    return full;
}

export function clearVisits() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(VISITS_KEY);
    window.dispatchEvent(new CustomEvent("stock-visits-changed"));
}

/**
 * React hook — subscribes to visit changes across the app.
 * SSR-safe: starts with [] server-side, hydrates on mount.
 */
export function useVisits(): StockVisit[] {
    const [visits, setVisits] = useState<StockVisit[]>([]);

    useEffect(() => {
        setVisits(getVisits());

        const handler = () => setVisits(getVisits());
        window.addEventListener("stock-visits-changed", handler);
        window.addEventListener("storage", handler);

        return () => {
            window.removeEventListener("stock-visits-changed", handler);
            window.removeEventListener("storage", handler);
        };
    }, []);

    return visits;
}