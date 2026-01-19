import { useMutation, useQuery } from "@tanstack/react-query";
import { getMockBubbleTopKeywords, getMockPersonalBeautyTopMentions } from "../../data/services/mock-ai-api.service";

// Use mock data only (frontend-only project)
const USE_MOCK_AI_DATA = true;

// Mock implementations for chat/room functions
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

const getAllRoomHistory = async (category: string, user_id: string) => {
    await simulateDelay();
    return {
        data: {
            rooms: []
        }
    };
};

const createRoom = async (category: string, user_id: string) => {
    await simulateDelay();
    return {
        data: {
            rooms: {
                id: `mock-room-${Date.now()}`,
                category,
                user_id,
                created_at: new Date().toISOString()
            }
        }
    };
};

const getRoomDetailsById = async (room_id: string) => {
    await simulateDelay();
    return {
        data: {
            rooms: {
                id: room_id,
                category: 'general',
                created_at: new Date().toISOString()
            }
        }
    };
};

const deleteRoom = async (room_id: string) => {
    await simulateDelay();
    return { success: true };
};

const getChatHistory = async (room_id: string) => {
    await simulateDelay();
    return {
        data: {
            chats: []
        }
    };
};

const createChatContent = async (room_id: string, message: string, role: string, category: string, sub_category: string) => {
    await simulateDelay();
    return {
        body: new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder();
                const mockResponse = `Mock AI response to: ${message}`;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'ai_response_chunk', content: mockResponse })}\n\n`));
                controller.close();
            }
        })
    } as Response;
};

const createChatAssistant = async (room_id: string, message: string, role: string) => {
    await simulateDelay();
    return {
        body: new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder();
                const mockResponse = `Mock assistant response to: ${message}`;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'ai_response_chunk', content: mockResponse })}\n\n`));
                controller.close();
            }
        })
    } as Response;
};

const createChatTrending = async (room_id: string, message: string, role: string) => {
    await simulateDelay();
    return {
        body: new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder();
                const mockResponse = `Mock trending response to: ${message}`;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'ai_response_chunk', content: mockResponse })}\n\n`));
                controller.close();
            }
        })
    } as Response;
};

const getCurrentTrend = async () => {
    await simulateDelay();
    return {
        data: {
            trends: []
        }
    };
};

const getMusicTrend = async (params?: {
    start_date?: string;
    end_date?: string;
    popularity?: boolean;
    region?: string;
}) => {
    await simulateDelay();
    // Generate mock songs
    const mockSongs = Array.from({ length: 20 }, (_, i) => ({
        artist_name: `Artist ${i + 1}`,
        country_code: params?.region === 'GLOBAL' ? 'US' : params?.region || 'US',
        cover_image_url: `https://picsum.photos/200/200?random=${i}`,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        current_rank: i + 1,
        popularity_trend: Array.from({ length: 7 }, (_, j) => ({
            date: new Date(Date.now() - (7 - j) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            popularity_score: Math.floor(Math.random() * 100) + 50
        })),
        song_duration_seconds: Math.floor(Math.random() * 180) + 120,
        song_title: `Trending Song ${i + 1}`,
        tiktok_music_link: `https://tiktok.com/music/${i + 1}`
    }));
    
    return {
        success: true,
        count: mockSongs.length,
        songs: mockSongs,
        filters: {
            start_date: params?.start_date || new Date().toISOString().split('T')[0],
            end_date: params?.end_date || new Date().toISOString().split('T')[0],
            region: params?.region || 'GLOBAL',
            popularity_included: params?.popularity || false
        }
    };
};

export const useGetRoomHistory = (category: string, user_id: string) => {
    console.log('TanStack Query - useGetRoomHistory called with:', { category, user_id });
    return useQuery({
        queryKey: ['roomHistory', category, user_id],
        queryFn: () => getAllRoomHistory(category, user_id),
    });
};

export const useCreateRoom = () => {
    return useMutation({
        mutationFn: ({ category, user_id }: { category: string, user_id: string }) => createRoom(category, user_id),
    });
};

export const useGetRoomDetailsById = (room_id: string) => {
    return useQuery({
        queryKey: ['roomDetails', room_id],
        queryFn: () => getRoomDetailsById(room_id),
        enabled: !!room_id,
        retry: 3,
        staleTime: 0, // Always refetch
        refetchOnWindowFocus: false,
    });
};

export const useDeleteRoom = (room_id: string) => {
    return useMutation({
        mutationFn: () => deleteRoom(room_id),
});
};

export const useGetChatHistory = (room_id: string) => {
    return useQuery({
        queryKey: ['chatHistory', room_id],
        queryFn: () => getChatHistory(room_id),
        enabled: !!room_id
    });
};  

export const useCreateChatContent = () => {
    return useMutation({
        mutationFn: ({ room_id, message, role, category, sub_category }: { room_id: string, message: string, role: string, category: string, sub_category: string }) => 
            createChatContent(room_id, message, role, category, sub_category),
    });
};

export const useCreateChatAssistant = () => {
    return useMutation({
        mutationFn: ({ room_id, message, role }: { room_id: string, message: string, role: string }) => 
            createChatAssistant(room_id, message, role),
    });
};

export const useCreateChatTrending = () => {
    return useMutation({
        mutationFn: ({ room_id, message, role }: { room_id: string, message: string, role: string }) => 
            createChatTrending(room_id, message, role),
    });
};



export const useMusicTrend = (params?: {
    start_date?: string;
    end_date?: string;
    popularity?: boolean;
    region?: string;
}) => {
    return useQuery({
        queryKey: ['music-trend', params],
        queryFn: () => getMusicTrend(params),
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        refetchOnWindowFocus: false,
        retry: 3,
    });
}; 

export const useGetCurrentTrend = () => {
    return useQuery({
        queryKey: ['currentTrend'],
        queryFn: getCurrentTrend,
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 2, // 2 hours
    });
};

export const useBeautyTopKeywords = (params?: {
    start_date?: string;
    end_date?: string;
}) => {
    return useQuery({
        queryKey: ['bubbleTopKeywords', params],
        queryFn: () => getMockBubbleTopKeywords(params),
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 2, // 2 hours
        refetchOnWindowFocus: false,
        retry: 3,
    });
};

export const usePersonalBeautyTopMentions = (params?: {
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
}) => {
    return useQuery({
        queryKey: ['personalBeautyTopMentions', params],
        queryFn: () => getMockPersonalBeautyTopMentions(params || {}),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 3,
    });
};