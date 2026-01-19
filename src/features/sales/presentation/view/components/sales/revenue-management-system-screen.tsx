"use client"

import DataCard from "@/src/core/shared/view/components/data-card"
import { DollarSign, PlusCircle } from "lucide-react"
import { useEffect } from "react"
import { RevenueDataTable } from "../revenue/revenue-data-table"
import { RevenueEntity } from "@/src/features/sales/data/model/revenue-entity"
import { getRevenue } from "@/src/features/sales/data/services/revenue-api.service"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import AddRevenueForm from "../revenue/add-revenue-form"


const dataCards = [
    {
        title: "Total Revenue",
        value: "$100,000",
        change: "10%",
        trending: "up",
        icon: <DollarSign className="h-4 w-4 text-green-500" />
    },
    {
        title: "Total Revenue",
        value: "$100,000",
        change: "10%",
        trending: "up",
        icon: <DollarSign className="h-4 w-4 text-blue-500" />
    },
    {
        title: "Total Revenue",
        value: "$100,000",
        change: "10%",
        trending: "up",
        icon: <DollarSign className="h-4 w-4 text-orange-500" />
    }
]


const RevenueManagementSystem = () => {

    const [revenue, setRevenue] = useState<RevenueEntity[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getRevenue().then(setRevenue).finally(() => setLoading(false))
    }, [])


    return (
        <div className="flex flex-col items-start justify-center w-full gap-4">

            <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center w-full">
                <div>
                    <h2 className="text-2xl font-bold">Revenue Management System</h2>
                    <p className="text-muted-foreground">Track your overall sales performance and revenue</p>
                </div>

                <AddRevenueForm />

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {
                    dataCards.map((card, index) => (
                        <DataCard
                            key={index}
                            title={card.title}
                            value={card.value}
                            change={card.change}
                            trending={card.trending as "up" | "down"}
                            icon={card.icon}
                        />
                    ))
                }
            </div>

            <RevenueDataTable data={revenue} loading={loading} />




        </div>
    )
}

export default RevenueManagementSystem