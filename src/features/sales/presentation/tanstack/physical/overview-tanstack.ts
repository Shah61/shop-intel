import { useQuery } from "@tanstack/react-query"
import { getMockPhysicalOverview, getMockPhysicalConversions } from "../../../data/services/mock-physical-sales-api.service"
import { mockPhysicalSalesData } from "../../../data/mock/physical-sales-dummy-data"
import { AnalysisTimeFrame } from "../../../data/model/analytics-entity"

// Use mock data only (frontend-only project)
const USE_MOCK_DATA = true;


export const usePhysicalOverviewHistoricalData = ({ quarter, year }: { quarter: string, year: number }) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['physical-overview-historical-data', quarter, year],
        queryFn: async () => {
            const mockData = await getMockPhysicalConversions();
            return { data: mockData };
        }
    })

    return { data, isLoading, error }
}

export const usePhysicalOverviewMetadata = ({ query }: { query: AnalysisTimeFrame }) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['physical-overview-metadata', query],
        queryFn: async () => {
            return await getMockPhysicalOverview({ query });
        }
    })

    return { data, isLoading, error }
}

export const usePhysicalOverviewConversionRateList = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['physical-overview-conversion-rate-list'],
        queryFn: async () => {
            const response = await getMockPhysicalConversions();
            return response.sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime());
        }
    })

    return { data, isLoading, error }
}

export const usePhysicalStock = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['physical-stock'],
        queryFn: async () => {
            // Return mock physical stock data
            return mockPhysicalSalesData.products.flatMap(product => 
                product.variants?.map(variant => ({
                    id: parseInt(variant.id || '0'),
                    sku: variant.sku_no || '',
                    inventory_quantity: variant.quantity || 0
                })) || []
            );
        }
    })

    return { data, isLoading, error }
}
