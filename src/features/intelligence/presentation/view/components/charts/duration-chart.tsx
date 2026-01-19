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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Duration Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80 flex items-center justify-center">
                        <p className="text-slate-500 dark:text-slate-400">No data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Duration Distribution
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10B981" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.8}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                                formatter={(value, name) => [
                                    `${value} songs`,
                                    'Count'
                                ]}
                                labelFormatter={(label) => `Duration: ${label}`}
                            />
                            <Bar 
                                dataKey="value" 
                                fill="url(#durationGradient)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default DurationChart; 