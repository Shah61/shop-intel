import { AnalyticsType } from "../analytics-entity";

export interface PhysicalConversionEntity {
    date?: string | null;
    total_conversions: number;
    total_orders: number;
    total_visitors: number;
    total_revenues: number;
}




export interface PhysicalSKUEntity {
    sku?: string | null;
    name?: string | null;
    quantity?: number | null;
    revenue?: number | null;
    product_id?: number | null;
    variant_id?: number | null;
    quantity_percentage?: string | null;
    revenue_percentage?: string | null;
    image?: string | null;
    variant_title?: string | null;
    type?: AnalyticsType | null;

}