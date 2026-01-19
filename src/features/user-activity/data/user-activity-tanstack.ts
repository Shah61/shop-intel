import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
    EventFilterParams, 
    EventEntity,
    EventListResponse,
    EventType
} from "./model/user-activity-entity";

// Use mock data only (frontend-only project)
const USE_MOCK_DATA = true;

// Simulate API delay
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Generate mock events data
const generateMockEvents = (): EventEntity[] => {
    const eventTypes: EventType[] = [
        EventType.ORDER,
        EventType.PRODUCT,
        EventType.COLLECTION,
        EventType.DISCOUNT,
        EventType.CATEGORY,
        EventType.USER,
        EventType.AUTHENTICATION,
        EventType.SYSTEM
    ];

    const statuses: ('pending' | 'active' | 'completed' | 'cancelled')[] = [
        'pending',
        'active',
        'completed',
        'cancelled'
    ];

    const locations = [
        'Kuala Lumpur, Malaysia',
        'Petaling Jaya, Malaysia',
        'Shah Alam, Malaysia',
        'Sepang Warehouse, Malaysia',
        'Physical Store KL, Malaysia'
    ];

    const eventNames = {
        [EventType.ORDER]: ['Order Created', 'Order Updated', 'Order Processed', 'Order Cancelled'],
        [EventType.PRODUCT]: ['Product Viewed', 'Product Added', 'Product Updated', 'Product Deleted'],
        [EventType.COLLECTION]: ['Collection Created', 'Collection Updated', 'Collection Viewed'],
        [EventType.DISCOUNT]: ['Discount Created', 'Discount Applied', 'Discount Updated'],
        [EventType.CATEGORY]: ['Category Created', 'Category Updated', 'Category Viewed'],
        [EventType.USER]: ['User Created', 'User Updated', 'User Login', 'User Logout'],
        [EventType.AUTHENTICATION]: ['Login Success', 'Login Failed', 'Password Changed', 'Session Expired'],
        [EventType.SYSTEM]: ['System Backup', 'System Update', 'System Maintenance']
    };

    const eventDescriptions = {
        [EventType.ORDER]: 'Order management activity',
        [EventType.PRODUCT]: 'Product catalog activity',
        [EventType.COLLECTION]: 'Collection management activity',
        [EventType.DISCOUNT]: 'Discount and promotion activity',
        [EventType.CATEGORY]: 'Category management activity',
        [EventType.USER]: 'User account activity',
        [EventType.AUTHENTICATION]: 'Authentication and security activity',
        [EventType.SYSTEM]: 'System-level activity'
    };

    const users = [
        { id: 'user_1', name: 'John Smith', email: 'john.smith@shopintel.com', role: 'ADMIN' },
        { id: 'user_2', name: 'Jane Doe', email: 'jane.doe@shopintel.com', role: 'MANAGER' },
        { id: 'user_3', name: 'Mike Wilson', email: 'mike.wilson@shopintel.com', role: 'STAFF' },
        { id: 'user_4', name: 'Sarah Connor', email: 'sarah.connor@shopintel.com', role: 'STAFF' }
    ];

    const events: EventEntity[] = [];
    const now = new Date();

    for (let i = 0; i < 100; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const eventNamesForType = eventNames[eventType];
        const eventName = eventNamesForType[Math.floor(Math.random() * eventNamesForType.length)];
        
        const eventDate = new Date(now);
        eventDate.setDate(eventDate.getDate() - Math.floor(Math.random() * 30));
        eventDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

        const startDate = new Date(eventDate);
        const endDate = new Date(eventDate);
        endDate.setHours(endDate.getHours() + Math.floor(Math.random() * 5) + 1);

        events.push({
            id: `event_${Date.now()}_${i}`,
            name: eventName,
            description: `${eventDescriptions[eventType]} - ${eventName} by ${user.name}`,
            user_id: user.id,
            type: eventType,
            status,
            location,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            attendees_count: Math.floor(Math.random() * 50) + 1,
            max_attendees: Math.floor(Math.random() * 100) + 50,
            created_at: eventDate.toISOString(),
            updated_at: eventDate.toISOString(),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            } as any
        });
    }

    // Sort by date (most recent first)
    return events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const mockEvents = generateMockEvents();

