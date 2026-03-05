"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useState } from "react"
import AnalyticsPhysicalScreen from "./analytics-physical-screen"
import { AnalysisTimeFrame } from "@/src/features/sales/data/model/analytics-entity"
import { useRouter } from "next/navigation"

const OverviewPhysicalScreen = () => {

    const [timeframe, setTimeframe] = useState<AnalysisTimeFrame>(AnalysisTimeFrame.DAILY)
    const router = useRouter()

    return (
        <div className="flex flex-col items-start justify-center w-full gap-4">
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
                    router.push(`/physical?tab=${tab}`);
                }}
                setTimeframe={(timeframe: AnalysisTimeFrame) => setTimeframe(timeframe)}
                timeframe={timeframe}
            />
        </div>
    )
}

export default OverviewPhysicalScreen