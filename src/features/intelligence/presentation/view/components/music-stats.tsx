"use client";

import React from 'react';
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

    const stats = [
        {
            emoji: '🏆',
            label: 'Top Rank',
            value: `#${topRankedSong?.current_rank || 'N/A'}`,
            sub: topRankedSong?.song_title,
        },
        {
            emoji: '📈',
            label: 'Avg Popularity',
            value: `${averagePopularity}%`,
            sub: `Across ${filteredAndSortedSongs.length} songs`,
        },
        {
            emoji: '🌍',
            label: 'Region Trends',
            value: `${regionOptions.find(r => r.value === selectedRegion)?.flag || '🌍'} ${regionOptions.find(r => r.value === selectedRegion)?.label?.split(' ').slice(1).join(' ') || selectedRegion}`,
            sub: null,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-white/[0.02] rounded-xl p-4 border border-slate-200/60 dark:border-white/[0.06] shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: `rgba(var(--preset-primary-rgb), 0.1)` }}
                        >
                            <span className="text-xs">{stat.emoji}</span>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{stat.value}</div>
                    {stat.sub && (
                        <div className="text-xs text-muted-foreground truncate mt-0.5">{stat.sub}</div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MusicStats;
