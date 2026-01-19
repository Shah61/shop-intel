import { 
  ProductEntity, 
  PhysicalStockEntity 
} from '../model/physical/products-entity';
import { 
  Category, 
  CategoryUser, 
  CategoryVariant, 
  CategoryResponse 
} from '../model/physical/categories-entity';
import { 
  CollectionEntity, 
  CollectionResponse 
} from '../model/physical/collection-entity';
import { 
  DiscountEntity, 
  DiscountResponse 
} from '../model/physical/discount-entity';
import { 
  OrderEntity, 
  OrderListResponse, 
  OrderItemEntity 
} from '../model/physical/orders-entity';
import { 
  VariantEntity 
} from '../model/physical/variants-entity';
import { 
  CustomerEntity 
} from '../model/physical/customer-entity';
import { 
  PhysicalOverviewEntity 
} from '../model/physical/physical-overview-entity';
import { 
  PhysicalConversionEntity, 
  PhysicalSKUEntity 
} from '../model/physical/conversion-entity';
import { 
  AnalyticsSalesEntity, 
  AnalyticsMetadataEntity, 
  AnalysisSKUEntity, 
  SkuPerformanceDetailEntity, 
  SkuPerformanceHistoricalDataEntity,
  AnalyticsType 
} from '../model/analytics-entity';

// Clothing Product Names and Data
const clothingProducts = [
  {
    name: "Classic White T-Shirt",
    description: "Premium cotton t-shirt with comfortable fit",
    category: "T-Shirts",
    basePrice: 24.99,
    images: ["https://picsum.photos/400/400?random=1"]
  },
  {
    name: "Slim Fit Denim Jeans",
    description: "Classic blue denim jeans with stretch fabric",
    category: "Jeans",
    basePrice: 79.99,
    images: ["https://picsum.photos/400/400?random=2"]
  },
  {
    name: "Cotton Polo Shirt",
    description: "Casual polo shirt perfect for everyday wear",
    category: "Polo Shirts",
    basePrice: 39.99,
    images: ["https://picsum.photos/400/400?random=3"]
  },
  {
    name: "Leather Jacket",
    description: "Genuine leather jacket with classic design",
    category: "Jackets",
    basePrice: 199.99,
    images: ["https://picsum.photos/400/400?random=4"]
  },
  {
    name: "Hooded Sweatshirt",
    description: "Comfortable hoodie with front pocket",
    category: "Hoodies",
    basePrice: 49.99,
    images: ["https://picsum.photos/400/400?random=5"]
  },
  {
    name: "Chino Pants",
    description: "Versatile chino pants for casual and smart casual",
    category: "Pants",
    basePrice: 59.99,
    images: ["https://picsum.photos/400/400?random=6"]
  },
  {
    name: "Button-Down Dress Shirt",
    description: "Formal dress shirt for business and occasions",
    category: "Dress Shirts",
    basePrice: 44.99,
    images: ["https://picsum.photos/400/400?random=7"]
  },
  {
    name: "Cargo Shorts",
    description: "Practical cargo shorts with multiple pockets",
    category: "Shorts",
    basePrice: 34.99,
    images: ["https://picsum.photos/400/400?random=8"]
  },
  {
    name: "Winter Coat",
    description: "Warm winter coat with insulated lining",
    category: "Coats",
    basePrice: 149.99,
    images: ["https://picsum.photos/400/400?random=9"]
  },
  {
    name: "Blazer",
    description: "Classic blazer for professional and formal wear",
    category: "Blazers",
    basePrice: 129.99,
    images: ["https://picsum.photos/400/400?random=10"]
  }
];

