import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Eye, Heart, MessageCircle, Share2, Clock, Zap, Target, Crown, ArrowUp, ArrowDown } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { use24hPerformanceChanges } from '../../tanstack/competitors-tanstack';
import { useTheme } from 'next-themes';

interface Performance24hChangesProps {
    className?: string;
    platform?: 'TIKTOK' | 'INSTAGRAM';
}

const Performance24hChanges: React.FC<Performance24hChangesProps> = ({ 
    className,
    platform
}) => {
    const { theme } = useTheme();

    // Prepare API parameters for 24h performance changes
    const apiParams = useMemo(() => ({
        platform: platform,
    }), [platform]);

    // Fetch 24h performance changes
    const { data, isLoading, error, refetch } = use24hPerformanceChanges(apiParams);

    // Format number function
    const formatNumber = useCallback((num: number | null | undefined) => {
        if (num === null || num === undefined || isNaN(num)) return '0';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString();
    }, []);

    // Format percentage change
    const formatPercentageChange = useCallback((change: number) => {
        const formatted = Math.abs(change).toFixed(1);
        return change >= 0 ? `+${formatted}%` : `-${formatted}%`;
    }, []);

    // Extract data for display
    const performanceData = useMemo(() => {
        if (!data?.data) return null;
        
        const shopIntelData = data.data.find(item => item.source === 'Shop-Intel')?.performance_changes[0];
        const competitorData = data.data.find(item => item.source === 'COMPETITOR')?.performance_changes[0];
        
        if (!shopIntelData || !competitorData) return null;

        return {
            shopIntel: shopIntelData,
            competitor: competitorData
        };
    }, [data]);

    // Chart data for metrics comparison
    const chartData = useMemo(() => {
        if (!performanceData) return [];
        
        const { shopIntel, competitor } = performanceData;
        
        return [
            {
                metric: 'Views',
                ["Shop-Intel"]: shopIntel.views,
                Competitor: competitor.views,
                ["Shop-IntelChange"]: shopIntel.percentage_change,
                CompetitorChange: competitor.percentage_change,
                icon: Eye,
                color: '#3b82f6'
            },
            {
                metric: 'Likes',
                ["Shop-Intel"]: shopIntel.likes,
                Competitor: competitor.likes,
                ["Shop-IntelChange"]: shopIntel.percentage_change,
                CompetitorChange: competitor.percentage_change,
                icon: Heart,
                color: '#ef4444'
            },
            {
                metric: 'Comments',
                ["Shop-Intel"]: shopIntel.comments,
                Competitor: competitor.comments,
                ["Shop-IntelChange"]: shopIntel.percentage_change,
                CompetitorChange: competitor.percentage_change,
                icon: MessageCircle,
                color: '#f59e0b'
            },
            {
                metric: 'Shares',
                ["Shop-Intel"]: shopIntel.shares,
                Competitor: competitor.shares,
                ["Shop-IntelChange"]: shopIntel.percentage_change,
                CompetitorChange: competitor.percentage_change,
                icon: Share2,
                color: '#10b981'
            }
        ];
    }, [performanceData]);

    // Engagement rate comparison data for pie chart
    const engagementPieData = useMemo(() => {
        if (!performanceData) return [];
        
        const { shopIntel, competitor } = performanceData;
        
        return [
            {
                name: 'Shop-Intel',
                value: shopIntel.engagement_rate,
                color: '#8b5cf6'
            },
            {
                name: 'Competitor',
                value: competitor.engagement_rate,
                color: '#06b6d4'
            }
        ];
    }, [performanceData]);

    // Chart colors based on theme
    const isDark = theme === 'dark';
    const chartColors = useMemo(() => ({
        ["Shop-Intel"]: '#8b5cf6',
        competitor: '#06b6d4',
        text: isDark ? '#9ca3af' : '#64748b',
        positive: '#10b981',
        negative: '#ef4444'
    }), [isDark]);

    // Custom tooltip for charts
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

    if (error) {
        return (
            <Card className={cn("bg-white/60 dark:bg-black/60 backdrop-blur-sm border-slate-200/30 dark:border-slate-700/50", className)}>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-red-600 flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Error Loading 24h Performance Data
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Failed to load 24-hour performance changes. Please try again.
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
                <div>
                    <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        24H Performance Changes
                        <div className="flex items-center gap-1 ml-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Live</span>
                        </div>
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Real-time comparison of Shop-Intel vs competitor performance in the last 24 hours
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                ) : performanceData ? (
                    <div className="space-y-4">
                        {/* Key Metrics Overview */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Shop-Intel Performance */}
                            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-700/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Crown className="h-4 w-4 text-purple-600" />
                                            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Shop-Intel</span>
                                        </div>
                                        <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                                            {performanceData.shopIntel.engagement_rate.toFixed(2)}%
                                        </p>
                                        <div className="flex items-center gap-1 mt-1">
                                            {performanceData.shopIntel.percentage_change >= 0 ? (
                                                <ArrowUp className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <ArrowDown className="h-3 w-3 text-red-500" />
                                            )}
                                            <span className={`text-xs ${
                                                performanceData.shopIntel.percentage_change >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {formatPercentageChange(performanceData.shopIntel.percentage_change)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Competitor Performance */}
                            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-700/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Target className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Competitor</span>
                                        </div>
                                        <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                                            {performanceData.competitor.engagement_rate.toFixed(2)}%
                                        </p>
                                        <div className="flex items-center gap-1 mt-1">
                                            {performanceData.competitor.percentage_change >= 0 ? (
                                                <ArrowUp className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <ArrowDown className="h-3 w-3 text-red-500" />
                                            )}
                                            <span className={`text-xs ${
                                                performanceData.competitor.percentage_change >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {formatPercentageChange(performanceData.competitor.percentage_change)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Gap */}
                        <div className={`p-3 rounded-lg text-center ${
                            performanceData.shopIntel.engagement_rate > performanceData.competitor.engagement_rate 
                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
                        }`}>
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <TrendingUp className={`h-4 w-4 ${
                                    performanceData.shopIntel.engagement_rate > performanceData.competitor.engagement_rate 
                                        ? 'text-green-600' 
                                        : 'text-red-600'
                                }`} />
                                <span className={`text-sm font-medium ${
                                    performanceData.shopIntel.engagement_rate > performanceData.competitor.engagement_rate 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-red-600 dark:text-red-400'
                                }`}>Performance Gap</span>
                            </div>
                            <p className={`text-lg font-bold ${
                                performanceData.shopIntel.engagement_rate > performanceData.competitor.engagement_rate 
                                    ? 'text-green-700 dark:text-green-300' 
                                    : 'text-red-700 dark:text-red-300'
                            }`}>
                                {performanceData.shopIntel.engagement_rate > performanceData.competitor.engagement_rate ? '+' : ''}
                                {(performanceData.shopIntel.engagement_rate - performanceData.competitor.engagement_rate).toFixed(2)}%
                            </p>
                            <p className="text-xs text-slate-500">
                                {performanceData.shopIntel.engagement_rate > performanceData.competitor.engagement_rate ? 'Leading' : 'Behind'}
                            </p>
                        </div>

                        {/* Detailed Metrics Breakdown */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">24H Metrics Breakdown</h4>
                            
                            {/* Views */}
                            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Views</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                        {formatNumber(performanceData.shopIntel.views)} vs {formatNumber(performanceData.competitor.views)}
                                    </div>
                                    <div className={`text-xs ${
                                        performanceData.shopIntel.views > performanceData.competitor.views 
                                            ? 'text-green-600' 
                                            : 'text-red-600'
                                    }`}>
                                        {performanceData.shopIntel.views > performanceData.competitor.views ? 'Winning' : 'Behind'}
                                    </div>
                                </div>
                            </div>

                            {/* Likes */}
                            <div className="flex items-center justify-between p-2 rounded-lg bg-red-50/50 dark:bg-red-900/10">
                                <div className="flex items-center gap-2">
                                    <Heart className="h-4 w-4 text-red-600" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Likes</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                        {formatNumber(performanceData.shopIntel.likes)} vs {formatNumber(performanceData.competitor.likes)}
                                    </div>
                                    <div className={`text-xs ${
                                        performanceData.shopIntel.likes > performanceData.competitor.likes 
                                            ? 'text-green-600' 
                                            : 'text-red-600'
                                    }`}>
                                        {performanceData.shopIntel.likes > performanceData.competitor.likes ? 'Winning' : 'Behind'}
                                    </div>
                                </div>
                            </div>

                            {/* Comments */}
                            <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50/50 dark:bg-orange-900/10">
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Comments</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                        {formatNumber(performanceData.shopIntel.comments)} vs {formatNumber(performanceData.competitor.comments)}
                                    </div>
                                    <div className={`text-xs ${
                                        performanceData.shopIntel.comments > performanceData.competitor.comments 
                                            ? 'text-green-600' 
                                            : 'text-red-600'
                                    }`}>
                                        {performanceData.shopIntel.comments > performanceData.competitor.comments ? 'Winning' : 'Behind'}
                                    </div>
                                </div>
                            </div>

                            {/* Shares */}
                            <div className="flex items-center justify-between p-2 rounded-lg bg-green-50/50 dark:bg-green-900/10">
                                <div className="flex items-center gap-2">
                                    <Share2 className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Shares</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                        {formatNumber(performanceData.shopIntel.shares)} vs {formatNumber(performanceData.competitor.shares)}
                                    </div>
                                    <div className={`text-xs ${
                                        performanceData.shopIntel.shares > performanceData.competitor.shares 
                                            ? 'text-green-600' 
                                            : 'text-red-600'
                                    }`}>
                                        {performanceData.shopIntel.shares > performanceData.competitor.shares ? 'Winning' : 'Behind'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-slate-600 dark:text-slate-400">No 24-hour performance data available</p>
                    </div>
                )}

                {/* Summary Footer */}
                {data && (
                    <div className="mt-6 pt-4 border-t border-slate-200/30 dark:border-slate-700/30">
                        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span>Live data • Updates every 5 minutes</span>
                            </div>
                            <span>
                                Last 24 hours • {format(new Date(), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default Performance24hChanges; 