import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface CompetitorIntelligenceCardProps {
  className?: string;
}

const CompetitorIntelligenceCard: React.FC<CompetitorIntelligenceCardProps> = ({ className }) => {
  const competitors = [
    {
      name: "Maybelline",
      metric: "+156% Views Advantage",
      type: "positive"
    },
    {
      name: "Lancôme", 
      metric: "+174% Engagement Lead",
      type: "positive"
    },
    {
      name: "FENTY Beauty",
      metric: "-2% Engagement Gap",
      type: "negative"
    }
  ];

  return (
    <Card className={`bg-white dark:bg-black border border-black/20 dark:border-white/20 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-pink-50 dark:bg-pink-950/30 border border-pink-200/30 dark:border-pink-800/30">
            <Target className="h-5 w-5 text-pink-600 dark:text-pink-400" />
          </div>
          <CardTitle className="text-lg font-semibold text-black dark:text-white">
            Competitor Intelligence
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Competitor Metrics */}
        <div className="space-y-3">
          {competitors.map((competitor, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200 border border-black/10 dark:border-white/10">
              <span className="text-sm font-semibold text-black dark:text-white">
                {competitor.name}
              </span>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                competitor.type === 'positive' 
                  ? 'text-green-700 dark:text-green-300 bg-green-100/80 dark:bg-green-900/30' 
                  : 'text-red-700 dark:text-red-300 bg-red-100/80 dark:bg-red-900/30'
              }`}>
                {competitor.metric}
              </span>
            </div>
          ))}
        </div>

        {/* Key Finding */}
        <div className="p-4 rounded-lg bg-pink-50/80 dark:bg-pink-950/20 border border-pink-200/40 dark:border-pink-800/30">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-pink-800 dark:text-pink-300 uppercase tracking-wide">
              🎯 Key Finding
            </div>
            <div className="text-sm font-medium text-pink-700 dark:text-pink-200 leading-relaxed">
              You're outperforming 89% of tracked competitors. Focus on closing the small gap with FENTY Beauty to become #1 in engagement.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitorIntelligenceCard; 