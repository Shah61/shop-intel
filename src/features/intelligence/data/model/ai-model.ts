export enum Category {
    ASSISTANT = "ASSISTANT",
    TREND = "TREND",
    CONTENT = "CONTENT"
}

export interface Room {
    id: string;
    name: string;
    category: string;
    created_at: string;
    updated_at: string;
    chats?: Chat[];
}

export interface RoomHistory {
    message: string;
    data: {
        rooms: Room[];
        metadata: {
            total: number;
            page: number;
            limit: number;
        } 
    }
}

export interface Chat {
    id: string;
    message: string;
    role: 'USER' | 'ASSISTANT';
    room_id: string;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    type?: 'text' | 'suggestion';
}

export interface RoomResponse {
    message: string;
    data: {
        room: Room;
    }
}

export interface CreateRoomResponse {
    message: string;
    data: {
        rooms: Room;
    }
}

export interface ChatResponse {
    message: string;
    data: {
        chats: Chat[];
        metadata: {
            total: number;
            page: number;
            limit: number;
        }
    }
}

export interface BeautySkincareMusic {
    CONTENT_TYPE: string;
    DESCRIPTION: string;
    HASHTAG: string;
    MOOD: string;
    PLATFORM: string;
    TITLE: string;
    URL: string;
}

export interface ContentCreationTip {
    DESCRIPTION: string;
    PLATFORMS: string;
    TITLE: string;
}

export interface DatabaseInfo {
    last_updated: string;
    note: string;
    source: string;
}

export interface InstagramMusic {
    DESCRIPTION: string;
    PLATFORM: string;
    TITLE: string;
    URL: string;
}

export interface TikTokMusic {
    DESCRIPTION: string;
    HASHTAG?: string;
    TITLE: string;
    URL: string;
}

export interface TrendingSound {
    DESCRIPTION: string;
    PLATFORM: string;
    TITLE: string;
    URL: string;
}

export interface ViralSong {
    DESCRIPTION: string;
    GENRE: string;
    HASHTAG: string;
    PLATFORM: string;
    TITLE: string;
    URL: string;
    VIEWS_PLAYS: string;
}

export interface MusicTrend {
    database_info: DatabaseInfo;
    month: string;
    viral_songs: ViralSong[];
    week: string;
}

export interface SkincareTrend {
    DESCRIPTION: string;
    TITLE: string;
    URL: string;
}

export interface TrendingItem {
    DESCRIPTION: string;
    PLATFORM: string;
    TITLE: string;
    URL: string;
}

export interface TrendingMusic {
    PLATFORM: string;
    TITLE: string;
    URL: string;
}

export interface CurrentTrend {
    database_info: DatabaseInfo;
    month: string;
    skincare_trends: SkincareTrend[];
    trending_music: TrendingMusic[];
    trends: TrendingItem[];
}

export enum CreateChatContentCategories {
    HOOK = "HOOK",
    STORYBOARD = "STORYBOARD",
    CTA = "CTA"    
}

export interface BubbleTopKeyword {
    id: string;
    keyword: string;
    count: number;
    total_mention: number;
    parent_id: string | null;
    created_at: string;
    updated_at: string;
    category: string;
    region: string | null;
    children: BubbleTopKeyword[];
  }
  
  export interface BubbleTopKeywordsMetadata {
    total: number;
  }
  
  export interface BubbleTopKeywordsResponse {
    message: string;
    status_code: number;
    data: {
      bubbles: BubbleTopKeyword[];
      metadata: BubbleTopKeywordsMetadata;
    };
  }
  
  
  // Keyword Interface
  export interface Keyword {
    id: string;
    keyword: string;
    count: number;
    total_mention: number;
    parent_id: string | null;
    created_at: string;
    updated_at: string;
    category: string;
    children: Keyword[];
  }


  export interface Channel {
    name: string;
    region: string;
  }
  
  export interface Content {
    id: string;
    video_url: string;
    thumbnail: string;
    title: string;
    created_at: string;
    channel?: Channel;
  }
// Top Mentions Interfaces
export interface Channel {
    name: string;
    region: string;
  }
  
  export interface Content {
    id: string;
    video_url: string;
    thumbnail: string;
    title: string;
    created_at: string;
    channel?: Channel;
  }
  
  export interface TopMentionChild {
    id: string;
    keyword: string;
    count: number;
    total_mention: number;
    parent_id: string;
    contents: Content[];
  }
  
  export interface TopMention {
    id: string;
    keyword: string;
    count: number;
    total_mention: number;
    parent_id: string | null;
    created_at: string;
    updated_at: string;
    category: string;
    region: string | null;
    children: TopMentionChild[];
    contents: Content[];
  }
  
  // Top Mentions Response Data Interface
  export interface PersonalBeautyTopMentionsData {
    top_mentions: TopMention[];
    metadata?: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  }
  
  // Top Mentions API Response Interface
  export interface PersonalBeautyTopMentionsResponse {
    message: string;
    status_code: number;
    data: PersonalBeautyTopMentionsData;
  }

export interface TikTokMusicTrend {
    count: number;
    filters: {
        end_date: string;
        popularity_included: boolean;
        region: string;
        start_date: string;
    };
    songs: TikTokSong[];
    success: boolean;
}

export interface TikTokSong {
    artist_name: string;
    country_code: string;
    cover_image_url: string;
    created_at: string;
    current_rank: number;
    popularity_trend: PopularityTrendPoint[];
    song_duration_seconds: number;
    song_title: string;
    tiktok_music_link: string;
}

export interface PopularityTrendPoint {
    date: string;
    popularity_score: number;
}
  
  