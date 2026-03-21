"use client";

import { useSearchParams } from "next/navigation";
import TikTokDashboardScreen from "@/src/features/sales/presentation/view/screen/tiktok-dashboard-screen";
import ShopeeDashboardScreen from "@/src/features/sales/presentation/view/screen/shopee-dashboard-screen";
import ShopifyDashboardScreen from "@/src/features/sales/presentation/view/screen/shopify-dashboard-screen";
import OverviewDashboardScreen from "@/src/features/sales/presentation/view/screen/overview-dashboard-screen";
import WooCommerceDashboard from "./woocommerce/page";
import { Suspense } from "react";
import { FullLoader } from "@/components/ui/shop-intel-loader";

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
        case "woocommerce":
            return <WooCommerceDashboard />;
        default:
            return <OverviewDashboardScreen />;
    }
}

export default function SalesPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[min(70vh,520px)] w-full items-center justify-center rounded-2xl border border-border/40 bg-muted/20">
                    <FullLoader
                        messages={[
                            "Syncing your channels",
                            "Pulling latest sales data",
                            "Crunching the numbers",
                            "Almost there",
                        ]}
                        className="!py-10"
                    />
                </div>
            }
        >
            <SalesContent />
        </Suspense>
    );
}
