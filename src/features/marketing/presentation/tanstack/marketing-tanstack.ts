import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getMockMarketingItems,
    getMockMarketings,
    getMockMarketingHistoricalData,
    getMockMarketingById,
    createMockMarketing,
    updateMockMarketing,
    deleteMockMarketing,
    updateMockMarketingItem,
    deleteMockMarketingItem,
    createMockManyMarketingItems,
    getMockPlatformPerformance,
    getMockCampaignPerformance,
    getMockTopPerformingContent,
    getMockMonthlyBudgetData
} from '../../data/services/mock-marketing-api.service';
import {
    Marketing,
    MarketingItem,
    MarketingFilters,
    CreateMarketingRequest,
    CreateMarketingResponse,
    UpdateMarketingRequest,
    UpdateMarketingItemRequest,
    MarketingHistoricalDataFilters,
    CreateMarketingItemRequest
} from '../../data/model/marketing-entity';
import {
    calculateTotalCost,
    calculateTotalItems,
    getActiveMarketingItems,
    getActiveCampaigns,
    getPlatformDistribution
} from '../../data/services/marketing-api-services';
import React from 'react';

// Always use mock data - no backend API
const USE_MOCK_DATA = true;

// Query Keys
export const marketingKeys = {
    all: ['marketing-items'] as const,
    marketings: ['marketings'] as const,
    lists: () => [...marketingKeys.all, 'list'] as const,
    list: (filters?: MarketingFilters) => [...marketingKeys.lists(), filters] as const,
    marketingsList: (filters?: MarketingFilters) => [...marketingKeys.marketings, 'list', filters] as const,
    details: () => [...marketingKeys.all, 'detail'] as const,
    detail: (id: string) => [...marketingKeys.details(), id] as const,
    historicalData: () => [...marketingKeys.all, 'historical-data'] as const,
    historicalDataWithFilters: (filters: MarketingHistoricalDataFilters) => [...marketingKeys.historicalData(), filters] as const,
};

// Hooks for fetching data
export const useMarketingItems = (filters?: MarketingFilters) => {
    return useQuery({
        queryKey: marketingKeys.list(filters),
        queryFn: async () => {
            return getMockMarketingItems('mock-token', filters);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });
};

export const useMarketings = (filters?: MarketingFilters) => {
    return useQuery({
        queryKey: marketingKeys.marketingsList(filters),
        queryFn: async () => {
            return getMockMarketings('mock-token', filters);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });
};

export const useMarketingHistoricalData = (filters: MarketingHistoricalDataFilters) => {
    return useQuery({
        queryKey: marketingKeys.historicalDataWithFilters(filters),
        queryFn: async () => {
            return getMockMarketingHistoricalData('mock-token', filters);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        enabled: !!filters.start_date && !!filters.end_date,
    });
};

export const useMarketing = (id: string, enabled = true) => {
    return useQuery({
        queryKey: marketingKeys.detail(id),
        queryFn: async () => {
            return getMockMarketingById('mock-token', id);
        },
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
};

// Hooks for mutations
export const useCreateMarketing = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateMarketingRequest) => {
            return createMockMarketing('mock-token', data);
        },
        onSuccess: (response: CreateMarketingResponse) => {
            // Invalidate and refetch marketing lists
            queryClient.invalidateQueries({ queryKey: marketingKeys.lists() });
            queryClient.invalidateQueries({ queryKey: marketingKeys.marketings });
            // Invalidate historical data to reflect new marketing items
            queryClient.invalidateQueries({ queryKey: marketingKeys.historicalData() });
            console.log('Marketing created successfully:', response.data);
        },
        onError: (error) => {
            console.error('Error creating marketing:', error);
        },
    });
};

export const useUpdateMarketing = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateMarketingRequest }) => {
            return updateMockMarketing('mock-token', id, data);
        },
        onSuccess: (response, variables) => {
            // Update the specific marketing in cache
            queryClient.setQueryData(
                marketingKeys.detail(variables.id),
                { success: true, data: response.data }
            );
            
            // Invalidate lists to reflect changes
            queryClient.invalidateQueries({ queryKey: marketingKeys.lists() });
            queryClient.invalidateQueries({ queryKey: marketingKeys.marketings });
        },
        onError: (error) => {
            console.error('Error updating marketing:', error);
        },
    });
};

export const useDeleteMarketing = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            return deleteMockMarketing('mock-token', id);
        },
        onSuccess: (_, id) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: marketingKeys.detail(id) });
            
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: marketingKeys.lists() });
            queryClient.invalidateQueries({ queryKey: marketingKeys.marketings });
            // Invalidate historical data
            queryClient.invalidateQueries({ queryKey: marketingKeys.historicalData() });
        },
        onError: (error) => {
            console.error('Error deleting marketing:', error);
        },
    });
};

