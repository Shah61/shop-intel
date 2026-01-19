import { ShopeeMetadata, ShopeeConversionRate, ShopeeSku } from "../model/shopee-entity";
import { AnalysisTimeFrame } from "../model/analytics-entity";
import { generateShopeeMetadata, generateShopeeConversionRate, generateShopeeSkus } from "../mock/dummy-data";

// Mock delay to simulate API call
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const getShopeeMetadata = async ({ type }: { type: AnalysisTimeFrame }): Promise<ShopeeMetadata> => {
    await mockDelay();
    return generateShopeeMetadata(type);
};

export const getShopeeConversionRate = async ({
    startTime,
    endTime
}: {
    startTime: string;
    endTime: string;
}): Promise<ShopeeConversionRate[]> => {
    await mockDelay();
    return generateShopeeConversionRate();
};

export const getShopeeSkus = async ({
    startTime,
    endTime,
    period,
    limit
}: {
    startTime: string;
    endTime: string;
    period: string;
    limit: number;
}): Promise<ShopeeSku[]> => {
    await mockDelay();
    const allSkus = generateShopeeSkus();
    
    // Apply limit if specified
    if (limit > 0) {
        return allSkus.slice(0, limit);
    }
    
    return allSkus;
};

export const getShopeeConversionRateHistoricalData = async ({
    year
}: {
    year: string;
}): Promise<ShopeeConversionRate[]> => {
    await mockDelay();
    return generateShopeeConversionRate();
};
