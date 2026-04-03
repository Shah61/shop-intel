"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart as RePieChart, Pie, Cell, ComposedChart,
} from "recharts";
import {
  MessageCircle, AlertTriangle, Package, Clock, CheckCircle, TrendingUp, TrendingDown,
  RefreshCw, Filter, ChevronDown, ChevronUp, Calendar as CalendarIcon, Search, X,
  Eye, Zap, BarChart3, Globe, ArrowUp, ArrowDown, Activity, Sparkles, Shield,
  AlertCircle, Layers, ArrowRight, Hash, Flame, Target, DollarSign, Award,
  ThumbsUp, ThumbsDown, Send, Bot, User, Inbox, XCircle, RotateCcw, Truck,
  PackageX, PackageCheck, HelpCircle, Flag, Bell, ExternalLink, Minus, Plus,
  Layout, PieChart, ChevronRight, Star, Heart, Copy, Percent,
} from "lucide-react";
import { format, parseISO, differenceInDays, differenceInHours, differenceInMinutes, subDays } from "date-fns";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type CategoryType =
  | "BARANG_ROSAK"
  | "BARANG_LAMBAT"
  | "BARANG_DEFECT"
  | "BARANG_SALAH"
  | "REFUND_REQUEST"
  | "BILLING_ISSUE"
  | "GENERAL_INQUIRY"
  | "OTHER";

type PriorityType = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type StatusType = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "ESCALATED" | "CLOSED";
type SentimentType = "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "ANGRY";
type MainTab = "overview" | "tickets" | "analytics" | "insights";
type ChartMode = "area" | "line" | "bar";

interface CustomerTicket {
  id: string;
  customer_name: string;
  customer_message: string;
  ai_category: CategoryType;
  ai_confidence: number;
  ai_sentiment: SentimentType;
  ai_summary: string;
  ai_suggested_response: string;
  priority: PriorityType;
  status: StatusType;
  platform: string;
  assigned_to?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  tags: string[];
}

interface CategoryStats {
  category: CategoryType;
  count: number;
  percentage: number;
  trend: number; // +/- vs last period
  avgResolutionTime: number; // in hours
  satisfaction: number; // 0-100
}

interface DashboardAnalytics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  escalatedTickets: number;
  avgResolutionTime: number;
  avgSatisfaction: number;
  aiAccuracy: number;
  categoryBreakdown: CategoryStats[];
  trendData: { date: string; tickets: number; resolved: number }[];
  sentimentBreakdown: { sentiment: SentimentType; count: number }[];
  peakHours: { hour: string; count: number }[];
  topIssueKeywords: { word: string; count: number }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<CategoryType, { label: string; labelMy: string; icon: React.ReactNode; color: string; description: string }> = {
  BARANG_ROSAK: { label: "Damaged Item", labelMy: "Barang Rosak", icon: <PackageX style={{ width: 14, height: 14 }} />, color: "#ef4444", description: "Item received damaged or broken" },
  BARANG_LAMBAT: { label: "Late Delivery", labelMy: "Barang Lambat", icon: <Clock style={{ width: 14, height: 14 }} />, color: "#f59e0b", description: "Delivery delayed or not received" },
  BARANG_DEFECT: { label: "Defective Item", labelMy: "Barang Defect", icon: <AlertTriangle style={{ width: 14, height: 14 }} />, color: "#ec4899", description: "Item has manufacturing defect" },
  BARANG_SALAH: { label: "Wrong Item", labelMy: "Barang Salah", icon: <RotateCcw style={{ width: 14, height: 14 }} />, color: "#8b5cf6", description: "Received wrong or different item" },
  REFUND_REQUEST: { label: "Refund Request", labelMy: "Minta Refund", icon: <DollarSign style={{ width: 14, height: 14 }} />, color: "#06b6d4", description: "Customer requesting money back" },
  BILLING_ISSUE: { label: "Billing Issue", labelMy: "Masalah Bayaran", icon: <AlertCircle style={{ width: 14, height: 14 }} />, color: "#6366f1", description: "Payment or billing related issues" },
  GENERAL_INQUIRY: { label: "General Inquiry", labelMy: "Pertanyaan Umum", icon: <HelpCircle style={{ width: 14, height: 14 }} />, color: "#10b981", description: "General questions & info requests" },
  OTHER: { label: "Other", labelMy: "Lain-lain", icon: <Layers style={{ width: 14, height: 14 }} />, color: "#64748b", description: "Uncategorized issues" },
};

const PRIORITY_CONFIG: Record<PriorityType, { label: string; color: string; icon: React.ReactNode }> = {
  CRITICAL: { label: "Critical", color: "#ef4444", icon: <Flame style={{ width: 10, height: 10 }} /> },
  HIGH: { label: "High", color: "#f59e0b", icon: <ArrowUp style={{ width: 10, height: 10 }} /> },
  MEDIUM: { label: "Medium", color: "#6366f1", icon: <Minus style={{ width: 10, height: 10 }} /> },
  LOW: { label: "Low", color: "#10b981", icon: <ArrowDown style={{ width: 10, height: 10 }} /> },
};

const STATUS_CONFIG: Record<StatusType, { label: string; color: string; icon: React.ReactNode }> = {
  OPEN: { label: "Open", color: "#f59e0b", icon: <Inbox style={{ width: 10, height: 10 }} /> },
  IN_PROGRESS: { label: "In Progress", color: "#6366f1", icon: <Activity style={{ width: 10, height: 10 }} /> },
  RESOLVED: { label: "Resolved", color: "#10b981", icon: <CheckCircle style={{ width: 10, height: 10 }} /> },
  ESCALATED: { label: "Escalated", color: "#ef4444", icon: <Flag style={{ width: 10, height: 10 }} /> },
  CLOSED: { label: "Closed", color: "rgba(255,255,255,.3)", icon: <XCircle style={{ width: 10, height: 10 }} /> },
};

const SENTIMENT_CONFIG: Record<SentimentType, { label: string; color: string; emoji: string }> = {
  POSITIVE: { label: "Positive", color: "#10b981", emoji: "😊" },
  NEUTRAL: { label: "Neutral", color: "#6366f1", emoji: "😐" },
  NEGATIVE: { label: "Negative", color: "#f59e0b", emoji: "😟" },
  ANGRY: { label: "Angry", color: "#ef4444", emoji: "😡" },
};

const COLORS = ["#8b5cf6", "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#ef4444", "#64748b"];

const fmt = (n: number) => {
  if (!n || isNaN(n)) return "0";
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
};

