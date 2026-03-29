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

interface BankDetail {
    bank_name: string;
    account_number: string;
    account_holder: string;
}

interface PayoutAffiliate {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    bank_detail: BankDetail;
}

interface PayoutStaff {
    email: string;
    name: string;
}

interface PayoutCommissionItem {
    id: string;
    order_id: string;
    total_sales: number;
    commission: number;
    created_at: string;
}

interface PayoutRecord {
    id: string;
    user_affiliate: PayoutAffiliate;
    user: PayoutStaff;
    payout_amount: number;
    status: "PAID" | "PENDING" | "FAILED" | "PROCESSING";
    commission_items: PayoutCommissionItem[];
    payment_method: string;
    reference_no: string;
    notes: string;
    created_at: string;
    updated_at: string;
    paid_at: string | null;
}

const DUMMY_AFFILIATES_LIST: PayoutAffiliate[] = [
    { id: "aff-001", first_name: "Sarah", last_name: "Ahmad", email: "sarah.ahmad@gmail.com", bank_detail: { bank_name: "Maybank", account_number: "1234567890", account_holder: "Sarah Ahmad" } },
    { id: "aff-002", first_name: "Muhammad", last_name: "Rizki", email: "m.rizki@outlook.com", bank_detail: { bank_name: "CIMB Bank", account_number: "9876543210", account_holder: "Muhammad Rizki" } },
    { id: "aff-003", first_name: "Aisha", last_name: "Tan", email: "aisha.tan@yahoo.com", bank_detail: { bank_name: "Public Bank", account_number: "5678901234", account_holder: "Aisha Tan" } },
    { id: "aff-005", first_name: "Nurul", last_name: "Huda", email: "nurul.huda@hotmail.com", bank_detail: { bank_name: "Bank Islam", account_number: "6677889900", account_holder: "Nurul Huda" } },
    { id: "aff-006", first_name: "Raj", last_name: "Kumar", email: "raj.kumar@gmail.com", bank_detail: { bank_name: "RHB Bank", account_number: "4455667788", account_holder: "Raj Kumar" } },
    { id: "aff-007", first_name: "Fatimah", last_name: "Zahra", email: "fatimah.z@gmail.com", bank_detail: { bank_name: "AmBank", account_number: "3344556677", account_holder: "Fatimah Zahra" } },
    { id: "aff-009", first_name: "Hana", last_name: "Sofia", email: "hana.s@icloud.com", bank_detail: { bank_name: "Maybank", account_number: "2233445566", account_holder: "Hana Sofia" } },
    { id: "aff-011", first_name: "Priya", last_name: "Menon", email: "priya.menon@yahoo.com", bank_detail: { bank_name: "CIMB Bank", account_number: "4455667788", account_holder: "Priya Menon" } },
    { id: "aff-014", first_name: "Ethan", last_name: "Cheah", email: "ethan.cheah@gmail.com", bank_detail: { bank_name: "RHB Bank", account_number: "7788990011", account_holder: "Ethan Cheah" } },
    { id: "aff-016", first_name: "Vikram", last_name: "Singh", email: "vikram.singh@gmail.com", bank_detail: { bank_name: "AmBank", account_number: "9900112233", account_holder: "Vikram Singh" } },
    { id: "aff-021", first_name: "Nadia", last_name: "Rahman", email: "nadia.r@gmail.com", bank_detail: { bank_name: "Bank Islam", account_number: "4455667799", account_holder: "Nadia Rahman" } },
    { id: "aff-023", first_name: "Mei Ling", last_name: "Chow", email: "ml.chow@gmail.com", bank_detail: { bank_name: "Maybank", account_number: "6677889911", account_holder: "Mei Ling Chow" } },
    { id: "aff-025", first_name: "Sophie", last_name: "Lim", email: "sophie.lim@icloud.com", bank_detail: { bank_name: "Public Bank", account_number: "8899001133", account_holder: "Sophie Lim" } },
    { id: "aff-028", first_name: "Zach", last_name: "Yap", email: "zach.yap@outlook.com", bank_detail: { bank_name: "Hong Leong Bank", account_number: "1122334466", account_holder: "Zach Yap" } },
];

