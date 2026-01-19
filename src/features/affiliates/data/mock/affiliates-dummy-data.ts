import {
    Affiliaters,
    AffiliatersMetadata,
    PaginatedAffiliatersResponse,
    PayoutsHistory,
    PayoutsMetadata,
    PaginatedPayoutsHistoryResponse,
    CommissionHistory,
    CommissionMetadata,
    PaginatedCommissionHistoryResponse,
    Commission,
    AffiliatersQuery,
    PayoutsHistoryQuery,
    QueryCommissionHistory
} from '../model/affiliates-model';

// Generate realistic dummy affiliate data
const generateAffiliates = (): Affiliaters[] => {
    const firstNames = [
        'Sarah', 'Michael', 'Emma', 'David', 'Jessica', 'James', 'Ashley', 'Christopher',
        'Amanda', 'Matthew', 'Stephanie', 'Joshua', 'Melissa', 'Daniel', 'Nicole',
        'Anthony', 'Angela', 'Mark', 'Kimberly', 'Steven', 'Lisa', 'Andrew', 'Mary',
        'Kenneth', 'Donna', 'Paul', 'Michelle', 'Joshua', 'Carol', 'Kevin'
    ];
    
    const lastNames = [
        'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez',
        'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
        'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
        'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker'
    ];

    const banks = [
        'Bank of America', 'Chase Bank', 'Wells Fargo', 'Citibank', 'US Bank',
        'PNC Bank', 'Capital One', 'TD Bank', 'Bank of the West', 'Regions Bank',
        'Fifth Third Bank', 'KeyBank', 'Huntington Bank', 'SunTrust Bank', 'BB&T'
    ];

    const statuses = ['active', 'inactive', 'pending', 'suspended'];

    return Array.from({ length: 150 }, (_, index) => {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`;
        const joinedDaysAgo = Math.floor(Math.random() * 365);
        const totalSales = Math.floor(Math.random() * 50000) + 1000;
        const commissionRate = 0.05 + Math.random() * 0.15; // 5-20% commission
        const totalCommission = Math.floor(totalSales * commissionRate);
        const paidCommission = Math.floor(totalCommission * (0.6 + Math.random() * 0.4)); // 60-100% paid
        const unpaidCommission = totalCommission - paidCommission;
        const unpaidCommissionsCount = Math.floor(Math.random() * 5) + 1;
        
        return {
            user_affiliate: {
                id: `affiliate_${index + 1}`,
                email: email,
                first_name: firstName,
                last_name: lastName,
                bank_detail: {
                    bank_name: banks[Math.floor(Math.random() * banks.length)],
                    account_number: `****${Math.floor(Math.random() * 9000) + 1000}`,
                    account_holder: `${firstName} ${lastName}`
                }
            },
            total_sales_amount: totalSales,
            total_commission_amount: paidCommission,
            total_unpaid_commission_amount: unpaidCommission,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            joined_at: new Date(Date.now() - joinedDaysAgo * 24 * 60 * 60 * 1000).toISOString(),
            unpaid_commissions_id: Array.from({ length: unpaidCommissionsCount }, (_, i) => 
                `commission_${index + 1}_${i + 1}`
            )
        };
    });
};

// Generate payout history data
const generatePayoutsHistory = (): PayoutsHistory[] => {
    const affiliates = generateAffiliates();
    
    return Array.from({ length: 75 }, (_, index) => {
        const affiliate = affiliates[Math.floor(Math.random() * affiliates.length)];
        const payoutAmount = Math.floor(Math.random() * 2000) + 100;
        const createdDaysAgo = Math.floor(Math.random() * 180);
        
        return {
            id: `payout_${index + 1}`,
            payout_amount: payoutAmount,
            user_affiliate_id: affiliate.user_affiliate.id,
            user_id: `staff_${Math.floor(Math.random() * 10) + 1}`,
            created_at: new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000),
            updated_at: new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000),
            user_affiliate: {
                email: affiliate.user_affiliate.email,
                first_name: affiliate.user_affiliate.first_name,
                last_name: affiliate.user_affiliate.last_name,
                bank_detail: affiliate.user_affiliate.bank_detail
            },
            user: {
                email: `staff${Math.floor(Math.random() * 10) + 1}@company.com`,
                name: `Staff Member ${Math.floor(Math.random() * 10) + 1}`
            }
        };
    });
};

// Generate commission history data
const generateCommissionHistory = (): CommissionHistory[] => {
    const affiliates = generateAffiliates();
    const sources = ['website', 'mobile_app', 'social_media', 'referral', 'email_campaign'];
    const statuses = ['approved', 'pending', 'rejected'];
    
    return Array.from({ length: 200 }, (_, index) => {
        const affiliate = affiliates[Math.floor(Math.random() * affiliates.length)];
        const totalSales = Math.floor(Math.random() * 1000) + 50;
        const commission = Math.floor(totalSales * (0.05 + Math.random() * 0.15));
        const quantity = Math.floor(Math.random() * 10) + 1;
        const createdDaysAgo = Math.floor(Math.random() * 90);
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const isPaid = status === 'approved' && Math.random() > 0.3;
        
        return {
            id: `commission_${index + 1}`,
            order_id: `order_${Math.floor(Math.random() * 100000) + 10000}`,
            total_sales: totalSales,
            commission: commission,
            quantity: quantity,
            source: sources[Math.floor(Math.random() * sources.length)],
            is_paid: isPaid,
            status: status,
            user_affiliate_id: affiliate.user_affiliate.id,
            created_at: new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000),
            updated_at: new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000),
            user_affiliate: {
                email: affiliate.user_affiliate.email,
                first_name: affiliate.user_affiliate.first_name,
                last_name: affiliate.user_affiliate.last_name
            }
        };
    });
};

// Generate unpaid commissions
const generateUnpaidCommissions = (): Commission[] => {
    const commissionHistory = generateCommissionHistory();
    return commissionHistory
        .filter(commission => !commission.is_paid && commission.status === 'approved')
        .map(commission => ({
            id: commission.id,
            order_id: commission.order_id,
            total_sales: commission.total_sales,
            commission: commission.commission,
            quantity: commission.quantity,
            source: commission.source,
            is_paid: commission.is_paid,
            status: commission.status,
            user_affiliate_id: commission.user_affiliate_id,
            created_at: commission.created_at,
            updated_at: commission.updated_at
        }));
};

// Cached data to maintain consistency
let cachedAffiliates: Affiliaters[] | null = null;
let cachedPayouts: PayoutsHistory[] | null = null;
let cachedCommissions: CommissionHistory[] | null = null;
let cachedUnpaidCommissions: Commission[] | null = null;

const getAffiliatesData = (): Affiliaters[] => {
    if (!cachedAffiliates) {
        cachedAffiliates = generateAffiliates();
    }
    return cachedAffiliates;
};

const getPayoutsData = (): PayoutsHistory[] => {
    if (!cachedPayouts) {
        cachedPayouts = generatePayoutsHistory();
    }
    return cachedPayouts;
};

const getCommissionsData = (): CommissionHistory[] => {
    if (!cachedCommissions) {
        cachedCommissions = generateCommissionHistory();
    }
    return cachedCommissions;
};

const getUnpaidCommissionsData = (): Commission[] => {
    if (!cachedUnpaidCommissions) {
        cachedUnpaidCommissions = generateUnpaidCommissions();
    }
    return cachedUnpaidCommissions;
};

// Mock API Functions
export const mockGetAffiliatesMetadata = (): AffiliatersMetadata => {
    const affiliates = getAffiliatesData();
    const commissions = getCommissionsData();
    
    const totalSales = affiliates.reduce((sum, affiliate) => sum + affiliate.total_sales_amount, 0);
    const totalCommission = affiliates.reduce((sum, affiliate) => sum + affiliate.total_commission_amount, 0);
    const totalUnpaidCommission = affiliates.reduce((sum, affiliate) => sum + affiliate.total_unpaid_commission_amount, 0);
    
    return {
        total_sales: totalSales,
        total_commission: totalCommission,
        total_users: affiliates.length,
        total_unpaid_commission: totalUnpaidCommission
    };
};

export const mockGetAffiliates = (query: AffiliatersQuery): PaginatedAffiliatersResponse => {
    let affiliates = getAffiliatesData();
    
    // Apply filters
    if (query.status && query.status !== 'all') {
        affiliates = affiliates.filter(affiliate => affiliate.status === query.status);
    }
    
    if (query.user_affiliate_id) {
        affiliates = affiliates.filter(affiliate => affiliate.user_affiliate.id === query.user_affiliate_id);
    }
    
    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAffiliates = affiliates.slice(startIndex, endIndex);
    
    return {
        users: paginatedAffiliates,
        metadata: {
            total: affiliates.length,
            page: page,
            limit: limit,
            total_pages: Math.ceil(affiliates.length / limit)
        }
    };
};

export const mockGetPayoutsMetadata = (): PayoutsMetadata => {
    const payouts = getPayoutsData();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const totalPayout = payouts.reduce((sum, payout) => sum + payout.payout_amount, 0);
    const paidThisMonth = payouts
        .filter(payout => {
            const payoutDate = new Date(payout.created_at);
            return payoutDate.getMonth() === currentMonth && payoutDate.getFullYear() === currentYear;
        })
        .reduce((sum, payout) => sum + payout.payout_amount, 0);
    
    const unpaidCommissions = getUnpaidCommissionsData();
    const pendingPayout = unpaidCommissions.reduce((sum, commission) => sum + commission.commission, 0);
    
    return {
        total_payout: totalPayout,
        pending_payout: pendingPayout,
        paid_this_month: paidThisMonth,
        total_transactions: payouts.length
    };
};

export const mockGetPayoutsHistory = (query: PayoutsHistoryQuery): PaginatedPayoutsHistoryResponse => {
    let payouts = getPayoutsData();
    
    // Apply filters
    if (query.user_affiliate_id) {
        payouts = payouts.filter(payout => payout.user_affiliate_id === query.user_affiliate_id);
    }
    
    if (query.min_amount) {
        payouts = payouts.filter(payout => payout.payout_amount >= query.min_amount!);
    }
    
    if (query.max_amount) {
        payouts = payouts.filter(payout => payout.payout_amount <= query.max_amount!);
    }
    
    // Sorting
    if (query.sort_by && query.sort_order) {
        payouts.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (query.sort_by) {
                case 'created_at':
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
                    break;
                case 'payout_amount':
                    aValue = a.payout_amount;
                    bValue = b.payout_amount;
                    break;
                default:
                    return 0;
            }
            
            if (query.sort_order === 'asc') {
                return aValue - bValue;
            } else {
                return bValue - aValue;
            }
        });
    }
    
    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPayouts = payouts.slice(startIndex, endIndex);
    
    return {
        success: true,
        data: {
            payout_histories: paginatedPayouts,
            metadata: {
                total: payouts.length,
                page: page,
                limit: limit,
                total_pages: Math.ceil(payouts.length / limit),
                has_next: endIndex < payouts.length,
                has_previous: page > 1
            }
        }
    };
};

export const mockGetCommissionMetadata = (): CommissionMetadata => {
    const commissions = getCommissionsData();
    
    const totalCommissions = commissions.length;
    const approvedCommissions = commissions.filter(c => c.status === 'approved').length;
    const pendingCommissions = commissions.filter(c => c.status === 'pending').length;
    const totalSales = commissions.reduce((sum, commission) => sum + commission.total_sales, 0);
    
    return {
        total_commissions: totalCommissions,
        approved_commissions: approvedCommissions,
        pending_commissions: pendingCommissions,
        total_sales: totalSales
    };
};

export const mockGetCommissionHistory = (query: QueryCommissionHistory): PaginatedCommissionHistoryResponse => {
    let commissions = getCommissionsData();
    
    // Apply filters
    if (query.user_affiliate_id) {
        commissions = commissions.filter(commission => commission.user_affiliate_id === query.user_affiliate_id);
    }
    
    if (query.is_paid !== undefined) {
        commissions = commissions.filter(commission => commission.is_paid === query.is_paid);
    }
    
    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCommissions = commissions.slice(startIndex, endIndex);
    
    return {
        success: true,
        data: {
            commissions: paginatedCommissions,
            metadata: {
                total: commissions.length,
                page: page,
                limit: limit,
                total_pages: Math.ceil(commissions.length / limit),
                has_next: endIndex < commissions.length,
                has_previous: page > 1
            }
        }
    };
};

export const mockGetUnpaidCommissions = (ids: string[]): Commission[] => {
    const unpaidCommissions = getUnpaidCommissionsData();
    return unpaidCommissions.filter(commission => ids.includes(commission.id));
};

// Mock creation and deletion functions (simulate success)
export const mockCreatePayoutHistory = async (data: any): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, you'd add the payout to the cached data
    console.log('Mock: Created payout history', data);
    
    // Simulate success
    return;
};

export const mockDeleteUserAffiliate = async (id: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real implementation, you'd remove the affiliate from cached data
    console.log('Mock: Deleted user affiliate', id);
    
    // Simulate success
    return;
};

// Export all mock functions
export const mockAffiliatesData = {
    getAffiliatesMetadata: mockGetAffiliatesMetadata,
    getAffiliates: mockGetAffiliates,
    getPayoutsMetadata: mockGetPayoutsMetadata,
    getPayoutsHistory: mockGetPayoutsHistory,
    getCommissionMetadata: mockGetCommissionMetadata,
    getCommissionHistory: mockGetCommissionHistory,
    getUnpaidCommissions: mockGetUnpaidCommissions,
    createPayoutHistory: mockCreatePayoutHistory,
    deleteUserAffiliate: mockDeleteUserAffiliate
};
