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
    Music,
    MessageSquare
} from 'lucide-react';
import ChatHistory from './chat-history';
import MusicScreen from '../screen/music-screen';
import TrendingTopicsclothing from './trending-topics-chocolate';
import { Category, Chat, Message } from '../../../data/model/ai-model';
import { useCreateChatTrending, useCreateRoom } from '../../tanstack/ai-tanstack';
import { useMusicTrend, useGetCurrentTrend } from '../../tanstack/ai-tanstack';
import Markdown from '../../../../../components/ui/markdown';
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
        const chatKey = `${roomId}-${JSON.stringify(chats)}`;
        if (chatKey === prevChatsRef.current) return;
        prevChatsRef.current = chatKey;
        setCurrentRoomId(roomId);
        setActiveTab('ai');
        if (chats && Array.isArray(chats) && chats.length > 0) {
            setMessages(chats.map(chat => ({
                id: chat.id,
                content: chat.message || '',
                sender: chat.role === 'USER' ? 'user' : 'ai' as const,
                timestamp: new Date(chat.created_at),
            })));
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

        const tempAiMessageId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: tempAiMessageId, content: '', sender: 'ai', timestamp: new Date() }]);

        try {
            let roomId = currentRoomId;
            if (!roomId) {
                if (!user_id) throw new Error('User ID is required to create a room');
                const roomData = await createRoomMutation.mutateAsync({ category: Category.TREND, user_id });
                roomId = roomData.data.rooms.id;
                setCurrentRoomId(roomId);
            }
            if (!roomId) throw new Error('Failed to get or create room ID');

            const response = await createChatTrendingMutation.mutateAsync({
                room_id: roomId,
                message: content.trim(),
                role: 'USER'
            });

            const reader = response.body?.getReader();
            if (!reader) throw new Error('Failed to get response reader');

            let accumulatedContent = '';
            let actualMessageId = tempAiMessageId;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n').filter((line: string) => line.trim());
                for (const line of lines) {
                    try {
                        let jsonStr = line.replace(/^data:\s*/, '').trim();
                        if (!jsonStr || jsonStr === '[DONE]') continue;
                        const data = JSON.parse(jsonStr);
                        switch (data.type) {
                            case 'chat_created':
                                actualMessageId = data.data.chat.id;
                                setMessages(prev => prev.map(msg => msg.id === tempAiMessageId ? { ...msg, id: actualMessageId } : msg));
                                break;
                            case 'ai_response_chunk':
                                if (data.content) {
                                    accumulatedContent += data.content;
                                    setMessages(prev => prev.map(msg => msg.id === actualMessageId ? { ...msg, content: accumulatedContent } : msg));
                                }
                                break;
                            case 'response_complete':
                                setIsTyping(false);
                                break;
                        }
                    } catch (error) { /* skip parse errors */ }
                }
            }
        } catch (error) {
            setMessages(prev => prev.filter(msg => msg.id !== tempAiMessageId));
            setMessages(prev => [...prev, { id: Date.now().toString(), content: 'Sorry, there was an error processing your request. Please try again.', sender: 'ai', timestamp: new Date() }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleNewChat = () => {
        setMessages([]);
        setCurrentRoomId(null);
        setInputValue('');
        setIsTyping(false);
        prevChatsRef.current = '';
        setActiveTab('ai');
    };

    const handleChannelClick = (channelId: string) => {
        setSelectedChannelForContent(channelId);
        setActiveTab('content');
    };

    const tabItems = [
        { key: 'topvideo' as const, label: 'Charts', icon: TrendingUp },
        { key: 'trend' as const, label: 'Topics', icon: BarChart3 },
        { key: 'content' as const, label: 'Content', icon: Target },
        { key: 'music' as const, label: 'Music', icon: Music },
        { key: 'ai' as const, label: 'Chat', icon: Sparkles },
    ];

    const tabDescriptions: Record<string, string> = {
        topvideo: 'Channel analytics, rankings, and trending video insights',
        trend: 'Discover trending topics and emerging market patterns',
        content: 'Explore and analyze social media video content',
        music: 'Current trending music and audio tracks',
        ai: 'Chat with AI about trends and market insights',
    };

    // Chat layout for AI tab - full height & width
    if (activeTab === 'ai') {
        return (
            <div className="flex w-full h-full min-h-0 overflow-hidden">
                <div className="flex-shrink-0 h-full">
                    <ChatHistory
                        currentChatType={Category.TREND}
                        onNewChat={handleNewChat}
                        onSelectChat={handleSelectChat}
                    />
                </div>
                <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
                    {/* Chat Header */}
                    <div className="flex items-center gap-2 md:gap-4 p-2 sm:p-3 md:p-5 border-b border-slate-200/50 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden h-8 w-8 text-slate-600 dark:text-slate-400"
                            onClick={() => { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('toggleChatHistory')); }}
                        >
                            <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-white dark:border-white/10 shadow-sm">
                            <AvatarFallback className="text-white font-bold" style={{ background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` }}>
                                <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100">Trend Analyzer</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                Online · Trend Expert
                            </p>
                        </div>
                        <div className="flex gap-1.5">
                            {tabItems.map((tab) => {
                                const isActive = activeTab === tab.key;
                                const Icon = tab.icon;
                                return (
                                    <Button key={tab.key} variant="ghost" size="sm"
                                        className="h-7 text-[10px] md:text-xs font-medium px-2 rounded-lg border transition-all duration-200"
                                        style={isActive ? { background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))`, color: '#fff', borderColor: 'transparent' } : { background: `rgba(var(--preset-primary-rgb), 0.06)`, color: `var(--preset-primary)`, borderColor: `rgba(var(--preset-primary-rgb), 0.15)` }}
                                        onClick={() => setActiveTab(tab.key)}
                                    >
                                        <Icon className="h-3 w-3 mr-1" />{tab.label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    {messages.length === 0 && (
                        <ScrollArea className="flex-1 min-h-0 overflow-hidden">
                            <div className="p-4 md:p-6 space-y-4">
                                <Card className="bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
                                    <CardContent className="p-4 md:p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md flex-shrink-0" style={{ background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` }}>
                                                <TrendingUp className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Welcome to Trend Analyzer</h3>
                                                <p className="text-xs text-muted-foreground">Your trend expert for market movements, emerging patterns, and industry insights.</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <div className="space-y-2.5">
                                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <MessageCircle className="w-3.5 h-3.5" style={{ color: `var(--preset-primary)` }} />
                                        Try asking me
                                    </h4>
                                    <div className="grid gap-2">
                                        {suggestedPrompts.slice(0, 3).map((prompt, index) => (
                                            <Button key={index} variant="ghost"
                                                className="justify-start h-auto p-3 text-left bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] rounded-xl"
                                                onClick={() => handleSendMessage(prompt)}
                                            >
                                                <MessageCircle className="h-3.5 w-3.5 mr-2.5 flex-shrink-0" style={{ color: `rgba(var(--preset-primary-rgb), 0.5)` }} />
                                                <span className="text-xs text-slate-600 dark:text-slate-400">{prompt}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    )}

                    {messages.length > 0 && (
                        <ScrollArea className="flex-1 p-3 md:p-6 overflow-hidden min-h-0" ref={scrollAreaRef}>
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div key={message.id} className={`flex gap-2 md:gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {message.sender === 'ai' && (
                                            <Avatar className="h-7 w-7 md:h-8 md:w-8 border border-slate-200 dark:border-white/10 shadow-sm flex-shrink-0">
                                                <AvatarFallback className="text-white" style={{ background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` }}>
                                                    <TrendingUp className="h-3.5 w-3.5" />
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={`max-w-[85%] md:max-w-[75%] ${message.sender === 'user' ? 'order-1' : ''}`}>
                                            <Card className={`${message.sender === 'user' ? 'text-white border-transparent' : 'bg-white dark:bg-white/[0.03] border-slate-200/60 dark:border-white/[0.06]'} shadow-sm rounded-2xl overflow-hidden`}
                                                style={message.sender === 'user' ? { background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` } : undefined}
                                            >
                                                <CardContent className="p-3 md:p-4">
                                                    {message.sender === 'user' ? (
                                                        <div className="text-xs md:text-sm">{message.content}</div>
                                                    ) : (
                                                        <Markdown content={message.content || ''} className="text-xs md:text-sm" />
                                                    )}
                                                </CardContent>
                                            </Card>
                                            <p className={`text-[10px] text-muted-foreground mt-1.5 px-1 ${message.sender === 'user' ? 'text-right' : ''}`}>
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {message.sender === 'user' && (
                                            <Avatar className="h-7 w-7 md:h-8 md:w-8 border border-slate-200 dark:border-white/10 shadow-sm flex-shrink-0">
                                                <AvatarFallback className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                                                    <User className="h-3.5 w-3.5" />
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}

                    <div className="p-2.5 md:p-4 border-t border-slate-200/50 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] flex-shrink-0">
                        <div className="flex gap-2 md:gap-3">
                            <Input ref={inputRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask me about trends and market insights..."
                                className="h-10 md:h-12 text-sm bg-white dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.08] rounded-xl shadow-sm focus:ring-2"
                                style={{ '--tw-ring-color': `rgba(var(--preset-primary-rgb), 0.2)` } as React.CSSProperties}
                                onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(inputValue); } }}
                                disabled={isTyping}
                            />
                            <Button onClick={() => handleSendMessage(inputValue)} disabled={!inputValue.trim() || isTyping}
                                className="h-10 w-10 md:h-12 md:w-12 text-white rounded-xl shadow-md hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                style={{ background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` }}
                            >
                                <ArrowUp className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 text-center">
                            Trend Analyzer provides insights based on market data and trends.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Dashboard layout for all other tabs
    return (
        <div className="h-full overflow-y-auto">
            <div className="flex flex-col gap-5 w-full p-4 md:p-6">
                {/* Dashboard Header */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Trend Analyzer</h2>
                        <p className="text-muted-foreground">{tabDescriptions[activeTab]}</p>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                        {tabItems.map((tab) => {
                            const isActive = activeTab === tab.key;
                            const Icon = tab.icon;
                            return (
                                <Button key={tab.key} variant="ghost" size="sm"
                                    className="h-8 text-xs font-medium px-3 rounded-lg border transition-all duration-200"
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
                                    <Icon className="h-3.5 w-3.5 mr-1.5" />
                                    {tab.label}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'topvideo' && (
                    <TopTrendingVideos onChannelClick={handleChannelClick} />
                )}

                {activeTab === 'trend' && (
                    <TrendingTopicsclothing />
                )}

                {activeTab === 'content' && (
                    <SocialContentAnalysis />
                )}

                {activeTab === 'music' && (
                    (musicTrendData && musicTrendData.songs && musicTrendData.songs.length > 0) ? (
                        <MusicScreen />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md mb-4" style={{ background: `rgba(var(--preset-primary-rgb), 0.1)` }}>
                                <Music className="w-6 h-6" style={{ color: `var(--preset-primary)` }} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Music Trends Under Construction</h2>
                            <p className="text-sm text-muted-foreground">Check back soon for the hottest trending tracks!</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default AITrend;
