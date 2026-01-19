import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    InventoryStock, 
    InventoryStockByLocationResponse, 
    StockDistributionResponse, 
    StocksMetadataResponse, 
    TotalSkusResponse,
    SkuResponse,
    UpdateInventoryResponse
} from "../../data/model/inventory-entity";

// Use mock data only (frontend-only project)
const USE_MOCK_DATA = true;

// Simulate API delay
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock inventory data
const mockInventoryStocks: InventoryStock[] = [
    { storageClientNo: "CLI001", skuNo: "TS-WH-S", skuDesc: "White T-Shirt - Small", storageClientSkuNo: "TS-WH-S", goodQty: 150, damagedQty: 2, allocatingQty: 5, processingQty: 3, availableQty: 140, country: "MY", skuStatus: "ACTIVE", reservedQty: 0, thresholdQty: 20 },
    { storageClientNo: "CLI002", skuNo: "TS-WH-M", skuDesc: "White T-Shirt - Medium", storageClientSkuNo: "TS-WH-M", goodQty: 200, damagedQty: 1, allocatingQty: 8, processingQty: 2, availableQty: 189, country: "MY", skuStatus: "ACTIVE", reservedQty: 0, thresholdQty: 25 },
    { storageClientNo: "CLI003", skuNo: "JN-BL-32", skuDesc: "Blue Jeans - 32", storageClientSkuNo: "JN-BL-32", goodQty: 60, damagedQty: 0, allocatingQty: 2, processingQty: 1, availableQty: 57, country: "MY", skuStatus: "ACTIVE", reservedQty: 0, thresholdQty: 10 },
    { storageClientNo: "CLI004", skuNo: "PL-BL-M", skuDesc: "Blue Polo - Medium", storageClientSkuNo: "PL-BL-M", goodQty: 85, damagedQty: 1, allocatingQty: 3, processingQty: 1, availableQty: 80, country: "MY", skuStatus: "ACTIVE", reservedQty: 0, thresholdQty: 15 },
    { storageClientNo: "CLI005", skuNo: "LJ-BK-M", skuDesc: "Black Leather - Medium", storageClientSkuNo: "LJ-BK-M", goodQty: 25, damagedQty: 0, allocatingQty: 1, processingQty: 0, availableQty: 24, country: "MY", skuStatus: "ACTIVE", reservedQty: 0, thresholdQty: 5 },
];

// Mock implementations
const getInventoryIstoreListSku = async (accessToken?: string): Promise<InventoryStock[]> => {
    await simulateDelay();
    return [...mockInventoryStocks];
};

const getTotalSkus = async (accessToken?: string): Promise<TotalSkusResponse> => {
    await simulateDelay();
    return {
        message: "Total SKUs retrieved successfully",
        data: {
            totalSkus: mockInventoryStocks.map(s => ({
                sku_no: s.skuNo,
                quantity: s.goodQty
            }))
        }
    };
};

const getStocksMetadata = async (accessToken?: string): Promise<StocksMetadataResponse> => {
    await simulateDelay();
    const lowStock = mockInventoryStocks.filter(s => s.goodQty < s.thresholdQty).length;
    const processingStock = mockInventoryStocks.reduce((sum, s) => sum + s.processingQty, 0);
    const allocatingStock = mockInventoryStocks.reduce((sum, s) => sum + s.allocatingQty, 0);
    
    return {
        message: "Stocks metadata retrieved successfully",
        data: {
            stocks: {
                lowStock,
                processingStock,
                allocatingStock
            }
        }
    };
};

const getStockDistribution = async (accessToken?: string): Promise<StockDistributionResponse> => {
    await simulateDelay();
    const goodQty = mockInventoryStocks.reduce((sum, s) => sum + s.goodQty, 0);
    const damagedQty = mockInventoryStocks.reduce((sum, s) => sum + s.damagedQty, 0);
    const allocatingQty = mockInventoryStocks.reduce((sum, s) => sum + s.allocatingQty, 0);
    const processingQty = mockInventoryStocks.reduce((sum, s) => sum + s.processingQty, 0);
    const availableQty = mockInventoryStocks.reduce((sum, s) => sum + s.availableQty, 0);
    
    return {
        message: "Stock distribution retrieved successfully",
        data: {
            stockDistribution: {
                goodQty,
                damagedQty,
                allocatingQty,
                processingQty,
                availableQty
            }
        }
    };
};

const getInventoryStockByLocation = async (accessToken?: string): Promise<InventoryStockByLocationResponse> => {
    await simulateDelay();
    const totalStockIStore = mockInventoryStocks.reduce((sum, s) => sum + s.goodQty, 0);
    const totalStockSepang = Math.floor(totalStockIStore * 0.6);
    const totalStockPhysicalStore = Math.floor(totalStockIStore * 0.4);
    
    return {
        message: "Inventory stock by location retrieved successfully",
        data: {
            stockDistributionByLocation: {
                totalStockSepang,
                totalStockIStore,
                totalStockPhysicalStore
            }
        }
    };
};

