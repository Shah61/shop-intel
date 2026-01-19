import { useQuery } from "@tanstack/react-query";
import {
  getMockAnalyticsMetadata,
  getMockAnalyticsSales,
  getMockAnalyticsSKU,
  getMockSkuPerformanceHistorical,
  getMockSkuPerformanceDetail,
  getMockAllSKU,
  getMockPhysicalConversions
} from "../../data/services/mock-physical-sales-api.service";
import { AnalysisTimeFrame } from "../../data/model/analytics-entity";

// Always use mock data - no backend API
const USE_MOCK_DATA = true;

export const useAnalyticsMetadata = (timeFrame: AnalysisTimeFrame) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["analytics-metadata", timeFrame],
        queryFn: async () => {
            return await getMockAnalyticsMetadata();
        }
    });

    return { data, isLoading, error };
}

export const useAnalyticsSalesHistoricalData = ({ year, quarter }: { year: string, quarter: string }) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["analytics-sales", year, quarter],
        queryFn: async () => {
            // Return mock data structure
            return { sales: [], metadata: {} };
        }
    });

    return { data, isLoading, error };
}

export const useAnalyticsSKU = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["analytics-sku"],
        queryFn: async () => {
            return await getMockAnalyticsSKU();
        }
    });

    return { data, isLoading, error };
}


export const useAnalysticsSales = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["analytics-sales-by-platform"],
        queryFn: async () => {
            return await getMockAnalyticsSales();
        }
    });

    return { data, isLoading, error };
}

export const usePhysicalSKU = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["physical-sku"],
        queryFn: async () => {
            return await getMockAnalyticsSKU();
        }
    });

    return { data, isLoading, error };
}




export const useSkuPerformanceHistoricalData = ({ year, quarter }: { year: string, quarter: string }) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["sku-performance-historical-data", year, quarter],
        queryFn: async () => {
            return await getMockSkuPerformanceHistorical({ year, quarter });
        }
    });

    return { data, isLoading, error };
}

export const useSkuPerformanceDetail = ({ year, quarter, sku }: { year: string, quarter: string, sku: string }) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["sku-performance-detail", sku],
        queryFn: async () => {
            return await getMockSkuPerformanceDetail({ year, quarter, sku });
        }
    });

    return { data, isLoading, error };
}


export const useAllSKU = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["all-sku"],
        queryFn: async () => {
            return await getMockAllSKU();
        }
    });

    return { data, isLoading, error };
}