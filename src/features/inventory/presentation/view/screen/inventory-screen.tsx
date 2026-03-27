"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
} from "recharts";
import {
  Package, Warehouse, AlertTriangle, TrendingUp, TrendingDown, Search,
  BarChart3, Activity, ShoppingCart, Store, Building2, Clock, Filter, Eye,
  User, Mail, Plus, Minus, RefreshCw, Sparkles, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, Globe, Zap, Shield, Layers, Box, Hash,
} from "lucide-react";
import {
  useInventoryIstoreListSku, useStocksMetadata, useGetTotalSkus,
  useGetStockDistribution, useGetSkuDetailsSepang, useGetSkuDetailsPhysicalStore,
  useGetInventoryStockByLocation,
} from "../../tanstack/inventory-tanstack";
import { useInventoryLogs } from "../../tanstack/record-tanstack";
import { InventoryStock } from "../../../data/model/inventory-entity";
import { InventoryLog, INVENTORY_LOG_TYPES } from "../../../data/model/record-entity";
import type { SkuItem } from "../../../data/model/inventory-entity";
import { EditQuantityDialog } from "../components/edit-quantity-dialog";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type MainTab = 'summary' | 'istore' | 'physical' | 'warehouse' | 'record';
const fmt = (n: number) => { if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`; if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`; return n.toLocaleString(); };

// ─────────────────────────────────────────────────────────────────────────────
// SVG GAUGE / CAR METER COMPONENT — proper arc math
// Uses standard SVG angle convention: 0° = right, clockwise positive
// Gauge sweeps from 225° (bottom-left) clockwise to 315° (bottom-right) = 270° total
// ─────────────────────────────────────────────────────────────────────────────
const polarToCart = (cx: number, cy: number, r: number, deg: number) => {
  const rad = (deg - 90) * Math.PI / 180; // -90 to convert from "12 o'clock = 0" to standard
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const describeArc = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
  const start = polarToCart(cx, cy, r, endDeg);
  const end = polarToCart(cx, cy, r, startDeg);
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
};

// Gauge angles: starts at 135° (bottom-left), ends at 405° (=45° bottom-right), 270° sweep
const G_START = 135;
const G_END = 405;
const G_SWEEP = G_END - G_START; // 270

const Gauge: React.FC<{
  value: number; max: number; label: string; sublabel?: string;
  color?: string; size?: number; thickness?: number;
  showNeedle?: boolean; zones?: { pct: number; color: string }[];
}> = ({ value, max, label, sublabel, color = '#10b981', size = 200, thickness = 14, showNeedle = true, zones }) => {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  // Smaller gauge SVG — sits below the text
  const gSize = size * 0.7;
  const r = gSize / 2 - thickness / 2 - 8;
  const cx = gSize / 2;
  const cy = gSize / 2;
  /* Tall enough for arc + outer ticks + stroke; old 0.58*gSize clipped the bottom inside cards */
  const svgH = gSize * 0.92;

  const defaultZones = [{ pct: 0.3, color: '#ef4444' }, { pct: 0.6, color: '#f59e0b' }, { pct: 1, color: '#10b981' }];
  const z = zones || defaultZones;

  const needleDeg = G_START + pct * G_SWEEP;
  const needlePt = polarToCart(cx, cy, r - 12, needleDeg);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, width: '100%', margin: '0 auto' }}>
      {/* ── TEXT ON TOP — fluid type for phones / iPads ── */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(3px, 1vw, 6px)', width: '100%', maxWidth: 'min(100%, 18rem)', paddingInline: 'clamp(4px, 2vw, 10px)' }}>
        <div style={{
          fontSize: 'clamp(1.125rem, 2.4vw + 0.4rem, 2.125rem)',
          fontWeight: 900,
          color,
          lineHeight: 1.05,
          letterSpacing: 'clamp(-0.05em, -0.08vw, -0.02em)',
          textShadow: `0 0 clamp(8px, 3vw, 22px) ${color}35`,
        }}>{fmt(value)}</div>
        <div style={{
          fontSize: 'clamp(0.5rem, 0.28vw + 0.38rem, 0.625rem)',
          fontWeight: 700,
          color: 'rgba(255,255,255,.3)',
          letterSpacing: 'clamp(0.06em, 0.1vw, 0.12em)',
          textTransform: 'uppercase' as const,
          marginTop: 'clamp(3px, 0.8vw, 5px)',
          lineHeight: 1.25,
        }}>{(sublabel || `of ${fmt(max)}`).toUpperCase()}</div>
        <div style={{
          fontSize: 'clamp(0.6875rem, 0.42vw + 0.48rem, 0.875rem)',
          fontWeight: 800,
          color: 'rgba(255,255,255,.85)',
          marginTop: 'clamp(2px, 0.5vw, 3px)',
          lineHeight: 1.2,
        }}>{label}</div>
      </div>

      {/* ── GAUGE BELOW — scales with container width ── */}
      <div style={{ width: '100%', maxWidth: gSize, marginInline: 'auto' }}>
      <svg width={gSize} height={svgH} viewBox={`0 0 ${gSize} ${svgH}`} style={{ overflow: 'hidden', width: '100%', height: 'auto', display: 'block' }}>
        {/* Zone background arcs */}
        {z.map((zone, i) => {
          const prevPct = i === 0 ? 0 : z[i - 1].pct;
          const s = G_START + prevPct * G_SWEEP;
          const e = G_START + zone.pct * G_SWEEP;
          return <path key={i} d={describeArc(cx, cy, r, s, e)} fill="none" stroke={`${zone.color}20`} strokeWidth={thickness} strokeLinecap="butt" />;
        })}

        {/* Active fill arc */}
        {pct > 0.005 && (
          <path
            d={describeArc(cx, cy, r, G_START, G_START + pct * G_SWEEP)}
            fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 10px ${color}70)` }}
          />
        )}

        {/* Tick marks */}
        {Array.from({ length: 21 }).map((_, i) => {
          const deg = G_START + (i / 20) * G_SWEEP;
          const isMajor = i % 5 === 0;
          const outerR = r + thickness / 2 + 3;
          const innerR = outerR + (isMajor ? 7 : 3);
          const p1 = polarToCart(cx, cy, outerR, deg);
          const p2 = polarToCart(cx, cy, innerR, deg);
          return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={`rgba(255,255,255,${isMajor ? 0.2 : 0.08})`} strokeWidth={isMajor ? 1.5 : 1} />;
        })}

        {/* Needle */}
        {showNeedle && (
          <g>
            <line x1={cx} y1={cy} x2={needlePt.x} y2={needlePt.y} stroke={color} strokeWidth={2} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color}80)` }} />
            <circle cx={cx} cy={cy} r={5} fill="#0f1724" stroke={color} strokeWidth={2} />
            <circle cx={cx} cy={cy} r={2} fill={color} />
          </g>
        )}
      </svg>
      </div>
    </div>
  );
};

