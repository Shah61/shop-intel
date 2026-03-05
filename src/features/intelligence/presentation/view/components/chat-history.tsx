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
    const user_id = 'demo-user-id';

    console.log('ChatHistory Component - user_id:', user_id);
    console.log('ChatHistory Component - currentChatType:', currentChatType);
    console.log('ChatHistory Component - session:', session);

    const { 
        data: roomHistoryResponse, 
        isLoading, 
        error,
        refetch: refetchRooms 
    } = useGetRoomHistory(currentChatType, user_id ?? '');
    
    const { data: chatHistoryResponse } = useGetChatHistory(selectedChatId ?? '');
    const deleteRoomMutation = useDeleteRoom(selectedChatId ?? '');

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleResize = () => {
            setIsSidebarOpen(window.innerWidth >= 768);
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
            toast({ title: "Room deleted", description: "The chat room has been successfully deleted.", duration: 3000 });
        } catch {
            toast({ title: "Error", description: "Failed to delete the chat room. Please try again.", variant: "destructive", duration: 3000 });
        }
    };

    const getTypeIcon = (type: Category) => {
        switch (type) {
            case Category.ASSISTANT: return <Bot className="h-4 w-4" style={{ color: `var(--preset-primary)` }} />;
            case Category.TREND: return <TrendingUp className="h-4 w-4" style={{ color: `var(--preset-primary)` }} />;
            case Category.CONTENT: return <PenTool className="h-4 w-4" style={{ color: `var(--preset-primary)` }} />;
        }
    };

    const getTypeName = (type: Category) => {
        switch (type) {
            case Category.ASSISTANT: return "AI Assistant";
            case Category.TREND: return "Trend Analyzer";
            case Category.CONTENT: return "Content Writer";
        }
    };

    const rooms = roomHistoryResponse?.data?.rooms || [];
    const filteredRooms = rooms.filter((room: Room) => 
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            {/* Mobile Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed left-4 top-4 z-50 md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-md border border-slate-200/60 dark:border-white/[0.06]"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                <ChevronLeft className={`h-4 w-4 transition-transform ${isSidebarOpen ? 'rotate-0' : 'rotate-180'}`} />
            </Button>

            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:relative inset-y-0 left-0
                w-full md:w-[300px]
                bg-white dark:bg-white/[0.02]
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
                z-50 flex flex-col h-full
                border-r border-slate-200/60 dark:border-white/[0.06]
                shadow-sm md:shadow-none overflow-hidden flex-shrink-0
            `}>
                {/* Header */}
                <div className="p-4 border-b border-slate-200/60 dark:border-white/[0.06] flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
                                style={{ background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` }}
                            >
                                <History className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Chat History</h3>
                                <p className="text-xs text-muted-foreground">{getTypeName(currentChatType)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                onClick={onNewChat}
                                size="icon"
                                className="h-7 w-7 text-white shadow-md"
                                style={{ background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` }}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 md:hidden text-muted-foreground"
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>

                    {/* Type Badge */}
                    <Badge
                        className="mb-3 text-xs font-medium px-2 py-0.5 border"
                        style={{
                            background: `rgba(var(--preset-primary-rgb), 0.06)`,
                            color: `var(--preset-primary)`,
                            borderColor: `rgba(var(--preset-primary-rgb), 0.15)`,
                        }}
                    >
                        {getTypeIcon(currentChatType)}
                        <span className="ml-1">{getTypeName(currentChatType)}</span>
                    </Badge>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search conversations..."
                            className="pl-8 h-8 text-xs bg-white dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.08] rounded-lg focus:border-[var(--preset-primary)] focus:ring-1"
                            style={{ '--tw-ring-color': `rgba(var(--preset-primary-rgb), 0.2)` } as React.CSSProperties}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <ScrollArea className="flex-1 h-full">
                        <div className="p-3 space-y-1">
                            {/* Loading */}
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                                    <div className="w-8 h-8 rounded-lg animate-pulse" style={{ background: `rgba(var(--preset-primary-rgb), 0.15)` }} />
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Loading conversations</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Please wait...</p>
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 dark:bg-red-900/30">
                                        <MessageSquare className="h-4 w-4 text-red-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Failed to load</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Check your connection</p>
                                    </div>
                                </div>
                            )}

                            {/* Empty */}
                            {!isLoading && !error && filteredRooms.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `rgba(var(--preset-primary-rgb), 0.08)` }}>
                                        <MessageSquare className="h-4 w-4" style={{ color: `var(--preset-primary)` }} />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {searchTerm ? 'No conversations found' : 'No conversations yet'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {searchTerm ? 'Try a different search term' : 'Start your first conversation'}
                                        </p>
                                        {!searchTerm && (
                                            <Button
                                                onClick={onNewChat}
                                                size="sm"
                                                className="text-white text-xs h-7"
                                                style={{ background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` }}
                                            >
                                                <Plus className="h-3 w-3 mr-1" /> Start New Chat
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Room list */}
                            {!isLoading && !error && filteredRooms.length > 0 && (
                                <div className="space-y-1">
                                    {filteredRooms.map((room: Room) => (
                                        <div
                                            key={room.id}
                                            className={`
                                                cursor-pointer rounded-lg p-2.5 transition-all duration-200 group
                                                border border-transparent
                                                ${selectedChatId === room.id
                                                    ? 'bg-[rgba(var(--preset-primary-rgb),0.06)] border-[rgba(var(--preset-primary-rgb),0.15)]'
                                                    : 'hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                                                }
                                            `}
                                            onClick={() => handleChatSelect(room.id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0 mr-2">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div
                                                            className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                                                            style={{ background: `rgba(var(--preset-primary-rgb), 0.1)` }}
                                                        >
                                                            <div className="scale-75">{getTypeIcon(room.category as Category)}</div>
                                                        </div>
                                                        <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                                                            {room.name}
                                                        </h4>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground pl-7">
                                                        <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                                                        <span className="truncate">
                                                            {new Date(room.updated_at).toLocaleDateString(undefined, {
                                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-md"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <MoreHorizontal className="h-3 w-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.1] shadow-lg rounded-xl">
                                                        <DropdownMenuItem className="rounded-lg text-sm">
                                                            <Edit3 className="h-3.5 w-3.5 mr-2" /> Rename
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={(e) => handleDeleteRoom(room.id, e)}
                                                            disabled={deleteRoomMutation.isPending}
                                                            className="text-red-600 dark:text-red-400 rounded-lg text-sm"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                            {deleteRoomMutation.isPending ? 'Deleting...' : 'Delete'}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-slate-200/60 dark:border-white/[0.06] flex-shrink-0">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                        <span>Powered by Shop-Intel AI</span>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default ChatHistory;
