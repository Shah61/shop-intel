"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    TrendingUp, 
    TrendingDown,
    MessageSquare,
    ArrowUpRight,
    Zap,
    Sparkles,
    Loader2,
    Coffee,
    Heart,
    Palette,
    Leaf,
    Award,
    Globe,
    Timer
} from 'lucide-react';
import { useTrendingTopics } from '../../tanstack/trend-tanstack';

interface TrendingTopic {
    topic: string;
    description: string;
    trending_score: number;
    mentions: number;
    growth_rate: number;
    related_keywords: string[];
}

const TrendingTopicsclothing: React.FC = () => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<'score' | 'growth' | 'mentions'>('score');
    const { data: topicsData, isLoading, error } = useTrendingTopics();

    const getTopicIcon = (topic: string) => {
        const iconMap: { [key: string]: any } = {
            'Fashion Trends': Sparkles,
            'Street Style': Coffee,
            'Sustainable Fashion': Leaf,
            'Fashion Design': Palette,
            'Premium Brands': Award,
            'Fashion Health': Heart,
            'Jackets': Sparkles,
            'Fashion Pairing': Globe,
        };
        return iconMap[topic] || Coffee;
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
        if (score >= 80) return "text-green-600 dark:text-green-400";
        if (score >= 70) return "text-amber-600 dark:text-amber-400";
        return "text-orange-600 dark:text-orange-400";
    };

    const getGrowthColor = (growthRate: number) => {
        if (growthRate >= 25) return "text-emerald-600 dark:text-emerald-400";
        if (growthRate >= 15) return "text-green-600 dark:text-green-400";
        if (growthRate >= 5) return "text-amber-600 dark:text-amber-400";
        return "text-orange-600 dark:text-orange-400";
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const sortedTopics = React.useMemo(() => {
        if (!topicsData) return [];
        const sorted = [...topicsData];
        switch (sortBy) {
            case 'score': return sorted.sort((a, b) => b.trending_score - a.trending_score);
            case 'growth': return sorted.sort((a, b) => b.growth_rate - a.growth_rate);
            case 'mentions': return sorted.sort((a, b) => b.mentions - a.mentions);
            default: return sorted;
        }
    }, [topicsData, sortBy]);

    if (isLoading) {
        return (
            <Card className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
                <CardContent className="p-8">
                    <div className="flex items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: `var(--preset-primary)` }} />
                        <span className="text-muted-foreground">Loading trending topics...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="bg-white dark:bg-white/[0.02] border border-red-200/50 dark:border-red-500/20 shadow-sm">
                <CardContent className="p-8">
                    <div className="flex items-center justify-center gap-3 text-red-500">
                        <TrendingDown className="w-6 h-6" />
                        <span>Error loading trending topics. Please try again later.</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md" style={{ background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` }}>
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Trending Fashion Topics</h3>
                        <p className="text-xs text-muted-foreground">{topicsData?.length || 0} active topics tracked</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Sort by:</span>
                    <div className="flex gap-1">
                        {[
                            { key: 'score', label: 'Score', icon: TrendingUp },
                            { key: 'growth', label: 'Growth', icon: Zap },
                            { key: 'mentions', label: 'Mentions', icon: MessageSquare }
                        ].map(({ key, label, icon: Icon }) => (
                            <Button
                                key={key}
                                variant="ghost"
                                size="sm"
                                onClick={() => setSortBy(key as any)}
                                className="h-7 text-xs px-2.5 rounded-lg border transition-all"
                                style={sortBy === key ? {
                                    background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))`,
                                    color: '#fff',
                                    borderColor: 'transparent',
                                } : {
                                    background: `rgba(var(--preset-primary-rgb), 0.06)`,
                                    color: `var(--preset-primary)`,
                                    borderColor: `rgba(var(--preset-primary-rgb), 0.15)`,
                                }}
                            >
                                <Icon className="w-3 h-3 mr-1" />
                                {label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Topics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedTopics.map((topic, index) => {
                    const IconComponent = getTopicIcon(topic.topic);
                    return (
                        <Card
                            key={`${topic.topic}-${index}`}
                            className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <CardContent className="p-5 space-y-3.5">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div
                                            className="p-2 rounded-lg transition-transform group-hover:scale-110"
                                            style={{ background: `rgba(var(--preset-primary-rgb), 0.1)` }}
                                        >
                                            <IconComponent className="w-4 h-4" style={{ color: `var(--preset-primary)` }} />
                                        </div>
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 leading-tight text-base">
                                            {topic.topic}
                                        </h3>
                                    </div>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <span className={`text-2xl font-bold ${getScoreColor(topic.trending_score)}`}>
                                                    {topic.trending_score}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Trending Score: {topic.trending_score}/100</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {topic.description}
                                </p>

                                {/* Metrics */}
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                            <Timer className="w-3 h-3" /> Growth Rate
                                        </span>
                                        <span className={`text-sm font-bold ${getGrowthColor(topic.growth_rate)}`}>
                                            +{topic.growth_rate.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                            <MessageSquare className="w-3 h-3" /> Mentions
                                        </span>
                                        <span className="text-sm font-bold" style={{ color: `var(--preset-primary)` }}>
                                            {formatNumber(topic.mentions)}
                                        </span>
                                    </div>
                                </div>

                                {/* Keywords */}
                                <div className="flex flex-wrap gap-1.5">
                                    {topic.related_keywords.slice(0, 3).map((keyword, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5 bg-slate-50 dark:bg-white/[0.04] text-muted-foreground border-slate-200 dark:border-white/[0.08]">
                                            #{keyword}
                                        </Badge>
                                    ))}
                                    {topic.related_keywords.length > 3 && (
                                        <Badge variant="outline" className="text-xs px-2 py-0.5 bg-slate-50 dark:bg-white/[0.04] text-muted-foreground border-slate-200 dark:border-white/[0.08]">
                                            +{topic.related_keywords.length - 3}
                                        </Badge>
                                    )}
                                </div>

                                {/* Action */}
                                <Button
                                    className="w-full h-8 text-xs font-medium border rounded-lg transition-all"
                                    variant="outline"
                                    style={{
                                        background: `rgba(var(--preset-primary-rgb), 0.04)`,
                                        borderColor: `rgba(var(--preset-primary-rgb), 0.15)`,
                                        color: `var(--preset-primary)`,
                                    }}
                                >
                                    Explore Topic
                                    <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Summary Stats */}
            <div
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                {[
                    { label: 'Active Topics', value: topicsData?.length || 0, format: false },
                    { label: 'Total Mentions', value: topicsData ? topicsData.reduce((sum, t) => sum + t.mentions, 0) : 0, format: true },
                    { label: 'Avg Score', value: topicsData ? (topicsData.reduce((sum, t) => sum + t.trending_score, 0) / topicsData.length).toFixed(1) : '0', format: false },
                    { label: 'Avg Growth', value: topicsData ? `+${(topicsData.reduce((sum, t) => sum + t.growth_rate, 0) / topicsData.length).toFixed(1)}%` : '0%', format: false },
                ].map((stat, i) => (
                    <Card key={i} className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold" style={{ color: `var(--preset-primary)` }}>
                                {stat.format ? formatNumber(stat.value as number) : stat.value}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default TrendingTopicsclothing;
