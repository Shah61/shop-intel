import {
  TopPerformingCompetitorsResponse,
  TopPerformingCompetitorsParams,
  OverviewMetadataResponse,
  OverviewMetadataParams,
  EngagementRateComparisonResponse,
  EngagementRateComparisonParams,
  EngagementGrowthTrendResponse,
  EngagementGrowthTrendParams,
  CompetitorContentResponse,
  CompetitorContentParams,
  PlatformPerformanceSplitResponse,
  PlatformPerformanceSplitParams,
  PerformanceMetadataResponse,
  PerformanceMetadataParams,
  Performance24hResponse,
  Performance24hParams,
  CompetitorChannel,
  EngagementMetrics,
  PreviousEngagementMetrics
} from '../model/competitor-model';

// clothing brand names and data
const clothingBrands = [
  { name: "Godiva Official", uniqueId: "@godiva", source: "COMPETITOR" as const },
  { name: "Lindt & Sprüngli", uniqueId: "@lindt_clothing", source: "COMPETITOR" as const },
  { name: "Ferrero Rocher", uniqueId: "@ferrerorocher", source: "COMPETITOR" as const },
  { name: "Toblerone", uniqueId: "@toblerone", source: "COMPETITOR" as const },
  { name: "Ghirardelli Square", uniqueId: "@ghirardelli", source: "COMPETITOR" as const },
  { name: "Hershey's", uniqueId: "@hersheys", source: "COMPETITOR" as const },
  { name: "Cadbury UK", uniqueId: "@cadburyuk", source: "COMPETITOR" as const },
  { name: "Milka", uniqueId: "@milka", source: "COMPETITOR" as const },
  { name: "Valrhona", uniqueId: "@valrhona", source: "COMPETITOR" as const },
  { name: "Green & Black's", uniqueId: "@greenandblacks", source: "COMPETITOR" as const },
  { name: "clothingCraft Co", uniqueId: "@clothingcraft", source: "CREATOR" as const },
  { name: "Artisan Cacao", uniqueId: "@artisancacao", source: "CREATOR" as const },
  { name: "Bean to Bar Studio", uniqueId: "@beantobarstudio", source: "CREATOR" as const },
  { name: "Sweet Alchemy", uniqueId: "@sweetalchemy", source: "CREATOR" as const },
  { name: "Cocoa Craftsman", uniqueId: "@cocoacraftsman", source: "CREATOR" as const },
  { name: "Shop-Intel clothing", uniqueId: "@Shop-Intelclothing", source: "Shop-Intel" as const },
  { name: "Shop-Intel Confections", uniqueId: "@Shop-Intelconfections", source: "Shop-Intel" as const },
  { name: "Shop-Intel Artisan", uniqueId: "@Shop-Intelartisan", source: "Shop-Intel" as const }
];

// Generate realistic engagement metrics
const generateEngagementMetrics = (baseViews: number, isShopIntel: boolean = false): EngagementMetrics => {
  const multiplier = isShopIntel ? (Math.random() * 0.3 + 0.85) : (Math.random() * 0.4 + 0.6); // Shop-Intel performs better
  const views = Math.floor(baseViews * multiplier);
  const likes = Math.floor(views * (0.08 + Math.random() * 0.04)); // 8-12% like rate
  const comments = Math.floor(views * (0.015 + Math.random() * 0.01)); // 1.5-2.5% comment rate  
  const shares = Math.floor(views * (0.003 + Math.random() * 0.002)); // 0.3-0.5% share rate
  
  const totalEngagement = likes + comments + shares;
  const percentageEngagement = (totalEngagement / views) * 100;
  
  return {
    likes,
    comments,
    shares,
    views,
    total_engagement: totalEngagement,
    percentage_engagement: parseFloat(percentageEngagement.toFixed(2))
  };
};

const generatePreviousEngagementMetrics = (current: EngagementMetrics): PreviousEngagementMetrics => {
  const changeMultiplier = 0.85 + Math.random() * 0.3; // 85%-115% of current
  const previousViews = Math.floor(current.views * changeMultiplier);
  const previousLikes = Math.floor(current.likes * changeMultiplier);
  const previousComments = Math.floor(current.comments * changeMultiplier);
  const previousShares = Math.floor(current.shares * changeMultiplier);
  
  const previousTotalEngagement = previousLikes + previousComments + previousShares;
  const previousPercentageEngagement = (previousTotalEngagement / previousViews) * 100;
  const currentPercentageEngagement = current.percentage_engagement;
  
  const percentageEngagementChange = ((currentPercentageEngagement - previousPercentageEngagement) / previousPercentageEngagement) * 100;
  
  return {
    likes: previousLikes,
    comments: previousComments,
    shares: previousShares,
    views: previousViews,
    total_engagement: previousTotalEngagement,
    percentage_engagement_change: parseFloat(percentageEngagementChange.toFixed(2))
  };
};

