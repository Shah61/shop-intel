import { 
    Marketing, 
    MarketingItem, 
    MarketingLink, 
    MarketingLinkMetadata, 
    MarketingHistoricalDataPoint 
} from "../model/marketing-entity";

// Helper functions
const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number, decimals: number = 2) => 
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

const generateDates = (days: number) => {
  const dates = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString());
  }
  return dates;
};

const generatePastDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const generateFutureDate = (daysFromNow: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
};

// Sample campaign names and descriptions
const campaignTemplates = [
  {
    name: "Summer Collection Launch",
    description: "Promoting our new summer product line across social media platforms"
  },
  {
    name: "Black Friday Mega Sale",
    description: "Major discount campaign for the holiday shopping season"
  },
  {
    name: "Brand Awareness Campaign",
    description: "Building brand recognition through influencer partnerships"
  },
  {
    name: "Product Launch - Smart Watch",
    description: "Targeted ads for our latest smart watch release"
  },
  {
    name: "Valentine's Day Special",
    description: "Romantic gift ideas and special offers for couples"
  },
  {
    name: "Back to School Campaign",
    description: "Student-focused promotions for school supplies and tech"
  },
  {
    name: "Fitness Challenge 2024",
    description: "Health and wellness campaign promoting active lifestyle"
  },
  {
    name: "Eco-Friendly Initiative",
    description: "Sustainable products campaign targeting environmentally conscious consumers"
  },
  {
    name: "Tech Innovation Showcase",
    description: "Highlighting cutting-edge technology and innovation"
  },
  {
    name: "Customer Loyalty Program",
    description: "Retention campaign for existing customers with exclusive benefits"
  }
];

const marketingItemTemplates = [
  {
    name: "Instagram Story Ads",
    description: "Eye-catching story advertisements with call-to-action"
  },
  {
    name: "Facebook Video Campaign",
    description: "Engaging video content showcasing product features"
  },
  {
    name: "TikTok Influencer Collaboration",
    description: "Partnership with trending TikTok creators"
  },
  {
    name: "Google Search Ads",
    description: "Targeted search advertisements for high-intent keywords"
  },
  {
    name: "YouTube Pre-roll Campaign",
    description: "Short video ads before popular YouTube content"
  },
  {
    name: "Twitter Engagement Campaign",
    description: "Interactive tweets and polls to boost engagement"
  },
  {
    name: "LinkedIn Sponsored Content",
    description: "Professional network targeting for B2B audience"
  },
  {
    name: "Pinterest Visual Campaign",
    description: "High-quality pins showcasing products in lifestyle context"
  },
  {
    name: "Snapchat AR Filter",
    description: "Interactive augmented reality experience"
  },
  {
    name: "Retargeting Campaign",
    description: "Re-engaging visitors who didn't complete purchase"
  }
];

// Generate mock metadata for different platforms
const generateTikTokMetadata = (): MarketingLinkMetadata => ({
  likes: randomBetween(1000, 50000),
  saves: randomBetween(100, 5000),
  views: randomBetween(10000, 500000),
  shares: randomBetween(50, 2000),
  reposts: randomBetween(20, 800),
  comments: randomBetween(100, 3000),
  video_id: `tiktok_${randomBetween(1000000, 9999999)}`,
  author_id: `user_${randomBetween(10000, 99999)}`,
  downloads: randomBetween(10, 500),
  create_time: Date.now() - randomBetween(1, 30) * 24 * 60 * 60 * 1000,
  description: "Viral content showcasing our latest products",
  video_length: randomBetween(15, 60),
  forward_count: randomBetween(5, 200),
  author_nickname: `Influencer${randomBetween(1, 100)}`,
  whatsapp_shares: randomBetween(10, 300),
  "24h_change_likes": randomFloat(-5, 15, 1),
  "24h_change_views": randomFloat(-2, 25, 1),
  "24h_change_shares": randomFloat(-10, 20, 1),
  previous_track_likes: randomBetween(800, 45000),
  previous_track_views: randomBetween(8000, 450000),
  last_tracked: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
});

const generateTwitterMetadata = (): MarketingLinkMetadata => ({
  likes: randomBetween(50, 5000),
  replies: randomBetween(10, 500),
  retweets: randomBetween(20, 1000),
  bookmarks: randomBetween(5, 300),
  quote_tweets: randomBetween(2, 100),
  views: randomBetween(1000, 100000),
  image_url: `https://picsum.photos/800/600?random=${randomBetween(1, 1000)}`,
  "24h_change_likes": randomFloat(-3, 12, 1),
  "24h_change_retweets": randomFloat(-5, 18, 1),
  "24h_change_replies": randomFloat(-2, 8, 1),
  previous_track_likes: randomBetween(40, 4500),
  previous_track_retweets: randomBetween(15, 900),
  last_tracked: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
});

