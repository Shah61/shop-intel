
export interface ShopeeSku {
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
    views: number;
    conversion_rate: number;
    stocks: number;
}

export interface ShopeeConversionRate {
    date: string;
    conversion_rate: number;
    total_orders: number;
    total_visitors: number;
    total_revenues: number;
}

export interface ShopeeMetadata {
    orders: number;
    sales: number;
    conversionRate: number;
    products: number;
    visitors: number;
}
