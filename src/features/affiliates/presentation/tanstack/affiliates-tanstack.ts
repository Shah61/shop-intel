import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMockAffiliatesMetadata, getMockAffiliates, getMockPayoutsHistory, getMockPayoutsMetadata, getMockCommissionMetadata, getMockCommissionHistory, getMockUnpaidCommissions, createMockPayoutHistory, deleteMockUserAffiliate } from "../../data/services/mock-affiliates-api.service";
import { AffiliatersQuery, CreatePayoutHistoryDTO, PayoutsHistoryQuery, QueryCommissionHistory } from "../../data/model/affiliates-model";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { PaginatedPayoutsHistoryResponse } from "../../data/model/affiliates-model";

// Use mock data only (frontend-only project)
const USE_MOCK_AFFILIATE_DATA = true;

export const useGetAffiliatesMetadata = () => {
    return useQuery({
        queryKey: ["affiliates-metadata"],
        queryFn: async () => {
            return getMockAffiliatesMetadata();
        },
    });
};

export const useGetAffiliaters = (query: AffiliatersQuery) => {
    return useQuery({
        queryKey: ["affiliaters", query],
        queryFn: async () => {
            return getMockAffiliates(query);
        },
    });
}

export const useGetPayoutsMetadata = () => {
    return useQuery({
        queryKey: ["payouts-metadata"],
        queryFn: async () => {
            return getMockPayoutsMetadata();
        },
    });
}

export const useGetPayoutsHistory = (query: PayoutsHistoryQuery) => {
    return useQuery<PaginatedPayoutsHistoryResponse>({
        queryKey: ["payouts-history", query],
        queryFn: async () => {
            return getMockPayoutsHistory({
                ...query,
                page: query.page || 1,
                limit: query.limit || 10,
                max_amount: query.max_amount,
                min_amount: query.min_amount,
                sort_by: query.sort_by,
                sort_order: query.sort_order
            });
        },
    });
}


export const useGetCommissionMetadata = () => {
    return useQuery({
        queryKey: ["commission-metadata"],
        queryFn: async () => {
            return getMockCommissionMetadata();
        },
    });
}

export const useGetCommissionHistory = (query: QueryCommissionHistory) => {
    return useQuery({
        queryKey: ["commission-history", query],
        queryFn: async () => {
            return getMockCommissionHistory(query);
        },
    });
}


export const useCreatePayoutHistory = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation({
        mutationFn: async (data: CreatePayoutHistoryDTO) => {
            return createMockPayoutHistory(data);
        },
        onSuccess: () => {
            toast.success("Payout history created successfully");

            // Invalidate all relevant queries
            refreshQueries(queryClient);

            // Refresh the Next.js router
            router.refresh();
        },
        onError: (error: any) => {
            toast.error(error.message);
        }
    });
}

export const useGetUnPaidCommission = (ids: string[]) => {
    return useQuery({
        queryKey: ["unpaid-commission", ids],
        queryFn: async () => {
            return getMockUnpaidCommissions(ids);
        }
    });
}


export const useDeleteUserAffiliate = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation({
        mutationFn: async (id: string) => {
            return deleteMockUserAffiliate(id);
        },
        onSuccess: () => {
            toast.success("User affiliate deleted successfully");
            refreshQueries(queryClient);
            router.refresh();
        },
        onError: (error: any) => {
            console.log(error);
        }
    });
};


const refreshQueries = (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: ["affiliaters"] });
    queryClient.invalidateQueries({ queryKey: ["payouts-history"] });
    queryClient.invalidateQueries({ queryKey: ["payouts-metadata"] });
    queryClient.invalidateQueries({ queryKey: ["commission-history"] });
    queryClient.invalidateQueries({ queryKey: ["commission-metadata"] });
    queryClient.invalidateQueries({ queryKey: ["affiliates-metadata"] });
    queryClient.invalidateQueries({ queryKey: ["unpaid-commission"] });
}