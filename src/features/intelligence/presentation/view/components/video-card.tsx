import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Heart, MessageCircle, Sparkles, Play } from 'lucide-react';
import { ContentItem } from '../../../data/model/trend-model';

interface VideoCardProps {
  content: ContentItem;
  isSelected: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ content, isSelected }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} days ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} months ago`;
  };

  return (
    <Card 
      key={content.id} 
      className={`group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden ${
        isSelected 
          ? 'bg-blue-50/80 dark:bg-blue-950/20 ring-2 ring-blue-200 dark:ring-blue-800' 
          : 'bg-white/80 dark:bg-black/80'
      }`}
    >
      <div className="relative">
        <img 
          src={content.thumbnails[0]?.url || '/images/skin care thumbnail.avif'} 
          alt={content.title} 
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" 
          onError={(e) => {
            e.currentTarget.src = '/images/skin care thumbnail.avif';
          }}
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
        
        {/* Duration */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {formatDuration(content.metadata.video_length)}
        </div>
        
        {/* Platform Icon */}
        <div className="absolute top-2 left-2 rounded-full p-0">
          {content.channel.platform === 'INSTAGRAM' && (
            <img 
              src="/images/instargram.png" 
              alt="Instagram"
              className="w-12 h-12 object-contain"
            />
          )}
          {content.channel.platform === 'TIKTOK' && (
            <img 
              src="/images/tiktok2.png" 
              alt="TikTok"
              className="w-12 h-12 object-contain"
            />
          )}
          {content.channel.platform === 'YOUTUBE' && (
            <img 
              src="/images/youtube.png" 
              alt="YouTube"
              className="w-12 h-12 object-contain"
            />
          )}
        </div>



        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <a 
            href={content.video_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white/90 dark:bg-black/80 rounded-full p-3 shadow-lg hover:bg-white dark:hover:bg-black transition-colors"
          >
            <Play className="h-6 w-6 text-purple-600" />
          </a>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-purple-600 transition-colors">
          {content.title}
        </h3>
        
        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatNumber(content.metadata.views)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {formatNumber(content.metadata.likes)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {formatNumber(content.metadata.comments)}
          </span>
        </div>

        {content.summarizer_description !== '-' && content.summarizer_description && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-3 rounded-lg border border-purple-200/50 dark:border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">AI Summary</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {content.summarizer_description}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>@{content.channel.name}</span>
          <span>{getTimeAgo(content.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard; 