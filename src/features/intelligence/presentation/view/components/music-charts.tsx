"use client";

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { TikTokSong } from '../../../data/model/ai-model';
import PopularityChart from './charts/popularity-chart';
import DurationChart from './charts/duration-chart';

interface MusicChartsProps {
    filteredAndSortedSongs: TikTokSong[];
    getLatestPopularityScore: (popularityTrend: Array<{date: string; popularity_score: number}>) => number;
}

const MusicCharts: React.FC<MusicChartsProps> = ({
    filteredAndSortedSongs,
    getLatestPopularityScore
}) => {
    // Prepare chart data
    const chartData = React.useMemo(() => {
        if (!filteredAndSortedSongs.length) return [];
        
        return filteredAndSortedSongs.slice(0, 10).map(song => ({
            name: song.song_title.length > 15 ? song.song_title.substring(0, 15) + '...' : song.song_title,
            popularity: Math.round(getLatestPopularityScore(song.popularity_trend) * 100),
            rank: song.current_rank,
            duration: song.song_duration_seconds
        }));
    }, [filteredAndSortedSongs, getLatestPopularityScore]);

    // Regional distribution data
    const regionalData = React.useMemo(() => {
        if (!filteredAndSortedSongs.length) return [];
        
        const regions = filteredAndSortedSongs.reduce((acc, song) => {
            acc[song.country_code] = (acc[song.country_code] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(regions).map(([region, count]) => ({
            name: region,
            value: count,
            percentage: Math.round((count / filteredAndSortedSongs.length) * 100)
        }));
    }, [filteredAndSortedSongs]);

    // Duration distribution data
    const durationData = React.useMemo(() => {
        if (!filteredAndSortedSongs.length) return [];
        
        const durations = filteredAndSortedSongs.reduce((acc, song) => {
            const range = song.song_duration_seconds <= 30 ? '≤30s' :
                         song.song_duration_seconds <= 60 ? '31-60s' :
                         song.song_duration_seconds <= 90 ? '61-90s' : '90s+';
            acc[range] = (acc[range] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(durations).map(([range, count]) => ({
            name: range,
            value: count,
            percentage: Math.round((count / filteredAndSortedSongs.length) * 100)
        }));
    }, [filteredAndSortedSongs]);

    if (!filteredAndSortedSongs.length) {
        return (
            <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">No data available for charts</p>
            </div>
        );
    }

        return (
        <div className="space-y-6">
            {/* Top Songs Popularity Bar Chart */}
            <PopularityChart data={chartData} />

            {/* Duration Distribution */}
            <DurationChart data={durationData} />
        </div>
    );
};

export default MusicCharts; 