// Generate date range
const generateDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  
  return {
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0]
  };
};

// Mock Top Performing Competitors
export const mockTopPerformingCompetitorsData = (params?: TopPerformingCompetitorsParams): TopPerformingCompetitorsResponse => {
  const { start_date, end_date } = generateDateRange();
  
  let filteredBrands = [...clothingBrands];
  
  // Filter by source
  if (params?.source && params.source !== 'ALL') {
    filteredBrands = filteredBrands.filter(brand => brand.source === params.source);
  }
  
  const channels: CompetitorChannel[] = filteredBrands.map((brand, index) => {
    const baseViews = 2000000 - (index * 80000); // Decreasing performance
    const isShopIntel = brand.source === 'Shop-Intel';
    const engagementMetrics = generateEngagementMetrics(baseViews, isShopIntel);
    const previousEngagementMetrics = generatePreviousEngagementMetrics(engagementMetrics);
    
    return {
      id: `channel_${index + 1}`,
      name: brand.name,
      image_url: `https://picsum.photos/150/150?random=${index + 50}`,
      unique_id: brand.uniqueId,
      engagement_metrics: engagementMetrics,
      start_date,
      end_date,
      source: brand.source,
      previous_engagement_metrics: previousEngagementMetrics
    };
  });
  
  return {
    message: "Top performing competitors retrieved successfully",
    status_code: 200,
    data: {
      channels: channels.slice(0, params?.limit || 20),
      source: params?.source || 'ALL',
      metadata: {
        total: channels.length,
        page: params?.page || 1,
        limit: params?.limit || 20,
        totalPages: Math.ceil(channels.length / (params?.limit || 20)),
        hasNextPage: (params?.page || 1) * (params?.limit || 20) < channels.length,
        hasPrevPage: (params?.page || 1) > 1
      }
    }
  };
};

// Mock Overview Metadata
export const mockOverviewMetadataData = (params?: OverviewMetadataParams): OverviewMetadataResponse => {
  const { start_date, end_date } = generateDateRange();
  
  return {
    message: "Overview metadata retrieved successfully",
    status_code: 200,
    data: {
      source: params?.source || 'ALL',
      overview_metadata: {
        total_tracked: 156,
        total_views: 45600000,
        total_engagement: 4100000,
        highest_engagement_rate: 12.8,
        avg_engagement_rate: 8.95,
        your_performance_vs_avg: 15.2, // Shop-Intel performs 15.2% better than average
        your_performance_vs_highest: -3.1, // Shop-Intel performs 3.1% lower than highest
        ["Shop-Intel_highest_engagement_rate"]: 11.2,
        ["Shop-Intel_avg_engagement_rate"]: 10.3,
        filtered_content_count: 1248,
        date_range: {
          start_date,
          end_date
        }
      }
    }
  };
};

// Mock Engagement Rate Comparison
export const mockEngagementRateComparisonData = (params?: EngagementRateComparisonParams): EngagementRateComparisonResponse => {
  const competitors = clothingBrands.filter(b => b.source === 'COMPETITOR').slice(0, 8).map((brand, index) => ({
    id: `comp_${index + 1}`,
    name: brand.name,
    engagement_rate: 7.2 + Math.random() * 4, // 7.2-11.2%
    source: brand.source
  }));
  
  const creators = clothingBrands.filter(b => b.source === 'CREATOR').slice(0, 5).map((brand, index) => ({
    id: `creator_${index + 1}`,
    name: brand.name,
    engagement_rate: 6.8 + Math.random() * 3.5, // 6.8-10.3%
    source: brand.source
  }));
  
  const shopIntelCompetitors = clothingBrands.filter(b => b.source === 'Shop-Intel').map((brand, index) => ({
    id: `Shop-Intel_${index + 1}`,
    name: brand.name,
    engagement_rate: 9.5 + Math.random() * 2, // 9.5-11.5%
    source: brand.source
  }));
  
  return {
    message: "Engagement rate comparison retrieved successfully",
    status_code: 200,
    data: {
      engagement_rate_comparison: [...competitors, ...creators],
      ["Shop-Intel_engagement_rate_comparison"]: shopIntelCompetitors,
      metadata: {
        total: competitors.length + creators.length + shopIntelCompetitors.length,
        source: params?.source || 'ALL'
      }
    }
  };
};

