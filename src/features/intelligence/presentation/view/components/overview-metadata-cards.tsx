import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Users, TrendingUp, Target, Heart, BarChart3, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, subDays } from 'date-fns';
import { useOverviewMetadata } from '../../tanstack/competitors-tanstack';

interface OverviewMetadataCardsProps {
    dateRange?: {
        from: Date;
        to: Date;
    };
    platform?: 'TIKTOK' | 'INSTAGRAM';
    source?: 'CREATOR' | 'COMPETITOR' | 'Shop-Intel' | 'ALL';
    metricType?: 'AVERAGE' | 'HIGHEST';
}

const OverviewMetadataCards: React.FC<OverviewMetadataCardsProps> = ({ dateRange: externalDateRange, platform, source, metricType = 'AVERAGE' }) => {
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

    // Fetch metadata
    const { data, isLoading, error, refetch } = useOverviewMetadata(apiParams);

    // Format numbers for display
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

    if (error) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-red-50 dark:bg-red-900/20 backdrop-blur-sm border-red-200/50 dark:border-red-800/50 hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-4 text-center">
                        <p className="text-red-600 dark:text-red-400 text-sm">Failed to load metadata</p>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => refetch()}
                            className="mt-2"
                        >
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4">

            {/* Static Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Tracked */}
                <Card className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border-slate-200/30 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Tracked</p>
                                {isLoading ? (
                                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        {data?.data.overview_metadata.total_tracked || 0}
                                    </p>
                                )}
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Views */}
                <Card className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border-slate-200/30 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Views</p>
                                {isLoading ? (
                                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        {formatNumber(data?.data.overview_metadata.total_views || 0, 'compact')}
                                    </p>
                                )}
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Eye className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Engagement */}
                <Card className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border-slate-200/30 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Engagement</p>
                                {isLoading ? (
                                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        {formatNumber(data?.data.overview_metadata.total_engagement || 0, 'compact')}
                                    </p>
                                )}
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                                <Heart className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Highest Engagement Rate */}
                <Card className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border-slate-200/30 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Highest Engagement Rate</p>
                                {isLoading ? (
                                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        {formatNumber(data?.data.overview_metadata.highest_engagement_rate || 0, 'percentage')}
                                    </p>
                                )}
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                <BarChart3 className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Dynamic Metrics - Based on Metric Type Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metricType === 'AVERAGE' ? (
                    <>
                        {/* Average Engagement Rate */}
                        <Card className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border-slate-200/30 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Average Engagement Rate</p>
                                        {isLoading ? (
                                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
                                        ) : (
                                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                                {formatNumber(data?.data.overview_metadata.avg_engagement_rate || 0, 'percentage')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Your Performance vs Average */}
                        <Card className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border-slate-200/30 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Your Performance vs Average</p>
                                        {isLoading ? (
                                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
                                        ) : (
                                            <p className={`text-2xl font-bold ${
                                                (data?.data.overview_metadata.your_performance_vs_avg || 0) >= 0 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {(data?.data.overview_metadata.your_performance_vs_avg || 0) >= 0 ? '+' : ''}
                                                {formatNumber(data?.data.overview_metadata.your_performance_vs_avg || 0, 'percentage')}
                                            </p>
                                        )}
                                    </div>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        (data?.data.overview_metadata.your_performance_vs_avg || 0) >= 0
                                            ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                                            : 'bg-gradient-to-br from-orange-500 to-red-500'
                                    }`}>
                                        <Target className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <>
                        {/* Highest Engagement Rate (Duplicate for consistency) */}
                        <Card className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border-slate-200/30 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Highest Engagement Rate</p>
                                        {isLoading ? (
                                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
                                        ) : (
                                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                                {formatNumber(data?.data.overview_metadata.highest_engagement_rate || 0, 'percentage')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                        <BarChart3 className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Your Performance vs Highest */}
                        <Card className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border-slate-200/30 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Your Performance vs Highest</p>
                                        {isLoading ? (
                                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
                                        ) : (
                                            <p className={`text-2xl font-bold ${
                                                (data?.data.overview_metadata.your_performance_vs_highest || 0) >= 0 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {(data?.data.overview_metadata.your_performance_vs_highest || 0) >= 0 ? '+' : ''}
                                                {formatNumber(data?.data.overview_metadata.your_performance_vs_highest || 0, 'percentage')}
                                            </p>
                                        )}
                                    </div>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        (data?.data.overview_metadata.your_performance_vs_highest || 0) >= 0
                                            ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                                            : 'bg-gradient-to-br from-orange-500 to-red-500'
                                    }`}>
                                        <Target className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
};

export default OverviewMetadataCards; 