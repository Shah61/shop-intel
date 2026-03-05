"use client"

import { useState, useMemo } from "react"
import { useTheme } from "next-themes"
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
    Tooltip
} from "recharts"

import {
    ChartConfig,
    ChartContainer,
} from "@/components/ui/chart"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useConversionRateHistoricalData } from "../../../tanstack/mock-shopify-tanstack"
import { capitalizeFirstLetter, formatCurrencyToShort } from "@/src/core/constant/helper"

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
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    const years = [2023, 2024, 2025, 2026]

    const { data, isLoading } = useConversionRateHistoricalData(quarter, year.toString())

    const formattedData = data?.map((item: any) => ({
        date: new Date(item.date || "").toLocaleDateString('en-US', { month: 'short' }),
        revenue: item.total_revenues,
        orders: item.total_orders,
        conversion: item.conversion_rate ?? item.total_conversions ?? 0
    })) || []

    const t = useMemo(() => {
        if (isDark) {
            return {
                cardBg: "linear-gradient(135deg, rgba(26, 34, 44, 0.9), rgba(35, 45, 56, 0.85))",
                cardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.12)",
                glowColor: "rgba(var(--preset-primary-rgb), 0.08)",
                title: "#fff",
                subtitle: "#7a6a9a",
                pillBg: "rgba(var(--preset-primary-rgb), 0.12)",
                pillActive: "rgba(var(--preset-primary-rgb), 0.6)",
                pillText: "var(--preset-lighter)",
                pillActiveText: "#fff",
                btnBg: "rgba(var(--preset-primary-rgb), 0.1)",
                btnText: "var(--preset-lighter)",
            }
        }
        return {
            cardBg: "linear-gradient(135deg, rgba(250, 247, 255, 0.95), rgba(243, 237, 255, 0.85))",
            cardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.1)",
            glowColor: "rgba(var(--preset-primary-rgb), 0.05)",
            title: "#1a1025",
            subtitle: "#8b7aa0",
            pillBg: "rgba(var(--preset-primary-rgb), 0.08)",
            pillActive: "rgba(var(--preset-primary-rgb), 0.85)",
            pillText: "var(--preset-primary)",
            pillActiveText: "#fff",
            btnBg: "rgba(var(--preset-primary-rgb), 0.06)",
            btnText: "var(--preset-primary)",
        }
    }, [isDark])

    const chartTypes: Record<string, string> = {
        line: "Line Chart",
        area: "Area Chart",
        bar: "Bar Chart",
        stackedArea: "Stacked Area"
    }

    const chartTypeButtons = [
        { value: "line", label: "Line", icon: <LineChartIcon size={14} /> },
        { value: "area", label: "Area", icon: <TrendingUp size={14} /> },
        { value: "bar", label: "Bar", icon: <BarChart3 size={14} /> },
        { value: "stackedArea", label: "Stacked", icon: <PieChartIcon size={14} /> },
    ]

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
        <div
            style={{
                background: t.cardBg,
                borderRadius: 20,
                border: t.cardBorder,
                padding: "22px 26px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                fontFamily: "'Outfit', sans-serif",
                position: "relative",
                overflow: "hidden",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: -60,
                    right: -60,
                    width: 180,
                    height: 180,
                    background: `radial-gradient(circle, ${t.glowColor} 0%, transparent 70%)`,
                    pointerEvents: "none",
                }}
            />

            {isLoading && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: isDark ? "rgba(26, 34, 44, 0.75)" : "rgba(250, 247, 255, 0.6)",
                        backdropFilter: "blur(2px)",
                        zIndex: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 20,
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                        <div style={{ display: "flex", gap: 4 }}>
                            {[0, 150, 300].map((delay) => (
                                <div
                                    key={delay}
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        background: "rgba(var(--preset-primary-rgb), 0.6)",
                                        animation: "bounce 1s infinite",
                                        animationDelay: `${delay}ms`,
                                    }}
                                />
                            ))}
                        </div>
                        <span style={{ fontSize: 13, color: t.subtitle }}>Loading chart data...</span>
                    </div>
                </div>
            )}

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: t.title, margin: 0, letterSpacing: "-0.3px", lineHeight: 1.2 }}>
                        Shopify Conversion Metrics
                    </h2>
                    <p style={{ fontSize: 12, color: t.subtitle, margin: "4px 0 0 0" }}>
                        {chartTypes[chartType]} showing visitors, orders, and conversion rates
                    </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <div
                        className="hidden md:flex"
                        style={{ background: t.pillBg, borderRadius: 10, padding: 3, gap: 2 }}
                    >
                        {chartTypeButtons.map((btn) => (
                            <button
                                key={btn.value}
                                type="button"
                                onClick={() => setChartType(btn.value)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    padding: "5px 10px",
                                    borderRadius: 8,
                                    border: "none",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                    color: chartType === btn.value ? t.pillActiveText : t.pillText,
                                    background: chartType === btn.value ? t.pillActive : "transparent",
                                    boxShadow: chartType === btn.value ? "0 1px 4px rgba(var(--preset-primary-rgb), 0.25)" : "none",
                                }}
                            >
                                {btn.icon}
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button type="button" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, padding: "5px 10px", borderRadius: 8, border: t.cardBorder, cursor: "pointer", color: t.btnText, background: t.btnBg }}>
                                {quarter}
                                <ChevronDown size={14} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                                <DropdownMenuItem key={q} onClick={() => setQuarter(q)}>{q}</DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button type="button" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, padding: "5px 10px", borderRadius: 8, border: t.cardBorder, cursor: "pointer", color: t.btnText, background: t.btnBg }}>
                                {year}
                                <ChevronDown size={14} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {years.map((y) => (
                                <DropdownMenuItem key={y} onClick={() => setYear(y)}>{y}</DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button type="button" className="md:hidden" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, border: t.cardBorder, cursor: "pointer", color: t.btnText, background: t.btnBg }}>
                                {chartType === 'line' && <LineChartIcon size={16} />}
                                {chartType === 'area' && <TrendingUp size={16} />}
                                {chartType === 'bar' && <BarChart3 size={16} />}
                                {chartType === 'stackedArea' && <PieChartIcon size={16} />}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setChartType("line")}><LineChartIcon className="h-4 w-4 mr-2" /> Line</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setChartType("area")}><TrendingUp className="h-4 w-4 mr-2" /> Area</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setChartType("bar")}><BarChart3 className="h-4 w-4 mr-2" /> Bar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setChartType("stackedArea")}><PieChartIcon className="h-4 w-4 mr-2" /> Stacked</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <ChartContainer config={chartConfig} className="h-[350px] w-full">
                {renderChart()}
            </ChartContainer>
        </div>
    )
}
