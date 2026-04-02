import {
  BubbleTopKeyword,
  BubbleTopKeywordsResponse,
  TopMention,
  PersonalBeautyTopMentionsResponse
} from '../model/ai-model';

// Skincare & beauty bubble keywords (mock)
const beautyKeywordsHierarchy = [
  {
    id: "sk_1",
    keyword: "skin barrier repair",
    count: 2450,
    total_mention: 12500,
    parent_id: null,
    category: "Barrier",
    region: "Global",
    children: [
      { id: "sk_1_1", keyword: "ceramide cream", count: 890, total_mention: 4200, parent_id: "sk_1", category: "Barrier", region: "Global", children: [] },
      { id: "sk_1_2", keyword: "panthenol serum", count: 1240, total_mention: 5800, parent_id: "sk_1", category: "Barrier", region: "Global", children: [] },
      { id: "sk_1_3", keyword: "squalane oil", count: 320, total_mention: 1500, parent_id: "sk_1", category: "Barrier", region: "Global", children: [] }
    ]
  },
  {
    id: "sk_2",
    keyword: "double cleanse",
    count: 2100,
    total_mention: 11200,
    parent_id: null,
    category: "Cleansing",
    region: "SEA",
    children: [
      { id: "sk_2_1", keyword: "balm cleanser", count: 850, total_mention: 4100, parent_id: "sk_2", category: "Cleansing", region: "SEA", children: [] },
      { id: "sk_2_2", keyword: "low pH gel", count: 680, total_mention: 3200, parent_id: "sk_2", category: "Cleansing", region: "SEA", children: [] },
      { id: "sk_2_3", keyword: "micellar water", count: 570, total_mention: 2800, parent_id: "sk_2", category: "Cleansing", region: "SEA", children: [] }
    ]
  },
  {
    id: "sk_3",
    keyword: "glass skin routine",
    count: 1950,
    total_mention: 9800,
    parent_id: null,
    category: "Glow",
    region: "Global",
    children: [
      { id: "sk_3_1", keyword: "essence layering", count: 780, total_mention: 3900, parent_id: "sk_3", category: "Glow", region: "Global", children: [] },
      { id: "sk_3_2", keyword: "humectant stack", count: 650, total_mention: 3200, parent_id: "sk_3", category: "Glow", region: "Global", children: [] },
      { id: "sk_3_3", keyword: "dewy SPF", count: 520, total_mention: 2700, parent_id: "sk_3", category: "Glow", region: "Global", children: [] }
    ]
  },
  {
    id: "sk_4",
    keyword: "SPF malaysia",
    count: 1800,
    total_mention: 8900,
    parent_id: null,
    category: "Sun care",
    region: "Malaysia",
    children: [
      { id: "sk_4_1", keyword: "PA++++ fluid", count: 720, total_mention: 3500, parent_id: "sk_4", category: "Sun care", region: "Malaysia", children: [] },
      { id: "sk_4_2", keyword: "reef safe mineral", count: 680, total_mention: 3200, parent_id: "sk_4", category: "Sun care", region: "Malaysia", children: [] },
      { id: "sk_4_3", keyword: "reapply hacks", count: 400, total_mention: 2200, parent_id: "sk_4", category: "Sun care", region: "Malaysia", children: [] }
    ]
  },
  {
    id: "sk_5",
    keyword: "retinol beginner",
    count: 1650,
    total_mention: 7800,
    parent_id: null,
    category: "Actives",
    region: "Global",
    children: [
      { id: "sk_5_1", keyword: "sandwich method", count: 620, total_mention: 3000, parent_id: "sk_5", category: "Actives", region: "Global", children: [] },
      { id: "sk_5_2", keyword: "encapsulated retinol", count: 580, total_mention: 2800, parent_id: "sk_5", category: "Actives", region: "Global", children: [] },
      { id: "sk_5_3", keyword: "purge vs breakout", count: 450, total_mention: 2000, parent_id: "sk_5", category: "Actives", region: "Global", children: [] }
    ]
  },
  {
    id: "sk_6",
    keyword: "vitamin C brightening",
    count: 1580,
    total_mention: 7400,
    parent_id: null,
    category: "Brightening",
    region: "Global",
    children: [
      { id: "sk_6_1", keyword: "ethyl ascorbic acid", count: 650, total_mention: 3100, parent_id: "sk_6", category: "Brightening", region: "Global", children: [] },
      { id: "sk_6_2", keyword: "ferulic pairing", count: 520, total_mention: 2500, parent_id: "sk_6", category: "Brightening", region: "Global", children: [] },
      { id: "sk_6_3", keyword: "oxidation storage", count: 410, total_mention: 1800, parent_id: "sk_6", category: "Brightening", region: "Global", children: [] }
    ]
  },
  {
    id: "sk_7",
    keyword: "niacinamide pores",
    count: 1420,
    total_mention: 6800,
    parent_id: null,
    category: "Texture",
    region: "Global",
    children: [
      { id: "sk_7_1", keyword: "10 percent serum", count: 580, total_mention: 2800, parent_id: "sk_7", category: "Texture", region: "Global", children: [] },
      { id: "sk_7_2", keyword: "sebum control", count: 520, total_mention: 2400, parent_id: "sk_7", category: "Texture", region: "Global", children: [] },
      { id: "sk_7_3", keyword: "with salicylic acid", count: 320, total_mention: 1600, parent_id: "sk_7", category: "Texture", region: "Global", children: [] }
    ]
  },
  {
    id: "sk_8",
    keyword: "K-beauty malaysia",
    count: 1350,
    total_mention: 6200,
    parent_id: null,
    category: "Retail",
    region: "Malaysia",
    children: [
      { id: "sk_8_1", keyword: "innisfree shopee", count: 560, total_mention: 2600, parent_id: "sk_8", category: "Retail", region: "Malaysia", children: [] },
      { id: "sk_8_2", keyword: "laneige trial kit", count: 480, total_mention: 2200, parent_id: "sk_8", category: "Retail", region: "Malaysia", children: [] },
      { id: "sk_8_3", keyword: "hermo flash sale", count: 310, total_mention: 1400, parent_id: "sk_8", category: "Retail", region: "Malaysia", children: [] }
    ]
  }
];

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

