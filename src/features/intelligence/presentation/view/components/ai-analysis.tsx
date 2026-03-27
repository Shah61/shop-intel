import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart as RePieChart, Pie, Cell, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, ScatterChart, Scatter, ZAxis, ComposedChart,
} from 'recharts';
import {
  Eye, Users, TrendingUp, Target, BarChart3, Activity, Brain, FileText,
  ArrowUp, ArrowDown, Minus, Calendar as CalendarIcon, Filter, Star, Palette,
  Sword, Gem, BarChart2, Flame, Heart, MessageSquare, Share2, Bookmark,
  Clock, Zap, Crown, ArrowUpDown, ChevronDown, ChevronUp, ExternalLink,
  Sparkles, AlertTriangle, Radio, Video, Percent, MessageCircle, Globe,
  Hash, Crosshair, Lightbulb, Bell, Layout, PlayCircle, Shield, Award,
  TrendingDown, Search, ArrowLeft, ArrowRight, Info, PieChart,
} from 'lucide-react';
import Image from 'next/image';
import { format, subDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import {
  useOverviewMetadata,
  useEngagementRateComparison,
  useEngagementGrowthTrend,
  useTopPerformingCompetitors,
  useCompetitorContent,
  usePerformanceMetadata,
  use24hPerformanceChanges,
  usePlatformPerformanceSplit,
} from '../../tanstack/competitors-tanstack';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type SortField = 'views' | 'likes' | 'comments' | 'shares' | 'engagement_rate' | 'growth' | 'performance';
type SortOrder = 'asc' | 'desc';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n: number) => {
  if (!n || isNaN(n)) return '0';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};
const fmtPct = (v: number) => `${v.toFixed(1)}%`;

/** Matches layout-drawer `layout-preset` (CSS vars on :root) */
const presetRgba = (a: number) => `rgba(var(--preset-primary-rgb), ${a})`;
const isPresetPrimaryColor = (c: string) => c.includes('var(--preset-primary)');
const accentIconPlateBg = (accent: string) => (isPresetPrimaryColor(accent) ? presetRgba(0.1) : `${accent}18`);
const accentRadialBlob = (accent: string) => (isPresetPrimaryColor(accent) ? presetRgba(0.15) : `${accent}18`);

const COLORS_GRADIENT = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#7c3aed', '#6d28d9'];

// ─────────────────────────────────────────────────────────────────────────────
// MICRO COMPONENTS (Trend Intelligence style)
// ─────────────────────────────────────────────────────────────────────────────
const PulseDot: React.FC<{ color?: string; size?: number }> = ({ color = 'var(--preset-primary)', size = 7 }) => (
  <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, flexShrink: 0 }}>
    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.4, animation: 'ait-pulse 2s ease-in-out infinite' }} />
    <span style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'block' }} />
  </span>
);

const AnimNum: React.FC<{ value: number; format?: (v: number) => string }> = ({ value, format: formatFn }) => {
  const [n, setN] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    const start = performance.now(), dur = 900;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      setN(Math.floor(e * value));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{formatFn ? formatFn(n) : n.toLocaleString()}</>;
};

const ChartTip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#141c2b', border: '1px solid rgba(var(--preset-primary-rgb),.2)', borderRadius: 10, padding: '9px 13px', fontFamily: 'inherit', fontSize: 12, backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,.4)' }}>
      {label && <div style={{ color: 'rgba(255,255,255,.4)', marginBottom: 5, fontSize: 11 }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,.8)', marginBottom: 2 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.color || p.fill, flexShrink: 0 }} />
          <span style={{ color: 'rgba(255,255,255,.4)', marginRight: 2 }}>{p.name}:</span>
          <b>{typeof p.value === 'number' && p.value > 999 ? fmt(p.value) : typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</b>
        </div>
      ))}
    </div>
  );
};

const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.025)', padding: '18px 20px', position: 'relative', overflow: 'hidden', ...style }}>
    {children}
  </div>
);

const PanelHeader: React.FC<{ title: string; subtitle?: string; icon: React.ReactNode; iconColor?: string; action?: React.ReactNode }> = ({ title, subtitle, icon, iconColor = 'var(--preset-primary)', action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: accentIconPlateBg(iconColor), display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.2px' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.38)', marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
    {action}
  </div>
);

const MiniBar: React.FC<{ value: number; max: number; color?: string; height?: number }> = ({ value, max, color = 'var(--preset-primary)', height = 3 }) => (
  <div style={{ height, background: 'rgba(255,255,255,.07)', borderRadius: 99, overflow: 'hidden' }}>
    <div style={{ width: `${max > 0 ? Math.min((value / max) * 100, 100) : 0}%`, height: '100%', background: color, borderRadius: 99, transition: 'width .8s cubic-bezier(.4,0,.2,1)' }} />
  </div>
);

const PlatChip: React.FC<{ platform: string }> = ({ platform }) => {
  const icons: Record<string, string> = { INSTAGRAM: '/images/instargram.png', TIKTOK: '/images/tiktok2.png', instagram: '/images/instargram.png', tiktok: '/images/tiktok2.png' };
  const p = platform.toUpperCase();
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 7px', borderRadius: 6, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.45)', textTransform: 'capitalize' }}>
      {icons[p] && <img src={icons[p]} alt="" style={{ width: 11, height: 11, objectFit: 'contain' }} />}
      {platform.toLowerCase()}
    </span>
  );
};

const SourceBadge: React.FC<{ source: string }> = ({ source }) => {
  const m: Record<string, { c: string; bg: string }> = {
    'Shop-Intel': { c: 'var(--preset-primary)', bg: presetRgba(0.12) },
    'CREATOR': { c: '#10b981', bg: 'rgba(16,185,129,.12)' },
    'COMPETITOR': { c: '#f59e0b', bg: 'rgba(245,158,11,.12)' },
  };
  const s = m[source] || { c: 'rgba(255,255,255,.35)', bg: 'rgba(255,255,255,.05)' };
  const owner = source === 'Shop-Intel';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 5, background: s.bg, border: owner ? `1px solid ${presetRgba(0.22)}` : `1px solid ${s.c}33`, fontSize: 9, fontWeight: 800, color: s.c, letterSpacing: '.05em' }}>
      {source}
    </span>
  );
};

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; subtitle: string }> = ({ icon, title, subtitle }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', gap: 10 }}>
    <div style={{ opacity: .25 }}>{icon}</div>
    <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,.5)' }}>{title}</div>
    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>{subtitle}</div>
  </div>
);

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; accent: string; subtitle?: string; change?: number; delay?: string }> = ({ label, value, icon, accent, subtitle, change, delay = '0s' }) => (
  <div style={{ borderRadius: 13, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.03)', padding: '15px 17px', position: 'relative', overflow: 'hidden', animation: `ait-up .45s ease ${delay} both` }}>
    <div style={{ position: 'absolute', top: '-40%', right: '-15%', width: 110, height: 110, borderRadius: '50%', background: `radial-gradient(circle,${accentRadialBlob(accent)},transparent 70%)`, pointerEvents: 'none' }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: accentIconPlateBg(accent), display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>{icon}</div>
      {change !== undefined && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 10, fontWeight: 800, color: change >= 0 ? '#10b981' : '#ef4444' }}>
          {change >= 0 ? <ArrowUp style={{ width: 9, height: 9 }} /> : <ArrowDown style={{ width: 9, height: 9 }} />}
          {Math.abs(change).toFixed(1)}%
        </span>
      )}
      {change === undefined && <PulseDot size={5} color={accent} />}
    </div>
    <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1, color: 'rgba(255,255,255,.92)', marginBottom: 4 }}>{typeof value === 'number' ? <AnimNum value={value} /> : value}</div>
    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.38)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
    {subtitle && <div style={{ fontSize: 10, color: 'rgba(255,255,255,.28)', marginTop: 3 }}>{subtitle}</div>}
  </div>
);


