import { TiktokMetadata, TiktokConversionRate, TiktokSku } from "../model/tiktok-entity";
import { generateTikTokMetadata, generateTikTokConversionRate, generateTikTokSkus } from "../mock/dummy-data";

// Mock delay to simulate API call
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const getTiktokMetadata = async (query: string = 'daily'): Promise<TiktokMetadata> => {
    await mockDelay();
    return generateTikTokMetadata(query);
};

export const getTiktokSkus = async ({
    limit_order,
    limit
}: {
    limit_order: number,
    limit: number
}): Promise<TiktokSku[]> => {
    await mockDelay();
    const allSkus = generateTikTokSkus();
    
    // Apply limit if specified
    if (limit > 0) {
        return allSkus.slice(0, limit);
    }
    
    return allSkus;
};

export const getListConversionRate = async (): Promise<TiktokConversionRate[]> => {
    await mockDelay();
    return generateTikTokConversionRate();
};

export const getTiktokSkuList = async (): Promise<TiktokSku[]> => {
    await mockDelay();
    return generateTikTokSkus();
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
            orders: Math.floor(Math.random() * 100) + 50,
            revenue: Math.floor(Math.random() * 5000) + 2000
        });
    }
    
    return dates;
};

export const getConversionRateHistoricalData = async ({
    quarter,
    year
}: {
    quarter: string,
    year: string
}): Promise<TiktokConversionRate[]> => {
    await mockDelay();
    return generateTikTokConversionRate();
};
