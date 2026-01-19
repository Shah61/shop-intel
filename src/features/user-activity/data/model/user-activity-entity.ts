import { UsersEntity } from "../../../auth/data/model/users-entity";

export enum EventType {
    ORDER = 'ORDER',
    PRODUCT = 'PRODUCT',
    COLLECTION = 'COLLECTION',
    DISCOUNT = 'DISCOUNT',
    CATEGORY = 'CATEGORY',
    USER = 'USER',
    AUTHENTICATION = 'AUTHENTICATION',
    SYSTEM = 'SYSTEM'
}

export interface EventEntity {
    id: string;
    name: string;
    description: string;
    user_id: string;
    type?: EventType | string;
    status?: 'pending' | 'active' | 'completed' | 'cancelled';
    location?: string;
    start_date?: string;
    end_date?: string;
    attendees_count?: number;
    max_attendees?: number;
    created_at: string;
    updated_at: string;
    user?: UsersEntity;
}

export interface EventFilterParams {
    user_id?: string;
    type?: EventType | string;
    status?: string;
    start_date?: string;
    end_date?: string;
    location?: string;
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface EventMetadata {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

export interface EventListResponse {
    events: EventEntity[];
    metadata: EventMetadata;
}

export interface EventResponse {
    message: string;
    data: {
        events: EventEntity[];
        metadata: EventMetadata;
    };
}

export interface CreateEventRequest {
    name: string;
    description: string;
    user_id: string;
    type?: EventType | string;
    status?: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    max_attendees?: number;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
    id: string;
}

export interface EventStats {
    total_events: number;
    upcoming_events: number;
    active_events: number;
    completed_events: number;
    total_attendees: number;
    average_attendance: number;
}

export interface EventAnalyticsSummary {
    total_events: number;
    total_users: number;
    active_users: {
        count: number;
        users: Array<{
            id: string;
            name: string;
            email: string;
            role: string;
        }>;
        timeframe: string;
    };
} 