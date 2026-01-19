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
            <div className="flex flex-col h-full bg-white dark:bg-black">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-black dark:text-white mx-auto" />
                        <p className="text-slate-600 dark:text-slate-400">Loading music trends...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-black">
                <div className="flex-1 flex items-center justify-center text-center p-6">
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                            <Music className="w-8 h-8 text-black dark:text-white" />
                        </div>
                        <div>
                            <p className="text-black dark:text-white mb-2 font-semibold">Unable to load music trends</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">Please try again later</p>
                            <Button onClick={handleRefresh} className="mt-4 bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200" size="sm">
                                <Music className="w-4 h-4 mr-2" />
                                Retry
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black">
            {/* Header with Title and Filters in Same Row */}
            <div className="bg-white dark:bg-black">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4">
                    {/* Title Section */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <Music className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-black dark:text-white">Music Trends Dashboard</h1>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {musicTrendData?.count || 0} trending songs • {selectedRegion}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Filters on the Right */}
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

                {/* Stats Cards */}
                <div className="px-4 pb-4">
                    <MusicStats
                        filteredAndSortedSongs={filteredAndSortedSongs}
                        getLatestPopularityScore={getLatestPopularityScore}
                        selectedRegion={selectedRegion}
                        startDate={startDate}
                        endDate={endDate}
                        totalCount={musicTrendData?.count || 0}
                    />
                </div>
            </div>



            {/* Content Area */}
            <div className="flex-1 overflow-auto">
                <div className="p-4 pb-8">
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
                            <Music className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400">
                                {searchQuery ? 'No songs match your search' : 'No music trends available'}
                            </p>
                            {searchQuery && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setSearchQuery('')}
                                    className="mt-2 bg-white dark:bg-black text-black dark:text-white border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900"
                                >
                                    Clear search
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MusicScreen; 