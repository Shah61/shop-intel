"use client"

import { useState } from "react"
import {
    TrendingUp,
    BarChart3,
    LineChart as LineChartIcon,
    PieChart as PieChartIcon,
    ChevronDown
} from "lucide-react"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip
} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tabs,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AnalyticsSalesEntity, AnalyticsType } from "@/src/features/sales/data/model/analytics-entity"
import { capitalizeFirstLetter, formatCurrencyToShort } from "@/src/core/constant/helper"

const chartConfig = {
    tiktok: {
        label: "TikTok",
        color: "#FF0066",
    },
    shopee: {
        label: "Shopee",
        color: "#EE4D2D",
    },
    shopify: {
        label: "Shopify",
        color: "#22C55E",
    },
    physical: {
        label: "Physical",
        color: "#2D9CDB", // Light blue for physical
    },
} satisfies ChartConfig

interface TransformedData {
    month: string;
    tiktok: number;
    shopee: number;
    shopify: number;
    physical: number;
}

interface SalesOverviewChartProps {
    data: AnalyticsSalesEntity[];
    selectedYear: string;
    selectedQuarter: string;
    onYearChange: (year: string) => void;
    onQuarterChange: (quarter: string) => void;
    isAdmin?: boolean;
    isLoading?: boolean;
}

