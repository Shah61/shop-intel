"use client";

import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import TikTokDashboardScreen from "@/src/features/sales/presentation/view/screen/tiktok-dashboard-screen";
import ShopeeDashboardScreen from "@/src/features/sales/presentation/view/screen/shopee-dashboard-screen";
import ShopifyDashboardScreen from "@/src/features/sales/presentation/view/screen/shopify-dashboard-screen";
import OverviewDashboardScreen from "@/src/features/sales/presentation/view/screen/overview-dashboard-screen";
import FacebookMarketingDashboard from "./facebook/page";
import WooCommerceDashboard from "./woocommerce/page";
import { PageHeader } from "@/src/core/shared/view/components/page-section";

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

const platforms = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "tiktok", label: "TikTok", img: "images/tiktok2.png" },
    { id: "shopee", label: "Shopee", img: "images/shopee.png" },
    { id: "shopify", label: "Shopify", img: "images/shopify.png" },
    { id: "facebook", label: "Facebook", img: "/images/facebook.png" },
    { id: "woocommerce", label: "WooCommerce", img: "/images/woocommerce.png" },
];

const EcommerceDashboard = () => {
    const [activeTab, setActiveTab] = useState("overview");

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
        <div className="space-y-8">
            <PageHeader
                title="Sales Dashboard"
                description="Monitor revenue, orders, and performance across TikTok, Shopee, Shopify, Facebook, and WooCommerce in one place."
            />

            {/* Platform tabs */}
            <div className="rounded-2xl border border-border bg-white dark:bg-card p-1.5 shadow-sm">
                <div className="flex items-center gap-1 overflow-x-auto">
                    {platforms.map((platform) => (
                        <button
                            key={platform.id}
                            onClick={() => setActiveTab(platform.id)}
                            className={`
                                flex items-center gap-2 px-5 py-2.5 text-sm font-medium whitespace-nowrap rounded-xl
                                transition-all duration-200
                                ${activeTab === platform.id
                                    ? "bg-foreground text-background shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                                }
                            `}
                        >
                            {platform.img ? (
                                <img
                                    src={platform.img}
                                    alt={platform.label}
                                    className="w-5 h-5 object-contain"
                                />
                            ) : (
                                platform.icon
                            )}
                            <span>{platform.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div>{renderContent()}</div>
        </div>
    );
};

export default EcommerceDashboard;
