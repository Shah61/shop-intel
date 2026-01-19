'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, Mail, AlertCircle, UserPlus, LogIn, TrendingUp, Package, ShoppingCart, BarChart3, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from '@/src/core/theme/theme-toggle';
import Image from 'next/image';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');

    const [activeTab, setActiveTab] = useState('admin');
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Basic validation - just check if email and password are provided
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Registration specific validation
        if (isRegisterMode) {
            if (password.length < 8) {
                setError('Password must be at least 8 characters long');
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }
        }

        // Clear previous errors
        setError('');
        setIsLoading(true);

        // Dummy login - accept any email/password
        try {
            // Set session using the dummy session provider
            if (typeof window !== 'undefined' && (window as any).__dummySetSession) {
                const dummySession = {
                    user: {
                        name: 'Shop Intel',
                        email: 'ShopIntel@gmail.com',
                    },
                    user_entity: {
                        id: `user-${Date.now()}`,
                        email: 'ShopIntel@gmail.com',
                        role: activeTab === "admin" ? "ADMIN" : "STAFF",
                        name: 'Shop Intel',
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
                    toast.success(`Staff account created successfully for ${email}`);
                    setIsRegisterMode(false);
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                } else {
                    toast.success('Login successful');
                    router.push('/sales');
                }
            } else {
                // Fallback: just redirect
                localStorage.setItem('dummy-logged-in', 'true');
                toast.success('Login successful');
                router.push('/sales');
            }
        } catch (error: any) {
            setError(error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsRegisterMode(!isRegisterMode);
        setError('');
        setPassword('');
        setConfirmPassword('');
    };

    // isLoading is already defined above

    return (
        <div className="min-h-screen flex relative">
            {/* Theme Toggle - Top Right */}
            <div className="absolute top-4 right-4 z-30">
                <ThemeToggle />
            </div>

            {/* Main Container - Full Screen */}
            <div className="w-full flex relative z-10">
                {/* Left Side - Form */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-8 lg:p-12 bg-background">

                {/* Form Container */}
                <div className="w-full max-w-lg">
                    {/* Welcome Text */}
                    <div className="mb-6 md:mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold mb-8">
                            {isRegisterMode ? 'Create Account' : 'Welcome back'}
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base">
                            {isRegisterMode 
                                ? 'Create a staff account to get started'
                                : 'Sign in to your account'
                            }
                        </p>
                    </div>

                    {/* Form */}
                    <Tabs
                        defaultValue="admin"
                        className="w-full"
                        onValueChange={(tab) => {
                            setActiveTab(tab);
                            setIsRegisterMode(false);
                            setError('');
                            setPassword('');
                            setConfirmPassword('');
                        }}
                    >
                        {/* Tab Navigation */}
                        <TabsList className="grid w-full grid-cols-2 mb-4 md:mb-6">
                            <TabsTrigger value="admin" className="flex items-center gap-2 text-sm">
                                <LogIn className="w-4 h-4" />
                                <span className="hidden sm:inline">Admin</span>
                                <span className="sm:hidden">Admin</span>
                            </TabsTrigger>
                            <TabsTrigger value="staff" className="flex items-center gap-2 text-sm">
                                <UserPlus className="w-4 h-4" />
                                <span className="hidden sm:inline">Staff</span>
                                <span className="sm:hidden">Staff</span>
                            </TabsTrigger>
                        </TabsList>

                        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                            {/* Error Alert */}
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <TabsContent value="admin" className="space-y-4 md:space-y-6 mt-0">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="admin-email" className="text-sm font-medium">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="admin-email"
                                            type="email"
                                            placeholder="admin@company.com"
                                            className="pl-10 h-11"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="admin-password" className="text-sm font-medium">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="admin-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            className="pl-10 pr-10 h-11"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="staff" className="space-y-4 md:space-y-6 mt-0">
                                {/* Mode Toggle for Staff */}
                                {!isRegisterMode && (
                                    <div className="flex items-center justify-center p-3 md:p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20">
                                        <div className="text-center">
                                            <p className="text-xs md:text-sm text-muted-foreground mb-3">
                                                Need to create a staff account?
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsRegisterMode(true)}
                                                className="text-xs md:text-sm h-9"
                                            >
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                <span className="hidden sm:inline">Create Staff Account</span>
                                                <span className="sm:hidden">Create Account</span>
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {isRegisterMode && (
                                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 md:p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <UserPlus className="w-3 h-3 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium mb-1 text-sm md:text-base">Creating Staff Account</h4>
                                                <p className="text-xs md:text-sm text-muted-foreground">
                                                    This will create a new staff account for the business intelligence system.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="staff-email" className="text-sm font-medium">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="staff-email"
                                            type="email"
                                            placeholder={isRegisterMode ? "staff@company.com" : "your@email.com"}
                                            className="pl-10 h-11"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Password Field - Only show if not in register mode or if in register mode */}
                                {(!isRegisterMode || isRegisterMode) && (
                                    <div className="space-y-2">
                                        <Label htmlFor="staff-password" className="text-sm font-medium">
                                            Password {isRegisterMode && <span className="text-muted-foreground text-xs">(min. 8 characters)</span>}
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="staff-password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your password"
                                                className="pl-10 pr-10 h-11"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Confirm Password - Only in register mode */}
                                {isRegisterMode && (
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="confirm-password"
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm your password"
                                                className="pl-10 pr-10 h-11"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Back to Sign In */}
                                {isRegisterMode && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsRegisterMode(false)}
                                        className="w-full text-xs md:text-sm h-9"
                                    >
                                        ← Back to Sign In
                                    </Button>
                                )}
                            </TabsContent>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-11 text-sm font-medium"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                        <span className="hidden sm:inline">{isRegisterMode ? 'Creating Account...' : 'Signing in...'}</span>
                                        <span className="sm:hidden">{isRegisterMode ? 'Creating...' : 'Signing in...'}</span>
                                    </>
                                ) : (
                                    <>
                                        {isRegisterMode ? (
                                            <>
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                <span className="hidden sm:inline">Create Account</span>
                                                <span className="sm:hidden">Create</span>
                                            </>
                                        ) : (
                                            <>
                                                <LogIn className="w-4 h-4 mr-2" />
                                                Sign in
                                            </>
                                        )}
                                    </>
                                )}
                            </Button>
                        </form>
                    </Tabs>
                </div>
            </div>

            {/* Right Side - Description/Feature Showcase - Hidden on Mobile */}
            <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
                {/* Background Images */}
                <div className="absolute inset-0">
                    <img
                        src="/images/bg1.avif"
                        alt=""
                        className="w-full h-full object-cover"
                    />
                </div>
                
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/40"></div>
                
                {/* Content */}
                <div className="max-w-[800px] relative z-10 p-8 lg:p-12 flex flex-col justify-center h-full">
                    <div className="mb-4">
                    <div className="inline-flex items-center gap-2 bg-black text-white px-5 py-1 rounded-full text-xs font-medium mb-4">
                        <span className="text-md font-bold">Shop-Intel</span>
                    </div>
                        <h2 className="text-3xl font-bold mb-5 leading-tight text-white">
                            Fashion Intelligence Platform.
                        </h2>
                        
                        <p className="text-md text-white mb-8">
                            Your complete command center for fashion retail. Seamlessly connect sales analytics, marketing campaigns, inventory tracking, and business intelligence in one powerful dashboard — empowering smarter decisions that drive growth.
                        </p>
                        
                        <p className="text-md text-white mb-8">
                            Unify every platform, every metric, every insight. Shop-Intel brings together your entire fashion business ecosystem, delivering real-time intelligence that turns data into competitive advantage.
                        </p>
                    </div>

                    {/* Feature List */}
                    <div className="grid grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <BarChart3 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mt-1 mb-0 text-white">Unified Sales Analytics</h3>
                                    <p className="text-xs text-white/90 mt-1">Track performance across all channels</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <ShoppingCart className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mt-1 mb-0 text-white">Campaign Intelligence</h3>
                                    <p className="text-xs text-white/90 mt-1">Optimize marketing ROI in real-time</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Package className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mt-1 mb-0 text-white">Smart Inventory Control</h3>
                                    <p className="text-xs text-white/90 mt-1">Predict demand and prevent stockouts</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mt-1 mb-0 text-white">Trend Insights</h3>
                                    <p className="text-xs text-white/90 mt-1">Stay ahead of fashion trends</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mt-1 mb-0 text-white">AI-Powered Insights</h3>
                                    <p className="text-xs text-white/90 mt-1">Get instant answers and recommendations</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <UserPlus className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mt-1 mb-0 text-white">Team Coordination</h3>
                                    <p className="text-xs text-white/90 mt-1">Manage staff and workflows efficiently</p>
                                </div>
                            </div>
                        </div>
                    </div>
                                             {/* Copyright Notice */}
                     <div className="mt-12 pt-8 border-t border-white/20">
                         <div className="flex items-center justify-center">
                             <div className="text-center space-y-2">
                                 <div className="flex items-center justify-center gap-2 text-xs text-white/80">
                                     <Lock className="w-3 h-3" />
                                     <span>Proprietary Software</span>
                                 </div>
                                 <p className="text-xs text-white/70 leading-relaxed">
                                     This software is the intellectual property of <span className="font-medium text-white">Shop-Intel</span>. All rights reserved.
                                 </p>
                             </div>
                         </div>
                     </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default LoginScreen;