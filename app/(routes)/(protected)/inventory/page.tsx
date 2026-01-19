"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryScreen } from "@/src/features/inventory/presentation/view/screen/inventory-screen";
import NinjaVanDashboard from "./ninjavan/page";

const InventoryPage = () => {
    const [activeTab, setActiveTab] = useState("inventory");

    return (
        <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 md:pt-10">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
                <TabsList className="grid w-full grid-cols-2 h-auto overflow-x-auto">
                    <TabsTrigger value="inventory" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2">
                        <span className="truncate">Inventory Management</span>
                    </TabsTrigger>
                    <TabsTrigger value="ninjavan" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2">
                        <span className="truncate">NinjaVan Delivery</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                    <InventoryScreen />
                </TabsContent>

                <TabsContent value="ninjavan" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                    <NinjaVanDashboard />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default InventoryPage;