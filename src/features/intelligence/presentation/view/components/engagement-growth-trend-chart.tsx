import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useEngagementGrowthTrend } from '../../tanstack/competitors-tanstack';
import { useTheme } from 'next-themes';

interface EngagementGrowthTrendChartProps {
    dateRange?: {
        from: Date;
        to: Date;
    };
    className?: string;
    platform?: 'TIKTOK' | 'INSTAGRAM';
    metricType?: 'AVERAGE' | 'HIGHEST';
}

const EngagementGrowthTrendChart: React.FC<EngagementGrowthTrendChartProps> = ({ 
    dateRange: externalDateRange,
    className,
    platform,
    metricType = 'AVERAGE'
}) => {
    const { theme } = useTheme();
    
    // Convert parent metric type to internal data type
    const dataType = metricType === 'AVERAGE' ? 'avg' : 'highest';
    
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

    // Fetch engagement growth trend data
    const { data, isLoading, error, refetch } = useEngagementGrowthTrend(apiParams);

    // Format the data for the chart based on selected data type
    const chartData = useMemo(() => {
        if (!data?.data.engagement_growth_trend) return [];
        
        return data.data.engagement_growth_trend.map(dataPoint => {
            // Parse the date and format it for display
            const date = parseISO(dataPoint.date);
            
            if (dataType === 'avg') {
                return {
                    date: format(date, 'MMM dd'),
                    fullDate: dataPoint.date,
                    competitor: dataPoint.avg.competitors_avg,
                    ["Shop-Intel"]: dataPoint.avg['Shop-Intel_avg'],
                    creator: dataPoint.avg.creator_avg
                };
            } else {
                return {
                    date: format(date, 'MMM dd'),
                    fullDate: dataPoint.date,
                    competitor: dataPoint.highest.competitors_highest,
                    ["Shop-Intel"]: dataPoint.highest['Shop-Intel_highest'],
                    creator: dataPoint.highest.creator_highest
                };
            }
        });
    }, [data, dataType]);

    // Chart colors based on theme
    const isDark = theme === 'dark';
    const chartColors = useMemo(() => ({
        primary: '#8b5cf6',
        secondary: '#06b6d4',
        warning: '#f59e0b',
        text: isDark ? '#9ca3af' : '#64748b',
    }), [isDark]);

    // Dynamic legend names based on metric type
    const legendNames = useMemo(() => {
        const suffix = dataType === 'avg' ? 'Avg' : 'Highest';
        return {
            competitor: `Competitors ${suffix}`,
            ["Shop-Intel"]: dataType === 'avg' ? 'Shop-Intel Beauty' : 'Shop-Intel Highest',
            creator: `Creators ${suffix}`
        };
    }, [dataType]);

    // Custom tooltip formatter
    const CustomTooltip = useCallback(({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const isPercentage = dataType === 'avg';
            const unit = isPercentage ? '%' : '';
            
            return (
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-lg p-3 shadow-lg">
                    <p className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                        {format(parseISO(data.fullDate), 'MMM dd, yyyy')}
                    </p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            <span className="font-medium">{entry.name}:</span> {
                                isPercentage 
                                    ? `${entry.value.toFixed(2)}${unit}` 
                                    : entry.value.toLocaleString()
                            }
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    }, [dataType]);

    if (error) {
        return (
            <Card className={cn("bg-white/60 dark:bg-black/60 backdrop-blur-sm border-slate-200/30 dark:border-slate-700/50", className)}>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-red-600 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Error Loading Engagement Growth Trends
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Failed to load engagement growth trend data. Please try again.
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
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            Engagement Growth Trends
                        </CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Daily engagement rate performance tracking {dataType === 'avg' ? '(Average)' : '(Highest Values)'}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                ) : (
                    <>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                                    <XAxis 
                                        dataKey="date" 
                                        tick={{ fontSize: 11, fill: chartColors.text }}
                                        stroke={chartColors.text}
                                        label={{ 
                                            value: 'Date', 
                                            position: 'insideBottom', 
                                            offset: -5, 
                                            style: { textAnchor: 'middle', fill: chartColors.text } 
                                        }}
                                    />
                                    <YAxis 
                                        tick={{ fontSize: 11, fill: chartColors.text }}
                                        stroke={chartColors.text}
                                        label={{ 
                                            value: dataType === 'avg' ? 'Engagement (%)' : 'Engagement Count', 
                                            angle: -90, 
                                            position: 'insideLeft', 
                                            style: { textAnchor: 'middle', fill: chartColors.text } 
                                        }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="competitor" 
                                        stroke={chartColors.primary} 
                                        strokeWidth={3}
                                        name={legendNames.competitor}
                                        dot={{ fill: chartColors.primary, strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: chartColors.primary, strokeWidth: 2 }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="Shop-Intel" 
                                        stroke={chartColors.warning} 
                                        strokeWidth={3}
                                        name={legendNames["Shop-Intel"]}
                                        dot={{ fill: chartColors.warning, strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: chartColors.warning, strokeWidth: 2 }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="creator" 
                                        stroke={chartColors.secondary} 
                                        strokeWidth={3}
                                        name={legendNames.creator}
                                        dot={{ fill: chartColors.secondary, strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: chartColors.secondary, strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        
                        {/* Custom Legend - Responsive */}
                        <div className="mt-4 flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: chartColors.primary }}></div>
                                <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">{legendNames.competitor}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: chartColors.warning }}></div>
                                <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">{legendNames["Shop-Intel"]}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: chartColors.secondary }}></div>
                                <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">{legendNames.creator}</span>
                            </div>
                        </div>
                        
                        {/* Summary Stats - Responsive */}
                        {data && (
                            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <span className="text-center sm:text-left">
                                    {data.data.engagement_growth_trend.length} data points
                                </span>
                                <span className="text-center sm:text-right">
                                    Data for {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                                </span>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default EngagementGrowthTrendChart; 