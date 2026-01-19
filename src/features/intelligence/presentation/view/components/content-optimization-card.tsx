import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, ArrowRight } from 'lucide-react';

interface ContentOptimizationCardProps {
  className?: string;
}

const ContentOptimizationCard: React.FC<ContentOptimizationCardProps> = ({ className }) => {
  const recommendations = [
    {
      text: "Post Instagram content at 2-4 PM for 23% higher engagement"
    },
    {
      text: "Increase TikTok frequency by 40% - currently underutilized"
    },
    {
      text: "Tutorial content performs 67% better than product shots"
    },
    {
      text: "Add trending audio to TikToks for 156% boost"
    }
  ];

  return (
    <Card className={`bg-white dark:bg-black border border-black/20 dark:border-white/20 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200/30 dark:border-blue-800/30">
            <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-lg font-semibold text-black dark:text-white">
            Content Optimization
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Recommendations List */}
        <div className="space-y-3">
          {recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200 border border-black/10 dark:border-white/10">
              <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/40">
                <ArrowRight className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-black/80 dark:text-white/80 leading-relaxed">
                {recommendation.text}
              </span>
            </div>
          ))}
        </div>

        {/* Opportunity Highlight */}
        <div className="p-4 rounded-lg bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/40 dark:border-amber-800/30">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
              💡 Growth Opportunity
            </div>
            <div className="text-sm font-medium text-amber-700 dark:text-amber-200 leading-relaxed">
              Your TikTok engagement (0.72%) has 285% growth potential based on beauty industry benchmarks.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentOptimizationCard; 