"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    MessageSquare, 
    Plus, 
    Search,
    Clock,
    Bot,
    TrendingUp,
    PenTool,
    MoreHorizontal,
    Trash2,
    Edit3,
    ChevronLeft,
    X,
    Sparkles,
    History
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetRoomHistory, useDeleteRoom, useGetChatHistory } from '../../tanstack/ai-tanstack';
import { Category, Chat, Room } from '../../../data/model/ai-model';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/src/core/lib/dummy-session-provider';
import type { MouseEvent } from 'react';
// Auth removed - using dummy user_id

interface ChatHistoryProps {
    currentChatType: Category;
    onNewChat: () => void;
    onSelectChat?: (roomId: string, chats: Chat[]) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ 
    currentChatType, 
    onNewChat, 
    onSelectChat
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const prevChatsRef = useRef<string>('');
    const { toast } = useToast();
    const { data: session } = useSession();
    // Use dummy user_id - no auth needed
    const user_id = 'demo-user-id';

    // Add console log to see the user_id
    console.log('ChatHistory Component - user_id:', user_id);
    console.log('ChatHistory Component - currentChatType:', currentChatType);
    console.log('ChatHistory Component - session:', session);

    // Fetch room history using the API
    const { 
        data: roomHistoryResponse, 
        isLoading, 
        error,
        refetch: refetchRooms 
    } = useGetRoomHistory(currentChatType, user_id ?? '');
    
    const { data: chatHistoryResponse } = useGetChatHistory(selectedChatId ?? '');
    const deleteRoomMutation = useDeleteRoom(selectedChatId ?? '');