// Mock implementations
const getListEvents = async (
    filters: EventFilterParams = {}
): Promise<EventListResponse> => {
    await simulateDelay();
    
    let filteredEvents = [...mockEvents];
    
    // Apply filters
    if (filters.user_id) {
        filteredEvents = filteredEvents.filter(e => e.user_id === filters.user_id);
    }
    
    if (filters.type) {
        filteredEvents = filteredEvents.filter(e => e.type === filters.type);
    }
    
    if (filters.status) {
        filteredEvents = filteredEvents.filter(e => e.status === filters.status);
    }
    
    if (filters.location) {
        filteredEvents = filteredEvents.filter(e => e.location?.toLowerCase().includes(filters.location!.toLowerCase()));
    }
    
    if (filters.start_date) {
        const startDate = new Date(filters.start_date);
        filteredEvents = filteredEvents.filter(e => new Date(e.created_at) >= startDate);
    }
    
    if (filters.end_date) {
        const endDate = new Date(filters.end_date);
        endDate.setHours(23, 59, 59, 999);
        filteredEvents = filteredEvents.filter(e => new Date(e.created_at) <= endDate);
    }
    
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredEvents = filteredEvents.filter(e =>
            e.id.toLowerCase().includes(searchLower) ||
            e.name?.toLowerCase().includes(searchLower) ||
            e.description?.toLowerCase().includes(searchLower) ||
            e.user?.name?.toLowerCase().includes(searchLower) ||
            e.user?.email?.toLowerCase().includes(searchLower) ||
            e.type?.toLowerCase().includes(searchLower) ||
            e.location?.toLowerCase().includes(searchLower)
        );
    }
    
    // Sort
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'desc';
    
    filteredEvents.sort((a, b) => {
        let aValue: any = a[sortBy as keyof EventEntity];
        let bValue: any = b[sortBy as keyof EventEntity];
        
        if (sortBy === 'created_at' || sortBy === 'updated_at') {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
        }
        
        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
    });
    
    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);
    
    return {
        events: paginatedEvents,
        metadata: {
            total: filteredEvents.length,
            page,
            limit,
            total_pages: Math.ceil(filteredEvents.length / limit),
            has_next: endIndex < filteredEvents.length,
            has_previous: page > 1
        }
    };
};

const getEventById = async (id: string): Promise<EventEntity> => {
    await simulateDelay();
    const event = mockEvents.find(e => e.id === id);
    if (!event) {
        throw new Error(`Event with id ${id} not found`);
    }
    return event;
};

const getEventAnalyticsSummary = async (filters?: {
    start_date?: string;
    end_date?: string;
    limit?: number;
    page?: number;
}): Promise<{
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
    await simulateDelay();
    
    let filteredEvents = [...mockEvents];
    
    if (filters?.start_date) {
        const startDate = new Date(filters.start_date);
        filteredEvents = filteredEvents.filter(e => new Date(e.created_at) >= startDate);
    }
    
    if (filters?.end_date) {
        const endDate = new Date(filters.end_date);
        endDate.setHours(23, 59, 59, 999);
        filteredEvents = filteredEvents.filter(e => new Date(e.created_at) <= endDate);
    }
    
    // Get unique users
    const uniqueUserIds = new Set(filteredEvents.map(e => e.user_id));
    const activeUsers = Array.from(uniqueUserIds).map(userId => {
        const event = filteredEvents.find(e => e.user_id === userId);
        return {
            id: event?.user?.id || userId,
            name: event?.user?.name || 'Unknown User',
            email: event?.user?.email || 'unknown@shopintel.com',
            role: event?.user?.role || 'STAFF'
        };
    });
    
    return {
        total_events: filteredEvents.length,
        total_users: uniqueUserIds.size,
        active_users: {
            count: uniqueUserIds.size,
            users: activeUsers.slice(0, filters?.limit || 10),
            timeframe: filters?.start_date && filters?.end_date 
                ? `${filters.start_date} to ${filters.end_date}`
                : 'Last 30 days'
        }
    };
};

