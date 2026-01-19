import { useQuery } from "@tanstack/react-query";
import { getAnalysticsSales, getAnalyticsMetadata, getAnalyticsSalesHistoricalData, getAnalyticsSKU, getPhysicalSKU, getSkuPerformanceDetail, getSkuPerformanceHistoricalData, getAllSKU } from "../../data/services/mock-analytics-api.service";
import { AnalysisTimeFrame } from "../../data/model/analytics-entity";
import { useSession } from "@/src/core/lib/dummy-session-provider";

export const useAnalyticsMetadata = (timeFrame: AnalysisTimeFrame) => {
    const { data: session } = useSession();

    const { data, isLoading, error } = useQuery({
        queryKey: ["analytics-metadata", timeFrame],
        queryFn: async () => {
            return await getAnalyticsMetadata(timeFrame, session?.backend_tokens?.access_token);
        }
    });

    return { data, isLoading, error };
}

export const useAnalyticsSalesHistoricalData = ({ year, quarter }: { year: string, quarter: string }) => {
    const { data: session } = useSession();

    const { data, isLoading, error } = useQuery({
        queryKey: ["analytics-sales", year, quarter],
        queryFn: async () => {
            const sales = await getAnalyticsSalesHistoricalData({ year, quarter }, session?.backend_tokens?.access_token);
            return sales;
        }
    });

    return { data, isLoading, error };
}

export const useAnalyticsSKU = () => {
    const { data: session } = useSession();

    const { data, isLoading, error } = useQuery({
        queryKey: ["analytics-sku"],
        queryFn: async () => {
            return await getAnalyticsSKU(session?.backend_tokens?.access_token);
        }
    });

    return { data, isLoading, error };
}


export const useAnalysticsSales = () => {
    const { data: session } = useSession();

    const { data, isLoading, error } = useQuery({
        queryKey: ["analytics-sales-by-platform"],
        queryFn: async () => {
            return await getAnalysticsSales(session?.backend_tokens?.access_token);
        }
    });

    return { data, isLoading, error };
}

export const usePhysicalSKU = () => {
    const { data: session } = useSession();

    const { data, isLoading, error } = useQuery({
        queryKey: ["physical-sku"],
        queryFn: async () => {
            return await getPhysicalSKU(session?.backend_tokens?.access_token);
        }
    });

    return { data, isLoading, error };
}




export const useSkuPerformanceHistoricalData = ({ year, quarter }: { year: string, quarter: string }) => {
    const { data: session } = useSession();

    const { data, isLoading, error } = useQuery({
        queryKey: ["sku-performance-historical-data", year, quarter],
        queryFn: async () => {
            const data = await getSkuPerformanceHistoricalData({ year, quarter }, session?.backend_tokens?.access_token);
            return data;
        }
    });

    return { data, isLoading, error };
}

export const useSkuPerformanceDetail = ({ year, quarter, sku }: { year: string, quarter: string, sku: string }) => {
    const { data: session } = useSession();

    const { data, isLoading, error } = useQuery({
        queryKey: ["sku-performance-detail", sku],
        queryFn: async () => {
            return await getSkuPerformanceDetail({ year, quarter, sku }, session?.backend_tokens?.access_token);
        }
    });

    return { data, isLoading, error };
}


export const useAllSKU = () => {
    const { data: session } = useSession();

    const { data, isLoading, error } = useQuery({
        queryKey: ["all-sku"],
        queryFn: async () => {
            return await getAllSKU(session?.backend_tokens?.access_token);
        }
    });

    return { data, isLoading, error };
}
