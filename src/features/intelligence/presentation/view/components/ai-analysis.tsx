import React, { useState } from 'react';
import BubbleKeyword from './bubble-keyword';
import { AnalyticsBubbleMentioned } from './analytics-bubble-mentioned';
import CompetitorAnalysis from './competitor-analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Info, Calendar as CalendarIcon, MessageCircle, Hash, Target } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const AIAnalysis: React.FC = () => {
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [activeTab, setActiveTab] = useState<string>('competitor');

    const tabItems = [
        { key: 'keywords', label: 'Keywords', icon: Hash },
        { key: 'mentions', label: 'Mentions', icon: MessageCircle },
        { key: 'competitor', label: 'Competitors', icon: Target },
    ];

    const tabTitles: Record<string, string> = {
        keywords: 'Interactive Keywords Universe',
        mentions: 'Top Mentioned Topics',
        competitor: 'Competitor Analysis',
    };

    const tabHints: Record<string, string> = {
        keywords: 'Hover · Click · Zoom · Explore',
        mentions: 'Search · Filter · Explore',
        competitor: 'Compare · Analyze · Track',
    };

    return (
        <div className="h-full flex flex-col relative">
            <div className="relative z-10 flex-1 px-4 py-2 min-h-0">
                <Card className="h-full bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] shadow-sm flex flex-col overflow-visible">
                    <CardHeader className="py-3 px-4 border-b border-slate-200/50 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] flex-shrink-0 relative z-30">
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
                                    style={{ background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` }}
                                >
                                    <BarChart3 className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                    {tabTitles[activeTab]}
                                </span>
                                
                                <div className="flex gap-1.5 ml-4">
                                    {tabItems.map((tab) => {
                                        const isActive = activeTab === tab.key;
                                        const Icon = tab.icon;
                                        return (
                                            <Button
                                                key={tab.key}
                                                variant="default"
                                                size="sm"
                                                className="h-7 text-[10px] sm:text-xs font-medium px-3 py-0 rounded-lg transition-all duration-200 border"
                                                style={isActive ? {
                                                    background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))`,
                                                    color: '#fff',
                                                    borderColor: 'transparent',
                                                } : {
                                                    background: `rgba(var(--preset-primary-rgb), 0.06)`,
                                                    color: `var(--preset-primary)`,
                                                    borderColor: `rgba(var(--preset-primary-rgb), 0.15)`,
                                                }}
                                                onClick={() => setActiveTab(tab.key)}
                                            >
                                                <Icon className="h-3 w-3 mr-1" />
                                                {tab.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {activeTab !== 'competitor' && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Date:</span>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-[180px] justify-start text-left font-normal relative z-20",
                                                        "bg-white dark:bg-white/[0.04]",
                                                        "border-slate-200/60 dark:border-white/[0.08]",
                                                        "hover:bg-slate-50 dark:hover:bg-white/[0.06]",
                                                        !startDate && "text-slate-500"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" style={{ color: `var(--preset-primary)` }} />
                                                    {startDate ? format(startDate, "MMM d, yyyy") : "Pick a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent 
                                                className="w-auto p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-xl z-50" 
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

                                <div
                                    className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border"
                                    style={{
                                        background: `rgba(var(--preset-primary-rgb), 0.05)`,
                                        borderColor: `rgba(var(--preset-primary-rgb), 0.12)`,
                                    }}
                                >
                                    <Info className="h-3.5 w-3.5" style={{ color: `var(--preset-primary)` }} />
                                    <span className="text-xs font-medium" style={{ color: `var(--preset-primary)` }}>
                                        {tabHints[activeTab]}
                                    </span>
                                </div>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="p-0 flex-1 min-h-0 relative">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                            <div className="flex-1 min-h-0 overflow-auto">
                                <TabsContent value="keywords" className="h-full m-0 overflow-hidden">
                                    <div className="relative h-full border-t border-slate-100 dark:border-white/[0.04]">
                                        <BubbleKeyword 
                                            className="w-full h-full"
                                            startDate={startDate ? format(startDate, 'yyyy-MM-dd') : undefined}
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="mentions" className="h-full m-0">
                                    <div className="h-full overflow-y-auto border-t border-slate-100 dark:border-white/[0.04]">
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
                                    <div className="h-full border-t border-slate-100 dark:border-white/[0.04]">
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

            <div className="lg:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                <div
                    className="backdrop-blur-xl rounded-full px-4 py-2 border"
                    style={{
                        background: `rgba(var(--preset-primary-rgb), 0.9)`,
                        borderColor: `rgba(var(--preset-primary-rgb), 0.3)`,
                    }}
                >
                    <p className="text-xs text-white font-medium">
                        {activeTab === 'keywords' ? 'Tap bubbles · Pinch to zoom' : 
                         activeTab === 'mentions' ? 'Tap topics · Search keywords' : 'Compare brands · Track metrics'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIAnalysis; 