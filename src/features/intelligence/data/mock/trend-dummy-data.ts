import { 
  ChannelsResponse, 
  ContentResponse, 
  TopContentsResponse, 
  SearchResponse,
  Channel,
  ContentItem,
  TopContentsItem
} from '../model/trend-model';

// Beauty & skincare trend channels (mock)
const beautyChannels = [
  { name: "Glow Lab MY", uniqueId: "@glowlabmy", platform: "TIKTOK" as const },
  { name: "Sephora Malaysia", uniqueId: "@sephoramalaysia", platform: "INSTAGRAM" as const },
  { name: "Skincare Science MY", uniqueId: "@skincaresciencemy", platform: "YOUTUBE" as const },
  { name: "Hermo Hauls", uniqueId: "@hermohauls", platform: "TIKTOK" as const },
  { name: "Watsons Beauty", uniqueId: "@watsonsbeauty", platform: "INSTAGRAM" as const },
  { name: "Derm Decoder", uniqueId: "@dermdecoder", platform: "YOUTUBE" as const },
  { name: "K-Beauty KL", uniqueId: "@kbeautykl", platform: "TIKTOK" as const },
  { name: "Laneige Malaysia", uniqueId: "@laneigemy", platform: "INSTAGRAM" as const },
  { name: "The Ordinary Tips", uniqueId: "@theordinarytips", platform: "YOUTUBE" as const },
  { name: "b.liv Official", uniqueId: "@blivskin", platform: "TIKTOK" as const },
  { name: "Guardian Skin", uniqueId: "@guardianskin", platform: "INSTAGRAM" as const },
  { name: "Innisfree MY", uniqueId: "@innisfreemalaysia", platform: "YOUTUBE" as const },
  { name: "Beauty Skincare ShopIntel", uniqueId: "@beautyskincareshopintel", platform: "TIKTOK" as const },
  { name: "CeraVe MY", uniqueId: "@ceravemy", platform: "INSTAGRAM" as const },
  { name: "La Roche-Posay MY", uniqueId: "@larocheposaymy", platform: "YOUTUBE" as const },
  { name: "Routine Check", uniqueId: "@routinecheckmy", platform: "TIKTOK" as const },
  { name: "Sensitive Skin MY", uniqueId: "@sensitiveskinmy", platform: "INSTAGRAM" as const },
  { name: "SPF Squad", uniqueId: "@spfsquad", platform: "YOUTUBE" as const },
  { name: "Retinol Club", uniqueId: "@retinolclub", platform: "TIKTOK" as const },
  { name: "Barrier Repair MY", uniqueId: "@barrierrepairmy", platform: "INSTAGRAM" as const }
];

const regions = ["US", "UK", "CA", "AU", "DE", "FR", "IT", "ES", "BR", "MX"];

const categories = [
  { category: { name: "Beauty & Skincare" } },
  { category: { name: "Lifestyle" } },
  { category: { name: "Education" } },
  { category: { name: "Health & Wellness" } },
  { category: { name: "Reviews" } }
];

// Generate random numbers with realistic distributions
const generateMetrics = (baseViews: number) => {
  const multiplier = Math.random() * 0.5 + 0.75; // 0.75 - 1.25
  return {
    views: Math.floor(baseViews * multiplier),
    likes: Math.floor(baseViews * 0.1 * multiplier),
    comments: Math.floor(baseViews * 0.02 * multiplier),
    shares: Math.floor(baseViews * 0.005 * multiplier),
    saves: Math.floor(baseViews * 0.03 * multiplier),
    reposts: Math.floor(baseViews * 0.001 * multiplier),
    forward_count: Math.floor(baseViews * 0.001 * multiplier),
    whatsapp_shares: Math.floor(baseViews * 0.002 * multiplier),
    change24h: (Math.random() - 0.5) * 40 // -20% to +20%
  };
};

// Mock top channels data
export const mockTopChannelsData: ChannelsResponse = {
  message: "Top channels retrieved successfully",
  data: {
    channels: beautyChannels.map((channel, index) => {
      const baseViews = 10000000 - (index * 400000); // Decreasing views
      const metrics = generateMetrics(baseViews);
      
      return {
        id: `channel_${index + 1}`,
        name: channel.name,
        unique_id: channel.uniqueId,
        image_url: `https://picsum.photos/150/150?random=${index + 1}`,
        channel_url: `https://${channel.platform.toLowerCase()}.com/${channel.uniqueId}`,
        platform: channel.platform,
        region: regions[index % regions.length],
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        categories: [categories[index % categories.length]],
        summary_metadata: {
          total_views: metrics.views,
          total_likes: metrics.likes,
          total_comments: metrics.comments,
          total_shares: metrics.shares,
          total_saves: metrics.saves,
          total_reposts: metrics.reposts,
          total_forward_count: metrics.forward_count,
          total_whatsapp_shares: metrics.whatsapp_shares,
          total_24h_change: metrics.change24h,
          content_count: Math.floor(Math.random() * 500) + 50
        }
      } as Channel;
    }),
    metadata: {
      total: 20,
      page: 1,
      limit: 20,
      total_pages: 1,
      has_next_page: false,
      has_prev_page: false
    }
  }
};

