"use client"

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
    Lightbulb,
    Heart,
    Zap,
    Star,
    ArrowUp,
    MessageSquare
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
        "Suggest sales strategy based on sales performance and dynamic pricing"
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

    // Add effect to monitor messages state
    useEffect(() => {
        // console.log('AIAssistant - Messages updated:', messages);
    }, [messages]);

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
                    category: Category.ASSISTANT,
                    user_id: user_id
                });
                roomId = roomData.data.rooms.id;
                setCurrentRoomId(roomId);
            }

            // Use the createChatAssistant service to get streaming response
            if (!roomId) {
                throw new Error('Failed to get or create room ID');
            }
            
            const response = await createChatAssistantMutation.mutateAsync({
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
                        // console.log('Streaming data:', data); // Debug log
                        
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
                        // console.debug('Error parsing line:', line, error);
                    }
                }
            }
        } catch (error) {
            // console.error('Error sending message:', error);
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

    const generateAIResponse = (userInput: string): string => {
        const input = userInput.toLowerCase();
        
        if (input.includes('routine')) {
            return "Great question about Clothing Brands! Here's a personalized routine I recommend:\n\n🌅 **Morning:**\n1. Gentle cleanser\n2. Vitamin C serum\n3. Moisturizer with SPF\n4. Sunscreen (SPF 30+)\n\n🌙 **Evening:**\n1. Double cleanse (oil + water-based)\n2. Treatment (retinol/acids)\n3. Moisturizer\n4. Face oil (optional)\n\nRemember to introduce new products gradually and always patch test first!";
        }
        
        if (input.includes('retinol')) {
            return "Retinol is an excellent anti-aging ingredient! Here's what you need to know:\n\n✨ **Benefits:**\n• Reduces fine lines and wrinkles\n• Improves skin texture and tone\n• Helps with acne and enlarged pores\n• Stimulates collagen production\n\n⚠️ **Usage Tips:**\n• Start with 0.25% concentration\n• Use only at night\n• Always wear SPF during the day\n• Expect some initial irritation\n\nWould you like specific product recommendations?";
        }
        
        if (input.includes('acne') || input.includes('breakout')) {
            return "For acne-prone skin, here's my recommended approach:\n\n🧴 **Key ingredients:**\n• Salicylic acid (BHA) for exfoliation\n• Benzoyl peroxide for bacteria\n• Niacinamide for oil control\n• Hyaluronic acid for hydration\n\n🚫 **Avoid:**\n• Over-cleansing (strips natural oils)\n• Heavy, comedogenic products\n• Picking or squeezing\n\n💡 **Pro tip:** Consistency is key! Stick to a routine for 6-8 weeks to see results.";
        }
        
        if (input.includes('sensitive skin')) {
            return "Sensitive skin needs extra gentle care:\n\n✅ **Safe ingredients:**\n• Ceramides for barrier repair\n• Hyaluronic acid for hydration\n• Centella asiatica for soothing\n• Colloidal oatmeal for calming\n\n❌ **Ingredients to avoid:**\n• Fragrances and essential oils\n• High concentrations of acids\n• Alcohol denat\n• Harsh physical scrubs\n\n🌿 **Always patch test new products and introduce one at a time!**";
        }
        
        return "That's a great question! I'd be happy to help you with personalized Selling advice. Clothing is very individual, and the best approach depends on your specific skin type, concerns, and goals. Could you tell me more about your current routine or specific skin concerns? This will help me give you more targeted recommendations! 💫";
    };

    const handleSuggestedPrompt = (prompt: string) => {
        handleSendMessage(prompt);
    };



    const handleNewChat = () => {
        setCurrentRoomId(null);
        setMessages([]);
        setInputValue('');
        setIsTyping(false);
        prevChatsRef.current = '';
    };

    return (
        <div className="flex h-full bg-transparent">
            {/* Chat History Sidebar */}
            <div className="flex-shrink-0">
                <ChatHistory 
                    currentChatType={Category.ASSISTANT}
                    onNewChat={handleNewChat}
                    onSelectChat={handleSelectChat}
                />
            </div>

            {/* Main Chat Area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-2 md:gap-4 p-2 sm:p-3 md:p-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-white/50 to-slate-50/50 dark:from-black/50 dark:to-black/50 backdrop-blur-sm flex-shrink-0">
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
                        <MessageSquare className="h-4 w-4" />
                    </Button>
                    
                    <div className="relative">
                        <div className="relative">
                            <Avatar className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 border-2 border-white dark:border-black shadow-xl">
                                <AvatarImage src="/api/placeholder/48/48" alt="AI Assistant" />
                                <AvatarFallback className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white text-sm md:text-lg font-bold">
                                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white dark:border-black shadow-lg animate-pulse"></div>
                        </div>
                        <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-lg opacity-60"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-lg md:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent truncate">
                            AI Assistant
                        </h3>
                        <p className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1 sm:gap-2">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="hidden sm:inline">Online • </span>Clothing Expert
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <Badge className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-400/10 dark:to-indigo-400/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium text-[8px] sm:text-[10px] md:text-xs px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1">
                            <Sparkles className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 mr-0.5 sm:mr-1" />
                            <span className="hidden sm:inline">AI </span>Powered
                        </Badge>
                    </div>
                </div>

                {/* Welcome Message & Quick Actions */}
                {messages.length === 0 && (
                    <ScrollArea className="flex-1 min-h-0 overflow-hidden">
                        <div className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4">
                        {/* Welcome Card */}
                        <div className="relative">
                            <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-black dark:to-gray-900 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                                <CardContent className="p-3 md:p-4">
                                    <div className="flex items-start gap-2 md:gap-3">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                                                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                            </div>
                                            <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-lg blur opacity-75"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                                                Welcome to AI Assistant
                                            </h3>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                                I'm your personal Clothing expert, powered by advanced AI. I can help you build personalized routines, 
                                                understand ingredients, and solve skin concerns.
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
                                        className="justify-start h-auto p-2 md:p-3 text-left bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-black border border-slate-200/50 dark:border-slate-700/50 rounded-lg transition-all duration-300 hover:shadow-md"
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
                            {messages.map((message) => {
                                // console.log('Rendering message:', message);
                                return (
                                    <div
                                        key={message.id}
                                        className={`flex gap-2 md:gap-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {message.sender === 'ai' && (
                                            <div className="relative flex-shrink-0">
                                                <Avatar className="h-6 w-6 md:h-8 md:w-8 border-2 border-white dark:border-black shadow-lg">
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                                                        <Bot className="h-3 w-3 md:h-4 md:w-4" />
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                        )}
                                        
                                        <div className={`max-w-[85%] md:max-w-[80%] ${message.sender === 'user' ? 'order-1' : ''}`}>
                                            <Card className={`${
                                                message.sender === 'user' 
                                                    ? 'bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-100 dark:to-slate-200 text-white dark:text-slate-900 border-slate-700 dark:border-slate-300' 
                                                    : 'bg-white/80 dark:bg-black/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50'
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
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}

                {/* Input */}
                <div className="p-2 md:p-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-white/50 to-slate-50/50 dark:from-black/50 dark:to-black/50 backdrop-blur-sm flex-shrink-0">
                    <div className="relative">
                        <div className="flex gap-2 md:gap-3">
                            <div className="relative flex-1">
                                <Input
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask me anything about skincare..."
                                    className="h-10 md:h-12 pl-3 md:pl-4 pr-10 md:pr-12 text-sm bg-white/80 dark:bg-black/80 backdrop-blur-sm border-2 border-slate-200/50 dark:border-slate-700/50 rounded-lg md:rounded-xl shadow-lg focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 transition-all duration-300"
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
                                className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg md:rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <ArrowUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </Button>
                        </div>
                    </div>
                    <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-2 md:mt-3 text-center">
                        AI Assistant can make mistakes. Please verify important information.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;