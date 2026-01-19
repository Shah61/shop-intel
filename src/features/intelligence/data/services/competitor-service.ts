import axios from "axios";
import { TopPerformingCompetitorsResponse, TopPerformingCompetitorsParams, OverviewMetadataResponse, OverviewMetadataParams, EngagementRateComparisonResponse, EngagementRateComparisonParams, EngagementGrowthTrendResponse, EngagementGrowthTrendParams, CompetitorContentResponse, CompetitorContentParams, PlatformPerformanceSplitResponse, PlatformPerformanceSplitParams, PerformanceMetadataResponse, PerformanceMetadataParams, Performance24hResponse, Performance24hParams } from "../model/competitor-model";

export const getTopPerformingCompetitors = async (params?: TopPerformingCompetitorsParams): Promise<TopPerformingCompetitorsResponse> => {
    const apiUrl = "https://api.dialektika.io/server/api/v1/content-analytics-Shop-Intel/top-performing-competitors";
    
    // Provide defaults if params are not provided
    const queryParams = {
        start_date: params?.start_date || '2025-06-21',
        end_date: params?.end_date || '2025-07-21',
        platform: params?.platform,
        source: params?.source,
        page: params?.page,
        limit: params?.limit,
    };

    try {
        const response = await axios.get<TopPerformingCompetitorsResponse>(apiUrl, { 
            params: queryParams,
            headers: {
                'Authorization': 'Bearer $2b$10$z4aAy0KgHyfRo2TbSy5yF.xIZ84r8b2qU1/5aSg7mwHtyPJTuvqzu'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching top performing competitors:', error);
        throw error;
    }
};

export const getOverviewMetadata = async (params?: OverviewMetadataParams): Promise<OverviewMetadataResponse> => {
    const apiUrl = "https://api.dialektika.io/server/api/v1/content-analytics-Shop-Intel/overview-metadata";
    
    // Provide defaults if params are not provided
    const queryParams = {
        start_date: params?.start_date || '2025-06-21',
        end_date: params?.end_date || '2025-07-21',
        platform: params?.platform,
        source: params?.source,
    };

    try {
        const response = await axios.get<OverviewMetadataResponse>(apiUrl, { 
            params: queryParams,
            headers: {
                'Authorization': 'Bearer $2b$10$z4aAy0KgHyfRo2TbSy5yF.xIZ84r8b2qU1/5aSg7mwHtyPJTuvqzu'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching overview metadata:', error);
        throw error;
    }
};

export const getEngagementRateComparison = async (params?: EngagementRateComparisonParams): Promise<EngagementRateComparisonResponse> => {
    const apiUrl = "https://api.dialektika.io/server/api/v1/content-analytics-Shop-Intel/engagement-rate-comparison";
    
    // Provide defaults if params are not provided
    const queryParams = {
        start_date: params?.start_date || '2025-04-01',
        end_date: params?.end_date || '2025-05-01',
        platform: params?.platform,
        source: params?.source,
    };

    try {
        const response = await axios.get<EngagementRateComparisonResponse>(apiUrl, { 
            params: queryParams,
            headers: {
                'Authorization': 'Bearer $2b$10$z4aAy0KgHyfRo2TbSy5yF.xIZ84r8b2qU1/5aSg7mwHtyPJTuvqzu'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching engagement rate comparison:', error);
        throw error;
    }
};

export const getEngagementGrowthTrend = async (params?: EngagementGrowthTrendParams): Promise<EngagementGrowthTrendResponse> => {
    const apiUrl = "https://api.dialektika.io/server/api/v1/content-analytics-Shop-Intel/engagement-growth-trend";
    
    // Provide defaults if params are not provided
    const queryParams = {
        start_date: params?.start_date || '2025-04-01',
        end_date: params?.end_date || '2025-05-01',
        platform: params?.platform,
    };

    try {
        const response = await axios.get<EngagementGrowthTrendResponse>(apiUrl, { 
            params: queryParams,
            headers: {
                'Authorization': 'Bearer $2b$10$z4aAy0KgHyfRo2TbSy5yF.xIZ84r8b2qU1/5aSg7mwHtyPJTuvqzu'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching engagement growth trend:', error);
        throw error;
    }
};

export const getCompetitorContent = async (params: CompetitorContentParams): Promise<CompetitorContentResponse> => {
    const apiUrl = "https://api.dialektika.io/server/api/v1/content-Shop-Intel";
    
    // Filter out undefined values
    const queryParams: Record<string, any> = {
        channel_id: params.channel_id,
    };
    
    if (params.page !== undefined) {
        queryParams.page = params.page;
    }
    
    if (params.limit !== undefined) {
        queryParams.limit = params.limit;
    }

    try {
        const response = await axios.get<CompetitorContentResponse>(apiUrl, { 
            params: queryParams,
            headers: {
                'Authorization': 'Bearer $2b$10$z4aAy0KgHyfRo2TbSy5yF.xIZ84r8b2qU1/5aSg7mwHtyPJTuvqzu'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching competitor content:', error);
        throw error;
    }
};

export const getPlatformPerformanceSplit = async (params?: PlatformPerformanceSplitParams): Promise<PlatformPerformanceSplitResponse> => {
    const apiUrl = "https://api.dialektika.io/server/api/v1/content-analytics-Shop-Intel/performance/platform-split";
    
    // Provide defaults if params are not provided
    const queryParams = {
        start_date: params?.start_date || '2025-06-21',
        end_date: params?.end_date || '2025-07-21',
        platform: params?.platform,
    };

    try {
        const response = await axios.get<PlatformPerformanceSplitResponse>(apiUrl, { 
            params: queryParams,
            headers: {
                'Authorization': 'Bearer $2b$10$z4aAy0KgHyfRo2TbSy5yF.xIZ84r8b2qU1/5aSg7mwHtyPJTuvqzu'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching platform performance split:', error);
        throw error;
    }
};

export const getPerformanceMetadata = async (params?: PerformanceMetadataParams): Promise<PerformanceMetadataResponse> => {
    const apiUrl = "https://api.dialektika.io/server/api/v1/content-analytics-Shop-Intel/performance/metadata-metrics";
    
    // Provide defaults if params are not provided
    const queryParams = {
        start_date: params?.start_date || '2025-04-02',
        end_date: params?.end_date || '2025-07-01',
        platform: params?.platform,
    };

    try {
        const response = await axios.get<PerformanceMetadataResponse>(apiUrl, { 
            params: queryParams,
            headers: {
                'Authorization': 'Bearer $2b$10$z4aAy0KgHyfRo2TbSy5yF.xIZ84r8b2qU1/5aSg7mwHtyPJTuvqzu'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching performance metadata:', error);
        throw error;
    }
};

export const get24hPerformanceChanges = async (params?: Performance24hParams): Promise<Performance24hResponse> => {
    const apiUrl = "https://api.dialektika.io/server/api/v1/content-analytics-Shop-Intel/performance/24h-performance-changes";
    
    // Provide defaults if params are not provided
    const queryParams = {
        start_date: params?.start_date || '2025-04-02',
        end_date: params?.end_date || '2025-07-01',
        platform: params?.platform,
    };

    try {
        const response = await axios.get<Performance24hResponse>(apiUrl, { 
            params: queryParams,
            headers: {
                'Authorization': 'Bearer $2b$10$z4aAy0KgHyfRo2TbSy5yF.xIZ84r8b2qU1/5aSg7mwHtyPJTuvqzu'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching 24h performance changes:', error);
        throw error;
    }
};
