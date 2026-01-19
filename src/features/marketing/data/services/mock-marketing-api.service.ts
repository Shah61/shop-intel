import {
    Marketing,
    MarketingItem,
    MarketingItemsResponse,
    MarketingResponse,
    MarketingFilters,
    CreateMarketingRequest,
    CreateMarketingResponse,
    UpdateMarketingRequest,
    UpdateMarketingItemRequest,
    MarketingHistoricalDataResponse,
    MarketingHistoricalDataFilters,
    CreateMarketingItemRequest,
    MarketingHistoricalDataMeta
} from '../model/marketing-entity';

import {
    generateMarketingCampaigns,
    generateMarketingItemsList,
    generateMarketingHistoricalData,
    generatePlatformPerformanceData,
    generateCampaignPerformanceData,
    generateTopPerformingContent,
    generateMonthlyBudgetData
} from '../mock/marketing-dummy-data';

// Mock delay to simulate API call
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock storage for generated data (simulates database)
let mockMarketingCampaigns = generateMarketingCampaigns(12);
let mockMarketingItems = generateMarketingItemsList();

// Helper function to apply filters
const applyFilters = <T extends { created_at?: string; start_date?: string; marketing_links?: Array<{ platform: string }> }>(
    items: T[],
    filters?: MarketingFilters
): T[] => {
    if (!filters) return items;

    let filtered = [...items];

    // Date filters
    if (filters.start_date) {
        filtered = filtered.filter(item => {
            const itemDate = new Date(item.start_date || item.created_at || '');
            return itemDate >= new Date(filters.start_date!);
        });
    }

    if (filters.end_date) {
        filtered = filtered.filter(item => {
            const itemDate = new Date(item.start_date || item.created_at || '');
            return itemDate <= new Date(filters.end_date!);
        });
    }

    // Platform filter
    if (filters.platform) {
        filtered = filtered.filter(item => {
            if ('marketing_links' in item && item.marketing_links) {
                return item.marketing_links.some(link => 
                    link.platform.toLowerCase() === filters.platform!.toLowerCase()
                );
            }
            return true;
        });
    }

    return filtered;
};

// Helper function to apply pagination
const applyPagination = <T>(items: T[], filters?: MarketingFilters): { items: T[]; total: number } => {
    const total = items.length;
    
    if (!filters?.limit && !filters?.offset) {
        return { items, total };
    }

    const offset = filters?.offset || 0;
    const limit = filters?.limit || items.length;
    
    const paginatedItems = items.slice(offset, offset + limit);
    
    return { items: paginatedItems, total };
};

// Mock API functions
export const getMockMarketingItems = async (token: string, filters?: MarketingFilters): Promise<MarketingItemsResponse> => {
    await mockDelay();
    
    const filteredItems = applyFilters(mockMarketingItems, filters);
    const { items: paginatedItems, total } = applyPagination(filteredItems, filters);
    
    return {
        success: true,
        message: 'Marketing items retrieved successfully',
        data: {
            marketing_items: paginatedItems,
            meta: {
                total
            }
        }
    };
};

export const getMockMarketings = async (token: string, filters?: MarketingFilters): Promise<MarketingResponse> => {
    await mockDelay();
    
    const filteredCampaigns = applyFilters(mockMarketingCampaigns, filters);
    const { items: paginatedCampaigns, total } = applyPagination(filteredCampaigns, filters);
    
    return {
        success: true,
        message: 'Marketing campaigns retrieved successfully',
        data: {
            marketing: paginatedCampaigns,
            meta: {
                total
            }
        }
    };
};

export const getMockMarketingHistoricalData = async (token: string, filters: MarketingHistoricalDataFilters): Promise<MarketingHistoricalDataResponse> => {
    await mockDelay();
    
    const historicalData = generateMarketingHistoricalData(filters.start_date, filters.end_date);
    
    const metadata: MarketingHistoricalDataMeta = {
        total: historicalData.length,
        start_date: filters.start_date,
        end_date: filters.end_date
    };
    
    return {
        success: true,
        message: 'Historical data retrieved successfully',
        data: {
            historicalData,
            metadata
        }
    };
};

