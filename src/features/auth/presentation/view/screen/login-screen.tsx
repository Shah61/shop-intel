'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, Mail, AlertCircle, UserPlus, LogIn, TrendingUp, Package, ShoppingCart, BarChart3, Sparkles, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link';

/* ─── Floating orbs for right panel ─── */
function FloatingOrbs() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
                className="absolute -top-[20%] -right-[10%] h-[500px] w-[500px] rounded-full opacity-[0.18]"
                style={{
                    background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
                    animation: 'pulse-float-1 14s ease-in-out infinite',
                }}
            />
            <div
                className="absolute bottom-[10%] -left-[15%] h-[400px] w-[400px] rounded-full opacity-[0.12]"
                style={{
                    background: 'radial-gradient(circle, #c026d3 0%, transparent 70%)',
                    animation: 'pulse-float-2 18s ease-in-out infinite',
                }}
            />
            <div
                className="absolute top-[40%] right-[20%] h-[300px] w-[300px] rounded-full opacity-[0.08]"
                style={{
                    background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)',
                    animation: 'pulse-float-3 20s ease-in-out infinite',
                }}
            />
        </div>
    );
}

/* ─── Particles ─── */
function Particles() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 15 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: `${Math.random() * 3 + 1}px`,
                        height: `${Math.random() * 3 + 1}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        background: ['#a78bfa', '#e879f9', '#818cf8', '#c084fc'][Math.floor(Math.random() * 4)],
                        opacity: Math.random() * 0.35 + 0.1,
                        animation: `pulse-particle ${Math.random() * 6 + 8}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 5}s`,
                    }}
                />
            ))}
        </div>
    );
}

/* ─── Feature card for right panel ─── */
function FeatureCard({
    icon: Icon,
    title,
    description,
    delay,
    mounted,
}: {
    icon: React.ElementType
    title: string
    description: string
    delay: number
    mounted: boolean
}) {
    return (
        <div
            className="group flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm transition-all duration-500 hover:border-purple-500/20 hover:bg-white/[0.06]"
            style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(30px)',
                transition: `all 0.7s cubic-bezier(.22,1,.36,1) ${delay}s`,
            }}
        >
            <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{
                    background: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(232,121,249,0.1))',
                }}
            >
                <Icon className="h-5 w-5 text-purple-400" />
            </div>
            <div>
                <h3 className="text-[14px] font-semibold text-white">{title}</h3>
                <p className="mt-0.5 text-[12px] leading-relaxed text-white/55">{description}</p>
            </div>
        </div>
    );
}

const FEATURES = [
    { icon: BarChart3, title: 'Unified Sales Analytics', description: 'Track performance across all channels in one view' },
    { icon: Brain, title: 'AI-Powered Intelligence', description: 'Get instant answers and deep analysis from your data' },
    { icon: ShoppingCart, title: 'Campaign Intelligence', description: 'Optimize marketing ROI with AI storyboarding' },
    { icon: Package, title: 'Smart Inventory Control', description: 'Predict demand and prevent stockouts in real time' },
    { icon: TrendingUp, title: 'Trend & Competitor Radar', description: 'Stay ahead of market shifts before they happen' },
    { icon: Sparkles, title: 'Physical Retail Analytics', description: 'Your stores reported with online-level precision' },
];

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('admin');
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(t);
    }, []);

    const onMouseMove = (e: React.MouseEvent) => {
        const el = formRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
        el.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email || !password) { setError('Please fill in all fields'); return; }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) { setError('Please enter a valid email address'); return; }
        if (isRegisterMode) {
            if (password.length < 8) { setError('Password must be at least 8 characters long'); return; }
            if (password !== confirmPassword) { setError('Passwords do not match'); return; }
        }
        setError('');
        setIsLoading(true);
        try {
            if (typeof window !== 'undefined' && (window as any).__dummySetSession) {
                const dummySession = {
                    user: { name: 'Pulse User', email: 'user@pulse.tech' },
                    user_entity: {
                        id: `user-${Date.now()}`,
                        email: 'user@pulse.tech',
                        role: activeTab === "admin" ? "ADMIN" : "STAFF",
                        name: 'Pulse User',
                    },
                    backend_tokens: {
                        access_token: 'dummy-access-token',
                        refresh_token: 'dummy-refresh-token',
                        expires_in: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    },
                    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                };
                (window as any).__dummySetSession(dummySession);
                if (isRegisterMode) {
                    toast.success(`Staff account created for ${email}`);
                    setIsRegisterMode(false);
                    setEmail(''); setPassword(''); setConfirmPassword('');
                } else {
                    toast.success('Welcome to Pulse');
                    router.push('/sales');
                }
            } else {
                localStorage.setItem('dummy-logged-in', 'true');
                toast.success('Welcome to Pulse');
                router.push('/sales');
            }
        } catch (error: any) {
            setError(error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @keyframes pulse-float-1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -40px) scale(1.05); }
                    66% { transform: translate(-20px, 20px) scale(0.95); }
                }
                @keyframes pulse-float-2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-40px, 30px) scale(1.08); }
                    66% { transform: translate(25px, -35px) scale(0.92); }
                }
                @keyframes pulse-float-3 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(35px, -25px) scale(1.1); }
                }
                @keyframes pulse-particle {
                    0%, 100% { transform: translateY(0) scale(1); opacity: 0.15; }
                    50% { transform: translateY(-30px) scale(1.5); opacity: 0.4; }
                }
                @keyframes pulse-border-glow {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.7; }
                }
                .pulse-form-card {
                    position: relative;
                }
                .pulse-form-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    background: radial-gradient(
                        600px circle at var(--glow-x, 50%) var(--glow-y, 50%),
                        rgba(167, 139, 250, 0.04),
                        transparent 50%
                    );
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.5s ease;
                }
                .pulse-form-card:hover::before {
                    opacity: 1;
                }
                .pulse-input {
                    background: rgba(255, 255, 255, 0.03) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    color: white !important;
                    transition: all 0.3s ease !important;
                }
                .pulse-input:focus {
                    border-color: rgba(167, 139, 250, 0.4) !important;
                    box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.08), 0 0 24px rgba(124, 58, 237, 0.08) !important;
                    background: rgba(255, 255, 255, 0.05) !important;
                }
                .pulse-input::placeholder {
                    color: rgba(255, 255, 255, 0.35) !important;
                }
                .pulse-submit-btn {
                    background: linear-gradient(135deg, #7c3aed, #c026d3) !important;
                    border: none !important;
                    color: white !important;
                    box-shadow: 0 8px 32px rgba(124, 58, 237, 0.3);
                    transition: all 0.3s ease !important;
                    position: relative;
                    overflow: hidden;
                }
                .pulse-submit-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, #8b5cf6, #d946ef);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .pulse-submit-btn:hover {
                    box-shadow: 0 12px 40px rgba(124, 58, 237, 0.5) !important;
                    transform: translateY(-1px);
                }
                .pulse-submit-btn:hover::before { opacity: 1; }
                .pulse-submit-btn span { position: relative; z-index: 1; }
                .pulse-tab-list {
                    background: rgba(255, 255, 255, 0.03) !important;
                    border: 1px solid rgba(255, 255, 255, 0.06) !important;
                }
                .pulse-tab-trigger {
                    color: rgba(255, 255, 255, 0.4) !important;
                    transition: all 0.3s ease !important;
                }
                .pulse-tab-trigger[data-state="active"] {
                    background: linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(192, 38, 211, 0.2)) !important;
                    color: white !important;
                    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2) !important;
                }
            `}</style>

            <div className="relative flex min-h-screen w-full overflow-hidden bg-[#0a0815]">

                {/* ════════════ LEFT SIDE — Form ════════════ */}
                <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-12 md:w-1/2 md:px-10 lg:px-16">

                    {/* Subtle left-side background glow */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div
                            className="absolute -bottom-[30%] -left-[20%] h-[500px] w-[500px] rounded-full opacity-[0.06]"
                            style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
                        />
                    </div>

                    {/* Back to home link */}
                    <div
                        className="absolute top-6 left-6 md:top-8 md:left-10 lg:left-16"
                        style={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'translateY(0)' : 'translateY(-10px)',
                            transition: 'all 0.6s ease 0.15s',
                        }}
                    >
                        <Link
                            href="/home"
                            className="bg-gradient-to-br from-violet-400 via-fuchsia-400 to-pink-300 bg-clip-text text-[20px] font-bold tracking-[5px] text-transparent uppercase sm:text-[22px]"
                            style={{ fontFamily: "'DM Sans', monospace" }}
                        >
                            Pulse
                        </Link>
                    </div>

                    {/* Form container */}
                    <div
                        ref={formRef}
                        onMouseMove={onMouseMove}
                        className="pulse-form-card w-full max-w-[420px]"
                        style={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                            transition: 'all 0.8s cubic-bezier(.22,1,.36,1) 0.3s',
                        }}
                    >
                        {/* Header */}
                        <div className="mb-8">
                            <h1
                                className="mb-2 text-[28px] font-bold text-white"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                {isRegisterMode ? 'Create Account' : 'Welcome back'}
                            </h1>
                            <p className="text-[14px] text-white/55">

