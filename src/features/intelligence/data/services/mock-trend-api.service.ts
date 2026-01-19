import { 
  ContentResponse, 
  ContentParams, 
  ChannelsResponse, 
  ChannelsParams, 
  SearchResponse, 
  SearchParams, 
  TopContentsResponse, 
  TopContentsParams 
} from "../model/trend-model";
import {
  mockTopChannelsData,
  mockTrendingVideosData,
  mockTrendingContentData,
  mockSearchResults,
  mockTrendingTopics
} from "../mock/trend-dummy-data";

// Simulate API delay
const simulateDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const getMockContentMetadata = async (params?: ContentParams): Promise<ContentResponse> => {
  await simulateDelay();
  
  // Filter and sort based on parameters
  let contents = [...mockTrendingContentData.data.contents];
  
  // Filter by platform
  if (params?.platform) {
    contents = contents.filter(content => content.channel.platform === params.platform);
  }
  
  // Filter by region
  if (params?.region) {
    contents = contents.filter(content => content.channel.region === params.region);
  }
  
  // Sort by type
  if (params?.type) {
    switch (params.type) {
      case 'VIEW':
        contents.sort((a, b) => b.metadata.views - a.metadata.views);
        break;
      case 'LIKE':
        contents.sort((a, b) => b.metadata.likes - a.metadata.likes);
        break;
      case 'COMMENT':
        contents.sort((a, b) => b.metadata.comments - a.metadata.comments);
        break;
      case 'SHARE':
        contents.sort((a, b) => b.metadata.shares - a.metadata.shares);
        break;
      case '24H_CHANGE':
        contents.sort((a, b) => Math.abs(b.metadata["24h_change"]) - Math.abs(a.metadata["24h_change"]));
        break;
    }
  }
  
  // Apply pagination
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedContents = contents.slice(startIndex, endIndex);
  
  return {
    ...mockTrendingContentData,
    data: {
      contents: paginatedContents,
      metadata: {
        total: contents.length,
        page: page,
        limit: limit,
        total_pages: Math.ceil(contents.length / limit),
        has_next: endIndex < contents.length,
        has_previous: page > 1
      }
    }
  };
};

export const getMockTopChannels = async (params?: ChannelsParams): Promise<ChannelsResponse> => {
  await simulateDelay();
  
  // Filter and sort based on parameters
  let channels = [...mockTopChannelsData.data.channels];
  
  // Filter by platform
  if (params?.platform) {
    channels = channels.filter(channel => channel.platform === params.platform);
  }
  
  // Filter by region
  if (params?.region) {
    channels = channels.filter(channel => channel.region === params.region);
  }
  
  // Sort by type
  if (params?.type) {
    switch (params.type) {
      case 'VIEW':
        channels.sort((a, b) => b.summary_metadata.total_views - a.summary_metadata.total_views);
        break;
      case 'LIKE':
        channels.sort((a, b) => b.summary_metadata.total_likes - a.summary_metadata.total_likes);
        break;
      case 'COMMENT':
        channels.sort((a, b) => b.summary_metadata.total_comments - a.summary_metadata.total_comments);
        break;
      case 'SHARE':
        channels.sort((a, b) => b.summary_metadata.total_shares - a.summary_metadata.total_shares);
        break;
      case '24H_CHANGE':
        channels.sort((a, b) => Math.abs(b.summary_metadata.total_24h_change) - Math.abs(a.summary_metadata.total_24h_change));
        break;
    }
  }
  
  // Apply pagination
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedChannels = channels.slice(startIndex, endIndex);
  
  return {
    ...mockTopChannelsData,
    data: {
      channels: paginatedChannels,
      metadata: {
        total: channels.length,
        page: page,
        limit: limit,
        total_pages: Math.ceil(channels.length / limit),
        has_next_page: endIndex < channels.length,
        has_prev_page: page > 1
      }
    }
  };
};

export const getMockTopContents = async (params?: TopContentsParams): Promise<TopContentsResponse> => {
  await simulateDelay();
  
  // Filter and sort based on parameters
  let contents = [...mockTrendingVideosData.data.contents.contents];
  
  // Filter by platform
  if (params?.platform) {
    contents = contents.filter(content => content.channel.platform === params.platform);
  }
  
  // Filter by region
  if (params?.region) {
    contents = contents.filter(content => content.channel.region === params.region);
  }
  
  // Sort by type
  if (params?.type) {
    switch (params.type) {
      case 'VIEW':
        contents.sort((a, b) => b.metadata.views - a.metadata.views);
        break;
      case 'LIKE':
        contents.sort((a, b) => b.metadata.likes - a.metadata.likes);
        break;
      case 'COMMENT':
        contents.sort((a, b) => b.metadata.comments - a.metadata.comments);
        break;
      case '24H_CHANGE':
        contents.sort((a, b) => Math.abs(b.metadata["24h_change_views"]) - Math.abs(a.metadata["24h_change_views"]));
        break;
    }
  }
  
  // Apply pagination
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedContents = contents.slice(startIndex, endIndex);
  
  return {
    ...mockTrendingVideosData,
    data: {
      contents: {
        total: contents.length,
        contents: paginatedContents
      }
    }
  };
};

export const searchMockContent = async (params: SearchParams): Promise<SearchResponse> => {
  await simulateDelay();
  
  const searchTerm = params.query.toLowerCase();
  
  // Filter contents based on search term
  let contents = mockTrendingContentData.data.contents.filter(content => 
    content.title.toLowerCase().includes(searchTerm) ||
    content.description.toLowerCase().includes(searchTerm) ||
    content.summarizer_title.toLowerCase().includes(searchTerm) ||
    content.channel.name.toLowerCase().includes(searchTerm)
  );
  
  // Filter channels based on search term
  let channels = mockTopChannelsData.data.channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm) ||
    channel.unique_id.toLowerCase().includes(searchTerm)
  );
  
  // Apply platform filter
  if (params.platform) {
    contents = contents.filter(content => content.channel.platform === params.platform);
    channels = channels.filter(channel => channel.platform === params.platform);
  }
  
  // Apply region filter
  if (params.region) {
    contents = contents.filter(content => content.channel.region === params.region);
    channels = channels.filter(channel => channel.region === params.region);
  }
  
  // Apply pagination
  const page = params.page || 1;
  const limit = params.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    message: "Search completed successfully",
    data: {
      contents: {
        search_term: params.query,
        total_results: {
          contents: contents.length,
          channels: channels.length
        },
        results: {
          contents: contents.slice(startIndex, endIndex),
          channels: channels.slice(startIndex, endIndex)
        },
        summary: {
          content_matches: contents.length,
          channel_matches: channels.length
        }
      }
    }
  };
};

// Additional helper functions for trending topics
export const getMockTrendingTopics = async () => {
  await simulateDelay();
  return mockTrendingTopics;
};

// Helper function to get channel by ID
export const getMockChannelById = async (channelId: string) => {
  await simulateDelay();
  return mockTopChannelsData.data.channels.find(channel => channel.id === channelId);
};

// Helper function to get content by ID
export const getMockContentById = async (contentId: string) => {
  await simulateDelay();
  return mockTrendingContentData.data.contents.find(content => content.id === contentId);
};
