"use client"

import { useMemo, useState } from "react"
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
import { shopifyOrdersHistoricalDataQuery } from "../../../tanstack/mock-shopify-tanstack"
import { useShopeeConversionRateHistoricalData } from "../../../tanstack/mock-shopee-tanstack"
import { useSession } from "@/src/core/lib/dummy-session-provider"
import { isAdmin } from "@/src/core/constant/helper"

// Monthly data for the entire year of 2024
const monthlyData2024 = [
    { month: "January", visitors: 186, orders: 80, conversion: 100 },
    { month: "February", visitors: 305, orders: 200, conversion: 100 },
    { month: "March", visitors: 237, orders: 120, conversion: 100 },
    { month: "April", visitors: 253, orders: 190, conversion: 100 },
    { month: "May", visitors: 209, orders: 130, conversion: 100 },
    { month: "June", visitors: 214, orders: 140, conversion: 105 },
    { month: "July", visitors: 258, orders: 160, conversion: 120 },
    { month: "August", visitors: 342, orders: 210, conversion: 135 },
    { month: "September", visitors: 370, orders: 230, conversion: 150 },
    { month: "October", visitors: 410, orders: 250, conversion: 180 },
    { month: "November", visitors: 470, orders: 290, conversion: 200 },
    { month: "December", visitors: 520, orders: 320, conversion: 230 },
]

// Data periods options
const dataPeriods = {
    "All 2024": monthlyData2024,
    "Q1 2024": monthlyData2024.slice(0, 3),
    "Q2 2024": monthlyData2024.slice(3, 6),
    "Q3 2024": monthlyData2024.slice(6, 9),
    "Q4 2024": monthlyData2024.slice(9, 12),
    "H1 2024": monthlyData2024.slice(0, 6),
    "H2 2024": monthlyData2024.slice(6, 12),
}




const chartConfig = {
    visitors: {
        label: "Visitors",
        color: "#FF6B35", // Bright coral orange - more visible
    },
    orders: {
        label: "Orders",
        color: "#FF8C42", // Warm orange - lighter variant
    },
    conversion: {
        label: "Conversion",
        color: "#D2691E", // Darker orange-brown for contrast
    },
    revenues: {
        label: "Revenues",
        color: "#FF4500", // Bold red-orange for emphasis
    },
} satisfies ChartConfig

