import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import AIAssistant from '../components/ai-assistant';
import AITrend from '../components/ai-trend';
import AIContent from '../components/ai-content';
import AIAnalysis from '../components/ai-analysis';
import { Bot, TrendingUp, PenTool, BarChart3 } from 'lucide-react';

const AIScreen: React.FC = () => {
    // State management for the chatbot tabs
    const [activeTab, setActiveTab] = useState<string>('assistant');
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Track mouse movement for interactive background effects
    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="w-full h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-black dark:via-black dark:to-black relative overflow-hidden flex flex-col">
            {/* Enhanced Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Primary floating elements - constrained to avoid horizontal overflow */}
                <div className="absolute top-20 left-4 sm:left-20 w-24 sm:w-32 h-24 sm:h-32 bg-blue-200/20 dark:bg-blue-800/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute top-40 right-4 sm:right-32 w-28 sm:w-40 h-28 sm:h-40 bg-purple-200/20 dark:bg-purple-800/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-32 left-1/4 sm:left-1/3 w-20 sm:w-28 h-20 sm:h-28 bg-green-200/20 dark:bg-green-800/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                
                {/* Interactive mouse-following elements - constrained */}
                <div 
                    className="absolute w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl transition-all duration-1000 ease-out"
                    style={{
                        left: Math.min(typeof window !== 'undefined' ? window.innerWidth - 100 : 0, Math.max(0, mousePosition.x / 20)),
                        top: mousePosition.y / 20,
                    }}
                ></div>
                <div 
                    className="absolute w-20 sm:w-32 h-20 sm:h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl transition-all duration-1500 ease-out"
                    style={{
                        right: Math.min(typeof window !== 'undefined' ? window.innerWidth - 150 : 0, Math.max(0, typeof window !== 'undefined' ? (window.innerWidth - mousePosition.x) / 30 : 100)),
                        bottom: typeof window !== 'undefined' ? (window.innerHeight - mousePosition.y) / 30 : 100,
                    }}
                ></div>
                
                {/* Additional decorative elements - constrained */}
                <div className="absolute top-1/4 right-4 sm:right-1/4 w-12 sm:w-16 h-12 sm:h-16 bg-amber-200/15 dark:bg-amber-800/10 rounded-full blur-lg animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }}></div>
                <div className="absolute bottom-1/4 left-4 sm:left-1/4 w-16 sm:w-20 h-16 sm:h-20 bg-rose-200/15 dark:bg-rose-800/10 rounded-full blur-lg animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '4s' }}></div>
                
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }}></div>
            </div>

            <div className="w-full flex-1 flex flex-col min-w-0 min-h-0 relative z-10 overflow-x-hidden">
                {/* Enhanced Main Content with Tabs */}
                <div className="flex-1 min-h-0 relative z-10 overflow-x-hidden">
                    <Tabs 
                        value={activeTab} 
                        onValueChange={setActiveTab} 
                        className="h-full flex flex-col"
                    >
                        <TabsList className="grid w-full grid-cols-4 h-16 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200/30 dark:border-white/10 p-1 shadow-xl flex-shrink-0">
                            <TabsTrigger 
                                value="assistant" 
                                className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 md:px-3 py-1 sm:py-2 text-[10px] sm:text-sm font-semibold rounded-sm sm:rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-indigo-50 dark:data-[state=active]:from-blue-950/80 dark:data-[state=active]:to-indigo-950/80 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-blue-200/50 dark:data-[state=active]:border-white/20 data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-slate-400 hover:bg-slate-50 dark:hover:bg-black/50 min-w-0"
                            >
                                <div className={`p-1 sm:p-1.5 rounded-sm sm:rounded-lg transition-all duration-300 flex-shrink-0 ${
                                    activeTab === 'assistant' 
                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md' 
                                        : 'bg-slate-100 dark:bg-gray-700 text-slate-500'
                                }`}>
                                    <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                </div>
                                <div className="text-left min-w-0 hidden sm:block">
                                    <div className="font-bold text-[9px] sm:text-xs truncate">Assistant</div>
                                    <div className="text-[7px] sm:text-[10px] opacity-70 truncate">AI Expert</div>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="trend-analyzer" 
                                className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 md:px-3 py-1 sm:py-2 text-[10px] sm:text-sm font-semibold rounded-sm sm:rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-50 data-[state=active]:to-emerald-50 dark:data-[state=active]:from-green-950/80 dark:data-[state=active]:to-emerald-950/80 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-green-200/50 dark:data-[state=active]:border-white/20 data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-slate-400 hover:bg-slate-50 dark:hover:bg-black/50 min-w-0"
                            >
                                <div className={`p-1 sm:p-1.5 rounded-sm sm:rounded-lg transition-all duration-300 flex-shrink-0 ${
                                    activeTab === 'trend-analyzer' 
                                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md' 
                                        : 'bg-slate-100 dark:bg-gray-700 text-slate-500'
                                }`}>
                                    <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                </div>
                                <div className="text-left min-w-0 hidden sm:block">
                                    <div className="font-bold text-[9px] sm:text-xs truncate">Trends</div>
                                    <div className="text-[7px] sm:text-[10px] opacity-70 truncate">Analytics</div>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="content-writer" 
                                className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 md:px-3 py-1 sm:py-2 text-[10px] sm:text-sm font-semibold rounded-sm sm:rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-50 data-[state=active]:to-pink-50 dark:data-[state=active]:from-purple-950/80 dark:data-[state=active]:to-pink-950/80 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-purple-200/50 dark:data-[state=active]:border-white/20 data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-slate-400 hover:bg-slate-50 dark:hover:bg-black/50 min-w-0"
                            >
                                <div className={`p-1 sm:p-1.5 rounded-sm sm:rounded-lg transition-all duration-300 flex-shrink-0 ${
                                    activeTab === 'content-writer' 
                                        ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-md' 
                                        : 'bg-slate-100 dark:bg-gray-700 text-slate-500'
                                }`}>
                                    <PenTool className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                </div>
                                <div className="text-left min-w-0 hidden sm:block">
                                    <div className="font-bold text-[9px] sm:text-xs truncate">Content</div>
                                    <div className="text-[7px] sm:text-[10px] opacity-70 truncate">Writer</div>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="analysis" 
                                className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 md:px-3 py-1 sm:py-2 text-[10px] sm:text-sm font-semibold rounded-sm sm:rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-50 data-[state=active]:to-red-50 dark:data-[state=active]:from-pink-950/80 dark:data-[state=active]:to-red-950/80 data-[state=active]:text-pink-700 dark:data-[state=active]:text-pink-300 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-pink-200/50 dark:data-[state=active]:border-white/20 data-[state=inactive]:text-slate-600 dark:data-[state=inactive]:text-slate-400 hover:bg-slate-50 dark:hover:bg-black/50 min-w-0"
                            >
                                <div className={`p-1 sm:p-1.5 rounded-sm sm:rounded-lg transition-all duration-300 flex-shrink-0 ${
                                    activeTab === 'analysis' 
                                        ? 'bg-gradient-to-br from-pink-500 to-red-600 text-white shadow-md' 
                                        : 'bg-slate-100 dark:bg-gray-700 text-slate-500'
                                }`}>
                                    <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                </div>
                                <div className="text-left min-w-0 hidden sm:block">
                                    <div className="font-bold text-[9px] sm:text-xs truncate">Analysis</div>
                                    <div className="text-[7px] sm:text-[10px] opacity-70 truncate">Keywords</div>
                                </div>
                            </TabsTrigger>
                        </TabsList>

                        {/* Enhanced Tab Content */}
                        <TabsContent value="assistant" className="flex-1 mt-0 min-h-0 h-[calc(100vh-4rem)] overflow-hidden">
                            <div className="h-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-none shadow-2xl overflow-hidden">
                                <AIAssistant />
                            </div>
                        </TabsContent>

                        <TabsContent value="trend-analyzer" className="flex-1 mt-0 min-h-0 h-[calc(100vh-4rem)] overflow-hidden">
                            <div className="h-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-none shadow-2xl overflow-hidden">
                                <AITrend />
                            </div>
                        </TabsContent>

                        <TabsContent value="content-writer" className="flex-1 mt-0 min-h-0 h-[calc(100vh-4rem)] overflow-hidden">
                            <div className="h-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-none shadow-2xl overflow-hidden">
                                <AIContent />
                            </div>
                        </TabsContent>

                        <TabsContent value="analysis" className="flex-1 mt-0 min-h-0 h-[calc(100vh-4rem)] overflow-hidden">
                            <div className="h-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-none shadow-2xl overflow-hidden">
                                <AIAnalysis />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default AIScreen;