const generateFacebookMetadata = (): MarketingLinkMetadata => ({
  likes: randomBetween(100, 10000),
  shares: randomBetween(20, 1500),
  comments: randomBetween(50, 2000),
  views: randomBetween(2000, 200000),
  "24h_change_likes": randomFloat(-2, 15, 1),
  "24h_change_shares": randomFloat(-8, 12, 1),
  "24h_change_comments": randomFloat(-5, 10, 1),
  previous_track_likes: randomBetween(90, 9500),
  previous_track_shares: randomBetween(18, 1400),
  last_tracked: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
});

const generateGenericMetadata = (): MarketingLinkMetadata => ({
  views: randomBetween(500, 50000),
  likes: randomBetween(25, 2500),
  shares: randomBetween(5, 500),
  comments: randomBetween(10, 800),
  "24h_change_views": randomFloat(-3, 20, 1),
  "24h_change_likes": randomFloat(-5, 12, 1),
  previous_track_views: randomBetween(450, 47000),
  previous_track_likes: randomBetween(20, 2300),
  last_tracked: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
});

// Generate marketing links
const generateMarketingLinks = (itemId: string, platforms: Array<'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'GOOGLE' | 'TWITTER' | 'OTHER'>): MarketingLink[] => {
  return platforms.map((platform, index) => {
    let metadata: MarketingLinkMetadata;
    
    switch (platform) {
      case 'TIKTOK':
        metadata = generateTikTokMetadata();
        break;
      case 'TWITTER':
        metadata = generateTwitterMetadata();
        break;
      case 'FACEBOOK':
      case 'INSTAGRAM':
        metadata = generateFacebookMetadata();
        break;
      default:
        metadata = generateGenericMetadata();
    }

    const baseUrls = {
      FACEBOOK: 'https://facebook.com/posts/',
      INSTAGRAM: 'https://instagram.com/p/',
      TIKTOK: 'https://tiktok.com/@user/video/',
      YOUTUBE: 'https://youtube.com/watch?v=',
      GOOGLE: 'https://ads.google.com/campaign/',
      TWITTER: 'https://twitter.com/user/status/',
      OTHER: 'https://example.com/campaign/'
    };

    return {
      id: `link_${itemId}_${index + 1}`,
      link: `${baseUrls[platform]}${randomBetween(1000000, 9999999)}`,
      platform,
      marketing_item_id: itemId,
      metadata,
      created_at: generatePastDate(randomBetween(1, 30)),
      updated_at: generatePastDate(randomBetween(0, 5))
    };
  });
};

// Generate marketing items
const generateMarketingItems = (marketingId: string, count: number = 3): MarketingItem[] => {
  return Array.from({ length: count }, (_, index) => {
    const template = marketingItemTemplates[index % marketingItemTemplates.length];
    const startDate = generatePastDate(randomBetween(5, 45));
    const duration = randomBetween(7, 90);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);
    
    const platforms: Array<'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'GOOGLE' | 'TWITTER' | 'OTHER'> = [];
    
    // Randomly assign 1-3 platforms per item
    const allPlatforms: Array<'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'GOOGLE' | 'TWITTER' | 'OTHER'> = 
      ['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'GOOGLE', 'TWITTER', 'OTHER'];
    
    const platformCount = randomBetween(1, 3);
    const shuffled = [...allPlatforms].sort(() => Math.random() - 0.5);
    platforms.push(...shuffled.slice(0, platformCount));

    const itemId = `item_${marketingId}_${index + 1}`;
    const cost = randomBetween(500, 15000);

    const item: MarketingItem = {
      id: itemId,
      name: template.name,
      description: template.description,
      cost,
      duration,
      start_date: startDate,
      end_date: endDate.toISOString(),
      marketing_id: marketingId,
      created_at: generatePastDate(randomBetween(50, 100)),
      updated_at: generatePastDate(randomBetween(0, 10)),
      marketing: {} as Marketing, // Will be populated later
      marketing_links: generateMarketingLinks(itemId, platforms)
    };

    return item;
  });
};

