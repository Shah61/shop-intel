export interface RevenueEntity {
    id: string;
    orderId: string;
    date: string;
    time: string;
    sku: string;
    quantity: number;
    subtotal: number;
    platform: string;
    type: string;
    quarter: string;
}