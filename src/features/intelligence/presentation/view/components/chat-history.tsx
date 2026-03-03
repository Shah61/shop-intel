"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    Plus,
    Search,
    Clock,
    MoreHorizontal,
    Trash2,
    Edit3,
    X,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetRoomHistory, useDeleteRoom, useGetChatHistory } from '../../tanstack/ai-tanstack';
import { Category, Chat, Room } from '../../../data/model/ai-model';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/src/core/lib/dummy-session-provider';
import type { MouseEvent } from 'react';

interface ChatHistoryProps {
    currentChatType: Category;
    onNewChat: () => void;
    onSelectChat?: (roomId: string, chats: Chat[]) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
    currentChatType,
    onNewChat,
    onSelectChat,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const prevChatsRef = useRef<string>('');
    const { toast } = useToast();
    const { data: session } = useSession();
    const user_id = 'demo-user-id';

    const {
        data: roomHistoryResponse,
        isLoading,
        error,
        refetch: refetchRooms,
    } = useGetRoomHistory(currentChatType, user_id ?? '');

    const { data: chatHistoryResponse } = useGetChatHistory(selectedChatId ?? '');
    const deleteRoomMutation = useDeleteRoom(selectedChatId ?? '');

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleResize = () => setIsSidebarOpen(window.innerWidth >= 768);
        const handleToggle = () => setIsSidebarOpen((p) => !p);
        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('toggleChatHistory', handleToggle);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('toggleChatHistory', handleToggle);
        };
    }, []);

    useEffect(() => {
        if (!selectedChatId || !chatHistoryResponse?.data) return;
        const chats = chatHistoryResponse.data.chats || [];
        const chatKey = `${selectedChatId}-${JSON.stringify(chats)}`;
        if (chatKey !== prevChatsRef.current) {
            prevChatsRef.current = chatKey;
            onSelectChat?.(selectedChatId, chats);
        }
    }, [selectedChatId, chatHistoryResponse, onSelectChat]);

    const handleChatSelect = (roomId: string) => {
        if (roomId === selectedChatId) return;
        setSelectedChatId(roomId);
        if (typeof window !== 'undefined' && window.innerWidth < 768) setIsSidebarOpen(false);
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
            toast({ title: "Deleted", description: "Chat room removed.", duration: 2000 });
        } catch {
            toast({ title: "Error", description: "Failed to delete.", variant: "destructive", duration: 2000 });
        }
    };

    const rooms = roomHistoryResponse?.data?.rooms || [];
    const filteredRooms = rooms.filter((room: Room) =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:relative inset-y-0 left-0
                w-72 md:w-64
                bg-white dark:bg-card
                border-r border-border
                transform transition-transform duration-200 ease-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
                z-50 flex flex-col h-full shrink-0
            `}>
                {/* Header */}
                <div className="p-3 border-b border-border shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold">History</span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={onNewChat}
                                className="h-7 w-7 rounded-lg flex items-center justify-center bg-foreground text-background hover:opacity-90 transition-opacity"
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </button>
                            <button
                                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent md:hidden"
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                            placeholder="Search..."
                            className="w-full h-8 pl-8 pr-3 text-sm rounded-lg border border-border bg-transparent focus:outline-none focus:ring-2 focus:ring-ring/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto min-h-0 py-1">
                    {isLoading && (
                        <div className="p-6 text-center">
                            <div className="h-8 w-8 mx-auto mb-2 rounded-lg bg-muted animate-pulse" />
                            <p className="text-xs text-muted-foreground">Loading...</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-6 text-center">
                            <MessageSquare className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Failed to load</p>
                        </div>
                    )}

                    {!isLoading && !error && filteredRooms.length === 0 && (
                        <div className="p-6 text-center">
                            <MessageSquare className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm font-medium">{searchTerm ? 'No results' : 'No chats yet'}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {searchTerm ? 'Try a different term' : 'Start a new conversation'}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={onNewChat}
                                    className="mt-3 px-3 py-1.5 text-xs font-medium rounded-lg bg-foreground text-background hover:opacity-90"
                                >
                                    <Plus className="h-3 w-3 inline mr-1" />
                                    New Chat
                                </button>
                            )}
                        </div>
                    )}

                    {!isLoading && !error && filteredRooms.length > 0 && (
                        <div className="px-2 space-y-0.5">
                            {filteredRooms.map((room: Room) => (
                                <div
                                    key={room.id}
                                    onClick={() => handleChatSelect(room.id)}
                                    className={`
                                        group flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors
                                        ${selectedChatId === room.id
                                            ? 'bg-accent text-foreground'
                                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                                        }
                                    `}
                                >
                                    <MessageSquare className="h-4 w-4 shrink-0 opacity-50" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-medium truncate">{room.name}</p>
                                        <p className="text-[11px] opacity-60 flex items-center gap-1 mt-0.5">
                                            <Clock className="h-2.5 w-2.5" />
                                            {new Date(room.updated_at).toLocaleDateString(undefined, {
                                                month: 'short', day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className="h-6 w-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-accent transition-all shrink-0"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MoreHorizontal className="h-3.5 w-3.5" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="min-w-[120px]">
                                            <DropdownMenuItem>
                                                <Edit3 className="h-3.5 w-3.5 mr-2" />
                                                Rename
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={(e) => handleDeleteRoom(room.id, e)}
                                                disabled={deleteRoomMutation.isPending}
                                                className="text-red-600 dark:text-red-400"
                                            >
                                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                {deleteRoomMutation.isPending ? 'Deleting...' : 'Delete'}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default ChatHistory;
