import { useQuery } from "@tanstack/react-query";
import { 
    getMockTopPerformingCompetitors, 
    getMockOverviewMetadata, 
    getMockEngagementRateComparison, 
    getMockEngagementGrowthTrend, 
    getMockCompetitorContent, 
    getMockPlatformPerformanceSplit, 
    getMockPerformanceMetadata, 
    getMock24hPerformanceChanges 
} from "../../data/services/mock-competitor-api.service";
import { TopPerformingCompetitorsParams, OverviewMetadataParams, EngagementRateComparisonParams, EngagementGrowthTrendParams, CompetitorContentParams, PlatformPerformanceSplitParams, PerformanceMetadataParams, Performance24hParams } from "../../data/model/competitor-model";

// Use mock data only (frontend-only project)
const USE_MOCK_DATA = true;

export const useTopPerformingCompetitors = (params?: TopPerformingCompetitorsParams) => {
    return useQuery({
        queryKey: ['topPerformingCompetitors', params, USE_MOCK_DATA],
        queryFn: () => getMockTopPerformingCompetitors(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 3,
    });
};

export const useOverviewMetadata = (params?: OverviewMetadataParams) => {
    return useQuery({
        queryKey: ['overviewMetadata', params, USE_MOCK_DATA],
        queryFn: () => getMockOverviewMetadata(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 3,
    });
};

export const useEngagementRateComparison = (params?: EngagementRateComparisonParams) => {
    return useQuery({
        queryKey: ['engagementRateComparison', params, USE_MOCK_DATA],
        queryFn: () => getMockEngagementRateComparison(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 3,
    });
};

export const useEngagementGrowthTrend = (params?: EngagementGrowthTrendParams) => {
    return useQuery({
        queryKey: ['engagementGrowthTrend', params, USE_MOCK_DATA],
        queryFn: () => getMockEngagementGrowthTrend(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 3,
    });
};

export const useCompetitorContent = (params: CompetitorContentParams) => {
    return useQuery({
        queryKey: ['competitorContent', params, USE_MOCK_DATA],
        queryFn: () => getMockCompetitorContent(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 3,
        enabled: !!params.channel_id, // Only run query if channel_id is provided
    });
};

export const usePlatformPerformanceSplit = (params?: PlatformPerformanceSplitParams) => {
    return useQuery({
        queryKey: ['platformPerformanceSplit', params, USE_MOCK_DATA],
        queryFn: () => getMockPlatformPerformanceSplit(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 3,
    });
};

export const usePerformanceMetadata = (params?: PerformanceMetadataParams) => {
    return useQuery({
        queryKey: ['performanceMetadata', params, USE_MOCK_DATA],
        queryFn: () => getMockPerformanceMetadata(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 3,
    });
};

export const use24hPerformanceChanges = (params?: Performance24hParams) => {
    return useQuery({
        queryKey: ['24hPerformanceChanges', params, USE_MOCK_DATA],
        queryFn: () => getMock24hPerformanceChanges(params),
        staleTime: 1000 * 60 * 2, // 2 minutes (more frequent for 24h data)
        gcTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: true,
        retry: 3,
        refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes for real-time data
    });
};
