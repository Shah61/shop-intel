import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CategoryParams, CategoryFilterParams, CategoryUpdateParams } from "@/src/features/sales/data/model/physical/categories-entity";
import { 
  getMockCategories, 
  createMockCategory, 
  updateMockCategory, 
  deleteMockCategory,
  getMockUsersForCategory,
  getMockVariantsForCategory
} from "@/src/features/sales/data/services/mock-physical-sales-api.service";
import { useSession } from "@/src/core/lib/dummy-session-provider";
import toast from "react-hot-toast";

// Use mock data only (frontend-only project)
const USE_MOCK_DATA = true;

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: CategoryParams) => {
      return createMockCategory(params);
    },
    onSuccess: () => {
      toast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create category");
    }
  });
};

export const useGetCategoriesQuery = (filters?: CategoryFilterParams) => {
  return useQuery({
    queryKey: ["categories", filters],
    queryFn: () => {
      return getMockCategories();
    },
    refetchOnWindowFocus: false,
    retry: false,
  }); 
}     

export const useGetCategoryByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      const categories = await getMockCategories();
      return categories.data?.categories?.find(cat => cat.id === id) || null;
    },
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!id,
  });
}

export const useUpdateCategoryMutation = () => {  
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: CategoryUpdateParams }) => {
      return updateMockCategory(id, params);
    },
    onSuccess: (data, variables) => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", variables.id] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update category");
    }
  });
}

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => {
      return deleteMockCategory(id);
    },
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete category");
    }
  });
}

// New queries for fetching variants and users (mock data only)
export const useGetVariantsForCategoryQuery = () => {
  return useQuery({
    queryKey: ["variants-for-category"],
    queryFn: async () => {
      return getMockVariantsForCategory();
    },
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useGetUsersForCategoryQuery = () => {
  return useQuery({
    queryKey: ["users-for-category"],
    queryFn: async () => {
      return getMockUsersForCategory();
    },
    refetchOnWindowFocus: false,
    retry: false,
  });
}; 