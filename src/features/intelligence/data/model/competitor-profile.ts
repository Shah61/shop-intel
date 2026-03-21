export type CompetitorStatus = "ACTIVE" | "INACTIVE" | "WATCHING";

export type CompetitorTier = "DIRECT" | "ASPIRATIONAL" | "BUDGET" | "INTERNATIONAL";

export type SalesPlatform =
    | "shopee"
    | "tiktok_shop"
    | "lazada"
    | "shopify"
    | "physical"
    | "instagram";

export interface CompetitorProfile {
    id: string;
    symbol: string;
    name: string;
    logo_url?: string;
    description: string;
    status: CompetitorStatus;
    tier: CompetitorTier;
    tracked_since: string;
    last_updated: string;

    channels: {
        platform: SalesPlatform;
        store_url?: string;
        store_name: string;
        is_official: boolean;
        followers: number;
        rating: number;
        total_reviews: number;
        response_rate_pct: number;
    }[];

    catalog: {
        total_skus: number;
        new_skus_30d: number;
        removed_skus_30d: number;
        top_categories: string[];
        price_range: { min: number; max: number; avg: number; currency: string };
        bestseller_price_avg: number;
        discount_rate_pct: number;
        avg_discount_depth_pct: number;
    };

    engagement: {
        avg_monthly_reviews: number;
        avg_review_rating: number;
        review_sentiment_pct: { positive: number; neutral: number; negative: number };
        social_mentions_30d: number;
        tiktok_views_30d?: number;
        instagram_followers?: number;
        shopee_live_sessions_30d: number;
        avg_live_viewers: number;
    };

    rankings: {
        shopee_category_rank?: number;
        shopee_category_total?: number;
        tiktok_category_rank?: number;
        lazada_category_rank?: number;
        search_rank_keywords: { keyword: string; your_rank: number; their_rank: number }[];
    };

    estimated: {
        monthly_revenue: { amount: number; currency: string; confidence: "HIGH" | "MEDIUM" | "LOW" };
        monthly_orders: number;
        avg_order_value: number;
        monthly_visitors: number;
        conversion_rate_pct: number;
    };

    trends: {
        price_index_change_pct: number;
        visibility_change_pct: number;
        engagement_change_pct: number;
        catalog_growth_pct: number;
        revenue_change_pct: number;
    };

    ai_insights: string[];

    active_promos: {
        title: string;
        type: "flash_sale" | "bundle" | "voucher" | "free_shipping" | "live_sale" | "collab" | "seasonal";
        started_at: string;
        ends_at?: string;
        estimated_discount_pct: number;
    }[];
}
