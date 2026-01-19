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
    Hash,
    Eye,
    MessageSquare,
    ArrowUpRight,
    Zap,
    Sparkles,
    Loader2,
    Coffee,
    Heart,
    ChefHat,
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

    const getTrendingColor = (score: number) => {
        if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300";
        if (score >= 80) return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/30 dark:text-green-300";
        if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300";
        return "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300";
    };

    const getGrowthColor = (growthRate: number) => {
        if (growthRate >= 25) return "text-emerald-600 dark:text-emerald-400";
        if (growthRate >= 15) return "text-green-600 dark:text-green-400";
        if (growthRate >= 5) return "text-yellow-600 dark:text-yellow-400";
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
            case 'score':
                return sorted.sort((a, b) => b.trending_score - a.trending_score);
            case 'growth':
                return sorted.sort((a, b) => b.growth_rate - a.growth_rate);
            case 'mentions':
                return sorted.sort((a, b) => b.mentions - a.mentions);
            default:
                return sorted;
        }
    }, [topicsData, sortBy]);

    if (isLoading) {
        return (
            <Card className="bg-gradient-to-br from-white to-pink-50/30 dark:from-black dark:to-pink-950/20 border border-pink-200/50 dark:border-white/20">
                <CardContent className="p-8">
                    <div className="flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
                        <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">Loading trending topics...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="bg-gradient-to-br from-white to-red-50/30 dark:from-black dark:to-red-950/20 border border-red-200/50 dark:border-red-500/20">
                <CardContent className="p-8">
                    <div className="flex items-center justify-center text-red-500">
                        <TrendingDown className="w-8 h-8 mr-3" />
                        <span className="text-lg">Error loading trending topics. Please try again later.</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Controls */}
            <Card className="bg-gradient-to-br from-white to-pink-50/30 dark:from-black dark:to-pink-950/20 border border-pink-200/50 dark:border-white/20">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                                <Sparkles className="h-6 w-6 text-pink-600" />
                            </div>
                            Trending Fashion Topics
                        </CardTitle>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                                {[
                                    { key: 'score', label: 'Score', icon: TrendingUp },
                                    { key: 'growth', label: 'Growth', icon: Zap },
                                    { key: 'mentions', label: 'Mentions', icon: MessageSquare }
                                ].map(({ key, label, icon: Icon }) => (
                                    <button
                                        key={key}
                                        onClick={() => setSortBy(key as any)}
                                        className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-all ${
                                            sortBy === key
                                                ? 'bg-white dark:bg-gray-700 text-pink-600 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-pink-600'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Topics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedTopics.map((topic, index) => {
                    const IconComponent = getTopicIcon(topic.topic);
                    return (
                        <Card 
                            key={`${topic.topic}-${index}`}
                            className={`border border-pink-200/30 dark:border-white/10 hover:shadow-2xl transition-all duration-500 group cursor-pointer transform hover:-translate-y-1 bg-gradient-to-br from-white to-pink-50/20 dark:from-black dark:to-pink-950/10 ${
                                hoveredIndex === index ? 'shadow-2xl border-pink-300/50 dark:border-pink-400/30' : ''
                            }`} 
                            onMouseEnter={() => setHoveredIndex(index)} 
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <CardContent className="p-6 relative overflow-hidden">
                                {/* Background gradient effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-pink-50/70 via-transparent to-orange-50/70 dark:from-pink-900/20 dark:to-orange-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                
                                <div className="relative z-10 space-y-4">
                                    {/* Header with Icon and Score */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30 group-hover:scale-110 transition-transform">
                                                <IconComponent className="w-5 h-5 text-pink-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-tight text-lg group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors duration-300">
                                                    {topic.topic}
                                                </h3>
                                            </div>
                                        </div>
                                        
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Badge className={`${getTrendingColor(topic.trending_score)} border font-bold px-3 py-1 rounded-full shadow-sm`}>
                                                        {topic.trending_score}
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Trending Score: {topic.trending_score}/100</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    
                                    {/* Description */}
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {topic.description}
                                    </p>
                                    
                                    {/* Metrics */}
                                    <div className="space-y-3">
                                        {/* Growth Rate */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <Timer className="w-3 h-3" />
                                                Growth Rate
                                            </span>
                                            <span className={`text-sm font-bold ${getGrowthColor(topic.growth_rate)}`}>
                                                +{topic.growth_rate.toFixed(1)}%
                                            </span>
                                        </div>
                                        
                                        {/* Progress Bar for Growth */}
                                        <Progress 
                                            value={Math.min(topic.growth_rate, 100)} 
                                            className="h-2 bg-gray-200 dark:bg-gray-700"
                                        />
                                        
                                        {/* Mentions */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <MessageSquare className="w-3 h-3" />
                                                Mentions
                                            </span>
                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                {formatNumber(topic.mentions)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Keywords */}
                                    <div className="flex flex-wrap gap-1">
                                        {topic.related_keywords.slice(0, 3).map((keyword, idx) => (
                                            <Badge 
                                                key={idx} 
                                                variant="outline" 
                                                className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                                            >
                                                #{keyword}
                                            </Badge>
                                        ))}
                                        {topic.related_keywords.length > 3 && (
                                            <Badge 
                                                variant="outline" 
                                                className="text-xs px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-500 border-gray-200 dark:border-gray-700"
                                            >
                                                +{topic.related_keywords.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    {/* Action Button */}
                                    <div className="pt-2">
                                        <Button 
                                            className="w-full h-9 bg-gradient-to-r from-pink-50 to-orange-50 hover:from-pink-100 hover:to-orange-100 text-pink-700 border border-pink-200 hover:border-pink-300 transition-all duration-300 hover:shadow-lg group-hover:scale-105 dark:from-pink-900/20 dark:to-orange-900/20 dark:text-pink-300 dark:border-pink-700"
                                            variant="outline"
                                            onClick={() => {
                                                // Could implement search or navigation to topic details
                                                console.log(`Exploring topic: ${topic.topic}`);
                                            }}
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                Explore Topic
                                                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            
            {/* Summary Stats */}
            <Card className="bg-gradient-to-br from-white to-pink-50/30 dark:from-black dark:to-pink-950/20 border border-pink-200/50 dark:border-white/20">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-pink-600">{topicsData?.length || 0}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Active Topics</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {topicsData ? formatNumber(topicsData.reduce((sum, topic) => sum + topic.mentions, 0)) : '0'}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Mentions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {topicsData ? (topicsData.reduce((sum, topic) => sum + topic.trending_score, 0) / topicsData.length).toFixed(1) : '0'}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                +{topicsData ? (topicsData.reduce((sum, topic) => sum + topic.growth_rate, 0) / topicsData.length).toFixed(1) : '0'}%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Growth</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TrendingTopicsclothing;
