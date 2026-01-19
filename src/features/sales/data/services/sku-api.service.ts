import { ShopifySku } from '../model/shopify-entity';
import { SkuEntity } from '../model/sku-entity';

// Mock delay to simulate API call
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get SKU data
 * This is a mock implementation - in production, this would call a real API
 */
export const getSkuData = async (): Promise<ShopifySku[]> => {
    await mockDelay();
    
    // Return empty array as mock data
    // In a real implementation, this would fetch from an API
    return [];
};

/**
 * Default SKU data array for module-level usage
 * This is a mock implementation
 */
export const skuData: SkuEntity[] = [];

