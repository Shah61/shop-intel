import {
    AffiliatersMetadata,
    PaginatedAffiliatersResponse,
    PayoutsMetadata,
    PaginatedPayoutsHistoryResponse,
    CommissionMetadata,
    PaginatedCommissionHistoryResponse,
    Commission,
    AffiliatersQuery,
    PayoutsHistoryQuery,
    QueryCommissionHistory,
    CreatePayoutHistoryDTO
} from '../model/affiliates-model';

import {
    mockGetAffiliatesMetadata,
    mockGetAffiliates,
    mockGetPayoutsMetadata,
    mockGetPayoutsHistory,
    mockGetCommissionMetadata,
    mockGetCommissionHistory,
    mockGetUnpaidCommissions,
    mockCreatePayoutHistory,
    mockDeleteUserAffiliate
} from '../mock/affiliates-dummy-data';

// Simulate API delay to make it feel more realistic
const simulateDelay = (ms: number = 800) => 
    new Promise(resolve => setTimeout(resolve, ms));

export const getMockAffiliatesMetadata = async (): Promise<AffiliatersMetadata> => {
    await simulateDelay();
    return mockGetAffiliatesMetadata();
};

export const getMockAffiliates = async (query: AffiliatersQuery): Promise<PaginatedAffiliatersResponse> => {
    await simulateDelay(1000);
    return mockGetAffiliates(query);
};

export const getMockPayoutsMetadata = async (): Promise<PayoutsMetadata> => {
    await simulateDelay();
    return mockGetPayoutsMetadata();
};

export const getMockPayoutsHistory = async (query: PayoutsHistoryQuery): Promise<PaginatedPayoutsHistoryResponse> => {
    await simulateDelay(1200);
    return mockGetPayoutsHistory(query);
};

export const getMockCommissionMetadata = async (): Promise<CommissionMetadata> => {
    await simulateDelay();
    return mockGetCommissionMetadata();
};

export const getMockCommissionHistory = async (query: QueryCommissionHistory): Promise<PaginatedCommissionHistoryResponse> => {
    await simulateDelay(1000);
    return mockGetCommissionHistory(query);
};

export const getMockUnpaidCommissions = async (ids: string[]): Promise<Commission[]> => {
    await simulateDelay(600);
    return mockGetUnpaidCommissions(ids);
};

export const createMockPayoutHistory = async (data: CreatePayoutHistoryDTO): Promise<void> => {
    await simulateDelay(1500);
    return mockCreatePayoutHistory(data);
};

export const deleteMockUserAffiliate = async (id: string): Promise<void> => {
    await simulateDelay(1000);
    return mockDeleteUserAffiliate(id);
};
