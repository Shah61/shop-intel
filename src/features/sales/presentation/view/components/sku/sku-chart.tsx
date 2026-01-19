"use client"

import { useState, useMemo } from "react"
import {
    TrendingUp,
    LineChart as LineChartIcon,
    ChevronDown,
    BarChart as BarChartIcon
} from "lucide-react"
import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    Legend,
    Bar,
    BarChart
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
import { AnalysisSKUEntity, SkuPerformanceHistoricalDataEntity } from "@/src/features/sales/data/model/analytics-entity"
import { useSkuPerformanceHistoricalData } from "../../../tanstack/analytics-tanstack"



interface SKUPerformanceEntity {
    sku: AnalysisSKUEntity;
    color: string;
}


// // Sample SKU data
// const skuData: SkuEntity[] = [
//     { id: 'NBSS030', name: 'NBSS 030', sales: 63064.61, percentage: 14.2, color: '#4CAF50' },
//     { id: 'NBBFSMIST', name: 'NBBFSMist', sales: 61961.55, percentage: 13.9, color: '#2196F3' },
//     { id: 'NBFMB', name: 'NBFMB', sales: 53590.55, percentage: 12.1, color: '#9C27B0' },
//     { id: 'NBFSMIST', name: 'NBFSMist', sales: 45843.09, percentage: 10.3, color: '#FF9800' },
//     { id: 'NBM100', name: 'NBM 100', sales: 45817.7, percentage: 10.3, color: '#F44336' },
//     { id: 'NBSFS', name: 'NBSFS', sales: 43595.76, percentage: 9.8, color: '#E91E63' },
//     { id: 'NBM003_15', name: '15 NBM 003', sales: 25713.18, percentage: 5.8, color: '#673AB7' },
//     { id: 'NBSFSMIST', name: 'NBSFSMist', sales: 20402.35, percentage: 4.6, color: '#00BCD4' },
//     { id: 'NBM003', name: 'NBM 003', sales: 6324.31, percentage: 1.4, color: '#795548' },
// ]

// // Create quarterly data using all SKUs with some realistic growth patterns
// const generateQuarterlyData = () => {
//     // Calculate base monthly values (roughly 1/12 of annual sales)
//     const baseValues: BaseValues = {};

//     skuData.forEach(sku => {
//         baseValues[sku.name] = Math.round(sku.sales / 12);
//     });

//     // Create a month template
//     const createMonthData = (multipliers: MonthMultipliers): MonthData => {
//         const monthData: MonthData = { month: multipliers.month };

//         skuData.forEach(sku => {
//             const multiplier = multipliers[sku.id] as number;
//             monthData[sku.name] = Math.round(baseValues[sku.name] * multiplier);
//         });

//         return monthData;
//     };

