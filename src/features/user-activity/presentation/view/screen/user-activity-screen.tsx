"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import {
    Search,
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
    Clock,
    TrendingUp,
    Pencil,
    Trash2,
    CheckCircle2,
    Sparkles,
    Globe,
    Calendar,
    Users,
    UserCheck,
    ShoppingBag,
    Tag,
    Shield,
    Settings,
    Zap,
    RotateCcw,
    AlertTriangle,
    Activity,
    Layers,
    FolderOpen,
    Package,
    RefreshCw,
    ExternalLink,
    Mail,
    User,
    Filter,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { MediumLoader } from "@/components/ui/shop-intel-loader";
import { formatCurrency } from "@/src/core/constant/helper";
import toast from "react-hot-toast";
import OverviewDataCard from "@/src/features/sales/presentation/view/components/analytics/overview-data-card";

/* ════════════════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════════════════ */

interface EventUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface EventEntity {
    id: string;
    name: string;
    description: string;
    type: string;
    status: string;
    created_at: string;
    updated_at: string;
    user: EventUser;
}

const EVENT_TYPES = ["ORDER", "PRODUCT", "COLLECTION", "DISCOUNT", "CATEGORY", "USER", "AUTHENTICATION", "SYSTEM"] as const;
const EVENT_STATUSES = ["completed", "pending", "failed", "in_progress"] as const;

const STATUS_FILTER_META: { value: string; label: string; dot: string }[] = [
    { value: "all", label: "All", dot: "rgba(var(--preset-primary-rgb), 0.9)" },
    { value: "completed", label: "Completed", dot: "#22c55e" },
    { value: "pending", label: "Pending", dot: "#f59e0b" },
    { value: "failed", label: "Failed", dot: "#ef4444" },
    { value: "in_progress", label: "In progress", dot: "#3b82f6" },
];

const TYPE_FILTER_META: { value: string; label: string; dot: string }[] = [
    { value: "all", label: "All Types", dot: "rgba(var(--preset-primary-rgb), 0.9)" },
    { value: "ORDER", label: "Order", dot: "#3b82f6" },
    { value: "PRODUCT", label: "Product", dot: "#6366f1" },
    { value: "COLLECTION", label: "Collection", dot: "#a855f7" },
    { value: "DISCOUNT", label: "Discount", dot: "#ef4444" },
    { value: "CATEGORY", label: "Category", dot: "#10b981" },
    { value: "USER", label: "User", dot: "#ec4899" },
    { value: "AUTHENTICATION", label: "Authentication", dot: "#f59e0b" },
    { value: "SYSTEM", label: "System", dot: "#94a3b8" },
];

/* ════════════════════════════════════════════════════════════════════
   DUMMY DATA
   ════════════════════════════════════════════════════════════════════ */

const DUMMY_USERS: EventUser[] = [
    { id: "usr-001", name: "Sarah Ahmad", email: "sarah.ahmad@gmail.com", role: "admin" },
    { id: "usr-002", name: "Muhammad Rizki", email: "m.rizki@outlook.com", role: "staff" },
    { id: "usr-003", name: "Aisha Tan", email: "aisha.tan@yahoo.com", role: "staff" },
    { id: "usr-004", name: "Nurul Huda", email: "nurul.huda@hotmail.com", role: "customer" },
    { id: "usr-005", name: "Raj Kumar", email: "raj.kumar@gmail.com", role: "customer" },
    { id: "usr-006", name: "Fatimah Zahra", email: "fatimah.z@gmail.com", role: "staff" },
    { id: "usr-007", name: "Hana Sofia", email: "hana.s@icloud.com", role: "customer" },
    { id: "usr-008", name: "Priya Menon", email: "priya.menon@yahoo.com", role: "customer" },
    { id: "usr-009", name: "System", email: "system@app.com", role: "system" },
];

