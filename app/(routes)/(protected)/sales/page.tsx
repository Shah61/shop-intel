"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
    TrendingUp,
    DollarSign,
    Package,
    ShoppingCart,
    ArrowUp,
    ArrowDown,
    Search,
    Filter,
    BarChart3,
    Calendar,
    MoreHorizontal,
    ChevronDown,
    ArrowUpRight,
    User,
    ShoppingBag,
    Store,
    Video,
    AreaChart,
    LayoutDashboard,
    Music2
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    BarChart,
    Bar,
    Area
} from "recharts";
import { SalesOverviewChart } from "@/src/features/sales/presentation/view/components/sales/sales-overview-chart";
import { SalesSummaryCards } from "@/src/features/sales/presentation/view/components/sales/sales-summary-list";
import { TopPerformingSkusList } from "@/src/features/sales/presentation/view/components/sku/top-performing-sku-list";
import { SkuOverviewPieChart } from "@/src/features/sales/presentation/view/components/sku/sku-overview-pie-chart";
import TikTokDashboardScreen from "@/src/features/sales/presentation/view/screen/tiktok-dashboard-screen";
import ShopeeDashboardScreen from "@/src/features/sales/presentation/view/screen/shopee-dashboard-screen";
import ShopifyDashboardScreen from "@/src/features/sales/presentation/view/screen/shopify-dashboard-screen";
import OverviewDashboardScreen from "@/src/features/sales/presentation/view/screen/overview-dashboard-screen";
import AddSalesScreen from "@/src/features/sales/presentation/view/screen/add-sales-screen";
import FacebookMarketingDashboard from "./facebook/page";
import WooCommerceDashboard from "./woocommerce/page";

export interface PlatformMetrics {
    platform: 'tiktok' | 'shopee' | 'shopify' | 'physical';
    dailySales: number;
    orderCount: number;
    averageOrderValue: number;
    conversionRate: number;
    icon: React.ReactNode;
    trend: {
        percentage: number;
        direction: 'up' | 'down';
    };
}

const EcommerceDashboard = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [filterPeriod, setFilterPeriod] = useState("7d");
    const [productView, setProductView] = useState("grid");
    const [sortOrder, setSortOrder] = useState("popularity");

    const sidebarItems = [
        {
            id: "overview",
            label: "Overview",
            icon: <LayoutDashboard className="h-5 w-5" />
        },
        {
            id: "tiktok",
            label: "TikTok",
            icon: <img src="images/tiktok2.png" alt="TikTok" className="h-10 w-10 object-contain" />
        },
        {
            id: "shopee",
            label: "Shopee",
            icon: <img src="images/shopee.png" alt="Shopee" className="h-10 w-10 object-contain" />
        },
        {
            id: "shopify",
            label: "Shopify",
            icon: <img src="images/shopify.png" alt="Shopify" className="h-10 w-10 object-contain" />
        },
        {
            id: "facebook",
            label: "Facebook",
            icon: <img src="/images/facebook.png" alt="Facebook" className="h-10 w-10 object-contain" />
        },
        {
            id: "woocommerce",
            label: "Woo",
            icon: <img src="/images/woocommerce.png" alt="WooCommerce" className="h-10 w-10 object-contain" />
        }
    ];

    // Platform-specific metrics
    const platformMetrics: PlatformMetrics[] = [
        {
            platform: 'tiktok',
            dailySales: 12500,
            orderCount: 450,
            averageOrderValue: 27.78,
            conversionRate: 4.2,
            icon: <img src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/1200px-TikTok_logo.svg.png" alt="TikTok" className="h-5 w-5 object-contain" />,
            trend: {
                percentage: 15.8,
                direction: 'up'
            }
        },
        {
            platform: 'shopee',
            dailySales: 18900,
            orderCount: 620,
            averageOrderValue: 30.48,
            conversionRate: 3.8,
            icon: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Shopee_logo.svg/2560px-Shopee_logo.svg.png" alt="Shopee" className="h-5 w-5 object-contain" />,
            trend: {
                percentage: 8.3,
                direction: 'up'
            }
        },
        {
            platform: 'shopify',
            dailySales: 15600,
            orderCount: 380,
            averageOrderValue: 41.05,
            conversionRate: 2.9,
            icon: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopify_logo.svg/2560px-Shopify_logo.svg.png" alt="Shopify" className="h-5 w-5 object-contain" />,
            trend: {
                percentage: 2.1,
                direction: 'down'
            }
        }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "overview":
                return <OverviewDashboardScreen />;
            case "tiktok":
                return <TikTokDashboardScreen />;
            case "shopee":
                return <ShopeeDashboardScreen />;
            case "shopify":
                return <ShopifyDashboardScreen />;
            case "facebook":
                return <FacebookMarketingDashboard />;
            case "woocommerce":
                return <WooCommerceDashboard />;
            default:
                return <OverviewDashboardScreen />;
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-full">
            {/* Mobile Tab Bar */}
            <div className="md:hidden w-full border-b bg-background overflow-x-auto">
                <div className="flex space-x-1 p-2">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                                activeTab === item.id
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-accent hover:text-accent-foreground"
                            }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:block w-20 lg:w-24 bg-background border-r min-h-screen pt-8 p-0 -ml-4 md:-ml-10 mr-2 sidebar-fixed-width">
                <nav className="space-y-6 lg:space-y-8 flex flex-col items-center px-0 m-0 w-full">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex flex-col items-center justify-center rounded-lg transition-colors m-0 p-2 w-14 h-14 lg:w-16 lg:h-16 ${
                                activeTab === item.id
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-accent hover:text-accent-foreground"
                            }`}
                            style={{paddingLeft: 8, marginLeft: 0}}
                            title={item.label}
                        >
                            {item.icon}
                            <span className="text-[10px] lg:text-xs mt-1 font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden">
                {renderContent()}
            </div>
        </div>
    );
};

export default EcommerceDashboard;