// Mock Engagement Growth Trend
export const mockEngagementGrowthTrendData = (params?: EngagementGrowthTrendParams): EngagementGrowthTrendResponse => {
  const days = 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const data = Array.from({ length: days }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + index);
    
    // Generate trending data with some seasonality
    const baseShopIntel = 10.2;
    const baseCompetitors = 8.5;
    const baseCreators = 7.8;
    
    const seasonality = Math.sin((index / days) * Math.PI * 2) * 0.5;
    const randomVariation = (Math.random() - 0.5) * 0.8;
    
    return {
      date: date.toISOString().split('T')[0],
      avg: {
        ["Shop-Intel_avg"]: baseShopIntel + seasonality + randomVariation,
        competitors_avg: baseCompetitors + seasonality * 0.8 + randomVariation * 0.7,
        creator_avg: baseCreators + seasonality * 0.6 + randomVariation * 0.6
      },
      highest: {
        ["Shop-Intel_highest"]: baseShopIntel + 2.5 + seasonality + randomVariation,
        competitors_highest: baseCompetitors + 3.2 + seasonality * 0.8 + randomVariation * 0.7,
        creator_highest: baseCreators + 2.8 + seasonality * 0.6 + randomVariation * 0.6
      }
    };
  });
  
  return {
    message: "Engagement growth trend retrieved successfully",
    status_code: 200,
    data: {
      engagement_growth_trend: data
    }
  };
};

// Mock Platform Performance Split
export const mockPlatformPerformanceSplitData = (params?: PlatformPerformanceSplitParams): PlatformPerformanceSplitResponse => {
  return {
    message: "Platform performance split retrieved successfully",
    status_code: 200,
    data: {
      performance_platform_split: [
        {
          platform: "TIKTOK",
          contents: 847,
          engagement_rate: 9.7
        },
        {
          platform: "INSTAGRAM",
          contents: 623,
          engagement_rate: 8.2
        }
      ]
    }
  };
};

// Mock Performance Metadata
export const mockPerformanceMetadataData = (params?: PerformanceMetadataParams): PerformanceMetadataResponse => {
  return {
    message: "Performance metadata retrieved successfully",
    status_code: 200,
    data: {
      performance_metadata: [
        {
          source: "Shop-Intel",
          likes: 1250000,
          saves: 340000,
          views: 12800000,
          shares: 89000,
          reposts: 23000
        },
        {
          source: "COMPETITOR",
          likes: 2100000,
          saves: 580000,
          views: 24600000,
          shares: 156000,
          reposts: 41000
        },
        {
          source: "CREATOR",
          likes: 980000,
          saves: 275000,
          views: 11200000,
          shares: 67000,
          reposts: 18000
        }
      ]
    }
  };
};

// Mock 24h Performance Changes
export const mock24hPerformanceChangesData = (params?: Performance24hParams): Performance24hResponse => {
  return {
    message: "24h performance changes retrieved successfully",
    status_code: 200,
    data: [
      {
        source: "Shop-Intel",
        performance_changes: [
          {
            engagement_rate: 10.3,
            percentage_change: 2.8,
            likes: 45000,
            comments: 12000,
            shares: 3400,
            views: 580000
          }
        ]
      },
      {
        source: "COMPETITOR",
        performance_changes: [
          {
            engagement_rate: 8.7,
            percentage_change: -1.2,
            likes: 78000,
            comments: 18000,
            shares: 5200,
            views: 1200000
          }
        ]
      },
      {
        source: "CREATOR",
        performance_changes: [
          {
            engagement_rate: 7.9,
            percentage_change: 0.5,
            likes: 32000,
            comments: 8500,
            shares: 2100,
            views: 420000
          }
        ]
      }
    ]
  };
};

