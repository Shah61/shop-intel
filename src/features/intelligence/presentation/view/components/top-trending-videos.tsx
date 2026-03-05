import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';


import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Eye, Heart, MessageCircle, Sparkles, Zap, Play, ArrowUpDown, ArrowUp, ArrowDown, Video } from 'lucide-react';
import TrendBarChart from './trend-bar-chart';
import { useTopContents } from '../../tanstack/trend-tanstack';
import { TopContentsParams, TopContentsItem } from '../../../data/model/trend-model';

// Platform and country filter options

const platforms = [
  { value: 'all', label: 'All Platforms' },
  { value: 'instagram', label: 'Instagram', icon: '/images/instargram.png', isEmoji: false },
  { value: 'tiktok', label: 'TikTok', icon: '/images/tiktok2.png', isEmoji: false },
];

const countries = [
  { value: 'all', label: 'All Countries' },
  { value: 'malaysia', label: 'Malaysia' },
  { value: 'us', label: 'United States' },
  { value: 'indonesia', label: 'Indonesia' },
];

const metrics = [
  { value: 'likes', label: 'Likes', icon: Heart },
  { value: 'views', label: 'Views', icon: Eye },
  { value: 'comments', label: 'Comments', icon: MessageCircle },
  { value: 'change24h', label: '24h Change', icon: TrendingUp },
];

interface SocialTrendAnalysisProps {
  onChannelClick?: (channelId: string) => void;
}

type SortField = 'views' | 'likes' | 'comments' | '24h_change_views' | '24h_change_likes' | 'engagement' | 'title' | 'channel';
type SortDirection = 'asc' | 'desc';

