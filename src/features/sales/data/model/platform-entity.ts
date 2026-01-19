



/**
 * Enum representing different sales platforms
 */
export enum Platform {
    PHYSICAL = "physical",
    SHOPEE = "shopee",
    TIKTOK = "tiktok",
    WEBSITE = "website",
    OTHER = "other"
}

/**
 * Interface for a single platform sales entry
 */
export interface PlatformEntity {
    id: string;
    platform: Platform;
    amount: number;
    date: string;
}

/**
 * Interface for aggregated platform sales data by date
 */
export interface PlatformSalesByDate {
    date: string;
    physical: number;
    shopee: number;
    tiktok: number;
    website: number;
    total: number;
}

/**
 * Interface for platform totals
 */
export interface PlatformTotals {
    physical: number;
    shopee: number;
    tiktok: number;
    website: number;
    total: number;
}