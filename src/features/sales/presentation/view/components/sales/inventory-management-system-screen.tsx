"use client"

import { DollarSign } from "lucide-react"
import AddRevenueForm from "../revenue/add-revenue-form"
import DataCard from "@/src/core/shared/view/components/data-card"
import { InventoryDataTable } from "../inventory/inventory-data-table"
import { useEffect, useState } from "react"
import { InventoryEntity } from "@/src/features/sales/data/model/inventory-entity"
import { getListInventory } from "@/src/features/sales/data/services/inventory-api.service"
import AddInventoryForm from "../inventory/add-inventory-form"


const InventoryManagementSystemScreen = () => {

    const [inventory, setInventory] = useState<InventoryEntity[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getListInventory().then(setInventory).finally(() => setLoading(false))
    }, [])


    //data card total inventory, high stock, low stock  
    const dataCards = [
        { title: "Total Inventory", value: 1000, change: 10, trending: "up", icon: <DollarSign className="h-4 w-4 text-green-500" /> },
        { title: "High Stock", value: 1000, change: 10, trending: "up", icon: <DollarSign className="h-4 w-4 text-blue-500" /> },
        { title: "Low Stock", value: 1000, change: 10, trending: "up", icon: <DollarSign className="h-4 w-4 text-orange-500" /> },
    ]

    return (
        <div className="flex flex-col items-start justify-center w-full gap-4">
            <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center w-full">
                <div>
                    <h2 className="text-2xl font-bold">Inventory Management System</h2>
                    <p className="text-muted-foreground">Track your inventory and stock levels</p>
                </div>

                <AddInventoryForm />

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                {
                    dataCards.map((card, index) => (
                        <DataCard
                            key={index}
                            title={card.title}
                            value={card.value.toString()}
                            change={card.change.toString()}
                            trending={card.trending as "up" | "down"}
                            icon={card.icon}
                        />
                    ))
                }
            </div>

            <InventoryDataTable data={inventory} loading={loading} />


        </div>
    )
}

export default InventoryManagementSystemScreen