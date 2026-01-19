import React, { useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, Users, MessageSquare, Share2, Eye, ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTopPerformingCompetitors } from '../../tanstack/competitors-tanstack';
import DetailsCompetitor from './details-competitor';
import { cn } from '@/lib/utils';

interface TopPerformingCompetitorsProps {
    dateRange: {
        from: Date;
        to: Date;
    };
    platform?: 'TIKTOK' | 'INSTAGRAM';
    source?: 'CREATOR' | 'COMPETITOR' | 'Shop-Intel' | 'ALL';
}

type SortField = 'views' | 'likes' | 'comments' | 'shares' | 'engagement_rate' | 'growth' | 'performance';
type SortOrder = 'asc' | 'desc';

const TopPerformingCompetitors: React.FC<TopPerformingCompetitorsProps> = ({ dateRange, platform, source }) => {
    // State to track whether to show all competitors or just 10
    const [showAll, setShowAll] = useState(false);
    // State to track selected competitor for details view
    const [selectedCompetitor, setSelectedCompetitor] = useState<{ id: string; name: string } | null>(null);
    // State for sorting
    const [sortField, setSortField] = useState<SortField>('engagement_rate');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // Convert dateRange to the format expected by the API
    const apiDateRange = useMemo(() => ({
        start_date: dateRange.from.toISOString().split('T')[0],
        end_date: dateRange.to.toISOString().split('T')[0],
        platform: platform,
        source: source,
    }), [dateRange, platform, source]);

    const { data, isLoading, error } = useTopPerformingCompetitors(apiDateRange);

    // Memoize format number function to prevent recreation
    const formatNumber = useCallback((num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    }, []);

    // Memoize performance badge function to prevent recreation
    const getPerformanceBadge = useCallback((engagementRate: number, growthRate?: number) => {
        // Determine badge based on engagement rate and optional growth rate
        if (engagementRate >= 0.04) {
            return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-0">
                Very High
            </Badge>;
        } else if (engagementRate >= 0.025) {
            return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-0">
                High
            </Badge>;
        } else if (engagementRate >= 0.015) {
            return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-0">
                Medium
            </Badge>;
        } else {
            return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-0">
                Low
            </Badge>;
        }
    }, []);

    // Memoize image error handler to prevent recreation
    const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>, competitorName: string) => {
        const target = e.target as HTMLImageElement;
        const randomColor = Math.floor(Math.random()*16777215).toString(16);
        target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23${randomColor}"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial" font-size="16" font-weight="bold">${competitorName.charAt(0)}</text></svg>`;
    }, []);

    // Sorting function
    const handleSort = useCallback((field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    }, [sortField, sortOrder]);

    // Get sort icon
    const getSortIcon = useCallback((field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
        }
        return sortOrder === 'asc' 
            ? <ArrowUp className="h-4 w-4 text-purple-500" />
            : <ArrowDown className="h-4 w-4 text-purple-500" />;
    }, [sortField, sortOrder]);

    // Memoize competitors data with sorting
    const competitorsData = useMemo(() => {
        const channels = data?.data.channels || [];
        
        // Sort the data
        const sortedChannels = [...channels].sort((a, b) => {
            let aValue: number;
            let bValue: number;
            
            switch (sortField) {
                case 'views':
                    aValue = a.engagement_metrics?.views || 0;
                    bValue = b.engagement_metrics?.views || 0;
                    break;
                case 'likes':
                    aValue = a.engagement_metrics?.likes || 0;
                    bValue = b.engagement_metrics?.likes || 0;
                    break;
                case 'comments':
                    aValue = a.engagement_metrics?.comments || 0;
                    bValue = b.engagement_metrics?.comments || 0;
                    break;
                case 'shares':
                    aValue = a.engagement_metrics?.shares || 0;
                    bValue = b.engagement_metrics?.shares || 0;
                    break;
                case 'engagement_rate':
                    aValue = a.engagement_metrics?.percentage_engagement || 0;
                    bValue = b.engagement_metrics?.percentage_engagement || 0;
                    break;
                case 'growth':
                    aValue = a.previous_engagement_metrics?.percentage_engagement_change || 0;
                    bValue = b.previous_engagement_metrics?.percentage_engagement_change || 0;
                    break;
                case 'performance':
                    // Performance based on engagement rate (higher is better)
                    aValue = a.engagement_metrics?.percentage_engagement || 0;
                    bValue = b.engagement_metrics?.percentage_engagement || 0;
                    break;
                default:
                    aValue = 0;
                    bValue = 0;
            }
            
            if (sortOrder === 'asc') {
                return aValue - bValue;
            } else {
                return bValue - aValue;
            }
        });
        
        return showAll ? sortedChannels : sortedChannels.slice(0, 10);
    }, [data, showAll, sortField, sortOrder]);

    // Get total number of competitors
    const totalCompetitors = data?.data.channels.length || 0;
    const hasMoreCompetitors = totalCompetitors > 10;

    // Handle competitor selection
    const handleCompetitorClick = useCallback((competitor: { id: string; name: string }) => {
        setSelectedCompetitor(competitor);
    }, []);

    // Handle back from details view
    const handleBackToList = useCallback(() => {
        setSelectedCompetitor(null);
    }, []);

    // Conditionally render the details component without early return
    // This ensures hooks are always called in the same order

    if (error) {
        return (
            <Card className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border-slate-200/30 dark:border-slate-700/50">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-red-600 flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Error Loading Competitors
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-600 dark:text-slate-400">
                        Failed to load competitor data. Please try again.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Get dynamic title and description based on source
    const getTitleAndDescription = useCallback(() => {
        switch (source) {
            case 'CREATOR':
                return {
                    title: 'Top Performing Creators',
                    description: 'Leading content creators by engagement metrics'
                };
            case 'COMPETITOR':
                return {
                    title: 'Top Performing Competitors',
                    description: 'Leading competitor brands by engagement metrics'
                };
            case 'Shop-Intel':
                return {
                    title: 'Shop-Intel Beauty Performance',
                    description: 'Shop-Intel Beauty content performance metrics'
                };
            case 'ALL':
            default:
                return {
                    title: 'Top Performing Channels',
                    description: 'Leading channels across all sources by engagement metrics'
                };
        }
    }, [source]);

    const { title, description } = getTitleAndDescription();

    // If a competitor is selected, show the details component
    if (selectedCompetitor) {
        return (
            <DetailsCompetitor
                channelId={selectedCompetitor.id}
                channelName={selectedCompetitor.name}
                onBack={handleBackToList}
            />
        );
    }

    return (
        <Card className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border-slate-200/30 dark:border-slate-700/50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <Target className="h-5 w-5 text-orange-500" />
                            {title}
                        </CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {description} • Click headers to sort, rows to view detailed content
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-200/30 dark:border-slate-700/30">
                                    <TableHead className="text-slate-700 dark:text-slate-300">Rank</TableHead>
                                    <TableHead className="text-slate-700 dark:text-slate-300">Channel</TableHead>
                                    <TableHead 
                                        className="text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        onClick={() => handleSort('views')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <Eye className="h-4 w-4" />
                                            Views
                                            {getSortIcon('views')}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        onClick={() => handleSort('likes')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            Likes
                                            {getSortIcon('likes')}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        onClick={() => handleSort('comments')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <MessageSquare className="h-4 w-4" />
                                            Comments
                                            {getSortIcon('comments')}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        onClick={() => handleSort('shares')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <Share2 className="h-4 w-4" />
                                            Shares
                                            {getSortIcon('shares')}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        onClick={() => handleSort('engagement_rate')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <TrendingUp className="h-4 w-4" />
                                            Engagement Rate
                                            {getSortIcon('engagement_rate')}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        onClick={() => handleSort('growth')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Growth
                                            {getSortIcon('growth')}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        onClick={() => handleSort('performance')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Performance
                                            {getSortIcon('performance')}
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {competitorsData.map((competitor, index) => (
                                    <TableRow 
                                        key={competitor.id}
                                        className="border-slate-200/20 dark:border-slate-700/20 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer"
                                        onClick={() => handleCompetitorClick({ id: competitor.id, name: competitor.name })}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                    {index + 1}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={competitor.image_url}
                                                    alt={competitor.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                    onError={(e) => handleImageError(e, competitor.name)}
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium text-slate-800 dark:text-slate-200">
                                                            {competitor.name}
                                                        </div>
                                                        <Badge 
                                                            className={cn(
                                                                "px-2 py-0.5 text-xs font-medium border-0",
                                                                competitor.source === 'Shop-Intel' 
                                                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                                                    : competitor.source === 'CREATOR'
                                                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                                                            )}
                                                        >
                                                            {competitor.source}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {competitor.unique_id || competitor.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-700 dark:text-slate-300">
                                            {formatNumber(competitor.engagement_metrics?.views || 0)}
                                        </TableCell>
                                        <TableCell className="text-slate-700 dark:text-slate-300">
                                            {formatNumber(competitor.engagement_metrics?.likes || 0)}
                                        </TableCell>
                                        <TableCell className="text-slate-700 dark:text-slate-300">
                                            {formatNumber(competitor.engagement_metrics?.comments || 0)}
                                        </TableCell>
                                        <TableCell className="text-slate-700 dark:text-slate-300">
                                            {formatNumber(competitor.engagement_metrics?.shares || 0)}
                                        </TableCell>
                                        <TableCell className="text-slate-700 dark:text-slate-300">
                                            {(competitor.engagement_metrics?.percentage_engagement || 0).toFixed(2)}%
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {competitor.previous_engagement_metrics?.percentage_engagement_change !== undefined ? (
                                                    <span className={`text-sm font-medium ${
                                                        competitor.previous_engagement_metrics.percentage_engagement_change > 0
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                        {competitor.previous_engagement_metrics.percentage_engagement_change > 0 ? '+' : ''}
                                                        {competitor.previous_engagement_metrics.percentage_engagement_change.toFixed(2)}%
                                                    </span>
                                                ) : (
                                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        N/A
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getPerformanceBadge(
                                                competitor.engagement_metrics?.percentage_engagement || 0,
                                                competitor.previous_engagement_metrics?.percentage_engagement_change
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        
                        {data && (
                            <div className="mt-4">
                                <div className="text-center text-sm text-slate-600 dark:text-slate-400 mb-3">
                                    Showing {competitorsData.length} of {totalCompetitors} {
                                        source === 'CREATOR' ? 'creators' :
                                        source === 'COMPETITOR' ? 'competitors' :
                                        source === 'Shop-Intel' ? 'Shop-Intel content' :
                                        'channels'
                                    }
                                </div>
                                
                                {hasMoreCompetitors && (
                                    <div className="flex justify-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowAll(!showAll)}
                                            className="flex items-center gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        >
                                            {showAll ? (
                                                <>
                                                    <ChevronUp className="h-4 w-4" />
                                                    Show Less
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="h-4 w-4" />
                                                    Load More ({totalCompetitors - 10} more {
                                                        source === 'CREATOR' ? 'creators' :
                                                        source === 'COMPETITOR' ? 'competitors' :
                                                        source === 'Shop-Intel' ? 'content' :
                                                        'channels'
                                                    })
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TopPerformingCompetitors;
