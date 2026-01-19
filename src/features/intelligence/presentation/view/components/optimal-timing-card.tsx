import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, TrendingUp, ArrowRight } from 'lucide-react';

interface OptimalTimingCardProps {
  className?: string;
}

const OptimalTimingCard: React.FC<OptimalTimingCardProps> = ({ className }) => {
  const timingRecommendations = [
    {
      text: "Instagram: Tuesday-Thursday 2-4 PM (+34% engagement)"
    },
    {
      text: "TikTok: Friday-Sunday 6-9 PM (+67% views)"
    },
    {
      text: "Avoid Mondays: 23% below average performance"
    },
    {
      text: "Summer beauty content peaks July 15-Aug 30"
    }
  ];

  return (
    <Card className={`bg-white dark:bg-black border border-black/20 dark:border-white/20 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200/30 dark:border-cyan-800/30">
            <Clock className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <CardTitle className="text-lg font-semibold text-black dark:text-white">
            Optimal Timing
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Peak Time Display */}
        <div className="text-center bg-green-50/80 dark:bg-green-950/20 rounded-lg p-5 border border-green-200/30 dark:border-green-800/30">
          <div className="text-5xl font-bold text-green-600 dark:text-green-400 mb-3">
            2:30 PM
          </div>
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
            <TrendingUp className="h-4 w-4" />
            <span>Peak engagement window detected</span>
          </div>
        </div>

        {/* Timing Recommendations */}
        <div className="space-y-3">
          {timingRecommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200 border border-black/10 dark:border-white/10">
              <div className="p-1 rounded bg-cyan-100 dark:bg-cyan-900/40">
                <ArrowRight className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
              </div>
              <span className="text-sm font-medium text-black/80 dark:text-white/80 leading-relaxed">
                {recommendation.text}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimalTimingCard; 