"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DurationChartProps {
    data: Array<{
        name: string;
        value: number;
        percentage: number;
    }>;
}

const DurationChart: React.FC<DurationChartProps> = ({ data }) => {
    if (!data.length) {
        return (
            <Card className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <BarChart3 className="w-4 h-4" style={{ color: `var(--preset-primary)` }} />
                        Duration Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80 flex items-center justify-center">
                        <p className="text-muted-foreground">No data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="w-4 h-4" style={{ color: `var(--preset-primary)` }} />
                    Duration Distribution
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--preset-primary)" stopOpacity={0.9}/>
                                    <stop offset="100%" stopColor="var(--preset-lighter)" stopOpacity={0.6}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                                formatter={(value) => [`${value} songs`, 'Count']}
                                labelFormatter={(label) => `Duration: ${label}`}
                            />
                            <Bar dataKey="value" fill="url(#durationGradient)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default DurationChart;