const fmtTime = (hours: number) => {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
};

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA GENERATOR (replace with real hooks)
// ─────────────────────────────────────────────────────────────────────────────
const generateMockData = (): { tickets: CustomerTicket[]; analytics: DashboardAnalytics } => {
  const categories: CategoryType[] = ["BARANG_ROSAK", "BARANG_LAMBAT", "BARANG_DEFECT", "BARANG_SALAH", "REFUND_REQUEST", "BILLING_ISSUE", "GENERAL_INQUIRY", "OTHER"];
  const priorities: PriorityType[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const statuses: StatusType[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "ESCALATED", "CLOSED"];
  const sentiments: SentimentType[] = ["POSITIVE", "NEUTRAL", "NEGATIVE", "ANGRY"];
  const platforms = ["WhatsApp", "Website Chat", "Instagram DM", "Facebook Messenger", "Email"];
  const names = ["Ahmad", "Siti", "Muhammad", "Nurul", "Amir", "Farah", "Hafiz", "Aina", "Rizal", "Syafiqah", "Danish", "Liyana", "Irfan", "Nadia", "Zul", "Amira", "Haziq", "Balqis", "Firdaus", "Zahra"];

  const messages: Record<CategoryType, string[]> = {
    BARANG_ROSAK: ["Barang saya rosak teruk masa sampai, packaging pun kemek", "Produk pecah dalam kotak, sangat kecewa", "Screen phone crack bila buka box", "Barang rosak, ada kesan calar besar", "Item patah dua bila sampai rumah"],
    BARANG_LAMBAT: ["Dah 2 minggu tak sampai lagi barang saya", "Order 10 hari lepas masih pending shipment", "Tracking tak update dah 5 hari, barang mana?", "Lambat sangat delivery, janji 3 hari dah seminggu", "Barang tak sampai-sampai, bila nak deliver?"],
    BARANG_DEFECT: ["Barang macam ada defect, button tak function", "Zip rosak, macam defect dari kilang", "Color lain dari gambar, defect ke?", "Ada scratch siap-siap kat product, manufacturing defect", "Speaker bunyi crackling, defective unit"],
    BARANG_SALAH: ["Saya order size M tapi dapat size XL", "Salah hantar barang, saya order hitam dapat putih", "Item lain dari apa saya order", "Wrong item received, totally different product", "Color salah, order blue dapat red"],
    REFUND_REQUEST: ["Saya nak refund, barang tak memuaskan", "Please process refund saya ASAP", "Nak claim balik duit, product tak macam description", "Refund please, dah 3x complaint tak settle", "Minta refund full amount"],
    BILLING_ISSUE: ["Kena charge 2 kali untuk satu order", "Payment deducted but order not confirmed", "Promo code tak apply, kena charge full price", "Overcharged RM50 dari harga display", "Double payment issue, tolong check"],
    GENERAL_INQUIRY: ["Ada restock untuk item ni tak?", "Boleh tanya pasal warranty coverage?", "Nak tahu sizing chart untuk baju ni", "Ada branch dekat KL tak?", "Shipping ke Sabah berapa hari?"],
    OTHER: ["Macam mana nak tukar delivery address?", "App crash bila nak checkout", "Nak update phone number dalam account", "Voucher saya hilang dari wallet", "Tak boleh login akaun saya"],
  };

  const tickets: CustomerTicket[] = Array.from({ length: 48 }, (_, i) => {
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const priority = cat === "BARANG_ROSAK" || cat === "REFUND_REQUEST" ? (Math.random() > 0.5 ? "HIGH" : "CRITICAL") : priorities[Math.floor(Math.random() * priorities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const sentiment = cat === "BARANG_ROSAK" || cat === "REFUND_REQUEST" ? (Math.random() > 0.4 ? "ANGRY" : "NEGATIVE") : sentiments[Math.floor(Math.random() * sentiments.length)];
    const msg = messages[cat][Math.floor(Math.random() * messages[cat].length)];
    const createdAt = new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000);
    const resolved = status === "RESOLVED" || status === "CLOSED";

    return {
      id: `TKT-${String(1000 + i).slice(1)}`,
      customer_name: names[Math.floor(Math.random() * names.length)],
      customer_message: msg,
      ai_category: cat,
      ai_confidence: 0.75 + Math.random() * 0.24,
      ai_sentiment: sentiment,
      ai_summary: `Customer reports ${CATEGORY_CONFIG[cat].description.toLowerCase()}`,
      ai_suggested_response: `Terima kasih kerana menghubungi kami. Kami faham situasi ${CATEGORY_CONFIG[cat].labelMy.toLowerCase()} dan akan selesaikan secepat mungkin.`,
      priority,
      status,
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      assigned_to: Math.random() > 0.3 ? ["Aiman", "Dina", "Farhan", "Rina", "Syahir"][Math.floor(Math.random() * 5)] : undefined,
      created_at: createdAt.toISOString(),
      updated_at: new Date(createdAt.getTime() + Math.random() * 48 * 60 * 60 * 1000).toISOString(),
      resolved_at: resolved ? new Date(createdAt.getTime() + (2 + Math.random() * 46) * 60 * 60 * 1000).toISOString() : undefined,
      tags: [CATEGORY_CONFIG[cat].labelMy, ...(priority === "CRITICAL" ? ["Urgent"] : [])],
    };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalTickets = tickets.length;
  const categoryBreakdown: CategoryStats[] = categories.map(cat => {
    const catTickets = tickets.filter(t => t.ai_category === cat);
    const resolved = catTickets.filter(t => t.resolved_at);
    const avgRes = resolved.length > 0 ? resolved.reduce((s, t) => s + differenceInHours(new Date(t.resolved_at!), new Date(t.created_at)), 0) / resolved.length : 0;
    return {
      category: cat,
      count: catTickets.length,
      percentage: totalTickets > 0 ? (catTickets.length / totalTickets) * 100 : 0,
      trend: Math.round((Math.random() - 0.4) * 30),
      avgResolutionTime: avgRes,
      satisfaction: 55 + Math.floor(Math.random() * 40),
    };
  }).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

  const trendData = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    const dayTickets = tickets.filter(t => format(new Date(t.created_at), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"));
    return { date: format(date, "MMM dd"), tickets: dayTickets.length, resolved: dayTickets.filter(t => t.resolved_at).length };
  });

  const sentimentBreakdown = sentiments.map(s => ({ sentiment: s, count: tickets.filter(t => t.ai_sentiment === s).length })).filter(s => s.count > 0);

  const peakHours = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h.toString().padStart(2, "0")}:00`,
    count: tickets.filter(t => new Date(t.created_at).getHours() === h).length,
  }));

  const analytics: DashboardAnalytics = {
    totalTickets,
    openTickets: tickets.filter(t => t.status === "OPEN").length,
    resolvedTickets: tickets.filter(t => t.status === "RESOLVED" || t.status === "CLOSED").length,
    escalatedTickets: tickets.filter(t => t.status === "ESCALATED").length,
    avgResolutionTime: 8.5,
    avgSatisfaction: 72,
    aiAccuracy: 94.2,
    categoryBreakdown,
    trendData,
    sentimentBreakdown,
    peakHours,
    topIssueKeywords: [
      { word: "rosak", count: 23 }, { word: "lambat", count: 18 }, { word: "refund", count: 15 },
      { word: "defect", count: 12 }, { word: "salah", count: 9 }, { word: "charge", count: 7 },
      { word: "pecah", count: 6 }, { word: "tracking", count: 5 },
    ],
  };

  return { tickets, analytics };
};

// ─────────────────────────────────────────────────────────────────────────────
// MICRO COMPONENTS (matching marketing page exactly)
// ─────────────────────────────────────────────────────────────────────────────
const PulseDot: React.FC<{ color?: string; size?: number }> = ({ color = "var(--preset-primary)", size = 7 }) => (
  <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}>
    <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, opacity: 0.4, animation: "cs-pulse 2s ease-in-out infinite" }} />
    <span style={{ width: size, height: size, borderRadius: "50%", background: color, display: "block" }} />
  </span>
);

const AnimNum: React.FC<{ value: number; format?: (v: number) => string }> = ({ value, format: f }) => {
  const [n, setN] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    const s = performance.now(), d = 800;
    const t = (now: number) => { const p = Math.min((now - s) / d, 1), e = 1 - Math.pow(1 - p, 3); setN(Math.floor(e * value)); if (p < 1) raf.current = requestAnimationFrame(t); };
    raf.current = requestAnimationFrame(t);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{f ? f(n) : n.toLocaleString()}</>;
};

const ChartTip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tip" style={{ background: "#141c2b", border: "1px solid rgba(var(--preset-primary-rgb),.2)", borderRadius: 10, padding: "9px 13px", fontSize: 12, backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(0,0,0,.4)" }}>
      {label && <div style={{ color: "rgba(255,255,255,.4)", marginBottom: 5, fontSize: 11 }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,.8)", marginBottom: 2 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color || p.fill, flexShrink: 0 }} />
          <span style={{ color: "rgba(255,255,255,.4)", marginRight: 2 }}>{p.name}:</span>
          <b>{typeof p.value === "number" ? p.value : p.value}</b>
        </div>
      ))}
    </div>
  );
};

const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.025)", padding: "18px 20px", position: "relative", overflow: "hidden", ...style }}>{children}</div>
);

const PanelHeader: React.FC<{ title: string; subtitle?: string; icon: React.ReactNode; iconColor?: string; action?: React.ReactNode }> = ({ title, subtitle, icon, iconColor = "var(--preset-primary)", action }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: `${iconColor}18`, display: "flex", alignItems: "center", justifyContent: "center", color: iconColor, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.2px" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: "rgba(255,255,255,.38)", marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
    {action}
  </div>
);

const MiniBar: React.FC<{ value: number; max: number; color?: string; height?: number }> = ({ value, max, color = "var(--preset-primary)", height = 3 }) => (
  <div style={{ height, background: "rgba(255,255,255,.07)", borderRadius: 99, overflow: "hidden" }}>
    <div style={{ width: `${max > 0 ? Math.min((value / max) * 100, 100) : 0}%`, height: "100%", background: color, borderRadius: 99, transition: "width .8s cubic-bezier(.4,0,.2,1)" }} />
  </div>
);

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; subtitle: string }> = ({ icon, title, subtitle }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center", gap: 10 }}>
    <div style={{ opacity: 0.25 }}>{icon}</div>
    <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.5)" }}>{title}</div>
    <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>{subtitle}</div>
  </div>
);

const ChartModeBtn: React.FC<{ mode: ChartMode; current: ChartMode; label: string; icon: React.ReactNode; onClick: () => void }> = ({ mode, current, label, icon, onClick }) => (
  <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 7, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none", transition: "all .15s", ...(current === mode ? { background: "var(--preset-primary)", color: "#fff", boxShadow: "0 2px 8px rgba(var(--preset-primary-rgb),.3)" } : { background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.4)" }) }}>
    {icon}{label}
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// BADGE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const CategoryBadge: React.FC<{ category: CategoryType; size?: "sm" | "md" }> = ({ category, size = "sm" }) => {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size === "sm" ? 3 : 5, padding: size === "sm" ? "2px 7px" : "3px 10px", borderRadius: 5, background: `${cfg.color}15`, border: `1px solid ${cfg.color}33`, fontSize: size === "sm" ? 9 : 10, fontWeight: 800, color: cfg.color, letterSpacing: ".04em", whiteSpace: "nowrap" }}>
      {React.cloneElement(cfg.icon as React.ReactElement, { style: { width: size === "sm" ? 9 : 11, height: size === "sm" ? 9 : 11 } })}
      {cfg.labelMy}
    </span>
  );
};

const PriorityBadge: React.FC<{ priority: PriorityType }> = ({ priority }) => {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 5, background: `${cfg.color}15`, border: `1px solid ${cfg.color}33`, fontSize: 9, fontWeight: 800, color: cfg.color, letterSpacing: ".04em" }}>
      {cfg.icon}{cfg.label}
    </span>
  );
};

const StatusBadge: React.FC<{ status: StatusType }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 5, background: `${cfg.color}12`, border: `1px solid ${cfg.color}30`, fontSize: 9, fontWeight: 800, color: cfg.color, letterSpacing: ".05em" }}>
      {cfg.icon}{cfg.label.toUpperCase()}
    </span>
  );
};

const SentimentBadge: React.FC<{ sentiment: SentimentType }> = ({ sentiment }) => {
  const cfg = SENTIMENT_CONFIG[sentiment];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 5, background: `${cfg.color}12`, border: `1px solid ${cfg.color}25`, fontSize: 9, fontWeight: 700, color: cfg.color }}>
      {cfg.emoji} {cfg.label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AI CONFIDENCE RING
// ─────────────────────────────────────────────────────────────────────────────
const ConfidenceRing: React.FC<{ value: number; size?: number }> = ({ value, size = 32 }) => {
  const pct = Math.round(value * 100);
  const color = pct >= 90 ? "#10b981" : pct >= 75 ? "#6366f1" : pct >= 60 ? "#f59e0b" : "#ef4444";
  const r = (size / 2) - 3;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="2.5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="2.5" strokeDasharray={`${(pct / 100) * circ} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dasharray .8s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 900, color }}>{pct}%</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY BREAKDOWN CHART
// ─────────────────────────────────────────────────────────────────────────────
const CategoryBreakdownChart: React.FC<{ data: CategoryStats[] }> = ({ data }) => {
  const pieData = data.map(d => ({ name: CATEGORY_CONFIG[d.category].labelMy, value: d.count, fill: CATEGORY_CONFIG[d.category].color }));
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <Panel>
      <PanelHeader title="Issue Categories" subtitle="AI-classified breakdown" icon={<Bot style={{ width: 14, height: 14 }} />} iconColor="#8b5cf6" />
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ width: 100, height: 100, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={42} innerRadius={24} strokeWidth={0} paddingAngle={2}>
                {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
            </RePieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          {data.slice(0, 6).map((c, i) => {
            const cfg = CATEGORY_CONFIG[c.category];
            return (
              <div key={i}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,.5)", flex: 1 }}>{cfg.labelMy}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,.7)" }}>{c.count}</span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,.3)", minWidth: 30, textAlign: "right" }}>{c.percentage.toFixed(0)}%</span>
                  {c.trend !== 0 && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
                      {c.trend > 0 ? <ArrowUp style={{ width: 7, height: 7, color: "#ef4444" }} /> : <ArrowDown style={{ width: 7, height: 7, color: "#10b981" }} />}
                      <span style={{ fontSize: 8, fontWeight: 800, color: c.trend > 0 ? "#ef4444" : "#10b981" }}>{Math.abs(c.trend)}%</span>
                    </span>
                  )}
                </div>
                <MiniBar value={c.count} max={maxCount} color={cfg.color} height={3} />
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TICKET TREND CHART
// ─────────────────────────────────────────────────────────────────────────────
const TicketTrendChart: React.FC<{ data: { date: string; tickets: number; resolved: number }[] }> = ({ data }) => {
  const [chartMode, setChartMode] = useState<ChartMode>("area");

  const renderChart = () => {
    const common = { data, margin: { top: 5, right: 5, left: -20, bottom: 0 } };
    const axisProps = { tick: { fontSize: 9, fill: "rgba(255,255,255,.25)" }, tickLine: false, axisLine: false };
    const gridProps = { strokeDasharray: "2 2", stroke: "rgba(255,255,255,.04)", vertical: false };

    if (chartMode === "bar") return (
      <BarChart {...common}>
        <CartesianGrid {...gridProps as any} />
        <XAxis dataKey="date" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(255,255,255,.03)" }} />
        <Bar dataKey="tickets" name="Tickets" radius={[4, 4, 0, 0]} maxBarSize={16} fill="var(--preset-primary)" fillOpacity={0.7} />
        <Bar dataKey="resolved" name="Resolved" radius={[4, 4, 0, 0]} maxBarSize={16} fill="#10b981" fillOpacity={0.7} />
      </BarChart>
    );
    if (chartMode === "line") return (
      <LineChart {...common}>
        <CartesianGrid {...gridProps as any} />
        <XAxis dataKey="date" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip content={<ChartTip />} />
        <Line type="monotone" dataKey="tickets" name="Tickets" stroke="var(--preset-primary)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--preset-primary)", strokeWidth: 0 }} />
        <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} />
      </LineChart>
    );
    return (
      <AreaChart {...common}>
        <defs>
          <linearGradient id="tickGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--preset-primary)" stopOpacity={0.25} /><stop offset="100%" stopColor="var(--preset-primary)" stopOpacity={0} /></linearGradient>
          <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.2} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
        </defs>
        <CartesianGrid {...gridProps as any} />
        <XAxis dataKey="date" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip content={<ChartTip />} />
        <Area type="monotone" dataKey="tickets" name="Tickets" stroke="var(--preset-primary)" strokeWidth={2} fill="url(#tickGrad)" dot={false} />
        <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2} fill="url(#resGrad)" dot={false} />
      </AreaChart>
    );
  };

  const totalTickets = data.reduce((s, d) => s + d.tickets, 0);
  const totalResolved = data.reduce((s, d) => s + d.resolved, 0);
  const resRate = totalTickets > 0 ? ((totalResolved / totalTickets) * 100).toFixed(0) : "0";

  return (
    <Panel style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.2px" }}>Ticket Trends</div>
          <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 10, color: "rgba(255,255,255,.35)" }}>
            <span>Total: <b style={{ color: "rgba(255,255,255,.7)" }}>{totalTickets}</b></span>
            <span>Resolved: <b style={{ color: "#10b981" }}>{totalResolved}</b></span>
            <span>Rate: <b style={{ color: "#f59e0b" }}>{resRate}%</b></span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <ChartModeBtn mode="area" current={chartMode} label="Area" icon={<TrendingUp style={{ width: 10, height: 10 }} />} onClick={() => setChartMode("area")} />
          <ChartModeBtn mode="line" current={chartMode} label="Line" icon={<Activity style={{ width: 10, height: 10 }} />} onClick={() => setChartMode("line")} />
          <ChartModeBtn mode="bar" current={chartMode} label="Bar" icon={<BarChart3 style={{ width: 10, height: 10 }} />} onClick={() => setChartMode("bar")} />
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">{renderChart()}</ResponsiveContainer>
      </div>
    </Panel>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SENTIMENT OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────
