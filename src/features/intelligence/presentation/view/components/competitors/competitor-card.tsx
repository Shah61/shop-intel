"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CompetitorProfile } from "@/src/features/intelligence/data/model/competitor-profile";
import { cn } from "@/lib/utils";
import { formatCompactNumber, PLATFORM_LABEL } from "./competitor-utils";
import { CompetitorDetailDialog } from "./competitor-detail-dialog";
import { TrendMetricCell } from "./competitor-trend-cell";

interface CompetitorCardProps {
    competitor: CompetitorProfile;
}

export const CompetitorCard: React.FC<CompetitorCardProps> = ({ competitor: c }) => {
    const [imgFailed, setImgFailed] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const showLogo = Boolean(c.logo_url) && !imgFailed;
    const searchGap = c.rankings.search_rank_keywords.slice(0, 2);

    return (
        <>
            <Card className="border-border bg-card shadow-none">
                <CardContent className="p-5 sm:p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                            {showLogo ? (
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden ring-2 ring-border shrink-0 bg-muted">
                                    <Image
                                        src={c.logo_url!}
                                        alt={c.name}
                                        width={48}
                                        height={48}
                                        className="object-cover w-12 h-12"
                                        onError={() => setImgFailed(true)}
                                    />
                                </div>
                            ) : (
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shrink-0",
                                        "bg-muted text-muted-foreground ring-2 ring-border"
                                    )}
                                >
                                    {c.symbol.slice(0, 2)}
                                </div>
                            )}
                            <div className="min-w-0">
                                <h3 className="font-bold text-base text-foreground leading-tight">{c.symbol}</h3>
                                <p className="font-medium text-sm text-muted-foreground truncate">{c.name}</p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="shrink-0 text-[var(--preset-primary)] -mr-2 hover:bg-muted/60 dark:hover:bg-white/[0.06]"
                            onClick={() => setDetailsOpen(true)}
                        >
                            See details
                        </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <TrendMetricCell label="Price index" value={c.trends.price_index_change_pct} shimmer />
                        <TrendMetricCell label="Visibility" value={c.trends.visibility_change_pct} shimmer />
                        <TrendMetricCell label="Engagement" value={c.trends.engagement_change_pct} shimmer />
                    </div>

                    {searchGap.length > 0 && (
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Search gap</p>
                            <ul className="space-y-2 text-sm">
                                {searchGap.map((k) => (
                                    <li key={k.keyword}>
                                        <p className="font-medium text-foreground leading-snug">{k.keyword}</p>
                                        <p className="text-xs font-mono tabular-nums text-muted-foreground mt-0.5">
                                            You #{k.your_rank} · Them #{k.their_rank}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Channels</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
                            {c.channels.map((ch, i) => (
                                <div key={`${c.id}-sum-ch-${i}`} className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground">{PLATFORM_LABEL[ch.platform]}</p>
                                    {ch.followers > 0 && (
                                        <p className="text-xs tabular-nums text-muted-foreground mt-0.5">
                                            {formatCompactNumber(ch.followers)}
                                        </p>
                                    )}
                                    {ch.rating > 0 && (
                                        <p className="text-xs text-muted-foreground mt-0.5">★{ch.rating.toFixed(1)}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <CompetitorDetailDialog competitor={c} open={detailsOpen} onOpenChange={setDetailsOpen} />
        </>
    );
};
