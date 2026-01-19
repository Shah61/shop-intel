import {
    PlatformEntity,
    PlatformSalesByDate,
    PlatformTotals,
    Platform
} from '../model/platform-entity';

/**
 * Transforms platform entity data into daily aggregated data and totals
 */
export const transformPlatformData = (
    entities: PlatformEntity[]
): { dailyData: PlatformSalesByDate[]; totals: PlatformTotals } => {
    // Group by date
    const dateMap = new Map<string, PlatformSalesByDate>();

    entities.forEach((entity) => {
        const date = entity.date;
        
        if (!dateMap.has(date)) {
            dateMap.set(date, {
                date,
                physical: 0,
                shopee: 0,
                tiktok: 0,
                website: 0,
                total: 0
            });
        }

        const dailyData = dateMap.get(date)!;
        
        // Add amount to the appropriate platform
        switch (entity.platform) {
            case Platform.PHYSICAL:
                dailyData.physical += entity.amount;
                break;
            case Platform.SHOPEE:
                dailyData.shopee += entity.amount;
                break;
            case Platform.TIKTOK:
                dailyData.tiktok += entity.amount;
                break;
            case Platform.WEBSITE:
                dailyData.website += entity.amount;
                break;
        }
        
        dailyData.total += entity.amount;
    });

    // Convert map to array and sort by date
    const dailyData = Array.from(dateMap.values()).sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // Calculate totals
    const totals: PlatformTotals = {
        physical: 0,
        shopee: 0,
        tiktok: 0,
        website: 0,
        total: 0
    };

    dailyData.forEach((data) => {
        totals.physical += data.physical;
        totals.shopee += data.shopee;
        totals.tiktok += data.tiktok;
        totals.website += data.website;
        totals.total += data.total;
    });

    return { dailyData, totals };
};

