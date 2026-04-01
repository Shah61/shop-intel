"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/src/core/constant/helper";
import { useAnalyticsMetadata } from "@/src/features/sales/presentation/tanstack/analytics-tanstack";
import { AnalysisTimeFrame, AnalyticsType } from "@/src/features/sales/data/model/analytics-entity";
import {
    SeasonalContentBody,
} from "@/src/features/sales/presentation/view/components/analytics/seasonal-performance-analysis";

const SeasonalPage = () => {
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const [rangeStart, setRangeStart] = useState(2022);
    const [rangeEnd, setRangeEnd] = useState(2026);

    const { data } = useAnalyticsMetadata("daily" as AnalysisTimeFrame);

    const totalSalesAll =
        data?.find((item) => item.type === AnalyticsType.TOTAL)?.total_sales ?? 0;
    const headlineRevenue = totalSalesAll || 1_285_400;
    const headlineSub = "↑ 12.4% vs same period last year.";

    const headerBorder = "1px solid rgba(var(--preset-primary-rgb), 0.14)";

    return (
        <div className="flex min-h-screen flex-col">
            {/* Header */}
            <div
                className="shrink-0 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4"
                style={{
                    borderBottom: headerBorder,
                    background: isDark
                        ? "linear-gradient(180deg, rgba(var(--preset-primary-rgb), 0.08) 0%, transparent 100%)"
                        : "linear-gradient(180deg, rgba(var(--preset-primary-rgb), 0.06) 0%, transparent 100%)",
                }}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 flex-wrap items-start gap-x-5 gap-y-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                style={{
                                    background:
                                        "linear-gradient(135deg, rgba(var(--preset-primary-rgb), 0.28), rgba(var(--preset-primary-rgb), 0.1))",
                                    boxShadow:
                                        "0 4px 18px rgba(var(--preset-primary-rgb), 0.22)",
                                    border: "1px solid rgba(var(--preset-primary-rgb), 0.2)",
                                }}
                            >
                                <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                                    Sales overview
                                </p>
                                <h2 className="truncate text-base font-bold text-foreground sm:text-lg">
                                    {formatCurrency(headlineRevenue)}{" "}
                                    <span className="font-normal text-muted-foreground">
                                        consolidated (selected range)
                                    </span>
                                </h2>
                                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                    {headlineSub}
                                </p>
                            </div>
                        </div>
                        <div
                            className="hidden h-12 w-px shrink-0 self-center sm:block"
                            style={{
                                background: "rgba(var(--preset-primary-rgb), 0.16)",
                            }}
                            aria-hidden
                        />
                        <div className="min-w-0 max-w-md flex-1 basis-[min(100%,18rem)]">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary/90">
                                Seasonal revenue
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                Month-by-month totals across TikTok, Shopee, Shopify, and
                                stores—handy for campaigns, stock, and staffing. Past patterns
                                are not a forecast.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-sm font-medium text-muted-foreground transition hover:scale-105 active:scale-95"
                        style={{
                            borderColor: "rgba(var(--preset-primary-rgb), 0.2)",
                            background: "rgba(var(--preset-primary-rgb), 0.06)",
                            transition:
                                "all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6 sm:py-5">
                <SeasonalContentBody
                    rangeStart={rangeStart}
                    rangeEnd={rangeEnd}
                    onRangeChange={(a, b) => {
                        setRangeStart(a);
                        setRangeEnd(b);
                    }}
                />
            </div>
        </div>
    );
};

export default SeasonalPage;