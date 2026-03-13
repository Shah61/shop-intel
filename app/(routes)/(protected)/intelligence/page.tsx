"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AIAssistant from "@/src/features/intelligence/presentation/view/components/ai-assistant";
import AITrend from "@/src/features/intelligence/presentation/view/components/ai-trend";
import AIAnalysis from "@/src/features/intelligence/presentation/view/components/ai-analysis";

function IntelligenceContent() {
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab") ?? "assistant";

    if (tab === "trends") return <AITrend />;
    if (tab === "analysis") return <AIAnalysis />;

    return <AIAssistant />;
}

export default function IntelligencePage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--preset-primary)]" />
                </div>
            }
        >
            <IntelligenceContent />
        </Suspense>
    );
}
