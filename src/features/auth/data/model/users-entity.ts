export interface UsersEntity {
    id?: string | null;
    email?: string | null;
    name?: string | null;
    role?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    total_orders?: number | null;
    total_revenues?: number | null;
    total_revenues_sgd?: number | null;
    total_revenues_myr?: number | null;
}




export interface BackendTokensEntity {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}