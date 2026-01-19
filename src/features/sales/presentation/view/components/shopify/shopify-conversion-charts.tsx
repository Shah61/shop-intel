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
import { useConversionRateHistoricalData } from "../../../tanstack/mock-shopify-tanstack"
import { capitalizeFirstLetter, formatCurrencyToShort, isAdmin } from "@/src/core/constant/helper"
import { useSession } from "@/src/core/lib/dummy-session-provider"

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
    revenue: {
        label: "Revenue",
        color: "#008060", // Shopify green
    },
    orders: {
        label: "Orders",
        color: "#5C6AC4", // Shopify purple/indigo
    },
    conversion: {
        label: "Conversion",
        color: "#212B36", // Shopify ink (dark slate)
    },
} satisfies ChartConfig

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
                            {entry.name === "revenue" ? "RM" : ""} {formatCurrencyToShort(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export function ShopifyConversionCharts() {
    const [chartType, setChartType] = useState("bar")
    const [quarter, setQuarter] = useState("Q1")
    const [year, setYear] = useState(new Date().getFullYear())
    const { data: session } = useSession()
    const isUserAdmin = isAdmin(session?.user_entity || {})

    const years = [2023, 2024, 2025, 2026]

    const { data, isLoading, error } = useConversionRateHistoricalData(quarter, year.toString())

    const formattedData = data?.map((item: any) => ({
        date: new Date(item.date || "").toLocaleDateString('en-US', { month: 'short' }),
        revenue: item.total_revenues,
        orders: item.total_orders,
        conversion: item.total_conversions
    })) || []

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
                            content={<CustomTooltipContent />}
                            cursor={{ stroke: "hsl(var(--muted))", strokeWidth: 1, strokeDasharray: "3 3" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke={chartConfig.revenue.color}
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 0, fill: chartConfig.revenue.color }}
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
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig.revenue.color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartConfig.revenue.color} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig.orders.color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartConfig.orders.color} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig.conversion.color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartConfig.conversion.color} stopOpacity={0.1} />
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
                            dataKey="revenue"
                            stroke={chartConfig.revenue.color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
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
                            dataKey="revenue"
                            fill={chartConfig.revenue.color}
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
                            dataKey="revenue"
                            type="monotone"
                            fill={chartConfig.revenue.color}
                            fillOpacity={0.6}
                            stroke={chartConfig.revenue.color}
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
                    </AreaChart>
                )

            default:
                return (
                    <AreaChart data={formattedData}>
                        <Area dataKey="revenue" />
                        <Area dataKey="orders" />
                        <Area dataKey="conversion" />
                    </AreaChart>
                )
        }
    }

    return (
        <Card className="shadow-sm relative">
            <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <CardTitle className="text-lg font-bold">Shopify Conversion Metrics</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            {chartType === "line" ? "Line" :
                                chartType === "area" ? "Area" :
                                    chartType === "bar" ? "Bar" : "Stacked Area"} Chart showing visitors, orders, and conversion rates
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