export function ShopeeConversionCharts() {
    const [chartType, setChartType] = useState("bar")
    const [quarter, setQuarter] = useState("Q1")
    const [year, setYear] = useState(new Date().getFullYear())

    const years = [2023, 2024, 2025]

    const { data: session } = useSession()
    const isUserAdmin = isAdmin(session?.user_entity || {})



    // Generate dynamic dummy data based on quarter and year
    const generateDynamicData = (year: number, quarter: string) => {
        const quarterMonths = {
            "Q1": [0, 1, 2], // Jan, Feb, Mar
            "Q2": [3, 4, 5], // Apr, May, Jun
            "Q3": [6, 7, 8], // Jul, Aug, Sep
            "Q4": [9, 10, 11] // Oct, Nov, Dec
        };
        
        const months = quarterMonths[quarter as keyof typeof quarterMonths] || [0, 1, 2];
        const data: any[] = [];
        
        // Different base values for different quarters and years
        const yearMultiplier = year === 2023 ? 0.8 : year === 2025 ? 1.3 : 1.0;
        const quarterMultipliers = {
            "Q1": { visitors: 1.0, orders: 1.0, conversion: 1.0, revenue: 1.0 }, // Normal
            "Q2": { visitors: 1.2, orders: 1.1, conversion: 0.95, revenue: 1.1 }, // Growth
            "Q3": { visitors: 1.4, orders: 1.3, conversion: 0.9, revenue: 1.3 }, // Peak season
            "Q4": { visitors: 1.6, orders: 1.5, conversion: 0.85, revenue: 1.5 } // Holiday season
        };
        
        const multipliers = quarterMultipliers[quarter as keyof typeof quarterMultipliers] || quarterMultipliers.Q1;
        
        months.forEach((monthIndex, monthIdx) => {
            const monthName = new Date(year, monthIndex, 1).toLocaleDateString('en-US', { month: 'long' });
            const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
            
            // Generate data for each day of the month
            for (let day = 1; day <= Math.min(daysInMonth, 10); day++) { // Limit to 10 days per month for performance
                const date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                
                // Add some randomness and trends
                const dayVariation = 0.8 + (Math.sin(day / 3) * 0.4); // Daily variation
                const monthTrend = 1 + (monthIdx * 0.1); // Growing trend through quarter
                
                const baseVisitors = 2500 * yearMultiplier * multipliers.visitors * dayVariation * monthTrend;
                const baseOrders = 120 * yearMultiplier * multipliers.orders * dayVariation * monthTrend;
                const baseConversion = 0.048 * multipliers.conversion * (0.9 + Math.random() * 0.2);
                const baseRevenue = 6000 * yearMultiplier * multipliers.revenue * dayVariation * monthTrend;
                
                data.push({
                    date,
                    total_visitors: Math.round(baseVisitors + (Math.random() - 0.5) * 500),
                    total_orders: Math.round(baseOrders + (Math.random() - 0.5) * 30),
                    conversion_rate: Math.round(baseConversion * 1000) / 1000,
                    total_revenues: Math.round(baseRevenue + (Math.random() - 0.5) * 1000)
                });
            }
        });
        
        return data;
    };
    
    const data = generateDynamicData(year, quarter);
    const isLoading = false;

    // Format and filter data by quarter
    const getQuarterMonths = (q: string) => {
        switch (q) {
            case "Q1": return [0, 1, 2];
            case "Q2": return [3, 4, 5];
            case "Q3": return [6, 7, 8];
            case "Q4": return [9, 10, 11];
            default: return [0, 1, 2];
        }
    }

    const formattedData = useMemo(() => {
        if (!data) return [];

        return data
            .filter(item => {
                const itemDate = new Date(item.date);
                const monthIndex = itemDate.getMonth();
                return getQuarterMonths(quarter).includes(monthIndex);
            })
            .map(item => ({
                date: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
                visitors: item.total_visitors,
                orders: item.total_orders,
                conversion: Math.round(item.conversion_rate * 100), // Convert to percentage
                revenues: Math.round(item.total_revenues || 0) // Add revenues data
            }));
    }, [data, quarter]);

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
                        data={formattedData}
                        margin={{
                            top: 5,
                            right: 10,
                            left: 10,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="date"
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
                        <Line
                            type="monotone"
                            dataKey="visitors"
                            stroke={chartConfig.visitors.color}
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 0, fill: chartConfig.visitors.color }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="orders"
                            stroke={chartConfig.orders.color}
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 0, fill: chartConfig.orders.color }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="conversion"
                            stroke={chartConfig.conversion.color}
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 0, fill: chartConfig.conversion.color }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenues"
                            stroke={chartConfig.revenues.color}
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 0, fill: chartConfig.revenues.color }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                )

            case "area":
                return (
                    <AreaChart
                        data={formattedData}
                        margin={{
                            top: 5,
                            right: 10,
                            left: 10,
                            bottom: 5,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig.visitors.color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartConfig.visitors.color} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig.orders.color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartConfig.orders.color} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig.conversion.color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartConfig.conversion.color} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorRevenues" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig.revenues.color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartConfig.revenues.color} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="date"
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
                        <Area
                            type="monotone"
                            dataKey="visitors"
                            stroke={chartConfig.visitors.color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorVisitors)"
                        />
                        <Area
                            type="monotone"
                            dataKey="orders"
                            stroke={chartConfig.orders.color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorOrders)"
                        />
                        <Area
                            type="monotone"
                            dataKey="conversion"
                            stroke={chartConfig.conversion.color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorConversion)"
                        />
                        <Area
                            type="monotone"
                            dataKey="revenues"
                            stroke={chartConfig.revenues.color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorRevenues)"
                        />
                    </AreaChart>
                )

            case "bar":
                return (
                    <BarChart
                        data={formattedData}
                        margin={{
                            top: 5,
                            right: 10,
                            left: 10,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="date"
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
                        <Bar
                            dataKey="visitors"
                            fill={chartConfig.visitors.color}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        />
                        <Bar
                            dataKey="orders"
                            fill={chartConfig.orders.color}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        />
                        <Bar
                            dataKey="conversion"
                            fill={chartConfig.conversion.color}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        />
                        <Bar
                            dataKey="revenues"
                            fill={chartConfig.revenues.color}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        />
                    </BarChart>
                )

            case "stackedArea":
                return (
                    <AreaChart
                        data={formattedData}
                        margin={{
                            top: 5,
                            right: 10,
                            left: 10,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="date"
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
                        <Area
                            dataKey="visitors"
                            type="monotone"
                            fill={chartConfig.visitors.color}
                            fillOpacity={0.6}
                            stroke={chartConfig.visitors.color}
                            stackId="1"
                        />
                        <Area
                            dataKey="orders"
                            type="monotone"
                            fill={chartConfig.orders.color}
                            fillOpacity={0.6}
                            stroke={chartConfig.orders.color}
                            stackId="1"
                        />
                        <Area
                            dataKey="conversion"
                            type="monotone"
                            fill={chartConfig.conversion.color}
                            fillOpacity={0.6}
                            stroke={chartConfig.conversion.color}
                            stackId="1"
                        />
                        <Area
                            dataKey="revenues"
                            type="monotone"
                            fill={chartConfig.revenues.color}
                            fillOpacity={0.6}
                            stroke={chartConfig.revenues.color}
                            stackId="1"
                        />
                    </AreaChart>
                )

            default:
                return (
                    <AreaChart data={formattedData}>
                        <Area dataKey="visitors" />
                        <Area dataKey="orders" />
                        <Area dataKey="conversion" />
                        <Area dataKey="revenues" />
                    </AreaChart>
                )
        }
    }

    // Create options for custom tooltip
    const customTooltip = ({ active, payload, label }: { active: boolean, payload: any, label: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white rounded-lg shadow-md p-3 border border-gray-100">
                    <p className="font-medium text-base mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={`item-${index}`} className="flex items-center gap-2 py-0.5">
                            <div
                                className="w-3 h-3 rounded-sm"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-gray-600">{entry.name}</span>
                            <span className="font-semibold ml-auto">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <CardTitle className="text-lg font-bold">Shopee Conversion Metrics</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            {chartType === "line" ? "Line" :
                                chartType === "area" ? "Area" :
                                    chartType === "bar" ? "Bar" : "Stacked Area"} Chart showing visitors, orders, conversion rates, and revenues
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {/* Quarter selector */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                    {quarter}
                                    <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                                    <DropdownMenuItem key={q} onClick={() => setQuarter(q)}>
                                        {q}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Year selector */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                    {year}
                                    <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {years.map((y) => (
                                    <DropdownMenuItem key={y} onClick={() => setYear(y)}>
                                        {y}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Mobile chart selector */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
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