"use client"

import React, { useState, useRef, useEffect } from 'react';
import {
    Bot,
    User,
    Sparkles,
    MessageCircle,
    ArrowUp,
    MessageSquare,
} from 'lucide-react';
import ChatHistory from './chat-history';
import { Category, Chat, Message } from '../../../data/model/ai-model';
import { useCreateChatAssistant, useCreateRoom } from '../../tanstack/ai-tanstack';
import Markdown from '../../../../../components/ui/markdown';
import { useSession } from "@/src/core/lib/dummy-session-provider";

const AIAssistant: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const prevChatsRef = useRef<string>('');
    const { data: session } = useSession();
    const user_id = session?.user_entity?.id;

    const createChatAssistantMutation = useCreateChatAssistant();
    const createRoomMutation = useCreateRoom();

    const suggestedPrompts = [
        "Help me categorize my expenses and detect waste in my spending",
        "Give me advice on how to spend and what needs to be optimized",
        "Assist me with tax management and planning strategies",
        "Perform a financial audit of my business performance",
        "Help with demand forecasting for my products",
        "Suggest sales strategy based on sales performance and dynamic pricing",
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
                if (!user_id) throw new Error('User ID is required');
                const roomData = await createRoomMutation.mutateAsync({ category: Category.ASSISTANT, user_id });
                roomId = roomData.data.rooms.id;
                setCurrentRoomId(roomId);
            }
            if (!roomId) throw new Error('Failed to get room ID');

            const response = await createChatAssistantMutation.mutateAsync({ room_id: roomId, message: content.trim(), role: 'USER' });
            const reader = response.body?.getReader();
            if (!reader) throw new Error('Failed to get response reader');

            let accumulatedContent = '';
            let actualMessageId = tempAiMessageId;
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n').filter((l: string) => l.trim());
                for (const line of lines) {
                    try {
                        const jsonStr = line.replace(/^data:\s*/, '').trim();
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
                    } catch {}
                }
            }
        } catch {
            setMessages(prev => prev.filter(msg => msg.id !== tempAiMessageId));
            setMessages(prev => [...prev, { id: Date.now().toString(), content: 'Sorry, there was an error. Please try again.', sender: 'ai', timestamp: new Date() }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleNewChat = () => {
        setCurrentRoomId(null);
        setMessages([]);
        setInputValue('');
        setIsTyping(false);
        prevChatsRef.current = '';
    };

    return (
        <div className="flex h-full">
            <ChatHistory
                currentChatType={Category.ASSISTANT}
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
            />

            <div className="flex flex-col flex-1 min-w-0">
                {/* Mobile toggle */}
                <div className="md:hidden shrink-0 px-3 py-2 border-b border-border">
                    <button
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent"
                        onClick={() => {
                            if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('toggleChatHistory'));
                        }}
                    >
                        <MessageSquare className="h-4 w-4" />
                    </button>
                </div>

                {/* Empty state */}
                {messages.length === 0 && (
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="max-w-lg w-full text-center">
                            <div className="w-12 h-12 rounded-2xl bg-foreground text-background flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-semibold mb-1">AI Assistant</h2>
                            <p className="text-sm text-muted-foreground mb-8">
                                Your personal business expert. Ask about expenses, strategy, forecasting, and more.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {suggestedPrompts.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSendMessage(prompt)}
                                        className="text-left p-3 rounded-xl border border-border hover:bg-accent/50 transition-colors group"
                                    >
                                        <div className="flex items-start gap-2">
                                            <MessageCircle className="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                                            <span className="text-[13px] text-muted-foreground group-hover:text-foreground leading-snug">{prompt}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages */}
                {messages.length > 0 && (
                    <div className="flex-1 overflow-y-auto min-h-0" ref={scrollAreaRef}>
                        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                            {messages.map((message) => (
                                <div key={message.id} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                                    {message.sender === 'ai' && (
                                        <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center shrink-0 mt-0.5">
                                            <Bot className="h-4 w-4" />
                                        </div>
                                    )}
                                    <div className={`max-w-[85%] ${message.sender === 'user' ? 'order-first' : ''}`}>
                                        {message.sender === 'user' ? (
                                            <div className="bg-foreground text-background rounded-2xl rounded-br-md px-4 py-3">
                                                <p className="text-sm leading-relaxed">{message.content}</p>
                                            </div>
                                        ) : (
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                <Markdown content={message.content || ''} className="text-sm leading-relaxed" />
                                            </div>
                                        )}
                                        <p className={`text-[10px] text-muted-foreground mt-1.5 ${message.sender === 'user' ? 'text-right' : ''}`}>
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {message.sender === 'user' && (
                                        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isTyping && messages[messages.length - 1]?.sender === 'ai' && !messages[messages.length - 1]?.content && (
                                <div className="flex gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center shrink-0">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div className="flex items-center gap-1 py-3">
                                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="shrink-0 border-t border-border px-4 py-3">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask anything..."
                                className="flex-1 h-11 px-4 text-sm rounded-xl border border-border bg-white dark:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 transition-shadow"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(inputValue);
                                    }
                                }}
                                disabled={isTyping}
                            />
                            <button
                                onClick={() => handleSendMessage(inputValue)}
                                disabled={!inputValue.trim() || isTyping}
                                className="h-11 w-11 rounded-xl bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
                            >
                                <ArrowUp className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-2 text-center">
                            AI can make mistakes. Verify important information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;
