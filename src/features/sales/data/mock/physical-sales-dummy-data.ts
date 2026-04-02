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

// Beauty Skincare ShopIntel — physical catalog (mock)
const beautyProducts = [
  {
    name: "Beauty Skincare ShopIntel — Hydrating Cloud Cleanser",
    description: "Low-pH gel cleanser with ceramides for daily double cleansing",
    category: "Cleansers",
    basePrice: 22.99,
    images: ["https://picsum.photos/400/400?random=1"]
  },
  {
    name: "Beauty Skincare ShopIntel — Niacinamide 10% Serum",
    description: "Oil-control serum to refine pores and even tone",
    category: "Serums",
    basePrice: 34.99,
    images: ["https://picsum.photos/400/400?random=2"]
  },
  {
    name: "Beauty Skincare ShopIntel — Daily UV Defense SPF 50",
    description: "Invisible fluid sunscreen, PA++++, no white cast",
    category: "Sun Care",
    basePrice: 29.99,
    images: ["https://picsum.photos/400/400?random=3"]
  },
  {
    name: "Beauty Skincare ShopIntel — Retinol Night Renewal Cream",
    description: "Encapsulated retinol with squalane for overnight renewal",
    category: "Treatments",
    basePrice: 48.99,
    images: ["https://picsum.photos/400/400?random=4"]
  },
  {
    name: "Beauty Skincare ShopIntel — Ceramide Barrier Cream",
    description: "Rich moisturizer to repair dry, sensitized skin",
    category: "Moisturizers",
    basePrice: 39.99,
    images: ["https://picsum.photos/400/400?random=5"]
  },
  {
    name: "Beauty Skincare ShopIntel — HA Rose Toner",
    description: "Hydrating essence-toner with hyaluronic acid",
    category: "Toners",
    basePrice: 24.99,
    images: ["https://picsum.photos/400/400?random=6"]
  },
  {
    name: "Beauty Skincare ShopIntel — Vitamin C Glow Essence",
    description: "15% ethyl ascorbic acid for bright, glass skin",
    category: "Essences",
    basePrice: 42.99,
    images: ["https://picsum.photos/400/400?random=7"]
  },
  {
    name: "Beauty Skincare ShopIntel — Overnight Lip Recovery Balm",
    description: "Peptide and shea overnight lip mask",
    category: "Lip Care",
    basePrice: 16.99,
    images: ["https://picsum.photos/400/400?random=8"]
  },
  {
    name: "Beauty Skincare ShopIntel — Rice Milk Body Lotion",
    description: "Lightweight body lotion with rice ferment",
    category: "Body Care",
    basePrice: 27.99,
    images: ["https://picsum.photos/400/400?random=9"]
  },
  {
    name: "Beauty Skincare ShopIntel — Peptide Eye Revive Cream",
    description: "Caffeine and peptides for puffiness and fine lines",
    category: "Eye Care",
    basePrice: 36.99,
    images: ["https://picsum.photos/400/400?random=10"]
  }
];