const DUMMY_PAYOUTS: PayoutRecord[] = [
    {
        id: "pay-001", payout_amount: 320, status: "PAID",
        user_affiliate: DUMMY_AFFILIATES_LIST[0],
        user: { email: "admin@shop.com", name: "Admin User" },
        commission_items: [
            { id: "ci-001", order_id: "ORD-4821", total_sales: 450, commission: 45, created_at: "2025-03-10T00:00:00Z" },
            { id: "ci-002", order_id: "ORD-4835", total_sales: 890, commission: 89, created_at: "2025-03-12T00:00:00Z" },
            { id: "ci-003", order_id: "ORD-4901", total_sales: 1860, commission: 186, created_at: "2025-03-18T00:00:00Z" },
        ],
        payment_method: "Bank Transfer", reference_no: "REF-2025031801", notes: "March batch payout",
        created_at: "2025-03-18T10:30:00Z", updated_at: "2025-03-18T14:22:00Z", paid_at: "2025-03-18T14:22:00Z",
    },
    {
        id: "pay-002", payout_amount: 580, status: "PAID",
        user_affiliate: DUMMY_AFFILIATES_LIST[1],
        user: { email: "admin@shop.com", name: "Admin User" },
        commission_items: [
            { id: "ci-004", order_id: "ORD-4910", total_sales: 2300, commission: 230, created_at: "2025-03-15T00:00:00Z" },
            { id: "ci-005", order_id: "ORD-4922", total_sales: 3500, commission: 350, created_at: "2025-03-20T00:00:00Z" },
        ],
        payment_method: "Bank Transfer", reference_no: "REF-2025032001", notes: "",
        created_at: "2025-03-20T09:00:00Z", updated_at: "2025-03-20T11:45:00Z", paid_at: "2025-03-20T11:45:00Z",
    },
    {
        id: "pay-003", payout_amount: 470, status: "PENDING",
        user_affiliate: DUMMY_AFFILIATES_LIST[3],
        user: { email: "finance@shop.com", name: "Finance Team" },
        commission_items: [
            { id: "ci-008", order_id: "ORD-4950", total_sales: 1200, commission: 120, created_at: "2025-03-14T00:00:00Z" },
            { id: "ci-009", order_id: "ORD-4965", total_sales: 2100, commission: 210, created_at: "2025-03-21T00:00:00Z" },
            { id: "ci-010", order_id: "ORD-4980", total_sales: 1400, commission: 140, created_at: "2025-03-25T00:00:00Z" },
        ],
        payment_method: "Bank Transfer", reference_no: "REF-2025032501", notes: "Awaiting approval",
        created_at: "2025-03-25T08:00:00Z", updated_at: "2025-03-25T08:00:00Z", paid_at: null,
    },
    {
        id: "pay-004", payout_amount: 245, status: "PAID",
        user_affiliate: DUMMY_AFFILIATES_LIST[4],
        user: { email: "admin@shop.com", name: "Admin User" },
        commission_items: [
            { id: "ci-011", order_id: "ORD-4990", total_sales: 980, commission: 98, created_at: "2025-03-16T00:00:00Z" },
            { id: "ci-012", order_id: "ORD-5001", total_sales: 1470, commission: 147, created_at: "2025-03-23T00:00:00Z" },
        ],
        payment_method: "Bank Transfer", reference_no: "REF-2025032302", notes: "",
        created_at: "2025-03-23T15:30:00Z", updated_at: "2025-03-23T16:10:00Z", paid_at: "2025-03-23T16:10:00Z",
    },
    {
        id: "pay-005", payout_amount: 390, status: "PROCESSING",
        user_affiliate: DUMMY_AFFILIATES_LIST[5],
        user: { email: "finance@shop.com", name: "Finance Team" },
        commission_items: [
            { id: "ci-013", order_id: "ORD-5010", total_sales: 1950, commission: 195, created_at: "2025-03-17T00:00:00Z" },
            { id: "ci-014", order_id: "ORD-5025", total_sales: 1950, commission: 195, created_at: "2025-03-24T00:00:00Z" },
        ],
        payment_method: "Bank Transfer", reference_no: "REF-2025032601", notes: "Processing via batch",
        created_at: "2025-03-26T09:00:00Z", updated_at: "2025-03-26T09:00:00Z", paid_at: null,
    },
    {
        id: "pay-006", payout_amount: 155, status: "PAID",
        user_affiliate: DUMMY_AFFILIATES_LIST[2],
        user: { email: "admin@shop.com", name: "Admin User" },
        commission_items: [
            { id: "ci-006", order_id: "ORD-4930", total_sales: 780, commission: 78, created_at: "2025-03-19T00:00:00Z" },
            { id: "ci-007", order_id: "ORD-4941", total_sales: 770, commission: 77, created_at: "2025-03-22T00:00:00Z" },
        ],
        payment_method: "Bank Transfer", reference_no: "REF-2025032201", notes: "",
        created_at: "2025-03-22T11:00:00Z", updated_at: "2025-03-22T13:30:00Z", paid_at: "2025-03-22T13:30:00Z",
    },
    {
        id: "pay-007", payout_amount: 890, status: "PENDING",
        user_affiliate: DUMMY_AFFILIATES_LIST[7],
        user: { email: "finance@shop.com", name: "Finance Team" },
        commission_items: [
            { id: "ci-016", order_id: "ORD-5201", total_sales: 3200, commission: 320, created_at: "2025-03-22T00:00:00Z" },
        ],
        payment_method: "Bank Transfer", reference_no: "REF-2025032701", notes: "Large payout — needs review",
        created_at: "2025-03-27T08:30:00Z", updated_at: "2025-03-27T08:30:00Z", paid_at: null,
    },
    {
        id: "pay-008", payout_amount: 412, status: "FAILED",
        user_affiliate: DUMMY_AFFILIATES_LIST[8],
        user: { email: "admin@shop.com", name: "Admin User" },
        commission_items: [
            { id: "ci-017", order_id: "ORD-5302", total_sales: 1800, commission: 180, created_at: "2025-03-24T00:00:00Z" },
        ],
        payment_method: "Bank Transfer", reference_no: "REF-2025032501-F", notes: "Bank rejected — invalid account",
        created_at: "2025-03-25T10:00:00Z", updated_at: "2025-03-25T14:00:00Z", paid_at: null,
    },
    {
        id: "pay-009", payout_amount: 620, status: "PAID",
        user_affiliate: DUMMY_AFFILIATES_LIST[9],
        user: { email: "admin@shop.com", name: "Admin User" },
        commission_items: [
            { id: "ci-018", order_id: "ORD-5403", total_sales: 2400, commission: 240, created_at: "2025-03-26T00:00:00Z" },
        ],
        payment_method: "Bank Transfer", reference_no: "REF-2025032602", notes: "",
        created_at: "2025-03-26T14:00:00Z", updated_at: "2025-03-26T16:30:00Z", paid_at: "2025-03-26T16:30:00Z",
    },
    {
        id: "pay-010", payout_amount: 340, status: "PENDING",
        user_affiliate: DUMMY_AFFILIATES_LIST[10],
        user: { email: "finance@shop.com", name: "Finance Team" },
        commission_items: [
            { id: "ci-020", order_id: "ORD-5605", total_sales: 1100, commission: 110, created_at: "2025-03-21T00:00:00Z" },
        ],
        payment_method: "Bank Transfer", reference_no: "REF-2025032801", notes: "",
        created_at: "2025-03-28T07:00:00Z", updated_at: "2025-03-28T07:00:00Z", paid_at: null,
    },
    {
        id: "pay-011", payout_amount: 505, status: "PAID",
        user_affiliate: DUMMY_AFFILIATES_LIST[11],
        user: { email: "admin@shop.com", name: "Admin User" },
        commission_items: [
            { id: "ci-021", order_id: "ORD-5706", total_sales: 2900, commission: 290, created_at: "2025-03-28T00:00:00Z" },
        ],
        payment_method: "Bank Transfer", reference_no: "REF-2025032802", notes: "Top performer bonus included",
        created_at: "2025-03-28T09:30:00Z", updated_at: "2025-03-28T11:00:00Z", paid_at: "2025-03-28T11:00:00Z",
    },
    {
        id: "pay-012", payout_amount: 1200, status: "PROCESSING",
        user_affiliate: DUMMY_AFFILIATES_LIST[12],
        user: { email: "finance@shop.com", name: "Finance Team" },
        commission_items: [
            { id: "ci-022", order_id: "ORD-5807", total_sales: 4500, commission: 450, created_at: "2025-03-11T00:00:00Z" },
        ],
        payment_method: "Bank Transfer", reference_no: "REF-2025032803", notes: "High value — manual processing",
        created_at: "2025-03-28T10:00:00Z", updated_at: "2025-03-28T10:00:00Z", paid_at: null,
    },
    {
        id: "pay-013", payout_amount: 275, status: "PAID",
        user_affiliate: DUMMY_AFFILIATES_LIST[13],
        user: { email: "admin@shop.com", name: "Admin User" },
        commission_items: [
            { id: "ci-023", order_id: "ORD-5908", total_sales: 1650, commission: 165, created_at: "2025-03-29T00:00:00Z" },
        ],
        payment_method: "Bank Transfer", reference_no: "REF-2025032901", notes: "",
        created_at: "2025-03-29T08:00:00Z", updated_at: "2025-03-29T10:15:00Z", paid_at: "2025-03-29T10:15:00Z",
    },
    {
        id: "pay-014", payout_amount: 180, status: "PAID",
        user_affiliate: DUMMY_AFFILIATES_LIST[6],
        user: { email: "admin@shop.com", name: "Admin User" },
        commission_items: [],
        payment_method: "Bank Transfer", reference_no: "REF-2025021501", notes: "February batch",
        created_at: "2025-02-15T10:00:00Z", updated_at: "2025-02-15T12:00:00Z", paid_at: "2025-02-15T12:00:00Z",
    },
    {
        id: "pay-015", payout_amount: 950, status: "PAID",
        user_affiliate: DUMMY_AFFILIATES_LIST[1],
        user: { email: "admin@shop.com", name: "Admin User" },
        commission_items: [],
        payment_method: "Bank Transfer", reference_no: "REF-2025021502", notes: "February batch",
        created_at: "2025-02-15T10:00:00Z", updated_at: "2025-02-15T14:00:00Z", paid_at: "2025-02-15T14:00:00Z",
    },
    {
        id: "pay-016", payout_amount: 430, status: "PAID",
        user_affiliate: DUMMY_AFFILIATES_LIST[4],
        user: { email: "admin@shop.com", name: "Admin User" },
        commission_items: [],
        payment_method: "Bank Transfer", reference_no: "REF-2025011001", notes: "January batch",
        created_at: "2025-01-10T09:00:00Z", updated_at: "2025-01-10T11:00:00Z", paid_at: "2025-01-10T11:00:00Z",
    },
];

