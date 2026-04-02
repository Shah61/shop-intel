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
  Plus, DollarSign, Target, ExternalLink, Activity, Clock, RefreshCw, AlertCircle,
  CheckCircle, Trash2, TrendingUp, TrendingDown, Package, Edit, Filter, ChevronDown,
  ChevronUp, Calendar as CalendarIcon, Eye, Heart, MessageCircle, Share, Bookmark,
  Download, Minus, User, Sparkles, Crown, Zap, BarChart3, Globe, ArrowUp, ArrowDown,
  Search, AlertTriangle, X, Copy, Shield, Percent, Video, Award, Flame, Layout,
  PieChart, Hash, Layers, ArrowRight, PlayCircle, Bell,
} from "lucide-react";
import { format, parseISO, differenceInDays, isWithinInterval, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import {
  useMarketingAnalytics, useCreateMarketing, useDeleteMarketingItem,
  useMarketingHistoricalData, useUpdateMarketingItem, useCreateManyMarketingItems,
} from "../../tanstack/marketing-tanstack";
import {
  MarketingFilters, CreateMarketingItemRequest, CreateMarketingLinkRequest,
  MarketingItem, MarketingLink, MarketingLinkMetadata, UpdateMarketingItemRequest,
} from "../../../data/model/marketing-entity";

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM TYPE (fix TS error)
// ─────────────────────────────────────────────────────────────────────────────
type PlatformType = "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "GOOGLE" | "TWITTER" | "OTHER";
const PLATFORM_OPTIONS: PlatformType[] = ["FACEBOOK", "INSTAGRAM", "TIKTOK", "YOUTUBE", "GOOGLE", "TWITTER", "OTHER"];

const makeLinkDefault = (): CreateMarketingLinkRequest => ({ link: "", platform: "FACEBOOK" as PlatformType });
const makeItemDefault = (): CreateMarketingItemRequest => ({ name: "", description: "", cost: 0, duration: 7, start_date: new Date().toISOString().split('T')[0], links: [makeLinkDefault()] });

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n: number) => { if (!n || isNaN(n)) return '0'; if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`; if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`; if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`; return n.toLocaleString(); };
const fmtRM = (n: number) => `RM${n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : n.toLocaleString()}`;
const COLORS = ['#8b5cf6', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];
const PLAT_COLORS: Record<string, string> = { FACEBOOK: '#3b82f6', INSTAGRAM: '#ec4899', TIKTOK: '#10b981', YOUTUBE: '#ef4444', GOOGLE: '#f59e0b', TWITTER: '#06b6d4', OTHER: '#8b5cf6' };

type ChartMode = 'area' | 'line' | 'bar';
type MainTab = 'overview' | 'campaigns' | 'analytics' | 'timeline';

// ─────────────────────────────────────────────────────────────────────────────
// MICRO COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const PulseDot: React.FC<{ color?: string; size?: number }> = ({ color = 'var(--preset-primary)', size = 7 }) => (
  <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, flexShrink: 0 }}>
    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.4, animation: 'mk-pulse 2s ease-in-out infinite' }} />
    <span style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'block' }} />
  </span>
);

const AnimNum: React.FC<{ value: number; format?: (v: number) => string }> = ({ value, format: f }) => {
  const [n, setN] = useState(0); const raf = useRef(0);
  useEffect(() => { const s = performance.now(), d = 800; const t = (now: number) => { const p = Math.min((now - s) / d, 1), e = 1 - Math.pow(1 - p, 3); setN(Math.floor(e * value)); if (p < 1) raf.current = requestAnimationFrame(t); }; raf.current = requestAnimationFrame(t); return () => cancelAnimationFrame(raf.current); }, [value]);
  return <>{f ? f(n) : n.toLocaleString()}</>;
};

const ChartTip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div className="chart-tip" style={{ background: '#141c2b', border: '1px solid rgba(var(--preset-primary-rgb),.2)', borderRadius: 10, padding: '9px 13px', fontSize: 12, backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,.4)' }}>
    {label && <div style={{ color: 'rgba(255,255,255,.4)', marginBottom: 5, fontSize: 11 }}>{label}</div>}
    {payload.map((p: any, i: number) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,.8)', marginBottom: 2 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.color || p.fill, flexShrink: 0 }} />
      <span style={{ color: 'rgba(255,255,255,.4)', marginRight: 2 }}>{p.name}:</span>
      <b>{typeof p.value === 'number' ? `RM${p.value.toFixed(2)}` : p.value}</b>
    </div>))}
  </div>);
};

const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.025)', padding: '18px 20px', position: 'relative', overflow: 'hidden', ...style }}>{children}</div>
);

const PanelHeader: React.FC<{ title: string; subtitle?: string; icon: React.ReactNode; iconColor?: string; action?: React.ReactNode }> = ({ title, subtitle, icon, iconColor = 'var(--preset-primary)', action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: `${iconColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, flexShrink: 0 }}>{icon}</div>
      <div><div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.2px' }}>{title}</div>{subtitle && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.38)', marginTop: 1 }}>{subtitle}</div>}</div>
    </div>{action}
  </div>
);

const MiniBar: React.FC<{ value: number; max: number; color?: string; height?: number }> = ({ value, max, color = 'var(--preset-primary)', height = 3 }) => (
  <div style={{ height, background: 'rgba(255,255,255,.07)', borderRadius: 99, overflow: 'hidden' }}>
    <div style={{ width: `${max > 0 ? Math.min((value / max) * 100, 100) : 0}%`, height: '100%', background: color, borderRadius: 99, transition: 'width .8s cubic-bezier(.4,0,.2,1)' }} />
  </div>
);

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; action?: React.ReactNode }> = ({ icon, title, subtitle, action }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', gap: 10 }}>
    <div style={{ opacity: .25 }}>{icon}</div><div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,.5)' }}>{title}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>{subtitle}</div>{action}
  </div>
);

const StatusBadge: React.FC<{ item: MarketingItem }> = ({ item }) => {
  const now = new Date(), s = new Date(item.start_date), e = new Date(item.end_date);
  if (now < s) return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 5, background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.3)', fontSize: 9, fontWeight: 800, color: '#818cf8', letterSpacing: '.05em' }}><Clock style={{ width: 8, height: 8 }} />UPCOMING</span>;
  if (now >= s && now <= e) return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 5, background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)', fontSize: 9, fontWeight: 800, color: '#10b981', letterSpacing: '.05em' }}><Activity style={{ width: 8, height: 8 }} />ACTIVE</span>;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 5, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,.4)', letterSpacing: '.05em' }}><CheckCircle style={{ width: 8, height: 8 }} />DONE</span>;
};

const PlatBadge: React.FC<{ platform: string }> = ({ platform }) => {
  const c = PLAT_COLORS[platform] || 'rgba(255,255,255,.3)';
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 5, background: `${c}15`, border: `1px solid ${c}33`, fontSize: 9, fontWeight: 800, color: c, letterSpacing: '.04em' }}>{platform}</span>;
};

