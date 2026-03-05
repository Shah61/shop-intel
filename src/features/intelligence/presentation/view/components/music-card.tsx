"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Music, 
    Play, 
    ExternalLink, 
    TrendingUp, 
    Clock,
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
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="w-4 h-4 text-amber-500" />;
        if (rank <= 3) return <Star className="w-4 h-4 text-amber-500" />;
        if (rank <= 10) return <TrendingUp className="w-4 h-4" style={{ color: `var(--preset-primary)` }} />;
        return <Music className="w-4 h-4 text-slate-400" />;
    };

    const handleMusicClick = (url: string) => {
        if (url && url.trim()) {
            try { window.open(url, '_blank', 'noopener,noreferrer'); } catch {}
        }
    };

    const renderMusicItem = (music: TikTokSong, index: number) => {
        const trendData = music.popularity_trend.slice(-30).map((point) => ({
            date: point.date,
            value: point.popularity_score * 100,
        }));

        return (
            <Card
                key={index}
                className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleMusicClick(music.tiktok_music_link)}
            >
                <CardContent className="p-4 relative overflow-hidden">
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <div className="w-6 h-6 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md border border-slate-200 dark:border-white/[0.1]">
                            <ExternalLink className="w-3 h-3" style={{ color: `var(--preset-primary)` }} />
                        </div>
                    </div>

                    <div className="flex items-start gap-4 relative z-10">
                        <div className="relative flex-shrink-0">
                            <div className="flex flex-col items-center gap-2">
                                {music.cover_image_url ? (
                                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300">
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
                                        <div className="w-16 h-16 rounded-xl flex items-center justify-center hidden" style={{ background: `rgba(var(--preset-primary-rgb), 0.1)` }}>
                                            <Play className="w-6 h-6" style={{ color: `var(--preset-primary)` }} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300" style={{ background: `rgba(var(--preset-primary-rgb), 0.1)` }}>
                                        <Play className="w-6 h-6" style={{ color: `var(--preset-primary)` }} />
                                    </div>
                                )}
                                <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200 dark:border-white/[0.1]">
                                    {getRankIcon(music.current_rank)}
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">#{music.current_rank}</span>
                                </div>
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-white/[0.04] rounded-full border border-slate-200/60 dark:border-white/[0.08]">
                                    <Clock className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{music.song_duration_seconds}s</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                        {music.song_title}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Music className="w-3 h-3 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground font-medium truncate">{music.artist_name}</p>
                                    </div>
                                </div>
                                <Badge
                                    className="text-xs font-medium px-2 py-0.5 rounded-full border"
                                    style={{
                                        background: `rgba(var(--preset-primary-rgb), 0.08)`,
                                        color: `var(--preset-primary)`,
                                        borderColor: `rgba(var(--preset-primary-rgb), 0.2)`,
                                    }}
                                >
                                    #{music.current_rank}
                                </Badge>
                            </div>

                            <div className="mb-1">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-1">
                                        <BarChart3 className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">30 Days ago Trend</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">Last {trendData.length} days</span>
                                </div>
                                <div className="w-full h-20 bg-white dark:bg-white/[0.02] rounded-lg p-2 border border-slate-200/60 dark:border-white/[0.06]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                            <defs>
                                                <linearGradient id={`musicGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="var(--preset-primary)" stopOpacity={1} />
                                                    <stop offset="100%" stopColor="var(--preset-lighter)" stopOpacity={0.8} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" strokeOpacity={0.3} />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 8, fill: '#94a3b8' }}
                                                interval="preserveStartEnd"
                                                tickFormatter={(v) => {
                                                    if (!v) return v;
                                                    const d = new Date(v);
                                                    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
                                                }}
                                            />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={['dataMin - 5', 'dataMax + 5']} width={25} />
                                            <Tooltip
                                                content={({ active, payload, label }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-lg border border-slate-200 dark:border-white/[0.1]">
                                                                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</p>
                                                                <p className="text-xs" style={{ color: `var(--preset-primary)` }}>
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
                                                stroke={`url(#musicGrad-${index})`}
                                                strokeWidth={2}
                                                dot={{ r: 1.5, fill: 'var(--preset-primary)', strokeWidth: 0 }}
                                                activeDot={{ r: 4, fill: 'var(--preset-primary)', strokeWidth: 2, stroke: '#ffffff', strokeOpacity: 0.8 }}
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
        const recentTrend = music.popularity_trend.slice(-7);
        const trendDirection = recentTrend.length >= 2
            ? (recentTrend[recentTrend.length - 1].popularity_score > recentTrend[0].popularity_score ? 'up' : 'down')
            : 'neutral';

        return (
            <Card
                key={index}
                className="cursor-pointer bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => handleMusicClick(music.tiktok_music_link)}
            >
                <CardContent className="p-3">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex items-center gap-1 text-sm font-bold text-slate-500 min-w-[40px]">
                                {getRankIcon(music.current_rank)}
                                #{music.current_rank}
                            </div>
                            {music.cover_image_url ? (
                                <img src={music.cover_image_url} alt={music.song_title} className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `rgba(var(--preset-primary-rgb), 0.1)` }}>
                                    <Play className="w-4 h-4" style={{ color: `var(--preset-primary)` }} />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">{music.song_title}</h3>
                                <p className="text-sm text-muted-foreground truncate">{music.artist_name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className={`text-sm font-bold ${
                                    trendDirection === 'up' ? 'text-emerald-600 dark:text-emerald-400' :
                                    trendDirection === 'down' ? 'text-red-500' : 'text-slate-400'
                                }`}>
                                    {trendDirection === 'up' ? '↗' : trendDirection === 'down' ? '↘' : '→'}
                                </div>
                                <div className="text-xs text-muted-foreground">Trend</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{music.song_duration_seconds}s</div>
                                <div className="text-xs text-muted-foreground">Duration</div>
                            </div>
                            <Badge
                                className="text-xs font-medium border"
                                style={{
                                    background: `rgba(var(--preset-primary-rgb), 0.08)`,
                                    color: `var(--preset-primary)`,
                                    borderColor: `rgba(var(--preset-primary-rgb), 0.2)`,
                                }}
                            >
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
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredAndSortedSongs.map((music, i) => renderMusicItem(music, i))}
                </div>
            )}
            {viewMode === 'list' && (
                <div className="space-y-2">
                    {filteredAndSortedSongs.map((music, i) => renderMusicListItem(music, i))}
                </div>
            )}
        </div>
    );
};

export default MusicCard;