const beautyContent = [
  {
    title: "Glass skin routine for tropical humidity",
    description: "Layering essences and lightweight SPF without greasiness in KL-level heat.",
    summarizerTitle: "Humid-climate glass skin",
    summarizerDescription: "Product order and wait times for a dewy finish that lasts",
    explanations: ["Humectants before occlusives", "Gel SPF over cream", "Blotting vs adding powder"]
  },
  {
    title: "Drugstore vs department store moisturizers",
    description: "Blind test: CeraVe, La Roche-Posay, and luxury creams on dehydrated skin.",
    summarizerTitle: "Moisturizer blind comparison",
    summarizerDescription: "Texture, finish, and 8-hour hydration check",
    explanations: ["Ceramide ratios", "Silicone feel", "Value per ml"]
  },
  {
    title: "Inside a K-beauty lab (Innisfree-style formulation)",
    description: "How green tea extract and stabilizers become a shelf-stable serum.",
    summarizerTitle: "K-beauty formulation tour",
    summarizerDescription: "From raw botanicals to stability testing",
    explanations: ["Extraction methods", "Preservative systems", "pH targets"]
  },
  {
    title: "5-minute morning: cleanse, vitamin C, SPF",
    description: "Fast routine for commuters who still want photoaging protection.",
    summarizerTitle: "Quick AM protection stack",
    summarizerDescription: "Minimum viable routine before sunscreen",
    explanations: ["Vitamin C wait time", "SPF amount", "Reapplication hacks"]
  },
  {
    title: "Niacinamide percentage: marketing vs evidence",
    description: "Why 10% is not always better and how to pair with acids.",
    summarizerTitle: "Niacinamide science breakdown",
    summarizerDescription: "Studies, irritation, and compatible actives",
    explanations: ["Sebum data", "Barrier support", "Contradictions with low pH"]
  },
  {
    title: "Beauty Skincare ShopIntel — full routine try-on",
    description: "30-day diary using the ShopIntel cleanser, serum, and barrier cream only.",
    summarizerTitle: "ShopIntel routine diary",
    summarizerDescription: "Honest texture notes and breakout tracking",
    explanations: ["Purging vs reaction", "Texture changes", "Makeup compatibility"]
  },
  {
    title: "DIY not always cheaper: costing a dupe routine",
    description: "Spreadsheet of The Ordinary stacks vs ready-made bundles from Hermo.",
    summarizerTitle: "DIY skincare cost analysis",
    summarizerDescription: "Shipping, oxidation waste, and time cost",
    explanations: ["PAO dates", "Minimum orders", "Travel waste"]
  },
  {
    title: "Sunscreen under makeup that does not pill",
    description: "Testing Asian fluid SPFs vs Western filters with foundation on top.",
    summarizerTitle: "SPF + foundation compatibility",
    summarizerDescription: "Film formers and rubbing technique",
    explanations: ["Chemical vs mineral cast", "Primer order", "Setting spray impact"]
  },
  {
    title: "Centella for redness: serum vs cream",
    description: "Side-by-side on post-acne marks and barrier flare-ups.",
    summarizerTitle: "Centella format comparison",
    summarizerDescription: "When to choose watery vs rich vehicles",
    explanations: ["Madecassoside %", "Occlusion needs", "Layering rules"]
  },
  {
    title: "History of sunscreen in Southeast Asia",
    description: "From beach zinc to PA++++ labels and Malaysian consumer habits.",
    summarizerTitle: "SPF culture in SEA",
    summarizerDescription: "Regulatory labels and shopping behavior",
    explanations: ["PPD vs PA", "Drugstore penetration", "TikTok influence"]
  },
  {
    title: "Refill pods and less plastic: sustainable beauty haul",
    description: "Watsons and Guardian refill stations vs online bulk refills.",
    summarizerTitle: "Eco refill shopping MY",
    summarizerDescription: "Cost and contamination considerations",
    explanations: ["Refill hygiene", "Brand programs", "Carbon tradeoffs"]
  },
  {
    title: "Why your skin hates air-con: barrier repair night",
    description: "Peptides, ceramides, and occlusive last step for office workers.",
    summarizerTitle: "AC-dehydration repair",
    summarizerDescription: "Night stack when humidity drops indoors",
    explanations: ["TEWL basics", "Humidifier optional", "Occlusive amount"]
  },
  {
    title: "Sephora haul: luxury serums worth it?",
    description: "Four-figure routine vs mid-range dupes on the same concerns.",
    summarizerTitle: "Luxury serum ROI",
    summarizerDescription: "Ingredient overlap and packaging premium",
    explanations: ["Peptide blends", "Fragrance load", "Sample strategy"]
  },
  {
    title: "Lip care ASMR: overnight masks compared",
    description: "Laneige, local balms, and peptide treatments under a microscope.",
    summarizerTitle: "Overnight lip mask test",
    summarizerDescription: "Occlusion and flake reduction by morning",
    explanations: ["Petrolatum role", "Plant oils", "Exfoliation timing"]
  },
  {
    title: "Unboxing: Beauty Skincare ShopIntel travel kit",
    description: "TSA-friendly minis and whether the kit beats buying à la carte.",
    summarizerTitle: "ShopIntel travel kit review",
    summarizerDescription: "Decant vs official mini pricing",
    explanations: ["Stability in minis", "Airport humidity", "Routine gaps"]
  }
];