// Clothing Variants/SKUs
const clothingVariants = [
  // Classic White T-Shirt variants
  { productIndex: 0, sku: "TS-WH-S", name: "White T-Shirt - Small", size: "S", price: 24.99, quantity: 150 },
  { productIndex: 0, sku: "TS-WH-M", name: "White T-Shirt - Medium", size: "M", price: 24.99, quantity: 200 },
  { productIndex: 0, sku: "TS-WH-L", name: "White T-Shirt - Large", size: "L", price: 24.99, quantity: 180 },
  { productIndex: 0, sku: "TS-WH-XL", name: "White T-Shirt - XL", size: "XL", price: 26.99, quantity: 120 },
  
  // Denim Jeans
  { productIndex: 1, sku: "JN-BL-30", name: "Blue Jeans - 30", size: "30", price: 79.99, quantity: 45 },
  { productIndex: 1, sku: "JN-BL-32", name: "Blue Jeans - 32", size: "32", price: 79.99, quantity: 60 },
  { productIndex: 1, sku: "JN-BL-34", name: "Blue Jeans - 34", size: "34", price: 79.99, quantity: 55 },
  { productIndex: 1, sku: "JN-BL-36", name: "Blue Jeans - 36", size: "36", price: 79.99, quantity: 40 },
  
  // Cotton Polo Shirt
  { productIndex: 2, sku: "PL-BL-M", name: "Blue Polo - Medium", size: "M", price: 39.99, quantity: 85 },
  { productIndex: 2, sku: "PL-BL-L", name: "Blue Polo - Large", size: "L", price: 39.99, quantity: 90 },
  { productIndex: 2, sku: "PL-NV-M", name: "Navy Polo - Medium", size: "M", price: 39.99, quantity: 75 },
  { productIndex: 2, sku: "PL-NV-L", name: "Navy Polo - Large", size: "L", price: 39.99, quantity: 80 },
  
  // Leather Jacket
  { productIndex: 3, sku: "LJ-BK-M", name: "Black Leather - Medium", size: "M", price: 199.99, quantity: 25 },
  { productIndex: 3, sku: "LJ-BK-L", name: "Black Leather - Large", size: "L", price: 199.99, quantity: 30 },
  { productIndex: 3, sku: "LJ-BK-XL", name: "Black Leather - XL", size: "XL", price: 199.99, quantity: 20 },
  
  // Hooded Sweatshirt
  { productIndex: 4, sku: "HD-GY-M", name: "Gray Hoodie - Medium", size: "M", price: 49.99, quantity: 95 },
  { productIndex: 4, sku: "HD-GY-L", name: "Gray Hoodie - Large", size: "L", price: 49.99, quantity: 110 },
  { productIndex: 4, sku: "HD-BK-M", name: "Black Hoodie - Medium", size: "M", price: 49.99, quantity: 85 },
  { productIndex: 4, sku: "HD-BK-L", name: "Black Hoodie - Large", size: "L", price: 49.99, quantity: 100 },
  
  // Chino Pants
  { productIndex: 5, sku: "CH-KH-32", name: "Khaki Chinos - 32", size: "32", price: 59.99, quantity: 70 },
  { productIndex: 5, sku: "CH-KH-34", name: "Khaki Chinos - 34", size: "34", price: 59.99, quantity: 65 },
  { productIndex: 5, sku: "CH-NV-32", name: "Navy Chinos - 32", size: "32", price: 59.99, quantity: 60 },
  { productIndex: 5, sku: "CH-NV-34", name: "Navy Chinos - 34", size: "34", price: 59.99, quantity: 55 },
  
  // Dress Shirt
  { productIndex: 6, sku: "DS-WH-15", name: "White Dress Shirt - 15", size: "15", price: 44.99, quantity: 50 },
  { productIndex: 6, sku: "DS-WH-16", name: "White Dress Shirt - 16", size: "16", price: 44.99, quantity: 55 },
  { productIndex: 6, sku: "DS-BL-15", name: "Blue Dress Shirt - 15", size: "15", price: 44.99, quantity: 45 },
  { productIndex: 6, sku: "DS-BL-16", name: "Blue Dress Shirt - 16", size: "16", price: 44.99, quantity: 50 },
  
  // Cargo Shorts
  { productIndex: 7, sku: "CS-KH-32", name: "Khaki Cargo - 32", size: "32", price: 34.99, quantity: 80 },
  { productIndex: 7, sku: "CS-KH-34", name: "Khaki Cargo - 34", size: "34", price: 34.99, quantity: 75 },
  { productIndex: 7, sku: "CS-BL-32", name: "Black Cargo - 32", size: "32", price: 34.99, quantity: 70 },
  { productIndex: 7, sku: "CS-BL-34", name: "Black Cargo - 34", size: "34", price: 34.99, quantity: 65 },
  
  // Winter Coat
  { productIndex: 8, sku: "WC-BK-M", name: "Black Winter Coat - Medium", size: "M", price: 149.99, quantity: 35 },
  { productIndex: 8, sku: "WC-BK-L", name: "Black Winter Coat - Large", size: "L", price: 149.99, quantity: 40 },
  { productIndex: 8, sku: "WC-NV-M", name: "Navy Winter Coat - Medium", size: "M", price: 149.99, quantity: 30 },
  { productIndex: 8, sku: "WC-NV-L", name: "Navy Winter Coat - Large", size: "L", price: 149.99, quantity: 35 },
  
  // Blazer
  { productIndex: 9, sku: "BZ-NV-40", name: "Navy Blazer - 40", size: "40", price: 129.99, quantity: 40 },
  { productIndex: 9, sku: "BZ-NV-42", name: "Navy Blazer - 42", size: "42", price: 129.99, quantity: 45 },
  { productIndex: 9, sku: "BZ-BK-40", name: "Black Blazer - 40", size: "40", price: 129.99, quantity: 35 },
  { productIndex: 9, sku: "BZ-BK-42", name: "Black Blazer - 42", size: "42", price: 129.99, quantity: 40 }
];