//     // Generate data with some realistic variations
//     return {
//         "Q1 2025": [
//             createMonthData({
//                 month: "January",
//                 NBSS030: 0.95, NBBFSMIST: 0.97, NBFMB: 0.94, NBFSMIST: 0.96,
//                 NBM100: 0.93, NBSFS: 0.92, NBM003_15: 0.95, NBSFSMIST: 0.96, NBM003: 0.94
//             }),
//             createMonthData({
//                 month: "February",
//                 NBSS030: 1.02, NBBFSMIST: 1.0, NBFMB: 1.01, NBFSMIST: 0.99,
//                 NBM100: 1.0, NBSFS: 1.02, NBM003_15: 1.01, NBSFSMIST: 0.98, NBM003: 1.03
//             }),
//             createMonthData({
//                 month: "March",
//                 NBSS030: 1.05, NBBFSMIST: 1.03, NBFMB: 1.04, NBFSMIST: 1.06,
//                 NBM100: 1.04, NBSFS: 1.05, NBM003_15: 1.03, NBSFSMIST: 1.02, NBM003: 1.04
//             }),
//         ],
//         "Q2 2025": [
//             createMonthData({
//                 month: "April",
//                 NBSS030: 1.08, NBBFSMIST: 1.05, NBFMB: 1.07, NBFSMIST: 1.09,
//                 NBM100: 1.06, NBSFS: 1.08, NBM003_15: 1.05, NBSFSMIST: 1.04, NBM003: 1.07
//             }),
//             createMonthData({
//                 month: "May",
//                 NBSS030: 1.1, NBBFSMIST: 1.08, NBFMB: 1.09, NBFSMIST: 1.11,
//                 NBM100: 1.08, NBSFS: 1.1, NBM003_15: 1.07, NBSFSMIST: 1.06, NBM003: 1.09
//             }),
//             createMonthData({
//                 month: "June",
//                 NBSS030: 1.15, NBBFSMIST: 1.12, NBFMB: 1.14, NBFSMIST: 1.16,
//                 NBM100: 1.13, NBSFS: 1.15, NBM003_15: 1.12, NBSFSMIST: 1.1, NBM003: 1.14
//             }),
//         ],
//         "Q3 2025": [
//             createMonthData({
//                 month: "July",
//                 NBSS030: 1.18, NBBFSMIST: 1.15, NBFMB: 1.16, NBFSMIST: 1.19,
//                 NBM100: 1.16, NBSFS: 1.18, NBM003_15: 1.14, NBSFSMIST: 1.12, NBM003: 1.16
//             }),
//             createMonthData({
//                 month: "August",
//                 NBSS030: 1.2, NBBFSMIST: 1.18, NBFMB: 1.19, NBFSMIST: 1.21,
//                 NBM100: 1.18, NBSFS: 1.2, NBM003_15: 1.16, NBSFSMIST: 1.14, NBM003: 1.18
//             }),
//             createMonthData({
//                 month: "September",
//                 NBSS030: 1.25, NBBFSMIST: 1.2, NBFMB: 1.22, NBFSMIST: 1.26,
//                 NBM100: 1.23, NBSFS: 1.25, NBM003_15: 1.21, NBSFSMIST: 1.19, NBM003: 1.23
//             }),
//         ],
//         "Q4 2025": [
//             createMonthData({
//                 month: "October",
//                 NBSS030: 1.3, NBBFSMIST: 1.25, NBFMB: 1.28, NBFSMIST: 1.31,
//                 NBM100: 1.27, NBSFS: 1.29, NBM003_15: 1.24, NBSFSMIST: 1.22, NBM003: 1.26
//             }),
//             createMonthData({
//                 month: "November",
//                 NBSS030: 1.35, NBBFSMIST: 1.3, NBFMB: 1.32, NBFSMIST: 1.36,
//                 NBM100: 1.33, NBSFS: 1.35, NBM003_15: 1.29, NBSFSMIST: 1.27, NBM003: 1.31
//             }),
//             createMonthData({
//                 month: "December",
//                 NBSS030: 1.45, NBBFSMIST: 1.4, NBFMB: 1.42, NBFSMIST: 1.46,
//                 NBM100: 1.43, NBSFS: 1.44, NBM003_15: 1.38, NBSFSMIST: 1.36, NBM003: 1.4
//             }),
//         ],
//     };
// };

// const quarterlyData = generateQuarterlyData();

// Define the type for chart config
interface ExtendedChartConfig extends ChartConfig {
    [key: string]: {
        label: string;
        color: string;
    };
}

// // Generate chart config dynamically from all SKU data
// const generateChartConfig = (): ExtendedChartConfig => {
//     const config: ExtendedChartConfig = {};

//     // Use all SKUs
//     skuData.forEach(sku => {
//         config[sku.name] = {
//             label: sku.name,
//             color: sku.color
//         };
//     });

//     return config;
// };

// const chartConfig = generateChartConfig();

