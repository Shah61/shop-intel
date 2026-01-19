export interface EngagementMetrics {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    total_engagement: number;
    percentage_engagement: number;
}

export interface PreviousEngagementMetrics {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    total_engagement: number;
    percentage_engagement_change: number;
}

export interface CompetitorChannel {
    id: string;
    name: string;
    image_url: string;
    unique_id: string;
    engagement_metrics: EngagementMetrics;
    start_date: string;
    end_date: string;
    source: 'CREATOR' | 'COMPETITOR' | 'Shop-Intel';
    previous_engagement_metrics?: PreviousEngagementMetrics;
}

export interface CompetitorMetadata {
    total: number;
    page: number | null;
    limit: number | null;
    totalPages: number | null;
    hasNextPage: boolean | null;
    hasPrevPage: boolean;
}

export interface TopPerformingCompetitorsResponse {
    message: string;
    status_code: number;
    data: {
        channels: CompetitorChannel[];
        source: string;
        metadata: CompetitorMetadata;
    };
}

export interface TopPerformingCompetitorsParams {
    start_date?: string;
    end_date?: string;
    platform?: 'TIKTOK' | 'INSTAGRAM';
    source?: 'CREATOR' | 'COMPETITOR' | 'Shop-Intel' | 'ALL';
    page?: number;
    limit?: number;
}

// New interfaces for overview metadata
export interface OverviewMetadata {
    total_tracked: number;
    total_views: number;
    total_engagement: number;
    highest_engagement_rate: number;
    avg_engagement_rate: number;
    your_performance_vs_avg: number;
    your_performance_vs_highest: number;
    'Shop-Intel_highest_engagement_rate': number;
    'Shop-Intel_avg_engagement_rate': number;
    filtered_content_count: number;
    date_range: {
        start_date: string;
        end_date: string;
    };
}

export interface OverviewMetadataResponse {
    message: string;
    status_code: number;
    data: {
        source: string;
        overview_metadata: OverviewMetadata;
    };
}

export interface OverviewMetadataParams {
    start_date?: string;
    end_date?: string;
    platform?: 'TIKTOK' | 'INSTAGRAM';
    source?: 'CREATOR' | 'COMPETITOR' | 'Shop-Intel' | 'ALL';
}

// New interfaces for engagement rate comparison
export interface EngagementRateCompetitor {
    id: string;
    name: string;
    engagement_rate: number;
    source: 'CREATOR' | 'COMPETITOR' | 'Shop-Intel';
}

export interface EngagementRateComparisonMetadata {
    total: number;
    source: string;
}

export interface EngagementRateComparisonResponse {
    message: string;
    status_code: number;
    data: {
        engagement_rate_comparison: EngagementRateCompetitor[];
        'Shop-Intel_engagement_rate_comparison': EngagementRateCompetitor[];
        metadata: EngagementRateComparisonMetadata;
    };
}

export interface EngagementRateComparisonParams {
    start_date?: string;
    end_date?: string;
    platform?: 'TIKTOK' | 'INSTAGRAM';
    source?: 'CREATOR' | 'COMPETITOR' | 'Shop-Intel' | 'ALL';
}

// New interfaces for engagement growth trend
export interface EngagementGrowthTrendAverage {
    'Shop-Intel_avg': number;
    competitors_avg: number;
    creator_avg: number;
}

export interface EngagementGrowthTrendHighest {
    'Shop-Intel_highest': number;
    competitors_highest: number;
    creator_highest: number;
}

export interface EngagementGrowthTrendDataPoint {
    date: string;
    avg: EngagementGrowthTrendAverage;
    highest: EngagementGrowthTrendHighest;
}

export interface EngagementGrowthTrendResponse {
    message: string;
    status_code: number;
    data: {
        engagement_growth_trend: EngagementGrowthTrendDataPoint[];
    };
}

export interface EngagementGrowthTrendParams {
    start_date?: string;
    end_date?: string;
    platform?: 'TIKTOK' | 'INSTAGRAM';
}

// New interfaces for competitor content details
export interface ContentMetadata {
    likes: number;
    saves: number;
    views: number;
    shares: number;
    reposts: number;
    comments: number;
    video_id: string;
    last_tracked: string;
    video_length: number;
    forward_count: number;
    whatsapp_shares: number;
    "24h_change_likes": number;
    "24h_change_saves": number;
    "24h_change_views": number;
    "24h_change_shares": number;
    "24h_change_reposts": number;
    "24h_change_comments": number;
    previous_track_likes: number;
    previous_track_saves: number;
    previous_track_views: number;
    previous_track_shares: number;
    previous_track_reposts: number;
    previous_track_comments: number;
    "24h_change_forward_count": number;
    "24h_change_whatsapp_shares": number;
    previous_track_forward_count: number;
    previous_track_whatsapp_shares: number;
}

export interface ContentThumbnail {
    type: string;
    url: string;
}

export interface ContentExplanation {
    explanation: string;
}

export interface ContentCategory {
    category: {
        name: string;
    };
}

export interface ContentChannel {
    id: string;
    name: string;
    platform: string;
    region: string;
    unique_id: string;
    image_url: string;
    categories: ContentCategory[];
}

export interface CompetitorContent {
    id: string;
    video_id: string;
    video_url: string;
    metadata: ContentMetadata;
    title: string;
    description: string;
    summarizer_title: string;
    summarizer_description: string;
    summarizer_explanations: ContentExplanation[];
    thumbnails: ContentThumbnail[];
    created_at: string;
    updated_at: string;
    channel: ContentChannel;
}

export interface CompetitorContentMetadata {
    total: number;
    page: number | null;
    limit: number | null;
    total_pages: number | null;
    has_next: boolean;
    has_previous: boolean;
}

export interface CompetitorContentResponse {
    message: string;
    status_code: number;
    data: {
        contents: CompetitorContent[];
        metadata: CompetitorContentMetadata;
    };
}

export interface CompetitorContentParams {
    channel_id: string;
    page?: number;
    limit?: number;
}

// New interfaces for platform performance split
export interface PlatformPerformance {
    platform: string;
    contents: number;
    engagement_rate: number;
}

export interface PlatformPerformanceSplitResponse {
    message: string;
    status_code: number;
    data: {
        performance_platform_split: PlatformPerformance[];
    };
}

export interface PlatformPerformanceSplitParams {
    start_date?: string;
    end_date?: string;
    platform?: 'TIKTOK' | 'INSTAGRAM';
}

// New interfaces for performance metadata comparison
export interface PerformanceMetadata {
    source: string;
    likes: number;
    saves: number;
    views: number;
    shares: number;
    reposts: number;
}

export interface PerformanceMetadataResponse {
    message: string;
    status_code: number;
    data: {
        performance_metadata: PerformanceMetadata[];
    };
}

export interface PerformanceMetadataParams {
    start_date?: string;
    end_date?: string;
    platform?: 'TIKTOK' | 'INSTAGRAM';
}

// New interfaces for 24h performance changes
export interface PerformanceChange {
    engagement_rate: number;
    percentage_change: number;
    likes: number;
    comments: number;
    shares: number;
    views: number;
}

export interface Performance24hData {
    source: string;
    performance_changes: PerformanceChange[];
}

export interface Performance24hResponse {
    message: string;
    status_code: number;
    data: Performance24hData[];
}

export interface Performance24hParams {
    start_date?: string;
    end_date?: string;
    platform?: 'TIKTOK' | 'INSTAGRAM';
}
