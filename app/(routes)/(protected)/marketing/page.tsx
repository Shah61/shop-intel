"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarketingScreen from "../../../../src/features/marketing/presentation/view/screen/marketing-screen";
import FacebookMarketingTab from "./facebook-marketing";

const MarketingPage = () => {
    const [activeTab, setActiveTab] = useState("personal");

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent pt-4 sm:pt-6 md:pt-10">
                        Marketing Dashboard
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage your marketing campaigns and strategies</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
                <TabsList className="grid w-full grid-cols-2 h-auto">
                    <TabsTrigger value="personal" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2">
                        <span className="truncate">Personal Marketing</span>
                    </TabsTrigger>
                    <TabsTrigger value="facebook" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-2">
                        <span className="truncate">Facebook Marketing</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                    <MarketingScreen />
                </TabsContent>

                <TabsContent value="facebook" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                    <FacebookMarketingTab />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MarketingPage;