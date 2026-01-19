import { OrderEntity } from "./orders-entity";
import { ProductEntity } from "./products-entity";
import { Category } from "./categories-entity";

export interface VariantEntity {
    id?: string | null;
    sku_name?: string | null;
    sku_no?: string | null;

    product_id?: string | null;
    product?: ProductEntity | null;

    quantity?: number | null;
    price?: number | null;
    currency?: string | null;
    category?: string | null;
    category_id?: string | null;
    category_ids?: string[] | null; // Add support for multiple category IDs
    country_id?: string | null;
    country?: Country | null;
    is_active?: boolean | null;

    orders?: OrderEntity[] | null;
    categories?: Category[] | null;

    created_at?: string | null;
    updated_at?: string | null;
}

export interface CountryEntity {
    countries: Country[];
}

export interface Country {
    id?: string | null;
    name?: string | null;
    currency?: string | null;
    code?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}