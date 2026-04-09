"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import MarketingScreen from "../../../../src/features/marketing/presentation/view/screen/marketing-screen";
import FacebookMarketingTab from "./facebook-marketing";
import AIMarketingGenerator from "../../../../src/features/marketing/presentation/view/components/ai-marketing-generator";

function MarketingContent() {
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab") || "personal";
    const [aiLocked, setAiLocked] = useState(false);

    const titles: Record<string, { heading: string; sub: string }> = {
        personal: { heading: "", sub: "" },
        facebook: { heading: "", sub: "" },
        ai: { heading: "AI Marketing Generator", sub: "Create stunning marketing content with AI-powered tools" },
    }
    const { heading, sub } = titles[tab] || titles.personal

    const isLocked = tab === "ai" && aiLocked

    return (
        <div
            className={`-mt-4 sm:-mt-6 lg:-mt-8 ${isLocked ? "flex flex-col h-[calc(100vh-var(--header-height,64px))] overflow-hidden" : "space-y-4 sm:space-y-6"}`}
        >
            {(heading || sub) && (
                <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 flex-shrink-0 ${tab === "ai" ? "pt-4" : ""}`}>
                    <div>
                        <h1
                            className="text-xl sm:text-2xl md:text-3xl font-bold"
                            style={tab === "ai" ? { color: "var(--preset-primary)" } : undefined}
                        >
                            {heading}
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{sub}</p>
                    </div>
                </div>
            )}

            <div className={isLocked ? "flex-1 min-h-0 overflow-hidden" : "space-y-4 sm:space-y-6"}>
                {tab === "facebook" ? (
                    <FacebookMarketingTab />
                ) : tab === "ai" ? (
                    <AIMarketingGenerator onLayoutChange={setAiLocked} />
                ) : (
                    <MarketingScreen />
                )}
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