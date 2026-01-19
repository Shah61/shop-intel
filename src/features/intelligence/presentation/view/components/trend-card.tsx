"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    TrendingUp, 
    ExternalLink, 
    Globe, 
    Calendar,
    Eye,
    ArrowUpRight,
    Hash,
    Clock,
    Loader2
} from 'lucide-react';
import { useGetCurrentTrend } from '../../tanstack/ai-tanstack';
import { TrendingItem, SkincareTrend } from '../../../data/model/ai-model';

const TrendCard: React.FC = () => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const { data: trendData, isLoading, error } = useGetCurrentTrend();

    const getTrendingColor = (index: number) => {
        const score = 100 - (index * 5); // Simple scoring based on position
        if (score >= 95) return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300";
        if (score >= 90) return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/30 dark:text-green-300";
        if (score >= 85) return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300";
        return "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300";
    };

    const getPlatformColor = (platform: string) => {
        const colors = {
            "General": "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
            "TikTok": "text-pink-600 bg-pink-50 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300",
            "Instagram": "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300",
            "Clothing": "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/30 dark:text-green-300"
        };
        return colors[platform as keyof typeof colors] || "text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300";
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                Error loading trends. Please try again later.
            </div>
        );
    }

    const allTrends = [
        ...(trendData?.data?.trends || []),
        ...((trendData?.data as any)?.skincare_trends?.map((trend: SkincareTrend) => ({
            ...trend,
            PLATFORM: 'Skincare' as const
        })) || [])
    ] as TrendingItem[];

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Topics Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <div className="h-full overflow-y-auto overflow-x-hidden">
                    <div className="p-3 md:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {allTrends.map((trend, index) => (
                                <Card 
                                    key={`${trend.TITLE}-${index}`}
                                    className={`border border-slate-200/30 dark:border-white/10 hover:shadow-2xl transition-all duration-500 group cursor-pointer transform hover:-translate-y-1 bg-white dark:bg-black ${
                                        hoveredIndex === index ? 'shadow-2xl border-blue-300/50 dark:border-blue-400/30' : ''
                                    }`} 
                                    onMouseEnter={() => setHoveredIndex(index)} 
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    <CardContent className="p-5 relative overflow-hidden">
                                        {/* Background gradient effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 via-transparent to-indigo-50/70 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        
                                        <div className="relative z-10">
                                            <div className="space-y-4">
                                                {/* Header */}
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-tight mb-2 text-lg group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                                                            {trend.TITLE}
                                                        </h3>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                                                            {trend.DESCRIPTION}
                                                        </p>
                                                    </div>
                                                    
                                                    <Badge className={`${getTrendingColor(index)} border font-medium flex-shrink-0 px-3 py-1 rounded-full shadow-sm`}>
                                                        <TrendingUp className="w-3 h-3" />
                                                    </Badge>
                                                </div>
                                                
                                                {/* Meta Information */}
                                                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500 gap-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge className={`${getPlatformColor(trend.PLATFORM)} border font-medium px-2 py-1 rounded-full`}>
                                                            {trend.PLATFORM}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                
                                                {/* Action Button */}
                                                <div className="pt-2">
                                                    <Button 
                                                        onClick={() => window.open(trend.URL, '_blank')}
                                                        className="w-full h-9 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg group-hover:scale-105"
                                                        variant="outline"
                                                    >
                                                        <span className="flex items-center justify-center gap-2">
                                                            Read Full Article
                                                            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                                        </span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        {/* Extra bottom spacing to ensure scrolling to bottom */}
                        <div className="h-20"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendCard;
