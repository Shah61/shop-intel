"use client"
import { useState } from "react";
import { useAllSKU, useAnalyticsSKU, useSkuPerformanceDetail, useSkuPerformanceHistoricalData } from "../../tanstack/analytics-tanstack";
import SkuBarChart from "../components/sku/sku-bar-chart";
import { SKUPerformanceChart } from "../components/sku/sku-chart";
import SkuPieChart from "../components/sku/sku-pie-chart";
import SkuTable from "../components/sku/sku-table";
import TopPerformingSkusTable from "../components/sku/top-performing-sku-table";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbList,
    BreadcrumbPage
} from "@/components/ui/breadcrumb";
import { AnalysisSKUEntity, SkuPerformanceDetailEntity } from "../../../data/model/analytics-entity";


const SkuScreen = () => {

    const [selectedSku, setSelectedSku] = useState("NBCB");

    const {
        data: skuData,
        isLoading: skuLoading,
        error: skuError
    } = useAnalyticsSKU();

    const {
        data: skuPerformanceHistoricalData,
        isLoading: skuPerformanceHistoricalDataLoading,
        error: skuPerformanceHistoricalDataError
    } = useSkuPerformanceHistoricalData({ year: "2025", quarter: "Q1" });

    const {
        data: skuDataPerformanceDetail,
        isLoading: skuPerformanceDetailLoading,
        error: skuPerformanceDetailError
    } = useSkuPerformanceDetail({ year: "2025", quarter: "Q1", sku: selectedSku });

    const {
        data: allSKU,
        isLoading: allSKULoading,
        error: allSKUError
    } = useAllSKU();

    return (
        <div className="flex flex-col gap-4 w-full">

            <Breadcrumb className="mt-4">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/sales">Sales</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/sales/sku">SKUs Sales</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>


            <div>
                <p className="text-2xl font-extrabold">Top Performing SKUs</p>
                <p className="text-muted-foreground text-sm">Track your top performing SKUs</p>
            </div>


            <SKUPerformanceChart />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SkuPieChart />
                <SkuBarChart
                    skuData={Array.isArray(skuDataPerformanceDetail) && skuDataPerformanceDetail.length > 0 && 'date' in skuDataPerformanceDetail[0] 
                        ? skuDataPerformanceDetail as SkuPerformanceDetailEntity[]
                        : (skuDataPerformanceDetail as AnalysisSKUEntity[] || []).map((item, index) => ({
                            date: `2025-${String(index + 1).padStart(2, '0')}-01`, // Generate mock dates
                            data: item
                        }))
                    }
                    allSKU={allSKU || []}
                    selectedSku={selectedSku}
                    setSelectedSku={setSelectedSku}
                />
            </div>

            <SkuTable data={skuData || []} isLimit={false} isLoading={skuLoading} />

            {/* <TopPerformingSkusTable /> */}





        </div>
    );
};

export default SkuScreen;