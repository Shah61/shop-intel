"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    User, 
    Sparkles, 
    MessageCircle, 
    TrendingUp,
    BarChart3,
    Target,
    ArrowUp,
    Music
} from 'lucide-react';
import ChatHistory from './chat-history';
import MusicScreen from '../screen/music-screen';
import TrendCard from './trend-card';
import TrendingTopicsclothing from './trending-topics-chocolate';
import { Category, Chat, Message } from '../../../data/model/ai-model';
import { useCreateChatTrending, useCreateRoom } from '../../tanstack/ai-tanstack';
import { useMusicTrend, useGetCurrentTrend } from '../../tanstack/ai-tanstack';
import Markdown from '../../../../../components/ui/markdown';
// Auth removed - using dummy user_id
import TopTrendingVideos from './top-trending-videos';
import SocialContentAnalysis from './social-content-analysis';

const AITrend: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [activeTab, setActiveTab] = useState<'ai' | 'music' | 'trend' | 'topvideo' | 'content'>('topvideo');
    const [selectedChannelForContent, setSelectedChannelForContent] = useState<string | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const prevChatsRef = useRef<string>('');
    // Use dummy user_id - no auth needed
    const user_id = 'demo-user-id';

    const createChatTrendingMutation = useCreateChatTrending();
    const createRoomMutation = useCreateRoom();
    const { data: musicTrendData } = useMusicTrend();
    const { data: trendData, isLoading: trendLoading, error: trendError } = useGetCurrentTrend();

    const suggestedPrompts = [
        "What are the top clothing trends for 2024?",
        "Which clothing techniques are gaining popularity?",
        "Analyze artisanal vs commercial clothing trends",
        "What's trending in premium clothing products?",
        "Show me emerging sustainable clothing trends",
        "What are consumers looking for in clothing experiences?"
    ];



    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSelectChat = (roomId: string, chats: Chat[]) => {
        // Don't update if we're already showing these messages
        const chatKey = `${roomId}-${JSON.stringify(chats)}`;
        if (chatKey === prevChatsRef.current) {
            return;
        }
        prevChatsRef.current = chatKey;

        setCurrentRoomId(roomId);
        
        // Automatically switch to the 'ai' tab when a chat is selected
        setActiveTab('ai');
        
        if (chats && Array.isArray(chats) && chats.length > 0) {
            const formattedMessages: Message[] = chats.map(chat => ({
                id: chat.id,
                content: chat.message || '', // Ensure content is never undefined
                sender: chat.role === 'USER' ? 'user' : 'ai' as const,
                timestamp: new Date(chat.created_at),
            }));
            
            setMessages(formattedMessages);
        } else {
            setMessages([]);
        }
    };

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: content.trim(),
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Create a temporary message for the AI response
        const tempAiMessageId = (Date.now() + 1).toString();
        const tempAiMessage: Message = {
            id: tempAiMessageId,
            content: '',
            sender: 'ai',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, tempAiMessage]);

        try {
            let roomId = currentRoomId;
            
            // If no room exists, create one first
            if (!roomId) {
                if (!user_id) {
                    throw new Error('User ID is required to create a room');
                }
                const roomData = await createRoomMutation.mutateAsync({
                    category: Category.TREND,
                    user_id: user_id
                });
                roomId = roomData.data.rooms.id;
                setCurrentRoomId(roomId);
            }

            // Use the createChatTrending service to get streaming response
            if (!roomId) {
                throw new Error('Failed to get or create room ID');
            }
            
            const response = await createChatTrendingMutation.mutateAsync({
                room_id: roomId,
                message: content.trim(),
                role: 'USER'
            });
            
            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Failed to get response reader');
            }

            let accumulatedContent = '';
            let actualMessageId = tempAiMessageId;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Convert the chunk to text
                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n').filter((line: string) => line.trim());

                for (const line of lines) {
                    try {
                        // Remove any potential "data: " prefix and clean the line
                        let jsonStr = line.replace(/^data:\s*/, '').trim();
                        if (!jsonStr || jsonStr === '[DONE]') continue;

                        const data = JSON.parse(jsonStr);
                        
                        switch (data.type) {
                            case 'chat_created':
                                // Update the message ID with the one from the server
                                actualMessageId = data.data.chat.id;
                                setMessages(prev => prev.map(msg => 
                                    msg.id === tempAiMessageId 
                                        ? { ...msg, id: actualMessageId }
                                        : msg
                                ));
                                break;

                            case 'ai_response_chunk':
                                if (data.content) {
                                    accumulatedContent += data.content;
                                    // Update the AI message content with accumulated chunks in real-time
                                    setMessages(prev => prev.map(msg => 
                                        msg.id === actualMessageId 
                                            ? { ...msg, content: accumulatedContent }
                                            : msg
                                    ));
                                }
                                break;

                            case 'response_complete':
                                // Mark as complete
                                setIsTyping(false);
                                break;
                        }
                    } catch (error) {
                        // Log parsing errors but continue processing
                    }
                }
            }
        } catch (error) {
            // Remove the temporary message and add error message
            setMessages(prev => prev.filter(msg => msg.id !== tempAiMessageId));
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                content: 'Sorry, there was an error processing your request. Please try again.',
                sender: 'ai',
                timestamp: new Date(),
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSuggestedPrompt = (prompt: string) => {
        handleSendMessage(prompt);
    };



    const handleNewChat = () => {
        setMessages([]);
        setCurrentRoomId(null);
        setInputValue('');
        setIsTyping(false);
        prevChatsRef.current = '';
        // Automatically switch to the 'ai' tab when starting a new chat
        setActiveTab('ai');
    };

    const handleChannelClick = (channelId: string) => {
        setSelectedChannelForContent(channelId);
        setActiveTab('content');
    };

    const tabItems = [
        { key: 'ai' as const, label: 'Chat', icon: Sparkles },
        { key: 'music' as const, label: 'Music', icon: Music },
        { key: 'trend' as const, label: 'Topics', icon: BarChart3 },
        { key: 'topvideo' as const, label: 'Charts', icon: TrendingUp },
        { key: 'content' as const, label: 'Content', icon: Target },
    ];

    const tabTitles: Record<string, string> = {
        ai: 'AI Trend Analyzer',
        music: 'Trending Music',
        trend: 'Trending Topics',
        topvideo: 'Social Trend Charts',
        content: 'Content Analysis',
    };

    const tabSubtitles: Record<string, string> = {
        ai: 'Trend Expert',
        music: `Current Week · ${musicTrendData?.songs?.length || 0} tracks`,
        trend: 'Clothing & Selling Trends',
        topvideo: 'Channel Analytics & Rankings',
        content: 'Video Content Explorer',
    };

    return (
        <div className="flex h-full bg-transparent">
            {/* Chat History Sidebar */}
            <div className="flex-shrink-0">
                <ChatHistory 
                    currentChatType={Category.TREND}
                    onNewChat={handleNewChat}
                    onSelectChat={handleSelectChat}
                />
            </div>

            {/* Main Chat Area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-2 md:gap-4 p-2 sm:p-3 md:p-6 border-b border-slate-200/50 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] backdrop-blur-sm flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden h-8 w-8 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                const event = new CustomEvent('toggleChatHistory');
                                window.dispatchEvent(event);
                            }
                        }}
                    >
                        <MessageCircle className="h-4 w-4" />
                    </Button>
                    
                    <div className="relative">
                        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 md:h-11 md:w-11 border-2 border-white dark:border-white/10 shadow-md">
                            <AvatarImage src="/api/placeholder/48/48" alt="Shop-Intel AI Trend" />
                            <AvatarFallback
                                className="text-white text-sm md:text-lg font-bold"
                                style={{ background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` }}
                            >
                                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-black"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                            {tabTitles[activeTab]}
                        </h3>
                        <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            <span className="hidden sm:inline">Online · </span>
                            {tabSubtitles[activeTab]}
                        </p>
                    </div>
                    <div className="flex-shrink-0 flex gap-1.5">
                        {tabItems.map((tab) => {
                            const isActive = activeTab === tab.key;
                            const Icon = tab.icon;
                            return (
                                <Button
                                    key={tab.key}
                                    variant="default"
                                    size="sm"
                                    className="h-7 text-[8px] sm:text-[10px] md:text-xs font-medium px-2 py-0 rounded-lg transition-all duration-200 border"
                                    style={isActive ? {
                                        background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))`,
                                        color: '#fff',
                                        borderColor: 'transparent',
                                    } : {
                                        background: `rgba(var(--preset-primary-rgb), 0.06)`,
                                        color: `var(--preset-primary)`,
                                        borderColor: `rgba(var(--preset-primary-rgb), 0.15)`,
                                    }}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    <Icon className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 sm:mr-1" />
                                    {tab.label}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'ai' && (
                    <>
                        {messages.length === 0 && (
                            <ScrollArea className="flex-1 min-h-0 overflow-hidden">
                                <div className="p-3 sm:p-4 md:p-6 space-y-3 md:space-y-4">
                                <Card className="bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
                                    <CardContent className="p-4 md:p-5">
                                        <div className="flex items-start gap-3 md:gap-4">
                                            <div
                                                className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
                                                style={{ background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` }}
                                            >
                                                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                                                    Welcome to Trend Analyzer
                                                </h3>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    Your trend expert analyzing market movements, emerging techniques, 
                                                    consumer preferences, and industry innovations.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="space-y-2.5 md:space-y-3">
                                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <MessageCircle className="w-3.5 h-3.5" style={{ color: `var(--preset-primary)` }} />
                                        Try asking me
                                    </h4>
                                    <div className="grid gap-2">
                                        {suggestedPrompts.slice(0, 3).map((prompt, index) => (
                                            <Button
                                                key={index}
                                                variant="ghost"
                                                className="justify-start h-auto p-3 text-left bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] rounded-xl transition-all duration-200 hover:shadow-sm"
                                                onClick={() => handleSuggestedPrompt(prompt)}
                                            >
                                                <MessageCircle className="h-3.5 w-3.5 mr-2.5 flex-shrink-0" style={{ color: `rgba(var(--preset-primary-rgb), 0.5)` }} />
                                                <span className="text-[11px] md:text-xs text-slate-600 dark:text-slate-400 leading-tight">{prompt}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                </div>
                            </ScrollArea>
                        )}

                        {messages.length > 0 && (
                            <ScrollArea className="flex-1 p-3 md:p-6 overflow-hidden min-h-0" ref={scrollAreaRef}>
                                <div className="space-y-4 md:space-y-6">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex gap-2 md:gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {message.sender === 'ai' && (
                                                <Avatar className="h-6 w-6 md:h-8 md:w-8 border border-slate-200 dark:border-white/10 shadow-sm flex-shrink-0">
                                                    <AvatarFallback
                                                        className="text-white"
                                                        style={{ background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` }}
                                                    >
                                                        <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                            
                                            <div className={`max-w-[85%] md:max-w-[75%] ${message.sender === 'user' ? 'order-1' : ''}`}>
                                                <Card className={`${
                                                    message.sender === 'user' 
                                                        ? 'text-white border-transparent' 
                                                        : 'bg-white dark:bg-white/[0.03] border-slate-200/60 dark:border-white/[0.06]'
                                                } shadow-sm rounded-2xl overflow-hidden`}
                                                    style={message.sender === 'user' ? { background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` } : undefined}
                                                >
                                                    <CardContent className="p-3 md:p-4">
                                                        {message.sender === 'user' ? (
                                                            <div className="text-xs md:text-sm leading-relaxed">
                                                                {message.content}
                                                            </div>
                                                        ) : (
                                                            <Markdown content={message.content || ''} className="text-xs md:text-sm leading-relaxed" />
                                                        )}
                                                    </CardContent>
                                                </Card>
                                                <p className={`text-[10px] md:text-xs text-muted-foreground mt-1.5 px-1 ${
                                                    message.sender === 'user' ? 'text-right' : 'text-left'
                                                }`}>
                                                    {message.timestamp.toLocaleTimeString([], { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </p>
                                            </div>

                                            {message.sender === 'user' && (
                                                <Avatar className="h-6 w-6 md:h-8 md:w-8 border border-slate-200 dark:border-white/10 shadow-sm flex-shrink-0">
                                                    <AvatarFallback className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                                                        <User className="h-3 w-3 md:h-4 md:w-4" />
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}

                        {/* Input */}
                        <div className="p-2.5 md:p-4 border-t border-slate-200/50 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] backdrop-blur-sm flex-shrink-0">
                            <div className="flex gap-2 md:gap-3">
                                <div className="relative flex-1">
                                    <Input
                                        ref={inputRef}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Ask me about trends and market insights..."
                                        className="h-10 md:h-12 pl-3 md:pl-4 pr-4 text-sm bg-white dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.08] rounded-xl shadow-sm focus:ring-2 transition-all duration-200"
                                        style={{ '--tw-ring-color': `rgba(var(--preset-primary-rgb), 0.2)` } as React.CSSProperties}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(inputValue);
                                            }
                                        }}
                                        disabled={isTyping}
                                    />
                                </div>
                                <Button 
                                    onClick={() => handleSendMessage(inputValue)}
                                    disabled={!inputValue.trim() || isTyping}
                                    className="h-10 w-10 md:h-12 md:w-12 text-white rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                    style={{ background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` }}
                                >
                                    <ArrowUp className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-[10px] md:text-xs text-muted-foreground mt-2 text-center">
                                Trend Analyzer provides insights based on market data and trends.
                            </p>
                        </div>
                    </>
                )}

                {activeTab === 'music' && (
                    <div className="flex-1 min-h-0 overflow-auto">
                        {(musicTrendData && musicTrendData.songs && musicTrendData.songs.length > 0) ? (
                            <MusicScreen />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md mb-4"
                                    style={{ background: `rgba(var(--preset-primary-rgb), 0.1)` }}
                                >
                                    <Music className="w-6 h-6" style={{ color: `var(--preset-primary)` }} />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Music Trends Under Construction</h2>
                                <p className="text-sm text-muted-foreground">Check back soon for the hottest trending tracks!</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'trend' && (
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <div className="h-full overflow-y-auto overflow-x-hidden">
                            <div className="p-4 md:p-6">
                                <TrendingTopicsclothing />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'topvideo' && (
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <TopTrendingVideos onChannelClick={handleChannelClick} />
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <SocialContentAnalysis />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AITrend;