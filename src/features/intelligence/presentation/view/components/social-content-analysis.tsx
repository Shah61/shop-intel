import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Eye, Heart, MessageCircle, Search, TrendingUp, AlertCircle, Plus, X } from 'lucide-react';
import { useContentMetadata, useSearchContent } from '../../tanstack/trend-tanstack';
import { ContentParams, SearchParams, ContentItem } from '../../../data/model/trend-model';
import VideoCard from './video-card';

const platforms = [
  { value: 'all', label: 'All Platforms' },
  { value: 'INSTAGRAM', label: 'Instagram', icon: '/images/instargram.png', isEmoji: false },
  { value: 'TIKTOK', label: 'TikTok', icon: '/images/tiktok2.png', isEmoji: false },
];

const regions = [
  { value: 'all', label: 'All Countries' },
  { value: 'MALAYSIA', label: 'Malaysia' },
  { value: 'US', label: 'United States' },
  { value: 'INDONESIA', label: 'Indonesia' },
];

const sortMetrics = [
  { value: 'views', label: 'Views', icon: Eye },
  { value: 'likes', label: 'Likes', icon: Heart },
  { value: 'comments', label: 'Comments', icon: MessageCircle },
  { value: '24h_change', label: '24H Change', icon: TrendingUp },
];

const SocialContentAnalysis: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedSort, setSelectedSort] = useState('views');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<ContentItem[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const limit = 20;

  const apiParams: ContentParams = useMemo(() => {
    const params: ContentParams = { page, limit };
    if (selectedPlatform !== 'all') params.platform = selectedPlatform as 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE';
    if (selectedRegion !== 'all') params.region = selectedRegion;
    return params;
  }, [selectedPlatform, selectedRegion, page]);

  const searchParams: SearchParams = useMemo(() => {
    const params: SearchParams = { query: searchQuery, page: 1, limit: 10 };
    if (selectedPlatform !== 'all') params.platform = selectedPlatform as 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE';
    if (selectedRegion !== 'all') params.region = selectedRegion;
    return params;
  }, [searchQuery, selectedPlatform, selectedRegion]);

  const { data: contentData, isLoading, error } = useContentMetadata(apiParams);
  const { data: searchData, isLoading: searchLoading } = useSearchContent(
    searchQuery.trim() ? searchParams : { query: '', page: 1, limit: 10 }
  );

  const browseContent = contentData?.data?.contents || [];
  const searchResults = searchData?.data?.contents?.results?.contents || [];

  const allContent = useMemo(() => {
    if (isSearchMode) return selectedVideos;
    const combined = [...selectedVideos, ...browseContent];
    return combined.filter((content, index, array) =>
      array.findIndex(item => item.video_id === content.video_id) === index
    );
  }, [selectedVideos, browseContent, isSearchMode]);

  const handleSearchChange = (value: string) => {
    if (isSearchMode) return;
    setSearchQuery(value);
    setShowSearchDropdown(value.trim().length > 0);
  };

  const addVideoFromSearch = (video: ContentItem) => {
    setSelectedVideos(prev => {
      if (prev.some(v => v.video_id === video.video_id)) return prev;
      return [video, ...prev];
    });
    setIsSearchMode(true);
    setSearchQuery(video.title);
    setShowSearchDropdown(false);
  };

  const resetSearch = () => {
    setIsSearchMode(false);
    setSearchQuery('');
    setSelectedVideos([]);
    setShowSearchDropdown(false);
  };

  const filteredContent = useMemo(() => {
    return allContent.sort((a, b) => {
      switch (selectedSort) {
        case 'views': return (b.metadata?.views || 0) - (a.metadata?.views || 0);
        case 'likes': return (b.metadata?.likes || 0) - (a.metadata?.likes || 0);
        case 'comments': return (b.metadata?.comments || 0) - (a.metadata?.comments || 0);
        case '24h_change': return (b.metadata?.["24h_change"] || 0) - (a.metadata?.["24h_change"] || 0);
        default: return (b.metadata?.views || 0) - (a.metadata?.views || 0);
      }
    });
  }, [allContent, selectedSort]);

  const formatNumber = (num: number | undefined | null) => {
    if (num == null || isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Content Analysis {isSearchMode ? '· Search Results' : '· Browse'}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isSearchMode ? 'Viewing selected videos from search' : 'Browse and filter trending social media content'}
            </p>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {isLoading ? 'Loading...' : `${filteredContent.length} videos`}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[280px]">
            <Popover open={showSearchDropdown && !isSearchMode} onOpenChange={setShowSearchDropdown}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder={isSearchMode ? "Selected video" : "Search content..."}
                    className={`h-9 pl-9 text-sm rounded-lg border ${
                      isSearchMode
                        ? 'pr-9 border-[rgba(var(--preset-primary-rgb),0.3)] bg-[rgba(var(--preset-primary-rgb),0.04)]'
                        : 'border-slate-200/60 dark:border-white/[0.08]'
                    } focus:border-[var(--preset-primary)] focus:ring-1`}
                    style={{ '--tw-ring-color': `rgba(var(--preset-primary-rgb), 0.2)` } as React.CSSProperties}
                    readOnly={isSearchMode}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  {isSearchMode && (
                    <Button variant="ghost" size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={resetSearch}
                    >
                      <X className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 max-h-60 overflow-y-auto" align="start" side="bottom" sideOffset={4}>
                {searchLoading ? (
                  <div className="p-3 text-center text-sm text-muted-foreground">Loading...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-center text-sm text-muted-foreground">No results found.</div>
                ) : (
                  <div className="p-1">
                    {searchResults.map((video) => (
                      <div key={video.video_id}
                        className="flex items-center justify-between p-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04] rounded-lg transition-colors"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); addVideoFromSearch(video); }}
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          <img src={video.thumbnails[0]?.url || '/images/skin care thumbnail.avif'} alt={video.title}
                            className="w-12 h-8 object-cover rounded mr-3 flex-shrink-0"
                            onError={(e) => { e.currentTarget.src = '/images/skin care thumbnail.avif'; }}
                          />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{video.title}</span>
                            <span className="text-xs text-muted-foreground">@{video.channel?.name || 'Unknown'} · {formatNumber(video.metadata?.views)} views</span>
                          </div>
                        </div>
                        <Plus className="h-4 w-4 flex-shrink-0 ml-2" style={{ color: `var(--preset-primary)` }} />
                      </div>
                    ))}
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-44 h-9 text-sm rounded-lg border-slate-200/60 dark:border-white/[0.08]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              {platforms.map((platform) => (
                <SelectItem key={platform.value} value={platform.value}>
                  <div className="flex items-center gap-2">
                    {(platform as any).icon && !(platform as any).isEmoji && (
                      <img src={(platform as any).icon} alt={platform.label} className="w-4 h-4 object-contain" />
                    )}
                    {platform.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-44 h-9 text-sm rounded-lg border-slate-200/60 dark:border-white/[0.08]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.value} value={region.value}>{region.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-1.5">
            {sortMetrics.map((sort) => {
              const Icon = sort.icon;
              const isActive = selectedSort === sort.value;
              return (
                <Button key={sort.value} variant="ghost" size="sm"
                  onClick={() => setSelectedSort(sort.value)}
                  className="h-8 text-xs px-2.5 rounded-lg border transition-all"
                  style={isActive ? {
                    background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))`,
                    color: '#fff', borderColor: 'transparent',
                  } : {
                    background: `rgba(var(--preset-primary-rgb), 0.04)`,
                    color: `var(--preset-primary)`,
                    borderColor: `rgba(var(--preset-primary-rgb), 0.12)`,
                  }}
                >
                  <Icon className="h-3 w-3 mr-1" />{sort.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06]">
              <Skeleton className="w-full h-40" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-4"><Skeleton className="h-3 w-16" /><Skeleton className="h-3 w-16" /><Skeleton className="h-3 w-16" /></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="bg-white dark:bg-white/[0.02] border border-red-200/50 dark:border-red-500/20 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <h3 className="text-base font-semibold text-red-600 dark:text-red-400 mb-1">Failed to Load Content</h3>
            <p className="text-sm text-muted-foreground">Unable to fetch content data. Please try again later.</p>
          </CardContent>
        </Card>
      ) : filteredContent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredContent.map((content) => (
            <VideoCard key={content.id} content={content} isSelected={selectedVideos.some(v => v.video_id === content.video_id)} />
          ))}
        </div>
      ) : (
        <Card className="bg-white dark:bg-white/[0.02] border border-dashed border-slate-200/60 dark:border-white/[0.06]">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-10 w-10 mb-3" style={{ color: `rgba(var(--preset-primary-rgb), 0.3)` }} />
            <h3 className="text-base font-semibold text-slate-600 dark:text-slate-400 mb-1">No Content Found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your filters to find relevant content.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SocialContentAnalysis;
