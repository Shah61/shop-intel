"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AIAssistant from "@/src/features/intelligence/presentation/view/components/ai-assistant";
import AITrend from "@/src/features/intelligence/presentation/view/components/ai-trend";
import AIAnalysis from "@/src/features/intelligence/presentation/view/components/ai-analysis";

function IntelligenceContent() {
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab") || "assistant";

    const renderContent = () => {
        switch (tab) {
            case "trends":
                return <AITrend />;
            case "analysis":
                return <AIAnalysis />;
            default:
                return <AIAssistant />;
        }
    };

    return (
        <div className="w-full h-[calc(100vh-4rem)] relative overflow-hidden flex flex-col">
            <div className="flex-1 min-h-0 relative z-10 overflow-hidden">
                <div className="h-full overflow-hidden">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default function IntelligencePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--preset-primary)]" />
            </div>
        }>
            <IntelligenceContent />
        </Suspense>
    );
}
