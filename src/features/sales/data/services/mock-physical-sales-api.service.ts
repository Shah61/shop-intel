import {
  mockPhysicalSalesData
} from '../mock/physical-sales-dummy-data';
import {
  ProductEntity
} from '../model/physical/products-entity';
import {
  CategoryResponse,
  CategoryParams,
  CategoryUpdateParams,
  Category
} from '../model/physical/categories-entity';
import {
  CollectionResponse,
  CollectionEntity,
  CollectionCreateParams,
  CollectionUpdateParams
} from '../model/physical/collection-entity';
import {
  DiscountResponse,
  DiscountEntity,
  DiscountCreateParams,
  DiscountFilterParams
} from '../model/physical/discount-entity';
import {
  OrderListResponse,
  OrderEntity,
  OrderFilterParams,
  OrderItemEntity
} from '../model/physical/orders-entity';
import {
  PhysicalOverviewEntity
} from '../model/physical/physical-overview-entity';
import {
  PhysicalConversionEntity
} from '../model/physical/conversion-entity';
import {
  AnalyticsSalesEntity,
  AnalyticsMetadataEntity,
  AnalysisSKUEntity,
  SkuPerformanceDetailEntity,
  SkuPerformanceHistoricalDataEntity,
  AnalysisTimeFrame
} from '../model/analytics-entity';

// Simulate API delay
const simulateDelay = (ms: number = 800) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Products API
export const getMockProducts = async (): Promise<ProductEntity[]> => {
  await simulateDelay();
  return mockPhysicalSalesData.products;
};

export const getMockProductById = async (id: string): Promise<ProductEntity | null> => {
  await simulateDelay();
  return mockPhysicalSalesData.products.find(p => p.id === id) || null;
};

