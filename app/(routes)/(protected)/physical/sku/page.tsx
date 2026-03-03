"use client";

import PhysicalSkusTable from "@/src/features/sales/presentation/view/components/physical/physical-sku-table";
import { useAnalyticsSKU, usePhysicalSKU } from "@/src/features/sales/presentation/tanstack/analytics-tanstack";
import { usePhysicalStock } from "@/src/features/sales/presentation/tanstack/physical/overview-tanstack";

const SkuPage = () => {
    const { data: skus, isLoading, error } = usePhysicalSKU();
    const { data: stock, isLoading: stockLoading, error: stockError } = usePhysicalStock();

    if (isLoading || stockLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <p>Loading SKUs...</p>
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
            selectedTab="skus"
        />
    );
};

export default SkuPage;