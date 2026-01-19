import axios, { AxiosError } from "axios";
import { 
    InventoryStock, 
    InventoryStockByLocationResponse, 
    StockDistributionResponse, 
    StocksMetadataResponse, 
    TotalSkusResponse,
    SkuResponse,
    UpdateQuantityRequest,
    UpdateQuantityResponse,
    UpdateInventoryResponse
} from "../../data/model/inventory-entity";

export const getInventoryIstoreListSku = async (accessToken?: string): Promise<InventoryStock[]> => {
    try {
        const headers: { [key: string]: string } = {};
        
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await axios.get<InventoryStock[]>(`${process.env['Shop-Intel_ADMIN_URL']}/istore/list-sku-detail`, {
            headers
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || 'Failed to fetch inventory istore list sku');
        }
        throw new Error('Failed to fetch inventory istore list sku');
    }
};

export const getTotalSkus = async (accessToken?: string): Promise<TotalSkusResponse> => {
    try {
        const headers: { [key: string]: string } = {};
        
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await axios.get<TotalSkusResponse>(`${process.env['Shop-Intel_ADMIN_URL']}/inventories/total-skus`, {
            headers
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || 'Failed to fetch total skus');
        }
        throw new Error('Failed to fetch total skus');
    }
};

export const getStocksMetadata = async (accessToken?: string): Promise<StocksMetadataResponse> => {
    try {
        const headers: { [key: string]: string } = {};
        
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await axios.get<StocksMetadataResponse>(`${process.env['Shop-Intel_ADMIN_URL']}/inventories/stocks-metadata`, {
            headers
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || 'Failed to fetch stocks metadata');
        }
        throw new Error('Failed to fetch stocks metadata');
    }
};

export const getStockDistribution = async (accessToken?: string): Promise<StockDistributionResponse> => {
    try {
        const headers: { [key: string]: string } = {};
        
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await axios.get<StockDistributionResponse>(`${process.env['Shop-Intel_ADMIN_URL']}/inventories/stocks-distribution`, {
            headers
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || 'Failed to fetch stock distribution');
        }
        throw new Error('Failed to fetch stock distribution');
    }
};

export const getInventoryStockByLocation = async (accessToken?: string): Promise<InventoryStockByLocationResponse> => {
    try {
        const headers: { [key: string]: string } = {};
        
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await axios.get<InventoryStockByLocationResponse>(`${process.env['Shop-Intel_ADMIN_URL']}/inventories/stocks-by-location`, {
            headers
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || 'Failed to fetch inventory stock by location');
        }
        throw new Error('Failed to fetch inventory stock by location');
    }
};

export const getSkuDetailsSepang = async (accessToken?: string): Promise<SkuResponse> => {
    try {
        const headers: { [key: string]: string } = {};
        
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await axios.get<SkuResponse>(`${process.env['Shop-Intel_ADMIN_URL']}/inventories/warehouse-by-name/sepang`, {
            headers
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || 'Failed to fetch SKU details for Sepang');
        }
        throw new Error('Failed to fetch SKU details for Sepang');
    }
}

export const getSkuDetailsPhysicalStore = async (accessToken?: string): Promise<SkuResponse> => {
    try {
        const headers: { [key: string]: string } = {};
        
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await axios.get<SkuResponse>(`${process.env['Shop-Intel_ADMIN_URL']}/inventories/warehouse-by-name/physical-store`, {
            headers
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || 'Failed to fetch SKU details for Physical Store');
        }
        throw new Error('Failed to fetch SKU details for Physical Store');
    }
}

export const updateQuantity = async (data: UpdateQuantityRequest, accessToken?: string): Promise<UpdateQuantityResponse> => {
    try {
        const headers: { [key: string]: string } = {};
        
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await axios.post<UpdateQuantityResponse>(`${process.env['Shop-Intel_ADMIN_URL']}/inventories/update-quantity`, data, {
            headers
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || 'Failed to update quantity');
        }
        throw new Error('Failed to update quantity');
    }
}

export const updateInventoryQuantity = async (
    inventoryId: string, 
    quantityChange: number, 
    userId: string,
    thresholdQuantity?: number,
    notes?: string,
    accessToken?: string
): Promise<UpdateInventoryResponse> => {
    try {
        const headers: { [key: string]: string } = {};
        
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const requestBody: any = { 
            quantity: quantityChange,
            user_id: userId
        };
        
        if (thresholdQuantity !== undefined) {
            requestBody.threshold_quantity = thresholdQuantity;
        }
        
        if (notes) {
            requestBody.note = notes;
        }

        const response = await axios.patch<UpdateInventoryResponse>(
            `${process.env['Shop-Intel_ADMIN_URL']}/inventories/${inventoryId}`,
            requestBody,
            { headers }
        );
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || 'Failed to update inventory quantity');
        }
        throw new Error('Failed to update inventory quantity');
    }
}

