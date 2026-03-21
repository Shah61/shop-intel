/* ═══════════════════════════════════════════════════════
   SHOP INTEL — Competitor Intelligence Mock Data
   
   Scenario: You run "KYRA" — a mid-range women's fashion
   brand based in KL, selling on Shopee, TikTok Shop,
   Lazada, your own Shopify store, and 2 physical outlets.
   
   Average product price: RM 79–189
   Monthly revenue: ~RM 180k
   Shopee followers: 24.3k
   TikTok Shop followers: 11.8k
   ═══════════════════════════════════════════════════════ */

import type { CompetitorProfile } from "./model/competitor-profile";

export const MOCK_COMPETITORS: CompetitorProfile[] = [

    // ═══════════════════════════════════════
    // 1. PADINI — Direct rival, mass market
    // ═══════════════════════════════════════
    {
        id: "comp_padini_001",
        symbol: "PDI",
        name: "Padini Concept Store",
        description: "Malaysia's largest homegrown fashion retailer. Mass-market pricing, strong physical presence, aggressive Shopee promotions.",
        status: "ACTIVE",
        tier: "DIRECT",
        tracked_since: "2025-09-15T00:00:00.000Z",
        last_updated: "2026-03-21T08:12:00.000Z",

        channels: [
            {
                platform: "shopee",
                store_name: "Padini Official Store",
                store_url: "https://shopee.com.my/padini",
                is_official: true,
                followers: 892400,
                rating: 4.8,
                total_reviews: 341200,
                response_rate_pct: 96,
            },
            {
                platform: "lazada",
                store_name: "Padini Official",
                is_official: true,
                followers: 215600,
                rating: 4.7,
                total_reviews: 98400,
                response_rate_pct: 91,
            },
            {
                platform: "physical",
                store_name: "Padini Concept Store (78 outlets)",
                is_official: true,
                followers: 0,
                rating: 4.3,
                total_reviews: 12800,
                response_rate_pct: 0,
            },
        ],

        catalog: {
            total_skus: 4820,
            new_skus_30d: 186,
            removed_skus_30d: 94,
            top_categories: ["Women's Tops", "Men's Casual", "Dresses", "Denim", "Accessories"],
            price_range: { min: 19.9, max: 299, avg: 69, currency: "MYR" },
            bestseller_price_avg: 49.9,
            discount_rate_pct: 38,
            avg_discount_depth_pct: 30,
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
                { keyword: "women blouse malaysia", your_rank: 14, their_rank: 2 },
                { keyword: "affordable dress", your_rank: 22, their_rank: 5 },
                { keyword: "office wear women", your_rank: 8, their_rank: 3 },
                { keyword: "kurung moden", your_rank: 31, their_rank: 11 },
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
            "Padini dropped prices by 5% across 380+ SKUs this month — likely clearing winter stock before Raya collection launch.",
            "Their Shopee Live frequency doubled from 6 to 12 sessions. Average viewers up 24%. Consider increasing your live schedule.",
            "They're ranking #2 for 'women blouse malaysia' — you're at #14. Their listing has 3x more reviews. Focus on review collection campaigns.",
            "New denim sub-brand detected: 29 new SKUs priced 20% below their usual range. Possible budget line test.",
        ],

        active_promos: [
            {
                title: "Pre-Raya Clearance: Up to 50% Off",
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
    // 2. FASHIONVALET — Direct rival, modest fashion
    // ═══════════════════════════════════════
    {
        id: "comp_fv_002",
        symbol: "FEV",
        name: "FashionValet",
        description: "Premium modest fashion marketplace by Vivy Yusof. Strong TikTok presence, influencer-driven, Raya season powerhouse.",
        status: "ACTIVE",
        tier: "DIRECT",
        tracked_since: "2025-10-01T00:00:00.000Z",
        last_updated: "2026-03-21T10:30:00.000Z",

        channels: [
            {
                platform: "shopify",
                store_name: "FashionValet.com",
                store_url: "https://fashionvalet.com",
                is_official: true,
                followers: 0,
                rating: 4.5,
                total_reviews: 18900,
                response_rate_pct: 88,
            },
            {
                platform: "tiktok_shop",
                store_name: "FashionValet Official",
                is_official: true,
                followers: 189000,
                rating: 4.6,
                total_reviews: 42100,
                response_rate_pct: 94,
            },
            {
                platform: "shopee",
                store_name: "FashionValet Official",
                is_official: true,
                followers: 312000,
                rating: 4.6,
                total_reviews: 87300,
                response_rate_pct: 92,
            },
            {
                platform: "instagram",
                store_name: "@fashionvaletcom",
                is_official: true,
                followers: 1240000,
                rating: 0,
                total_reviews: 0,
                response_rate_pct: 0,
            },
        ],

        catalog: {
            total_skus: 2340,
            new_skus_30d: 312,
            removed_skus_30d: 45,
            top_categories: ["Baju Kurung", "Hijab", "Modest Dresses", "Raya Collection", "Accessories"],
            price_range: { min: 49, max: 890, avg: 189, currency: "MYR" },
            bestseller_price_avg: 149,
            discount_rate_pct: 15,
            avg_discount_depth_pct: 20,
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
                { keyword: "baju raya 2026", your_rank: 28, their_rank: 1 },
                { keyword: "kurung moden", your_rank: 31, their_rank: 4 },
                { keyword: "modest fashion malaysia", your_rank: 19, their_rank: 2 },
                { keyword: "hijab premium", your_rank: 45, their_rank: 6 },
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
            "FashionValet is in full Raya launch mode — 312 new SKUs in 30 days, highest catalog growth among all tracked competitors.",
            "Their TikTok engagement exploded +34%. They ran 18 Shopee Live sessions with avg 4.2k viewers. Their creator collab with @nnajwazebra drove 3.2M views alone.",
            "They RAISED prices 4.2% while growing — premium positioning is working. Your overlap products are priced 28% lower but getting 60% fewer reviews.",
            "ALERT: They're now #1 for 'baju raya 2026' — you're at #28. This keyword has 142k monthly searches. Urgent SEO action needed.",
        ],

        active_promos: [
            {
                title: "Raya 2026 Early Bird: 15% Off New Collection",
                type: "seasonal",
                started_at: "2026-03-10T00:00:00.000Z",
                ends_at: "2026-03-25T23:59:59.000Z",
                estimated_discount_pct: 15,
            },
            {
                title: "TikTok Live Exclusive Bundles",
                type: "live_sale",
                started_at: "2026-03-18T00:00:00.000Z",
                estimated_discount_pct: 20,
            },
            {
                title: "Najwa Zebra x FV Collab Drop",
                type: "collab",
                started_at: "2026-03-14T00:00:00.000Z",
                ends_at: "2026-04-14T23:59:59.000Z",
                estimated_discount_pct: 0,
            },
        ],
    },

    // ═══════════════════════════════════════
    // 3. ZALORA MY — Direct rival, marketplace
    // ═══════════════════════════════════════
    {
        id: "comp_zalora_003",
        symbol: "ZLR",
        name: "Zalora Malaysia",
        description: "Southeast Asia's largest online fashion marketplace. Broad catalog, strong logistics, consistent promotions.",
        status: "ACTIVE",
        tier: "DIRECT",
        tracked_since: "2025-08-20T00:00:00.000Z",
        last_updated: "2026-03-21T09:45:00.000Z",

        channels: [
            {
                platform: "shopify",
                store_name: "Zalora.com.my",
                store_url: "https://zalora.com.my",
                is_official: true,
                followers: 0,
                rating: 4.2,
                total_reviews: 245000,
                response_rate_pct: 85,
            },
            {
                platform: "shopee",
                store_name: "ZALORA Official Store",
                is_official: true,
                followers: 1420000,
                rating: 4.6,
                total_reviews: 512000,
                response_rate_pct: 93,
            },
            {
                platform: "instagram",
                store_name: "@zaloramyofficial",
                is_official: true,
                followers: 890000,
                rating: 0,
                total_reviews: 0,
                response_rate_pct: 0,
            },
        ],

        catalog: {
            total_skus: 28500,
            new_skus_30d: 1240,
            removed_skus_30d: 890,
            top_categories: ["Women's Clothing", "Men's Clothing", "Shoes", "Sportswear", "Hijab Fashion"],
            price_range: { min: 15, max: 1200, avg: 112, currency: "MYR" },
            bestseller_price_avg: 79,
            discount_rate_pct: 52,
            avg_discount_depth_pct: 40,
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
                { keyword: "women dress online malaysia", your_rank: 11, their_rank: 1 },
                { keyword: "baju kurung online", your_rank: 31, their_rank: 3 },
                { keyword: "office wear women", your_rank: 8, their_rank: 1 },
                { keyword: "plus size fashion malaysia", your_rank: 52, their_rank: 4 },
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
            "Zalora is #1 on Shopee fashion and dominates 'women dress online malaysia'. Their scale is hard to match — focus on niches they underserve.",
            "52% of their catalog is on sale with avg 40% discount. They compete on price volume, not margin. Your higher-quality positioning is a differentiator.",
            "Their engagement dropped 3.1% — review sentiment shows 11% negative (sizing issues, delivery complaints). Opportunity to highlight your quality and CS.",
            "They added 1,240 new SKUs but removed 890 — high churn suggests aggressive testing. Monitor which categories they're doubling down on.",
        ],

        active_promos: [
            {
                title: "Fashion Week: Extra 25% Off Everything",
                type: "seasonal",
                started_at: "2026-03-17T00:00:00.000Z",
                ends_at: "2026-03-24T23:59:59.000Z",
                estimated_discount_pct: 25,
            },
            {
                title: "Free Returns on All Orders",
                type: "free_shipping",
                started_at: "2026-01-01T00:00:00.000Z",
                estimated_discount_pct: 0,
            },
        ],
    },

    // ═══════════════════════════════════════
    // 4. PESTLE & MORTAR — Aspirational, premium streetwear
    // ═══════════════════════════════════════
    {
        id: "comp_pmc_004",
        symbol: "PSC",
        name: "Pestle & Mortar Clothing",
        description: "Malaysian premium streetwear brand. Strong brand identity, limited drops, cult following. Benchmark for brand-building.",
        status: "ACTIVE",
        tier: "ASPIRATIONAL",
        tracked_since: "2025-11-01T00:00:00.000Z",
        last_updated: "2026-03-21T08:30:00.000Z",

        channels: [
            {
                platform: "shopify",
                store_name: "pestlemortarclothing.com",
                store_url: "https://pestlemortarclothing.com",
                is_official: true,
                followers: 0,
                rating: 4.8,
                total_reviews: 6200,
                response_rate_pct: 95,
            },
            {
                platform: "instagram",
                store_name: "@pestlemortarclothing",
                is_official: true,
                followers: 298000,
                rating: 0,
                total_reviews: 0,
                response_rate_pct: 0,
            },
            {
                platform: "physical",
                store_name: "PMC Flagship (APW Bangsar)",
                is_official: true,
                followers: 0,
                rating: 4.9,
                total_reviews: 820,
                response_rate_pct: 0,
            },
        ],

        catalog: {
            total_skus: 180,
            new_skus_30d: 24,
            removed_skus_30d: 8,
            top_categories: ["Graphic Tees", "Hoodies", "Caps", "Limited Drops", "Collabs"],
            price_range: { min: 89, max: 450, avg: 179, currency: "MYR" },
            bestseller_price_avg: 139,
            discount_rate_pct: 5,
            avg_discount_depth_pct: 15,
        },

        engagement: {
            avg_monthly_reviews: 380,
            avg_review_rating: 4.8,
            review_sentiment_pct: { positive: 91, neutral: 6, negative: 3 },
            social_mentions_30d: 4200,
            tiktok_views_30d: 1800000,
            instagram_followers: 298000,
            shopee_live_sessions_30d: 0,
            avg_live_viewers: 0,
        },

        rankings: {
            search_rank_keywords: [
                { keyword: "malaysian streetwear", your_rank: 38, their_rank: 1 },
                { keyword: "graphic tee malaysia", your_rank: 25, their_rank: 3 },
            ],
        },

        estimated: {
            monthly_revenue: { amount: 420000, currency: "MYR", confidence: "LOW" },
            monthly_orders: 2800,
            avg_order_value: 150,
            monthly_visitors: 85000,
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
            "PMC raised prices 3.2% and STILL grew engagement 11%. Their brand loyalty lets them command premium — study their drop model and community building.",
            "Only 180 SKUs but 91% positive sentiment. Quality over quantity. Your catalog is 8x larger but your sentiment is 76% — room to improve.",
            "Zero Shopee Live, zero marketplace presence — they sell purely D2C. If you capture their audience on Shopee, there's no competition there.",
            "Their IG gets 4,200 organic mentions/month — almost entirely UGC. Consider a customer photo contest to build similar organic buzz.",
        ],

        active_promos: [
            {
                title: "Spring Drop: 'ROOTS' Collection",
                type: "collab",
                started_at: "2026-03-20T00:00:00.000Z",
                estimated_discount_pct: 0,
            },
        ],
    },

    // ═══════════════════════════════════════
    // 5. SHEIN MY — Budget, international fast-fashion
    // ═══════════════════════════════════════
    {
        id: "comp_shein_005",
        symbol: "SHN",
        name: "SHEIN Malaysia",
        description: "Ultra-fast fashion giant. Impossible to beat on price. Track for trend intelligence and catalog movement, not to compete head-on.",
        status: "ACTIVE",
        tier: "BUDGET",
        tracked_since: "2025-07-01T00:00:00.000Z",
        last_updated: "2026-03-21T10:00:00.000Z",

        channels: [
            {
                platform: "shopify",
                store_name: "shein.com.my",
                store_url: "https://shein.com.my",
                is_official: true,
                followers: 0,
                rating: 3.9,
                total_reviews: 890000,
                response_rate_pct: 72,
            },
            {
                platform: "shopee",
                store_name: "SHEIN Official Store MY",
                is_official: true,
                followers: 2100000,
                rating: 4.4,
                total_reviews: 1240000,
                response_rate_pct: 78,
            },
            {
                platform: "tiktok_shop",
                store_name: "SHEIN MY",
                is_official: true,
                followers: 580000,
                rating: 4.2,
                total_reviews: 320000,
                response_rate_pct: 65,
            },
        ],

        catalog: {
            total_skus: 142000,
            new_skus_30d: 8400,
            removed_skus_30d: 6200,
            top_categories: ["Women's Tops", "Dresses", "Swimwear", "Plus Size", "Modest Wear", "Accessories"],
            price_range: { min: 5, max: 189, avg: 35, currency: "MYR" },
            bestseller_price_avg: 25,
            discount_rate_pct: 68,
            avg_discount_depth_pct: 45,
        },

        engagement: {
            avg_monthly_reviews: 142000,
            avg_review_rating: 4.1,
            review_sentiment_pct: { positive: 64, neutral: 19, negative: 17 },
            social_mentions_30d: 28000,
            tiktok_views_30d: 45000000,
            instagram_followers: 3200000,
            shopee_live_sessions_30d: 22,
            avg_live_viewers: 8400,
        },

        rankings: {
            shopee_category_rank: 2,
            shopee_category_total: 4200,
            tiktok_category_rank: 1,
            lazada_category_rank: 5,
            search_rank_keywords: [
                { keyword: "cheap dress", your_rank: 67, their_rank: 1 },
                { keyword: "women blouse malaysia", your_rank: 14, their_rank: 3 },
                { keyword: "plus size fashion malaysia", your_rank: 52, their_rank: 1 },
                { keyword: "trendy outfit 2026", your_rank: 33, their_rank: 2 },
            ],
        },

        estimated: {
            monthly_revenue: { amount: 22000000, currency: "MYR", confidence: "LOW" },
            monthly_orders: 620000,
            avg_order_value: 35.5,
            monthly_visitors: 12000000,
            conversion_rate_pct: 5.2,
        },

        trends: {
            price_index_change_pct: -14.55,
            visibility_change_pct: 4.2,
            engagement_change_pct: 8.8,
            catalog_growth_pct: 1.5,
            revenue_change_pct: 6.3,
        },

        ai_insights: [
            "Do NOT compete with SHEIN on price — their avg product is RM 35, yours is RM 134. You'd destroy your margins. Instead, use them as a trend radar.",
            "SHEIN added 8,400 new SKUs this month. 340 overlap with your categories. Monitor which designs gain traction and create quality alternatives.",
            "Their negative review rate is 17% — mostly quality and sizing complaints. Your 'quality guarantee' messaging directly counters their weakness.",
            "SHEIN's TikTok gets 45M views/month. Track their top-performing content formats — haul videos and OOTD perform best.",
        ],

        active_promos: [
            {
                title: "RM5 Deals — Flash Zone",
                type: "flash_sale",
                started_at: "2026-03-21T00:00:00.000Z",
                ends_at: "2026-03-21T23:59:59.000Z",
                estimated_discount_pct: 70,
            },
            {
                title: "Free Shipping on All Orders",
                type: "free_shipping",
                started_at: "2026-03-01T00:00:00.000Z",
                estimated_discount_pct: 0,
            },
            {
                title: "Spring Must-Haves: Extra 20% Off",
                type: "seasonal",
                started_at: "2026-03-15T00:00:00.000Z",
                ends_at: "2026-03-31T23:59:59.000Z",
                estimated_discount_pct: 20,
            },
        ],
    },

    // ═══════════════════════════════════════
    // 6. UNIQLO MY — International, mid-range benchmark
    // ═══════════════════════════════════════
    {
        id: "comp_uniqlo_006",
        symbol: "UNQ",
        name: "Uniqlo Malaysia",
        description: "Japanese basics giant. Clean brand, consistent pricing, huge physical footprint. Your closest international pricing benchmark.",
        status: "ACTIVE",
        tier: "INTERNATIONAL",
        tracked_since: "2025-09-01T00:00:00.000Z",
        last_updated: "2026-03-21T07:00:00.000Z",

        channels: [
            {
                platform: "shopify",
                store_name: "uniqlo.com/my",
                store_url: "https://www.uniqlo.com/my",
                is_official: true,
                followers: 0,
                rating: 4.5,
                total_reviews: 42000,
                response_rate_pct: 90,
            },
            {
                platform: "shopee",
                store_name: "UNIQLO Official Store",
                is_official: true,
                followers: 1680000,
                rating: 4.8,
                total_reviews: 289000,
                response_rate_pct: 97,
            },
            {
                platform: "physical",
                store_name: "Uniqlo Malaysia (56 stores)",
                is_official: true,
                followers: 0,
                rating: 4.6,
                total_reviews: 34000,
                response_rate_pct: 0,
            },
        ],

        catalog: {
            total_skus: 3200,
            new_skus_30d: 218,
            removed_skus_30d: 145,
            top_categories: ["AIRism", "UT Graphic Tees", "Women's Basics", "Men's Basics", "Kids"],
            price_range: { min: 29.9, max: 399, avg: 99, currency: "MYR" },
            bestseller_price_avg: 59.9,
            discount_rate_pct: 22,
            avg_discount_depth_pct: 25,
        },

        engagement: {
            avg_monthly_reviews: 9800,
            avg_review_rating: 4.7,
            review_sentiment_pct: { positive: 85, neutral: 11, negative: 4 },
            social_mentions_30d: 6800,
            tiktok_views_30d: 3200000,
            instagram_followers: 520000,
            shopee_live_sessions_30d: 4,
            avg_live_viewers: 2100,
        },

        rankings: {
            shopee_category_rank: 4,
            shopee_category_total: 4200,
            search_rank_keywords: [
                { keyword: "basic tee malaysia", your_rank: 19, their_rank: 1 },
                { keyword: "office wear women", your_rank: 8, their_rank: 2 },
                { keyword: "linen pants", your_rank: 41, their_rank: 3 },
            ],
        },

        estimated: {
            monthly_revenue: { amount: 15000000, currency: "MYR", confidence: "MEDIUM" },
            monthly_orders: 180000,
            avg_order_value: 83.3,
            monthly_visitors: 3800000,
            conversion_rate_pct: 4.7,
        },

        trends: {
            price_index_change_pct: 0.50,
            visibility_change_pct: 3.8,
            engagement_change_pct: 2.1,
            catalog_growth_pct: 2.3,
            revenue_change_pct: 4.0,
        },

        ai_insights: [
            "Uniqlo barely moves prices — 0.5% change in 30 days. Their consistency builds trust. Your frequent promos may be training customers to wait for sales.",
            "They dominate 'basic tee' and 'linen pants'. Don't compete on basics — win on trend-forward pieces and local cultural designs they can't replicate.",
            "85% positive sentiment with only 4% negative — best-in-class quality perception. Study their product descriptions and sizing guides.",
            "Spring/summer rollout added 218 SKUs focused on lightweight fabrics. Align your seasonal launches within 1-2 weeks of theirs to capture spillover traffic.",
        ],

        active_promos: [
            {
                title: "Limited Price: Selected Items from RM29.90",
                type: "seasonal",
                started_at: "2026-03-14T00:00:00.000Z",
                ends_at: "2026-03-27T23:59:59.000Z",
                estimated_discount_pct: 15,
            },
        ],
    },

    // ═══════════════════════════════════════
    // 7. NITA — Direct rival, beauty-fashion crossover
    // ═══════════════════════════════════════
    {
        id: "comp_nita_007",
        symbol: "NTA",
        name: "Nita Cosmetics & Fashion",
        description: "Fast-growing beauty-fashion hybrid on Shopee. Massive Shopee Live presence, viral TikTok content, aggressive pricing.",
        status: "ACTIVE",
        tier: "DIRECT",
        tracked_since: "2026-01-15T00:00:00.000Z",
        last_updated: "2026-03-21T07:00:00.000Z",

        channels: [
            {
                platform: "shopee",
                store_name: "Nita Official MY",
                is_official: true,
                followers: 445000,
                rating: 4.7,
                total_reviews: 198000,
                response_rate_pct: 98,
            },
            {
                platform: "tiktok_shop",
                store_name: "Nita Official",
                is_official: true,
                followers: 320000,
                rating: 4.6,
                total_reviews: 89000,
                response_rate_pct: 92,
            },
        ],

        catalog: {
            total_skus: 680,
            new_skus_30d: 92,
            removed_skus_30d: 18,
            top_categories: ["Blouses", "Telekung", "Beauty Sets", "Modest Casual", "Scarves"],
            price_range: { min: 19.9, max: 229, avg: 69, currency: "MYR" },
            bestseller_price_avg: 49.9,
            discount_rate_pct: 42,
            avg_discount_depth_pct: 30,
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
                { keyword: "blouse murah", your_rank: 16, their_rank: 4 },
                { keyword: "telekung premium", your_rank: 55, their_rank: 2 },
                { keyword: "shopee live fashion", your_rank: 42, their_rank: 1 },
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
            "FASTEST GROWING competitor. Engagement jumped 34% in one month — driven by 28 Shopee Live sessions (you did 3). Live commerce is their moat.",
            "Their beauty + fashion bundle strategy drives higher AOV from beauty customers. Consider cross-category bundles with accessories or beauty partnerships.",
            "Now #1 for 'shopee live fashion' — they stream almost daily. Avg replay views: 45k. Start with 2-3 lives/week minimum to compete.",
            "Only 680 SKUs but top 20 products account for 60% of revenue. Depth over breadth strategy is working.",
        ],

        active_promos: [
            {
                title: "Daily Shopee Live: Up to 50% Off",
                type: "live_sale",
                started_at: "2026-03-01T00:00:00.000Z",
                estimated_discount_pct: 35,
            },
            {
                title: "Beauty + Fashion Bundle RM99",
                type: "bundle",
                started_at: "2026-03-10T00:00:00.000Z",
                ends_at: "2026-04-10T23:59:59.000Z",
                estimated_discount_pct: 25,
            },
        ],
    },

    // ═══════════════════════════════════════
    // 8. CHARLES & KEITH — Inactive, paused
    // ═══════════════════════════════════════
    {
        id: "comp_ck_008",
        symbol: "CHT",
        name: "Charles & Keith MY",
        description: "Singapore-based fashion accessories brand. Tracking paused after pivot away from accessories category.",
        status: "INACTIVE",
        tier: "ASPIRATIONAL",
        tracked_since: "2025-06-01T00:00:00.000Z",
        last_updated: "2026-01-10T18:00:00.000Z",

        channels: [
            {
                platform: "shopify",
                store_name: "charleskeith.com/my",
                store_url: "https://charleskeith.com/my",
                is_official: true,
                followers: 0,
                rating: 4.4,
                total_reviews: 28000,
                response_rate_pct: 88,
            },
            {
                platform: "shopee",
                store_name: "Charles & Keith Official",
                is_official: true,
                followers: 680000,
                rating: 4.7,
                total_reviews: 142000,
                response_rate_pct: 94,
            },
        ],

        catalog: {
            total_skus: 1200,
            new_skus_30d: 0,
            removed_skus_30d: 0,
            top_categories: ["Bags", "Shoes", "Accessories", "Sunglasses"],
            price_range: { min: 89, max: 599, avg: 219, currency: "MYR" },
            bestseller_price_avg: 179,
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
            "Tracking paused since Jan 2026. Charles & Keith primarily sells accessories — no longer overlaps with your clothing focus.",
            "Consider reactivating if you expand into bags or accessories.",
        ],

        active_promos: [],
    },
];