export const getMockMarketingById = async (token: string, id: string): Promise<{ success: boolean; data: Marketing }> => {
    await mockDelay();
    
    const marketing = mockMarketingCampaigns.find(m => m.id === id);
    
    if (!marketing) {
        throw new Error(`Marketing campaign with ID ${id} not found`);
    }
    
    return {
        success: true,
        data: marketing
    };
};

export const createMockMarketing = async (token: string, data: CreateMarketingRequest): Promise<CreateMarketingResponse> => {
    await mockDelay();
    
    const newMarketingId = `campaign_${mockMarketingCampaigns.length + 1}`;
    const now = new Date().toISOString();
    
    // Create marketing items
    const marketingItems: MarketingItem[] = data.marketing_items.map((itemData, index) => {
        const itemId = `item_${newMarketingId}_${index + 1}`;
        const endDate = new Date(itemData.start_date);
        endDate.setDate(endDate.getDate() + itemData.duration);
        
        const links = itemData.links.map((linkData, linkIndex) => ({
            id: `link_${itemId}_${linkIndex + 1}`,
            link: linkData.link,
            platform: linkData.platform,
            marketing_item_id: itemId,
            metadata: {},
            created_at: now,
            updated_at: now
        }));
        
        return {
            id: itemId,
            name: itemData.name,
            description: itemData.description,
            cost: itemData.cost,
            duration: itemData.duration,
            start_date: itemData.start_date,
            end_date: endDate.toISOString(),
            marketing_id: newMarketingId,
            created_at: now,
            updated_at: now,
            marketing: {} as Marketing, // Will be set below
            marketing_links: links
        };
    });
    
    const totalCost = marketingItems.reduce((sum, item) => sum + item.cost, 0);
    
    const newMarketing: Marketing = {
        id: newMarketingId,
        name: data.name,
        total_cost: totalCost,
        created_at: now,
        updated_at: now,
        marketing_items: marketingItems
    };
    
    // Update marketing reference in items
    marketingItems.forEach(item => {
        item.marketing = newMarketing;
    });
    
    // Add to mock storage
    mockMarketingCampaigns.push(newMarketing);
    mockMarketingItems.push(...marketingItems);
    
    return {
        success: true,
        message: 'Marketing campaign created successfully',
        data: newMarketing
    };
};

export const updateMockMarketing = async (token: string, id: string, data: UpdateMarketingRequest): Promise<{ success: boolean; data: Marketing }> => {
    await mockDelay();
    
    const marketingIndex = mockMarketingCampaigns.findIndex(m => m.id === id);
    
    if (marketingIndex === -1) {
        throw new Error(`Marketing campaign with ID ${id} not found`);
    }
    
    const updatedMarketing = {
        ...mockMarketingCampaigns[marketingIndex],
        name: data.name,
        updated_at: new Date().toISOString()
    };
    
    mockMarketingCampaigns[marketingIndex] = updatedMarketing;
    
    return {
        success: true,
        data: updatedMarketing
    };
};

export const deleteMockMarketing = async (token: string, id: string): Promise<{ success: boolean; message: string }> => {
    await mockDelay();
    
    const marketingIndex = mockMarketingCampaigns.findIndex(m => m.id === id);
    
    if (marketingIndex === -1) {
        throw new Error(`Marketing campaign with ID ${id} not found`);
    }
    
    // Remove from mock storage
    mockMarketingCampaigns.splice(marketingIndex, 1);
    mockMarketingItems = mockMarketingItems.filter(item => item.marketing_id !== id);
    
    return {
        success: true,
        message: 'Marketing campaign deleted successfully'
    };
};

