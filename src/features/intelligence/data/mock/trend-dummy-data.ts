import { 
  ChannelsResponse, 
  ContentResponse, 
  TopContentsResponse, 
  SearchResponse,
  Channel,
  ContentItem,
  TopContentsItem
} from '../model/trend-model';

// clothing-themed channel names and data
const clothingChannels = [
  { name: "FashionWorks", uniqueId: "@fashionworks", platform: "TIKTOK" as const },
  { name: "StyleCravings", uniqueId: "@stylecravings", platform: "INSTAGRAM" as const },
  { name: "Trend Temptations", uniqueId: "@trendtemptations", platform: "YOUTUBE" as const },
  { name: "Wardrobe Dreams", uniqueId: "@wardrobedreams", platform: "TIKTOK" as const },
  { name: "Fashion Paradise", uniqueId: "@fashionparadise", platform: "INSTAGRAM" as const },
  { name: "Thread to Style", uniqueId: "@threadtostyle", platform: "YOUTUBE" as const },
  { name: "Outfit Tales", uniqueId: "@outfittales", platform: "TIKTOK" as const },
  { name: "Fabric Culture", uniqueId: "@fabricculture", platform: "INSTAGRAM" as const },
  { name: "Classic Delights", uniqueId: "@classicdelights", platform: "YOUTUBE" as const },
  { name: "Style & Magic", uniqueId: "@styleandmagic", platform: "TIKTOK" as const },
  { name: "Design Secrets", uniqueId: "@designsecrets", platform: "INSTAGRAM" as const },
  { name: "Premium Bliss", uniqueId: "@premiumbliss", platform: "YOUTUBE" as const },
  { name: "Artisan Fashion Co", uniqueId: "@artisanfashion", platform: "TIKTOK" as const },
  { name: "Fashion Therapy", uniqueId: "@fashiontherapy", platform: "INSTAGRAM" as const },
  { name: "Style & Spice", uniqueId: "@styleandspice", platform: "YOUTUBE" as const },
  { name: "Gourmet Garments", uniqueId: "@gourmetgarments", platform: "TIKTOK" as const },
  { name: "Fashion Chronicles", uniqueId: "@fashionchronic", platform: "INSTAGRAM" as const },
  { name: "Style Masterclass", uniqueId: "@stylemaster", platform: "YOUTUBE" as const },
  { name: "Fashion Studio", uniqueId: "@fashionstudio", platform: "TIKTOK" as const },
  { name: "Style Science", uniqueId: "@stylescience", platform: "INSTAGRAM" as const }
];

const regions = ["US", "UK", "CA", "AU", "DE", "FR", "IT", "ES", "BR", "MX"];

