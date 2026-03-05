"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Music, 
    BarChart3,
    Loader2
} from 'lucide-react';
import { useMusicTrend } from '../../tanstack/ai-tanstack';
import { TikTokSong } from '../../../data/model/ai-model';
import { format, subDays } from 'date-fns';
import MusicFilters from '../components/music-filters';
import MusicCharts from '../components/music-charts';
import MusicStats from '../components/music-stats';
import MusicCard from '../components/music-card';

type SortOption = 'rank' | 'popularity' | 'title' | 'artist' | 'duration';
type ViewMode = 'grid' | 'list' | 'chart';

const MusicScreen: React.FC = () => {
    const [selectedRegion, setSelectedRegion] = useState('GLOBAL');
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('rank');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [showFilters, setShowFilters] = useState(false);

    const { data: musicTrendData, isLoading, error, refetch } = useMusicTrend({
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        region: selectedRegion,
        popularity: true
    });

    const getLatestPopularityScore = (popularityTrend: Array<{date: string; popularity_score: number}>) => {
        if (!popularityTrend || popularityTrend.length === 0) return 0;
        return popularityTrend[popularityTrend.length - 1]?.popularity_score || 0;
    };

    // Filter and sort songs
    const filteredAndSortedSongs = useMemo(() => {
        if (!musicTrendData?.songs) return [];
        
        let filtered = musicTrendData.songs.filter(song => 
            song.song_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.artist_name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        switch (sortBy) {
            case 'rank':
                return filtered.sort((a, b) => a.current_rank - b.current_rank);
            case 'popularity':
                return filtered.sort((a, b) => {
                    const aPopularity = getLatestPopularityScore(b.popularity_trend);
                    const bPopularity = getLatestPopularityScore(a.popularity_trend);
                    return aPopularity - bPopularity;
                });
            case 'title':
                return filtered.sort((a, b) => a.song_title.localeCompare(b.song_title));
            case 'artist':
                return filtered.sort((a, b) => a.artist_name.localeCompare(b.artist_name));
            case 'duration':
                return filtered.sort((a, b) => b.song_duration_seconds - a.song_duration_seconds);
            default:
                return filtered;
        }
    }, [musicTrendData?.songs, searchQuery, sortBy, getLatestPopularityScore]);

    const handleRefresh = () => {
        refetch();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: `var(--preset-primary)` }} />
                    <p className="text-muted-foreground text-sm">Loading music trends...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-20 text-center">
                <div className="space-y-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto" style={{ background: `rgba(var(--preset-primary-rgb), 0.1)` }}>
                        <Music className="w-6 h-6" style={{ color: `var(--preset-primary)` }} />
                    </div>
                    <p className="text-slate-900 dark:text-slate-100 font-semibold">Unable to load music trends</p>
                    <p className="text-xs text-muted-foreground">Please try again later</p>
                    <Button onClick={handleRefresh} size="sm" className="mt-2 text-white" style={{ background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` }}>
                        <Music className="w-3.5 h-3.5 mr-1.5" /> Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 w-full">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md" style={{ background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` }}>
                        <Music className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Music Trends Dashboard</h2>
                        <p className="text-xs text-muted-foreground">
                            {musicTrendData?.count || 0} trending songs · {selectedRegion}
                        </p>
                    </div>
                </div>
                <div className="flex-shrink-0">
                    <MusicFilters
                        selectedRegion={selectedRegion}
                        setSelectedRegion={setSelectedRegion}
                        startDate={startDate}
                        setStartDate={setStartDate}
                        endDate={endDate}
                        setEndDate={setEndDate}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        showFilters={showFilters}
                        setShowFilters={setShowFilters}
                        onRefresh={handleRefresh}
                        isLoading={isLoading}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        totalSongs={musicTrendData?.count || 0}
                        filteredSongs={filteredAndSortedSongs.length}
                    />
                </div>
            </div>

            {/* Stats */}
            <MusicStats
                filteredAndSortedSongs={filteredAndSortedSongs}
                getLatestPopularityScore={getLatestPopularityScore}
                selectedRegion={selectedRegion}
                startDate={startDate}
                endDate={endDate}
                totalCount={musicTrendData?.count || 0}
            />

            {/* Content */}
            {viewMode === 'chart' ? (
                <MusicCharts
                    filteredAndSortedSongs={filteredAndSortedSongs}
                    getLatestPopularityScore={getLatestPopularityScore}
                />
            ) : (
                <MusicCard
                    filteredAndSortedSongs={filteredAndSortedSongs}
                    getLatestPopularityScore={getLatestPopularityScore}
                    viewMode={viewMode}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    isLoading={isLoading}
                />
            )}

            {filteredAndSortedSongs.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <Music className="w-12 h-12 mx-auto mb-3" style={{ color: `rgba(var(--preset-primary-rgb), 0.3)` }} />
                    <p className="text-muted-foreground">
                        {searchQuery ? 'No songs match your search' : 'No music trends available'}
                    </p>
                    {searchQuery && (
                        <Button variant="outline" size="sm" onClick={() => setSearchQuery('')} className="mt-2">
                            Clear search
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default MusicScreen; 