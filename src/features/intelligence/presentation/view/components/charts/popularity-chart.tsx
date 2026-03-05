"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PopularityChartProps {
    data: Array<{
        name: string;
        popularity: number;
        rank: number;
        duration: number;
    }>;
}

const PopularityChart: React.FC<PopularityChartProps> = ({ data }) => {
    if (!data.length) {
        return (
            <Card className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <BarChart3 className="w-4 h-4" style={{ color: `var(--preset-primary)` }} />
                        Top 10 Songs Popularity
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
                    Top 10 Songs Popularity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--preset-primary)" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="var(--preset-lighter)" stopOpacity={0.8}/>
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis label={{ value: 'Popularity %', angle: -90, position: 'insideLeft' }} />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-white/[0.1]">
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Song: {label}</p>
                                                <p className="text-sm" style={{ color: `var(--preset-primary)` }}>
                                                    Popularity: {typeof payload[0].value === 'number' ? payload[0].value.toFixed(1) : payload[0].value}%
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="popularity" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default PopularityChart;