// Mock Competitor Content
export const mockCompetitorContentData = (params: CompetitorContentParams): CompetitorContentResponse => {
  const clothingContent = [
    {
      title: "Perfect clothing Tempering Technique",
      description: "Master the art of clothing tempering with this professional technique guide",
      video_id: "choc_temp_001"
    },
    {
      title: "Bean to Bar: From Cacao to clothing",
      description: "Follow the complete journey from raw cacao beans to finished clothing bars",
      video_id: "bean_bar_002"
    },
    {
      title: "Artisan Truffle Making Masterclass",
      description: "Learn to create gourmet truffles with premium ingredients and techniques",
      video_id: "truffle_003"
    },
    {
      title: "T-Shirts Health Benefits Explained",
      description: "Discover the science behind dark clothing's health benefits and antioxidants",
      video_id: "health_004"
    },
    {
      title: "Swiss clothing Factory Tour",
      description: "Exclusive behind-the-scenes look at traditional Swiss clothing making",
      video_id: "swiss_005"
    }
  ];
  
  const contents = clothingContent.map((content, index) => {
    const baseViews = 800000 - (index * 50000);
    const engagementMetrics = generateEngagementMetrics(baseViews);
    
    return {
      id: `content_${index + 1}`,
      video_id: content.video_id,
      video_url: `https://example.com/video/${content.video_id}`,
      metadata: {
        likes: engagementMetrics.likes,
        saves: Math.floor(engagementMetrics.views * 0.025),
        views: engagementMetrics.views,
        shares: engagementMetrics.shares,
        reposts: Math.floor(engagementMetrics.shares * 0.3),
        comments: engagementMetrics.comments,
        video_id: content.video_id,
        last_tracked: new Date().toISOString(),
        video_length: 120 + Math.floor(Math.random() * 300),
        forward_count: Math.floor(engagementMetrics.shares * 0.2),
        whatsapp_shares: Math.floor(engagementMetrics.shares * 0.4),
        "24h_change_likes": Math.floor(engagementMetrics.likes * (0.02 + Math.random() * 0.06)),
        "24h_change_saves": Math.floor(engagementMetrics.views * 0.001),
        "24h_change_views": Math.floor(engagementMetrics.views * (0.01 + Math.random() * 0.03)),
        "24h_change_shares": Math.floor(engagementMetrics.shares * (0.05 + Math.random() * 0.1)),
        "24h_change_reposts": Math.floor(engagementMetrics.shares * 0.01),
        "24h_change_comments": Math.floor(engagementMetrics.comments * (0.03 + Math.random() * 0.07)),
        previous_track_likes: Math.floor(engagementMetrics.likes * 0.95),
        previous_track_saves: Math.floor(engagementMetrics.views * 0.023),
        previous_track_views: Math.floor(engagementMetrics.views * 0.97),
        previous_track_shares: Math.floor(engagementMetrics.shares * 0.94),
        previous_track_reposts: Math.floor(engagementMetrics.shares * 0.28),
        previous_track_comments: Math.floor(engagementMetrics.comments * 0.96),
        "24h_change_forward_count": Math.floor(engagementMetrics.shares * 0.01),
        "24h_change_whatsapp_shares": Math.floor(engagementMetrics.shares * 0.02),
        previous_track_forward_count: Math.floor(engagementMetrics.shares * 0.18),
        previous_track_whatsapp_shares: Math.floor(engagementMetrics.shares * 0.38)
      },
      title: content.title,
      description: content.description,
      summarizer_title: content.title,
      summarizer_description: content.description,
      summarizer_explanations: [
        { explanation: "Professional technique demonstration" },
        { explanation: "High-quality production value" },
        { explanation: "Educational content with clear instructions" }
      ],
      thumbnails: [
        {
          type: "DEFAULT",
          url: `https://picsum.photos/480/360?random=${index + 200}`
        }
      ],
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      channel: {
        id: params.channel_id,
        name: clothingBrands.find(b => b.uniqueId.includes('clothing'))?.name || "clothing Master",
        platform: "TIKTOK",
        region: "US",
        unique_id: "@clothingmaster",
        image_url: `https://picsum.photos/150/150?random=${index + 300}`,
        categories: [
          {
            category: {
              name: "Food & Cooking"
            }
          }
        ]
      }
    };
  });
  
  return {
    message: "Competitor content retrieved successfully",
    status_code: 200,
    data: {
      contents: contents.slice(0, params?.limit || 10),
      metadata: {
        total: contents.length,
        page: params?.page || 1,
        limit: params?.limit || 10,
        total_pages: Math.ceil(contents.length / (params?.limit || 10)),
        has_next: (params?.page || 1) * (params?.limit || 10) < contents.length,
        has_previous: (params?.page || 1) > 1
      }
    }
  };
};
