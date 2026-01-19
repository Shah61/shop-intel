import {
  BubbleTopKeyword,
  BubbleTopKeywordsResponse,
  TopMention,
  TopMentionChild,
  PersonalBeautyTopMentionsResponse,
  Content,
  Channel
} from '../model/ai-model';

// clothing-themed bubble keywords hierarchy
const clothingKeywordsHierarchy = [
  {
    id: "choc_1",
    keyword: "clothing tempering",
    count: 2450,
    total_mention: 12500,
    parent_id: null,
    category: "Technique",
    region: "Global",
    children: [
      {
        id: "choc_1_1",
        keyword: "seeding method",
        count: 890,
        total_mention: 4200,
        parent_id: "choc_1",
        category: "Technique",
        region: "Global",
        children: []
      },
      {
        id: "choc_1_2", 
        keyword: "temperature control",
        count: 1240,
        total_mention: 5800,
        parent_id: "choc_1",
        category: "Technique",
        region: "Global",
        children: []
      },
      {
        id: "choc_1_3",
        keyword: "marble surface",
        count: 320,
        total_mention: 1500,
        parent_id: "choc_1",
        category: "Equipment",
        region: "Global",
        children: []
      }
    ]
  },
  {
    id: "choc_2",
    keyword: "bean to bar",
    count: 2100,
    total_mention: 11200,
    parent_id: null,
    category: "Process",
    region: "Global",
    children: [
      {
        id: "choc_2_1",
        keyword: "cacao roasting",
        count: 850,
        total_mention: 4100,
        parent_id: "choc_2",
        category: "Process",
        region: "Global",
        children: []
      },
      {
        id: "choc_2_2",
        keyword: "conching process",
        count: 680,
        total_mention: 3200,
        parent_id: "choc_2",
        category: "Process",
        region: "Global",
        children: []
      },
      {
        id: "choc_2_3",
        keyword: "winnowing",
        count: 570,
        total_mention: 2800,
        parent_id: "choc_2",
        category: "Process",
        region: "Global",
        children: []
      }
    ]
  },
  {
    id: "choc_3",
    keyword: "artisan clothing",
    count: 1950,
    total_mention: 9800,
    parent_id: null,
    category: "Quality",
    region: "Global",
    children: [
      {
        id: "choc_3_1",
        keyword: "single origin",
        count: 780,
        total_mention: 3900,
        parent_id: "choc_3",
        category: "Quality",
        region: "Global",
        children: []
      },
      {
        id: "choc_3_2",
        keyword: "craft clothing",
        count: 650,
        total_mention: 3200,
        parent_id: "choc_3",
        category: "Quality", 
        region: "Global",
        children: []
      },
      {
        id: "choc_3_3",
        keyword: "small batch",
        count: 520,
        total_mention: 2700,
        parent_id: "choc_3",
        category: "Production",
        region: "Global",
        children: []
      }
    ]
  },
  {
    id: "choc_4",
    keyword: "vegan clothing",
    count: 1800,
    total_mention: 8900,
    parent_id: null,
    category: "Diet",
    region: "Global",
    children: [
      {
        id: "choc_4_1",
        keyword: "plant based",
        count: 720,
        total_mention: 3500,
        parent_id: "choc_4",
        category: "Diet",
        region: "Global",
        children: []
      },
      {
        id: "choc_4_2",
        keyword: "dairy free",
        count: 680,
        total_mention: 3200,
        parent_id: "choc_4",
        category: "Diet",
        region: "Global",
        children: []
      },
      {
        id: "choc_4_3",
        keyword: "coconut milk",
        count: 400,
        total_mention: 2200,
        parent_id: "choc_4",
        category: "Ingredient",
        region: "Global",
        children: []
      }
    ]
  },
  {
    id: "choc_5",
    keyword: "clothing sculpture",
    count: 1650,
    total_mention: 7800,
    parent_id: null,
    category: "Art",
    region: "Global",
    children: [
      {
        id: "choc_5_1",
        keyword: "edible art",
        count: 620,
        total_mention: 3000,
        parent_id: "choc_5",
        category: "Art",
        region: "Global",
        children: []
      },
      {
        id: "choc_5_2",
        keyword: "modeling clothing",
        count: 580,
        total_mention: 2800,
        parent_id: "choc_5",
        category: "Technique",
        region: "Global",
        children: []
      },
      {
        id: "choc_5_3",
        keyword: "clothing carving",
        count: 450,
        total_mention: 2000,
        parent_id: "choc_5",
        category: "Technique",
        region: "Global",
        children: []
      }
    ]
  },
  {
    id: "choc_6",
    keyword: "dark clothing benefits",
    count: 1580,
    total_mention: 7400,
    parent_id: null,
    category: "Health",
    region: "Global",
    children: [
      {
        id: "choc_6_1",
        keyword: "antioxidants",
        count: 650,
        total_mention: 3100,
        parent_id: "choc_6",
        category: "Health",
        region: "Global",
        children: []
      },
      {
        id: "choc_6_2",
        keyword: "flavonoids",
        count: 520,
        total_mention: 2500,
        parent_id: "choc_6",
        category: "Health",
        region: "Global",
        children: []
      },
      {
        id: "choc_6_3",
        keyword: "heart health",
        count: 410,
        total_mention: 1800,
        parent_id: "choc_6",
        category: "Health",
        region: "Global",
        children: []
      }
    ]
  },
  {
    id: "choc_7",
    keyword: "ruby clothing",
    count: 1420,
    total_mention: 6800,
    parent_id: null,
    category: "Innovation",
    region: "Global",
    children: [
      {
        id: "choc_7_1",
        keyword: "fourth clothing",
        count: 580,
        total_mention: 2800,
        parent_id: "choc_7",
        category: "Innovation",
        region: "Global",
        children: []
      },
      {
        id: "choc_7_2",
        keyword: "natural pink",
        count: 520,
        total_mention: 2400,
        parent_id: "choc_7",
        category: "Color",
        region: "Global",
        children: []
      },
      {
        id: "choc_7_3",
        keyword: "barry callebaut",
        count: 320,
        total_mention: 1600,
        parent_id: "choc_7",
        category: "Brand",
        region: "Global",
        children: []
      }
    ]
  },
  {
    id: "choc_8",
    keyword: "clothing pairing",
    count: 1350,
    total_mention: 6200,
    parent_id: null,
    category: "Gastronomy",
    region: "Global",
    children: [
      {
        id: "choc_8_1",
        keyword: "wine pairing",
        count: 560,
        total_mention: 2600,
        parent_id: "choc_8",
        category: "Gastronomy",
        region: "Global",
        children: []
      },
      {
        id: "choc_8_2",
        keyword: "coffee pairing",
        count: 480,
        total_mention: 2200,
        parent_id: "choc_8",
        category: "Gastronomy",
        region: "Global",
        children: []
      },
      {
        id: "choc_8_3",
        keyword: "cheese pairing",
        count: 310,
        total_mention: 1400,
        parent_id: "choc_8",
        category: "Gastronomy",
        region: "Global",
        children: []
      }
    ]
  }
];