const getSkuDetailsSepang = async (accessToken?: string): Promise<SkuResponse> => {
    await simulateDelay();
    return {
        message: "SKU details for Sepang retrieved successfully",
        data: {
            skus: mockInventoryStocks.slice(0, 3).map((s, idx) => ({
                id: `inv_sepang_${idx + 1}`,
                quantity: Math.floor(s.goodQty * 0.6),
                threshold_quantity: s.thresholdQty,
                warehouse_id: "warehouse_sepang",
                sku_id: `sku_${s.skuNo}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                sku: {
                    sku_name: s.skuDesc,
                    sku_no: s.skuNo
                },
                warehouse: {
                    name: "Sepang Warehouse"
                }
            })),
            metadata: {
                total: 3
            }
        }
    };
};

const getSkuDetailsPhysicalStore = async (accessToken?: string): Promise<SkuResponse> => {
    await simulateDelay();
    return {
        message: "SKU details for Physical Store retrieved successfully",
        data: {
            skus: mockInventoryStocks.slice(0, 3).map((s, idx) => ({
                id: `inv_physical_${idx + 1}`,
                quantity: Math.floor(s.goodQty * 0.4),
                threshold_quantity: s.thresholdQty,
                warehouse_id: "warehouse_physical",
                sku_id: `sku_${s.skuNo}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                sku: {
                    sku_name: s.skuDesc,
                    sku_no: s.skuNo
                },
                warehouse: {
                    name: "Physical Store"
                }
            })),
            metadata: {
                total: 3
            }
        }
    };
};

const updateInventoryQuantity = async (
    inventoryId: string,
    quantityChange: number,
    userId: string,
    thresholdQuantity?: number,
    notes?: string,
    accessToken?: string
): Promise<UpdateInventoryResponse> => {
    await simulateDelay();
    return {
        message: "Inventory quantity updated successfully",
        data: {
            inventory: {
                id: inventoryId,
                quantity: 100 + quantityChange,
                threshold_quantity: thresholdQuantity || 20,
                warehouse_id: "warehouse_1",
                sku_id: "sku_1",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                warehouse: {
                    id: "warehouse_1",
                    name: "Main Warehouse",
                    location: "Kuala Lumpur",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            }
        }
    };
};

export const useInventoryIstoreListSku = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["inventoryIstoreListSku"],
        queryFn: () => getInventoryIstoreListSku(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });
    return {
        inventoryIstoreListSku: data,
        isLoading: isLoading,
        error: error,
    };
};

export const useGetTotalSkus = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["totalSkus"],
        queryFn: () => getTotalSkus(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });
    return {
        totalSkus: data,
        isLoading: isLoading,
        error: error,
    };
};

export const useStocksMetadata = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["stocksMetadata"],
        queryFn: () => getStocksMetadata(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });
    return {
        stocksMetadata: data,
        isLoading: isLoading,
        error: error,
    };
};

export const useGetStockDistribution = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["stockDistribution"],
        queryFn: () => getStockDistribution(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });
    return {
        stockDistribution: data,
        isLoading: isLoading,
        error: error,
    };
};

export const useGetInventoryStockByLocation = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["inventoryStockByLocation"],
        queryFn: () => getInventoryStockByLocation(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });
    return {
        inventoryStockByLocation: data,
        isLoading: isLoading,
        error: error,
    };
};

export const useGetSkuDetailsSepang = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["skuDetailsSepang"],
        queryFn: () => getSkuDetailsSepang(),
        staleTime: 2 * 60 * 1000, // 2 minutes - shorter cache for location-specific data
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: true, // Always refetch when component mounts
    });
    return {
        skuDetailsSepang: data,
        isLoading: isLoading,
        error: error,
    };
};

export const useGetSkuDetailsPhysicalStore = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["skuDetailsPhysicalStore"],
        queryFn: () => getSkuDetailsPhysicalStore(),
        staleTime: 2 * 60 * 1000, // 2 minutes - shorter cache for location-specific data
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: true, // Always refetch when component mounts
    });
    return {
        skuDetailsPhysicalStore: data,
        isLoading: isLoading,
        error: error,
    };
};

export const useUpdateInventoryQuantity = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ 
            inventoryId, 
            quantityChange, 
            userId,
            thresholdQuantity, 
            notes 
        }: { 
            inventoryId: string; 
            quantityChange: number; 
            userId: string;
            thresholdQuantity?: number; 
            notes?: string; 
        }) =>
            updateInventoryQuantity(
                inventoryId, 
                quantityChange, 
                userId,
                thresholdQuantity, 
                notes
            ),
        onSuccess: () => {
            // Invalidate and refetch inventory queries to get updated data
            queryClient.invalidateQueries({ queryKey: ["skuDetailsSepang"] });
            queryClient.invalidateQueries({ queryKey: ["skuDetailsPhysicalStore"] });
            queryClient.invalidateQueries({ queryKey: ["inventoryIstoreListSku"] });
            queryClient.invalidateQueries({ queryKey: ["stockDistribution"] });
            queryClient.invalidateQueries({ queryKey: ["stocksMetadata"] });
            queryClient.invalidateQueries({ queryKey: ["totalSkus"] });
            queryClient.invalidateQueries({ queryKey: ["inventoryStockByLocation"] });
            // Invalidate inventory logs to show the new record
            queryClient.invalidateQueries({ queryKey: ["inventoryLogs"] });
        },
        onError: (error) => {
            console.error("Error updating inventory quantity:", error);
        },
    });
};