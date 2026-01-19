import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getMockProducts, 
  getMockProductById, 
  createMockProduct, 
  updateMockProduct, 
  deleteMockProduct, 
  deleteMockProducts 
} from "../../../data/services/mock-physical-sales-api.service";
import { ProductEntity } from "../../../data/model/physical/products-entity";
import toast from "react-hot-toast";

// Always use mock data - no backend API
const USE_MOCK_DATA = true;

export const useProductsQuery = () => {
    return useQuery({
        queryKey: ["products"],
        queryFn: async () => {
                    return await getMockProducts();
        },
    });
}

export const useProductByIdQuery = (id: string) => {
    return useQuery({
        queryKey: ["product", id],
        queryFn: async () => {
                    return await getMockProductById(id);
        }
    });
}

export const useCreateProductMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (product: ProductEntity) => {
                return await createMockProduct(product);
        },
        onSuccess: () => {
            toast.success("Product created successfully");
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });
}

export const useDeleteProductMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
                return await deleteMockProduct(id);
        },
        onSuccess: () => {
            toast.success("Product deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });
}

export const useUpdateProductMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (product: ProductEntity) => {
            if (product.id) {
                return await updateMockProduct(product.id, product);
            }
            return { success: true, data: product };
        },
        onSuccess: () => {
            toast.success("Product updated successfully");
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });
}


export const useDeleteAllProductsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ids: string[]) => {
                return await deleteMockProducts(ids);
        },
        onSuccess: () => {
            toast.success("Products deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });
}