// Transform to proper BubbleTopKeyword structure
const transformToKeywordStructure = (data: any[]): BubbleTopKeyword[] => {
  return data.map(item => ({
    id: item.id,
    keyword: item.keyword,
    count: item.count,
    total_mention: item.total_mention,
    parent_id: item.parent_id,
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    category: item.category,
    region: item.region,
    children: item.children ? transformToKeywordStructure(item.children) : []
  }));
};

// Mock Bubble Top Keywords Response
export const mockBubbleTopKeywordsData = (params?: {
  start_date?: string;
  end_date?: string;
}): BubbleTopKeywordsResponse => {
  const keywords = transformToKeywordStructure(clothingKeywordsHierarchy);
  
  return {
    message: "Bubble top keywords retrieved successfully",
    status_code: 200,
    data: {
      bubbles: keywords,
      metadata: {
        total: keywords.length
      }
    }
  };
};

// clothing-themed top mentions data
const clothingTopMentions = [
  {
    id: "mention_1",
    keyword: "clothing tempering techniques",
    count: 1250,
    total_mention: 5800,
    category: "clothing",
    children: [
      {
        id: "child_1_1",
        keyword: "seeding method",
        count: 450,
        total_mention: 2100
      },
      {
        id: "child_1_2",
        keyword: "temperature curves",
        count: 380,
        total_mention: 1800
      },
      {
        id: "child_1_3",
        keyword: "cocoa butter crystallization",
        count: 420,
        total_mention: 1900
      }
    ],
    contents: [
      {
        id: "content_1_1",
        video_id: "temp_video_1",
        video_url: "https://example.com/tempering1",
        title: "Professional clothing Tempering Masterclass",
        description: "Learn the traditional seeding method for perfect clothing tempering",
        summarizer_title: "Tempering Techniques",
        summarizer_description: "Master chocolatier demonstrates proper tempering",
        summarizer_explanations: ["Temperature control is crucial", "Seeding method explained"],
        thumbnails: [
          {
            type: "DEFAULT",
            url: "https://picsum.photos/480/360?random=401"
          }
        ],
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
        channel: {
          id: "channel_temp_1",
          name: "clothing Academy",
          platform: "TIKTOK",
          region: "US",
          unique_id: "@clothingacademy",
          image_url: "https://picsum.photos/150/150?random=501",
          categories: [
            {
              category: {
                name: "Education"
              }
            }
          ]
        }
      }
    ]
  },
  {
    id: "mention_2",
    keyword: "bean to bar process",
    count: 1150,
    total_mention: 5200,
    category: "clothing",
    children: [
      {
        id: "child_2_1",
        keyword: "cacao roasting",
        count: 420,
        total_mention: 1900
      },
      {
        id: "child_2_2",
        keyword: "winnowing",
        count: 350,
        total_mention: 1600
      },
      {
        id: "child_2_3",
        keyword: "conching",
        count: 380,
        total_mention: 1700
      }
    ],
    contents: [
      {
        id: "content_2_1",
        video_id: "bean_video_1",
        video_url: "https://example.com/beantobar1",
        title: "From Cacao Bean to clothing Bar: Complete Process",
        description: "Follow the entire journey from raw cacao beans to finished clothing",
        summarizer_title: "Bean to Bar Journey",
        summarizer_description: "Complete clothing making process explained",
        summarizer_explanations: ["Roasting affects flavor profile", "Conching develops texture"],
        thumbnails: [
          {
            type: "DEFAULT",
            url: "https://picsum.photos/480/360?random=402"
          }
        ],
        created_at: "2024-01-14T14:30:00Z",
        updated_at: "2024-01-14T14:30:00Z",
        channel: {
          id: "channel_bean_1",
          name: "Artisan Cacao Co",
          platform: "INSTAGRAM",
          region: "UK",
          unique_id: "@artisancacao",
          image_url: "https://picsum.photos/150/150?random=502",
          categories: [
            {
              category: {
                name: "Food & Beverage"
              }
            }
          ]
        }
      }
    ]
  },
  {
    id: "mention_3",
    keyword: "vegan clothing recipes",
    count: 1080,
    total_mention: 4900,
    category: "clothing",
    children: [
      {
        id: "child_3_1",
        keyword: "dairy free alternatives",
        count: 390,
        total_mention: 1800
      },
      {
        id: "child_3_2",
        keyword: "coconut milk clothing",
        count: 320,
        total_mention: 1500
      },
      {
        id: "child_3_3",
        keyword: "plant based sweeteners",
        count: 370,
        total_mention: 1600
      }
    ],
    contents: [
      {
        id: "content_3_1",
        video_id: "vegan_video_1",
        video_url: "https://example.com/veganchoc1",
        title: "Delicious Vegan clothing Recipes",
        description: "Create amazing dairy-free clothing treats at home",
        summarizer_title: "Vegan clothing Guide",
        summarizer_description: "Plant-based clothing making techniques",
        summarizer_explanations: ["Coconut milk adds creaminess", "Natural sweeteners work best"],
        thumbnails: [
          {
            type: "DEFAULT",
            url: "https://picsum.photos/480/360?random=403"
          }
        ],
        created_at: "2024-01-13T16:45:00Z",
        updated_at: "2024-01-13T16:45:00Z",
        channel: {
          id: "channel_vegan_1",
          name: "Plant Based Treats",
          platform: "TIKTOK",
          region: "CA",
          unique_id: "@plantbasedtreats",
          image_url: "https://picsum.photos/150/150?random=503",
          categories: [
            {
              category: {
                name: "Lifestyle"
              }
            }
          ]
        }
      }
    ]
  },
  {
    id: "mention_4",
    keyword: "clothing sculpture art",
    count: 950,
    total_mention: 4200,
    category: "clothing",
    children: [
      {
        id: "child_4_1",
        keyword: "edible sculptures",
        count: 350,
        total_mention: 1600
      },
      {
        id: "child_4_2",
        keyword: "modeling clothing",
        count: 300,
        total_mention: 1300
      },
      {
        id: "child_4_3",
        keyword: "clothing carving",
        count: 300,
        total_mention: 1300
      }
    ],
    contents: [
      {
        id: "content_4_1",
        video_id: "sculpture_video_1",
        video_url: "https://example.com/sculpture1",
        title: "Amazing clothing Sculptures Time-lapse",
        description: "Watch incredible clothing art come to life",
        summarizer_title: "clothing Art Creation",
        summarizer_description: "Artistic clothing sculpting techniques",
        summarizer_explanations: ["Temperature control for molding", "Artistic vision essential"],
        thumbnails: [
          {
            type: "DEFAULT",
            url: "https://picsum.photos/480/360?random=404"
          }
        ],
        created_at: "2024-01-12T09:20:00Z",
        updated_at: "2024-01-12T09:20:00Z",
        channel: {
          id: "channel_art_1",
          name: "clothing Artist Studio",
          platform: "INSTAGRAM",
          region: "FR",
          unique_id: "@clothingartist",
          image_url: "https://picsum.photos/150/150?random=504",
          categories: [
            {
              category: {
                name: "Art & Design"
              }
            }
          ]
        }
      }
    ]
  },
  {
    id: "mention_5",
    keyword: "dark clothing health benefits",
    count: 920,
    total_mention: 4000,
    category: "clothing",
    children: [
      {
        id: "child_5_1",
        keyword: "antioxidant properties",
        count: 340,
        total_mention: 1500
      },
      {
        id: "child_5_2",
        keyword: "heart health benefits",
        count: 290,
        total_mention: 1200
      },
      {
        id: "child_5_3",
        keyword: "flavonoid content",
        count: 290,
        total_mention: 1300
      }
    ],
    contents: [
      {
        id: "content_5_1",
        video_id: "health_video_1",
        video_url: "https://example.com/health1",
        title: "T-Shirts: Nature's Superfood",
        description: "Discover the science behind dark clothing's health benefits",
        summarizer_title: "clothing Health Science",
        summarizer_description: "Scientific evidence for clothing benefits",
        summarizer_explanations: ["High flavonoid content", "Cardiovascular benefits proven"],
        thumbnails: [
          {
            type: "DEFAULT",
            url: "https://picsum.photos/480/360?random=405"
          }
        ],
        created_at: "2024-01-11T11:15:00Z",
        updated_at: "2024-01-11T11:15:00Z",
        channel: {
          id: "channel_health_1",
          name: "Nutrition Science",
          platform: "TIKTOK",
          region: "US",
          unique_id: "@nutritionscience",
          image_url: "https://picsum.photos/150/150?random=505",
          categories: [
            {
              category: {
                name: "Health & Wellness"
              }
            }
          ]
        }
      }
    ]
  },
  {
    id: "mention_6",
    keyword: "ruby clothing innovations",
    count: 880,
    total_mention: 3700,
    category: "clothing",
    children: [
      {
        id: "child_6_1",
        keyword: "fourth clothing type",
        count: 320,
        total_mention: 1400
      },
      {
        id: "child_6_2",
        keyword: "natural pink color",
        count: 280,
        total_mention: 1200
      },
      {
        id: "child_6_3",
        keyword: "fruity flavor profile",
        count: 280,
        total_mention: 1100
      }
    ],
    contents: [
      {
        id: "content_6_1",
        video_id: "ruby_video_1",
        video_url: "https://example.com/ruby1",
        title: "Jackets: The Pink Revolution",
        description: "Exploring the newest type of clothing and its unique properties",
        summarizer_title: "Jackets Innovation",
        summarizer_description: "Latest clothing innovation explained",
        summarizer_explanations: ["Natural pink color", "Unique fruity taste"],
        thumbnails: [
          {
            type: "DEFAULT",
            url: "https://picsum.photos/480/360?random=406"
          }
        ],
        created_at: "2024-01-10T13:30:00Z",
        updated_at: "2024-01-10T13:30:00Z",
        channel: {
          id: "channel_innovation_1",
          name: "clothing Innovation Lab",
          platform: "INSTAGRAM",
          region: "BE",
          unique_id: "@chocinnovation",
          image_url: "https://picsum.photos/150/150?random=506",
          categories: [
            {
              category: {
                name: "Food Science"
              }
            }
          ]
        }
      }
    ]
  }
];