// Mock trending videos data
export const mockTrendingVideosData: TopContentsResponse = {
  message: "Top contents retrieved successfully",
  data: {
    contents: {
      total: 15,
      contents: beautyContent.slice(0, 15).map((content, index) => {
        const baseViews = 5000000 - (index * 200000);
        const metrics = generateMetrics(baseViews);
        const channel = beautyChannels[index % beautyChannels.length];
        
        return {
          id: `content_${index + 1}`,
          video_id: `video_${index + 1}`,
          video_url: `https://example.com/video/${index + 1}`,
          metadata: {
            views: metrics.views,
            likes: metrics.likes,
            comments: metrics.comments,
            video_id: `video_${index + 1}`,
            last_tracked: new Date().toISOString(),
            video_length: Math.floor(Math.random() * 600) + 30, // 30s to 10min
            "24h_change_likes": Math.floor(metrics.likes * (Math.random() * 0.1 + 0.05)), // 5-15% change
            "24h_change_views": Math.floor(metrics.views * (Math.random() * 0.1 + 0.05)),
            "24h_change_comments": Math.floor(metrics.comments * (Math.random() * 0.1 + 0.05)),
            previous_track_likes: metrics.likes - Math.floor(metrics.likes * 0.1),
            previous_track_views: metrics.views - Math.floor(metrics.views * 0.1),
            previous_track_comments: metrics.comments - Math.floor(metrics.comments * 0.1)
          },
          title: content.title,
          description: content.description,
          summarizer_title: content.summarizerTitle,
          summarizer_description: content.summarizerDescription,
          summarizer_explanations: content.explanations.map(exp => ({ explanation: exp })),
          thumbnails: [
            {
              type: "DEFAULT" as const,
              url: `https://picsum.photos/480/360?random=${index + 100}`
            },
            {
              type: "HIGH" as const,
              url: `https://picsum.photos/720/540?random=${index + 100}`
            }
          ],
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          channel: {
            id: `channel_${(index % beautyChannels.length) + 1}`,
            name: channel.name,
            platform: channel.platform,
            region: regions[index % regions.length],
            unique_id: channel.uniqueId,
            image_url: `https://picsum.photos/150/150?random=${(index % beautyChannels.length) + 1}`,
            categories: [categories[index % categories.length]]
          }
        } as TopContentsItem;
      })
    }
  }
};

