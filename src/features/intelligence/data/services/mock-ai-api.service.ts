import {
  BubbleTopKeywordsResponse,
  PersonalBeautyTopMentionsResponse
} from '../model/ai-model';

import {
  mockBubbleTopKeywordsData,
  mockclothingTopMentionsData
} from '../mock/ai-analysis-dummy-data';

// Simulate API delay
const simulateDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const getMockBubbleTopKeywords = async (params?: {
  start_date?: string;
  end_date?: string;
}): Promise<BubbleTopKeywordsResponse> => {
  await simulateDelay();
  return mockBubbleTopKeywordsData(params);
};

export const getMockPersonalBeautyTopMentions = async (params: {
  category?: string;
  start_date?: string;
  end_date?: string;
  region?: string;
  page?: number;
  limit?: number;
}): Promise<PersonalBeautyTopMentionsResponse> => {
  await simulateDelay();
  return mockclothingTopMentionsData(params);
};
