import axios from "axios";
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
    CreateMarketingItemRequest
} from '../model/marketing-entity';

export const getMarketingItems = async (token: string, filters?: MarketingFilters): Promise<MarketingItemsResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.platform) params.append('platform', filters.platform);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const endpoint = `${process.env['Shop-Intel_ADMIN_URL']}/marketing-items${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get<MarketingItemsResponse>(endpoint, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    console.log(response.data);
    return response.data;
};

export const getMarketings = async (token: string, filters?: MarketingFilters): Promise<MarketingResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.platform) params.append('platform', filters.platform);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const endpoint = `${process.env['Shop-Intel_ADMIN_URL']}/marketings${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get<MarketingResponse>(endpoint, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

export const getMarketingHistoricalData = async (token: string, filters: MarketingHistoricalDataFilters): Promise<MarketingHistoricalDataResponse> => {
    const params = new URLSearchParams();
    params.append('start_date', filters.start_date);
    params.append('end_date', filters.end_date);
    if (filters.platform) params.append('platform', filters.platform);

    const queryString = params.toString();
    const endpoint = `${process.env['Shop-Intel_ADMIN_URL']}/marketings/historical-data?${queryString}`;
    
    const response = await axios.get<MarketingHistoricalDataResponse>(endpoint, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

export const getMarketingById = async (token: string, id: string): Promise<{ success: boolean; data: Marketing }> => {
    const endpoint = `${process.env['Shop-Intel_ADMIN_URL']}/marketings/${id}`;
    const response = await axios.get<{ success: boolean; data: Marketing }>(endpoint, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

export const createMarketing = async (token: string, data: CreateMarketingRequest): Promise<CreateMarketingResponse> => {
    const endpoint = `${process.env['Shop-Intel_ADMIN_URL']}/marketings`;
    const response = await axios.post<CreateMarketingResponse>(endpoint, data, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

export const updateMarketing = async (token: string, id: string, data: UpdateMarketingRequest): Promise<{ success: boolean; data: Marketing }> => {
    const endpoint = `${process.env['Shop-Intel_ADMIN_URL']}/marketings/${id}`;
    const response = await axios.patch<{ success: boolean; data: Marketing }>(endpoint, data, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

export const deleteMarketing = async (token: string, id: string): Promise<{ success: boolean; message: string }> => {
    const endpoint = `${process.env['Shop-Intel_ADMIN_URL']}/marketings/${id}`;
    const response = await axios.delete<{ success: boolean; message: string }>(endpoint, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

export const updateMarketingItem = async (
    token: string,
    itemId: string, 
    data: UpdateMarketingItemRequest
): Promise<{ success: boolean; data: Marketing }> => {
    const endpoint = `${process.env['Shop-Intel_ADMIN_URL']}/marketing-items/${itemId}`;
    
    console.log('🚀 API Call - Update Marketing Item:', {
        method: 'PATCH',
        endpoint: endpoint,
        itemId: itemId,
        payload: data
    });
    
    const response = await axios.patch<{ success: boolean; data: Marketing }>(endpoint, data, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    console.log('📥 API Response - Update Marketing Item:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
    });
    
    return response.data;
};

export const deleteMarketingItem = async (token: string, itemId: string): Promise<{ success: boolean; message: string }> => {
    const endpoint = `${process.env['Shop-Intel_ADMIN_URL']}/marketing-items/${itemId}`;
    const response = await axios.delete<{ success: boolean; message: string }>(endpoint, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// Analytics helper functions
export const calculateTotalCost = (marketingItems: MarketingItem[]): number => {
    return marketingItems.reduce((total, item) => total + item.cost, 0);
};

export const calculateTotalItems = (marketingItems: MarketingItem[]): number => {
    return marketingItems.length;
};

export const getActiveMarketingItems = (marketingItems: MarketingItem[]): MarketingItem[] => {
    const now = new Date();
    return marketingItems.filter(item => {
        const startDate = new Date(item.start_date);
        const endDate = new Date(item.end_date);
        return now >= startDate && now <= endDate;
    });
};

export const getActiveCampaigns = (marketingItems: MarketingItem[]): number => {
    const uniqueCampaigns = new Set(marketingItems.map(item => item.marketing_id));
    return uniqueCampaigns.size;
};

export const getPlatformDistribution = (marketingItems: MarketingItem[]): Record<string, number> => {
    const platforms: Record<string, number> = {};
    
    marketingItems.forEach(item => {
        // Count platforms from marketing_links
        item.marketing_links?.forEach(link => {
            platforms[link.platform] = (platforms[link.platform] || 0) + 1;
        });
    });
    
    return platforms;
};

export const getGroupedMarketingCampaigns = (marketingItems: MarketingItem[]): Marketing[] => {
    const campaignsMap = new Map<string, Marketing & { items: MarketingItem[] }>();
    
    marketingItems.forEach(item => {
        const campaignId = item.marketing.id;
        if (!campaignsMap.has(campaignId)) {
            campaignsMap.set(campaignId, {
                ...item.marketing,
                items: []
            });
        }
        campaignsMap.get(campaignId)!.items.push(item);
    });
    
    return Array.from(campaignsMap.values());
};

// Helper function to extract all marketing items from marketing campaigns
export const extractMarketingItemsFromCampaigns = (marketings: Marketing[]): MarketingItem[] => {
    const allItems: MarketingItem[] = [];
    
    marketings.forEach((marketing: any) => {
        if (marketing.marketing_items) {
            marketing.marketing_items.forEach((item: any) => {
                allItems.push({
                    ...item,
                    marketing: marketing
                });
            });
        }
    });
    
    return allItems;
};

export const createManyMarketingItems = async (token: string, data: CreateMarketingItemRequest[]): Promise<{ success: boolean; data: MarketingItem[] }> => {
    const endpoint = `${process.env['Shop-Intel_ADMIN_URL']}/marketing-items/many`;
    console.log('DTO', data);
    const response = await axios.post(endpoint, data, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};