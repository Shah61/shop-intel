export interface CollectionDiscount {
    collection: {
        id: string;
        name: string;
    };
}

export interface CustomerMedusaDiscount {
    customer: {
        customer_id: string;
        first_name: string;
        last_name: string;
        phone: string;
        email: string;
    };
}

export interface DiscountEntity {
    id: string;
    title: string;
    code: string;
    discount_type: "PERCENTAGE" | "FIXED";
    discount_value: number;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
    miniumum_purchase_amount: number | null;
    mininum_quantity: number | null;
    is_exclusive: boolean;
    created_at: string;
    updated_at: string;
    collection_discounts: CollectionDiscount[];
    customer_medusa_discounts: CustomerMedusaDiscount[];
}

export interface DiscountCreateParams {
    title: string;
    code: string;
    discount_type: "PERCENTAGE" | "FIXED";
    discount_value: number;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
    mininum_quantity?: number;
    miniumum_purchase_amount?: number;
    customer_ids?: string[];
}

export interface DiscountUpdateParams {
    title?: string;
    code?: string;
    discount_type?: "PERCENTAGE" | "FIXED";
    discount_value?: number;
    starts_at?: string;
    ends_at?: string;
    is_active?: boolean;
    mininum_quantity?: number;
    miniumum_purchase_amount?: number;
    customer_ids?: string[];
    collection_ids?: string[];
}

export interface DiscountFilterParams {
    code?: string;
    discount_type?: "PERCENTAGE" | "FIXED";
    title?: string;
    starts_at?: string;
    ends_at?: string;
    is_active?: boolean;
    page?: number;
    limit?: number;
}

export interface DiscountResponse {
    message: string;
    data: {
        discounts: DiscountEntity[];
        metadata: {
            total: number;
            page: number;
            limit: number;
            total_pages: number | null;
            has_next: boolean;
            has_previous: boolean;
        };
    };
}

export interface SingleDiscountResponse {
    message: string;
    data: {
        discount: DiscountEntity;
    };
} 