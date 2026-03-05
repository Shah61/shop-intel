"use client";

import { useSearchParams } from "next/navigation";
import TikTokDashboardScreen from "@/src/features/sales/presentation/view/screen/tiktok-dashboard-screen";
import ShopeeDashboardScreen from "@/src/features/sales/presentation/view/screen/shopee-dashboard-screen";
import ShopifyDashboardScreen from "@/src/features/sales/presentation/view/screen/shopify-dashboard-screen";
import OverviewDashboardScreen from "@/src/features/sales/presentation/view/screen/overview-dashboard-screen";
import FacebookMarketingDashboard from "./facebook/page";
import WooCommerceDashboard from "./woocommerce/page";
import { Suspense } from "react";

function SalesContent() {
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab") || "overview";

    switch (tab) {
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
}

export default function SalesPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        }>
            <SalesContent />
        </Suspense>
    );
}
