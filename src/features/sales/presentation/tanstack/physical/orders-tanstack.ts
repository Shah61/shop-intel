import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMockOrders, createMockOrder, deleteMockOrder } from "../../../data/services/mock-physical-sales-api.service";
import { OrderEntity, OrderFilterParams } from "../../../data/model/physical/orders-entity";
import toast from "react-hot-toast";

// Always use mock data - no backend API
const USE_MOCK_DATA = true;

export const useOrdersQuery = (filters: OrderFilterParams = {}) => {
    return useQuery({
        queryKey: ["orders", filters],
        queryFn: () => getMockOrders(filters),
        refetchOnWindowFocus: false,
        retry: false,
    });
};

export const useOrderByIdQuery = (id: string) => {
    return useQuery({
        queryKey: ["order", id],
        queryFn: async () => {
            const orders = await getMockOrders({});
            return orders.orders.find(order => order.id === id) || null;
        },
        enabled: !!id,
    });
};

export const useCreateOrderMutation = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (orderData: {
            user_id: string;
            customer_medusa_id: string;
            order_items: Array<{
                product_id: string;
                variant_id: string;
                quantity: number;
            }>;
            discount_id?: string;
            country_code?: string;
            shipping_country?: string;
            currency?: string;
            date?: string;
            time?: string;
        }) => {
            return await createMockOrder(orderData);
        },
        onSuccess: (_, variables) => {
            toast.success("Order created successfully");
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            // Invalidate product queries for all products in the order
            variables.order_items.forEach(item => {
                queryClient.invalidateQueries({ queryKey: ["product", item.product_id] });
            });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });
};

export const useDeleteOrderMutation = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (id: string) => {
            await deleteMockOrder(id);
        },
        onSuccess: () => {
            toast.success("Order deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });
};

export const useUpdateOrderMutation = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (order: OrderEntity) => {
            // Mock update - just return the order
            return { success: true, data: order };
        },
        onSuccess: (data, variables) => {
            toast.success("Order updated successfully");
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });
};
