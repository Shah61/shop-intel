import { useQuery } from "@tanstack/react-query";
import { getConversionRate, getConversionRateHistoricalData, getListConversionRate, getOrdersHistoricalData, getShopifyMetadata, getShopifySkus, getShopifyStock, getTotalOrders, getTotalSales } from "../../data/services/mock-shopify-api.service";
import { AnalysisTimeFrame } from "../../data/model/shopify-entity";

export const shopifyDashboardQuery = (timeframe: AnalysisTimeFrame) => {
    return useQuery({
        queryKey: ["shopifyMetadata", timeframe],
        queryFn: async () => {
            const metadata = await getShopifyMetadata(timeframe);
            return metadata;
        }
    });
}

export const shopifyOrdersHistoricalDataQuery = (period: string, year: string) => {
    return useQuery({
        queryKey: ["shopifyOrdersHistoricalData", period, year],
        queryFn: () => getOrdersHistoricalData(period, year)
    });
}

export const shopifySkusQuery = ({
    limit_order,
    limit,
    type
}: {
    limit_order: number,
    limit: number,
    type: string
}) => {
    return useQuery({
        queryKey: ["shopifySkus", limit_order, limit, type],
        queryFn: () => getShopifySkus({ limit_order, limit, type })
    });
}

export const shopifyConversionRateQuery = ({
    limit_order,
    limit
}: {
    limit_order: number,
    limit: number
}) => {
    return useQuery({
        queryKey: ["shopifyConversionRate", limit_order, limit],
        queryFn: () => getListConversionRate({ limit_order, limit })
    });
}


export const useConversionRateHistoricalData = (quarter: string, year: string) => {
    return useQuery({
        queryKey: ["shopifyConversionRateHistoricalData", quarter, year],
        queryFn: async () => await getConversionRateHistoricalData(quarter, year)
    });
}

export const shopifyStockQuery = () => {
    return useQuery({
        queryKey: ["shopifyStock"],
        queryFn: () => getShopifyStock()
    });
}
