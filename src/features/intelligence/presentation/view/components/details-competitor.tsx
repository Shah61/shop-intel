import React, { useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    ArrowLeft, 
    Eye, 
    Heart, 
    MessageSquare, 
    Share2, 
    Bookmark, 
    TrendingUp, 
    TrendingDown,
    Clock,
    Calendar,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    Sparkles
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCompetitorContent } from '../../tanstack/competitors-tanstack';

interface DetailsCompetitorProps {
    channelId: string;
    channelName: string;
    onBack: () => void;
}

const DetailsCompetitor: React.FC<DetailsCompetitorProps> = ({ channelId, channelName, onBack }) => {
    const [showAll, setShowAll] = useState(false);
    const [expandedSummary, setExpandedSummary] = useState<string | null>(null);

    const { data, isLoading, error } = useCompetitorContent({ 
        channel_id: channelId,
        limit: showAll ? 5000 : 10  // Use a very large number to get all content
    });

    // Memoize format number function to prevent recreation
    const formatNumber = useCallback((num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    }, []);

    // Memoize format duration function
    const formatDuration = useCallback((milliseconds: number) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, []);

    // Memoize format date function
    const formatDate = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    }, []);

    // Toggle AI summary dropdown
    const toggleSummary = useCallback((contentId: string) => {
        setExpandedSummary(prev => prev === contentId ? null : contentId);
    }, []);

    // Get 24h change indicator
    const getChangeIndicator = useCallback((change: number) => {
        if (change > 0) {
            return (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-xs">+{formatNumber(change)}</span>
                </div>
            );
        } else if (change < 0) {
            return (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <TrendingDown className="h-3 w-3" />
                    <span className="text-xs">{formatNumber(change)}</span>
                </div>
            );
        }
        return <span className="text-xs text-gray-500">-</span>;
    }, [formatNumber]);

    // Memoize content data and sort by views (highest first)
    const contentData = useMemo(() => {
        const contents = data?.data.contents || [];
        return [...contents].sort((a, b) => {
            const viewsA = a.metadata.views || 0;
            const viewsB = b.metadata.views || 0;
            return viewsB - viewsA; // Sort in descending order (highest views first)
        });
    }, [data]);

    const totalContents = data?.data.metadata.total || 0;
    const hasMoreContents = totalContents > 10;

    if (error) {
        return (
            <Card className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border-slate-200/30 dark:border-slate-700/50">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBack}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <CardTitle className="text-lg font-semibold text-red-600">
                            Error Loading Content
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-600 dark:text-slate-400">
                        Failed to load competitor content. Please try again.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border-slate-200/30 dark:border-slate-700/50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBack}
                            className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <div>
                            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                {channelName} - Content Details
                            </CardTitle>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Video content and performance analytics
                            </p>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Summary Cards */}
                        {data && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Eye className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm text-blue-600 dark:text-blue-400">Total Videos</span>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                            {formatNumber(totalContents)}
                                        </p>
                                    </CardContent>
                                </Card>
                                
                                <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Eye className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-green-600 dark:text-green-400">Avg Views</span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                            {formatNumber(
                                                contentData.length > 0 
                                                    ? Math.round(contentData.reduce((sum, content) => sum + (content.metadata.views || 0), 0) / contentData.length)
                                                    : 0
                                            )}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Heart className="h-4 w-4 text-purple-600" />
                                            <span className="text-sm text-purple-600 dark:text-purple-400">Avg Likes</span>
                                        </div>
                                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                            {formatNumber(
                                                contentData.length > 0 
                                                    ? Math.round(contentData.reduce((sum, content) => sum + (content.metadata.likes || 0), 0) / contentData.length)
                                                    : 0
                                            )}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-orange-600" />
                                            <span className="text-sm text-orange-600 dark:text-orange-400">Avg Engagement</span>
                                        </div>
                                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                                            {contentData.length > 0 
                                                ? (
                                                    contentData.reduce((sum, content) => {
                                                        const likes = content.metadata.likes || 0;
                                                        const comments = content.metadata.comments || 0;
                                                        const shares = content.metadata.shares || 0;
                                                        const views = content.metadata.views || 1; // Avoid division by zero
                                                        return sum + ((likes + comments + shares) / views) * 100;
                                                    }, 0) / contentData.length
                                                ).toFixed(1)
                                                : '0'
                                            }%
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Content Table */}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-200/30 dark:border-slate-700/30">
                                        <TableHead className="text-slate-700 dark:text-slate-300">Video</TableHead>
                                        <TableHead className="text-slate-700 dark:text-slate-300">
                                            <div className="flex items-center gap-1">
                                                <Sparkles className="h-4 w-4" />
                                                AI Summary
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-slate-700 dark:text-slate-300">
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-4 w-4" />
                                                Views
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-slate-700 dark:text-slate-300">
                                            <div className="flex items-center gap-1">
                                                <Heart className="h-4 w-4" />
                                                Likes
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-slate-700 dark:text-slate-300">
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="h-4 w-4" />
                                                Comments
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-slate-700 dark:text-slate-300">
                                            <div className="flex items-center gap-1">
                                                <Share2 className="h-4 w-4" />
                                                Shares
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-slate-700 dark:text-slate-300">
                                            <div className="flex items-center gap-1">
                                                <Bookmark className="h-4 w-4" />
                                                Saves
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-slate-700 dark:text-slate-300">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                Duration
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-slate-700 dark:text-slate-300">24h Change</TableHead>
                                        <TableHead className="text-slate-700 dark:text-slate-300">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contentData.map((content) => (
                                        <React.Fragment key={content.id}>
                                            <TableRow className="border-slate-200/20 dark:border-slate-700/20 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                                <TableCell>
                                                    <div className="flex items-start gap-3 max-w-md">
                                                        <img
                                                            src={content.thumbnails.find(t => t.type === 'DEFAULT')?.url}
                                                            alt="Video thumbnail"
                                                            className="w-16 h-12 object-cover rounded-md flex-shrink-0"
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-slate-800 dark:text-slate-200 text-sm line-clamp-2">
                                                                {content.title}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Calendar className="h-3 w-3 text-slate-500" />
                                                                <span className="text-xs text-slate-500">
                                                                    {formatDate(content.created_at)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {content.summarizer_explanations && content.summarizer_explanations.length > 0 && 
                                                     content.summarizer_explanations.some(explanation => {
                                                         const text = typeof explanation === 'string' ? explanation : explanation.explanation;
                                                         return text && !text.toUpperCase().includes('NO TRANSCRIPT AVAILABLE');
                                                     }) ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleSummary(content.id)}
                                                            className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                                        >
                                                            <Sparkles className="h-4 w-4" />
                                                            Key Insights
                                                            {expandedSummary === content.id ? (
                                                                <ChevronUp className="h-3 w-3" />
                                                            ) : (
                                                                <ChevronDown className="h-3 w-3" />
                                                            )}
                                                        </Button>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                                                            <Sparkles className="h-4 w-4" />
                                                            <span className="text-sm">No transcript available</span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                                                            {formatNumber(content.metadata.views || 0)}
                                                        </div>
                                                        {getChangeIndicator(content.metadata["24h_change_views"] || 0)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                                                            {formatNumber(content.metadata.likes || 0)}
                                                        </div>
                                                        {getChangeIndicator(content.metadata["24h_change_likes"] || 0)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                                                            {formatNumber(content.metadata.comments || 0)}
                                                        </div>
                                                        {getChangeIndicator(content.metadata["24h_change_comments"] || 0)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                                                            {formatNumber(content.metadata.shares || 0)}
                                                        </div>
                                                        {getChangeIndicator(content.metadata["24h_change_shares"] || 0)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                                                            {formatNumber(content.metadata.saves || 0)}
                                                        </div>
                                                        {getChangeIndicator(content.metadata["24h_change_saves"] || 0)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-700 dark:text-slate-300">
                                                    {formatDuration(content.metadata.video_length || 0)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {getChangeIndicator(content.metadata["24h_change_views"] || 0)}
                                                        <Badge 
                                                            className={`text-xs ${
                                                                (content.metadata["24h_change_views"] || 0) > 0 
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                            } border-0`}
                                                        >
                                                            {(content.metadata["24h_change_views"] || 0) > 0 ? 'Growing' : 'Declining'}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => window.open(content.video_url, '_blank')}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                                                                        {/* AI Key Insights Dropdown Row */}
                                            {expandedSummary === content.id && content.summarizer_explanations && content.summarizer_explanations.length > 0 && (
                                                <TableRow className="border-slate-200/20 dark:border-slate-700/20 bg-purple-50/30 dark:bg-purple-900/10">
                                                    <TableCell colSpan={10} className="p-0">
                                                        <div className="p-4 border-l-4 border-purple-400 dark:border-purple-500">
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                                                        AI Key Insights
                                                                    </span>
                                                                </div>
                                                                
                                                                {/* Key Insights */}
                                                                <div className="bg-white/60 dark:bg-black/60 p-3 rounded-lg border border-purple-200/30 dark:border-purple-700/30">
                                                                    {content.summarizer_explanations.some(explanation => {
                                                                        const text = typeof explanation === 'string' ? explanation : explanation.explanation;
                                                                        return text && !text.toUpperCase().includes('NO TRANSCRIPT AVAILABLE');
                                                                    }) ? (
                                                                        <ul className="space-y-2">
                                                                            {content.summarizer_explanations
                                                                                .filter(explanation => {
                                                                                    const text = typeof explanation === 'string' ? explanation : explanation.explanation;
                                                                                    return text && !text.toUpperCase().includes('NO TRANSCRIPT AVAILABLE');
                                                                                })
                                                                                .map((explanation, index) => (
                                                                                    <li key={index} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                                                                        <span className="text-purple-500 mt-1 font-medium">•</span>
                                                                                        <span className="leading-relaxed">{typeof explanation === 'string' ? explanation : explanation.explanation}</span>
                                                                                    </li>
                                                                                ))
                                                                            }
                                                                        </ul>
                                                                    ) : (
                                                                        <div className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400 py-4">
                                                                            <Sparkles className="h-4 w-4" />
                                                                            <span className="text-sm">In processing</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Load More / Show Less */}
                        {data && (
                            <div className="mt-4">
                                <div className="text-center text-sm text-slate-600 dark:text-slate-400 mb-3">
                                    Showing {contentData.length} of {totalContents} videos
                                </div>
                                
                                {hasMoreContents && (
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
                                                    Load More ({totalContents - 10} more)
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

export default DetailsCompetitor; 