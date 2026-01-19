import { InventoryEntity } from '../model/inventory-entity';

// Mock delay to simulate API call
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get list of inventory items
 * This is a mock implementation - in production, this would call a real API
 */
export const getListInventory = async (): Promise<InventoryEntity[]> => {
    await mockDelay();
    
    // Return empty array as mock data
    // In a real implementation, this would fetch from an API
    return [];
};