const beautyVariants = [
  { productIndex: 0, sku: "BSI-CLN-150ML", name: "Cloud Cleanser — 150ml", size: "150ml", price: 22.99, quantity: 220 },
  { productIndex: 0, sku: "BSI-CLN-400ML", name: "Cloud Cleanser — 400ml", size: "400ml", price: 44.99, quantity: 140 },
  { productIndex: 0, sku: "BSI-CLN-TRVL", name: "Cloud Cleanser — Travel 30ml", size: "30ml", price: 9.99, quantity: 310 },
  { productIndex: 0, sku: "BSI-CLN-DUO", name: "Cloud Cleanser — Duo refill", size: "2×150ml", price: 39.99, quantity: 95 },

  { productIndex: 1, sku: "BSI-NIA-30ML", name: "Niacinamide Serum — 30ml", size: "30ml", price: 34.99, quantity: 180 },
  { productIndex: 1, sku: "BSI-NIA-50ML", name: "Niacinamide Serum — 50ml", size: "50ml", price: 48.99, quantity: 120 },
  { productIndex: 1, sku: "BSI-NIA-15ML", name: "Niacinamide Serum — Mini 15ml", size: "15ml", price: 18.99, quantity: 200 },
  { productIndex: 1, sku: "BSI-NIA-DUO", name: "Niacinamide Serum — Twin pack", size: "2×30ml", price: 62.99, quantity: 75 },

  { productIndex: 2, sku: "BSI-SPF-30ML", name: "UV Defense SPF 50 — 30ml", size: "30ml", price: 29.99, quantity: 260 },
  { productIndex: 2, sku: "BSI-SPF-50ML", name: "UV Defense SPF 50 — 50ml", size: "50ml", price: 39.99, quantity: 190 },
  { productIndex: 2, sku: "BSI-SPF-STK", name: "UV Defense — Stick SPF 50", size: "15g", price: 22.99, quantity: 150 },
  { productIndex: 2, sku: "BSI-SPF-KIDS", name: "UV Defense — Mineral family 100ml", size: "100ml", price: 34.99, quantity: 88 },

  { productIndex: 3, sku: "BSI-RTN-30ML", name: "Retinol Night Cream — 30ml", size: "30ml", price: 48.99, quantity: 110 },
  { productIndex: 3, sku: "BSI-RTN-50ML", name: "Retinol Night Cream — 50ml", size: "50ml", price: 64.99, quantity: 72 },
  { productIndex: 3, sku: "BSI-RTN-15ML", name: "Retinol Night Cream — Starter 15ml", size: "15ml", price: 26.99, quantity: 95 },

  { productIndex: 4, sku: "BSI-CER-50ML", name: "Ceramide Barrier Cream — 50ml", size: "50ml", price: 39.99, quantity: 165 },
  { productIndex: 4, sku: "BSI-CER-100ML", name: "Ceramide Barrier Cream — 100ml", size: "100ml", price: 58.99, quantity: 98 },
  { productIndex: 4, sku: "BSI-CER-RICH", name: "Ceramide Barrier — Rich 50ml", size: "50ml", price: 44.99, quantity: 82 },
  { productIndex: 4, sku: "BSI-CER-LITE", name: "Ceramide Barrier — Gel-Cream 50ml", size: "50ml", price: 39.99, quantity: 104 },

  { productIndex: 5, sku: "BSI-TON-200ML", name: "HA Rose Toner — 200ml", size: "200ml", price: 24.99, quantity: 175 },
  { productIndex: 5, sku: "BSI-TON-400ML", name: "HA Rose Toner — Jumbo 400ml", size: "400ml", price: 36.99, quantity: 92 },
  { productIndex: 5, sku: "BSI-TON-MST", name: "HA Rose — Fine mist 120ml", size: "120ml", price: 19.99, quantity: 130 },
  { productIndex: 5, sku: "BSI-TON-PAD", name: "HA Rose — Toner pads 60ct", size: "60 pads", price: 21.99, quantity: 118 },

  { productIndex: 6, sku: "BSI-VCE-30ML", name: "Vitamin C Essence — 30ml", size: "30ml", price: 42.99, quantity: 142 },
  { productIndex: 6, sku: "BSI-VCE-50ML", name: "Vitamin C Essence — 50ml", size: "50ml", price: 58.99, quantity: 86 },
  { productIndex: 6, sku: "BSI-VCE-15ML", name: "Vitamin C Essence — Mini 15ml", size: "15ml", price: 22.99, quantity: 155 },
  { productIndex: 6, sku: "BSI-VCE-REF", name: "Vitamin C Essence — Refill 30ml", size: "30ml", price: 36.99, quantity: 64 },

  { productIndex: 7, sku: "BSI-LIP-10G", name: "Lip Recovery Balm — 10g", size: "10g", price: 16.99, quantity: 240 },
  { productIndex: 7, sku: "BSI-LIP-20G", name: "Lip Recovery Balm — Jumbo 20g", size: "20g", price: 24.99, quantity: 140 },
  { productIndex: 7, sku: "BSI-LIP-TINT", name: "Lip Balm — Sheer rose tint", size: "10g", price: 17.99, quantity: 190 },
  { productIndex: 7, sku: "BSI-LIP-TRIO", name: "Lip Balm — Trio gift set", size: "3×10g", price: 42.99, quantity: 55 },

  { productIndex: 8, sku: "BSI-BDY-250ML", name: "Rice Milk Body Lotion — 250ml", size: "250ml", price: 27.99, quantity: 128 },
  { productIndex: 8, sku: "BSI-BDY-500ML", name: "Rice Milk Body Lotion — 500ml", size: "500ml", price: 42.99, quantity: 76 },
  { productIndex: 8, sku: "BSI-BDY-OIL", name: "Rice Milk — Dry body oil 100ml", size: "100ml", price: 31.99, quantity: 62 },
  { productIndex: 8, sku: "BSI-BDY-WASH", name: "Rice Milk — Cream wash 400ml", size: "400ml", price: 26.99, quantity: 94 },

  { productIndex: 9, sku: "BSI-EYE-15ML", name: "Peptide Eye Cream — 15ml", size: "15ml", price: 36.99, quantity: 118 },
  { productIndex: 9, sku: "BSI-EYE-30ML", name: "Peptide Eye Cream — 30ml", size: "30ml", price: 54.99, quantity: 68 },
  { productIndex: 9, sku: "BSI-EYE-ROLL", name: "Peptide Eye — Cooling roller 12ml", size: "12ml", price: 32.99, quantity: 102 },
  { productIndex: 9, sku: "BSI-EYE-DUO", name: "Peptide Eye — Day & night duo", size: "2×12ml", price: 58.99, quantity: 44 }
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
export const mockProducts: ProductEntity[] = beautyProducts.map((product, index) => {
  const productVariants = beautyVariants
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
    name: "Cleansers & Lip Care",
    description: "Daily cleansing and targeted lip repair",
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
    variants: beautyVariants.filter(v => [0, 7].includes(v.productIndex)).map((variant, idx) => ({
      id: `var_cat1_${idx}`,
      sku_name: variant.name,
      price: variant.price,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: new Date().toISOString(),
      product: {
        id: `prod_${variant.productIndex + 1}`,
        name: beautyProducts[variant.productIndex].name,
        description: beautyProducts[variant.productIndex].description
      }
    }))
  },
  {
    id: "cat_2",
    country_id: "US",
    name: "Serums & Sun Care",
    description: "Actives and photoprotection for every skin type",
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
    variants: beautyVariants.filter(v => [1, 2].includes(v.productIndex)).slice(0, 3).map((variant, idx) => ({
      id: `var_cat2_${idx}`,
      sku_name: variant.name,
      price: variant.price,
      created_at: "2024-01-15T00:00:00Z",
      updated_at: new Date().toISOString(),
      product: {
        id: `prod_${variant.productIndex + 1}`,
        name: beautyProducts[variant.productIndex].name,
        description: beautyProducts[variant.productIndex].description
      }
    }))
  },
  {
    id: "cat_3",
    country_id: "US",
    name: "Essences, Body & Eye",
    description: "Brightening essences plus body and eye treatments",
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
    variants: beautyVariants.filter(v => [6, 8, 9].includes(v.productIndex)).slice(0, 4).map((variant, idx) => ({
      id: `var_cat3_${idx}`,
      sku_name: variant.name,
      price: variant.price,
      created_at: "2024-02-01T00:00:00Z",
      updated_at: new Date().toISOString(),
      product: {
        id: `prod_${variant.productIndex + 1}`,
        name: beautyProducts[variant.productIndex].name,
        description: beautyProducts[variant.productIndex].description
      }
    }))
  },
  {
    id: "cat_4",
    country_id: "US",
    name: "Treatments & Moisturizers",
    description: "Retinoids, barrier creams, and overnight repair",
    is_active: true,
    launch_date: "2024-02-15",
    end_date: null,
    created_at: "2024-02-15T00:00:00Z",
    updated_at: new Date().toISOString(),
    users: [],
    variants: beautyVariants.filter(v => [3, 4].includes(v.productIndex)).map((variant, idx) => ({
      id: `var_cat4_${idx}`,
      sku_name: variant.name,
      price: variant.price,
      created_at: "2024-02-15T00:00:00Z",
      updated_at: new Date().toISOString(),
      product: {
        id: `prod_${variant.productIndex + 1}`,
        name: beautyProducts[variant.productIndex].name,
        description: beautyProducts[variant.productIndex].description
      }
    }))
  },
  {
    id: "cat_5",
    country_id: "US",
    name: "Toners & Prep",
    description: "Hydrating toners, mists, and first-step prep",
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
    variants: beautyVariants.filter(v => [5].includes(v.productIndex)).map((variant, idx) => ({
      id: `var_cat5_${idx}`,
      sku_name: variant.name,
      price: variant.price,
      created_at: "2024-03-01T00:00:00Z",
      updated_at: new Date().toISOString(),
      product: {
        id: `prod_${variant.productIndex + 1}`,
        name: beautyProducts[variant.productIndex].name,
        description: beautyProducts[variant.productIndex].description
      }
    }))
  }
];

// Mock Collections
export const mockCollections: CollectionEntity[] = [
  {
    id: "col_1",
    name: "Glow Essentials",
    description: "Cleanser-led routines for glass-skin mornings",
    is_active: true,
    handle: "glow-essentials",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: new Date().toISOString()
  },
  {
    id: "col_2",
    name: "Barrier Repair Heroes",
    description: "Ceramides, niacinamide, and SPF staples",
    is_active: true,
    handle: "barrier-repair-heroes",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: new Date().toISOString()
  },
  {
    id: "col_3",
    name: "Clinical Actives",
    description: "Retinol, vitamin C, and peptide-powered treatments",
    is_active: true,
    handle: "clinical-actives",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: new Date().toISOString()
  },
  {
    id: "col_4",
    name: "Everyday Ritual",
    description: "Simple AM/PM steps for consistent results",
    is_active: true,
    handle: "everyday-ritual",
    created_at: "2024-02-15T00:00:00Z",
    updated_at: new Date().toISOString()
  },
  {
    id: "col_5",
    name: "Seasonal Glow",
    description: "Limited drops for humid season and travel",
    is_active: false,
    handle: "seasonal-glow",
    created_at: "2024-03-01T00:00:00Z",
    updated_at: new Date().toISOString()
  },
  {
    id: "col_6",
    name: "Body & Eye Studio",
    description: "Body lotions and peptide eye care",
    is_active: true,
    handle: "body-eye-studio",
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
      { collection: { id: "col_1", name: "Glow Essentials" } },
      { collection: { id: "col_2", name: "Barrier Repair Heroes" } }
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
      { collection: { id: "col_3", name: "Clinical Actives" } }
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
      { collection: { id: "col_4", name: "Everyday Ritual" } },
      { collection: { id: "col_6", name: "Body & Eye Studio" } }
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
    const variant = beautyVariants[Math.floor(Math.random() * beautyVariants.length)];
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
      variant_id: `var_${variant.productIndex}_${beautyVariants.filter(v => v.productIndex === variant.productIndex).findIndex(v => v.sku === variant.sku)}`,
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
  top_selling_products: "Beauty Skincare ShopIntel — Hydrating Cloud Cleanser",
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
export const mockSKUAnalytics: AnalysisSKUEntity[] = beautyVariants.map((variant, index) => {
  const revenue = Math.round((Math.random() * 5000 + 1000) * 100) / 100;
  const quantity = Math.floor(Math.random() * 100) + 20;
  
  return {
    sku: variant.sku,
    name: variant.name,
    quantity,
    revenue,
    product_id: variant.productIndex + 1,
    variant_id: index + 1,
    quantity_percentage: ((quantity / beautyVariants.reduce((sum, v) => sum + (Math.floor(Math.random() * 100) + 20), 0)) * 100).toFixed(2),
    revenue_percentage: ((revenue / beautyVariants.reduce((sum, v) => sum + (Math.random() * 5000 + 1000), 0)) * 100).toFixed(2),
    image: beautyProducts[variant.productIndex].images[0],
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
