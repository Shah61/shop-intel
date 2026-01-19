"use client"

import ProductManagementSystem from "../../components/sales/product-management-system-screen"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import StaffScreen from "./staff-screen"
import { useState } from "react"
import OrderManagementSystemScreen from "../../components/sales/order-management-system-screen"
import PhysicalSkusTable from "../../components/physical/physical-sku-table"
import { useAnalyticsSKU, usePhysicalSKU } from "../../../tanstack/analytics-tanstack"
import AnalyticsPhysicalScreen from "./analytics-physical-screen"
import toast from "react-hot-toast"
import { AnalysisTimeFrame } from "@/src/features/sales/data/model/analytics-entity"
import { usePhysicalStock } from "../../../tanstack/physical/overview-tanstack"
import { useRouter } from "next/navigation"
import PhysicalSidebar from "@/src/components/ui/physical-sidebar"

const OverviewPhysicalScreen = () => {

    const [timeframe, setTimeframe] = useState<AnalysisTimeFrame>(AnalysisTimeFrame.DAILY)
    const router = useRouter()

    const { data: skus, isLoading, error } = usePhysicalSKU()

    const {
        data: stock,
        isLoading: stockLoading,
        error: stockError
    } = usePhysicalStock()

    return (
        <PhysicalSidebar>
            <div className="flex flex-col items-start justify-center w-full gap-4">
                {/* Title and Tabs in same row */}
                <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-3 sm:gap-0 pt-4 sm:pt-6 md:pt-8">
                    <h1 className="text-xl sm:text-2xl font-bold">Analytics Physical Store</h1>
                    <Tabs value={timeframe} onValueChange={(value: string) => setTimeframe(value as AnalysisTimeFrame)} className="w-full sm:w-fit">
                        <TabsList className="grid grid-cols-4 w-full sm:w-auto h-auto">
                            <TabsTrigger value={AnalysisTimeFrame.DAILY} className="text-xs sm:text-sm px-2 sm:px-3 py-2">Daily</TabsTrigger>
                            <TabsTrigger value={AnalysisTimeFrame.WEEKLY} className="text-xs sm:text-sm px-2 sm:px-3 py-2">Weekly</TabsTrigger>
                            <TabsTrigger value={AnalysisTimeFrame.MONTHLY} className="text-xs sm:text-sm px-2 sm:px-3 py-2">Monthly</TabsTrigger>
                            <TabsTrigger value={AnalysisTimeFrame.YEARLY} className="text-xs sm:text-sm px-2 sm:px-3 py-2">Yearly</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <AnalyticsPhysicalScreen
                    setActiveTab={(tab: string) => {
                        if (tab === "product") {
                            router.push("/physical/product");
                        } else if (tab === "orders") {
                            router.push("/physical/orders");
                        } else if (tab === "staff") {
                            router.push("/physical/staff");
                        } else if (tab === "sku") {
                            router.push("/physical/sku");
                        }
                    }}
                    setTimeframe={(timeframe: AnalysisTimeFrame) => setTimeframe(timeframe)}
                    timeframe={timeframe}
                />
            </div>
        </PhysicalSidebar>
    )
}

export default OverviewPhysicalScreen