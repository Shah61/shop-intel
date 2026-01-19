import { AnalyticsMetadataEntity, AnalyticsSalesEntity, AnalysisSKUEntity, AnalyticsType, AnalysisTimeFrame } from "../model/analytics-entity";
import { TiktokMetadata, TiktokConversionRate, TiktokSku } from "../model/tiktok-entity";
import { ShopeeMetadata, ShopeeConversionRate, ShopeeSku } from "../model/shopee-entity";
import { ShopifyMetadata, ShopifyConversionRate, ShopifySku, ShopifyStock } from "../model/shopify-entity";

// Helper function to generate dates
const generateDates = (days: number) => {
  const dates = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

// Helper function to generate random numbers within a range
const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number, decimals: number = 2) => 
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

// Generate analytics metadata for overview dashboard
export const generateAnalyticsMetadata = (timeFrame: AnalysisTimeFrame): AnalyticsMetadataEntity[] => {
  const multiplier = {
    [AnalysisTimeFrame.DAILY]: 1,
    [AnalysisTimeFrame.WEEKLY]: 7,
    [AnalysisTimeFrame.MONTHLY]: 30,
    [AnalysisTimeFrame.YEARLY]: 365
  }[timeFrame];

  return [
    {
      date: new Date().toISOString().split('T')[0],
      total_sales: randomBetween(8000, 15000) * multiplier,
      total_orders: randomBetween(200, 500) * Math.ceil(multiplier / 7),
      total_items: randomBetween(300, 800) * Math.ceil(multiplier / 7),
      average_order_value: randomFloat(25, 45),
      total_gross_revenue: randomBetween(9000, 16000) * multiplier,
      conversion_rate: randomFloat(3.5, 6.5),
      visitors: randomBetween(2000, 5000) * Math.ceil(multiplier / 3),
      total_average_order_value: randomFloat(25, 45),
      type: AnalyticsType.TIKTOK
    },
    {
      date: new Date().toISOString().split('T')[0],
      total_sales: randomBetween(12000, 20000) * multiplier,
      total_orders: randomBetween(300, 700) * Math.ceil(multiplier / 7),
      total_items: randomBetween(400, 1000) * Math.ceil(multiplier / 7),
      average_order_value: randomFloat(28, 50),
      total_gross_revenue: randomBetween(13000, 22000) * multiplier,
      conversion_rate: randomFloat(3.2, 5.8),
      visitors: randomBetween(3000, 7000) * Math.ceil(multiplier / 3),
      total_average_order_value: randomFloat(28, 50),
      type: AnalyticsType.SHOPEE
    },
    {
      date: new Date().toISOString().split('T')[0],
      total_sales: randomBetween(10000, 18000) * multiplier,
      total_orders: randomBetween(250, 600) * Math.ceil(multiplier / 7),
      total_items: randomBetween(350, 900) * Math.ceil(multiplier / 7),
      average_order_value: randomFloat(30, 55),
      total_gross_revenue: randomBetween(11000, 19000) * multiplier,
      conversion_rate: randomFloat(2.8, 5.2),
      visitors: randomBetween(2500, 6000) * Math.ceil(multiplier / 3),
      total_average_order_value: randomFloat(30, 55),
      type: AnalyticsType.SHOPIFY
    },
    {
      date: new Date().toISOString().split('T')[0],
      total_sales: randomBetween(5000, 12000) * multiplier,
      total_orders: randomBetween(100, 350) * Math.ceil(multiplier / 7),
      total_items: randomBetween(150, 500) * Math.ceil(multiplier / 7),
      average_order_value: randomFloat(35, 65),
      total_gross_revenue: randomBetween(5500, 13000) * multiplier,
      conversion_rate: randomFloat(4.5, 8.5),
      visitors: randomBetween(1000, 3000) * Math.ceil(multiplier / 3),
      total_average_order_value: randomFloat(35, 65),
      type: AnalyticsType.PHYSICAL
    },
    {
      date: new Date().toISOString().split('T')[0],
      total_sales: randomBetween(35000, 65000) * multiplier,
      total_orders: randomBetween(850, 2150) * Math.ceil(multiplier / 7),
      total_items: randomBetween(1200, 3200) * Math.ceil(multiplier / 7),
      average_order_value: randomFloat(30, 50),
      total_gross_revenue: randomBetween(38500, 70000) * multiplier,
      conversion_rate: randomFloat(3.5, 6.2),
      visitors: randomBetween(8500, 21000) * Math.ceil(multiplier / 3),
      total_average_order_value: randomFloat(30, 50),
      type: AnalyticsType.TOTAL
    }
  ];
};

