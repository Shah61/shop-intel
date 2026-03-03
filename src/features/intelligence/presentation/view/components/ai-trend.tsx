"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    Bot,
    User,
    Sparkles,
    MessageCircle,
    TrendingUp,
    BarChart3,
    ArrowUp,
    Music,
    MessageSquare,
} from 'lucide-react';
import ChatHistory from './chat-history';
import MusicScreen from '../screen/music-screen';
import TrendingTopicsclothing from './trending-topics-chocolate';
import { Category, Chat, Message } from '../../../data/model/ai-model';
import { useCreateChatTrending, useCreateRoom, useMusicTrend, useGetCurrentTrend } from '../../tanstack/ai-tanstack';
import Markdown from '../../../../../components/ui/markdown';
import TopTrendingVideos from './top-trending-videos';
import SocialContentAnalysis from './social-content-analysis';

const subTabs = [
    { id: 'topvideo', label: 'Social Charts', icon: BarChart3 },
    { id: 'ai', label: 'AI Chat', icon: Sparkles },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'trend', label: 'Topics', icon: TrendingUp },
    { id: 'content', label: 'Content', icon: MessageCircle },
];

const AITrend: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('topvideo');
    const [selectedChannelForContent, setSelectedChannelForContent] = useState<string | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const prevChatsRef = useRef<string>('');
    const user_id = 'demo-user-id';

    const createChatTrendingMutation = useCreateChatTrending();
    const createRoomMutation = useCreateRoom();
    const { data: musicTrendData } = useMusicTrend();

    const suggestedPrompts = [
        "What are the top clothing trends for 2024?",
        "Analyze artisanal vs commercial clothing trends",
        "What's trending in premium clothing products?",
    ];

    useEffect(() => {
        if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
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
        const userMessage: Message = { id: Date.now().toString(), content: content.trim(), sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        const tempId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: tempId, content: '', sender: 'ai', timestamp: new Date() }]);

        try {
            let roomId = currentRoomId;
            if (!roomId) {
                const roomData = await createRoomMutation.mutateAsync({ category: Category.TREND, user_id });
                roomId = roomData.data.rooms.id;
                setCurrentRoomId(roomId);
            }
            if (!roomId) throw new Error('No room');
            const response = await createChatTrendingMutation.mutateAsync({ room_id: roomId, message: content.trim(), role: 'USER' });
            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader');

            let acc = '';
            let actualId = tempId;
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const lines = new TextDecoder().decode(value).split('\n').filter((l: string) => l.trim());
                for (const line of lines) {
                    try {
                        const json = line.replace(/^data:\s*/, '').trim();
                        if (!json || json === '[DONE]') continue;
                        const data = JSON.parse(json);
                        if (data.type === 'chat_created') {
                            actualId = data.data.chat.id;
                            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: actualId } : m));
                        } else if (data.type === 'ai_response_chunk' && data.content) {
                            acc += data.content;
                            setMessages(prev => prev.map(m => m.id === actualId ? { ...m, content: acc } : m));
                        } else if (data.type === 'response_complete') {
                            setIsTyping(false);
                        }
                    } catch {}
                }
            }
        } catch {
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setMessages(prev => [...prev, { id: Date.now().toString(), content: 'Error processing request. Please try again.', sender: 'ai', timestamp: new Date() }]);
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

    return (
        <div className="flex h-full">
            <ChatHistory
                currentChatType={Category.TREND}
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
            />

            <div className="flex flex-col flex-1 min-w-0">
                {/* Header: mobile toggle + sub-tabs */}
                <div className="shrink-0 border-b border-border px-3 py-2 flex items-center gap-3 overflow-x-auto">
                    <button
                        className="md:hidden h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent shrink-0"
                        onClick={() => { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('toggleChatHistory')); }}
                    >
                        <MessageSquare className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1 overflow-x-auto">
                        {subTabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg whitespace-nowrap transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-foreground text-background'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* AI Chat tab */}
                {activeTab === 'ai' && (
                    <div className="flex-1 flex flex-col min-h-0">
                        {messages.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center p-6">
                                <div className="max-w-md w-full text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-foreground text-background flex items-center justify-center mx-auto mb-4">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-semibold mb-1">Trend Analyzer</h2>
                                    <p className="text-sm text-muted-foreground mb-6">Ask about market trends, consumer preferences, and industry movements.</p>
                                    <div className="space-y-2">
                                        {suggestedPrompts.map((p, i) => (
                                            <button key={i} onClick={() => handleSendMessage(p)} className="w-full text-left p-3 rounded-xl border border-border hover:bg-accent/50 transition-colors">
                                                <div className="flex items-start gap-2">
                                                    <MessageCircle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                                    <span className="text-[13px] text-muted-foreground leading-snug">{p}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto min-h-0" ref={scrollAreaRef}>
                                <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                            {msg.sender === 'ai' && (
                                                <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center shrink-0 mt-0.5">
                                                    <TrendingUp className="h-4 w-4" />
                                                </div>
                                            )}
                                            <div className={`max-w-[85%] ${msg.sender === 'user' ? 'order-first' : ''}`}>
                                                {msg.sender === 'user' ? (
                                                    <div className="bg-foreground text-background rounded-2xl rounded-br-md px-4 py-3">
                                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                                    </div>
                                                ) : (
                                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                                        <Markdown content={msg.content || ''} className="text-sm leading-relaxed" />
                                                    </div>
                                                )}
                                                <p className={`text-[10px] text-muted-foreground mt-1.5 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {msg.sender === 'user' && (
                                                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="shrink-0 border-t border-border px-4 py-3">
                            <div className="max-w-3xl mx-auto flex gap-2">
                                <input
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask about trends..."
                                    className="flex-1 h-11 px-4 text-sm rounded-xl border border-border bg-white dark:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20"
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(inputValue); } }}
                                    disabled={isTyping}
                                />
                                <button
                                    onClick={() => handleSendMessage(inputValue)}
                                    disabled={!inputValue.trim() || isTyping}
                                    className="h-11 w-11 rounded-xl bg-foreground text-background flex items-center justify-center hover:opacity-90 disabled:opacity-40"
                                >
                                    <ArrowUp className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'music' && (
                    <div className="flex-1 min-h-0 overflow-auto">
                        {musicTrendData?.songs?.length ? <MusicScreen /> : (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                <Music className="w-8 h-8 text-muted-foreground mb-3" />
                                <h2 className="text-lg font-semibold mb-1">Music Trends</h2>
                                <p className="text-sm text-muted-foreground">Coming soon. Check back for the hottest tracks.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'trend' && (
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        <div className="p-4 md:p-6"><TrendingTopicsclothing /></div>
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
