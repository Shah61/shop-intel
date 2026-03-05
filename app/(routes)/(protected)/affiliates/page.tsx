"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AffiliateListScreen from "@/src/features/affiliates/presentation/view/screen/affiliate-list-screen";
import PayoutsScreen from "@/src/features/affiliates/presentation/view/screen/payouts-screen";
import CommissionsScreen from "@/src/features/affiliates/presentation/view/screen/commissions-screen";

function AffiliatesContent() {
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab") || "affiliates";

    switch (tab) {
        case "payouts":
            return <PayoutsScreen />;
        case "commissions":
            return <CommissionsScreen />;
        default:
            return <AffiliateListScreen />;
    }
}

export default function AffiliatesPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        }>
            <AffiliatesContent />
        </Suspense>
    );
}