    // Set sidebar open by default on desktop
    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        const handleToggleChatHistory = () => {
            setIsSidebarOpen(prev => !prev);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('toggleChatHistory', handleToggleChatHistory);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('toggleChatHistory', handleToggleChatHistory);
        };
    }, []);

    // Watch for room details changes
    useEffect(() => {
        if (!selectedChatId || !chatHistoryResponse?.data) {
            return;
        }

        // Get chats array from the response
        const chats = chatHistoryResponse.data.chats || [];
        const chatKey = `${selectedChatId}-${JSON.stringify(chats)}`;
        
        if (chatKey !== prevChatsRef.current) {
            prevChatsRef.current = chatKey;
            onSelectChat?.(selectedChatId, chats);
        }
    }, [selectedChatId, chatHistoryResponse, onSelectChat]);

    const handleChatSelect = (roomId: string) => {
        if (roomId === selectedChatId) {
            return;
        }
        setSelectedChatId(roomId);
        // Check if window exists before using it
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    const handleDeleteRoom = async (roomId: string, event: MouseEvent) => {
        event.stopPropagation();
        
        try {
            await deleteRoomMutation.mutateAsync();
            
            if (roomId === selectedChatId) {
                setSelectedChatId(null);
                onNewChat();
            }
            
            await refetchRooms();
            
            toast({
                title: "Room deleted",
                description: "The chat room has been successfully deleted.",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete the chat room. Please try again.",
                variant: "destructive",
                duration: 3000,
            });
        }
    };

    const getTypeIcon = (type: Category) => {
        switch (type) {
            case Category.ASSISTANT:
                return <Bot className="h-4 w-4 text-blue-500" />;
            case Category.TREND:
                return <TrendingUp className="h-4 w-4 text-green-500" />;
            case Category.CONTENT:
                return <PenTool className="h-4 w-4 text-purple-500" />;
        }
    };

    const getTypeColor = (type: Category) => {
        switch (type) {
            case Category.ASSISTANT:
                return "from-blue-500/10 to-indigo-500/10 border-blue-200 dark:border-blue-800";
            case Category.TREND:
                return "from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-800";
            case Category.CONTENT:
                return "from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800";
        }
    };

    const getTypeName = (type: Category) => {
        switch (type) {
            case Category.ASSISTANT:
                return "AI Assistant";
            case Category.TREND:
                return "Trend Analyzer";
            case Category.CONTENT:
                return "Content Writer";
        }
    };

    const rooms = roomHistoryResponse?.data?.rooms || [];
    const filteredRooms = rooms.filter((room: Room) => 
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            {/* Mobile Toggle Button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed left-4 top-4 z-50 md:hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                <ChevronLeft className={`h-4 w-4 transition-transform ${isSidebarOpen ? 'rotate-0' : 'rotate-180'}`} />
            </Button>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:relative
                inset-y-0 left-0
                w-full md:w-[320px]
                bg-white/70 dark:bg-black/70
                backdrop-blur-xl
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
                z-50
                flex flex-col
                h-full
                border-r border-slate-200/50 dark:border-slate-700/50
                shadow-2xl md:shadow-none
                overflow-hidden
                flex-shrink-0
            `}>
                {/* Header */}
                <div className="p-4 pl-8 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-white/50 to-slate-50/50 dark:from-black/50 dark:to-black/50 flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-200 dark:to-slate-300 rounded-lg flex items-center justify-center shadow-lg">
                                    <History className="w-4 h-4 text-white dark:text-slate-900" />
                                </div>
                                <div className="absolute -inset-1 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-lg blur opacity-75"></div>
                            </div>
                            <div>
                                <h3 className="text-base font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                                    Chat History
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                    {getTypeName(currentChatType)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button 
                                onClick={onNewChat}
                                size="icon" 
                                className="h-8 w-8 bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 md:hidden text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                    
                    {/* Current Type Badge */}
                    <div className="mb-3">
                        <Badge className={`bg-gradient-to-r ${getTypeColor(currentChatType)} text-slate-700 dark:text-slate-300 border font-medium px-2 py-1 text-xs`}>
                            {getTypeIcon(currentChatType)}
                            <span className="ml-1">{getTypeName(currentChatType)}</span>
                        </Badge>
                    </div>
                    
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            placeholder="Search conversations..."
                            className="pl-8 h-9 text-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200/50 dark:border-slate-700/50 rounded-lg shadow-lg focus:border-slate-400 dark:focus:border-slate-500 focus:ring-2 focus:ring-slate-400/20 dark:focus:ring-slate-500/20 transition-all duration-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <ScrollArea className="flex-1 h-full">
                        <div className="px-4 pl-8 py-3">
                            {/* Loading State */}
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg animate-pulse"></div>
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg blur animate-pulse"></div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Loading conversations</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please wait a moment...</p>
                                    </div>
                                </div>
                            )}

                            {/* Error State */}
                            {error && (
                                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                                            <MessageSquare className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="absolute -inset-1 bg-gradient-to-br from-red-500/30 to-red-600/30 rounded-lg blur opacity-75"></div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Failed to load</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Check your connection</p>
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {!isLoading && !error && filteredRooms.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg flex items-center justify-center shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                                            <MessageSquare className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <div className="absolute -inset-1 bg-gradient-to-br from-slate-500/10 to-slate-600/10 rounded-lg blur opacity-75"></div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <div>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {searchTerm ? 'No conversations found' : 'No conversations yet'}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                {searchTerm ? 'Try a different search term' : 'Start your first conversation'}
                                            </p>
                                        </div>
                                        {!searchTerm && (
                                            <Button 
                                                onClick={onNewChat}
                                                size="sm"
                                                className="bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Start New Chat
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Chat List */}
                            {!isLoading && !error && filteredRooms.length > 0 && (
                                <div className="space-y-1.5 max-w-[280px] mx-auto">
                                    {filteredRooms.map((room: Room) => (
                                        <Card 
                                            key={room.id}
                                            className={`
                                                cursor-pointer transition-all duration-300
                                                hover:shadow-lg hover:scale-[1.01]
                                                bg-white/80 dark:bg-black/80 backdrop-blur-sm
                                                border border-slate-200/50 dark:border-slate-700/50
                                                rounded-lg overflow-hidden
                                                ${selectedChatId === room.id 
                                                    ? `ring-2 bg-gradient-to-r ${getTypeColor(room.category as Category)} shadow-lg` 
                                                    : 'hover:border-slate-300 dark:hover:border-slate-600'
                                                }
                                            `}
                                            onClick={() => handleChatSelect(room.id)}
                                        >
                                            <CardContent className="p-2.5">
                                                <div className="flex items-start justify-between group">
                                                    <div className="flex-1 min-w-0 mr-2">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <div className="relative">
                                                                <div className={`w-6 h-6 rounded-md flex items-center justify-center bg-gradient-to-br ${getTypeColor(room.category as Category)}`}>
                                                                    <div className="scale-75">
                                                                        {getTypeIcon(room.category as Category)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                                                                    {room.name}
                                                                </h4>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                            <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                                                            <span className="truncate text-xs">
                                                                {new Date(room.updated_at).toLocaleDateString(undefined, {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-md"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <MoreHorizontal className="h-3 w-3" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-white/95 dark:bg-black/95 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-xl rounded-xl">
                                                            <DropdownMenuItem className="hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg">
                                                                <Edit3 className="h-4 w-4 mr-2" />
                                                                Rename
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={(e) => handleDeleteRoom(room.id, e)}
                                                                disabled={deleteRoomMutation.isPending}
                                                                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                {deleteRoomMutation.isPending ? 'Deleting...' : 'Delete'}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer */}
                <div className="p-3 pl-8 border-t border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-white/50 to-slate-50/50 dark:from-black/50 dark:to-black/50 flex-shrink-0">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Sparkles className="h-3 w-3" />
                            <span>Powered by Shop-Intel AI</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default ChatHistory;
