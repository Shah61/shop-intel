import { ProductEntity } from "./products-entity";

export interface PhysicalOverviewEntity {
    total_products: number;
    top_selling_products: string;
    recent_products: ProductEntity[];
    total_sales: number;
    total_orders: number;
}