"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
    Calendar as CalendarIcon,
    RotateCcw,
    BarChart3
} from 'lucide-react';
import { format, subDays } from 'date-fns';

type SortOption = 'rank' | 'popularity' | 'title' | 'artist' | 'duration';
type ViewMode = 'grid' | 'list' | 'chart';

const regionOptions = [
    { value: 'GLOBAL', label: '🌍 Global' },
    { value: 'ID', label: '🇮🇩 Indonesia' },
    { value: 'MY', label: '🇲🇾 Malaysia' },
    { value: 'TH', label: '🇹🇭 Thailand' },
    { value: 'KR', label: '🇰🇷 South Korea' },
    { value: 'US', label: '🇺🇸 United States' },
];

interface MusicFiltersProps {
    selectedRegion: string;
    setSelectedRegion: (region: string) => void;
    startDate: Date;
    setStartDate: (date: Date) => void;
    endDate: Date;
    setEndDate: (date: Date) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    sortBy: SortOption;
    setSortBy: (sort: SortOption) => void;
    showFilters: boolean;
    setShowFilters: (show: boolean) => void;
    onRefresh: () => void;
    isLoading: boolean;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    totalSongs: number;
    filteredSongs: number;
}

const MusicFilters: React.FC<MusicFiltersProps> = ({
    selectedRegion,
    setSelectedRegion,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    showFilters,
    setShowFilters,
    onRefresh,
    isLoading,
    viewMode,
    setViewMode,
    totalSongs,
    filteredSongs
}) => {
    const resetFilters = () => {
        setSelectedRegion('GLOBAL');
        const today = new Date();
        setStartDate(today);
        setEndDate(today);
        setSearchQuery('');
        setSortBy('rank');
        onRefresh();
    };

    const hasActiveFilters = selectedRegion !== 'GLOBAL' || searchQuery !== '' || sortBy !== 'rank';

        return (
        <div className="flex items-center gap-3 flex-wrap justify-end">
            {/* Region Selector */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Region:</span>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="w-32 h-8 text-xs bg-white dark:bg-black border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {regionOptions.map((region) => (
                            <SelectItem key={region.value} value={region.value} className="text-xs">
                                {region.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Single Date Selection */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Date:</span>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs bg-white dark:bg-black border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                        >
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            {format(endDate, 'MMM dd, yyyy')}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={(date) => {
                                if (date) {
                                    setEndDate(date);
                                    setStartDate(date); // Set both start and end to same date
                                }
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Sort:</span>
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger className="w-24 h-8 text-xs bg-white dark:bg-black border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="rank" className="text-xs">Rank</SelectItem>
                        <SelectItem value="title" className="text-xs">Title</SelectItem>
                        <SelectItem value="artist" className="text-xs">Artist</SelectItem>
                        <SelectItem value="duration" className="text-xs">Duration</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* View Mode Selector */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">View:</span>
                <div className="flex items-center gap-1">
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className={`h-8 w-8 p-0 ${
                            viewMode === 'grid' 
                                ? 'bg-black dark:bg-white text-white dark:text-black' 
                                : 'bg-white dark:bg-black text-black dark:text-white border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                    >
                        <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                            <div className="bg-current rounded-[1px]"></div>
                            <div className="bg-current rounded-[1px]"></div>
                            <div className="bg-current rounded-[1px]"></div>
                            <div className="bg-current rounded-[1px]"></div>
                        </div>
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={`h-8 w-8 p-0 ${
                            viewMode === 'list' 
                                ? 'bg-black dark:bg-white text-white dark:text-black' 
                                : 'bg-white dark:bg-black text-black dark:text-white border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                    >
                        <div className="space-y-0.5 w-3 h-3">
                            <div className="bg-current h-0.5 rounded-full"></div>
                            <div className="bg-current h-0.5 rounded-full"></div>
                            <div className="bg-current h-0.5 rounded-full"></div>
                        </div>
                    </Button>
                    <Button
                        variant={viewMode === 'chart' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('chart')}
                        className={`h-8 w-8 p-0 ${
                            viewMode === 'chart' 
                                ? 'bg-black dark:bg-white text-white dark:text-black' 
                                : 'bg-white dark:bg-black text-black dark:text-white border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                    >
                        <BarChart3 className="w-3 h-3" />
                    </Button>
                </div>
            </div>

            {/* Song Count */}
            <div className="text-xs text-slate-600 dark:text-slate-400">
                {filteredSongs} of {totalSongs} songs
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1">
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="h-8 px-3 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Reset
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="h-8 px-3 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    {isLoading ? (
                        <div className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full mr-1" />
                    ) : (
                        <RotateCcw className="w-3 h-3 mr-1" />
                    )}
                    Refresh
                </Button>
            </div>
        </div>
    );
};

export default MusicFilters; 