// Generate historical sales data
export const generateHistoricalSalesData = (year: string, quarter: string): AnalyticsSalesEntity[] => {
  const dates = generateDates(90); // 3 months of data
  const data: AnalyticsSalesEntity[] = [];
  
  [AnalyticsType.TIKTOK, AnalyticsType.SHOPEE, AnalyticsType.SHOPIFY, AnalyticsType.PHYSICAL].forEach(type => {
    dates.forEach(date => {
      const baseMultiplierMap = {
        [AnalyticsType.TIKTOK]: { sales: [4000, 8000], orders: [100, 250], visitors: [1500, 3500] },
        [AnalyticsType.SHOPEE]: { sales: [6000, 12000], orders: [150, 350], visitors: [2000, 5000] },
        [AnalyticsType.SHOPIFY]: { sales: [5000, 10000], orders: [120, 300], visitors: [1800, 4200] },
        [AnalyticsType.PHYSICAL]: { sales: [2500, 6000], orders: [50, 150], visitors: [500, 1500] },
        [AnalyticsType.WEBSITE]: { sales: [3000, 7000], orders: [80, 200], visitors: [1200, 2800] },
        [AnalyticsType.TOTAL]: { sales: [20000, 40000], orders: [500, 1200], visitors: [8000, 20000] },
        [AnalyticsType.OTHER]: { sales: [1000, 3000], orders: [20, 80], visitors: [300, 1000] }
      };
      const baseMultiplier = baseMultiplierMap[type];

      data.push({
        date,
        total_conversions: randomBetween(baseMultiplier.orders[0] * 0.8, baseMultiplier.orders[1] * 0.8),
        total_orders: randomBetween(baseMultiplier.orders[0], baseMultiplier.orders[1]),
        total_visitors: randomBetween(baseMultiplier.visitors[0], baseMultiplier.visitors[1]),
        total_revenues: randomBetween(baseMultiplier.sales[0], baseMultiplier.sales[1]),
        total_gross_revenues: randomBetween(baseMultiplier.sales[0] * 1.1, baseMultiplier.sales[1] * 1.1),
        type
      });
    });
  });
  
  return data;
};

// Generate SKU data
export const generateSKUData = (): AnalysisSKUEntity[] => {
  const skuNames = [
    "Premium Denim Jeans", "Classic White T-Shirt", "Cotton Dress Shirt", "Leather Jacket",
    "Wool Sweater", "Chino Pants", "Cotton Polo Shirt", "Hoodie", "Cargo Shorts", "Blazer"
  ];
  
  return skuNames.map((name, index) => ({
    sku: `SKU-${1000 + index}`,
    name,
    quantity: randomBetween(50, 500),
    revenue: randomBetween(1000, 15000),
    product_id: 100 + index,
    variant_id: 200 + index,
    quantity_percentage: `${randomFloat(5, 25, 1)}%`,
    revenue_percentage: `${randomFloat(8, 30, 1)}%`,
    image: `https://picsum.photos/200/200?random=${index}`,
    variant_title: `${name} - Standard`,
    type: [AnalyticsType.SHOPIFY, AnalyticsType.PHYSICAL][index % 2],
    created_at: new Date(Date.now() - randomBetween(1, 365) * 24 * 60 * 60 * 1000).toISOString()
  }));
};

