import { ProductEntity } from "./products-entity";
import { VariantEntity } from "./variants-entity";
import { UsersEntity } from "../../../../auth/data/model/users-entity";
import { CustomerEntity } from "./customer-entity";

export interface OrderItemEntity {
    id?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    order_id?: string;
    product_id: string;
    variant_id: string;
    created_at?: string;
    updated_at?: string;
    
    // Related entities (populated from joins)
    product?: ProductEntity;
    variant?: VariantEntity;
}

export interface OrderPaginationMetadata {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export interface OrderFilterParams {
    is_desc?: boolean;
    date?: string; // YYYY-MM-DD format
    customer_email?: string;
    staff_email?: string;
    country_code?: string;
    product_name?: string;
    variant_sku_number?: string;
    order_number?: string;
    page?: number;
    limit?: number;
}

export interface OrderListResponse {
    orders: OrderEntity[];
    metadata: OrderPaginationMetadata;
}

export interface OrderEntity {
    id?: string | null;
    order_number?: string | null;
    total_amount?: number | null;
    user_id?: string | null;
    customer_medusa_id?: string | null;
    discount_id?: string | null;
    country_code?: string | null;
    shipping_country?: string | null;
    currency?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    
    // Related entities
    user?: UsersEntity | null;
    users?: UsersEntity | null;
    customer_medusa?: CustomerEntity | null;
    order_items?: OrderItemEntity[];

    // Legacy fields for backward compatibility
    products_id?: string | null;
    products?: ProductEntity | null;
    variants_id?: string | null;
    variants?: VariantEntity | null;
    quantity_orders?: number | null;
    email?: string | null;
    users_id?: string | null;
    order_discounts_id?: string | null; // Keep for backward compatibility
}