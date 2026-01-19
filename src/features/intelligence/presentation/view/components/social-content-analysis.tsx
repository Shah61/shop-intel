import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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

interface SocialContentAnalysisProps {}

const SocialContentAnalysis: React.FC<SocialContentAnalysisProps> = () => {
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

  // Prepare API parameters for browsing
  const apiParams: ContentParams = useMemo(() => {
    const params: ContentParams = {
      page,
      limit,
    };
    
    if (selectedPlatform !== 'all') {
      params.platform = selectedPlatform as 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE';
    }
    
    if (selectedRegion !== 'all') {
      params.region = selectedRegion;
    }
    
    return params;
  }, [selectedPlatform, selectedRegion, page]);

  // Prepare search parameters
  const searchParams: SearchParams = useMemo(() => {
    const params: SearchParams = {
      query: searchQuery,
      page: 1,
      limit: 10, // Limit search dropdown results
    };
    
    if (selectedPlatform !== 'all') {
      params.platform = selectedPlatform as 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE';
    }
    
    if (selectedRegion !== 'all') {
      params.region = selectedRegion;
    }
    
    return params;
  }, [searchQuery, selectedPlatform, selectedRegion]);

  // Fetch browse content data
  const { data: contentData, isLoading, error } = useContentMetadata(apiParams);
  
  // Fetch search results for dropdown
  const { data: searchData, isLoading: searchLoading } = useSearchContent(
    searchQuery.trim() ? searchParams : { query: '', page: 1, limit: 10 }
  );

  const browseContent = contentData?.data?.contents || [];
  const searchResults = searchData?.data?.contents?.results?.contents || [];

  // Combine browse content and selected videos based on mode
  const allContent = useMemo(() => {
    if (isSearchMode) {
      // In search mode, only show selected videos
      return selectedVideos;
    } else {
      // In browse mode, combine both
      const combinedContent = [...selectedVideos, ...browseContent];
      // Remove duplicates based on video ID
      const uniqueContent = combinedContent.filter((content, index, array) => 
        array.findIndex(item => item.video_id === content.video_id) === index
      );
      return uniqueContent;
    }
  }, [selectedVideos, browseContent, isSearchMode]);



  // Handle search input changes
  const handleSearchChange = (value: string) => {
    if (isSearchMode) return; // Prevent changes when in search mode
    setSearchQuery(value);
    setShowSearchDropdown(value.trim().length > 0);
  };

  // Add video from search results to main view
  const addVideoFromSearch = (video: ContentItem) => {
    console.log('Adding video:', video.title, video.video_id);
    
    setSelectedVideos(prev => {
      // Check if video already exists in selected videos
      const existsInSelected = prev.some(v => v.video_id === video.video_id);
      if (existsInSelected) {
        console.log('Video already exists in selected videos');
        return prev;
      }
      
      console.log('Adding new video to selected');
      return [video, ...prev];
    });
    
    // Set search mode and show video title in search bar
    setIsSearchMode(true);
    setSearchQuery(video.title);
    setShowSearchDropdown(false);
  };

  // Reset search and go back to browse mode
  const resetSearch = () => {
    setIsSearchMode(false);
    setSearchQuery('');
    setSelectedVideos([]);
    setShowSearchDropdown(false);
  };

  // Remove selected video
  const removeSelectedVideo = (videoId: string) => {
    setSelectedVideos(prev => prev.filter(v => v.video_id !== videoId));
  };

  // Sort the content
  const filteredContent = useMemo(() => {
    console.log('All content:', allContent.length, 'items');
    console.log('Selected videos:', selectedVideos.length, 'items');
    console.log('Browse content:', browseContent.length, 'items');
    
    // Sort the combined content
    const sorted = allContent.sort((a, b) => {
      switch (selectedSort) {
        case 'views': return (b.metadata?.views || 0) - (a.metadata?.views || 0);
        case 'likes': return (b.metadata?.likes || 0) - (a.metadata?.likes || 0);
        case 'comments': return (b.metadata?.comments || 0) - (a.metadata?.comments || 0);
        case '24h_change': return (b.metadata?.["24h_change"] || 0) - (a.metadata?.["24h_change"] || 0);
        default: return (b.metadata?.views || 0) - (a.metadata?.views || 0);
      }
    });

    console.log('Filtered content:', sorted.length, 'items');
    return sorted;
  }, [allContent, selectedSort, selectedVideos, browseContent]);

  const formatNumber = (num: number | undefined | null) => {
    if (num == null || isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="bg-white/80 dark:bg-black/80">
          <Skeleton className="w-full h-40" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Error component
  const ErrorDisplay = () => (
    <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200/50 dark:border-red-800/50">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
          Failed to Load Content
        </h3>
        <p className="text-sm text-red-500 dark:text-red-400 max-w-md">
          Unable to fetch content data. Please try again later.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header and Filters - Fixed at top */}
      <div className="flex-shrink-0 p-6 border-b border-slate-200/30 dark:border-white/10 bg-gradient-to-r from-white/50 to-slate-50/50 dark:from-black/50 dark:to-black/50 backdrop-blur-sm">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Content Analysis - {isSearchMode ? 'Search Results' : 'Browse Mode'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {isSearchMode 
                  ? 'Viewing selected videos from search' 
                  : 'Browse and filter trending social media content'
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {isLoading 
                  ? 'Loading...' 
                  : isSearchMode
                  ? `${filteredContent.length} selected videos`
                  : `${filteredContent.length} videos found`
                }
              </p>
              {!isSearchMode && selectedVideos.length > 0 && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {selectedVideos.length} selected from search
                </p>
              )}
              {!isSearchMode && contentData?.data?.metadata && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Browse: {browseContent.length} videos
                </p>
              )}
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 relative">
            {/* Search Bar with Popover Dropdown */}
            <div className="flex-1 min-w-[300px] mb-4">
              <Popover open={showSearchDropdown && !isSearchMode} onOpenChange={setShowSearchDropdown}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Input
                      ref={searchInputRef}
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder={isSearchMode ? "Selected video" : "Search for specific content (e.g., 'the power of ear seeds')..."}
                      className={`h-10 pl-10 rounded-xl border focus:border-blue-400 ${
                        isSearchMode 
                          ? 'pr-10 bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700' 
                          : 'pr-4 border-blue-200/50 dark:border-white/20'
                      }`}
                      readOnly={isSearchMode}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    {isSearchMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20"
                        onClick={resetSearch}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </PopoverTrigger>
                
                <PopoverContent 
                  className="w-[var(--radix-popover-trigger-width)] p-0 max-h-60 overflow-y-auto"
                  align="start"
                  side="bottom"
                  sideOffset={4}
                >
                  {searchLoading ? (
                    <div className="p-3 text-center text-sm text-slate-500 dark:text-slate-400">
                      Loading...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-3 text-center text-sm text-slate-500 dark:text-slate-400">
                      No results found.
                    </div>
                  ) : (
                    <div className="p-1">
                      {searchResults.map((video) => (
                        <div
                          key={video.video_id}
                          className="flex items-center justify-between p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Clicked on video:', video.title);
                            addVideoFromSearch(video);
                          }}
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            <img
                              src={video.thumbnails[0]?.url || '/images/skin care thumbnail.avif'}
                              alt={video.title}
                              className="w-12 h-8 object-cover rounded mr-3 flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = '/images/skin care thumbnail.avif';
                              }}
                            />
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                                {video.title}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                @{video.channel?.name || 'Unknown'} • {formatNumber(video.metadata?.views)} views
                              </span>
                            </div>
                          </div>
                          <Plus className="h-4 w-4 text-blue-500 flex-shrink-0 ml-2" />
                        </div>
                      ))}
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-48 rounded-xl border border-purple-200/50 dark:border-white/20 focus:border-purple-400">
                <SelectValue placeholder="Select Platform" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {platforms.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    <div className="flex items-center gap-2">
                      {(platform as any).icon && (platform as any).isEmoji ? (
                        <span className="text-sm">{(platform as any).icon}</span>
                      ) : (platform as any).icon && !(platform as any).isEmoji ? (
                        <img 
                          src={(platform as any).icon} 
                          alt={platform.label}
                          className="w-4 h-4 object-contain"
                        />
                      ) : null}
                      {platform.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48 rounded-xl border border-purple-200/50 dark:border-white/20 focus:border-purple-400">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {regions.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    <div className="flex items-center gap-2">
                      {region.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>



            <div className="flex gap-2">
              {sortMetrics.map((sort) => {
                const IconComponent = sort.icon;
                return (
                  <Button
                    key={sort.value}
                    variant={selectedSort === sort.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSort(sort.value)}
                    className={`rounded-xl transition-all border ${
                      selectedSort === sort.value 
                        ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white border-transparent' 
                        : 'border-green-200/50 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 dark:border-white/20'
                    }`}
                  >
                    <IconComponent className="h-3 w-3 mr-1" />
                    {sort.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>



      {/* Scrollable Content Area */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorDisplay />
          ) : filteredContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredContent.map((content) => {
                const isSelectedVideo = selectedVideos.some(v => v.video_id === content.video_id);
                return (
                  <VideoCard
                    key={content.id}
                    content={content}
                    isSelected={isSelectedVideo}
                  />
                );
              })}
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-dashed border border-slate-300/50 dark:border-white/20">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  No Content Found
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-500 max-w-md">
                  Try adjusting your filters to find relevant content.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SocialContentAnalysis; 