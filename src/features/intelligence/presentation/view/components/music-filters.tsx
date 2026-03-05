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
import { format } from 'date-fns';

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
            {/* Region */}
            <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-medium">Region:</span>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="w-32 h-8 text-xs border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.02]">
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

            {/* Date */}
            <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-medium">Date:</span>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.02]">
                            <CalendarIcon className="w-3 h-3 mr-1" style={{ color: `var(--preset-primary)` }} />
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
                                    setStartDate(date);
                                }
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-medium">Sort:</span>
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger className="w-24 h-8 text-xs border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.02]">
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

            {/* View Mode */}
            <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-medium">View:</span>
                <div className="flex items-center gap-1">
                    {[
                        { mode: 'grid' as ViewMode, icon: (
                            <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                                <div className="bg-current rounded-[1px]" /><div className="bg-current rounded-[1px]" />
                                <div className="bg-current rounded-[1px]" /><div className="bg-current rounded-[1px]" />
                            </div>
                        )},
                        { mode: 'list' as ViewMode, icon: (
                            <div className="space-y-0.5 w-3 h-3">
                                <div className="bg-current h-0.5 rounded-full" />
                                <div className="bg-current h-0.5 rounded-full" />
                                <div className="bg-current h-0.5 rounded-full" />
                            </div>
                        )},
                        { mode: 'chart' as ViewMode, icon: <BarChart3 className="w-3 h-3" /> },
                    ].map(({ mode, icon }) => (
                        <Button
                            key={mode}
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode(mode)}
                            className="h-8 w-8 p-0 border transition-all"
                            style={viewMode === mode ? {
                                background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))`,
                                color: '#fff',
                                borderColor: 'transparent',
                            } : {
                                background: `rgba(var(--preset-primary-rgb), 0.04)`,
                                color: `var(--preset-primary)`,
                                borderColor: `rgba(var(--preset-primary-rgb), 0.12)`,
                            }}
                        >
                            {icon}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Song Count */}
            <span className="text-xs text-muted-foreground">
                {filteredSongs} of {totalSongs} songs
            </span>

            {/* Actions */}
            <div className="flex items-center gap-1">
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2.5 text-xs text-muted-foreground hover:text-slate-700 dark:hover:text-slate-200">
                        <RotateCcw className="w-3 h-3 mr-1" /> Reset
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-slate-700 dark:hover:text-slate-200"
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
