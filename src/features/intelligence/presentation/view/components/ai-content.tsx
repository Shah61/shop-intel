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
    PenTool,
    FileText,
    Share2,
    Target,
    ArrowUp,
    Zap,
    Video,
    Megaphone,
    Settings,
    ChevronDown,
    ChevronUp,
    Heart,
    HelpCircle,
    BookOpen,
    Users,
    Play,
    Package,
    Star,
    GraduationCap,
    Camera,
    ShoppingCart,
    BookMarked,
    UserPlus,
    Gift,
    Flame,
    SmilePlus,
    Eye,
    TrendingUp,
    ListOrdered,
    BrainCircuit,
    Lock,
    AlertTriangle,
    Rocket,
    ImagePlus,
    ScrollText,
    LineChart,
    Clock,
    AtSign,
    Mail,
    Bell,
    Trophy,
    CheckCircle,
    Repeat,
    ThumbsUp,
    Timer,
    Shield,
    Scale,
    Mic,
    Monitor,
    MessageSquare,
    ExternalLink,
    ArrowRight,
    Bookmark
} from 'lucide-react';
import ChatHistory from './chat-history';
import { Category, Chat, Message, CreateChatContentCategories } from '../../../data/model/ai-model';
import { useCreateChatContent, useCreateRoom } from '../../tanstack/ai-tanstack';
import Markdown from '../../../../../components/ui/markdown';
import hooksData from '../../../data/model/hooks.json';
import storyboardData from '../../../data/model/storyboard.json';
import ctaData from '../../../data/model/cta.json';
import promptData from '../../../data/model/prompt.json';
// Auth removed - using dummy user_id

// Icon mapping object
const IconMap: Record<string, any> = {
    HelpCircle,
    Zap,
    Flame,
    Heart,
    SmilePlus,
    Eye,
    TrendingUp,
    Target,
    Sparkles,
    ScrollText,
    ListOrdered,
    GraduationCap,
    BrainCircuit,
    Lock,
    Users,
    AlertTriangle,
    Rocket,
    LineChart,
    ImagePlus,
    // Additional icons for storyboard
    Drama: Users,
    Timer,
    Star,
    Contrast: Target,
    Shield,
    Camera,
    Clock,
    Package,
    Scale,
    Mic,
    Monitor,
    MessageSquare,
    // Additional icons for CTA
    MessageCircle,
    UserPlus,
    Share: Share2,
    Bookmark,
    Play,
    AtSign,
    ExternalLink,
    Mail,
    ArrowRight,
    Bell,
    Trophy,
    BookmarkPlus: BookMarked,
    CheckCircle,
    Repeat,
    ThumbsUp
};

