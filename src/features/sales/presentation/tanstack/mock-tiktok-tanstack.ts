import { useQuery } from "@tanstack/react-query";
import { getConversionRateHistoricalData, getListConversionRate, getOrdersHistoricalData, getTiktokMetadata, getTiktokSkuList, getTiktokSkus } from "../../data/services/mock-tiktok-api.service";

export const tiktokDashboardQuery = (timeframe: string = 'daily') => {
    return useQuery({
        queryKey: ["tiktokMetadata", timeframe],
        queryFn: async () => {
            const metadata = await getTiktokMetadata(timeframe as any);
            return metadata;
        }
    });
}

export const tiktokOrdersHistoricalDataQuery = (period: string, year: string) => {
    return useQuery({
        queryKey: ["tiktokOrdersHistoricalData", period, year],
        queryFn: () => getOrdersHistoricalData(period, year)
    });
}

export const tiktokSkusQuery = ({
    limit_order,
    limit
}: {
    limit_order: number,
    limit: number
}) => {
    return useQuery({
        queryKey: ["tiktokSkus", limit_order, limit],
        queryFn: () => getTiktokSkus({ limit_order, limit })
    });
}

export const tiktokConversionRateQuery = () => {
    return useQuery({
        queryKey: ["tiktokConversionRate"],
        queryFn: async () => {
            const data = await getListConversionRate();
            return data || [];
        }
    });
}

export const tiktokConversionRateHistoricalDataQuery = ({
    quarter,
    year
}: {
    quarter: string,
    year: string
}) => {
    return useQuery({
        queryKey: ["tiktokConversionRateHistoricalData", quarter, year],
        queryFn: async () => {
            const data = await getConversionRateHistoricalData({
                quarter,
                year
            });
            return data || [];
        }
    });
}

export const tiktokSkuListQuery = () => {
    return useQuery({
        queryKey: ['tiktokSkusList'],
        queryFn: async () => {
            return await getTiktokSkuList();
        }
    })
}
