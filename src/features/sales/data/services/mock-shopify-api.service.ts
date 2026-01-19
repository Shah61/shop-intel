import { ShopifyMetadata, ShopifyConversionRate, ShopifySku, ShopifyStock, AnalysisTimeFrame } from "../model/shopify-entity";
import { generateShopifyMetadata, generateShopifyConversionRate, generateShopifySkus, generateShopifyStock } from "../mock/dummy-data";

// Mock delay to simulate API call
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const getShopifyMetadata = async (timeframe: AnalysisTimeFrame): Promise<ShopifyMetadata> => {
    await mockDelay();
    return generateShopifyMetadata(timeframe);
};

export const getShopifySkus = async ({
    limit_order,
    limit,
    type
}: {
    limit_order: number,
    limit: number,
    type: string
}): Promise<ShopifySku[]> => {
    await mockDelay();
    const allSkus = generateShopifySkus();
    
    // Apply limit if specified
    if (limit > 0) {
        return allSkus.slice(0, limit);
    }
    
    return allSkus;
};

export const getListConversionRate = async ({
    limit_order,
    limit
}: {
    limit_order: number,
    limit: number
}): Promise<ShopifyConversionRate[]> => {
    await mockDelay();
    return generateShopifyConversionRate();
};

export const getShopifyStock = async (): Promise<ShopifyStock[]> => {
    await mockDelay();
    return generateShopifyStock();
};

export const getOrdersHistoricalData = async (period: string, year: string) => {
    await mockDelay();
    const dates = [];
    const today = new Date();
    const daysToGenerate = period === 'month' ? 30 : period === 'week' ? 7 : 365;
    
    for (let i = daysToGenerate - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push({
            date: date.toISOString().split('T')[0],
            orders: Math.floor(Math.random() * 80) + 40,
            revenue: Math.floor(Math.random() * 4000) + 1500
        });
    }
    
    return dates;
};

export const getConversionRateHistoricalData = async (quarter: string, year: string): Promise<ShopifyConversionRate[]> => {
    await mockDelay();
    return generateShopifyConversionRate();
};

export const getTotalOrders = async () => {
    await mockDelay();
    return Math.floor(Math.random() * 1000) + 500;
};

export const getTotalSales = async () => {
    await mockDelay();
    return Math.floor(Math.random() * 50000) + 25000;
};

export const getConversionRate = async () => {
    await mockDelay();
    return Math.random() * 5 + 2; // 2-7%
};