// Generate dates
const generateDateRange = (daysBack: number) => {
  const dates = [];
  for (let i = daysBack; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

// Mock Customers
const mockCustomers: CustomerEntity[] = [
  {
    customer_id: "cust_001",
    first_name: "Emma",
    last_name: "Johnson",
    email: "emma.johnson@email.com",
    phone: "+1234567890",
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    updated_at: new Date()
  },
  {
    customer_id: "cust_002",
    first_name: "Michael",
    last_name: "Chen",
    email: "michael.chen@email.com",
    phone: "+1234567891",
    created_at: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
    updated_at: new Date()
  },
  {
    customer_id: "cust_003",
    first_name: "Sarah",
    last_name: "Williams",
    email: "sarah.williams@email.com",
    phone: "+1234567892",
    created_at: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000),
    updated_at: new Date()
  },
  {
    customer_id: "cust_004",
    first_name: "David",
    last_name: "Brown",
    email: "david.brown@email.com",
    phone: "+1234567893",
    created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
    updated_at: new Date()
  },
  {
    customer_id: "cust_005",
    first_name: "Lisa",
    last_name: "Davis",
    email: "lisa.davis@email.com",
    phone: "+1234567894",
    created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
    updated_at: new Date()
  }
];

// Generate Mock Products with Variants
export const mockProducts: ProductEntity[] = clothingProducts.map((product, index) => {
  const productVariants = clothingVariants
    .filter(variant => variant.productIndex === index)
    .map((variant, variantIndex) => ({
      id: `var_${index}_${variantIndex}`,
      sku_name: variant.name,
      sku_no: variant.sku,
      product_id: `prod_${index + 1}`,
      quantity: variant.quantity,
      price: variant.price,
      currency: "USD",
      category: product.category,
      category_id: `cat_${Math.floor(index / 2) + 1}`,
      country_id: "US",
      is_active: true,
      created_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    } as VariantEntity));

  return {
    id: `prod_${index + 1}`,
    name: product.name,
    variants: productVariants,
    images: product.images,
    created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  };
});

// Mock Categories
export const mockCategories: Category[] = [
  {
    id: "cat_1",
    country_id: "US",
    name: "T-Shirts",
    description: "Premium t-shirts and casual tops",
    is_active: true,
    launch_date: "2024-01-01",
    end_date: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: new Date().toISOString(),
    users: [
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
      }
    ],
    variants: clothingVariants.filter(v => [0, 7].includes(v.productIndex)).map((variant, idx) => ({
      id: `var_cat1_${idx}`,
      sku_name: variant.name,
      price: variant.price,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: new Date().toISOString(),
      product: {
        id: `prod_${variant.productIndex + 1}`,
        name: clothingProducts[variant.productIndex].name,
        description: clothingProducts[variant.productIndex].description
      }
    }))
  },
  {
    id: "cat_2",
    country_id: "US",
    name: "Jeans",
    description: "Premium denim jeans and pants",
    is_active: true,
    launch_date: "2024-01-15",
    end_date: null,
    created_at: "2024-01-15T00:00:00Z",
    updated_at: new Date().toISOString(),
    users: [
      {
        id: "user_2",
        name: "Jane Doe",
        email: "jane.doe@company.com",
        role: "MANAGER",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: new Date().toISOString()
      }
    ],
    variants: clothingVariants.filter(v => [1, 2].includes(v.productIndex)).slice(0, 3).map((variant, idx) => ({
      id: `var_cat2_${idx}`,
      sku_name: variant.name,
      price: variant.price,
      created_at: "2024-01-15T00:00:00Z",
      updated_at: new Date().toISOString(),
      product: {
        id: `prod_${variant.productIndex + 1}`,
        name: clothingProducts[variant.productIndex].name,
        description: clothingProducts[variant.productIndex].description
      }
    }))
  },
  {
    id: "cat_3",
    country_id: "US",
    name: "Jackets & Outerwear",
    description: "Premium jackets and outerwear for all seasons",
    is_active: true,
    launch_date: "2024-02-01",
    end_date: null,
    created_at: "2024-02-01T00:00:00Z",
    updated_at: new Date().toISOString(),
    users: [
      {
        id: "user_1",
        name: "John Smith",
        email: "john.smith@company.com",
        role: "ADMIN",
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
      }
    ],
    variants: clothingVariants.filter(v => [6, 8, 9].includes(v.productIndex)).slice(0, 4).map((variant, idx) => ({
      id: `var_cat3_${idx}`,
      sku_name: variant.name,
      price: variant.price,
      created_at: "2024-02-01T00:00:00Z",
      updated_at: new Date().toISOString(),
      product: {
        id: `prod_${variant.productIndex + 1}`,
        name: clothingProducts[variant.productIndex].name,
        description: clothingProducts[variant.productIndex].description
      }
    }))
  },
  {
    id: "cat_4",
    country_id: "US",
    name: "Hoodies & Sweaters",
    description: "Comfortable hoodies and warm sweaters for all seasons",
    is_active: true,
    launch_date: "2024-02-15",
    end_date: null,
    created_at: "2024-02-15T00:00:00Z",
    updated_at: new Date().toISOString(),
    users: [],
    variants: clothingVariants.filter(v => [3, 4].includes(v.productIndex)).map((variant, idx) => ({
      id: `var_cat4_${idx}`,
      sku_name: variant.name,
      price: variant.price,
      created_at: "2024-02-15T00:00:00Z",
      updated_at: new Date().toISOString(),
      product: {
        id: `prod_${variant.productIndex + 1}`,
        name: clothingProducts[variant.productIndex].name,
        description: clothingProducts[variant.productIndex].description
      }
    }))
  },
  {
    id: "cat_5",
    country_id: "US",
    name: "Accessories",
    description: "Fashion accessories and complementary clothing items",
    is_active: false,
    launch_date: "2024-03-01",
    end_date: "2024-12-31",
    created_at: "2024-03-01T00:00:00Z",
    updated_at: new Date().toISOString(),
    users: [
      {
        id: "user_3",
        name: "Mike Wilson",
        email: "mike.wilson@company.com",
        role: "STAFF",
        created_at: "2024-02-01T00:00:00Z",
        updated_at: new Date().toISOString()
      }
    ],
    variants: clothingVariants.filter(v => [5].includes(v.productIndex)).map((variant, idx) => ({
      id: `var_cat5_${idx}`,
      sku_name: variant.name,
      price: variant.price,
      created_at: "2024-03-01T00:00:00Z",
      updated_at: new Date().toISOString(),
      product: {
        id: `prod_${variant.productIndex + 1}`,
        name: clothingProducts[variant.productIndex].name,
        description: clothingProducts[variant.productIndex].description
      }
    }))
  }
];

