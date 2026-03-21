"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { CompetitorProfile } from "@/src/features/intelligence/data/model/competitor-profile";
import { cn } from "@/lib/utils";
import { formatCompactNumber, formatMoneyShort, formatTrendPct, TIER_LABEL, tierBadgeClass } from "./competitor-utils";
import { CompetitorDetailDialog } from "./competitor-detail-dialog";

interface CompetitorsTableProps {
    rows: CompetitorProfile[];
}

function pctClass(n: number) {
    if (n > 0) return "text-emerald-600 dark:text-emerald-400";
    if (n < 0) return "text-rose-600 dark:text-rose-400";
    return "text-muted-foreground";
}

export const CompetitorsTable: React.FC<CompetitorsTableProps> = ({ rows }) => {
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailCompetitor, setDetailCompetitor] = useState<CompetitorProfile | null>(null);

    const openDetail = (c: CompetitorProfile) => {
        setDetailCompetitor(c);
        setDetailOpen(true);
    };

    const handleDetailOpenChange = (open: boolean) => {
        setDetailOpen(open);
        if (!open) setDetailCompetitor(null);
    };

    return (
        <div className="rounded-lg border border-border bg-card overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                        <TableHead className="text-foreground min-w-[72px]">Code</TableHead>
                        <TableHead className="text-foreground min-w-[160px]">Brand</TableHead>
                        <TableHead className="text-foreground">Tier</TableHead>
                        <TableHead className="text-foreground">Status</TableHead>
                        <TableHead className="text-right text-foreground">Price Δ</TableHead>
                        <TableHead className="text-right text-foreground">Vis. Δ</TableHead>
                        <TableHead className="text-right text-foreground">Eng. Δ</TableHead>
                        <TableHead className="text-right text-foreground">Est. rev / mo</TableHead>
                        <TableHead className="text-right text-foreground">SKUs</TableHead>
                        <TableHead className="text-right text-foreground">Avg price</TableHead>
                        <TableHead className="text-right text-foreground">Shopee</TableHead>
                        <TableHead className="text-foreground">Updated</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((c) => {
                        const rev = c.estimated.monthly_revenue;
                        const shopeeRank =
                            c.rankings.shopee_category_rank != null && c.rankings.shopee_category_total != null
                                ? `#${c.rankings.shopee_category_rank} / ${formatCompactNumber(c.rankings.shopee_category_total)}`
                                : "—";
                        return (
                            <TableRow
                                key={c.id}
                                className="border-border cursor-pointer hover:bg-muted/30 dark:hover:bg-white/[0.04] data-[state=selected]:bg-muted/40"
                                onClick={() => openDetail(c)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        openDetail(c);
                                    }
                                }}
                                tabIndex={0}
                                role="button"
                                aria-label={`Open details for ${c.name}`}
                            >
                                <TableCell className="font-bold text-foreground">{c.symbol}</TableCell>
                                <TableCell>
                                    <div className="font-medium text-sm text-foreground max-w-[220px] truncate">{c.name}</div>
                                    <div className="text-[11px] text-muted-foreground truncate max-w-[220px]">
                                        {c.channels.length} channel{c.channels.length !== 1 ? "s" : ""}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn("text-[10px] font-semibold", tierBadgeClass(c.tier))}>
                                        {TIER_LABEL[c.tier]}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {c.status === "ACTIVE" && (
                                        <Badge className="bg-gradient-to-r from-[var(--preset-primary)] to-[var(--preset-lighter)] text-white border-0 text-[10px]">
                                            Active
                                        </Badge>
                                    )}
                                    {c.status === "WATCHING" && (
                                        <Badge variant="outline" className="text-[10px] border-amber-500/50 text-amber-700 dark:text-amber-300">
                                            Watching
                                        </Badge>
                                    )}
                                    {c.status === "INACTIVE" && (
                                        <Badge variant="secondary" className="text-[10px]">
                                            Inactive
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className={cn("text-right font-mono text-xs font-semibold tabular-nums", pctClass(c.trends.price_index_change_pct))}>
                                    {formatTrendPct(c.trends.price_index_change_pct)}
                                </TableCell>
                                <TableCell className={cn("text-right font-mono text-xs tabular-nums", pctClass(c.trends.visibility_change_pct))}>
                                    {formatTrendPct(c.trends.visibility_change_pct)}
                                </TableCell>
                                <TableCell className={cn("text-right font-mono text-xs tabular-nums", pctClass(c.trends.engagement_change_pct))}>
                                    {formatTrendPct(c.trends.engagement_change_pct)}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs font-medium tabular-nums">
                                    {formatMoneyShort(rev.amount, rev.currency)}
                                    <span className="block text-[10px] font-normal text-muted-foreground">{rev.confidence}</span>
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs tabular-nums">
                                    {c.catalog.total_skus.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs tabular-nums">
                                    {c.catalog.price_range.currency} {c.catalog.price_range.avg}
                                </TableCell>
                                <TableCell className="text-right font-mono text-xs tabular-nums">{shopeeRank}</TableCell>
                                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                                    {format(new Date(c.last_updated), "MMM d, yyyy")}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            <CompetitorDetailDialog
                competitor={detailCompetitor}
                open={detailOpen}
                onOpenChange={handleDetailOpenChange}
            />
        </div>
    );
};
