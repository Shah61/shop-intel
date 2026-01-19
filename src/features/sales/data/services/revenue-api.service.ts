import { RevenueEntity } from '../model/revenue-entity';

// Mock delay to simulate API call
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get revenue data
 * This is a mock implementation - in production, this would call a real API
 */
export const getRevenue = async (): Promise<RevenueEntity[]> => {
    await mockDelay();
    
    // Return empty array as mock data
    // In a real implementation, this would fetch from an API
    return [];
};