/* ════════════════════════════════════════════════════════════════════
   STATUS BADGE (shimmer — matching affiliate screen)
   ════════════════════════════════════════════════════════════════════ */

function PayoutStatusBadge({ status }: { status: string }) {
    const map: Record<string, { gradient: string; shadow: string; label: string }> = {
        PAID: { gradient: "linear-gradient(135deg, #22c55e, #4ade80)", shadow: "0 2px 8px rgba(34,197,94,0.3)", label: "Paid" },
        PENDING: { gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)", shadow: "0 2px 8px rgba(245,158,11,0.3)", label: "Pending" },
        PROCESSING: { gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)", shadow: "0 2px 8px rgba(59,130,246,0.3)", label: "Processing" },
        FAILED: { gradient: "linear-gradient(135deg, #ef4444, #f87171)", shadow: "0 2px 8px rgba(239,68,68,0.3)", label: "Failed" },
    };
    const c = map[status] || map.PENDING;
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
   CREATE PAYOUT DIALOG
   ════════════════════════════════════════════════════════════════════ */

function CreatePayoutDialog({
    onClose,
    onSubmit,
    isDark,
    affiliates,
}: {
    onClose: () => void;
    onSubmit: (data: {
        affiliate: PayoutAffiliate;
        amount: number;
        notes: string;
        reference: string;
    }) => void;
    isDark: boolean;
    affiliates: PayoutAffiliate[];
}) {
    const [selectedAffId, setSelectedAffId] = useState("");
    const [amount, setAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [reference, setReference] = useState("");
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

    const handleSubmit = () => {
        if (!selectedAff) { toast.error("Select an affiliate"); return; }
        if (!amount || parseFloat(amount) <= 0) { toast.error("Enter a valid amount"); return; }
        setIsSubmitting(true);
        setTimeout(() => {
            onSubmit({ affiliate: selectedAff, amount: parseFloat(amount), notes, reference });
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div
            style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
            <div
                style={{
                    position: "relative", zIndex: 1, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto",
                    margin: "0 16px", background: isDark ? "hsl(222, 20%, 14%)" : "#fff",
                    borderRadius: 16, padding: "24px", boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
                    fontFamily: "'Outfit', sans-serif", color: isDark ? "#e2e8f0" : "#1a1a2e",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Create Payout</h2>
                        <p style={{ fontSize: 13, color: isDark ? "#94a3b8" : "#64748b", margin: "4px 0 0" }}>
                            Create a new manual payout for an affiliate
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
                        style={{
                            ...inputStyle, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                        }}
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

                {/* Bank details preview */}
                {selectedAff && (
                    <div style={{
                        borderRadius: 12, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                        padding: "12px 16px", marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10,
                    }}>
                        {[
                            { label: "Bank", value: selectedAff.bank_detail.bank_name },
                            { label: "Account", value: selectedAff.bank_detail.account_number },
                            { label: "Holder", value: selectedAff.bank_detail.account_holder },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <div style={{ fontSize: 10, color: isDark ? "#64748b" : "#94a3b8", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.3px" }}>{label}</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: isDark ? "#e2e8f0" : "#1a1a2e" }}>{value}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Amount */}
                <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Amount (RM)</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" style={inputStyle} min="0" step="0.01" />
                </div>

                {/* Reference */}
                <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Reference No.</label>
                    <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. REF-2025032801" style={inputStyle} />
                </div>

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
                        Create Payout
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   EDIT PAYOUT DIALOG
   ════════════════════════════════════════════════════════════════════ */

function EditPayoutDialog({
    payout,
    onClose,
    onSave,
    isDark,
}: {
    payout: PayoutRecord;
    onClose: () => void;
    onSave: (id: string, data: { notes: string; reference_no: string; status: string }) => void;
    isDark: boolean;
}) {
    const [status, setStatus] = useState(payout.status);
    const [notes, setNotes] = useState(payout.notes);
    const [reference, setReference] = useState(payout.reference_no);
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
            onSave(payout.id, { notes, reference_no: reference, status });
            setIsSubmitting(false);
        }, 800);
    };

    const statusOptions = ["PAID", "PENDING", "PROCESSING", "FAILED"];

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
            <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 480, margin: "0 16px", background: isDark ? "hsl(222, 20%, 14%)" : "#fff", borderRadius: 16, padding: "24px", boxShadow: "0 24px 80px rgba(0,0,0,0.3)", fontFamily: "'Outfit', sans-serif", color: isDark ? "#e2e8f0" : "#1a1a2e" }}
                onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Edit Payout</h2>
                        <p style={{ fontSize: 13, color: isDark ? "#94a3b8" : "#64748b", margin: "4px 0 0" }}>
                            {payout.user_affiliate.first_name} {payout.user_affiliate.last_name} — {formatCurrency(payout.payout_amount)}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: isDark ? "#94a3b8" : "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <X size={16} />
                    </button>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Status</label>
                    <div style={{ display: "flex", gap: 6 }}>
                        {statusOptions.map((s) => (
                            <button key={s} type="button" onClick={() => setStatus(s as any)} style={{
                                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                                background: status === s ? "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))" : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                                color: status === s ? "#fff" : (isDark ? "#94a3b8" : "#64748b"), transition: "all 0.15s",
                            }}>
                                {s.charAt(0) + s.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Reference No.</label>
                    <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} style={inputStyle} />
                </div>

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
   DELETE PAYOUT DIALOG
   ════════════════════════════════════════════════════════════════════ */

function DeletePayoutDialog({
    payout,
    onClose,
    onConfirm,
    isDark,
}: {
    payout: PayoutRecord;
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
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Delete Payout?</h2>
                <p style={{ fontSize: 13, color: isDark ? "#94a3b8" : "#64748b", margin: "0 0 20px", lineHeight: 1.5 }}>
                    This will permanently remove the payout record of{" "}
                    <strong>{formatCurrency(payout.payout_amount)}</strong> for{" "}
                    <strong>{payout.user_affiliate.first_name} {payout.user_affiliate.last_name}</strong>.
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
   PAYOUT DETAIL PANEL (Quick View — matching AffiliateQuickView)
   ════════════════════════════════════════════════════════════════════ */

function PayoutDetailPanel({
    payout,
    onClose,
    theme,
}: {
    payout: PayoutRecord;
    onClose: () => void;
    theme: any;
}) {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const user = payout.user_affiliate;
    const bank = user.bank_detail;

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success("Copied!");
        setTimeout(() => setCopiedField(null), 1500);
    };

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
                <PayoutStatusBadge status={payout.status} />
            </div>

            {/* Amount highlight */}
            <div style={{ background: theme.expandBtnBg, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: theme.subtitle, textTransform: "uppercase", letterSpacing: "0.4px" }}>Payout Amount</span>
                <span style={{ fontSize: 24, fontWeight: 700, color: theme.title, fontFamily: "'Outfit', sans-serif" }}>
                    {formatCurrency(payout.payout_amount)}
                </span>
            </div>

            {/* Details grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                    { label: "Reference", value: payout.reference_no },
                    { label: "Method", value: payout.payment_method },
                    { label: "Created", value: new Date(payout.created_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }) },
                    { label: "Paid At", value: payout.paid_at ? new Date(payout.paid_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                    { label: "Processed By", value: payout.user.name },
                    { label: "Staff Email", value: payout.user.email },
                ].map((s) => (
                    <div key={s.label}>
                        <div style={{ fontSize: 10, color: theme.subtitle, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: theme.title, wordBreak: "break-all" }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {payout.notes && (
                <>
                    <div style={{ width: "100%", height: 1, background: theme.divider }} />
                    <div>
                        <div style={{ fontSize: 10, color: theme.subtitle, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Notes</div>
                        <p style={{ fontSize: 12, color: theme.title, lineHeight: 1.5, margin: 0 }}>{payout.notes}</p>
                    </div>
                </>
            )}

            <div style={{ width: "100%", height: 1, background: theme.divider }} />

            {/* Bank details */}
            <div>
                <div style={{ fontSize: 10, color: theme.subtitle, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Bank Details</div>
                {[
                    { l: "Bank", v: bank.bank_name, f: "bank" },
                    { l: "Account", v: bank.account_number, f: "acc" },
                    { l: "Holder", v: bank.account_holder, f: "holder" },
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

            {/* Commission breakdown */}
            {payout.commission_items.length > 0 && (
                <>
                    <div style={{ width: "100%", height: 1, background: theme.divider }} />
                    <div>
                        <div style={{ fontSize: 10, color: theme.subtitle, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                            Commission Breakdown ({payout.commission_items.length})
                        </div>
                        {payout.commission_items.map((ci) => (
                            <div key={ci.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "6px 0", borderBottom: `1px solid ${theme.divider}` }}>
                                <div>
                                    <span style={{ fontWeight: 600, color: theme.title }}>#{ci.order_id}</span>
                                    <span style={{ color: theme.subtitle, marginLeft: 8 }}>Sales: {formatCurrency(ci.total_sales)}</span>
                                </div>
                                <span style={{ fontWeight: 600, color: theme.title }}>{formatCurrency(ci.commission)}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   BULK PAYOUT DIALOG — NEW FEATURE
   Mark multiple pending payouts as paid at once
   ════════════════════════════════════════════════════════════════════ */

function BulkPayoutDialog({
    payouts,
    onClose,
    onConfirm,
    isDark,
}: {
    payouts: PayoutRecord[];
    onClose: () => void;
    onConfirm: (ids: string[]) => void;
    isDark: boolean;
}) {
    const pendingPayouts = payouts.filter((p) => p.status === "PENDING" || p.status === "PROCESSING");
    const [selectedIds, setSelectedIds] = useState<string[]>(pendingPayouts.map((p) => p.id));
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalSelected = pendingPayouts.filter((p) => selectedIds.includes(p.id)).reduce((s, p) => s + p.payout_amount, 0);

    const handleToggle = (id: string) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    const handleSelectAll = (checked: boolean) => setSelectedIds(checked ? pendingPayouts.map((p) => p.id) : []);

    const handleSubmit = () => {
        if (selectedIds.length === 0) { toast.error("Select at least one payout"); return; }
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
                            Select pending/processing payouts to mark as paid
                        </p>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: isDark ? "#94a3b8" : "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <X size={16} />
                    </button>
                </div>

                <div style={{ borderRadius: 12, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, overflow: "hidden", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
                        <Checkbox checked={selectedIds.length === pendingPayouts.length && pendingPayouts.length > 0} onCheckedChange={(v) => handleSelectAll(!!v)} />
                        <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>Select All</span>
                        <span style={{ fontSize: 11, color: isDark ? "#64748b" : "#94a3b8" }}>{selectedIds.length} / {pendingPayouts.length}</span>
                    </div>
                    <div style={{ maxHeight: 280, overflowY: "auto" }}>
                        {pendingPayouts.length === 0 ? (
                            <div style={{ padding: "24px 14px", textAlign: "center", fontSize: 13, color: isDark ? "#64748b" : "#94a3b8" }}>No pending payouts</div>
                        ) : pendingPayouts.map((p) => (
                            <div key={p.id} onClick={() => handleToggle(p.id)}
                                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`, cursor: "pointer", transition: "background 0.15s" }}
                                onMouseOver={(e) => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)")}
                                onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <Checkbox checked={selectedIds.includes(p.id)} onCheckedChange={() => handleToggle(p.id)} />
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{p.user_affiliate.first_name} {p.user_affiliate.last_name}</div>
                                        <div style={{ fontSize: 11, color: isDark ? "#64748b" : "#94a3b8" }}>{p.reference_no} • <PayoutStatusBadge status={p.status} /></div>
                                    </div>
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 700 }}>{formatCurrency(p.payout_amount)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 12, marginBottom: 20, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Total</span>
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
   LOAD MORE MASCOT (matching affiliate screen)
   ════════════════════════════════════════════════════════════════════ */

function PayoutLoadMoreMascot({ text, subColor }: { text: string; subColor: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "28px 16px" }}>
            <svg width={72} height={72} viewBox="0 0 100 100" style={{ filter: "drop-shadow(0 0 20px rgba(167,139,250,0.4))" }}>
                <defs>
                    <radialGradient id="payLoadGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                        <stop offset="40%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#0f172a" />
                    </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="40" stroke="#a78bfa" strokeWidth="1" fill="none" opacity="0.4">
                    <animate attributeName="r" values="35;45;35" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="50" cy="50" r="28" fill="url(#payLoadGrad)">
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
   MAIN PAYOUTS SCREEN
   ════════════════════════════════════════════════════════════════════ */

const PayoutsScreen = () => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [revealedAmounts, setRevealedAmounts] = useState(true);
    const [cardsExpanded, setCardsExpanded] = useState(false);
    const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editPayout, setEditPayout] = useState<PayoutRecord | null>(null);
    const [deletePayout, setDeletePayout] = useState<PayoutRecord | null>(null);
    const [detailPayout, setDetailPayout] = useState<PayoutRecord | null>(null);
    const [showBulkPayout, setShowBulkPayout] = useState(false);

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
            setPayouts(DUMMY_PAYOUTS);
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const filteredData = useMemo(() => {
        if (statusFilter === "all") return payouts;
        return payouts.filter((p) => p.status === statusFilter);
    }, [payouts, statusFilter]);

    const meta = useMemo(() => {
        const total_payout = payouts.filter((p) => p.status === "PAID").reduce((s, p) => s + p.payout_amount, 0);
        const pending_payout = payouts.filter((p) => p.status === "PENDING" || p.status === "PROCESSING").reduce((s, p) => s + p.payout_amount, 0);
        const thisMonth = new Date();
        const paid_this_month = payouts
            .filter((p) => p.status === "PAID" && p.paid_at)
            .filter((p) => {
                const d = new Date(p.paid_at!);
                return d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear();
            })
            .reduce((s, p) => s + p.payout_amount, 0);
        const total_transactions = payouts.length;
        const paid_count = payouts.filter((p) => p.status === "PAID").length;
        const pending_count = payouts.filter((p) => p.status === "PENDING").length;
        const processing_count = payouts.filter((p) => p.status === "PROCESSING").length;
        const failed_count = payouts.filter((p) => p.status === "FAILED").length;
        const avg_payout = paid_count > 0 ? total_payout / paid_count : 0;
        return { total_payout, pending_payout, paid_this_month, total_transactions, paid_count, pending_count, processing_count, failed_count, avg_payout };
    }, [payouts]);

    /* ── Theme tokens ── */
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
    const columns: ColumnDef<PayoutRecord>[] = useMemo(
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
                        <div style={{ cursor: "pointer" }} onClick={() => setDetailPayout(row.original)}>
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
            },
            {
                accessorKey: "payout_amount",
                header: ({ column }) => (
                    <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.5px", padding: 0 }}>
                        Amount <ArrowUpDown size={12} />
                    </button>
                ),
                cell: ({ row }) => (
                    <span style={{ fontSize: 13, fontWeight: 700, color: t.cellBold }}>
                        {revealedAmounts ? formatCurrency(row.original.payout_amount) : "••••••"}
                    </span>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => <PayoutStatusBadge status={row.original.status} />,
            },
            {
                accessorKey: "reference_no",
                header: "Reference",
                cell: ({ row }) => (
                    <span style={{ fontSize: 12, color: t.cellText, fontFamily: "monospace" }}>{row.original.reference_no}</span>
                ),
            },
            {
                accessorKey: "user",
                header: "Staff",
                cell: ({ row }) => (
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: t.cellBold }}>{row.original.user.name}</div>
                        <div style={{ fontSize: 11, color: t.cellText }}>{row.original.user.email}</div>
                    </div>
                ),
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
                    const p = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: t.expandBtnBg, color: t.subtitle, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <MoreHorizontal size={14} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setDetailPayout(p)}>
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEditPayout(p)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                {(p.status === "PENDING" || p.status === "PROCESSING") && (
                                    <DropdownMenuItem onClick={() => {
                                        setPayouts((prev) => prev.map((x) => x.id === p.id ? { ...x, status: "PAID" as const, paid_at: new Date().toISOString(), updated_at: new Date().toISOString() } : x));
                                        toast.success("Marked as paid");
                                    }}>
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Paid
                                    </DropdownMenuItem>
                                )}
                                {p.status === "FAILED" && (
                                    <DropdownMenuItem onClick={() => {
                                        setPayouts((prev) => prev.map((x) => x.id === p.id ? { ...x, status: "PROCESSING" as const, updated_at: new Date().toISOString() } : x));
                                        toast.success("Retrying payout");
                                    }}>
                                        <Loader2 className="mr-2 h-4 w-4" /> Retry
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setDeletePayout(p)} className="text-red-500 focus:text-red-500">
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
    }, [filteredData, statusFilter, columnFilters, perPage]);

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
        { value: "PROCESSING", label: "Processing" },
        { value: "FAILED", label: "Failed" },
    ];

    /* ── Handler helpers ── */
    const handleCreatePayout = (data: { affiliate: PayoutAffiliate; amount: number; notes: string; reference: string }) => {
        const newPayout: PayoutRecord = {
            id: `pay-${Date.now()}`,
            user_affiliate: data.affiliate,
            user: { email: "admin@shop.com", name: "Admin User" },
            payout_amount: data.amount,
            status: "PENDING",
            commission_items: [],
            payment_method: "Bank Transfer",
            reference_no: data.reference || `REF-${Date.now()}`,
            notes: data.notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            paid_at: null,
        };
        setPayouts((prev) => [newPayout, ...prev]);
        toast.success("Payout created!");
        setShowCreateDialog(false);
    };

    const handleEditSave = (id: string, data: { notes: string; reference_no: string; status: string }) => {
        setPayouts((prev) =>
            prev.map((p) =>
                p.id === id
                    ? {
                        ...p,
                        notes: data.notes,
                        reference_no: data.reference_no,
                        status: data.status as any,
                        updated_at: new Date().toISOString(),
                        paid_at: data.status === "PAID" && !p.paid_at ? new Date().toISOString() : p.paid_at,
                    }
                    : p
            )
        );
        toast.success("Payout updated!");
        setEditPayout(null);
    };

    const handleBulkPaid = (ids: string[]) => {
        setPayouts((prev) =>
            prev.map((p) =>
                ids.includes(p.id) ? { ...p, status: "PAID" as const, paid_at: new Date().toISOString(), updated_at: new Date().toISOString() } : p
            )
        );
        toast.success(`${ids.length} payouts marked as paid!`);
        setShowBulkPayout(false);
    };

    const handleExport = () => {
        toast.success("Exporting payouts data...");
        // In real app this would generate XLSX
    };

    /* ════════════════════════════════════════════════════════════════
       RENDER
       ════════════════════════════════════════════════════════════════ */

    return (
        <div className="payouts-dashboard flex flex-col gap-4 w-full" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <style>{`
                @keyframes shimmer-badge { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                @keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
            `}</style>

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3">
                <div>
                    <h2 style={{ fontSize: 26, fontWeight: 700, color: t.title, margin: 0, letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                        Payouts
                    </h2>
                    <p style={{ fontSize: 13, color: t.subtitle, margin: "4px 0 0" }}>
                        Manage affiliate payouts and transactions
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
                        onClick={() => setShowBulkPayout(true)}
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
                        <Plus size={14} /> New Payout
                    </button>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div
                style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, width: "100%" }}
                className="overview-platform-grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4"
            >
                <OverviewDataCard
                    customTitle="Total Payouts"
                    customIcon={<DollarSign size={22} strokeWidth={2} />}
                    metricSubtitle="All time payouts"
                    primaryValueDisplay={revealedAmounts ? formatCurrency(meta.total_payout) : "RM ••••••"}
                    expandLabel1="Paid Count"
                    expandValue1Display={String(meta.paid_count)}
                    expandLabel2="Avg. Payout"
                    expandValue2Display={revealedAmounts ? formatCurrency(meta.avg_payout) : "••••••"}
                    isLoading={isLoading}
                    expanded={cardsExpanded}
                    onExpandToggle={() => setCardsExpanded((e) => !e)}
                />
                <OverviewDataCard
                    customTitle="Pending Payouts"
                    customIcon={<Clock size={22} strokeWidth={2} />}
                    metricSubtitle="Awaiting processing"
                    primaryValueDisplay={revealedAmounts ? formatCurrency(meta.pending_payout) : "RM ••••••"}
                    expandLabel1="Pending"
                    expandValue1Display={String(meta.pending_count)}
                    expandLabel2="Processing"
                    expandValue2Display={String(meta.processing_count)}
                    isLoading={isLoading}
                    expanded={cardsExpanded}
                    onExpandToggle={() => setCardsExpanded((e) => !e)}
                />
                <OverviewDataCard
                    customTitle="Paid This Month"
                    customIcon={<TrendingUp size={22} strokeWidth={2} />}
                    metricSubtitle="Current month payouts"
                    primaryValueDisplay={revealedAmounts ? formatCurrency(meta.paid_this_month) : "RM ••••••"}
                    expandLabel1="All Transactions"
                    expandValue1Display={String(meta.total_transactions)}
                    expandLabel2="Failed"
                    expandValue2Display={String(meta.failed_count)}
                    isLoading={isLoading}
                    expanded={cardsExpanded}
                    onExpandToggle={() => setCardsExpanded((e) => !e)}
                />
                <OverviewDataCard
                    customTitle="Total Transactions"
                    customIcon={<ArrowDownUp size={22} strokeWidth={2} />}
                    metricSubtitle="Processed transactions"
                    primaryValueDisplay={String(meta.total_transactions)}
                    expandLabel1="Paid"
                    expandValue1Display={String(meta.paid_count)}
                    expandLabel2="Failed"
                    expandValue2Display={String(meta.failed_count)}
                    isLoading={isLoading}
                    expanded={cardsExpanded}
                    onExpandToggle={() => setCardsExpanded((e) => !e)}
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
                        <MediumLoader label="Loading payouts" className="!py-4" />
                    </div>
                )}

                {/* Table header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: t.title, margin: 0, letterSpacing: "-0.3px", lineHeight: 1.2 }}>
                            Payout History
                        </h2>
                        <p style={{ fontSize: 12, color: t.subtitle, margin: "4px 0 0" }}>
                            {filteredData.length} transactions
                        </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        {/* Status pills */}
                        <div style={{ background: t.pillBg, borderRadius: 10, padding: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
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
                        placeholder="Search payouts by affiliate name..."
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
                                    All Payouts ({filteredData.length})
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
                                                    No payouts found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {(hasMore || loadingMore) && sortedRows.length > perPage && (
                                <div ref={sentinelRef} aria-hidden style={{ minHeight: loadingMore ? 8 : 24, borderTop: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {loadingMore ? <PayoutLoadMoreMascot text="Fetching payouts" subColor={isDark ? "rgba(255,255,255,0.6)" : "rgba(71,85,105,0.85)"} /> : null}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detail Panel — desktop */}
                    {detailPayout && (
                        <div className="hidden lg:block" style={{ width: 320, flexShrink: 0, animation: "slideIn 0.2s ease-out" }}>
                            <PayoutDetailPanel payout={detailPayout} onClose={() => setDetailPayout(null)} theme={t} />
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
            {detailPayout && (
                <div className="lg:hidden">
                    <div style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center" }}
                        onClick={() => setDetailPayout(null)}>
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} />
                        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420, margin: "0 16px", maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
                            <PayoutDetailPanel payout={detailPayout} onClose={() => setDetailPayout(null)} theme={t} />
                        </div>
                    </div>
                </div>
            )}

            {/* Dialogs */}
            {showCreateDialog && (
                <CreatePayoutDialog
                    onClose={() => setShowCreateDialog(false)}
                    onSubmit={handleCreatePayout}
                    isDark={isDark}
                    affiliates={DUMMY_AFFILIATES_LIST}
                />
            )}
            {editPayout && (
                <EditPayoutDialog
                    payout={editPayout}
                    onClose={() => setEditPayout(null)}
                    onSave={handleEditSave}
                    isDark={isDark}
                />
            )}
            {deletePayout && (
                <DeletePayoutDialog
                    payout={deletePayout}
                    onClose={() => setDeletePayout(null)}
                    onConfirm={() => {
                        setPayouts((prev) => prev.filter((p) => p.id !== deletePayout.id));
                        toast.success("Payout deleted");
                    }}
                    isDark={isDark}
                />
            )}
            {showBulkPayout && (
                <BulkPayoutDialog
                    payouts={payouts}
                    onClose={() => setShowBulkPayout(false)}
                    onConfirm={handleBulkPaid}
                    isDark={isDark}
                />
            )}
        </div>
    );
};

export default PayoutsScreen;