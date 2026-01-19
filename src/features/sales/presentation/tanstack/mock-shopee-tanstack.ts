import { useQuery } from "@tanstack/react-query";

import { getShopeeConversionRate, getShopeeConversionRateHistoricalData, getShopeeMetadata, getShopeeSkus } from "../../data/services/mock-shopee-api.service";
import { AnalysisTimeFrame } from "../../data/model/analytics-entity";

export const useShopeeSkus = ({
    startTime,
    endTime,
    period,
    limit
}: {
    startTime: string;
    endTime: string;
    period: string;
    limit: number;
}) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['shopee-skus', startTime, endTime, period, limit],
        queryFn: async () => {
            const skus = await getShopeeSkus({ startTime: startTime, endTime: endTime, period, limit });
            return skus;
        }
    });

    return { data, isLoading, error };
}

export const useShopeeMetadata = ({
    type
}: {
    type: AnalysisTimeFrame
}) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['shopee-metadata', type],
        queryFn: async () => {
            console.log('type', type);
            const metadata = await getShopeeMetadata({ type });
            return metadata;
        }
    });

    return { data, isLoading, error };
}


export const useShopeeConversionRate = ({
    startTime,
    endTime
}: {
    startTime: string;
    endTime: string;
}) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['shopee-conversion-rate', startTime, endTime],
        queryFn: async () => {
            const conversionRate = await getShopeeConversionRate({ startTime: startTime, endTime: endTime });
            return conversionRate;
        }
    });

    return { data, isLoading, error };
}

export const useShopeeConversionRateHistoricalData = ({
    year
}: {
    year: string;
}) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['shopee-conversion-rate-historical-data', year],
        queryFn: async () => {
            const conversionRateHistoricalData = await getShopeeConversionRateHistoricalData({ year });
            return conversionRateHistoricalData;
        }
    });

    return { data, isLoading, error };
}

export const convertDateToTimestamp = (date: string): number => {
    const dateObj = new Date(date);
    return Math.floor(dateObj.getTime() / 1000);
}