// Mock trending content data (general content API)
export const mockTrendingContentData: ContentResponse = {
  message: "Content retrieved successfully",
  status_code: 200,
  data: {
    contents: beautyContent.map((content, index) => {
      const baseViews = 3000000 - (index * 150000);
      const metrics = generateMetrics(baseViews);
      const channel = beautyChannels[index % beautyChannels.length];
      
      return {
        id: `content_gen_${index + 1}`,
        video_id: `video_gen_${index + 1}`,
        video_url: `https://example.com/video/gen/${index + 1}`,
        metadata: {
          views: metrics.views,
          likes: metrics.likes,
          saves: metrics.saves,
          shares: metrics.shares,
          reposts: metrics.reposts,
          comments: metrics.comments,
          video_id: `video_gen_${index + 1}`,
          "7d_change": (Math.random() - 0.5) * 30,
          "24h_change": metrics.change24h,
          "30d_change": (Math.random() - 0.5) * 60,
          "90d_change": (Math.random() - 0.5) * 100,
          "180d_change": (Math.random() - 0.5) * 150,
          "365d_change": (Math.random() - 0.5) * 200,
          video_length: Math.floor(Math.random() * 600) + 30,
          forward_count: metrics.forward_count,
          all_time_change: (Math.random() - 0.5) * 300,
          whatsapp_shares: metrics.whatsapp_shares,
          all_time_change_percentage: (Math.random() - 0.5) * 50
        },
        title: content.title,
        description: content.description,
        summarizer_title: content.summarizerTitle,
        summarizer_description: content.summarizerDescription,
        summarizer_explanations: content.explanations,
        thumbnails: [
          {
            type: "DEFAULT" as const,
            url: `https://picsum.photos/480/360?random=${index + 200}`
          },
          {
            type: "HIGH" as const,
            url: `https://picsum.photos/720/540?random=${index + 200}`
          }
        ],
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        channel: {
          id: `channel_gen_${(index % beautyChannels.length) + 1}`,
          name: channel.name,
          platform: channel.platform,
          region: regions[index % regions.length],
          unique_id: channel.uniqueId,
          image_url: `https://picsum.photos/150/150?random=${(index % beautyChannels.length) + 1}`,
          categories: [categories[index % categories.length]]
        }
      } as ContentItem;
    }),
    metadata: {
      total: beautyContent.length,
      page: 1,
      limit: 20,
      total_pages: Math.ceil(beautyContent.length / 20),
      has_next: false,
      has_previous: false
    }
  }
};

// Trending topics data
export const mockTrendingTopics = [
  {
    topic: "Glass skin routines",
    description: "Layered hydration, essences, and SPF for a dewy finish in humid climates",
    trending_score: 95,
    mentions: 12500,
    growth_rate: 23.4,
    related_keywords: ["essence", "SPF", "humidity", "dewy"]
  },
  {
    topic: "Barrier repair",
    description: "Ceramides, panthenol, and gentle cleansers after over-exfoliation",
    trending_score: 89,
    mentions: 9800,
    growth_rate: 18.7,
    related_keywords: ["ceramide", "repair", "sensitive", "skin cycling"]
  },
  {
    topic: "Reef-safe & sustainable SPF",
    description: "Refillable bottles, mineral filters, and Malaysian reef-conscious shoppers",
    trending_score: 87,
    mentions: 11200,
    growth_rate: 31.2,
    related_keywords: ["reef safe", "refill", "mineral SPF", "eco"]
  },
  {
    topic: "Retinol for beginners",
    description: "Sandwich method, frequency, and pairing with moisturizers",
    trending_score: 82,
    mentions: 7600,
    growth_rate: 15.8,
    related_keywords: ["retinol", "sandwich", "purge", "night routine"]
  },
  {
    topic: "K-beauty in Malaysia",
    description: "Innisfree, Laneige, and Shopee bundles shaping local preferences",
    trending_score: 78,
    mentions: 6900,
    growth_rate: 12.3,
    related_keywords: ["K-beauty", "Shopee", "serum", "toner"]
  },
  {
    topic: "Dermocosmetic science",
    description: "La Roche-Posay, CeraVe, and evidence-led claims in drugstore aisles",
    trending_score: 75,
    mentions: 8400,
    growth_rate: 9.6,
    related_keywords: ["niacinamide", "dermatology", "drugstore", "clinical"]
  },
  {
    topic: "Hyperpigmentation care",
    description: "Vitamin C, tranexamic acid, and sunscreen discipline for tropical sun",
    trending_score: 72,
    mentions: 5500,
    growth_rate: 28.9,
    related_keywords: ["vitamin C", "dark spots", "PA++++", "brightening"]
  },
  {
    topic: "Ingredient stacking",
    description: "Safe AM/PM sequencing for acids, retinoids, and hydrating layers",
    trending_score: 69,
    mentions: 4800,
    growth_rate: 7.2,
    related_keywords: ["layering", "pH", "wait time", "conflicts"]
  }
];

// Mock search results
export const mockSearchResults: SearchResponse = {
  message: "Search completed successfully",
  data: {
    contents: {
      search_term: "skincare malaysia",
      total_results: {
        contents: 150,
        channels: 45
      },
      results: {
        contents: mockTrendingContentData.data.contents.slice(0, 10),
        channels: mockTopChannelsData.data.channels.slice(0, 10)
      },
      summary: {
        content_matches: 150,
        channel_matches: 45
      }
    }
  }
};