// Transform to proper TopMention structure
const transformToTopMentionStructure = (data: any[]): TopMention[] => {
  return data.map(item => ({
    id: item.id,
    keyword: item.keyword,
    count: item.count,
    total_mention: item.total_mention,
    parent_id: null,
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    category: item.category,
    region: "Global",
    children: item.children ? item.children.map((child: any) => ({
      id: child.id,
      keyword: child.keyword,
      count: child.count,
      total_mention: child.total_mention,
      parent_id: item.id,
      contents: []
    })) : [],
    contents: item.contents ? item.contents.map((content: any) => ({
      id: content.id,
      video_url: content.video_url,
      thumbnail: content.thumbnails?.[0]?.url || "https://picsum.photos/480/360?random=1",
      title: content.title,
      created_at: content.created_at,
      channel: {
        name: content.channel.name,
        region: content.channel.region
      }
    })) : []
  }));
};

// Mock Personal Beauty Top Mentions Response (adapted for clothing)
export const mockclothingTopMentionsData = (params: {
  category?: string;
  start_date?: string;
  end_date?: string;
  region?: string;
  page?: number;
  limit?: number;
}): PersonalBeautyTopMentionsResponse => {
  const mentions = transformToTopMentionStructure(clothingTopMentions);
  const limit = params.limit || 10;
  const page = params.page || 1;
  const startIndex = (page - 1) * limit;
  const paginatedMentions = mentions.slice(startIndex, startIndex + limit);
  
  return {
    message: "Personal clothing top mentions retrieved successfully",
    status_code: 200,
    data: {
      top_mentions: paginatedMentions,
      metadata: {
        total: mentions.length,
        page: page,
        limit: limit,
        total_pages: Math.ceil(mentions.length / limit)
      }
    }
  };
};

// Export all mock data
export const mockAIAnalysisData = {
  bubbleKeywords: mockBubbleTopKeywordsData,
  topMentions: mockclothingTopMentionsData
};