const ChartModeBtn: React.FC<{ mode: ChartMode; current: ChartMode; label: string; icon: React.ReactNode; onClick: () => void }> = ({ mode, current, label, icon, onClick }) => (
  <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: 'none', transition: 'all .15s', ...(current === mode ? { background: 'var(--preset-primary)', color: '#fff', boxShadow: '0 2px 8px rgba(var(--preset-primary-rgb),.3)' } : { background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.4)' }) }}>
    {icon}{label}
  </button>
);


// ─────────────────────────────────────────────────────────────────────────────
// SPEND CHART (with chart type switcher)
// ─────────────────────────────────────────────────────────────────────────────
const SpendChart: React.FC<{ startDate: Date; endDate: Date; platform?: string }> = ({ startDate, endDate, platform }) => {
  const [showMonthly, setShowMonthly] = useState(false);
  const [chartMode, setChartMode] = useState<ChartMode>('area');
  const { data: res, isLoading, error } = useMarketingHistoricalData({ start_date: format(startDate, 'yyyy-MM-dd'), end_date: format(endDate, 'yyyy-MM-dd'), platform });

  const chartData = useMemo(() => {
    if (!res?.data?.historicalData) return [];
    if (showMonthly) {
      const m: Record<string, any> = {};
      res.data.historicalData.forEach(p => { const k = format(new Date(p.start_date), 'yyyy-MM'), d = format(new Date(p.start_date), 'MMM yyyy'); if (!m[k]) m[k] = { date: d, spend: 0, formattedDate: d, k }; m[k].spend += p.value; });
      return Object.values(m).sort((a: any, b: any) => a.k.localeCompare(b.k));
    }
    return res.data.historicalData.map(p => ({ date: format(new Date(p.start_date), 'MMM dd'), spend: p.value, formattedDate: format(new Date(p.start_date), 'MMMM dd, yyyy') }));
  }, [res, showMonthly]);

  const total = chartData.reduce((s, i) => s + i.spend, 0);
  const avg = chartData.length ? total / chartData.length : 0;
  const peak = chartData.length ? Math.max(...chartData.map(d => d.spend)) : 0;

  const renderChart = () => {
    const common = { data: chartData, margin: { top: 5, right: 5, left: -20, bottom: 0 } };
    const axisProps = { tick: { fontSize: 9, fill: 'rgba(255,255,255,.25)' }, tickLine: false, axisLine: false };
    const gridProps = { strokeDasharray: "2 2", stroke: "rgba(255,255,255,.04)", vertical: false };

    if (chartMode === 'bar') return (
      <BarChart {...common}>
        <CartesianGrid {...gridProps as any} />
        <XAxis dataKey="date" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={(v: number) => `RM${v}`} />
        <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
        <Bar dataKey="spend" name="Spend" radius={[4, 4, 0, 0]} maxBarSize={20}>
          {chartData.map((_, i) => <Cell key={i} fill={i === chartData.length - 1 ? 'var(--preset-primary)' : `rgba(var(--preset-primary-rgb),${0.3 + (i / chartData.length) * 0.5})`} />)}
        </Bar>
      </BarChart>
    );
    if (chartMode === 'line') return (
      <LineChart {...common}>
        <CartesianGrid {...gridProps as any} />
        <XAxis dataKey="date" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={(v: number) => `RM${v}`} />
        <Tooltip content={<ChartTip />} />
        <Line type="monotone" dataKey="spend" name="Spend" stroke="var(--preset-primary)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--preset-primary)', strokeWidth: 0 }} activeDot={{ r: 5, stroke: 'var(--preset-primary)', strokeWidth: 2 }} />
      </LineChart>
    );
    return (
      <AreaChart {...common}>
        <defs><linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--preset-primary)" stopOpacity={0.25} /><stop offset="100%" stopColor="var(--preset-primary)" stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid {...gridProps as any} />
        <XAxis dataKey="date" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={(v: number) => `RM${v}`} />
        <Tooltip content={<ChartTip />} />
        <Area type="monotone" dataKey="spend" name="Spend" stroke="var(--preset-primary)" strokeWidth={2} fill="url(#spendGrad)" dot={false} />
      </AreaChart>
    );
  };

  return (
    <Panel style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.2px' }}>Spend Overview</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 10, color: 'rgba(255,255,255,.35)' }}>
            <span>Total: <b style={{ color: 'rgba(255,255,255,.7)' }}>{fmtRM(total)}</b></span>
            <span>Avg: <b style={{ color: 'rgba(255,255,255,.7)' }}>{fmtRM(avg)}</b>/{showMonthly ? 'mo' : 'day'}</span>
            <span>Peak: <b style={{ color: '#f59e0b' }}>{fmtRM(peak)}</b></span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <ChartModeBtn mode="area" current={chartMode} label="Area" icon={<TrendingUp style={{ width: 10, height: 10 }} />} onClick={() => setChartMode('area')} />
          <ChartModeBtn mode="line" current={chartMode} label="Line" icon={<Activity style={{ width: 10, height: 10 }} />} onClick={() => setChartMode('line')} />
          <ChartModeBtn mode="bar" current={chartMode} label="Bar" icon={<BarChart3 style={{ width: 10, height: 10 }} />} onClick={() => setChartMode('bar')} />
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,.08)', margin: '0 4px' }} />
          <button onClick={() => setShowMonthly(!showMonthly)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, background: 'rgba(255,255,255,.05)', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            <CalendarIcon style={{ width: 10, height: 10 }} />{showMonthly ? 'Daily' : 'Monthly'}
          </button>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {isLoading ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><RefreshCw style={{ width: 16, height: 16, color: 'var(--preset-primary)', animation: 'mk-spin 1s linear infinite' }} /></div>
          : error || chartData.length === 0 ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 11, color: 'rgba(255,255,255,.3)' }}>No spend data</div>
            : <ResponsiveContainer width="100%" height="100%">{renderChart()}</ResponsiveContainer>}
      </div>
    </Panel>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// METRICS DISPLAY
