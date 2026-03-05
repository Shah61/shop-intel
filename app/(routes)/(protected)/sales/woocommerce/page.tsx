"use client";

import { useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Package,
    BarChart3,
    Calendar,
    Search,
    Download,
    Target,
    Zap,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";
import DateRangePickerPro, { type DateRange, type Timeframe } from "@/components/ui/date-range-picker-pro";
import { startOfMonth, endOfMonth } from "date-fns";

// Static data for WooCommerce sales
const wooCommerceData = {
    revenue: 125000,
    orders: 1250,
    averageOrderValue: 100,
    topDomain: "magicclothing.com",
    marketingSpend: 45000,
    purchases: 890,
    totalReach: 125000,
    netProfit: 80000,
    roi: 177.78,
    roas: 2.78
};

// Static data for revenue trend
const revenueTrendData = [
    { date: "Jan 01", revenue: 4200, orders: 42 },
    { date: "Jan 02", revenue: 3800, orders: 38 },
    { date: "Jan 03", revenue: 4500, orders: 45 },
    { date: "Jan 04", revenue: 5200, orders: 52 },
    { date: "Jan 05", revenue: 4800, orders: 48 },
    { date: "Jan 06", revenue: 6100, orders: 61 },
    { date: "Jan 07", revenue: 5500, orders: 55 },
    { date: "Jan 08", revenue: 6800, orders: 68 },
    { date: "Jan 09", revenue: 7200, orders: 72 },
    { date: "Jan 10", revenue: 6500, orders: 65 },
    { date: "Jan 11", revenue: 7800, orders: 78 },
    { date: "Jan 12", revenue: 8200, orders: 82 },
    { date: "Jan 13", revenue: 7500, orders: 75 },
    { date: "Jan 14", revenue: 8900, orders: 89 },
    { date: "Jan 15", revenue: 9200, orders: 92 }
];

// Static data for performance summary
const performanceSummaryData = [
    { date: "2025-01-15", platform: "WooCommerce", type: "Revenue", amount: 9200, units: 92, currency: "MYR" },
    { date: "2025-01-15", platform: "Facebook", type: "Marketing Spend", amount: 3200, units: 0, currency: "MYR" },
    { date: "2025-01-14", platform: "WooCommerce", type: "Revenue", amount: 8900, units: 89, currency: "MYR" },
    { date: "2025-01-14", platform: "Facebook", type: "Marketing Spend", amount: 2800, units: 0, currency: "MYR" },
    { date: "2025-01-13", platform: "WooCommerce", type: "Revenue", amount: 7500, units: 75, currency: "MYR" },
    { date: "2025-01-13", platform: "Facebook", type: "Marketing Spend", amount: 2500, units: 0, currency: "MYR" }
];

// Static data for top sellers
const topSellersData = [
    { id: 1, name: "Hydrating Face Serum", quantity: 245, domain: "magicclothing.com" },
    { id: 2, name: "Anti-Aging Night Cream", quantity: 198, domain: "magicclothing.com" },
    { id: 3, name: "Vitamin C Brightening Serum", quantity: 167, domain: "magicclothing.com" },
    { id: 4, name: "Gentle Facial Cleanser", quantity: 156, domain: "magicclothing.com" },
    { id: 5, name: "Moisturizing Day Cream", quantity: 134, domain: "magicclothing.com" },
    { id: 6, name: "Eye Contour Gel", quantity: 123, domain: "magicclothing.com" },
    { id: 7, name: "Exfoliating Face Scrub", quantity: 98, domain: "magicclothing.com" },
    { id: 8, name: "Facial Toner", quantity: 87, domain: "magicclothing.com" }
];

// Static data for orders
const ordersData = [
    { id: "#1001", status: "Completed", total: 125.50, date: "2025-01-15", domain: "magicclothing.com", items: ["Hydrating Face Serum", "Gentle Facial Cleanser"] },
    { id: "#1002", status: "Processing", total: 89.90, date: "2025-01-15", domain: "magicclothing.com", items: ["Anti-Aging Night Cream"] },
    { id: "#1003", status: "Completed", total: 156.75, date: "2025-01-14", domain: "magicclothing.com", items: ["Vitamin C Brightening Serum", "Eye Contour Gel"] },
    { id: "#1004", status: "Shipped", total: 67.25, date: "2025-01-14", domain: "magicclothing.com", items: ["Moisturizing Day Cream"] },
    { id: "#1005", status: "Completed", total: 198.00, date: "2025-01-13", domain: "magicclothing.com", items: ["Hydrating Face Serum", "Anti-Aging Night Cream", "Facial Toner"] }
];

// Static data for daily sales
const dailySalesData = [
    { date: "2025-01-15", sales: 9200, orders: 92, currency: "MYR", domain: "magicclothing.com" },
    { date: "2025-01-14", sales: 8900, orders: 89, currency: "MYR", domain: "magicclothing.com" },
    { date: "2025-01-13", sales: 7500, orders: 75, currency: "MYR", domain: "magicclothing.com" },
    { date: "2025-01-12", sales: 8200, orders: 82, currency: "MYR", domain: "magicclothing.com" },
    { date: "2025-01-11", sales: 7800, orders: 78, currency: "MYR", domain: "magicclothing.com" },
    { date: "2025-01-10", sales: 6500, orders: 65, currency: "MYR", domain: "magicclothing.com" },
    { date: "2025-01-09", sales: 7200, orders: 72, currency: "MYR", domain: "magicclothing.com" }
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-MY").format(value);
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
    });
};