export function SKUPerformanceChart() {
    const [chartType, setChartType] = useState<"line" | "area" | "bar">("bar")
    const [viewMode, setViewMode] = useState("monthly")
    const [selectedQuarter, setSelectedQuarter] = useState("Q1")
    const [selectedYear, setSelectedYear] = useState("2025")

    const {
        data,
        isLoading,
        error
    } = useSkuPerformanceHistoricalData({
        year: selectedYear,
        quarter: selectedQuarter
    })

    // Available options
    const quarters = ["Q1", "Q2", "Q3", "Q4"]
    const years = ["2023", "2024", "2025"]

    // Process the data to get available months and generate SKU data
    const { monthlyData, skuEntities } = useMemo(() => {
        const processedMonthlyData: { [key: string]: any } = {};
        const skuMap = new Map<string, SKUPerformanceEntity>();
        const colors = ['#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#F44336', '#E91E63', '#673AB7', '#00BCD4', '#795548'];
        let colorIndex = 0;

        // First, collect all unique SKUs from the data
        data?.forEach(monthData => {
            if (monthData.data) {
                monthData.data.forEach(skuData => {
                    if (skuData.sku && !skuMap.has(skuData.sku)) {
                        skuMap.set(skuData.sku, {
                            sku: {
                                sku: skuData.sku,
                                name: skuData.name,
                                quantity: skuData.quantity,
                                revenue: skuData.revenue,
                                product_id: skuData.product_id,
                                variant_id: skuData.variant_id,
                                quantity_percentage: skuData.quantity_percentage,
                                revenue_percentage: skuData.revenue_percentage,
                                image: skuData.image,
                                variant_title: skuData.variant_title,
                                type: skuData.type,
                                created_at: skuData.created_at
                            },
                            color: colors[colorIndex % colors.length]
                        });
                        colorIndex++;
                    }
                });
            }
        });

        // Then process monthly data, ensuring all SKUs are represented in each month
        data?.forEach(monthData => {
            if (monthData.date) {
                const date = new Date(monthData.date);
                const monthKey = date.toLocaleString('default', { month: 'long' });

                // Initialize the month with all SKUs set to 0
                processedMonthlyData[monthKey] = {
                    month: monthKey,
                    ...Array.from(skuMap.values()).reduce((acc, skuEntity) => ({
                        ...acc,
                        [skuEntity.sku.name || '']: 0
                    }), {})
                };

                // Update with actual values if they exist
                if (monthData.data) {
                    monthData.data.forEach(skuData => {
                        if (skuData.sku && skuData.name && skuData.revenue) {
                            processedMonthlyData[monthKey][skuData.name] = skuData.revenue;

                            // Update total revenue in skuMap
                            const existingSkuEntity = skuMap.get(skuData.sku);
                            if (existingSkuEntity) {
                                existingSkuEntity.sku.revenue = skuData.revenue;
                                existingSkuEntity.sku.revenue_percentage = skuData.revenue_percentage;
                            }
                        }
                    });
                }
            }
        });

        return {
            monthlyData: Object.values(processedMonthlyData),
            skuEntities: Array.from(skuMap.values())
        };
    }, [data]);

    // Generate chart config from SKU entities
    const chartConfig = useMemo(() => {
        const config: ExtendedChartConfig = {};
        skuEntities.forEach(skuEntity => {
            config[skuEntity.sku.name || ''] = {
                label: skuEntity.sku.sku || '',
                color: skuEntity.color
            };
        });
        return config;
    }, [skuEntities]);

    // Get the current month/quarter for the timeframe
    const currentTimeFrame = useMemo(() => {
        if (data && data.length > 0 && data[0].date) {
            const date = new Date(data[0].date);
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            return `Q${quarter} ${date.getFullYear()}`;
        }
        return "Current Period";
    }, [data]);

    const [timeFrame, setTimeFrame] = useState(currentTimeFrame)

    const chartData = viewMode === "monthly" ? monthlyData : skuEntities;

    const chartTypes = {
        line: "Line Chart",
        area: "Area Chart",
        bar: "Bar Chart"
    }

    const renderMonthlyChart = () => {
        switch (chartType) {
            case "bar":
                return (
                    <BarChart
                        data={monthlyData}
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
                            content={<ChartTooltipContent indicator="dot" />}
                            cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                        />
                        <Legend />
                        {skuEntities.map((skuEntity) => (
                            <Bar
                                key={skuEntity.sku.sku}
                                dataKey={skuEntity.sku.name || ''}
                                fill={skuEntity.color}
                                name={skuEntity.sku.sku || ''}
                                radius={[4, 4, 0, 0]}
                            />
                        ))}
                    </BarChart>
                );

            case "line":
                return (
                    <LineChart
                        data={monthlyData}
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
                            content={<ChartTooltipContent indicator="dot" />}
                            cursor={{ stroke: "hsl(var(--muted))", strokeWidth: 1, strokeDasharray: "3 3" }}
                        />
                        <Legend />
                        {skuEntities.map((skuEntity) => (
                            <Line
                                key={skuEntity.sku.sku}
                                type="monotone"
                                dataKey={skuEntity.sku.name || ''}
                                stroke={skuEntity.color}
                                strokeWidth={2}
                                dot={{ r: 3, strokeWidth: 0, fill: skuEntity.color }}
                                activeDot={{ r: 5, strokeWidth: 0 }}
                                name={skuEntity.sku.sku || ''}
                            />
                        ))}
                    </LineChart>
                );

            case "area":
            default:
                return (
                    <AreaChart
                        data={monthlyData}
                        margin={{
                            top: 5,
                            right: 10,
                            left: 10,
                            bottom: 5,
                        }}
                    >
                        <defs>
                            {skuEntities.map((skuEntity) => (
                                <linearGradient
                                    key={skuEntity.sku.sku}
                                    id={`color${skuEntity.sku.sku}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop offset="5%" stopColor={skuEntity.color} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={skuEntity.color} stopOpacity={0.1} />
                                </linearGradient>
                            ))}
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
                            content={<ChartTooltipContent indicator="dot" />}
                            cursor={{ stroke: "hsl(var(--muted))", strokeWidth: 1, strokeDasharray: "3 3" }}
                        />
                        <Legend />
                        {skuEntities.map((skuEntity) => (
                            <Area
                                key={skuEntity.sku.sku}
                                type="monotone"
                                dataKey={skuEntity.sku.name || ''}
                                stroke={skuEntity.color}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill={`url(#color${skuEntity.sku.sku})`}
                                name={skuEntity.sku.sku || ''}
                            />
                        ))}
                    </AreaChart>
                );
        }
    }

    // Render aggregate chart - create a properly typed version
    const renderAggregateChart = () => {
        // Create aggregate data with proper types
        const aggregateData = [{
            name: 'Sales',
            ...skuEntities.reduce<Record<string, number>>((acc, skuEntity) => {
                acc[skuEntity.sku.name || ''] = skuEntity.sku.revenue || 0;
                return acc;
            }, {})
        }];

        return (
            <LineChart
                data={aggregateData}
                margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 5,
                }}
                layout="vertical"
            >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    width={100}
                />
                <Tooltip
                    content={<ChartTooltipContent />}
                    cursor={{ stroke: "hsl(var(--muted))", strokeWidth: 1, strokeDasharray: "3 3" }}
                    formatter={(value) => new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0
                    }).format(value as number)}
                />
                <Legend />
                {skuEntities.map((skuEntity) => (
                    <Line
                        key={skuEntity.sku.sku}
                        type="monotone"
                        dataKey={skuEntity.sku.name || ''}
                        stroke={skuEntity.color}
                        strokeWidth={2}
                        dot={{ r: 4, strokeWidth: 0, fill: skuEntity.color }}
                    />
                ))}
            </LineChart>
        );
    }

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-y-0">
                    <div>
                        <CardTitle className="text-lg font-medium">All SKUs Performance</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            {viewMode === "monthly"
                                ? `${chartTypes[chartType]} showing monthly sales trends for all SKUs`
                                : `Aggregate sales comparison across all SKUs`}
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Chart Type Selector - Desktop */}
                        {viewMode === "monthly" && (
                            <Tabs
                                value={chartType}
                                onValueChange={(value) => setChartType(value as typeof chartType)}
                                className="hidden md:block"
                            >
                                <TabsList className="h-8">
                                    <TabsTrigger value="line" className="h-7 px-3">
                                        <LineChartIcon className="h-3.5 w-3.5 mr-1" />
                                        <span className="hidden md:inline-block">Line</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="bar" className="h-7 px-3">
                                        <BarChartIcon className="h-3.5 w-3.5 mr-1" />
                                        <span className="hidden md:inline-block">Bar</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="area" className="h-7 px-3">
                                        <TrendingUp className="h-3.5 w-3.5 mr-1" />
                                        <span className="hidden md:inline-block">Area</span>
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        )}

                        {/* View Mode and Time Period Controls */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* View Mode Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 w-full sm:w-auto">
                                        {viewMode === "monthly" ? "Monthly View" : "Aggregate View"}
                                        <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[200px]">
                                    <DropdownMenuItem onClick={() => setViewMode("monthly")}>
                                        Monthly View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setViewMode("aggregate")}>
                                        Aggregate View
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Time Period Controls - Only show in monthly view */}
                            {viewMode === "monthly" && (
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Quarter Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-8">
                                                {selectedQuarter}
                                                <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[100px]">
                                            {quarters.map((quarter) => (
                                                <DropdownMenuItem
                                                    key={quarter}
                                                    onClick={() => {
                                                        setSelectedQuarter(quarter);
                                                        setTimeFrame(`${quarter} ${selectedYear}`);
                                                    }}
                                                >
                                                    {quarter}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Year Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-8">
                                                {selectedYear}
                                                <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[100px]">
                                            {years.map((year) => (
                                                <DropdownMenuItem
                                                    key={year}
                                                    onClick={() => {
                                                        setSelectedYear(year);
                                                        setTimeFrame(`${selectedQuarter} ${year}`);
                                                    }}
                                                >
                                                    {year}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}

                            {/* Chart Type Selector - Mobile */}
                            {viewMode === "monthly" && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild className="md:hidden">
                                        <Button variant="outline" size="sm" className="h-8 w-8 px-0">
                                            {chartType === 'line' && <LineChartIcon className="h-4 w-4" />}
                                            {chartType === 'bar' && <BarChartIcon className="h-4 w-4" />}
                                            {chartType === 'area' && <TrendingUp className="h-4 w-4" />}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[150px]">
                                        <DropdownMenuItem onClick={() => setChartType("line")}>
                                            <LineChartIcon className="h-4 w-4 mr-2" />
                                            Line Chart
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setChartType("bar")}>
                                            <BarChartIcon className="h-4 w-4 mr-2" />
                                            Bar Chart
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setChartType("area")}>
                                            <TrendingUp className="h-4 w-4 mr-2" />
                                            Area Chart
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full min-w-0">
                    <ChartContainer config={chartConfig} className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {viewMode === "monthly" ? renderMonthlyChart() : renderAggregateChart()}
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export default SKUPerformanceChart