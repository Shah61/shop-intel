"use client";

import { useState } from "react";
import DataCard from "@/src/core/shared/view/components/data-card";
import { PageHeader, PageSection } from "@/src/core/shared/view/components/page-section";
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
    Bar,
} from "recharts";

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
    roas: 2.78,
};

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
    { date: "Jan 15", revenue: 9200, orders: 92 },
];

const performanceSummaryData = [
    { date: "2025-01-15", platform: "WooCommerce", type: "Revenue", amount: 9200, units: 92, currency: "MYR" },
    { date: "2025-01-15", platform: "Facebook", type: "Marketing Spend", amount: 3200, units: 0, currency: "MYR" },
    { date: "2025-01-14", platform: "WooCommerce", type: "Revenue", amount: 8900, units: 89, currency: "MYR" },
    { date: "2025-01-14", platform: "Facebook", type: "Marketing Spend", amount: 2800, units: 0, currency: "MYR" },
    { date: "2025-01-13", platform: "WooCommerce", type: "Revenue", amount: 7500, units: 75, currency: "MYR" },
    { date: "2025-01-13", platform: "Facebook", type: "Marketing Spend", amount: 2500, units: 0, currency: "MYR" },
];

const topSellersData = [
    { id: 1, name: "Clothing Brand A", quantity: 245, domain: "magicclothing.com" },
    { id: 2, name: "Clothing Brand B", quantity: 198, domain: "magicclothing.com" },
    { id: 3, name: "Clothing Brand C", quantity: 167, domain: "magicclothing.com" },
    { id: 4, name: "Clothing Brand D", quantity: 156, domain: "magicclothing.com" },
    { id: 5, name: "Clothing Brand E", quantity: 134, domain: "magicclothing.com" },
    { id: 6, name: "Clothing Brand F", quantity: 123, domain: "magicclothing.com" },
    { id: 7, name: "Clothing Brand G", quantity: 98, domain: "magicclothing.com" },
    { id: 8, name: "Clothing Brand H", quantity: 87, domain: "magicclothing.com" },
];

const ordersData = [
    { id: "#1001", status: "Completed", total: 125.5, date: "2025-01-15", domain: "magicclothing.com", items: ["Clothing Brand A", "Gentle Facial Cleanser"] },
    { id: "#1002", status: "Processing", total: 89.9, date: "2025-01-15", domain: "magicclothing.com", items: ["Clothing Brand B"] },
    { id: "#1003", status: "Completed", total: 156.75, date: "2025-01-14", domain: "magicclothing.com", items: ["Clothing Brand C", "Clothing Brand D"] },
    { id: "#1004", status: "Shipped", total: 67.25, date: "2025-01-14", domain: "magicclothing.com", items: ["Clothing Brand E", "Clothing Brand F"] },
    { id: "#1005", status: "Completed", total: 198.0, date: "2025-01-13", domain: "magicclothing.com", items: ["Clothing Brand G", "Clothing Brand H", "Clothing Brand I"] },
];

const dailySalesData = [
    { date: "2025-01-15", sales: 9200, orders: 92, currency: "MYR", domain: "magicclothing.com" },
    { date: "2025-01-14", sales: 8900, orders: 89, currency: "MYR", domain: "magicclothing.com" },
    { date: "2025-01-13", sales: 7500, orders: 75, currency: "MYR", domain: "magicclothing.com" },
    { date: "2025-01-12", sales: 8200, orders: 82, currency: "MYR", domain: "magicclothing.com" },
    { date: "2025-01-11", sales: 7800, orders: 78, currency: "MYR", domain: "magicclothing.com" },
    { date: "2025-01-10", sales: 6500, orders: 65, currency: "MYR", domain: "magicclothing.com" },
    { date: "2025-01-09", sales: 7200, orders: 72, currency: "MYR", domain: "magicclothing.com" },
];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR", minimumFractionDigits: 2 }).format(value);
const formatNumber = (value: number) => new Intl.NumberFormat("en-MY").format(value);
const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const statusStyles: Record<string, string> = {
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    processing: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    shipped: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
    cancelled: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
};

const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "top-sellers", label: "Top Sellers", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "daily-sales", label: "Daily Sales", icon: Calendar },
];