// Mock Collections
export const mockCollections: CollectionEntity[] = [
  {
    id: "col_1",
    name: "Premium T-Shirt Collection",
    description: "Our finest t-shirt selections for everyday comfort",
    is_active: true,
    handle: "premium-tshirt-collection",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: new Date().toISOString()
  },
  {
    id: "col_2",
    name: "Denim Collection",
    description: "Best-selling jeans and denim products loved by everyone",
    is_active: true,
    handle: "denim-collection",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: new Date().toISOString()
  },
  {
    id: "col_3",
    name: "Formal Wear Collection",
    description: "Professional and formal clothing perfect for special occasions",
    is_active: true,
    handle: "formal-wear-collection",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: new Date().toISOString()
  },
  {
    id: "col_4",
    name: "Casual Wear",
    description: "Comfortable and stylish casual clothing for everyday wear",
    is_active: true,
    handle: "casual-wear",
    created_at: "2024-02-15T00:00:00Z",
    updated_at: new Date().toISOString()
  },
  {
    id: "col_5",
    name: "Seasonal Specials",
    description: "Limited time seasonal clothing offerings",
    is_active: false,
    handle: "seasonal-specials",
    created_at: "2024-03-01T00:00:00Z",
    updated_at: new Date().toISOString()
  },
  {
    id: "col_6",
    name: "Premium Jackets",
    description: "Exclusive premium jacket collection",
    is_active: true,
    handle: "premium-jackets",
    created_at: "2024-03-15T00:00:00Z",
    updated_at: new Date().toISOString()
  }
];

