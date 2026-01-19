"use client"
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useSkuPerformanceHistoricalData } from '../../../tanstack/analytics-tanstack';

const SkuPieChart = () => {
    // Date range state
    const [date, setDate] = useState({
        from: new Date(2025, 0, 1),
        to: new Date(2025, 2, 31),
    });

    // Add the same data fetching hook used in SKU chart
    const {
        data,
        isLoading,
        error
    } = useSkuPerformanceHistoricalData({
        year: "2025",
        quarter: "Q1"
    });

    // Process the data to get SKU percentages
    const pieData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Aggregate all SKU data across the time period
        const skuTotals = new Map<string, { revenue: number, name: string }>();
        let totalRevenue = 0;

        data.forEach(monthData => {
            if (monthData.data) {
                monthData.data.forEach(skuData => {
                    if (skuData.sku && skuData.revenue) {
                        const current = skuTotals.get(skuData.sku) || { revenue: 0, name: skuData.name || '' };
                        current.revenue += skuData.revenue;
                        skuTotals.set(skuData.sku, current);
                        totalRevenue += skuData.revenue;
                    }
                });
            }
        });

        // Convert to percentage-based pie chart data
        const colors = ['#4361ee', '#a5def1', '#f4a5ae', '#ffcb77', '#a3d8f4',
            '#b5e48c', '#d3bbdd', '#ff9b85', '#d4a373', '#588157'];

        return Array.from(skuTotals.entries())
            .map(([sku, data], index) => ({
                name: data.name,
                value: (data.revenue / totalRevenue) * 100, // Convert to percentage
                color: colors[index % colors.length]
            }))
            .sort((a, b) => b.value - a.value); // Sort by percentage in descending order
    }, [data]);

    const handleDateChange = (value: DateRange | undefined) => {
        if (value) {
            setDate({
                from: value.from ?? new Date(),
                to: value.to ?? new Date()
            });
        }
    };

    // if (isLoading) {
    //     return <div>Loading...</div>;
    // }

    // if (error) {
    //     return <div>Error loading data</div>;
    // }

    return (
        <Card className="w-full shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
                <CardTitle >
                    <div className="flex flex-col gap-1">
                        <p className="text-xl font-bold">SKU Distribution</p>
                        <p className="text-muted-foreground text-sm font-normal">
                            {date.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                            ) : "Select date range"}
                        </p>
                    </div>
                </CardTitle>

                {/* <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-9 border-dashed"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-2 h-4 w-4"
                            >
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                                <line x1="16" x2="16" y1="2" y2="6"></line>
                                <line x1="8" x2="8" y1="2" y2="6"></line>
                                <line x1="3" x2="21" y1="10" y2="10"></line>
                            </svg>
                            {date.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                            ) : (
                                "Select date range"
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date.from}
                            selected={date}
                            onSelect={(value) => handleDateChange(value)}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover> */}
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, percent, sku }) =>
                                    `${name} (${(percent * 100).toFixed(1)}%)`
                                }
                                outerRadius={150}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Percentage']}
                                contentStyle={{
                                    borderRadius: '6px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default SkuPieChart;