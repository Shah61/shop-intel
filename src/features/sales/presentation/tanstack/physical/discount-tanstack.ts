import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getMockDiscounts,
    createMockDiscount,
    deleteMockDiscount
} from "../../../data/services/mock-physical-sales-api.service";
import { 
    DiscountCreateParams, 
    DiscountUpdateParams, 
    DiscountFilterParams,
    DiscountEntity
} from "../../../data/model/physical/discount-entity";
import { mockPhysicalSalesData } from "../../../data/mock/physical-sales-dummy-data";
import toast from "react-hot-toast";

// Use mock data only (frontend-only project)
const USE_MOCK_DATA = true;

// Mock update function
const updateMockDiscount = async (id: string, params: DiscountUpdateParams): Promise<DiscountEntity> => {
    const index = mockPhysicalSalesData.discounts.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Discount not found');
    
    const updatedDiscount: DiscountEntity = {
        ...mockPhysicalSalesData.discounts[index],
        ...params,
        updated_at: new Date().toISOString()
    };
    mockPhysicalSalesData.discounts[index] = updatedDiscount;
    return updatedDiscount;
};

// Mock get by id function
const getMockDiscountById = async (id: string): Promise<DiscountEntity | null> => {
    const discount = mockPhysicalSalesData.discounts.find(d => d.id === id);
    return discount || null;
};

export const useDiscountsQuery = (filters?: DiscountFilterParams) => {
    return useQuery({
        queryKey: ["discounts", filters],
        queryFn: async () => {
            try {
                return await getMockDiscounts(filters);
            } catch (error) {
                throw error;
            }
        },
    });
};

export const useDiscountByIdQuery = (id: string) => {
    return useQuery({
        queryKey: ["discount", id],
        queryFn: async () => {
            try {
                return await getMockDiscountById(id);
            } catch (error) {
                throw error;
            }
        },
        enabled: !!id,
    });
};

export const useCreateDiscountMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: DiscountCreateParams) => {
            return await createMockDiscount(params);
        },
        onSuccess: () => {
            toast.success("Discount created successfully");
            queryClient.invalidateQueries({ queryKey: ["discounts"] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create discount");
        }
    });
};

export const useUpdateDiscountMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, params }: { id: string; params: DiscountUpdateParams }) => {
            return await updateMockDiscount(id, params);
        },
        onSuccess: (data, variables) => {
            // Invalidate and refetch the discounts list
            queryClient.invalidateQueries({ queryKey: ["discounts"] });
            // Invalidate and refetch the specific discount
            queryClient.invalidateQueries({ queryKey: ["discount", variables.id] });
            // Also invalidate any queries that might be related to collections
            queryClient.invalidateQueries({ queryKey: ["collections"] });
            toast.success("Discount updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update discount");
        }
    });
};

export const useDeleteDiscountMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await deleteMockDiscount(id);
        },
        onSuccess: () => {
            toast.success("Discount deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["discounts"] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete discount");
        }
    });
}; 