const DUMMY_EVENTS: EventEntity[] = [
    { id: "evt-001", name: "Order Created", description: "New order #ORD-4821 placed by customer", type: "ORDER", status: "completed", created_at: "2025-03-29T08:30:00Z", updated_at: "2025-03-29T08:30:00Z", user: DUMMY_USERS[3] },
    { id: "evt-002", name: "Product Updated", description: "Product 'Premium Hijab Set' price updated from RM45 to RM42", type: "PRODUCT", status: "completed", created_at: "2025-03-29T07:15:00Z", updated_at: "2025-03-29T07:15:00Z", user: DUMMY_USERS[0] },
    { id: "evt-003", name: "User Login", description: "Admin user logged in from 103.28.xx.xx", type: "AUTHENTICATION", status: "completed", created_at: "2025-03-29T07:00:00Z", updated_at: "2025-03-29T07:00:00Z", user: DUMMY_USERS[0] },
    { id: "evt-004", name: "Discount Created", description: "New discount code 'RAYA2025' created — 15% off storewide", type: "DISCOUNT", status: "completed", created_at: "2025-03-28T16:00:00Z", updated_at: "2025-03-28T16:00:00Z", user: DUMMY_USERS[1] },
    { id: "evt-005", name: "Collection Published", description: "Collection 'Raya 2025' published with 24 products", type: "COLLECTION", status: "completed", created_at: "2025-03-28T14:30:00Z", updated_at: "2025-03-28T14:30:00Z", user: DUMMY_USERS[2] },
    { id: "evt-006", name: "Order Payment Failed", description: "Payment for order #ORD-4819 failed — card declined", type: "ORDER", status: "failed", created_at: "2025-03-28T13:00:00Z", updated_at: "2025-03-28T13:05:00Z", user: DUMMY_USERS[4] },
    { id: "evt-007", name: "Category Created", description: "New category 'Sun Care' added under 'Skincare'", type: "CATEGORY", status: "completed", created_at: "2025-03-28T11:00:00Z", updated_at: "2025-03-28T11:00:00Z", user: DUMMY_USERS[5] },
    { id: "evt-008", name: "Product Deleted", description: "Product 'Old Scarf Collection' removed from catalog", type: "PRODUCT", status: "completed", created_at: "2025-03-28T10:00:00Z", updated_at: "2025-03-28T10:00:00Z", user: DUMMY_USERS[0] },
    { id: "evt-009", name: "System Backup", description: "Automated daily backup completed successfully", type: "SYSTEM", status: "completed", created_at: "2025-03-28T03:00:00Z", updated_at: "2025-03-28T03:02:00Z", user: DUMMY_USERS[8] },
    { id: "evt-010", name: "Order Fulfilled", description: "Order #ORD-4815 marked as shipped — tracking: MY123456789", type: "ORDER", status: "completed", created_at: "2025-03-27T16:00:00Z", updated_at: "2025-03-27T16:00:00Z", user: DUMMY_USERS[1] },
    { id: "evt-011", name: "User Registered", description: "New customer 'Hana Sofia' registered via Instagram link", type: "USER", status: "completed", created_at: "2025-03-27T14:30:00Z", updated_at: "2025-03-27T14:30:00Z", user: DUMMY_USERS[6] },
    { id: "evt-012", name: "Discount Expired", description: "Discount code 'MARCH20' has expired", type: "DISCOUNT", status: "completed", created_at: "2025-03-27T00:00:00Z", updated_at: "2025-03-27T00:00:00Z", user: DUMMY_USERS[8] },
    { id: "evt-013", name: "Order Refund Initiated", description: "Refund of RM89 initiated for order #ORD-4810", type: "ORDER", status: "pending", created_at: "2025-03-26T15:00:00Z", updated_at: "2025-03-26T15:00:00Z", user: DUMMY_USERS[2] },
    { id: "evt-014", name: "Product Created", description: "New product 'Silk Telekung Premium' added — RM189", type: "PRODUCT", status: "completed", created_at: "2025-03-26T10:00:00Z", updated_at: "2025-03-26T10:00:00Z", user: DUMMY_USERS[0] },
    { id: "evt-015", name: "Collection Updated", description: "Collection 'Best Sellers' reordered — 5 new products added", type: "COLLECTION", status: "completed", created_at: "2025-03-25T14:00:00Z", updated_at: "2025-03-25T14:30:00Z", user: DUMMY_USERS[5] },
    { id: "evt-016", name: "User Role Changed", description: "User 'Fatimah Zahra' role changed from customer to staff", type: "USER", status: "completed", created_at: "2025-03-25T11:00:00Z", updated_at: "2025-03-25T11:00:00Z", user: DUMMY_USERS[0] },
    { id: "evt-017", name: "Authentication Failed", description: "3 failed login attempts for email raj.kumar@gmail.com", type: "AUTHENTICATION", status: "failed", created_at: "2025-03-25T09:00:00Z", updated_at: "2025-03-25T09:05:00Z", user: DUMMY_USERS[4] },
    { id: "evt-018", name: "Order Created", description: "New order #ORD-4808 — 3 items totalling RM245", type: "ORDER", status: "completed", created_at: "2025-03-24T20:00:00Z", updated_at: "2025-03-24T20:00:00Z", user: DUMMY_USERS[7] },
    { id: "evt-019", name: "System Maintenance", description: "Scheduled maintenance window — 15 min downtime", type: "SYSTEM", status: "completed", created_at: "2025-03-24T02:00:00Z", updated_at: "2025-03-24T02:15:00Z", user: DUMMY_USERS[8] },
    { id: "evt-020", name: "Category Updated", description: "Category 'Telekung' renamed to 'Prayer Wear'", type: "CATEGORY", status: "completed", created_at: "2025-03-23T11:00:00Z", updated_at: "2025-03-23T11:00:00Z", user: DUMMY_USERS[2] },
    { id: "evt-021", name: "Product Stock Alert", description: "Product 'Classic Bawal' stock below threshold (3 remaining)", type: "PRODUCT", status: "pending", created_at: "2025-03-23T08:00:00Z", updated_at: "2025-03-23T08:00:00Z", user: DUMMY_USERS[8] },
    { id: "evt-022", name: "Discount Applied", description: "Code 'VIP10' applied to order #ORD-4805 — RM12 off", type: "DISCOUNT", status: "completed", created_at: "2025-03-22T19:00:00Z", updated_at: "2025-03-22T19:00:00Z", user: DUMMY_USERS[6] },
    { id: "evt-023", name: "Order Cancelled", description: "Order #ORD-4803 cancelled by customer before shipping", type: "ORDER", status: "completed", created_at: "2025-03-22T15:00:00Z", updated_at: "2025-03-22T15:10:00Z", user: DUMMY_USERS[3] },
    { id: "evt-024", name: "Collection Deleted", description: "Draft collection 'Test Collection' permanently removed", type: "COLLECTION", status: "completed", created_at: "2025-03-21T10:00:00Z", updated_at: "2025-03-21T10:00:00Z", user: DUMMY_USERS[0] },
    { id: "evt-025", name: "User Password Reset", description: "Password reset completed for priya.menon@yahoo.com", type: "AUTHENTICATION", status: "completed", created_at: "2025-03-20T09:00:00Z", updated_at: "2025-03-20T09:05:00Z", user: DUMMY_USERS[7] },
    { id: "evt-026", name: "Product Bulk Import", description: "Bulk import: 15 products added from CSV upload", type: "PRODUCT", status: "in_progress", created_at: "2025-03-19T14:00:00Z", updated_at: "2025-03-19T14:10:00Z", user: DUMMY_USERS[1] },
    { id: "evt-027", name: "Order Delivered", description: "Order #ORD-4790 confirmed delivered by courier", type: "ORDER", status: "completed", created_at: "2025-03-18T16:00:00Z", updated_at: "2025-03-18T16:00:00Z", user: DUMMY_USERS[8] },
    { id: "evt-028", name: "System Error", description: "Payment gateway timeout — auto-retry in 5 minutes", type: "SYSTEM", status: "failed", created_at: "2025-03-17T22:00:00Z", updated_at: "2025-03-17T22:05:00Z", user: DUMMY_USERS[8] },
];

/* ════════════════════════════════════════════════════════════════════
   SHIMMER STATUS BADGE
   ════════════════════════════════════════════════════════════════════ */

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { gradient: string; shadow: string; label: string }> = {
        completed: { gradient: "linear-gradient(135deg, #22c55e, #4ade80)", shadow: "0 2px 8px rgba(34,197,94,0.3)", label: "Completed" },
        pending: { gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)", shadow: "0 2px 8px rgba(245,158,11,0.3)", label: "Pending" },
        failed: { gradient: "linear-gradient(135deg, #ef4444, #f87171)", shadow: "0 2px 8px rgba(239,68,68,0.3)", label: "Failed" },
        in_progress: { gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)", shadow: "0 2px 8px rgba(59,130,246,0.3)", label: "In Progress" },
    };
    const c = map[status] || map.completed;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", position: "relative", overflow: "hidden",
            background: c.gradient, boxShadow: c.shadow, borderRadius: 6, padding: "2px 8px",
            fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#fff", lineHeight: 1.6,
        }}>
            <span style={{ position: "relative", zIndex: 1 }}>{c.label}</span>
            <span style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)", backgroundSize: "200% 100%", animation: "shimmer-badge 2s infinite linear" }} />
        </span>
    );
}

