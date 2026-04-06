"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import {
    DollarSign,
    Search,
    ChevronDown,
    ChevronUp,
    MoreHorizontal,
    ArrowUpDown,
    Loader2,
    Copy,
    Check,
    X,
    SlidersHorizontal,
    Eye,
    EyeOff,
    Download,
    Calendar,
    Clock,
    TrendingUp,
    ArrowDownUp,
    Plus,
    Wallet,
    Receipt,
    Filter,
    UserPlus,
    Pencil,
    Trash2,
    CreditCard,
    Building2,
    BanknoteIcon,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileSpreadsheet,
    ChevronLeft,
    ChevronRight,
    Users,
    Sparkles,
    Ban,
    ShoppingCart,
    Package,
    Hash,
    Globe,
    Tag,
    BarChart3,
    Percent,
} from "lucide-react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SmallLoader, MediumLoader } from "@/components/ui/shop-intel-loader";
import { formatCurrency } from "@/src/core/constant/helper";
import toast from "react-hot-toast";
import OverviewDataCard from "@/src/features/sales/presentation/view/components/analytics/overview-data-card";

/* ════════════════════════════════════════════════════════════════════
   TYPES & DUMMY DATA
   ════════════════════════════════════════════════════════════════════ */

interface CommissionAffiliate {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

interface CommissionRecord {
    id: string;
    user_affiliate: CommissionAffiliate;
    order_id: string;
    total_sales: number;
    commission: number;
    quantity: number;
    source: string;
    is_paid: boolean;
    notes: string;
    created_at: string;
    updated_at: string;
}

const DUMMY_AFFILIATES: CommissionAffiliate[] = [
    { id: "aff-001", first_name: "Sarah", last_name: "Ahmad", email: "sarah.ahmad@gmail.com" },
    { id: "aff-002", first_name: "Muhammad", last_name: "Rizki", email: "m.rizki@outlook.com" },
    { id: "aff-003", first_name: "Aisha", last_name: "Tan", email: "aisha.tan@yahoo.com" },
    { id: "aff-005", first_name: "Nurul", last_name: "Huda", email: "nurul.huda@hotmail.com" },
    { id: "aff-006", first_name: "Raj", last_name: "Kumar", email: "raj.kumar@gmail.com" },
    { id: "aff-007", first_name: "Fatimah", last_name: "Zahra", email: "fatimah.z@gmail.com" },
    { id: "aff-009", first_name: "Hana", last_name: "Sofia", email: "hana.s@icloud.com" },
    { id: "aff-011", first_name: "Priya", last_name: "Menon", email: "priya.menon@yahoo.com" },
    { id: "aff-014", first_name: "Ethan", last_name: "Cheah", email: "ethan.cheah@gmail.com" },
    { id: "aff-016", first_name: "Vikram", last_name: "Singh", email: "vikram.singh@gmail.com" },
    { id: "aff-021", first_name: "Nadia", last_name: "Rahman", email: "nadia.r@gmail.com" },
    { id: "aff-023", first_name: "Mei Ling", last_name: "Chow", email: "ml.chow@gmail.com" },
    { id: "aff-025", first_name: "Sophie", last_name: "Lim", email: "sophie.lim@icloud.com" },
    { id: "aff-028", first_name: "Zach", last_name: "Yap", email: "zach.yap@outlook.com" },
];

const DUMMY_COMMISSIONS: CommissionRecord[] = [
    {
        id: "com-001", order_id: "ORD-4821", total_sales: 450, commission: 45, quantity: 3, source: "Instagram",
        is_paid: true, notes: "", created_at: "2025-03-10T08:30:00Z", updated_at: "2025-03-18T14:22:00Z",
        user_affiliate: DUMMY_AFFILIATES[0],
    },
    {
        id: "com-002", order_id: "ORD-4835", total_sales: 890, commission: 89, quantity: 5, source: "TikTok",
        is_paid: true, notes: "High-value order", created_at: "2025-03-12T10:15:00Z", updated_at: "2025-03-18T14:22:00Z",
        user_affiliate: DUMMY_AFFILIATES[0],
    },
    {
        id: "com-003", order_id: "ORD-4901", total_sales: 1860, commission: 186, quantity: 8, source: "Website",
        is_paid: true, notes: "", created_at: "2025-03-18T09:00:00Z", updated_at: "2025-03-20T11:45:00Z",
        user_affiliate: DUMMY_AFFILIATES[1],
    },
    {
        id: "com-004", order_id: "ORD-4910", total_sales: 2300, commission: 230, quantity: 12, source: "Instagram",
        is_paid: false, notes: "Awaiting verification", created_at: "2025-03-15T14:00:00Z", updated_at: "2025-03-15T14:00:00Z",
        user_affiliate: DUMMY_AFFILIATES[1],
    },
    {
        id: "com-005", order_id: "ORD-4922", total_sales: 3500, commission: 350, quantity: 15, source: "Facebook",
        is_paid: false, notes: "", created_at: "2025-03-20T11:30:00Z", updated_at: "2025-03-20T11:30:00Z",
        user_affiliate: DUMMY_AFFILIATES[2],
    },
    {
        id: "com-006", order_id: "ORD-4930", total_sales: 780, commission: 78, quantity: 4, source: "TikTok",
        is_paid: true, notes: "", created_at: "2025-03-19T16:00:00Z", updated_at: "2025-03-22T13:30:00Z",
        user_affiliate: DUMMY_AFFILIATES[3],
    },
    {
        id: "com-007", order_id: "ORD-4941", total_sales: 770, commission: 77, quantity: 3, source: "Website",
        is_paid: true, notes: "", created_at: "2025-03-22T08:00:00Z", updated_at: "2025-03-22T13:30:00Z",
        user_affiliate: DUMMY_AFFILIATES[4],
    },
    {
        id: "com-008", order_id: "ORD-4950", total_sales: 1200, commission: 120, quantity: 6, source: "Instagram",
        is_paid: false, notes: "Pending batch review", created_at: "2025-03-14T10:00:00Z", updated_at: "2025-03-14T10:00:00Z",
        user_affiliate: DUMMY_AFFILIATES[5],
    },
    {
        id: "com-009", order_id: "ORD-4965", total_sales: 2100, commission: 210, quantity: 10, source: "Facebook",
        is_paid: false, notes: "", created_at: "2025-03-21T09:30:00Z", updated_at: "2025-03-21T09:30:00Z",
        user_affiliate: DUMMY_AFFILIATES[6],
    },
    {
        id: "com-010", order_id: "ORD-4980", total_sales: 1400, commission: 140, quantity: 7, source: "TikTok",
        is_paid: true, notes: "", created_at: "2025-03-25T13:00:00Z", updated_at: "2025-03-25T15:00:00Z",
        user_affiliate: DUMMY_AFFILIATES[7],
    },
    {
        id: "com-011", order_id: "ORD-4990", total_sales: 980, commission: 98, quantity: 5, source: "Website",
        is_paid: true, notes: "", created_at: "2025-03-16T07:30:00Z", updated_at: "2025-03-23T16:10:00Z",
        user_affiliate: DUMMY_AFFILIATES[8],
    },
    {
        id: "com-012", order_id: "ORD-5001", total_sales: 1470, commission: 147, quantity: 8, source: "Instagram",
        is_paid: false, notes: "Large order — needs review", created_at: "2025-03-23T11:00:00Z", updated_at: "2025-03-23T11:00:00Z",
        user_affiliate: DUMMY_AFFILIATES[9],
    },
    {
        id: "com-013", order_id: "ORD-5010", total_sales: 1950, commission: 195, quantity: 9, source: "TikTok",
        is_paid: true, notes: "", created_at: "2025-03-17T15:00:00Z", updated_at: "2025-03-26T09:00:00Z",
        user_affiliate: DUMMY_AFFILIATES[10],
    },
    {
        id: "com-014", order_id: "ORD-5025", total_sales: 1950, commission: 195, quantity: 11, source: "Facebook",
        is_paid: false, notes: "", created_at: "2025-03-24T08:00:00Z", updated_at: "2025-03-24T08:00:00Z",
        user_affiliate: DUMMY_AFFILIATES[11],
    },
    {
        id: "com-015", order_id: "ORD-5201", total_sales: 3200, commission: 320, quantity: 14, source: "Website",
        is_paid: false, notes: "Top performer commission", created_at: "2025-03-22T12:00:00Z", updated_at: "2025-03-22T12:00:00Z",
        user_affiliate: DUMMY_AFFILIATES[12],
    },
    {
        id: "com-016", order_id: "ORD-5302", total_sales: 1800, commission: 180, quantity: 6, source: "Instagram",
        is_paid: true, notes: "", created_at: "2025-03-24T09:00:00Z", updated_at: "2025-03-25T14:00:00Z",
        user_affiliate: DUMMY_AFFILIATES[13],
    },
    {
        id: "com-017", order_id: "ORD-5403", total_sales: 2400, commission: 240, quantity: 10, source: "TikTok",
        is_paid: true, notes: "", created_at: "2025-03-26T10:00:00Z", updated_at: "2025-03-26T16:30:00Z",
        user_affiliate: DUMMY_AFFILIATES[0],
    },
    {
        id: "com-018", order_id: "ORD-5504", total_sales: 560, commission: 56, quantity: 2, source: "Facebook",
        is_paid: false, notes: "", created_at: "2025-03-27T14:00:00Z", updated_at: "2025-03-27T14:00:00Z",
        user_affiliate: DUMMY_AFFILIATES[3],
    },
    {
        id: "com-019", order_id: "ORD-5605", total_sales: 1100, commission: 110, quantity: 5, source: "Website",
        is_paid: false, notes: "", created_at: "2025-03-21T16:00:00Z", updated_at: "2025-03-21T16:00:00Z",
        user_affiliate: DUMMY_AFFILIATES[5],
    },
    {
        id: "com-020", order_id: "ORD-5706", total_sales: 2900, commission: 290, quantity: 13, source: "Instagram",
        is_paid: true, notes: "Top performer bonus included", created_at: "2025-03-28T09:00:00Z", updated_at: "2025-03-28T11:00:00Z",
        user_affiliate: DUMMY_AFFILIATES[7],
    },
    {
        id: "com-021", order_id: "ORD-5807", total_sales: 4500, commission: 450, quantity: 20, source: "TikTok",
        is_paid: false, notes: "High value — manual review", created_at: "2025-03-11T09:00:00Z", updated_at: "2025-03-11T09:00:00Z",
        user_affiliate: DUMMY_AFFILIATES[9],
    },
    {
        id: "com-022", order_id: "ORD-5908", total_sales: 1650, commission: 165, quantity: 7, source: "Facebook",
        is_paid: true, notes: "", created_at: "2025-03-29T08:00:00Z", updated_at: "2025-03-29T10:15:00Z",
        user_affiliate: DUMMY_AFFILIATES[12],
    },
    {
        id: "com-023", order_id: "ORD-6001", total_sales: 340, commission: 34, quantity: 2, source: "Website",
        is_paid: true, notes: "", created_at: "2025-02-15T10:00:00Z", updated_at: "2025-02-15T12:00:00Z",
        user_affiliate: DUMMY_AFFILIATES[2],
    },
    {
        id: "com-024", order_id: "ORD-6102", total_sales: 5200, commission: 520, quantity: 25, source: "Instagram",
        is_paid: true, notes: "February top earner", created_at: "2025-02-18T09:00:00Z", updated_at: "2025-02-20T14:00:00Z",
        user_affiliate: DUMMY_AFFILIATES[1],
    },
    {
        id: "com-025", order_id: "ORD-6203", total_sales: 890, commission: 89, quantity: 4, source: "TikTok",
        is_paid: true, notes: "", created_at: "2025-01-10T09:00:00Z", updated_at: "2025-01-10T11:00:00Z",
        user_affiliate: DUMMY_AFFILIATES[4],
    },
];

/* ════════════════════════════════════════════════════════════════════
   STATUS BADGE (shimmer — matching payout screen)
   ════════════════════════════════════════════════════════════════════ */

function CommissionStatusBadge({ isPaid }: { isPaid: boolean }) {
    const c = isPaid
        ? { gradient: "linear-gradient(135deg, #22c55e, #4ade80)", shadow: "0 2px 8px rgba(34,197,94,0.3)", label: "Paid" }
        : { gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)", shadow: "0 2px 8px rgba(245,158,11,0.3)", label: "Pending" };
    return (
        <span
            style={{
                display: "inline-flex", alignItems: "center", position: "relative", overflow: "hidden",
                background: c.gradient, boxShadow: c.shadow, borderRadius: 6, padding: "2px 8px",
                fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
                color: "#fff", lineHeight: 1.6,
            }}
        >
            <span style={{ position: "relative", zIndex: 1 }}>{c.label}</span>
            <span style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                backgroundSize: "200% 100%", animation: "shimmer-badge 2s infinite linear",
            }} />
        </span>
    );
}