{isRegisterMode
                                    ? 'Create a staff account to get started'
                                    : 'Sign in to your Pulse dashboard'
                                }
                            </p>
                        </div>

                        {/* Tabs + Form */}
                        <Tabs
                            defaultValue="admin"
                            className="w-full"
                            onValueChange={(tab) => {
                                setActiveTab(tab);
                                setIsRegisterMode(false);
                                setError(''); setPassword(''); setConfirmPassword('');
                            }}
                        >
                            <TabsList className="pulse-tab-list mb-6 grid w-full grid-cols-2 rounded-xl p-1">
                                <TabsTrigger value="admin" className="pulse-tab-trigger flex items-center gap-2 rounded-lg text-sm">
                                    <LogIn className="h-4 w-4" /> Admin
                                </TabsTrigger>
                                <TabsTrigger value="staff" className="pulse-tab-trigger flex items-center gap-2 rounded-lg text-sm">
                                    <UserPlus className="h-4 w-4" /> Staff
                                </TabsTrigger>
                            </TabsList>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <Alert variant="destructive" className="border-red-500/30 bg-red-500/10 text-red-300">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                {/* Admin tab */}
                                <TabsContent value="admin" className="mt-0 space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="admin-email" className="text-[13px] font-medium text-white/80">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-white/20" />
                                            <Input id="admin-email" type="email" placeholder="admin@company.com" className="pulse-input h-11 rounded-xl pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="admin-password" className="text-[13px] font-medium text-white/80">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-white/20" />
                                            <Input id="admin-password" type={showPassword ? "text" : "password"} placeholder="Enter your password" className="pulse-input h-11 rounded-xl pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-white/20 transition-colors hover:text-white/50">
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Staff tab */}
                                <TabsContent value="staff" className="mt-0 space-y-5">
                                    {!isRegisterMode && (
                                        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-center">
                                            <p className="mb-3 text-[13px] text-white/50">Need to create a staff account?</p>
                                            <Button type="button" variant="outline" onClick={() => setIsRegisterMode(true)} className="border-white/10 bg-white/[0.03] text-[13px] text-white/60 hover:border-purple-500/30 hover:bg-white/[0.06] hover:text-white">
                                                <UserPlus className="mr-2 h-4 w-4" /> Create Staff Account
                                            </Button>
                                        </div>
                                    )}
                                    {isRegisterMode && (
                                        <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.06] p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20">
                                                    <UserPlus className="h-3.5 w-3.5 text-purple-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[14px] font-medium text-white">Creating Staff Account</h4>
                                                    <p className="mt-0.5 text-[12px] text-white/55">New staff account for the intelligence system.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="staff-email" className="text-[13px] font-medium text-white/50">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-white/20" />
                                            <Input id="staff-email" type="email" placeholder={isRegisterMode ? "staff@company.com" : "your@email.com"} className="pulse-input h-11 rounded-xl pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="staff-password" className="text-[13px] font-medium text-white/50">
                                            Password {isRegisterMode && <span className="text-white/20">(min. 8 characters)</span>}
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-white/20" />
                                            <Input id="staff-password" type={showPassword ? "text" : "password"} placeholder="Enter your password" className="pulse-input h-11 rounded-xl pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-white/20 transition-colors hover:text-white/50">
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    {isRegisterMode && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirm-password" className="text-[13px] font-medium text-white/50">Confirm Password</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-white/20" />
                                                    <Input id="confirm-password" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" className="pulse-input h-11 rounded-xl pl-10 pr-10" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-3 text-white/20 transition-colors hover:text-white/50">
                                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => setIsRegisterMode(false)} className="w-full text-[13px] text-white/30 transition-colors hover:text-white/60">
                                                ← Back to Sign In
                                            </button>
                                        </>
                                    )}
                                </TabsContent>

                                {/* Submit */}
                                <Button type="submit" className="pulse-submit-btn h-12 w-full rounded-xl text-[14px] font-semibold" disabled={isLoading}>
                                    <span className="flex items-center justify-center gap-2">
                                        {isLoading ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                {isRegisterMode ? 'Creating Account...' : 'Signing in...'}
                                            </>
                                        ) : isRegisterMode ? (
                                            <><UserPlus className="h-4 w-4" /> Create Account</>
                                        ) : (
                                            <><LogIn className="h-4 w-4" /> Sign in</>
                                        )}
                                    </span>
                                </Button>
                            </form>
                        </Tabs>

                        {/* Copyright */}
                        <div className="mt-10 flex items-center justify-center gap-2 text-[11px] text-white/50">