export const updateMockMarketingItem = async (
    token: string,
    itemId: string, 
    data: UpdateMarketingItemRequest
): Promise<{ success: boolean; data: Marketing }> => {
    await mockDelay();
    
    const itemIndex = mockMarketingItems.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
        throw new Error(`Marketing item with ID ${itemId} not found`);
    }
    
    const item = mockMarketingItems[itemIndex];
    const now = new Date().toISOString();
    
    // Update item data
    const updatedItem = {
        ...item,
        ...data,
        updated_at: now
    };
    
    // Update end_date if start_date or duration changed
    if (data.start_date || data.duration) {
        const startDate = new Date(data.start_date || item.start_date);
        const duration = data.duration || item.duration;
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duration);
        updatedItem.end_date = endDate.toISOString();
    }
    
    // Update links if provided
    if (data.links) {
        updatedItem.marketing_links = data.links.map((linkData, index) => ({
            id: `link_${itemId}_${index + 1}`,
            link: linkData.link,
            platform: linkData.platform,
            marketing_item_id: itemId,
            metadata: {},
            created_at: item.marketing_links[index]?.created_at || now,
            updated_at: now
        }));
    }
    
    mockMarketingItems[itemIndex] = updatedItem;
    
    // Update campaign total cost
    const campaign = mockMarketingCampaigns.find(c => c.id === item.marketing_id);
    if (campaign) {
        const campaignItems = mockMarketingItems.filter(i => i.marketing_id === campaign.id);
        campaign.total_cost = campaignItems.reduce((sum, i) => sum + i.cost, 0);
        campaign.updated_at = now;
    }
    
    return {
        success: true,
        data: item.marketing
    };
};

export const deleteMockMarketingItem = async (token: string, itemId: string): Promise<{ success: boolean; message: string }> => {
    await mockDelay();
    
    const itemIndex = mockMarketingItems.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
        throw new Error(`Marketing item with ID ${itemId} not found`);
    }
    
    const item = mockMarketingItems[itemIndex];
    
    // Remove from mock storage
    mockMarketingItems.splice(itemIndex, 1);
    
    // Update campaign total cost
    const campaign = mockMarketingCampaigns.find(c => c.id === item.marketing_id);
    if (campaign) {
        const campaignItems = mockMarketingItems.filter(i => i.marketing_id === campaign.id);
        campaign.total_cost = campaignItems.reduce((sum, i) => sum + i.cost, 0);
        campaign.updated_at = new Date().toISOString();
    }
    
    return {
        success: true,
        message: 'Marketing item deleted successfully'
    };
};

export const createMockManyMarketingItems = async (token: string, data: CreateMarketingItemRequest[]): Promise<{ success: boolean; data: MarketingItem[] }> => {
    await mockDelay();
    
    const now = new Date().toISOString();
    const newItems: MarketingItem[] = [];
    
    data.forEach((itemData, index) => {
        const itemId = `item_bulk_${Date.now()}_${index}`;
        const endDate = new Date(itemData.start_date);
        endDate.setDate(endDate.getDate() + itemData.duration);
        
        const links = itemData.links.map((linkData, linkIndex) => ({
            id: `link_${itemId}_${linkIndex + 1}`,
            link: linkData.link,
            platform: linkData.platform,
            marketing_item_id: itemId,
            metadata: {},
            created_at: now,
            updated_at: now
        }));
        
        const marketing = mockMarketingCampaigns.find(c => c.id === itemData.marketing_id);
        
        const newItem: MarketingItem = {
            id: itemId,
            name: itemData.name,
            description: itemData.description,
            cost: itemData.cost,
            duration: itemData.duration,
            start_date: itemData.start_date,
            end_date: endDate.toISOString(),
            marketing_id: itemData.marketing_id || 'default_campaign',
            created_at: now,
            updated_at: now,
            marketing: marketing || mockMarketingCampaigns[0],
            marketing_links: links
        };
        
        newItems.push(newItem);
    });
    
    // Add to mock storage
    mockMarketingItems.push(...newItems);
    
    return {
        success: true,
        data: newItems
    };
};

// Additional analytics functions for mock data
export const getMockPlatformPerformance = async (token: string) => {
    await mockDelay();
    return {
        success: true,
        data: generatePlatformPerformanceData()
    };
};

export const getMockCampaignPerformance = async (token: string, campaignId: string) => {
    await mockDelay();
    return {
        success: true,
        data: generateCampaignPerformanceData(campaignId)
    };
};

export const getMockTopPerformingContent = async (token: string) => {
    await mockDelay();
    return {
        success: true,
        data: generateTopPerformingContent()
    };
};

export const getMockMonthlyBudgetData = async (token: string) => {
    await mockDelay();
    return {
        success: true,
        data: generateMonthlyBudgetData()
    };
};

// Reset mock data (useful for testing)
export const resetMockMarketingData = () => {
    mockMarketingCampaigns = generateMarketingCampaigns(12);
    mockMarketingItems = generateMarketingItemsList();
};
