"use client";

import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import {
    Search,
    ArrowUpDown,
    ChevronRight,
    Store,
    Clock,
    Package,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    FileText,
    Image as ImageIcon,
    Boxes,
    Sparkles,
    ArrowLeft,
    TrendingUp,
    BarChart3,
    LayoutGrid,
    X,
} from "lucide-react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
} from "recharts";
import { useVisits, type StockVisit } from "../../tanstack/stock-visit-store";

type VerdictTone = "good" | "warning" | "danger";

interface StoreAggregate {
    supermarketId: string;
    supermarketName: string;
    lastVisit: StockVisit | null;
    totalVisits: number;
    totalStock: number;
    nearExpiryUnits: number;
    criticalExpiryUnits: number;
    outOfStockProducts: number;
    verdict: { label: string; tone: VerdictTone; detail: string };
    allVisits: StockVisit[];
}

interface AIAction {
    id: string;
    urgency: "critical" | "warning" | "info";
    title: string;
    subtitle: string;
    supermarket: string;
    product: string;
    recommendation: string;
    impact: string;
}

/* ═══════════════════════════════════════════════════════════════
   AI RULE ENGINE
   ═══════════════════════════════════════════════════════════════ */
function deriveActions(aggs: StoreAggregate[]): AIAction[] {
    const actions: AIAction[] = [];

    aggs.forEach((agg) => {
        if (!agg.lastVisit) return;

        agg.lastVisit.products.forEach((product) => {
            if (product.currentStock === 0) {
                actions.push({
                    id: `refill-${agg.supermarketId}-${product.productId}`,
                    urgency: "critical",
                    title: `Refill ${agg.supermarketName} — shelf empty`,
                    subtitle: `${product.productName} out of stock`,
                    supermarket: agg.supermarketName,
                    product: product.productName,
                    recommendation: `Dispatch a restock today. Historical velocity suggests 15–20 units/day.`,
                    impact: `Est. revenue loss: RM 300–400/day`,
                });
                return;
            }

            const criticalBatchUnits = product.batches
                .filter((b) => {
                    if (!b.expiryDate) return false;
                    const days = Math.ceil(
                        (new Date(b.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );
                    return days > 0 && days < 21;
                })
                .reduce((sum, b) => sum + b.quantity, 0);

            if (criticalBatchUnits > 20) {
                actions.push({
                    id: `promo-${agg.supermarketId}-${product.productId}`,
                    urgency: "critical",
                    title: `${agg.supermarketName} — ${criticalBatchUnits} units near expiry`,
                    subtitle: `${product.productName} expiring in under 3 weeks`,
                    supermarket: agg.supermarketName,
                    product: product.productName,
                    recommendation: `Run 40% promo immediately. Projected clearance: 10–14 days.`,
                    impact: `Avoid RM ${(criticalBatchUnits * 4).toFixed(0)} write-off`,
                });
            } else if (criticalBatchUnits > 0) {
                actions.push({
                    id: `watch-${agg.supermarketId}-${product.productId}`,
                    urgency: "warning",
                    title: `${agg.supermarketName} — slow mover flagged`,
                    subtitle: `${product.productName}, ${criticalBatchUnits} units near expiry`,
                    supermarket: agg.supermarketName,
                    product: product.productName,
                    recommendation: `Bundle with other products, or 25% discount next week.`,
                    impact: `${criticalBatchUnits} units at risk`,
                });
            }

            if (product.currentStock > 40 && criticalBatchUnits === 0) {
                actions.push({
                    id: `scale-${agg.supermarketId}-${product.productId}`,
                    urgency: "info",
                    title: `${agg.supermarketName} — strong performer`,
                    subtitle: `${product.productName} — healthy velocity`,
                    supermarket: agg.supermarketName,
                    product: product.productName,
                    recommendation: `Increase allocation by 30% next delivery cycle.`,
                    impact: `Upside: ~RM 400–500/week`,
                });
            }
        });
    });

    const urgencyOrder = { critical: 0, warning: 1, info: 2 };
    return actions.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]).slice(0, 8);
}

/* ═══════════════════════════════════════════════════════════════
   AGGREGATOR
   ═══════════════════════════════════════════════════════════════ */
function aggregateVisits(visits: StockVisit[]): StoreAggregate[] {
    const byStore = new Map<string, StockVisit[]>();
    visits.forEach((v) => {
        const arr = byStore.get(v.supermarketId) || [];
        arr.push(v);
        byStore.set(v.supermarketId, arr);
    });

    const aggs: StoreAggregate[] = [];
    byStore.forEach((storeVisits, id) => {
        storeVisits.sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        const last = storeVisits[0];
        const name = last.supermarketName;

        let totalStock = 0;
        let nearExpiry = 0;
        let critical = 0;
        let oos = 0;

        last.products.forEach((p) => {
            totalStock += p.currentStock;
            if (p.currentStock === 0) oos += 1;
            p.batches.forEach((b) => {
                if (!b.expiryDate) return;
                const days = Math.ceil(
                    (new Date(b.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                if (days > 0 && days <= 30) nearExpiry += b.quantity;
                if (days > 0 && days <= 14) critical += b.quantity;
            });
        });

        let verdict: StoreAggregate["verdict"];
        if (oos > 0) {
            verdict = {
                label: "Refill urgently",
                tone: "danger",
                detail: `${oos} product${oos > 1 ? "s" : ""} out of stock`,
            };
        } else if (critical > 20) {
            verdict = {
                label: "Promo needed",
                tone: "danger",
                detail: `${critical} units expire under 14 days`,
            };
        } else if (nearExpiry > 10) {
            verdict = {
                label: "Watch closely",
                tone: "warning",
                detail: `${nearExpiry} units near expiry`,
            };
        } else if (totalStock > 40) {
            verdict = { label: "Scale up", tone: "good", detail: "Healthy stock, strong velocity" };
        } else {
            verdict = { label: "On track", tone: "good", detail: "Healthy stock levels" };
        }

        aggs.push({
            supermarketId: id,
            supermarketName: name,
            lastVisit: last,
            totalVisits: storeVisits.length,
            totalStock,
            nearExpiryUnits: nearExpiry,
            criticalExpiryUnits: critical,
            outOfStockProducts: oos,
            verdict,
            allVisits: storeVisits,
        });
    });

    return aggs.sort((a, b) => {
        const tone = { danger: 0, warning: 1, good: 2 };
        if (tone[a.verdict.tone] !== tone[b.verdict.tone])
            return tone[a.verdict.tone] - tone[b.verdict.tone];
        return (
            new Date(b.lastVisit?.timestamp || 0).getTime() -
            new Date(a.lastVisit?.timestamp || 0).getTime()
        );
    });
}

/* ═══════════════════════════════════════════════════════════════
   VERDICT BADGE
   ═══════════════════════════════════════════════════════════════ */
function VerdictBadge({ tone, label }: { tone: VerdictTone; label: string }) {
    const map: Record<VerdictTone, { gradient: string; shadow: string }> = {
        good: {
            gradient: "linear-gradient(135deg, #22c55e, #4ade80)",
            shadow: "0 2px 8px rgba(34,197,94,0.3)",
        },
        warning: {
            gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
            shadow: "0 2px 8px rgba(245,158,11,0.3)",
        },
        danger: {
            gradient: "linear-gradient(135deg, #ef4444, #f87171)",
            shadow: "0 2px 8px rgba(239,68,68,0.3)",
        },
    };
    const c = map[tone];
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                position: "relative",
                overflow: "hidden",
                background: c.gradient,
                boxShadow: c.shadow,
                borderRadius: 6,
                padding: "2px 8px",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "#fff",
                lineHeight: 1.6,
                whiteSpace: "nowrap",
            }}
        >
            <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
            <span
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer-badge 2s infinite linear",
                }}
            />
        </span>
    );
}

