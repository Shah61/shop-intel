"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Bot, User, ArrowUp, Plus, Search, Clock,
    MoreHorizontal, Trash2, Edit3, History,
    Paperclip, Mic, Sparkles, MessageSquare, TrendingUp,
    BarChart2, DollarSign, ShoppingCart, Zap, HelpCircle,
} from 'lucide-react';
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetRoomHistory, useDeleteRoom, useGetChatHistory, useCreateChatAssistant, useCreateRoom } from '../../tanstack/ai-tanstack';
import { Category, Chat, Room, Message } from '../../../data/model/ai-model';
import { useToast } from '@/hooks/use-toast';
import { useSession } from "@/src/core/lib/dummy-session-provider";
import { useTheme } from 'next-themes';
import Markdown from '../../../../../components/ui/markdown';

// ─── Suggested Actions ────────────────────────────────────────────────────────
const ACTIONS = [
    { icon: <BarChart2 className="w-3.5 h-3.5" />, label: "Audit finances",   prompt: "Perform a financial audit of my business performance" },
    { icon: <ShoppingCart className="w-3.5 h-3.5" />, label: "Boost sales",   prompt: "Suggest sales strategy based on sales performance and dynamic pricing" },
    { icon: <DollarSign className="w-3.5 h-3.5" />, label: "Tax planning",    prompt: "Assist me with tax management and planning strategies" },
    { icon: <TrendingUp className="w-3.5 h-3.5" />, label: "Optimize spend",  prompt: "Give me advice on how to spend and what needs to be optimized" },
    { icon: <Zap className="w-3.5 h-3.5" />, label: "Demand forecast",        prompt: "Help with demand forecasting for my products" },
    { icon: <HelpCircle className="w-3.5 h-3.5" />, label: "Find waste",      prompt: "Help me categorize my expenses and detect waste in my spending" },
];

// ─── Typing Dots ──────────────────────────────────────────────────────────────
const TypingDots = () => (
    <span className="inline-flex items-center gap-1 px-1 py-2">
        {[0,1,2].map(i => (
            <span key={i}
                className="w-1.5 h-1.5 rounded-full animate-bounce opacity-60"
                style={{ background: 'var(--preset-primary)', animationDelay: `${i * 0.18}s`, animationDuration: '0.8s' }}
            />
        ))}
    </span>
);

// ─── Aurora BG (uses layout preset) ────────────────────────────────────────────
const Aurora = () => (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-8%] left-[10%] w-[60vw] h-[55vh] rounded-full opacity-[0.12]
            blur-[90px] animate-aurora-1"
            style={{ background: 'radial-gradient(ellipse at center, var(--preset-primary) 0%, transparent 70%)' }} />
        <div className="absolute top-[5%] right-[5%] w-[40vw] h-[40vh] rounded-full opacity-[0.08]
            blur-[100px] animate-aurora-2"
            style={{ background: 'radial-gradient(ellipse at center, var(--preset-lighter) 0%, transparent 70%)' }} />
        <div className="absolute top-[25%] left-[35%] w-[28vw] h-[28vh] rounded-full opacity-[0.06]
            blur-[70px] animate-aurora-3"
            style={{ background: 'radial-gradient(ellipse at center, var(--preset-primary) 0%, transparent 70%)' }} />
    </div>
);

