export interface CustomerAddress {
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    customer_id?: string;
}

export interface CustomerEntity {
    customer_id?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    total_points?: number;
    phone?: string;
    customer_address?: CustomerAddress;
    created_at?: Date;
    updated_at?: Date;
}