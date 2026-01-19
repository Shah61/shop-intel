import { AnalysisSKUEntity, AnalyticsMetadataEntity, AnalyticsSalesEntity } from "../model/analytics-entity";
import { AnalysisTimeFrame } from "../model/analytics-entity";
import { 
    generateAnalyticsMetadata, 
    generateHistoricalSalesData, 
    generateSKUData, 
    generateConversionSalesData 
} from "../mock/dummy-data";

// Mock delay to simulate API call
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const getAnalyticsMetadata = async (type: AnalysisTimeFrame, accessToken?: string): Promise<AnalyticsMetadataEntity[]> => {
    await mockDelay();
    return generateAnalyticsMetadata(type);
};

export const getAnalyticsSalesHistoricalData = async ({ year, quarter }: { year: string, quarter: string }, accessToken?: string): Promise<AnalyticsSalesEntity[]> => {
    await mockDelay();
    return generateHistoricalSalesData(year, quarter);
};

export const getAnalyticsSKU = async (accessToken?: string): Promise<AnalysisSKUEntity[]> => {
    await mockDelay();
    return generateSKUData();
};

export const getAnalysticsSales = async (accessToken?: string): Promise<AnalyticsSalesEntity[]> => {
    await mockDelay();
    return generateConversionSalesData();
};

export const getPhysicalSKU = async (accessToken?: string): Promise<AnalysisSKUEntity[]> => {
    await mockDelay();
    return generateSKUData().filter(sku => sku.type === 'physical');
};

export const getAllSKU = async (accessToken?: string): Promise<AnalysisSKUEntity[]> => {
    await mockDelay();
    return generateSKUData();
};

export const getSkuPerformanceHistoricalData = async ({ year, quarter }: { year: string, quarter: string }, accessToken?: string) => {
    await mockDelay();
    const dates = [];
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push({
            date: date.toISOString().split('T')[0],
            data: generateSKUData().slice(0, 5) // Return top 5 SKUs per date
        });
    }
    return dates;
};

export const getSkuPerformanceDetail = async ({ year, quarter, sku }: { year: string, quarter: string, sku: string }, accessToken?: string) => {
    await mockDelay();
    const skuData = generateSKUData().find(s => s.sku === sku) || generateSKUData()[0];
    return {
        date: new Date().toISOString().split('T')[0],
        data: skuData
    };
};