// ─────────────────────────────────────────────────────────────────────────────
const MetricsDisplay: React.FC<{ link: MarketingLink }> = ({ link }) => {
  if (!link.metadata) return (
    <div style={{ padding: '10px 12px', borderRadius: 9, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
      <PlatBadge platform={link.platform} /><span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>No metrics</span>
      <a href={link.link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--preset-primary)', fontWeight: 700 }}><ExternalLink style={{ width: 9, height: 9 }} />View</a>
    </div>
  );

  const md = link.metadata;
  const metrics = link.platform === 'TWITTER'
    ? [{ l: 'Views', v: md.views, d: md['24h_change_views'], icon: <Eye /> }, { l: 'Likes', v: md.likes, d: md['24h_change_likes'], icon: <Heart /> }, { l: 'Replies', v: md.replies, d: md['24h_change_replies'], icon: <MessageCircle /> }, { l: 'Retweets', v: md.retweets, d: md['24h_change_retweets'], icon: <Share /> }, { l: 'Bookmarks', v: md.bookmarks, d: md['24h_change_bookmarks'], icon: <Bookmark /> }]
    : [{ l: 'Views', v: md.views, d: md['24h_change_views'], icon: <Eye /> }, { l: 'Likes', v: md.likes, d: md['24h_change_likes'], icon: <Heart /> }, { l: 'Comments', v: md.comments, d: md['24h_change_comments'], icon: <MessageCircle /> }, { l: 'Shares', v: md.shares, d: md['24h_change_shares'], icon: <Share /> }, { l: 'Saves', v: md.saves, d: md['24h_change_saves'], icon: <Bookmark /> }];

  return (
    <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><PlatBadge platform={link.platform} /><a href={link.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--preset-primary)', fontWeight: 700 }}><ExternalLink style={{ width: 9, height: 9 }} />View</a></div>
        {md.last_tracked && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: 'rgba(255,255,255,.25)' }}><Clock style={{ width: 9, height: 9 }} />{format(parseISO(md.last_tracked), 'MMM dd, HH:mm')}</div>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${metrics.length},1fr)`, gap: 6 }}>
        {metrics.map((m, i) => {
          const val = m.v; const delta = typeof m.d === 'number' ? m.d : 0;
          const fv = (val === undefined || val === null || val === 'not found') ? 'N/A' : typeof val === 'number' ? fmt(val) : val;
          return (<div key={i} style={{ textAlign: 'center', padding: '6px 4px', borderRadius: 7, background: 'rgba(255,255,255,.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', color: 'rgba(255,255,255,.25)', marginBottom: 3 }}>{React.cloneElement(m.icon, { style: { width: 10, height: 10 } })}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,.85)' }}>{fv}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>{m.l}</div>
            {delta !== 0 && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              {delta > 0 ? <ArrowUp style={{ width: 7, height: 7, color: '#10b981' }} /> : <ArrowDown style={{ width: 7, height: 7, color: '#ef4444' }} />}
              <span style={{ fontSize: 8, fontWeight: 800, color: delta > 0 ? '#10b981' : '#ef4444' }}>{delta > 0 ? '+' : ''}{fmt(delta)}</span>
            </div>}
          </div>);
        })}
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN HEALTH SCORE
// ─────────────────────────────────────────────────────────────────────────────
const CampaignHealthScore: React.FC<{ items: MarketingItem[] }> = ({ items }) => {
  const health = useMemo(() => {
    if (!items.length) return { score: 0, label: 'N/A', color: 'rgba(255,255,255,.3)' };
    const now = new Date();
    const activeRatio = items.filter(i => { const s = new Date(i.start_date), e = new Date(i.end_date); return now >= s && now <= e; }).length / items.length;
    const hasLinks = items.filter(i => i.marketing_links?.length > 0).length / items.length;
    const score = Math.round((activeRatio * 50) + (hasLinks * 30) + (items.length > 2 ? 20 : items.length * 10));
    const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work';
    const color = score >= 80 ? '#10b981' : score >= 60 ? '#6366f1' : score >= 40 ? '#f59e0b' : '#ef4444';
    return { score, label, color };
  }, [items]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: 36, height: 36 }}>
        <svg width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="3" /><circle cx="18" cy="18" r="15" fill="none" stroke={health.color} strokeWidth="3" strokeDasharray={`${health.score * 0.94} 94`} strokeLinecap="round" transform="rotate(-90 18 18)" style={{ transition: 'stroke-dasharray .8s ease' }} /></svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: health.color }}>{health.score}</div>
      </div>
      <div><div style={{ fontSize: 10, fontWeight: 800, color: health.color }}>{health.label}</div><div style={{ fontSize: 8, color: 'rgba(255,255,255,.25)', textTransform: 'uppercase' }}>Health</div></div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM SPEND BREAKDOWN
// ─────────────────────────────────────────────────────────────────────────────
const PlatformBreakdown: React.FC<{ items: MarketingItem[] }> = ({ items }) => {
  const breakdown = useMemo(() => {
    const m: Record<string, number> = {};
    items.forEach(item => {
      item.marketing_links?.forEach(link => { m[link.platform] = (m[link.platform] || 0) + item.cost / (item.marketing_links?.length || 1); });
      if (!item.marketing_links?.length) m['UNLINKED'] = (m['UNLINKED'] || 0) + item.cost;
    });
    const total = Object.values(m).reduce((s, v) => s + v, 0);
    return Object.entries(m).map(([k, v], i) => ({ name: k, value: Math.round(v), pct: total > 0 ? (v / total) * 100 : 0, fill: PLAT_COLORS[k] || COLORS[i % COLORS.length] })).sort((a, b) => b.value - a.value);
  }, [items]);
  if (!breakdown.length) return null;

  return (
    <Panel>
      <PanelHeader title="Spend by Platform" subtitle="Budget distribution" icon={<Globe style={{ width: 14, height: 14 }} />} iconColor="#ec4899" />
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 90, height: 90, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart><Pie data={breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={38} innerRadius={22} strokeWidth={0} paddingAngle={2}>{breakdown.map((d, i) => <Cell key={i} fill={d.fill} />)}</Pie></RePieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {breakdown.slice(0, 5).map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.fill, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', flex: 1 }}>{p.name}</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.7)' }}>{fmtRM(p.value)}</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', minWidth: 30, textAlign: 'right' }}>{p.pct.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// SPEND VELOCITY
// ─────────────────────────────────────────────────────────────────────────────
const SpendVelocity: React.FC<{ items: MarketingItem[] }> = ({ items }) => {
  const velocity = useMemo(() => {
    if (!items.length) return { daily: 0, weekly: 0, monthly: 0, burnRate: 'N/A' };
    const now = new Date();
    const active = items.filter(i => { const s = new Date(i.start_date), e = new Date(i.end_date); return now >= s && now <= e; });
    const dailySpend = active.reduce((s, i) => s + (i.cost / Math.max(i.duration, 1)), 0);
    const totalBudget = items.reduce((s, i) => s + i.cost, 0);
    const spent = items.filter(i => new Date(i.end_date) <= now).reduce((s, i) => s + i.cost, 0) + active.reduce((s, i) => { const elapsed = Math.max(0, (now.getTime() - new Date(i.start_date).getTime()) / (1000 * 60 * 60 * 24)); return s + (i.cost * Math.min(elapsed / Math.max(i.duration, 1), 1)); }, 0);
    const remaining = totalBudget - spent;
    const daysLeft = dailySpend > 0 ? Math.round(remaining / dailySpend) : 0;
    return { daily: dailySpend, weekly: dailySpend * 7, monthly: dailySpend * 30, burnRate: daysLeft > 0 ? `${daysLeft} days left` : 'Budget spent' };
  }, [items]);

  return (
    <Panel>
      <PanelHeader title="Spend Velocity" subtitle="Current burn rate" icon={<Zap style={{ width: 14, height: 14 }} />} iconColor="#f59e0b"
        action={<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><PulseDot size={5} color="#10b981" /><span style={{ fontSize: 9, color: '#10b981', fontWeight: 700 }}>Live</span></div>} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[{ l: 'Daily', v: fmtRM(velocity.daily), c: '#f59e0b' }, { l: 'Weekly', v: fmtRM(velocity.weekly), c: '#8b5cf6' }, { l: 'Monthly', v: fmtRM(velocity.monthly), c: '#ec4899' }].map((m, i) => (
          <div key={i} style={{ textAlign: 'center', padding: '10px 8px', borderRadius: 9, background: `${m.c}08`, border: `1px solid ${m.c}18` }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: m.c, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{m.l}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: m.c }}>{m.v}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', padding: '8px', borderRadius: 8, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginBottom: 2 }}>Budget Runway</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: velocity.daily > 0 ? '#f59e0b' : 'rgba(255,255,255,.4)' }}>{velocity.burnRate}</div>
      </div>
    </Panel>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// TOP PERFORMERS (new feature)
// ─────────────────────────────────────────────────────────────────────────────
const TopPerformers: React.FC<{ items: MarketingItem[] }> = ({ items }) => {
  const ranked = useMemo(() => {
    return items
      .map(item => {
        const totalEngagement = item.marketing_links?.reduce((s, link) => {
          if (!link.metadata) return s;
          const views = typeof link.metadata.views === 'number' ? link.metadata.views : 0;
          const likes = typeof link.metadata.likes === 'number' ? link.metadata.likes : 0;
          return s + views + likes;
        }, 0) || 0;
        const costPerEngagement = totalEngagement > 0 ? item.cost / totalEngagement : Infinity;
        return { ...item, totalEngagement, costPerEngagement };
      })
      .filter(i => i.totalEngagement > 0)
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, 5);
  }, [items]);

  if (!ranked.length) return null;
  const maxEng = ranked[0]?.totalEngagement || 1;

  return (
    <Panel>
      <PanelHeader title="Top Performers" subtitle="Best ROI marketing items" icon={<Award style={{ width: 14, height: 14 }} />} iconColor="#10b981" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ranked.map((item, i) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 9, background: i === 0 ? 'rgba(16,185,129,.06)' : 'rgba(255,255,255,.02)', border: `1px solid ${i === 0 ? 'rgba(16,185,129,.15)' : 'rgba(255,255,255,.06)'}` }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, flexShrink: 0, ...(i === 0 ? { background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#fff' } : { background: 'rgba(var(--preset-primary-rgb),.1)', color: 'var(--preset-primary)' }) }}>{i === 0 ? <Crown style={{ width: 10, height: 10 }} /> : i + 1}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
              <MiniBar value={item.totalEngagement} max={maxEng} color={i === 0 ? '#10b981' : 'var(--preset-primary)'} height={3} />
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: '#10b981' }}>{fmt(item.totalEngagement)}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>{fmtRM(item.cost)} spent</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN TIMELINE (new tab feature)
// ─────────────────────────────────────────────────────────────────────────────
const CampaignTimeline: React.FC<{ items: MarketingItem[] }> = ({ items }) => {
  const sorted = useMemo(() => [...items].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()), [items]);
  const now = new Date();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', paddingLeft: 24 }}>
      {/* Vertical line */}
      <div style={{ position: 'absolute', left: 10, top: 12, bottom: 12, width: 2, background: 'rgba(255,255,255,.06)', borderRadius: 1 }} />

      {sorted.map((item, i) => {
        const isActive = now >= new Date(item.start_date) && now <= new Date(item.end_date);
        const isUpcoming = now < new Date(item.start_date);
        const dotColor = isActive ? '#10b981' : isUpcoming ? '#6366f1' : 'rgba(255,255,255,.2)';
        const daysTotal = item.duration;
        const daysElapsed = isActive ? differenceInDays(now, new Date(item.start_date)) : isUpcoming ? 0 : daysTotal;
        const progress = daysTotal > 0 ? Math.min((daysElapsed / daysTotal) * 100, 100) : 0;

        return (
          <div key={item.id} style={{ position: 'relative', paddingBottom: 20, animation: `mk-up .4s ease ${i * .05}s both` }}>
            {/* Dot */}
            <div style={{ position: 'absolute', left: -20, top: 14, width: 12, height: 12, borderRadius: '50%', background: dotColor, border: '3px solid #0f1724', zIndex: 1 }}>
              {isActive && <span style={{ position: 'absolute', inset: -3, borderRadius: '50%', background: dotColor, opacity: 0.3, animation: 'mk-pulse 2s infinite' }} />}
            </div>

            <div style={{ padding: '12px 16px', borderRadius: 11, border: `1px solid ${isActive ? 'rgba(16,185,129,.2)' : 'rgba(255,255,255,.06)'}`, background: isActive ? 'rgba(16,185,129,.04)' : 'rgba(255,255,255,.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 800 }}>{item.name}</span>
                    <StatusBadge item={item} />
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{item.marketing?.name || 'Campaign'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--preset-primary)' }}>{fmtRM(item.cost)}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>{item.duration} days</div>
                </div>
              </div>

              {/* Timeline bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', flexShrink: 0 }}>{format(new Date(item.start_date), 'MMM d')}</span>
                <div style={{ flex: 1 }}><MiniBar value={progress} max={100} color={isActive ? '#10b981' : isUpcoming ? '#6366f1' : 'rgba(255,255,255,.15)'} height={4} /></div>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', flexShrink: 0 }}>{format(new Date(item.end_date), 'MMM d')}</span>
              </div>

              {/* Platforms */}
              <div style={{ display: 'flex', gap: 4 }}>
                {item.marketing_links?.map((l: any, li: number) => <PlatBadge key={li} platform={l.platform} />)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS TAB (new)
// ─────────────────────────────────────────────────────────────────────────────
const AnalyticsTab: React.FC<{ items: MarketingItem[]; analytics: any }> = ({ items, analytics: a }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const completed = items.filter(i => new Date(i.end_date) <= now);
    const active = items.filter(i => now >= new Date(i.start_date) && now <= new Date(i.end_date));
    const upcoming = items.filter(i => now < new Date(i.start_date));
    const avgDuration = items.length ? items.reduce((s, i) => s + i.duration, 0) / items.length : 0;
    const totalEngagement = items.reduce((s, item) => s + (item.marketing_links?.reduce((ls, link) => ls + (typeof link.metadata?.views === 'number' ? link.metadata.views : 0), 0) || 0), 0);
    const costPerView = totalEngagement > 0 ? a.totalCost / totalEngagement : 0;
    const platforms = new Set(items.flatMap(i => i.marketing_links?.map(l => l.platform) || []));
    return { completed: completed.length, active: active.length, upcoming: upcoming.length, avgDuration: Math.round(avgDuration), totalEngagement, costPerView, platformCount: platforms.size };
  }, [items, a]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10 }}>
        {[
          { label: 'Completed', value: stats.completed.toString(), icon: <CheckCircle style={{ width: 14, height: 14 }} />, accent: '#10b981' },
          { label: 'Active Now', value: stats.active.toString(), icon: <Activity style={{ width: 14, height: 14 }} />, accent: '#6366f1' },
          { label: 'Upcoming', value: stats.upcoming.toString(), icon: <Clock style={{ width: 14, height: 14 }} />, accent: '#f59e0b' },
          { label: 'Avg Duration', value: `${stats.avgDuration}d`, icon: <CalendarIcon style={{ width: 14, height: 14 }} />, accent: '#ec4899' },
          { label: 'Total Reach', value: fmt(stats.totalEngagement), icon: <Eye style={{ width: 14, height: 14 }} />, accent: '#06b6d4' },
          { label: 'Cost per View', value: stats.costPerView > 0 ? `RM${stats.costPerView.toFixed(3)}` : 'N/A', icon: <DollarSign style={{ width: 14, height: 14 }} />, accent: '#ef4444' },
        ].map((k, i) => (
          <div key={i} style={{ borderRadius: 13, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.03)', padding: '14px 16px', position: 'relative', overflow: 'hidden', animation: `mk-up .45s ease ${i * .06}s both` }}>
            <div style={{ position: 'absolute', top: '-40%', right: '-15%', width: 90, height: 90, borderRadius: '50%', background: `radial-gradient(circle,${k.accent}18,transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: `${k.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.accent }}>{k.icon}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>{k.label}</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.4px', color: 'rgba(255,255,255,.92)' }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TopPerformers items={items} />
        <PlatformBreakdown items={items} />
      </div>

      {/* Cost efficiency insight */}
      <Panel>
        <PanelHeader title="Cost Efficiency Insights" subtitle="How effectively your budget converts" icon={<Sparkles style={{ width: 14, height: 14 }} />} iconColor="#6366f1" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
          {[
            { title: 'Budget Utilization', value: a.totalCost > 0 ? `${Math.round((items.filter(i => new Date(i.end_date) <= new Date()).reduce((s, i) => s + i.cost, 0) / a.totalCost) * 100)}%` : '0%', desc: 'Of total budget has been deployed', color: '#10b981', icon: <Percent style={{ width: 13, height: 13 }} /> },
            { title: 'Platform Diversity', value: `${stats.platformCount} platforms`, desc: 'Diversified presence reduces risk', color: '#8b5cf6', icon: <Globe style={{ width: 13, height: 13 }} /> },
            { title: 'Campaign Velocity', value: `${(items.length / Math.max(1, differenceInDays(new Date(), new Date(Math.min(...items.map(i => new Date(i.start_date).getTime())))) / 30)).toFixed(1)}/mo`, desc: 'Average new items per month', color: '#f59e0b', icon: <Zap style={{ width: 13, height: 13 }} /> },
          ].map((insight, i) => (
            <div key={i} style={{ padding: '14px 16px', borderRadius: 11, background: `${insight.color}08`, border: `1px solid ${insight.color}22` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, color: insight.color }}>{insight.icon}<span style={{ fontSize: 12, fontWeight: 800 }}>{insight.title}</span></div>
              <div style={{ fontSize: 22, fontWeight: 900, color: insight.color, marginBottom: 4 }}>{insight.value}</div>
              <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,.35)', lineHeight: 1.5 }}>{insight.desc}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// MAIN: MarketingScreen
// ─────────────────────────────────────────────────────────────────────────────
const MarketingScreen = () => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const [dateRange, setDateRange] = useState({ startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)), endDate: new Date() });
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketingItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
  const [mainTab, setMainTab] = useState<MainTab>('overview');

  // Create campaign form with proper types
  const [campaignForm, setCampaignForm] = useState<{ name: string; description: string; items: CreateMarketingItemRequest[] }>({
    name: '', description: '', items: [makeItemDefault()]
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  const apiFilters: MarketingFilters = useMemo(() => { const f: MarketingFilters = { start_date: format(dateRange.startDate, 'yyyy-MM-dd'), end_date: format(dateRange.endDate, 'yyyy-MM-dd') }; if (selectedPlatform !== 'all') f.platform = selectedPlatform; return f; }, [dateRange, selectedPlatform]);
  const { analytics, isLoading, error, marketingItems } = useMarketingAnalytics(apiFilters);
  const createMutation = useCreateMarketing();
  const deleteMutation = useDeleteMarketingItem();

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return marketingItems;
    const q = searchQuery.toLowerCase();
    return marketingItems.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.marketing.name.toLowerCase().includes(q));
  }, [marketingItems, searchQuery]);

  const grouped = useMemo(() => {
    const m: Record<string, { month: string; campaigns: any[] }> = {};
    filteredItems.forEach(item => {
      const mk = format(new Date(item.start_date), 'yyyy-MM');
      if (!m[mk]) m[mk] = { month: format(new Date(item.start_date), 'MMMM yyyy'), campaigns: [] };
      const ex = m[mk].campaigns.find((c: any) => c.campaign.id === item.marketing_id);
      if (ex) ex.items.push(item); else m[mk].campaigns.push({ campaign: item.marketing, items: [item] });
    });
    return Object.entries(m).sort(([a], [b]) => b.localeCompare(a)).map(([k, d]) => ({ monthKey: k, ...d }));
  }, [filteredItems]);

  const toggleMonth = (k: string) => setExpandedMonths(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const toggleCampaign = (id: string) => setExpandedCampaigns(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleDelete = async (id: string) => { setItemToDelete(id); setDeleteDialogOpen(true); };
  const confirmDelete = async () => { if (!itemToDelete) return; try { await deleteMutation.mutateAsync(itemToDelete); setDeleteDialogOpen(false); setItemToDelete(null); } catch (e) { console.error(e); } };

  // Helper to update campaign form items with correct types
  const updateFormItem = (idx: number, field: string, value: any) => {
    setCampaignForm(prev => ({
      ...prev,
      items: prev.items.map((it, i) => i === idx ? { ...it, [field]: value } : it)
    }));
  };

  const updateFormLink = (itemIdx: number, linkIdx: number, field: string, value: string) => {
    setCampaignForm(prev => ({
      ...prev,
      items: prev.items.map((it, i) => i === itemIdx ? {
        ...it,
        links: it.links.map((l, j) => j === linkIdx ? { ...l, [field]: field === 'platform' ? value as PlatformType : value } : l)
      } : it)
    }));
  };

  const addFormLink = (itemIdx: number) => {
    setCampaignForm(prev => ({
      ...prev,
      items: prev.items.map((it, i) => i === itemIdx ? { ...it, links: [...it.links, makeLinkDefault()] } : it)
    }));
  };

  const removeFormLink = (itemIdx: number, linkIdx: number) => {
    setCampaignForm(prev => ({
      ...prev,
      items: prev.items.map((it, i) => i === itemIdx ? { ...it, links: it.links.filter((_, j) => j !== linkIdx) } : it)
    }));
  };

  const addFormItem = () => {
    setCampaignForm(prev => ({ ...prev, items: [...prev.items, makeItemDefault()] }));
  };

  const removeFormItem = (idx: number) => {
    setCampaignForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const validateAndCreate = async () => {
    const errs: string[] = [];
    if (!campaignForm.name.trim()) errs.push('Campaign name is required');
    campaignForm.items.forEach((item, i) => { if (!item.name.trim()) errs.push(`Item ${i + 1}: Name required`); if (item.cost <= 0) errs.push(`Item ${i + 1}: Cost must be > 0`); if (!item.start_date) errs.push(`Item ${i + 1}: Start date required`); });
    if (errs.length) { setValidationErrors(errs); setShowValidation(true); return; }
    try {
      await createMutation.mutateAsync({ name: campaignForm.name, marketing_items: campaignForm.items.map(i => ({ ...i, start_date: new Date(i.start_date).toISOString() })) });
      setIsDialogOpen(false); setCampaignForm({ name: '', description: '', items: [makeItemDefault()] });
    } catch (e) { console.error(e); }
  };

  const TABS: { key: MainTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <Layout style={{ width: 12, height: 12 }} /> },
    { key: 'campaigns', label: 'Campaigns', icon: <Target style={{ width: 12, height: 12 }} /> },
    { key: 'analytics', label: 'Analytics', icon: <BarChart3 style={{ width: 12, height: 12 }} /> },
    { key: 'timeline', label: 'Timeline', icon: <Clock style={{ width: 12, height: 12 }} /> },
  ];

  const globalStyles = `
    @keyframes mk-pulse{0%,100%{transform:scale(1);opacity:.4}50%{transform:scale(2.4);opacity:0}}
    @keyframes mk-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes mk-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    .marketing-theme.light-mode{background:#f8fafc;color:#111827;}
    .marketing-theme.light-mode [style*="rgba(255,255,255"], .marketing-theme.light-mode [style*="rgba(255, 255, 255"]{
      color:rgba(17,24,39,.86)!important;border-color:rgba(var(--preset-primary-rgb),.16)!important;
    }
    .marketing-theme.light-mode .chart-tip{
      background:rgba(255,255,255,.98)!important;border:1px solid rgba(var(--preset-primary-rgb),.2)!important;box-shadow:0 8px 24px rgba(15,23,42,.12)!important;
    }
    .marketing-theme.light-mode .recharts-cartesian-grid line{stroke:rgba(148,163,184,.24)!important;}
    .marketing-theme.light-mode .recharts-text,.marketing-theme.light-mode .recharts-legend-item-text,.marketing-theme.light-mode svg text,.marketing-theme.light-mode svg tspan{fill:rgba(30,41,59,.82)!important;}
  `;

  if (error) return (<><style>{globalStyles}</style><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,.88)' }}><EmptyState icon={<AlertCircle style={{ width: 32, height: 32 }} />} title="Error Loading Data" subtitle="Failed to load marketing data" action={<button onClick={() => window.location.reload()} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 16px', borderRadius: 8, background: 'var(--preset-primary)', color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}><RefreshCw style={{ width: 12, height: 12 }} />Retry</button>} /></div></>);

  return (
    <>
      <style>{globalStyles}</style>
      <div className={`marketing-theme ${isLight ? 'light-mode' : ''} h-full overflow-y-auto`} style={{ color: isLight ? '#111827' : 'rgba(255,255,255,.88)', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif" }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '16px 24px', background: isLight ? '#ffffff' : 'transparent' }}>

          {/* ═══ HEADER ═══ */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(var(--preset-primary-rgb),.35)', flexShrink: 0 }}><DollarSign style={{ width: 18, height: 18, color: '#fff' }} /></div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.15 }}>Personal Marketing Hub</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3 }}><PulseDot size={6} /><span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase' }}>Campaign Manager</span></div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.35)', lineHeight: 1.6, maxWidth: 500 }}>Track marketing spend, campaign performance, and ROI across all platforms in real-time.</p>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <Popover>
                <PopoverTrigger asChild><button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 9, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', height: 33 }}><Filter style={{ width: 11, height: 11, color: 'var(--preset-primary)' }} />{selectedPlatform === 'all' ? 'All Platforms' : selectedPlatform}</button></PopoverTrigger>
                <PopoverContent className="w-auto p-2 bg-[#141c2b] border border-white/10 shadow-2xl z-[100]" align="end" sideOffset={8}>
                  {['all', ...PLATFORM_OPTIONS].map(p => (
                    <button key={p} onClick={() => setSelectedPlatform(p)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 10px', borderRadius: 7, background: selectedPlatform === p ? 'rgba(var(--preset-primary-rgb),.15)' : 'transparent', border: 'none', color: selectedPlatform === p ? 'var(--preset-primary)' : 'rgba(255,255,255,.6)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{p === 'all' ? 'All Platforms' : p}</button>
                  ))}
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild><button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 9, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', height: 33 }}><CalendarIcon style={{ width: 11, height: 11, color: 'var(--preset-primary)' }} />{format(dateRange.startDate, 'MMM d')} – {format(dateRange.endDate, 'MMM d, yyyy')}</button></PopoverTrigger>
                <PopoverContent className="w-auto p-4 bg-[#141c2b] border border-white/10 shadow-2xl z-[100]" align="end" sideOffset={8}>
                  <div className="flex gap-4"><div className="space-y-2"><label className="text-xs font-medium text-white/50">From</label><Calendar mode="single" selected={dateRange.startDate} onSelect={d => d && setDateRange(p => ({ ...p, startDate: d }))} className="rounded-xl" /></div><div className="space-y-2"><label className="text-xs font-medium text-white/50">To</label><Calendar mode="single" selected={dateRange.endDate} onSelect={d => d && setDateRange(p => ({ ...p, endDate: d }))} className="rounded-xl" /></div></div>
                </PopoverContent>
              </Popover>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild><button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 9, background: 'linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))', border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', height: 33, boxShadow: '0 4px 14px rgba(var(--preset-primary-rgb),.28)' }}><Plus style={{ width: 12, height: 12 }} />New Campaign</button></DialogTrigger>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0f1724] border border-white/10">
                  <DialogHeader><DialogTitle className="text-lg font-bold text-white">Create New Campaign</DialogTitle><DialogDescription className="text-white/40">Add campaign details and marketing items</DialogDescription></DialogHeader>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div><label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)' }}>Campaign Name</label><input value={campaignForm.name} onChange={e => setCampaignForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Holiday Beauty Collection" style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 8, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.8)', fontSize: 12, outline: 'none', fontFamily: 'inherit', marginTop: 4 }} /></div>
                    {campaignForm.items.map((item, idx) => (
                      <div key={idx} style={{ padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><span style={{ fontSize: 12, fontWeight: 800 }}>Item {idx + 1}</span>{campaignForm.items.length > 1 && <button onClick={() => removeFormItem(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 style={{ width: 14, height: 14 }} /></button>}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <div><label style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>Name</label><input value={item.name} onChange={e => updateFormItem(idx, 'name', e.target.value)} style={{ width: '100%', height: 32, padding: '0 10px', borderRadius: 7, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.8)', fontSize: 11, outline: 'none', fontFamily: 'inherit', marginTop: 4 }} /></div>
                          <div><label style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>Cost (RM)</label><input type="number" value={item.cost} onChange={e => updateFormItem(idx, 'cost', Number(e.target.value))} style={{ width: '100%', height: 32, padding: '0 10px', borderRadius: 7, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.8)', fontSize: 11, outline: 'none', fontFamily: 'inherit', marginTop: 4 }} /></div>
                          <div><label style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>Duration (days)</label><input type="number" value={item.duration} onChange={e => updateFormItem(idx, 'duration', Number(e.target.value))} style={{ width: '100%', height: 32, padding: '0 10px', borderRadius: 7, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.8)', fontSize: 11, outline: 'none', fontFamily: 'inherit', marginTop: 4 }} /></div>
                          <div><label style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>Start Date</label><input type="date" value={item.start_date} onChange={e => updateFormItem(idx, 'start_date', e.target.value)} style={{ width: '100%', height: 32, padding: '0 10px', borderRadius: 7, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.8)', fontSize: 11, outline: 'none', fontFamily: 'inherit', marginTop: 4 }} /></div>
                        </div>
                        <div style={{ marginTop: 8 }}><label style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>Description</label><textarea value={item.description} onChange={e => updateFormItem(idx, 'description', e.target.value)} rows={2} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.8)', fontSize: 11, outline: 'none', fontFamily: 'inherit', marginTop: 4, resize: 'vertical' }} /></div>
                        <div style={{ marginTop: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}><span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)' }}>Links</span><button type="button" onClick={() => addFormLink(idx)} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', color: 'var(--preset-primary)', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}><Plus style={{ width: 10, height: 10 }} />Add</button></div>
                          {item.links.map((link, li) => (
                            <div key={li} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                              <select value={link.platform} onChange={e => updateFormLink(idx, li, 'platform', e.target.value)} style={{ width: 100, height: 30, padding: '0 6px', borderRadius: 6, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)', fontSize: 10, fontFamily: 'inherit' }}>
                                {PLATFORM_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                              <input value={link.link} onChange={e => updateFormLink(idx, li, 'link', e.target.value)} placeholder="https://..." style={{ flex: 1, height: 30, padding: '0 10px', borderRadius: 6, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)', fontSize: 10, outline: 'none', fontFamily: 'inherit' }} />
                              {item.links.length > 1 && <button type="button" onClick={() => removeFormLink(idx, li)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X style={{ width: 12, height: 12 }} /></button>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addFormItem} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', borderRadius: 9, background: 'rgba(255,255,255,.03)', border: '1px dashed rgba(255,255,255,.12)', color: 'rgba(255,255,255,.4)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}><Plus style={{ width: 12, height: 12 }} />Add Another Item</button>
                  </div>
                  <DialogFooter><button onClick={validateAndCreate} disabled={createMutation.isPending} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 20px', borderRadius: 9, background: 'linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))', border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: createMutation.isPending ? .5 : 1 }}>{createMutation.isPending ? <><RefreshCw style={{ width: 12, height: 12, animation: 'mk-spin 1s linear infinite' }} />Creating...</> : <><Plus style={{ width: 12, height: 12 }} />Create Campaign</>}</button></DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* ═══ TABS ═══ */}
          <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid rgba(255,255,255,.07)' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setMainTab(t.key)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 16px', borderRadius: '9px 9px 0 0', fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid transparent', fontFamily: 'inherit', transition: 'all .15s', whiteSpace: 'nowrap', ...(mainTab === t.key ? { background: 'linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))', color: '#fff', borderColor: 'transparent', boxShadow: '0 4px 14px rgba(var(--preset-primary-rgb),.28)' } : { background: 'transparent', color: 'rgba(255,255,255,.38)' }) }}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {/* ═══ KPI STRIP (visible in overview) ═══ */}
          {!isLoading && mainTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
              {[
                { label: 'Total Spend', value: analytics.totalCost, fmtFn: fmtRM, icon: <DollarSign style={{ width: 14, height: 14 }} />, accent: 'var(--preset-primary)', delay: '0s' },
                { label: 'Campaign Items', value: analytics.totalItems, fmtFn: (v: number) => v.toString(), icon: <Package style={{ width: 14, height: 14 }} />, accent: '#6366f1', delay: '.06s' },
                { label: 'Active Items', value: analytics.activeItems, fmtFn: (v: number) => v.toString(), icon: <Activity style={{ width: 14, height: 14 }} />, accent: '#10b981', delay: '.12s' },
                { label: 'Avg Cost/Item', value: analytics.avgCostPerItem, fmtFn: (v: number) => `RM${v.toFixed(0)}`, icon: <TrendingUp style={{ width: 14, height: 14 }} />, accent: '#f59e0b', delay: '.18s' },
                { label: 'Campaigns', value: grouped.reduce((t, m) => t + m.campaigns.length, 0), fmtFn: (v: number) => v.toString(), icon: <Target style={{ width: 14, height: 14 }} />, accent: '#ec4899', delay: '.24s' },
                { label: 'Platforms', value: new Set(marketingItems.flatMap(i => i.marketing_links?.map(l => l.platform) || [])).size, fmtFn: (v: number) => v.toString(), icon: <Globe style={{ width: 14, height: 14 }} />, accent: '#06b6d4', delay: '.30s' },
              ].map((k, i) => (
                <div key={i} style={{ borderRadius: 13, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.03)', padding: '11px 13px', position: 'relative', overflow: 'hidden', animation: `mk-up .45s ease ${k.delay} both` }}>
                  <div style={{ position: 'absolute', top: '-40%', right: '-15%', width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle,${typeof k.accent === 'string' && k.accent.startsWith('var') ? 'rgba(var(--preset-primary-rgb),.08)' : `${k.accent}18`},transparent 70%)`, pointerEvents: 'none' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: `${typeof k.accent === 'string' && k.accent.startsWith('var') ? 'rgba(var(--preset-primary-rgb),.12)' : `${k.accent}18`}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.accent, flexShrink: 0 }}>{k.icon}</div>
                    <PulseDot size={4} color={k.accent} />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.4px', lineHeight: 1.1, color: 'rgba(255,255,255,.92)', marginBottom: 3 }}><AnimNum value={k.value} format={k.fmtFn} /></div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.38)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>{k.label}</div>
                </div>
              ))}
            </div>
          )}

          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: 8 }}>
              <RefreshCw style={{ width: 16, height: 16, color: 'var(--preset-primary)', animation: 'mk-spin 1s linear infinite' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>Loading marketing data...</span>
            </div>
          )}

          {!isLoading && (
            <>
              {/* ═══ TAB: OVERVIEW ═══ */}
              {mainTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 12, minHeight: 280 }}>
                    <SpendChart startDate={dateRange.startDate} endDate={dateRange.endDate} platform={selectedPlatform !== 'all' ? selectedPlatform : undefined} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <SpendVelocity items={marketingItems} />
                      <PlatformBreakdown items={marketingItems} />
                    </div>
                  </div>
                  <TopPerformers items={marketingItems} />
                </div>
              )}

              {/* ═══ TAB: CAMPAIGNS ═══ */}
              {mainTab === 'campaigns' && (
                <div style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.025)', overflow: 'hidden' }}>
                  <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(var(--preset-primary-rgb),.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--preset-primary)' }}><Target style={{ width: 14, height: 14 }} /></div>
                      <div><div style={{ fontSize: 13, fontWeight: 800 }}>All Campaigns</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,.38)', marginTop: 1 }}>{grouped.reduce((t, m) => t + m.campaigns.length, 0)} campaigns · {marketingItems.length} items</div></div>
                    </div>
                    <div style={{ position: 'relative' }}><Search style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, color: 'rgba(255,255,255,.25)' }} /><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search campaigns..." style={{ width: 200, height: 30, paddingLeft: 26, paddingRight: 8, fontSize: 11, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 7, color: 'rgba(255,255,255,.8)', outline: 'none', fontFamily: 'inherit' }} /></div>
                  </div>

                  {grouped.length === 0 ? <EmptyState icon={<Package style={{ width: 28, height: 28 }} />} title="No campaigns found" subtitle="Create your first campaign" action={<button onClick={() => setIsDialogOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 16px', borderRadius: 8, background: 'var(--preset-primary)', color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 8 }}><Plus style={{ width: 12, height: 12 }} />Create Campaign</button>} />
                    : <div>
                      {grouped.map(mg => (
                        <div key={mg.monthKey} style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                          <button onClick={() => toggleMonth(mg.monthKey)} style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,.85)' }}>{mg.month}</span><span style={{ padding: '2px 8px', borderRadius: 5, background: 'rgba(var(--preset-primary-rgb),.1)', fontSize: 9, fontWeight: 800, color: 'var(--preset-primary)' }}>{mg.campaigns.length}</span></div>
                            {expandedMonths.has(mg.monthKey) ? <ChevronUp style={{ width: 14, height: 14, color: 'rgba(255,255,255,.3)' }} /> : <ChevronDown style={{ width: 14, height: 14, color: 'rgba(255,255,255,.3)' }} />}
                          </button>
                          {expandedMonths.has(mg.monthKey) && <div style={{ padding: '0 20px 16px' }}>
                            {mg.campaigns.map((cg: any) => {
                              const totalCost = cg.items.reduce((s: number, i: MarketingItem) => s + i.cost, 0);
                              const activeCount = cg.items.filter((i: MarketingItem) => { const now = new Date(); return now >= new Date(i.start_date) && now <= new Date(i.end_date); }).length;
                              const isExp = expandedCampaigns.has(cg.campaign.id);
                              return (<div key={cg.campaign.id} style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.02)', marginBottom: 10, overflow: 'hidden' }}>
                                <button onClick={() => toggleCampaign(cg.campaign.id)} style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,rgba(var(--preset-primary-rgb),.15),rgba(var(--preset-primary-rgb),.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--preset-primary)', flexShrink: 0 }}><Target style={{ width: 14, height: 14 }} /></div>
                                    <div style={{ textAlign: 'left' }}><div style={{ fontSize: 14, fontWeight: 800, color: 'var(--preset-primary)' }}>{cg.campaign.name}</div><div style={{ display: 'flex', gap: 8, marginTop: 3, fontSize: 10, color: 'rgba(255,255,255,.35)' }}><span>{cg.items.length} items</span><span>·</span><span>{activeCount} active</span></div></div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <CampaignHealthScore items={cg.items} />
                                    <div style={{ textAlign: 'right' }}><div style={{ fontSize: 18, fontWeight: 900, color: 'var(--preset-primary)' }}>{fmtRM(totalCost)}</div></div>
                                    {isExp ? <ChevronUp style={{ width: 14, height: 14, color: 'rgba(255,255,255,.3)' }} /> : <ChevronDown style={{ width: 14, height: 14, color: 'rgba(255,255,255,.3)' }} />}
                                  </div>
                                </button>
                                {isExp && <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '10px', borderRadius: 9, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)' }}>
                                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 900 }}>{cg.items.length}</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>Items</div></div>
                                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 900, color: '#10b981' }}>{activeCount}</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>Active</div></div>
                                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 900 }}>{fmtRM(totalCost / cg.items.length)}</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>Avg Cost</div></div>
                                  </div>
                                  {cg.items.map((item: MarketingItem) => (
                                    <div key={item.id} style={{ borderRadius: 11, border: '1px solid rgba(255,255,255,.07)', borderLeft: '3px solid var(--preset-primary)', background: 'rgba(255,255,255,.02)', padding: '14px 16px', animation: 'mk-up .3s ease both' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                        <div style={{ flex: 1 }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}><span style={{ fontSize: 14, fontWeight: 800 }}>{item.name}</span><StatusBadge item={item} />{item.marketing_links?.map((l: any, li: number) => <PlatBadge key={li} platform={l.platform} />)}</div>
                                          <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,.4)', lineHeight: 1.5 }}>{item.description}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                                          <div style={{ textAlign: 'right' }}><div style={{ fontSize: 18, fontWeight: 900, color: 'var(--preset-primary)' }}>{fmtRM(item.cost)}</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{item.duration} day{item.duration !== 1 ? 's' : ''}</div></div>
                                          <div style={{ display: 'flex', gap: 4 }}>
                                            <button onClick={() => setEditingItem(item)} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,.4)' }}><Edit style={{ width: 12, height: 12 }} /></button>
                                            <button onClick={() => handleDelete(item.id)} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}><Trash2 style={{ width: 12, height: 12 }} /></button>
                                          </div>
                                        </div>
                                      </div>
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)', marginBottom: 10 }}>
                                        {[{ l: 'Start', v: item.start_date }, { l: 'End', v: item.end_date }, { l: 'Created', v: item.created_at }].map((d, di) => (
                                          <div key={di}><div style={{ fontSize: 8, color: 'rgba(255,255,255,.25)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>{d.l}</div><div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.6)' }}>{d.v ? format(parseISO(d.v), 'MMM d, yyyy') : 'N/A'}</div></div>
                                        ))}
                                      </div>
                                      {item.marketing_links?.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Performance</div>
                                        {item.marketing_links.map((link: any, li: number) => <MetricsDisplay key={li} link={link} />)}
                                      </div>}
                                    </div>
                                  ))}
                                </div>}
                              </div>);
                            })}
                          </div>}
                        </div>
                      ))}
                    </div>}
                </div>
              )}

              {/* ═══ TAB: ANALYTICS ═══ */}
              {mainTab === 'analytics' && <AnalyticsTab items={marketingItems} analytics={analytics} />}

              {/* ═══ TAB: TIMELINE ═══ */}
              {mainTab === 'timeline' && (
                <Panel>
                  <PanelHeader title="Campaign Timeline" subtitle="Visual timeline of all marketing activities" icon={<Clock style={{ width: 14, height: 14 }} />} iconColor="#6366f1" />
                  {marketingItems.length === 0
                    ? <EmptyState icon={<Clock style={{ width: 24, height: 24 }} />} title="No items yet" subtitle="Create a campaign to see your timeline" />
                    : <CampaignTimeline items={marketingItems} />}
                </Panel>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0f1724] border border-white/10">
          <AlertDialogHeader><AlertDialogTitle className="text-white">Delete Marketing Item?</AlertDialogTitle><AlertDialogDescription className="text-white/40">This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white/60 hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending} className="bg-red-500 hover:bg-red-600 text-white">{deleteMutation.isPending ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Deleting...</> : <><Trash2 className="h-4 w-4 mr-2" />Delete</>}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Validation Dialog */}
      <AlertDialog open={showValidation} onOpenChange={setShowValidation}>
        <AlertDialogContent className="bg-[#0f1724] border border-white/10 max-w-md">
          <AlertDialogHeader><div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-red-400" /><AlertDialogTitle className="text-white">Fix These Issues</AlertDialogTitle></div></AlertDialogHeader>
          <div className="space-y-2 max-h-48 overflow-y-auto">{validationErrors.map((e, i) => (<div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20"><X className="h-3 w-3 text-red-400 mt-0.5 flex-shrink-0" /><span className="text-xs text-white/70">{e}</span></div>))}</div>
          <AlertDialogFooter><AlertDialogAction onClick={() => setShowValidation(false)} className="bg-red-500 hover:bg-red-600 text-white text-sm">Got it</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MarketingScreen;