/* ─── Badge config (Overview / List Conversion Platform badge style) ─── */
const BADGE_CONFIG: Record<string, { label: string; gradient: string; shadow: string }> = {
    Completed: { label: "Completed", gradient: "linear-gradient(135deg, #059669, #10b981)", shadow: "0 2px 8px rgba(16, 185, 129, 0.35)" },
    Processing: { label: "Processing", gradient: "linear-gradient(135deg, #d97706, #f59e0b)", shadow: "0 2px 8px rgba(245, 158, 11, 0.35)" },
    Shipped: { label: "Shipped", gradient: "linear-gradient(135deg, #2563eb, #3b82f6)", shadow: "0 2px 8px rgba(59, 130, 246, 0.35)" },
    Cancelled: { label: "Cancelled", gradient: "linear-gradient(135deg, #dc2626, #ef4444)", shadow: "0 2px 8px rgba(239, 68, 68, 0.35)" },
    WooCommerce: { label: "WooCommerce", gradient: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))", shadow: "0 2px 8px rgba(var(--preset-primary-rgb), 0.35)" },
    Facebook: { label: "Facebook", gradient: "linear-gradient(135deg, #2563eb, #60a5fa)", shadow: "0 2px 8px rgba(96, 165, 250, 0.35)" },
    "In Development": { label: "In Development", gradient: "linear-gradient(135deg, #d97706, #fbbf24)", shadow: "0 2px 8px rgba(251, 191, 36, 0.35)" },
    "magicclothing.com": { label: "magicclothing.com", gradient: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))", shadow: "0 2px 8px rgba(var(--preset-primary-rgb), 0.35)" },
    "magicclothing.sg": { label: "magicclothing.sg", gradient: "linear-gradient(135deg, #5b21b6, #8b5cf6)", shadow: "0 2px 8px rgba(139, 92, 246, 0.35)" },
};

