import {
  TopPerformingCompetitorsResponse,
  TopPerformingCompetitorsParams,
  OverviewMetadataResponse,
  OverviewMetadataParams,
  EngagementRateComparisonResponse,
  EngagementRateComparisonParams,
  EngagementGrowthTrendResponse,
  EngagementGrowthTrendParams,
  CompetitorContentResponse,
  CompetitorContentParams,
  PlatformPerformanceSplitResponse,
  PlatformPerformanceSplitParams,
  PerformanceMetadataResponse,
  PerformanceMetadataParams,
  Performance24hResponse,
  Performance24hParams
} from '../model/competitor-model';

import {
  mockTopPerformingCompetitorsData,
  mockOverviewMetadataData,
  mockEngagementRateComparisonData,
  mockEngagementGrowthTrendData,
  mockPlatformPerformanceSplitData,
  mockPerformanceMetadataData,
  mock24hPerformanceChangesData,
  mockCompetitorContentData
} from '../mock/competitor-dummy-data';

// Simulate API delay
const simulateDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const getMockTopPerformingCompetitors = async (params?: TopPerformingCompetitorsParams): Promise<TopPerformingCompetitorsResponse> => {
  await simulateDelay();
  return mockTopPerformingCompetitorsData(params);
};

export const getMockOverviewMetadata = async (params?: OverviewMetadataParams): Promise<OverviewMetadataResponse> => {
  await simulateDelay();
  return mockOverviewMetadataData(params);
};

export const getMockEngagementRateComparison = async (params?: EngagementRateComparisonParams): Promise<EngagementRateComparisonResponse> => {
  await simulateDelay();
  return mockEngagementRateComparisonData(params);
};

export const getMockEngagementGrowthTrend = async (params?: EngagementGrowthTrendParams): Promise<EngagementGrowthTrendResponse> => {
  await simulateDelay();
  return mockEngagementGrowthTrendData(params);
};

export const getMockCompetitorContent = async (params: CompetitorContentParams): Promise<CompetitorContentResponse> => {
  await simulateDelay();
  return mockCompetitorContentData(params);
};

export const getMockPlatformPerformanceSplit = async (params?: PlatformPerformanceSplitParams): Promise<PlatformPerformanceSplitResponse> => {
  await simulateDelay();
  return mockPlatformPerformanceSplitData(params);
};

export const getMockPerformanceMetadata = async (params?: PerformanceMetadataParams): Promise<PerformanceMetadataResponse> => {
  await simulateDelay();
  return mockPerformanceMetadataData(params);
};

export const getMock24hPerformanceChanges = async (params?: Performance24hParams): Promise<Performance24hResponse> => {
  await simulateDelay();
  return mock24hPerformanceChangesData(params);
};
