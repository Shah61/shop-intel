"use client";

import React, { useState } from 'react';
import BubbleKeyword from './bubble-keyword';
import { AnalyticsBubbleMentioned } from './analytics-bubble-mentioned';
import CompetitorAnalysis from './competitor-analysis';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Hash, MessageCircle, Target, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const tabs = [
    { id: 'competitor', label: 'Competitors', icon: Target },
    { id: 'keywords', label: 'Keywords', icon: Hash },
    { id: 'mentions', label: 'Mentions', icon: MessageCircle },
];

const AIAnalysis: React.FC = () => {
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [activeTab, setActiveTab] = useState<string>('competitor');

    return (
        <div className="h-full flex flex-col">
            {/* Header bar */}
            <div className="shrink-0 border-b border-border px-4 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-1 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg whitespace-nowrap transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-foreground text-background'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {activeTab !== 'competitor' && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="inline-flex items-center gap-2 h-8 px-3 rounded-lg border border-border text-sm hover:bg-accent transition-colors">
                                <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-[13px]">
                                    {startDate ? format(startDate, "MMM d, yyyy") : "Pick a date"}
                                </span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end" sideOffset={5}>
                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                        </PopoverContent>
                    </Popover>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-auto">
                {activeTab === 'keywords' && (
                    <div className="h-full relative">
                        <BubbleKeyword
                            className="w-full h-full"
                            startDate={startDate ? format(startDate, 'yyyy-MM-dd') : undefined}
                        />
                    </div>
                )}
                {activeTab === 'mentions' && (
                    <div className="h-full overflow-y-auto p-4">
                        <AnalyticsBubbleMentioned
                            category="Beauty"
                            startDate={startDate ? format(startDate, 'yyyy-MM-dd') : undefined}
                            region="UNITED_STATES"
                        />
                    </div>
                )}
                {activeTab === 'competitor' && (
                    <div className="h-full p-4">
                        <CompetitorAnalysis />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIAnalysis;
