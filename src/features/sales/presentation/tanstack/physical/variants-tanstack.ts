import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { VariantEntity } from "../../../data/model/physical/variants-entity";
import { mockPhysicalSalesData } from "../../../data/mock/physical-sales-dummy-data";
import toast from "react-hot-toast";

// Use mock data only (frontend-only project)
const USE_MOCK_DATA = true;

// Simulate API delay
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock implementations
const getListVariants = async (params?: { category_id?: string, currency?: string }): Promise<VariantEntity[]> => {
    await simulateDelay();
    let variants = mockPhysicalSalesData.products.flatMap(product => product.variants || []);
    
    if (params?.category_id) {
        variants = variants.filter(v => v.category_id === params.category_id);
    }
    
    if (params?.currency) {
        variants = variants.filter(v => v.currency === params.currency);
    }
    
    return variants;
};

const getVariantById = async (id: string): Promise<VariantEntity | null> => {
    await simulateDelay();
    for (const product of mockPhysicalSalesData.products) {
        const variant = product.variants?.find(v => v.id === id);
        if (variant) return variant;
    }
    return null;
};

const createVariant = async (variant: VariantEntity): Promise<VariantEntity> => {
    await simulateDelay();
    const product = mockPhysicalSalesData.products.find(p => p.id === variant.product_id);
    if (!product) throw new Error('Product not found');
    
    if (!product.variants) product.variants = [];
    product.variants.push(variant);
    return variant;
};

const updateVariant = async (variant: VariantEntity, accessToken?: string): Promise<VariantEntity> => {
    await simulateDelay();
    for (const product of mockPhysicalSalesData.products) {
        const index = product.variants?.findIndex(v => v.id === variant.id);
        if (index !== undefined && index !== -1 && product.variants) {
            product.variants[index] = { ...product.variants[index], ...variant };
            return product.variants[index];
        }
    }
    throw new Error('Variant not found');
};

const deleteVariant = async (id: string): Promise<VariantEntity> => {
    await simulateDelay();
    for (const product of mockPhysicalSalesData.products) {
        const index = product.variants?.findIndex(v => v.id === id);
        if (index !== undefined && index !== -1 && product.variants) {
            const deleted = product.variants[index];
            product.variants.splice(index, 1);
            return deleted;
        }
    }
    throw new Error('Variant not found');
};

const getListCountries = async () => {
    await simulateDelay();
    return {
        countries: [
            { id: "US", name: "United States", code: "US" },
            { id: "MY", name: "Malaysia", code: "MY" },
            { id: "SG", name: "Singapore", code: "SG" },
            { id: "TH", name: "Thailand", code: "TH" },
            { id: "ID", name: "Indonesia", code: "ID" },
            { id: "PH", name: "Philippines", code: "PH" }
        ]
    };
};

export const useVariantsQuery = (params?: { category_id?: string, currency?: string }) => {
    return useQuery({
        queryKey: ["variants", params],
        queryFn: async () => {
            try {
                return await getListVariants(params);
            } catch (error) {
                throw error;
            }
        },
    });
}

export const useVariantByIdQuery = (id: string) => {
    return useQuery({
        queryKey: ["variant", id],
        queryFn: async () => {
            try {
                return await getVariantById(id);
            } catch (error) {
                throw error;
            }
        },
        enabled: !!id
    });
}

export const useCreateVariantMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (variant: VariantEntity) => {
            return await createVariant(variant);
        },
        onSuccess: (data, variables) => {
            toast.success("Variant created successfully");
            queryClient.invalidateQueries({ queryKey: ["variants"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            if (variables.product_id) {
                queryClient.invalidateQueries({ queryKey: ["product", variables.product_id] });
            }
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create variant");
        }
    });
}

export const useDeleteVariantMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            return await deleteVariant(id);
        },
        onSuccess: (data) => {
            toast.success("Variant deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["variants"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            // Invalidate specific product query
            if (data?.product_id) {
                queryClient.invalidateQueries({ queryKey: ["product", data.product_id] });
            }
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete variant");
        }
    });
}

export const useUpdateVariantMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ variant, accessToken }: { variant: VariantEntity; accessToken?: string }) => {
            return await updateVariant(variant, accessToken);
        },
        onSuccess: (data, variables) => {
            toast.success("Variant updated successfully");
            queryClient.invalidateQueries({ queryKey: ["variants"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            // Invalidate specific product query
            if (variables.variant.product_id) {
                queryClient.invalidateQueries({ queryKey: ["product", variables.variant.product_id] });
            }
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update variant");
        }
    });
}

export const useListCountriesQuery = () => {
    return useQuery({
        queryKey: ["countries"],
        queryFn: async () => {
            return await getListCountries();
        }
    });
}