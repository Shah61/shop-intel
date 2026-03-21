"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { BarChart3, Lightbulb, Radio, Search, ShoppingBag, Sparkles, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { CompetitorProfile } from "@/src/features/intelligence/data/model/competitor-profile";
import { cn } from "@/lib/utils";
import {
    formatCompactNumber,
    formatMoneyShort,
    PLATFORM_LABEL,
    promoTypeLabel,
    TIER_LABEL,
    tierBadgeClass,
} from "./competitor-utils";
import { TrendMetricCell } from "./competitor-trend-cell";

function StatusBadge({ status }: { status: CompetitorProfile["status"] }) {
    if (status === "ACTIVE") {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-[var(--preset-primary)] to-[var(--preset-lighter)] text-white shadow-[0_2px_12px_hsla(var(--preset-primary-rgb),0.35)]">
                Active
            </span>
        );
    }
    if (status === "WATCHING") {
        return (
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-amber-500/50 text-amber-700 dark:text-amber-300">
                Watching
            </Badge>
        );
    }
    return (
        <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
            Inactive
        </Badge>
    );
}

function CompetitorFullDetails({ c }: { c: CompetitorProfile }) {
    const rev = c.estimated.monthly_revenue;
    const topKeywords = c.rankings.search_rank_keywords;

    return (
        <div className="space-y-5 text-sm">
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={cn("text-[10px] font-semibold", tierBadgeClass(c.tier))}>
                    {TIER_LABEL[c.tier]}
                </Badge>
                <StatusBadge status={c.status} />
                <span className="text-xs text-muted-foreground tabular-nums">
                    Updated {format(new Date(c.last_updated), "MMM d, yyyy")} · Since {format(new Date(c.tracked_since), "MMM yyyy")}
                </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>

            <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <BarChart3 className="h-3 w-3" />
                    30d vs prior 30d
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <TrendMetricCell label="Price index" value={c.trends.price_index_change_pct} />
                    <TrendMetricCell label="Visibility" value={c.trends.visibility_change_pct} />
                    <TrendMetricCell label="Engagement" value={c.trends.engagement_change_pct} />
                    <TrendMetricCell label="Catalog" value={c.trends.catalog_growth_pct} />
                    <TrendMetricCell label="Rev. (est.)" value={c.trends.revenue_change_pct} />
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-0.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Est. revenue / mo</p>
                    <p className="font-semibold tabular-nums text-foreground">{formatMoneyShort(rev.amount, rev.currency)}</p>
                    <p className="text-[10px] text-muted-foreground">Confidence: {rev.confidence}</p>
                </div>
                <div className="space-y-0.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                        <ShoppingBag className="h-3 w-3" /> Catalog
                    </p>
                    <p className="font-semibold text-foreground">{c.catalog.total_skus.toLocaleString()} SKUs</p>
                    <p className="text-[10px] text-muted-foreground">
                        Avg {c.catalog.price_range.currency} {c.catalog.price_range.avg} · {c.catalog.discount_rate_pct}% on sale
                    </p>
                </div>
                <div className="space-y-0.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Reviews / mo</p>
                    <p className="font-semibold tabular-nums">{formatCompactNumber(c.engagement.avg_monthly_reviews)}</p>
                    <p className="text-[10px] text-muted-foreground">
                        ★ {c.engagement.avg_review_rating.toFixed(1)} · {c.engagement.review_sentiment_pct.positive}% pos.
                    </p>
                </div>
                <div className="space-y-0.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                        <Radio className="h-3 w-3" /> Shopee rank
                    </p>
                    <p className="font-semibold text-foreground">
                        {c.rankings.shopee_category_rank != null && c.rankings.shopee_category_total != null
                            ? `#${c.rankings.shopee_category_rank} / ${formatCompactNumber(c.rankings.shopee_category_total)}`
                            : "—"}
                    </p>
                </div>
            </div>

            <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Store className="h-3 w-3" />
                    Channels
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {c.channels.map((ch, i) => (
                        <Badge
                            key={`${c.id}-dlg-ch-${i}`}
                            variant="secondary"
                            className="text-[11px] font-normal gap-1.5 py-1 px-2.5"
                        >
                            <span className="font-medium">{PLATFORM_LABEL[ch.platform]}</span>
                            {ch.followers > 0 && (
                                <span className="text-muted-foreground tabular-nums">{formatCompactNumber(ch.followers)}</span>
                            )}
                            {ch.rating > 0 && <span className="text-muted-foreground">★{ch.rating.toFixed(1)}</span>}
                        </Badge>
                    ))}
                </div>
            </div>

            {topKeywords.length > 0 && (
                <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-1">
                        <Search className="h-3 w-3" />
                        Search gap (all)
                    </p>
                    <ul className="text-xs space-y-1.5 text-foreground/90">
                        {topKeywords.map((k) => (
                            <li key={k.keyword} className="flex justify-between gap-2">
                                <span className="truncate text-muted-foreground">{k.keyword}</span>
                                <span className="shrink-0 font-mono tabular-nums">
                                    You #{k.your_rank} · Them #{k.their_rank}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {c.ai_insights.length > 0 && (
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Lightbulb className="h-3 w-3 text-amber-500" />
                        AI notes
                    </p>
                    <ul className="space-y-2">
                        {c.ai_insights.map((line, i) => (
                            <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                                <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[var(--preset-primary)] opacity-80" />
                                <span>{line}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {c.active_promos.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {c.active_promos.map((p, i) => (
                        <Badge
                            key={`${c.id}-dlg-promo-${i}`}
                            variant="outline"
                            className="text-[10px] font-normal max-w-full text-left h-auto py-1.5 px-2 whitespace-normal border-[hsla(var(--preset-primary-rgb),0.25)] dark:border-black"
                            title={p.title}
                        >
                            <span className="font-semibold text-[var(--preset-primary)] mr-1">{promoTypeLabel(p.type)}</span>
                            <span className="opacity-90">{p.title}</span>
                            {p.estimated_discount_pct > 0 && (
                                <span className="ml-1 tabular-nums">~{p.estimated_discount_pct}%</span>
                            )}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}

export interface CompetitorDetailDialogProps {
    competitor: CompetitorProfile | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CompetitorDetailDialog({ competitor: c, open, onOpenChange }: CompetitorDetailDialogProps) {
    const [imgFailed, setImgFailed] = useState(false);

    useEffect(() => {
        setImgFailed(false);
    }, [c?.id]);

    const showLogo = Boolean(c?.logo_url) && !imgFailed;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {c ? (
                <DialogContent className="max-w-lg sm:max-w-2xl max-h-[min(90vh,720px)] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-start gap-3 pr-8">
                            {showLogo ? (
                                <div className="relative w-14 h-14 rounded-xl overflow-hidden ring-2 ring-border shrink-0 bg-muted">
                                    <Image
                                        src={c.logo_url!}
                                        alt={c.name}
                                        width={56}
                                        height={56}
                                        className="object-cover w-14 h-14"
                                        onError={() => setImgFailed(true)}
                                    />
                                </div>
                            ) : (
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 bg-muted text-muted-foreground ring-2 ring-border">
                                    {c.symbol.slice(0, 2)}
                                </div>
                            )}
                            <div className="min-w-0 text-left">
                                <DialogTitle className="text-xl leading-tight">{c.name}</DialogTitle>
                                <p className="text-sm font-semibold text-muted-foreground mt-1">{c.symbol}</p>
                                <DialogDescription className="text-left mt-2">
                                    Full profile: trends, catalog, revenue estimates, search gaps, and AI notes.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <CompetitorFullDetails c={c} />
                </DialogContent>
            ) : null}
        </Dialog>
    );
}
