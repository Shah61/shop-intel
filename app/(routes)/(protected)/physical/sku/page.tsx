"use client";

import PhysicalSkusTable from "@/src/features/sales/presentation/view/components/physical/physical-sku-table";
import { useAnalyticsSKU, usePhysicalSKU } from "@/src/features/sales/presentation/tanstack/analytics-tanstack";
import { usePhysicalStock } from "@/src/features/sales/presentation/tanstack/physical/overview-tanstack";
import PhysicalSidebar from "@/src/components/ui/physical-sidebar";

const SkuPage = () => {
    const { data: skus, isLoading, error } = usePhysicalSKU();
    
    const {
        data: stock,
        isLoading: stockLoading,
        error: stockError
    } = usePhysicalStock();

    if (isLoading || stockLoading) {
        return (
            <PhysicalSidebar>
                <div className="pt-8">
                    <div className="flex justify-center items-center h-40">
                        <p>Loading SKUs...</p>
                    </div>
                </div>
            </PhysicalSidebar>
        );
    }

    if (error || stockError) {
        return (
            <PhysicalSidebar>
                <div className="pt-8">
                    <div className="text-red-500">
                        Error loading data: {error?.message || stockError?.message || 'Unknown error'}
                    </div>
                </div>
            </PhysicalSidebar>
        );
    }

    return (
        <PhysicalSidebar>
            <div className="pt-8">
                <PhysicalSkusTable
                    stock={stock || []}
                    skus={skus || []} 
                    onSelectTap={() => { }} 
                    selectedTab={"skus"} 
                />
            </div>
        </PhysicalSidebar>
    );
};

export default SkuPage;