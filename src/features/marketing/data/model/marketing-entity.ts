export interface MarketingResponse {
    success: boolean;
    message: string;
    data: {
        marketing: Marketing[];
        meta: MarketingMeta;
    };
}

export interface MarketingItemsResponse {
    success: boolean;
    message: string;
    data: {
        marketing_items: MarketingItem[];
        meta: MarketingMeta;
    };
}

export interface Marketing {
    id: string;
    name: string;
    total_cost: number;
    created_at: string;
    updated_at: string;
    marketing_items: MarketingItem[];
}

export interface MarketingItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    duration: number;
    start_date: string;
    end_date: string;
    marketing_id: string;
    created_at: string;
    updated_at: string;
    marketing: Marketing;
    marketing_links: MarketingLink[];
}

export interface MarketingLinkMetadata {
    // TikTok specific metrics
    likes?: number | string;
    saves?: number | string;
    views?: number | string;
    shares?: number | string;
    reposts?: number | string;
    comments?: number | string;
    video_id?: string;
    author_id?: string;
    downloads?: number | string;
    create_time?: number | string;
    description?: string;
    video_length?: number | string;
    forward_count?: number | string;
    author_nickname?: string;
    whatsapp_shares?: number | string;
    
    // Twitter specific metrics
    replies?: number | string;
    retweets?: number | string;
    bookmarks?: number | string;
    image_url?: string;
    quote_tweets?: number | string;
    
    // 24h change tracking for all platforms
    "24h_change_likes"?: number | string;
    "24h_change_saves"?: number | string;
    "24h_change_views"?: number | string;
    "24h_change_shares"?: number | string;
    "24h_change_reposts"?: number | string;
    "24h_change_comments"?: number | string;
    "24h_change_replies"?: number | string;
    "24h_change_retweets"?: number | string;
    "24h_change_bookmarks"?: number | string;
    "24h_change_quote_tweets"?: number | string;
    "24h_change_forward_count"?: number | string;
    "24h_change_whatsapp_shares"?: number | string;
    
    // Previous track values
    previous_track_likes?: number | string;
    previous_track_saves?: number | string;
    previous_track_views?: number | string;
    previous_track_shares?: number | string;
    previous_track_reposts?: number | string;
    previous_track_comments?: number | string;
    previous_track_replies?: number | string;
    previous_track_retweets?: number | string;
    previous_track_bookmarks?: number | string;
    previous_track_quote_tweets?: number | string;
    previous_track_forward_count?: number | string;
    previous_track_whatsapp_shares?: number | string;
    
    // Tracking info
    last_tracked?: string;
}

export interface MarketingLink {
    id: string;
    link: string;
    platform: 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'GOOGLE' | 'TWITTER' | 'OTHER';
    marketing_item_id: string;
    metadata?: MarketingLinkMetadata;
    created_at: string;
    updated_at: string;
}

export interface MarketingMeta {
    total: number;
}

// Request Types
export interface MarketingFilters {
    start_date?: string;
    end_date?: string;
    platform?: string;
    limit?: number;
    offset?: number;
}

export interface CreateMarketingLinkRequest {
    link: string;
    platform: 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'GOOGLE' | 'TWITTER' | 'OTHER';
}

export interface CreateMarketingItemRequest {
    marketing_id?: string;
    name: string;
    description: string;
    cost: number;
    duration: number;
    start_date: string;
    links: CreateMarketingLinkRequest[];
}

export interface CreateMarketingRequest {
    name: string;
    marketing_items: CreateMarketingItemRequest[];
}

export interface CreateMarketingResponse {
    success: boolean;
    message: string;
    data: Marketing;
}

export interface UpdateMarketingRequest {
    name: string;
}

export interface UpdateMarketingItemRequest {
    name?: string;
    description?: string;
    cost?: number;
    duration?: number;
    start_date?: string;
    end_date?: string;
    links?: CreateMarketingLinkRequest[];
}

// Historical Data Types
export interface MarketingHistoricalDataPoint {
    start_date: string;
    end_date: string;
    value: number;
}

export interface MarketingHistoricalDataMeta {
    total: number;
    start_date: string;
    end_date: string;
}

export interface MarketingHistoricalDataResponse {
    success: boolean;
    message: string;
    data: {
        historicalData: MarketingHistoricalDataPoint[];
        metadata: MarketingHistoricalDataMeta;
    };
}

export interface MarketingHistoricalDataFilters {
    start_date: string;
    end_date: string;
    platform?: string;
}
