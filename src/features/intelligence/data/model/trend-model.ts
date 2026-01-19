// Content Metadata API Models
export interface VideoMetadata {
  likes: number;
  saves: number;
  views: number;
  shares: number;
  reposts: number;
  comments: number;
  video_id: string;
  "7d_change": number;
  "24h_change": number;
  "30d_change": number;
  "90d_change": number;
  "180d_change": number;
  "365d_change": number;
  video_length: number;
  forward_count: number;
  all_time_change: number;
  whatsapp_shares: number;
  all_time_change_percentage: number;
}

export interface Thumbnail {
  type: "DEFAULT" | "MEDIUM" | "HIGH" | "STANDARD" | "MAXRES";
  url: string;
}

export interface ContentCategory {
  category: {
    name: string;
  };
}

export interface ContentChannel {
  id: string;
  name: string;
  platform: "INSTAGRAM" | "TIKTOK" | "YOUTUBE";
  region: string;
  unique_id: string;
  image_url: string;
  categories: ContentCategory[];
}

export interface ContentItem {
  id: string;
  video_id: string;
  video_url: string;
  metadata: VideoMetadata;
  title: string;
  description: string;
  summarizer_title: string;
  summarizer_description: string;
  summarizer_explanations: string[];
  thumbnails: Thumbnail[];
  created_at: string;
  updated_at: string;
  channel: ContentChannel;
}

export interface ContentMetadata {
  total: number;
  page: number | null;
  limit: number | null;
  total_pages: number | null;
  has_next: boolean;
  has_previous: boolean;
}

export interface ContentResponse {
  message: string;
  status_code: number;
  data: {
    contents: ContentItem[];
    metadata: ContentMetadata;
  };
}

export interface ContentParams {
  platform?: "INSTAGRAM" | "TIKTOK" | "YOUTUBE";
  type?: "LIKE" | "COMMENT" | "SHARE" | "VIEW" | "24H_CHANGE";
  region?: string;
  page?: number;
  limit?: number;
}

// Channels API Models
export interface ChannelCategory {
  category: {
    name: string;
  };
}

export interface ChannelSummaryMetadata {
  total_likes: number;
  total_comments: number;
  total_views: number;
  total_shares: number;
  total_saves: number;
  total_reposts: number;
  total_forward_count: number;
  total_whatsapp_shares: number;
  total_24h_change: number;
  content_count: number;
}

export interface Channel {
  id: string;
  name: string;
  unique_id: string;
  image_url: string;
  channel_url: string;
  platform: "INSTAGRAM" | "TIKTOK" | "YOUTUBE";
  region: string;
  created_at: string;
  updated_at: string;
  categories: ChannelCategory[];
  summary_metadata: ChannelSummaryMetadata;
}

export interface ChannelsMetadata {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface ChannelsResponse {
  message: string;
  data: {
    channels: Channel[];
    metadata: ChannelsMetadata;
  };
}

export interface ChannelsParams {
  platform?: "INSTAGRAM" | "TIKTOK" | "YOUTUBE";
  type?: "LIKE" | "COMMENT" | "SHARE" | "VIEW" | "24H_CHANGE";
  region?: string;
  page?: number;
  limit?: number;
}

// Search API Models
export interface SearchTotalResults {
  contents: number;
  channels: number;
}

export interface SearchResults {
  contents: ContentItem[];
  channels: Channel[];
}

export interface SearchSummary {
  content_matches: number;
  channel_matches: number;
}

export interface SearchContents {
  search_term: string;
  total_results: SearchTotalResults;
  results: SearchResults;
  summary: SearchSummary;
}

export interface SearchResponse {
  message: string;
  data: {
    contents: SearchContents;
  };
}

export interface SearchParams {
  query: string;
  platform?: "INSTAGRAM" | "TIKTOK" | "YOUTUBE";
  region?: string;
  page?: number;
  limit?: number;
}

// Top Contents API Models
export interface TopContentsMetadata {
  likes: number;
  views: number;
  comments: number;
  video_id: string;
  last_tracked: string;
  video_length: number;
  "24h_change_likes": number;
  "24h_change_views": number;
  "24h_change_comments": number;
  previous_track_likes: number;
  previous_track_views: number;
  previous_track_comments: number;
}

export interface TopContentsCategory {
  category: {
    name: string;
  };
}

export interface TopContentsChannel {
  id: string;
  name: string;
  platform: "INSTAGRAM" | "TIKTOK" | "YOUTUBE";
  region: string;
  unique_id: string;
  image_url: string;
  categories: TopContentsCategory[];
}

export interface TopContentsItem {
  id: string;
  video_id: string;
  video_url: string;
  metadata: TopContentsMetadata;
  title: string;
  description: string;
  summarizer_title: string;
  summarizer_description: string;
  summarizer_explanations: Array<{
    explanation: string;
  }>;
  thumbnails: Thumbnail[];
  created_at: string;
  updated_at: string;
  channel: TopContentsChannel;
}

export interface TopContentsData {
  total: number;
  contents: TopContentsItem[];
}

export interface TopContentsResponse {
  message: string;
  data: {
    contents: TopContentsData;
  };
}

export interface TopContentsParams {
  platform?: "INSTAGRAM" | "TIKTOK" | "YOUTUBE";
  type?: "LIKE" | "COMMENT" | "SHARE" | "VIEW" | "24H_CHANGE";
  region?: string;
  page?: number;
  limit?: number;
}
