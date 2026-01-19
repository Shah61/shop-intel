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
import { tiktokConversionRateHistoricalDataQuery } from "../../../tanstack/mock-tiktok-tanstack"
import { useSession } from "@/src/core/lib/dummy-session-provider"
import { capitalizeFirstLetter, formatCurrencyToShort, isAdmin } from "@/src/core/constant/helper"

const chartConfig = {
    total_revenues: {
        label: "Total Revenue",
        color: "#1AC0BB", // Tiktok teal
    },
    total_gross_revenues: {
        label: "Gross Revenue",
        color: "#E6173D", // Tiktok red
    },
    total_orders: {
        label: "Orders",
        color: "#333333", // Dark gray
    },
} satisfies ChartConfig

const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    const formatLabel = (name: string) => {
        switch (name) {
            case "total_revenues":
                return "Revenues";
            case "total_gross_revenues":
                return "Gross";
            case "total_orders":
                return "Orders";
            default:
                return capitalizeFirstLetter(name);
        }
    };

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
                            <span className="text-muted-foreground">
                                {formatLabel(entry.name)}
                            </span>
                        </div>
                        <span className="font-bold text-foreground">
                            {entry.name.includes('revenue') ? 'RM ' : ''}
                            {formatCurrencyToShort(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export function TiktokConversionCharts() {
    const [chartType, setChartType] = useState("bar")
    const [quarter, setQuarter] = useState("Q1")
    const [year, setYear] = useState(new Date().getFullYear())
    const { data: session } = useSession()
    const isUserAdmin = isAdmin(session?.user_entity || {})

    const years = [2023, 2024, 2025, 2026]

    const {
        data: conversionRateHistoricalData,
        isLoading,
        error
    } = tiktokConversionRateHistoricalDataQuery({
        quarter,
        year: year.toString()
    });

    const formattedData = conversionRateHistoricalData?.map((item: any) => ({
        date: new Date(item.date || "").toLocaleDateString('en-US', { month: 'short' }),
        total_revenues: item.total_revenues,
        total_gross_revenues: item.total_gross_revenues,
        total_orders: item.total_orders
    })) || []

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
                            content={<CustomTooltipContent />}
                            cursor={{ stroke: "hsl(var(--muted))", strokeWidth: 1, strokeDasharray: "3 3" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="total_revenues"
                            stroke={chartConfig.total_revenues.color}
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 0, fill: chartConfig.total_revenues.color }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="total_gross_revenues"
                            stroke={chartConfig.total_gross_revenues.color}
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 0, fill: chartConfig.total_gross_revenues.color }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="total_orders"
                            stroke={chartConfig.total_orders.color}
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 0, fill: chartConfig.total_orders.color }}
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
                            <linearGradient id="colorTotalRevenues" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig.total_revenues.color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartConfig.total_revenues.color} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorGrossRevenues" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig.total_gross_revenues.color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartConfig.total_gross_revenues.color} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig.total_orders.color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartConfig.total_orders.color} stopOpacity={0.1} />
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
                            content={<CustomTooltipContent />}
                            cursor={{ stroke: "hsl(var(--muted))", strokeWidth: 1, strokeDasharray: "3 3" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="total_revenues"
                            stroke={chartConfig.total_revenues.color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorTotalRevenues)"
                        />
                        <Area
                            type="monotone"
                            dataKey="total_gross_revenues"
                            stroke={chartConfig.total_gross_revenues.color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorGrossRevenues)"
                        />
                        <Area
                            type="monotone"
                            dataKey="total_orders"
                            stroke={chartConfig.total_orders.color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorOrders)"
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
                            content={<CustomTooltipContent />}
                            cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                        />
                        <Bar
                            dataKey="total_revenues"
                            fill={chartConfig.total_revenues.color}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        />
                        <Bar
                            dataKey="total_gross_revenues"
                            fill={chartConfig.total_gross_revenues.color}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        />
                        <Bar
                            dataKey="total_orders"
                            fill={chartConfig.total_orders.color}
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
                            content={<CustomTooltipContent />}
                            cursor={{ stroke: "hsl(var(--muted))", strokeWidth: 1, strokeDasharray: "3 3" }}
                        />
                        <Area
                            dataKey="total_revenues"
                            type="monotone"
                            fill={chartConfig.total_revenues.color}
                            fillOpacity={0.6}
                            stroke={chartConfig.total_revenues.color}
                            stackId="1"
                        />
                        <Area
                            dataKey="total_gross_revenues"
                            type="monotone"
                            fill={chartConfig.total_gross_revenues.color}
                            fillOpacity={0.6}
                            stroke={chartConfig.total_gross_revenues.color}
                            stackId="1"
                        />
                        <Area
                            dataKey="total_orders"
                            type="monotone"
                            fill={chartConfig.total_orders.color}
                            fillOpacity={0.6}
                            stroke={chartConfig.total_orders.color}
                            stackId="1"
                        />
                    </AreaChart>
                )

            default:
                return (
                    <AreaChart data={formattedData}>
                        <Area dataKey="total_revenues" />
                        <Area dataKey="total_gross_revenues" />
                        <Area dataKey="total_orders" />
                    </AreaChart>
                )
        }
    }

    return (
        <Card className="shadow-sm relative">
            <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <CardTitle className="text-lg font-bold">Tiktok Conversion Metrics</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            {chartType === "line" ? "Line" :
                                chartType === "area" ? "Area" :
                                    chartType === "bar" ? "Bar" : "Stacked Area"} Chart showing total revenue, gross revenue, and total orders
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

                        {/* Chart type selector */}
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