/* ════════════════════════════════════════════════════════════════════
   TYPE BADGE
   ════════════════════════════════════════════════════════════════════ */

function TypeBadge({ type, isDark }: { type: string; isDark: boolean }) {
    const map: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
        ORDER: { bg: isDark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)", text: "#3b82f6", icon: <ShoppingBag size={10} /> },
        PRODUCT: { bg: isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)", text: "#6366f1", icon: <Package size={10} /> },
        COLLECTION: { bg: isDark ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.1)", text: "#a855f7", icon: <Layers size={10} /> },
        DISCOUNT: { bg: isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.1)", text: "#ef4444", icon: <Tag size={10} /> },
        CATEGORY: { bg: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)", text: "#10b981", icon: <FolderOpen size={10} /> },
        USER: { bg: isDark ? "rgba(236,72,153,0.15)" : "rgba(236,72,153,0.1)", text: "#ec4899", icon: <User size={10} /> },
        AUTHENTICATION: { bg: isDark ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.1)", text: "#f59e0b", icon: <Shield size={10} /> },
        SYSTEM: { bg: isDark ? "rgba(148,163,184,0.15)" : "rgba(148,163,184,0.1)", text: "#94a3b8", icon: <Settings size={10} /> },
    };
    const s = map[type] || map.SYSTEM;
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: s.bg, color: s.text, letterSpacing: "0.2px" }}>
            {s.icon}{type.charAt(0) + type.slice(1).toLowerCase()}
        </span>
    );
}

/* ════════════════════════════════════════════════════════════════════
   SHARED DIALOG STYLES
   ════════════════════════════════════════════════════════════════════ */

