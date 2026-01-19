"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TikTokSong } from '../../../data/model/ai-model';

interface MusicStatsProps {
    filteredAndSortedSongs: TikTokSong[];
    getLatestPopularityScore: (popularityTrend: Array<{date: string; popularity_score: number}>) => number;
    selectedRegion: string;
    startDate: Date;
    endDate: Date;
    totalCount: number;
}

const regionOptions = [
    { value: 'GLOBAL', label: '🌍 Global', flag: '🌍' },
    { value: 'ID', label: '🇮🇩 Indonesia', flag: '🇮🇩' },
    { value: 'MY', label: '🇲🇾 Malaysia', flag: '🇲🇾' },
    { value: 'TH', label: '🇹🇭 Thailand', flag: '🇹🇭' },
    { value: 'KR', label: '🇰🇷 South Korea', flag: '🇰🇷' },
    { value: 'US', label: '🇺🇸 United States', flag: '🇺🇸' },
];

const MusicStats: React.FC<MusicStatsProps> = ({
    filteredAndSortedSongs,
    getLatestPopularityScore,
    selectedRegion,
    startDate,
    endDate,
    totalCount
}) => {
    const averagePopularity = React.useMemo(() => {
        if (filteredAndSortedSongs.length === 0) return 0;
        return Math.round(
            filteredAndSortedSongs.reduce((sum, song) => 
                sum + getLatestPopularityScore(song.popularity_trend), 0
            ) / filteredAndSortedSongs.length * 100
        );
    }, [filteredAndSortedSongs, getLatestPopularityScore]);

    const topRankedSong = filteredAndSortedSongs[0];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top Rank Card */}
            <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                        <span className="text-amber-600 dark:text-amber-400 text-xs font-bold">🏆</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Top Rank</div>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    #{topRankedSong?.current_rank || 'N/A'}
                </div>
                {topRankedSong && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                        {topRankedSong.song_title}
                    </div>
                )}
            </div>
            
            {/* Average Popularity Card */}
            <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 dark:text-purple-400 text-xs font-bold">📈</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Avg Popularity</div>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {averagePopularity}%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Across {filteredAndSortedSongs.length} songs
                </div>
            </div>
            
            {/* Region Card with Mini Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">🌍</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Region Trends</div>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {regionOptions.find(r => r.value === selectedRegion)?.flag || '🌍'} {regionOptions.find(r => r.value === selectedRegion)?.label?.split(' ')[1] || selectedRegion}
                </div>
                {/* Mini popularity distribution chart */}
                <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 100 16">
                        <defs>
                            <linearGradient id="regionGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.6}/>
                                <stop offset="100%" stopColor="#6366F1" stopOpacity={0.4}/>
                            </linearGradient>
                        </defs>
                        {/* Generate sample bars for visual appeal */}
                        {Array.from({length: 20}, (_, i) => (
                            <rect
                                key={i}
                                x={i * 5}
                                y={16 - (Math.random() * 12 + 2)}
                                width="3"
                                height={Math.random() * 12 + 2}
                                fill="url(#regionGradient)"
                                className="transition-all duration-300"
                            />
                        ))}
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default MusicStats; 