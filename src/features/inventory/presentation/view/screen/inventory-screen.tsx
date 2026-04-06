"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
} from "recharts";
import {
  Package, Warehouse, AlertTriangle, TrendingUp, TrendingDown, Search,
  BarChart3, Activity, ShoppingCart, Store, Building2, Clock, Filter, Eye,
  User, Mail, Plus, Minus, RefreshCw, Sparkles, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, Globe, Zap, Shield, Layers, Box, Hash,
  X, Loader2, Pencil, Trash2, CheckCircle2, Copy, Check, MoreHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type MainTab = 'summary' | 'istore' | 'physical' | 'warehouse' | 'record';

interface InventoryStock {
  skuNo: string; skuDesc: string; availableQty: number; processingQty: number;
  allocatingQty: number; reservedQty: number; goodQty: number; damagedQty: number;
  thresholdQty: number; storageClientSkuNo: string; country: string; skuStatus: string;
}

interface SkuItem {
  id: string;
  sku: { sku_no: string; sku_name: string };
  quantity: number; threshold_quantity: number;
  warehouse: { name: string };
  updated_at: string;
}

interface InventoryLog {
  id: string; log_type: string; quantity_change: number;
  quantity_before: number; quantity_after: number; notes: string;
  user_id: string; user?: { email: string };
  inventory?: { sku?: { sku_no: string }; warehouse?: { name: string }; quantity?: number };
  metadata?: { title?: string }; created_at: string;
}

const INVENTORY_LOG_TYPES = { ADDED: 'ADDED', REMOVED: 'REMOVED', RESTOCKED: 'RESTOCKED', SOLD: 'SOLD' } as const;
const fmt = (n: number) => { if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`; if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`; return n.toLocaleString(); };

// ─────────────────────────────────────────────────────────────────────────────
// DUMMY DATA
// ─────────────────────────────────────────────────────────────────────────────
const DUMMY_ISTORE: InventoryStock[] = [
  { skuNo: "BSI-CLN-150ML", skuDesc: "Cloud Cleanser — 150ml", availableQty: 145, processingQty: 12, allocatingQty: 8, reservedQty: 5, goodQty: 170, damagedQty: 2, thresholdQty: 20, storageClientSkuNo: "BSI-CLN-150ML", country: "MY", skuStatus: "ACTIVE" },
  { skuNo: "BSI-NIA-30ML", skuDesc: "Niacinamide Serum — 30ml", availableQty: 8, processingQty: 3, allocatingQty: 2, reservedQty: 0, goodQty: 13, damagedQty: 0, thresholdQty: 15, storageClientSkuNo: "BSI-NIA-30ML", country: "MY", skuStatus: "ACTIVE" },
  { skuNo: "BSI-SPF-50ML", skuDesc: "UV Defense SPF 50 — 50ml", availableQty: 0, processingQty: 0, allocatingQty: 0, reservedQty: 0, goodQty: 0, damagedQty: 1, thresholdQty: 10, storageClientSkuNo: "BSI-SPF-50ML", country: "MY", skuStatus: "ACTIVE" },
  { skuNo: "BSI-MSC-12ML", skuDesc: "Waterproof Lash Mascara — Black 12ml", availableQty: 320, processingQty: 0, allocatingQty: 15, reservedQty: 10, goodQty: 345, damagedQty: 0, thresholdQty: 30, storageClientSkuNo: "BSI-MSC-12ML", country: "MY", skuStatus: "ACTIVE" },
  { skuNo: "BSI-LIP-10G", skuDesc: "Lip Recovery Balm — 10g", availableQty: 52, processingQty: 8, allocatingQty: 0, reservedQty: 3, goodQty: 63, damagedQty: 0, thresholdQty: 25, storageClientSkuNo: "BSI-LIP-10G", country: "MY", skuStatus: "ACTIVE" },
  { skuNo: "BSI-TON-200ML", skuDesc: "HA Rose Toner — 200ml", availableQty: 3, processingQty: 0, allocatingQty: 0, reservedQty: 0, goodQty: 3, damagedQty: 0, thresholdQty: 10, storageClientSkuNo: "BSI-TON-200ML", country: "MY", skuStatus: "ACTIVE" },
];

const DUMMY_WAREHOUSE: SkuItem[] = [
  { id: "wh-001", sku: { sku_no: "BSI-CLN-150ML", sku_name: "Cloud Cleanser — 150ml" }, quantity: 580, threshold_quantity: 100, warehouse: { name: "Sepang Warehouse" }, updated_at: "2025-03-28T10:00:00Z" },
  { id: "wh-002", sku: { sku_no: "BSI-NIA-30ML", sku_name: "Niacinamide Serum — 30ml" }, quantity: 42, threshold_quantity: 50, warehouse: { name: "Sepang Warehouse" }, updated_at: "2025-03-27T14:00:00Z" },
  { id: "wh-003", sku: { sku_no: "BSI-SPF-50ML", sku_name: "UV Defense SPF 50 — 50ml" }, quantity: 0, threshold_quantity: 30, warehouse: { name: "Sepang Warehouse" }, updated_at: "2025-03-26T09:00:00Z" },
  { id: "wh-004", sku: { sku_no: "BSI-MSC-12ML", sku_name: "Waterproof Lash Mascara — Black 12ml" }, quantity: 1200, threshold_quantity: 200, warehouse: { name: "Sepang Warehouse" }, updated_at: "2025-03-29T08:00:00Z" },
  { id: "wh-005", sku: { sku_no: "BSI-LIP-10G", sku_name: "Lip Recovery Balm — 10g" }, quantity: 15, threshold_quantity: 50, warehouse: { name: "Sepang Warehouse" }, updated_at: "2025-03-25T16:00:00Z" },
];

const DUMMY_PHYSICAL: SkuItem[] = [
  { id: "ps-001", sku: { sku_no: "BSI-CLN-150ML", sku_name: "Cloud Cleanser — 150ml" }, quantity: 35, threshold_quantity: 10, warehouse: { name: "KL Flagship Store" }, updated_at: "2025-03-29T09:00:00Z" },
  { id: "ps-002", sku: { sku_no: "BSI-NIA-30ML", sku_name: "Niacinamide Serum — 30ml" }, quantity: 4, threshold_quantity: 8, warehouse: { name: "KL Flagship Store" }, updated_at: "2025-03-28T15:00:00Z" },
  { id: "ps-003", sku: { sku_no: "BSI-MSC-12ML", sku_name: "Waterproof Lash Mascara — Black 12ml" }, quantity: 88, threshold_quantity: 15, warehouse: { name: "KL Flagship Store" }, updated_at: "2025-03-29T07:00:00Z" },
  { id: "ps-004", sku: { sku_no: "BSI-TON-200ML", sku_name: "HA Rose Toner — 200ml" }, quantity: 0, threshold_quantity: 5, warehouse: { name: "Johor Pop-up" }, updated_at: "2025-03-27T10:00:00Z" },
];

const DUMMY_RECORDS: InventoryLog[] = [
  { id: "log-001", log_type: "ADDED", quantity_change: 50, quantity_before: 530, quantity_after: 580, notes: "Contract manufacturer batch — Cloud Cleanser", user_id: "usr-001", user: { email: "ops@beautylab.my" }, inventory: { sku: { sku_no: "BSI-CLN-150ML" }, warehouse: { name: "Sepang Warehouse" }, quantity: 580 }, metadata: { title: "Stock Replenishment" }, created_at: "2025-03-28T10:00:00Z" },
  { id: "log-002", log_type: "SOLD", quantity_change: -3, quantity_before: 45, quantity_after: 42, notes: "Shopee order #ORD-4821 — Niacinamide Serum", user_id: "usr-002", user: { email: "system@beautylab.my" }, inventory: { sku: { sku_no: "BSI-NIA-30ML" }, warehouse: { name: "Sepang Warehouse" }, quantity: 42 }, metadata: { title: "Order Fulfillment" }, created_at: "2025-03-27T14:00:00Z" },
  { id: "log-003", log_type: "REMOVED", quantity_change: -5, quantity_before: 5, quantity_after: 0, notes: "Leaking SPF bottles — QC hold removed", user_id: "usr-001", user: { email: "ops@beautylab.my" }, inventory: { sku: { sku_no: "BSI-SPF-50ML" }, warehouse: { name: "Sepang Warehouse" }, quantity: 0 }, metadata: { title: "Damage Write-off" }, created_at: "2025-03-26T09:00:00Z" },
  { id: "log-004", log_type: "RESTOCKED", quantity_change: 200, quantity_before: 1000, quantity_after: 1200, notes: "Holiday kitting — mascaras for gift sets", user_id: "usr-001", user: { email: "ops@beautylab.my" }, inventory: { sku: { sku_no: "BSI-MSC-12ML" }, warehouse: { name: "Sepang Warehouse" }, quantity: 1200 }, metadata: { title: "Seasonal Restock" }, created_at: "2025-03-29T08:00:00Z" },
  { id: "log-005", log_type: "SOLD", quantity_change: -2, quantity_before: 37, quantity_after: 35, notes: "Walk-in — double cleanser + lip balm bundle", user_id: "usr-003", user: { email: "retail@beautylab.my" }, inventory: { sku: { sku_no: "BSI-CLN-150ML" }, warehouse: { name: "KL Flagship Store" }, quantity: 35 }, metadata: { title: "In-Store Sale" }, created_at: "2025-03-29T09:00:00Z" },
  { id: "log-006", log_type: "ADDED", quantity_change: 15, quantity_before: 0, quantity_after: 15, notes: "Transfer from Sepang — lip balm display refill", user_id: "usr-001", user: { email: "ops@beautylab.my" }, inventory: { sku: { sku_no: "BSI-LIP-10G" }, warehouse: { name: "Sepang Warehouse" }, quantity: 15 }, metadata: { title: "Inter-warehouse Transfer" }, created_at: "2025-03-25T16:00:00Z" },
];

// ─────────────────────────────────────────────────────────────────────────────
// GAUGE COMPONENTS (unchanged from original)
// ─────────────────────────────────────────────────────────────────────────────
const polarToCart = (cx: number, cy: number, r: number, deg: number) => {
  const rad = (deg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};
const describeArc = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
  const start = polarToCart(cx, cy, r, endDeg);
  const end = polarToCart(cx, cy, r, startDeg);
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
};
const G_START = 135, G_END = 405, G_SWEEP = 270;

const Gauge: React.FC<{ value: number; max: number; label: string; sublabel?: string; color?: string; size?: number; thickness?: number; showNeedle?: boolean; zones?: { pct: number; color: string }[] }> = ({ value, max, label, sublabel, color = '#10b981', size = 200, thickness = 14, showNeedle = true, zones }) => {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const gSize = size * 0.7, r = gSize / 2 - thickness / 2 - 8, cx = gSize / 2, cy = gSize / 2, svgH = gSize * 0.92;
  const z = zones || [{ pct: 0.3, color: '#ef4444' }, { pct: 0.6, color: '#f59e0b' }, { pct: 1, color: '#10b981' }];
  const needleDeg = G_START + pct * G_SWEEP, needlePt = polarToCart(cx, cy, r - 12, needleDeg);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, width: '100%', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 'clamp(3px, 1vw, 6px)', width: '100%', maxWidth: 'min(100%, 18rem)', paddingInline: 'clamp(4px, 2vw, 10px)' }}>
        <div style={{ fontSize: 'clamp(1.125rem, 2.4vw + 0.4rem, 2.125rem)', fontWeight: 900, color, lineHeight: 1.05, letterSpacing: 'clamp(-0.05em, -0.08vw, -0.02em)', textShadow: `0 0 clamp(8px, 3vw, 22px) ${color}35` }}>{fmt(value)}</div>
        <div style={{ fontSize: 'clamp(0.5rem, 0.28vw + 0.38rem, 0.625rem)', fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: 'clamp(0.06em, 0.1vw, 0.12em)', textTransform: 'uppercase', marginTop: 'clamp(3px, 0.8vw, 5px)', lineHeight: 1.25 }}>{(sublabel || `of ${fmt(max)}`).toUpperCase()}</div>
        <div style={{ fontSize: 'clamp(0.6875rem, 0.42vw + 0.48rem, 0.875rem)', fontWeight: 800, color: 'rgba(255,255,255,.85)', marginTop: 'clamp(2px, 0.5vw, 3px)', lineHeight: 1.2 }}>{label}</div>
      </div>
      <div style={{ width: '100%', maxWidth: gSize, marginInline: 'auto' }}>
        <svg width={gSize} height={svgH} viewBox={`0 0 ${gSize} ${svgH}`} style={{ overflow: 'hidden', width: '100%', height: 'auto', display: 'block' }}>
          {z.map((zone, i) => { const prevPct = i === 0 ? 0 : z[i - 1].pct; return <path key={i} d={describeArc(cx, cy, r, G_START + prevPct * G_SWEEP, G_START + zone.pct * G_SWEEP)} fill="none" stroke={`${zone.color}20`} strokeWidth={thickness} strokeLinecap="butt" />; })}
          {pct > 0.005 && <path d={describeArc(cx, cy, r, G_START, G_START + pct * G_SWEEP)} fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${color}70)` }} />}
          {Array.from({ length: 21 }).map((_, i) => { const deg = G_START + (i / 20) * G_SWEEP; const isMajor = i % 5 === 0; const outerR = r + thickness / 2 + 3; const innerR = outerR + (isMajor ? 7 : 3); const p1 = polarToCart(cx, cy, outerR, deg); const p2 = polarToCart(cx, cy, innerR, deg); return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={`rgba(255,255,255,${isMajor ? 0.2 : 0.08})`} strokeWidth={isMajor ? 1.5 : 1} />; })}
          {showNeedle && <g><line x1={cx} y1={cy} x2={needlePt.x} y2={needlePt.y} stroke={color} strokeWidth={2} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color}80)` }} /><circle cx={cx} cy={cy} r={5} fill="#0f1724" stroke={color} strokeWidth={2} /><circle cx={cx} cy={cy} r={2} fill={color} /></g>}
        </svg>
      </div>
    </div>
  );
};