// Mock Discounts
export const mockDiscounts: DiscountEntity[] = [
  {
    id: "disc_1",
    title: "New Customer Welcome",
    code: "WELCOME15",
    discount_type: "PERCENTAGE",
    discount_value: 15,
    starts_at: "2024-01-01T00:00:00Z",
    ends_at: "2024-12-31T23:59:59Z",
    is_active: true,
    miniumum_purchase_amount: 25.00,
    mininum_quantity: null,
    is_exclusive: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: new Date().toISOString(),
    collection_discounts: [
      { collection: { id: "col_1", name: "Premium T-Shirt Collection" } },
      { collection: { id: "col_2", name: "Denim Collection" } }
    ],
    customer_medusa_discounts: [
      {
        customer: {
          customer_id: "cust_001",
          first_name: "Emma",
          last_name: "Johnson",
          phone: "+1234567890",
          email: "emma.johnson@email.com"
        }
      }
    ]
  },
  {
    id: "disc_2",
    title: "Valentine's Day Special",
    code: "VALENTINE25",
    discount_type: "PERCENTAGE",
    discount_value: 25,
    starts_at: "2024-02-01T00:00:00Z",
    ends_at: "2024-02-14T23:59:59Z",
    is_active: false,
    miniumum_purchase_amount: 50.00,
    mininum_quantity: 2,
    is_exclusive: true,
    created_at: "2024-01-15T00:00:00Z",
    updated_at: new Date().toISOString(),
    collection_discounts: [
      { collection: { id: "col_3", name: "Formal Wear Collection" } }
    ],
    customer_medusa_discounts: []
  },
  {
    id: "disc_3",
    title: "Free Shipping",
    code: "FREESHIP",
    discount_type: "FIXED",
    discount_value: 9.99,
    starts_at: "2024-01-01T00:00:00Z",
    ends_at: "2024-06-30T23:59:59Z",
    is_active: true,
    miniumum_purchase_amount: 75.00,
    mininum_quantity: null,
    is_exclusive: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: new Date().toISOString(),
    collection_discounts: [],
    customer_medusa_discounts: []
  },
  {
    id: "disc_4",
    title: "Summer Sale",
    code: "SUMMER20",
    discount_type: "PERCENTAGE",
    discount_value: 20,
    starts_at: "2024-06-01T00:00:00Z",
    ends_at: "2024-08-31T23:59:59Z",
    is_active: true,
    miniumum_purchase_amount: 40.00,
    mininum_quantity: null,
    is_exclusive: false,
    created_at: "2024-05-15T00:00:00Z",
    updated_at: new Date().toISOString(),
    collection_discounts: [
      { collection: { id: "col_4", name: "Casual Wear" } },
      { collection: { id: "col_6", name: "Premium Jackets" } }
    ],
    customer_medusa_discounts: [
      {
        customer: {
          customer_id: "cust_002",
          first_name: "Michael",
          last_name: "Chen",
          phone: "+1234567891",
          email: "michael.chen@email.com"
        }
      },
      {
        customer: {
          customer_id: "cust_003",
          first_name: "Sarah",
          last_name: "Williams",
          phone: "+1234567892",
          email: "sarah.williams@email.com"
        }
      }
    ]
  }
];

