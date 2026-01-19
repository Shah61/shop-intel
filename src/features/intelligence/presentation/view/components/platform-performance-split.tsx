import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BarChart3, Users, Eye, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { usePlatformPerformanceSplit } from '../../tanstack/competitors-tanstack';
import { useTheme } from 'next-themes';

interface PlatformPerformanceSplitProps {
    dateRange?: {
        from: Date;
        to: Date;
    };
    className?: string;
    platform?: 'TIKTOK' | 'INSTAGRAM';
}

const PlatformPerformanceSplit: React.FC<PlatformPerformanceSplitProps> = ({ 
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

    // Fetch platform performance split data
    const { data, isLoading, error, refetch } = usePlatformPerformanceSplit(apiParams);

    // Format the data for the charts
    const chartData = useMemo(() => {
        if (!data?.data.performance_platform_split) return [];
        
        return data.data.performance_platform_split.map((platform, index) => ({
            name: platform.platform,
            value: platform.contents,
            engagement: platform.engagement_rate,
            percentage: 0, // Will be calculated below
        }));
    }, [data]);

    // Calculate percentages for content distribution
    const chartDataWithPercentages = useMemo(() => {
        const total = chartData.reduce((sum, item) => sum + item.value, 0);
        return chartData.map(item => ({
            ...item,
            percentage: total > 0 ? (item.value / total) * 100 : 0,
        }));
    }, [chartData]);

    // Platform colors and icons
    const PLATFORM_COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#f97316'];
    
    // Platform icon mapping
    const getPlatformIcon = useCallback((platformName: string) => {
        const platform = platformName.toLowerCase();
        if (platform === 'instagram') {
            return '/images/instargram.png'; // Note: keeping original filename
        } else if (platform === 'tiktok') {
            return '/images/tiktok2.png';
        }
        return null;
    }, []);

    // Chart colors based on theme
    const isDark = theme === 'dark';
    const chartColors = useMemo(() => ({
        text: isDark ? '#9ca3af' : '#64748b',
    }), [isDark]);

    // Custom tooltip formatter for pie chart
    const CustomTooltip = useCallback(({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-lg p-3 shadow-lg">
                    <p className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                        {data.name}
                    </p>
                    <div className="space-y-1 text-sm">
                        <p className="flex justify-between gap-3">
                            <span>Content Count:</span>
                            <span className="font-medium">{data.value.toLocaleString()}</span>
                        </p>
                        <p className="flex justify-between gap-3">
                            <span>Engagement Rate:</span>
                            <span className="font-medium">{data.engagement.toFixed(2)}%</span>
                        </p>
                        <p className="flex justify-between gap-3">
                            <span>Share:</span>
                            <span className="font-medium">{data.percentage.toFixed(1)}%</span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    }, []);

    // Format number function
    const formatNumber = useCallback((num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    }, []);

    if (error) {
        return (
            <Card className={cn("bg-white/60 dark:bg-black/60 backdrop-blur-sm border-slate-200/30 dark:border-slate-700/50", className)}>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-red-600 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Error Loading Platform Performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Failed to load platform performance data. Please try again.
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
                            <BarChart3 className="h-5 w-5 text-blue-500" />
                            Platform Performance Split
                        </CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Content distribution and engagement by platform
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Pie Chart */}
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartDataWithPercentages}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                                        labelLine={false}
                                    >
                                        {chartDataWithPercentages.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={PLATFORM_COLORS[index % PLATFORM_COLORS.length]} 
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Platform Statistics */}
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                                Platform Details
                            </h3>
                            <div className="space-y-3">
                                {chartDataWithPercentages.map((platform, index) => {
                                    const platformIcon = getPlatformIcon(platform.name);
                                    return (
                                        <div 
                                            key={platform.name}
                                            className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/30 dark:border-slate-700/30"
                                        >
                                            <div className="flex items-center gap-3">
                                                {platformIcon ? (
                                                    <div className="w-6 h-6 flex items-center justify-center">
                                                        <Image
                                                            src={platformIcon}
                                                            alt={platform.name}
                                                            width={24}
                                                            height={24}
                                                            className="rounded-sm"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div 
                                                        className="w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: PLATFORM_COLORS[index % PLATFORM_COLORS.length] }}
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-medium text-slate-800 dark:text-slate-200">
                                                        {platform.name}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            <span>{formatNumber(platform.value)} content</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <TrendingUp className="h-3 w-3" />
                                                            <span>{platform.engagement.toFixed(2)}% engagement</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                                    {platform.percentage.toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    of total content
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Footer */}
                {data && (
                    <div className="mt-6 pt-4 border-t border-slate-200/30 dark:border-slate-700/30">
                        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                            <span>
                                {data.data.performance_platform_split.length} platform{data.data.performance_platform_split.length !== 1 ? 's' : ''} tracked
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

export default PlatformPerformanceSplit; 