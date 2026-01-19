
export interface AnalyticsMetadataEntity {
    date?: string | null;
    total_sales?: number | null;
    total_orders?: number | null;
    total_items?: number | null;
    average_order_value?: number | null;
    total_gross_revenue?: number | null;
    conversion_rate?: number | null;
    visitors?: number | null;
    total_average_order_value?: number | null;
    type?: AnalyticsType | null;
}


export interface AnalyticsSalesEntity {
    date?: string | null;
    total_conversions?: number | null;
    total_orders?: number | null;
    total_visitors?: number | null;
    total_revenues?: number | null;
    total_gross_revenues?: number | null;
    type?: AnalyticsType | null;
}


export interface AnalysisSKUEntity {
    sku?: string | null;
    name?: string | null;
    quantity?: number | null;
    revenue?: number | null;
    product_id?: number | null;
    variant_id?: number | null;
    quantity_percentage?: string | null;
    revenue_percentage?: string | null;
    image?: string | null;
    variant_title?: string | null;
    type?: AnalyticsType | null;
    created_at?: string | null;
}


export interface SkuPerformanceHistoricalDataEntity {
    date?: string | null;
    data?: AnalysisSKUEntity[] | null;
}

export interface SkuPerformanceDetailEntity {
    date?: string | null;
    data?: AnalysisSKUEntity | null;
}



export enum AnalyticsType {
    TIKTOK = "tiktok",
    SHOPEE = "shopee",
    SHOPIFY = "shopify",
    WEBSITE = "website",
    PHYSICAL = "physical",
    TOTAL = "total",
    OTHER = "other"
}

export enum AnalysisTimeFrame {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    YEARLY = "yearly"
}