// Generate conversion sales data
export const generateConversionSalesData = (): AnalyticsSalesEntity[] => {
  const dates = generateDates(30);
  const data: AnalyticsSalesEntity[] = [];
  
  [AnalyticsType.TIKTOK, AnalyticsType.SHOPEE, AnalyticsType.SHOPIFY, AnalyticsType.PHYSICAL].forEach(type => {
    dates.forEach(date => {
      const baseDataMap = {
        [AnalyticsType.TIKTOK]: { revenue: [3000, 7000], orders: [80, 200], visitors: [1200, 2800] },
        [AnalyticsType.SHOPEE]: { revenue: [5000, 10000], orders: [120, 280], visitors: [1800, 4000] },
        [AnalyticsType.SHOPIFY]: { revenue: [4000, 8500], orders: [100, 240], visitors: [1500, 3500] },
        [AnalyticsType.PHYSICAL]: { revenue: [2000, 5000], orders: [40, 120], visitors: [400, 1200] },
        [AnalyticsType.WEBSITE]: { revenue: [2500, 6000], orders: [60, 160], visitors: [1000, 2400] },
        [AnalyticsType.TOTAL]: { revenue: [16500, 36500], orders: [400, 1000], visitors: [6800, 16800] },
        [AnalyticsType.OTHER]: { revenue: [800, 2500], orders: [15, 60], visitors: [250, 800] }
      };
      const baseData = baseDataMap[type];

      const visitors = randomBetween(baseData.visitors[0], baseData.visitors[1]);
      const orders = randomBetween(baseData.orders[0], baseData.orders[1]);
      const revenue = randomBetween(baseData.revenue[0], baseData.revenue[1]);
      
      data.push({
        date,
        total_revenues: revenue,
        total_orders: orders,
        total_visitors: visitors,
        total_conversions: Math.floor(orders * randomFloat(0.8, 1.2)),
        total_gross_revenues: Math.floor(revenue * randomFloat(1.1, 1.2)),
        type
      });
    });
  });
  
  return data;
};

// TikTok specific dummy data
export const generateTikTokMetadata = (timeframe: string): TiktokMetadata => {
  const multiplier = {
    daily: 1,
    weekly: 7,
    monthly: 30,
    yearly: 365
  }[timeframe] || 1;

  return {
    orders: randomBetween(150, 400) * Math.ceil(multiplier / 7),
    item_order: randomBetween(200, 600) * Math.ceil(multiplier / 7),
    conversion_rate: randomFloat(3.5, 6.8),
    products: randomBetween(45, 85),
    revenue: randomBetween(8000, 18000) * multiplier,
    gross_revenue: randomBetween(9000, 20000) * multiplier
  };
};

export const generateTikTokConversionRate = (): TiktokConversionRate[] => {
  return generateDates(30).map(date => ({
    date,
    conversion_rate: randomFloat(3, 7),
    total_orders: randomBetween(80, 250),
    total_visitors: randomBetween(1500, 4000),
    total_revenues: randomBetween(3000, 8500),
    total_gross_revenues: randomBetween(3300, 9350)
  }));
};

export const generateTikTokSkus = (): TiktokSku[] => {
  const products = [
    "Viral Dance Accessories", "Phone Ring Light", "Trendy Face Mask", "Selfie Stick Pro",
    "LED Strip Lights", "Mini Tripod", "Phone Lens Kit", "Bluetooth Mic", "Ring Light Stand", "Cable Organizer"
  ];
  
  return products.map((name, index) => ({
    sku: `TT-${2000 + index}`,
    name,
    quantity: randomBetween(30, 300),
    revenue: randomBetween(800, 12000),
    product_id: 300 + index,
    variant_id: 400 + index,
    quantity_percentage: `${randomFloat(3, 20, 1)}%`,
    revenue_percentage: `${randomFloat(5, 25, 1)}%`,
    image: `https://picsum.photos/200/200?random=${index + 100}`,
    variant_title: `${name} - Popular`,
    stock: randomBetween(10, 200)
  }));
};

