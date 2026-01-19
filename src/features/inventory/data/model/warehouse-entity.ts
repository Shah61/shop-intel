export interface Warehouse {
    id: string;
    name: string;
    location: string;
    created_at: string;
    updated_at: string;
}

export interface WarehouseResponse {  
    message: string;
    data: {
        warehouses: Warehouse[];
        metadata: {
            total: number;
        };
    };
}