/* ════════════════════════════════════════════════════════════════════
   SOURCE BADGE
   ════════════════════════════════════════════════════════════════════ */

function SourceBadge({ source, isDark }: { source: string; isDark: boolean }) {
    const map: Record<string, { bg: string; text: string }> = {
        Instagram: { bg: isDark ? "rgba(236,72,153,0.15)" : "rgba(236,72,153,0.1)", text: "#ec4899" },
        TikTok: { bg: isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)", text: "#6366f1" },
        Facebook: { bg: isDark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)", text: "#3b82f6" },
        Website: { bg: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)", text: "#10b981" },
    };
    const s = map[source] || { bg: isDark ? "rgba(148,163,184,0.15)" : "rgba(148,163,184,0.1)", text: "#94a3b8" };
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 6,
            fontSize: 11, fontWeight: 600, background: s.bg, color: s.text, letterSpacing: "0.2px",
        }}>
            <Globe size={10} />
            {source}
        </span>
    );
}

/* ════════════════════════════════════════════════════════════════════
   CREATE COMMISSION DIALOG
   ════════════════════════════════════════════════════════════════════ */

function CreateCommissionDialog({
    onClose,
    onSubmit,
    isDark,
    affiliates,
}: {
    onClose: () => void;
    onSubmit: (data: {
        affiliate: CommissionAffiliate;
        order_id: string;
        total_sales: number;
        commission: number;
        quantity: number;
        source: string;
        notes: string;
    }) => void;
    isDark: boolean;
    affiliates: CommissionAffiliate[];
}) {
    const [selectedAffId, setSelectedAffId] = useState("");
    const [orderId, setOrderId] = useState("");
    const [totalSales, setTotalSales] = useState("");
    const [commission, setCommission] = useState("");
    const [quantity, setQuantity] = useState("");
    const [source, setSource] = useState("Website");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAffDropdown, setShowAffDropdown] = useState(false);
    const [affSearch, setAffSearch] = useState("");

    const selectedAff = affiliates.find((a) => a.id === selectedAffId);
    const filteredAffs = affiliates.filter(
        (a) =>
            `${a.first_name} ${a.last_name}`.toLowerCase().includes(affSearch.toLowerCase()) ||
            a.email.toLowerCase().includes(affSearch.toLowerCase())
    );

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500,
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
        color: isDark ? "#e2e8f0" : "#1a1a2e", outline: "none",
        fontFamily: "'Outfit', sans-serif", transition: "border-color 0.15s",
    };

    const labelStyle: React.CSSProperties = {
        fontSize: 12, fontWeight: 600, color: isDark ? "#94a3b8" : "#64748b",
        marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.4px",
    };

    // Auto-calc commission at 10% when total_sales changes
    useEffect(() => {
        if (totalSales && parseFloat(totalSales) > 0) {
            setCommission((parseFloat(totalSales) * 0.1).toFixed(2));
        }
    }, [totalSales]);

    const handleSubmit = () => {
        if (!selectedAff) { toast.error("Select an affiliate"); return; }
        if (!orderId.trim()) { toast.error("Enter an order ID"); return; }
        if (!totalSales || parseFloat(totalSales) <= 0) { toast.error("Enter a valid sales amount"); return; }
        if (!commission || parseFloat(commission) <= 0) { toast.error("Enter a valid commission"); return; }
        setIsSubmitting(true);
        setTimeout(() => {
            onSubmit({
                affiliate: selectedAff,
                order_id: orderId,
                total_sales: parseFloat(totalSales),
                commission: parseFloat(commission),
                quantity: parseInt(quantity) || 1,
                source,
                notes,
            });
            setIsSubmitting(false);
        }, 1000);
    };

    const sourceOptions = ["Website", "Instagram", "TikTok", "Facebook"];

    return (
        <div
            style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
            <div
                style={{
                    position: "relative", zIndex: 1, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto",
                    margin: "0 16px", background: isDark ? "hsl(222, 20%, 14%)" : "#fff",
                    borderRadius: 16, padding: "24px", boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
                    fontFamily: "'Outfit', sans-serif", color: isDark ? "#e2e8f0" : "#1a1a2e",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Add Commission</h2>
                        <p style={{ fontSize: 13, color: isDark ? "#94a3b8" : "#64748b", margin: "4px 0 0" }}>
                            Record a new commission entry for an affiliate
                        </p>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: isDark ? "#94a3b8" : "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Affiliate selector */}
                <div style={{ marginBottom: 16, position: "relative" }}>
                    <label style={labelStyle}>Affiliate</label>
                    <div
                        onClick={() => setShowAffDropdown(!showAffDropdown)}
                        style={{ ...inputStyle, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                    >
                        <span style={{ color: selectedAff ? (isDark ? "#e2e8f0" : "#1a1a2e") : (isDark ? "#64748b" : "#94a3b8") }}>
                            {selectedAff ? `${selectedAff.first_name} ${selectedAff.last_name}` : "Select affiliate..."}
                        </span>
                        <ChevronDown size={14} style={{ color: isDark ? "#64748b" : "#94a3b8" }} />
                    </div>
                    {showAffDropdown && (
                        <div style={{
                            position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, marginTop: 4,
                            background: isDark ? "hsl(222, 20%, 17%)" : "#fff",
                            border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                            borderRadius: 12, boxShadow: "0 12px 40px rgba(0,0,0,0.2)", overflow: "hidden",
                        }}>
                            <div style={{ padding: "8px 10px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
                                <input
                                    type="text" placeholder="Search affiliates..." value={affSearch}
                                    onChange={(e) => setAffSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ ...inputStyle, padding: "8px 10px", fontSize: 12, border: "none", background: "transparent" }}
                                    autoFocus
                                />
                            </div>
                            <div style={{ maxHeight: 200, overflowY: "auto" }}>
                                {filteredAffs.map((a) => (
                                    <div
                                        key={a.id}
                                        onClick={() => { setSelectedAffId(a.id); setShowAffDropdown(false); setAffSearch(""); }}
                                        style={{
                                            padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                                            transition: "background 0.1s",
                                            background: selectedAffId === a.id ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)") : "transparent",
                                        }}
                                        onMouseOver={(e) => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)")}
                                        onMouseOut={(e) => (e.currentTarget.style.background = selectedAffId === a.id ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)") : "transparent")}
                                    >
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                                            {a.first_name[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>{a.first_name} {a.last_name}</div>
                                            <div style={{ fontSize: 11, color: isDark ? "#64748b" : "#94a3b8" }}>{a.email}</div>
                                        </div>
                                    </div>
                                ))}
                                {filteredAffs.length === 0 && (
                                    <div style={{ padding: 16, textAlign: "center", fontSize: 12, color: isDark ? "#64748b" : "#94a3b8" }}>No affiliates found</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Order ID & Source row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div>
                        <label style={labelStyle}>Order ID</label>
                        <input type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="e.g. ORD-5001" style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Source</label>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {sourceOptions.map((s) => (
                                <button key={s} type="button" onClick={() => setSource(s)} style={{
                                    padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer",
                                    background: source === s ? "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))" : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                                    color: source === s ? "#fff" : (isDark ? "#94a3b8" : "#64748b"), transition: "all 0.15s",
                                }}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Total Sales & Commission & Quantity */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div>
                        <label style={labelStyle}>Total Sales (RM)</label>
                        <input type="number" value={totalSales} onChange={(e) => setTotalSales(e.target.value)} placeholder="0.00" style={inputStyle} min="0" step="0.01" />
                    </div>
                    <div>
                        <label style={labelStyle}>Commission (RM)</label>
                        <input type="number" value={commission} onChange={(e) => setCommission(e.target.value)} placeholder="0.00" style={inputStyle} min="0" step="0.01" />
                    </div>
                    <div>
                        <label style={labelStyle}>Quantity</label>
                        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="1" style={inputStyle} min="1" />
                    </div>
                </div>

                {/* Auto-calc hint */}
                {totalSales && parseFloat(totalSales) > 0 && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8, marginBottom: 16,
                        background: isDark ? "rgba(34,197,94,0.08)" : "rgba(34,197,94,0.06)",
                        border: `1px solid ${isDark ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.12)"}`,
                        fontSize: 11, color: "#22c55e", fontWeight: 500,
                    }}>
                        <Percent size={12} />
                        Auto-calculated at 10% — feel free to adjust
                    </div>
                )}

                {/* Notes */}
                <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Notes (optional)</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any notes..." rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                </div>

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button onClick={onClose} disabled={isSubmitting} style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: "transparent", color: isDark ? "#e2e8f0" : "#1a1a2e", cursor: "pointer" }}>
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isSubmitting} style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: isSubmitting ? 0.7 : 1 }}>
                        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                        Add Commission
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   EDIT COMMISSION DIALOG
   ════════════════════════════════════════════════════════════════════ */

function EditCommissionDialog({
    commission: comm,
    onClose,
    onSave,
    isDark,
}: {
    commission: CommissionRecord;
    onClose: () => void;
    onSave: (id: string, data: { total_sales: number; commission: number; quantity: number; source: string; notes: string; is_paid: boolean }) => void;
    isDark: boolean;
}) {
    const [totalSales, setTotalSales] = useState(String(comm.total_sales));
    const [commissionAmt, setCommissionAmt] = useState(String(comm.commission));
    const [quantity, setQuantity] = useState(String(comm.quantity));
    const [source, setSource] = useState(comm.source);
    const [notes, setNotes] = useState(comm.notes);
    const [isPaid, setIsPaid] = useState(comm.is_paid);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500,
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
        color: isDark ? "#e2e8f0" : "#1a1a2e", outline: "none", fontFamily: "'Outfit', sans-serif",
    };
    const labelStyle: React.CSSProperties = {
        fontSize: 12, fontWeight: 600, color: isDark ? "#94a3b8" : "#64748b",
        marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.4px",
    };

    const handleSave = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            onSave(comm.id, {
                total_sales: parseFloat(totalSales) || 0,
                commission: parseFloat(commissionAmt) || 0,
                quantity: parseInt(quantity) || 1,
                source,
                notes,
                is_paid: isPaid,
            });
            setIsSubmitting(false);
        }, 800);
    };

    const sourceOptions = ["Website", "Instagram", "TikTok", "Facebook"];

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
            <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto", margin: "0 16px", background: isDark ? "hsl(222, 20%, 14%)" : "#fff", borderRadius: 16, padding: "24px", boxShadow: "0 24px 80px rgba(0,0,0,0.3)", fontFamily: "'Outfit', sans-serif", color: isDark ? "#e2e8f0" : "#1a1a2e" }}
                onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Edit Commission</h2>
                        <p style={{ fontSize: 13, color: isDark ? "#94a3b8" : "#64748b", margin: "4px 0 0" }}>
                            {comm.user_affiliate.first_name} {comm.user_affiliate.last_name} — #{comm.order_id}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: isDark ? "#94a3b8" : "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Status toggle */}
                <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Status</label>
                    <div style={{ display: "flex", gap: 6 }}>
                        {[{ label: "Paid", val: true }, { label: "Pending", val: false }].map((s) => (
                            <button key={s.label} type="button" onClick={() => setIsPaid(s.val)} style={{
                                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                                background: isPaid === s.val ? "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))" : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                                color: isPaid === s.val ? "#fff" : (isDark ? "#94a3b8" : "#64748b"), transition: "all 0.15s",
                            }}>
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Total Sales & Commission & Qty */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div>
                        <label style={labelStyle}>Total Sales (RM)</label>
                        <input type="number" value={totalSales} onChange={(e) => setTotalSales(e.target.value)} style={inputStyle} min="0" step="0.01" />
                    </div>
                    <div>
                        <label style={labelStyle}>Commission (RM)</label>
                        <input type="number" value={commissionAmt} onChange={(e) => setCommissionAmt(e.target.value)} style={inputStyle} min="0" step="0.01" />
                    </div>
                    <div>
                        <label style={labelStyle}>Quantity</label>
                        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={inputStyle} min="1" />
                    </div>
                </div>

                {/* Source */}
                <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Source</label>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {sourceOptions.map((s) => (
                            <button key={s} type="button" onClick={() => setSource(s)} style={{
                                padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer",
                                background: source === s ? "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))" : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                                color: source === s ? "#fff" : (isDark ? "#94a3b8" : "#64748b"), transition: "all 0.15s",
                            }}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Notes</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button onClick={onClose} disabled={isSubmitting} style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: "transparent", color: isDark ? "#e2e8f0" : "#1a1a2e", cursor: "pointer" }}>Cancel</button>
                    <button onClick={handleSave} disabled={isSubmitting} style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: isSubmitting ? 0.7 : 1 }}>
                        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   DELETE COMMISSION DIALOG
   ════════════════════════════════════════════════════════════════════ */

function DeleteCommissionDialog({
    commission: comm,
    onClose,
    onConfirm,
    isDark,
}: {
    commission: CommissionRecord;
    onClose: () => void;
    onConfirm: () => void;
    isDark: boolean;
}) {
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
            <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440, margin: "0 16px", background: isDark ? "hsl(222, 20%, 14%)" : "#fff", borderRadius: 16, padding: "24px", boxShadow: "0 24px 80px rgba(0,0,0,0.3)", fontFamily: "'Outfit', sans-serif", color: isDark ? "#e2e8f0" : "#1a1a2e" }}
                onClick={(e) => e.stopPropagation()}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Delete Commission?</h2>
                <p style={{ fontSize: 13, color: isDark ? "#94a3b8" : "#64748b", margin: "0 0 20px", lineHeight: 1.5 }}>
                    This will permanently remove the commission of{" "}
                    <strong>{formatCurrency(comm.commission)}</strong> for order{" "}
                    <strong>#{comm.order_id}</strong> ({comm.user_affiliate.first_name} {comm.user_affiliate.last_name}).
                    This action cannot be undone.
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button onClick={onClose} style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: "transparent", color: isDark ? "#e2e8f0" : "#1a1a2e", cursor: "pointer" }}>Cancel</button>
                    <button onClick={() => { onConfirm(); onClose(); }} style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", background: "linear-gradient(135deg, #ef4444, #f87171)", color: "#fff", cursor: "pointer" }}>Delete</button>
                </div>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   BULK MARK AS PAID DIALOG
   ════════════════════════════════════════════════════════════════════ */

function BulkMarkPaidDialog({
    commissions,
    onClose,
    onConfirm,
    isDark,
}: {
    commissions: CommissionRecord[];
    onClose: () => void;
    onConfirm: (ids: string[]) => void;
    isDark: boolean;
}) {
    const pendingCommissions = commissions.filter((c) => !c.is_paid);
    const [selectedIds, setSelectedIds] = useState<string[]>(pendingCommissions.map((c) => c.id));
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalSelected = pendingCommissions.filter((c) => selectedIds.includes(c.id)).reduce((s, c) => s + c.commission, 0);

    const handleToggle = (id: string) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    const handleSelectAll = (checked: boolean) => setSelectedIds(checked ? pendingCommissions.map((c) => c.id) : []);

    const handleSubmit = () => {
        if (selectedIds.length === 0) { toast.error("Select at least one commission"); return; }
        setIsSubmitting(true);
        setTimeout(() => {
            onConfirm(selectedIds);
            setIsSubmitting(false);
        }, 1200);
    };

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
            <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto", margin: "0 16px", background: isDark ? "hsl(222, 20%, 14%)" : "#fff", borderRadius: 16, padding: "24px", boxShadow: "0 24px 80px rgba(0,0,0,0.3)", fontFamily: "'Outfit', sans-serif", color: isDark ? "#e2e8f0" : "#1a1a2e" }}
                onClick={(e) => e.stopPropagation()}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                            <Sparkles size={20} style={{ color: "var(--preset-primary)" }} />
                            Bulk Mark as Paid
                        </h2>
                        <p style={{ fontSize: 13, color: isDark ? "#94a3b8" : "#64748b", margin: "4px 0 0" }}>
                            Select pending commissions to mark as paid
                        </p>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: isDark ? "#94a3b8" : "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <X size={16} />
                    </button>
                </div>

                <div style={{ borderRadius: 12, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, overflow: "hidden", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
                        <Checkbox checked={selectedIds.length === pendingCommissions.length && pendingCommissions.length > 0} onCheckedChange={(v) => handleSelectAll(!!v)} />
                        <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>Select All</span>
                        <span style={{ fontSize: 11, color: isDark ? "#64748b" : "#94a3b8" }}>{selectedIds.length} / {pendingCommissions.length}</span>
                    </div>
                    <div style={{ maxHeight: 280, overflowY: "auto" }}>
                        {pendingCommissions.length === 0 ? (
                            <div style={{ padding: "24px 14px", textAlign: "center", fontSize: 13, color: isDark ? "#64748b" : "#94a3b8" }}>No pending commissions</div>
                        ) : pendingCommissions.map((c) => (
                            <div key={c.id} onClick={() => handleToggle(c.id)}
                                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`, cursor: "pointer", transition: "background 0.15s" }}
                                onMouseOver={(e) => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)")}
                                onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <Checkbox checked={selectedIds.includes(c.id)} onCheckedChange={() => handleToggle(c.id)} />
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.user_affiliate.first_name} {c.user_affiliate.last_name}</div>
                                        <div style={{ fontSize: 11, color: isDark ? "#64748b" : "#94a3b8" }}>#{c.order_id} • {c.source}</div>
                                    </div>
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 700 }}>{formatCurrency(c.commission)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 12, marginBottom: 20, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Total Commission</span>
                    <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>{formatCurrency(totalSelected)}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button onClick={onClose} disabled={isSubmitting} style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: "transparent", color: isDark ? "#e2e8f0" : "#1a1a2e", cursor: "pointer" }}>Cancel</button>
                    <button onClick={handleSubmit} disabled={isSubmitting || selectedIds.length === 0} style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", background: selectedIds.length === 0 ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)") : "linear-gradient(135deg, #22c55e, #4ade80)", color: selectedIds.length === 0 ? (isDark ? "#475569" : "#94a3b8") : "#fff", cursor: selectedIds.length === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                        <CheckCircle2 size={14} />
                        Mark as Paid
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   COMMISSION DETAIL PANEL (Quick View — matching payout screen)
   ════════════════════════════════════════════════════════════════════ */

function CommissionDetailPanel({
    commission: comm,
    onClose,
    theme,
    isDark,
}: {
    commission: CommissionRecord;
    onClose: () => void;
    theme: any;
    isDark: boolean;
}) {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const user = comm.user_affiliate;

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success("Copied!");
        setTimeout(() => setCopiedField(null), 1500);
    };

    const commissionRate = comm.total_sales > 0 ? ((comm.commission / comm.total_sales) * 100).toFixed(1) : "0";

    return (
        <div style={{
            background: theme.cardBg, border: theme.cardBorder, borderRadius: 16,
            padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14,
            fontFamily: "'Outfit', sans-serif", position: "relative", overflow: "hidden",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 180, height: 180, background: `radial-gradient(circle, ${theme.glowColor} 0%, transparent 70%)`, pointerEvents: "none" }} />

            <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, width: 28, height: 28, borderRadius: 8, border: "none", background: theme.expandBtnBg, color: theme.subtitle, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                <X size={14} />
            </button>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0, boxShadow: `0 2px 12px ${theme.glowColor}` }}>
                    {user.first_name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.title, margin: 0, lineHeight: 1.2 }}>
                        {user.first_name} {user.last_name}
                    </h3>
                    <p style={{ fontSize: 12, color: theme.subtitle, margin: "2px 0 0" }}>{user.email}</p>
                </div>
                <CommissionStatusBadge isPaid={comm.is_paid} />
            </div>

            {/* Commission highlight */}
            <div style={{ background: theme.expandBtnBg, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: theme.subtitle, textTransform: "uppercase", letterSpacing: "0.4px" }}>Commission Earned</span>
                <span style={{ fontSize: 24, fontWeight: 700, color: theme.title, fontFamily: "'Outfit', sans-serif" }}>
                    {formatCurrency(comm.commission)}
                </span>
            </div>

            {/* Rate indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                    <div style={{
                        width: `${Math.min(parseFloat(commissionRate), 100)}%`, height: "100%", borderRadius: 3,
                        background: "linear-gradient(90deg, var(--preset-primary), var(--preset-lighter))",
                        transition: "width 0.5s ease",
                    }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: theme.title, minWidth: 40, textAlign: "right" }}>{commissionRate}%</span>
            </div>

            {/* Details grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                    { label: "Order ID", value: `#${comm.order_id}` },
                    { label: "Total Sales", value: formatCurrency(comm.total_sales) },
                    { label: "Quantity", value: String(comm.quantity) },
                    { label: "Source", value: comm.source },
                    { label: "Created", value: new Date(comm.created_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }) },
                    { label: "Updated", value: new Date(comm.updated_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }) },
                ].map((s) => (
                    <div key={s.label}>
                        <div style={{ fontSize: 10, color: theme.subtitle, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: theme.title, wordBreak: "break-all" }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {comm.notes && (
                <>
                    <div style={{ width: "100%", height: 1, background: theme.divider }} />
                    <div>
                        <div style={{ fontSize: 10, color: theme.subtitle, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Notes</div>
                        <p style={{ fontSize: 12, color: theme.title, lineHeight: 1.5, margin: 0 }}>{comm.notes}</p>
                    </div>
                </>
            )}

            {/* Copy actions */}
            <div style={{ width: "100%", height: 1, background: theme.divider }} />
            <div>
                <div style={{ fontSize: 10, color: theme.subtitle, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Quick Copy</div>
                {[
                    { l: "Order ID", v: comm.order_id, f: "order" },
                    { l: "Email", v: user.email, f: "email" },
                    { l: "Commission", v: formatCurrency(comm.commission), f: "comm" },
                ].map(({ l, v, f }) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: theme.subtitle }}>{l}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ color: theme.title, fontWeight: 600 }}>{v}</span>
                            <button type="button" onClick={() => handleCopy(v, f)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                                {copiedField === f ? <Check size={11} style={{ color: "#22c55e" }} /> : <Copy size={11} style={{ color: theme.subtitle }} />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   LOAD MORE MASCOT (matching payout screen)
   ════════════════════════════════════════════════════════════════════ */

function CommissionLoadMoreMascot({ text, subColor }: { text: string; subColor: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "28px 16px" }}>
            <svg width={72} height={72} viewBox="0 0 100 100" style={{ filter: "drop-shadow(0 0 20px rgba(167,139,250,0.4))" }}>
                <defs>
                    <radialGradient id="commLoadGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                        <stop offset="40%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#0f172a" />
                    </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="40" stroke="#a78bfa" strokeWidth="1" fill="none" opacity="0.4">
                    <animate attributeName="r" values="35;45;35" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="50" cy="50" r="28" fill="url(#commLoadGrad)">
                    <animate attributeName="r" values="26;30;26" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="50" cy="50" r="34" stroke="rgba(255,255,255,0.3)" strokeDasharray="4 6" strokeWidth="1" fill="none">
                    <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="6s" repeatCount="indefinite" />
                </circle>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 500, color: subColor, letterSpacing: "0.04em" }}>{text}</span>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN COMMISSIONS SCREEN
   ════════════════════════════════════════════════════════════════════ */

const CommissionsScreen = () => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [sourceFilter, setSourceFilter] = useState<string>("all");
    const [revealedAmounts, setRevealedAmounts] = useState(true);
    const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editCommission, setEditCommission] = useState<CommissionRecord | null>(null);
    const [deleteCommission, setDeleteCommission] = useState<CommissionRecord | null>(null);
    const [detailCommission, setDetailCommission] = useState<CommissionRecord | null>(null);
    const [showBulkPaid, setShowBulkPaid] = useState(false);

    // Infinite scroll
    const perPage = 20;
    const [visibleCount, setVisibleCount] = useState(perPage);
    const [loadingMore, setLoadingMore] = useState(false);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const loadLockRef = useRef(false);
    const sortedLenRef = useRef(0);
    const visibleRef = useRef(perPage);

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setCommissions(DUMMY_COMMISSIONS);
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const filteredData = useMemo(() => {
        let data = commissions;
        if (statusFilter === "PAID") data = data.filter((c) => c.is_paid);
        if (statusFilter === "PENDING") data = data.filter((c) => !c.is_paid);
        if (sourceFilter !== "all") data = data.filter((c) => c.source === sourceFilter);
        return data;
    }, [commissions, statusFilter, sourceFilter]);

    const meta = useMemo(() => {
        const total_commissions = commissions.reduce((s, c) => s + c.commission, 0);
        const total_sales = commissions.reduce((s, c) => s + c.total_sales, 0);
        const approved = commissions.filter((c) => c.is_paid).reduce((s, c) => s + c.commission, 0);
        const pending = commissions.filter((c) => !c.is_paid).reduce((s, c) => s + c.commission, 0);
        const total_orders = commissions.length;
        const paid_count = commissions.filter((c) => c.is_paid).length;
        const pending_count = commissions.filter((c) => !c.is_paid).length;
        const total_quantity = commissions.reduce((s, c) => s + c.quantity, 0);
        const avg_commission = total_orders > 0 ? total_commissions / total_orders : 0;
        const avg_rate = total_sales > 0 ? (total_commissions / total_sales) * 100 : 0;
        // Source breakdown
        const sources: Record<string, number> = {};
        commissions.forEach((c) => { sources[c.source] = (sources[c.source] || 0) + c.commission; });
        const topSource = Object.entries(sources).sort((a, b) => b[1] - a[1])[0];
        return { total_commissions, total_sales, approved, pending, total_orders, paid_count, pending_count, total_quantity, avg_commission, avg_rate, topSource };
    }, [commissions]);

    /* ── Theme tokens (matching payout screen) ── */
    const t = useMemo(() => {
        if (isDark) {
            return {
                cardBg: "linear-gradient(135deg, rgba(26, 34, 44, 0.9), rgba(35, 45, 56, 0.85))",
                cardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.12)",
                glowColor: "rgba(var(--preset-primary-rgb), 0.08)",
                title: "hsl(var(--foreground))",
                subtitle: "hsl(var(--muted-foreground))",
                subtitleAccent: "var(--preset-lighter)",
                headerText: "hsl(var(--muted-foreground))",
                cellText: "hsl(var(--muted-foreground))",
                cellBold: "hsl(var(--foreground))",
                rowHover: "rgba(var(--preset-primary-rgb), 0.06)",
                divider: "rgba(var(--preset-primary-rgb), 0.08)",
                inputBg: "rgba(var(--preset-primary-rgb), 0.06)",
                expandBtnBg: "rgba(var(--preset-primary-rgb), 0.06)",
                pillBg: "rgba(var(--preset-primary-rgb), 0.12)",
                pillActive: "rgba(var(--preset-primary-rgb), 0.6)",
                pillText: "var(--preset-lighter)",
                pillActiveText: "#fff",
            };
        }
        return {
            cardBg: "linear-gradient(135deg, rgba(250, 247, 255, 0.95), rgba(243, 237, 255, 0.85))",
            cardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.1)",
            glowColor: "rgba(var(--preset-primary-rgb), 0.05)",
            title: "hsl(var(--foreground))",
            subtitle: "hsl(var(--muted-foreground))",
            subtitleAccent: "var(--preset-primary)",
            headerText: "hsl(var(--muted-foreground))",
            cellText: "hsl(var(--muted-foreground))",
            cellBold: "hsl(var(--foreground))",
            rowHover: "rgba(var(--preset-primary-rgb), 0.04)",
            divider: "rgba(var(--preset-primary-rgb), 0.08)",
            inputBg: "rgba(var(--preset-primary-rgb), 0.04)",
            expandBtnBg: "rgba(var(--preset-primary-rgb), 0.04)",
            pillBg: "rgba(var(--preset-primary-rgb), 0.08)",
            pillActive: "rgba(var(--preset-primary-rgb), 0.85)",
            pillText: "var(--preset-primary)",
            pillActiveText: "#fff",
        };
    }, [isDark]);

    /* ── Table columns ── */
    const columns: ColumnDef<CommissionRecord>[] = useMemo(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: "user_affiliate",
                header: ({ column }) => (
                    <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.5px", padding: 0 }}>
                        Affiliate <ArrowUpDown size={12} />
                    </button>
                ),
                cell: ({ row }) => {
                    const user = row.original.user_affiliate;
                    return (
                        <div style={{ cursor: "pointer" }} onClick={() => setDetailCommission(row.original)}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                                    {user.first_name[0].toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: t.cellBold }}>{user.first_name} {user.last_name}</div>
                                    <div style={{ fontSize: 11, color: t.cellText }}>{user.email}</div>
                                </div>
                            </div>
                        </div>
                    );
                },
                sortingFn: (a, b) => {
                    const nameA = `${a.original.user_affiliate.first_name} ${a.original.user_affiliate.last_name}`;
                    const nameB = `${b.original.user_affiliate.first_name} ${b.original.user_affiliate.last_name}`;
                    return nameA.localeCompare(nameB);
                },
                filterFn: (row, columnId, filterValue) => {
                    const user = row.original.user_affiliate;
                    const full = `${user.first_name} ${user.last_name} ${user.email}`.toLowerCase();
                    return full.includes((filterValue as string).toLowerCase());
                },
            },
            {
                accessorKey: "order_id",
                header: ({ column }) => (
                    <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.5px", padding: 0 }}>
                        Order <ArrowUpDown size={12} />
                    </button>
                ),
                cell: ({ row }) => (
                    <span style={{ fontSize: 12, color: t.cellBold, fontWeight: 600, fontFamily: "monospace" }}>#{row.original.order_id}</span>
                ),
            },
            {
                accessorKey: "total_sales",
                header: ({ column }) => (
                    <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.5px", padding: 0 }}>
                        Sales <ArrowUpDown size={12} />
                    </button>
                ),
                cell: ({ row }) => (
                    <span style={{ fontSize: 13, color: t.cellText }}>
                        {revealedAmounts ? formatCurrency(row.original.total_sales) : "••••••"}
                    </span>
                ),
            },
            {
                accessorKey: "commission",
                header: ({ column }) => (
                    <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.5px", padding: 0 }}>
                        Commission <ArrowUpDown size={12} />
                    </button>
                ),
                cell: ({ row }) => (
                    <span style={{ fontSize: 13, fontWeight: 700, color: t.cellBold }}>
                        {revealedAmounts ? formatCurrency(row.original.commission) : "••••••"}
                    </span>
                ),
            },
            {
                accessorKey: "quantity",
                header: "Qty",
                cell: ({ row }) => (
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.cellBold }}>{row.original.quantity}</span>
                ),
            },
            {
                accessorKey: "source",
                header: "Source",
                cell: ({ row }) => <SourceBadge source={row.original.source} isDark={isDark} />,
            },
            {
                accessorKey: "is_paid",
                header: "Status",
                cell: ({ row }) => <CommissionStatusBadge isPaid={row.original.is_paid} />,
            },
            {
                accessorKey: "created_at",
                header: ({ column }) => (
                    <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.5px", padding: 0 }}>
                        Date <ArrowUpDown size={12} />
                    </button>
                ),
                cell: ({ row }) => (
                    <span style={{ fontSize: 12, color: t.cellText }}>
                        {new Date(row.original.created_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                ),
            },
            {
                id: "actions",
                enableHiding: false,
                cell: ({ row }) => {
                    const c = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: t.expandBtnBg, color: t.subtitle, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <MoreHorizontal size={14} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setDetailCommission(c)}>
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEditCommission(c)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                {!c.is_paid && (
                                    <DropdownMenuItem onClick={() => {
                                        setCommissions((prev) => prev.map((x) => x.id === c.id ? { ...x, is_paid: true, updated_at: new Date().toISOString() } : x));
                                        toast.success("Marked as paid");
                                    }}>
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Paid
                                    </DropdownMenuItem>
                                )}
                                {c.is_paid && (
                                    <DropdownMenuItem onClick={() => {
                                        setCommissions((prev) => prev.map((x) => x.id === c.id ? { ...x, is_paid: false, updated_at: new Date().toISOString() } : x));
                                        toast.success("Reverted to pending");
                                    }}>
                                        <Clock className="mr-2 h-4 w-4" /> Revert to Pending
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setDeleteCommission(c)} className="text-red-500 focus:text-red-500">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        [t, revealedAmounts, isDark]
    );

    const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const table = useReactTable({
        data: filteredData,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: { sorting, columnFilters, columnVisibility, rowSelection },
    });

    const sortedRows = table.getSortedRowModel().rows;
    sortedLenRef.current = sortedRows.length;
    visibleRef.current = visibleCount;
    const visibleRows = sortedRows.slice(0, visibleCount);
    const hasMore = visibleCount < sortedRows.length;

    const handleLoadMore = useCallback(() => {
        if (loadLockRef.current) return;
        if (visibleRef.current >= sortedLenRef.current) return;
        loadLockRef.current = true;
        setLoadingMore(true);
        window.setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + perPage, sortedLenRef.current));
            setLoadingMore(false);
            loadLockRef.current = false;
        }, 650);
    }, [perPage]);

    useEffect(() => {
        setVisibleCount(perPage);
        visibleRef.current = perPage;
    }, [filteredData, statusFilter, sourceFilter, columnFilters, perPage]);

    useEffect(() => {
        if (isLoading) return;
        const el = sentinelRef.current;
        if (!el || loadingMore || !hasMore) return;
        const observer = new IntersectionObserver(
            (entries) => { if (entries[0]?.isIntersecting && !loadLockRef.current) handleLoadMore(); },
            { root: null, rootMargin: "200px", threshold: 0 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, loadingMore, handleLoadMore, isLoading, sortedRows.length, visibleCount]);

    const statusOptions = [
        { value: "all", label: "All" },
        { value: "PAID", label: "Paid" },
        { value: "PENDING", label: "Pending" },
    ];

    const sourceOptions = [
        { value: "all", label: "All Sources" },
        { value: "Website", label: "Website" },
        { value: "Instagram", label: "Instagram" },
        { value: "TikTok", label: "TikTok" },
        { value: "Facebook", label: "Facebook" },
    ];

    /* ── Handler helpers ── */
    const handleCreateCommission = (data: {
        affiliate: CommissionAffiliate;
        order_id: string;
        total_sales: number;
        commission: number;
        quantity: number;
        source: string;
        notes: string;
    }) => {
        const newComm: CommissionRecord = {
            id: `com-${Date.now()}`,
            user_affiliate: data.affiliate,
            order_id: data.order_id,
            total_sales: data.total_sales,
            commission: data.commission,
            quantity: data.quantity,
            source: data.source,
            is_paid: false,
            notes: data.notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        setCommissions((prev) => [newComm, ...prev]);
        toast.success("Commission added!");
        setShowCreateDialog(false);
    };

    const handleEditSave = (id: string, data: { total_sales: number; commission: number; quantity: number; source: string; notes: string; is_paid: boolean }) => {
        setCommissions((prev) =>
            prev.map((c) =>
                c.id === id
                    ? { ...c, ...data, updated_at: new Date().toISOString() }
                    : c
            )
        );
        toast.success("Commission updated!");
        setEditCommission(null);
    };

    const handleBulkPaid = (ids: string[]) => {
        setCommissions((prev) =>
            prev.map((c) =>
                ids.includes(c.id) ? { ...c, is_paid: true, updated_at: new Date().toISOString() } : c
            )
        );
        toast.success(`${ids.length} commissions marked as paid!`);
        setShowBulkPaid(false);
    };

    const handleExport = () => {
        toast.success("Exporting commissions data...");
    };

    /* ════════════════════════════════════════════════════════════════
       RENDER
       ════════════════════════════════════════════════════════════════ */

    return (
        <div className="commissions-dashboard flex flex-col gap-4 w-full" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <style>{`
                @keyframes shimmer-badge { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                @keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
            `}</style>

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3">
                <div>
                    <h2 style={{ fontSize: 26, fontWeight: 700, color: t.title, margin: 0, letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                        Commissions
                    </h2>
                    <p style={{ fontSize: 13, color: t.subtitle, margin: "4px 0 0" }}>
                        View and manage your affiliate commissions
                    </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <button
                        onClick={() => setRevealedAmounts((r) => !r)}
                        style={{
                            display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600,
                            padding: "7px 14px", borderRadius: 10, border: t.cardBorder, cursor: "pointer",
                            color: t.subtitle, background: t.expandBtnBg, transition: "all 0.15s ease",
                        }}
                    >
                        {revealedAmounts ? <Eye size={14} /> : <EyeOff size={14} />}
                        {revealedAmounts ? "Hide" : "Show"}
                    </button>
                    <button
                        onClick={handleExport}
                        style={{
                            display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600,
                            padding: "7px 14px", borderRadius: 10, border: t.cardBorder, cursor: "pointer",
                            color: t.subtitle, background: t.expandBtnBg, transition: "all 0.15s ease",
                        }}
                    >
                        <Download size={14} /> Export
                    </button>
                    <button
                        onClick={() => setShowBulkPaid(true)}
                        style={{
                            display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600,
                            padding: "7px 14px", borderRadius: 10, border: t.cardBorder, cursor: "pointer",
                            color: t.subtitle, background: t.expandBtnBg, transition: "all 0.15s ease",
                        }}
                    >
                        <CheckCircle2 size={14} /> Bulk Pay
                    </button>
                    <button
                        onClick={() => setShowCreateDialog(true)}
                        style={{
                            display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600,
                            padding: "7px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                            color: "#fff",
                            background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                            boxShadow: "0 2px 8px rgba(var(--preset-primary-rgb), 0.3)",
                            transition: "all 0.15s ease",
                        }}
                    >
                        <Plus size={14} /> Add Commission
                    </button>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div
                style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, width: "100%" }}
                className="overview-platform-grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4"
            >
                <OverviewDataCard
                    variant="stat"
                    hideSecondaryStats
                    customTitle="Total Commissions"
                    customIcon={<DollarSign size={22} strokeWidth={2} />}
                    metricSubtitle="All time"
                    primaryValueDisplay={revealedAmounts ? formatCurrency(meta.total_commissions) : "RM ••••••"}
                    isLoading={isLoading}
                />

                <OverviewDataCard
                    variant="stat"
                    hideSecondaryStats
                    customTitle="Approved (Paid)"
                    customIcon={<CheckCircle2 size={22} strokeWidth={2} />}
                    metricSubtitle="Ready for payout"
                    primaryValueDisplay={revealedAmounts ? formatCurrency(meta.approved) : "RM ••••••"}
                    isLoading={isLoading}
                />

                <OverviewDataCard
                    variant="stat"
                    hideSecondaryStats
                    customTitle="Pending"
                    customIcon={<Clock size={22} strokeWidth={2} />}
                    metricSubtitle="Awaiting approval"
                    primaryValueDisplay={revealedAmounts ? formatCurrency(meta.pending) : "RM ••••••"}
                    isLoading={isLoading}
                />

                <OverviewDataCard
                    variant="stat"
                    hideSecondaryStats
                    customTitle="Total Sales"
                    customIcon={<TrendingUp size={22} strokeWidth={2} />}
                    metricSubtitle="Affiliate sales"
                    primaryValueDisplay={revealedAmounts ? formatCurrency(meta.total_sales) : "RM ••••••"}
                    isLoading={isLoading}
                />
            </div>

            {/* ── Table Card ── */}
            <div
                style={{
                    background: t.cardBg, borderRadius: 20, border: t.cardBorder,
                    padding: "22px 26px", display: "flex", flexDirection: "column", gap: 16,
                    position: "relative", overflow: "hidden",
                    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                }}
            >
                <div style={{ position: "absolute", top: -60, right: -60, width: 180, height: 180, background: `radial-gradient(circle, ${t.glowColor} 0%, transparent 70%)`, pointerEvents: "none" }} />

                {isLoading && (
                    <div style={{
                        position: "absolute", inset: 0,
                        background: isDark ? "rgba(26, 34, 44, 0.78)" : "rgba(250, 247, 255, 0.72)",
                        backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
                        zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 20,
                    }}>
                        <MediumLoader label="Loading commissions" className="!py-4" />
                    </div>
                )}

                {/* Table header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: t.title, margin: 0, letterSpacing: "-0.3px", lineHeight: 1.2 }}>
                            Commission History
                        </h2>
                        <p style={{ fontSize: 12, color: t.subtitle, margin: "4px 0 0" }}>
                            {filteredData.length} records
                        </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        {/* Status pills */}
                        <div style={{ background: t.pillBg, borderRadius: 10, padding: 3, display: "flex", gap: 2 }}>
                            {statusOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setStatusFilter(opt.value)}
                                    style={{
                                        fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 8,
                                        border: "none", cursor: "pointer", transition: "all 0.15s ease",
                                        color: statusFilter === opt.value ? t.pillActiveText : t.pillText,
                                        background: statusFilter === opt.value ? t.pillActive : "transparent",
                                        boxShadow: statusFilter === opt.value ? "0 1px 4px rgba(var(--preset-primary-rgb), 0.25)" : "none",
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Source filter */}
                        <div style={{ background: t.pillBg, borderRadius: 10, padding: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
                            {sourceOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setSourceFilter(opt.value)}
                                    style={{
                                        fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 8,
                                        border: "none", cursor: "pointer", transition: "all 0.15s ease",
                                        color: sourceFilter === opt.value ? t.pillActiveText : t.pillText,
                                        background: sourceFilter === opt.value ? t.pillActive : "transparent",
                                        boxShadow: sourceFilter === opt.value ? "0 1px 4px rgba(var(--preset-primary-rgb), 0.25)" : "none",
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Column visibility */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button type="button" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, border: t.cardBorder, cursor: "pointer", color: t.subtitle, background: t.expandBtnBg }}>
                                    <SlidersHorizontal size={14} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table.getAllColumns().filter((col) => col.getCanHide()).map((col) => (
                                    <DropdownMenuCheckboxItem key={col.id} className="capitalize" checked={col.getIsVisible()} onCheckedChange={(v) => col.toggleVisibility(!!v)}>
                                        {col.id.replace(/_/g, " ")}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Search */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: t.inputBg, border: t.cardBorder, borderRadius: 12, padding: "0 14px" }}>
                    <Search size={15} style={{ color: t.subtitle, flexShrink: 0 }} />
                    <input
                        type="text"
                        placeholder="Search by affiliate name or email..."
                        value={(table.getColumn("user_affiliate")?.getFilterValue() as string) ?? ""}
                        onChange={(e) => table.getColumn("user_affiliate")?.setFilterValue(e.target.value)}
                        style={{ flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 500, background: "transparent", border: "none", outline: "none", color: t.title, fontFamily: "'Outfit', sans-serif" }}
                    />
                </div>

                {/* Table + Detail Panel */}
                <div style={{ display: "flex", gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            borderRadius: 14,
                            border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)",
                            background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)",
                            overflow: "hidden",
                        }}>
                            <div style={{
                                padding: "13px 17px",
                                borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)",
                                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
                            }}>
                                <div style={{ fontSize: 13, fontWeight: 800, color: t.title }}>
                                    All Commissions ({filteredData.length})
                                </div>
                                <div style={{ fontSize: 10, color: t.subtitle }}>
                                    Click any row for details
                                </div>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                    <thead>
                                        {table.getHeaderGroups().map((hg) => (
                                            <tr key={hg.id} style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)" }}>
                                                <th style={{ padding: "9px 11px", textAlign: "left", fontSize: 10, fontWeight: 800, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 36 }}>
                                                    #
                                                </th>
                                                {hg.headers.map((header) => (
                                                    <th key={header.id} style={{ textAlign: "left", padding: "9px 11px", fontSize: 10, fontWeight: 800, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                    </th>
                                                ))}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody>
                                        {visibleRows.length ? (
                                            visibleRows.map((row, rowIdx) => (
                                                <tr
                                                    key={row.id}
                                                    style={{
                                                        borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
                                                        cursor: "pointer", transition: "background 0.15s ease",
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? "rgba(var(--preset-primary-rgb), 0.04)" : "rgba(var(--preset-primary-rgb), 0.06)"; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                                >
                                                    <td style={{ padding: "10px 11px", fontSize: 11, fontWeight: 700, color: t.subtitle }}>
                                                        {rowIdx + 1}
                                                    </td>
                                                    {row.getVisibleCells().map((cell) => (
                                                        <td key={cell.id} style={{ padding: "10px 11px", fontSize: 12, whiteSpace: "nowrap" }}>
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={columns.length + 1} style={{ padding: "40px 0", textAlign: "center", color: t.subtitle, fontSize: 14 }}>
                                                    No commissions found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {(hasMore || loadingMore) && sortedRows.length > perPage && (
                                <div ref={sentinelRef} aria-hidden style={{ minHeight: loadingMore ? 8 : 24, borderTop: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {loadingMore ? <CommissionLoadMoreMascot text="Fetching commissions" subColor={isDark ? "rgba(255,255,255,0.6)" : "rgba(71,85,105,0.85)"} /> : null}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detail Panel — desktop */}
                    {detailCommission && (
                        <div className="hidden lg:block" style={{ width: 320, flexShrink: 0, animation: "slideIn 0.2s ease-out" }}>
                            <CommissionDetailPanel commission={detailCommission} onClose={() => setDetailCommission(null)} theme={t} isDark={isDark} />
                        </div>
                    )}
                </div>

                {Object.keys(rowSelection).length > 0 && (
                    <div style={{ fontSize: 12, color: t.subtitle, paddingTop: 4 }}>
                        {Object.keys(rowSelection).length} selected
                    </div>
                )}
            </div>

            {/* Detail Panel — mobile */}
            {detailCommission && (
                <div className="lg:hidden">
                    <div style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center" }}
                        onClick={() => setDetailCommission(null)}>
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} />
                        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420, margin: "0 16px", maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
                            <CommissionDetailPanel commission={detailCommission} onClose={() => setDetailCommission(null)} theme={t} isDark={isDark} />
                        </div>
                    </div>
                </div>
            )}

            {/* Dialogs */}
            {showCreateDialog && (
                <CreateCommissionDialog
                    onClose={() => setShowCreateDialog(false)}
                    onSubmit={handleCreateCommission}
                    isDark={isDark}
                    affiliates={DUMMY_AFFILIATES}
                />
            )}
            {editCommission && (
                <EditCommissionDialog
                    commission={editCommission}
                    onClose={() => setEditCommission(null)}
                    onSave={handleEditSave}
                    isDark={isDark}
                />
            )}
            {deleteCommission && (
                <DeleteCommissionDialog
                    commission={deleteCommission}
                    onClose={() => setDeleteCommission(null)}
                    onConfirm={() => {
                        setCommissions((prev) => prev.filter((c) => c.id !== deleteCommission.id));
                        toast.success("Commission deleted");
                    }}
                    isDark={isDark}
                />
            )}
            {showBulkPaid && (
                <BulkMarkPaidDialog
                    commissions={commissions}
                    onClose={() => setShowBulkPaid(false)}
                    onConfirm={handleBulkPaid}
                    isDark={isDark}
                />
            )}
        </div>
    );
};

export default CommissionsScreen;