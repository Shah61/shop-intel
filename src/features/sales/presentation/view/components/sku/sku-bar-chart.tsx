"use client"
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChartTooltipContent } from '@/components/ui/chart';
import { AnalysisSKUEntity, SkuPerformanceDetailEntity } from '@/src/features/sales/data/model/analytics-entity';
import { all } from 'axios';

// Custom tooltip component styled to match the image
const CustomTooltip = ({ active, payload, label }: { active: boolean, payload: any, label: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background rounded-lg shadow-md p-2 border border-gray-100">
                <p className="font-medium text-xs mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={`item-${index}`} className="flex items-center gap-2 py-0.5">
                        <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-gray-600 text-xs">{entry.name}</span>
                        <span className="font-semibold ml-auto text-xs">{entry.value.toFixed(2)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const SkuBarChart = ({
    skuData,
    allSKU,
    selectedSku,
    setSelectedSku
}: {
    skuData: SkuPerformanceDetailEntity[]
    allSKU: AnalysisSKUEntity[]
    selectedSku: string
    setSelectedSku: (sku: string) => void
}) => {
    const [open, setOpen] = useState(false);
    const [barColor, setBarColor] = useState('orange'); // 'orange' or 'green'

    // Transform API data for the chart
    const transformedData = skuData.map(item => ({
        date: item.date ? new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
        }) : '',
        revenue: item.data?.revenue || 0,
        quantity: item.data?.quantity || 0,
        name: item.data?.name || '',
        sku: item.data?.sku || ''
    }));

    // Color mapping as a regular object without type issues
    const colorMap = {
        orange: '#f97316', // Tailwind orange-500
        green: '#22c55e'   // Tailwind green-500
    };

    // Get the current color safely
    const currentColor = barColor === 'orange' ? colorMap.orange : colorMap.green;

    return (
        <Card className="w-full shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle >
                    <div>
                        <p className="text-xl font-bold">SKU Quantity by Month</p>
                        <p className="text-sm text-muted-foreground font-normal">Track your top performing SKUs</p>
                    </div>
                </CardTitle>
                <div className="flex items-center gap-3">

                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-[200px] justify-between"
                            >
                                {selectedSku
                                    ? allSKU.find((sku) => sku.sku === selectedSku)?.sku
                                    : "Select SKU..."}
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
                                    className="ml-2 h-4 w-4 shrink-0 opacity-50"
                                >
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                                <CommandInput placeholder="Search SKU..." />
                                <CommandEmpty>No results found.</CommandEmpty>
                                <CommandList>
                                    {allSKU.map((sku, index) => (
                                        <CommandItem
                                            key={index}
                                            value={sku.sku || ''}
                                            onSelect={() => {
                                                setSelectedSku(sku.sku || '');
                                                setOpen(false);
                                            }}
                                        >
                                            {sku.sku}
                                        </CommandItem>
                                    ))}
                                </CommandList>

                            </Command>

                        </PopoverContent>
                    </Popover>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={transformedData}
                            margin={{
                                top: 30,
                                right: 30,
                                left: 20,
                                bottom: 20,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[0, 'auto']} // Changed to auto-scale based on data
                                tickCount={5}
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                content={<CustomTooltip active={true} payload={transformedData} label={selectedSku} />}
                                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                            />
                            <Bar
                                dataKey="revenue"
                                name={selectedSku}
                                fill={currentColor}
                                radius={[4, 4, 0, 0]}
                                color={currentColor}
                            >
                                <LabelList
                                    dataKey="revenue"
                                    position="top"
                                    formatter={(value: number) => value.toFixed(2)}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default SkuBarChart;