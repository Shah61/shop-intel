export enum INVENTORY_LOG_TYPES {
    CREATED = 'CREATED',
    UPDATED = 'UPDATED',
    DELETED = 'DELETED',
    RESTOCKED = 'RESTOCKED',
    SOLD = 'SOLD',
    RETURNED = 'RETURNED',
    DAMAGED = 'DAMAGED',
    LOST = 'LOST',
    ADDED = 'ADDED',
    REMOVED = 'REMOVED'
}

export interface InventoryLogMetadata {
    title?: string;
    quantity?: number;
    description?: string;
    quantity_change?: number;
    threshold_quantity?: number;
    source?: string;
    ip_address?: number | string;
    [key: string]: any;
}

export interface User {
    email: string;
}

export interface Warehouse {
    name: string;
}

export interface SKU {
    sku_no: string;
}

export interface Inventory {
    quantity: number;
    threshold_quantity: number;
    warehouse: Warehouse;
    sku: SKU;
}

export interface InventoryLog {
    id: string;
    user_id: string;
    inventory_id: string;
    notes?: string;
    quantity_before: number;
    quantity_after: number;
    quantity_change: number;
    log_type: INVENTORY_LOG_TYPES;
    metadata?: InventoryLogMetadata;
    created_at: string;
    updated_at: string;
    user?: User;
    inventory?: Inventory;
}

export interface PaginationMetadata {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

export interface InventoryLogsResponse {
    message: string;
    data: {
        inventory_logs: InventoryLog[];
        metadata: PaginationMetadata;
    };
}

export interface InventoryLogsParams {
    log_type?: INVENTORY_LOG_TYPES;
    order_by?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