const iS = (dk: boolean): React.CSSProperties => ({ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500, background: dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: `1px solid ${dk ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, color: dk ? "#e2e8f0" : "#1a1a2e", outline: "none", fontFamily: "'Outfit', sans-serif", transition: "border-color 0.15s" });
const lS = (dk: boolean): React.CSSProperties => ({ fontSize: 12, fontWeight: 600, color: dk ? "#94a3b8" : "#64748b", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.4px" });
const dOverlay = (): React.CSSProperties => ({ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" });
const dBackdrop = (): React.CSSProperties => ({ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" });
const dBox = (dk: boolean, mw = 540): React.CSSProperties => ({ position: "relative", zIndex: 1, width: "100%", maxWidth: mw, maxHeight: "90vh", overflowY: "auto", margin: "0 16px", background: dk ? "hsl(222, 20%, 14%)" : "#fff", borderRadius: 16, padding: "24px", boxShadow: "0 24px 80px rgba(0,0,0,0.3)", fontFamily: "'Outfit', sans-serif", color: dk ? "#e2e8f0" : "#1a1a2e" });
const closeBtn = (dk: boolean): React.CSSProperties => ({ width: 32, height: 32, borderRadius: 8, border: "none", background: dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: dk ? "#94a3b8" : "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" });
const outBtn = (dk: boolean): React.CSSProperties => ({ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1px solid ${dk ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: "transparent", color: dk ? "#e2e8f0" : "#1a1a2e", cursor: "pointer" });
const primBtn = (dis?: boolean): React.CSSProperties => ({ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: dis ? 0.7 : 1 });

/* ════════════════════════════════════════════════════════════════════
   EDIT EVENT DIALOG
   ════════════════════════════════════════════════════════════════════ */

function EditEventDialog({ event, onClose, onSave, isDark }: {
    event: EventEntity; onClose: () => void;
    onSave: (id: string, d: { name: string; description: string; type: string; status: string }) => void;
    isDark: boolean;
}) {
    const [name, setName] = useState(event.name);
    const [description, setDescription] = useState(event.description);
    const [type, setType] = useState(event.type);
    const [status, setStatus] = useState(event.status);
    const [submitting, setSubmitting] = useState(false);

    const handle = () => { setSubmitting(true); setTimeout(() => { onSave(event.id, { name, description, type, status }); setSubmitting(false); }, 800); };

    return (
        <div style={dOverlay()} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={dBackdrop()} />
            <div style={dBox(isDark, 500)} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div><h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Edit Event</h2><p style={{ fontSize: 13, color: isDark ? "#94a3b8" : "#64748b", margin: "4px 0 0" }}>{event.user.name} — {event.id}</p></div>
                    <button onClick={onClose} style={closeBtn(isDark)}><X size={16} /></button>
                </div>
                <div style={{ marginBottom: 16 }}><label style={lS(isDark)}>Event Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} style={iS(isDark)} /></div>
                <div style={{ marginBottom: 16 }}><label style={lS(isDark)}>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} style={{ ...iS(isDark), resize: "vertical" }} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                    <div>
                        <label style={lS(isDark)}>Type</label>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {EVENT_TYPES.map((t) => (<button key={t} type="button" onClick={() => setType(t)} style={{ padding: "5px 10px", borderRadius: 8, fontSize: 10, fontWeight: 600, border: "none", cursor: "pointer", background: type === t ? "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))" : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"), color: type === t ? "#fff" : (isDark ? "#94a3b8" : "#64748b"), transition: "all 0.15s" }}>{t.charAt(0) + t.slice(1).toLowerCase()}</button>))}
                        </div>
                    </div>
                    <div>
                        <label style={lS(isDark)}>Status</label>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {EVENT_STATUSES.map((s) => (<button key={s} type="button" onClick={() => setStatus(s)} style={{ padding: "5px 10px", borderRadius: 8, fontSize: 10, fontWeight: 600, border: "none", cursor: "pointer", background: status === s ? "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))" : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"), color: status === s ? "#fff" : (isDark ? "#94a3b8" : "#64748b"), transition: "all 0.15s", textTransform: "capitalize" }}>{s.replace(/_/g, " ")}</button>))}
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button onClick={onClose} disabled={submitting} style={outBtn(isDark)}>Cancel</button>
                    <button onClick={handle} disabled={submitting} style={primBtn(submitting)}>{submitting && <Loader2 size={14} className="animate-spin" />}Save Changes</button>
                </div>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   DELETE EVENT DIALOG
   ════════════════════════════════════════════════════════════════════ */

function DeleteEventDialog({ event, onClose, onConfirm, isDark }: {
    event: EventEntity; onClose: () => void; onConfirm: () => void; isDark: boolean;
}) {
    return (
        <div style={dOverlay()} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={dBackdrop()} />
            <div style={dBox(isDark, 440)} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}><AlertTriangle size={18} style={{ color: "#ef4444" }} /></div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Delete Event?</h2>
                </div>
                <p style={{ fontSize: 13, color: isDark ? "#94a3b8" : "#64748b", margin: "0 0 20px", lineHeight: 1.6 }}>
                    This will permanently remove <strong style={{ color: isDark ? "#e2e8f0" : "#1a1a2e" }}>"{event.name}"</strong> (ID: <strong style={{ color: isDark ? "#e2e8f0" : "#1a1a2e" }}>{event.id}</strong>). This action cannot be undone.
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button onClick={onClose} style={outBtn(isDark)}>Cancel</button>
                    <button onClick={() => { onConfirm(); onClose(); }} style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", background: "linear-gradient(135deg, #ef4444, #f87171)", color: "#fff", cursor: "pointer" }}>Delete</button>
                </div>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   BULK DELETE DIALOG
   ════════════════════════════════════════════════════════════════════ */

function BulkDeleteDialog({ events, onClose, onConfirm, isDark }: {
    events: EventEntity[]; onClose: () => void; onConfirm: (ids: string[]) => void; isDark: boolean;
}) {
    const [selectedIds, setSelectedIds] = useState<string[]>(events.map((e) => e.id));
    const [submitting, setSubmitting] = useState(false);
    const toggle = (id: string) => setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
    const selectAll = (v: boolean) => setSelectedIds(v ? events.map((e) => e.id) : []);

    const handle = () => {
        if (selectedIds.length === 0) { toast.error("Select at least one event"); return; }
        setSubmitting(true);
        setTimeout(() => { onConfirm(selectedIds); setSubmitting(false); }, 1000);
    };

    return (
        <div style={dOverlay()} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={dBackdrop()} />
            <div style={{ ...dBox(isDark, 520), maxHeight: "85vh" }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div><h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}><AlertTriangle size={20} style={{ color: "#ef4444" }} />Bulk Delete Events</h2><p style={{ fontSize: 13, color: isDark ? "#94a3b8" : "#64748b", margin: "4px 0 0" }}>Select events to permanently remove</p></div>
                    <button onClick={onClose} style={closeBtn(isDark)}><X size={16} /></button>
                </div>
                <div style={{ borderRadius: 12, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, overflow: "hidden", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
                        <Checkbox checked={selectedIds.length === events.length && events.length > 0} onCheckedChange={(v) => selectAll(!!v)} /><span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>Select All</span><span style={{ fontSize: 11, color: isDark ? "#64748b" : "#94a3b8" }}>{selectedIds.length} / {events.length}</span>
                    </div>
                    <div style={{ maxHeight: 260, overflowY: "auto" }}>
                        {events.map((e) => (
                            <div key={e.id} onClick={() => toggle(e.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`, cursor: "pointer", transition: "background 0.15s" }}
                                onMouseOver={(ev) => (ev.currentTarget.style.background = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)")}
                                onMouseOut={(ev) => (ev.currentTarget.style.background = "transparent")}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <Checkbox checked={selectedIds.includes(e.id)} onCheckedChange={() => toggle(e.id)} />
                                    <div><div style={{ fontSize: 13, fontWeight: 600 }}>{e.name}</div><div style={{ fontSize: 11, color: isDark ? "#64748b" : "#94a3b8" }}>{e.id} • {e.type}</div></div>
                                </div>
                                <StatusBadge status={e.status} />
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button onClick={onClose} disabled={submitting} style={outBtn(isDark)}>Cancel</button>
                    <button onClick={handle} disabled={submitting || selectedIds.length === 0} style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", background: selectedIds.length === 0 ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)") : "linear-gradient(135deg, #ef4444, #f87171)", color: selectedIds.length === 0 ? (isDark ? "#475569" : "#94a3b8") : "#fff", cursor: selectedIds.length === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                        {submitting && <Loader2 size={14} className="animate-spin" />}<Trash2 size={14} />Delete ({selectedIds.length})
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   DETAIL PANEL
   ════════════════════════════════════════════════════════════════════ */