// Generate Mock Orders
export const mockOrders: OrderEntity[] = Array.from({ length: 50 }, (_, index) => {
  const customer = mockCustomers[index % mockCustomers.length];
  const orderDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
  const orderItems: OrderItemEntity[] = [];
  const itemCount = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
  let totalAmount = 0;

  for (let i = 0; i < itemCount; i++) {
    const variant = clothingVariants[Math.floor(Math.random() * clothingVariants.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const unitPrice = variant.price;
    const totalPrice = unitPrice * quantity;
    totalAmount += totalPrice;

    orderItems.push({
      id: `item_${index}_${i}`,
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      order_id: `order_${index + 1}`,
      product_id: `prod_${variant.productIndex + 1}`,
      variant_id: `var_${variant.productIndex}_${clothingVariants.filter(v => v.productIndex === variant.productIndex).findIndex(v => v.sku === variant.sku)}`,
      created_at: orderDate.toISOString(),
      updated_at: orderDate.toISOString(),
      product: mockProducts[variant.productIndex],
      variant: mockProducts[variant.productIndex].variants?.find(v => v.sku_no === variant.sku)
    });
  }

  return {
    id: `order_${index + 1}`,
    order_number: `SHI-${(1000 + index).toString()}`,
    total_amount: Math.round(totalAmount * 100) / 100,
    user_id: null,
    customer_medusa_id: customer.customer_id,
    discount_id: Math.random() > 0.7 ? mockDiscounts[Math.floor(Math.random() * mockDiscounts.length)].id : null,
    country_code: "US",
    shipping_country: "US",
    currency: "USD",
    created_at: orderDate.toISOString(),
    updated_at: orderDate.toISOString(),
    customer_medusa: customer,
    order_items: orderItems
  };
});

// Mock Physical Overview Data
export const mockPhysicalOverview: PhysicalOverviewEntity = {
  total_products: mockProducts.length,
  top_selling_products: "Classic White T-Shirt",
  recent_products: mockProducts.slice(0, 5),
  total_orders: mockOrders.length,
  total_sales: mockOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
};

// Mock Physical Conversion Data
export const mockPhysicalConversions: PhysicalConversionEntity[] = generateDateRange(30).map(date => ({
  date,
  total_conversions: Math.floor(Math.random() * 50) + 10,
  total_orders: Math.floor(Math.random() * 40) + 5,
  total_visitors: Math.floor(Math.random() * 200) + 50,
  total_revenues: Math.round((Math.random() * 2000 + 500) * 100) / 100,
  type: AnalyticsType.PHYSICAL
}));

// Mock SKU Analytics Data
export const mockSKUAnalytics: AnalysisSKUEntity[] = clothingVariants.map((variant, index) => {
  const revenue = Math.round((Math.random() * 5000 + 1000) * 100) / 100;
  const quantity = Math.floor(Math.random() * 100) + 20;
  
  return {
    sku: variant.sku,
    name: variant.name,
    quantity,
    revenue,
    product_id: variant.productIndex + 1,
    variant_id: index + 1,
    quantity_percentage: ((quantity / clothingVariants.reduce((sum, v) => sum + (Math.floor(Math.random() * 100) + 20), 0)) * 100).toFixed(2),
    revenue_percentage: ((revenue / clothingVariants.reduce((sum, v) => sum + (Math.random() * 5000 + 1000), 0)) * 100).toFixed(2),
    image: clothingProducts[variant.productIndex].images[0],
    variant_title: variant.name,
    type: AnalyticsType.PHYSICAL,
    created_at: new Date().toISOString()
  };
});

// Mock SKU Performance Historical Data
export const mockSKUPerformanceHistorical: SkuPerformanceHistoricalDataEntity[] = generateDateRange(30).map(date => ({
  date,
  data: mockSKUAnalytics.slice(0, 5).map(sku => ({
    ...sku,
    quantity: Math.floor(Math.random() * 50) + 10,
    revenue: Math.round((Math.random() * 2000 + 500) * 100) / 100
  }))
}));

// Mock Sales Analytics Data
export const mockSalesAnalytics: AnalyticsSalesEntity[] = generateDateRange(30).map(date => ({
  date,
  total_conversions: Math.floor(Math.random() * 30) + 5,
  total_orders: Math.floor(Math.random() * 25) + 3,
  total_visitors: Math.floor(Math.random() * 150) + 30,
  total_revenues: Math.round((Math.random() * 1500 + 300) * 100) / 100,
  total_gross_revenues: Math.round((Math.random() * 1800 + 400) * 100) / 100,
  type: AnalyticsType.PHYSICAL
}));

// Mock Analytics Metadata
export const mockAnalyticsMetadata: AnalyticsMetadataEntity[] = generateDateRange(30).map(date => ({
  date,
  total_sales: Math.round((Math.random() * 2000 + 500) * 100) / 100,
  total_orders: Math.floor(Math.random() * 30) + 5,
  total_items: Math.floor(Math.random() * 60) + 10,
  average_order_value: Math.round((Math.random() * 80 + 40) * 100) / 100,
  total_gross_revenue: Math.round((Math.random() * 2200 + 600) * 100) / 100,
  conversion_rate: Math.round((Math.random() * 5 + 2) * 100) / 100,
  visitors: Math.floor(Math.random() * 200) + 50,
  total_average_order_value: Math.round((Math.random() * 85 + 45) * 100) / 100,
  type: AnalyticsType.PHYSICAL
}));

// Export all mock data
export const mockPhysicalSalesData = {
  products: mockProducts,
  categories: mockCategories,
  collections: mockCollections,
  discounts: mockDiscounts,
  orders: mockOrders,
  customers: mockCustomers,
  physicalOverview: mockPhysicalOverview,
  physicalConversions: mockPhysicalConversions,
  skuAnalytics: mockSKUAnalytics,
  skuPerformanceHistorical: mockSKUPerformanceHistorical,
  salesAnalytics: mockSalesAnalytics,
  analyticsMetadata: mockAnalyticsMetadata
};