const MiniGauge: React.FC<{ value: number; max: number; color?: string; size?: number }> = ({ value, max, color = '#10b981', size = 100 }) => {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const thick = 10, r = size / 2 - thick / 2 - 4, cx = size / 2, cy = size / 2, svgH = size * 0.55;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: svgH }}>
        <svg width={size} height={svgH} viewBox={`0 0 ${size} ${svgH}`} style={{ overflow: 'visible' }}>
          <path d={describeArc(cx, cy, r, G_START, G_END)} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={thick} strokeLinecap="round" />
          {pct > 0.005 && <path d={describeArc(cx, cy, r, G_START, G_START + pct * G_SWEEP)} fill="none" stroke={color} strokeWidth={thick} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 5px ${color}60)` }} />}
        </svg>
        <div style={{ position: 'absolute', left: '50%', top: '90%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ fontSize: size * 0.28, fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.3px' }}>{value}</div>
          <div style={{ fontSize: size * 0.11, color: 'rgba(255,255,255,.35)', fontWeight: 700, marginTop: 2 }}>{max > 0 ? `${Math.round(pct * 100)}%` : '--'}</div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MICRO COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const PulseDot: React.FC<{ color?: string; size?: number }> = ({ color = 'var(--preset-primary)', size = 8 }) => (
  <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, flexShrink: 0 }}>
    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.4, animation: 'inv-pulse 2s ease-in-out infinite' }} />
    <span style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'block' }} />
  </span>
);
const AnimNum: React.FC<{ value: number; format?: (v: number) => string }> = ({ value, format: f }) => {
  const [n, setN] = useState(0); const raf = useRef(0);
  useEffect(() => { const s = performance.now(), d = 900; const t = (now: number) => { const p = Math.min((now - s) / d, 1), e = 1 - Math.pow(1 - p, 3); setN(Math.floor(e * value)); if (p < 1) raf.current = requestAnimationFrame(t); }; raf.current = requestAnimationFrame(t); return () => cancelAnimationFrame(raf.current); }, [value]);
  return <>{f ? f(n) : n.toLocaleString()}</>;
};
const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (<div style={{ borderRadius: 18, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.025)', padding: '24px 28px', position: 'relative', overflow: 'hidden', ...style }}>{children}</div>);
const PanelHeader: React.FC<{ title: string; subtitle?: string; icon: React.ReactNode; iconColor?: string; action?: React.ReactNode }> = ({ title, subtitle, icon, iconColor = 'var(--preset-primary)', action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 38, height: 38, borderRadius: 10, background: `${iconColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, flexShrink: 0 }}>{icon}</div><div><div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.3px' }}>{title}</div>{subtitle && <div style={{ fontSize: 13, color: 'rgba(255,255,255,.38)', marginTop: 2 }}>{subtitle}</div>}</div></div>{action}
  </div>
);
const MiniBar: React.FC<{ value: number; max: number; color?: string; height?: number }> = ({ value, max, color = 'var(--preset-primary)', height = 6 }) => (<div style={{ height, background: 'rgba(255,255,255,.07)', borderRadius: 99, overflow: 'hidden' }}><div style={{ width: `${max > 0 ? Math.min((value / max) * 100, 100) : 0}%`, height: '100%', background: color, borderRadius: 99, transition: 'width .8s cubic-bezier(.4,0,.2,1)' }} /></div>);
const EmptyState: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; action?: React.ReactNode }> = ({ icon, title, subtitle, action }) => (<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center', gap: 14 }}><div style={{ opacity: .25 }}>{icon}</div><div style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,.5)' }}>{title}</div><div style={{ fontSize: 14, color: 'rgba(255,255,255,.3)' }}>{subtitle}</div>{action}</div>);
const StockBadge: React.FC<{ available: number; threshold: number }> = ({ available, threshold }) => {
  if (available === 0) return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 8, background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', fontSize: 11, fontWeight: 800, color: '#ef4444', letterSpacing: '.05em' }}><AlertTriangle style={{ width: 11, height: 11 }} />OUT OF STOCK</span>;
  if (threshold > 0 && available <= threshold) return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 8, background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.3)', fontSize: 11, fontWeight: 800, color: '#f59e0b', letterSpacing: '.05em' }}><AlertTriangle style={{ width: 11, height: 11 }} />LOW STOCK</span>;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 8, background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)', fontSize: 11, fontWeight: 800, color: '#10b981', letterSpacing: '.05em' }}><Activity style={{ width: 11, height: 11 }} />IN STOCK</span>;
};
const FilterBtn: React.FC<{ active: boolean; label: string; onClick: () => void; icon?: React.ReactNode }> = ({ active, label, onClick, icon }) => (<button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: 'none', transition: 'all .15s', ...(active ? { background: 'var(--preset-primary)', color: '#fff', boxShadow: '0 2px 10px rgba(var(--preset-primary-rgb),.3)' } : { background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.45)' }) }}>{icon}{label}</button>);
const Loader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px', gap: 16 }}>
    <div style={{ position: 'relative', width: 56, height: 56 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(var(--preset-primary-rgb),.1)' }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          borderWidth: 3,
          borderStyle: 'solid',
          borderColor: 'transparent',
          borderTopColor: 'var(--preset-primary)',
          animation: 'inv-spin .9s cubic-bezier(.4,0,.2,1) infinite',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Sparkles style={{ width: 20, height: 20, color: 'var(--preset-primary)', animation: 'inv-bounce 1.2s ease-in-out infinite' }} />
      </div>
    </div>
    <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,.4)' }}>{text}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// DIALOG STYLES (matching payout screen)
// ─────────────────────────────────────────────────────────────────────────────
function inventoryDialogPortal(node: React.ReactNode) {
  if (typeof document === "undefined") return null;
  return createPortal(node, document.body);
}

const dOverlay = (): React.CSSProperties => ({
  position: "fixed",
  inset: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100vw",
  minHeight: "100dvh",
  zIndex: 20000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});
const dBackdrop = (): React.CSSProperties => ({
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
});
const dBox = (mw = 540): React.CSSProperties => ({ position: "relative", zIndex: 1, width: "100%", maxWidth: mw, maxHeight: "90vh", overflowY: "auto", margin: "0 16px", background: "hsl(222, 20%, 14%)", borderRadius: 16, padding: "24px", boxShadow: "0 24px 80px rgba(0,0,0,0.3)", fontFamily: "inherit", color: "#e2e8f0" });
const iSt: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", outline: "none", fontFamily: "inherit" };
const lSt: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.4px" };
const clBtn: React.CSSProperties = { width: 32, height: 32, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.06)", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const oBtn: React.CSSProperties = { padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#e2e8f0", cursor: "pointer" };
const pBtn = (dis?: boolean): React.CSSProperties => ({ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: dis ? 0.7 : 1 });
const dBtn: React.CSSProperties = { padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", background: "linear-gradient(135deg, #ef4444, #f87171)", color: "#fff", cursor: "pointer" };

// ─────────────────────────────────────────────────────────────────────────────
// ADD iSTORE SKU DIALOG
// ─────────────────────────────────────────────────────────────────────────────
function AddIStoreDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (d: InventoryStock) => void }) {
  const [skuNo, setSkuNo] = useState(""); const [skuDesc, setSkuDesc] = useState("");
  const [availableQty, setAvailableQty] = useState(""); const [goodQty, setGoodQty] = useState("");
  const [thresholdQty, setThresholdQty] = useState(""); const [country, setCountry] = useState("MY");
  const [clientSku, setClientSku] = useState(""); const [submitting, setSubmitting] = useState(false);

  const handle = () => {
    if (!skuNo.trim()) { toast.error("Enter SKU number"); return; }
    setSubmitting(true);
    setTimeout(() => {
      onSubmit({ skuNo, skuDesc, availableQty: +availableQty || 0, processingQty: 0, allocatingQty: 0, reservedQty: 0, goodQty: +goodQty || +availableQty || 0, damagedQty: 0, thresholdQty: +thresholdQty || 10, storageClientSkuNo: clientSku, country, skuStatus: "ACTIVE" });
      setSubmitting(false);
    }, 800);
  };

  return inventoryDialogPortal(
    <div style={dOverlay()} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={dBackdrop()} />
      <div style={dBox()} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div><h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Add iStore SKU</h2><p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>Add a new product to iStore inventory</p></div>
          <button onClick={onClose} style={clBtn}><X size={16} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div><label style={lSt}>SKU Number</label><input value={skuNo} onChange={(e) => setSkuNo(e.target.value)} placeholder="BSI-SPF-50ML" style={iSt} /></div>
          <div><label style={lSt}>Client SKU</label><input value={clientSku} onChange={(e) => setClientSku(e.target.value)} placeholder="BSI-SPF-50ML" style={iSt} /></div>
        </div>
        <div style={{ marginBottom: 16 }}><label style={lSt}>Description</label><input value={skuDesc} onChange={(e) => setSkuDesc(e.target.value)} placeholder="e.g. Peptide Eye Cream — 15ml" style={iSt} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div><label style={lSt}>Available Qty</label><input type="number" value={availableQty} onChange={(e) => setAvailableQty(e.target.value)} placeholder="0" style={iSt} min="0" /></div>
          <div><label style={lSt}>Good Qty</label><input type="number" value={goodQty} onChange={(e) => setGoodQty(e.target.value)} placeholder="0" style={iSt} min="0" /></div>
          <div><label style={lSt}>Threshold</label><input type="number" value={thresholdQty} onChange={(e) => setThresholdQty(e.target.value)} placeholder="10" style={iSt} min="0" /></div>
        </div>
        <div style={{ marginBottom: 20 }}><label style={lSt}>Country</label>
          <div style={{ display: "flex", gap: 4 }}>
            {["MY", "SG", "ID"].map((c) => (<button key={c} type="button" onClick={() => setCountry(c)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: country === c ? "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))" : "rgba(255,255,255,0.06)", color: country === c ? "#fff" : "#94a3b8", transition: "all 0.15s" }}>{c}</button>))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={oBtn}>Cancel</button>
          <button onClick={handle} disabled={submitting} style={pBtn(submitting)}>{submitting && <Loader2 size={14} className="animate-spin" />}Add SKU</button>
        </div>
      </div>
    </div>,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EDIT iSTORE SKU DIALOG
// ─────────────────────────────────────────────────────────────────────────────
function EditIStoreDialog({ sku, onClose, onSave }: { sku: InventoryStock; onClose: () => void; onSave: (skuNo: string, d: Partial<InventoryStock>) => void }) {
  const [skuDesc, setSkuDesc] = useState(sku.skuDesc);
  const [availableQty, setAvailableQty] = useState(String(sku.availableQty));
  const [goodQty, setGoodQty] = useState(String(sku.goodQty));
  const [thresholdQty, setThresholdQty] = useState(String(sku.thresholdQty));
  const [processingQty, setProcessingQty] = useState(String(sku.processingQty));
  const [damagedQty, setDamagedQty] = useState(String(sku.damagedQty));
  const [submitting, setSubmitting] = useState(false);

  const handle = () => { setSubmitting(true); setTimeout(() => { onSave(sku.skuNo, { skuDesc, availableQty: +availableQty || 0, goodQty: +goodQty || 0, thresholdQty: +thresholdQty || 0, processingQty: +processingQty || 0, damagedQty: +damagedQty || 0 }); setSubmitting(false); }, 800); };

  return inventoryDialogPortal(
    <div style={dOverlay()} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={dBackdrop()} />
      <div style={dBox(500)} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div><h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Edit SKU</h2><p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>{sku.skuNo}</p></div>
          <button onClick={onClose} style={clBtn}><X size={16} /></button>
        </div>
        <div style={{ marginBottom: 16 }}><label style={lSt}>Description</label><input value={skuDesc} onChange={(e) => setSkuDesc(e.target.value)} style={iSt} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div><label style={lSt}>Available</label><input type="number" value={availableQty} onChange={(e) => setAvailableQty(e.target.value)} style={iSt} min="0" /></div>
          <div><label style={lSt}>Good</label><input type="number" value={goodQty} onChange={(e) => setGoodQty(e.target.value)} style={iSt} min="0" /></div>
          <div><label style={lSt}>Threshold</label><input type="number" value={thresholdQty} onChange={(e) => setThresholdQty(e.target.value)} style={iSt} min="0" /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div><label style={lSt}>Processing</label><input type="number" value={processingQty} onChange={(e) => setProcessingQty(e.target.value)} style={iSt} min="0" /></div>
          <div><label style={lSt}>Damaged</label><input type="number" value={damagedQty} onChange={(e) => setDamagedQty(e.target.value)} style={iSt} min="0" /></div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={oBtn}>Cancel</button>
          <button onClick={handle} disabled={submitting} style={pBtn(submitting)}>{submitting && <Loader2 size={14} className="animate-spin" />}Save Changes</button>
        </div>
      </div>
    </div>,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD WAREHOUSE / PHYSICAL STORE SKU DIALOG
// ─────────────────────────────────────────────────────────────────────────────
function AddWarehouseDialog({ onClose, onSubmit, title, defaultWarehouse }: { onClose: () => void; onSubmit: (d: SkuItem) => void; title: string; defaultWarehouse: string }) {
  const [skuNo, setSkuNo] = useState(""); const [skuName, setSkuName] = useState("");
  const [quantity, setQuantity] = useState(""); const [threshold, setThreshold] = useState("");
  const [warehouse, setWarehouse] = useState(defaultWarehouse);
  const [submitting, setSubmitting] = useState(false);

  const handle = () => {
    if (!skuNo.trim()) { toast.error("Enter SKU number"); return; }
    setSubmitting(true);
    setTimeout(() => {
      onSubmit({ id: `gen-${Date.now()}`, sku: { sku_no: skuNo, sku_name: skuName }, quantity: +quantity || 0, threshold_quantity: +threshold || 10, warehouse: { name: warehouse }, updated_at: new Date().toISOString() });
      setSubmitting(false);
    }, 800);
  };

  return inventoryDialogPortal(
    <div style={dOverlay()} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={dBackdrop()} />
      <div style={dBox(500)} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div><h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{title}</h2><p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>Add a new SKU to this location</p></div>
          <button onClick={onClose} style={clBtn}><X size={16} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div><label style={lSt}>SKU Number</label><input value={skuNo} onChange={(e) => setSkuNo(e.target.value)} placeholder="BSI-VCE-30ML" style={iSt} /></div>
          <div><label style={lSt}>Warehouse / Store</label><input value={warehouse} onChange={(e) => setWarehouse(e.target.value)} style={iSt} /></div>
        </div>
        <div style={{ marginBottom: 16 }}><label style={lSt}>SKU Name</label><input value={skuName} onChange={(e) => setSkuName(e.target.value)} placeholder="e.g. Vitamin C Glow Essence — 30ml" style={iSt} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div><label style={lSt}>Quantity</label><input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" style={iSt} min="0" /></div>
          <div><label style={lSt}>Threshold</label><input type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="10" style={iSt} min="0" /></div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={oBtn}>Cancel</button>
          <button onClick={handle} disabled={submitting} style={pBtn(submitting)}>{submitting && <Loader2 size={14} className="animate-spin" />}Add SKU</button>
        </div>
      </div>
    </div>,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EDIT WAREHOUSE / PHYSICAL STORE SKU DIALOG
// ─────────────────────────────────────────────────────────────────────────────
function EditWarehouseDialog({ sku, onClose, onSave }: { sku: SkuItem; onClose: () => void; onSave: (id: string, d: Partial<SkuItem> & { quantity: number; threshold_quantity: number }) => void }) {
  const [quantity, setQuantity] = useState(String(sku.quantity));
  const [threshold, setThreshold] = useState(String(sku.threshold_quantity));
  const [skuName, setSkuName] = useState(sku.sku.sku_name);
  const [submitting, setSubmitting] = useState(false);

  const handle = () => { setSubmitting(true); setTimeout(() => { onSave(sku.id, { quantity: +quantity || 0, threshold_quantity: +threshold || 0, sku: { ...sku.sku, sku_name: skuName } }); setSubmitting(false); }, 800); };

  return inventoryDialogPortal(
    <div style={dOverlay()} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={dBackdrop()} />
      <div style={dBox(460)} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div><h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Edit Stock</h2><p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>{sku.sku.sku_no} — {sku.warehouse.name}</p></div>
          <button onClick={onClose} style={clBtn}><X size={16} /></button>
        </div>
        <div style={{ marginBottom: 16 }}><label style={lSt}>SKU Name</label><input value={skuName} onChange={(e) => setSkuName(e.target.value)} style={iSt} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div><label style={lSt}>Quantity</label><input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={iSt} min="0" /></div>
          <div><label style={lSt}>Threshold</label><input type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} style={iSt} min="0" /></div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={oBtn}>Cancel</button>
          <button onClick={handle} disabled={submitting} style={pBtn(submitting)}>{submitting && <Loader2 size={14} className="animate-spin" />}Save</button>
        </div>
      </div>
    </div>,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE CONFIRM DIALOG (shared)
// ─────────────────────────────────────────────────────────────────────────────
function DeleteConfirmDialog({ title, message, onClose, onConfirm }: { title: string; message: string; onClose: () => void; onConfirm: () => void }) {
  return inventoryDialogPortal(
    <div style={dOverlay()} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={dBackdrop()} />
      <div style={dBox(420)} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><AlertTriangle size={18} style={{ color: "#ef4444" }} /></div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h2>
        </div>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 20px", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: message }} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={oBtn}>Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} style={dBtn}>Delete</button>
        </div>
      </div>
    </div>,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD COMPONENTS (with Edit/Delete actions)
// ─────────────────────────────────────────────────────────────────────────────
const IStoreSkuCard: React.FC<{ sku: InventoryStock; idx: number; onEdit: () => void; onDelete: () => void }> = ({ sku, idx, onEdit, onDelete }) => {
  const isOOS = sku.availableQty === 0; const isLow = sku.thresholdQty > 0 && sku.availableQty <= sku.thresholdQty && sku.availableQty > 0;
  const accent = isOOS ? '#ef4444' : isLow ? '#f59e0b' : '#10b981';
  const total = sku.goodQty;
  const items = [{ l: 'Available', v: sku.availableQty, c: '#10b981' }, { l: 'Processing', v: sku.processingQty, c: '#3b82f6' }, { l: 'Allocating', v: sku.allocatingQty, c: '#f59e0b' }, { l: 'Reserved', v: sku.reservedQty, c: '#8b5cf6' }];
  const maxV = Math.max(...items.map(i => i.v), 1);

  const cardBorder = {
    borderTop: `1px solid ${accent}25`,
    borderRight: `1px solid ${accent}25`,
    borderBottom: `1px solid ${accent}25`,
    borderLeft: `4px solid ${accent}`,
  } as const;

  return (
    <div style={{ borderRadius: 18, ...cardBorder, background: 'rgba(255,255,255,.025)', padding: '24px', animation: `inv-up .4s ease ${idx * .03}s both`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-40%', right: '-20%', width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle,${accent}0c,transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px' }}>{sku.skuNo}</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sku.skuDesc}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StockBadge available={sku.availableQty} threshold={sku.thresholdQty} />
          <button onClick={onEdit} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit"><Pencil size={13} /></button>
          <button onClick={onDelete} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(239,68,68,.08)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete"><Trash2 size={13} /></button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
        <div style={{ flexShrink: 0 }}><MiniGauge value={sku.availableQty} max={total || 1} color={accent} size={100} /></div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((item, i) => (<div key={i}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: item.c }} /><span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{item.l}</span></div><span style={{ fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,.8)' }}>{item.v}</span></div><MiniBar value={item.v} max={maxV} color={item.c} height={5} /></div>))}
          {sku.damagedQty > 0 && (<div><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /><span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>Damaged</span></div><span style={{ fontSize: 14, fontWeight: 800, color: '#ef4444' }}>{sku.damagedQty}</span></div><MiniBar value={sku.damagedQty} max={maxV} color="#ef4444" height={5} /></div>)}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
        {[{ l: 'Client SKU', v: sku.storageClientSkuNo }, { l: 'Country', v: sku.country }, { l: 'Status', v: sku.skuStatus }, { l: 'Utilization', v: `${total > 0 ? Math.round((sku.availableQty / total) * 100) : 0}%` }].map((item, i) => (<div key={i}><div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{item.l}</div><div style={{ fontSize: 13, fontWeight: 700, color: item.l === 'Status' && item.v === 'ACTIVE' ? '#10b981' : 'rgba(255,255,255,.65)' }}>{item.v}</div></div>))}
      </div>
    </div>
  );
};

const WarehouseSkuCard: React.FC<{ sku: SkuItem; idx: number; onEdit: () => void; onDelete: () => void }> = ({ sku: s, idx, onEdit, onDelete }) => {
  const isOOS = s.quantity === 0; const isLow = s.threshold_quantity > 0 && s.quantity <= s.threshold_quantity;
  const accent = isOOS ? '#ef4444' : isLow ? '#f59e0b' : '#10b981';
  const cardBorder = {
    borderTop: `1px solid ${accent}25`,
    borderRight: `1px solid ${accent}25`,
    borderBottom: `1px solid ${accent}25`,
    borderLeft: `4px solid ${accent}`,
  } as const;
  return (
    <div style={{ borderRadius: 18, ...cardBorder, background: 'rgba(255,255,255,.025)', padding: '24px', animation: `inv-up .4s ease ${idx * .03}s both`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-40%', right: '-20%', width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle,${accent}0c,transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><span style={{ fontSize: 18, fontWeight: 900 }}>{s.sku.sku_no}</span></div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.sku.sku_name}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StockBadge available={s.quantity} threshold={s.threshold_quantity} />
          <button onClick={onEdit} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit"><Pencil size={13} /></button>
          <button onClick={onDelete} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(239,68,68,.08)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete"><Trash2 size={13} /></button>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <Gauge value={s.quantity} max={Math.max(s.threshold_quantity * 2, s.quantity, 1)} label="Stock Level" sublabel={`Threshold: ${s.threshold_quantity}`} color={accent} size={160} thickness={12} zones={[{ pct: 0.25, color: '#ef4444' }, { pct: 0.5, color: '#f59e0b' }, { pct: 1, color: '#10b981' }]} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ textAlign: 'center', padding: '16px', borderRadius: 12, background: `${accent}08`, border: `1px solid ${accent}20` }}><div style={{ fontSize: 28, fontWeight: 900, color: accent }}>{s.quantity}</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontWeight: 700, textTransform: 'uppercase' }}>Current</div></div>
        <div style={{ textAlign: 'center', padding: '16px', borderRadius: 12, background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.15)' }}><div style={{ fontSize: 28, fontWeight: 900, color: '#3b82f6' }}>{s.threshold_quantity}</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontWeight: 700, textTransform: 'uppercase' }}>Threshold</div></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
        {[{ l: 'Location', v: s.warehouse.name }, { l: 'ID', v: s.id.slice(-8) }, { l: 'Updated', v: new Date(s.updated_at).toLocaleDateString() }].map((item, i) => (<div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>{item.l}</span><span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.6)' }}>{item.v}</span></div>))}
      </div>
    </div>
  );
};

const RecordCard: React.FC<{ record: InventoryLog; idx: number }> = ({ record: r, idx }) => {
  const isPositive = r.log_type === INVENTORY_LOG_TYPES.ADDED || r.log_type === INVENTORY_LOG_TYPES.RESTOCKED;
  const accent = isPositive ? '#10b981' : '#ef4444';
  return (
    <div style={{ borderRadius: 16, borderTop: '1px solid rgba(255,255,255,.07)', borderRight: '1px solid rgba(255,255,255,.07)', borderBottom: '1px solid rgba(255,255,255,.07)', borderLeft: `4px solid ${accent}`, background: 'rgba(255,255,255,.025)', padding: '20px 24px', animation: `inv-up .35s ease ${idx * .04}s both` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {r.inventory?.sku?.sku_no && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, background: 'rgba(var(--preset-primary-rgb),.1)', border: '1px solid rgba(var(--preset-primary-rgb),.2)', fontSize: 11, fontWeight: 800, color: 'var(--preset-primary)' }}><Package style={{ width: 11, height: 11 }} />{r.inventory.sku.sku_no}</span>}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, background: `${accent}15`, border: `1px solid ${accent}33`, fontSize: 11, fontWeight: 800, color: accent }}>{isPositive ? <TrendingUp style={{ width: 11, height: 11 }} /> : <TrendingDown style={{ width: 11, height: 11 }} />}{r.log_type}</span>
        {r.inventory?.warehouse?.name && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,.5)' }}><Warehouse style={{ width: 11, height: 11 }} />{r.inventory.warehouse.name}</span>}
      </div>
      <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>{r.metadata?.title || `Log #${r.id.slice(-8)}`}</div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', lineHeight: 1.6, marginBottom: 8 }}>Changed <b style={{ color: accent, fontSize: 16 }}>{Math.abs(r.quantity_change)}</b> units · Stock: <b>{r.quantity_before}</b> → <b>{r.quantity_after}</b>{r.inventory?.quantity != null && <> · Current: <b>{r.inventory.quantity}</b></>}</div>
      {r.notes && <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', fontSize: 13, color: 'rgba(255,255,255,.4)', marginBottom: 10 }}><b>Notes:</b> {r.notes}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: 'rgba(255,255,255,.3)', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{r.user?.email ? <><Mail style={{ width: 11, height: 11 }} />{r.user.email}</> : <><User style={{ width: 11, height: 11 }} />User: {r.user_id.slice(-8)}</>}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock style={{ width: 11, height: 11 }} />{new Date(r.created_at).toLocaleString()}</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH + FILTER BAR
// ─────────────────────────────────────────────────────────────────────────────
const SearchFilterBar: React.FC<{ searchTerm: string; setSearchTerm: (v: string) => void; stockFilter: string; setStockFilter: (v: string) => void; totalCount: number; filteredCount: number; placeholder?: string; onAdd?: () => void; addLabel?: string }> = ({ searchTerm, setSearchTerm, stockFilter, setStockFilter, totalCount, filteredCount, placeholder, onAdd, addLabel }) => (
  <div style={{ padding: '20px 24px', borderRadius: 16, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.025)', display: 'flex', flexDirection: 'column', gap: 14 }}>
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ position: 'relative', flex: 1 }}><Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(255,255,255,.25)' }} /><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={placeholder || "Search SKUs..."} style={{ width: '100%', height: 44, paddingLeft: 40, paddingRight: 14, fontSize: 14, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, color: 'rgba(255,255,255,.8)', outline: 'none', fontFamily: 'inherit' }} /></div>
      {onAdd && <button onClick={onAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 18px', borderRadius: 12, fontSize: 13, fontWeight: 700, border: 'none', background: 'linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(var(--preset-primary-rgb),.3)', whiteSpace: 'nowrap' }}><Plus style={{ width: 14, height: 14 }} />{addLabel || 'Add SKU'}</button>}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <Filter style={{ width: 14, height: 14, color: 'rgba(255,255,255,.3)' }} />
      {[{ k: 'all', l: 'All Items' }, { k: 'in-stock', l: 'In Stock' }, { k: 'low-stock', l: 'Low Stock' }, { k: 'out-of-stock', l: 'Out of Stock' }].map(f => (<FilterBtn key={f.k} active={stockFilter === f.k} label={f.l} onClick={() => setStockFilter(f.k)} />))}
    </div>
    <div style={{ fontSize: 13, color: 'rgba(255,255,255,.35)' }}>Showing <b style={{ color: 'rgba(255,255,255,.6)' }}>{filteredCount}</b> of {totalCount} items{stockFilter !== 'all' && ` (${stockFilter.replace('-', ' ')})`}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY PANELS (dummy data versions)
// ─────────────────────────────────────────────────────────────────────────────
const DistributionPanel: React.FC<{ data: InventoryStock[] }> = ({ data }) => {
  const items = useMemo(() => {
    const avail = data.reduce((s, i) => s + i.availableQty, 0);
    const proc = data.reduce((s, i) => s + i.processingQty, 0);
    const alloc = data.reduce((s, i) => s + i.allocatingQty, 0);
    const good = data.reduce((s, i) => s + i.goodQty, 0);
    const damaged = data.reduce((s, i) => s + i.damagedQty, 0);
    return [{ l: 'Available', v: avail, c: '#10b981' }, { l: 'Processing', v: proc, c: '#3b82f6' }, { l: 'Allocating', v: alloc, c: '#f59e0b' }, { l: 'Good', v: good, c: '#8b5cf6' }, { l: 'Damaged', v: damaged, c: '#ef4444' }];
  }, [data]);
  const total = items.reduce((s, i) => s + i.v, 0);
  const pieData = items.map(i => ({ name: i.l, value: i.v, fill: i.c }));
  return (
    <Panel>
      <PanelHeader title="Stock Distribution" subtitle="Breakdown by category" icon={<Layers style={{ width: 18, height: 18 }} />} iconColor="#8b5cf6" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ width: 140, height: 140, flexShrink: 0 }}><ResponsiveContainer width="100%" height="100%"><RePieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={36} strokeWidth={0} paddingAngle={2}>{pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}</Pie></RePieChart></ResponsiveContainer></div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>{items.map((item, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: item.c, flexShrink: 0 }} /><span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', flex: 1 }}>{item.l}</span><span style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,.8)' }}>{fmt(item.v)}</span><span style={{ fontSize: 12, color: 'rgba(255,255,255,.25)', minWidth: 36, textAlign: 'right' }}>{total > 0 ? `${Math.round((item.v / total) * 100)}%` : '-'}</span></div>))}</div>
      </div>
    </Panel>
  );
};

const LocationPanel: React.FC<{ istore: InventoryStock[]; warehouse: SkuItem[]; physical: SkuItem[] }> = ({ istore, warehouse, physical }) => {
  const items = [
    { l: 'iStore', v: istore.reduce((s, i) => s + i.availableQty, 0), c: '#3b82f6', icon: <Store style={{ width: 16, height: 16 }} /> },
    { l: 'Physical Store', v: physical.reduce((s, i) => s + i.quantity, 0), c: '#10b981', icon: <Building2 style={{ width: 16, height: 16 }} /> },
    { l: 'Warehouse', v: warehouse.reduce((s, i) => s + i.quantity, 0), c: '#f59e0b', icon: <Warehouse style={{ width: 16, height: 16 }} /> },
  ];
  const maxV = Math.max(...items.map(i => i.v), 1);
  return (
    <Panel>
      <PanelHeader title="Inventory by Location" subtitle="Stock across all locations" icon={<Globe style={{ width: 18, height: 18 }} />} iconColor="#3b82f6" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>{items.map((item, i) => (<div key={i}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: `${item.c}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.c }}>{item.icon}</div><span style={{ fontSize: 14, fontWeight: 700 }}>{item.l}</span></div><span style={{ fontSize: 22, fontWeight: 900, color: item.c }}>{fmt(item.v)}</span></div><MiniBar value={item.v} max={maxV} color={item.c} height={8} /></div>))}</div>
    </Panel>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN: InventoryScreen
// ─────────────────────────────────────────────────────────────────────────────
export const InventoryScreen = () => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const [activeTab, setActiveTab] = useState<MainTab>('summary');

  // Dummy data state
  const [istoreData, setIstoreData] = useState<InventoryStock[]>([]);
  const [warehouseData, setWarehouseData] = useState<SkuItem[]>([]);
  const [physicalData, setPhysicalData] = useState<SkuItem[]>([]);
  const [recordData] = useState<InventoryLog[]>(DUMMY_RECORDS);
  const [isLoading, setIsLoading] = useState(true);

  // Search & filters
  const [iSearch, setISearch] = useState(''); const [iFilter, setIFilter] = useState('all');
  const [wSearch, setWSearch] = useState(''); const [wFilter, setWFilter] = useState('all');
  const [pSearch, setPSearch] = useState(''); const [pFilter, setPFilter] = useState('all');
  const [rSearch, setRSearch] = useState(''); const [rOpFilter, setROpFilter] = useState<string>('all');

  // Dialog states
  const [showAddIStore, setShowAddIStore] = useState(false);
  const [editIStore, setEditIStore] = useState<InventoryStock | null>(null);
  const [deleteIStore, setDeleteIStore] = useState<InventoryStock | null>(null);
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [editWarehouse, setEditWarehouse] = useState<SkuItem | null>(null);
  const [deleteWarehouse, setDeleteWarehouse] = useState<SkuItem | null>(null);
  const [showAddPhysical, setShowAddPhysical] = useState(false);
  const [editPhysical, setEditPhysical] = useState<SkuItem | null>(null);
  const [deletePhysical, setDeletePhysical] = useState<SkuItem | null>(null);

  useEffect(() => { const t = setTimeout(() => { setIstoreData(DUMMY_ISTORE); setWarehouseData(DUMMY_WAREHOUSE); setPhysicalData(DUMMY_PHYSICAL); setIsLoading(false); }, 1200); return () => clearTimeout(t); }, []);

  const metrics = useMemo(() => {
    const totalSkus = istoreData.length + warehouseData.length + physicalData.length;
    const totalGoodQty = istoreData.reduce((s, i) => s + i.goodQty, 0);
    const totalDamagedQty = istoreData.reduce((s, i) => s + i.damagedQty, 0);
    const totalAvailableQty = istoreData.reduce((s, i) => s + i.availableQty, 0);
    const lowStockItems = istoreData.filter(i => i.availableQty <= i.thresholdQty && i.availableQty > 0).length + warehouseData.filter(i => i.quantity <= i.threshold_quantity && i.quantity > 0).length + physicalData.filter(i => i.quantity <= i.threshold_quantity && i.quantity > 0).length;
    const processingQty = istoreData.reduce((s, i) => s + i.processingQty, 0);
    const allocatingQty = istoreData.reduce((s, i) => s + i.allocatingQty, 0);
    return { totalSkus, totalGoodQty, totalDamagedQty, totalAvailableQty, lowStockItems, processingQty, allocatingQty };
  }, [istoreData, warehouseData, physicalData]);

  const iFiltered = useMemo(() => { let d = istoreData; if (iSearch) d = d.filter(s => s.skuNo.toLowerCase().includes(iSearch.toLowerCase()) || s.skuDesc.toLowerCase().includes(iSearch.toLowerCase())); if (iFilter === 'in-stock') d = d.filter(s => s.availableQty > s.thresholdQty); if (iFilter === 'low-stock') d = d.filter(s => s.availableQty <= s.thresholdQty && s.availableQty > 0); if (iFilter === 'out-of-stock') d = d.filter(s => s.availableQty === 0); return d; }, [istoreData, iSearch, iFilter]);
  const wFiltered = useMemo(() => { let d = warehouseData; if (wSearch) d = d.filter(s => s.sku.sku_no.toLowerCase().includes(wSearch.toLowerCase()) || s.sku.sku_name.toLowerCase().includes(wSearch.toLowerCase())); if (wFilter === 'in-stock') d = d.filter(s => s.quantity > s.threshold_quantity); if (wFilter === 'low-stock') d = d.filter(s => s.threshold_quantity > 0 && s.quantity <= s.threshold_quantity && s.quantity > 0); if (wFilter === 'out-of-stock') d = d.filter(s => s.quantity === 0); return d; }, [warehouseData, wSearch, wFilter]);
  const pFiltered = useMemo(() => { let d = physicalData; if (pSearch) d = d.filter(s => s.sku.sku_no.toLowerCase().includes(pSearch.toLowerCase()) || s.sku.sku_name.toLowerCase().includes(pSearch.toLowerCase())); if (pFilter === 'in-stock') d = d.filter(s => s.quantity > s.threshold_quantity); if (pFilter === 'low-stock') d = d.filter(s => s.threshold_quantity > 0 && s.quantity <= s.threshold_quantity && s.quantity > 0); if (pFilter === 'out-of-stock') d = d.filter(s => s.quantity === 0); return d; }, [physicalData, pSearch, pFilter]);
  const rFiltered = useMemo(() => { let d = recordData; if (rOpFilter !== 'all') d = d.filter(r => r.log_type === rOpFilter); if (rSearch) { const q = rSearch.toLowerCase(); d = d.filter(r => r.id.toLowerCase().includes(q) || r.notes?.toLowerCase().includes(q) || r.log_type.toLowerCase().includes(q) || r.user?.email?.toLowerCase().includes(q) || r.inventory?.sku?.sku_no?.toLowerCase().includes(q)); } return d; }, [recordData, rSearch, rOpFilter]);

  const TABS: { key: MainTab; label: string; icon: React.ReactNode }[] = [
    { key: 'summary', label: 'Summary', icon: <BarChart3 style={{ width: 14, height: 14 }} /> },
    { key: 'istore', label: 'iStore', icon: <Store style={{ width: 14, height: 14 }} /> },
    { key: 'physical', label: 'Physical Store', icon: <Building2 style={{ width: 14, height: 14 }} /> },
    { key: 'warehouse', label: 'Warehouse', icon: <Warehouse style={{ width: 14, height: 14 }} /> },
    { key: 'record', label: 'Record', icon: <Activity style={{ width: 14, height: 14 }} /> },
  ];

  const gs = `@keyframes inv-pulse{0%,100%{transform:scale(1);opacity:.4}50%{transform:scale(2.4);opacity:0}}@keyframes inv-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes inv-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes inv-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}.inventory-theme.light-mode{background:#f8fafc;color:#111827;}.inventory-theme.light-mode [style*="rgba(255,255,255"],.inventory-theme.light-mode [style*="rgba(255, 255, 255"]{color:rgba(17,24,39,.86)!important;border-color:rgba(var(--preset-primary-rgb),.16)!important;background:rgba(255,255,255,.92)!important;}`;

  return (
    <><style>{gs}</style>
      <div className={`inventory-theme ${isLight ? 'light-mode' : ''} h-full overflow-y-auto`} style={{ color: isLight ? '#111827' : 'rgba(255,255,255,.88)', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif" }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 32px 24px', background: isLight ? '#ffffff' : 'transparent' }}>

          {/* HEADER */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 28px rgba(var(--preset-primary-rgb),.35)', flexShrink: 0 }}><Package style={{ width: 24, height: 24, color: '#fff' }} /></div>
              <div><h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: '-0.6px', lineHeight: 1.15 }}>Inventory Management</h2><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}><PulseDot size={8} /><span style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' }}>Analytics Dashboard</span>{!isLoading && <><span style={{ color: 'rgba(255,255,255,.2)' }}>·</span><span style={{ fontSize: 13, color: 'rgba(255,255,255,.35)' }}>Tracking {metrics.totalSkus} SKUs</span></>}</div></div>
            </div>
          </div>

          {/* TABS */}
          <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid rgba(255,255,255,.07)', overflowX: 'auto', paddingBottom: 0 }}>
            {TABS.map(tab => <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: '12px 12px 0 0', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: '1px solid transparent', fontFamily: 'inherit', transition: 'all .15s', whiteSpace: 'nowrap', ...(activeTab === tab.key ? { background: 'linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))', color: '#fff', boxShadow: '0 4px 14px rgba(var(--preset-primary-rgb),.28)' } : { background: 'transparent', color: 'rgba(255,255,255,.38)' }) }}>{tab.icon}{tab.label}</button>)}
          </div>

          {/* SUMMARY */}
          {activeTab === 'summary' && (isLoading ? <Loader text="Loading inventory data..." /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
                {[
                  { label: 'Available Stock', value: metrics.totalAvailableQty, max: metrics.totalGoodQty || metrics.totalAvailableQty, color: '#10b981', sublabel: `of ${fmt(metrics.totalGoodQty)} good`, zones: [{ pct: 0.2, color: '#ef4444' }, { pct: 0.5, color: '#f59e0b' }, { pct: 1, color: '#10b981' }] },
                  { label: 'Processing', value: metrics.processingQty, max: Math.max(metrics.processingQty * 3, 100), color: '#3b82f6', sublabel: 'units in pipeline', zones: [{ pct: 0.7, color: '#10b981' }, { pct: 0.9, color: '#f59e0b' }, { pct: 1, color: '#ef4444' }] },
                  { label: 'Low Stock Alerts', value: metrics.lowStockItems, max: Math.max(metrics.totalSkus, 1), color: '#f59e0b', sublabel: `of ${metrics.totalSkus} SKUs`, zones: [{ pct: 0.5, color: '#10b981' }, { pct: 0.8, color: '#f59e0b' }, { pct: 1, color: '#ef4444' }] },
                  { label: 'Allocating', value: metrics.allocatingQty, max: Math.max(metrics.allocatingQty * 3, 100), color: '#8b5cf6', sublabel: 'units being allocated', zones: [{ pct: 0.7, color: '#10b981' }, { pct: 0.9, color: '#f59e0b' }, { pct: 1, color: '#ef4444' }] },
                ].map((g, i) => (<Panel key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'calc(28px * 1.05) 20px', animation: `inv-up .5s ease ${i * .08}s both` }}><Gauge value={g.value} max={g.max} label={g.label} sublabel={g.sublabel} color={g.color} size={160} thickness={13} zones={g.zones} /></Panel>))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
                {[
                  { label: 'Total SKUs', value: metrics.totalSkus, fmtFn: (v: number) => v.toString(), icon: <Package style={{ width: 18, height: 18 }} />, accent: '#3b82f6' },
                  { label: 'Good Stock', value: metrics.totalGoodQty, fmtFn: fmt, icon: <ShoppingCart style={{ width: 18, height: 18 }} />, accent: '#10b981' },
                  { label: 'Damaged', value: metrics.totalDamagedQty, fmtFn: fmt, icon: <AlertTriangle style={{ width: 18, height: 18 }} />, accent: '#ef4444' },
                ].map((k, i) => (<div key={i} style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.03)', padding: '20px', position: 'relative', overflow: 'hidden', animation: `inv-up .5s ease ${(i + 4) * .08}s both` }}><div style={{ position: 'absolute', top: '-40%', right: '-15%', width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle,${k.accent}18,transparent 70%)`, pointerEvents: 'none' }} /><div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}><div style={{ width: 36, height: 36, borderRadius: 10, background: `${k.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.accent }}>{k.icon}</div><span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>{k.label}</span></div><div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.5px', color: 'rgba(255,255,255,.92)' }}><AnimNum value={k.value} format={k.fmtFn} /></div></div>))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <DistributionPanel data={istoreData} />
                <LocationPanel istore={istoreData} warehouse={warehouseData} physical={physicalData} />
              </div>
            </div>
          ))}

          {/* iSTORE */}
          {activeTab === 'istore' && (isLoading ? <Loader text="Loading iStore..." /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SearchFilterBar searchTerm={iSearch} setSearchTerm={setISearch} stockFilter={iFilter} setStockFilter={setIFilter} totalCount={istoreData.length} filteredCount={iFiltered.length} placeholder="Search by SKU or description..." onAdd={() => setShowAddIStore(true)} addLabel="Add iStore SKU" />
              {iFiltered.length === 0 ? <EmptyState icon={<Package style={{ width: 36, height: 36 }} />} title="No SKUs found" subtitle="Try different search or filters" /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))', gap: 16 }}>
                  {iFiltered.map((sku, i) => <IStoreSkuCard key={sku.skuNo} sku={sku} idx={i} onEdit={() => setEditIStore(sku)} onDelete={() => setDeleteIStore(sku)} />)}
                </div>
              )}
            </div>
          ))}

          {/* PHYSICAL STORE */}
          {activeTab === 'physical' && (isLoading ? <Loader text="Loading physical store..." /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SearchFilterBar searchTerm={pSearch} setSearchTerm={setPSearch} stockFilter={pFilter} setStockFilter={setPFilter} totalCount={physicalData.length} filteredCount={pFiltered.length} onAdd={() => setShowAddPhysical(true)} addLabel="Add Store SKU" />
              {pFiltered.length === 0 ? <EmptyState icon={<Package style={{ width: 36, height: 36 }} />} title="No SKUs found" subtitle="Try different search or filters" /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))', gap: 16 }}>
                  {pFiltered.map((sku, i) => <WarehouseSkuCard key={sku.id} sku={sku} idx={i} onEdit={() => setEditPhysical(sku)} onDelete={() => setDeletePhysical(sku)} />)}
                </div>
              )}
            </div>
          ))}

          {/* WAREHOUSE */}
          {activeTab === 'warehouse' && (isLoading ? <Loader text="Loading warehouse..." /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SearchFilterBar searchTerm={wSearch} setSearchTerm={setWSearch} stockFilter={wFilter} setStockFilter={setWFilter} totalCount={warehouseData.length} filteredCount={wFiltered.length} onAdd={() => setShowAddWarehouse(true)} addLabel="Add Warehouse SKU" />
              {wFiltered.length === 0 ? <EmptyState icon={<Package style={{ width: 36, height: 36 }} />} title="No SKUs found" subtitle="Try different search or filters" /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))', gap: 16 }}>
                  {wFiltered.map((sku, i) => <WarehouseSkuCard key={sku.id} sku={sku} idx={i} onEdit={() => setEditWarehouse(sku)} onDelete={() => setDeleteWarehouse(sku)} />)}
                </div>
              )}
            </div>
          ))}

          {/* RECORD */}
          {activeTab === 'record' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ padding: '20px 24px', borderRadius: 16, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.025)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ position: 'relative' }}><Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(255,255,255,.25)' }} /><input value={rSearch} onChange={e => setRSearch(e.target.value)} placeholder="Search by SKU, email, notes..." style={{ width: '100%', height: 44, paddingLeft: 40, paddingRight: 14, fontSize: 14, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, color: 'rgba(255,255,255,.8)', outline: 'none', fontFamily: 'inherit' }} /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Filter style={{ width: 14, height: 14, color: 'rgba(255,255,255,.3)' }} />
                  {[{ k: 'all', l: 'All', ic: undefined }, { k: 'ADDED', l: 'Added', ic: <Plus style={{ width: 11, height: 11 }} /> }, { k: 'REMOVED', l: 'Removed', ic: <Minus style={{ width: 11, height: 11 }} /> }, { k: 'RESTOCKED', l: 'Restocked', ic: <Package style={{ width: 11, height: 11 }} /> }, { k: 'SOLD', l: 'Sold', ic: <TrendingDown style={{ width: 11, height: 11 }} /> }].map(f => (<FilterBtn key={f.k} active={rOpFilter === f.k} label={f.l} onClick={() => setROpFilter(f.k)} icon={f.ic} />))}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.35)' }}>Showing <b style={{ color: 'rgba(255,255,255,.6)' }}>{rFiltered.length}</b> of {recordData.length} records</div>
              </div>
              {rFiltered.length === 0 ? <EmptyState icon={<Activity style={{ width: 36, height: 36 }} />} title="No Records" subtitle="No records match criteria" /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{rFiltered.map((r, i) => <RecordCard key={r.id} record={r} idx={i} />)}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══ DIALOGS ═══ */}
      {showAddIStore && <AddIStoreDialog onClose={() => setShowAddIStore(false)} onSubmit={(d) => { setIstoreData(p => [d, ...p]); toast.success("iStore SKU added!"); setShowAddIStore(false); }} />}
      {editIStore && <EditIStoreDialog sku={editIStore} onClose={() => setEditIStore(null)} onSave={(skuNo, d) => { setIstoreData(p => p.map(s => s.skuNo === skuNo ? { ...s, ...d } : s)); toast.success("SKU updated!"); setEditIStore(null); }} />}
      {deleteIStore && <DeleteConfirmDialog title="Delete iStore SKU?" message={`This will permanently remove <strong>${deleteIStore.skuNo}</strong> (${deleteIStore.skuDesc}) from iStore inventory.`} onClose={() => setDeleteIStore(null)} onConfirm={() => { setIstoreData(p => p.filter(s => s.skuNo !== deleteIStore.skuNo)); toast.success("SKU deleted"); }} />}

      {showAddWarehouse && <AddWarehouseDialog title="Add Warehouse SKU" defaultWarehouse="Sepang Warehouse" onClose={() => setShowAddWarehouse(false)} onSubmit={(d) => { setWarehouseData(p => [d, ...p]); toast.success("Warehouse SKU added!"); setShowAddWarehouse(false); }} />}
      {editWarehouse && <EditWarehouseDialog sku={editWarehouse} onClose={() => setEditWarehouse(null)} onSave={(id, d) => { setWarehouseData(p => p.map(s => s.id === id ? { ...s, ...d, sku: d.sku ? { ...s.sku, ...d.sku } : s.sku, updated_at: new Date().toISOString() } : s)); toast.success("Stock updated!"); setEditWarehouse(null); }} />}
      {deleteWarehouse && <DeleteConfirmDialog title="Delete Warehouse SKU?" message={`This will permanently remove <strong>${deleteWarehouse.sku.sku_no}</strong> from ${deleteWarehouse.warehouse.name}.`} onClose={() => setDeleteWarehouse(null)} onConfirm={() => { setWarehouseData(p => p.filter(s => s.id !== deleteWarehouse.id)); toast.success("SKU deleted"); }} />}

      {showAddPhysical && <AddWarehouseDialog title="Add Store SKU" defaultWarehouse="KL Flagship Store" onClose={() => setShowAddPhysical(false)} onSubmit={(d) => { setPhysicalData(p => [d, ...p]); toast.success("Store SKU added!"); setShowAddPhysical(false); }} />}
      {editPhysical && <EditWarehouseDialog sku={editPhysical} onClose={() => setEditPhysical(null)} onSave={(id, d) => { setPhysicalData(p => p.map(s => s.id === id ? { ...s, ...d, sku: d.sku ? { ...s.sku, ...d.sku } : s.sku, updated_at: new Date().toISOString() } : s)); toast.success("Stock updated!"); setEditPhysical(null); }} />}
      {deletePhysical && <DeleteConfirmDialog title="Delete Store SKU?" message={`This will permanently remove <strong>${deletePhysical.sku.sku_no}</strong> from ${deletePhysical.warehouse.name}.`} onClose={() => setDeletePhysical(null)} onConfirm={() => { setPhysicalData(p => p.filter(s => s.id !== deletePhysical.id)); toast.success("SKU deleted"); }} />}
    </>
  );
};

export default InventoryScreen;