const SocialTrendAnalysis: React.FC<SocialTrendAnalysisProps> = ({ onChannelClick }) => {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('likes');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('views');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Map UI metric values to API types  
  const getApiType = (metric: string): "LIKE" | "COMMENT" | "SHARE" | "VIEW" | "24H_CHANGE" => {
    switch (metric) {
      case 'change24h':
      case '24h_change':
        return '24H_CHANGE';
      case 'views':
        return 'VIEW';
      case 'likes':
        return 'LIKE';
      case 'comments':
        return 'COMMENT';
      case 'shares':
        return 'SHARE';
      default:
        return 'VIEW';
    }
  };

  // Prepare API parameters for trending videos
  const apiParams: TopContentsParams = useMemo(() => {
    const params: TopContentsParams = {
      type: getApiType(selectedMetric),
    };
    
    if (selectedPlatform !== 'all') {
      params.platform = selectedPlatform.toUpperCase() as "INSTAGRAM" | "TIKTOK" | "YOUTUBE";
    }
    
    if (selectedCountry !== 'all') {
      params.region = selectedCountry.toUpperCase();
    }
    
    return params;
  }, [selectedMetric, selectedPlatform, selectedCountry]);

  // Fetch trending videos data
  const { data: videosData, isLoading, error } = useTopContents(apiParams);
  const videos = videosData?.data?.contents?.contents || [];

  // Sort videos based on current sort field and direction
  const sortedVideos = useMemo(() => {
    if (!videos.length) return [];
    
    return [...videos].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortField) {
        case 'views':
          aValue = a.metadata.views;
          bValue = b.metadata.views;
          break;
        case 'likes':
          aValue = a.metadata.likes;
          bValue = b.metadata.likes;
          break;
        case 'comments':
          aValue = a.metadata.comments;
          bValue = b.metadata.comments;
          break;
        case '24h_change_views':
          aValue = a.metadata["24h_change_views"];
          bValue = b.metadata["24h_change_views"];
          break;
        case '24h_change_likes':
          aValue = a.metadata["24h_change_likes"];
          bValue = b.metadata["24h_change_likes"];
          break;
        case 'engagement':
          aValue = a.metadata.views > 0 ? (a.metadata.likes / a.metadata.views) : 0;
          bValue = b.metadata.views > 0 ? (b.metadata.likes / b.metadata.views) : 0;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'channel':
          aValue = a.channel.name.toLowerCase();
          bValue = b.channel.name.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [videos, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-3 w-3" /> : 
      <ArrowDown className="h-3 w-3" />;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
      const fallbackIcon = parent.querySelector('.fallback-icon') as HTMLElement;
      if (fallbackIcon) {
        fallbackIcon.style.display = 'flex';
      }
    }
  };

  const formatTextToTitleCase = (text: string) => {
    return text
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

     return (
     <div className="flex flex-col gap-5 w-full">
       {/* Filter Controls */}
       <div className="flex flex-wrap items-center gap-3">
         <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
           <SelectTrigger className="w-48 rounded-xl border border-slate-200/60 dark:border-white/[0.08]">
             <SelectValue placeholder="Select Platform" />
           </SelectTrigger>
           <SelectContent className="rounded-xl">
             {platforms.map((platform) => (
               <SelectItem key={platform.value} value={platform.value}>
                 <div className="flex items-center gap-2">
                   {(platform as any).icon && (platform as any).isEmoji ? (
                     <span className="text-sm">{(platform as any).icon}</span>
                   ) : (platform as any).icon && !(platform as any).isEmoji ? (
                     <img src={(platform as any).icon} alt={platform.label} className="w-4 h-4 object-contain" />
                   ) : null}
                   {platform.label}
                 </div>
               </SelectItem>
             ))}
           </SelectContent>
         </Select>

         <Select value={selectedCountry} onValueChange={setSelectedCountry}>
           <SelectTrigger className="w-48 rounded-xl border border-slate-200/60 dark:border-white/[0.08]">
             <SelectValue placeholder="Select Country" />
           </SelectTrigger>
           <SelectContent className="rounded-xl">
             {countries.map((country) => (
               <SelectItem key={country.value} value={country.value}>
                 {country.label}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>

         <div className="flex gap-1.5">
           {metrics.map((metric) => {
             const IconComponent = metric.icon;
             const isActive = selectedMetric === metric.value;
             return (
               <Button
                 key={metric.value}
                 variant={isActive ? "default" : "outline"}
                 size="sm"
                 onClick={() => setSelectedMetric(metric.value)}
                 className="rounded-xl transition-all border"
                 style={isActive ? {
                   background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))`,
                   color: '#fff',
                   borderColor: 'transparent',
                 } : {
                   borderColor: `rgba(var(--preset-primary-rgb), 0.15)`,
                 }}
               >
                 <IconComponent className="h-3 w-3 mr-1" />
                 {metric.label}
               </Button>
             );
           })}
         </div>
       </div>

       {/* Top Channels Bar Chart */}
       <TrendBarChart
         selectedMetric={selectedMetric}
         selectedChannel={selectedChannel}
         metrics={metrics}
         onChannelSelect={(channelId: string) => {
           setSelectedChannel(channelId);
           if (onChannelClick) onChannelClick(channelId);
         }}
         platform={selectedPlatform !== 'all' ? selectedPlatform.toUpperCase() as "INSTAGRAM" | "TIKTOK" | "YOUTUBE" : undefined}
         region={selectedCountry !== 'all' ? selectedCountry.toUpperCase() : undefined}
       />

       {/* Trending Videos Table */}
       <Card className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
         <CardHeader className="pb-4">
           <CardTitle className="text-lg font-semibold flex items-center gap-2">
             <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `rgba(var(--preset-primary-rgb), 0.1)` }}>
               <Zap className="h-4 w-4" style={{ color: `var(--preset-primary)` }} />
             </div>
             Top Trending Videos
             {videosData?.data?.contents?.total && (
               <Badge variant="secondary" className="ml-2 font-medium">
                 {videosData.data.contents.total.toLocaleString()} total
               </Badge>
             )}
           </CardTitle>
           <p className="text-sm text-muted-foreground">
             Click on any video to explore content · Real-time trending data
           </p>
         </CardHeader>
         <CardContent>
           {isLoading ? (
             <div className="flex items-center justify-center h-32">
               <div className="text-muted-foreground">Loading trending videos...</div>
             </div>
           ) : error ? (
             <div className="flex items-center justify-center h-32">
               <div className="text-red-500">Error loading videos</div>
             </div>
           ) : (
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left text-sm font-semibold">#</TableHead>
                    <TableHead className="text-left text-sm font-semibold">
                      <button onClick={() => handleSort('title')} className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                        Video {getSortIcon('title')}
                      </button>
                    </TableHead>
                    <TableHead className="text-left text-sm font-semibold">
                      <button onClick={() => handleSort('channel')} className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                        Channel {getSortIcon('channel')}
                      </button>
                    </TableHead>
                    <TableHead className="text-right text-sm font-semibold">
                      <button onClick={() => handleSort('views')} className="flex items-center gap-1 hover:opacity-70 transition-opacity ml-auto">
                        <Eye className="h-3 w-3" /> Views {getSortIcon('views')}
                      </button>
                    </TableHead>
                    <TableHead className="text-right text-sm font-semibold">
                      <button onClick={() => handleSort('likes')} className="flex items-center gap-1 hover:opacity-70 transition-opacity ml-auto">
                        <Heart className="h-3 w-3" /> Likes {getSortIcon('likes')}
                      </button>
                    </TableHead>
                    <TableHead className="text-right text-sm font-semibold">
                      <button onClick={() => handleSort('comments')} className="flex items-center gap-1 hover:opacity-70 transition-opacity ml-auto">
                        <MessageCircle className="h-3 w-3" /> Comments {getSortIcon('comments')}
                      </button>
                    </TableHead>
                    <TableHead className="text-right text-sm font-semibold">
                      <button onClick={() => handleSort('24h_change_views')} className="flex items-center gap-1 hover:opacity-70 transition-opacity ml-auto">
                        24h Views {getSortIcon('24h_change_views')}
                      </button>
                    </TableHead>
                    <TableHead className="text-right text-sm font-semibold">
                      <button onClick={() => handleSort('24h_change_likes')} className="flex items-center gap-1 hover:opacity-70 transition-opacity ml-auto">
                        24h Likes {getSortIcon('24h_change_likes')}
                      </button>
                    </TableHead>
                    <TableHead className="text-right text-sm font-semibold">
                      <button onClick={() => handleSort('engagement')} className="flex items-center gap-1 hover:opacity-70 transition-opacity ml-auto">
                        <Sparkles className="h-3 w-3" /> Engagement {getSortIcon('engagement')}
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedVideos.slice(0, 20).map((video, index) => (
                    <TableRow
                      key={video.id}
                      className="cursor-pointer transition-colors"
                      style={{ '--tw-hover-bg': `rgba(var(--preset-primary-rgb), 0.04)` } as React.CSSProperties}
                      onClick={() => window.open(video.video_url, '_blank')}
                    >
                      <TableCell className="w-12">
                        <div
                          className="text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: `rgba(var(--preset-primary-rgb), 0.1)`, color: `var(--preset-primary)` }}
                        >
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0 w-16 h-10">
                            <img
                              src={video.thumbnails.find(t => t.type === 'HIGH')?.url || video.thumbnails[0]?.url}
                              alt={video.title}
                              className="w-full h-full object-cover rounded"
                              onError={handleImageError}
                            />
                            <div className="fallback-icon absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center" style={{display: 'none'}}>
                              <Video className="h-4 w-4 text-slate-500" />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="h-3 w-3 text-white opacity-80" fill="white" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight">
                              {video.title}
                            </h4>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={video.channel.image_url}
                            alt={video.channel.name}
                            className="w-6 h-6 rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const fallback = document.createElement('div');
                                fallback.className = 'w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center';
                                fallback.innerHTML = `<span class="text-xs font-bold">${video.channel.name.charAt(0).toUpperCase()}</span>`;
                                parent.insertBefore(fallback, target);
                              }
                            }}
                          />
                          <div>
                            <div className="text-sm font-medium">{formatTextToTitleCase(video.channel.name)}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <span>{formatTextToTitleCase(video.channel.platform)}</span>
                              {video.channel.region && (<><span>·</span><span>{formatTextToTitleCase(video.channel.region)}</span></>)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">{formatNumber(video.metadata.views)}</TableCell>
                      <TableCell className="text-right text-sm">{formatNumber(video.metadata.likes)}</TableCell>
                      <TableCell className="text-right text-sm">{formatNumber(video.metadata.comments)}</TableCell>
                      <TableCell className="text-right text-sm">
                        <div className={`flex items-center gap-1 justify-end ${video.metadata["24h_change_views"] > 0 ? 'text-green-600' : video.metadata["24h_change_views"] < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                          {video.metadata["24h_change_views"] > 0 ? <TrendingUp className="h-3 w-3" /> : video.metadata["24h_change_views"] < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                          {video.metadata["24h_change_views"] !== 0 ? formatNumber(Math.abs(video.metadata["24h_change_views"])) : '0'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        <div className={`flex items-center gap-1 justify-end ${video.metadata["24h_change_likes"] > 0 ? 'text-green-600' : video.metadata["24h_change_likes"] < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                          {video.metadata["24h_change_likes"] > 0 ? <TrendingUp className="h-3 w-3" /> : video.metadata["24h_change_likes"] < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                          {video.metadata["24h_change_likes"] !== 0 ? formatNumber(Math.abs(video.metadata["24h_change_likes"])) : '0'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium" style={{ color: `var(--preset-primary)` }}>
                        {video.metadata.views > 0 ? (video.metadata.likes / video.metadata.views * 100).toFixed(1) : '0.0'}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
           )}
         </CardContent>
       </Card>
     </div>
   );
};

export default SocialTrendAnalysis; 