function StyledBadge({ value }: { value: string }) {
    const config = BADGE_CONFIG[value] || { label: value, gradient: "linear-gradient(135deg, #6b7280, #9ca3af)", shadow: "0 2px 8px rgba(156, 163, 175, 0.3)" };
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                position: "relative",
                overflow: "hidden",
                background: config.gradient,
                boxShadow: config.shadow,
                borderRadius: 6,
                padding: "2px 8px",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "#fff",
                lineHeight: 1.6,
            }}
        >
            <span style={{ position: "relative", zIndex: 1 }}>{config.label}</span>
            <span
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer-slide 2s infinite linear",
                }}
            />
            <style>{`
                @keyframes shimmer-slide {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </span>
    );
}

export default function WooCommerceDashboard() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const [activeTab, setActiveTab] = useState("overview");
    const [selectedDomain, setSelectedDomain] = useState("all");
    const [timeframe, setTimeframe] = useState<Timeframe>("daily");
    const [dateRange, setDateRange] = useState<DateRange>(() => {
        const now = new Date();
        return { from: startOfMonth(now), to: endOfMonth(now) };
    });
    const [searchTerm, setSearchTerm] = useState("");

    const tabTheme = useMemo(() => {
        if (isDark) {
            return {
                pillBg: "rgba(var(--preset-primary-rgb), 0.12)",
                pillActive: "rgba(var(--preset-primary-rgb), 0.6)",
                pillText: "var(--preset-lighter)",
                pillActiveText: "#fff",
                title: "#fff",
                subtitle: "#a1a1aa",
            };
        }
        return {
            pillBg: "rgba(var(--preset-primary-rgb), 0.08)",
            pillActive: "rgba(var(--preset-primary-rgb), 0.85)",
            pillText: "var(--preset-primary)",
            pillActiveText: "#fff",
            title: "#18181b",
            subtitle: "#71717a",
        };
    }, [isDark]);

    const filteredTopSellers = topSellersData.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredOrders = ordersData.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 w-full">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: tabTheme.title, fontFamily: "'Outfit', sans-serif" }}>
                        WooCommerce Dashboard
                    </h1>
                    <p style={{ color: tabTheme.subtitle, fontSize: 14 }}>Track your e-commerce performance and sales analytics</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <DateRangePickerPro
                        value={dateRange}
                        onChange={setDateRange}
                        placeholder="Pick a date range"
                        label=""
                        timeframe={timeframe}
                        onTimeframeChange={setTimeframe}
                        className="min-w-[240px]"
                    />
                    <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                        <SelectTrigger
                            className="w-48"
                            style={{ borderColor: isDark ? "rgba(var(--preset-primary-rgb), 0.25)" : "rgba(var(--preset-primary-rgb), 0.2)" }}
                        >
                            <SelectValue placeholder="Select Domain" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Domains</SelectItem>
                            <SelectItem value="magicclothing.com">magicclothing.com</SelectItem>
                            <SelectItem value="magicclothing.sg">magicclothing.sg</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        className="gap-2"
                        style={{
                            borderColor: isDark ? "rgba(var(--preset-primary-rgb), 0.35)" : "rgba(var(--preset-primary-rgb), 0.3)",
                            color: isDark ? "var(--preset-lighter)" : "var(--preset-primary)",
                        }}
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Key Metrics Cards — Overview style + purple essence */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif", borderColor: isDark ? "rgba(var(--preset-primary-rgb), 0.12)" : "rgba(var(--preset-primary-rgb), 0.1)" }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium" style={{ color: tabTheme.subtitle }}>Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4" style={{ color: isDark ? "var(--preset-lighter)" : "var(--preset-primary)" }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: tabTheme.title }}>{formatCurrency(wooCommerceData.revenue)}</div>
                        <div className="flex items-center gap-2 text-xs" style={{ color: tabTheme.subtitle }}>
                            <span>{formatNumber(wooCommerceData.orders)} orders</span>
                            <span>•</span>
                            <span>Avg: {formatCurrency(wooCommerceData.averageOrderValue)}</span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: tabTheme.subtitle }}>Top domain: {wooCommerceData.topDomain}</p>
                    </CardContent>
                </Card>

                <Card className="border overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif", borderColor: isDark ? "rgba(var(--preset-primary-rgb), 0.12)" : "rgba(var(--preset-primary-rgb), 0.1)" }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium" style={{ color: tabTheme.subtitle }}>Marketing Spend</CardTitle>
                        <Target className="h-4 w-4" style={{ color: isDark ? "var(--preset-lighter)" : "var(--preset-primary)" }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: tabTheme.title }}>{formatCurrency(wooCommerceData.marketingSpend)}</div>
                        <div className="flex items-center gap-2 text-xs" style={{ color: tabTheme.subtitle }}>
                            <span>{formatNumber(wooCommerceData.purchases)} purchases</span>
                            <span>•</span>
                            <span>{formatNumber(wooCommerceData.totalReach)} reach</span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: tabTheme.subtitle }}>Facebook Ads</p>
                    </CardContent>
                </Card>

                <Card className="border overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif", borderColor: isDark ? "rgba(var(--preset-primary-rgb), 0.12)" : "rgba(var(--preset-primary-rgb), 0.1)" }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium" style={{ color: tabTheme.subtitle }}>ROI Performance</CardTitle>
                        <TrendingUp className="h-4 w-4" style={{ color: isDark ? "var(--preset-lighter)" : "var(--preset-primary)" }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: tabTheme.title }}>{formatCurrency(wooCommerceData.netProfit)}</div>
                        <div className="flex items-center gap-2 text-xs" style={{ color: tabTheme.subtitle }}>
                            <span>ROI: {wooCommerceData.roi}%</span>
                            <span>•</span>
                            <span>ROAS: {wooCommerceData.roas}x</span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: tabTheme.subtitle }}>Net profit</p>
                    </CardContent>
                </Card>

                <Card className="border overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif", borderColor: isDark ? "rgba(var(--preset-primary-rgb), 0.12)" : "rgba(var(--preset-primary-rgb), 0.1)" }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium" style={{ color: tabTheme.subtitle }}>TikTok Integration</CardTitle>
                        <Zap className="h-4 w-4" style={{ color: isDark ? "var(--preset-lighter)" : "var(--preset-primary)" }} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: tabTheme.title }}>Coming Soon</div>
                        <p className="text-xs mt-1" style={{ color: tabTheme.subtitle }}>TikTok Shop integration</p>
                        <div className="mt-2"><StyledBadge value="In Development" /></div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: isDark ? "var(--preset-lighter)" : "var(--preset-primary)" }} />
                        <Input
                            placeholder="Search products, orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 focus-visible:ring-2 focus-visible:ring-violet-500/30 focus-visible:ring-offset-0"
                            style={{ borderColor: isDark ? "rgba(var(--preset-primary-rgb), 0.25)" : "rgba(var(--preset-primary-rgb), 0.2)" }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Tabs — pill style */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div style={{ display: "flex", background: tabTheme.pillBg, borderRadius: 10, padding: 3, gap: 2, width: "fit-content", flexWrap: "wrap" }}>
                    {[
                        { value: "overview", label: "Overview", icon: <BarChart3 size={16} /> },
                        { value: "top-sellers", label: "Top Sellers", icon: <Package size={16} /> },
                        { value: "orders", label: "Orders", icon: <ShoppingCart size={16} /> },
                        { value: "daily-sales", label: "Daily Sales", icon: <Calendar size={16} /> },
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => setActiveTab(tab.value)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: 13,
                                fontWeight: 600,
                                padding: "8px 16px",
                                borderRadius: 8,
                                border: "none",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                color: activeTab === tab.value ? tabTheme.pillActiveText : tabTheme.pillText,
                                background: activeTab === tab.value ? tabTheme.pillActive : "transparent",
                                boxShadow: activeTab === tab.value ? "0 1px 4px rgba(var(--preset-primary-rgb), 0.25)" : "none",
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <TabsContent value="overview" className="space-y-6">
                    {/* Performance Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="border overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif", borderColor: isDark ? "rgba(var(--preset-primary-rgb), 0.12)" : "rgba(var(--preset-primary-rgb), 0.1)" }}>
                            <CardHeader>
                                <CardTitle style={{ color: tabTheme.title }}>Revenue vs Marketing Spend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={revenueTrendData.slice(-7)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Bar dataKey="revenue" fill="var(--preset-primary)" name="Revenue" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="border overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif", borderColor: isDark ? "rgba(var(--preset-primary-rgb), 0.12)" : "rgba(var(--preset-primary-rgb), 0.1)" }}>
                            <CardHeader>
                                <CardTitle style={{ color: tabTheme.title }}>Revenue Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={revenueTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Line type="monotone" dataKey="revenue" stroke="var(--preset-primary)" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Performance Summary Table */}
                    <Card className="border overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif", borderColor: isDark ? "rgba(var(--preset-primary-rgb), 0.12)" : "rgba(var(--preset-primary-rgb), 0.1)" }}>
                        <CardHeader>
                            <CardTitle style={{ color: tabTheme.title }}>Performance Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Platform</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Units</TableHead>
                                        <TableHead>Currency</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {performanceSummaryData.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{formatDate(item.date)}</TableCell>
                                            <TableCell>
                                                <StyledBadge value={item.platform} />
                                            </TableCell>
                                            <TableCell>{item.type}</TableCell>
                                            <TableCell>{formatCurrency(item.amount)}</TableCell>
                                            <TableCell>{item.units}</TableCell>
                                            <TableCell>{item.currency}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Marketing Performance Insights */}
                    <Card className="border overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif", borderColor: isDark ? "rgba(var(--preset-primary-rgb), 0.12)" : "rgba(var(--preset-primary-rgb), 0.1)" }}>
                        <CardHeader>
                            <CardTitle style={{ color: tabTheme.title }}>Marketing Performance Insights</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 rounded-lg border" style={{ borderColor: isDark ? "rgba(var(--preset-primary-rgb), 0.2)" : "rgba(var(--preset-primary-rgb), 0.15)", background: isDark ? "rgba(var(--preset-primary-rgb), 0.08)" : "rgba(var(--preset-primary-rgb), 0.06)" }}>
                                    <div className="text-2xl font-bold" style={{ color: isDark ? "var(--preset-lighter)" : "var(--preset-primary)" }}>{wooCommerceData.roas}x</div>
                                    <div className="text-sm" style={{ color: tabTheme.subtitle }}>ROAS</div>
                                    <div className="text-xs" style={{ color: tabTheme.subtitle }}>Return on Ad Spend</div>
                                </div>
                                <div className="text-center p-4 rounded-lg border" style={{ borderColor: isDark ? "rgba(var(--preset-primary-rgb), 0.2)" : "rgba(var(--preset-primary-rgb), 0.15)", background: isDark ? "rgba(var(--preset-primary-rgb), 0.08)" : "rgba(var(--preset-primary-rgb), 0.06)" }}>
                                    <div className="text-2xl font-bold" style={{ color: isDark ? "var(--preset-lighter)" : "var(--preset-primary)" }}>{formatCurrency(wooCommerceData.marketingSpend / wooCommerceData.purchases)}</div>
                                    <div className="text-sm" style={{ color: tabTheme.subtitle }}>CPA</div>
                                    <div className="text-xs" style={{ color: tabTheme.subtitle }}>Cost per Acquisition</div>
                                </div>
                                <div className="text-center p-4 rounded-lg border" style={{ borderColor: isDark ? "rgba(var(--preset-primary-rgb), 0.2)" : "rgba(var(--preset-primary-rgb), 0.15)", background: isDark ? "rgba(var(--preset-primary-rgb), 0.08)" : "rgba(var(--preset-primary-rgb), 0.06)" }}>
                                    <div className="text-2xl font-bold" style={{ color: isDark ? "var(--preset-lighter)" : "var(--preset-primary)" }}>{((wooCommerceData.purchases / wooCommerceData.totalReach) * 100).toFixed(2)}%</div>
                                    <div className="text-sm" style={{ color: tabTheme.subtitle }}>Conversion Rate</div>
                                    <div className="text-xs" style={{ color: tabTheme.subtitle }}>From Reach to Purchase</div>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg border" style={{ borderColor: isDark ? "rgba(var(--preset-primary-rgb), 0.12)" : "rgba(var(--preset-primary-rgb), 0.1)", background: isDark ? "rgba(var(--preset-primary-rgb), 0.04)" : "rgba(var(--preset-primary-rgb), 0.04)" }}>
                                <h4 className="font-semibold mb-2" style={{ color: tabTheme.title }}>Performance Summary</h4>
                                <p className="text-sm" style={{ color: tabTheme.subtitle }}>
                                    Your WooCommerce store is performing excellently with a strong ROAS of {wooCommerceData.roas}x.
                                    The conversion rate from Facebook ads is healthy at {((wooCommerceData.purchases / wooCommerceData.totalReach) * 100).toFixed(2)}%.
                                    Consider increasing ad spend on high-performing campaigns to scale revenue further.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="top-sellers" className="space-y-6">
                    <Card className="border overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif", borderColor: isDark ? "rgba(var(--preset-primary-rgb), 0.12)" : "rgba(var(--preset-primary-rgb), 0.1)" }}>
                        <CardHeader>
                            <CardTitle style={{ color: tabTheme.title }}>Top Selling Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product ID</TableHead>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>Quantity Sold</TableHead>
                                        <TableHead>Domain</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTopSellers.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">#{product.id}</TableCell>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell>{formatNumber(product.quantity)}</TableCell>
                                            <TableCell>
                                                <StyledBadge value={product.domain} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="orders" className="space-y-6">
                    <Card className="border overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif", borderColor: isDark ? "rgba(var(--preset-primary-rgb), 0.12)" : "rgba(var(--preset-primary-rgb), 0.1)" }}>
                        <CardHeader>
                            <CardTitle style={{ color: tabTheme.title }}>Recent Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order #</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Date Created</TableHead>
                                        <TableHead>Domain</TableHead>
                                        <TableHead>Line Items</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.id}</TableCell>
                                            <TableCell>
                                                <StyledBadge value={order.status} />
                                            </TableCell>
                                            <TableCell>{formatCurrency(order.total)}</TableCell>
                                            <TableCell>{formatDate(order.date)}</TableCell>
                                            <TableCell>
                                                <StyledBadge value={order.domain} />
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {order.items.join(", ")}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="daily-sales" className="space-y-6">
                    <Card className="border overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif", borderColor: isDark ? "rgba(var(--preset-primary-rgb), 0.12)" : "rgba(var(--preset-primary-rgb), 0.1)" }}>
                        <CardHeader>
                            <CardTitle style={{ color: tabTheme.title }}>Daily Sales Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Sales Amount</TableHead>
                                        <TableHead>Orders</TableHead>
                                        <TableHead>Currency</TableHead>
                                        <TableHead>Domain</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dailySalesData.map((day, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{formatDate(day.date)}</TableCell>
                                            <TableCell className="font-medium">{formatCurrency(day.sales)}</TableCell>
                                            <TableCell>{day.orders}</TableCell>
                                            <TableCell>{day.currency}</TableCell>
                                            <TableCell>
                                                <StyledBadge value={day.domain} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
