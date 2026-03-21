"use client";

import React from "react";
import { formatTrendPct } from "./competitor-utils";
import { cn } from "@/lib/utils";

interface TrendMetricCellProps {
    label: string;
    value: number;
    /** Shiny animated gradient on the value (summary cards only). */
    shimmer?: boolean;
}

export function TrendMetricCell({ label, value, shimmer }: TrendMetricCellProps) {
    const up = value > 0;
    const down = value < 0;
    const textColor = !shimmer
        ? cn(
              "text-lg font-bold font-mono tabular-nums",
              up && "text-emerald-600 dark:text-emerald-400",
              down && "text-rose-600 dark:text-rose-400",
              !up && !down && "text-foreground"
          )
        : cn(
              "text-lg font-bold font-mono tabular-nums bg-clip-text text-transparent bg-[length:280%_100%] animate-competitor-trend-shine",
              up &&
                  "bg-gradient-to-r from-emerald-700 via-emerald-300 to-emerald-700 dark:from-emerald-500 dark:via-emerald-100 dark:to-emerald-500",
              down &&
                  "bg-gradient-to-r from-rose-700 via-rose-300 to-rose-700 dark:from-rose-500 dark:via-rose-100 dark:to-rose-500",
              !up &&
                  !down &&
                  "bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground dark:from-zinc-500 dark:via-zinc-200 dark:to-zinc-500"
          );

    return (
        <div className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
            <p className={textColor}>{formatTrendPct(value)}</p>
        </div>
    );
}
