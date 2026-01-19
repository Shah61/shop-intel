import axios, { AxiosError } from "axios";
import { 
    EventEntity, 
    EventListResponse, 
    EventFilterParams, 
} from "./model/user-activity-entity";

export const getListEvents = async (filters: EventFilterParams = {}, accessToken?: string): Promise<EventListResponse> => {
    try {
        // Clean up undefined values and prepare params
        const params: Record<string, any> = {
            page: filters.page || 1,
            limit: filters.limit || 10,
        };

        // Add optional filters only if they have values
        if (filters.user_id) params.user_id = filters.user_id;
        if (filters.type) params.type = filters.type;
        if (filters.status) params.status = filters.status;
        if (filters.start_date) params.start_date = filters.start_date;
        if (filters.end_date) params.end_date = filters.end_date;
        if (filters.location) params.location = filters.location;
        if (filters.search) params.search = filters.search;
        if (filters.sort_by) params.sort_by = filters.sort_by;
        if (filters.sort_order) params.sort_order = filters.sort_order;

        const headers: { [key: string]: string } = {
            'Content-Type': 'application/json',
        };
        
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await axios.get(`${process.env['Shop-Intel_ADMIN_URL']}/events`, {
            params,
            headers
        });

        if (response.status === 200) {
            const data = response.data.data;
            return {
                events: data.events as EventEntity[],
                metadata: data.metadata
            };
        }
        throw new Error('Failed to fetch events');
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || 'Failed to fetch events');
        }
        throw new Error('Failed to fetch events');
    }
};

export const getEventById = async (id: string, accessToken?: string): Promise<EventEntity> => {
    try {
        const headers: { [key: string]: string } = {
            'Content-Type': 'application/json',
        };
        
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await axios.get(`${process.env['Shop-Intel_ADMIN_URL']}/events`, {
            params: { id },
            headers
        });
        
        if (response.status === 200) {
            const data = response.data.data;
            // The API returns events array even for single event lookup
            if (data.events && data.events.length > 0) {
                return data.events[0] as EventEntity;
            }
            // If no events found, throw an error
            throw new Error(`Event with id ${id} not found`);
        }
        throw new Error('Failed to fetch event');
    } catch (error) {
        if (error instanceof AxiosError) {
            // Handle 404 or empty response cases
            if (error.response?.status === 404) {
                throw new Error(`Event with id ${id} not found`);
            }
            throw new Error(error.response?.data?.message || `Failed to fetch event with id: ${id}`);
        }
        throw new Error(`Failed to fetch event with id: ${id}`);
    }
};

export const getEventAnalyticsSummary = async (filters?: {
    start_date?: string;
    end_date?: string;
    limit?: number;
    page?: number;
}, accessToken?: string): Promise<{
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
}> => {
    try {
        const params: Record<string, any> = {};
        
        if (filters?.start_date) params.start_date = filters.start_date;
        if (filters?.end_date) params.end_date = filters.end_date;
        if (filters?.limit) params.limit = filters.limit;
        if (filters?.page) params.page = filters.page;

        const headers: { [key: string]: string } = {
            'Content-Type': 'application/json',
        };
        
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await axios.get(`${process.env['Shop-Intel_ADMIN_URL']}/events/analytics/summary`, {
            params,
            headers
        });

        if (response.status === 200) {
            return response.data.data;
        }
        throw new Error('Failed to fetch event analytics summary');
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || 'Failed to fetch event analytics summary');
        }
        throw new Error('Failed to fetch event analytics summary');
    }
};
