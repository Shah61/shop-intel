import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface PerformancePredictionsCardProps {
  className?: string;
}

const PerformancePredictionsCard: React.FC<PerformancePredictionsCardProps> = ({ className }) => {
  // Sample data for the trend chart
  const trendData = [
    { week: 'Week 1', engagement: 4.2 },
    { week: 'Week 2', engagement: 4.4 },
    { week: 'Week 3', engagement: 4.6 },
    { week: 'Week 4', engagement: 4.5 },
    { week: 'Predicted', engagement: 6.0 },
  ];

  return (
    <Card className={`bg-white dark:bg-black border border-black/20 dark:border-white/20 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200/30 dark:border-orange-800/30">
            <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-lg font-semibold text-black dark:text-white">
            Performance Predictions
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Growth Percentage */}
        <div className="text-center bg-green-50/80 dark:bg-green-950/20 rounded-lg p-5 border border-green-200/30 dark:border-green-800/30">
          <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
            +28%
          </div>
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
            <TrendingUp className="h-4 w-4" />
            <span>Predicted engagement growth next 30 days</span>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="space-y-2">
          <div className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
            <span className="font-semibold text-black dark:text-white">AI Analysis:</span> Your current 4.64% engagement rate
            is 157% above market average. Based on trend
            analysis and seasonal patterns, expect continued
            growth through summer beauty season.
          </div>
        </div>

        {/* Trend Chart */}
        <div className="h-40 w-full bg-black/5 dark:bg-white/5 rounded-lg p-4 border border-black/10 dark:border-white/10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <XAxis 
                dataKey="week" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-black/60 dark:text-white/60"
              />
              <YAxis 
                domain={[3.5, 6.5]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-black/60 dark:text-white/60"
              />
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke="#6366f1" 
                strokeWidth={2}
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 4, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformancePredictionsCard; 