"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MarketingScreen from "../../../../src/features/marketing/presentation/view/screen/marketing-screen";
import FacebookMarketingTab from "./facebook-marketing";
import AIMarketingGenerator from "../../../../src/features/marketing/presentation/view/components/ai-marketing-generator";

function MarketingContent() {
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab") || "personal";

    const titles: Record<string, { heading: string; sub: string }> = {
        personal: { heading: "Marketing Dashboard", sub: "Manage your marketing campaigns and strategies" },
        facebook: { heading: "Facebook Marketing", sub: "Manage your Facebook ad campaigns" },
        ai: { heading: "AI Marketing Generator", sub: "Create stunning marketing content with AI-powered tools" },
    }
    const { heading, sub } = titles[tab] || titles.personal

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent pt-4 sm:pt-6 md:pt-10">
                        {heading}
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{sub}</p>
                </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
                {tab === "facebook" ? <FacebookMarketingTab /> : tab === "ai" ? <AIMarketingGenerator /> : <MarketingScreen />}
            </div>
        </div>
    );
}

export default function MarketingPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        }>
            <MarketingContent />
        </Suspense>
    );
}
