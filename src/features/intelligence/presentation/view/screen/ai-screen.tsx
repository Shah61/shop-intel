"use client";

import React, { useState } from 'react';
import AIAssistant from '../components/ai-assistant';
import AITrend from '../components/ai-trend';
import AIContent from '../components/ai-content';
import AIAnalysis from '../components/ai-analysis';
import { Bot, TrendingUp, PenTool, BarChart3 } from 'lucide-react';

const tabs = [
    { id: 'assistant', label: 'Assistant', icon: Bot },
    { id: 'trend-analyzer', label: 'Trends', icon: TrendingUp },
    { id: 'content-writer', label: 'Content', icon: PenTool },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
];

const AIScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('assistant');

    return (
        <div className="w-full h-full min-h-0 flex flex-col bg-background overflow-hidden">
            {/* Top nav */}
            <div className="shrink-0 border-b border-border bg-white dark:bg-card px-4 py-2">
                <div className="flex items-center gap-1 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors
                                    ${active
                                        ? 'bg-foreground text-background'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {activeTab === 'assistant' && <AIAssistant />}
                {activeTab === 'trend-analyzer' && <AITrend />}
                {activeTab === 'content-writer' && <AIContent />}
                {activeTab === 'analysis' && <AIAnalysis />}
            </div>
        </div>
    );
};

export default AIScreen;
