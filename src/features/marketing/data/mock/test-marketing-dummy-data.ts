/**
 * Test file to verify marketing dummy data generation
 * This file can be used for testing and debugging the mock data
 * Remove this file once you're satisfied with the dummy data
 */

import {
    generateMarketingCampaigns,
    generateMarketingItemsList,
    generateMarketingHistoricalData,
    generatePlatformPerformanceData,
    generateCampaignPerformanceData,
    generateTopPerformingContent,
    generateMonthlyBudgetData
} from './marketing-dummy-data';

// Test function to log sample data
export const testMarketingDummyData = () => {
    console.log('🚀 Testing Marketing Dummy Data Generation');
    
    // Test campaign generation
    const campaigns = generateMarketingCampaigns(3);
    console.log('📊 Generated Campaigns:', campaigns);
    
    // Test marketing items
    const items = generateMarketingItemsList();
    console.log('📝 Generated Marketing Items:', items.slice(0, 5)); // Show first 5
    
    // Test historical data
    const startDate = '2024-01-01';
    const endDate = '2024-03-31';
    const historicalData = generateMarketingHistoricalData(startDate, endDate);
    console.log('📈 Generated Historical Data:', historicalData.slice(0, 5)); // Show first 5
    
    // Test platform performance
    const platformData = generatePlatformPerformanceData();
    console.log('🎯 Generated Platform Performance:', platformData);
    
    // Test campaign performance
    const campaignPerformance = generateCampaignPerformanceData('campaign_1');
    console.log('📊 Generated Campaign Performance:', campaignPerformance.slice(0, 7)); // Show first week
    
    // Test top performing content
    const topContent = generateTopPerformingContent();
    console.log('🏆 Generated Top Performing Content:', topContent);
    
    // Test monthly budget data
    const budgetData = generateMonthlyBudgetData();
    console.log('💰 Generated Monthly Budget Data:', budgetData);
    
    console.log('✅ All dummy data tests completed successfully!');
    
    return {
        campaigns,
        items: items.slice(0, 10), // Limit items for display
        historicalData: historicalData.slice(0, 10),
        platformData,
        campaignPerformance: campaignPerformance.slice(0, 7),
        topContent,
        budgetData
    };
};

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
    // Browser environment
    console.log('Running in browser - call testMarketingDummyData() in console');
} else {
    // Node environment (if running tests)
    // testMarketingDummyData();
}
