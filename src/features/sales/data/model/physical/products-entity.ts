import { OrderEntity } from "./orders-entity";
import { VariantEntity } from "./variants-entity";

export interface ProductEntity {
    id?: string | null;
    name?: string | null;
    variants?: VariantEntity[] | null;
    orders?: OrderEntity[] | null;
    images?: string[] | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface PhysicalStockEntity {
    id: number;
    sku: string;
    inventory_quantity: number;
}