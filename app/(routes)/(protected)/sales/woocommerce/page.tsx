"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
    TrendingUp, 
    DollarSign, 
    ShoppingCart, 
    Package, 
    Globe,
    BarChart3,
    Calendar,
    Search,
    Download,
    Store,
    Target,
    Zap,
    Users,
    Eye
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
    PieChart,
    Pie,
    Cell
} from "recharts";

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

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "completed": return "bg-green-500";
        case "processing": return "bg-yellow-500";
        case "shipped": return "bg-blue-500";
        case "cancelled": return "bg-red-500";
        default: return "bg-gray-500";
    }
};

export default function WooCommerceDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedDomain, setSelectedDomain] = useState("all");
    const [dateRange, setDateRange] = useState({ start: "2025-01-01", end: "2025-01-31" });
    const [searchTerm, setSearchTerm] = useState("");

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                        WooCommerce Dashboard
                    </h1>
                    <p className="text-muted-foreground">Track your e-commerce performance and sales analytics</p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select Domain" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Domains</SelectItem>
                            <SelectItem value="magicclothing.com">magicclothing.com</SelectItem>
                            <SelectItem value="magicclothing.sg">magicclothing.sg</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{formatCurrency(wooCommerceData.revenue)}</div>
                        <div className="flex items-center gap-2 text-xs text-green-600">
                            <span>{formatNumber(wooCommerceData.orders)} orders</span>
                            <span>•</span>
                            <span>Avg: {formatCurrency(wooCommerceData.averageOrderValue)}</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">Top domain: {wooCommerceData.topDomain}</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">Marketing Spend</CardTitle>
                        <Target className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{formatCurrency(wooCommerceData.marketingSpend)}</div>
                        <div className="flex items-center gap-2 text-xs text-blue-600">
                            <span>{formatNumber(wooCommerceData.purchases)} purchases</span>
                            <span>•</span>
                            <span>{formatNumber(wooCommerceData.totalReach)} reach</span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">Facebook Ads</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-600">ROI Performance</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-700">{formatCurrency(wooCommerceData.netProfit)}</div>
                        <div className="flex items-center gap-2 text-xs text-purple-600">
                            <span>ROI: {wooCommerceData.roi}%</span>
                            <span>•</span>
                            <span>ROAS: {wooCommerceData.roas}x</span>
                        </div>
                        <p className="text-xs text-purple-600 mt-1">Net profit</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-600">TikTok Integration</CardTitle>
                        <Zap className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-700">Coming Soon</div>
                        <p className="text-xs text-orange-600 mt-1">TikTok Shop integration</p>
                        <Badge className="mt-2 bg-orange-500">In Development</Badge>
                    </CardContent>
                </Card>
            </div>

            {/* Date Range and Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex gap-2">
                    <Input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-40"
                    />
                    <span className="flex items-center text-muted-foreground">to</span>
                    <Input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-40"
                    />
                </div>
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products, orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="top-sellers" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Top Sellers
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Orders
                    </TabsTrigger>
                    <TabsTrigger value="daily-sales" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Daily Sales
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Performance Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue vs Marketing Spend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={revenueTrendData.slice(-7)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={revenueTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Performance Summary Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Summary</CardTitle>
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
                                                <Badge variant={item.platform === "WooCommerce" ? "default" : "secondary"}>
                                                    {item.platform}
                                                </Badge>
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Marketing Performance Insights</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{wooCommerceData.roas}x</div>
                                    <div className="text-sm text-green-600">ROAS</div>
                                    <div className="text-xs text-green-500">Return on Ad Spend</div>
                                </div>
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(wooCommerceData.marketingSpend / wooCommerceData.purchases)}</div>
                                    <div className="text-sm text-blue-600">CPA</div>
                                    <div className="text-xs text-blue-500">Cost per Acquisition</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">{((wooCommerceData.purchases / wooCommerceData.totalReach) * 100).toFixed(2)}%</div>
                                    <div className="text-sm text-purple-600">Conversion Rate</div>
                                    <div className="text-xs text-purple-500">From Reach to Purchase</div>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <h4 className="font-semibold mb-2">Performance Summary</h4>
                                <p className="text-sm text-muted-foreground">
                                    Your WooCommerce store is performing excellently with a strong ROAS of {wooCommerceData.roas}x. 
                                    The conversion rate from Facebook ads is healthy at {((wooCommerceData.purchases / wooCommerceData.totalReach) * 100).toFixed(2)}%. 
                                    Consider increasing ad spend on high-performing campaigns to scale revenue further.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="top-sellers" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Selling Products</CardTitle>
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
                                                <Badge variant="outline">{product.domain}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="orders" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Orders</CardTitle>
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
                                                <Badge className={getStatusColor(order.status)}>
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatCurrency(order.total)}</TableCell>
                                            <TableCell>{formatDate(order.date)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{order.domain}</Badge>
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Sales Overview</CardTitle>
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
                                                <Badge variant="outline">{day.domain}</Badge>
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
