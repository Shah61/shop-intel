/* ═══════════════════════════════════════════════════════
   SHOP INTEL — Competitor Intelligence Mock Data
   
   Scenario: You sell "Beauty Skincare ShopIntel" — clinical-
   inspired skincare from KL, on Shopee, TikTok Shop,
   Lazada, Shopify, and select pharmacy consignments.
   
   Average SKU price: RM 45–165
   Monthly revenue: ~RM 180k
   Shopee followers: 24.3k
   TikTok Shop followers: 11.8k
   ═══════════════════════════════════════════════════════ */

import type { CompetitorProfile } from "./model/competitor-profile";

export const MOCK_COMPETITORS: CompetitorProfile[] = [

    // ═══════════════════════════════════════
    // 1. WATSONS MALAYSIA — Mass pharmacy & beauty retail
    // ═══════════════════════════════════════
    {
        id: "comp_watsons_001",
        symbol: "WTS",
        name: "Watsons Malaysia",
        description: "ASEAN health & beauty chain. Huge skincare aisle, constant BOGO and member days — the default comparison for drugstore derm brands.",
        status: "ACTIVE",
        tier: "DIRECT",
        tracked_since: "2025-09-15T00:00:00.000Z",
        last_updated: "2026-03-21T08:12:00.000Z",

        channels: [
            {
                platform: "shopee",
                store_name: "Watsons Malaysia Official",
                store_url: "https://shopee.com.my/watsons.os",
                is_official: true,
                followers: 892400,
                rating: 4.8,
                total_reviews: 341200,
                response_rate_pct: 96,
            },
            {
                platform: "lazada",
                store_name: "Watsons Malaysia",
                is_official: true,
                followers: 215600,
                rating: 4.7,
                total_reviews: 98400,
                response_rate_pct: 91,
            },
            {
                platform: "physical",
                store_name: "Watsons stores (Malaysia)",
                is_official: true,
                followers: 0,
                rating: 4.3,
                total_reviews: 12800,
                response_rate_pct: 0,
            },
        ],

        catalog: {
            total_skus: 12400,
            new_skus_30d: 420,
            removed_skus_30d: 180,
            top_categories: ["Sunscreen", "Cleansers", "Serums", "Moisturizers", "Sheet Masks"],
            price_range: { min: 9.9, max: 399, avg: 42, currency: "MYR" },
            bestseller_price_avg: 35.9,
            discount_rate_pct: 45,
            avg_discount_depth_pct: 28,
        },

        engagement: {
            avg_monthly_reviews: 8420,
            avg_review_rating: 4.7,
            review_sentiment_pct: { positive: 82, neutral: 13, negative: 5 },
            social_mentions_30d: 3240,
            tiktok_views_30d: 2800000,
            instagram_followers: 412000,
            shopee_live_sessions_30d: 12,
            avg_live_viewers: 1840,
        },

        rankings: {
            shopee_category_rank: 3,
            shopee_category_total: 4200,
            lazada_category_rank: 8,
            search_rank_keywords: [
                { keyword: "cerave malaysia", your_rank: 18, their_rank: 2 },
                { keyword: "sunscreen shopee", your_rank: 24, their_rank: 4 },
                { keyword: "niacinamide serum murah", your_rank: 11, their_rank: 3 },
                { keyword: "laroche posay malaysia", your_rank: 29, their_rank: 5 },
            ],
        },

        estimated: {
            monthly_revenue: { amount: 4200000, currency: "MYR", confidence: "HIGH" },
            monthly_orders: 62000,
            avg_order_value: 67.7,
            monthly_visitors: 1840000,
            conversion_rate_pct: 3.4,
        },

        trends: {
            price_index_change_pct: -5.12,
            visibility_change_pct: 2.8,
            engagement_change_pct: 8.4,
            catalog_growth_pct: 1.9,
            revenue_change_pct: 3.1,
        },

        ai_insights: [
            "Watsons cut shelf prices ~5% across hundreds of skincare SKUs — likely ahead of Ramadan gift sets and travel minis.",
            "Shopee Live sessions doubled; avg viewers up. Match frequency on SPF and cleanser education, not price-only wars.",
            "They rank top 3 for mass-market derm keywords — your edge is focused routines (e.g. ShopIntel barrier kit) vs endless aisle noise.",
            "New K-beauty exclusives detected in 30d — watch bundle pricing vs your hero SKUs.",
        ],

        active_promos: [
            {
                title: "Members: Buy 2nd @ 50% — Sun & Skin",
                type: "seasonal",
                started_at: "2026-03-15T00:00:00.000Z",
                ends_at: "2026-03-31T23:59:59.000Z",
                estimated_discount_pct: 35,
            },
            {
                title: "Free Shipping Min Spend RM50",
                type: "free_shipping",
                started_at: "2026-03-01T00:00:00.000Z",
                estimated_discount_pct: 0,
            },
        ],
    },

    // ═══════════════════════════════════════
    // 2. HERMO — Major MY online beauty retailer
    // ═══════════════════════════════════════
    {
        id: "comp_hermo_002",
        symbol: "HRM",
        name: "Hermo Malaysia",
        description: "Leading Malaysian e-beauty destination. Heavy flash sales, authentic imports, strong Shopee/Lazada overlap with indie skincare.",
        status: "ACTIVE",
        tier: "DIRECT",
        tracked_since: "2025-10-01T00:00:00.000Z",
        last_updated: "2026-03-21T10:30:00.000Z",

        channels: [
            {
                platform: "shopify",
                store_name: "hermo.my",
                store_url: "https://www.hermo.my",
                is_official: true,
                followers: 0,
                rating: 4.5,
                total_reviews: 18900,
                response_rate_pct: 88,
            },
            {
                platform: "tiktok_shop",
                store_name: "Hermo Malaysia",
                is_official: true,
                followers: 189000,
                rating: 4.6,
                total_reviews: 42100,
                response_rate_pct: 94,
            },
            {
                platform: "shopee",
                store_name: "Hermo Official Store",
                is_official: true,
                followers: 312000,
                rating: 4.6,
                total_reviews: 87300,
                response_rate_pct: 92,
            },
            {
                platform: "instagram",
                store_name: "@hermomy",
                is_official: true,
                followers: 1240000,
                rating: 0,
                total_reviews: 0,
                response_rate_pct: 0,
            },
        ],

        catalog: {
            total_skus: 18600,
            new_skus_30d: 890,
            removed_skus_30d: 210,
            top_categories: ["K-Beauty", "Sunscreen", "Serums", "Cleansers", "Body Care"],
            price_range: { min: 12, max: 699, avg: 72, currency: "MYR" },
            bestseller_price_avg: 49,
            discount_rate_pct: 42,
            avg_discount_depth_pct: 32,
        },

        engagement: {
            avg_monthly_reviews: 4200,
            avg_review_rating: 4.5,
            review_sentiment_pct: { positive: 76, neutral: 15, negative: 9 },
            social_mentions_30d: 8900,
            tiktok_views_30d: 12400000,
            instagram_followers: 1240000,
            shopee_live_sessions_30d: 18,
            avg_live_viewers: 4200,
        },

        rankings: {
            shopee_category_rank: 7,
            shopee_category_total: 4200,
            tiktok_category_rank: 2,
            search_rank_keywords: [
                { keyword: "hermo sunscreen sale", your_rank: 28, their_rank: 1 },
                { keyword: "anessa malaysia", your_rank: 31, their_rank: 4 },
                { keyword: "beauty flash sale shopee", your_rank: 19, their_rank: 2 },
                { keyword: "cosrx official malaysia", your_rank: 45, their_rank: 6 },
            ],
        },

        estimated: {
            monthly_revenue: { amount: 1850000, currency: "MYR", confidence: "MEDIUM" },
            monthly_orders: 12400,
            avg_order_value: 149.2,
            monthly_visitors: 620000,
            conversion_rate_pct: 2.0,
        },

        trends: {
            price_index_change_pct: 4.20,
            visibility_change_pct: 18.63,
            engagement_change_pct: 34.10,
            catalog_growth_pct: 11.4,
            revenue_change_pct: 22.5,
        },

        ai_insights: [
            "Hermo added 890+ skincare SKUs in 30d — highest catalog churn among tracked beauty retailers.",
            "TikTok engagement up sharply; flash-sale Lives are driving impulse SPF and serum bundles.",
            "They win on assortment depth; you win on a tight hero line (Beauty Skincare ShopIntel) and education.",
            "Watch their import timing — vitamin C promos often undercut indie brands before pay day.",
        ],

        active_promos: [
            {
                title: "12.12 Skincare: Up to 45% Off",
                type: "seasonal",
                started_at: "2026-03-10T00:00:00.000Z",
                ends_at: "2026-03-25T23:59:59.000Z",
                estimated_discount_pct: 15,
            },
            {
                title: "TikTok Live — K-Beauty Bundle",
                type: "live_sale",
                started_at: "2026-03-18T00:00:00.000Z",
                estimated_discount_pct: 20,
            },
            {
                title: "Brand Takeover: Laneige x Hermo",
                type: "collab",
                started_at: "2026-03-14T00:00:00.000Z",
                ends_at: "2026-04-14T23:59:59.000Z",
                estimated_discount_pct: 0,
            },
        ],
    },

    // ═══════════════════════════════════════
    // 3. SEPHORA MALAYSIA — Prestige beauty retail
    // ═══════════════════════════════════════
    {
        id: "comp_sephora_003",
        symbol: "SEP",
        name: "Sephora Malaysia",
        description: "Prestige beauty retailer. Strong in Western clinical and indie brands; sets perception anchor for serum and SPF pricing.",
        status: "ACTIVE",
        tier: "DIRECT",
        tracked_since: "2025-08-20T00:00:00.000Z",
        last_updated: "2026-03-21T09:45:00.000Z",

        channels: [
            {
                platform: "shopify",
                store_name: "sephora.my",
                store_url: "https://www.sephora.my",
                is_official: true,
                followers: 0,
                rating: 4.2,
                total_reviews: 245000,
                response_rate_pct: 85,
            },
            {
                platform: "shopee",
                store_name: "Sephora Malaysia Official",
                is_official: true,
                followers: 1420000,
                rating: 4.6,
                total_reviews: 512000,
                response_rate_pct: 93,
            },
            {
                platform: "instagram",
                store_name: "@sephoramalaysia",
                is_official: true,
                followers: 890000,
                rating: 0,
                total_reviews: 0,
                response_rate_pct: 0,
            },
        ],

        catalog: {
            total_skus: 8200,
            new_skus_30d: 380,
            removed_skus_30d: 120,
            top_categories: ["Serums", "Moisturizers", "Sunscreen", "Masks", "Hair Care"],
            price_range: { min: 35, max: 1200, avg: 185, currency: "MYR" },
            bestseller_price_avg: 129,
            discount_rate_pct: 35,
            avg_discount_depth_pct: 22,
        },

        engagement: {
            avg_monthly_reviews: 18200,
            avg_review_rating: 4.3,
            review_sentiment_pct: { positive: 71, neutral: 18, negative: 11 },
            social_mentions_30d: 5400,
            tiktok_views_30d: 4100000,
            instagram_followers: 890000,
            shopee_live_sessions_30d: 8,
            avg_live_viewers: 980,
        },

        rankings: {
            shopee_category_rank: 1,
            shopee_category_total: 4200,
            lazada_category_rank: 2,
            search_rank_keywords: [
                { keyword: "drunk elephant malaysia", your_rank: 11, their_rank: 1 },
                { keyword: "tatcha sephora", your_rank: 31, their_rank: 3 },
                { keyword: "skinceuticals malaysia", your_rank: 8, their_rank: 2 },
                { keyword: "rare beauty malaysia", your_rank: 52, their_rank: 4 },
            ],
        },

        estimated: {
            monthly_revenue: { amount: 8900000, currency: "MYR", confidence: "MEDIUM" },
            monthly_orders: 112000,
            avg_order_value: 79.5,
            monthly_visitors: 4200000,
            conversion_rate_pct: 2.7,
        },

        trends: {
            price_index_change_pct: -2.38,
            visibility_change_pct: 1.2,
            engagement_change_pct: -3.1,
            catalog_growth_pct: 1.2,
            revenue_change_pct: 0.8,
        },

        ai_insights: [
            "Sephora anchors prestige pricing — use them as a reference point, not a price match target.",
            "Frequent GWP events train customers to wait for gifts; counter with transparent routine value (e.g. ShopIntel kit vs à la carte).",
            "Review sentiment: 11% negative on stockouts and GWP eligibility — clear bundle rules on your site win trust.",
            "They rotate brands aggressively; watch which clinical lines get endcap space in-app.",
        ],

        active_promos: [
            {
                title: "Beauty Pass: Extra 20% Selected Skincare",
                type: "seasonal",
                started_at: "2026-03-17T00:00:00.000Z",
                ends_at: "2026-03-24T23:59:59.000Z",
                estimated_discount_pct: 25,
            },
            {
                title: "Free Shipping Above RM130",
                type: "free_shipping",
                started_at: "2026-01-01T00:00:00.000Z",
                estimated_discount_pct: 0,
            },
        ],
    },

    // ═══════════════════════════════════════
    // 4. INNISFREE MALAYSIA — K-beauty flagship & retail
    // ═══════════════════════════════════════
    {
        id: "comp_innisfree_004",
        symbol: "INF",
        name: "Innisfree Malaysia",
        description: "Amorepacific-owned K-beauty brand with malls + online. Benchmark for green positioning, sheet masks, and sunscreen launches.",
        status: "ACTIVE",
        tier: "ASPIRATIONAL",
        tracked_since: "2025-11-01T00:00:00.000Z",
        last_updated: "2026-03-21T08:30:00.000Z",

        channels: [
            {
                platform: "shopify",
                store_name: "innisfree.my",
                store_url: "https://www.innisfree.com/my",
                is_official: true,
                followers: 0,
                rating: 4.8,
                total_reviews: 6200,
                response_rate_pct: 95,
            },
            {
                platform: "instagram",
                store_name: "@innisfreemalaysia",
                is_official: true,
                followers: 298000,
                rating: 0,
                total_reviews: 0,
                response_rate_pct: 0,
            },
            {
                platform: "physical",
                store_name: "Innisfree boutiques (Malaysia)",
                is_official: true,
                followers: 0,
                rating: 4.9,
                total_reviews: 820,
                response_rate_pct: 0,
            },
            {
                platform: "shopee",
                store_name: "Innisfree Official MY",
                is_official: true,
                followers: 412000,
                rating: 4.7,
                total_reviews: 98100,
                response_rate_pct: 94,
            },
        ],

        catalog: {
            total_skus: 640,
            new_skus_30d: 48,
            removed_skus_30d: 14,
            top_categories: ["Green Tea Line", "Sunscreen", "Sheet Masks", "Cleansers", "Volcanic Line"],
            price_range: { min: 25, max: 259, avg: 72, currency: "MYR" },
            bestseller_price_avg: 49,
            discount_rate_pct: 22,
            avg_discount_depth_pct: 18,
        },

        engagement: {
            avg_monthly_reviews: 3800,
            avg_review_rating: 4.8,
            review_sentiment_pct: { positive: 91, neutral: 6, negative: 3 },
            social_mentions_30d: 4200,
            tiktok_views_30d: 1800000,
            instagram_followers: 298000,
            shopee_live_sessions_30d: 6,
            avg_live_viewers: 1200,
        },

        rankings: {
            search_rank_keywords: [
                { keyword: "innisfree sunscreen malaysia", your_rank: 38, their_rank: 1 },
                { keyword: "green tea seed serum", your_rank: 25, their_rank: 3 },
            ],
        },

        estimated: {
            monthly_revenue: { amount: 4200000, currency: "MYR", confidence: "MEDIUM" },
            monthly_orders: 28000,
            avg_order_value: 150,
            monthly_visitors: 850000,
            conversion_rate_pct: 3.3,
        },

        trends: {
            price_index_change_pct: 3.20,
            visibility_change_pct: 6.1,
            engagement_change_pct: 11.4,
            catalog_growth_pct: 8.9,
            revenue_change_pct: 9.2,
        },

        ai_insights: [
            "Innisfree raised hero SPF prices ~3% while growing engagement — brand equity still strong in malls.",
            "Sheet mask and sunscreen promos spike before travel seasons; align your ShopIntel travel minis to the same calendar.",
            "Shopee official store adds marketplace pressure; differentiate with clinical copy and ingredient transparency.",
            "High UGC on green tea line — seed similar community content around your barrier-focused story.",
        ],

        active_promos: [
            {
                title: "New Volcanic Clay Mask Drop",
                type: "collab",
                started_at: "2026-03-20T00:00:00.000Z",
                estimated_discount_pct: 0,
            },
        ],
    },

    // ═══════════════════════════════════════
    // 5. GUARDIAN MALAYSIA — Budget pharmacy beauty
    // ═══════════════════════════════════════
    {
        id: "comp_guardian_005",
        symbol: "GRD",
        name: "Guardian Malaysia",
        description: "Pharmacy-led beauty. Aggressive house-brand and BOGO on cleansers and SPF — price floor for mass market.",
        status: "ACTIVE",
        tier: "BUDGET",
        tracked_since: "2025-07-01T00:00:00.000Z",
        last_updated: "2026-03-21T10:00:00.000Z",

        channels: [
            {
                platform: "shopify",
                store_name: "guardian.com.my",
                store_url: "https://www.guardian.com.my",
                is_official: true,
                followers: 0,
                rating: 4.1,
                total_reviews: 186000,
                response_rate_pct: 88,
            },
            {
                platform: "shopee",
                store_name: "Guardian Malaysia Official",
                is_official: true,
                followers: 890000,
                rating: 4.5,
                total_reviews: 412000,
                response_rate_pct: 91,
            },
            {
                platform: "lazada",
                store_name: "Guardian Malaysia",
                is_official: true,
                followers: 320000,
                rating: 4.4,
                total_reviews: 118000,
                response_rate_pct: 87,
            },
        ],

        catalog: {
            total_skus: 9800,
            new_skus_30d: 520,
            removed_skus_30d: 310,
            top_categories: ["Sunscreen", "Cleansers", "Acne Care", "Body Lotion", "Hair Care"],
            price_range: { min: 4.9, max: 199, avg: 28, currency: "MYR" },
            bestseller_price_avg: 19.9,
            discount_rate_pct: 58,
            avg_discount_depth_pct: 38,
        },

        engagement: {
            avg_monthly_reviews: 42000,
            avg_review_rating: 4.2,
            review_sentiment_pct: { positive: 74, neutral: 17, negative: 9 },
            social_mentions_30d: 8200,
            tiktok_views_30d: 6200000,
            instagram_followers: 210000,
            shopee_live_sessions_30d: 14,
            avg_live_viewers: 3200,
        },

        rankings: {
            shopee_category_rank: 2,
            shopee_category_total: 4200,
            tiktok_category_rank: 4,
            lazada_category_rank: 5,
            search_rank_keywords: [
                { keyword: "sunscreen murah", your_rank: 67, their_rank: 1 },
                { keyword: "guardian buy 1 free 1", your_rank: 14, their_rank: 3 },
                { keyword: "acne patch guardian", your_rank: 52, their_rank: 2 },
                { keyword: "simple cleanser malaysia", your_rank: 33, their_rank: 4 },
            ],
        },

        estimated: {
            monthly_revenue: { amount: 8200000, currency: "MYR", confidence: "MEDIUM" },
            monthly_orders: 290000,
            avg_order_value: 28.2,
            monthly_visitors: 4100000,
            conversion_rate_pct: 7.1,
        },

        trends: {
            price_index_change_pct: -6.2,
            visibility_change_pct: 4.2,
            engagement_change_pct: 5.1,
            catalog_growth_pct: 2.8,
            revenue_change_pct: 4.0,
        },

        ai_insights: [
            "Guardian sets the promo floor — shoppers compare your SPF price to their BOGO cycles.",
            "They rotate house-brand dupes fast; monitor ingredient claims vs your ShopIntel differentiators.",
            "Negative reviews cluster around stock accuracy during mega sales — reliability messaging helps you stand out.",
            "Use them for trend spotting (acne patches, mineral SPF) rather than margin matching.",
        ],

        active_promos: [
            {
                title: "Members Day: 50% Second Item — Skin",
                type: "flash_sale",
                started_at: "2026-03-21T00:00:00.000Z",
                ends_at: "2026-03-21T23:59:59.000Z",
                estimated_discount_pct: 50,
            },
            {
                title: "Free Shipping Selected Stores",
                type: "free_shipping",
                started_at: "2026-03-01T00:00:00.000Z",
                estimated_discount_pct: 0,
            },
            {
                title: "Hydration Week: Extra 20% Off",
                type: "seasonal",
                started_at: "2026-03-15T00:00:00.000Z",
                ends_at: "2026-03-31T23:59:59.000Z",
                estimated_discount_pct: 20,
            },
        ],
    },

    // ═══════════════════════════════════════
    // 6. LANEIGE MALAYSIA — Amorepacific, mid-premium benchmark
    // ═══════════════════════════════════════
    {
        id: "comp_laneige_006",
        symbol: "LNE",
        name: "Laneige Malaysia",
        description: "K-beauty sleep mask and lip sleeping mask leader. Strong mall + online presence — benchmark for texture marketing and GWP.",
        status: "ACTIVE",
        tier: "INTERNATIONAL",
        tracked_since: "2025-09-01T00:00:00.000Z",
        last_updated: "2026-03-21T07:00:00.000Z",

        channels: [
            {
                platform: "shopify",
                store_name: "laneige.com/my",
                store_url: "https://www.laneige.com/my",
                is_official: true,
                followers: 0,
                rating: 4.6,
                total_reviews: 28000,
                response_rate_pct: 92,
            },
            {
                platform: "shopee",
                store_name: "Laneige Official Malaysia",
                is_official: true,
                followers: 980000,
                rating: 4.8,
                total_reviews: 156000,
                response_rate_pct: 96,
            },
            {
                platform: "physical",
                store_name: "Laneige counters (Malaysia)",
                is_official: true,
                followers: 0,
                rating: 4.7,
                total_reviews: 12000,
                response_rate_pct: 0,
            },
        ],

        catalog: {
            total_skus: 420,
            new_skus_30d: 36,
            removed_skus_30d: 12,
            top_categories: ["Water Bank", "Lip Sleeping Mask", "Neo Cushion", "Radian-C", "Cleansers"],
            price_range: { min: 45, max: 329, avg: 112, currency: "MYR" },
            bestseller_price_avg: 85,
            discount_rate_pct: 28,
            avg_discount_depth_pct: 22,
        },

        engagement: {
            avg_monthly_reviews: 9800,
            avg_review_rating: 4.7,
            review_sentiment_pct: { positive: 88, neutral: 9, negative: 3 },
            social_mentions_30d: 6800,
            tiktok_views_30d: 3200000,
            instagram_followers: 520000,
            shopee_live_sessions_30d: 10,
            avg_live_viewers: 4100,
        },

        rankings: {
            shopee_category_rank: 4,
            shopee_category_total: 4200,
            search_rank_keywords: [
                { keyword: "laneige lip sleeping mask", your_rank: 19, their_rank: 1 },
                { keyword: "water bank moisturizer", your_rank: 8, their_rank: 2 },
                { keyword: "laneige neo cushion", your_rank: 41, their_rank: 3 },
            ],
        },

        estimated: {
            monthly_revenue: { amount: 5200000, currency: "MYR", confidence: "MEDIUM" },
            monthly_orders: 62000,
            avg_order_value: 83.3,
            monthly_visitors: 980000,
            conversion_rate_pct: 6.3,
        },

        trends: {
            price_index_change_pct: 0.50,
            visibility_change_pct: 3.8,
            engagement_change_pct: 2.1,
            catalog_growth_pct: 2.3,
            revenue_change_pct: 4.0,
        },

        ai_insights: [
            "Laneige holds premium texture perception — lip and sleeping mask SKUs are category kings.",
            "GWP-heavy promos; shoppers expect deluxe minis — consider ShopIntel mini-stacks as a counter-offer.",
            "Strong counter + Shopee parity can blur pricing; highlight ingredient story where they lead with lifestyle.",
            "Live commerce ramping; benchmark their demo length and shade-matching flow.",
        ],

        active_promos: [
            {
                title: "GWP: Water Bank Set with RM220 Spend",
                type: "seasonal",
                started_at: "2026-03-14T00:00:00.000Z",
                ends_at: "2026-03-27T23:59:59.000Z",
                estimated_discount_pct: 15,
            },
        ],
    },

    // ═══════════════════════════════════════
    // 7. b.liv — Malaysian skincare, pores & clarity
    // ═══════════════════════════════════════
    {
        id: "comp_bliv_007",
        symbol: "BLV",
        name: "b.liv",
        description: "Homegrown Malaysian skincare focused on pores, blackheads, and clarity. Strong Shopee/TikTok velocity and price-aggressive bundles.",
        status: "ACTIVE",
        tier: "DIRECT",
        tracked_since: "2026-01-15T00:00:00.000Z",
        last_updated: "2026-03-21T07:00:00.000Z",

        channels: [
            {
                platform: "shopee",
                store_name: "b.liv Official Store",
                is_official: true,
                followers: 445000,
                rating: 4.7,
                total_reviews: 198000,
                response_rate_pct: 98,
            },
            {
                platform: "tiktok_shop",
                store_name: "b.liv Skincare",
                is_official: true,
                followers: 320000,
                rating: 4.6,
                total_reviews: 89000,
                response_rate_pct: 92,
            },
        ],

        catalog: {
            total_skus: 86,
            new_skus_30d: 14,
            removed_skus_30d: 4,
            top_categories: ["Blackhead Serum", "Pore Strips", "Sub-Skin Cleanser", "Masks", "Sunscreen"],
            price_range: { min: 19.9, max: 129, avg: 49, currency: "MYR" },
            bestseller_price_avg: 39.9,
            discount_rate_pct: 38,
            avg_discount_depth_pct: 28,
        },

        engagement: {
            avg_monthly_reviews: 12400,
            avg_review_rating: 4.7,
            review_sentiment_pct: { positive: 88, neutral: 8, negative: 4 },
            social_mentions_30d: 6200,
            tiktok_views_30d: 18000000,
            instagram_followers: 280000,
            shopee_live_sessions_30d: 28,
            avg_live_viewers: 6800,
        },

        rankings: {
            shopee_category_rank: 12,
            shopee_category_total: 4200,
            tiktok_category_rank: 3,
            search_rank_keywords: [
                { keyword: "bliv blackhead serum", your_rank: 16, their_rank: 4 },
                { keyword: "porphyrin skincare malaysia", your_rank: 55, their_rank: 2 },
                { keyword: "shopee live skincare", your_rank: 42, their_rank: 1 },
            ],
        },

        estimated: {
            monthly_revenue: { amount: 890000, currency: "MYR", confidence: "MEDIUM" },
            monthly_orders: 14200,
            avg_order_value: 62.7,
            monthly_visitors: 480000,
            conversion_rate_pct: 3.0,
        },

        trends: {
            price_index_change_pct: -2.80,
            visibility_change_pct: 22.40,
            engagement_change_pct: 34.71,
            catalog_growth_pct: 10.9,
            revenue_change_pct: 28.3,
        },

        ai_insights: [
            "FASTEST GROWING local skincare competitor on Live — near-daily Shopee streams with high replay views.",
            "Hero SKUs skew to pore and blackhead; your ShopIntel barrier and SPF story avoids head-on overlap if you position clearly.",
            "Bundle-heavy AOV; counter with concise 3-step kits and education rather than SKU count.",
            "Top 20 SKUs drive most revenue — depth on clarity concerns vs your breadth play.",
        ],

        active_promos: [
            {
                title: "Daily Shopee Live: Pore Kit Flash",
                type: "live_sale",
                started_at: "2026-03-01T00:00:00.000Z",
                estimated_discount_pct: 35,
            },
            {
                title: "Sub-Skin + Sunscreen Bundle",
                type: "bundle",
                started_at: "2026-03-10T00:00:00.000Z",
                ends_at: "2026-04-10T23:59:59.000Z",
                estimated_discount_pct: 25,
            },
        ],
    },

    // ═══════════════════════════════════════
    // 8. MAC COSMETICS MY — Inactive (color-led, low skincare overlap)
    // ═══════════════════════════════════════
    {
        id: "comp_mac_008",
        symbol: "MAC",
        name: "MAC Cosmetics Malaysia",
        description: "Global color cosmetics leader. Tracking paused — limited overlap now that you are skincare-first.",
        status: "INACTIVE",
        tier: "ASPIRATIONAL",
        tracked_since: "2025-06-01T00:00:00.000Z",
        last_updated: "2026-01-10T18:00:00.000Z",

        channels: [
            {
                platform: "shopify",
                store_name: "maccosmetics.com.my",
                store_url: "https://www.maccosmetics.com.my",
                is_official: true,
                followers: 0,
                rating: 4.4,
                total_reviews: 28000,
                response_rate_pct: 88,
            },
            {
                platform: "shopee",
                store_name: "MAC Cosmetics Official MY",
                is_official: true,
                followers: 680000,
                rating: 4.7,
                total_reviews: 142000,
                response_rate_pct: 94,
            },
        ],

        catalog: {
            total_skus: 2100,
            new_skus_30d: 0,
            removed_skus_30d: 0,
            top_categories: ["Lipstick", "Foundation", "Eyeshadow", "Brushes", "Skincare Prep"],
            price_range: { min: 65, max: 299, avg: 119, currency: "MYR" },
            bestseller_price_avg: 95,
            discount_rate_pct: 18,
            avg_discount_depth_pct: 20,
        },

        engagement: {
            avg_monthly_reviews: 0,
            avg_review_rating: 4.6,
            review_sentiment_pct: { positive: 83, neutral: 12, negative: 5 },
            social_mentions_30d: 0,
            instagram_followers: 920000,
            shopee_live_sessions_30d: 0,
            avg_live_viewers: 0,
        },

        rankings: {
            shopee_category_rank: 5,
            shopee_category_total: 3100,
            search_rank_keywords: [],
        },

        estimated: {
            monthly_revenue: { amount: 0, currency: "MYR", confidence: "LOW" },
            monthly_orders: 0,
            avg_order_value: 0,
            monthly_visitors: 0,
            conversion_rate_pct: 0,
        },

        trends: {
            price_index_change_pct: 0,
            visibility_change_pct: 0,
            engagement_change_pct: 0,
            catalog_growth_pct: 0,
            revenue_change_pct: 0,
        },

        ai_insights: [
            "Tracking paused since Jan 2026. MAC remains color-forward; skincare prep SKUs are peripheral vs your Beauty Skincare ShopIntel core.",
            "Reactivate if you launch complexion-adjacent primers or partner on counter events.",
        ],

        active_promos: [],
    },
];