// ─── Message Bubble (uses layout preset + theme vars) ───────────────────────────
const Bubble = ({ msg }: { msg: Message }) => {
    const isUser = msg.sender === 'user';
    return (
        <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            {!isUser && (
                <div className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center shadow-lg"
                    style={{ background: 'var(--preset-primary)', boxShadow: '0 4px 14px rgba(var(--preset-primary-rgb, 124, 58, 237), 0.25)' }}>
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
            )}
            <div className={`max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed rounded-tr-sm ${isUser ? 'border' : ''}`}
                    style={isUser
                        ? { background: 'var(--ai-bubble-user-bg)', color: 'var(--ai-bubble-user-text)', borderColor: 'var(--ai-border)' }
                        : { color: 'var(--ai-bubble-ai-text)' }
                    }
                >
                    {isUser
                        ? <p>{msg.content}</p>
                        : msg.content
                            ? <Markdown content={msg.content}
                                className="prose prose-invert prose-sm max-w-none [&_p]:leading-relaxed [&_code]:text-[var(--preset-lighter)] [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-[#161e2a] [&_pre]:border [&_pre]:border-white/[0.06] [&_pre]:rounded-xl ai-bubble-markdown" />
                            : <TypingDots />
                    }
                </div>
                <span className="text-[10px] mt-1.5 px-1" style={{ color: 'var(--ai-bubble-time)' }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
            {isUser && (
                <div className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center border" style={{ background: 'var(--ai-avatar-user-bg)', borderColor: 'var(--ai-border)', color: 'var(--ai-muted)' }}>
                    <User className="w-3.5 h-3.5" />
                </div>
            )}
        </div>
    );
};

// ─── History dropdown (replaces sidebar) ───────────────────────────────────────
interface HistoryDropdownProps {
    selectedChatId: string | null;
    setSelectedChatId: (id: string | null) => void;
    onNewChat: () => void;
    userId: string;
    chatHistoryResponse: any;
    onSelectRoom: (roomId: string, chats: Chat[]) => void;
    isLight?: boolean;
}

const LIGHT_DROPDOWN = {
    panel: '#f4f4f5',
    border: 'rgba(0,0,0,0.08)',
    text: '#18181b',
    muted: '#71717a',
    inputBg: 'rgba(0,0,0,0.04)',
};

const DARK_DROPDOWN = {
    panel: '#151d27',
    border: 'rgba(255,255,255,0.08)',
    text: 'rgba(255,255,255,0.9)',
    muted: 'rgba(255,255,255,0.45)',
    inputBg: 'rgba(255,255,255,0.06)',
};

const HistoryDropdown: React.FC<HistoryDropdownProps> = ({
    selectedChatId, setSelectedChatId, onNewChat, userId,
    chatHistoryResponse, onSelectRoom, isLight
}) => {
    const [search, setSearch] = useState('');
    const { toast } = useToast();
    const prevKey = useRef('');
    const { data: roomsRes, isLoading, refetch } = useGetRoomHistory(Category.ASSISTANT, userId);
    const deleteRoom = useDeleteRoom(selectedChatId ?? '');

    useEffect(() => {
        if (!selectedChatId || !chatHistoryResponse?.data) return;
        const chats = chatHistoryResponse.data.chats || [];
        const key = `${selectedChatId}-${chats.length}`;
        if (key === prevKey.current) return;
        prevKey.current = key;
        onSelectRoom(selectedChatId, chats);
    }, [selectedChatId, chatHistoryResponse, onSelectRoom]);

    const rooms: Room[] = (roomsRes?.data?.rooms || []).filter((r: Room) =>
        r.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await deleteRoom.mutateAsync();
            if (id === selectedChatId) { setSelectedChatId(null); onNewChat(); }
            refetch();
            toast({ title: "Deleted", duration: 2000 });
        } catch {
            toast({ title: "Error", variant: "destructive", duration: 2000 });
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="h-8 w-8 flex items-center justify-center rounded-xl transition-all hover:opacity-80"
                    style={{ color: 'var(--ai-muted)' }}
                >
                    <History className="w-4 h-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                sideOffset={8}
                className={`min-w-[280px] max-h-[min(70vh,400px)] overflow-hidden flex flex-col rounded-xl border shadow-xl p-0 ${!isLight ? 'ai-history-dropdown-dark' : ''}`}
                style={isLight ? { background: LIGHT_DROPDOWN.panel, borderColor: LIGHT_DROPDOWN.border } : { background: DARK_DROPDOWN.panel, borderColor: DARK_DROPDOWN.border }}
            >
                <div className="p-3 border-b flex items-center justify-between gap-2" style={{ borderColor: isLight ? LIGHT_DROPDOWN.border : DARK_DROPDOWN.border }}>
                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: isLight ? LIGHT_DROPDOWN.muted : DARK_DROPDOWN.muted }}>Chat history</span>
                    <button
                        type="button"
                        onClick={onNewChat}
                        className="h-7 w-7 flex items-center justify-center rounded-lg transition-all hover:opacity-80"
                        style={{ color: isLight ? LIGHT_DROPDOWN.muted : DARK_DROPDOWN.muted }}
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className="p-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: isLight ? LIGHT_DROPDOWN.muted : DARK_DROPDOWN.muted }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search…"
                            className="w-full pl-7 pr-3 py-1.5 text-[11px] rounded-lg focus:outline-none transition-all"
                            style={{ background: isLight ? LIGHT_DROPDOWN.inputBg : DARK_DROPDOWN.inputBg, border: `1px solid ${isLight ? LIGHT_DROPDOWN.border : DARK_DROPDOWN.border}`, color: isLight ? LIGHT_DROPDOWN.text : DARK_DROPDOWN.text }}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5 min-h-0">
                    {isLoading && [1,2,3,4].map(i => (
                        <div key={i} className="h-10 rounded-xl animate-pulse mb-1" style={{ background: isLight ? LIGHT_DROPDOWN.inputBg : DARK_DROPDOWN.inputBg }} />
                    ))}
                    {!isLoading && rooms.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <MessageSquare className="w-5 h-5" style={{ color: isLight ? LIGHT_DROPDOWN.muted : DARK_DROPDOWN.muted }} />
                            <p className="text-[11px]" style={{ color: isLight ? LIGHT_DROPDOWN.muted : DARK_DROPDOWN.muted }}>{search ? 'Nothing found' : 'No chats yet'}</p>
                        </div>
                    )}
                    {!isLoading && rooms.map((room: Room) => (
                        <div
                            key={room.id}
                            onClick={() => setSelectedChatId(room.id)}
                            className="history-room-row flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer group transition-all duration-150 border border-transparent"
                            style={selectedChatId === room.id
                                ? { background: 'rgba(var(--preset-primary-rgb, 124, 58, 237), 0.12)', borderColor: 'rgba(var(--preset-primary-rgb, 124, 58, 237), 0.25)' }
                                : isLight ? { borderColor: 'transparent' } : { borderColor: 'transparent' }
                            }
                        >
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: isLight ? LIGHT_DROPDOWN.inputBg : DARK_DROPDOWN.inputBg }}>
                                <Bot className="w-3 h-3" style={{ color: isLight ? LIGHT_DROPDOWN.muted : DARK_DROPDOWN.muted }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-medium truncate leading-tight" style={{ color: isLight ? LIGHT_DROPDOWN.text : DARK_DROPDOWN.text }}>{room.name}</p>
                                <p className="text-[9px] flex items-center gap-1 mt-0.5" style={{ color: isLight ? LIGHT_DROPDOWN.muted : DARK_DROPDOWN.muted }}>
                                    <Clock className="w-2 h-2" />
                                    {new Date(room.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button type="button" onClick={e => e.stopPropagation()}
                                        className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded-md transition-all"
                                        style={{ color: isLight ? LIGHT_DROPDOWN.muted : DARK_DROPDOWN.muted }}
                                    >
                                        <MoreHorizontal className="w-3 h-3" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl min-w-[130px] border shadow-xl" style={isLight ? { background: LIGHT_DROPDOWN.panel, borderColor: LIGHT_DROPDOWN.border } : { background: DARK_DROPDOWN.panel, borderColor: DARK_DROPDOWN.border }}>
                                    <DropdownMenuItem className="text-[11px] rounded-lg cursor-pointer gap-2" style={{ color: isLight ? LIGHT_DROPDOWN.text : DARK_DROPDOWN.text }}>
                                        <Edit3 className="w-3 h-3" /> Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={e => handleDelete(room.id, e)}
                                        disabled={deleteRoom.isPending}
                                        className="text-[11px] text-red-400/80 hover:text-red-300 rounded-lg cursor-pointer gap-2"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        {deleteRoom.isPending ? 'Deleting…' : 'Delete'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

// ─── Input Box ────────────────────────────────────────────────────────────────
interface InputBoxProps {
    value: string;
    onChange: (v: string) => void;
    onSend: (v: string) => void;
    disabled: boolean;
    isCentered: boolean;
}

const InputBox: React.FC<InputBoxProps> = ({ value, onChange, onSend, disabled, isCentered }) => {
    const ref = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.style.height = 'auto';
            ref.current.style.height = `${Math.min(ref.current.scrollHeight, 160)}px`;
        }
    }, [value]);

    useEffect(() => {
        if (!disabled && ref.current) ref.current.focus();
    }, [disabled]);

    return (
        <div className={`w-full transition-all duration-500 ease-out ${isCentered ? 'max-w-2xl' : 'max-w-3xl'}`}>
            <div
                className="relative rounded-2xl border transition-all duration-300 ai-input-field"
                style={{
                    background: 'var(--ai-input-field-bg)',
                    borderColor: value ? 'rgba(var(--preset-primary-rgb, 124, 58, 237), 0.35)' : 'var(--ai-input-field-border)',
                    boxShadow: isCentered
                        ? '0 20px 80px rgba(0,0,0,0.5), 0 0 80px rgba(var(--preset-primary-rgb, 124, 58, 237), 0.06)'
                        : '0 8px 40px rgba(0,0,0,0.4)',
                }}
            >
                {/* Placeholder for centered mode */}
                {isCentered && !value && (
                    <div className="absolute left-4 top-[18px] text-sm pointer-events-none select-none" style={{ color: 'var(--ai-input-field-placeholder)' }}>
                        Ask me anything about your business…
                    </div>
                )}

                <textarea
                    ref={ref}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={!isCentered ? "Continue the conversation…" : ""}
                    rows={1}
                    disabled={disabled}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(value); }
                    }}
                    className="w-full bg-transparent px-4 pt-4 pb-2 text-sm resize-none focus:outline-none leading-relaxed min-h-[58px] max-h-[160px]"
                    style={{ color: 'var(--ai-input-field-text)' }}
                />

                {/* Bottom toolbar */}
                <div className="flex items-center justify-between px-3 pb-3">
                    <div className="flex items-center gap-1.5">
                        <button className="h-7 w-7 flex items-center justify-center rounded-xl transition-all hover:opacity-80"
                            style={{ color: 'var(--ai-muted)' }}>
                            <Paperclip className="w-3.5 h-3.5" />
                        </button>
                        <button className="h-7 w-7 flex items-center justify-center rounded-xl transition-all hover:opacity-80"
                            style={{ color: 'var(--ai-muted)' }}>
                            <Mic className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <button
                        onClick={() => onSend(value)}
                        disabled={!value.trim() || disabled}
                        className="h-8 w-8 flex items-center justify-center rounded-xl transition-all duration-200"
                        style={value.trim() && !disabled
                            ? { background: 'var(--preset-primary)', color: '#fff', boxShadow: '0 4px 20px rgba(var(--preset-primary-rgb, 124, 58, 237), 0.35)' }
                            : { background: 'var(--ai-input-bg)', color: 'var(--ai-muted)', cursor: 'not-allowed' }
                        }
                    >
                        <ArrowUp className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <p className="text-[10px] text-center mt-2" style={{ color: 'var(--ai-muted)' }}>
                AI may make mistakes · Verify important information
            </p>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AIAssistant: React.FC = () => {
    const { resolvedTheme } = useTheme();
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [hasStarted, setHasStarted] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { data: session } = useSession();
    const user_id = session?.user_entity?.id ?? 'demo-user-id';
    const userName = session?.user_entity?.name ?? 'there';

    const createChat = useCreateChatAssistant();
    const createRoom = useCreateRoom();
    const { data: chatHistoryResponse } = useGetChatHistory(selectedChatId ?? '');

    useEffect(() => {
        if (messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSelectRoom = useCallback((roomId: string, chats: Chat[]) => {
        setCurrentRoomId(roomId);
        setHasStarted(chats.length > 0);
        setMessages(chats.length > 0
            ? chats.map(c => ({
                id: c.id,
                content: c.message || '',
                sender: c.role === 'USER' ? 'user' as const : 'ai' as const,
                timestamp: new Date(c.created_at),
            }))
            : []
        );
    }, []);

    const handleNewChat = () => {
        setCurrentRoomId(null);
        setSelectedChatId(null);
        setMessages([]);
        setInputValue('');
        setIsTyping(false);
        setHasStarted(false);
    };

    const handleSend = async (content: string) => {
        if (!content.trim() || isTyping) return;

        setHasStarted(true); // triggers layout transition

        const userMsg: Message = {
            id: Date.now().toString(),
            content: content.trim(),
            sender: 'user',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        const tempId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: tempId, content: '', sender: 'ai', timestamp: new Date() }]);

        try {
            let roomId = currentRoomId;
            if (!roomId) {
                const r = await createRoom.mutateAsync({ category: Category.ASSISTANT, user_id });
                roomId = r.data.rooms.id;
                setCurrentRoomId(roomId);
            }
            const response = await createChat.mutateAsync({
                room_id: roomId!,
                message: content.trim(),
                role: 'USER',
            });
            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader');

            let acc = '', actualId = tempId;
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = new TextDecoder().decode(value);
                for (const line of chunk.split('\n').filter(l => l.trim())) {
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
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                content: 'Something went wrong. Please try again.',
                sender: 'ai',
                timestamp: new Date(),
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            <style>{`
                .ai-assistant-root {
                    --ai-bg: #131820;
                    --ai-panel: #151d27;
                    --ai-border: rgba(255,255,255,0.06);
                    --ai-text: rgba(255,255,255,0.9);
                    --ai-muted: rgba(255,255,255,0.4);
                    --ai-input-bg: rgba(255,255,255,0.05);
                    --ai-accent: var(--preset-primary, #7c3aed);
                    --ai-accent-rgb: var(--preset-primary-rgb, 124, 58, 237);
                    --ai-bubble-user-bg: #1b2436;
                    --ai-bubble-user-text: rgba(255,255,255,0.85);
                    --ai-bubble-ai-text: rgba(255,255,255,0.8);
                    --ai-bubble-time: rgba(255,255,255,0.2);
                    --ai-avatar-user-bg: rgba(255,255,255,0.06);
                    --ai-welcome-gradient: linear-gradient(140deg, #ffffff 0%, var(--preset-lighter) 50%, var(--preset-primary) 100%);
                    --ai-input-field-bg: #161e2c;
                    --ai-input-field-border: rgba(255,255,255,0.07);
                    --ai-input-field-text: rgba(255,255,255,0.85);
                    --ai-input-field-placeholder: rgba(255,255,255,0.18);
                }
                .ai-assistant-root.light {
                    --ai-bg: #ffffff;
                    --ai-panel: #f4f4f5;
                    --ai-border: rgba(0,0,0,0.08);
                    --ai-text: #18181b;
                    --ai-muted: #71717a;
                    --ai-input-bg: rgba(0,0,0,0.04);
                    --ai-bubble-user-bg: #f4f4f5;
                    --ai-bubble-user-text: #18181b;
                    --ai-bubble-ai-text: #18181b;
                    --ai-bubble-time: #71717a;
                    --ai-avatar-user-bg: #e4e4e7;
                    --ai-welcome-gradient: linear-gradient(135deg, #18181b 0%, var(--preset-primary) 50%, var(--preset-lighter) 100%);
                    --ai-input-field-bg: #e4e4e7;
                    --ai-input-field-border: rgba(0,0,0,0.1);
                    --ai-input-field-text: #18181b;
                    --ai-input-field-placeholder: #71717a;
                }
                .ai-assistant-root.light .ai-bubble-markdown,
                .ai-assistant-root.light .ai-bubble-markdown p,
                .ai-assistant-root.light .ai-bubble-markdown li,
                .ai-assistant-root.light .ai-bubble-markdown code { color: #18181b !important; }
                .ai-assistant-root.light .ai-bubble-markdown pre { background: #e4e4e7 !important; border-color: rgba(0,0,0,0.1) !important; }
                .ai-assistant-root.light .ai-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); }
                .ai-assistant-root.light .ai-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.25); }
                .history-dropdown-content[data-theme="light"] .history-room-row:hover { border-color: rgba(0,0,0,0.08) !important; }
                .ai-welcome-title { background-repeat: no-repeat; background-color: transparent; background-size: 200% 100%; animation: ai-welcome-shine 5s ease-in-out infinite; }
                @keyframes ai-welcome-shine {
                    0%, 100% { background-position: 0% center; }
                    50% { background-position: 100% center; }
                }
                @keyframes aurora1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(3%,4%) scale(1.08)}}
                @keyframes aurora2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-4%,3%) scale(1.06)}}
                @keyframes aurora3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(2%,-3%) scale(1.1)}}
                .animate-aurora-1{animation:aurora1 14s ease-in-out infinite}
                .animate-aurora-2{animation:aurora2 18s ease-in-out infinite}
                .animate-aurora-3{animation:aurora3 11s ease-in-out infinite}
                .ai-scrollbar::-webkit-scrollbar{width:4px}
                .ai-scrollbar::-webkit-scrollbar-track{background:transparent}
                .ai-scrollbar::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.06);border-radius:99px}
                .ai-scrollbar::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.12)}
            `}</style>

            <div className={`ai-assistant-root flex h-full overflow-hidden ${resolvedTheme === 'light' ? 'light' : ''}`} style={{ background: 'var(--ai-bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

                {/* Main */}
                <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">

                    {/* Aurora (only on welcome) */}
                    {!hasStarted && <Aurora />}

                    {/* Topbar */}
                    <header className="flex items-center justify-between px-4 py-3 flex-shrink-0 relative z-10">
                        <div className="flex items-center gap-2">
                            <HistoryDropdown
                                selectedChatId={selectedChatId}
                                setSelectedChatId={setSelectedChatId}
                                onNewChat={handleNewChat}
                                userId={user_id}
                                chatHistoryResponse={chatHistoryResponse}
                                onSelectRoom={handleSelectRoom}
                                isLight={resolvedTheme === 'light'}
                            />
                            <button
                                type="button"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all hover:opacity-90"
                                style={{ background: 'var(--ai-input-bg)', border: '1px solid var(--ai-border)' }}
                            >
                                
                                <span className="text-xs font-medium" style={{ color: 'var(--ai-text)' }}>AI Assistant</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleNewChat}
                            className="h-8 w-8 flex items-center justify-center rounded-xl transition-all hover:opacity-80"
                            style={{ color: 'var(--ai-muted)' }}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </header>

                    {/* ── WELCOME STATE — input centered ── */}
                    {!hasStarted && (
                        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6 relative z-10">

                            {/* Greeting block */}
                            <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <div className="w-9 h-9 flex items-center justify-center">
                                        <img src="/AssistantIcon.png" alt="" className="w-7 h-7 object-contain" />
                                    </div>
                                    <span className="text-sm font-medium" style={{ color: 'var(--ai-muted)' }}>
                                        Hi, {userName}
                                    </span>
                                </div>

                                <h1 className="ai-welcome-title text-[42px] sm:text-[56px] font-bold tracking-tight leading-[1.1] mb-0 inline-block"
                                    style={{
                                        backgroundImage: 'var(--ai-welcome-gradient)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}>
                                    Where should<br />we start?
                                </h1>
                            </div>

                            {/* Input — centered */}
                            <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                                <InputBox
                                    value={inputValue}
                                    onChange={setInputValue}
                                    onSend={handleSend}
                                    disabled={isTyping}
                                    isCentered={true}
                                />
                            </div>

                            {/* Action pills */}
                            <div className="flex flex-wrap gap-2 justify-center max-w-2xl mt-5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                                {ACTIONS.map((a, i) => (
                                    <button key={i} onClick={() => handleSend(a.prompt)}
                                        className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 group"
                                        style={{
                                            background: 'var(--ai-input-bg)',
                                            border: '1px solid var(--ai-border)',
                                            color: 'var(--ai-muted)',
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLElement).style.background = 'rgba(var(--preset-primary-rgb, 124, 58, 237), 0.12)';
                                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(var(--preset-primary-rgb, 124, 58, 237), 0.3)';
                                            (e.currentTarget as HTMLElement).style.color = 'var(--ai-text)';
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLElement).style.background = 'var(--ai-input-bg)';
                                            (e.currentTarget as HTMLElement).style.borderColor = 'var(--ai-border)';
                                            (e.currentTarget as HTMLElement).style.color = 'var(--ai-muted)';
                                        }}
                                    >
                                        <span style={{ color: 'var(--preset-primary)' }}>{a.icon}</span>
                                        {a.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── CHAT STATE — input at bottom ── */}
                    {hasStarted && (
                        <>
                            <div className="flex-1 overflow-y-auto ai-scrollbar px-4 py-6 relative z-10">
                                <div className="max-w-3xl mx-auto space-y-5">
                                    {messages.map(msg => <Bubble key={msg.id} msg={msg} />)}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* Bottom input — slides in */}
                            <div className="flex-shrink-0 px-4 pb-4 pt-2 z-10 flex justify-center
                                animate-in slide-in-from-bottom-6 fade-in duration-500">
                                <InputBox
                                    value={inputValue}
                                    onChange={setInputValue}
                                    onSend={handleSend}
                                    disabled={isTyping}
                                    isCentered={false}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default AIAssistant;