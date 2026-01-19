import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, AlertTriangle, Loader2, Hash, ChevronDown, ExternalLink, Play, Search, X, Filter, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { usePersonalBeautyTopMentions } from '../../tanstack/ai-tanstack';
import { Content as BeautyContent } from '../../../data/model/ai-model';
import { Channel as BeautyChannel } from '../../../data/model/ai-model';
import { TopMentionChild as BeautyTopMentionChild } from '../../../data/model/ai-model';
import { TopMention as BeautyTopMention } from '../../../data/model/ai-model';

// Unified types (both models have the same structure)
type TopMention = BeautyTopMention;
type Content = BeautyContent;
type Channel = BeautyChannel;
type TopMentionChild = BeautyTopMentionChild;

interface BubbleMentionedProps {
  category?: 'Beauty';
  startDate?: string;
  endDate?: string;
  region?: string;
  selectedSubcategory?: string;
}

// Pagination Component
function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  itemsPerPage
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800/50">
      {/* Items Info */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {startItem} to {endItem} of {totalItems} topics
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <div className="flex items-center justify-center w-8 h-8">
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </div>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className={`h-8 w-8 p-0 ${
                    currentPage === page 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  }`}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface TopicCardProps {
  topic: TopMention;
}

// Search Bar Component
function SearchBar({ 
  searchQuery, 
  onSearchChange, 
  totalResults, 
  filteredResults,
  onClearSearch 
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalResults: number;
  filteredResults: number;
  onClearSearch: () => void;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative mb-4 px-6 py-4">
      <div className={`relative transition-all duration-200 ${
        isFocused ? 'transform scale-[1.01]' : ''
      }`}>
        <div className={`relative flex items-center bg-white dark:bg-gray-900/50 rounded-lg border transition-all duration-200 ${
          isFocused 
            ? 'border-purple-500 dark:border-purple-400 shadow-md shadow-purple-500/10' 
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}>
          <div className="absolute left-3 flex items-center pointer-events-none">
            <Search className={`h-4 w-4 transition-colors duration-200 ${
              isFocused 
                ? 'text-purple-500 dark:text-purple-400' 
                : 'text-gray-400 dark:text-gray-500'
            }`} />
          </div>
          
          <input
            type="text"
            placeholder="Search parent and child keywords..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              // Delay hiding to allow clicks on dropdown items
              setTimeout(() => setIsFocused(false), 150);
            }}
            className="w-full pl-10 pr-10 py-2.5 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-sm"
          />
          
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="absolute right-3 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group"
            >
              <X className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
            </button>
          )}
        </div>
        
        {/* Search Results Counter */}
        {searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-1 mx-0 px-3 py-1.5 bg-white dark:bg-gray-900/90 rounded-md border border-gray-200 dark:border-gray-700 shadow-md backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {filteredResults === 0 ? (
                  <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                    No results found on this page
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                    Found {filteredResults} of {totalResults} topics on this page
                  </span>
                )}
              </span>
              
              {searchQuery && (
                <Badge className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-transparent text-xs">
                  "{searchQuery}"
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {/* Search Suggestions/Quick Filters */}
        {isFocused && !searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-1 mx-4 bg-white dark:bg-gray-900/90 rounded-md border border-gray-200 dark:border-gray-700 shadow-md backdrop-blur-sm z-10 overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3 w-3 text-purple-500" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Quick Search
                </span>
              </div>
            </div>
            
            {/* Suggestions */}
            <div className="p-3">
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {['T-Shirts', 'Jeans', 'Dresses', 'Jackets', 'Accessories', 'Outfits'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={(e) => {
                      e.preventDefault();
                      onSearchChange(suggestion);
                      setIsFocused(false);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className="px-2 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-400 transition-colors duration-200 text-center"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span>💡</span>
                <span>Search by parent and child keywords only</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Individual Topic Card Component (Parent)
function TopicCard({ topic }: TopicCardProps) {
  const [showAllParentContents, setShowAllParentContents] = useState(false);
  const [showAllChildren, setShowAllChildren] = useState(false);
  const [expandedChildren, setExpandedChildren] = useState<Set<string>>(new Set());

  const parentContentsToShow = showAllParentContents ? topic.contents : topic.contents?.slice(0, 4);

  const toggleChildExpansion = (childId: string) => {
    const newExpanded = new Set(expandedChildren);
    if (newExpanded.has(childId)) {
      newExpanded.delete(childId);
    } else {
      newExpanded.add(childId);
    }
    setExpandedChildren(newExpanded);
  };

  return (
    <div className="bg-white dark:bg-gray-900/20 rounded-xl border border-gray-200 dark:border-gray-800/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Parent Topic Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800/50 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
              <Hash size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-purple-600 text-white text-xs font-medium">
                  PARENT TOPIC
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {topic.keyword}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-transparent">
                  {topic.category}
                </Badge>
                {topic.region && (
                  <Badge className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-transparent">
                    {topic.region}
                  </Badge>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Updated {format(new Date(topic.updated_at), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
          </div>
          
          {/* Parent Stats */}
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {topic.total_mention.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Mentions</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {topic.count.toLocaleString()} direct mentions
            </div>
            {topic.children && topic.children.length > 0 && (
              <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                {topic.children.length} related keywords
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Parent Direct Content Items */}
      {topic.contents && topic.contents.length > 0 && (
        <div className="p-6 border-b border-gray-100 dark:border-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Play size={16} className="text-purple-500" />
              Direct Content ({topic.contents.length} items)
            </h4>
            {topic.contents.length > 4 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllParentContents(!showAllParentContents)}
                className="text-xs h-7 px-3"
              >
                {showAllParentContents ? 'Show Less' : `Show All ${topic.contents.length}`}
                <ChevronDown size={14} className={`ml-1 transition-transform ${showAllParentContents ? 'rotate-180' : ''}`} />
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {parentContentsToShow?.map((content) => (
              <ContentItem key={content.id} content={content} isParent={true} />
            ))}
          </div>
        </div>
      )}

      {/* Child Keywords Section */}
      {topic.children && topic.children.length > 0 && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Hash size={16} className="text-green-500" />
              Related Keywords ({topic.children.length})
            </h4>
            {topic.children.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllChildren(!showAllChildren)}
                className="text-xs h-7 px-3"
              >
                {showAllChildren ? 'Show Less' : `Show All ${topic.children.length}`}
                <ChevronDown size={14} className={`ml-1 transition-transform ${showAllChildren ? 'rotate-180' : ''}`} />
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            {(showAllChildren ? topic.children : topic.children.slice(0, 3)).map((child) => (
              <ChildKeywordCard 
                key={child.id} 
                child={child} 
                isExpanded={expandedChildren.has(child.id)}
                onToggleExpansion={() => toggleChildExpansion(child.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Individual Content Item Component
function ContentItem({ content, isParent = false }: { content: Content; isParent?: boolean }) {
  const [showFullTitle, setShowFullTitle] = useState(false);
  
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg hover:shadow-md transition-all duration-200 group ${
      isParent 
        ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50' 
        : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50'
    }`}>
      {content.thumbnail && (
        <div className="relative flex-shrink-0">
          <img 
            src={content.thumbnail} 
            alt={content.title}
            className="w-20 h-14 rounded-lg object-cover shadow-sm"
          />
          <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play size={18} className="text-white" />
          </div>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-2">
          <h5 className={`font-medium text-gray-900 dark:text-white leading-tight ${
            showFullTitle ? 'line-clamp-none' : 'line-clamp-3'
          }`}>
            {content.title}
          </h5>
          {content.title.length > 100 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullTitle(!showFullTitle)}
              className="h-5 px-1 mt-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showFullTitle ? 'Show Less' : 'Show Full Title'}
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
          {content.channel?.name && (
            <>
              <span className="font-medium">{content.channel.name}</span>
              <span>•</span>
            </>
          )}
          {content.channel?.region && (
            <>
              <span>{content.channel.region}</span>
              <span>•</span>
            </>
          )}
          <span>{format(new Date(content.created_at), 'MMM dd, yyyy')}</span>
        </div>
        
        {content.video_url && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => window.open(content.video_url, '_blank')}
          >
            <ExternalLink size={12} className="mr-1" />
            Watch Video
          </Button>
        )}
      </div>
    </div>
  );
}

// Child Keyword Card Component
function ChildKeywordCard({ 
  child, 
  isExpanded, 
  onToggleExpansion 
}: { 
  child: any; 
  isExpanded: boolean; 
  onToggleExpansion: () => void;
}) {
  const [showAllChildContents, setShowAllChildContents] = useState(false);
  
  const childContentsToShow = showAllChildContents ? child.contents : child.contents?.slice(0, 2);

  return (
    <div className="bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800/50 overflow-hidden">
      {/* Child Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
        onClick={onToggleExpansion}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-green-600 text-white text-xs font-medium">
              RELATED KEYWORD
            </Badge>
            <h5 className="font-semibold text-gray-900 dark:text-white">
              {child.keyword}
            </h5>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {child.total_mention?.toLocaleString() || child.count.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {child.contents?.length || 0} content items
              </div>
            </div>
            <ChevronDown 
              size={16} 
              className={`transition-transform text-gray-500 ${isExpanded ? 'rotate-180' : ''}`} 
            />
          </div>
        </div>
      </div>

      {/* Child Content Items */}
      {isExpanded && child.contents && child.contents.length > 0 && (
        <div className="p-4 border-t border-green-200 dark:border-green-800/50 bg-white dark:bg-gray-900/30">
          <div className="flex items-center justify-between mb-3">
            <h6 className="text-sm font-medium text-gray-900 dark:text-white">
              Content from this keyword ({child.contents.length})
            </h6>
            {child.contents.length > 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllChildContents(!showAllChildContents)}
                className="text-xs h-6 px-2"
              >
                {showAllChildContents ? 'Show Less' : `Show All ${child.contents.length}`}
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            {childContentsToShow?.map((content: Content) => (
              <ContentItem key={content.id} content={content} isParent={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AnalyticsBubbleMentioned({ 
  category = 'Beauty',
  startDate,
  endDate,
  region = 'UNITED_STATES',
  selectedSubcategory
}: BubbleMentionedProps) {

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTopicsResult, setFilteredTopicsResult] = useState<TopMention[]>([]);
  
  // Pagination settings - 10 items per page as requested
  const itemsPerPage = 10;

  // Use the Beauty API with pagination
  const { data: beautyTopMentionsData, isLoading } = usePersonalBeautyTopMentions({
    start_date: startDate,
    end_date: endDate,
    page: currentPage,
    limit: itemsPerPage
  });

  // Use the data from the Beauty API with proper typing
  const filteredTopics: TopMention[] = beautyTopMentionsData?.data?.top_mentions || [];
  const metadata = beautyTopMentionsData?.data?.metadata;
  
  // Calculate pagination info
  const totalItems = metadata?.total || 0;
  const totalPages = metadata?.total_pages || Math.ceil(totalItems / itemsPerPage);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, startDate, endDate]);

  // Initialize filtered results when data changes
  useEffect(() => {
    setFilteredTopicsResult(filteredTopics);
  }, [filteredTopics]);

  // Reset search when page changes (since search is only within current page)
  useEffect(() => {
    if (searchQuery) {
      setSearchQuery('');
      setFilteredTopicsResult(filteredTopics);
    }
  }, [currentPage]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredTopicsResult(filteredTopics);
      return;
    }
    
    const searchTerm = query.toLowerCase();
    
    // Create scored results with priority ranking (Keywords Only)
    const scoredResults = filteredTopics.map((topic) => {
      let score = 0;
      let matchType = '';
      let hasActualMatch = false;
      
      // HIGHEST PRIORITY: Parent topic keyword (exact match)
      if (topic.keyword.toLowerCase() === searchTerm) {
        score += 1000;
        matchType = 'parent-exact';
        hasActualMatch = true;
      }
      // HIGH PRIORITY: Parent topic keyword (partial match)
      else if (topic.keyword.toLowerCase().includes(searchTerm)) {
        score += 800;
        matchType = 'parent-partial';
        hasActualMatch = true;
      }
      
      // SECOND PRIORITY: Child keywords (exact match)
      const exactChildMatch = topic.children?.some((child) => 
        child.keyword.toLowerCase() === searchTerm
      );
      if (exactChildMatch) {
        score += 600;
        matchType = matchType || 'child-exact';
        hasActualMatch = true;
      }
      
      // THIRD PRIORITY: Child keywords (partial match)
      const partialChildMatch = topic.children?.some((child) => 
        child.keyword.toLowerCase().includes(searchTerm)
      );
      if (partialChildMatch && !exactChildMatch) {
        score += 400;
        matchType = matchType || 'child-partial';
        hasActualMatch = true;
      }
      
      // Only add popularity boost if there's an actual keyword match
      if (hasActualMatch) {
        const mentionBoost = Math.log(topic.total_mention + 1) * 10;
        score += mentionBoost;
      }
      
      return {
        topic,
        score,
        matchType,
        hasMatch: hasActualMatch
      };
    });
    
    // Group results by match type for prioritized display
    const matchedResults = scoredResults.filter(result => result.hasMatch);
    
    // Separate results by priority groups
    const parentTopicMatches = matchedResults.filter(result => 
      result.matchType === 'parent-exact' || result.matchType === 'parent-partial'
    ).sort((a, b) => b.score - a.score);
    
    const childKeywordMatches = matchedResults.filter(result => 
      result.matchType === 'child-exact' || result.matchType === 'child-partial'
    ).sort((a, b) => b.score - a.score);
    
    const otherMatches = matchedResults.filter(result => 
      !['parent-exact', 'parent-partial', 'child-exact', 'child-partial'].includes(result.matchType)
    ).sort((a, b) => b.score - a.score);
    
    // Combine in priority order: Parent Topics → Child Keywords → Other Keywords
    const prioritizedResults = [
      ...parentTopicMatches,
      ...childKeywordMatches,
      ...otherMatches
    ].map(result => result.topic);
    
    setFilteredTopicsResult(prioritizedResults);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredTopicsResult(filteredTopics);
    setCurrentPage(1);
  };

  // --- HEADER SECTION ---
  return (
    <div className="rounded-lg border border-gray-200 dark:border-neutral-800/50 bg-white dark:bg-gray-900/20 backdrop-filter backdrop-blur-md w-full">
      {/* Header with current category and Pagination at the top */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Mentioned Topics</h3>
            {totalPages > 1 && (
              <Badge variant="outline" className="text-xs">
                Page {currentPage} of {totalPages}
              </Badge>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {/* Date Picker Slot (to be filled by parent) */}
            {/* Pagination at the top, beside Date */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
              />
            )}
            <Badge className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-transparent">
              {selectedSubcategory || category}
            </Badge>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        totalResults={filteredTopics.length}
        filteredResults={filteredTopicsResult.length}
        onClearSearch={clearSearch}
      />
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white/50 dark:bg-black/30 backdrop-blur-sm h-[600px]">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 dark:text-purple-400 mb-3" />
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            Loading mentioned topics... {currentPage > 1 && `(Page ${currentPage})`}
          </span>
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="p-12 text-center h-[600px] flex items-center justify-center flex-col">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900/90 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-10 w-10 text-gray-400 dark:text-gray-600" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
            No mentioned topics found
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 max-w-sm mx-auto">
            Try adjusting your filters to see different mentioned topics.
          </p>
        </div>
      ) : filteredTopicsResult.length === 0 && searchQuery ? (
        <div className="p-12 text-center h-[600px] flex items-center justify-center flex-col">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900/90 flex items-center justify-center mx-auto mb-4">
            <Search className="h-10 w-10 text-gray-400 dark:text-gray-600" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
            No results found for "{searchQuery}"
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 max-w-sm mx-auto">
            Try searching with different keywords or clear your search to see all topics.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={clearSearch}
            className="mt-4"
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <>
          <div className="p-6 space-y-6">
            {filteredTopicsResult.map((topic: TopMention, index: number) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
          
          {/* Remove Pagination from the bottom of the results list */}
        </>
      )}
    </div>
  );
}