// Generate marketing campaigns
export const generateMarketingCampaigns = (count: number = 10): Marketing[] => {
  return Array.from({ length: count }, (_, index) => {
    const template = campaignTemplates[index % campaignTemplates.length];
    const marketingId = `campaign_${index + 1}`;
    const items = generateMarketingItems(marketingId, randomBetween(2, 5));
    const totalCost = items.reduce((sum, item) => sum + item.cost, 0);

    const marketing: Marketing = {
      id: marketingId,
      name: template.name,
      total_cost: totalCost,
      created_at: generatePastDate(randomBetween(60, 120)),
      updated_at: generatePastDate(randomBetween(0, 15)),
      marketing_items: items
    };

    // Update the marketing reference in items
    items.forEach(item => {
      item.marketing = marketing;
    });

    return marketing;
  });
};

// Generate marketing items list (flattened from campaigns)
export const generateMarketingItemsList = (): MarketingItem[] => {
  const campaigns = generateMarketingCampaigns(8);
  const allItems: MarketingItem[] = [];
  
  campaigns.forEach(campaign => {
    campaign.marketing_items.forEach(item => {
      allItems.push({
        ...item,
        marketing: campaign
      });
    });
  });
  
  return allItems;
};

// Generate historical data for charts
export const generateMarketingHistoricalData = (startDate: string, endDate: string): MarketingHistoricalDataPoint[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const data: MarketingHistoricalDataPoint[] = [];
  
  const current = new Date(start);
  while (current <= end) {
    // Generate weekly data points
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    if (weekEnd > end) {
      weekEnd.setTime(end.getTime());
    }
    
    data.push({
      start_date: current.toISOString().split('T')[0],
      end_date: weekEnd.toISOString().split('T')[0],
      value: randomBetween(5000, 25000) // Marketing spend/performance value
    });
    
    current.setDate(current.getDate() + 7);
  }
  
  return data;
};

// Platform performance data
export const generatePlatformPerformanceData = () => {
  const platforms = ['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'GOOGLE', 'TWITTER', 'OTHER'];
  
  return platforms.map(platform => ({
    platform,
    total_spend: randomBetween(10000, 100000),
    total_campaigns: randomBetween(5, 25),
    avg_engagement_rate: randomFloat(2.5, 8.5),
    total_reach: randomBetween(50000, 500000),
    conversion_rate: randomFloat(1.2, 6.8),
    cost_per_click: randomFloat(0.50, 3.50),
    return_on_ad_spend: randomFloat(2.5, 8.0)
  }));
};

// Campaign performance over time
export const generateCampaignPerformanceData = (campaignId: string) => {
  const dates = generateDates(30);
  
  return dates.map(date => ({
    date: date.split('T')[0],
    spend: randomBetween(200, 2000),
    impressions: randomBetween(5000, 50000),
    clicks: randomBetween(100, 2000),
    conversions: randomBetween(5, 100),
    engagement_rate: randomFloat(2.0, 8.0),
    ctr: randomFloat(0.5, 5.0), // click-through rate
    cpc: randomFloat(0.30, 2.50), // cost per click
    cpm: randomFloat(5.0, 25.0) // cost per mille
  }));
};

// Top performing content
export const generateTopPerformingContent = () => {
  const contentTypes = [
    { type: 'Video', platform: 'TIKTOK' },
    { type: 'Carousel', platform: 'INSTAGRAM' },
    { type: 'Single Image', platform: 'FACEBOOK' },
    { type: 'Story', platform: 'INSTAGRAM' },
    { type: 'Pre-roll Ad', platform: 'YOUTUBE' },
    { type: 'Tweet', platform: 'TWITTER' },
    { type: 'Search Ad', platform: 'GOOGLE' },
    { type: 'Reel', platform: 'INSTAGRAM' }
  ];
  
  return contentTypes.map((content, index) => ({
    id: `content_${index + 1}`,
    title: `${content.type} - Campaign ${index + 1}`,
    platform: content.platform,
    content_type: content.type,
    engagement_rate: randomFloat(3.0, 12.0),
    reach: randomBetween(10000, 200000),
    impressions: randomBetween(15000, 300000),
    clicks: randomBetween(500, 15000),
    shares: randomBetween(50, 2000),
    saves: randomBetween(20, 1500),
    comments: randomBetween(100, 5000),
    spend: randomBetween(500, 5000),
    roas: randomFloat(2.0, 12.0), // return on ad spend
    created_at: generatePastDate(randomBetween(1, 60))
  }));
};

// Monthly budget allocation
export const generateMonthlyBudgetData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return months.map(month => ({
    month,
    allocated_budget: randomBetween(15000, 50000),
    spent_budget: randomBetween(12000, 45000),
    campaigns_count: randomBetween(3, 12),
    avg_cpa: randomFloat(15.0, 45.0), // cost per acquisition
    total_conversions: randomBetween(200, 800)
  }));
};
