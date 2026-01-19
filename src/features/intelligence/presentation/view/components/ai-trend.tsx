"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Send, 
    Bot, 
    User, 
    Sparkles, 
    MessageCircle, 
    TrendingUp,
    BarChart3,
    Target,
    Lightbulb,
    ArrowUp,
    Zap,
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
                <div className="flex items-center gap-2 md:gap-4 p-2 sm:p-3 md:p-6 border-b border-slate-200/30 dark:border-white/10 bg-gradient-to-r from-white/50 to-slate-50/50 dark:from-black/50 dark:to-black/50 backdrop-blur-sm flex-shrink-0">
                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden h-8 w-8 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-black"
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
                        <div className="relative">
                            <Avatar className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 border-2 border-white dark:border-black shadow-xl">
                                <AvatarImage src="/api/placeholder/48/48" alt="Shop-Intel AI Trend" />
                                <AvatarFallback className={`text-white text-sm md:text-lg font-bold ${
                                    activeTab === 'music' 
                                        ? 'bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600'
                                        : activeTab === 'trend'
                                        ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600'
                                        : activeTab === 'topvideo'
                                        ? 'bg-gradient-to-br from-pink-600 via-pink-500 to-red-600'
                                        : activeTab === 'content'
                                        ? 'bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600'
                                        : 'bg-gradient-to-br from-green-600 via-green-500 to-blue-600'
                                }`}>
                                    {activeTab === 'music' ? (
                                        <Music className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6" />
                                    ) : (
                                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6" />
                                    )}
                                </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-lg animate-pulse ${
                                activeTab === 'music' 
                                    ? 'bg-purple-500'
                                    : activeTab === 'trend'
                                    ? 'bg-blue-500'
                                    : activeTab === 'topvideo'
                                    ? 'bg-pink-500'
                                    : activeTab === 'content'
                                    ? 'bg-purple-500'
                                    : 'bg-green-500'
                            }`}></div>
                        </div>
                        <div className={`absolute -inset-2 rounded-full blur-lg opacity-60 ${
                            activeTab === 'music' 
                                ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
                                : activeTab === 'trend'
                                ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20'
                                : activeTab === 'topvideo'
                                ? 'bg-gradient-to-br from-pink-500/20 to-red-500/20'
                                : activeTab === 'content'
                                ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20'
                                : 'bg-gradient-to-br from-green-500/20 to-blue-500/20'
                        }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-lg md:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent truncate">
                            {activeTab === 'music' ? 'Trending Music' : activeTab === 'trend' ? 'Trending Topics' : activeTab === 'topvideo' ? 'Social Trend Charts' : activeTab === 'content' ? 'Content Analysis' : 'Shop-Intel AI Trend Analyzer'}
                        </h3>
                        <p className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1 sm:gap-2">
                            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse ${
                                activeTab === 'music' 
                                    ? 'bg-purple-500'
                                    : activeTab === 'trend'
                                    ? 'bg-blue-500'
                                    : activeTab === 'topvideo'
                                    ? 'bg-pink-500'
                                    : activeTab === 'content'
                                    ? 'bg-purple-500'
                                    : 'bg-green-500'
                            }`}></span>
                            <span className="hidden sm:inline">Online • </span>
                            {activeTab === 'music' 
                                ? `Current Week • ${musicTrendData?.songs?.length || 0} tracks`
                                : activeTab === 'trend' 
                                ? 'Clothing & Selling Trends'
                                : activeTab === 'topvideo'
                                ? 'Channel Analytics & Rankings'
                                : activeTab === 'content'
                                ? 'Video Content Explorer'
                                : 'Trend Expert'
                            }
                        </p>
                    </div>
                    <div className="flex-shrink-0 flex gap-2">
                        <Button 
                            variant="default"
                            size="sm"
                            className={`h-6 text-[8px] sm:text-[10px] md:text-xs font-medium px-2 py-0 rounded-md transition-all duration-300 hover:shadow-lg ${
                                activeTab === 'ai' 
                                    ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white' 
                                    : 'bg-gradient-to-r from-green-500/10 to-blue-500/10 hover:from-green-500/20 hover:to-blue-500/20 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-white/20'
                            }`}
                            onClick={() => setActiveTab('ai')}
                        >
                            <Sparkles className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 mr-0.5 sm:mr-1" />
                            Chat
                        </Button>
                        <Button 
                            variant="default"
                            size="sm"
                            className={`h-6 text-[8px] sm:text-[10px] md:text-xs font-medium px-2 py-0 rounded-md transition-all duration-300 hover:shadow-lg ${
                                activeTab === 'music' 
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                                    : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-white/20'
                            }`}
                            onClick={() => setActiveTab('music')}
                        >
                            Music Trends
                        </Button>
                        <Button 
                            variant="default"
                            size="sm"
                            className={`h-6 text-[8px] sm:text-[10px] md:text-xs font-medium px-2 py-0 rounded-md transition-all duration-300 hover:shadow-lg ${
                                activeTab === 'trend' 
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white' 
                                    : 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-white/20'
                            }`}
                            onClick={() => setActiveTab('trend')}
                        >
                            Trending Topics
                        </Button>
                        <Button 
                            variant="default"
                            size="sm"
                            className={`h-6 text-[8px] sm:text-[10px] md:text-xs font-medium px-2 py-0 rounded-md transition-all duration-300 hover:shadow-lg ${
                                activeTab === 'topvideo' 
                                    ? 'bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white' 
                                    : 'bg-gradient-to-r from-pink-500/10 to-red-500/10 hover:from-pink-500/20 hover:to-red-500/20 text-pink-700 dark:text-pink-300 border border-pink-200/50 dark:border-white/20'
                            }`}
                            onClick={() => setActiveTab('topvideo')}
                        >
                            Charts
                        </Button>
                        <Button 
                            variant="default"
                            size="sm"
                            className={`h-6 text-[8px] sm:text-[10px] md:text-xs font-medium px-2 py-0 rounded-md transition-all duration-300 hover:shadow-lg ${
                                activeTab === 'content' 
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white' 
                                    : 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-white/20'
                            }`}
                            onClick={() => setActiveTab('content')}
                        >
                            Content
                        </Button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'ai' && (
                    <>
                        {/* Welcome Message & Quick Actions */}
                        {messages.length === 0 && (
                            <ScrollArea className="flex-1 min-h-0 overflow-hidden">
                                <div className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4">
                                {/* Welcome Card */}
                                <div className="relative">
                                    <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-black dark:to-gray-900 border border-slate-200/30 dark:border-white/10 shadow-lg">
                                        <CardContent className="p-3 md:p-4">
                                            <div className="flex items-start gap-2 md:gap-3">
                                                <div className="relative flex-shrink-0">
                                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                                                        <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                                    </div>
                                                    <div className="absolute -inset-1 bg-gradient-to-br from-green-500/30 to-blue-600/30 rounded-lg blur opacity-75"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                                                        Welcome to Shop-Intel Trend Analyzer
                                                    </h3>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                                        I'm your clothing trend expert, analyzing the latest market movements, emerging techniques, 
                                                        consumer preferences, and confectionery innovations.
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>



                                {/* Suggested Prompts */}
                                <div className="space-y-2 md:space-y-3">
                                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <MessageCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                        Try asking me
                                    </h4>
                                    <div className="grid gap-1.5 md:gap-2">
                                        {suggestedPrompts.slice(0, 3).map((prompt, index) => (
                                            <Button
                                                key={index}
                                                variant="ghost"
                                                className="justify-start h-auto p-2 md:p-3 text-left bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-black border border-slate-200/30 dark:border-white/10 rounded-lg transition-all duration-300 hover:shadow-md"
                                                onClick={() => handleSuggestedPrompt(prompt)}
                                            >
                                                <MessageCircle className="h-3 w-3 md:h-3.5 md:w-3.5 mr-2 text-slate-400 flex-shrink-0" />
                                                <span className="text-[10px] md:text-xs text-slate-600 dark:text-slate-400 leading-tight">{prompt}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                </div>
                            </ScrollArea>
                        )}

                        {/* Messages */}
                        {messages.length > 0 && (
                            <ScrollArea className="flex-1 p-3 md:p-6 overflow-hidden min-h-0" ref={scrollAreaRef}>
                                <div className="space-y-4 md:space-y-6">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex gap-2 md:gap-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {message.sender === 'ai' && (
                                                                                            <div className="relative flex-shrink-0">
                                                <Avatar className="h-6 w-6 md:h-8 md:w-8 border-2 border-white dark:border-black shadow-lg">
                                                    <AvatarFallback className="bg-gradient-to-br from-green-600 to-blue-600 text-white">
                                                        <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            )}
                                            
                                            <div className={`max-w-[85%] md:max-w-[80%] ${message.sender === 'user' ? 'order-1' : ''}`}>
                                                <Card className={`${
                                                    message.sender === 'user' 
                                                        ? 'bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-100 dark:to-slate-200 text-white dark:text-slate-900 border-slate-700/50 dark:border-white/30' 
                                                        : 'bg-white/80 dark:bg-black/80 backdrop-blur-sm border-slate-200/30 dark:border-white/10'
                                                } shadow-xl rounded-xl md:rounded-2xl overflow-hidden`}>
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
                                                <p className={`text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-1 md:mt-2 px-1 ${
                                                    message.sender === 'user' ? 'text-right' : 'text-left'
                                                }`}>
                                                    {message.timestamp.toLocaleTimeString([], { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </p>
                                            </div>

                                            {message.sender === 'user' && (
                                                                                            <div className="relative flex-shrink-0">
                                                <Avatar className="h-6 w-6 md:h-8 md:w-8 border-2 border-white dark:border-black shadow-lg">
                                                    <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-200 dark:to-slate-300 text-white dark:text-slate-900">
                                                        <User className="h-3 w-3 md:h-4 md:w-4" />
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}

                        {/* Input */}
                        <div className="p-2 md:p-4 border-t border-slate-200/30 dark:border-white/10 bg-gradient-to-r from-white/50 to-slate-50/50 dark:from-black/50 dark:to-black/50 backdrop-blur-sm flex-shrink-0">
                            <div className="relative">
                                <div className="flex gap-2 md:gap-3">
                                    <div className="relative flex-1">
                                        <Input
                                            ref={inputRef}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder="Ask me about Clothing Brands trends and market insights..."
                                            className="h-10 md:h-12 pl-3 md:pl-4 pr-10 md:pr-12 text-sm bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-slate-200/30 dark:border-white/20 rounded-lg md:rounded-xl shadow-lg focus:border-green-400 dark:focus:border-green-500 focus:ring-2 focus:ring-green-400/20 dark:focus:ring-green-500/20 transition-all duration-300"
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
                                        className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg md:rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        <ArrowUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    </Button>
                                </div>
                            </div>
                            <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-2 md:mt-3 text-center">
                                Shop-Intel Trend Analyzer provides insights based on market data and trends.
                            </p>
                        </div>
                    </>
                )}

                {/* Music Tab Content */}
                {activeTab === 'music' && (
                    <div className="flex-1 min-h-0 overflow-auto">
                        {(musicTrendData && musicTrendData.songs && musicTrendData.songs.length > 0) ? (
                            <MusicScreen />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                <span className="text-3xl mb-2">🎵🚧</span>
                                <h2 className="text-xl font-bold mb-2">Music Trends Under Construction</h2>
                                <p className="text-slate-500 dark:text-slate-400">Oops! Looks like the music trends are still warming up backstage. Check back soon for the hottest tracks!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Trend Tab Content */}
                {activeTab === 'trend' && (
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <div className="h-full overflow-y-auto overflow-x-hidden">
                            <div className="p-4 md:p-6">
                                <TrendingTopicsclothing />
                            </div>
                        </div>
                    </div>
                )}

                {/* Top Video Tab Content */}
                {activeTab === 'topvideo' && (
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <TopTrendingVideos onChannelClick={handleChannelClick} />
                    </div>
                )}

                {/* Content Tab Content */}
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