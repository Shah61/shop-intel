import React from 'react';
import { Brain } from 'lucide-react';

interface AIStrategicSummaryProps {
  className?: string;
}

const AIStrategicSummary: React.FC<AIStrategicSummaryProps> = ({ className }) => {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-white dark:bg-black p-8 border border-black/20 dark:border-white/20 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-purple-50/20 to-pink-50/30 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-pink-950/20"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/30 dark:border-indigo-800/30">
            <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-2xl font-semibold text-black dark:text-white">
            AI Strategic Summary
          </h3>
        </div>
        
        {/* Summary Content */}
        <div className="text-center space-y-4">
          {/* Main highlight */}
          <div className="p-5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <p className="text-black dark:text-white leading-relaxed text-lg">
              <span className="font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/30 px-3 py-1 rounded">
                Shop-Intel is dominating the engagement game with 4.64% rate (157% above average).
              </span>
            </p>
          </div>
          
          {/* Supporting insight */}
          <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4 border border-black/10 dark:border-white/10">
            <p className="text-black/80 dark:text-white/80 leading-relaxed text-base max-w-3xl mx-auto">
              Your Instagram strategy is stellar, but TikTok is your next frontier. With Charlotte Tilbury declining, there's a premium market opportunity worth pursuing.
            </p>
          </div>
          
          {/* AI confidence indicator */}
          <div className="flex items-center justify-center gap-2 text-black/60 dark:text-white/60 text-sm">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-500 rounded-full"></div>
              ))}
            </div>
            <span className="font-medium">AI Confidence: 94%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStrategicSummary; 