const SentimentOverview: React.FC<{ data: { sentiment: SentimentType; count: number }[]; total: number }> = ({ data, total }) => {
  return (
    <Panel>
      <PanelHeader title="Customer Sentiment" subtitle="AI-detected emotional tone" icon={<Heart style={{ width: 14, height: 14 }} />} iconColor="#ec4899" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map((s, i) => {
          const cfg = SENTIMENT_CONFIG[s.sentiment];
          const pct = total > 0 ? (s.count / total) * 100 : 0;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 9, background: `${cfg.color}08`, border: `1px solid ${cfg.color}15` }}>
              <span style={{ fontSize: 18 }}>{cfg.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,.6)" }}>{s.count} <span style={{ color: "rgba(255,255,255,.3)", fontWeight: 600 }}>({pct.toFixed(0)}%)</span></span>
                </div>
                <MiniBar value={pct} max={100} color={cfg.color} height={4} />
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PEAK HOURS HEATMAP
// ─────────────────────────────────────────────────────────────────────────────
const PeakHoursChart: React.FC<{ data: { hour: string; count: number }[] }> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  return (
    <Panel>
      <PanelHeader title="Peak Hours" subtitle="When customers reach out most" icon={<Clock style={{ width: 14, height: 14 }} />} iconColor="#f59e0b" />
      <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 80 }}>
        {data.filter((_, i) => i >= 6 && i <= 23).map((d, i) => {
          const intensity = maxCount > 0 ? d.count / maxCount : 0;
          const isPeak = intensity > 0.7;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{ width: "100%", height: `${Math.max(intensity * 100, 4)}%`, minHeight: 3, borderRadius: "3px 3px 0 0", background: isPeak ? "#f59e0b" : `rgba(var(--preset-primary-rgb),${0.15 + intensity * 0.6})`, transition: "height .5s ease" }} />
              <span style={{ fontSize: 7, color: isPeak ? "#f59e0b" : "rgba(255,255,255,.2)", fontWeight: isPeak ? 800 : 600 }}>{d.hour.split(":")[0]}</span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TRENDING KEYWORDS
// ─────────────────────────────────────────────────────────────────────────────
const TrendingKeywords: React.FC<{ keywords: { word: string; count: number }[] }> = ({ keywords }) => {
  const max = Math.max(...keywords.map(k => k.count), 1);
  return (
    <Panel>
      <PanelHeader title="Trending Keywords" subtitle="Most mentioned issue terms" icon={<Hash style={{ width: 14, height: 14 }} />} iconColor="#06b6d4" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {keywords.map((kw, i) => {
          const intensity = kw.count / max;
          const color = COLORS[i % COLORS.length];
          return (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, background: `${color}${Math.round(intensity * 20 + 5).toString(16).padStart(2, "0")}`, border: `1px solid ${color}30`, fontSize: 11, fontWeight: 700, color, cursor: "default", transition: "transform .15s", whiteSpace: "nowrap" }}>
              #{kw.word}
              <span style={{ fontSize: 9, fontWeight: 800, opacity: 0.6 }}>{kw.count}</span>
            </span>
          );
        })}
      </div>
    </Panel>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AI RESPONSE SUGGESTION CARD
// ─────────────────────────────────────────────────────────────────────────────
const AiSuggestionCard: React.FC<{ ticket: CustomerTicket; onCopy: (text: string) => void }> = ({ ticket, onCopy }) => (
  <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(139,92,246,.06)", border: "1px solid rgba(139,92,246,.15)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
      <div style={{ width: 20, height: 20, borderRadius: 5, background: "rgba(139,92,246,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Bot style={{ width: 10, height: 10, color: "#8b5cf6" }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 800, color: "#8b5cf6" }}>AI Suggested Reply</span>
      <ConfidenceRing value={ticket.ai_confidence} size={24} />
    </div>
    <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,.55)", lineHeight: 1.6, marginBottom: 8 }}>{ticket.ai_suggested_response}</p>
    <div style={{ display: "flex", gap: 6 }}>
      <button onClick={() => onCopy(ticket.ai_suggested_response)} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, background: "rgba(139,92,246,.12)", border: "1px solid rgba(139,92,246,.2)", color: "#8b5cf6", fontSize: 9, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
        <Copy style={{ width: 9, height: 9 }} />Copy
      </button>
      <button style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.2)", color: "#10b981", fontSize: 9, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
        <Send style={{ width: 9, height: 9 }} />Send
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TICKET CARD
// ─────────────────────────────────────────────────────────────────────────────
const TicketCard: React.FC<{ ticket: CustomerTicket; expanded: boolean; onToggle: () => void }> = ({ ticket, expanded, onToggle }) => {
  const [copied, setCopied] = useState(false);
  const timeAgo = useMemo(() => {
    const mins = differenceInMinutes(new Date(), new Date(ticket.created_at));
    if (mins < 60) return `${mins}m ago`;
    const hrs = differenceInHours(new Date(), new Date(ticket.created_at));
    if (hrs < 24) return `${hrs}h ago`;
    return `${differenceInDays(new Date(), new Date(ticket.created_at))}d ago`;
  }, [ticket.created_at]);

  const catCfg = CATEGORY_CONFIG[ticket.ai_category];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ borderRadius: 11, border: `1px solid ${ticket.priority === "CRITICAL" ? "rgba(239,68,68,.2)" : "rgba(255,255,255,.07)"}`, borderLeft: `3px solid ${catCfg.color}`, background: ticket.priority === "CRITICAL" ? "rgba(239,68,68,.03)" : "rgba(255,255,255,.02)", padding: "14px 16px", animation: "cs-up .3s ease both" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,.5)" }}>{ticket.id}</span>
            <CategoryBadge category={ticket.ai_category} />
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
            <SentimentBadge sentiment={ticket.ai_sentiment} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: "rgba(255,255,255,.35)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><User style={{ width: 9, height: 9 }} />{ticket.customer_name}</span>
            <span>·</span>
            <span>{ticket.platform}</span>
            <span>·</span>
            <span>{timeAgo}</span>
            {ticket.assigned_to && <><span>·</span><span style={{ color: "var(--preset-primary)" }}>→ {ticket.assigned_to}</span></>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <ConfidenceRing value={ticket.ai_confidence} size={32} />
          <button onClick={onToggle} style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,.4)" }}>
            {expanded ? <ChevronUp style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />}
          </button>
        </div>
      </div>

      {/* Message preview */}
      <div style={{ padding: "10px 12px", borderRadius: 9, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.05)", marginBottom: expanded ? 10 : 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: `${catCfg.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: catCfg.color, flexShrink: 0, marginTop: 1 }}>
            <MessageCircle style={{ width: 11, height: 11 }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,.7)", lineHeight: 1.6, fontStyle: "italic" }}>"{ticket.customer_message}"</p>
            <div style={{ marginTop: 6, fontSize: 10, color: "rgba(255,255,255,.35)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><Bot style={{ width: 9, height: 9, color: "#8b5cf6" }} />AI Summary:</span> {ticket.ai_summary}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "cs-up .2s ease" }}>
          <AiSuggestionCard ticket={ticket} onCopy={handleCopy} />

          {/* Tags */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {ticket.tags.map((tag, i) => (
              <span key={i} style={{ padding: "2px 8px", borderRadius: 5, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.4)" }}>#{tag}</span>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ticket.status === "OPEN" && (
              <button style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 7, background: "rgba(99,102,241,.12)", border: "1px solid rgba(99,102,241,.2)", color: "#6366f1", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                <Activity style={{ width: 10, height: 10 }} />Start Working
              </button>
            )}
            <button style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 7, background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.2)", color: "#10b981", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              <CheckCircle style={{ width: 10, height: 10 }} />Resolve
            </button>
            <button style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 7, background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.15)", color: "#ef4444", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              <Flag style={{ width: 10, height: 10 }} />Escalate
            </button>
          </div>

          {copied && <div style={{ fontSize: 10, color: "#10b981", fontWeight: 700 }}>✓ Copied to clipboard</div>}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIORITY QUEUE WIDGET
// ─────────────────────────────────────────────────────────────────────────────
const PriorityQueue: React.FC<{ tickets: CustomerTicket[] }> = ({ tickets }) => {
  const urgent = useMemo(() =>
    tickets
      .filter(t => t.status === "OPEN" || t.status === "ESCALATED")
      .sort((a, b) => {
        const po = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return po[a.priority] - po[b.priority];
      })
      .slice(0, 5),
    [tickets]
  );

  if (!urgent.length) return null;

  return (
    <Panel>
      <PanelHeader title="Priority Queue" subtitle="Needs immediate attention" icon={<Flame style={{ width: 14, height: 14 }} />} iconColor="#ef4444"
        action={<div style={{ display: "flex", alignItems: "center", gap: 4 }}><PulseDot size={5} color="#ef4444" /><span style={{ fontSize: 9, color: "#ef4444", fontWeight: 700 }}>{urgent.length} pending</span></div>} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {urgent.map((ticket, i) => {
          const catCfg = CATEGORY_CONFIG[ticket.ai_category];
          const priCfg = PRIORITY_CONFIG[ticket.priority];
          return (
            <div key={ticket.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, background: i === 0 ? "rgba(239,68,68,.06)" : "rgba(255,255,255,.02)", border: `1px solid ${i === 0 ? "rgba(239,68,68,.15)" : "rgba(255,255,255,.06)"}`, animation: `cs-up .4s ease ${i * 0.05}s both` }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: `${priCfg.color}20`, color: priCfg.color }}>
                {priCfg.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,.5)" }}>{ticket.id}</span>
                  <CategoryBadge category={ticket.ai_category} size="sm" />
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ticket.customer_message}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: priCfg.color }}>{priCfg.label}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,.25)" }}>{ticket.customer_name}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RESOLUTION STATS
// ─────────────────────────────────────────────────────────────────────────────
const ResolutionStats: React.FC<{ analytics: DashboardAnalytics }> = ({ analytics: a }) => {
  const resolutionRate = a.totalTickets > 0 ? ((a.resolvedTickets / a.totalTickets) * 100) : 0;
  return (
    <Panel>
      <PanelHeader title="Resolution Performance" subtitle="How fast issues get solved" icon={<Zap style={{ width: 14, height: 14 }} />} iconColor="#10b981" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { l: "Avg Time", v: fmtTime(a.avgResolutionTime), c: "#f59e0b" },
          { l: "Resolution Rate", v: `${resolutionRate.toFixed(0)}%`, c: "#10b981" },
          { l: "AI Accuracy", v: `${a.aiAccuracy}%`, c: "#8b5cf6" },
        ].map((m, i) => (
          <div key={i} style={{ textAlign: "center", padding: "10px 8px", borderRadius: 9, background: `${m.c}08`, border: `1px solid ${m.c}18` }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: m.c, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{m.l}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: m.c }}>{m.v}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS TAB
// ─────────────────────────────────────────────────────────────────────────────
const AnalyticsTab: React.FC<{ analytics: DashboardAnalytics; tickets: CustomerTicket[] }> = ({ analytics: a, tickets }) => {
  const categoryResolution = useMemo(() =>
    a.categoryBreakdown.map(cat => {
      const catTickets = tickets.filter(t => t.ai_category === cat.category);
      const resolved = catTickets.filter(t => t.resolved_at);
      return { ...cat, resolvedCount: resolved.length, resRate: catTickets.length > 0 ? (resolved.length / catTickets.length) * 100 : 0 };
    }),
    [a.categoryBreakdown, tickets]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
        {[
          { label: "Total Tickets", value: a.totalTickets.toString(), icon: <Inbox style={{ width: 14, height: 14 }} />, accent: "var(--preset-primary)" },
          { label: "Open", value: a.openTickets.toString(), icon: <AlertCircle style={{ width: 14, height: 14 }} />, accent: "#f59e0b" },
          { label: "Resolved", value: a.resolvedTickets.toString(), icon: <CheckCircle style={{ width: 14, height: 14 }} />, accent: "#10b981" },
          { label: "Escalated", value: a.escalatedTickets.toString(), icon: <Flag style={{ width: 14, height: 14 }} />, accent: "#ef4444" },
          { label: "Avg Resolution", value: fmtTime(a.avgResolutionTime), icon: <Clock style={{ width: 14, height: 14 }} />, accent: "#6366f1" },
          { label: "Satisfaction", value: `${a.avgSatisfaction}%`, icon: <Star style={{ width: 14, height: 14 }} />, accent: "#ec4899" },
        ].map((k, i) => (
          <div key={i} style={{ borderRadius: 13, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.03)", padding: "14px 16px", position: "relative", overflow: "hidden", animation: `cs-up .45s ease ${i * 0.06}s both` }}>
            <div style={{ position: "absolute", top: "-40%", right: "-15%", width: 90, height: 90, borderRadius: "50%", background: `radial-gradient(circle,${typeof k.accent === "string" && k.accent.startsWith("var") ? "rgba(var(--preset-primary-rgb),.08)" : `${k.accent}18`},transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: `${typeof k.accent === "string" && k.accent.startsWith("var") ? "rgba(var(--preset-primary-rgb),.12)" : `${k.accent}18`}`, display: "flex", alignItems: "center", justifyContent: "center", color: k.accent }}>{k.icon}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{k.label}</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.4px", color: "rgba(255,255,255,.92)" }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <SentimentOverview data={a.sentimentBreakdown} total={a.totalTickets} />
        <PeakHoursChart data={a.peakHours} />
      </div>

      {/* Category Resolution Table */}
      <Panel>
        <PanelHeader title="Category Performance" subtitle="Resolution stats per issue type" icon={<BarChart3 style={{ width: 14, height: 14 }} />} iconColor="#6366f1" />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {categoryResolution.map((cat, i) => {
            const cfg = CATEGORY_CONFIG[cat.category];
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 80px 80px", gap: 10, alignItems: "center", padding: "10px 12px", borderRadius: 9, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: `${cfg.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color }}>{cfg.icon}</div>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{cfg.labelMy}</span>
                </div>
                <MiniBar value={cat.count} max={a.categoryBreakdown[0]?.count || 1} color={cfg.color} height={4} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{cat.count}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,.3)" }}>TICKETS</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#10b981" }}>{cat.resRate.toFixed(0)}%</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,.3)" }}>RESOLVED</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#f59e0b" }}>{fmtTime(cat.avgResolutionTime)}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,.3)" }}>AVG TIME</div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <TrendingKeywords keywords={a.topIssueKeywords} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// INSIGHTS TAB
// ─────────────────────────────────────────────────────────────────────────────
const InsightsTab: React.FC<{ analytics: DashboardAnalytics; tickets: CustomerTicket[] }> = ({ analytics: a, tickets }) => {
  const insights = useMemo(() => {
    const results: { title: string; description: string; type: "warning" | "success" | "info" | "critical"; icon: React.ReactNode; metric?: string }[] = [];

    // Top category
    if (a.categoryBreakdown.length > 0) {
      const top = a.categoryBreakdown[0];
      const cfg = CATEGORY_CONFIG[top.category];
      results.push({ title: `"${cfg.labelMy}" is your #1 issue`, description: `${top.percentage.toFixed(0)}% of all tickets. ${top.trend > 0 ? `Trending up ${top.trend}% — investigate root cause.` : `Trending down ${Math.abs(top.trend)}% — improvement detected.`}`, type: top.trend > 0 ? "warning" : "success", icon: cfg.icon, metric: `${top.count} tickets` });
    }

    // Escalation rate
    const escalationRate = a.totalTickets > 0 ? (a.escalatedTickets / a.totalTickets) * 100 : 0;
    if (escalationRate > 10) {
      results.push({ title: "High escalation rate detected", description: `${escalationRate.toFixed(0)}% of tickets are being escalated. Consider retraining support team or refining AI auto-categorization.`, type: "critical", icon: <Flag style={{ width: 14, height: 14 }} />, metric: `${a.escalatedTickets} escalated` });
    }

    // Sentiment check
    const angryPct = a.sentimentBreakdown.find(s => s.sentiment === "ANGRY");
    if (angryPct && a.totalTickets > 0 && (angryPct.count / a.totalTickets) > 0.2) {
      results.push({ title: "High anger sentiment", description: `${((angryPct.count / a.totalTickets) * 100).toFixed(0)}% of customers are angry. Consider faster response times and proactive outreach for damaged/defective items.`, type: "warning", icon: <AlertTriangle style={{ width: 14, height: 14 }} />, metric: `${angryPct.count} angry customers` });
    }

    // Resolution time
    if (a.avgResolutionTime > 12) {
      results.push({ title: "Resolution time above target", description: `Average ${fmtTime(a.avgResolutionTime)} to resolve. Target is under 12h. Prioritize CRITICAL tickets and use AI suggestions to speed up responses.`, type: "warning", icon: <Clock style={{ width: 14, height: 14 }} />, metric: fmtTime(a.avgResolutionTime) });
    }

    // AI accuracy
    results.push({ title: "AI classification performing well", description: `${a.aiAccuracy}% accuracy in auto-categorizing tickets. The AI is effectively routing issues to the right category, reducing manual sorting time.`, type: "success", icon: <Bot style={{ width: 14, height: 14 }} />, metric: `${a.aiAccuracy}%` });

    // Satisfaction
    if (a.avgSatisfaction < 70) {
      results.push({ title: "Customer satisfaction needs improvement", description: `Average satisfaction at ${a.avgSatisfaction}%. Focus on resolving recurring "Barang Rosak" and "Barang Defect" issues to improve scores.`, type: "warning", icon: <Star style={{ width: 14, height: 14 }} />, metric: `${a.avgSatisfaction}%` });
    } else {
      results.push({ title: "Solid customer satisfaction", description: `${a.avgSatisfaction}% average satisfaction. Keep maintaining current response quality and resolution times.`, type: "success", icon: <Star style={{ width: 14, height: 14 }} />, metric: `${a.avgSatisfaction}%` });
    }

    return results;
  }, [a, tickets]);

  const typeStyles = {
    critical: { bg: "rgba(239,68,68,.06)", border: "rgba(239,68,68,.18)", accent: "#ef4444" },
    warning: { bg: "rgba(245,158,11,.06)", border: "rgba(245,158,11,.18)", accent: "#f59e0b" },
    success: { bg: "rgba(16,185,129,.06)", border: "rgba(16,185,129,.18)", accent: "#10b981" },
    info: { bg: "rgba(99,102,241,.06)", border: "rgba(99,102,241,.18)", accent: "#6366f1" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Panel>
        <PanelHeader title="AI-Powered Insights" subtitle="Smart recommendations for your team" icon={<Sparkles style={{ width: 14, height: 14 }} />} iconColor="#8b5cf6" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {insights.map((insight, i) => {
            const ts = typeStyles[insight.type];
            return (
              <div key={i} style={{ padding: "14px 16px", borderRadius: 11, background: ts.bg, border: `1px solid ${ts.border}`, animation: `cs-up .4s ease ${i * 0.06}s both` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${ts.accent}18`, display: "flex", alignItems: "center", justifyContent: "center", color: ts.accent, flexShrink: 0, marginTop: 1 }}>
                    {insight.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: ts.accent }}>{insight.title}</span>
                      {insight.metric && <span style={{ padding: "2px 8px", borderRadius: 5, background: `${ts.accent}15`, fontSize: 10, fontWeight: 800, color: ts.accent }}>{insight.metric}</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,.45)", lineHeight: 1.6 }}>{insight.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Quick actions */}
      <Panel>
        <PanelHeader title="Recommended Actions" subtitle="Based on current data patterns" icon={<Target style={{ width: 14, height: 14 }} />} iconColor="#ec4899" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
          {[
            { title: "Review Packaging QC", desc: "High 'Barang Rosak' rate suggests packaging quality issues in fulfillment", color: "#ef4444", icon: <Package style={{ width: 13, height: 13 }} /> },
            { title: "Update Tracking System", desc: "Late delivery complaints correlate with tracking gaps — improve real-time updates", color: "#f59e0b", icon: <Truck style={{ width: 13, height: 13 }} /> },
            { title: "Enhance AI Responses", desc: "Train AI model with recent resolved tickets to improve suggestion quality", color: "#8b5cf6", icon: <Bot style={{ width: 13, height: 13 }} /> },
            { title: "Set Up Auto-Refund", desc: "Automate refund for verified damaged items to reduce resolution time by 60%", color: "#10b981", icon: <DollarSign style={{ width: 13, height: 13 }} /> },
          ].map((action, i) => (
            <div key={i} style={{ padding: "14px 16px", borderRadius: 11, background: `${action.color}08`, border: `1px solid ${action.color}22`, cursor: "pointer", transition: "all .15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8, color: action.color }}>{action.icon}<span style={{ fontSize: 12, fontWeight: 800 }}>{action.title}</span></div>
              <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,.35)", lineHeight: 1.5 }}>{action.desc}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// MAIN: CustomerServiceScreen
// ─────────────────────────────────────────────────────────────────────────────
const CustomerServicePage = () => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const [mainTab, setMainTab] = useState<MainTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set());
  const [ticketCategoryTab, setTicketCategoryTab] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ startDate: subDays(new Date(), 14), endDate: new Date() });

  // Replace with real API hooks
  const { tickets: allTickets, analytics } = useMemo(() => generateMockData(), []);
  const isLoading = false;

  const filteredTickets = useMemo(() => {
    return allTickets.filter(t => {
      if (selectedCategory !== "all" && t.ai_category !== selectedCategory) return false;
      if (ticketCategoryTab !== "all" && t.ai_category !== ticketCategoryTab) return false;
      if (selectedPriority !== "all" && t.priority !== selectedPriority) return false;
      if (selectedStatus !== "all" && t.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return t.customer_message.toLowerCase().includes(q) || t.customer_name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allTickets, selectedCategory, ticketCategoryTab, selectedPriority, selectedStatus, searchQuery]);

  // Category counts for ticket tab pills
  const ticketCategoryCounts = useMemo(() => {
    const base = allTickets.filter(t => {
      if (selectedCategory !== "all" && t.ai_category !== selectedCategory) return false;
      if (selectedPriority !== "all" && t.priority !== selectedPriority) return false;
      if (selectedStatus !== "all" && t.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return t.customer_message.toLowerCase().includes(q) || t.customer_name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      }
      return true;
    });
    const counts: Record<string, number> = { all: base.length };
    (Object.keys(CATEGORY_CONFIG) as CategoryType[]).forEach(cat => {
      const c = base.filter(t => t.ai_category === cat).length;
      if (c > 0) counts[cat] = c;
    });
    return counts;
  }, [allTickets, selectedCategory, selectedPriority, selectedStatus, searchQuery]);

  const toggleTicket = (id: string) => setExpandedTickets(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const TABS: { key: MainTab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <Layout style={{ width: 12, height: 12 }} /> },
    { key: "tickets", label: "Tickets", icon: <Inbox style={{ width: 12, height: 12 }} /> },
    { key: "analytics", label: "Analytics", icon: <BarChart3 style={{ width: 12, height: 12 }} /> },
    { key: "insights", label: "AI Insights", icon: <Sparkles style={{ width: 12, height: 12 }} /> },
  ];

  const globalStyles = `
    @keyframes cs-pulse{0%,100%{transform:scale(1);opacity:.4}50%{transform:scale(2.4);opacity:0}}
    @keyframes cs-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes cs-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    .cs-cat-scroll::-webkit-scrollbar{display:none}
    .cs-cat-scroll{-ms-overflow-style:none;scrollbar-width:none}
    .cs-theme.light-mode{background:#f8fafc;color:#111827;}
    .cs-theme.light-mode [style*="rgba(255,255,255"], .cs-theme.light-mode [style*="rgba(255, 255, 255"]{
      color:rgba(17,24,39,.86)!important;border-color:rgba(var(--preset-primary-rgb),.16)!important;
    }
    .cs-theme.light-mode .chart-tip{
      background:rgba(255,255,255,.98)!important;border:1px solid rgba(var(--preset-primary-rgb),.2)!important;box-shadow:0 8px 24px rgba(15,23,42,.12)!important;
    }
    .cs-theme.light-mode .recharts-cartesian-grid line{stroke:rgba(148,163,184,.24)!important;}
    .cs-theme.light-mode .recharts-text,.cs-theme.light-mode .recharts-legend-item-text,.cs-theme.light-mode svg text,.cs-theme.light-mode svg tspan{fill:rgba(30,41,59,.82)!important;}
  `;

  return (
    <>
      <style>{globalStyles}</style>
      <div className={`cs-theme ${isLight ? "light-mode" : ""} h-full overflow-y-auto`} style={{ color: isLight ? "#111827" : "rgba(255,255,255,.88)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "16px 24px", background: isLight ? "#ffffff" : "transparent" }}>

          {/* ═══ HEADER ═══ */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(var(--preset-primary-rgb),.35)", flexShrink: 0 }}>
                  <MessageCircle style={{ width: 18, height: 18, color: "#fff" }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.15 }}>Customer Service Intelligence</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 3 }}>
                    <PulseDot size={6} />
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,.4)", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase" }}>AI-Powered Issue Tracker</span>
                  </div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,.35)", lineHeight: 1.6, maxWidth: 540 }}>
                Automatically categorizes customer complaints from chatbot conversations. Track issues, monitor sentiment, and get AI-powered resolution suggestions in real-time.
              </p>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {/* Category Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 9, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.7)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", height: 33 }}>
                    <Filter style={{ width: 11, height: 11, color: "var(--preset-primary)" }} />
                    {selectedCategory === "all" ? "All Categories" : CATEGORY_CONFIG[selectedCategory as CategoryType]?.labelMy}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 bg-[#141c2b] border border-white/10 shadow-2xl z-[100]" align="end" sideOffset={8}>
                  <button onClick={() => setSelectedCategory("all")} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 10px", borderRadius: 7, background: selectedCategory === "all" ? "rgba(var(--preset-primary-rgb),.15)" : "transparent", border: "none", color: selectedCategory === "all" ? "var(--preset-primary)" : "rgba(255,255,255,.6)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>All Categories</button>
                  {(Object.keys(CATEGORY_CONFIG) as CategoryType[]).map(cat => {
                    const cfg = CATEGORY_CONFIG[cat];
                    return (
                      <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 10px", borderRadius: 7, background: selectedCategory === cat ? `${cfg.color}15` : "transparent", border: "none", color: selectedCategory === cat ? cfg.color : "rgba(255,255,255,.6)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        {React.cloneElement(cfg.icon as React.ReactElement, { style: { width: 12, height: 12 } })}
                        {cfg.labelMy}
                      </button>
                    );
                  })}
                </PopoverContent>
              </Popover>

              {/* Priority Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 9, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.7)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", height: 33 }}>
                    <Flame style={{ width: 11, height: 11, color: "#f59e0b" }} />
                    {selectedPriority === "all" ? "All Priorities" : PRIORITY_CONFIG[selectedPriority as PriorityType]?.label}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 bg-[#141c2b] border border-white/10 shadow-2xl z-[100]" align="end" sideOffset={8}>
                  {["all", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map(p => (
                    <button key={p} onClick={() => setSelectedPriority(p)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 10px", borderRadius: 7, background: selectedPriority === p ? "rgba(var(--preset-primary-rgb),.15)" : "transparent", border: "none", color: selectedPriority === p ? "var(--preset-primary)" : "rgba(255,255,255,.6)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      {p === "all" ? "All Priorities" : PRIORITY_CONFIG[p as PriorityType].label}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              {/* Status Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 9, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.7)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", height: 33 }}>
                    <Activity style={{ width: 11, height: 11, color: "#10b981" }} />
                    {selectedStatus === "all" ? "All Statuses" : STATUS_CONFIG[selectedStatus as StatusType]?.label}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 bg-[#141c2b] border border-white/10 shadow-2xl z-[100]" align="end" sideOffset={8}>
                  {["all", "OPEN", "IN_PROGRESS", "RESOLVED", "ESCALATED", "CLOSED"].map(s => (
                    <button key={s} onClick={() => setSelectedStatus(s)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 10px", borderRadius: 7, background: selectedStatus === s ? "rgba(var(--preset-primary-rgb),.15)" : "transparent", border: "none", color: selectedStatus === s ? "var(--preset-primary)" : "rgba(255,255,255,.6)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      {s === "all" ? "All Statuses" : STATUS_CONFIG[s as StatusType].label}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* ═══ TABS ═══ */}
          <div style={{ display: "flex", gap: 2, borderBottom: "1px solid rgba(255,255,255,.07)" }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setMainTab(t.key)}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 16px", borderRadius: "9px 9px 0 0", fontSize: 11, fontWeight: 700, cursor: "pointer", border: "1px solid transparent", fontFamily: "inherit", transition: "all .15s", whiteSpace: "nowrap", ...(mainTab === t.key ? { background: "linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))", color: "#fff", borderColor: "transparent", boxShadow: "0 4px 14px rgba(var(--preset-primary-rgb),.28)" } : { background: "transparent", color: "rgba(255,255,255,.38)" }) }}>
                {t.icon}{t.label}
                {t.key === "tickets" && analytics.openTickets > 0 && (
                  <span style={{ padding: "1px 6px", borderRadius: 5, background: mainTab === t.key ? "rgba(255,255,255,.2)" : "rgba(239,68,68,.15)", fontSize: 9, fontWeight: 800, color: mainTab === t.key ? "#fff" : "#ef4444" }}>{analytics.openTickets}</span>
                )}
              </button>
            ))}
          </div>

          {/* ═══ KPI STRIP ═══ */}
          {!isLoading && mainTab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
              {[
                { label: "Total Tickets", value: analytics.totalTickets, fmtFn: (v: number) => v.toString(), icon: <Inbox style={{ width: 14, height: 14 }} />, accent: "var(--preset-primary)", delay: "0s" },
                { label: "Open Tickets", value: analytics.openTickets, fmtFn: (v: number) => v.toString(), icon: <AlertCircle style={{ width: 14, height: 14 }} />, accent: "#f59e0b", delay: ".06s" },
                { label: "Resolved", value: analytics.resolvedTickets, fmtFn: (v: number) => v.toString(), icon: <CheckCircle style={{ width: 14, height: 14 }} />, accent: "#10b981", delay: ".12s" },
                { label: "Avg Resolution", value: analytics.avgResolutionTime, fmtFn: (v: number) => `${v.toFixed(1)}h`, icon: <Clock style={{ width: 14, height: 14 }} />, accent: "#6366f1", delay: ".18s" },
                { label: "AI Accuracy", value: analytics.aiAccuracy, fmtFn: (v: number) => `${v.toFixed(1)}%`, icon: <Bot style={{ width: 14, height: 14 }} />, accent: "#8b5cf6", delay: ".24s" },
                { label: "Satisfaction", value: analytics.avgSatisfaction, fmtFn: (v: number) => `${v}%`, icon: <Star style={{ width: 14, height: 14 }} />, accent: "#ec4899", delay: ".30s" },
              ].map((k, i) => (
                <div key={i} style={{ borderRadius: 13, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.03)", padding: "11px 13px", position: "relative", overflow: "hidden", animation: `cs-up .45s ease ${k.delay} both` }}>
                  <div style={{ position: "absolute", top: "-40%", right: "-15%", width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle,${typeof k.accent === "string" && k.accent.startsWith("var") ? "rgba(var(--preset-primary-rgb),.08)" : `${k.accent}18`},transparent 70%)`, pointerEvents: "none" }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: `${typeof k.accent === "string" && k.accent.startsWith("var") ? "rgba(var(--preset-primary-rgb),.12)" : `${k.accent}18`}`, display: "flex", alignItems: "center", justifyContent: "center", color: k.accent, flexShrink: 0 }}>{k.icon}</div>
                    <PulseDot size={4} color={k.accent} />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.4px", lineHeight: 1.1, color: "rgba(255,255,255,.92)", marginBottom: 3 }}><AnimNum value={k.value} format={k.fmtFn} /></div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,.38)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{k.label}</div>
                </div>
              ))}
            </div>
          )}

          {isLoading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", gap: 8 }}>
              <RefreshCw style={{ width: 16, height: 16, color: "var(--preset-primary)", animation: "cs-spin 1s linear infinite" }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>Loading customer service data...</span>
            </div>
          )}

          {!isLoading && (
            <>
              {/* ═══ TAB: OVERVIEW ═══ */}
              {mainTab === "overview" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12, minHeight: 280 }}>
                    <TicketTrendChart data={analytics.trendData} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <ResolutionStats analytics={analytics} />
                      <SentimentOverview data={analytics.sentimentBreakdown} total={analytics.totalTickets} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <CategoryBreakdownChart data={analytics.categoryBreakdown} />
                    <PriorityQueue tickets={allTickets} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <PeakHoursChart data={analytics.peakHours} />
                    <TrendingKeywords keywords={analytics.topIssueKeywords} />
                  </div>
                </div>
              )}

              {/* ═══ TAB: TICKETS ═══ */}
              {mainTab === "tickets" && (
                <div style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.025)", overflow: "hidden" }}>
                  <div style={{ padding: "15px 20px", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(var(--preset-primary-rgb),.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--preset-primary)" }}><Inbox style={{ width: 14, height: 14 }} /></div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800 }}>{ticketCategoryTab === "all" ? "All Tickets" : CATEGORY_CONFIG[ticketCategoryTab as CategoryType]?.labelMy + " Tickets"}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.38)", marginTop: 1 }}>{filteredTickets.length} tickets {selectedCategory !== "all" || selectedPriority !== "all" || selectedStatus !== "all" || ticketCategoryTab !== "all" ? "(filtered)" : ""}</div>
                      </div>
                    </div>
                    <div style={{ position: "relative" }}>
                      <Search style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: "rgba(255,255,255,.25)" }} />
                      <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search tickets, customers..." style={{ width: 240, height: 30, paddingLeft: 26, paddingRight: 8, fontSize: 11, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 7, color: "rgba(255,255,255,.8)", outline: "none", fontFamily: "inherit" }} />
                    </div>
                  </div>

                  {/* Category Tabs */}
                  <div style={{ padding: "12px 20px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                    <div className="cs-cat-scroll" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
                      {/* All tab */}
                      <button
                        onClick={() => setTicketCategoryTab("all")}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9,
                          fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "1px solid transparent",
                          transition: "all .2s", whiteSpace: "nowrap", flexShrink: 0,
                          ...(ticketCategoryTab === "all"
                            ? { background: "linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))", color: "#fff", borderColor: "transparent", boxShadow: "0 3px 12px rgba(var(--preset-primary-rgb),.25)" }
                            : { background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.45)", borderColor: "rgba(255,255,255,.08)" }
                          ),
                        }}
                      >
                        <Layers style={{ width: 12, height: 12 }} />
                        Semua
                        <span style={{
                          padding: "1px 7px", borderRadius: 5, fontSize: 9, fontWeight: 800,
                          ...(ticketCategoryTab === "all"
                            ? { background: "rgba(255,255,255,.2)", color: "#fff" }
                            : { background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.35)" }
                          ),
                        }}>{ticketCategoryCounts.all || 0}</span>
                      </button>

                      {(Object.keys(CATEGORY_CONFIG) as CategoryType[]).filter(cat => ticketCategoryCounts[cat]).map(cat => {
                        const cfg = CATEGORY_CONFIG[cat];
                        const count = ticketCategoryCounts[cat] || 0;
                        const isActive = ticketCategoryTab === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => setTicketCategoryTab(cat)}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9,
                              fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                              transition: "all .2s", whiteSpace: "nowrap", flexShrink: 0,
                              ...(isActive
                                ? { background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}40`, boxShadow: `0 3px 12px ${cfg.color}20` }
                                : { background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.45)", border: "1px solid rgba(255,255,255,.08)" }
                              ),
                            }}
                          >
                            {React.cloneElement(cfg.icon as React.ReactElement, { style: { width: 12, height: 12 } })}
                            {cfg.labelMy}
                            <span style={{
                              padding: "1px 7px", borderRadius: 5, fontSize: 9, fontWeight: 800,
                              ...(isActive
                                ? { background: `${cfg.color}22`, color: cfg.color }
                                : { background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.35)" }
                              ),
                            }}>{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {filteredTickets.length === 0 ? (
                    <EmptyState icon={<Inbox style={{ width: 28, height: 28 }} />} title="No tickets found" subtitle="Adjust your filters or check back later" />
                  ) : (
                    <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                      {filteredTickets.map(ticket => (
                        <TicketCard
                          key={ticket.id}
                          ticket={ticket}
                          expanded={expandedTickets.has(ticket.id)}
                          onToggle={() => toggleTicket(ticket.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ═══ TAB: ANALYTICS ═══ */}
              {mainTab === "analytics" && <AnalyticsTab analytics={analytics} tickets={allTickets} />}

              {/* ═══ TAB: AI INSIGHTS ═══ */}
              {mainTab === "insights" && <InsightsTab analytics={analytics} tickets={allTickets} />}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomerServicePage;