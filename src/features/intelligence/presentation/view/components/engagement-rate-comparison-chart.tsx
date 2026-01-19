import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';
import Image from 'next/image';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useEngagementRateComparison } from '../../tanstack/competitors-tanstack';
import { useTheme } from 'next-themes';

interface EngagementRateComparisonChartProps {
    dateRange?: {
        from: Date;
        to: Date;
    };
    className?: string;
    platform?: 'TIKTOK' | 'INSTAGRAM';
    source?: 'CREATOR' | 'COMPETITOR' | 'Shop-Intel' | 'ALL';
}

const EngagementRateComparisonChart: React.FC<EngagementRateComparisonChartProps> = ({ 
    dateRange: externalDateRange,
    className,
    platform,
    source
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
        source: source,
    }), [dateRange, platform, source]);

    // Fetch engagement rate comparison data
    const { data, isLoading, error, refetch } = useEngagementRateComparison(apiParams);

    // Get color based on source
    const getSourceColor = useCallback((source: string) => {
        switch (source) {
            case 'CREATOR':
                return '#10b981'; // Green
            case 'COMPETITOR':
                return '#f59e0b'; // Orange
            case 'Shop-Intel':
                return '#8b5cf6'; // Purple
            default:
                return '#6b7280'; // Gray
        }
    }, []);

    // Format the data for the chart (show top 10 + Shop-Intel accounts)
    const chartData = useMemo(() => {
        if (!data?.data.engagement_rate_comparison) return [];
         
        // Get top 10 from main data
        const mainData = data.data.engagement_rate_comparison
            .slice(0, 10)
            .map(competitor => ({
                brand: competitor.name.split(' ')[0], // Show only first word
                fullName: competitor.name,
                rate: competitor.engagement_rate,
                id: competitor.id,
                source: competitor.source,
                color: getSourceColor(competitor.source)
            }));

        // Add Shop-Intel accounts at the end if they exist
        const shopIntelData = (data.data['Shop-Intel_engagement_rate_comparison'] || [])
            .map(competitor => ({
                brand: competitor.name.split(' ')[0],
                fullName: competitor.name,
                rate: competitor.engagement_rate,
                id: competitor.id,
                source: competitor.source,
                color: getSourceColor(competitor.source)
            }));

        return [...mainData, ...shopIntelData];
    }, [data, getSourceColor]);

    // Chart colors based on theme
    const isDark = theme === 'dark';
    const chartColors = useMemo(() => ({
        primary: '#8b5cf6',
        text: isDark ? '#9ca3af' : '#64748b',
    }), [isDark]);

    // Platform icon helper
    const getPlatformIcon = useCallback((competitorName: string) => {
        const name = competitorName.toLowerCase();
        if (name.includes('instagram') || name.includes('ig') || name === 'meta') {
            return '/images/instargram.png';
        } else if (name.includes('tiktok') || name.includes('bytedance')) {
            return '/images/tiktok2.png';
        }
        return null;
    }, []);

    // Custom tooltip formatter
    const CustomTooltip = useCallback(({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const platformIcon = getPlatformIcon(data.fullName);
            
            // Source badge styling
            const getSourceBadge = (source: string) => {
                switch (source) {
                    case 'CREATOR':
                        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Creator' };
                    case 'COMPETITOR':
                        return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: 'Competitor' };
                    case 'Shop-Intel':
                        return { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', label: 'Shop-Intel' };
                    default:
                        return { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300', label: 'Unknown' };
                }
            };

            const sourceBadge = getSourceBadge(data.source);
            
            return (
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-lg p-3 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                        {platformIcon && (
                            <Image
                                src={platformIcon}
                                alt="Platform"
                                width={16}
                                height={16}
                                className="rounded-sm"
                            />
                        )}
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                            {data.fullName}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${sourceBadge.bg} ${sourceBadge.text}`}>
                            {sourceBadge.label}
                        </span>
                    </div>
                    <p style={{ color: data.color }} className="text-sm">
                        <span className="font-medium">Engagement Rate:</span> {data.rate.toFixed(2)}%
                    </p>
                </div>
            );
        }
        return null;
    }, [getPlatformIcon]);

    if (error) {
        return (
            <Card className={cn("bg-white/60 dark:bg-black/60 backdrop-blur-sm border-slate-200/30 dark:border-slate-700/50", className)}>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-red-600 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Error Loading Engagement Rate Comparison
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Failed to load engagement rate comparison data. Please try again.
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
                            <BarChart3 className="h-5 w-5 text-purple-500" />
                            Engagement Rate Comparison
                        </CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Top 10 accounts by highest engagement rate + Shop-Intel accounts (if any)
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
                    <>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis 
                                        dataKey="brand" 
                                        tick={{ fontSize: 11, fill: chartColors.text }}
                                        stroke={chartColors.text}
                                        textAnchor="middle"
                                        height={60}
                                    />
                                    <YAxis 
                                        tick={{ fontSize: 11, fill: chartColors.text }}
                                        stroke={chartColors.text}
                                        label={{ 
                                            value: 'Engagement Rate (%)', 
                                            angle: -90, 
                                            position: 'insideLeft', 
                                            style: { textAnchor: 'middle', fill: chartColors.text } 
                                        }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar 
                                        dataKey="rate" 
                                        radius={[4, 4, 0, 0]}
                                        name="Engagement Rate"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        
                        {/* Legend */}
                        <div className="mt-4 flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                                <span className="text-xs text-slate-600 dark:text-slate-400">Creator</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-orange-500"></div>
                                <span className="text-xs text-slate-600 dark:text-slate-400">Competitor</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-purple-500"></div>
                                <span className="text-xs text-slate-600 dark:text-slate-400">Shop-Intel</span>
                            </div>
                        </div>
                        
                        {/* Summary Stats */}
                        {data && (
                            <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                                <span>
                                    Showing top 10 of {data.data.metadata.total} accounts
                                </span>
                                <span>
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

export default EngagementRateComparisonChart; 