export default function WooCommerceDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState({ start: "2025-01-01", end: "2025-01-31" });

    const filteredTopSellers = topSellersData.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredOrders = ordersData.filter(
        (o) =>
            o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.items.some((item) => item.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-10">
            <PageHeader
                title="WooCommerce"
                description="Track revenue, orders, marketing spend, and ROI for your WooCommerce store."
                actions={
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white dark:bg-card text-sm font-medium hover:bg-accent transition-colors shrink-0">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                }
            />

            {/* Hero: key number */}
            <PageSection title="Store performance" description="Summary for the selected date range.">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 p-6 sm:p-8 text-white ring-1 ring-emerald-500/20">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <p className="text-sm font-medium opacity-90 mb-1">Total revenue (period)</p>
                            <p className="text-4xl sm:text-5xl font-bold tracking-tight">{formatCurrency(wooCommerceData.revenue)}</p>
                            <p className="text-xs opacity-80 mt-2">{formatNumber(wooCommerceData.orders)} orders · Avg {formatCurrency(wooCommerceData.averageOrderValue)} AOV</p>
                        </div>
                        <div className="flex gap-8">
                            <div>
                                <p className="text-xs opacity-80 uppercase tracking-wider mb-1">Marketing spend</p>
                                <p className="text-2xl font-bold">{formatCurrency(wooCommerceData.marketingSpend)}</p>
                            </div>
                            <div className="w-px bg-white/20" />
                            <div>
                                <p className="text-xs opacity-80 uppercase tracking-wider mb-1">ROAS</p>
                                <p className="text-2xl font-bold">{wooCommerceData.roas}x</p>
                            </div>
                        </div>
                    </div>
                </div>
            </PageSection>

            {/* Metric Cards */}
            <PageSection title="Key metrics" description="Revenue, spend, and ROI at a glance.">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DataCard
                    icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
                    title="Total Revenue"
                    value={formatCurrency(wooCommerceData.revenue)}
                    trending="up"
                    change="+18.3%"
                    description={`${formatNumber(wooCommerceData.orders)} orders · Avg: ${formatCurrency(wooCommerceData.averageOrderValue)}`}
                    variant="emerald"
                />
                <DataCard
                    icon={<Target className="w-5 h-5 text-blue-600" />}
                    title="Marketing Spend"
                    value={formatCurrency(wooCommerceData.marketingSpend)}
                    trending="down"
                    change="-5.2%"
                    description={`${formatNumber(wooCommerceData.purchases)} purchases · ${formatNumber(wooCommerceData.totalReach)} reach`}
                    variant="blue"
                />
                <DataCard
                    icon={<TrendingUp className="w-5 h-5 text-violet-600" />}
                    title="ROI Performance"
                    value={formatCurrency(wooCommerceData.netProfit)}
                    trending="up"
                    change={`${wooCommerceData.roas}x ROAS`}
                    description={`ROI: ${wooCommerceData.roi}% · Net profit`}
                    variant="violet"
                />
                <DataCard
                    icon={<Zap className="w-5 h-5 text-amber-600" />}
                    title="TikTok Integration"
                    value="Coming Soon"
                    description="TikTok Shop integration in development"
                    variant="amber"
                />
            </div>
            </PageSection>

            {/* Search and Date Range */}
            <PageSection title="Data & filters" description="Narrow by date range or search products and orders.">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2 items-center">
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange((p) => ({ ...p, start: e.target.value }))}
                        className="h-10 px-3 rounded-xl border border-border bg-white dark:bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                    <span className="text-muted-foreground text-sm">to</span>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange((p) => ({ ...p, end: e.target.value }))}
                        className="h-10 px-3 rounded-xl border border-border bg-white dark:bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                </div>
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        placeholder="Search products, orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-white dark:bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                </div>
            </div>
            </PageSection>

            {/* Tab Navigation */}
            <div className="rounded-2xl border border-border bg-white dark:bg-card p-1.5 shadow-sm w-fit">
                <div className="flex items-center gap-1 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium whitespace-nowrap rounded-xl transition-all ${
                                    activeTab === tab.id
                                        ? "bg-foreground text-background shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
                <div className="space-y-8">
                    <PageSection title="Charts" description="Revenue and spend trends over the period.">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <ChartWrapper title="Revenue vs Marketing Spend">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={revenueTrendData.slice(-7)}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                                    <RechartsTooltip />
                                    <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartWrapper>
                        <ChartWrapper title="Revenue Trend">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                                    <RechartsTooltip />
                                    <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: "#10B981", strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartWrapper>
                    </div>
                    </PageSection>

                    <PageSection title="Performance summary" description="Daily breakdown by platform and type.">
                    <TableWrapper title="Performance Summary">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    {["Date", "Platform", "Type", "Amount", "Units", "Currency"].map((h) => (
                                        <th key={h} className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {performanceSummaryData.map((item, i) => (
                                    <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                                        <td className="px-5 py-3 text-[13px]">{formatDate(item.date)}</td>
                                        <td className="px-5 py-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${item.platform === "WooCommerce" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" : "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"}`}>{item.platform}</span>
                                        </td>
                                        <td className="px-5 py-3 text-[13px]">{item.type}</td>
                                        <td className="px-5 py-3 text-[13px] font-semibold">{formatCurrency(item.amount)}</td>
                                        <td className="px-5 py-3 text-[13px]">{item.units}</td>
                                        <td className="px-5 py-3 text-[13px]">{item.currency}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TableWrapper>
                    </PageSection>

                    <PageSection title="Marketing insights" description="ROAS, CPA, and conversion from ads.">
                    <div className="bg-white dark:bg-card rounded-2xl border border-border">
                        <div className="px-5 py-4 border-b border-border">
                            <h3 className="text-[15px] font-semibold">Marketing Performance Insights</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InsightCard value={`${wooCommerceData.roas}x`} label="ROAS" sub="Return on Ad Spend" variant="emerald" />
                                <InsightCard value={formatCurrency(wooCommerceData.marketingSpend / wooCommerceData.purchases)} label="CPA" sub="Cost per Acquisition" variant="blue" />
                                <InsightCard value={`${((wooCommerceData.purchases / wooCommerceData.totalReach) * 100).toFixed(2)}%`} label="Conversion Rate" sub="From Reach to Purchase" variant="violet" />
                            </div>
                            <div className="p-4 bg-accent/50 rounded-xl">
                                <h4 className="text-sm font-semibold mb-1.5">Performance Summary</h4>
                                <p className="text-[13px] text-muted-foreground leading-relaxed">
                                    Your WooCommerce store is performing excellently with a strong ROAS of {wooCommerceData.roas}x.
                                    The conversion rate from Facebook ads is healthy at {((wooCommerceData.purchases / wooCommerceData.totalReach) * 100).toFixed(2)}%.
                                    Consider increasing ad spend on high-performing campaigns to scale revenue further.
                                </p>
                            </div>
                        </div>
                    </div>
                    </PageSection>
                </div>
            )}

            {activeTab === "top-sellers" && (
                <TableWrapper title="Top Selling Products">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                {["Product ID", "Product Name", "Quantity Sold", "Domain"].map((h) => (
                                    <th key={h} className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTopSellers.map((p) => (
                                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                                    <td className="px-5 py-3 text-[13px] font-semibold">#{p.id}</td>
                                    <td className="px-5 py-3 text-[13px]">{p.name}</td>
                                    <td className="px-5 py-3 text-[13px] font-medium">{formatNumber(p.quantity)}</td>
                                    <td className="px-5 py-3"><span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent text-muted-foreground">{p.domain}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TableWrapper>
            )}

            {activeTab === "orders" && (
                <TableWrapper title="Recent Orders">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                {["Order #", "Status", "Total", "Date", "Domain", "Line Items"].map((h) => (
                                    <th key={h} className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((o) => (
                                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                                    <td className="px-5 py-3 text-[13px] font-semibold">{o.id}</td>
                                    <td className="px-5 py-3">
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusStyles[o.status.toLowerCase()] || "bg-muted text-muted-foreground"}`}>{o.status}</span>
                                    </td>
                                    <td className="px-5 py-3 text-[13px] font-medium">{formatCurrency(o.total)}</td>
                                    <td className="px-5 py-3 text-[13px]">{formatDate(o.date)}</td>
                                    <td className="px-5 py-3"><span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent text-muted-foreground">{o.domain}</span></td>
                                    <td className="px-5 py-3 text-[13px] text-muted-foreground">{o.items.join(", ")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TableWrapper>
            )}

            {activeTab === "daily-sales" && (
                <TableWrapper title="Daily Sales Overview">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                {["Date", "Sales Amount", "Orders", "Currency", "Domain"].map((h) => (
                                    <th key={h} className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {dailySalesData.map((d, i) => (
                                <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                                    <td className="px-5 py-3 text-[13px]">{formatDate(d.date)}</td>
                                    <td className="px-5 py-3 text-[13px] font-semibold">{formatCurrency(d.sales)}</td>
                                    <td className="px-5 py-3 text-[13px]">{d.orders}</td>
                                    <td className="px-5 py-3 text-[13px]">{d.currency}</td>
                                    <td className="px-5 py-3"><span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent text-muted-foreground">{d.domain}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TableWrapper>
            )}
        </div>
    );
}

function ChartWrapper({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-card rounded-2xl border border-border">
            <div className="px-5 py-4 border-b border-border">
                <h3 className="text-[15px] font-semibold">{title}</h3>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

function TableWrapper({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/30">
                <h3 className="text-[15px] font-semibold">{title}</h3>
            </div>
            <div className="overflow-x-auto">{children}</div>
        </div>
    );
}

function InsightCard({ value, label, sub, variant }: { value: string; label: string; sub: string; variant: "emerald" | "blue" | "violet" }) {
    const colors = {
        emerald: "bg-emerald-50/80 dark:bg-emerald-500/[0.06] ring-emerald-100 dark:ring-emerald-500/10",
        blue: "bg-blue-50/80 dark:bg-blue-500/[0.06] ring-blue-100 dark:ring-blue-500/10",
        violet: "bg-violet-50/80 dark:bg-violet-500/[0.06] ring-violet-100 dark:ring-violet-500/10",
    };
    const textColors = {
        emerald: "text-emerald-700 dark:text-emerald-400",
        blue: "text-blue-700 dark:text-blue-400",
        violet: "text-violet-700 dark:text-violet-400",
    };
    return (
        <div className={`text-center p-5 rounded-2xl ring-1 ${colors[variant]}`}>
            <div className={`text-2xl font-bold ${textColors[variant]}`}>{value}</div>
            <div className={`text-sm font-medium ${textColors[variant]} mt-1`}>{label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
        </div>
    );
}
