export interface PaginatedAffiliatersResponse {
    users: Affiliaters[];
    metadata: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}

export interface AffiliatersMetadata {
    total_sales: number;
    total_commission: number;
    total_users: number;
    total_unpaid_commission: number;
}

export interface Affiliaters {
    user_affiliate: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        bank_detail: {
            bank_name: string;
            account_number: string;
            account_holder: string;
        }
    };
    total_sales_amount: number;
    total_commission_amount: number;
    total_unpaid_commission_amount: number;
    status: string;
    joined_at: string;
    unpaid_commissions_id: string[];
}

export interface AffiliatersQuery {
    page?: number;
    limit?: number;
    user_affiliate_id?: string;
    status?: string;
}


export interface PayoutsMetadata {
    total_payout: number;
    pending_payout: number;
    paid_this_month: number;
    total_transactions: number;
}





export interface PayoutsHistory {
    id: string;
    payout_amount: number;
    user_affiliate_id: string;
    user_id: string;
    created_at: Date;
    updated_at: Date;

    user_affiliate: {
        email: string;
        first_name: string;
        last_name: string;
        bank_detail: {
            bank_name: string;
            account_number: string;
            account_holder: string;
        }
    };
    user: {
        email: string;
        name: string;
    };
}

export interface PayoutsHistoryQuery {
    status?: string;
    user_affiliate_id?: string;
    max_amount?: number;
    min_amount?: number;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface CommissionMetadata {
    total_commissions: number;
    approved_commissions: number;
    pending_commissions: number;
    total_sales: number;
}




export interface CommissionHistory {
    id: string;
    order_id: string;
    total_sales: number;
    commission: number;
    quantity: number;
    source: string;
    is_paid: boolean;
    status: string;
    user_affiliate_id: string;
    created_at: Date;
    updated_at: Date;
    user_affiliate: {
        email: string;
        first_name: string;
        last_name: string;
    };
}


export interface CreatePayoutHistoryDTO {
    user_affiliate_id?: string;
    staff_id?: string;
    payout_amount?: number;
    commission_ids?: string[];
}

export interface Commission {
    id: string;
    order_id: string;
    total_sales: number;
    commission: number;
    quantity: number;
    source: string;
    is_paid: boolean;
    status: string;
    user_affiliate_id: string;
    created_at: Date;
    updated_at: Date;
}

export interface QueryCommissionHistory {
    page?: number;
    limit?: number;
    user_affiliate_id?: string;
    is_paid?: boolean;
}


export interface PaginatedPayoutsHistoryResponse {
    success: boolean;
    data: {
        payout_histories: PayoutsHistory[];
        metadata: {
            total: number;
            page: number;
            limit: number;
            total_pages: number;
            has_next: boolean;
            has_previous: boolean;
        };
    };
}


export interface PaginatedCommissionHistoryResponse {
    success: boolean;
    data: {
        commissions: CommissionHistory[];
        metadata: {
            total: number;
            page: number;
            limit: number;
            total_pages: number;
            has_next: boolean;
            has_previous: boolean;
        };
    };
}
