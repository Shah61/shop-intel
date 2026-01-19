"use client"

import AddSalesForm from "../components/sales/add-sales-form"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useState } from "react"
import AddRevenueForm from "../components/sales/revenue-management-system-screen"
import InventoryManagementSystem from "../components/sales/inventory-management-system-screen"
import RevenueManagementSystem from "../components/sales/revenue-management-system-screen"
import ProductManagementSystem from "../components/sales/product-management-system-screen"
import OrdersManagementSystem from "../components/sales/order-management-system-screen"
import StaffScreen from "./physical/staff-screen"
import OverviewDashboardScreen from "./overview-dashboard-screen"
import OverviewPhysicalScreen from "./physical/overview-physical-screen"

const AddSalesScreen = () => {

    return (
        <div className="flex flex-col items-start justify-center w-full">

            <OverviewPhysicalScreen />
        </div>
    )
}

export default AddSalesScreen