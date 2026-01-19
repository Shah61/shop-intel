"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Music, 
    Play, 
    ExternalLink, 
    TrendingUp, 
    Clock,
    Globe,
    Trophy,
    Star,
    BarChart3
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TikTokSong } from '../../../data/model/ai-model';

type ViewMode = 'grid' | 'list';

interface MusicCardProps {
    filteredAndSortedSongs: TikTokSong[];
    getLatestPopularityScore: (popularityTrend: Array<{date: string; popularity_score: number}>) => number;
    viewMode: ViewMode;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isLoading: boolean;
}

const MusicCard: React.FC<MusicCardProps> = ({
    filteredAndSortedSongs,
    getLatestPopularityScore,
    viewMode,
    searchQuery,
    setSearchQuery,
    isLoading
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const getTrendingColor = (rank: number) => {
        if (rank <= 3) return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800";
        if (rank <= 10) return "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800";
        return "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800";
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-500" />;
        if (rank <= 3) return <Star className="w-4 h-4 text-yellow-500" />;
        if (rank <= 10) return <TrendingUp className="w-4 h-4 text-green-500" />;
        return <Music className="w-4 h-4 text-blue-500" />;
    };

    const handleMusicClick = (url: string) => {
        if (url && url.trim()) {
            try {
                window.open(url, '_blank', 'noopener,noreferrer');
            } catch (error) {
                console.error('Failed to open music URL:', error);
            }
        }
    };

    const renderGridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAndSortedSongs.map((music, index) => renderMusicItem(music, index))}
        </div>
    );

    const renderListView = () => (
        <div className="space-y-3">
            {filteredAndSortedSongs.map((music, index) => renderMusicListItem(music, index))}
        </div>
    );



    const renderMusicItem = (music: TikTokSong, index: number) => {
        // Prepare 30-day trend data for line chart
        const trendData = music.popularity_trend.slice(-30).map((point) => {
            return {
                date: point.date, // Show the full date
                value: point.popularity_score * 100, // Convert to percentage for better visualization
                displayDate: point.date
            };
        });
        
        return (
            <Card 
                key={index} 
                className={`border border-slate-100 dark:border-slate-900 hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-1 bg-white dark:bg-black ${
                    hoveredIndex === index ? 'shadow-xl border-purple-400 dark:border-purple-500' : ''
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleMusicClick(music.tiktok_music_link)}
            >
                <CardContent className="p-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 via-transparent to-slate-100/30 dark:from-slate-900/20 dark:to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <div className="w-6 h-6 bg-white dark:bg-black rounded-full flex items-center justify-center shadow-lg border border-slate-300 dark:border-slate-600">
                            <ExternalLink className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="relative flex-shrink-0">
                            <div className="flex flex-col items-center gap-2">
                                {music.cover_image_url ? (
                                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md group-hover:scale-110 transition-transform duration-300">
                                        <img 
                                            src={music.cover_image_url} 
                                            alt={music.song_title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                target.nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-800/50 dark:to-pink-800/50 rounded-xl flex items-center justify-center hidden">
                                            <Play className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-800/50 dark:to-pink-800/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                                        <Play className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                )}
                                
                                <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-1 bg-white dark:bg-black rounded-full shadow-lg border border-slate-300 dark:border-slate-600">
                                    {getRankIcon(music.current_rank)}
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">#{music.current_rank}</span>
                                </div>

                                {/* Global and Duration badges under image */}
                                <div className="flex flex-col gap-1 items-start">
                                    <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-black rounded-full border border-slate-300 dark:border-slate-600">
                                        <Clock className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{music.song_duration_seconds}s</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                                        {music.song_title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Music className="w-3 h-3 text-slate-500" />
                                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium truncate">
                                            {music.artist_name}
                                        </p>
                                    </div>
                                </div>
                                
                                <Badge className={`${getTrendingColor(music.current_rank)} border font-medium text-xs px-2 py-1 rounded-full shadow-sm`}>
                                    #{music.current_rank}
                                </Badge>
                            </div>
                            
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1">
                                        <BarChart3 className="w-3 h-3 text-slate-500" />
                                        <span className="text-xs text-slate-500 dark:text-slate-500">30 Days ago Trend</span>
                                    </div>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Last {trendData.length} days</span>
                                </div>
                                {/* Interactive Line Chart */}
                                <div className="w-full h-20 bg-white dark:bg-black rounded-md p-2 border border-slate-300 dark:border-slate-600">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                            <defs>
                                                <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1}/>
                                                    <stop offset="100%" stopColor="#EC4899" stopOpacity={0.8}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid 
                                                strokeDasharray="2 2" 
                                                stroke="#e2e8f0" 
                                                strokeOpacity={0.3}
                                                className="dark:stroke-slate-600"
                                            />
                                            <XAxis 
                                                dataKey="date" 
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 8, fill: '#64748b' }}
                                                interval="preserveStartEnd"
                                                tickFormatter={(value) => {
                                                    // Format date to show MM/DD for better readability
                                                    if (value) {
                                                        const date = new Date(value);
                                                        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
                                                    }
                                                    return value;
                                                }}
                                            />
                                            <YAxis 
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fill: '#64748b' }}
                                                domain={['dataMin - 5', 'dataMax + 5']}
                                                width={25}
                                            />
                                            <Tooltip 
                                                content={({ active, payload, label }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600">
                                                                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                                    {label}
                                                                </p>
                                                                <p className="text-xs text-purple-600 dark:text-purple-400">
                                                                    Popularity: {typeof payload[0].value === 'number' ? payload[0].value.toFixed(1) : payload[0].value}%
                                                                </p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="value" 
                                                stroke={`url(#gradient-${index})`}
                                                strokeWidth={2}
                                                dot={{ r: 1.5, fill: '#8B5CF6', strokeWidth: 0 }}
                                                activeDot={{ 
                                                    r: 4, 
                                                    fill: '#8B5CF6', 
                                                    strokeWidth: 2, 
                                                    stroke: '#ffffff',
                                                    strokeOpacity: 0.8
                                                }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderMusicListItem = (music: TikTokSong, index: number) => {
        // Get trend direction for last 7 days
        const recentTrend = music.popularity_trend.slice(-7);
        const trendDirection = recentTrend.length >= 2 ? 
            (recentTrend[recentTrend.length - 1].popularity_score > recentTrend[0].popularity_score ? 'up' : 'down') : 'neutral';
        
        return (
            <Card 
                key={index}
                className="cursor-pointer hover:shadow-md transition-all duration-200 border border-slate-300 dark:border-slate-600 bg-white dark:bg-black"
                onClick={() => handleMusicClick(music.tiktok_music_link)}
            >
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex items-center gap-1 text-sm font-bold text-slate-600 dark:text-slate-400 min-w-[40px]">
                                {getRankIcon(music.current_rank)}
                                #{music.current_rank}
                            </div>
                            
                            {music.cover_image_url ? (
                                <img 
                                    src={music.cover_image_url} 
                                    alt={music.song_title}
                                    className="w-10 h-10 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-800/50 dark:to-pink-800/50 rounded-lg flex items-center justify-center">
                                    <Play className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate">
                                    {music.song_title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                    {music.artist_name}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className={`text-sm font-bold ${
                                    trendDirection === 'up' ? 'text-green-600 dark:text-green-400' : 
                                    trendDirection === 'down' ? 'text-red-600 dark:text-red-400' : 
                                    'text-slate-600 dark:text-slate-400'
                                }`}>
                                    {trendDirection === 'up' ? '↗' : trendDirection === 'down' ? '↘' : '→'}
                                </div>
                                <div className="text-xs text-slate-500">Trend</div>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {music.song_duration_seconds}s
                                </div>
                                <div className="text-xs text-slate-500">Duration</div>
                            </div>
                            
                            <Badge className={`${getTrendingColor(music.current_rank)} border font-medium text-xs`}>
                                {music.country_code}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div>
            {viewMode === 'grid' && renderGridView()}
            {viewMode === 'list' && renderListView()}
        </div>
    );

};

export default MusicCard;