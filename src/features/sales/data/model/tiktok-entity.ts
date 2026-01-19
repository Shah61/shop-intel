interface TiktokOrder {
    id: string;
    total_price: string;
    name: string;
    created_at: string;
}

interface TiktokResponse {
    orders: TiktokOrder[];
}



interface TiktokMetadata {
    orders: number;
    item_order: number;
    conversion_rate: number;
    products: number;
    revenue: number;
    gross_revenue: number;
}





interface TiktokSku {
    sku: string;
    name: string;
    quantity: number;
    revenue: number;
    product_id: number;
    variant_id: number;
    quantity_percentage: string;
    revenue_percentage: string;
    image: string;
    variant_title: string;
    stock: number;
}

interface TiktokConversionRate {
    date: string;
    conversion_rate: number;
    total_orders: number;
    total_visitors: number;
    total_revenues: number;
    total_gross_revenues?: number | null;
}

export enum AnalysisTimeframe {
    TIKTOK = "tiktok",
    SHOPEE = "shopee",
    SHOPIFY = "shopify",
    WEBSITE = "website",
    PHYSICAL = "physical",
    OTHER = "other",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    YEARLY = "yearly"
}

export type {
    TiktokOrder,
    TiktokResponse,
    TiktokMetadata,
    TiktokSku,
    TiktokConversionRate
};