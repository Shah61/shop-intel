"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import OverviewPhysicalScreen from "@/src/features/sales/presentation/view/screen/physical/overview-physical-screen";
import ProductManagementSystem from "@/src/features/sales/presentation/view/components/sales/product-management-system-screen";
import CategoriesScreen from "@/src/features/sales/presentation/view/components/sales/categories-screen";
import OrderManagementSystemScreen from "@/src/features/sales/presentation/view/components/sales/order-management-system-screen";
import CollectionScreen from "@/src/features/sales/presentation/view/components/sales/collection-screen";
import DiscountScreen from "@/src/features/sales/presentation/view/components/sales/discount-screen";
import StaffScreen from "@/src/features/sales/presentation/view/screen/physical/staff-screen";
import PhysicalSkusTable from "@/src/features/sales/presentation/view/components/physical/physical-sku-table";
import { usePhysicalSKU } from "@/src/features/sales/presentation/tanstack/analytics-tanstack";
import { usePhysicalStock } from "@/src/features/sales/presentation/tanstack/physical/overview-tanstack";

function SkuTab() {
    const { data: skus, isLoading, error } = usePhysicalSKU();
    const { data: stock, isLoading: stockLoading, error: stockError } = usePhysicalStock();

    if (isLoading || stockLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (error || stockError) {
        return (
            <div className="text-red-500">
                Error loading data: {error?.message || stockError?.message || "Unknown error"}
            </div>
        );
    }

    return (
        <PhysicalSkusTable
            stock={stock || []}
            skus={skus || []}
            onSelectTap={() => {}}
            selectedTab={"skus"}
        />
    );
}

function PhysicalContent() {
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab") || "analytics";

    switch (tab) {
        case "product":
            return <div className="pt-4"><ProductManagementSystem /></div>;
        case "categories":
            return <div className="pt-4"><CategoriesScreen /></div>;
        case "orders":
            return <div className="pt-4"><OrderManagementSystemScreen /></div>;
        case "collection":
            return <div className="pt-4"><CollectionScreen /></div>;
        case "discount":
            return <div className="pt-4"><DiscountScreen /></div>;
        case "staff":
            return <div className="pt-4"><StaffScreen /></div>;
        case "sku":
            return <div className="pt-4"><SkuTab /></div>;
        default:
            return <OverviewPhysicalScreen />;
    }
}

export default function PhysicalPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        }>
            <PhysicalContent />
        </Suspense>
    );
}
