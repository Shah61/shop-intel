interface ShopifyOrder {
    id: string;
    total_price: string;
    name: string;
    created_at: string;
}

interface ShopifyResponse {
    orders: ShopifyOrder[];
}


interface ShopifyMetadata {
    orders: number;
    sales: number;
    conversionRate: number;
    products: number;
}

interface ShopifyStock {
    id: number;
    sku: string;
    inventory_quantity: number;
}


interface ShopifySku {
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
}

interface ShopifyConversionRate {
    date: string;
    conversion_rate: number;
    total_orders: number;
    total_visitors: number;
    total_revenues: number;
}

export enum AnalysisTimeFrame {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    YEARLY = "yearly"
}

export type {
    ShopifyOrder,
    ShopifyResponse,
    ShopifyMetadata,
    ShopifySku,
    ShopifyConversionRate,
    ShopifyStock
};