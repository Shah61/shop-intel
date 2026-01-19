# Marketing Dummy Data

This directory contains mock data generators for the marketing feature, similar to the sales dummy data implementation.

## Overview

The marketing dummy data system provides realistic sample data for:
- **Marketing Campaigns** - Full campaign structures with items and links
- **Marketing Items** - Individual marketing activities within campaigns
- **Marketing Links** - Social media links with engagement metrics
- **Historical Data** - Time-series data for charts and analytics
- **Platform Performance** - Performance metrics across different platforms
- **Budget Data** - Monthly budget allocation and spending data

## Usage

### Configuration

Set the `USE_MOCK_DATA` flag in `src/features/marketing/presentation/tanstack/marketing-tanstack.ts`:

```typescript
const USE_MOCK_DATA = true; // Enable dummy data
```

### Available Mock Data

1. **Marketing Campaigns**
   - 10+ realistic campaign templates
   - Hierarchical structure with items and links
   - Realistic cost calculations

2. **Marketing Items**
   - Various marketing activity types
   - Platform-specific content
   - Date ranges and durations

3. **Marketing Links**
   - Social media platform links
   - Engagement metrics (likes, shares, views)
   - 24-hour change tracking
   - Platform-specific metadata

4. **Analytics Data**
   - Platform performance comparisons
   - Campaign performance over time
   - Top performing content
   - Monthly budget allocation

### Platform Support

The dummy data includes realistic metrics for:
- **TikTok** - Views, likes, shares, saves, comments
- **Instagram** - Likes, comments, shares, saves
- **Facebook** - Likes, comments, shares, views
- **Twitter** - Likes, retweets, replies, bookmarks
- **YouTube** - Views, likes, comments
- **Google Ads** - Impressions, clicks, conversions
- **Other platforms** - Generic metrics

### Key Features

- **Realistic Data** - All values are within realistic ranges
- **Time-based Variance** - Historical data shows realistic trends
- **Platform Specificity** - Different metrics for different platforms
- **Engagement Tracking** - 24-hour change calculations
- **Cost Management** - Realistic budget and cost data

## Files

- `marketing-dummy-data.ts` - Core data generation functions
- `mock-marketing-api.service.ts` - Mock API service layer
- `test-marketing-dummy-data.ts` - Test utilities (can be removed)
- `README.md` - This documentation

## Testing

To test the dummy data generation:

```typescript
import { testMarketingDummyData } from './test-marketing-dummy-data';

// In browser console or test environment
const sampleData = testMarketingDummyData();
```

## Integration

The dummy data is automatically used when `USE_MOCK_DATA = true` in the tanstack hooks:

- `useMarketingItems()` - Returns mock marketing items
- `useMarketings()` - Returns mock campaigns
- `useMarketingHistoricalData()` - Returns mock historical data
- `usePlatformPerformance()` - Returns mock platform metrics
- `useCampaignPerformance()` - Returns mock campaign performance
- `useTopPerformingContent()` - Returns mock top content
- `useMonthlyBudgetData()` - Returns mock budget data

## Switching to Real API

To switch back to real API calls:

1. Set `USE_MOCK_DATA = false` in `marketing-tanstack.ts`
2. Ensure your backend APIs are properly configured
3. Update environment variables as needed

## Data Structure

The mock data follows the exact same structure as defined in `marketing-entity.ts`:

- `Marketing` - Campaign entities
- `MarketingItem` - Item entities with links
- `MarketingLink` - Social media links with metadata
- `MarketingLinkMetadata` - Platform-specific engagement data

This ensures seamless integration with existing components and charts.
