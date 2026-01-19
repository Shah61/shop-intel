export interface InventoryStock {
    storageClientNo: string;
    skuNo: string;
    skuDesc: string;
    storageClientSkuNo: string;
    goodQty: number;
    damagedQty: number;
    allocatingQty: number;
    processingQty: number;
    availableQty: number;
    country: string;
    skuStatus: string;
    reservedQty: number;
    thresholdQty: number;
}

export interface SkuVariant {
    sku_name: string;
    sku_no: string;
}

export interface SkuWarehouse {
    name: string;
}

export interface SkuItem {
    id: string;
    quantity: number;
    threshold_quantity: number;
    warehouse_id: string;
    sku_id: string;
    created_at: string;
    updated_at: string;
    sku: SkuVariant;
    warehouse: SkuWarehouse;
}

export interface SkuMetadata {
    total: number;
}

export interface SkuResponse {
    message: string;
    data: {
        skus: SkuItem[];
        metadata: SkuMetadata;
    };
}

export interface StocksMetadata {
    lowStock: number;
    processingStock: number;
    allocatingStock: number;
}

export interface StocksMetadataResponse {   
    message: string;
    data: {
        stocks: StocksMetadata;
    };
}

export interface TotalSkus {
    sku_no: string;
    quantity: number;
}

export interface TotalSkusResponse {
    message: string;
    data: {
        totalSkus: TotalSkus[];
    };
}

export interface StockDistributionResponse {
    message: string;
    data: {
        stockDistribution: StockDistribution;
    };
}

export interface StockDistribution {
    goodQty: number;
    damagedQty: number;
    allocatingQty: number;
    processingQty: number;
    availableQty: number;
}

export interface InventoryStockByLocationResponse {
    message: string;
    data: {
        stockDistributionByLocation: InventoryStockByLocation;
    };
}

export interface InventoryStockByLocation {
    totalStockSepang: number;
    totalStockIStore: number;
    totalStockPhysicalStore: number;
}

export interface UpdateQuantityRequest {
    inventoryId: string;
    quantity: number;
}

export interface UpdateQuantityResponse {
    message: string;
    data: any;
}

export interface UpdateInventoryResponse {
    message: string;
    data: {
        inventory: {
            id: string;
            quantity: number;
            threshold_quantity: number;
            warehouse_id: string;
            sku_id: string;
            created_at: string;
            updated_at: string;
            warehouse: {
                id: string;
                name: string;
                location: string;
                created_at: string;
                updated_at: string;
            };
        };
    };
}

export interface InventoryLog {
    id: string;
    user_id: string;
    inventory_id: string;
    notes: string;
    quantity_before: number;
    quantity_after: number;
    quantity_change: number;
    log_type: string;
    metadata: {
        source: string;
        ip_address: number;
    };
    created_at: string;
    updated_at: string;
}

export interface InventoryLogsResponse {
    message: string;
    data: {
        inventory_logs: InventoryLog[];
        metadata: {
            total: number;
            page: number;
            limit: number;
            total_pages: number;
            has_next: boolean;
            has_previous: boolean;
        };
    };
}

