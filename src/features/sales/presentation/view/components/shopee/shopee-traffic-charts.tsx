"use client"

import { useState } from "react"
import {
    TrendingUp,
    BarChart3,
    LineChart as LineChartIcon,
    PieChart as PieChartIcon,
    ChevronDown,
    Calendar
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
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
    Tabs,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

// Define the TrafficEntity interface
export interface TrafficEntity {
    visitors: number;
    orders: number;
    conversionRate: number;
    date: string;
}

// Convert the original data to match the TrafficEntity interface
const createTrafficEntity = (month: string, visitors: number, orders: number, conversionRate: number, year: string): TrafficEntity => {
    // Create a date string in the format "YYYY-MM-DD" for the first day of the month
    const monthIndex = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(month);
    const date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;

    return {
        visitors,
        orders,
        conversionRate,
        date
    };
};

// Create quarterly data using the TrafficEntity interface
export const quarterlyData = {
    "Q1 2023": [
        createTrafficEntity("January", 150, 65, 85, "2023"),
        createTrafficEntity("February", 185, 78, 90, "2023"),
        createTrafficEntity("March", 205, 95, 95, "2023"),
    ],
    "Q2 2023": [
        createTrafficEntity("April", 220, 105, 90, "2023"),
        createTrafficEntity("May", 235, 120, 92, "2023"),
        createTrafficEntity("June", 250, 130, 95, "2023"),
    ],
    "Q3 2023": [
        createTrafficEntity("July", 270, 140, 98, "2023"),
        createTrafficEntity("August", 290, 155, 100, "2023"),
        createTrafficEntity("September", 310, 170, 103, "2023"),
    ],
    "Q4 2023": [
        createTrafficEntity("October", 330, 185, 105, "2023"),
        createTrafficEntity("November", 350, 200, 110, "2023"),
        createTrafficEntity("December", 370, 215, 115, "2023"),
    ],
    "Q1 2024": [
        createTrafficEntity("January", 186, 80, 100, "2024"),
        createTrafficEntity("February", 305, 200, 100, "2024"),
        createTrafficEntity("March", 237, 120, 100, "2024"),
    ],
    "Q2 2024": [
        createTrafficEntity("April", 73, 190, 100, "2024"),
        createTrafficEntity("May", 209, 130, 100, "2024"),
        createTrafficEntity("June", 214, 140, 100, "2024"),
    ],
    "Q3 2024": [
        createTrafficEntity("July", 258, 160, 120, "2024"),
        createTrafficEntity("August", 342, 210, 135, "2024"),
        createTrafficEntity("September", 370, 230, 150, "2024"),
    ],
    "Q4 2024": [
        createTrafficEntity("October", 410, 250, 180, "2024"),
        createTrafficEntity("November", 470, 290, 200, "2024"),
        createTrafficEntity("December", 520, 320, 230, "2024"),
    ],
}

// Create full year data for both 2023 and 2024
const yearlyData = {
    "2023": [
        ...quarterlyData["Q1 2023"],
        ...quarterlyData["Q2 2023"],
        ...quarterlyData["Q3 2023"],
        ...quarterlyData["Q4 2023"],
    ],
    "2024": [
        ...quarterlyData["Q1 2024"],
        ...quarterlyData["Q2 2024"],
        ...quarterlyData["Q3 2024"],
        ...quarterlyData["Q4 2024"],
    ],
}

const chartConfig = {
    visitors: {
        label: "Visitors",
        color: "#EE4D2D", // Shopee's primary orange
    },
    orders: {
        label: "Orders",
        color: "#F1582C", // Shopee's secondary orange
    },
    conversionRate: {
        label: "Conversion",
        color: "#213440", // Shopee's dark navy/slate color
    },
} satisfies ChartConfig




export function ShopeeTrafficCharts() {
    const [chartType, setChartType] = useState("bar")
    const [timeFrame, setTimeFrame] = useState("Q2 2024")
    const [yearFilter, setYearFilter] = useState("all") // "all", "2023", or "2024"

    // Function to get month name from date string
    const getMonthFromDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('default', { month: 'long' });
    };

    // Determine which data to display based on the year filter and timeframe
    const getChartData = () => {
        // If viewing a full year
        if (timeFrame === "2023" || timeFrame === "2024") {
            return yearlyData[timeFrame];
        }

        // If filtering by year
        if (yearFilter !== "all") {
            // Only show quarters from the selected year
            if (timeFrame.includes(yearFilter)) {
                return quarterlyData[timeFrame as keyof typeof quarterlyData];
            } else {
                // If current timeFrame is not from selected year, default to Q1 of selected year
                return quarterlyData[`Q1 ${yearFilter}` as keyof typeof quarterlyData];
            }
        }

        // Default - show the selected timeFrame
        return quarterlyData[timeFrame as keyof typeof quarterlyData];
    }

    const chartData = getChartData();

    // Get the available time periods based on year filter
    const getFilteredTimePeriods = () => {
        if (yearFilter === "all") {
            return Object.keys(quarterlyData);
        } else {
            return Object.keys(quarterlyData).filter(quarter => quarter.includes(yearFilter));
        }
    }

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
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(value) => getMonthFromDate(value).slice(0, 3)}
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
                            dataKey="conversionRate"
                            stroke={chartConfig.conversionRate.color}
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 0, fill: chartConfig.conversionRate.color }}
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
                            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig.visitors.color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartConfig.visitors.color} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig.orders.color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartConfig.orders.color} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig.conversionRate.color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartConfig.conversionRate.color} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(value) => getMonthFromDate(value).slice(0, 3)}
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
                            dataKey="conversionRate"
                            stroke={chartConfig.conversionRate.color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorConversion)"
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
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(value) => getMonthFromDate(value).slice(0, 3)}
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
                            dataKey="conversionRate"
                            fill={chartConfig.conversionRate.color}
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
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(value) => getMonthFromDate(value).slice(0, 3)}
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
                            dataKey="conversionRate"
                            type="monotone"
                            fill={chartConfig.conversionRate.color}
                            fillOpacity={0.6}
                            stroke={chartConfig.conversionRate.color}
                            stackId="1"
                        />
                    </AreaChart>
                )

            default:
                return (
                    <AreaChart data={chartData}>
                        <Area dataKey="visitors" />
                        <Area dataKey="orders" />
                        <Area dataKey="conversionRate" />
                    </AreaChart>
                )
        }
    }

    // Handle year filter change
    const handleYearFilterChange = (year: string) => {
        setYearFilter(year);

        // If current timeFrame doesn't match the selected year, update it
        if (year !== "all" && !timeFrame.includes(year)) {
            setTimeFrame(`Q1 ${year}`);
        }
    }

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <CardTitle className="text-lg font-bold">Traffic Metrics</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            {chartTypes[chartType as keyof typeof chartTypes]} showing visitors, orders, and conversion rates
                            {yearFilter !== "all" && <span className="ml-1">for {yearFilter}</span>}
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {yearFilter === "all" ? "All Years" : yearFilter}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuRadioGroup value={yearFilter} onValueChange={handleYearFilterChange}>
                                    <DropdownMenuRadioItem value="all">All Years</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="2023">2023</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="2024">2024</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setTimeFrame(yearFilter === "all" ? "2023" : yearFilter)}>
                                    View Full Year
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Time Period */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                    {timeFrame}
                                    <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {yearFilter === "all" && (
                                    <>
                                        <DropdownMenuItem onClick={() => setTimeFrame("2023")}>
                                            Full Year 2023
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setTimeFrame("2024")}>
                                            Full Year 2024
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}

                                {getFilteredTimePeriods().map(period => (
                                    <DropdownMenuItem
                                        key={period}
                                        onClick={() => setTimeFrame(period)}
                                    >
                                        {period}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Mobile chart selector */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild >
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
                <div className="h-[300px] w-full">
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {renderChart()}
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    )
}