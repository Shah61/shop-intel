import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { Eye, Users, TrendingUp, Target, BarChart3, Activity, Brain, FileText, ArrowUp, ArrowDown, Minus, Calendar as CalendarIcon, Filter, Star, Palette, Sword, Gem, BarChart2, Flame } from 'lucide-react';
import Image from 'next/image';
import { ChartRadarGridCircle } from './chart-radar-views-performance';
import TopPerformingCompetitors from './top-performing-competitors';
import OverviewMetadataCards from './overview-metadata-cards';
import EngagementRateComparisonChart from './engagement-rate-comparison-chart';
import EngagementGrowthTrendChart from './engagement-growth-trend-chart';
import PlatformPerformanceSplit from './platform-performance-split';
import PerformanceComparison from './performance-comparison';
import Performance24hChanges from './performance-24h-changes';
import PerformancePredictionsCard from './performance-predictions-card';
import ContentOptimizationCard from './content-optimization-card';
import CompetitorIntelligenceCard from './competitor-intelligence-card';
import OptimalTimingCard from './optimal-timing-card';
import AIStrategicSummary from './ai-strategic-summary';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

const CompetitorAnalysis: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('overview');
    const [mounted, setMounted] = useState(false);
    const { theme } = useTheme();
    
    const [dateRange, setDateRange] = useState<{
        from: Date;
        to: Date;
    }>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });

    // Platform filter state
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['all']);
    
    // Source filter state
    const [selectedSource, setSelectedSource] = useState<'CREATOR' | 'COMPETITOR' | 'Shop-Intel' | 'ALL'>('ALL');
    
    // Metric filter state
    const [selectedMetricType, setSelectedMetricType] = useState<'AVERAGE' | 'HIGHEST'>('AVERAGE');

    // Handle mounting to prevent hydration issues
    useEffect(() => {
        setMounted(true);
    }, []);

    // Determine if we're in dark mode - only after mounting to prevent hydration errors
    const isDark = mounted && theme === 'dark';

    // Memoize chart colors to prevent recalculation on every render
    const chartColors = useMemo(() => ({
        primary: '#8b5cf6',
        secondary: '#06b6d4',
        accent: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        grid: isDark ? '#374151' : '#e2e8f0',
        text: isDark ? '#9ca3af' : '#64748b',
        tooltip: {
            background: isDark ? 'rgb(17 24 39 / 0.95)' : 'rgb(255 255 255 / 0.95)',
            border: isDark ? 'rgb(75 85 99 / 0.5)' : 'rgb(226 232 240 / 0.5)',
            text: isDark ? '#f3f4f6' : '#1f2937'
        }
    }), [isDark]);

    // Platform toggle handler
    const togglePlatform = useCallback((platform: string) => {
        if (platform === 'all') {
            setSelectedPlatforms(['all']);
        } else {
            setSelectedPlatforms(prev => {
                // Remove 'all' if selecting individual platforms
                const withoutAll = prev.filter(p => p !== 'all');
                
                if (prev.includes(platform)) {
                    const newSelection = withoutAll.filter(p => p !== platform);
                    // If no individual platforms selected, default to 'all'
                    return newSelection.length === 0 ? ['all'] : newSelection;
                } else {
                    const newSelection = [...withoutAll, platform];
                    // If all individual platforms are selected, switch to 'all'
                    return newSelection.length === 2 ? ['all'] : newSelection;
                }
            });
        }
    }, []);

    // Convert UI platform filter to API format
    const getApiPlatform = useCallback((): 'TIKTOK' | 'INSTAGRAM' | undefined => {
        if (selectedPlatforms.includes('all')) {
            return undefined; // Don't filter by platform
        }
        
        // If only one platform is selected, return it in uppercase
        const nonAllPlatforms = selectedPlatforms.filter(p => p !== 'all');
        if (nonAllPlatforms.length === 1) {
            return nonAllPlatforms[0].toUpperCase() as 'TIKTOK' | 'INSTAGRAM';
        }
        
        // If multiple platforms or none selected, don't filter
        return undefined;
    }, [selectedPlatforms]);

    // Source Filter Component - memoized
    const SourceFilter = useCallback(() => {
        const sourceOptions = [
            { value: 'ALL', label: 'All Sources', icon: Star },
            { value: 'CREATOR', label: 'Creator', icon: Palette },
            { value: 'COMPETITOR', label: 'Competitor', icon: Sword },
            { value: 'Shop-Intel', label: 'Shop-Intel', icon: Gem },
        ] as const;
        
        const currentOption = sourceOptions.find(option => option.value === selectedSource);
        
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="default"
                        className={cn(
                            "w-[140px] justify-start text-left font-normal relative z-50 h-10",
                            "bg-white/40 dark:bg-black/40 backdrop-blur-sm",
                            "border-slate-200/50 dark:border-slate-700/50",
                            "hover:bg-white/80 dark:hover:bg-black/80",
                            "text-sm rounded-xl"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {currentOption?.icon && <currentOption.icon className="mr-2 h-4 w-4" />}
                        {currentOption?.label}
                    </Button>
                </PopoverTrigger>
                <PopoverContent 
                    className="w-auto p-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-white/20 dark:border-slate-700/50 shadow-2xl z-[100]" 
                    align="end"
                    side="bottom"
                    sideOffset={8}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-3 space-y-2 min-w-[160px]">
                        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3 px-2">
                            Select Source
                        </div>
                        
                        {sourceOptions.map((option) => (
                            <Button
                                key={option.value}
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedSource(option.value)}
                                className={cn(
                                    "w-full justify-start text-left h-9 px-3 rounded-lg transition-all duration-200",
                                    selectedSource === option.value
                                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-sm"
                                        : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className={cn(
                                        "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                                        selectedSource === option.value
                                            ? "bg-purple-500 border-purple-500" 
                                            : "border-slate-300 dark:border-slate-600"
                                    )}>
                                        {selectedSource === option.value && (
                                            <div className="w-2 h-2 bg-white rounded-sm"></div>
                                        )}
                                    </div>
                                    <option.icon className="mr-2 h-4 w-4" />
                                    <span className="text-sm font-medium">{option.label}</span>
                                </div>
                            </Button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        );
    }, [selectedSource]);

    // Metric Filter Component - memoized
    const MetricFilter = useCallback(() => {
        const metricOptions = [
            { value: 'AVERAGE', label: 'Average', icon: BarChart2 },
            { value: 'HIGHEST', label: 'Highest', icon: Flame },
        ] as const;
        
        const currentOption = metricOptions.find(option => option.value === selectedMetricType);
        
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="default"
                        className={cn(
                            "w-[120px] justify-start text-left font-normal relative z-50 h-10",
                            "bg-white/40 dark:bg-black/40 backdrop-blur-sm",
                            "border-slate-200/50 dark:border-slate-700/50",
                            "hover:bg-white/80 dark:hover:bg-black/80",
                            "text-sm rounded-xl"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {currentOption?.icon && <currentOption.icon className="mr-2 h-4 w-4" />}
                        {currentOption?.label}
                    </Button>
                </PopoverTrigger>
                <PopoverContent 
                    className="w-auto p-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-white/20 dark:border-slate-700/50 shadow-2xl z-[100]" 
                    align="end"
                    side="bottom"
                    sideOffset={8}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-3 space-y-2 min-w-[140px]">
                        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3 px-2">
                            Select Metric Type
                        </div>
                        
                        {metricOptions.map((option) => (
                            <Button
                                key={option.value}
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedMetricType(option.value)}
                                className={cn(
                                    "w-full justify-start text-left h-9 px-3 rounded-lg transition-all duration-200",
                                    selectedMetricType === option.value
                                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-sm"
                                        : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className={cn(
                                        "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                                        selectedMetricType === option.value
                                            ? "bg-purple-500 border-purple-500" 
                                            : "border-slate-300 dark:border-slate-600"
                                    )}>
                                        {selectedMetricType === option.value && (
                                            <div className="w-2 h-2 bg-white rounded-sm"></div>
                                        )}
                                    </div>
                                    <option.icon className="mr-2 h-4 w-4" />
                                    <span className="text-sm font-medium">{option.label}</span>
                                </div>
                            </Button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        );
    }, [selectedMetricType]);

    // Custom tooltip formatters - memoized to prevent recreation
    const CustomTooltip = useCallback(({ active, payload, label, labelFormatter, valueFormatter }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-lg p-3 shadow-lg">
                    <p className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                        {labelFormatter ? labelFormatter(label) : label}
                    </p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            <span className="font-medium">{entry.name}:</span> {valueFormatter ? valueFormatter(entry.value, entry.name) : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    }, []);

    // Format numbers for display - memoized
    const formatNumber = useCallback((num: number, type: 'percentage' | 'count' | 'compact' = 'count') => {
        switch (type) {
            case 'percentage':
                return `${num.toFixed(1)}%`;
            case 'compact':
                if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
                if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
                return num.toString();
            default:
                return num.toLocaleString();
        }
    }, []);

    // Platform Filter Component - memoized
    const PlatformFilter = useCallback(() => {
        const isAllSelected = selectedPlatforms.includes('all');
        const selectedCount = selectedPlatforms.filter(p => p !== 'all').length;
        
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="default"
                        className={cn(
                            "w-[160px] justify-start text-left font-normal relative z-50 h-10",
                            "bg-white/40 dark:bg-black/40 backdrop-blur-sm",
                            "border-slate-200/50 dark:border-slate-700/50",
                            "hover:bg-white/80 dark:hover:bg-black/80",
                            "text-sm rounded-xl"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Filter className="mr-2 h-3 w-3 text-purple-500" />
                        {isAllSelected 
                            ? "All Platforms" 
                            : selectedCount === 1 
                                ? selectedPlatforms[0] === 'tiktok' ? "TikTok" : "Instagram"
                                : `${selectedCount} Platforms`
                        }
                    </Button>
                </PopoverTrigger>
                <PopoverContent 
                    className="w-auto p-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-white/20 dark:border-slate-700/50 shadow-2xl z-[100]" 
                    align="end"
                    side="bottom"
                    sideOffset={8}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-3 space-y-2 min-w-[180px]">
                        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3 px-2">
                            Select Platforms
                        </div>
                        
                        {/* All Option */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePlatform('all')}
                            className={cn(
                                "w-full justify-start text-left h-9 px-3 rounded-lg transition-all duration-200",
                                isAllSelected
                                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-sm"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                            )}
                        >
                            <div className="flex items-center gap-3 w-full">
                                <div className={cn(
                                    "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                                    isAllSelected 
                                        ? "bg-purple-500 border-purple-500" 
                                        : "border-slate-300 dark:border-slate-600"
                                )}>
                                    {isAllSelected && (
                                        <div className="w-2 h-2 bg-white rounded-sm"></div>
                                    )}
                                </div>
                                <span className="text-sm font-medium">All Platforms</span>
                            </div>
                        </Button>

                        {/* Divider */}
                        <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>

                        {/* TikTok Option */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePlatform('tiktok')}
                            className={cn(
                                "w-full justify-start text-left h-9 px-3 rounded-lg transition-all duration-200",
                                selectedPlatforms.includes('tiktok') && !isAllSelected
                                    ? "bg-slate-100 dark:bg-slate-800 shadow-sm"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                            )}
                        >
                            <div className="flex items-center gap-3 w-full">
                                <div className={cn(
                                    "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                                    selectedPlatforms.includes('tiktok') && !isAllSelected
                                        ? "bg-slate-600 border-slate-600" 
                                        : "border-slate-300 dark:border-slate-600"
                                )}>
                                    {selectedPlatforms.includes('tiktok') && !isAllSelected && (
                                        <div className="w-2 h-2 bg-white rounded-sm"></div>
                                    )}
                                </div>
                                <Image
                                    src="/images/tiktok2.png"
                                    alt="TikTok"
                                    width={16}
                                    height={16}
                                    className="rounded-sm"
                                />
                                <span className="text-sm font-medium">TikTok</span>
                            </div>
                        </Button>

                        {/* Instagram Option */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePlatform('instagram')}
                            className={cn(
                                "w-full justify-start text-left h-9 px-3 rounded-lg transition-all duration-200",
                                selectedPlatforms.includes('instagram') && !isAllSelected
                                    ? "bg-slate-100 dark:bg-slate-800 shadow-sm"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                            )}
                        >
                            <div className="flex items-center gap-3 w-full">
                                <div className={cn(
                                    "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                                    selectedPlatforms.includes('instagram') && !isAllSelected
                                        ? "bg-slate-600 border-slate-600" 
                                        : "border-slate-300 dark:border-slate-600"
                                )}>
                                    {selectedPlatforms.includes('instagram') && !isAllSelected && (
                                        <div className="w-2 h-2 bg-white rounded-sm"></div>
                                    )}
                                </div>
                                <Image
                                    src="/images/instargram.png"
                                    alt="Instagram"
                                    width={16}
                                    height={16}
                                    className="rounded-sm"
                                />
                                <span className="text-sm font-medium">Instagram</span>
                            </div>
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        );
    }, [selectedPlatforms, togglePlatform]);

    // Date Range Picker Component - memoized
    const DateRangePicker = useCallback(() => (
        <div className="flex items-center gap-2 relative z-50">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="default"
                        className={cn(
                            "w-[220px] justify-start text-left font-normal relative z-50 h-10",
                            "bg-white/40 dark:bg-black/40 backdrop-blur-sm",
                            "border-slate-200/50 dark:border-slate-700/50",
                            "hover:bg-white/80 dark:hover:bg-black/80",
                            "text-sm rounded-xl"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CalendarIcon className="mr-2 h-3 w-3 text-purple-500" />
                        {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                    </Button>
                </PopoverTrigger>
                <PopoverContent 
                    className="w-auto p-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-white/20 dark:border-slate-700/50 shadow-2xl z-[100]" 
                    align="end"
                    side="bottom"
                    sideOffset={8}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Desktop Layout - Horizontal */}
                    <div className="hidden md:flex p-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">From Date</label>
                            <Calendar
                                mode="single"
                                selected={dateRange.from}
                                onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">To Date</label>
                            <Calendar
                                mode="single"
                                selected={dateRange.to}
                                onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    
                    {/* Mobile Layout - Vertical */}
                    <div className="md:hidden p-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">From Date</label>
                            <Calendar
                                mode="single"
                                selected={dateRange.from}
                                onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">To Date</label>
                            <Calendar
                                mode="single"
                                selected={dateRange.to}
                                onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    ), [dateRange]);

    // Don't render until mounted to prevent hydration errors
    if (!mounted) {
        return (
            <div className="space-y-6 h-full flex flex-col">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                {/* Tab Navigation */}
                <div className="flex items-center justify-between">
                    <TabsList className="grid max-w-md grid-cols-3 bg-white/40 dark:bg-black/40 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-1">
                    <TabsTrigger 
                        value="overview" 
                        className="flex items-center gap-2 data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-700/80 data-[state=active]:shadow-lg transition-all duration-200"
                    >
                        <BarChart3 className="h-4 w-4" />
                        <span className="font-medium">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger 
                        value="performance" 
                        className="flex items-center gap-2 data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-700/80 data-[state=active]:shadow-lg transition-all duration-200"
                    >
                        <Activity className="h-4 w-4" />
                        <span className="font-medium">Performance</span>
                    </TabsTrigger>
                    <TabsTrigger 
                        value="insights" 
                        className="flex items-center gap-2 data-[state=active]:bg-white/80 dark:data-[state=active]:bg-gray-700/80 data-[state=active]:shadow-lg transition-all duration-200"
                    >
                        <Brain className="h-4 w-4" />
                        <span className="font-medium">AI Insights</span>
                    </TabsTrigger>
                </TabsList>

                    {/* Filters Container - Source, Metric, Platform and Date Range Filters */}
                    <div className="flex items-center gap-3">
                        {/* Source Filter */}
                        <SourceFilter />
                        
                        {/* Metric Filter */}
                        <MetricFilter />
                        
                        {/* Platform Filter */}
                        <PlatformFilter />
                        
                        {/* Date Range Picker */}
                        <DateRangePicker />
                    </div>
                </div>

                {/* Tab Content */}
                <TabsContent value="overview" className="mt-6 flex-1 overflow-y-auto">
                    <div className="space-y-6">
                        {/* Overview Metadata Cards */}
                        <OverviewMetadataCards 
                            dateRange={dateRange}
                            platform={getApiPlatform()}
                            source={selectedSource}
                            metricType={selectedMetricType}
                        />

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Engagement Rate Comparison */}
                            <EngagementRateComparisonChart 
                                dateRange={dateRange}
                                platform={getApiPlatform()}
                                source={selectedSource}
                            />

                            {/* Growth Trends */}
                            <EngagementGrowthTrendChart 
                                dateRange={dateRange}
                                platform={getApiPlatform()}
                                metricType={selectedMetricType}
                            />
                        </div>

                        {/* Top Performing Competitors */}
                        <TopPerformingCompetitors 
                            dateRange={dateRange} 
                            platform={getApiPlatform()}
                            source={selectedSource}
                        />
                    </div>
                </TabsContent>

                {/* Placeholder tabs for future implementation */}
                <TabsContent value="performance" className="mt-6 flex-1 overflow-y-auto">
                    <div className="space-y-6">
                        {/* Shop-Intel vs Competitor Performance Comparison */}
                        <PerformanceComparison 
                            dateRange={dateRange}
                            platform={getApiPlatform()}
                        />

                        {/* Performance Analysis Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* 24h Performance Changes - Real-time Component */}
                            <Performance24hChanges 
                                className=""
                                platform={getApiPlatform()}
                            />

                            {/* Platform Performance Split */}
                            <PlatformPerformanceSplit 
                                dateRange={dateRange}
                                className=""
                                platform={getApiPlatform()}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="insights" className="mt-6 flex-1 overflow-y-auto">
                    <div className="space-y-6">
                        {/* AI Insights Cards Grid - Row 1 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Performance Predictions Card */}
                            <PerformancePredictionsCard />
                            
                            {/* Content Optimization Card */}
                            <ContentOptimizationCard />
                        </div>

                        {/* AI Insights Cards Grid - Row 2 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Competitor Intelligence Card */}
                            <CompetitorIntelligenceCard />
                            
                            {/* Optimal Timing Card */}
                            <OptimalTimingCard />
                        </div>

                        {/* AI Strategic Summary */}
                        <AIStrategicSummary />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CompetitorAnalysis; 