const categories = [
  { category: { name: "Food & Cooking" } },
  { category: { name: "Lifestyle" } },
  { category: { name: "Education" } },
  { category: { name: "Entertainment" } },
  { category: { name: "Business" } }
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
    channels: clothingChannels.map((channel, index) => {
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

// clothing video titles and descriptions
const clothingContent = [
  {
    title: "Ultimate Denim Guide - Perfect Fit!",
    description: "Learn how to find the most flattering denim that fits perfectly for days. Style secrets revealed!",
    summarizerTitle: "Perfect Denim Fit Tutorial",
    summarizerDescription: "Step-by-step guide to finding perfect denim with professional styling tips",
    explanations: ["Understanding different cuts", "Fabric blend enhances comfort", "Proper sizing technique prevents fit issues"]
  },
  {
    title: "Styling Outfits Like a Pro",
    description: "Master the art of outfit coordination for perfectly polished looks every time.",
    summarizerTitle: "Professional Outfit Styling Guide", 
    summarizerDescription: "Learn styling techniques used by professional fashion stylists",
    explanations: ["Color coordination is crucial", "Layering method explained", "Testing for proper proportions"]
  },
  {
    title: "Italian Fashion Factory Tour",
    description: "Take an exclusive behind-the-scenes look at how authentic Italian garments are made from fabric to finished product.",
    summarizerTitle: "Italian Fashion Manufacturing Process",
    summarizerDescription: "Documentary-style tour of traditional clothing making methods",
    explanations: ["Fabric selection process", "Cutting and sewing techniques", "Traditional finishing methods"]
  },
  {
    title: "5-Minute Outfit Transformation",
    description: "Need a quick style upgrade? This fast styling trick will transform your look in minutes!",
    summarizerTitle: "Quick Style Transformation",
    summarizerDescription: "Fast and easy outfit changes for instant style gratification",
    explanations: ["No special items needed", "Perfect for any occasion", "Customizable accessories"]
  },
  {
    title: "Cotton T-Shirts Benefits",
    description: "Discover the science behind why cotton clothing is actually good for you. Breathability, comfort, and more!",
    summarizerTitle: "Cotton Fabric Science",
    summarizerDescription: "Evidence-based explanation of cotton clothing's benefits",
    explanations: ["Natural fiber properties explained", "Comfort benefits", "Recommended for daily wear"]
  },
  {
    title: "Fashion Design Time-lapse",
    description: "Watch master designer create stunning fashion pieces in this mesmerizing time-lapse video.",
    summarizerTitle: "Fashion Design Creation Process",
    summarizerDescription: "Artistic fashion design techniques and creative process",
    explanations: ["Specialized tools required", "Pattern management", "Artistic vision execution"]
  },
  {
    title: "DIY Custom T-Shirt Design",
    description: "Make your own personalized t-shirt at home with just 5 simple steps!",
    summarizerTitle: "DIY Custom Clothing Design",
    summarizerDescription: "Simple method for creating custom clothing without special equipment",
    explanations: ["Design transfer techniques", "Fabric paint options", "Care recommendations"]
  },
  {
    title: "Fashion Quality Test Challenge",
    description: "Can you tell the difference between $20 and $200 clothing? We put it to the test!",
    summarizerTitle: "Premium vs Budget Fashion Comparison",
    summarizerDescription: "Blind quality test comparing different price points of clothing",
    explanations: ["Price doesn't always equal quality", "Fabric quality differences", "Consumer preferences vary"]
  },
  {
    title: "Polo Shirt Styling Guide",
    description: "Elegant styling tips combining classic polo shirts with modern accessories.",
    summarizerTitle: "Polo Shirt Style Guide",
    summarizerDescription: "Elegant styling perfect for special occasions",
    explanations: ["Color coordination technique", "Balancing casual and formal", "Professional presentation tips"]
  },
  {
    title: "Fashion History Documentary",
    description: "From ancient textiles to modern fashion - the fascinating history of clothing.",
    summarizerTitle: "Cultural History of Fashion",
    summarizerDescription: "Educational content about clothing's role in human civilization",
    explanations: ["Ancient textile traditions", "Industrial trade impact", "Fashion revolution changes"]
  },
  {
    title: "Sustainable Fashion Guide",
    description: "Eco-friendly, ethical clothing that looks great - no one will know the difference!",
    summarizerTitle: "Eco-Friendly Fashion Guide",
    summarizerDescription: "Sustainable fashion techniques for traditional clothing styles",
    explanations: ["Organic fabric options", "Ethical production alternatives", "Maintaining style without compromise"]
  },
  {
    title: "Fashion Psychology Science",
    description: "Why do we love clothing so much? The science behind fashion's effect on our confidence.",
    summarizerTitle: "Psychology of Fashion",
    summarizerDescription: "Scientific explanation of fashion's impact on well-being",
    explanations: ["Confidence boost mechanisms", "Emotional comfort associations", "Style and self-expression effects"]
  },
  {
    title: "Street Style Around the World",
    description: "Explore unique fashion traditions from Tokyo to Paris and beyond!",
    summarizerTitle: "Global Street Style Varieties",
    summarizerDescription: "Cultural variations of fashion styles worldwide",
    explanations: ["Style variations by region", "Traditional fashion methods", "Cultural significance"]
  },
  {
    title: "Fabric Care Science",
    description: "The science behind keeping your clothes looking perfect - color preservation, fabric care, and more.",
    summarizerTitle: "Fabric Care Science Explained",
    summarizerDescription: "Technical breakdown of clothing care and maintenance",
    explanations: ["Washing temperature effects", "Fabric type impact", "Detergent vs fabric softener roles"]
  },
  {
    title: "Luxury Fashion Unboxing",
    description: "Unboxing and reviewing the world's most expensive fashion collection - $2000 per piece!",
    summarizerTitle: "Premium Fashion Product Review",
    summarizerDescription: "Luxury fashion brand comparison and quality analysis",
    explanations: ["Artisanal production methods", "Rare fabric varieties", "Packaging and presentation value"]
  }
];

// Mock trending videos data
export const mockTrendingVideosData: TopContentsResponse = {
  message: "Top contents retrieved successfully",
  data: {
    contents: {
      total: 15,
      contents: clothingContent.slice(0, 15).map((content, index) => {
        const baseViews = 5000000 - (index * 200000);
        const metrics = generateMetrics(baseViews);
        const channel = clothingChannels[index % clothingChannels.length];
        
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
            id: `channel_${(index % clothingChannels.length) + 1}`,
            name: channel.name,
            platform: channel.platform,
            region: regions[index % regions.length],
            unique_id: channel.uniqueId,
            image_url: `https://picsum.photos/150/150?random=${(index % clothingChannels.length) + 1}`,
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
    contents: clothingContent.map((content, index) => {
      const baseViews = 3000000 - (index * 150000);
      const metrics = generateMetrics(baseViews);
      const channel = clothingChannels[index % clothingChannels.length];
      
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
          id: `channel_gen_${(index % clothingChannels.length) + 1}`,
          name: channel.name,
          platform: channel.platform,
          region: regions[index % regions.length],
          unique_id: channel.uniqueId,
          image_url: `https://picsum.photos/150/150?random=${(index % clothingChannels.length) + 1}`,
          categories: [categories[index % categories.length]]
        }
      } as ContentItem;
    }),
    metadata: {
      total: clothingContent.length,
      page: 1,
      limit: 20,
      total_pages: Math.ceil(clothingContent.length / 20),
      has_next: false,
      has_previous: false
    }
  }
};

// Trending topics data
export const mockTrendingTopics = [
  {
    topic: "Fashion Styling",
    description: "Professional techniques for achieving perfect outfit coordination and style",
    trending_score: 95,
    mentions: 12500,
    growth_rate: 23.4,
    related_keywords: ["styling", "fashion design", "professional", "technique"]
  },
  {
    topic: "Fabric to Fashion",
    description: "Artisanal clothing making from raw materials to finished products",
    trending_score: 89,
    mentions: 9800,
    growth_rate: 18.7,
    related_keywords: ["artisanal", "craft fashion", "materials", "small batch"]
  },
  {
    topic: "Sustainable Fashion",
    description: "Eco-friendly clothing alternatives and ethical production methods",
    trending_score: 87,
    mentions: 11200,
    growth_rate: 31.2,
    related_keywords: ["sustainable", "eco-friendly", "ethical", "organic"]
  },
  {
    topic: "Fashion Design",
    description: "Artistic clothing creations and creative fashion installations",
    trending_score: 82,
    mentions: 7600,
    growth_rate: 15.8,
    related_keywords: ["art", "design", "creative", "fashion"]
  },
  {
    topic: "Premium Fashion",
    description: "High-end clothing from specific regions and designers",
    trending_score: 78,
    mentions: 6900,
    growth_rate: 12.3,
    related_keywords: ["premium", "luxury", "designer", "quality"]
  },
  {
    topic: "Fashion Benefits",
    description: "Scientific research on clothing's impact on confidence and well-being",
    trending_score: 75,
    mentions: 8400,
    growth_rate: 9.6,
    related_keywords: ["confidence", "well-being", "fashion psychology", "style"]
  },
  {
    topic: "Jackets",
    description: "Versatile outerwear with natural style and comfort",
    trending_score: 72,
    mentions: 5500,
    growth_rate: 28.9,
    related_keywords: ["outerwear", "style", "comfort", "versatile"]
  },
  {
    topic: "Fashion Pairing",
    description: "Outfit coordination and accessory pairings with different clothing types",
    trending_score: 69,
    mentions: 4800,
    growth_rate: 7.2,
    related_keywords: ["pairing", "coordination", "accessories", "styling"]
  }
];

// Mock search results
export const mockSearchResults: SearchResponse = {
  message: "Search completed successfully",
  data: {
    contents: {
      search_term: "clothing",
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
