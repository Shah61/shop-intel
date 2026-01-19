import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getMockCollections,
    getMockCollectionById,
    createMockCollection,
    updateMockCollection,
    deleteMockCollection
} from "../../../data/services/mock-physical-sales-api.service";
import { CollectionCreateParams, CollectionUpdateParams } from "../../../data/model/physical/collection-entity";
import toast from "react-hot-toast";

// Use mock data only (frontend-only project)
const USE_MOCK_DATA = true;

export const useCollectionsQuery = () => {
    return useQuery({
        queryKey: ["collections"],
        queryFn: () => {
            return getMockCollections();
        },
        refetchOnWindowFocus: false,
        retry: false,
    });
};

export const useCollectionByIdQuery = (id: string) => {
    return useQuery({
        queryKey: ["collection", id],
        queryFn: async () => {
            try {
                return await getMockCollectionById(id);
            } catch (error) {
                throw error;
            }
        },
        enabled: !!id,
    });
};

export const useCreateCollectionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (params: CollectionCreateParams) => {
            return await createMockCollection(params);
        },
        onSuccess: () => {
            toast.success("Collection created successfully");
            queryClient.invalidateQueries({ queryKey: ["collections"] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create collection");
        }
    });
};

export const useUpdateCollectionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, params }: { id: string; params: CollectionUpdateParams }) => {
            return await updateMockCollection(id, params);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["collections"] });
            queryClient.invalidateQueries({ queryKey: ["collection", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["variants"] });
            toast.success("Collection updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update collection");
        }
    });
};

export const useDeleteCollectionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await deleteMockCollection(id);
        },
        onSuccess: () => {
            toast.success("Collection deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["collections"] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete collection");
        }
    });
};
