import { useQuery } from "@tanstack/react-query";
import { 
    getMockContentMetadata, 
    getMockTopChannels, 
    searchMockContent, 
    getMockTopContents,
    getMockTrendingTopics,
    getMockChannelById,
    getMockContentById
} from "../../data/services/mock-trend-api.service";
import { ContentParams, ChannelsParams, SearchParams, TopContentsParams } from "../../data/model/trend-model";

// Use mock data only (frontend-only project)
const USE_MOCK_DATA = true;

export const useContentMetadata = (params?: ContentParams) => {
    return useQuery({
        queryKey: ['contentMetadata', params, USE_MOCK_DATA],
        queryFn: () => getMockContentMetadata(params),
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        refetchOnWindowFocus: false,
        retry: 3,
    });
};

export const useTopChannels = (params?: ChannelsParams) => {
    return useQuery({
        queryKey: ['topChannels', params, USE_MOCK_DATA],
        queryFn: () => getMockTopChannels(params),
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        refetchOnWindowFocus: false,
        retry: 3,
    });
};

export const useSearchContent = (params: SearchParams) => {
    return useQuery({
        queryKey: ['searchContent', params, USE_MOCK_DATA],
        queryFn: () => searchMockContent(params),
        staleTime: 1000 * 60 * 5, // 5 minutes (shorter for search results)
        gcTime: 1000 * 60 * 30, // 30 minutes
        refetchOnWindowFocus: false,
        retry: 3,
        enabled: !!params.query.trim(), // Only run query if there's a search term
    });
};

export const useTopContents = (params?: TopContentsParams) => {
    return useQuery({
        queryKey: ['topContents', params, USE_MOCK_DATA],
        queryFn: () => getMockTopContents(params),
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        refetchOnWindowFocus: false,
        retry: 3,
    });
};

// Additional hooks for mock data
export const useTrendingTopics = () => {
    return useQuery({
        queryKey: ['trendingTopics', USE_MOCK_DATA],
        queryFn: () => getMockTrendingTopics(),
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        refetchOnWindowFocus: false,
        retry: 3,
        enabled: USE_MOCK_DATA, // Only available with mock data
    });
};

export const useChannelById = (channelId: string) => {
    return useQuery({
        queryKey: ['channelById', channelId, USE_MOCK_DATA],
        queryFn: () => getMockChannelById(channelId),
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        refetchOnWindowFocus: false,
        retry: 3,
        enabled: !!channelId && USE_MOCK_DATA, // Only available with mock data and valid ID
    });
};

export const useContentById = (contentId: string) => {
    return useQuery({
        queryKey: ['contentById', contentId, USE_MOCK_DATA],
        queryFn: () => getMockContentById(contentId),
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        refetchOnWindowFocus: false,
        retry: 3,
        enabled: !!contentId && USE_MOCK_DATA, // Only available with mock data and valid ID
    });
};