<Lock className="h-3 w-3" />
                            <span>© 2026 Haris AI Solutions, Inc.</span>
                        </div>
                    </div>
                </div>

                {/* ════════════ RIGHT SIDE — Showcase ════════════ */}
                <div className="relative hidden w-1/2 overflow-hidden md:flex md:flex-col md:justify-center">

                    {/* Background image */}
                    <div className="pointer-events-none absolute inset-0">
                        <img src="/images/bg1.avif" alt="" className="h-full w-full object-cover opacity-50" />
                    </div>

                    {/* Overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-[#0a0815]/30" />

                    <FloatingOrbs />
                    <Particles />

                    {/* Content */}
                    <div className="relative z-10 flex h-full flex-col justify-center px-10 py-16 lg:px-16">

                        {/* Badge */}
                        <div
                            className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/[0.06] px-4 py-1.5"
                            style={{
                                opacity: mounted ? 1 : 0,
                                transform: mounted ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.9)',
                                transition: 'all 0.7s cubic-bezier(.22,1,.36,1) 0.4s',
                            }}
                        >
                            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-purple-300">
                                AI-Powered Platform
                            </span>
                        </div>

                        {/* Title */}
                        <h2
                            className="mb-4 max-w-[480px] text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold leading-[1.15] tracking-tight text-white"
                            style={{
                                fontFamily: "'Playfair Display', serif",
                                opacity: mounted ? 1 : 0,
                                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                                transition: 'all 0.8s cubic-bezier(.22,1,.36,1) 0.5s',
                            }}
                        >
                            E-Commerce Intelligence{' '}
                            <em
                                className="not-italic"
                                style={{
                                    background: 'linear-gradient(135deg, #a78bfa, #e879f9)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontStyle: 'italic',
                                }}
                            >
                                Reimagined.
                            </em>
                        </h2>

                        {/* Subtitle */}
                        <p
                            className="mb-10 max-w-[420px] text-[14px] leading-relaxed text-white/40"
                            style={{
                                opacity: mounted ? 1 : 0,
                                transform: mounted ? 'translateY(0)' : 'translateY(14px)',
                                transition: 'all 0.7s ease 0.65s',
                            }}
                        >
                            Your complete command center for revenue, campaigns, inventory, and
                            AI intelligence — built for operators who outgrow spreadsheets.
                        </p>

                        {/* Divider */}
                        <div
                            className="mb-8 h-px w-full max-w-[420px]"
                            style={{
                                background: 'linear-gradient(90deg, rgba(167,139,250,0.3), rgba(232,121,249,0.15), transparent)',
                                transform: mounted ? 'scaleX(1)' : 'scaleX(0)',
                                transformOrigin: 'left',
                                transition: 'transform 0.8s cubic-bezier(.22,1,.36,1) 0.75s',
                            }}
                        />

                        {/* Feature cards grid */}
                        <div className="grid max-w-[520px] grid-cols-1 gap-3 lg:grid-cols-2">
                            {FEATURES.map((f, i) => (
                                <FeatureCard
                                    key={f.title}
                                    icon={f.icon}
                                    title={f.title}
                                    description={f.description}
                                    delay={0.8 + i * 0.1}
                                    mounted={mounted}
                                />
                            ))}
                        </div>

                        {/* Bottom accent */}
                        <div
                            className="mt-10 flex items-center gap-3"
                            style={{
                                opacity: mounted ? 1 : 0,
                                transition: 'opacity 0.6s ease 1.6s',
                            }}
                        >
                            <div className="flex -space-x-2">
                                {['#a78bfa', '#e879f9', '#818cf8'].map((color, i) => (
                                    <div
                                        key={i}
                                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0a0815] text-[10px] font-bold text-white"
                                        style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}
                                    >
                                        {['S', 'M', 'I'][i]}
                                    </div>
                                ))}
                            </div>
                            <span className="text-[12px] text-white/50">

Sales · Marketing · Intelligence
                            </span>
                        </div>
                    </div>

                    {/* Bottom border glow */}
                    <div
                        className="absolute bottom-0 left-[10%] right-[10%] h-px"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.2), rgba(232,121,249,0.15), transparent)',
                            animation: 'pulse-border-glow 4s ease-in-out infinite',
                        }}
                    />
                </div>
            </div>
        </>
    );
};

export default LoginScreen;