/* ═══════════════════════════════════════════════════════════════
   VISIT DETAIL DIALOG (opens from visit history table)
   ═══════════════════════════════════════════════════════════════ */
function VisitDetailDialog({
    visit,
    onClose,
    isDark,
}: {
    visit: StockVisit;
    onClose: () => void;
    isDark: boolean;
}) {
    const daysUntilExpiry = (dateStr: string) =>
        Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const expiryChipColor = (days: number) => {
        if (days <= 14) return { bg: "rgba(239,68,68,0.12)", text: "#ef4444" };
        if (days <= 30) return { bg: "rgba(245,158,11,0.12)", text: "#f59e0b" };
        return { bg: "rgba(34,197,94,0.12)", text: "#22c55e" };
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                }}
            />
            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    width: "100%",
                    maxWidth: 620,
                    maxHeight: "90vh",
                    overflowY: "auto",
                    margin: "0 16px",
                    background: isDark ? "hsl(222, 20%, 14%)" : "#fff",
                    borderRadius: 20,
                    boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
                    fontFamily: "'Outfit', sans-serif",
                    color: isDark ? "#e2e8f0" : "#1a1a2e",
                    overflow: "hidden",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Gradient header */}
                <div
                    style={{
                        background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                        padding: "22px 24px 28px",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: -30,
                            right: -30,
                            width: 140,
                            height: 140,
                            background:
                                "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
                            pointerEvents: "none",
                        }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: "rgba(255,255,255,0.75)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    marginBottom: 4,
                                }}
                            >
                                Visit Report
                            </div>
                            <h2
                                style={{
                                    fontSize: 20,
                                    fontWeight: 700,
                                    color: "#fff",
                                    margin: 0,
                                    letterSpacing: "-0.3px",
                                }}
                            >
                                {visit.supermarketName}
                            </h2>
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", margin: "4px 0 0" }}>
                                {new Date(visit.timestamp).toLocaleString("en-MY", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 10,
                                border: "none",
                                background: "rgba(255,255,255,0.15)",
                                backdropFilter: "blur(10px)",
                                color: "#fff",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div style={{ padding: "20px 24px 24px" }}>
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: isDark ? "#64748b" : "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginBottom: 10,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <Package size={12} /> Products on shelf
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                        {visit.products.map((p, idx) => (
                            <div
                                key={idx}
                                style={{
                                    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                                    border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                                    borderRadius: 12,
                                    padding: "12px 14px",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: p.batches.length > 0 ? 8 : 0,
                                        flexWrap: "wrap",
                                        gap: 8,
                                    }}
                                >
                                    <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? "#e2e8f0" : "#1a1a2e" }}>
                                        {p.productName}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 600,
                                            padding: "3px 8px",
                                            borderRadius: 6,
                                            background:
                                                p.currentStock === 0
                                                    ? "rgba(239,68,68,0.12)"
                                                    : "rgba(var(--preset-primary-rgb), 0.1)",
                                            color: p.currentStock === 0 ? "#ef4444" : "var(--preset-primary)",
                                        }}
                                    >
                                        {p.currentStock === 0 ? "OUT OF STOCK" : `${p.currentStock} on shelf`}
                                    </div>
                                </div>
                                {p.batches.length > 0 && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                        {p.batches.map((b, bIdx) => {
                                            if (!b.expiryDate) return null;
                                            const days = daysUntilExpiry(b.expiryDate);
                                            const c = expiryChipColor(days);
                                            return (
                                                <div
                                                    key={bIdx}
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 5,
                                                        padding: "4px 9px",
                                                        borderRadius: 8,
                                                        background: c.bg,
                                                        fontSize: 11,
                                                        fontWeight: 600,
                                                        color: c.text,
                                                    }}
                                                >
                                                    <Calendar size={10} />
                                                    {new Date(b.expiryDate).toLocaleDateString("en-MY", {
                                                        day: "numeric",
                                                        month: "short",
                                                    })}
                                                    <span style={{ opacity: 0.6 }}>·</span>
                                                    {b.quantity} units
                                                    <span style={{ opacity: 0.6 }}>·</span>
                                                    {days}d left
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {visit.notes && (
                        <div style={{ marginBottom: 16 }}>
                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: isDark ? "#64748b" : "#94a3b8",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    marginBottom: 8,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                <FileText size={12} /> Rep notes
                            </div>
                            <div
                                style={{
                                    padding: "12px 14px",
                                    borderRadius: 12,
                                    fontSize: 13,
                                    lineHeight: 1.5,
                                    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                                    border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                                    color: isDark ? "#cbd5e1" : "#475569",
                                }}
                            >
                                {visit.notes}
                            </div>
                        </div>
                    )}

                    {visit.photo && (
                        <div>
                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: isDark ? "#64748b" : "#94a3b8",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    marginBottom: 8,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                <ImageIcon size={12} /> Shelf photo
                            </div>
                            <img
                                src={visit.photo}
                                alt="Shelf"
                                style={{
                                    maxHeight: 280,
                                    width: "100%",
                                    objectFit: "cover",
                                    borderRadius: 12,
                                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   PER-STORE VIEW — tabbed
   ═══════════════════════════════════════════════════════════════ */
type StoreTab = "overview" | "history" | "products";

function StoreView({
    aggregate,
    onBack,
    theme,
    isDark,
}: {
    aggregate: StoreAggregate;
    onBack: () => void;
    theme: ReturnType<typeof buildTheme>;
    isDark: boolean;
}) {
    const [activeTab, setActiveTab] = useState<StoreTab>("overview");
    const [selectedVisit, setSelectedVisit] = useState<StockVisit | null>(null);

    /* ─── Chart 1: stock over time (chronological) ─── */
    const stockOverTimeData = useMemo(() => {
        return [...aggregate.allVisits]
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map((v) => ({
                date: new Date(v.timestamp).toLocaleDateString("en-MY", { day: "numeric", month: "short" }),
                fullDate: v.timestamp,
                stock: v.products.reduce((s, p) => s + p.currentStock, 0),
            }));
    }, [aggregate.allVisits]);

    /* ─── Chart 2: sales velocity (units sold between consecutive visits) ─── */
    const salesVelocityData = useMemo(() => {
        const sorted = [...aggregate.allVisits].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        const data: Array<{ period: string; sold: number }> = [];
        for (let i = 1; i < sorted.length; i++) {
            const prevStock = sorted[i - 1].products.reduce((s, p) => s + p.currentStock, 0);
            const currStock = sorted[i].products.reduce((s, p) => s + p.currentStock, 0);
            // Sales = prev - curr (assuming no restocking between visits; positive = sold)
            // If negative, a restock happened; use absolute velocity estimate
            const raw = prevStock - currStock;
            const sold = raw > 0 ? raw : Math.max(0, Math.abs(raw) - prevStock > 0 ? 0 : raw);
            data.push({
                period: new Date(sorted[i].timestamp).toLocaleDateString("en-MY", {
                    day: "numeric",
                    month: "short",
                }),
                sold: Math.max(0, raw),
            });
        }
        return data;
    }, [aggregate.allVisits]);

    /* ─── Chart 3: expiry distribution (current stock bucketed by days-to-expiry) ─── */
    const expiryDistribution = useMemo(() => {
        if (!aggregate.lastVisit) return [];
        const buckets = { critical: 0, near: 0, healthy: 0 };
        aggregate.lastVisit.products.forEach((p) => {
            p.batches.forEach((b) => {
                if (!b.expiryDate) return;
                const days = Math.ceil(
                    (new Date(b.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                if (days <= 14) buckets.critical += b.quantity;
                else if (days <= 30) buckets.near += b.quantity;
                else buckets.healthy += b.quantity;
            });
        });
        return [
            { name: "Critical (<14d)", value: buckets.critical, color: "#ef4444" },
            { name: "Near (14–30d)", value: buckets.near, color: "#f59e0b" },
            { name: "Healthy (>30d)", value: buckets.healthy, color: "#22c55e" },
        ].filter((b) => b.value > 0);
    }, [aggregate.lastVisit]);

    /* ─── Products tab: per-SKU stock trend ─── */
    const productTrends = useMemo(() => {
        const productMap = new Map<string, { name: string; points: Array<{ date: string; stock: number }> }>();
        const sorted = [...aggregate.allVisits].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        sorted.forEach((v) => {
            v.products.forEach((p) => {
                if (!productMap.has(p.productId)) {
                    productMap.set(p.productId, { name: p.productName, points: [] });
                }
                productMap.get(p.productId)!.points.push({
                    date: new Date(v.timestamp).toLocaleDateString("en-MY", {
                        day: "numeric",
                        month: "short",
                    }),
                    stock: p.currentStock,
                });
            });
        });
        return Array.from(productMap.entries()).map(([id, data]) => ({ productId: id, ...data }));
    }, [aggregate.allVisits]);

    const tabs: Array<{ id: StoreTab; label: string; icon: React.ReactNode }> = [
        { id: "overview", label: "Overview", icon: <LayoutGrid size={14} /> },
        { id: "history", label: "Visit History", icon: <Clock size={14} /> },
        { id: "products", label: "Products", icon: <Package size={14} /> },
    ];

    const chartAxisColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.55)";
    const chartGridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

    const tooltipStyle = {
        background: isDark ? "hsl(222, 20%, 14%)" : "#fff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
        borderRadius: 10,
        fontSize: 12,
        fontFamily: "'Outfit', sans-serif",
        padding: "8px 12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    };

    return (
        <div
            style={{
                animation: "slideInRight 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
            }}
        >
            {/* Header card */}
            <div
                style={{
                    background: theme.cardBg,
                    borderRadius: 20,
                    border: theme.cardBorder,
                    padding: "22px 26px",
                    position: "relative",
                    overflow: "hidden",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: -60,
                        right: -60,
                        width: 180,
                        height: 180,
                        background: `radial-gradient(circle, ${theme.glowColor} 0%, transparent 70%)`,
                        pointerEvents: "none",
                    }}
                />

                <button
                    onClick={onBack}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: theme.expandBtnBg,
                        border: "none",
                        borderRadius: 10,
                        padding: "6px 12px",
                        color: theme.subtitle,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 14,
                        fontFamily: "'Outfit', sans-serif",
                        transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.rowHover;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = theme.expandBtnBg;
                    }}
                >
                    <ArrowLeft size={13} /> Back to all stores
                </button>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 12,
                        marginBottom: 14,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 14,
                                background:
                                    "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                flexShrink: 0,
                                boxShadow: "0 4px 16px rgba(var(--preset-primary-rgb), 0.3)",
                            }}
                        >
                            <Store size={22} />
                        </div>
                        <div>
                            <h2
                                style={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: theme.title,
                                    margin: 0,
                                    letterSpacing: "-0.3px",
                                    lineHeight: 1.2,
                                }}
                            >
                                {aggregate.supermarketName}
                            </h2>
                            <p style={{ fontSize: 12, color: theme.subtitle, margin: "3px 0 0" }}>
                                {aggregate.totalVisits} visit{aggregate.totalVisits > 1 ? "s" : ""} on record •{" "}
                                {aggregate.lastVisit
                                    ? `last visit ${new Date(aggregate.lastVisit.timestamp).toLocaleDateString(
                                          "en-MY",
                                          { day: "numeric", month: "short", year: "numeric" }
                                      )}`
                                    : "no visits yet"}
                            </p>
                        </div>
                    </div>
                    <VerdictBadge tone={aggregate.verdict.tone} label={aggregate.verdict.label} />
                </div>

                {/* Tab strip */}
                <div
                    style={{
                        background: theme.pillBg,
                        borderRadius: 10,
                        padding: 3,
                        display: "inline-flex",
                        gap: 2,
                    }}
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                fontSize: 12,
                                fontWeight: 600,
                                padding: "7px 14px",
                                borderRadius: 8,
                                border: "none",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                color: activeTab === tab.id ? theme.pillActiveText : theme.pillText,
                                background: activeTab === tab.id ? theme.pillActive : "transparent",
                                boxShadow:
                                    activeTab === tab.id
                                        ? "0 1px 4px rgba(var(--preset-primary-rgb), 0.25)"
                                        : "none",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                fontFamily: "'Outfit', sans-serif",
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB: Overview */}
            {activeTab === "overview" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Stat strip */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: 12,
                        }}
                        className="!grid-cols-2 sm:!grid-cols-4"
                    >
                        {[
                            {
                                label: "Total stock",
                                value: aggregate.totalStock,
                                icon: <Boxes size={14} />,
                                color: "var(--preset-primary)",
                            },
                            {
                                label: "Near expiry",
                                value: aggregate.nearExpiryUnits,
                                icon: <Clock size={14} />,
                                color: "#f59e0b",
                            },
                            {
                                label: "Critical",
                                value: aggregate.criticalExpiryUnits,
                                icon: <AlertTriangle size={14} />,
                                color: "#ef4444",
                            },
                            {
                                label: "Out of stock",
                                value: aggregate.outOfStockProducts,
                                icon: <Package size={14} />,
                                color: "#ef4444",
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                style={{
                                    background: theme.cardBg,
                                    border: theme.cardBorder,
                                    borderRadius: 14,
                                    padding: "14px 16px",
                                    backdropFilter: "blur(20px)",
                                    WebkitBackdropFilter: "blur(20px)",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                    <span style={{ color: s.color }}>{s.icon}</span>
                                    <span
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 600,
                                            color: theme.subtitle,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                        }}
                                    >
                                        {s.label}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        fontSize: 24,
                                        fontWeight: 700,
                                        color: theme.title,
                                        lineHeight: 1,
                                    }}
                                >
                                    {s.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Verdict banner */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            padding: "12px 14px",
                            borderRadius: 14,
                            background:
                                aggregate.verdict.tone === "danger"
                                    ? "rgba(239,68,68,0.08)"
                                    : aggregate.verdict.tone === "warning"
                                    ? "rgba(245,158,11,0.08)"
                                    : "rgba(34,197,94,0.08)",
                            border: `1px solid ${
                                aggregate.verdict.tone === "danger"
                                    ? "rgba(239,68,68,0.2)"
                                    : aggregate.verdict.tone === "warning"
                                    ? "rgba(245,158,11,0.2)"
                                    : "rgba(34,197,94,0.2)"
                            }`,
                        }}
                    >
                        <Sparkles
                            size={14}
                            style={{
                                color:
                                    aggregate.verdict.tone === "danger"
                                        ? "#ef4444"
                                        : aggregate.verdict.tone === "warning"
                                        ? "#f59e0b"
                                        : "#22c55e",
                                marginTop: 2,
                                flexShrink: 0,
                            }}
                        />
                        <div>
                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    color:
                                        aggregate.verdict.tone === "danger"
                                            ? "#ef4444"
                                            : aggregate.verdict.tone === "warning"
                                            ? "#d97706"
                                            : "#16a34a",
                                    marginBottom: 2,
                                }}
                            >
                                AI Verdict: {aggregate.verdict.label}
                            </div>
                            <div
                                style={{
                                    fontSize: 13,
                                    color: isDark ? "#cbd5e1" : "#475569",
                                    lineHeight: 1.5,
                                }}
                            >
                                {aggregate.verdict.detail}
                            </div>
                        </div>
                    </div>

                    {/* Charts grid */}
                    <div
                        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
                        className="!grid-cols-1 lg:!grid-cols-2"
                    >
                        {/* Stock over time */}
                        <div
                            style={{
                                background: theme.cardBg,
                                border: theme.cardBorder,
                                borderRadius: 18,
                                padding: "20px 22px",
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: 16,
                                }}
                            >
                                <TrendingUp size={16} style={{ color: "var(--preset-primary)" }} />
                                <h3
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: theme.title,
                                        margin: 0,
                                        letterSpacing: "-0.2px",
                                    }}
                                >
                                    Stock over time
                                </h3>
                            </div>
                            <div style={{ width: "100%", height: 220 }}>
                                <ResponsiveContainer>
                                    <LineChart
                                        data={stockOverTimeData}
                                        margin={{ top: 5, right: 8, left: -20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 10, fill: chartAxisColor }}
                                            axisLine={{ stroke: chartGridColor }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10, fill: chartAxisColor }}
                                            axisLine={{ stroke: chartGridColor }}
                                            tickLine={false}
                                        />
                                        <RechartsTooltip contentStyle={tooltipStyle} />
                                        <Line
                                            type="monotone"
                                            dataKey="stock"
                                            stroke="var(--preset-primary)"
                                            strokeWidth={2.5}
                                            dot={{ fill: "var(--preset-primary)", r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Sales velocity */}
                        <div
                            style={{
                                background: theme.cardBg,
                                border: theme.cardBorder,
                                borderRadius: 18,
                                padding: "20px 22px",
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: 16,
                                }}
                            >
                                <BarChart3 size={16} style={{ color: "#22c55e" }} />
                                <h3
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: theme.title,
                                        margin: 0,
                                        letterSpacing: "-0.2px",
                                    }}
                                >
                                    Sales velocity (units sold between visits)
                                </h3>
                            </div>
                            <div style={{ width: "100%", height: 220 }}>
                                <ResponsiveContainer>
                                    <BarChart
                                        data={salesVelocityData}
                                        margin={{ top: 5, right: 8, left: -20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                                        <XAxis
                                            dataKey="period"
                                            tick={{ fontSize: 10, fill: chartAxisColor }}
                                            axisLine={{ stroke: chartGridColor }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10, fill: chartAxisColor }}
                                            axisLine={{ stroke: chartGridColor }}
                                            tickLine={false}
                                        />
                                        <RechartsTooltip contentStyle={tooltipStyle} />
                                        <Bar
                                            dataKey="sold"
                                            fill="var(--preset-lighter)"
                                            radius={[6, 6, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Expiry distribution — full width on its row */}
                        <div
                            style={{
                                gridColumn: "1 / -1",
                                background: theme.cardBg,
                                border: theme.cardBorder,
                                borderRadius: 18,
                                padding: "20px 22px",
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: 16,
                                }}
                            >
                                <Clock size={16} style={{ color: "#f59e0b" }} />
                                <h3
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: theme.title,
                                        margin: 0,
                                        letterSpacing: "-0.2px",
                                    }}
                                >
                                    Current stock by expiry window
                                </h3>
                            </div>
                            {expiryDistribution.length === 0 ? (
                                <div
                                    style={{
                                        padding: "40px 0",
                                        textAlign: "center",
                                        color: theme.subtitle,
                                        fontSize: 13,
                                    }}
                                >
                                    No expiry data for current stock
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "280px 1fr",
                                        gap: 16,
                                        alignItems: "center",
                                    }}
                                    className="!grid-cols-1 md:!grid-cols-[280px_1fr]"
                                >
                                    <div style={{ height: 220 }}>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie
                                                    data={expiryDistribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={85}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
                                                    {expiryDistribution.map((entry, i) => (
                                                        <Cell key={i} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip contentStyle={tooltipStyle} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {expiryDistribution.map((entry) => {
                                            const total = expiryDistribution.reduce((s, e) => s + e.value, 0);
                                            const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                                            return (
                                                <div
                                                    key={entry.name}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 12,
                                                        padding: "10px 14px",
                                                        background: isDark
                                                            ? "rgba(255,255,255,0.03)"
                                                            : "rgba(0,0,0,0.02)",
                                                        border: `1px solid ${
                                                            isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"
                                                        }`,
                                                        borderRadius: 12,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: 12,
                                                            height: 12,
                                                            borderRadius: 4,
                                                            background: entry.color,
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <div
                                                            style={{
                                                                fontSize: 12,
                                                                fontWeight: 600,
                                                                color: theme.title,
                                                            }}
                                                        >
                                                            {entry.name}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 11,
                                                                color: theme.subtitle,
                                                                marginTop: 1,
                                                            }}
                                                        >
                                                            {entry.value} units
                                                        </div>
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 16,
                                                            fontWeight: 700,
                                                            color: theme.title,
                                                        }}
                                                    >
                                                        {pct}%
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: Visit history */}
            {activeTab === "history" && (
                <div
                    style={{
                        background: theme.cardBg,
                        borderRadius: 20,
                        border: theme.cardBorder,
                        padding: "22px 26px",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                    }}
                >
                    <div style={{ marginBottom: 14 }}>
                        <h3
                            style={{
                                fontSize: 16,
                                fontWeight: 700,
                                color: theme.title,
                                margin: 0,
                                letterSpacing: "-0.2px",
                            }}
                        >
                            Visit history
                        </h3>
                        <p style={{ fontSize: 12, color: theme.subtitle, margin: "4px 0 0" }}>
                            {aggregate.allVisits.length} visit
                            {aggregate.allVisits.length !== 1 ? "s" : ""} • click any row for full detail
                        </p>
                    </div>

                    <div
                        style={{
                            borderRadius: 14,
                            border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)",
                            background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)",
                            overflow: "hidden",
                        }}
                    >
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                <thead>
                                    <tr
                                        style={{
                                            borderBottom: isDark
                                                ? "1px solid rgba(255,255,255,0.07)"
                                                : "1px solid rgba(0,0,0,0.08)",
                                        }}
                                    >
                                        {["#", "Date & Time", "Products", "Total Stock", "Expiring <30d", "Notes", ""].map(
                                            (h, i) => (
                                                <th
                                                    key={i}
                                                    style={{
                                                        textAlign: "left",
                                                        padding: "10px 12px",
                                                        fontSize: 10,
                                                        fontWeight: 800,
                                                        color: theme.headerText,
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.05em",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {h}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {aggregate.allVisits.map((visit, idx) => {
                                        const totalStock = visit.products.reduce(
                                            (s, p) => s + p.currentStock,
                                            0
                                        );
                                        const nearExpiry = visit.products.reduce((sum, p) => {
                                            return (
                                                sum +
                                                p.batches.reduce((s, b) => {
                                                    if (!b.expiryDate) return s;
                                                    const days = Math.ceil(
                                                        (new Date(b.expiryDate).getTime() - Date.now()) /
                                                            (1000 * 60 * 60 * 24)
                                                    );
                                                    return days > 0 && days <= 30 ? s + b.quantity : s;
                                                }, 0)
                                            );
                                        }, 0);

                                        return (
                                            <tr
                                                key={visit.id}
                                                onClick={() => setSelectedVisit(visit)}
                                                style={{
                                                    borderBottom: isDark
                                                        ? "1px solid rgba(255,255,255,0.06)"
                                                        : "1px solid rgba(0,0,0,0.06)",
                                                    cursor: "pointer",
                                                    transition: "background 0.15s",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = theme.rowHover;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = "transparent";
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        padding: "12px 12px",
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        color: theme.subtitle,
                                                    }}
                                                >
                                                    {idx + 1}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "12px 12px",
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        color: theme.cellBold,
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {new Date(visit.timestamp).toLocaleString("en-MY", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </td>
                                                <td style={{ padding: "12px 12px", fontSize: 12, color: theme.cellText }}>
                                                    {visit.products.length} SKU
                                                    {visit.products.length !== 1 ? "s" : ""}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "12px 12px",
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        color: theme.cellBold,
                                                    }}
                                                >
                                                    {totalStock} units
                                                </td>
                                                <td style={{ padding: "12px 12px", fontSize: 12 }}>
                                                    <span
                                                        style={{
                                                            fontWeight: nearExpiry > 0 ? 600 : 400,
                                                            color:
                                                                nearExpiry > 20
                                                                    ? isDark
                                                                        ? "#fca5a5"
                                                                        : "#dc2626"
                                                                    : nearExpiry > 0
                                                                    ? isDark
                                                                        ? "#fbbf24"
                                                                        : "#d97706"
                                                                    : theme.cellText,
                                                        }}
                                                    >
                                                        {nearExpiry} units
                                                    </span>
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "12px 12px",
                                                        fontSize: 12,
                                                        color: theme.cellText,
                                                        maxWidth: 240,
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {visit.notes || <span style={{ opacity: 0.5 }}>—</span>}
                                                </td>
                                                <td style={{ padding: "12px 12px" }}>
                                                    <ChevronRight size={14} style={{ color: theme.subtitle }} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: Products */}
            {activeTab === "products" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {productTrends.length === 0 ? (
                        <div
                            style={{
                                background: theme.cardBg,
                                border: theme.cardBorder,
                                borderRadius: 18,
                                padding: "40px 24px",
                                textAlign: "center",
                                color: theme.subtitle,
                                fontSize: 13,
                            }}
                        >
                            No product data yet.
                        </div>
                    ) : (
                        productTrends.map((trend) => {
                            const latest = trend.points[trend.points.length - 1];
                            const earliest = trend.points[0];
                            const delta = latest.stock - earliest.stock;
                            const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
                            const directionColor =
                                direction === "up" ? "#22c55e" : direction === "down" ? "#ef4444" : theme.subtitle;

                            return (
                                <div
                                    key={trend.productId}
                                    style={{
                                        background: theme.cardBg,
                                        border: theme.cardBorder,
                                        borderRadius: 18,
                                        padding: "20px 22px",
                                        backdropFilter: "blur(20px)",
                                        WebkitBackdropFilter: "blur(20px)",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: 14,
                                            flexWrap: "wrap",
                                            gap: 8,
                                        }}
                                    >
                                        <div>
                                            <h3
                                                style={{
                                                    fontSize: 15,
                                                    fontWeight: 700,
                                                    color: theme.title,
                                                    margin: 0,
                                                    letterSpacing: "-0.2px",
                                                }}
                                            >
                                                {trend.name}
                                            </h3>
                                            <p
                                                style={{
                                                    fontSize: 11,
                                                    color: theme.subtitle,
                                                    margin: "3px 0 0",
                                                }}
                                            >
                                                Current: {latest.stock} units • {trend.points.length} visit
                                                {trend.points.length > 1 ? "s" : ""} tracked
                                            </p>
                                        </div>
                                        <div
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 4,
                                                padding: "4px 10px",
                                                borderRadius: 8,
                                                fontSize: 12,
                                                fontWeight: 700,
                                                background: isDark
                                                    ? `${directionColor}22`
                                                    : `${directionColor}18`,
                                                color: directionColor,
                                            }}
                                        >
                                            {direction === "up" ? "↑" : direction === "down" ? "↓" : "→"}
                                            {Math.abs(delta)} units
                                        </div>
                                    </div>
                                    <div style={{ width: "100%", height: 160 }}>
                                        <ResponsiveContainer>
                                            <LineChart
                                                data={trend.points}
                                                margin={{ top: 5, right: 8, left: -20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{ fontSize: 10, fill: chartAxisColor }}
                                                    axisLine={{ stroke: chartGridColor }}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 10, fill: chartAxisColor }}
                                                    axisLine={{ stroke: chartGridColor }}
                                                    tickLine={false}
                                                />
                                                <RechartsTooltip contentStyle={tooltipStyle} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="stock"
                                                    stroke="var(--preset-primary)"
                                                    strokeWidth={2.5}
                                                    dot={{ fill: "var(--preset-primary)", r: 3 }}
                                                    activeDot={{ r: 5 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Visit detail dialog */}
            {selectedVisit && (
                <VisitDetailDialog
                    visit={selectedVisit}
                    onClose={() => setSelectedVisit(null)}
                    isDark={isDark}
                />
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   THEME BUILDER
   ═══════════════════════════════════════════════════════════════ */
function buildTheme(isDark: boolean) {
    if (isDark) {
        return {
            cardBg: "linear-gradient(135deg, rgba(26, 34, 44, 0.9), rgba(35, 45, 56, 0.85))",
            cardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.12)",
            innerBg: "rgba(15, 20, 28, 0.5)",
            innerBorder: "1px solid rgba(var(--preset-primary-rgb), 0.1)",
            glowColor: "rgba(var(--preset-primary-rgb), 0.08)",
            title: "hsl(var(--foreground))",
            subtitle: "hsl(var(--muted-foreground))",
            label: "hsl(var(--muted-foreground))",
            divider: "rgba(var(--preset-primary-rgb), 0.1)",
            headerText: "hsl(var(--muted-foreground))",
            cellText: "hsl(var(--muted-foreground))",
            cellBold: "hsl(var(--foreground))",
            rowHover: "rgba(var(--preset-primary-rgb), 0.06)",
            inputBg: "rgba(var(--preset-primary-rgb), 0.06)",
            expandBtnBg: "rgba(var(--preset-primary-rgb), 0.06)",
            pillBg: "rgba(var(--preset-primary-rgb), 0.12)",
            pillActive: "rgba(var(--preset-primary-rgb), 0.6)",
            pillText: "var(--preset-lighter)",
            pillActiveText: "#fff",
            aiBadgeBg: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
            urgency: {
                critical: { bg: "rgba(239, 68, 68, 0.14)", text: "rgb(252, 165, 165)", accent: "rgb(239, 68, 68)" },
                warning: { bg: "rgba(234, 179, 8, 0.14)", text: "rgb(253, 224, 71)", accent: "rgb(234, 179, 8)" },
                info: { bg: "rgba(34, 197, 94, 0.14)", text: "rgb(134, 239, 172)", accent: "rgb(34, 197, 94)" },
            },
        };
    }
    return {
        cardBg: "linear-gradient(135deg, rgba(250, 247, 255, 0.95), rgba(243, 237, 255, 0.85))",
        cardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.1)",
        innerBg: "rgba(255, 255, 255, 0.7)",
        innerBorder: "1px solid rgba(var(--preset-primary-rgb), 0.08)",
        glowColor: "rgba(var(--preset-primary-rgb), 0.05)",
        title: "hsl(var(--foreground))",
        subtitle: "hsl(var(--muted-foreground))",
        label: "hsl(var(--muted-foreground))",
        divider: "rgba(var(--preset-primary-rgb), 0.1)",
        headerText: "hsl(var(--muted-foreground))",
        cellText: "hsl(var(--muted-foreground))",
        cellBold: "hsl(var(--foreground))",
        rowHover: "rgba(var(--preset-primary-rgb), 0.04)",
        inputBg: "rgba(var(--preset-primary-rgb), 0.04)",
        expandBtnBg: "rgba(var(--preset-primary-rgb), 0.04)",
        pillBg: "rgba(var(--preset-primary-rgb), 0.08)",
        pillActive: "rgba(var(--preset-primary-rgb), 0.85)",
        pillText: "var(--preset-primary)",
        pillActiveText: "#fff",
        aiBadgeBg: "linear-gradient(135deg, var(--preset-lighter), var(--preset-primary))",
        urgency: {
            critical: { bg: "rgba(239, 68, 68, 0.1)", text: "rgb(153, 27, 27)", accent: "rgb(220, 38, 38)" },
            warning: { bg: "rgba(234, 179, 8, 0.12)", text: "rgb(133, 77, 14)", accent: "rgb(202, 138, 4)" },
            info: { bg: "rgba(34, 197, 94, 0.1)", text: "rgb(22, 101, 52)", accent: "rgb(22, 163, 74)" },
        },
    };
}

/* ═══════════════════════════════════════════════════════════════
   MAIN BOSS DASHBOARD
   ═══════════════════════════════════════════════════════════════ */
type SortKey = "name" | "lastVisit" | "stock" | "nearExpiry" | "verdict";
type SortDir = "asc" | "desc";

const BossDashboard = () => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const visits = useVisits();

    const [searchQuery, setSearchQuery] = useState("");
    const [verdictFilter, setVerdictFilter] = useState<"all" | VerdictTone>("all");
    const [sortKey, setSortKey] = useState<SortKey>("verdict");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [activeStoreId, setActiveStoreId] = useState<string | null>(null);

    const aggregates = useMemo(() => aggregateVisits(visits), [visits]);
    const actions = useMemo(() => deriveActions(aggregates), [aggregates]);
    const theme = useMemo(() => buildTheme(isDark), [isDark]);

    const activeStore = useMemo(
        () => aggregates.find((a) => a.supermarketId === activeStoreId) || null,
        [aggregates, activeStoreId]
    );

    const filtered = useMemo(() => {
        let result = aggregates;
        if (verdictFilter !== "all") {
            result = result.filter((a) => a.verdict.tone === verdictFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter((a) => a.supermarketName.toLowerCase().includes(q));
        }

        const toneOrder = { danger: 0, warning: 1, good: 2 };
        const sorted = [...result].sort((a, b) => {
            let cmp = 0;
            switch (sortKey) {
                case "name":
                    cmp = a.supermarketName.localeCompare(b.supermarketName);
                    break;
                case "lastVisit":
                    cmp =
                        new Date(a.lastVisit?.timestamp || 0).getTime() -
                        new Date(b.lastVisit?.timestamp || 0).getTime();
                    break;
                case "stock":
                    cmp = a.totalStock - b.totalStock;
                    break;
                case "nearExpiry":
                    cmp = a.nearExpiryUnits - b.nearExpiryUnits;
                    break;
                case "verdict":
                    cmp = toneOrder[a.verdict.tone] - toneOrder[b.verdict.tone];
                    break;
            }
            return sortDir === "asc" ? cmp : -cmp;
        });
        return sorted;
    }, [aggregates, searchQuery, verdictFilter, sortKey, sortDir]);

    const criticalActions = actions.filter((a) => a.urgency === "critical").length;
    const storesNeedingRefill = aggregates.filter((a) => a.outOfStockProducts > 0).length;
    const totalAtRisk = aggregates.reduce((s, a) => s + a.nearExpiryUnits, 0);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const SortButton = ({ label, keyName }: { label: string; keyName: SortKey }) => (
        <button
            onClick={() => handleSort(keyName)}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                color: theme.headerText,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                padding: 0,
                fontFamily: "'Outfit', sans-serif",
            }}
        >
            {label}
            <ArrowUpDown size={12} style={{ opacity: sortKey === keyName ? 1 : 0.5 }} />
        </button>
    );

    const verdictOptions = [
        { value: "all" as const, label: "All", count: aggregates.length },
        { value: "danger" as const, label: "Urgent", count: aggregates.filter((a) => a.verdict.tone === "danger").length },
        { value: "warning" as const, label: "Watch", count: aggregates.filter((a) => a.verdict.tone === "warning").length },
        { value: "good" as const, label: "Healthy", count: aggregates.filter((a) => a.verdict.tone === "good").length },
    ];

    /* ─── If a store is selected, show StoreView instead of the table ─── */
    if (activeStore) {
        return (
            <>
                <style>{`
                    @keyframes shimmer-badge { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                    @keyframes slideInRight {
                        from { opacity: 0; transform: translateX(40px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                    @keyframes slideInLeft {
                        from { opacity: 0; transform: translateX(-40px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                `}</style>
                <StoreView
                    aggregate={activeStore}
                    onBack={() => setActiveStoreId(null)}
                    theme={theme}
                    isDark={isDark}
                />
            </>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, fontFamily: "'Outfit', sans-serif" }}>
            <style>{`
                @keyframes shimmer-badge { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(40px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-40px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>

            <div style={{ animation: "slideInLeft 0.3s cubic-bezier(0.22, 1, 0.36, 1)" }}>
                {/* Summary strip */}
                <div
                    style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}
                    className="!grid-cols-1 sm:!grid-cols-3"
                >
                    {[
                        {
                            label: "Critical actions",
                            value: criticalActions,
                            sub: "AI-flagged, act today",
                            accent: theme.urgency.critical.accent,
                        },
                        {
                            label: "Stores needing refill",
                            value: storesNeedingRefill,
                            sub: "Out of stock",
                            accent: theme.urgency.warning.accent,
                        },
                        {
                            label: "Units near expiry",
                            value: totalAtRisk,
                            sub: "Under 30 days shelf life",
                            accent: theme.urgency.info.accent,
                        },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            style={{
                                background: theme.cardBg,
                                border: theme.cardBorder,
                                borderRadius: 16,
                                padding: "16px 18px",
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    width: 3,
                                    background: stat.accent,
                                }}
                            />
                            <p
                                style={{
                                    fontSize: 11,
                                    color: theme.label,
                                    margin: 0,
                                    fontWeight: 500,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                }}
                            >
                                {stat.label}
                            </p>
                            <p
                                style={{
                                    fontSize: 28,
                                    fontWeight: 700,
                                    color: theme.title,
                                    margin: "4px 0 2px 0",
                                    letterSpacing: "-0.5px",
                                    lineHeight: 1,
                                }}
                            >
                                {stat.value}
                            </p>
                            <p style={{ fontSize: 11, color: theme.subtitle, margin: 0 }}>{stat.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Store Breakdown */}
                <div
                    style={{
                        background: theme.cardBg,
                        borderRadius: 20,
                        border: theme.cardBorder,
                        padding: "22px 26px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                        position: "relative",
                        overflow: "hidden",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        marginBottom: 16,
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: -60,
                            right: -60,
                            width: 180,
                            height: 180,
                            background: `radial-gradient(circle, ${theme.glowColor} 0%, transparent 70%)`,
                            pointerEvents: "none",
                        }}
                    />

                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 12,
                            position: "relative",
                        }}
                    >
                        <div>
                            <h3
                                style={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: theme.title,
                                    margin: 0,
                                    letterSpacing: "-0.3px",
                                }}
                            >
                                Store Breakdown
                            </h3>
                            <p style={{ fontSize: 12, color: theme.subtitle, margin: "4px 0 0" }}>
                                {filtered.length} store{filtered.length !== 1 ? "s" : ""} • click any row for detailed
                                view
                            </p>
                        </div>

                        <div style={{ background: theme.pillBg, borderRadius: 10, padding: 3, display: "flex", gap: 2 }}>
                            {verdictOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setVerdictFilter(opt.value)}
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        padding: "5px 10px",
                                        borderRadius: 8,
                                        border: "none",
                                        cursor: "pointer",
                                        transition: "all 0.15s ease",
                                        color: verdictFilter === opt.value ? theme.pillActiveText : theme.pillText,
                                        background: verdictFilter === opt.value ? theme.pillActive : "transparent",
                                        boxShadow:
                                            verdictFilter === opt.value
                                                ? "0 1px 4px rgba(var(--preset-primary-rgb), 0.25)"
                                                : "none",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        fontFamily: "'Outfit', sans-serif",
                                    }}
                                >
                                    {opt.label}
                                    {opt.count > 0 && (
                                        <span
                                            style={{
                                                fontSize: 9,
                                                fontWeight: 700,
                                                padding: "1px 5px",
                                                borderRadius: 6,
                                                background:
                                                    verdictFilter === opt.value
                                                        ? "rgba(255,255,255,0.2)"
                                                        : theme.expandBtnBg,
                                                color: verdictFilter === opt.value ? "#fff" : theme.subtitle,
                                            }}
                                        >
                                            {opt.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: theme.inputBg,
                            border: theme.cardBorder,
                            borderRadius: 12,
                            padding: "0 14px",
                            position: "relative",
                        }}
                    >
                        <Search size={15} style={{ color: theme.subtitle, flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Search by supermarket name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                flex: 1,
                                padding: "10px 0",
                                fontSize: 13,
                                fontWeight: 500,
                                background: "transparent",
                                border: "none",
                                outline: "none",
                                color: theme.title,
                                fontFamily: "'Outfit', sans-serif",
                            }}
                        />
                    </div>

                    <div
                        style={{
                            borderRadius: 14,
                            border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)",
                            background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)",
                            overflow: "hidden",
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                padding: "13px 17px",
                                borderBottom: isDark
                                    ? "1px solid rgba(255,255,255,0.07)"
                                    : "1px solid rgba(0,0,0,0.08)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: 8,
                            }}
                        >
                            <div style={{ fontSize: 13, fontWeight: 800, color: theme.title }}>
                                All Stores ({filtered.length})
                            </div>
                            <div style={{ fontSize: 10, color: theme.subtitle }}>
                                Click any row for full store detail
                            </div>
                        </div>

                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                <thead>
                                    <tr
                                        style={{
                                            borderBottom: isDark
                                                ? "1px solid rgba(255,255,255,0.07)"
                                                : "1px solid rgba(0,0,0,0.08)",
                                        }}
                                    >
                                        <th
                                            style={{
                                                padding: "9px 11px",
                                                textAlign: "left",
                                                fontSize: 10,
                                                fontWeight: 800,
                                                color: theme.headerText,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                                minWidth: 36,
                                            }}
                                        >
                                            #
                                        </th>
                                        <th style={{ textAlign: "left", padding: "9px 11px", whiteSpace: "nowrap" }}>
                                            <SortButton label="Supermarket" keyName="name" />
                                        </th>
                                        <th style={{ textAlign: "left", padding: "9px 11px", whiteSpace: "nowrap" }}>
                                            <SortButton label="Last Visit" keyName="lastVisit" />
                                        </th>
                                        <th style={{ textAlign: "left", padding: "9px 11px", whiteSpace: "nowrap" }}>
                                            <SortButton label="Stock" keyName="stock" />
                                        </th>
                                        <th style={{ textAlign: "left", padding: "9px 11px", whiteSpace: "nowrap" }}>
                                            <SortButton label="Near Expiry" keyName="nearExpiry" />
                                        </th>
                                        <th style={{ textAlign: "left", padding: "9px 11px", whiteSpace: "nowrap" }}>
                                            <SortButton label="Verdict" keyName="verdict" />
                                        </th>
                                        <th style={{ padding: "9px 11px", width: 36 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                style={{
                                                    padding: "40px 0",
                                                    textAlign: "center",
                                                    color: theme.subtitle,
                                                    fontSize: 14,
                                                }}
                                            >
                                                No stores match your filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((agg, idx) => (
                                            <tr
                                                key={agg.supermarketId}
                                                onClick={() => setActiveStoreId(agg.supermarketId)}
                                                style={{
                                                    borderBottom: isDark
                                                        ? "1px solid rgba(255,255,255,0.06)"
                                                        : "1px solid rgba(0,0,0,0.06)",
                                                    cursor: "pointer",
                                                    transition: "background 0.15s ease",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = theme.rowHover;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = "transparent";
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        padding: "12px 11px",
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        color: theme.subtitle,
                                                    }}
                                                >
                                                    {idx + 1}
                                                </td>
                                                <td style={{ padding: "12px 11px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                        <div
                                                            style={{
                                                                width: 30,
                                                                height: 30,
                                                                borderRadius: 8,
                                                                background:
                                                                    "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                color: "#fff",
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            <Store size={14} />
                                                        </div>
                                                        <div>
                                                            <div
                                                                style={{
                                                                    fontWeight: 600,
                                                                    fontSize: 13,
                                                                    color: theme.cellBold,
                                                                }}
                                                            >
                                                                {agg.supermarketName}
                                                            </div>
                                                            <div style={{ fontSize: 11, color: theme.cellText }}>
                                                                {agg.totalVisits} visit
                                                                {agg.totalVisits > 1 ? "s" : ""}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "12px 11px",
                                                        fontSize: 12,
                                                        color: theme.cellText,
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {agg.lastVisit
                                                        ? new Date(agg.lastVisit.timestamp).toLocaleString("en-MY", {
                                                              day: "numeric",
                                                              month: "short",
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                          })
                                                        : "—"}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "12px 11px",
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        color: theme.cellBold,
                                                    }}
                                                >
                                                    {agg.totalStock} units
                                                </td>
                                                <td style={{ padding: "12px 11px", fontSize: 12 }}>
                                                    <span
                                                        style={{
                                                            fontWeight: agg.nearExpiryUnits > 0 ? 600 : 400,
                                                            color:
                                                                agg.nearExpiryUnits > 20
                                                                    ? isDark
                                                                        ? "#fca5a5"
                                                                        : "#dc2626"
                                                                    : agg.nearExpiryUnits > 0
                                                                    ? isDark
                                                                        ? "#fbbf24"
                                                                        : "#d97706"
                                                                    : theme.cellText,
                                                        }}
                                                    >
                                                        {agg.nearExpiryUnits} units
                                                    </span>
                                                </td>
                                                <td style={{ padding: "12px 11px" }}>
                                                    <VerdictBadge tone={agg.verdict.tone} label={agg.verdict.label} />
                                                </td>
                                                <td style={{ padding: "12px 11px" }}>
                                                    <ChevronRight size={14} style={{ color: theme.subtitle }} />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* AI Action Feed */}
                <div
                    style={{
                        background: theme.cardBg,
                        border: theme.cardBorder,
                        borderRadius: 20,
                        padding: "22px 26px",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: -60,
                            right: -60,
                            width: 180,
                            height: 180,
                            background: `radial-gradient(circle, ${theme.glowColor} 0%, transparent 70%)`,
                            pointerEvents: "none",
                        }}
                    />

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 16,
                            position: "relative",
                        }}
                    >
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <h3
                                    style={{
                                        fontSize: 22,
                                        fontWeight: 700,
                                        color: theme.title,
                                        margin: 0,
                                        letterSpacing: "-0.3px",
                                    }}
                                >
                                    AI Action Feed
                                </h3>
                                <span
                                    style={{
                                        background: theme.aiBadgeBg,
                                        color: "#fff",
                                        fontSize: 10,
                                        fontWeight: 700,
                                        padding: "3px 8px",
                                        borderRadius: 6,
                                        letterSpacing: "0.5px",
                                    }}
                                >
                                    AI
                                </span>
                            </div>
                            <p style={{ fontSize: 12, color: theme.subtitle, margin: "4px 0 0" }}>
                                Ranked by urgency • updated from latest field reports
                            </p>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
                        {actions.length === 0 ? (
                            <div
                                style={{
                                    padding: "40px 20px",
                                    textAlign: "center",
                                    color: theme.subtitle,
                                    fontSize: 13,
                                }}
                            >
                                <CheckCircle2
                                    size={32}
                                    style={{ color: "#22c55e", marginBottom: 8, opacity: 0.6 }}
                                />
                                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>All caught up</div>
                                <div style={{ fontSize: 12 }}>No critical actions right now.</div>
                            </div>
                        ) : (
                            actions.map((action) => {
                                const u = theme.urgency[action.urgency];
                                return (
                                    <div
                                        key={action.id}
                                        style={{
                                            background: theme.innerBg,
                                            border: theme.innerBorder,
                                            borderRadius: 14,
                                            padding: 14,
                                            display: "flex",
                                            gap: 12,
                                            alignItems: "flex-start",
                                            position: "relative",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                bottom: 0,
                                                width: 3,
                                                background: u.accent,
                                            }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0, paddingLeft: 4 }}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    alignItems: "center",
                                                    gap: 8,
                                                    marginBottom: 4,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        padding: "2px 8px",
                                                        borderRadius: 6,
                                                        background: u.bg,
                                                        color: u.text,
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.5px",
                                                    }}
                                                >
                                                    {action.urgency}
                                                </span>
                                                <span style={{ fontSize: 11, color: theme.subtitle }}>
                                                    {action.supermarket} • {action.product}
                                                </span>
                                            </div>
                                            <p
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    color: theme.title,
                                                    margin: "0 0 2px 0",
                                                }}
                                            >
                                                {action.title}
                                            </p>
                                            <p
                                                style={{
                                                    fontSize: 12,
                                                    color: theme.subtitle,
                                                    margin: "0 0 10px 0",
                                                }}
                                            >
                                                {action.subtitle}
                                            </p>
                                            <div
                                                style={{
                                                    background: theme.pillBg,
                                                    borderRadius: 10,
                                                    padding: "8px 12px",
                                                    fontSize: 12,
                                                    color: theme.pillText,
                                                    fontWeight: 500,
                                                    marginBottom: 6,
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                <span style={{ fontWeight: 700 }}>AI suggestion: </span>
                                                {action.recommendation}
                                            </div>
                                            <p
                                                style={{
                                                    fontSize: 11,
                                                    color: theme.subtitle,
                                                    margin: 0,
                                                    fontStyle: "italic",
                                                }}
                                            >
                                                {action.impact}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BossDashboard;