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
    ResponsiveContainer,
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
import { AnalyticsSalesEntity, AnalyticsType } from "@/src/features/sales/data/model/analytics-entity"
import { capitalizeFirstLetter, formatChartAxisDayNumber, formatCurrencyToShort } from "@/src/core/constant/helper"
import { MediumLoader } from "@/components/ui/shop-intel-loader"

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
    dateKey: string;
    dateLabel: string;
    tiktok: number;
    shopee: number;
    shopify: number;
    physical: number;
}

const SALES_PLATFORM_CHART_DAYS = 30;

/** YYYY-MM-DD from API or ISO string, local calendar date */
function normalizeDateKey(raw: string): string | null {
    if (!raw) return null;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) {
        const m = raw.match(/^(\d{4}-\d{2}-\d{2})/);
        return m ? m[1] : null;
    }
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${day}`;
}

function addCalendarDays(isoYmd: string, deltaDays: number): string {
    const [y, m, d] = isoYmd.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + deltaDays);
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
}

function todayYmdLocal(): string {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const d = String(t.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/** Exactly `n` consecutive days ending at `endKey`, merging grouped rows; missing days are zero-filled. */
function buildNDayWindow(
    grouped: Record<string, TransformedData>,
    endKey: string,
    n: number
): TransformedData[] {
    const out: TransformedData[] = [];
    for (let offset = -(n - 1); offset <= 0; offset++) {
        const dateKey = addCalendarDays(endKey, offset);
        const row = grouped[dateKey];
        out.push(
            row ?? {
                dateKey,
                dateLabel: formatChartAxisDayNumber(dateKey),
                tiktok: 0,
                shopee: 0,
                shopify: 0,
                physical: 0,
            }
        );
    }
    return out;
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

    const row = payload[0]?.payload as TransformedData | undefined;
    const title =
        row?.dateKey != null
            ? new Date(`${row.dateKey}T12:00:00`).toLocaleDateString("en-MY", {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
              })
            : label;

    return (
        <div className="rounded-lg border bg-background p-2 shadow-sm w-[200px]">
            <div className="grid grid-cols-[1fr_auto] gap-2">
                <div className="flex flex-col">
                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                        {title}
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

    const chartData = useMemo(() => {
        const groupedByDate = data.reduce((acc, curr) => {
            const nk = normalizeDateKey(curr.date || "");
            if (!nk) return acc;
            if (!acc[nk]) {
                acc[nk] = {
                    dateKey: nk,
                    dateLabel: formatChartAxisDayNumber(nk),
                    tiktok: 0,
                    shopee: 0,
                    shopify: 0,
                    physical: 0,
                };
            }

            if (curr.type && curr.total_revenues != null) {
                switch (curr.type) {
                    case AnalyticsType.TIKTOK:
                        acc[nk].tiktok = curr.total_revenues;
                        break;
                    case AnalyticsType.SHOPEE:
                        acc[nk].shopee = curr.total_revenues;
                        break;
                    case AnalyticsType.SHOPIFY:
                        acc[nk].shopify = curr.total_revenues;
                        break;
                    case AnalyticsType.PHYSICAL:
                        acc[nk].physical = curr.total_revenues;
                        break;
                }
            }
            return acc;
        }, {} as Record<string, TransformedData>);

        const sortedKeys = Object.keys(groupedByDate).sort();
        const endKey = sortedKeys.length > 0 ? sortedKeys[sortedKeys.length - 1]! : todayYmdLocal();

        return buildNDayWindow(groupedByDate, endKey, SALES_PLATFORM_CHART_DAYS);
    }, [data]);

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
                            bottom: 28,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="dateLabel"
                            type="category"
                            interval={0}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{
                                fill: "hsl(var(--muted-foreground))",
                                fontSize: 9,
                                fontWeight: 500,
                                style: { fontVariantNumeric: "tabular-nums" },
                            }}
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
                            bottom: 40,
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
                            dataKey="dateLabel"
                            type="category"
                            interval={0}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{
                                fill: "hsl(var(--muted-foreground))",
                                fontSize: 9,
                                fontWeight: 500,
                                style: { fontVariantNumeric: "tabular-nums" },
                            }}
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
                            bottom: 36,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="dateLabel"
                            type="category"
                            interval={0}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{
                                fill: "hsl(var(--muted-foreground))",
                                fontSize: 9,
                                fontWeight: 500,
                                style: { fontVariantNumeric: "tabular-nums" },
                            }}
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
                            maxBarSize={22}
                        />
                        <Bar
                            dataKey="shopee"
                            fill={chartConfig.shopee.color}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={22}
                        />
                        <Bar
                            dataKey="shopify"
                            fill={chartConfig.shopify.color}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={22}
                        />
                        <Bar
                            dataKey="physical"
                            fill={chartConfig.physical.color}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={22}
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
                            bottom: 28,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="dateLabel"
                            type="category"
                            interval={0}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{
                                fill: "hsl(var(--muted-foreground))",
                                fontSize: 9,
                                fontWeight: 500,
                                style: { fontVariantNumeric: "tabular-nums" },
                            }}
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

    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

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
                btnBorder: "rgba(var(--preset-primary-rgb), 0.2)",
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
            btnBorder: "rgba(var(--preset-primary-rgb), 0.15)",
            btnText: "var(--preset-primary)",
        }
    }, [isDark])

    const chartTypeButtons = [
        { value: "line", label: "Line", icon: <LineChartIcon size={14} /> },
        { value: "area", label: "Area", icon: <TrendingUp size={14} /> },
        { value: "bar", label: "Bar", icon: <BarChart3 size={14} /> },
        { value: "stackedArea", label: "Stacked", icon: <PieChartIcon size={14} /> },
    ]

    return (
        <div
            className="sales-chart-card"
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
            {/* Ambient glow */}
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

            {/* Loading overlay */}
            {isLoading && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: isDark ? "rgba(26, 34, 44, 0.78)" : "rgba(250, 247, 255, 0.72)",
                        backdropFilter: "blur(6px)",
                        WebkitBackdropFilter: "blur(6px)",
                        zIndex: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 20,
                    }}
                >
                    <MediumLoader label="Loading chart data" className="!py-4" />
                </div>
            )}

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                    <h2
                        style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: t.title,
                            margin: 0,
                            letterSpacing: "-0.3px",
                            lineHeight: 1.2,
                        }}
                    >
                        Sales by Platform
                    </h2>
                    <p style={{ fontSize: 12, color: t.subtitle, margin: "4px 0 0 0" }}>
                        Last {SALES_PLATFORM_CHART_DAYS} days (daily) — {chartTypes[chartType as keyof typeof chartTypes].toLowerCase()} across channels
                    </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    {/* Chart type pills — desktop */}
                    <div
                        className="hidden md:flex"
                        style={{
                            background: t.pillBg,
                            borderRadius: 10,
                            padding: 3,
                            gap: 2,
                        }}
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

                    {/* Year dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    padding: "5px 10px",
                                    borderRadius: 8,
                                    border: t.cardBorder,
                                    cursor: "pointer",
                                    color: t.btnText,
                                    background: t.btnBg,
                                }}
                            >
                                {selectedYear}
                                <ChevronDown size={14} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {years.map((year) => (
                                <DropdownMenuItem key={year} onClick={() => onYearChange(year)}>
                                    {year}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Quarter dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    padding: "5px 10px",
                                    borderRadius: 8,
                                    border: t.cardBorder,
                                    cursor: "pointer",
                                    color: t.btnText,
                                    background: t.btnBg,
                                }}
                            >
                                {selectedQuarter}
                                <ChevronDown size={14} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {quarters.map((quarter) => (
                                <DropdownMenuItem key={quarter} onClick={() => onQuarterChange(quarter)}>
                                    {quarter}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                </div>
            </div>

            {/* Chart */}
            <div className="sales-chart-container" style={{ height: 350, width: "100%" }}>
                <ChartContainer config={chartConfig} className="sales-chart-inner h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        </div>
    )
}