// Mini gauge for SKU cards — same arc math, no ticks/needle
const MiniGauge: React.FC<{ value: number; max: number; color?: string; size?: number }> = ({ value, max, color = '#10b981', size = 100 }) => {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const thick = 10;
  const r = size / 2 - thick / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;
  const svgH = size * 0.55;

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
// MICRO COMPONENTS (BIG version)
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

const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ borderRadius: 18, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.025)', padding: '24px 28px', position: 'relative', overflow: 'hidden', ...style }}>{children}</div>
);

const PanelHeader: React.FC<{ title: string; subtitle?: string; icon: React.ReactNode; iconColor?: string; action?: React.ReactNode }> = ({ title, subtitle, icon, iconColor = 'var(--preset-primary)', action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${iconColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, flexShrink: 0 }}>{icon}</div>
      <div><div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.3px' }}>{title}</div>{subtitle && <div style={{ fontSize: 13, color: 'rgba(255,255,255,.38)', marginTop: 2 }}>{subtitle}</div>}</div>
    </div>{action}
  </div>
);

const MiniBar: React.FC<{ value: number; max: number; color?: string; height?: number }> = ({ value, max, color = 'var(--preset-primary)', height = 6 }) => (
  <div style={{ height, background: 'rgba(255,255,255,.07)', borderRadius: 99, overflow: 'hidden' }}>
    <div style={{ width: `${max > 0 ? Math.min((value / max) * 100, 100) : 0}%`, height: '100%', background: color, borderRadius: 99, transition: 'width .8s cubic-bezier(.4,0,.2,1)' }} />
  </div>
);

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; action?: React.ReactNode }> = ({ icon, title, subtitle, action }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center', gap: 14 }}>
    <div style={{ opacity: .25 }}>{icon}</div><div style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,.5)' }}>{title}</div><div style={{ fontSize: 14, color: 'rgba(255,255,255,.3)' }}>{subtitle}</div>{action}
  </div>
);

const StockBadge: React.FC<{ available: number; threshold: number }> = ({ available, threshold }) => {
  if (available === 0) return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 8, background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', fontSize: 11, fontWeight: 800, color: '#ef4444', letterSpacing: '.05em' }}><AlertTriangle style={{ width: 11, height: 11 }} />OUT OF STOCK</span>;
  if (threshold > 0 && available <= threshold) return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 8, background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.3)', fontSize: 11, fontWeight: 800, color: '#f59e0b', letterSpacing: '.05em' }}><AlertTriangle style={{ width: 11, height: 11 }} />LOW STOCK</span>;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 8, background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)', fontSize: 11, fontWeight: 800, color: '#10b981', letterSpacing: '.05em' }}><Activity style={{ width: 11, height: 11 }} />IN STOCK</span>;
};

