import { useQuery } from "@tanstack/react-query";
import { InventoryLogsParams, InventoryLogsResponse, InventoryLog, INVENTORY_LOG_TYPES } from "../../data/model/record-entity";

// Use mock data only (frontend-only project)
const USE_MOCK_DATA = true;

// Simulate API delay
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock inventory logs data with beauty SKUs
const generateMockInventoryLogs = (): InventoryLog[] => {
    const beautySKUs = [
        { sku_no: "BSI-CLN-150ML", name: "Cloud Cleanser — 150ml" },
        { sku_no: "BSI-NIA-30ML", name: "Niacinamide Serum — 30ml" },
        { sku_no: "BSI-SPF-50ML", name: "UV Defense SPF 50 — 50ml" },
        { sku_no: "BSI-CER-50ML", name: "Ceramide Barrier Cream — 50ml" },
        { sku_no: "BSI-VCE-30ML", name: "Vitamin C Glow Essence — 30ml" },
        { sku_no: "BSI-TON-200ML", name: "HA Rose Toner — 200ml" },
        { sku_no: "BSI-RTN-30ML", name: "Retinol Night Cream — 30ml" },
        { sku_no: "BSI-LIP-10G", name: "Lip Recovery Balm — 10g" },
        { sku_no: "BSI-EYE-15ML", name: "Peptide Eye Cream — 15ml" },
        { sku_no: "BSI-BDY-250ML", name: "Rice Milk Body Lotion — 250ml" }
    ];

    const warehouses = [
        { name: "Sepang Warehouse" },
        { name: "Physical Store KL" },
        { name: "iStore Pavilion" }
    ];

    const users = [
        { email: "john.smith@shopintel.com" },
        { email: "jane.doe@shopintel.com" },
        { email: "mike.wilson@shopintel.com" },
        { email: "sarah.connor@shopintel.com" }
    ];

    const logTypes = [
        INVENTORY_LOG_TYPES.ADDED,
        INVENTORY_LOG_TYPES.REMOVED,
        INVENTORY_LOG_TYPES.RESTOCKED,
        INVENTORY_LOG_TYPES.SOLD,
        INVENTORY_LOG_TYPES.DAMAGED,
        INVENTORY_LOG_TYPES.RETURNED
    ];

    const logs: InventoryLog[] = [];
    const now = new Date();

    for (let i = 0; i < 50; i++) {
        const sku = beautySKUs[Math.floor(Math.random() * beautySKUs.length)];
        const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        const logType = logTypes[Math.floor(Math.random() * logTypes.length)];
        
        const quantityBefore = Math.floor(Math.random() * 100) + 10;
        const quantityChange = logType === INVENTORY_LOG_TYPES.ADDED || logType === INVENTORY_LOG_TYPES.RESTOCKED
            ? Math.floor(Math.random() * 50) + 10
            : -(Math.floor(Math.random() * 20) + 1);
        const quantityAfter = Math.max(0, quantityBefore + quantityChange);

        const logDate = new Date(now);
        logDate.setDate(logDate.getDate() - Math.floor(Math.random() * 30));
        logDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

        logs.push({
            id: `log_${Date.now()}_${i}`,
            user_id: `user_${Math.floor(Math.random() * 4) + 1}`,
            inventory_id: `inv_${i + 1}`,
            notes: logType === INVENTORY_LOG_TYPES.ADDED 
                ? `Restocked ${sku.name} at ${warehouse.name}`
                : logType === INVENTORY_LOG_TYPES.SOLD
                ? `Sold ${sku.name} from ${warehouse.name}`
                : logType === INVENTORY_LOG_TYPES.DAMAGED
                ? `Damaged item: ${sku.name}`
                : logType === INVENTORY_LOG_TYPES.RETURNED
                ? `Returned ${sku.name} to ${warehouse.name}`
                : `Inventory adjustment for ${sku.name}`,
            quantity_before: quantityBefore,
            quantity_after: quantityAfter,
            quantity_change: quantityChange,
            log_type: logType,
            metadata: {
                title: `${logType} - ${sku.name}`,
                quantity: Math.abs(quantityChange),
                description: `Inventory ${logType.toLowerCase()} operation`,
                quantity_change: quantityChange,
                threshold_quantity: 20,
                source: "Shop-Intel Admin",
                ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`
            },
            created_at: logDate.toISOString(),
            updated_at: logDate.toISOString(),
            user: user,
            inventory: {
                quantity: quantityAfter,
                threshold_quantity: 20,
                warehouse: warehouse,
                sku: sku
            }
        });
    }

    // Sort by date (most recent first)
    return logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const mockInventoryLogs = generateMockInventoryLogs();

// Mock implementation
const getInventoryLogs = async (
    params: InventoryLogsParams = {}
): Promise<InventoryLogsResponse> => {
    await simulateDelay();
    
    let filteredLogs = [...mockInventoryLogs];
    
    // Filter by log_type
    if (params.log_type) {
        filteredLogs = filteredLogs.filter(log => log.log_type === params.log_type);
    }
    
    // Sort by date
    if (params.order_by === 'asc') {
        filteredLogs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
        filteredLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    
    return {
        message: "Inventory logs retrieved successfully",
        data: {
            inventory_logs: paginatedLogs,
            metadata: {
                total: filteredLogs.length,
                page,
                limit,
                total_pages: Math.ceil(filteredLogs.length / limit),
                has_next: endIndex < filteredLogs.length,
                has_previous: page > 1
            }
        }
    };
};

export const useInventoryLogs = (params: InventoryLogsParams = {}) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["inventoryLogs", params],
        queryFn: () => getInventoryLogs(params),
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });

    return {
        inventoryLogs: data?.data?.inventory_logs || [],
        metadata: data?.data?.metadata,
        isLoading,
        error,
        refetch,
    };
};