// Query Keys
export const eventKeys = {
    all: ['events'] as const,
    lists: () => [...eventKeys.all, 'list'] as const,
    list: (filters?: EventFilterParams) => [...eventKeys.lists(), filters] as const,
    details: () => [...eventKeys.all, 'detail'] as const,
    detail: (id: string) => [...eventKeys.details(), id] as const,
    stats: () => [...eventKeys.all, 'stats'] as const,
    statsWithFilters: (filters?: Partial<Pick<EventFilterParams, 'user_id' | 'type' | 'start_date' | 'end_date'>>) => 
        [...eventKeys.stats(), filters] as const,
    analyticsSummary: () => [...eventKeys.all, 'analytics-summary'] as const,
    analyticsSummaryWithFilters: (filters?: { start_date?: string; end_date?: string; limit?: number; page?: number }) => 
        [...eventKeys.analyticsSummary(), filters] as const,
    types: () => [...eventKeys.all, 'types'] as const,
    locations: () => [...eventKeys.all, 'locations'] as const,
};

// Queries
export const useEventsQuery = (filters: EventFilterParams = {}) => {
    return useQuery({
        queryKey: eventKeys.list(filters),
        queryFn: () => getListEvents(filters),
        staleTime: 30000, // 30 seconds
        refetchOnWindowFocus: false,
        retry: false,
    });
};

export const useEventByIdQuery = (id: string | null | undefined) => {
    return useQuery({
        queryKey: eventKeys.detail(id || ''),
        queryFn: async () => {
            if (!id || id.trim() === '') {
                return undefined;
            }
            try {
                return await getEventById(id);
            } catch (error) {
                // Return undefined instead of throwing for missing events
                // This prevents the "Query data cannot be undefined" error
                if (error instanceof Error && error.message.includes('not found')) {
                    return undefined;
                }
                throw error;
            }
        },
        staleTime: 30000, // 30 seconds
        refetchOnWindowFocus: false,
        enabled: !!id && id.trim() !== '',
        retry: (failureCount, error) => {
            // Don't retry for 404 or "not found" errors
            if (error instanceof Error && error.message.includes('not found')) {
                return false;
            }
            return failureCount < 3;
        },
    });
};

export const useEventAnalyticsSummaryQuery = (filters?: {
    start_date?: string;
    end_date?: string;
    limit?: number;
    page?: number;
}) => {
    return useQuery({
        queryKey: eventKeys.analyticsSummaryWithFilters(filters),
        queryFn: () => getEventAnalyticsSummary(filters),
        staleTime: 30000, // 30 seconds
        refetchOnWindowFocus: false,
        retry: false,
    });
};

// Utility for prefetching
export const usePrefetchEvent = () => {
    const queryClient = useQueryClient();

    return {
        prefetchEvent: (id: string) => {
            if (!id || id.trim() === '') {
                return;
            }
            
            // Check if we already have this data cached
            const existingData = queryClient.getQueryData(eventKeys.detail(id));
            if (existingData) {
                return; // Already cached, no need to prefetch
            }
            
            queryClient.prefetchQuery({
                queryKey: eventKeys.detail(id),
                queryFn: async () => {
                    try {
                        return await getEventById(id);
                    } catch (error) {
                        // Don't throw errors in prefetch
                        console.warn(`Failed to prefetch event ${id}:`, error);
                        return undefined;
                    }
                },
                staleTime: 30000,
            });
        },
    };
};