export const createMockProduct = async (product: Partial<ProductEntity>): Promise<ProductEntity> => {
  await simulateDelay();
  const newProduct: ProductEntity = {
    id: `prod_${Date.now()}`,
    name: product.name || '',
    variants: product.variants || [],
    images: product.images || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  mockPhysicalSalesData.products.push(newProduct);
  return newProduct;
};

export const updateMockProduct = async (id: string, updates: Partial<ProductEntity>): Promise<ProductEntity> => {
  await simulateDelay();
  const index = mockPhysicalSalesData.products.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Product not found');
  
  mockPhysicalSalesData.products[index] = {
    ...mockPhysicalSalesData.products[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  return mockPhysicalSalesData.products[index];
};

export const deleteMockProduct = async (id: string): Promise<void> => {
  await simulateDelay();
  const index = mockPhysicalSalesData.products.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Product not found');
  mockPhysicalSalesData.products.splice(index, 1);
};

export const deleteMockProducts = async (ids: string[]): Promise<void> => {
  await simulateDelay();
  ids.forEach(id => {
    const index = mockPhysicalSalesData.products.findIndex(p => p.id === id);
    if (index !== -1) {
      mockPhysicalSalesData.products.splice(index, 1);
    }
  });
};

// Categories API
export const getMockCategories = async (): Promise<CategoryResponse> => {
  await simulateDelay();
  return {
    message: "Categories retrieved successfully",
    data: {
      categories: mockPhysicalSalesData.categories,
      metadata: {
        total: mockPhysicalSalesData.categories.length
      }
    }
  };
};

export const createMockCategory = async (params: CategoryParams): Promise<Category> => {
  await simulateDelay();
  const newCategory: Category = {
    id: `cat_${Date.now()}`,
    country_id: "US",
    name: params.name,
    description: params.description,
    is_active: true,
    launch_date: new Date().toISOString().split('T')[0],
    end_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    users: [],
    variants: []
  };
  mockPhysicalSalesData.categories.push(newCategory);
  return newCategory;
};

export const updateMockCategory = async (id: string, params: CategoryUpdateParams): Promise<Category> => {
  await simulateDelay();
  const index = mockPhysicalSalesData.categories.findIndex(c => c.id === id);
  if (index === -1) throw new Error('Category not found');
  
  mockPhysicalSalesData.categories[index] = {
    ...mockPhysicalSalesData.categories[index],
    ...params,
    updated_at: new Date().toISOString()
  };
  return mockPhysicalSalesData.categories[index];
};

export const deleteMockCategory = async (id: string): Promise<void> => {
  await simulateDelay();
  const index = mockPhysicalSalesData.categories.findIndex(c => c.id === id);
  if (index === -1) throw new Error('Category not found');
  mockPhysicalSalesData.categories.splice(index, 1);
};

// Collections API
export const getMockCollections = async (): Promise<CollectionEntity[]> => {
  await simulateDelay();
  return mockPhysicalSalesData.collections;
};

export const getMockCollectionById = async (id: string): Promise<CollectionEntity | null> => {
  await simulateDelay();
  return mockPhysicalSalesData.collections.find(c => c.id === id) || null;
};

export const createMockCollection = async (params: CollectionCreateParams): Promise<CollectionEntity> => {
  await simulateDelay();
  const newCollection: CollectionEntity = {
    id: `col_${Date.now()}`,
    name: params.name,
    description: params.description,
    is_active: params.is_active ?? true,
    handle: params.handle || params.name.toLowerCase().replace(/\s+/g, '-'),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  mockPhysicalSalesData.collections.push(newCollection);
  return newCollection;
};

export const updateMockCollection = async (id: string, params: CollectionUpdateParams): Promise<CollectionEntity> => {
  await simulateDelay();
  const index = mockPhysicalSalesData.collections.findIndex(c => c.id === id);
  if (index === -1) throw new Error('Collection not found');
  
  mockPhysicalSalesData.collections[index] = {
    ...mockPhysicalSalesData.collections[index],
    ...params,
    updated_at: new Date().toISOString()
  };
  return mockPhysicalSalesData.collections[index];
};

export const deleteMockCollection = async (id: string): Promise<void> => {
  await simulateDelay();
  const index = mockPhysicalSalesData.collections.findIndex(c => c.id === id);
  if (index === -1) throw new Error('Collection not found');
  mockPhysicalSalesData.collections.splice(index, 1);
};

// Discounts API
export const getMockDiscounts = async (params?: DiscountFilterParams): Promise<DiscountResponse> => {
  await simulateDelay();
  let filteredDiscounts = [...mockPhysicalSalesData.discounts];
  
  // Apply filters
  if (params?.code) {
    filteredDiscounts = filteredDiscounts.filter(d => 
      d.code.toLowerCase().includes(params.code!.toLowerCase())
    );
  }
  
  if (params?.discount_type) {
    filteredDiscounts = filteredDiscounts.filter(d => d.discount_type === params.discount_type);
  }
  
  if (params?.is_active !== undefined) {
    filteredDiscounts = filteredDiscounts.filter(d => d.is_active === params.is_active);
  }
  
  // Apply pagination
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedDiscounts = filteredDiscounts.slice(startIndex, endIndex);
  
  return {
    message: "Discounts retrieved successfully",
    data: {
      discounts: paginatedDiscounts,
      metadata: {
        total: filteredDiscounts.length,
        page,
        limit,
        total_pages: Math.ceil(filteredDiscounts.length / limit),
        has_next: endIndex < filteredDiscounts.length,
        has_previous: page > 1
      }
    }
  };
};

export const createMockDiscount = async (params: DiscountCreateParams): Promise<DiscountEntity> => {
  await simulateDelay();
  const newDiscount: DiscountEntity = {
    id: `disc_${Date.now()}`,
    title: params.title,
    code: params.code,
    discount_type: params.discount_type,
    discount_value: params.discount_value,
    starts_at: params.starts_at,
    ends_at: params.ends_at,
    is_active: params.is_active,
    miniumum_purchase_amount: params.miniumum_purchase_amount || null,
    mininum_quantity: params.mininum_quantity || null,
    is_exclusive: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    collection_discounts: [],
    customer_medusa_discounts: []
  };
  mockPhysicalSalesData.discounts.push(newDiscount);
  return newDiscount;
};

export const deleteMockDiscount = async (id: string): Promise<void> => {
  await simulateDelay();
  const index = mockPhysicalSalesData.discounts.findIndex(d => d.id === id);
  if (index === -1) throw new Error('Discount not found');
  mockPhysicalSalesData.discounts.splice(index, 1);
};

// Orders API
export const getMockOrders = async (params?: OrderFilterParams): Promise<OrderListResponse> => {
  await simulateDelay();
  let filteredOrders = [...mockPhysicalSalesData.orders];
  
  // Apply sorting
  if (params?.is_desc) {
    filteredOrders.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
  } else {
    filteredOrders.sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime());
  }
  
  // Apply pagination
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
  
  return {
    orders: paginatedOrders,
    metadata: {
      total: filteredOrders.length,
      page,
      limit,
      total_pages: Math.ceil(filteredOrders.length / limit)
    }
  };
};

export const createMockOrder = async (order: Omit<Partial<OrderEntity>, 'order_items'> & {
  order_items?: Array<{
    product_id: string;
    variant_id: string;
    quantity: number;
    unit_price?: number;
    total_price?: number;
    id?: string;
    [key: string]: any;
  }>;
}): Promise<OrderEntity> => {
  await simulateDelay();
  
  // Process order items - calculate unit_price and total_price if not provided
  const processedOrderItems: OrderItemEntity[] = (order.order_items || []).map((item, index) => {
    // If item already has unit_price and total_price, use them
    if ('unit_price' in item && 'total_price' in item && item.unit_price !== undefined && item.total_price !== undefined) {
      return item as OrderItemEntity;
    }
    
    // Otherwise, look up the variant to get the price
    let unitPrice = 0;
    let product: ProductEntity | undefined;
    let variant: any;
    
    if (item.variant_id) {
      // Find variant in mock data
      for (const prod of mockPhysicalSalesData.products) {
        const foundVariant = prod.variants?.find(v => v.id === item.variant_id);
        if (foundVariant) {
          variant = foundVariant;
          product = prod;
          unitPrice = foundVariant.price || 0;
          break;
        }
      }
    }
    
    const quantity = item.quantity || 0;
    const totalPrice = unitPrice * quantity;
    
    return {
      id: item.id || `item_${Date.now()}_${index}`,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      product: product,
      variant: variant,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
  
  // Calculate total amount from order items
  const totalAmount = processedOrderItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
  
  const newOrder: OrderEntity = {
    id: `order_${Date.now()}`,
    order_number: `CHO-${(2000 + mockPhysicalSalesData.orders.length).toString()}`,
    total_amount: order.total_amount || totalAmount,
    user_id: order.user_id || null,
    customer_medusa_id: order.customer_medusa_id || null,
    discount_id: order.discount_id || null,
    country_code: order.country_code || "US",
    shipping_country: order.shipping_country || "US",
    currency: order.currency || "USD",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_medusa: order.customer_medusa || null,
    order_items: processedOrderItems
  };
  mockPhysicalSalesData.orders.push(newOrder);
  return newOrder;
};

export const deleteMockOrder = async (id: string): Promise<void> => {
  await simulateDelay();
  const index = mockPhysicalSalesData.orders.findIndex(o => o.id === id);
  if (index === -1) throw new Error('Order not found');
  mockPhysicalSalesData.orders.splice(index, 1);
};

export const getMockOrderById = async (id: string): Promise<any> => {
  await simulateDelay();
  const order = mockPhysicalSalesData.orders.find(o => o.id === id);
  
  if (!order) {
    throw new Error('Order not found');
  }

  // Get the first order item to extract product and variant info
  const firstItem = order.order_items?.[0];
  if (!firstItem) {
    return {
      ...order,
      variants: null,
      products: null,
      users: null,
      quantity_orders: 0
    };
  }

  // Get product and variant from the first order item
  const product = firstItem.product;
  const variant = firstItem.variant;

  // Get user info (mock user data)
  const user = {
    id: order.user_id || 'user_1',
    name: order.customer_medusa?.first_name 
      ? `${order.customer_medusa.first_name} ${order.customer_medusa.last_name || ''}`.trim()
      : 'Customer',
    email: order.customer_medusa?.email || 'customer@example.com',
    role: 'CUSTOMER',
    created_at: order.created_at
  };

  return {
    ...order,
    variants: variant ? {
      ...variant,
      sku_name: variant.sku_no || variant.sku_name || 'N/A',
      price: variant.price || firstItem.unit_price || 0,
      quantity: variant.quantity || 0
    } : null,
    products: product ? {
      ...product,
      images: product.images || [],
      name: product.name || 'Unknown Product'
    } : null,
    users: user,
    quantity_orders: firstItem.quantity || 0
  };
};

// Physical Overview API
export const getMockPhysicalOverview = async (query?: { query?: AnalysisTimeFrame }): Promise<PhysicalOverviewEntity> => {
  await simulateDelay();
  return mockPhysicalSalesData.physicalOverview;
};

// Physical Conversion API
export const getMockPhysicalConversions = async (): Promise<PhysicalConversionEntity[]> => {
  await simulateDelay();
  return mockPhysicalSalesData.physicalConversions;
};

// Analytics API
export const getMockAnalyticsSKU = async (): Promise<AnalysisSKUEntity[]> => {
  await simulateDelay();
  return mockPhysicalSalesData.skuAnalytics;
};

export const getMockSkuPerformanceHistorical = async (params?: { year?: string; quarter?: string }): Promise<SkuPerformanceHistoricalDataEntity[]> => {
  await simulateDelay();
  return mockPhysicalSalesData.skuPerformanceHistorical;
};

export const getMockSkuPerformanceDetail = async (params?: { year?: string; quarter?: string; sku?: string }): Promise<AnalysisSKUEntity[]> => {
  await simulateDelay();
  if (params?.sku) {
    const skuData = mockPhysicalSalesData.skuAnalytics.filter(sku => sku.sku === params.sku);
    return skuData;
  }
  return mockPhysicalSalesData.skuAnalytics.slice(0, 5);
};

export const getMockAllSKU = async (): Promise<AnalysisSKUEntity[]> => {
  await simulateDelay();
  return mockPhysicalSalesData.skuAnalytics;
};

export const getMockAnalyticsSales = async (): Promise<AnalyticsSalesEntity[]> => {
  await simulateDelay();
  return mockPhysicalSalesData.salesAnalytics;
};

export const getMockAnalyticsMetadata = async (): Promise<AnalyticsMetadataEntity[]> => {
  await simulateDelay();
  return mockPhysicalSalesData.analyticsMetadata;
};

// Mock users and variants for category management
export const getMockUsersForCategory = async () => {
  await simulateDelay();
  return [
    {
      id: "user_1",
      name: "John Smith",
      email: "john.smith@company.com",
      role: "ADMIN",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: new Date().toISOString()
    },
    {
      id: "user_2",
      name: "Jane Doe",
      email: "jane.doe@company.com",
      role: "MANAGER",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: new Date().toISOString()
    },
    {
      id: "user_3",
      name: "Mike Wilson",
      email: "mike.wilson@company.com",
      role: "STAFF",
      created_at: "2024-02-01T00:00:00Z",
      updated_at: new Date().toISOString()
    },
    {
      id: "user_4",
      name: "Sarah Connor",
      email: "sarah.connor@company.com",
      role: "STAFF",
      created_at: "2024-02-15T00:00:00Z",
      updated_at: new Date().toISOString()
    }
  ];
};

export const getMockVariantsForCategory = async () => {
  await simulateDelay();
  return mockPhysicalSalesData.products.flatMap(product => 
    product.variants?.map(variant => ({
      id: variant.id,
      sku_name: variant.sku_name,
      price: variant.price,
      created_at: variant.created_at,
      updated_at: variant.updated_at,
      product: {
        id: product.id,
        name: product.name,
        description: `${product.name} product`
      }
    })) || []
  );
};