const AIContent: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedQuickAction, setSelectedQuickAction] = useState<string | null>(null);
    const [expandedAction, setExpandedAction] = useState<string | null>(null);
    const [selectedSubcategoryPrompt, setSelectedSubcategoryPrompt] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const prevChatsRef = useRef<string>('');
    // Use dummy user_id - no auth needed
    const user_id = 'demo-user-id';

    // Mock mutations - no API calls
    const createChatContentMutation = {
        mutateAsync: async (params: any) => {
            // Return a mock streaming response
            const mockResponse = new ReadableStream({
                start(controller) {
                    const encoder = new TextEncoder();
                    const mockContent = generateAIResponse(params.message);
                    const chunks = mockContent.split(' ');
                    
                    // Simulate streaming by sending chunks
                    chunks.forEach((chunk, index) => {
                        setTimeout(() => {
                            const data = JSON.stringify({
                                type: index === 0 ? 'chat_created' : 'ai_response_chunk',
                                data: index === 0 ? { chat: { id: `mock-chat-${Date.now()}` } } : null,
                                content: index === 0 ? '' : chunk + ' '
                            });
                            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                            
                            if (index === chunks.length - 1) {
                                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'response_complete' })}\n\n`));
                                controller.close();
                            }
                        }, index * 50);
                    });
                }
            });
            
            return {
                body: mockResponse
            } as Response;
        }
    };
    
    const createRoomMutation = {
        mutateAsync: async (params: any) => {
            return {
                data: {
                    rooms: {
                        id: `mock-room-${Date.now()}`
                    }
                }
            };
        }
    };

    // Helper function to map UI action to backend category
    const getBackendCategory = (actionType: string): string => {
        switch (actionType) {
            case "Hook":
                return CreateChatContentCategories.HOOK;
            case "Storyboard (Script & Images)":
                return CreateChatContentCategories.STORYBOARD;
            case "Call To Action":
                return CreateChatContentCategories.CTA;
            default:
                return ''; // Don't return anything for default
        }
    };

    const quickActions = [
        { 
            icon: Target, 
            label: "Hook", 
            color: "text-blue-500", 
            bgColor: "bg-blue-50 dark:bg-blue-950/50", 
            borderColor: "border-blue-200 dark:border-blue-800" 
        },
        { 
            icon: Video, 
            label: "Storyboard (Script & Images)", 
            color: "text-purple-500", 
            bgColor: "bg-purple-50 dark:bg-purple-950/50", 
            borderColor: "border-purple-200 dark:border-purple-800" 
        },
        { 
            icon: Megaphone, 
            label: "Call To Action", 
            color: "text-green-500", 
            bgColor: "bg-green-50 dark:bg-green-950/50", 
            borderColor: "border-green-200 dark:border-green-800" 
        },
        { 
            icon: Settings, 
            label: "Custom", 
            color: "text-orange-500", 
            bgColor: "bg-orange-50 dark:bg-orange-950/50", 
            borderColor: "border-orange-200 dark:border-orange-800" 
        }
    ];

    // Replace the old subcategories with hooks data for the "Hook" category
    const subcategories = {
        "Hook": hooksData.hooks.map(hook => ({
            id: hook.id,
            label: hook.label,
            description: hook.description,
            icon: IconMap[hook.icon],
            color: hook.color,
            bgColor: hook.bgColor,
            prompt: (promptData as any).hookPrompts[hook.id] || `Create a ${hook.label.toLowerCase()} hook for your content.`
        })),
        "Storyboard (Script & Images)": storyboardData.storyboards.map(storyboard => ({
            id: storyboard.id,
            label: storyboard.label,
            description: storyboard.description,
            icon: IconMap[storyboard.icon],
            color: storyboard.color,
            bgColor: storyboard.bgColor,
            prompt: `Create a ${storyboard.label.toLowerCase()} for your content. ${storyboard.description}`
        })),
        "Call To Action": ctaData.ctas.map(cta => ({
            id: cta.id,
            label: cta.label,
            description: cta.description,
            icon: IconMap[cta.icon],
            color: cta.color,
            bgColor: cta.bgColor,
            prompt: (promptData as any).ctaPrompts[cta.id] || `Create a compelling ${cta.label.toLowerCase()} call-to-action for your content.`
        }))
    };

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
        // console.log('AIContent - Messages updated:', messages);
    }, [messages]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;

        // Log the message sending attempt
        console.log('💬 Sending Message:', {
            content: content.trim(),
            selectedQuickAction,
            selectedCategory,
            selectedSubCategory,
            selectedSubcategoryPrompt: selectedSubcategoryPrompt ? 'Present' : 'None',
            currentRoomId
        });

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
                    category: Category.CONTENT,
                    user_id: user_id
                });
                roomId = roomData.data.rooms.id;
                setCurrentRoomId(roomId);
            }

            // Use the createChat service to get streaming response
            if (!roomId) {
                throw new Error('Failed to get or create room ID');
            }
            
            // Combine the hidden prompt with user input
            let messageToSend = content.trim();
            if (selectedSubcategoryPrompt) {
                messageToSend = `${selectedSubcategoryPrompt}\n\nUser Request: ${content.trim()}`;
                // Clear the stored prompt after use
                setSelectedSubcategoryPrompt('');
            }
            
            // Prepare request parameters
            const requestParams = {
                room_id: roomId,
                message: messageToSend,
                role: 'USER',
                category: selectedCategory || getBackendCategory(selectedQuickAction?.split(':')[0] || 'Hook'),
                sub_category: selectedSubCategory || 'general'
            };
            
            // Log the request being sent to backend
            console.log('🚀 Request to Backend:', requestParams);
            console.log('🌐 Endpoint URL:', `${process.env['Shop-Intel_ADMIN_URL'] || ''}/intelligence/chats/stream/content`);
            console.log('🔧 Environment Variable Shop-Intel_ADMIN_URL:', process.env['Shop-Intel_ADMIN_URL']);
            console.log('📋 HTTP Request Details:', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream'
                },
                body: JSON.stringify({
                    room_id: requestParams.room_id,
                    message: requestParams.message,
                    role: requestParams.role,
                    category: requestParams.category,
                    sub_category: requestParams.sub_category
                })
            });
            
            const response = await createChatContentMutation.mutateAsync(requestParams);
            
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
                        
                        // Log the parsed data from backend
                        console.log('📨 Response from Backend:', data);
                        
                        switch (data.type) {
                            case 'chat_created': {
                                // Update the message ID with the one from the server
                                actualMessageId = data.data.chat.id;
                                setMessages(prev => prev.map(msg => 
                                    msg.id === tempAiMessageId 
                                        ? { ...msg, id: actualMessageId }
                                        : msg
                                ));
                                break;
                            }
                            case 'ai_response_chunk': {
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
                            }
                            case 'response_complete': {
                                // Mark as complete
                                setIsTyping(false);
                                break;
                            }
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
        
        if (input.includes('blog') || input.includes('article')) {
            return "📝 **Blog Post Content Created:**\n\n**Title:** \"The Ultimate Guide to Denim: Transform Your Wardrobe with Style-Backed Results\"\n\n**Introduction:**\nDenim has earned its reputation as the gold standard in versatile fashion, but understanding how to style it effectively can be the difference between a polished look and a fashion faux pas. In this comprehensive guide, we'll explore everything you need to know about incorporating denim into your wardrobe.\n\n**Key Sections:**\n• What is Denim and How Does it Work?\n• Benefits: From Casual to Formal\n• How to Start Building Your Denim Collection\n• Common Mistakes to Avoid\n• Product Recommendations by Style Type\n\n**Call-to-Action:**\nReady to start your denim journey? Browse our curated collection of designer-approved denim products.\n\n*Would you like me to expand on any section or adjust the tone?*";
        }
        
        if (input.includes('instagram') || input.includes('social media') || input.includes('caption')) {
            return "📱 **Instagram Content Package:**\n\n**Post 1 - Educational Carousel:**\n\"✨ DENIM 101: Everything you need to know ✨\n\nSwipe to learn:\n🔬 What denim actually is\n⏰ When to wear it (hint: any time!)\n🌟 Benefits you'll see\n⚠️ Styling mistakes to avoid\n💡 Pro tips for beginners\n\n#DenimEducation #FashionScience #StyleGuide #FashionRoutine #FashionTips\"\n\n**Post 2 - Product Feature:**\n\"Meet your new wardrobe essential 🌙\n\nOur Classic Denim Jeans are perfect for beginners:\n✅ Premium cotton blend\n✅ Comfortable stretch fabric\n✅ Designer-tested\n✅ Sustainable production\n\nStart simple, style steady 💫\n\n#NewProduct #DenimJeans #ClassicFashion #EverydayStyle\"\n\n*Need more variations or different platforms?*";
        }
        
        if (input.includes('email') || input.includes('campaign') || input.includes('newsletter')) {
            return "📧 **Email Campaign: Comfort Collection**\n\n**Subject Line:** \"Finally, clothing that loves you back 💚\"\n\n**Preview Text:** \"Comfortable fabrics, powerful style - designed for everyday wear\"\n\n**Email Body:**\n\nHi [Name],\n\nTired of clothing that promises the world but leaves you uncomfortable and restricted? We get it.\n\nThat's why we created our Comfort Collection - because everyone deserves effective clothing that feels like a gentle hug.\n\n**What makes it special:**\n🌿 Soft, breathable fabrics\n🧪 Quality tested for comfort\n💧 Stretch-enhancing materials\n✨ Visible style without discomfort\n\n**Featured Products:**\n• Comfortable T-Shirt - $24\n• Relaxed Fit Jeans - $32\n• Cozy Sweater - $28\n\n[SHOP THE COLLECTION - 20% OFF]\n\nYour wardrobe will thank you,\nThe Shop-Intel Team\n\n*Want me to adjust the tone or add more sections?*";
        }
        
        if (input.includes('product description') || input.includes('product copy')) {
            return "🛍️ **Product Description: Classic T-Shirt**\n\n**Product Name:** Daily Wear Classic T-Shirt\n\n**Hero Description:**\n\"Unlock your wardrobe's natural versatility with our lightweight, breathable t-shirt that delivers all-day comfort without the heavy feel.\"\n\n**Key Benefits:**\n• Instantly comfortable and flattering fit\n• Strengthens durability with premium cotton\n• Lightweight, non-restrictive fabric\n• Suitable for all body types\n• Quality-tested and approved\n\n**Key Features:**\n🌊 **Premium Cotton** - Soft and breathable material\n🛡️ **Reinforced Seams** - Durable construction for longevity\n🌿 **Stretch Blend** - Comfortable fit that moves with you\n🍃 **Eco-Friendly Dye** - Gentle on fabric and environment\n\n**How to Style:**\nWear morning and evening for any occasion. Pair with jeans or dress up with a blazer.\n\n**Size:** S, M, L, XL\n**Price:** $32\n\n*Need variations for different products or platforms?*";
        }
        
        if (input.includes('summer') || input.includes('seasonal')) {
            return "☀️ **Summer Fashion Content Series:**\n\n**Post 1 - Educational:**\n\"Summer wardrobe switch-up time! ☀️\n\nAs temperatures rise, your style needs change:\n\n🌡️ **What happens:** Increased heat, more sweating, higher sun exposure\n\n💧 **What to adjust:**\n• Lighter fabrics\n• Breathable materials (minimum cotton blend)\n• Loose fits for comfort\n• Light colors for heat reflection\n\n🚫 **What to avoid:**\n• Heavy fabrics that trap heat\n• Skipping sun protection (your style still needs it!)\n• Forgetting to stay hydrated\n\nYour summer style starts with the right wardrobe ✨\n\n#SummerFashion #StyleGuide #LightweightFashion #FashionTips\"\n\n**Post 2 - Product Recommendations:**\n\"Your summer wardrobe essentials checklist ✅\n\n☀️ Lightweight cotton t-shirts\n💧 Breathable linen shirts\n🧴 Comfortable shorts\n✨ Lightweight dresses\n🌊 Sun hats and accessories\n\nSwipe for our top picks! 👉\"\n\n*Want more seasonal content or specific product focuses?*";
        }
        
        return "I'd love to help you create amazing clothing content! I can assist with:\n\n📝 **Blog Posts & Articles**\n• Educational content about fabrics and materials\n• How-to guides and tutorials\n• Product reviews and comparisons\n• Seasonal fashion advice\n\n📱 **Social Media Content**\n• Instagram captions and stories\n• TikTok scripts\n• Facebook posts\n• Pinterest descriptions\n\n📧 **Marketing Copy**\n• Email campaigns\n• Product descriptions\n• Landing page copy\n• Ad copy\n\n🎨 **Creative Content**\n• Brand storytelling\n• Customer testimonials\n• Educational infographics\n• Video scripts\n\nWhat specific type of content would you like me to create? Just let me know your target audience, tone, and key message! ✨";
    };

    const handleSuggestedPrompt = (prompt: string) => {
        handleSendMessage(prompt);
    };

    const handleQuickAction = (action: string) => {
        if (action === "Custom") {
            // For Custom, directly select it without showing dropdown
            setSelectedQuickAction("Custom");
            setExpandedAction(null);
            
            // Set default category and subcategory for custom content
            setSelectedCategory(CreateChatContentCategories.HOOK); // Default to HOOK
            setSelectedSubCategory('custom');
            
            // Log the custom selection
            console.log('🎯 Selected Custom Action:', {
                actionType: 'Custom',
                backendCategory: CreateChatContentCategories.HOOK,
                backendSubCategory: 'custom'
            });
            
            // Focus on input
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        } else {
            if (expandedAction === action) {
                setExpandedAction(null);
            } else {
                setExpandedAction(action);
            }
        }
    };

    const handleSubcategorySelect = (actionType: string, subcategory: any) => {
        setSelectedQuickAction(`${actionType}: ${subcategory.label}`);
        setExpandedAction(null);
        
        // Store the category and subcategory for backend
        const backendCategory = getBackendCategory(actionType);
        setSelectedCategory(backendCategory);
        setSelectedSubCategory(subcategory.id);
        
        // Log the selection
        console.log('🎯 Selected Action:', {
            actionType,
            subcategory: subcategory.label,
            subcategoryId: subcategory.id,
            backendCategory,
            prompt: subcategory.prompt
        });
        
        // Store the prompt separately (hidden from user)
        setSelectedSubcategoryPrompt(subcategory.prompt || '');
        
        // Don't auto-populate input - let user type their own message
        setInputValue('');
        
        // Focus on input
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    const generatePromptForSubcategory = (actionType: string, subcategory: any): string => {
        const prompts: Record<string, Record<string, string>> = {
            "Hook": {
                "hook-emotional": "Create an emotional hook for a clothing product that addresses style concerns",
                "hook-question": "Write compelling question hooks for social media posts about fashion routines",
                "hook-statistic": "Create hooks using statistics about clothing benefits and results",
                "hook-story": "Write story-based hooks that connect with fashion journey experiences",
                "hook-problem": "Create problem-focused hooks that address common wardrobe issues"
            },
            "Storyboard (Script & Images)": {
                "script-tutorial": "Write a tutorial script for a styling routine video",
                "script-product": "Create a product demonstration script for a new serum launch",
                "script-testimonial": "Write a customer testimonial script showcasing transformation results",
                "script-educational": "Create an educational script about ingredient benefits",
                "script-behind-scenes": "Write a behind-the-scenes script about product development"
            },
            "Call To Action": {
                "cta-shop": "Create compelling 'Shop Now' call-to-action copy for clothing products",
                "cta-learn": "Write 'Learn More' CTAs for educational fashion content",
                "cta-subscribe": "Create newsletter subscription CTAs for style tips",
                "cta-follow": "Write social media follow CTAs for clothing brand",
                "cta-trial": "Create free trial CTAs for clothing sample campaigns"
            }
        };

        const actionPrompts = prompts[actionType];
        if (actionPrompts && actionPrompts[subcategory.id]) {
            return actionPrompts[subcategory.id];
        }
        
        return `Create content for ${actionType}: ${subcategory.label}`;
    };

    const handleNewChat = () => {
        setCurrentRoomId(null);
        setMessages([]);
        setInputValue('');
        setIsTyping(false);
        setSelectedQuickAction(null);
        setExpandedAction(null);
        setSelectedSubcategoryPrompt('');
        setSelectedCategory('');
        setSelectedSubCategory('');
        prevChatsRef.current = '';
    };

    return (
        <div className="flex h-full bg-transparent">
            {/* Chat History Sidebar */}
            <div className="flex-shrink-0">
                <ChatHistory 
                    currentChatType={Category.CONTENT}
                    onNewChat={handleNewChat}
                    onSelectChat={handleSelectChat}
                />
            </div>

            {/* Main Chat Area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-2 md:gap-4 p-2 sm:p-3 md:p-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-white/50 to-slate-50/50 dark:from-black/50 dark:to-black/50 backdrop-blur-sm flex-shrink-0">
                    <div className="relative">
                        <div className="relative">
                            <Avatar className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 border-2 border-white dark:border-black shadow-xl">
                                <AvatarImage src="/api/placeholder/48/48" alt="AI Content" />
                                <AvatarFallback className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 text-white text-sm md:text-lg font-bold">
                                    <PenTool className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white dark:border-black shadow-lg animate-pulse"></div>
                        </div>
                        <div className="absolute -inset-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-lg opacity-60"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-lg md:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent truncate">
                            AI Content Writer
                        </h3>
                        <p className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1 sm:gap-2">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="hidden sm:inline">Online • </span>Content Creator
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <Badge className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-400/10 dark:to-pink-400/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-medium text-[8px] sm:text-[10px] md:text-xs px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1">
                            <Sparkles className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 mr-0.5 sm:mr-1" />
                            <span className="hidden sm:inline">AI </span>Powered
                        </Badge>
                    </div>
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
                                            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                                                <PenTool className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                            </div>
                                            <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/30 to-pink-600/30 rounded-lg blur opacity-75"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                                                Welcome to AI Content Writer
                                            </h3>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                                I'm your creative content companion, specializing in clothing marketing and educational content. 
                                                Choose a content type below to get started.
                                            </p>
                                            

                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-2 md:space-y-3">
                            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Zap className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                Content Types
                            </h4>
                            <div className="space-y-2">
                                {quickActions.map((action, index) => (
                                    <div key={index} className="space-y-2">
                                        <Button
                                            variant="outline"
                                            className={`w-full h-auto p-3 md:p-4 flex items-center justify-between hover:shadow-xl transition-all duration-300 ${action.bgColor} ${action.borderColor} border hover:scale-[1.01] backdrop-blur-sm bg-white/80 dark:bg-black/80 rounded-xl group`}
                                            onClick={() => handleQuickAction(action.label)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${action.bgColor} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300`}>
                                                    <action.icon className={`h-4 w-4 md:h-5 md:w-5 ${action.color}`} />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                                                        {action.label}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                                            {action.label === "Hook" && "Capture attention instantly"}
                                                            {action.label === "Storyboard (Script & Images)" && "Visual storytelling content"}
                                                            {action.label === "Call To Action" && "Drive engagement & conversions"}
                                                            {action.label === "Custom" && "Free-form content creation"}
                                                        </span>
                                                        {selectedQuickAction?.startsWith(action.label) && (
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                                                                <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                                                                    <Sparkles className="h-2.5 w-2.5" />
                                                                    {selectedQuickAction.includes(': ') 
                                                                        ? selectedQuickAction.split(': ')[1] + ' Active'
                                                                        : action.label + ' Active'
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {action.label !== "Custom" && (
                                                <div className="flex items-center">
                                                    {expandedAction === action.label ? (
                                                        <ChevronUp className="h-4 w-4 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-200" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-200" />
                                                    )}
                                                </div>
                                            )}
                                        </Button>

                                        {/* Enhanced Subcategories */}
                                        {expandedAction === action.label && action.label !== "Custom" && (
                                                                                            <div className="overflow-hidden">
                                                <div className="bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-black/90 dark:to-gray-900/90 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl p-3 md:p-4 animate-in slide-in-from-top-2 duration-500 ease-out">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                                                        {subcategories[action.label as keyof typeof subcategories]?.map((subcategory, subIndex) => (
                                                            <div
                                                                key={subcategory.id}
                                                                className="animate-in fade-in-50 duration-300"
                                                                style={{ animationDelay: `${subIndex * 80}ms` }}
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    className="w-full h-auto p-3 text-left bg-white/70 dark:bg-black/70 hover:bg-white dark:hover:bg-black border border-slate-200/50 dark:border-slate-700/50 rounded-lg transition-all duration-300 hover:shadow-md hover:scale-[1.01] group backdrop-blur-sm"
                                                                    onClick={() => handleSubcategorySelect(action.label, subcategory)}
                                                                >
                                                                    <div className="flex items-start gap-2.5 w-full">
                                                                        <div className={`w-8 h-8 rounded-lg ${subcategory.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
                                                                            <subcategory.icon className={`h-4 w-4 ${subcategory.color}`} />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors duration-200">
                                                                                {subcategory.label}
                                                                            </div>
                                                                            <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-200">
                                                                                {subcategory.description}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                            <ArrowUp className="h-3 w-3 text-slate-400 rotate-45" />
                                                                        </div>
                                                                    </div>
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    
                                                    {/* Quick stats */}
                                                    <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                                                        <div className="flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                                            <div className="flex items-center gap-1">
                                                                <Sparkles className="h-3 w-3" />
                                                                <span>{subcategories[action.label as keyof typeof subcategories]?.length} options</span>
                                                            </div>
                                                            <div className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                                                            <div className="flex items-center gap-1">
                                                                <Zap className="h-3 w-3" />
                                                                <span>AI-powered</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
                                                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                                                        <PenTool className="h-3 w-3 md:h-4 md:w-4" />
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
                                    placeholder={
                                        !selectedQuickAction 
                                            ? "Please select a content type above to start..." 
                                            : selectedSubcategoryPrompt 
                                                ? "Describe your specific requirements (AI will use specialized prompts automatically)..." 
                                                : "Tell me what content you'd like to create..."
                                    }
                                    className="h-10 md:h-12 pl-3 md:pl-4 pr-10 md:pr-12 text-sm bg-white/80 dark:bg-black/80 backdrop-blur-sm border-2 border-slate-200/50 dark:border-slate-700/50 rounded-lg md:rounded-xl shadow-lg focus:border-purple-400 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-400/20 dark:focus:ring-purple-500/20 transition-all duration-300"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey && selectedQuickAction) {
                                            e.preventDefault();
                                            handleSendMessage(inputValue);
                                        }
                                    }}
                                    disabled={isTyping || !selectedQuickAction}
                                />
                            </div>
                            <Button 
                                onClick={() => handleSendMessage(inputValue)}
                                disabled={!inputValue.trim() || isTyping || !selectedQuickAction}
                                className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg md:rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <ArrowUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            </Button>
                        </div>
                    </div>
                    <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-2 md:mt-3 text-center">
                        {!selectedQuickAction 
                            ? "Select a content type above to enable chat input."
                            : selectedSubcategoryPrompt 
                                ? "✨ Specialized AI prompt is active - just describe what you want and I'll handle the rest!"
                                : "Shop-Intel Content Writer creates engaging, brand-focused content."
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIContent;