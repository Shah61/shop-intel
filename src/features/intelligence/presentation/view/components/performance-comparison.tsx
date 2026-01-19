import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Eye, Heart, Share2, Bookmark, Crown, Target } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { usePerformanceMetadata } from '../../tanstack/competitors-tanstack';
import { useTheme } from 'next-themes';

interface PerformanceComparisonProps {
    dateRange?: {
        from: Date;
        to: Date;
    };
    className?: string;
    platform?: 'TIKTOK' | 'INSTAGRAM';
}

const PerformanceComparison: React.FC<PerformanceComparisonProps> = ({ 
    dateRange: externalDateRange, 
    className,
    platform
}) => {
    const { theme } = useTheme();

    // Internal date range state if not controlled from parent
    const [internalDateRange, setInternalDateRange] = useState<{
        from: Date;
        to: Date;
    }>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });

    // Use external date range if provided, otherwise use internal
    const dateRange = externalDateRange || internalDateRange;

    // Prepare API parameters
    const apiParams = useMemo(() => ({
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(dateRange.to, 'yyyy-MM-dd'),
        platform: platform,
    }), [dateRange, platform]);

    // Fetch performance metadata
    const { data, isLoading, error, refetch } = usePerformanceMetadata(apiParams);

    // Format number function
    const formatNumber = useCallback((num: number | null | undefined) => {
        if (num === null || num === undefined || isNaN(num)) return '0';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString();
    }, []);

    // Format the data for charts
    const chartData = useMemo(() => {
        if (!data?.data.performance_metadata) return [];
        
        const shopIntel = data.data.performance_metadata.find(item => item.source === 'Shop-Intel');
        const competitor = data.data.performance_metadata.find(item => item.source === 'COMPETITOR');
        
        if (!shopIntel || !competitor) return [];

        return [
            {
                metric: 'Views',
                ["Shop-Intel"]: shopIntel.views,
                Competitor: competitor.views,
                icon: Eye,
                color: '#3b82f6'
            },
            {
                metric: 'Likes',
                ["Shop-Intel"]: shopIntel.likes,
                Competitor: competitor.likes,
                icon: Heart,
                color: '#ef4444'
            },
            {
                metric: 'Saves',
                ["Shop-Intel"]: shopIntel.saves,
                Competitor: competitor.saves,
                icon: Bookmark,
                color: '#f59e0b'
            },
            {
                metric: 'Shares',
                ["Shop-Intel"]: shopIntel.shares,
                Competitor: competitor.shares,
                icon: Share2,
                color: '#10b981'
            }
        ];
    }, [data]);



    // Performance insights
    const performanceInsights = useMemo(() => {
        if (!data?.data.performance_metadata) return null;
        
        const shopIntel = data.data.performance_metadata.find(item => item.source === 'Shop-Intel');
        const competitor = data.data.performance_metadata.find(item => item.source === 'COMPETITOR');
        
        if (!shopIntel || !competitor) return null;

        // Calculate engagement rates
        const shopIntelEngagement = shopIntel.views > 0 ? ((shopIntel.likes + shopIntel.shares + shopIntel.saves) / shopIntel.views) * 100 : 0;
        const competitorEngagement = competitor.views > 0 ? ((competitor.likes + competitor.shares + competitor.saves) / competitor.views) * 100 : 0;

        return {
            ["Shop-IntelEngagement"]: shopIntelEngagement,
            competitorEngagement,
            viewsRatio: shopIntel.views / competitor.views,
            likesRatio: shopIntel.likes / competitor.likes,
            savesRatio: shopIntel.saves / competitor.saves,
            sharesRatio: shopIntel.shares / competitor.shares,
            strongestMetric: shopIntelEngagement > competitorEngagement ? 'engagement' : 
                           shopIntel.views / competitor.views > 0.5 ? 'reach' : 'growth potential'
        };
    }, [data]);

    // Chart colors based on theme
    const isDark = theme === 'dark';
    const chartColors = useMemo(() => ({
        ["Shop-Intel"]: '#8b5cf6',
        competitor: '#06b6d4',
        text: isDark ? '#9ca3af' : '#64748b',
    }), [isDark]);

    // Custom tooltip for chart
    const CustomTooltip = useCallback(({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-lg p-3 shadow-lg">
                    <p className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                        {label}
                    </p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            <span className="font-medium">{entry.name}:</span> {formatNumber(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    }, [formatNumber]);

    // Format Y-axis ticks
    const formatYAxisTick = useCallback((value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value.toString();
    }, []);

    if (error) {
        return (
            <Card className={cn("bg-white/60 dark:bg-black/60 backdrop-blur-sm border-slate-200/30 dark:border-slate-700/50", className)}>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-red-600 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Error Loading Performance Data
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Failed to load performance comparison data. Please try again.
                    </p>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => refetch()}
                    >
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("bg-white/60 dark:bg-black/60 backdrop-blur-sm border-slate-200/30 dark:border-slate-700/50", className)}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <Crown className="h-5 w-5 text-purple-500" />
                            Shop-Intel vs Top Competitor Performance
                        </CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Head-to-head performance comparison across key metrics
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Performance Overview Cards */}
                        {data && performanceInsights && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Crown className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">Shop-Intel Engagement</span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                            {performanceInsights['Shop-IntelEngagement'].toFixed(2)}%
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">Overall engagement rate</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Target className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">Competitor Engagement</span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                            {performanceInsights.competitorEngagement.toFixed(2)}%
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">Average competitor rate</p>
                                    </CardContent>
                                </Card>

                                                                 <Card className={`bg-gradient-to-r ${
                                     performanceInsights['Shop-IntelEngagement'] > performanceInsights.competitorEngagement 
                                         ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700'
                                         : 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-700'
                                 }`}>
                                     <CardContent className="p-4">
                                         <div className="flex items-center gap-2 mb-2">
                                             <TrendingUp className={`h-4 w-4 ${
                                                 performanceInsights['Shop-IntelEngagement'] > performanceInsights.competitorEngagement 
                                                     ? 'text-green-600' 
                                                     : 'text-red-600'
                                             }`} />
                                             <span className={`text-sm font-medium ${
                                                 performanceInsights['Shop-IntelEngagement'] > performanceInsights.competitorEngagement 
                                                     ? 'text-green-600 dark:text-green-400' 
                                                     : 'text-red-600 dark:text-red-400'
                                             }`}>Performance Gap</span>
                                         </div>
                                         <p className={`text-2xl font-bold ${
                                             performanceInsights['Shop-IntelEngagement'] > performanceInsights.competitorEngagement 
                                                 ? 'text-green-700 dark:text-green-300' 
                                                 : 'text-red-700 dark:text-red-300'
                                         }`}>
                                             {performanceInsights['Shop-IntelEngagement'] > performanceInsights.competitorEngagement ? '+' : ''}
                                             {(performanceInsights['Shop-IntelEngagement'] - performanceInsights.competitorEngagement).toFixed(2)}%
                                         </p>
                                         <p className="text-xs text-slate-500 mt-1">
                                             {performanceInsights['Shop-IntelEngagement'] > performanceInsights.competitorEngagement ? 'Leading' : 'Behind'}
                                         </p>
                                     </CardContent>
                                 </Card>
                            </div>
                        )}

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Metrics Comparison Chart */}
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                                    Metrics Comparison
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <XAxis 
                                                dataKey="metric" 
                                                tick={{ fontSize: 11, fill: chartColors.text }}
                                                stroke={chartColors.text}
                                            />
                                            <YAxis 
                                                tick={{ fontSize: 10, fill: chartColors.text }}
                                                stroke={chartColors.text}
                                                tickFormatter={formatYAxisTick}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar 
                                                dataKey="Shop-Intel" 
                                                fill={chartColors["Shop-Intel"]}
                                                radius={[4, 4, 0, 0]}
                                                name="Shop-Intel Beauty"
                                                opacity={0.8}
                                            />
                                            <Bar 
                                                dataKey="Competitor" 
                                                fill={chartColors.competitor}
                                                radius={[4, 4, 0, 0]}
                                                name="Top Competitor"
                                                opacity={0.8}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex items-center justify-center gap-6 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded" style={{ backgroundColor: chartColors["Shop-Intel"] }}></div>
                                        <span className="text-slate-600 dark:text-slate-400">Shop-Intel Beauty</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded" style={{ backgroundColor: chartColors.competitor }}></div>
                                        <span className="text-slate-600 dark:text-slate-400">Top Competitor</span>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Metrics Table */}
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                                    Detailed Comparison
                                </h3>
                                <div className="space-y-3">
                                    {chartData.map((metric, index) => {
                                        const Icon = metric.icon;
                                        const shopIntelValue = metric['Shop-Intel'];
                                        const competitorValue = metric.Competitor;
                                        const ratio = shopIntelValue / competitorValue;
                                        const isWinning = ratio > 1;
                                        
                                        return (
                                            <div 
                                                key={metric.metric}
                                                className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/30 dark:border-slate-700/30"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div 
                                                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                                        style={{ backgroundColor: `${metric.color}20`, border: `2px solid ${metric.color}` }}
                                                    >
                                                        <Icon className="h-4 w-4" style={{ color: metric.color }} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                                                            {metric.metric}
                                                        </p>
                                                        <div className="text-xs text-slate-600 dark:text-slate-400">
                                                            <div className="text-green-600 dark:text-green-400 font-medium">
                                                                Shop-Intel: {formatNumber(shopIntelValue)}
                                                            </div>
                                                            <div className="text-blue-600 dark:text-blue-400 font-medium">
                                                                Competitor: {formatNumber(competitorValue)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className={`text-base font-semibold ${
                                                        isWinning ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                        {isWinning ? '↗' : '↘'} {(ratio * 100).toFixed(0)}%
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {isWinning ? 'Leading' : 'Behind'}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Footer */}
                {data && (
                    <div className="mt-6 pt-4 border-t border-slate-200/30 dark:border-slate-700/30">
                        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                            <span>
                                Performance comparison based on {data.data.performance_metadata.length} data sources
                            </span>
                            <span>
                                Data for {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PerformanceComparison; 