// Shopee specific dummy data
export const generateShopeeMetadata = (type: AnalysisTimeFrame): ShopeeMetadata => {
  const multiplier = {
    [AnalysisTimeFrame.DAILY]: 1,
    [AnalysisTimeFrame.WEEKLY]: 7,
    [AnalysisTimeFrame.MONTHLY]: 30,
    [AnalysisTimeFrame.YEARLY]: 365
  }[type];

  return {
    orders: randomBetween(200, 500) * Math.ceil(multiplier / 7),
    sales: randomBetween(12000, 25000) * multiplier,
    conversionRate: randomFloat(3.8, 6.2),
    products: randomBetween(50, 120),
    visitors: randomBetween(3000, 8000) * Math.ceil(multiplier / 3)
  };
};

export const generateShopeeConversionRate = (): ShopeeConversionRate[] => {
  return generateDates(30).map(date => ({
    date,
    conversion_rate: randomFloat(3.2, 6.5),
    total_orders: randomBetween(120, 350),
    total_visitors: randomBetween(2500, 6000),
    total_revenues: randomBetween(6000, 15000)
  }));
};

export const generateShopeeSkus = (): ShopeeSku[] => {
  const products = [
    "Southeast Asian Snacks", "Local Beauty Products", "Traditional Crafts", "Electronics Bundle",
    "Fashion Accessories", "Home Decor Items", "Kitchen Gadgets", "Smartphone Case", "Tablet Stand", "Power Bank"
  ];
  
  return products.map((name, index) => ({
    sku: `SP-${3000 + index}`,
    name,
    quantity: randomBetween(40, 400),
    revenue: randomBetween(1200, 18000),
    product_id: 500 + index,
    variant_id: 600 + index,
    quantity_percentage: `${randomFloat(4, 22, 1)}%`,
    revenue_percentage: `${randomFloat(6, 28, 1)}%`,
    image: `https://picsum.photos/200/200?random=${index + 200}`,
    variant_title: `${name} - Standard`,
    views: randomBetween(500, 3000),
    conversion_rate: randomFloat(2.5, 8.5),
    stocks: randomBetween(15, 250)
  }));
};

// Shopify specific dummy data
export const generateShopifyMetadata = (timeframe: AnalysisTimeFrame): ShopifyMetadata => {
  const multiplier = {
    [AnalysisTimeFrame.DAILY]: 1,
    [AnalysisTimeFrame.WEEKLY]: 7,
    [AnalysisTimeFrame.MONTHLY]: 30,
    [AnalysisTimeFrame.YEARLY]: 365
  }[timeframe];

  return {
    orders: randomBetween(180, 450) * Math.ceil(multiplier / 7),
    sales: randomBetween(10000, 22000) * multiplier,
    conversionRate: randomFloat(2.8, 5.5),
    products: randomBetween(40, 100)
  };
};

export const generateShopifyConversionRate = (): ShopifyConversionRate[] => {
  return generateDates(30).map(date => ({
    date,
    conversion_rate: randomFloat(2.5, 5.8),
    total_orders: randomBetween(100, 300),
    total_visitors: randomBetween(2000, 5500),
    total_revenues: randomBetween(5000, 13000)
  }));
};

export const generateShopifySkus = (): ShopifySku[] => {
  const products = [
    "Premium Denim Jacket", "Eco-Friendly Cotton T-Shirt", "Wool Blend Sweater", "Organic Cotton Collection",
    "Classic Chino Pants", "Leather Belt", "Canvas Tote Bag", "Polo Shirt", "Cargo Shorts", "Dress Shirt Set"
  ];
  
  return products.map((name, index) => ({
    sku: `SH-${4000 + index}`,
    name,
    quantity: randomBetween(35, 350),
    revenue: randomBetween(1000, 16000),
    product_id: 700 + index,
    variant_id: 800 + index,
    quantity_percentage: `${randomFloat(3.5, 20, 1)}%`,
    revenue_percentage: `${randomFloat(5.5, 25, 1)}%`,
    image: `https://picsum.photos/200/200?random=${index + 300}`,
    variant_title: `${name} - Premium`
  }));
};

export const generateShopifyStock = (): ShopifyStock[] => {
  return generateShopifySkus().map((sku, index) => ({
    id: 900 + index,
    sku: sku.sku,
    inventory_quantity: randomBetween(10, 500)
  }));
};