function EventDetailPanel({ event, onClose, onEdit, onDelete, theme: t, isDark }: {
    event: EventEntity; onClose: () => void; onEdit: () => void; onDelete: () => void; theme: any; isDark: boolean;
}) {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const copy = (text: string, field: string) => { navigator.clipboard.writeText(text); setCopiedField(field); toast.success("Copied!"); setTimeout(() => setCopiedField(null), 1500); };

    return (
        <div style={{ background: t.cardBg, border: t.cardBorder, borderRadius: 16, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14, fontFamily: "'Outfit', sans-serif", position: "relative", overflow: "hidden", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 180, height: 180, background: `radial-gradient(circle, ${t.glowColor} 0%, transparent 70%)`, pointerEvents: "none" }} />
            <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, width: 28, height: 28, borderRadius: 8, border: "none", background: t.expandBtnBg, color: t.subtitle, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}><X size={14} /></button>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0, boxShadow: `0 2px 12px ${t.glowColor}` }}><Activity size={20} /></div>
                <div style={{ flex: 1 }}><h3 style={{ fontSize: 16, fontWeight: 700, color: t.title, margin: 0, lineHeight: 1.2 }}>{event.name}</h3><p style={{ fontSize: 12, color: t.subtitle, margin: "2px 0 0" }}>{event.description}</p></div>
            </div>

            <div style={{ display: "flex", gap: 6 }}><TypeBadge type={event.type} isDark={isDark} /><StatusBadge status={event.status} /></div>

            <div style={{ background: t.expandBtnBg, borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{event.user.name[0]}</div>
                    <div><div style={{ fontSize: 13, fontWeight: 600, color: t.title }}>{event.user.name}</div><div style={{ fontSize: 11, color: t.subtitle }}>{event.user.email} • {event.user.role}</div></div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                    { label: "Event ID", value: event.id },
                    { label: "Type", value: event.type },
                    { label: "Created", value: new Date(event.created_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
                    { label: "Updated", value: new Date(event.updated_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
                ].map((s) => (<div key={s.label}><div style={{ fontSize: 10, color: t.subtitle, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>{s.label}</div><div style={{ fontSize: 13, fontWeight: 600, color: t.title, wordBreak: "break-all" }}>{s.value}</div></div>))}
            </div>

            <div style={{ width: "100%", height: 1, background: t.divider }} />
            <div>
                <div style={{ fontSize: 10, color: t.subtitle, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Quick Copy</div>
                {[{ l: "Event ID", v: event.id, f: "id" }, { l: "User Email", v: event.user.email, f: "email" }].map(({ l, v, f }) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: t.subtitle }}>{l}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ color: t.title, fontWeight: 600, fontFamily: "monospace", fontSize: 11 }}>{v}</span><button type="button" onClick={() => copy(v, f)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>{copiedField === f ? <Check size={11} style={{ color: "#22c55e" }} /> : <Copy size={11} style={{ color: t.subtitle }} />}</button></div>
                    </div>
                ))}
            </div>

            <div style={{ width: "100%", height: 1, background: t.divider }} />
            <div style={{ display: "flex", gap: 8 }}>
                <button onClick={onEdit} style={{ flex: 1, padding: "8px 0", borderRadius: 10, fontSize: 12, fontWeight: 600, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: "transparent", color: isDark ? "#e2e8f0" : "#1a1a2e", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Pencil size={12} /> Edit</button>
                <button onClick={onDelete} style={{ flex: 1, padding: "8px 0", borderRadius: 10, fontSize: 12, fontWeight: 600, border: "1px solid rgba(239,68,68,0.2)", background: isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.05)", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Trash2 size={12} /> Delete</button>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   MASCOT LOADER
   ════════════════════════════════════════════════════════════════════ */

function LoadMoreMascot({ text, subColor }: { text: string; subColor: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "28px 16px" }}>
            <svg width={72} height={72} viewBox="0 0 100 100" style={{ filter: "drop-shadow(0 0 20px rgba(167,139,250,0.4))" }}>
                <defs><radialGradient id="actLG" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" /><stop offset="40%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#0f172a" /></radialGradient></defs>
                <circle cx="50" cy="50" r="40" stroke="#a78bfa" strokeWidth="1" fill="none" opacity="0.4"><animate attributeName="r" values="35;45;35" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" /></circle>
                <circle cx="50" cy="50" r="28" fill="url(#actLG)"><animate attributeName="r" values="26;30;26" dur="2.2s" repeatCount="indefinite" /></circle>
                <circle cx="50" cy="50" r="34" stroke="rgba(255,255,255,0.3)" strokeDasharray="4 6" strokeWidth="1" fill="none"><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="6s" repeatCount="indefinite" /></circle>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 500, color: subColor, letterSpacing: "0.04em" }}>{text}</span>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN SCREEN
   ════════════════════════════════════════════════════════════════════ */

const UserActivityScreen = () => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateRange, setDateRange] = useState("all");
    const [cardsExpanded, setCardsExpanded] = useState(false);
    const [events, setEvents] = useState<EventEntity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [editEvent, setEditEvent] = useState<EventEntity | null>(null);
    const [deleteEvent, setDeleteEvent] = useState<EventEntity | null>(null);
    const [detailEvent, setDetailEvent] = useState<EventEntity | null>(null);
    const [showBulkDelete, setShowBulkDelete] = useState(false);

    const perPage = 20;
    const [visibleCount, setVisibleCount] = useState(perPage);
    const [loadingMore, setLoadingMore] = useState(false);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const loadLockRef = useRef(false);
    const sortedLenRef = useRef(0);
    const visibleRef = useRef(perPage);

    useEffect(() => { const t = setTimeout(() => { setEvents(DUMMY_EVENTS); setIsLoading(false); }, 1500); return () => clearTimeout(t); }, []);

    const filteredData = useMemo(() => {
        let data = events;
        if (typeFilter !== "all") data = data.filter((e) => e.type === typeFilter);
        if (statusFilter !== "all") data = data.filter((e) => e.status === statusFilter);
        if (dateRange !== "all") {
            const now = new Date(); let cutoff = new Date();
            if (dateRange === "24h") cutoff.setHours(now.getHours() - 24);
            if (dateRange === "7d") cutoff.setDate(now.getDate() - 7);
            if (dateRange === "30d") cutoff.setDate(now.getDate() - 30);
            data = data.filter((e) => new Date(e.created_at) >= cutoff);
        }
        return data;
    }, [events, typeFilter, statusFilter, dateRange]);

    const meta = useMemo(() => {
        const total = events.length;
        const completed = events.filter((e) => e.status === "completed").length;
        const failed = events.filter((e) => e.status === "failed").length;
        const pending = events.filter((e) => e.status === "pending").length;
        const uniqueUsers = new Set(events.map((e) => e.user.id)).size;
        const typeCounts: Record<string, number> = {};
        events.forEach((e) => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1; });
        const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
        const todayCount = events.filter((e) => { const d = new Date(e.created_at); const now = new Date(); return d.toDateString() === now.toDateString(); }).length;
        return { total, completed, failed, pending, uniqueUsers, topType, todayCount };
    }, [events]);

    const t = useMemo(() => {
        if (isDark) return { cardBg: "linear-gradient(135deg, rgba(26, 34, 44, 0.9), rgba(35, 45, 56, 0.85))", cardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.12)", glowColor: "rgba(var(--preset-primary-rgb), 0.08)", title: "hsl(var(--foreground))", subtitle: "hsl(var(--muted-foreground))", subtitleAccent: "var(--preset-lighter)", headerText: "hsl(var(--muted-foreground))", cellText: "hsl(var(--muted-foreground))", cellBold: "hsl(var(--foreground))", divider: "rgba(var(--preset-primary-rgb), 0.08)", inputBg: "rgba(var(--preset-primary-rgb), 0.06)", expandBtnBg: "rgba(var(--preset-primary-rgb), 0.06)", pillBg: "rgba(var(--preset-primary-rgb), 0.12)", pillActive: "rgba(var(--preset-primary-rgb), 0.6)", pillText: "var(--preset-lighter)", pillActiveText: "#fff" };
        return { cardBg: "linear-gradient(135deg, rgba(250, 247, 255, 0.95), rgba(243, 237, 255, 0.85))", cardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.1)", glowColor: "rgba(var(--preset-primary-rgb), 0.05)", title: "hsl(var(--foreground))", subtitle: "hsl(var(--muted-foreground))", subtitleAccent: "var(--preset-primary)", headerText: "hsl(var(--muted-foreground))", cellText: "hsl(var(--muted-foreground))", cellBold: "hsl(var(--foreground))", divider: "rgba(var(--preset-primary-rgb), 0.08)", inputBg: "rgba(var(--preset-primary-rgb), 0.04)", expandBtnBg: "rgba(var(--preset-primary-rgb), 0.04)", pillBg: "rgba(var(--preset-primary-rgb), 0.08)", pillActive: "rgba(var(--preset-primary-rgb), 0.85)", pillText: "var(--preset-primary)", pillActiveText: "#fff" };
    }, [isDark]);

    const columns: ColumnDef<EventEntity>[] = useMemo(() => [
        { id: "select", header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} />, cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} />, enableSorting: false, enableHiding: false },
        {
            accessorKey: "name",
            header: ({ column }) => <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.5px", padding: 0 }}>Event <ArrowUpDown size={12} /></button>,
            cell: ({ row }) => {
                const e = row.original;
                return (
                    <div style={{ cursor: "pointer" }} onClick={() => setDetailEvent(e)}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: t.cellBold }}>{e.name}</div>
                        <div style={{ fontSize: 11, color: t.cellText, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.description}</div>
                    </div>
                );
            },
            filterFn: (row, _col, val) => `${row.original.name} ${row.original.description} ${row.original.user.name} ${row.original.user.email}`.toLowerCase().includes((val as string).toLowerCase()),
        },
        { accessorKey: "type", header: "Type", cell: ({ row }) => <TypeBadge type={row.original.type} isDark={isDark} /> },
        { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
        {
            accessorKey: "user",
            header: "User",
            cell: ({ row }) => {
                const u = row.original.user;
                return (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{u.name[0]}</div>
                        <div><div style={{ fontSize: 12, fontWeight: 600, color: t.cellBold }}>{u.name}</div><div style={{ fontSize: 10, color: t.cellText }}>{u.role}</div></div>
                    </div>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.5px", padding: 0 }}>Date <ArrowUpDown size={12} /></button>,
            cell: ({ row }) => {
                const d = new Date(row.original.created_at);
                return (<div><div style={{ fontSize: 12, color: t.cellBold }}>{d.toLocaleDateString("en-MY", { day: "numeric", month: "short" })}</div><div style={{ fontSize: 10, color: t.cellText }}>{d.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}</div></div>);
            },
        },
        {
            id: "actions", enableHiding: false,
            cell: ({ row }) => {
                const e = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><button style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: t.expandBtnBg, color: t.subtitle, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><MoreHorizontal size={14} /></button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setDetailEvent(e)}><Eye size={14} className="mr-2" /> View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditEvent(e)}><Pencil size={14} className="mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setDeleteEvent(e)} className="text-red-500 focus:text-red-500"><Trash2 size={14} className="mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ], [t, isDark]);

    const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const table = useReactTable({ data: filteredData, columns, onSortingChange: setSorting, onColumnFiltersChange: setColumnFilters, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(), onColumnVisibilityChange: setColumnVisibility, onRowSelectionChange: setRowSelection, state: { sorting, columnFilters, columnVisibility, rowSelection } });

    const sortedRows = table.getSortedRowModel().rows;
    sortedLenRef.current = sortedRows.length; visibleRef.current = visibleCount;
    const visibleRows = sortedRows.slice(0, visibleCount);
    const hasMore = visibleCount < sortedRows.length;

    const handleLoadMore = useCallback(() => { if (loadLockRef.current || visibleRef.current >= sortedLenRef.current) return; loadLockRef.current = true; setLoadingMore(true); window.setTimeout(() => { setVisibleCount((p) => Math.min(p + perPage, sortedLenRef.current)); setLoadingMore(false); loadLockRef.current = false; }, 650); }, [perPage]);
    useEffect(() => { setVisibleCount(perPage); visibleRef.current = perPage; }, [filteredData, typeFilter, statusFilter, dateRange, columnFilters, perPage]);
    useEffect(() => { if (isLoading) return; const el = sentinelRef.current; if (!el || loadingMore || !hasMore) return; const obs = new IntersectionObserver((entries) => { if (entries[0]?.isIntersecting && !loadLockRef.current) handleLoadMore(); }, { root: null, rootMargin: "200px", threshold: 0 }); obs.observe(el); return () => obs.disconnect(); }, [hasMore, loadingMore, handleLoadMore, isLoading, sortedRows.length, visibleCount]);

    const handleEditSave = (id: string, d: { name: string; description: string; type: string; status: string }) => {
        setEvents((p) => p.map((e) => e.id === id ? { ...e, ...d, updated_at: new Date().toISOString() } : e));
        toast.success("Event updated!"); setEditEvent(null);
        if (detailEvent?.id === id) setDetailEvent((p) => p ? { ...p, ...d, updated_at: new Date().toISOString() } : null);
    };
    const handleBulkDelete = (ids: string[]) => { setEvents((p) => p.filter((e) => !ids.includes(e.id))); toast.success(`${ids.length} events deleted!`); setShowBulkDelete(false); };

    const SmallPill = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (<button type="button" onClick={onClick} style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", transition: "all 0.15s ease", color: active ? t.pillActiveText : t.pillText, background: active ? t.pillActive : "transparent", boxShadow: active ? "0 1px 4px rgba(var(--preset-primary-rgb), 0.25)" : "none" }}>{label}</button>);

    const selectTriggerClass = cn(
        "h-[38px] w-full min-w-[168px] sm:w-[200px] rounded-xl border px-3 font-semibold text-sm shadow-sm transition-all",
        "hover:border-[rgba(var(--preset-primary-rgb),0.35)] focus:ring-2 focus:ring-[rgba(var(--preset-primary-rgb),0.22)] focus:ring-offset-0 focus:ring-offset-transparent",
        isDark
            ? "border-white/10 bg-white/[0.06] data-[placeholder]:text-muted-foreground"
            : "border-black/[0.08] bg-black/[0.03] data-[placeholder]:text-muted-foreground"
    );

    const statusDot = STATUS_FILTER_META.find((x) => x.value === statusFilter)?.dot ?? STATUS_FILTER_META[0].dot;
    const typeDot = TYPE_FILTER_META.find((x) => x.value === typeFilter)?.dot ?? TYPE_FILTER_META[0].dot;
    const ActionBtn = ({ onClick, icon, label, primary, danger }: { onClick: () => void; icon: React.ReactNode; label: string; primary?: boolean; danger?: boolean }) => (<button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 10, cursor: "pointer", transition: "all 0.15s ease", ...(primary ? { border: "none", color: "#fff", background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))", boxShadow: "0 2px 8px rgba(var(--preset-primary-rgb), 0.3)" } : danger ? { border: "none", color: "#fff", background: "linear-gradient(135deg, #ef4444, #f87171)" } : { border: t.cardBorder, color: t.subtitle, background: t.expandBtnBg }) }}>{icon}{label}</button>);

    return (
        <div className="flex flex-col gap-4 w-full" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <style>{`@keyframes shimmer-badge{0%{background-position:-200% 0}100%{background-position:200% 0}}@keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}`}</style>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3">
                <div>
                    <h2 style={{ fontSize: 26, fontWeight: 700, color: t.title, margin: 0, letterSpacing: "-0.5px", lineHeight: 1.2 }}>User Activity</h2>
                    <p style={{ fontSize: 13, color: t.subtitle, margin: "4px 0 0" }}>Track and manage all events, actions, and system activity</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <ActionBtn onClick={() => setShowBulkDelete(true)} icon={<Trash2 size={14} />} label="Bulk Delete" danger />
                    <ActionBtn onClick={() => toast.success("Exporting...")} icon={<Download size={14} />} label="Export" />
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, width: "100%" }} className="overview-platform-grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4">
                <OverviewDataCard customTitle="Total Events"     variant="stat" customIcon={<Activity size={22} strokeWidth={2} />} metricSubtitle="All tracked events" primaryValueDisplay={String(meta.total)} expandLabel1="Today" expandValue1Display={String(meta.todayCount)} expandLabel2="Unique Users" expandValue2Display={String(meta.uniqueUsers)} isLoading={isLoading} expanded={cardsExpanded} onExpandToggle={() => setCardsExpanded((e) => !e)} />
                <OverviewDataCard customTitle="Completed"     variant="stat" customIcon={<CheckCircle2 size={22} strokeWidth={2} />} metricSubtitle="Successfully completed" primaryValueDisplay={String(meta.completed)} expandLabel1="Success Rate" expandValue1Display={meta.total > 0 ? `${((meta.completed / meta.total) * 100).toFixed(0)}%` : "—"} expandLabel2="Pending" expandValue2Display={String(meta.pending)} isLoading={isLoading} expanded={cardsExpanded} onExpandToggle={() => setCardsExpanded((e) => !e)} />
                <OverviewDataCard customTitle="Failed"     variant="stat" customIcon={<AlertTriangle size={22} strokeWidth={2} />} metricSubtitle="Errors & failures" primaryValueDisplay={String(meta.failed)} expandLabel1="Failure Rate" expandValue1Display={meta.total > 0 ? `${((meta.failed / meta.total) * 100).toFixed(0)}%` : "—"} expandLabel2="In Progress" expandValue2Display={String(events.filter((e) => e.status === "in_progress").length)} isLoading={isLoading} expanded={cardsExpanded} onExpandToggle={() => setCardsExpanded((e) => !e)} />
                <OverviewDataCard customTitle="Active Users"     variant="stat" customIcon={<Users size={22} strokeWidth={2} />} metricSubtitle="Unique users with activity" primaryValueDisplay={String(meta.uniqueUsers)} expandLabel1="Top Type" expandValue1Display={meta.topType ? meta.topType[0] : "—"} expandLabel2="Count" expandValue2Display={meta.topType ? String(meta.topType[1]) : "—"} isLoading={isLoading} expanded={cardsExpanded} onExpandToggle={() => setCardsExpanded((e) => !e)} />
            </div>

            <div style={{ background: t.cardBg, borderRadius: 20, border: t.cardBorder, padding: "22px 26px", display: "flex", flexDirection: "column", gap: 16, position: "relative", overflow: "hidden", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
                <div style={{ position: "absolute", top: -60, right: -60, width: 180, height: 180, background: `radial-gradient(circle, ${t.glowColor} 0%, transparent 70%)`, pointerEvents: "none" }} />
                {isLoading && (<div style={{ position: "absolute", inset: 0, background: isDark ? "rgba(26, 34, 44, 0.78)" : "rgba(250, 247, 255, 0.72)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 20 }}><MediumLoader label="Loading activity" className="!py-4" /></div>)}

                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div><h2 style={{ fontSize: 18, fontWeight: 700, color: t.title, margin: 0 }}>Activity Log</h2><p style={{ fontSize: 12, color: t.subtitle, margin: "4px 0 0" }}>{filteredData.length} events</p></div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: t.subtitle }}>Status</span>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className={selectTriggerClass} style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                        <span className="h-2 w-2 shrink-0 rounded-full ring-2 ring-black/5 dark:ring-white/15" style={{ background: statusDot, boxShadow: `0 0 10px ${statusDot}55` }} aria-hidden />
                                        <SelectValue placeholder="All" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent align="start" className="w-[var(--radix-select-trigger-width)] min-w-[220px] rounded-xl border p-1.5 shadow-xl" position="popper" sideOffset={6}>
                                    {STATUS_FILTER_META.map((opt) => (
                                        <SelectItem
                                            key={opt.value || "all"}
                                            value={opt.value}
                                            className="cursor-pointer rounded-lg py-2.5 pl-3 pr-8 text-[13px] font-medium focus:bg-[rgba(var(--preset-primary-rgb),0.1)]"
                                        >
                                            <span className="flex items-center gap-2.5">
                                                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: opt.dot, boxShadow: `0 0 8px ${opt.dot}66` }} />
                                                {opt.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: t.subtitle }}>Type</span>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className={selectTriggerClass} style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                        <span className="h-2 w-2 shrink-0 rounded-full ring-2 ring-black/5 dark:ring-white/15" style={{ background: typeDot, boxShadow: `0 0 10px ${typeDot}55` }} aria-hidden />
                                        <SelectValue placeholder="All Types" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent align="start" className="w-[var(--radix-select-trigger-width)] min-w-[220px] max-h-[min(320px,70vh)] rounded-xl border p-1.5 shadow-xl overflow-y-auto" position="popper" sideOffset={6}>
                                    {TYPE_FILTER_META.map((opt) => (
                                        <SelectItem
                                            key={opt.value || "all-types"}
                                            value={opt.value}
                                            className="cursor-pointer rounded-lg py-2.5 pl-3 pr-8 text-[13px] font-medium focus:bg-[rgba(var(--preset-primary-rgb),0.1)]"
                                        >
                                            <span className="flex items-center gap-2.5">
                                                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: opt.dot, boxShadow: `0 0 8px ${opt.dot}66` }} />
                                                {opt.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div style={{ background: t.pillBg, borderRadius: 10, padding: 3, display: "flex", gap: 2 }}>
                            {[{ v: "all", l: "All Time" }, { v: "24h", l: "24H" }, { v: "7d", l: "7D" }, { v: "30d", l: "30D" }].map((d) => <SmallPill key={d.v} active={dateRange === d.v} onClick={() => setDateRange(d.v)} label={d.l} />)}
                        </div>
                        <DropdownMenu><DropdownMenuTrigger asChild><button type="button" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, border: t.cardBorder, cursor: "pointer", color: t.subtitle, background: t.expandBtnBg }}><SlidersHorizontal size={14} /></button></DropdownMenuTrigger><DropdownMenuContent align="end">{table.getAllColumns().filter((col) => col.getCanHide()).map((col) => (<DropdownMenuCheckboxItem key={col.id} className="capitalize" checked={col.getIsVisible()} onCheckedChange={(v) => col.toggleVisibility(!!v)}>{col.id.replace(/_/g, " ")}</DropdownMenuCheckboxItem>))}</DropdownMenuContent></DropdownMenu>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, background: t.inputBg, border: t.cardBorder, borderRadius: 12, padding: "0 14px" }}>
                    <Search size={15} style={{ color: t.subtitle, flexShrink: 0 }} />
                    <input type="text" placeholder="Search events, users, descriptions..." value={(table.getColumn("name")?.getFilterValue() as string) ?? ""} onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)} style={{ flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 500, background: "transparent", border: "none", outline: "none", color: t.title, fontFamily: "'Outfit', sans-serif" }} />
                </div>

                <div style={{ display: "flex", gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ borderRadius: 14, border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)", background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)", overflow: "hidden" }}>
                            <div style={{ padding: "13px 17px", borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ fontSize: 13, fontWeight: 800, color: t.title }}>All Events ({filteredData.length})</div>
                                <div style={{ fontSize: 10, color: t.subtitle }}>Click any row for details</div>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                    <thead>{table.getHeaderGroups().map((hg) => (<tr key={hg.id} style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)" }}><th style={{ padding: "9px 11px", textAlign: "left", fontSize: 10, fontWeight: 800, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 36 }}>#</th>{hg.headers.map((h) => <th key={h.id} style={{ textAlign: "left", padding: "9px 11px", fontSize: 10, fontWeight: 800, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>))}</thead>
                                    <tbody>
                                        {visibleRows.length ? visibleRows.map((row, idx) => (
                                            <tr key={row.id} style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)", cursor: "pointer", transition: "background 0.15s ease" }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? "rgba(var(--preset-primary-rgb), 0.04)" : "rgba(var(--preset-primary-rgb), 0.06)"; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                                                <td style={{ padding: "10px 11px", fontSize: 11, fontWeight: 700, color: t.subtitle }}>{idx + 1}</td>
                                                {row.getVisibleCells().map((cell) => <td key={cell.id} style={{ padding: "10px 11px", fontSize: 12, whiteSpace: "nowrap" }}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
                                            </tr>
                                        )) : (<tr><td colSpan={columns.length + 1} style={{ padding: "40px 0", textAlign: "center", color: t.subtitle, fontSize: 14 }}>No events found.</td></tr>)}
                                    </tbody>
                                </table>
                            </div>
                            {(hasMore || loadingMore) && sortedRows.length > perPage && (
                                <div ref={sentinelRef} aria-hidden style={{ minHeight: loadingMore ? 8 : 24, borderTop: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {loadingMore && <LoadMoreMascot text="Fetching activity" subColor={isDark ? "rgba(255,255,255,0.6)" : "rgba(71,85,105,0.85)"} />}
                                </div>
                            )}
                        </div>
                    </div>

                    {detailEvent && (
                        <div className="hidden lg:block" style={{ width: 320, flexShrink: 0, animation: "slideIn 0.2s ease-out" }}>
                            <EventDetailPanel event={detailEvent} onClose={() => setDetailEvent(null)} onEdit={() => setEditEvent(detailEvent)} onDelete={() => setDeleteEvent(detailEvent)} theme={t} isDark={isDark} />
                        </div>
                    )}
                </div>

                {Object.keys(rowSelection).length > 0 && (<div style={{ fontSize: 12, color: t.subtitle, paddingTop: 4 }}>{Object.keys(rowSelection).length} selected</div>)}
            </div>

            {detailEvent && (<div className="lg:hidden"><div style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setDetailEvent(null)}><div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} /><div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420, margin: "0 16px", maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}><EventDetailPanel event={detailEvent} onClose={() => setDetailEvent(null)} onEdit={() => setEditEvent(detailEvent)} onDelete={() => setDeleteEvent(detailEvent)} theme={t} isDark={isDark} /></div></div></div>)}

            {editEvent && <EditEventDialog event={editEvent} onClose={() => setEditEvent(null)} onSave={handleEditSave} isDark={isDark} />}
            {deleteEvent && <DeleteEventDialog event={deleteEvent} onClose={() => setDeleteEvent(null)} onConfirm={() => { setEvents((p) => p.filter((e) => e.id !== deleteEvent.id)); if (detailEvent?.id === deleteEvent.id) setDetailEvent(null); toast.success("Event deleted"); }} isDark={isDark} />}
            {showBulkDelete && <BulkDeleteDialog events={events} onClose={() => setShowBulkDelete(false)} onConfirm={handleBulkDelete} isDark={isDark} />}
        </div>
    );
};

export default UserActivityScreen;