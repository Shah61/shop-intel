import React, { useState } from 'react';
import BubbleKeyword from './bubble-keyword';
import { AnalyticsBubbleMentioned } from './analytics-bubble-mentioned';
import CompetitorAnalysis from './competitor-analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Sparkles, Info, Calendar as CalendarIcon, Zap, MessageCircle, Hash, Target } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const AIAnalysis: React.FC = () => {
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [activeTab, setActiveTab] = useState<string>('competitor');

    return (
        <div className="h-full flex flex-col relative">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-black dark:via-black dark:to-purple-950/20">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-pink-200/20 to-purple-200/20 dark:from-pink-900/10 dark:to-purple-900/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-blue-200/20 to-cyan-200/20 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-200/10 to-pink-200/10 dark:from-indigo-900/5 dark:to-pink-900/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Premium Main Content with Tabs */}
            <div className="relative z-10 flex-1 px-4 py-2 min-h-0">
                <Card className="h-full bg-white/70 dark:bg-black/70 backdrop-blur-2xl border-white/20 dark:border-slate-700/30 shadow-2xl shadow-black/10 dark:shadow-black/30 group flex flex-col overflow-visible">
                    <CardHeader className="py-2 px-4 border-b border-white/10 dark:border-slate-700/30 bg-gradient-to-r from-white/30 to-white/10 dark:from-black/30 dark:to-black/10 flex-shrink-0 relative z-30">
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                    <BarChart3 className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-purple-800 dark:from-slate-200 dark:to-purple-200 bg-clip-text text-transparent">
                                    {activeTab === 'keywords' ? 'Interactive Keywords Universe' : 
                                     activeTab === 'mentions' ? 'Top Mentioned Topics' : 'Competitor Analysis'}
                                </span>
                                
                                {/* Tab Navigation Badges */}
                                <div className="flex gap-2 ml-6">
                                    <Button 
                                        variant="default"
                                        size="sm"
                                        className={`h-7 text-[10px] sm:text-xs font-medium px-3 py-0 rounded-lg transition-all duration-300 hover:shadow-lg ${
                                            activeTab === 'keywords' 
                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                                                : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-white/20'
                                        }`}
                                        onClick={() => setActiveTab('keywords')}
                                    >
                                        <Hash className="h-3 w-3 mr-1" />
                                        Keywords
                                    </Button>
                                    <Button 
                                        variant="default"
                                        size="sm"
                                        className={`h-7 text-[10px] sm:text-xs font-medium px-3 py-0 rounded-lg transition-all duration-300 hover:shadow-lg ${
                                            activeTab === 'mentions' 
                                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white' 
                                                : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-white/20'
                                        }`}
                                        onClick={() => setActiveTab('mentions')}
                                    >
                                        <MessageCircle className="h-3 w-3 mr-1" />
                                        Mentions
                                    </Button>
                                    <Button 
                                        variant="default"
                                        size="sm"
                                        className={`h-7 text-[10px] sm:text-xs font-medium px-3 py-0 rounded-lg transition-all duration-300 hover:shadow-lg ${
                                            activeTab === 'competitor' 
                                                ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white' 
                                                : 'bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 text-orange-700 dark:text-orange-300 border border-orange-200/50 dark:border-white/20'
                                        }`}
                                        onClick={() => setActiveTab('competitor')}
                                    >
                                        <Target className="h-3 w-3 mr-1" />
                                        Competitors
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {/* Date Picker - Hidden for competitor tab since it has its own date filtering */}
                                {activeTab !== 'competitor' && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Date:</span>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-[180px] justify-start text-left font-normal relative z-20",
                                                        "bg-white/60 dark:bg-black/60 backdrop-blur-sm",
                                                        "border-slate-200/50 dark:border-slate-700/50",
                                                        "hover:bg-white/80 dark:hover:bg-black/80",
                                                        "dark:shadow-lg dark:shadow-black/20",
                                                        !startDate && "text-slate-500"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-purple-500" />
                                                    {startDate ? format(startDate, "MMM d, yyyy") : "Pick a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent 
                                                className="w-auto p-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-white/20 dark:border-slate-700/50 shadow-2xl z-50" 
                                                align="end"
                                                side="bottom"
                                                sideOffset={5}
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={startDate}
                                                    onSelect={setStartDate}
                                                    initialFocus
                                                    className="rounded-xl"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}

                                {/* Instructions Badge */}
                                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/30 backdrop-blur-sm">
                                    <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                                        {activeTab === 'keywords' ? 'Hover • Click • Zoom • Explore' : 
                                         activeTab === 'mentions' ? 'Search • Filter • Explore' : 'Compare • Analyze • Track'}
                                    </span>
                                </div>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="p-0 flex-1 min-h-0 relative">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                            {/* Tab Content */}
                            <div className="flex-1 min-h-0 overflow-auto">
                                <TabsContent value="keywords" className="h-full m-0 overflow-hidden">
                                    {/* Subtle grid overlay */}
                                    <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" 
                                         style={{
                                             backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)`,
                                             backgroundSize: '20px 20px'
                                         }}>
                                    </div>
                                    
                                    {/* Chart container with enhanced styling */}
                                    <div className="relative h-full border border-gray-200 dark:border-transparent">
                                        <BubbleKeyword 
                                            className="w-full h-full"
                                            startDate={startDate ? format(startDate, 'yyyy-MM-dd') : undefined}
                                        />
                                     
                                    </div>
                                    
                                    {/* Floating gradient overlay for depth */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-400/5 to-transparent rounded-full blur-2xl"></div>
                                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-pink-400/5 to-transparent rounded-full blur-2xl"></div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="mentions" className="h-full m-0">
                                    <div className="h-full overflow-y-auto border border-gray-200 dark:border-transparent">
                                        <div className="p-4">
                                            <AnalyticsBubbleMentioned 
                                                category="Beauty"
                                                startDate={startDate ? format(startDate, 'yyyy-MM-dd') : undefined}
                                                region="UNITED_STATES"
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="competitor" className="h-full m-0">
                                    <div className="h-full border border-gray-200 dark:border-transparent">
                                        <div className="p-4 pb-8 h-full">
                                            <CompetitorAnalysis />
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* Mobile floating instructions */}
            <div className="lg:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-black/80 dark:bg-white/10 backdrop-blur-xl rounded-full px-4 py-2 border border-white/20">
                    <p className="text-xs text-white dark:text-white font-medium">
                        {activeTab === 'keywords' ? 'Tap bubbles • Pinch to zoom' : 
                         activeTab === 'mentions' ? 'Tap topics • Search keywords' : 'Compare brands • Track metrics'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIAnalysis; 