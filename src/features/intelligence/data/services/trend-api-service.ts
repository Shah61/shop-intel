import axios from "axios";
import { ContentResponse, ContentParams, ChannelsResponse, ChannelsParams, SearchResponse, SearchParams, TopContentsResponse, TopContentsParams } from "../model/trend-model";

export const getContentMetadata = async (params?: ContentParams): Promise<ContentResponse> => {
    try {
        // Build query parameters object, only including defined values
        const queryParams: Record<string, any> = {};
        
        if (params?.platform) {
            queryParams.platform = params.platform;
        }
        if (params?.type) {
            queryParams.type = params.type;
        }
        if (params?.region) {
            queryParams.region = params.region;
        }
        if (params?.page) {
            queryParams.page = params.page;
        }
        if (params?.limit) {
            queryParams.limit = params.limit;
        }

        const response = await axios.get("https://api.dialektika.io/server/api/v1/content-Shop-Intel", {
            params: queryParams,
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching content metadata:', error);
        throw error;
    }
};

export const getTopChannels = async (params?: ChannelsParams): Promise<ChannelsResponse> => {
    try {
        // Build query parameters object, only including defined values
        const queryParams: Record<string, any> = {};
        
        if (params?.platform) {
            queryParams.platform = params.platform;
        }
        if (params?.type) {
            queryParams.type = params.type;
        }
        if (params?.region) {
            queryParams.region = params.region;
        }

        const response = await axios.get("https://api.dialektika.io/server/api/v1/channels-Shop-Intel/top-channels", {
            params: queryParams,
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching top channels:', error);
        throw error;
    }
};

export const searchContent = async (params: SearchParams): Promise<SearchResponse> => {
    try {
        // Build query parameters object, only including defined values
        const queryParams: Record<string, any> = {
            query: params.query
        };
        
        if (params.platform) {
            queryParams.platform = params.platform;
        }
        if (params.region) {
            queryParams.region = params.region;
        }
        if (params.page) {
            queryParams.page = params.page;
        }
        if (params.limit) {
            queryParams.limit = params.limit;
        }

        const response = await axios.get("https://api.dialektika.io/server/api/v1/content-Shop-Intel/search", {
            params: queryParams,
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error searching content:', error);
        throw error;
    }
};

export const getTopContents = async (params?: TopContentsParams): Promise<TopContentsResponse> => {
    try {
        // Build query parameters object, only including defined values
        const queryParams: Record<string, any> = {};
        
        if (params?.platform) {
            queryParams.platform = params.platform;
        }
        if (params?.type) {
            queryParams.type = params.type;
        }
        if (params?.region) {
            queryParams.region = params.region;
        }
        if (params?.page) {
            queryParams.page = params.page;
        }
        if (params?.limit) {
            queryParams.limit = params.limit;
        }

        const response = await axios.get("https://api.dialektika.io/server/api/v1/content-Shop-Intel/top-contents", {
            params: queryParams,
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching top contents:', error);
        throw error;
    }
};