export const mockBubbleTopKeywordsData = (params?: {
  start_date?: string;
  end_date?: string;
}): BubbleTopKeywordsResponse => {
  const keywords = transformToKeywordStructure(beautyKeywordsHierarchy);

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

const beautyTopMentions = [
  {
    id: "mention_1",
    keyword: "barrier repair night routine",
    count: 1250,
    total_mention: 5800,
    category: "skincare",
    children: [
      { id: "child_1_1", keyword: "ceramide moisturizer", count: 450, total_mention: 2100 },
      { id: "child_1_2", keyword: "occlusive last step", count: 380, total_mention: 1800 },
      { id: "child_1_3", keyword: "slugging safety", count: 420, total_mention: 1900 }
    ],
    contents: [
      {
        id: "content_1_1",
        video_id: "barrier_video_1",
        video_url: "https://example.com/barrier1",
        title: "Barrier repair after Malaysian air-con",
        description: "Ceramide cream and occlusive finish for dehydrated office skin",
        summarizer_title: "AC dehydration fix",
        summarizer_description: "Night stack when indoor humidity drops",
        summarizer_explanations: ["Ceramides support lipid matrix", "Occlusive reduces TEWL"],
        thumbnails: [{ type: "DEFAULT", url: "https://picsum.photos/480/360?random=401" }],
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
        channel: {
          id: "channel_barrier_1",
          name: "Derm Decoder",
          platform: "TIKTOK",
          region: "MY",
          unique_id: "@dermdecoder",
          image_url: "https://picsum.photos/150/150?random=501",
          categories: [{ category: { name: "Beauty & Skincare" } }]
        }
      }
    ]
  },
  {
    id: "mention_2",
    keyword: "double cleanse humid climate",
    count: 1150,
    total_mention: 5200,
    category: "skincare",
    children: [
      { id: "child_2_1", keyword: "oil cleanser balm", count: 420, total_mention: 1900 },
      { id: "child_2_2", keyword: "second cleanse gel", count: 350, total_mention: 1600 },
      { id: "child_2_3", keyword: "sunscreen removal", count: 380, total_mention: 1700 }
    ],
    contents: [
      {
        id: "content_2_1",
        video_id: "dc_video_1",
        video_url: "https://example.com/doublecleanse1",
        title: "Double cleanse that does not strip",
        description: "Balm plus low-pH gel for sweat and SPF in KL humidity",
        summarizer_title: "Humid double cleanse",
        summarizer_description: "Product types that rinse clean without squeak",
        summarizer_explanations: ["Oil lifts SPF and sebum", "Second step resets pH"],
        thumbnails: [{ type: "DEFAULT", url: "https://picsum.photos/480/360?random=402" }],
        created_at: "2024-01-14T14:30:00Z",
        updated_at: "2024-01-14T14:30:00Z",
        channel: {
          id: "channel_dc_1",
          name: "Beauty Skincare ShopIntel",
          platform: "INSTAGRAM",
          region: "MY",
          unique_id: "@beautyskincareshopintel",
          image_url: "https://picsum.photos/150/150?random=502",
          categories: [{ category: { name: "Beauty & Skincare" } }]
        }
      }
    ]
  },
  {
    id: "mention_3",
    keyword: "SPF layering makeup",
    count: 1080,
    total_mention: 4900,
    category: "skincare",
    children: [
      { id: "child_3_1", keyword: "fluid sunscreen", count: 390, total_mention: 1800 },
      { id: "child_3_2", keyword: "no pilling primer", count: 320, total_mention: 1500 },
      { id: "child_3_3", keyword: "two finger rule", count: 370, total_mention: 1600 }
    ],
    contents: [
      {
        id: "content_3_1",
        video_id: "spf_video_1",
        video_url: "https://example.com/spf1",
        title: "SPF under foundation — zero pilling",
        description: "Asian fluid textures vs Western filters with foundation on top",
        summarizer_title: "SPF makeup stack",
        summarizer_description: "Order and dry-down timing for a smooth base",
        summarizer_explanations: ["Wait for film former", "Avoid silicone clash"],
        thumbnails: [{ type: "DEFAULT", url: "https://picsum.photos/480/360?random=403" }],
        created_at: "2024-01-13T16:45:00Z",
        updated_at: "2024-01-13T16:45:00Z",
        channel: {
          id: "channel_spf_1",
          name: "Sephora Malaysia",
          platform: "TIKTOK",
          region: "MY",
          unique_id: "@sephoramalaysia",
          image_url: "https://picsum.photos/150/150?random=503",
          categories: [{ category: { name: "Beauty & Skincare" } }]
        }
      }
    ]
  },
  {
    id: "mention_4",
    keyword: "Watsons skincare haul",
    count: 950,
    total_mention: 4200,
    category: "skincare",
    children: [
      { id: "child_4_1", keyword: "CeraVe cleanser", count: 350, total_mention: 1600 },
      { id: "child_4_2", keyword: "La Roche-Posay SPF", count: 300, total_mention: 1300 },
      { id: "child_4_3", keyword: "drugstore niacinamide", count: 300, total_mention: 1300 }
    ],
    contents: [
      {
        id: "content_4_1",
        video_id: "watsons_video_1",
        video_url: "https://example.com/watsons1",
        title: "Watsons routine under RM200",
        description: "Dermocosmetic picks that match humid-skin needs",
        summarizer_title: "Drugstore derm haul",
        summarizer_description: "Cleanser, moisturizer, and SPF combo",
        summarizer_explanations: ["Look for ceramides", "Test SPF indoors first"],
        thumbnails: [{ type: "DEFAULT", url: "https://picsum.photos/480/360?random=404" }],
        created_at: "2024-01-12T09:20:00Z",
        updated_at: "2024-01-12T09:20:00Z",
        channel: {
          id: "channel_watsons_1",
          name: "Watsons Malaysia",
          platform: "INSTAGRAM",
          region: "MY",
          unique_id: "@watsonsmalaysia",
          image_url: "https://picsum.photos/150/150?random=504",
          categories: [{ category: { name: "Beauty & Skincare" } }]
        }
      }
    ]
  },
  {
    id: "mention_5",
    keyword: "Hermo flash deals",
    count: 920,
    total_mention: 4000,
    category: "skincare",
    children: [
      { id: "child_5_1", keyword: "K-beauty bundles", count: 340, total_mention: 1500 },
      { id: "child_5_2", keyword: "authenticity checks", count: 290, total_mention: 1200 },
      { id: "child_5_3", keyword: "shipping oxidation", count: 290, total_mention: 1300 }
    ],
    contents: [
      {
        id: "content_5_1",
        video_id: "hermo_video_1",
        video_url: "https://example.com/hermo1",
        title: "Hermo 12.12 — what is actually worth it",
        description: "Vitamin C and sunscreen deals vs full-price Sephora",
        summarizer_title: "Online beauty sale math",
        summarizer_description: "Expiry dates and bundle traps explained",
        summarizer_explanations: ["Check PAO", "Airless pumps help stability"],
        thumbnails: [{ type: "DEFAULT", url: "https://picsum.photos/480/360?random=405" }],
        created_at: "2024-01-11T11:15:00Z",
        updated_at: "2024-01-11T11:15:00Z",
        channel: {
          id: "channel_hermo_1",
          name: "Hermo Malaysia",
          platform: "TIKTOK",
          region: "MY",
          unique_id: "@hermomy",
          image_url: "https://picsum.photos/150/150?random=505",
          categories: [{ category: { name: "Beauty & Skincare" } }]
        }
      }
    ]
  },
  {
    id: "mention_6",
    keyword: "b.liv malaysia review",
    count: 880,
    total_mention: 3700,
    category: "skincare",
    children: [
      { id: "child_6_1", keyword: "blackhead serum", count: 320, total_mention: 1400 },
      { id: "child_6_2", keyword: "pore strip alternative", count: 280, total_mention: 1200 },
      { id: "child_6_3", keyword: "local brand routine", count: 280, total_mention: 1100 }
    ],
    contents: [
      {
        id: "content_6_1",
        video_id: "bliv_video_1",
        video_url: "https://example.com/bliv1",
        title: "b.liv vs imported dupes — 60-day test",
        description: "Malaysian brand on pores and texture in humid weather",
        summarizer_title: "Local skincare benchmark",
        summarizer_description: "Honest wear test with sebum tracking",
        summarizer_explanations: ["Salicylic gentle use", "Hydration still required"],
        thumbnails: [{ type: "DEFAULT", url: "https://picsum.photos/480/360?random=406" }],
        created_at: "2024-01-10T13:30:00Z",
        updated_at: "2024-01-10T13:30:00Z",
        channel: {
          id: "channel_bliv_1",
          name: "b.liv",
          platform: "INSTAGRAM",
          region: "MY",
          unique_id: "@blivskin",
          image_url: "https://picsum.photos/150/150?random=506",
          categories: [{ category: { name: "Beauty & Skincare" } }]
        }
      }
    ]
  }
];

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

export const mockBeautyTopMentionsData = (params: {
  category?: string;
  start_date?: string;
  end_date?: string;
  region?: string;
  page?: number;
  limit?: number;
}): PersonalBeautyTopMentionsResponse => {
  const mentions = transformToTopMentionStructure(beautyTopMentions);
  const limit = params.limit || 10;
  const page = params.page || 1;
  const startIndex = (page - 1) * limit;
  const paginatedMentions = mentions.slice(startIndex, startIndex + limit);

  return {
    message: "Personal beauty top mentions retrieved successfully",
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

/** @deprecated Use mockBeautyTopMentionsData */
export const mockclothingTopMentionsData = mockBeautyTopMentionsData;

export const mockAIAnalysisData = {
  bubbleKeywords: mockBubbleTopKeywordsData,
  topMentions: mockBeautyTopMentionsData
};