const FilterBtn: React.FC<{ active: boolean; label: string; onClick: () => void; icon?: React.ReactNode }> = ({ active, label, onClick, icon }) => (
  <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: 'none', transition: 'all .15s', ...(active ? { background: 'var(--preset-primary)', color: '#fff', boxShadow: '0 2px 10px rgba(var(--preset-primary-rgb),.3)' } : { background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.45)' }) }}>
    {icon}{label}
  </button>
);

const Loader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px', gap: 16 }}>
    <div style={{ position: 'relative', width: 56, height: 56 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(var(--preset-primary-rgb),.1)' }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: 'var(--preset-primary)', animation: 'inv-spin .9s cubic-bezier(.4,0,.2,1) infinite' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles style={{ width: 20, height: 20, color: 'var(--preset-primary)', animation: 'inv-bounce 1.2s ease-in-out infinite' }} /></div>
    </div>
    <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,.4)' }}>{text}</span>
  </div>
);


// ─────────────────────────────────────────────────────────────────────────────
// iSTORE SKU CARD — BIG with mini gauge
// ─────────────────────────────────────────────────────────────────────────────
const IStoreSkuCard: React.FC<{ sku: InventoryStock; idx: number }> = ({ sku, idx }) => {
  const isOOS = sku.availableQty === 0;
  const isLow = sku.thresholdQty > 0 && sku.availableQty <= sku.thresholdQty && sku.availableQty > 0;
  const accent = isOOS ? '#ef4444' : isLow ? '#f59e0b' : '#10b981';
  const total = sku.goodQty;
  const items = [{ l: 'Available', v: sku.availableQty, c: '#10b981' }, { l: 'Processing', v: sku.processingQty, c: '#3b82f6' }, { l: 'Allocating', v: sku.allocatingQty, c: '#f59e0b' }, { l: 'Reserved', v: sku.reservedQty, c: '#8b5cf6' }];
  const maxV = Math.max(...items.map(i => i.v), 1);

  return (
    <div style={{ borderRadius: 18, border: `1px solid ${accent}25`, borderLeft: `4px solid ${accent}`, background: 'rgba(255,255,255,.025)', padding: '24px', animation: `inv-up .4s ease ${idx * .03}s both`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-40%', right: '-20%', width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle,${accent}0c,transparent 70%)`, pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px' }}>{sku.skuNo}</span>
            {(isLow || isOOS) && <AlertTriangle style={{ width: 16, height: 16, color: accent }} />}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sku.skuDesc}</div>
        </div>
        <StockBadge available={sku.availableQty} threshold={sku.thresholdQty} />
      </div>

      {/* Gauge + Stats side by side */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
        <div style={{ flexShrink: 0 }}>
          <MiniGauge value={sku.availableQty} max={total || 1} color={accent} size={100} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((item, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.c }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{item.l}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,.8)' }}>{item.v}</span>
              </div>
              <MiniBar value={item.v} max={maxV} color={item.c} height={5} />
            </div>
          ))}
          {sku.damagedQty > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /><span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>Damaged</span></div>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#ef4444' }}>{sku.damagedQty}</span>
              </div>
              <MiniBar value={sku.damagedQty} max={maxV} color="#ef4444" height={5} />
            </div>
          )}
        </div>
      </div>

      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
        {[{ l: 'Client SKU', v: sku.storageClientSkuNo }, { l: 'Country', v: sku.country }, { l: 'Status', v: sku.skuStatus }, { l: 'Utilization', v: `${total > 0 ? Math.round((sku.availableQty / total) * 100) : 0}%` }].map((item, i) => (
          <div key={i}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{item.l}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: item.l === 'Status' && item.v === 'ACTIVE' ? '#10b981' : 'rgba(255,255,255,.65)' }}>{item.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// WAREHOUSE SKU CARD — BIG with gauge meter
// ─────────────────────────────────────────────────────────────────────────────
const WarehouseSkuCard: React.FC<{ sku: SkuItem; idx: number }> = ({ sku: s, idx }) => {
  const isOOS = s.quantity === 0;
  const isLow = s.threshold_quantity > 0 && s.quantity <= s.threshold_quantity;
  const accent = isOOS ? '#ef4444' : isLow ? '#f59e0b' : '#10b981';

  return (
    <div style={{ borderRadius: 18, border: `1px solid ${accent}25`, borderLeft: `4px solid ${accent}`, background: 'rgba(255,255,255,.025)', padding: '24px', animation: `inv-up .4s ease ${idx * .03}s both`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-40%', right: '-20%', width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle,${accent}0c,transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 18, fontWeight: 900 }}>{s.sku.sku_no}</span>
            {(isLow || isOOS) && <AlertTriangle style={{ width: 16, height: 16, color: accent }} />}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.sku.sku_name}</div>
        </div>
        <StockBadge available={s.quantity} threshold={s.threshold_quantity} />
      </div>

      {/* CENTER GAUGE */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <Gauge
          value={s.quantity} max={Math.max(s.threshold_quantity * 2, s.quantity, 1)}
          label="Stock Level" sublabel={`Threshold: ${s.threshold_quantity}`}
          color={accent} size={160} thickness={12}
          zones={[{ pct: 0.25, color: '#ef4444' }, { pct: 0.5, color: '#f59e0b' }, { pct: 1, color: '#10b981' }]}
        />
      </div>

      {/* Current vs threshold */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ textAlign: 'center', padding: '16px', borderRadius: 12, background: `${accent}08`, border: `1px solid ${accent}20` }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: accent }}>{s.quantity}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontWeight: 700, textTransform: 'uppercase' }}>Current</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px', borderRadius: 12, background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.15)' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#3b82f6' }}>{s.threshold_quantity}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontWeight: 700, textTransform: 'uppercase' }}>Threshold</div>
        </div>
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
        {[{ l: 'Warehouse', v: s.warehouse.name }, { l: 'ID', v: s.id.slice(-8) }, { l: 'Updated', v: new Date(s.updated_at).toLocaleDateString() }].map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>{item.l}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.6)' }}>{item.v}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14 }}><EditQuantityDialog sku={s} /></div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// RECORD CARD — BIG
// ─────────────────────────────────────────────────────────────────────────────
const RecordCard: React.FC<{ record: InventoryLog; idx: number }> = ({ record: r, idx }) => {
  const isPositive = r.log_type === INVENTORY_LOG_TYPES.ADDED || r.log_type === INVENTORY_LOG_TYPES.RESTOCKED;
  const accent = isPositive ? '#10b981' : '#ef4444';

  return (
    <div style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,.07)', borderLeft: `4px solid ${accent}`, background: 'rgba(255,255,255,.025)', padding: '20px 24px', animation: `inv-up .35s ease ${idx * .04}s both` }}>
      {/* Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {r.inventory?.sku?.sku_no && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, background: 'rgba(var(--preset-primary-rgb),.1)', border: '1px solid rgba(var(--preset-primary-rgb),.2)', fontSize: 11, fontWeight: 800, color: 'var(--preset-primary)' }}><Package style={{ width: 11, height: 11 }} />{r.inventory.sku.sku_no}</span>}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, background: `${accent}15`, border: `1px solid ${accent}33`, fontSize: 11, fontWeight: 800, color: accent }}>{isPositive ? <TrendingUp style={{ width: 11, height: 11 }} /> : <TrendingDown style={{ width: 11, height: 11 }} />}{r.log_type}</span>
        {r.inventory?.warehouse?.name && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,.5)' }}><Warehouse style={{ width: 11, height: 11 }} />{r.inventory.warehouse.name}</span>}
      </div>

      <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>{r.metadata?.title || `Log #${r.id.slice(-8)}`}</div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', lineHeight: 1.6, marginBottom: 8 }}>
        Changed <b style={{ color: accent, fontSize: 16 }}>{Math.abs(r.quantity_change)}</b> units · Stock: <b>{r.quantity_before}</b> → <b>{r.quantity_after}</b>
        {r.inventory?.quantity && <> · Current: <b>{r.inventory.quantity}</b></>}
      </div>
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
const SearchFilterBar: React.FC<{ searchTerm: string; setSearchTerm: (v: string) => void; stockFilter: string; setStockFilter: (v: string) => void; totalCount: number; filteredCount: number; placeholder?: string }> = ({ searchTerm, setSearchTerm, stockFilter, setStockFilter, totalCount, filteredCount, placeholder }) => (
  <div style={{ padding: '20px 24px', borderRadius: 16, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.025)', display: 'flex', flexDirection: 'column', gap: 14 }}>
    <div style={{ position: 'relative' }}><Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(255,255,255,.25)' }} /><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={placeholder || "Search SKUs..."} style={{ width: '100%', height: 44, paddingLeft: 40, paddingRight: 14, fontSize: 14, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, color: 'rgba(255,255,255,.8)', outline: 'none', fontFamily: 'inherit' }} /></div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <Filter style={{ width: 14, height: 14, color: 'rgba(255,255,255,.3)' }} />
      {[{ k: 'all', l: 'All Items' }, { k: 'in-stock', l: 'In Stock' }, { k: 'low-stock', l: 'Low Stock' }, { k: 'out-of-stock', l: 'Out of Stock' }].map(f => (
        <FilterBtn key={f.k} active={stockFilter === f.k} label={f.l} onClick={() => setStockFilter(f.k)} />
      ))}
    </div>
    <div style={{ fontSize: 13, color: 'rgba(255,255,255,.35)' }}>Showing <b style={{ color: 'rgba(255,255,255,.6)' }}>{filteredCount}</b> of {totalCount} items{stockFilter !== 'all' && ` (${stockFilter.replace('-', ' ')})`}</div>
  </div>
);


// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY PANELS
// ─────────────────────────────────────────────────────────────────────────────
const DistributionPanel: React.FC = () => {
  const { stockDistribution, isLoading } = useGetStockDistribution();
  if (isLoading) return <Panel style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}><Loader text="Loading distribution..." /></Panel>;
  const d = stockDistribution?.data?.stockDistribution;
  if (!d) return <Panel><EmptyState icon={<Package style={{ width: 28, height: 28 }} />} title="No data" subtitle="Distribution unavailable" /></Panel>;
  const items = [{ l: 'Available', v: d.availableQty, c: '#10b981' }, { l: 'Processing', v: d.processingQty, c: '#3b82f6' }, { l: 'Allocating', v: d.allocatingQty, c: '#f59e0b' }, { l: 'Good', v: d.goodQty, c: '#8b5cf6' }, { l: 'Damaged', v: d.damagedQty, c: '#ef4444' }];
  const total = items.reduce((s, i) => s + i.v, 0);
  const pieData = items.map(i => ({ name: i.l, value: i.v, fill: i.c }));

  return (
    <Panel>
      <PanelHeader title="Stock Distribution" subtitle="Breakdown by category" icon={<Layers style={{ width: 18, height: 18 }} />} iconColor="#8b5cf6" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ width: 140, height: 140, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={36} strokeWidth={0} paddingAngle={2}>{pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}</Pie></RePieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.c, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', flex: 1 }}>{item.l}</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,.8)' }}>{fmt(item.v)}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.25)', minWidth: 36, textAlign: 'right' }}>{total > 0 ? `${Math.round((item.v / total) * 100)}%` : '-'}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
};

const LocationPanel: React.FC = () => {
  const { inventoryStockByLocation, isLoading } = useGetInventoryStockByLocation();
  if (isLoading) return <Panel style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}><Loader text="Loading locations..." /></Panel>;
  const d = inventoryStockByLocation?.data?.stockDistributionByLocation;
  if (!d) return <Panel><EmptyState icon={<Globe style={{ width: 28, height: 28 }} />} title="No data" subtitle="Location data unavailable" /></Panel>;
  const items = [{ l: 'iStore', v: d.totalStockIStore || 0, c: '#3b82f6', icon: <Store style={{ width: 16, height: 16 }} /> }, { l: 'Physical Store', v: d.totalStockPhysicalStore || 0, c: '#10b981', icon: <Building2 style={{ width: 16, height: 16 }} /> }, { l: 'Warehouse', v: d.totalStockSepang || 0, c: '#f59e0b', icon: <Warehouse style={{ width: 16, height: 16 }} /> }];
  const maxV = Math.max(...items.map(i => i.v), 1);

  return (
    <Panel>
      <PanelHeader title="Inventory by Location" subtitle="Stock across all locations" icon={<Globe style={{ width: 18, height: 18 }} />} iconColor="#3b82f6" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {items.map((item, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: `${item.c}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.c }}>{item.icon}</div><span style={{ fontSize: 14, fontWeight: 700 }}>{item.l}</span></div>
              <span style={{ fontSize: 22, fontWeight: 900, color: item.c }}>{fmt(item.v)}</span>
            </div>
            <MiniBar value={item.v} max={maxV} color={item.c} height={8} />
          </div>
        ))}
      </div>
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
  const [iSearch, setISearch] = useState(''); const [iFilter, setIFilter] = useState('all');
  const [wSearch, setWSearch] = useState(''); const [wFilter, setWFilter] = useState('all');
  const [pSearch, setPSearch] = useState(''); const [pFilter, setPFilter] = useState('all');
  const [rSearch, setRSearch] = useState(''); const [rOpFilter, setROpFilter] = useState<'all' | INVENTORY_LOG_TYPES>('all');
  const [rPage, setRPage] = useState(1);

  const { inventoryIstoreListSku, isLoading: loadI, error } = useInventoryIstoreListSku();
  const { stocksMetadata, isLoading: loadMeta } = useStocksMetadata();
  const { totalSkus, isLoading: loadSkus } = useGetTotalSkus();
  const { stockDistribution, isLoading: loadDist } = useGetStockDistribution();
  const { skuDetailsSepang, isLoading: loadW, error: errW } = useGetSkuDetailsSepang();
  const { skuDetailsPhysicalStore, isLoading: loadP, error: errP } = useGetSkuDetailsPhysicalStore();
  const { inventoryLogs, metadata: logMeta, isLoading: loadR, error: errR } = useInventoryLogs({ log_type: rOpFilter === 'all' ? undefined : rOpFilter, order_by: 'desc', page: rPage, limit: 10 });

  const isLoadingSummary = loadI || loadMeta || loadSkus || loadDist;

  const metrics = useMemo(() => {
    const items = inventoryIstoreListSku || [];
    const sd = stockDistribution?.data?.stockDistribution;
    return {
      totalSkus: totalSkus?.data?.totalSkus?.length || items.length,
      totalGoodQty: sd?.goodQty || items.reduce((s, i) => s + i.goodQty, 0),
      totalDamagedQty: sd?.damagedQty || items.reduce((s, i) => s + i.damagedQty, 0),
      totalAvailableQty: sd?.availableQty || items.reduce((s, i) => s + i.availableQty, 0),
      lowStockItems: stocksMetadata?.data?.stocks?.lowStock || items.filter(i => i.availableQty <= i.thresholdQty && i.availableQty > 0).length,
      processingQty: stocksMetadata?.data?.stocks?.processingStock || sd?.processingQty || items.reduce((s, i) => s + i.processingQty, 0),
      allocatingQty: stocksMetadata?.data?.stocks?.allocatingStock || sd?.allocatingQty || items.reduce((s, i) => s + i.allocatingQty, 0),
    };
  }, [inventoryIstoreListSku, stocksMetadata, totalSkus, stockDistribution]);

  const iFiltered = useMemo(() => { let d = inventoryIstoreListSku || []; if (iSearch) d = d.filter(s => s.skuNo.toLowerCase().includes(iSearch.toLowerCase()) || s.skuDesc.toLowerCase().includes(iSearch.toLowerCase())); if (iFilter === 'in-stock') d = d.filter(s => s.availableQty > s.thresholdQty); if (iFilter === 'low-stock') d = d.filter(s => s.availableQty <= s.thresholdQty && s.availableQty > 0); if (iFilter === 'out-of-stock') d = d.filter(s => s.availableQty === 0); return d; }, [inventoryIstoreListSku, iSearch, iFilter]);
  const wFiltered = useMemo(() => { let d = skuDetailsSepang?.data?.skus || []; if (wSearch) d = d.filter(s => s.sku.sku_no.toLowerCase().includes(wSearch.toLowerCase()) || s.sku.sku_name.toLowerCase().includes(wSearch.toLowerCase())); if (wFilter === 'in-stock') d = d.filter(s => s.quantity > s.threshold_quantity); if (wFilter === 'low-stock') d = d.filter(s => s.threshold_quantity > 0 && s.quantity <= s.threshold_quantity && s.quantity > 0); if (wFilter === 'out-of-stock') d = d.filter(s => s.quantity === 0); return d; }, [skuDetailsSepang, wSearch, wFilter]);
  const pFiltered = useMemo(() => { let d = skuDetailsPhysicalStore?.data?.skus || []; if (pSearch) d = d.filter(s => s.sku.sku_no.toLowerCase().includes(pSearch.toLowerCase()) || s.sku.sku_name.toLowerCase().includes(pSearch.toLowerCase())); if (pFilter === 'in-stock') d = d.filter(s => s.quantity > s.threshold_quantity); if (pFilter === 'low-stock') d = d.filter(s => s.threshold_quantity > 0 && s.quantity <= s.threshold_quantity && s.quantity > 0); if (pFilter === 'out-of-stock') d = d.filter(s => s.quantity === 0); return d; }, [skuDetailsPhysicalStore, pSearch, pFilter]);
  const rFiltered = useMemo(() => { if (!rSearch) return inventoryLogs; const q = rSearch.toLowerCase(); return inventoryLogs.filter(r => r.id.toLowerCase().includes(q) || r.notes?.toLowerCase().includes(q) || r.log_type.toLowerCase().includes(q) || r.user?.email?.toLowerCase().includes(q) || r.inventory?.sku?.sku_no?.toLowerCase().includes(q)); }, [inventoryLogs, rSearch]);

  const TABS: { key: MainTab; label: string; icon: React.ReactNode }[] = [
    { key: 'summary', label: 'Summary', icon: <BarChart3 style={{ width: 14, height: 14 }} /> },
    { key: 'istore', label: 'iStore', icon: <Store style={{ width: 14, height: 14 }} /> },
    { key: 'physical', label: 'Physical Store', icon: <Building2 style={{ width: 14, height: 14 }} /> },
    { key: 'warehouse', label: 'Warehouse', icon: <Warehouse style={{ width: 14, height: 14 }} /> },
    { key: 'record', label: 'Record', icon: <Activity style={{ width: 14, height: 14 }} /> },
  ];

  const gs = `@keyframes inv-pulse{0%,100%{transform:scale(1);opacity:.4}50%{transform:scale(2.4);opacity:0}}@keyframes inv-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes inv-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes inv-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
  .inventory-theme.light-mode{background:#f8fafc;color:#111827;}
  .inventory-theme.light-mode [style*="rgba(255,255,255"], .inventory-theme.light-mode [style*="rgba(255, 255, 255"]{
    color:rgba(17,24,39,.86)!important;border-color:rgba(var(--preset-primary-rgb),.16)!important;background:rgba(255,255,255,.92)!important;
  }
  .inventory-theme.light-mode .recharts-cartesian-grid line{stroke:rgba(148,163,184,.24)!important;}
  .inventory-theme.light-mode .recharts-text,.inventory-theme.light-mode .recharts-legend-item-text,.inventory-theme.light-mode svg text,.inventory-theme.light-mode svg tspan{fill:rgba(30,41,59,.82)!important;}
  `;

  if (error) return <><style>{gs}</style><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><EmptyState icon={<AlertTriangle style={{ width: 40, height: 40 }} />} title="Error Loading Data" subtitle="Failed to load inventory data." /></div></>;

  return (
    <><style>{gs}</style>
      <div className={`inventory-theme ${isLight ? 'light-mode' : ''} h-full overflow-y-auto`} style={{ color: isLight ? '#111827' : 'rgba(255,255,255,.88)', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif" }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '0 32px 24px', background: isLight ? '#ffffff' : 'transparent' }}>

          {/* ═══ HEADER ═══ */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 28px rgba(var(--preset-primary-rgb),.35)', flexShrink: 0 }}><Package style={{ width: 24, height: 24, color: '#fff' }} /></div>
              <div>
                <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: '-0.6px', lineHeight: 1.15 }}>Inventory Management</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <PulseDot size={8} />
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' }}>Analytics Dashboard</span>
                  {!isLoadingSummary && <><span style={{ color: 'rgba(255,255,255,.2)' }}>·</span><span style={{ fontSize: 13, color: 'rgba(255,255,255,.35)' }}>Tracking {metrics.totalSkus} SKUs</span></>}
                </div>
              </div>
            </div>
          </div>

          {/* ═══ TABS ═══ */}
          <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid rgba(255,255,255,.07)', overflowX: 'auto', paddingBottom: 0 }}>
            {TABS.map(t => <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: '12px 12px 0 0', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: '1px solid transparent', fontFamily: 'inherit', transition: 'all .15s', whiteSpace: 'nowrap', ...(activeTab === t.key ? { background: 'linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))', color: '#fff', boxShadow: '0 4px 14px rgba(var(--preset-primary-rgb),.28)' } : { background: 'transparent', color: 'rgba(255,255,255,.38)' }) }}>{t.icon}{t.label}</button>)}
          </div>

          {/* ═══ SUMMARY ═══ */}
          {activeTab === 'summary' && (isLoadingSummary ? <Loader text="Loading inventory data..." /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* GAUGES ROW — car meter style */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
                {[
                  { label: 'Available Stock', value: metrics.totalAvailableQty, max: metrics.totalGoodQty || metrics.totalAvailableQty, color: '#10b981', sublabel: `of ${fmt(metrics.totalGoodQty)} good`, zones: [{ pct: 0.2, color: '#ef4444' }, { pct: 0.5, color: '#f59e0b' }, { pct: 1, color: '#10b981' }] },
                  { label: 'Processing', value: metrics.processingQty, max: Math.max(metrics.processingQty * 3, 100), color: '#3b82f6', sublabel: 'units in pipeline', zones: [{ pct: 0.7, color: '#10b981' }, { pct: 0.9, color: '#f59e0b' }, { pct: 1, color: '#ef4444' }] },
                  { label: 'Low Stock Alerts', value: metrics.lowStockItems, max: Math.max(metrics.totalSkus, 1), color: '#f59e0b', sublabel: `of ${metrics.totalSkus} SKUs`, zones: [{ pct: 0.5, color: '#10b981' }, { pct: 0.8, color: '#f59e0b' }, { pct: 1, color: '#ef4444' }] },
                  { label: 'Allocating', value: metrics.allocatingQty, max: Math.max(metrics.allocatingQty * 3, 100), color: '#8b5cf6', sublabel: 'units being allocated', zones: [{ pct: 0.7, color: '#10b981' }, { pct: 0.9, color: '#f59e0b' }, { pct: 1, color: '#ef4444' }] },
                ].map((g, i) => (
                  <Panel key={i} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 'calc(28px * 1.05) 20px calc(28px * 1.05)',
                    animation: `inv-up .5s ease ${i * .08}s both`,
                  }}>
                    <Gauge value={g.value} max={g.max} label={g.label} sublabel={g.sublabel} color={g.color} size={160} thickness={13} zones={g.zones} />
                  </Panel>
                ))}
              </div>

              {/* KPI strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
                {[
                  { label: 'Total SKUs', value: metrics.totalSkus, fmtFn: (v: number) => v.toString(), icon: <Package style={{ width: 18, height: 18 }} />, accent: '#3b82f6' },
                  { label: 'Good Stock', value: metrics.totalGoodQty, fmtFn: fmt, icon: <ShoppingCart style={{ width: 18, height: 18 }} />, accent: '#10b981' },
                  { label: 'Damaged', value: metrics.totalDamagedQty, fmtFn: fmt, icon: <AlertTriangle style={{ width: 18, height: 18 }} />, accent: '#ef4444' },
                ].map((k, i) => (
                  <div key={i} style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.03)', padding: '20px', position: 'relative', overflow: 'hidden', animation: `inv-up .5s ease ${(i + 4) * .08}s both` }}>
                    <div style={{ position: 'absolute', top: '-40%', right: '-15%', width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle,${k.accent}18,transparent 70%)`, pointerEvents: 'none' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${k.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.accent }}>{k.icon}</div>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>{k.label}</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.5px', color: 'rgba(255,255,255,.92)' }}><AnimNum value={k.value} format={k.fmtFn} /></div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <DistributionPanel />
                <LocationPanel />
              </div>
            </div>
          ))}

          {/* ═══ iSTORE ═══ */}
          {activeTab === 'istore' && (loadI ? <Loader text="Loading iStore..." /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SearchFilterBar searchTerm={iSearch} setSearchTerm={setISearch} stockFilter={iFilter} setStockFilter={setIFilter} totalCount={inventoryIstoreListSku?.length || 0} filteredCount={iFiltered.length} placeholder="Search by SKU, description, or client SKU..." />
              {iFiltered.length === 0 ? <EmptyState icon={<Package style={{ width: 36, height: 36 }} />} title="No SKUs found" subtitle="Try different search or filters" action={<button onClick={() => { setISearch(''); setIFilter('all'); }} style={{ marginTop: 10, padding: '10px 20px', borderRadius: 10, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.5)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Clear Filters</button>} /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))', gap: 16 }}>
                  {iFiltered.map((sku, i) => <IStoreSkuCard key={sku.skuNo} sku={sku} idx={i} />)}
                </div>
              )}
            </div>
          ))}

          {/* ═══ PHYSICAL STORE ═══ */}
          {activeTab === 'physical' && (loadP ? <Loader text="Loading physical store..." /> : errP ? <EmptyState icon={<Building2 style={{ width: 36, height: 36 }} />} title="Error" subtitle="Failed to load physical store data" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SearchFilterBar searchTerm={pSearch} setSearchTerm={setPSearch} stockFilter={pFilter} setStockFilter={setPFilter} totalCount={skuDetailsPhysicalStore?.data?.skus.length || 0} filteredCount={pFiltered.length} />
              {pFiltered.length === 0 ? <EmptyState icon={<Package style={{ width: 36, height: 36 }} />} title="No SKUs found" subtitle="Try different search or filters" /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))', gap: 16 }}>
                  {pFiltered.map((sku, i) => <WarehouseSkuCard key={sku.id} sku={sku} idx={i} />)}
                </div>
              )}
            </div>
          ))}

          {/* ═══ WAREHOUSE ═══ */}
          {activeTab === 'warehouse' && (loadW ? <Loader text="Loading warehouse..." /> : errW ? <EmptyState icon={<Warehouse style={{ width: 36, height: 36 }} />} title="Error" subtitle="Failed to load warehouse data" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SearchFilterBar searchTerm={wSearch} setSearchTerm={setWSearch} stockFilter={wFilter} setStockFilter={setWFilter} totalCount={skuDetailsSepang?.data?.skus.length || 0} filteredCount={wFiltered.length} />
              {wFiltered.length === 0 ? <EmptyState icon={<Package style={{ width: 36, height: 36 }} />} title="No SKUs found" subtitle="Try different search or filters" /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))', gap: 16 }}>
                  {wFiltered.map((sku, i) => <WarehouseSkuCard key={sku.id} sku={sku} idx={i} />)}
                </div>
              )}
            </div>
          ))}

          {/* ═══ RECORD ═══ */}
          {activeTab === 'record' && (loadR ? <Loader text="Loading records..." /> : errR ? <EmptyState icon={<Activity style={{ width: 36, height: 36 }} />} title="Error" subtitle="Failed to load records" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ padding: '20px 24px', borderRadius: 16, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.025)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ position: 'relative' }}><Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(255,255,255,.25)' }} /><input value={rSearch} onChange={e => setRSearch(e.target.value)} placeholder="Search by SKU, email, warehouse, notes..." style={{ width: '100%', height: 44, paddingLeft: 40, paddingRight: 14, fontSize: 14, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, color: 'rgba(255,255,255,.8)', outline: 'none', fontFamily: 'inherit' }} /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Filter style={{ width: 14, height: 14, color: 'rgba(255,255,255,.3)' }} />
                  {[{ k: 'all', l: 'All', ic: undefined }, { k: INVENTORY_LOG_TYPES.ADDED, l: 'Added', ic: <Plus style={{ width: 11, height: 11 }} /> }, { k: INVENTORY_LOG_TYPES.REMOVED, l: 'Removed', ic: <Minus style={{ width: 11, height: 11 }} /> }, { k: INVENTORY_LOG_TYPES.RESTOCKED, l: 'Restocked', ic: <Package style={{ width: 11, height: 11 }} /> }, { k: INVENTORY_LOG_TYPES.SOLD, l: 'Sold', ic: <TrendingDown style={{ width: 11, height: 11 }} /> }].map(f => (
                    <FilterBtn key={f.k} active={rOpFilter === f.k} label={f.l} onClick={() => { setROpFilter(f.k as any); setRPage(1); }} icon={f.ic} />
                  ))}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.35)' }}>Showing <b style={{ color: 'rgba(255,255,255,.6)' }}>{rFiltered.length}</b> of {logMeta?.total || 0} records</div>
              </div>

              {rFiltered.length === 0 ? <EmptyState icon={<Activity style={{ width: 36, height: 36 }} />} title="No Records" subtitle="No records match criteria" /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {rFiltered.map((r, i) => <RecordCard key={r.id} record={r} idx={i} />)}
                </div>
              )}

              {logMeta && logMeta.total_pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderRadius: 16, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.025)' }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,.35)' }}>Page {logMeta.page} of {logMeta.total_pages} · {logMeta.total} total</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button disabled={!logMeta.has_previous} onClick={() => setRPage(p => p - 1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '8px 16px', borderRadius: 10, background: !logMeta.has_previous ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: !logMeta.has_previous ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.6)', fontSize: 12, fontWeight: 700, cursor: !logMeta.has_previous ? 'default' : 'pointer', fontFamily: 'inherit' }}><ChevronLeft style={{ width: 14, height: 14 }} />Previous</button>
                    <button disabled={!logMeta.has_next} onClick={() => setRPage(p => p + 1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '8px 16px', borderRadius: 10, background: !logMeta.has_next ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: !logMeta.has_next ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.6)', fontSize: 12, fontWeight: 700, cursor: !logMeta.has_next ? 'default' : 'pointer', fontFamily: 'inherit' }}>Next<ChevronRight style={{ width: 14, height: 14 }} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}

        </div>
      </div>
    </>
  );
};