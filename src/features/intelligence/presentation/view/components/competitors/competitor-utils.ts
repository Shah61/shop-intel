import type { CompetitorTier } from "@/src/features/intelligence/data/model/competitor-profile";
import type { SalesPlatform } from "@/src/features/intelligence/data/model/competitor-profile";

export function formatCompactNumber(n: number): string {
    if (n <= 0) return "0";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return String(Math.round(n));
}

export function formatMoneyShort(amount: number, currency: string): string {
    if (amount <= 0) return "—";
    const prefix = currency === "MYR" ? "RM" : currency;
    if (amount >= 1_000_000) return `${prefix} ${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `${prefix} ${(amount / 1_000).toFixed(0)}k`;
    return `${prefix} ${amount.toLocaleString()}`;
}

export function formatTrendPct(n: number, digits = 1): string {
    const s = n.toFixed(digits);
    return n > 0 ? `+${s}%` : `${s}%`;
}

export const PLATFORM_LABEL: Record<SalesPlatform, string> = {
    shopee: "Shopee",
    tiktok_shop: "TikTok",
    lazada: "Lazada",
    shopify: "Web",
    physical: "Retail",
    instagram: "IG",
};

export const TIER_LABEL: Record<CompetitorTier, string> = {
    DIRECT: "Direct",
    ASPIRATIONAL: "Aspirational",
    BUDGET: "Budget",
    INTERNATIONAL: "International",
};

export function tierBadgeClass(tier: CompetitorTier): string {
    switch (tier) {
        case "DIRECT":
            return "border-rose-500/40 text-rose-700 dark:text-rose-300 bg-rose-500/10";
        case "ASPIRATIONAL":
            return "border-[hsla(var(--preset-primary-rgb),0.45)] text-[var(--preset-primary)] bg-[hsla(var(--preset-primary-rgb),0.08)]";
        case "BUDGET":
            return "border-amber-500/40 text-amber-800 dark:text-amber-200 bg-amber-500/10";
        case "INTERNATIONAL":
            return "border-sky-500/40 text-sky-800 dark:text-sky-200 bg-sky-500/10";
        default:
            return "border-border text-muted-foreground";
    }
}

export function promoTypeLabel(type: string): string {
    const map: Record<string, string> = {
        flash_sale: "Flash",
        bundle: "Bundle",
        voucher: "Voucher",
        free_shipping: "Shipping",
        live_sale: "Live",
        collab: "Collab",
        seasonal: "Seasonal",
    };
    return map[type] ?? type;
}
