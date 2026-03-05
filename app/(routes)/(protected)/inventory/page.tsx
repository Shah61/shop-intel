"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { InventoryScreen } from "@/src/features/inventory/presentation/view/screen/inventory-screen";
import NinjaVanDashboard from "./ninjavan/page";

function InventoryContent() {
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab") || "inventory";

    return (
        <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 md:pt-10">
            {tab === "ninjavan" ? <NinjaVanDashboard /> : <InventoryScreen />}
        </div>
    );
}

export default function InventoryPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        }>
            <InventoryContent />
        </Suspense>
    );
}