const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
        <div className="rounded-lg border bg-background p-2 shadow-sm w-[200px]">
            <div className="grid grid-cols-[1fr_auto] gap-2">
                <div className="flex flex-col">
                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                        {label}
                    </span>
                </div>
                <div className="flex flex-col"></div>
            </div>
            <div className="mt-2 flex flex-col gap-1">
                {payload.map((entry: any, index: number) => (
                    <div
                        key={`item-${index}`}
                        className="flex items-center justify-between gap-4 "
                    >
                        <div className="flex items-center gap-1">
                            <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className=" text-muted-foreground">
                                {capitalizeFirstLetter(entry.name)}
                            </span>
                        </div>
                        <span className="font-bold text-foreground">
                            RM {formatCurrencyToShort(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export function SalesOverviewChart({
    data,
    selectedYear,
    selectedQuarter,
    onYearChange,
    onQuarterChange,
    isAdmin = false,
    isLoading = false
}: SalesOverviewChartProps) {
    const [chartType, setChartType] = useState("bar")
    const [showControls, setShowControls] = useState(false)

    // Transform API data into chart format
    const transformData = (data: AnalyticsSalesEntity[]): TransformedData[] => {
        // Group data by date
        const groupedByDate = data.reduce((acc, curr) => {
            const date = curr.date || '';
            if (!acc[date]) {
                acc[date] = {
                    month: new Date(date).toLocaleString('default', { month: 'long' }),
                    tiktok: 0,
                    shopee: 0,
                    shopify: 0,
                    physical: 0
                };
            }

            // Map revenues to respective platforms
            if (curr.type && curr.total_revenues) {
                switch (curr.type) {
                    case AnalyticsType.TIKTOK:
                        acc[date].tiktok = curr.total_revenues;
                        break;
                    case AnalyticsType.SHOPEE:
                        acc[date].shopee = curr.total_revenues;
                        break;
                    case AnalyticsType.SHOPIFY:
                        acc[date].shopify = curr.total_revenues;
                        break;
                    case AnalyticsType.PHYSICAL:
                        acc[date].physical = curr.total_revenues;
                        break;
                }
            }
            return acc;
        }, {} as Record<string, TransformedData>);

        // Convert to array and sort by date
        return Object.values(groupedByDate)
            .sort((a, b) => {
                const monthA = new Date(Date.parse(a.month + " 1, 2024"));
                const monthB = new Date(Date.parse(b.month + " 1, 2024"));
                return monthA.getTime() - monthB.getTime();
            });
    };

    const chartData = transformData(data);

    const chartTypes = {
        line: "Line Chart",
        area: "Area Chart",
        bar: "Bar Chart",
        stackedArea: "Stacked Area"
    }

    const renderChart = () => {
        switch (chartType) {
            case "line":
                return (
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 10,
                            left: 10,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip
                            content={<CustomTooltipContent />}
                            cursor={{ stroke: "hsl(var(--muted))", strokeWidth: 1, strokeDasharray: "3 3" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="tiktok"
                            stroke={chartConfig.tiktok.color}
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 0, fill: chartConfig.tiktok.color }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="shopee"
                            stroke={chartConfig.shopee.color}
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 0, fill: chartConfig.shopee.color }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="shopify"
                            stroke={chartConfig.shopify.color}
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 0, fill: chartConfig.shopify.color }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="physical"
                            stroke={chartConfig.physical.color}
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 0, fill: chartConfig.physical.color }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                )

            case "area":
                return (
                    <AreaChart
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 10,
                            left: 10,
                            bottom: 5,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorTiktok" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig.tiktok.color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartConfig.tiktok.color} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorShopee" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig.shopee.color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartConfig.shopee.color} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorShopify" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig.shopify.color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartConfig.shopify.color} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorPhysical" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig.physical.color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartConfig.physical.color} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip
                            content={<CustomTooltipContent />}
                            cursor={{ stroke: "hsl(var(--muted))", strokeWidth: 1, strokeDasharray: "3 3" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="tiktok"
                            stroke={chartConfig.tiktok.color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorTiktok)"
                        />
                        <Area
                            type="monotone"
                            dataKey="shopee"
                            stroke={chartConfig.shopee.color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorShopee)"
                        />
                        <Area
                            type="monotone"
                            dataKey="shopify"
                            stroke={chartConfig.shopify.color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorShopify)"
                        />
                        <Area
                            type="monotone"
                            dataKey="physical"
                            stroke={chartConfig.physical.color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorPhysical)"
                        />
                    </AreaChart>
                )

            case "bar":
                return (
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 10,
                            left: 10,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip
                            content={<CustomTooltipContent />}
                            cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                        />
                        <Bar
                            dataKey="tiktok"
                            fill={chartConfig.tiktok.color}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        />
                        <Bar
                            dataKey="shopee"
                            fill={chartConfig.shopee.color}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        />
                        <Bar
                            dataKey="shopify"
                            fill={chartConfig.shopify.color}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        />
                        <Bar
                            dataKey="physical"
                            fill={chartConfig.physical.color}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        />
                    </BarChart>
                )

            case "stackedArea":
                return (
                    <AreaChart
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 10,
                            left: 10,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip
                            content={<CustomTooltipContent />}
                            cursor={{ stroke: "hsl(var(--muted))", strokeWidth: 1, strokeDasharray: "3 3" }}
                        />
                        <Area
                            dataKey="tiktok"
                            type="monotone"
                            fill={chartConfig.tiktok.color}
                            fillOpacity={0.6}
                            stroke={chartConfig.tiktok.color}
                            stackId="1"
                        />
                        <Area
                            dataKey="shopee"
                            type="monotone"
                            fill={chartConfig.shopee.color}
                            fillOpacity={0.6}
                            stroke={chartConfig.shopee.color}
                            stackId="1"
                        />
                        <Area
                            dataKey="shopify"
                            type="monotone"
                            fill={chartConfig.shopify.color}
                            fillOpacity={0.6}
                            stroke={chartConfig.shopify.color}
                            stackId="1"
                        />
                        <Area
                            dataKey="physical"
                            type="monotone"
                            fill={chartConfig.physical.color}
                            fillOpacity={0.6}
                            stroke={chartConfig.physical.color}
                            stackId="1"
                        />
                    </AreaChart>
                )

            default:
                return (
                    <AreaChart data={chartData}>
                        <Area dataKey="tiktok" />
                        <Area dataKey="shopee" />
                        <Area dataKey="shopify" />
                        <Area dataKey="physical" />
                    </AreaChart>
                )
        }
    }

    const years = ["2023", "2024", "2025"]
    const quarters = ["Q1", "Q2", "Q3", "Q4"]

    return (
        <Card className="shadow-sm relative">
            {isLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <p className="text-sm text-muted-foreground">Loading chart data...</p>
                    </div>
                </div>
            )}
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-medium">Sales by Platform</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            {chartTypes[chartType as keyof typeof chartTypes]} showing sales from different channels
                        </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Tabs
                            value={chartType}
                            onValueChange={setChartType}
                            className="hidden md:block"
                        >
                            <TabsList className="h-8">
                                <TabsTrigger value="line" className="h-7 px-3">
                                    <LineChartIcon className="h-3.5 w-3.5 mr-1" />
                                    <span className="hidden md:inline-block">Line</span>
                                </TabsTrigger>
                                <TabsTrigger value="area" className="h-7 px-3">
                                    <TrendingUp className="h-3.5 w-3.5 mr-1" />
                                    <span className="hidden md:inline-block">Area</span>
                                </TabsTrigger>
                                <TabsTrigger value="bar" className="h-7 px-3">
                                    <BarChart3 className="h-3.5 w-3.5 mr-1" />
                                    <span className="hidden md:inline-block">Bar</span>
                                </TabsTrigger>
                                <TabsTrigger value="stackedArea" className="h-7 px-3">
                                    <PieChartIcon className="h-3.5 w-3.5 mr-1" />
                                    <span className="hidden md:inline-block">Stacked</span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {/* Year Selection */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                    {selectedYear}
                                    <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {years.map((year) => (
                                    <DropdownMenuItem
                                        key={year}
                                        onClick={() => onYearChange(year)}
                                    >
                                        {year}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Quarter Selection */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                    {selectedQuarter}
                                    <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {quarters.map((quarter) => (
                                    <DropdownMenuItem
                                        key={quarter}
                                        onClick={() => onQuarterChange(quarter)}
                                    >
                                        {quarter}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Mobile chart selector */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild className="md:hidden">
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                    {chartType === 'line' && <LineChartIcon className="h-4 w-4" />}
                                    {chartType === 'area' && <TrendingUp className="h-4 w-4" />}
                                    {chartType === 'bar' && <BarChart3 className="h-4 w-4" />}
                                    {chartType === 'stackedArea' && <PieChartIcon className="h-4 w-4" />}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setChartType("line")}>
                                    <LineChartIcon className="h-4 w-4 mr-2" />
                                    Line Chart
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setChartType("area")}>
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    Area Chart
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setChartType("bar")}>
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Bar Chart
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setChartType("stackedArea")}>
                                    <PieChartIcon className="h-4 w-4 mr-2" />
                                    Stacked Area
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ChartContainer config={chartConfig} className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {renderChart()}
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    )
}