"use client"

import { useState } from "react"
import {
    TrendingUp,
    BarChart3,
    LineChart as LineChartIcon,
    PieChart as PieChartIcon,
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
    Tooltip,
} from "recharts"

import {
    AnalyticsSalesEntity,
    AnalyticsType,
} from "@/src/features/sales/data/model/analytics-entity"
import {
    capitalizeFirstLetter,
    formatCurrencyToShort,
} from "@/src/core/constant/helper"
import { DashboardPanel } from "@/src/core/shared/view/components/dashboard-panel"

const platformColors = {
    tiktok: "#FF0066",
    shopee: "#EE4D2D",
    shopify: "#22C55E",
    physical: "#2D9CDB",
}

interface TransformedData {
    month: string
    tiktok: number
    shopee: number
    shopify: number
    physical: number
}

interface SalesOverviewChartProps {
    data: AnalyticsSalesEntity[]
    selectedYear: string
    selectedQuarter: string
    onYearChange: (year: string) => void
    onQuarterChange: (quarter: string) => void
    isAdmin?: boolean
    isLoading?: boolean
}

const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (!active || !payload) return null
    return (
        <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-md min-w-[160px]">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                {label}
            </p>
            <div className="space-y-1">
                {payload.map((entry: any, i: number) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs text-muted-foreground">{capitalizeFirstLetter(entry.name)}</span>
                        <span className="text-xs font-semibold tabular-nums">RM {formatCurrencyToShort(entry.value)}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function SalesOverviewChart({
    data,
    selectedYear,
    selectedQuarter,
    onYearChange,
    onQuarterChange,
    isAdmin = false,
    isLoading = false,
}: SalesOverviewChartProps) {
    const [chartType, setChartType] = useState("bar")

    const transformData = (data: AnalyticsSalesEntity[]): TransformedData[] => {
        const groupedByDate = data.reduce(
            (acc, curr) => {
                const date = curr.date || ""
                if (!acc[date]) {
                    acc[date] = {
                        month: new Date(date).toLocaleString("default", {
                            month: "long",
                        }),
                        tiktok: 0,
                        shopee: 0,
                        shopify: 0,
                        physical: 0,
                    }
                }
                if (curr.type && curr.total_revenues) {
                    switch (curr.type) {
                        case AnalyticsType.TIKTOK:
                            acc[date].tiktok = curr.total_revenues
                            break
                        case AnalyticsType.SHOPEE:
                            acc[date].shopee = curr.total_revenues
                            break
                        case AnalyticsType.SHOPIFY:
                            acc[date].shopify = curr.total_revenues
                            break
                        case AnalyticsType.PHYSICAL:
                            acc[date].physical = curr.total_revenues
                            break
                    }
                }
                return acc
            },
            {} as Record<string, TransformedData>
        )

        return Object.values(groupedByDate).sort((a, b) => {
            const monthA = new Date(Date.parse(a.month + " 1, 2024"))
            const monthB = new Date(Date.parse(b.month + " 1, 2024"))
            return monthA.getTime() - monthB.getTime()
        })
    }

    const chartData = transformData(data)

    const chartTypes = [
        { value: "line", icon: LineChartIcon, label: "Line" },
        { value: "area", icon: TrendingUp, label: "Area" },
        { value: "bar", icon: BarChart3, label: "Bar" },
        { value: "stackedArea", icon: PieChartIcon, label: "Stacked" },
    ]

    const chartTypeLabels: Record<string, string> = {
        line: "Line Chart",
        area: "Area Chart",
        bar: "Bar Chart",
        stackedArea: "Stacked Area",
    }

    const years = ["2023", "2024", "2025"]
    const quarters = ["Q1", "Q2", "Q3", "Q4"]

    const axisProps = {
        tickLine: false as const,
        axisLine: false as const,
        tickMargin: 8,
        tick: { fill: "hsl(var(--muted-foreground))", fontSize: 12 },
    }

    const renderChart = () => {
        switch (chartType) {
            case "line":
                return (
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" {...axisProps} tickFormatter={(v) => v.slice(0, 3)} />
                        <YAxis {...axisProps} />
                        <Tooltip content={<CustomTooltipContent />} cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "3 3" }} />
                        {Object.entries(platformColors).map(([key, color]) => (
                            <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: color }} activeDot={{ r: 5, strokeWidth: 0 }} />
                        ))}
                    </LineChart>
                )

            case "area":
                return (
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <defs>
                            {Object.entries(platformColors).map(([key, color]) => (
                                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" {...axisProps} tickFormatter={(v) => v.slice(0, 3)} />
                        <YAxis {...axisProps} />
                        <Tooltip content={<CustomTooltipContent />} cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "3 3" }} />
                        {Object.entries(platformColors).map(([key, color]) => (
                            <Area key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#grad-${key})`} />
                        ))}
                    </AreaChart>
                )

            case "bar":
                return (
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" {...axisProps} tickFormatter={(v) => v.slice(0, 3)} />
                        <YAxis {...axisProps} />
                        <Tooltip content={<CustomTooltipContent />} cursor={{ fill: "hsl(var(--accent))", opacity: 0.5 }} />
                        {Object.entries(platformColors).map(([key, color]) => (
                            <Bar key={key} dataKey={key} fill={color} radius={[4, 4, 0, 0]} maxBarSize={36} />
                        ))}
                    </BarChart>
                )

            case "stackedArea":
                return (
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" {...axisProps} tickFormatter={(v) => v.slice(0, 3)} />
                        <YAxis {...axisProps} />
                        <Tooltip content={<CustomTooltipContent />} cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "3 3" }} />
                        {Object.entries(platformColors).map(([key, color]) => (
                            <Area key={key} dataKey={key} type="monotone" fill={color} fillOpacity={0.5} stroke={color} stackId="1" />
                        ))}
                    </AreaChart>
                )

            default:
                return (
                    <BarChart data={chartData}>
                        {Object.entries(platformColors).map(([key, color]) => (
                            <Bar key={key} dataKey={key} fill={color} />
                        ))}
                    </BarChart>
                )
        }
    }

    const actions = (
        <>
            <div className="hidden md:flex items-center rounded-lg border border-border bg-background p-0.5">
                {chartTypes.map(({ value, icon: Icon }) => (
                    <button
                        key={value}
                        onClick={() => setChartType(value)}
                        className={`p-1.5 rounded-md transition-colors ${
                            chartType === value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                        }`}
                        title={chartTypeLabels[value]}
                    >
                        <Icon className="w-3.5 h-3.5" />
                    </button>
                ))}
            </div>
            <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="md:hidden h-8 px-2 rounded-lg border border-border bg-background text-xs font-medium"
            >
                {chartTypes.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                ))}
            </select>
            <select
                value={selectedYear}
                onChange={(e) => onYearChange(e.target.value)}
                className="h-8 px-2 rounded-lg border border-border bg-background text-xs font-medium"
            >
                {years.map((y) => (<option key={y} value={y}>{y}</option>))}
            </select>
            <select
                value={selectedQuarter}
                onChange={(e) => onQuarterChange(e.target.value)}
                className="h-8 px-2 rounded-lg border border-border bg-background text-xs font-medium"
            >
                {quarters.map((q) => (<option key={q} value={q}>{q}</option>))}
            </select>
        </>
    )

    return (
        <DashboardPanel
            title="Sales by Platform"
            description={`${chartTypeLabels[chartType]} · Revenue across channels`}
            actions={actions}
        >
            <div className="relative flex-1 flex flex-col min-h-0">
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/80 backdrop-blur-sm rounded-b-2xl">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "120ms" }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "240ms" }} />
                        </div>
                        <p className="text-xs text-muted-foreground">Loading…</p>
                    </div>
                </div>
            )}
            <div className="relative px-5 pt-3">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                    {Object.entries(platformColors).map(([key, color]) => (
                        <div key={key} className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-[11px] text-muted-foreground capitalize">{key}</span>
                        </div>
                    ))}
                </div>
                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                </div>
            </div>
            </div>
        </DashboardPanel>
    )
}