export const useDeleteMarketingItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (itemId: string) => {
            return deleteMockMarketingItem('mock-token', itemId);
        },
        onSuccess: () => {
            // Invalidate lists to refetch updated data
            queryClient.invalidateQueries({ queryKey: marketingKeys.lists() });
            queryClient.invalidateQueries({ queryKey: marketingKeys.marketings });
            // Invalidate historical data
            queryClient.invalidateQueries({ queryKey: marketingKeys.historicalData() });
        },
        onError: (error) => {
            console.error('Error deleting marketing item:', error);
        },
    });
};

export const useUpdateMarketingItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ 
            itemId, 
            data 
        }: { 
            itemId: string; 
            data: UpdateMarketingItemRequest 
        }) => {
            return updateMockMarketingItem('mock-token', itemId, data);
        },
        onSuccess: (response, variables) => {
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: marketingKeys.lists() });
            queryClient.invalidateQueries({ queryKey: marketingKeys.marketings });
        },
        onError: (error) => {
            console.error('Error updating marketing item:', error);
        },
    });
};

// Computed data hooks
export const useMarketingAnalytics = (filters?: MarketingFilters) => {
    const { data: marketingItemsResponse, isLoading, error } = useMarketingItems(filters);
    
    const analytics = React.useMemo(() => {
        if (!marketingItemsResponse?.data?.marketing_items) {
            return {
                totalCost: 0,
                totalItems: 0,
                activeItems: 0,
                activeCampaigns: 0,
                platformDistribution: {},
                avgCostPerItem: 0,
                recentItems: [],
                groupedCampaigns: []
            };
        }

        const marketingItems = marketingItemsResponse.data.marketing_items;
        
        const totalCost = calculateTotalCost(marketingItems);
        const totalItems = calculateTotalItems(marketingItems);
        const activeItems = getActiveMarketingItems(marketingItems);
        const activeCampaigns = getActiveCampaigns(marketingItems);
        const platformDistribution = getPlatformDistribution(marketingItems);
        
        return {
            totalCost,
            totalItems,
            activeItems: activeItems.length,
            activeCampaigns,
            platformDistribution,
            avgCostPerItem: totalItems > 0 ? totalCost / totalItems : 0,
            recentItems: marketingItems
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5),
            groupedCampaigns: marketingItems
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        };
    }, [marketingItemsResponse]);

    return {
        analytics,
        isLoading,
        error,
        marketings: [], // Not available from marketing-items endpoint
        marketingItems: marketingItemsResponse?.data?.marketing_items || []
    };
};

export const useCreateManyMarketingItems = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateMarketingItemRequest[]) => {
            return createMockManyMarketingItems('mock-token', data);
        },
        onMutate: async (newItems) => {
            await queryClient.cancelQueries({ queryKey: marketingKeys.lists() });

            const previousItems = queryClient.getQueryData(marketingKeys.lists());

            queryClient.setQueryData(marketingKeys.lists(), (old: any) => {
                const oldItems = old?.data?.marketing_items || [];
                return {
                    ...old,
                    data: {
                        ...old?.data,
                        marketing_items: [...oldItems, ...newItems]
                    }
                };
            });

            return { previousItems };
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: marketingKeys.lists() });
            queryClient.invalidateQueries({ queryKey: marketingKeys.marketings });
            queryClient.invalidateQueries({ queryKey: marketingKeys.historicalData() });
            
            console.log('Marketing items created successfully:', response);
        },
        onError: (error, variables, context) => {
            if (context?.previousItems) {
                queryClient.setQueryData(marketingKeys.lists(), context.previousItems);
            }
            console.error('Error creating marketing items:', error);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: marketingKeys.lists() });
        },
    });
};

// Additional analytics hooks for marketing data
export const usePlatformPerformance = () => {
    return useQuery({
        queryKey: ['marketing-platform-performance'],
        queryFn: async () => {
            return getMockPlatformPerformance('mock-token');
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useCampaignPerformance = (campaignId: string) => {
    return useQuery({
        queryKey: ['marketing-campaign-performance', campaignId],
        queryFn: async () => {
            return getMockCampaignPerformance('mock-token', campaignId);
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: !!campaignId,
    });
};

export const useTopPerformingContent = () => {
    return useQuery({
        queryKey: ['marketing-top-performing-content'],
        queryFn: async () => {
            return getMockTopPerformingContent('mock-token');
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useMonthlyBudgetData = () => {
    return useQuery({
        queryKey: ['marketing-monthly-budget'],
        queryFn: async () => {
            return getMockMonthlyBudgetData('mock-token');
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}; 