// ─────────────────────────────────────────────────────────────────────────────
// SECTION: OVERVIEW METADATA CARDS
// ─────────────────────────────────────────────────────────────────────────────
const OverviewMetadataSection: React.FC<{
  dateRange: { from: Date; to: Date };
  platform?: 'TIKTOK' | 'INSTAGRAM';
  source?: 'CREATOR' | 'COMPETITOR' | 'Shop-Intel' | 'ALL';
  metricType?: 'AVERAGE' | 'HIGHEST';
}> = ({ dateRange, platform, source, metricType = 'AVERAGE' }) => {
  const apiParams = useMemo(() => ({
    start_date: format(dateRange.from, 'yyyy-MM-dd'),
    end_date: format(dateRange.to, 'yyyy-MM-dd'),
    platform, source,
  }), [dateRange, platform, source]);

  const { data, isLoading, error } = useOverviewMetadata(apiParams);
  const meta = data?.data?.overview_metadata;

  const cards = useMemo(() => {
    if (!meta) return [];
    const base = [
      { label: 'Total Tracked', value: meta.total_tracked || 0, fmtFn: (v: number) => v.toString(), icon: <Users style={{ width: 14, height: 14 }} />, accent: '#6366f1', delay: '0s' },
      { label: 'Total Views', value: meta.total_views || 0, fmtFn: fmt, icon: <Eye style={{ width: 14, height: 14 }} />, accent: 'var(--preset-primary)', delay: '.06s' },
      { label: 'Total Engagement', value: meta.total_engagement || 0, fmtFn: fmt, icon: <Heart style={{ width: 14, height: 14 }} />, accent: '#ec4899', delay: '.12s' },
      { label: 'Highest Eng. Rate', value: meta.highest_engagement_rate || 0, fmtFn: (v: number) => `${v.toFixed(1)}%`, icon: <BarChart3 style={{ width: 14, height: 14 }} />, accent: '#f59e0b', delay: '.18s' },
    ];
    if (metricType === 'AVERAGE') {
      base.push(
        { label: 'Avg Engagement Rate', value: meta.avg_engagement_rate || 0, fmtFn: (v: number) => `${v.toFixed(1)}%`, icon: <TrendingUp style={{ width: 14, height: 14 }} />, accent: '#10b981', delay: '.24s' },
        { label: 'Your Performance vs Avg', value: meta.your_performance_vs_avg || 0, fmtFn: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`, icon: <Target style={{ width: 14, height: 14 }} />, accent: (meta.your_performance_vs_avg || 0) >= 0 ? '#10b981' : '#ef4444', delay: '.30s' },
      );
    } else {
      base.push(
        { label: 'Highest Eng. Rate', value: meta.highest_engagement_rate || 0, fmtFn: (v: number) => `${v.toFixed(1)}%`, icon: <Flame style={{ width: 14, height: 14 }} />, accent: '#f59e0b', delay: '.24s' },
        { label: 'Your Performance vs Highest', value: meta.your_performance_vs_highest || 0, fmtFn: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`, icon: <Target style={{ width: 14, height: 14 }} />, accent: (meta.your_performance_vs_highest || 0) >= 0 ? '#10b981' : '#ef4444', delay: '.30s' },
      );
    }
    return base;
  }, [meta, metricType]);

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(132px,1fr))', gap: 10 }}>
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ borderRadius: 13, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.03)', padding: '15px 17px', height: 100 }}>
            <div style={{ width: '60%', height: 12, background: 'rgba(255,255,255,.07)', borderRadius: 6, marginBottom: 12 }} />
            <div style={{ width: '40%', height: 24, background: 'rgba(255,255,255,.07)', borderRadius: 6 }} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={<TrendingDown style={{ width: 24, height: 24 }} />} title="Failed to load metadata" subtitle="Check your connection and try again" />;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(132px,1fr))', gap: 10 }}>
      {cards.map((k, i) => (
        <div key={i} style={{ borderRadius: 13, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.03)', padding: '11px 13px', position: 'relative', overflow: 'hidden', animation: `ait-up .45s ease ${k.delay} both` }}>
          <div style={{ position: 'absolute', top: '-40%', right: '-15%', width: 110, height: 110, borderRadius: '50%', background: `radial-gradient(circle,${accentRadialBlob(k.accent)},transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: accentIconPlateBg(k.accent), display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.accent, flexShrink: 0 }}>{k.icon}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', lineHeight: 1.25, minWidth: 0 }}>{k.label}</div>
            </div>
            <PulseDot size={5} color={k.accent} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1, color: 'rgba(255,255,255,.92)' }}>
            <AnimNum value={k.value} format={k.fmtFn} />
          </div>
        </div>
      ))}
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// SECTION: ENGAGEMENT RATE COMPARISON CHART
// ─────────────────────────────────────────────────────────────────────────────
const EngagementRateSection: React.FC<{
  dateRange: { from: Date; to: Date };
  platform?: 'TIKTOK' | 'INSTAGRAM';
  source?: 'CREATOR' | 'COMPETITOR' | 'Shop-Intel' | 'ALL';
}> = ({ dateRange, platform, source }) => {
  const apiParams = useMemo(() => ({
    start_date: format(dateRange.from, 'yyyy-MM-dd'),
    end_date: format(dateRange.to, 'yyyy-MM-dd'),
    platform, source,
  }), [dateRange, platform, source]);

  const { data, isLoading, error } = useEngagementRateComparison(apiParams);

  const getSourceColor = (s: string) => {
    if (s === 'Shop-Intel') return '#8b5cf6';
    if (s === 'COMPETITOR') return '#f59e0b';
    return '#6b7280';
  };

  const chartData = useMemo(() => {
    if (!data?.data?.engagement_rate_comparison) return [];
    const main = data.data.engagement_rate_comparison
      .filter(c => c.source === 'COMPETITOR')
      .slice(0, 10)
      .map(c => ({
      brand: c.name.split(' ')[0],
      fullName: c.name,
      rate: c.engagement_rate,
      source: c.source,
      color: getSourceColor(c.source),
      }));
    const shopIntel = (data.data['Shop-Intel_engagement_rate_comparison'] || []).map(c => ({
      brand: c.name.split(' ')[0],
      fullName: c.name,
      rate: c.engagement_rate,
      source: c.source,
      color: getSourceColor(c.source),
    }));
    return [...main, ...shopIntel];
  }, [data]);

  return (
    <Panel>
      <PanelHeader title="Engagement Rate Comparison" subtitle="Owner vs competitor accounts by engagement" icon={<BarChart3 style={{ width: 14, height: 14 }} />} iconColor="var(--preset-primary)" />
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}><div style={{ display: 'flex', gap: 5 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--preset-primary)', opacity: .7, animation: `ait-pulse 1.2s ease-in-out ${i * .2}s infinite` }} />)}</div></div>
      ) : error ? (
        <EmptyState icon={<BarChart3 style={{ width: 20, height: 20 }} />} title="Failed to load" subtitle="Check connection" />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,.04)" vertical={false} />
              <XAxis dataKey="brand" tick={{ fontSize: 9, fill: 'rgba(255,255,255,.28)', fontFamily: 'inherit' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,.28)', fontFamily: 'inherit' }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
              <Bar dataKey="rate" name="Engagement %" radius={[4, 4, 0, 0]} maxBarSize={26}>
                {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10 }}>
            {[{ l: 'Owner', c: 'var(--preset-primary)' }, { l: 'Competitor', c: '#f59e0b' }].map((x, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: x.c }} />
                <span style={{ color: 'rgba(255,255,255,.45)' }}>{x.l}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Panel>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// SECTION: ENGAGEMENT GROWTH TREND CHART
// ─────────────────────────────────────────────────────────────────────────────
const EngagementGrowthSection: React.FC<{
  dateRange: { from: Date; to: Date };
  platform?: 'TIKTOK' | 'INSTAGRAM';
  metricType?: 'AVERAGE' | 'HIGHEST';
}> = ({ dateRange, platform, metricType = 'AVERAGE' }) => {
  const dataType = metricType === 'AVERAGE' ? 'avg' : 'highest';
  const apiParams = useMemo(() => ({
    start_date: format(dateRange.from, 'yyyy-MM-dd'),
    end_date: format(dateRange.to, 'yyyy-MM-dd'),
    platform,
  }), [dateRange, platform]);

  const { data, isLoading, error } = useEngagementGrowthTrend(apiParams);

  const chartData = useMemo(() => {
    if (!data?.data?.engagement_growth_trend) return [];
    return data.data.engagement_growth_trend.map(dp => {
      const date = parseISO(dp.date);
      if (dataType === 'avg') {
        return { date: format(date, 'MMM dd'), competitor: dp.avg.competitors_avg, owner: dp.avg['Shop-Intel_avg'] };
      }
      return { date: format(date, 'MMM dd'), competitor: dp.highest.competitors_highest, owner: dp.highest['Shop-Intel_highest'] };
    });
  }, [data, dataType]);

  return (
    <Panel>
      <PanelHeader title="Engagement Growth Trends" subtitle={`Daily tracking (${dataType === 'avg' ? 'Average' : 'Highest'})`} icon={<TrendingUp style={{ width: 14, height: 14 }} />} iconColor="#10b981" />
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}><div style={{ display: 'flex', gap: 5 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', opacity: .7, animation: `ait-pulse 1.2s ease-in-out ${i * .2}s infinite` }} />)}</div></div>
      ) : error ? (
        <EmptyState icon={<TrendingUp style={{ width: 20, height: 20 }} />} title="Failed to load" subtitle="Check connection" />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={chartData} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="competitorAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'rgba(255,255,255,.28)', fontFamily: 'inherit' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,.28)', fontFamily: 'inherit' }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="competitor" name="Competitors" stroke="#06b6d4" strokeWidth={2} fill="url(#competitorAreaGrad)" dot={false} />
              <Line type="monotone" dataKey="owner" name="Owner" stroke="var(--preset-primary)" strokeWidth={2} dot={{ r: 2, fill: 'var(--preset-primary)', strokeWidth: 0 }} />
            </ComposedChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10 }}>
            {[{ l: 'Competitors', c: '#06b6d4' }, { l: 'Owner', c: 'var(--preset-primary)' }].map((x, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10 }}>
                <span style={{ width: 8, height: 3, borderRadius: 2, background: x.c }} />
                <span style={{ color: 'rgba(255,255,255,.45)' }}>{x.l}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Panel>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// SECTION: TOP PERFORMING VIDEOS TABLE (lazy load + owner engagement)
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;
const TopVideosLoadMoreMascots: React.FC = () => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          padding: '28px 16px',
        }}
      >
        {/* AI Orb */}
        <svg
          width="72"
          height="72"
          viewBox="0 0 100 100"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(167,139,250,0.4))',
          }}
        >
          <defs>
            <radialGradient id="aiGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
          </defs>
  
          {/* Outer Pulse Ring */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#a78bfa"
            strokeWidth="1"
            fill="none"
            opacity="0.4"
          >
            <animate
              attributeName="r"
              values="35;45;35"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.2;0.6;0.2"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
  
          {/* Core Orb */}
          <circle cx="50" cy="50" r="28" fill="url(#aiGradient)">
            <animate
              attributeName="r"
              values="26;30;26"
              dur="2.2s"
              repeatCount="indefinite"
            />
          </circle>
  
          {/* Rotating Data Ring */}
          <circle
            cx="50"
            cy="50"
            r="34"
            stroke="rgba(255,255,255,0.3)"
            strokeDasharray="4 6"
            strokeWidth="1"
            fill="none"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="6s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
  
        {/* Text */}
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: '0.04em',
          }}
        >
        Fetching videos…
        </span>
      </div>
    );
  };

const TopPerformersSection: React.FC<{
  dateRange: { from: Date; to: Date };
  platform?: 'TIKTOK' | 'INSTAGRAM';
  source?: 'CREATOR' | 'COMPETITOR' | 'Shop-Intel' | 'ALL';
  onSelectCompetitor: (id: string, name: string) => void;
}> = ({ dateRange, platform, source, onSelectCompetitor }) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreLockRef = useRef(false);
  const sortedFullLenRef = useRef(0);
  const visibleCountRef = useRef(PAGE_SIZE);
  const [sortField, setSortField] = useState<SortField>('engagement_rate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const apiDateRange = useMemo(() => ({
    start_date: dateRange.from.toISOString().split('T')[0],
    end_date: dateRange.to.toISOString().split('T')[0],
    platform, source,
  }), [dateRange, platform, source]);

  const metaParams = useMemo(() => ({
    start_date: format(dateRange.from, 'yyyy-MM-dd'),
    end_date: format(dateRange.to, 'yyyy-MM-dd'),
    platform, source,
  }), [dateRange, platform, source]);

  const { data, isLoading, error } = useTopPerformingCompetitors(apiDateRange);
  const { data: overviewData, isLoading: overviewLoading } = useOverviewMetadata(metaParams);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [data, searchQuery, sortField, sortOrder, source, platform]);

  const doSort = (f: SortField) => { if (sortField === f) setSortOrder(d => d === 'asc' ? 'desc' : 'asc'); else { setSortField(f); setSortOrder('desc'); } };
  const SortIco = ({ f }: { f: SortField }) => sortField !== f ? <ArrowUpDown style={{ width: 10, height: 10, opacity: .3 }} /> : sortOrder === 'asc' ? <ArrowUp style={{ width: 10, height: 10 }} /> : <ArrowDown style={{ width: 10, height: 10 }} />;

  const sortedFull = useMemo(() => {
    let channels = data?.data?.channels || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      channels = channels.filter((c: any) => c.name.toLowerCase().includes(q));
    }
    return [...channels].sort((a: any, b: any) => {
      let av = 0, bv = 0;
      switch (sortField) {
        case 'views': av = a.engagement_metrics?.views || 0; bv = b.engagement_metrics?.views || 0; break;
        case 'likes': av = a.engagement_metrics?.likes || 0; bv = b.engagement_metrics?.likes || 0; break;
        case 'comments': av = a.engagement_metrics?.comments || 0; bv = b.engagement_metrics?.comments || 0; break;
        case 'shares': av = a.engagement_metrics?.shares || 0; bv = b.engagement_metrics?.shares || 0; break;
        case 'engagement_rate': av = a.engagement_metrics?.percentage_engagement || 0; bv = b.engagement_metrics?.percentage_engagement || 0; break;
        case 'performance': av = a.engagement_metrics?.percentage_engagement || 0; bv = b.engagement_metrics?.percentage_engagement || 0; break;
      }
      return sortOrder === 'asc' ? av - bv : bv - av;
    });
  }, [data, sortField, sortOrder, searchQuery]);

  const competitorsData = useMemo(() => sortedFull.slice(0, visibleCount), [sortedFull, visibleCount]);
  visibleCountRef.current = visibleCount;

  const ownerContentEngagement = useMemo(() => {
    const meta = overviewData?.data?.overview_metadata;
    const fromMeta = meta?.['Shop-Intel_avg_engagement_rate'];
    if (fromMeta != null && !Number.isNaN(Number(fromMeta))) return Number(fromMeta);
    const fromList = (data?.data?.channels || []).find((c: any) => c.source === 'Shop-Intel')?.engagement_metrics?.percentage_engagement;
    if (fromList != null && !Number.isNaN(Number(fromList))) return Number(fromList);
    return null;
  }, [overviewData, data]);

  const totalCompetitors = sortedFull.length;
  const title = 'Top Performing Videos';
  const hasMore = visibleCount < sortedFull.length;
  sortedFullLenRef.current = sortedFull.length;

  const maxEng = Math.max(...(competitorsData.map((c: any) => c.engagement_metrics?.percentage_engagement || 0)), 0.001);

  const handleLoadMore = useCallback(() => {
    if (loadMoreLockRef.current) return;
    if (visibleCountRef.current >= sortedFullLenRef.current) return;
    loadMoreLockRef.current = true;
    setLoadingMore(true);
    window.setTimeout(() => {
      setVisibleCount((prev: number) => Math.min(prev + PAGE_SIZE, sortedFullLenRef.current));
      setLoadingMore(false);
      loadMoreLockRef.current = false;
    }, 850);
  }, []);

  const handleLoadMoreRef = useRef(handleLoadMore);
  handleLoadMoreRef.current = handleLoadMore;

  // Infinite scroll: same pattern as User Activity table (sentinel + IntersectionObserver)
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || isLoading || error || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !loadMoreLockRef.current) {
          handleLoadMoreRef.current();
        }
      },
      { root: null, rootMargin: '200px', threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isLoading, error, hasMore, visibleCount, totalCompetitors]);

  return (
    <div style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.025)', overflow: 'hidden' }}>
      <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(249,115,22,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}><Target style={{ width: 14, height: 14 }} /></div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.2px' }}>{title}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.38)', marginTop: 1 }}>{totalCompetitors} videos · Click rows for details</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, color: 'rgba(255,255,255,.25)' }} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." style={{ width: 160, height: 28, paddingLeft: 26, paddingRight: 8, fontSize: 11, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 7, color: 'rgba(255,255,255,.8)', outline: 'none', fontFamily: 'inherit' }} />
          </div>
        </div>
      </div>

      {/* Your brand — aggregate engagement from overview API (fallback: owner row in list) */}
      {!isLoading && !error && (
        <div style={{ margin: '0 20px', marginTop: 12, padding: '10px 14px', borderRadius: 11, background: `linear-gradient(135deg, ${presetRgba(0.12)}, rgba(245,158,11,.08))`, border: `1px solid ${presetRgba(0.22)}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: presetRgba(0.2), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles style={{ width: 16, height: 16, color: 'var(--preset-lighter)' }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Your content</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.72)' }}>Average engagement rate (your brand)</div>
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#e9d5ff', letterSpacing: '-0.5px' }}>
            {overviewLoading ? <span style={{ fontSize: 13, color: 'rgba(255,255,255,.35)' }}>…</span> : ownerContentEngagement != null ? `${ownerContentEngagement.toFixed(2)}%` : <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.35)' }}>No owner data in range</span>}
          </div>
        </div>
      )}

      {isLoading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 180, gap: 12 }}><div style={{ display: 'flex', gap: 5 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#f97316', opacity: .7, animation: `ait-pulse 1.2s ease-in-out ${i * .2}s infinite` }} />)}</div><span style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>Loading…</span></div>}
      {error && !isLoading && <EmptyState icon={<TrendingDown style={{ width: 24, height: 24 }} />} title="Failed to load" subtitle="Check connection" />}

      {!isLoading && !error && competitorsData.length > 0 && (
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                {[
                  { l: '#', f: null, w: 40 },
                  { l: 'Channel', f: null, w: 180 },
                  { l: 'Views', f: 'views' as SortField, w: 80 },
                  { l: 'Likes', f: 'likes' as SortField, w: 80 },
                  { l: 'Comments', f: 'comments' as SortField, w: 80 },
                  { l: 'Shares', f: 'shares' as SortField, w: 80 },
                  { l: 'Engagement', f: 'engagement_rate' as SortField, w: 130 },
                  { l: 'Performance', f: 'performance' as SortField, w: 90 },
                ].map((col, ci) => (
                  <th key={ci} style={{ padding: '9px 11px', textAlign: ci > 1 ? 'right' : 'left', minWidth: col.w }}>
                    {col.f
                      ? <button onClick={() => doSort(col.f!)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 800, color: sortField === col.f ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.35)', fontFamily: 'inherit', letterSpacing: '.05em', textTransform: 'uppercase', padding: 0 }}>
                          {col.l} <SortIco f={col.f} />
                        </button>
                      : <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.35)', letterSpacing: '.05em', textTransform: 'uppercase' }}>{col.l}</span>
                    }
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {competitorsData.map((ch: any, idx: number) => {
                const eng = ch.engagement_metrics?.percentage_engagement || 0;
                const engC = eng >= 4 ? '#10b981' : eng >= 2.5 ? '#6366f1' : eng >= 1.5 ? '#f59e0b' : 'rgba(255,255,255,.35)';
                const perfLabel = eng >= 4 ? 'Very High' : eng >= 2.5 ? 'High' : eng >= 1.5 ? 'Medium' : 'Low';
                const perfC = eng >= 4 ? '#10b981' : eng >= 2.5 ? '#6366f1' : eng >= 1.5 ? '#f59e0b' : 'rgba(255,255,255,.3)';
                const isOwner = ch.source === 'Shop-Intel';
                const rowAnimDelay = idx >= visibleCount - PAGE_SIZE && visibleCount > PAGE_SIZE ? `${Math.min(idx - (visibleCount - PAGE_SIZE), 8) * 0.04}s` : '0s';

                return (
                  <tr
                    key={ch.id}
                    onClick={() => onSelectCompetitor(ch.id, ch.name)}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,.06)',
                      cursor: 'pointer',
                      transition: 'background .15s, box-shadow .15s',
                      animation: visibleCount > PAGE_SIZE && idx >= visibleCount - PAGE_SIZE ? `ait-row-in 0.4s ease ${rowAnimDelay} both` : undefined,
                      ...(isOwner
                        ? {
                          background: `linear-gradient(90deg, ${presetRgba(0.16)} 0%, ${presetRgba(0.05)} 42%, transparent 100%)`,
                          boxShadow: `inset 4px 0 0 0 var(--preset-lighter), 0 0 0 1px ${presetRgba(0.2)}`,
                        }
                        : {}),
                    }}
                    onMouseEnter={e => {
                      if (!isOwner) e.currentTarget.style.background = 'rgba(var(--preset-primary-rgb),.06)';
                      else e.currentTarget.style.background = `linear-gradient(90deg, ${presetRgba(0.22)} 0%, ${presetRgba(0.08)} 45%, ${presetRgba(0.04)} 100%)`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = isOwner ? `linear-gradient(90deg, ${presetRgba(0.16)} 0%, ${presetRgba(0.05)} 42%, transparent 100%)` : 'transparent';
                    }}
                  >
                    <td style={{ padding: '10px 11px' }}>
                      {isOwner
                        ? <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, var(--preset-lighter), var(--preset-primary))', boxShadow: `0 0 0 2px ${presetRgba(0.45)}` }}><Star style={{ width: 11, height: 11, color: '#fff', fill: '#fff' }} /></span>
                        : idx === 0
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}><Crown style={{ width: 10, height: 10, color: '#fff' }} /></span>
                          : idx < 3
                            ? <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: 'rgba(var(--preset-primary-rgb),.14)', fontSize: 10, fontWeight: 800, color: 'var(--preset-primary)' }}>{idx + 1}</span>
                            : <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.25)', display: 'inline-block', width: 22, textAlign: 'center' }}>{idx + 1}</span>
                      }
                    </td>
                    <td style={{ padding: '10px 11px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          {ch.image_url
                            ? <img src={ch.image_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', boxShadow: isOwner ? `0 0 0 2px ${presetRgba(0.65)}` : undefined }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(var(--preset-primary-rgb),.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'var(--preset-primary)', boxShadow: isOwner ? `0 0 0 2px ${presetRgba(0.65)}` : undefined }}>{ch.name?.[0]?.toUpperCase()}</div>
                          }
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120, color: isOwner ? 'rgba(255,255,255,.94)' : undefined }}>{ch.name}</div>
                          <div style={{ display: 'flex', gap: 4, marginTop: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                            <SourceBadge source={ch.source || 'N/A'} />
                            {isOwner && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 6, background: presetRgba(0.25), border: `1px solid ${presetRgba(0.45)}`, color: 'var(--preset-lighter)', fontSize: 9, fontWeight: 900, letterSpacing: '.06em' }}>
                                YOU · #{idx + 1}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 11px', textAlign: 'right', color: 'rgba(255,255,255,.65)' }}>{fmt(ch.engagement_metrics?.views || 0)}</td>
                    <td style={{ padding: '10px 11px', textAlign: 'right', color: 'rgba(255,255,255,.65)' }}>{fmt(ch.engagement_metrics?.likes || 0)}</td>
                    <td style={{ padding: '10px 11px', textAlign: 'right', color: 'rgba(255,255,255,.65)' }}>{fmt(ch.engagement_metrics?.comments || 0)}</td>
                    <td style={{ padding: '10px 11px', textAlign: 'right', color: 'rgba(255,255,255,.65)' }}>{fmt(ch.engagement_metrics?.shares || 0)}</td>
                    <td style={{ padding: '10px 15px 10px 11px', minWidth: 130 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: isOwner ? '5px 8px' : 0, borderRadius: 9, background: isOwner ? presetRgba(0.12) : 'transparent', border: isOwner ? `1px solid ${presetRgba(0.35)}` : 'none' }}>
                        <div style={{ flex: 1 }}><MiniBar value={eng} max={maxEng} color={isOwner ? 'var(--preset-lighter)' : engC} /></div>
                        <span style={{ fontSize: 11, fontWeight: 900, color: isOwner ? 'var(--preset-lighter)' : engC, minWidth: 40, textAlign: 'right' }}>{eng.toFixed(2)}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 11px', textAlign: 'right' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 5, background: `${perfC}15`, border: `1px solid ${perfC}33`, fontSize: 9, fontWeight: 800, color: perfC, letterSpacing: '.05em' }}>
                        {perfLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Sentinel: auto-load next page when scrolled near bottom (like User Activity) */}
          {(hasMore || loadingMore) && totalCompetitors > PAGE_SIZE && (
            <div
              ref={sentinelRef}
              aria-hidden
              style={{ minHeight: loadingMore ? 8 : 24, borderTop: '1px solid rgba(255,255,255,.05)' }}
            >
              {loadingMore ? <TopVideosLoadMoreMascots /> : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// SECTION: DETAILS COMPETITOR
// ─────────────────────────────────────────────────────────────────────────────
const DetailsCompetitorSection: React.FC<{
  channelId: string;
  channelName: string;
  onBack: () => void;
}> = ({ channelId, channelName, onBack }) => {
  const [showAll, setShowAll] = useState(false);
  const [expandedSummary, setExpandedSummary] = useState<string | null>(null);

  const { data, isLoading, error } = useCompetitorContent({ channel_id: channelId, limit: showAll ? 5000 : 10 });

  const contentData = useMemo(() => {
    const contents = data?.data?.contents || [];
    return [...contents].sort((a: any, b: any) => (b.metadata?.views || 0) - (a.metadata?.views || 0));
  }, [data]);

  const totalContents = data?.data?.metadata?.total || 0;
  const avgViews = contentData.length > 0 ? Math.round(contentData.reduce((s: number, c: any) => s + (c.metadata?.views || 0), 0) / contentData.length) : 0;
  const avgLikes = contentData.length > 0 ? Math.round(contentData.reduce((s: number, c: any) => s + (c.metadata?.likes || 0), 0) / contentData.length) : 0;
  const avgEng = contentData.length > 0 ? contentData.reduce((s: number, c: any) => { const v = c.metadata?.views || 1; return s + ((c.metadata?.likes || 0) + (c.metadata?.comments || 0) + (c.metadata?.shares || 0)) / v * 100; }, 0) / contentData.length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Back + Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.6)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          <ArrowLeft style={{ width: 12, height: 12 }} /> Back
        </button>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.3px' }}>{channelName} — Content Details</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.38)' }}>Video content and performance analytics</div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
        {[
          { label: 'Total Videos', value: totalContents, fmtFn: (v: number) => v.toString(), icon: <Video style={{ width: 14, height: 14 }} />, accent: '#6366f1' },
          { label: 'Avg Views', value: avgViews, fmtFn: fmt, icon: <Eye style={{ width: 14, height: 14 }} />, accent: '#10b981' },
          { label: 'Avg Likes', value: avgLikes, fmtFn: fmt, icon: <Heart style={{ width: 14, height: 14 }} />, accent: '#ec4899' },
          { label: 'Avg Engagement', value: avgEng, fmtFn: (v: number) => `${v.toFixed(1)}%`, icon: <Sparkles style={{ width: 14, height: 14 }} />, accent: '#f59e0b' },
        ].map((k, i) => (
          <div key={i} style={{ borderRadius: 13, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.03)', padding: '11px 13px', position: 'relative', overflow: 'hidden', animation: `ait-up .45s ease ${i * .06}s both` }}>
            <div style={{ position: 'absolute', top: '-40%', right: '-15%', width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle,${k.accent}18,transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: `${k.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.accent }}>{k.icon}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>{k.label}</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.4px', color: 'rgba(255,255,255,.92)' }}><AnimNum value={k.value} format={k.fmtFn} /></div>
          </div>
        ))}
      </div>

      {/* Content Table */}
      {isLoading && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, gap: 8 }}><div style={{ display: 'flex', gap: 5 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--preset-primary)', opacity: .7, animation: `ait-pulse 1.2s ease-in-out ${i * .2}s infinite` }} />)}</div></div>}
      {error && <EmptyState icon={<TrendingDown style={{ width: 24, height: 24 }} />} title="Failed to load content" subtitle="Check connection" />}

      {!isLoading && !error && contentData.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 10 }}>
          {contentData.map((v: any, i: number) => {
            const thumb = v.thumbnails?.find((t: any) => t.type === 'DEFAULT')?.url || v.thumbnails?.[0]?.url;
            const v24 = v.metadata?.['24h_change_views'] ?? 0;
            const eng = v.metadata?.views > 0 ? ((v.metadata.likes + (v.metadata.comments || 0) + (v.metadata.shares || 0)) / v.metadata.views) * 100 : 0;
            const hasSummary = v.summarizer_explanations?.length > 0 && v.summarizer_explanations.some((e: any) => {
              const t = typeof e === 'string' ? e : e.explanation;
              return t && !t.toUpperCase().includes('NO TRANSCRIPT AVAILABLE');
            });

            return (
              <div key={v.id} style={{ borderRadius: 13, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.03)', overflow: 'hidden', animation: `ait-up .4s ease ${i * .04}s both` }}>
                <div style={{ position: 'relative', height: 130, background: '#1a2235' }}>
                  {thumb && <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .82 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.82) 0%,transparent 55%)' }} />
                  <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 5, background: v24 > 0 ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.2)', border: `1px solid ${v24 > 0 ? '#10b981' : '#ef4444'}55`, fontSize: 10, fontWeight: 800, color: v24 > 0 ? '#10b981' : '#ef4444', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      {v24 > 0 ? <ArrowUp style={{ width: 9, height: 9 }} /> : <ArrowDown style={{ width: 9, height: 9 }} />}{fmt(Math.abs(v24))}
                    </span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, fontSize: 11, fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, marginBottom: 8 }}>
                    {[
                      { icon: <Eye style={{ width: 9, height: 9 }} />, val: fmt(v.metadata?.views ?? 0), l: 'Views' },
                      { icon: <Heart style={{ width: 9, height: 9 }} />, val: fmt(v.metadata?.likes ?? 0), l: 'Likes' },
                      { icon: <Sparkles style={{ width: 9, height: 9 }} />, val: `${eng.toFixed(1)}%`, l: 'Eng.' },
                    ].map((m, mi) => (
                      <div key={mi} style={{ textAlign: 'center', padding: '5px 0', borderRadius: 7, background: 'rgba(255,255,255,.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', color: 'rgba(255,255,255,.25)', marginBottom: 2 }}>{m.icon}</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,.85)' }}>{m.val}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.28)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{m.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {v.video_url && (
                      <button onClick={() => window.open(v.video_url, '_blank')} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, background: 'rgba(var(--preset-primary-rgb),.1)', border: '1px solid rgba(var(--preset-primary-rgb),.2)', color: 'var(--preset-primary)', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <ExternalLink style={{ width: 10, height: 10 }} /> Watch
                      </button>
                    )}
                    {hasSummary && (
                      <button onClick={() => setExpandedSummary(expandedSummary === v.id ? null : v.id)} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, background: presetRgba(0.1), border: `1px solid ${presetRgba(0.2)}`, color: 'var(--preset-primary)', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Sparkles style={{ width: 10, height: 10 }} /> AI Insights
                      </button>
                    )}
                  </div>
                  {expandedSummary === v.id && hasSummary && (
                    <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 8, background: presetRgba(0.06), border: `1px solid ${presetRgba(0.15)}`, borderLeft: '3px solid var(--preset-primary)' }}>
                      {v.summarizer_explanations.filter((e: any) => { const t = typeof e === 'string' ? e : e.explanation; return t && !t.toUpperCase().includes('NO TRANSCRIPT AVAILABLE'); }).map((e: any, ei: number) => (
                        <div key={ei} style={{ display: 'flex', gap: 6, marginBottom: 4, fontSize: 11, color: 'rgba(255,255,255,.55)', lineHeight: 1.5 }}>
                          <span style={{ color: 'var(--preset-primary)', fontWeight: 700 }}>•</span>
                          <span>{typeof e === 'string' ? e : e.explanation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && !error && totalContents > 10 && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => setShowAll(!showAll)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 16px', borderRadius: 8, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.55)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {showAll ? <><ChevronUp style={{ width: 12, height: 12 }} /> Show Less</> : <><ChevronDown style={{ width: 12, height: 12 }} /> Load More ({totalContents - 10} more)</>}
          </button>
        </div>
      )}
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// SECTION: PERFORMANCE COMPARISON (Shop-Intel vs Competitor)
// ─────────────────────────────────────────────────────────────────────────────
const PerformanceComparisonSection: React.FC<{
  dateRange: { from: Date; to: Date };
  platform?: 'TIKTOK' | 'INSTAGRAM';
}> = ({ dateRange, platform }) => {
  const apiParams = useMemo(() => ({
    start_date: format(dateRange.from, 'yyyy-MM-dd'),
    end_date: format(dateRange.to, 'yyyy-MM-dd'),
    platform,
  }), [dateRange, platform]);

  const { data, isLoading, error } = usePerformanceMetadata(apiParams);

  const metrics = useMemo(() => {
    if (!data?.data?.performance_metadata) return null;
    const si = data.data.performance_metadata.find((i: any) => i.source === 'Shop-Intel');
    const comp = data.data.performance_metadata.find((i: any) => i.source === 'COMPETITOR');
    if (!si || !comp) return null;
    const siEng = si.views > 0 ? ((si.likes + si.shares + si.saves) / si.views) * 100 : 0;
    const compEng = comp.views > 0 ? ((comp.likes + comp.shares + comp.saves) / comp.views) * 100 : 0;
    return {
      shopIntel: si, competitor: comp, siEng, compEng,
      items: [
        { label: 'Views', si: si.views, comp: comp.views, icon: <Eye style={{ width: 13, height: 13 }} />, c: '#3b82f6' },
        { label: 'Likes', si: si.likes, comp: comp.likes, icon: <Heart style={{ width: 13, height: 13 }} />, c: '#ef4444' },
        { label: 'Saves', si: si.saves, comp: comp.saves, icon: <Bookmark style={{ width: 13, height: 13 }} />, c: '#f59e0b' },
        { label: 'Shares', si: si.shares, comp: comp.shares, icon: <Share2 style={{ width: 13, height: 13 }} />, c: '#10b981' },
      ]
    };
  }, [data]);

  const chartData = metrics?.items.map(m => ({ metric: m.label, 'Shop-Intel': m.si, Competitor: m.comp })) || [];

  return (
    <Panel>
      <PanelHeader title="Shop-Intel vs Competitor" subtitle="Head-to-head performance comparison" icon={<Crown style={{ width: 14, height: 14 }} />} iconColor="var(--preset-primary)" />
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}><div style={{ display: 'flex', gap: 5 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--preset-primary)', opacity: .7, animation: `ait-pulse 1.2s ease-in-out ${i * .2}s infinite` }} />)}</div></div>
      ) : error || !metrics ? (
        <EmptyState icon={<Crown style={{ width: 20, height: 20 }} />} title="No comparison data" subtitle="Data unavailable" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: 'Shop-Intel Eng.', value: `${metrics.siEng.toFixed(2)}%`, c: 'var(--preset-primary)', icon: <Crown style={{ width: 12, height: 12 }} />, presetSurface: true },
              { label: 'Competitor Eng.', value: `${metrics.compEng.toFixed(2)}%`, c: '#06b6d4', icon: <Target style={{ width: 12, height: 12 }} /> },
              { label: 'Gap', value: `${metrics.siEng > metrics.compEng ? '+' : ''}${(metrics.siEng - metrics.compEng).toFixed(2)}%`, c: metrics.siEng > metrics.compEng ? '#10b981' : '#ef4444', icon: <TrendingUp style={{ width: 12, height: 12 }} /> },
            ].map((k, i) => (
              <div key={i} style={{ borderRadius: 10, background: k.presetSurface ? presetRgba(0.06) : `${k.c}08`, border: k.presetSurface ? `1px solid ${presetRgba(0.14)}` : `1px solid ${k.c}22`, padding: '11px 13px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: k.c, marginBottom: 6 }}>{k.icon}<span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>{k.label}</span></div>
                <div style={{ fontSize: 20, fontWeight: 900, color: k.c }}>{k.value}</div>
              </div>
            ))}
          </div>

          {/* Chart + Metrics side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,.04)" vertical={false} />
                  <XAxis dataKey="metric" tick={{ fontSize: 9, fill: 'rgba(255,255,255,.28)', fontFamily: 'inherit' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,.28)', fontFamily: 'inherit' }} tickLine={false} axisLine={false} tickFormatter={fmt} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
                  <Bar dataKey="Shop-Intel" name="Shop-Intel" fill="var(--preset-primary)" radius={[4, 4, 0, 0]} maxBarSize={20} opacity={0.8} />
                  <Bar dataKey="Competitor" name="Competitor" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={20} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 6 }}>
                {[{ l: 'Shop-Intel', c: 'var(--preset-primary)' }, { l: 'Competitor', c: '#06b6d4' }].map((x, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: x.c }} />
                    <span style={{ color: 'rgba(255,255,255,.45)' }}>{x.l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {metrics.items.map((m, i) => {
                const ratio = m.comp > 0 ? m.si / m.comp : 0;
                const isWin = ratio > 1;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 9, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ color: m.c }}>{m.icon}</div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700 }}>{m.label}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{fmt(m.si)} vs {fmt(m.comp)}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 900, color: isWin ? '#10b981' : '#ef4444' }}>
                      {isWin ? '↗' : '↘'} {(ratio * 100).toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// SECTION: 24H PERFORMANCE CHANGES
// ─────────────────────────────────────────────────────────────────────────────
const Performance24hSection: React.FC<{ platform?: 'TIKTOK' | 'INSTAGRAM' }> = ({ platform }) => {
  const apiParams = useMemo(() => ({ platform }), [platform]);
  const { data, isLoading, error } = use24hPerformanceChanges(apiParams);

  const perf = useMemo(() => {
    if (!data?.data) return null;
    const si = data.data.find((i: any) => i.source === 'Shop-Intel')?.performance_changes?.[0];
    const comp = data.data.find((i: any) => i.source === 'COMPETITOR')?.performance_changes?.[0];
    if (!si || !comp) return null;
    return { si, comp };
  }, [data]);

  return (
    <Panel>
      <PanelHeader
        title="24H Performance Changes"
        subtitle="Real-time Shop-Intel vs competitor"
        icon={<Zap style={{ width: 14, height: 14 }} />}
        iconColor="#f59e0b"
        action={<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><PulseDot size={5} color="#10b981" /><span style={{ fontSize: 10, color: '#10b981', fontWeight: 700 }}>Live</span></div>}
      />
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 150 }}><div style={{ display: 'flex', gap: 5 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#f59e0b', opacity: .7, animation: `ait-pulse 1.2s ease-in-out ${i * .2}s infinite` }} />)}</div></div>
      ) : error || !perf ? (
        <EmptyState icon={<Zap style={{ width: 20, height: 20 }} />} title="No 24h data" subtitle="Data unavailable" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Top cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Shop-Intel', data: perf.si, c: 'var(--preset-primary)', icon: <Crown style={{ width: 12, height: 12 }} />, presetSurface: true },
              { label: 'Competitor', data: perf.comp, c: '#06b6d4', icon: <Target style={{ width: 12, height: 12 }} /> },
            ].map((x, i) => (
              <div key={i} style={{ padding: '12px 14px', borderRadius: 11, background: x.presetSurface ? presetRgba(0.06) : `${x.c}08`, border: x.presetSurface ? `1px solid ${presetRgba(0.14)}` : `1px solid ${x.c}22` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: x.c, marginBottom: 6 }}>{x.icon}<span style={{ fontSize: 10, fontWeight: 800 }}>{x.label}</span></div>
                <div style={{ fontSize: 20, fontWeight: 900, color: x.c }}>{x.data.engagement_rate.toFixed(2)}%</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 4 }}>
                  {x.data.percentage_change >= 0 ? <ArrowUp style={{ width: 9, height: 9, color: '#10b981' }} /> : <ArrowDown style={{ width: 9, height: 9, color: '#ef4444' }} />}
                  <span style={{ fontSize: 10, fontWeight: 800, color: x.data.percentage_change >= 0 ? '#10b981' : '#ef4444' }}>{x.data.percentage_change >= 0 ? '+' : ''}{x.data.percentage_change.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Gap */}
          <div style={{ textAlign: 'center', padding: '10px', borderRadius: 10, background: perf.si.engagement_rate > perf.comp.engagement_rate ? 'rgba(16,185,129,.08)' : 'rgba(239,68,68,.08)', border: `1px solid ${perf.si.engagement_rate > perf.comp.engagement_rate ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.2)'}` }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: perf.si.engagement_rate > perf.comp.engagement_rate ? '#10b981' : '#ef4444', textTransform: 'uppercase', marginBottom: 3 }}>Performance Gap</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: perf.si.engagement_rate > perf.comp.engagement_rate ? '#10b981' : '#ef4444' }}>
              {perf.si.engagement_rate > perf.comp.engagement_rate ? '+' : ''}{(perf.si.engagement_rate - perf.comp.engagement_rate).toFixed(2)}%
            </div>
          </div>

          {/* Metric rows */}
          {[
            { label: 'Views', si: perf.si.views, comp: perf.comp.views, icon: <Eye style={{ width: 11, height: 11 }} />, c: '#3b82f6' },
            { label: 'Likes', si: perf.si.likes, comp: perf.comp.likes, icon: <Heart style={{ width: 11, height: 11 }} />, c: '#ef4444' },
            { label: 'Comments', si: perf.si.comments, comp: perf.comp.comments, icon: <MessageCircle style={{ width: 11, height: 11 }} />, c: '#f59e0b' },
            { label: 'Shares', si: perf.si.shares, comp: perf.comp.shares, icon: <Share2 style={{ width: 11, height: 11 }} />, c: '#10b981' },
          ].map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 9, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: m.c }}>{m.icon}<span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.5)' }}>{m.label}</span></div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{fmt(m.si)}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', margin: '0 4px' }}>vs</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{fmt(m.comp)}</span>
                <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 800, color: m.si > m.comp ? '#10b981' : '#ef4444' }}>{m.si > m.comp ? 'Win' : 'Behind'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// SECTION: PLATFORM PERFORMANCE SPLIT
// ─────────────────────────────────────────────────────────────────────────────
const PlatformSplitSection: React.FC<{
  dateRange: { from: Date; to: Date };
  platform?: 'TIKTOK' | 'INSTAGRAM';
}> = ({ dateRange, platform }) => {
  const apiParams = useMemo(() => ({
    start_date: format(dateRange.from, 'yyyy-MM-dd'),
    end_date: format(dateRange.to, 'yyyy-MM-dd'),
    platform,
  }), [dateRange, platform]);

  const { data, isLoading, error } = usePlatformPerformanceSplit(apiParams);

  const chartData = useMemo(() => {
    if (!data?.data?.performance_platform_split) return [];
    const items = data.data.performance_platform_split.map((p: any, i: number) => ({
      name: p.platform, value: p.contents, engagement: p.engagement_rate, fill: COLORS_GRADIENT[i % COLORS_GRADIENT.length],
    }));
    const total = items.reduce((s: number, i: any) => s + i.value, 0);
    return items.map((i: any) => ({ ...i, pct: total > 0 ? (i.value / total) * 100 : 0 }));
  }, [data]);

  return (
    <Panel>
      <PanelHeader title="Platform Performance Split" subtitle="Content distribution & engagement" icon={<PieChart style={{ width: 14, height: 14 }} />} iconColor="var(--preset-lighter)" />
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180 }}><div style={{ display: 'flex', gap: 5 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--preset-primary)', opacity: .7, animation: `ait-pulse 1.2s ease-in-out ${i * .2}s infinite` }} />)}</div></div>
      ) : error || chartData.length === 0 ? (
        <EmptyState icon={<PieChart style={{ width: 20, height: 20 }} />} title="No platform data" subtitle="Data unavailable" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ResponsiveContainer width="100%" height={155}>
            <RePieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} innerRadius={30} strokeWidth={0} paddingAngle={3}>
                {chartData.map((d: any, i: number) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip content={<ChartTip />} />
            </RePieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {chartData.map((p: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 9, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <PlatChip platform={p.name} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{p.value} content · {p.engagement.toFixed(2)}% eng</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 900, color: p.fill }}>{p.pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// SECTION: AI INSIGHT CARDS
// ─────────────────────────────────────────────────────────────────────────────
const AIInsightCard: React.FC<{ title: string; icon: React.ReactNode; iconColor: string; children: React.ReactNode }> = ({ title, icon, iconColor, children }) => (
  <Panel>
    <PanelHeader title={title} icon={icon} iconColor={iconColor} />
    {children}
  </Panel>
);

const PerformancePredictionsSection: React.FC = () => {
  const trendData = [
    { week: 'Wk 1', engagement: 4.2 }, { week: 'Wk 2', engagement: 4.4 }, { week: 'Wk 3', engagement: 4.6 }, { week: 'Wk 4', engagement: 4.5 }, { week: 'Pred', engagement: 6.0 },
  ];
  return (
    <AIInsightCard title="Performance Predictions" icon={<TrendingUp style={{ width: 14, height: 14 }} />} iconColor="#f59e0b">
      <div style={{ textAlign: 'center', padding: '16px', borderRadius: 11, background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', marginBottom: 14 }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: '#10b981', marginBottom: 4 }}>+28%</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#10b981' }}><TrendingUp style={{ width: 12, height: 12 }} /> Predicted engagement growth next 30 days</div>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', lineHeight: 1.7, marginBottom: 14 }}>
        <b style={{ color: 'rgba(255,255,255,.7)' }}>AI Analysis:</b> Your current 4.64% engagement rate is 157% above market average. Based on trend analysis and seasonal patterns, expect continued growth through summer beauty season.
      </div>
      <ResponsiveContainer width="100%" height={100}>
        <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
          <defs><linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
          <XAxis dataKey="week" tick={{ fontSize: 9, fill: 'rgba(255,255,255,.25)' }} tickLine={false} axisLine={false} />
          <YAxis domain={[3.5, 6.5]} tick={{ fontSize: 9, fill: 'rgba(255,255,255,.25)' }} tickLine={false} axisLine={false} />
          <Area type="monotone" dataKey="engagement" stroke="#6366f1" strokeWidth={2} fill="url(#predGrad)" dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </AIInsightCard>
  );
};

const ContentOptimizationSection: React.FC = () => (
  <AIInsightCard title="Content Optimization" icon={<Zap style={{ width: 14, height: 14 }} />} iconColor="#3b82f6">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[
        "Post Instagram content at 2-4 PM for 23% higher engagement",
        "Increase TikTok frequency by 40% — currently underutilized",
        "Tutorial content performs 67% better than product shots",
        "Add trending audio to TikToks for 156% boost",
      ].map((text, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px', borderRadius: 9, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ width: 18, height: 18, borderRadius: 5, background: 'rgba(59,130,246,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}><ArrowRight style={{ width: 9, height: 9, color: '#3b82f6' }} /></div>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.55)', lineHeight: 1.6 }}>{text}</span>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 10, background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)' }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>💡 Growth Opportunity</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>Your TikTok engagement (0.72%) has 285% growth potential based on beauty industry benchmarks.</div>
    </div>
  </AIInsightCard>
);

const CompetitorIntelligenceSection: React.FC = () => (
  <AIInsightCard title="Competitor Intelligence" icon={<Target style={{ width: 14, height: 14 }} />} iconColor="#ec4899">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[
        { name: 'Maybelline', metric: '+156% Views Advantage', positive: true },
        { name: 'Lancôme', metric: '+174% Engagement Lead', positive: true },
        { name: 'FENTY Beauty', metric: '-2% Engagement Gap', positive: false },
      ].map((c, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 9, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>{c.name}</span>
          <span style={{ padding: '2px 8px', borderRadius: 5, background: c.positive ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)', border: `1px solid ${c.positive ? '#10b981' : '#ef4444'}33`, fontSize: 10, fontWeight: 800, color: c.positive ? '#10b981' : '#ef4444' }}>{c.metric}</span>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 10, background: 'rgba(236,72,153,.08)', border: '1px solid rgba(236,72,153,.2)' }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: '#ec4899', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>🎯 Key Finding</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>You're outperforming 89% of tracked competitors. Focus on closing the small gap with FENTY Beauty to become #1 in engagement.</div>
    </div>
  </AIInsightCard>
);

const OptimalTimingSection: React.FC = () => (
  <AIInsightCard title="Optimal Timing" icon={<Clock style={{ width: 14, height: 14 }} />} iconColor="#06b6d4">
    <div style={{ textAlign: 'center', padding: '16px', borderRadius: 11, background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', marginBottom: 14 }}>
      <div style={{ fontSize: 36, fontWeight: 900, color: '#10b981', marginBottom: 4 }}>2:30 PM</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#10b981' }}><TrendingUp style={{ width: 12, height: 12 }} /> Peak engagement window detected</div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[
        "Instagram: Tuesday-Thursday 2-4 PM (+34% engagement)",
        "TikTok: Friday-Sunday 6-9 PM (+67% views)",
        "Avoid Mondays: 23% below average performance",
        "Summer beauty content peaks July 15-Aug 30",
      ].map((text, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px', borderRadius: 9, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ width: 18, height: 18, borderRadius: 5, background: 'rgba(6,182,212,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}><ArrowRight style={{ width: 9, height: 9, color: '#06b6d4' }} /></div>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.55)', lineHeight: 1.6 }}>{text}</span>
        </div>
      ))}
    </div>
  </AIInsightCard>
);

const AIStrategicSummarySection: React.FC = () => (
  <div style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.025)', padding: '28px 24px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%,rgba(99,102,241,.08),transparent 60%)', pointerEvents: 'none' }} />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}><Brain style={{ width: 18, height: 18 }} /></div>
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px' }}>AI Strategic Summary</span>
      </div>
      <div style={{ padding: '14px 18px', borderRadius: 11, background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.18)', marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#a5b4fc', lineHeight: 1.6 }}>
          Shop-Intel is dominating the engagement game with 4.64% rate (157% above average).
        </p>
      </div>
      <div style={{ padding: '12px 18px', borderRadius: 11, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.5)', lineHeight: 1.7, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          Your Instagram strategy is stellar, but TikTok is your next frontier. With Charlotte Tilbury declining, there's a premium market opportunity worth pursuing.
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,.35)' }}>
        <div style={{ display: 'flex', gap: 2 }}>{[0, 1, 2, 3, 4].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#6366f1' }} />)}</div>
        <span style={{ fontWeight: 700 }}>AI Confidence: 94%</span>
      </div>
    </div>
  </div>
);


// ─────────────────────────────────────────────────────────────────────────────
// MAIN: CompetitorAnalysis
// ─────────────────────────────────────────────────────────────────────────────
const AIAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['all']);
  const [selectedSource, setSelectedSource] = useState<'CREATOR' | 'COMPETITOR' | 'Shop-Intel' | 'ALL'>('ALL');
  const [selectedMetricType, setSelectedMetricType] = useState<'AVERAGE' | 'HIGHEST'>('AVERAGE');
  const [selectedCompetitor, setSelectedCompetitor] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const togglePlatform = useCallback((platform: string) => {
    if (platform === 'all') { setSelectedPlatforms(['all']); } else {
      setSelectedPlatforms(prev => {
        const wo = prev.filter(p => p !== 'all');
        if (prev.includes(platform)) { const ns = wo.filter(p => p !== platform); return ns.length === 0 ? ['all'] : ns; }
        else { const ns = [...wo, platform]; return ns.length === 2 ? ['all'] : ns; }
      });
    }
  }, []);

  const getApiPlatform = useCallback((): 'TIKTOK' | 'INSTAGRAM' | undefined => {
    if (selectedPlatforms.includes('all')) return undefined;
    const nonAll = selectedPlatforms.filter(p => p !== 'all');
    if (nonAll.length === 1) return nonAll[0].toUpperCase() as 'TIKTOK' | 'INSTAGRAM';
    return undefined;
  }, [selectedPlatforms]);

  const TABS = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 style={{ width: 12, height: 12 }} /> },
    { key: 'performance', label: 'Performance', icon: <Activity style={{ width: 12, height: 12 }} /> },
    { key: 'insights', label: 'AI Insights', icon: <Brain style={{ width: 12, height: 12 }} /> },
  ];

  const PLATS = [
    { value: 'all', label: 'All Platforms' },
    { value: 'tiktok', label: 'TikTok', icon: '/images/tiktok2.png' },
    { value: 'instagram', label: 'Instagram', icon: '/images/instargram.png' },
  ];

  const SOURCES = [
    { value: 'ALL' as const, label: 'All Sources', icon: <Star style={{ width: 11, height: 11 }} /> },
    { value: 'CREATOR' as const, label: 'Creator', icon: <Palette style={{ width: 11, height: 11 }} /> },
    { value: 'COMPETITOR' as const, label: 'Competitor', icon: <Sword style={{ width: 11, height: 11 }} /> },
    { value: 'Shop-Intel' as const, label: 'Shop-Intel', icon: <Gem style={{ width: 11, height: 11 }} /> },
  ];

  const METRICS = [
    { value: 'AVERAGE' as const, label: 'Average', icon: <BarChart2 style={{ width: 11, height: 11 }} /> },
    { value: 'HIGHEST' as const, label: 'Highest', icon: <Flame style={{ width: 11, height: 11 }} /> },
  ];

  const globalStyles = `
    @keyframes ait-pulse { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(2.4);opacity:0} }
    @keyframes ait-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes ait-row-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    /* Match /sales typography family on desktop only.
       Keep component-level sizes so KPI numbers stay large. */
    @media (min-width: 1280px) {
      .sales-typography,
      .sales-typography * {
        font-family: 'Outfit', sans-serif !important;
      }
    }

    /* Light mode like /sales: clean white surfaces, crisp text, subtle primary accents */
    .sales-typography.light-mode {
      background: #f8fafc;
      color: #111827;
    }

    .sales-typography.light-mode [style*="rgba(255,255,255"],
    .sales-typography.light-mode [style*="rgba(255, 255, 255"] {
      color: rgba(17, 24, 39, 0.86) !important;
      border-color: rgba(var(--preset-primary-rgb), 0.16) !important;
      background: rgba(255, 255, 255, 0.92) !important;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }

    .sales-typography.light-mode .recharts-cartesian-grid line {
      stroke: rgba(148, 163, 184, 0.24) !important;
    }

    .sales-typography.light-mode .recharts-text,
    .sales-typography.light-mode .recharts-legend-item-text,
    .sales-typography.light-mode svg text,
    .sales-typography.light-mode svg tspan {
      fill: rgba(30, 41, 59, 0.82) !important;
    }
  `;

  if (!mounted) {
    return <div style={{ padding: 24 }}><div style={{ height: 8, width: '25%', background: 'rgba(255,255,255,.07)', borderRadius: 6, marginBottom: 24 }} /><div style={{ height: 200, background: 'rgba(255,255,255,.04)', borderRadius: 14 }} /></div>;
  }

  // If competitor is selected, show details
  if (selectedCompetitor) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className={`sales-typography ${isLight ? 'light-mode' : ''} h-full overflow-y-auto`} style={{ color: isLight ? '#111827' : 'rgba(255,255,255,.88)', fontFamily: 'inherit' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '16px 24px', background: isLight ? '#ffffff' : 'transparent' }}>
            <DetailsCompetitorSection channelId={selectedCompetitor.id} channelName={selectedCompetitor.name} onBack={() => setSelectedCompetitor(null)} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div className={`sales-typography ${isLight ? 'light-mode' : ''} h-full overflow-y-auto`} style={{ color: isLight ? '#111827' : 'rgba(255,255,255,.88)', fontFamily: 'inherit' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '16px 24px', background: isLight ? '#ffffff' : 'transparent' }}>

          {/* ═══ HEADER ═══ */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(var(--preset-primary-rgb),.35)', flexShrink: 0 }}>
                  <BarChart3 style={{ width: 18, height: 18, color: '#fff' }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.15, fontFamily: 'inherit' }}>Competitor Analysis</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3 }}>
                    <PulseDot size={6} />
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase' }}>Live Analytics</span>
                  </div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.35)', lineHeight: 1.6, maxWidth: 500 }}>
                Performance insights, engagement benchmarks, and AI-driven competitive intelligence across all tracked channels.
              </p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Source */}
              <Popover>
                <PopoverTrigger asChild>
                  <button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 9, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', height: 33 }}>
                    {SOURCES.find(s => s.value === selectedSource)?.icon}
                    {SOURCES.find(s => s.value === selectedSource)?.label}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 bg-[#141c2b] border border-white/10 shadow-2xl z-[100]" align="end" sideOffset={8}>
                  {SOURCES.map(s => (
                    <button key={s.value} onClick={() => setSelectedSource(s.value)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 10px', borderRadius: 7, background: selectedSource === s.value ? 'rgba(var(--preset-primary-rgb),.15)' : 'transparent', border: 'none', color: selectedSource === s.value ? 'var(--preset-primary)' : 'rgba(255,255,255,.6)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {s.icon} {s.label}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              {/* Metric Type */}
              <Popover>
                <PopoverTrigger asChild>
                  <button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 9, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', height: 33 }}>
                    {METRICS.find(m => m.value === selectedMetricType)?.icon}
                    {METRICS.find(m => m.value === selectedMetricType)?.label}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 bg-[#141c2b] border border-white/10 shadow-2xl z-[100]" align="end" sideOffset={8}>
                  {METRICS.map(m => (
                    <button key={m.value} onClick={() => setSelectedMetricType(m.value)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 10px', borderRadius: 7, background: selectedMetricType === m.value ? 'rgba(var(--preset-primary-rgb),.15)' : 'transparent', border: 'none', color: selectedMetricType === m.value ? 'var(--preset-primary)' : 'rgba(255,255,255,.6)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {m.icon} {m.label}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              {/* Platform */}
              <Popover>
                <PopoverTrigger asChild>
                  <button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 9, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', height: 33 }}>
                    <Filter style={{ width: 11, height: 11, color: 'var(--preset-primary)' }} />
                    {selectedPlatforms.includes('all') ? 'All Platforms' : selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 bg-[#141c2b] border border-white/10 shadow-2xl z-[100]" align="end" sideOffset={8}>
                  {PLATS.map(p => (
                    <button key={p.value} onClick={() => togglePlatform(p.value)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 10px', borderRadius: 7, background: (p.value === 'all' ? selectedPlatforms.includes('all') : selectedPlatforms.includes(p.value) && !selectedPlatforms.includes('all')) ? 'rgba(var(--preset-primary-rgb),.15)' : 'transparent', border: 'none', color: 'rgba(255,255,255,.6)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {(p as any).icon && <img src={(p as any).icon} alt="" style={{ width: 14, height: 14 }} />}
                      {p.label}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              {/* Date Range */}
              <Popover>
                <PopoverTrigger asChild>
                  <button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 9, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', height: 33 }}>
                    <CalendarIcon style={{ width: 11, height: 11, color: 'var(--preset-primary)' }} />
                    {format(dateRange.from, "MMM d")} – {format(dateRange.to, "MMM d, yyyy")}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 bg-[#141c2b] border border-white/10 shadow-2xl z-[100]" align="end" sideOffset={8}>
                  <div className="flex gap-4">
                    <div className="space-y-2"><label className="text-xs font-medium text-white/50">From</label><Calendar mode="single" selected={dateRange.from} onSelect={(d) => d && setDateRange({ ...dateRange, from: d })} className="rounded-xl" /></div>
                    <div className="space-y-2"><label className="text-xs font-medium text-white/50">To</label><Calendar mode="single" selected={dateRange.to} onSelect={(d) => d && setDateRange({ ...dateRange, to: d })} className="rounded-xl" /></div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* ═══ TABS ═══ */}
          <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid rgba(255,255,255,.07)', paddingBottom: 0 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 16px', borderRadius: '9px 9px 0 0', fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid transparent', fontFamily: 'inherit', transition: 'all .15s', whiteSpace: 'nowrap',
                  ...(activeTab === t.key
                    ? { background: 'linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))', color: '#fff', borderColor: 'transparent', boxShadow: '0 4px 14px rgba(var(--preset-primary-rgb),.28)' }
                    : { background: 'transparent', color: 'rgba(255,255,255,.38)', borderColor: 'transparent' })
                }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>


          {/* ═══ TAB: OVERVIEW ═══ */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <OverviewMetadataSection dateRange={dateRange} platform={getApiPlatform()} source={selectedSource} metricType={selectedMetricType} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <EngagementRateSection dateRange={dateRange} platform={getApiPlatform()} source={selectedSource} />
                <EngagementGrowthSection dateRange={dateRange} platform={getApiPlatform()} metricType={selectedMetricType} />
              </div>

              <TopPerformersSection dateRange={dateRange} platform={getApiPlatform()} source={selectedSource} onSelectCompetitor={(id, name) => setSelectedCompetitor({ id, name })} />
            </div>
          )}

          {/* ═══ TAB: PERFORMANCE ═══ */}
          {activeTab === 'performance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <PerformanceComparisonSection dateRange={dateRange} platform={getApiPlatform()} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Performance24hSection platform={getApiPlatform()} />
                <PlatformSplitSection dateRange={dateRange} platform={getApiPlatform()} />
              </div>
            </div>
          )}

          {/* ═══ TAB: AI INSIGHTS ═══ */}
          {activeTab === 'insights' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <PerformancePredictionsSection />
                <ContentOptimizationSection />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <CompetitorIntelligenceSection />
                <OptimalTimingSection />
              </div>
              <AIStrategicSummarySection />
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default function AIAnalysisRoute() {
  return (
    <div className="h-full overflow-y-auto">
      <AIAnalysis />
    </div>
  );
}