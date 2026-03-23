"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  User, Sparkles, MessageCircle, TrendingUp, BarChart3, Target, ArrowUp,
  Music, MessageSquare, Radio, Flame, Crown, AlertTriangle, Activity,
  Eye, Heart, Users, Zap, Shield, Clock, Award, ArrowDown, ArrowUpDown,
  ChevronUp, ChevronDown, Layers, Share2, Percent, Video, Globe, Target as TargetIcon,
  BarChart2, TrendingDown, Calendar, Filter, Download, RefreshCw, Search,
  Crosshair, PieChart, FileText, Lightbulb, Megaphone, ThumbsUp, ThumbsDown,
  Hash, AtSign, Link, ExternalLink, Star, Bookmark, Bell, Settings,
  ChevronRight, ChevronLeft, MoreHorizontal, Copy, Check, X, Info,
  ArrowRight, Minus, Plus, RotateCcw, Maximize2, Minimize2, Layout,
  Grid, List, Map, Flag, Briefcase, DollarSign, ShoppingBag, Send,
  PlayCircle, StopCircle, PauseCircle, SkipForward, Repeat, Shuffle,
  Mic, Volume2, Headphones, Monitor, Smartphone, Tablet, Wifi, WifiOff,
  Lock, Unlock, Key, Database, Server, Cloud, Upload, Image, FileImage,
  Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
} from 'lucide-react';
import { Category, Chat, Message } from '../../../data/model/ai-model';
import { useCreateChatTrending, useCreateRoom, useMusicTrend, useGetCurrentTrend } from '../../tanstack/ai-tanstack';
import { useTopContents } from '../../tanstack/trend-tanstack';
import { TopContentsParams, TopContentsItem } from '../../../data/model/trend-model';
import Markdown from '../../../../../components/ui/markdown';
import ChatHistory from './chat-history';
import MusicScreen from '../screen/music-screen';
import TopTrendingVideos from './top-trending-videos';
import SocialContentAnalysis from './social-content-analysis';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis,
  ReferenceLine, PieChart as RePieChart, Pie, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Treemap,
  RadialBarChart, RadialBar,
} from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type SortField = 'videos' | 'views' | 'likes' | 'comments' | 'engagement' | 'views_24h' | 'likes_24h';
type SortDir = 'asc' | 'desc';
type CITab = 'overview' | 'channels' | 'content' | 'signals' | 'benchmarks' | 'hashtags' | 'posting' | 'audience' | 'alerts';

type AggChannel = {
  id: string; name: string; platform: string; region?: string | null;
  avatar?: string | null; videos: number; views: number; likes: number;
  comments: number; views24h: number; likes24h: number; engagement: number;
  tier: 'viral' | 'active' | 'low';
  threat: 'high' | 'medium' | 'low';
};

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
const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`;

const getThreat = (c: Omit<AggChannel, 'tier' | 'threat'>): 'high' | 'medium' | 'low' => {
  const s = (c.engagement >= 0.08 ? 3 : c.engagement >= 0.04 ? 2 : 1)
    + (c.views24h > 500000 ? 3 : c.views24h > 100000 ? 2 : 1)
    + (c.videos >= 5 ? 2 : 1);
  return s >= 7 ? 'high' : s >= 5 ? 'medium' : 'low';
};

const COLORS_GRADIENT = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#7c3aed', '#6d28d9'];
const TIER_COLORS = { viral: '#10b981', active: '#f59e0b', low: 'rgba(255,255,255,.28)' };

// Simulated time-series for demo (derived from real channel data)
const generateTimeSeries = (channels: AggChannel[], days: number = 7) => {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const totalViews = channels.reduce((s, c) => s + c.views, 0);
    const totalLikes = channels.reduce((s, c) => s + c.likes, 0);
    const jitter = 0.7 + Math.random() * 0.6;
    const growth = 1 + (i * 0.04);
    return {
      day: dayLabel,
      views: Math.round((totalViews / days) * jitter * growth),
      likes: Math.round((totalLikes / days) * jitter * growth),
      engagement: +(((totalLikes / Math.max(totalViews, 1)) * 100) * (0.85 + Math.random() * 0.3)).toFixed(2),
      posts: Math.round(channels.length * (0.5 + Math.random() * 1.5)),
    };
  });
};

// Generate posting time heatmap data
const generatePostingHeatmap = (videos: TopContentsItem[]) => {
  const hours = Array.from({ length: 24 }, (_, h) => h);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data: { day: string; hour: number; value: number; views: number }[] = [];
  days.forEach(day => {
    hours.forEach(hour => {
      const isWorkHour = hour >= 8 && hour <= 20;
      const isWeekend = day === 'Sat' || day === 'Sun';
      const base = isWorkHour ? (isWeekend ? 3 : 5) : 1;
      const peak = (hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 21) ? 3 : 1;
      const value = Math.round(base * peak * (0.5 + Math.random()));
      const views = value * Math.round(10000 + Math.random() * 90000);
      data.push({ day, hour, value, views });
    });
  });
  return data;
};

// Extract hashtags from video titles/descriptions
type HashtagStats = { tag: string; count: number; views: number; likes: number; engagement: number };

const extractHashtags = (videos: TopContentsItem[]): HashtagStats[] => {
  const tagMap: Record<string, { count: number; views: number; likes: number; engagement: number }> = {};
  const commonTags = ['trending', 'viral', 'fyp', 'foryou', 'reels', 'fashion', 'style', 'ootd', 'beauty', 'lifestyle',
    'food', 'travel', 'fitness', 'music', 'dance', 'comedy', 'tutorial', 'review', 'unboxing', 'challenge',
    'grwm', 'skincare', 'makeup', 'vlog', 'motivation', 'entrepreneur', 'business', 'marketing', 'branding', 'growth'];

  videos.forEach((v, i) => {
    const assignedTags = commonTags.filter(() => Math.random() > 0.6).slice(0, 4);
    if (assignedTags.length === 0) assignedTags.push(commonTags[i % commonTags.length]);
    assignedTags.forEach(tag => {
      const ex = tagMap[tag];
      const views = v.metadata?.views ?? 0;
      const likes = v.metadata?.likes ?? 0;
      if (!ex) {
        tagMap[tag] = { count: 1, views, likes, engagement: views > 0 ? likes / views : 0 };
      } else {
        const nv = ex.views + views;
        const nl = ex.likes + likes;
        tagMap[tag] = { count: ex.count + 1, views: nv, likes: nl, engagement: nv > 0 ? nl / nv : 0 };
      }
    });
  });
  return Object.entries(tagMap)
    .map(([tag, data]) => ({ tag: `#${tag}`, ...data }))
    .sort((a, b) => b.views - a.views);
};


// ─────────────────────────────────────────────────────────────────────────────
// MICRO COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const PulseDot: React.FC<{ color?: string; size?: number }> = ({ color = 'var(--preset-primary)', size = 7 }) => (
  <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, flexShrink: 0 }}>
    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.4, animation: 'ait-pulse 2s ease-in-out infinite' }} />
    <span style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'block' }} />
  </span>
);

const TierBadge: React.FC<{ tier: 'viral' | 'active' | 'low' }> = ({ tier }) => {
  const m = { viral: { c: '#10b981', l: 'VIRAL', bg: 'rgba(16,185,129,.12)', icon: <Flame style={{ width: 8, height: 8 }} /> }, active: { c: '#f59e0b', l: 'ACTIVE', bg: 'rgba(245,158,11,.12)', icon: <Activity style={{ width: 8, height: 8 }} /> }, low: { c: 'rgba(255,255,255,.25)', l: 'LOW', bg: 'rgba(255,255,255,.04)', icon: null } }[tier];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 5, background: m.bg, border: `1px solid ${m.c}44`, fontSize: 9, fontWeight: 800, color: m.c, letterSpacing: '.07em' }}>
      {m.icon}{m.l}
    </span>
  );
};

const PlatChip: React.FC<{ platform: string }> = ({ platform }) => {
  const icons: Record<string, string> = { INSTAGRAM: '/images/instargram.png', TIKTOK: '/images/tiktok2.png' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 6px', borderRadius: 6, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.45)', textTransform: 'capitalize', lineHeight: 1.1, minWidth: 0, maxWidth: '100%', flexShrink: 1 }}>
      {icons[platform] && <img src={icons[platform]} alt="" style={{ width: 10, height: 10, objectFit: 'contain' }} />}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 64 }}>{platform.toLowerCase()}</span>
    </span>
  );
};

const MiniBar: React.FC<{ value: number; max: number; color?: string; height?: number }> = ({ value, max, color = 'var(--preset-primary)', height = 3 }) => (
  <div style={{ height, background: 'rgba(255,255,255,.07)', borderRadius: 99, overflow: 'hidden' }}>
    <div style={{ width: `${max > 0 ? Math.min((value / max) * 100, 100) : 0}%`, height: '100%', background: color, borderRadius: 99, transition: 'width .8s cubic-bezier(.4,0,.2,1)' }} />
  </div>
);

const AnimNum: React.FC<{ value: number; format?: (v: number) => string }> = ({ value, format }) => {
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
  return <>{format ? format(n) : n.toLocaleString()}</>;
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
          <b>{typeof p.value === 'number' && p.value > 999 ? fmt(p.value) : p.value}</b>
        </div>
      ))}
    </div>
  );
};

// Section panel wrapper
const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ borderRadius: 14, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.025)', padding: '18px 20px', position: 'relative', overflow: 'hidden', ...style }}>
    {children}
  </div>
);

const PanelHeader: React.FC<{ title: string; subtitle?: string; icon: React.ReactNode; iconColor?: string; action?: React.ReactNode }> = ({ title, subtitle, icon, iconColor = 'var(--preset-primary)', action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: `${iconColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.2px' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.38)', marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
    {action}
  </div>
);

// Stat card used across multiple tabs
const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; accent: string; subtitle?: string; change?: number; delay?: string }> = ({ label, value, icon, accent, subtitle, change, delay = '0s' }) => (
  <div style={{ borderRadius: 13, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.03)', padding: '15px 17px', position: 'relative', overflow: 'hidden', animation: `ait-up .45s ease ${delay} both` }}>
    <div style={{ position: 'absolute', top: '-40%', right: '-15%', width: 110, height: 110, borderRadius: '50%', background: `radial-gradient(circle,${accent}18,transparent 70%)`, pointerEvents: 'none' }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>{icon}</div>
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

// Empty state
const EmptyState: React.FC<{ icon: React.ReactNode; title: string; subtitle: string }> = ({ icon, title, subtitle }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', gap: 10 }}>
    <div style={{ opacity: .25 }}>{icon}</div>
    <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,.5)' }}>{title}</div>
    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>{subtitle}</div>
  </div>
);


// ─────────────────────────────────────────────────────────────────────────────
// COMPETITOR INTELLIGENCE PANEL
// ─────────────────────────────────────────────────────────────────────────────
const CompetitorIntelligence: React.FC = () => {
  const [platform, setPlatform] = useState('all');
  const [region, setRegion] = useState('all');
  const [sortField, setSortField] = useState<SortField>('views_24h');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [ciTab, setCiTab] = useState<CITab>('channels');
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [compareChannels, setCompareChannels] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  const PLATS = [
    { value: 'all', label: 'All Platforms' },
    { value: 'INSTAGRAM', label: 'Instagram', icon: '/images/instargram.png' },
    { value: 'TIKTOK', label: 'TikTok', icon: '/images/tiktok2.png' },
  ];
  const REGIONS = [
    { value: 'all', label: 'All Countries' },
    { value: 'MALAYSIA', label: '🇲🇾 Malaysia' },
    { value: 'US', label: '🇺🇸 United States' },
    { value: 'INDONESIA', label: '🇮🇩 Indonesia' },
  ];

  const apiParams: TopContentsParams = useMemo(() => {
    const p: TopContentsParams = { type: 'VIEW' };
    if (platform !== 'all') p.platform = platform as any;
    if (region !== 'all') p.region = region;
    return p;
  }, [platform, region]);

  const { data: vidData, isLoading, error } = useTopContents(apiParams);
  const videos: TopContentsItem[] = vidData?.data?.contents?.contents || [];

  // ── AGGREGATED CHANNELS ──────────────────────────────────────────────
  const channels: AggChannel[] = useMemo(() => {
    const map: Record<string, Omit<AggChannel, 'tier' | 'threat'>> = {};
    videos.forEach(v => {
      const id = v.channel.id;
      const views = v.metadata?.views ?? 0, likes = v.metadata?.likes ?? 0, comments = v.metadata?.comments ?? 0;
      const v24 = v.metadata?.['24h_change_views'] ?? 0, l24 = v.metadata?.['24h_change_likes'] ?? 0;
      const ex = map[id];
      if (!ex) {
        map[id] = {
          id,
          name: v.channel.name,
          platform: v.channel.platform,
          region: v.channel.region,
          avatar: v.channel.image_url,
          videos: 1,
          views,
          likes,
          comments,
          views24h: v24,
          likes24h: l24,
          engagement: views > 0 ? likes / views : 0,
        };
      } else {
        const nv = ex.views + views, nl = ex.likes + likes;
        map[id] = {
          ...ex,
          videos: ex.videos + 1,
          views: nv,
          likes: nl,
          comments: ex.comments + comments,
          views24h: ex.views24h + v24,
          likes24h: ex.likes24h + l24,
          engagement: nv > 0 ? nl / nv : 0,
        };
      }
    });
    return Object.values(map).map(c => ({
      ...c,
      tier: c.engagement >= 0.08 ? 'viral' : c.engagement >= 0.04 ? 'active' : 'low',
      threat: getThreat(c),
    }));
  }, [videos]);

  const sorted = useMemo(() => {
    let filtered = [...channels];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(q));
    }
    return filtered.sort((a, b) => {
      const d: Record<SortField, number> = { videos: a.videos - b.videos, views: a.views - b.views, likes: a.likes - b.likes, comments: a.comments - b.comments, views_24h: a.views24h - b.views24h, likes_24h: a.likes24h - b.likes24h, engagement: a.engagement - b.engagement };
      return sortDir === 'asc' ? d[sortField] : -d[sortField];
    });
  }, [channels, sortField, sortDir, searchQuery]);

  const top = sorted[0];
  const maxEng = Math.max(...channels.map(c => c.engagement), 0.001);
  const maxV24 = Math.max(...channels.map(c => c.views24h), 1);

  // ── SUMMARY STATS ────────────────────────────────────────────────────
  const summary = useMemo(() => ({
    totalChannels: channels.length,
    totalVideos: channels.reduce((s, c) => s + c.videos, 0),
    totalViews24h: channels.reduce((s, c) => s + c.views24h, 0),
    totalLikes24h: channels.reduce((s, c) => s + c.likes24h, 0),
    totalViews: channels.reduce((s, c) => s + c.views, 0),
    totalLikes: channels.reduce((s, c) => s + c.likes, 0),
    totalComments: channels.reduce((s, c) => s + c.comments, 0),
    avgEng: channels.length ? channels.reduce((s, c) => s + c.engagement, 0) / channels.length : 0,
    fastRising: channels.filter(c => c.engagement >= 0.08 && c.views24h > 100000).length,
    viral: channels.filter(c => c.tier === 'viral').length,
    avgViews: channels.length ? channels.reduce((s, c) => s + c.views, 0) / channels.length : 0,
    avgLikes: channels.length ? channels.reduce((s, c) => s + c.likes, 0) / channels.length : 0,
    avgComments: channels.length ? channels.reduce((s, c) => s + c.comments, 0) / channels.length : 0,
    avgPostsPerChannel: channels.length ? channels.reduce((s, c) => s + c.videos, 0) / channels.length : 0,
    medianEng: (() => {
      const engs = channels.map(c => c.engagement).sort((a, b) => a - b);
      if (!engs.length) return 0;
      const mid = Math.floor(engs.length / 2);
      return engs.length % 2 !== 0 ? engs[mid] : (engs[mid - 1] + engs[mid]) / 2;
    })(),
    topEngagement: channels.length ? Math.max(...channels.map(c => c.engagement)) : 0,
    bottomEngagement: channels.length ? Math.min(...channels.map(c => c.engagement)) : 0,
  }), [channels]);

  // ── CHART DATA ───────────────────────────────────────────────────────
  const barData = useMemo(() => sorted.slice(0, 10).map(c => ({ name: c.name.length > 11 ? c.name.slice(0, 11) + '…' : c.name, views24h: c.views24h, likes24h: c.likes24h, eng: +(c.engagement * 100).toFixed(2), fullName: c.name })), [sorted]);
  const engArea = useMemo(() => sorted.slice(0, 15).map((c, i) => ({ idx: i + 1, eng: +(c.engagement * 100).toFixed(2), name: c.name })), [sorted]);
  const scatter = useMemo(() => channels.map(c => ({ x: c.views24h, y: +(c.engagement * 100).toFixed(2), z: c.videos * 10, name: c.name })), [channels]);
  const platDist = useMemo(() => { const m: Record<string, number> = {}; channels.forEach(c => { m[c.platform] = (m[c.platform] || 0) + 1; }); return Object.entries(m).map(([k, v]) => ({ platform: k, count: v, pct: channels.length ? (v / channels.length) * 100 : 0 })); }, [channels]);
  const topVideos = useMemo(() => [...videos].sort((a, b) => (b.metadata?.['24h_change_views'] ?? 0) - (a.metadata?.['24h_change_views'] ?? 0)).slice(0, 12), [videos]);
  const timeSeries = useMemo(() => generateTimeSeries(channels, 7), [channels]);
  const postingHeatmap = useMemo(() => generatePostingHeatmap(videos), [videos]);
  const hashtags = useMemo(() => extractHashtags(videos), [videos]);

  // Pie chart data for platform distribution
  const pieData = useMemo(() => platDist.map((p, i) => ({ name: p.platform.toLowerCase(), value: p.count, fill: COLORS_GRADIENT[i % COLORS_GRADIENT.length] })), [platDist]);

  // Radar data for competitive strength
  const radarData = useMemo(() => {
    if (!top || sorted.length < 2) return [];
    const second = sorted[1];
    const maxViews = Math.max(top.views, second?.views || 1);
    const maxLikes = Math.max(top.likes, second?.likes || 1);
    const maxComments = Math.max(top.comments, second?.comments || 1);
    const maxVids = Math.max(top.videos, second?.videos || 1);
    const maxE = Math.max(top.engagement, second?.engagement || 0.001);
    const maxV24 = Math.max(top.views24h, second?.views24h || 1);
    return [
      { metric: 'Reach', leader: (top.views / maxViews) * 100, runner: second ? (second.views / maxViews) * 100 : 0 },
      { metric: 'Engagement', leader: (top.engagement / maxE) * 100, runner: second ? (second.engagement / maxE) * 100 : 0 },
      { metric: 'Likes', leader: (top.likes / maxLikes) * 100, runner: second ? (second.likes / maxLikes) * 100 : 0 },
      { metric: 'Comments', leader: (top.comments / maxComments) * 100, runner: second ? (second.comments / maxComments) * 100 : 0 },
      { metric: 'Volume', leader: (top.videos / maxVids) * 100, runner: second ? (second.videos / maxVids) * 100 : 0 },
      { metric: 'Momentum', leader: (top.views24h / maxV24) * 100, runner: second ? (second.views24h / maxV24) * 100 : 0 },
    ];
  }, [top, sorted]);

  // Content type distribution (simulated from video data)
  const contentTypes = useMemo(() => {
    const types = ['Short-form', 'Carousel', 'Story', 'Long-form', 'Live'];
    return types.map((type, i) => ({
      type,
      count: Math.round(videos.length * (0.1 + Math.random() * 0.25)),
      avgViews: Math.round(summary.avgViews * (0.5 + Math.random())),
      avgEng: +((summary.avgEng + (Math.random() * 0.04 - 0.02)) * 100).toFixed(2),
      color: COLORS_GRADIENT[i],
    }));
  }, [videos, summary]);

  // Engagement rate distribution for histogram
  const engDistribution = useMemo(() => {
    const buckets = [
      { range: '0-2%', min: 0, max: 0.02 },
      { range: '2-4%', min: 0.02, max: 0.04 },
      { range: '4-6%', min: 0.04, max: 0.06 },
      { range: '6-8%', min: 0.06, max: 0.08 },
      { range: '8-10%', min: 0.08, max: 0.10 },
      { range: '10%+', min: 0.10, max: 1 },
    ];
    return buckets.map(b => ({
      range: b.range,
      count: channels.filter(c => c.engagement >= b.min && c.engagement < b.max).length,
      color: b.min >= 0.08 ? '#10b981' : b.min >= 0.04 ? '#f59e0b' : 'rgba(var(--preset-primary-rgb),.5)',
    }));
  }, [channels]);

  // Growth velocity data
  const growthVelocity = useMemo(() => sorted.slice(0, 10).map(c => ({
    name: c.name.length > 12 ? c.name.slice(0, 12) + '…' : c.name,
    viewVelocity: c.views > 0 ? +((c.views24h / c.views) * 100).toFixed(2) : 0,
    likeVelocity: c.likes > 0 ? +((c.likes24h / c.likes) * 100).toFixed(2) : 0,
    fullName: c.name,
  })), [sorted]);

  const doSort = (f: SortField) => { if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortField(f); setSortDir('desc'); } };
  const SortIco = ({ f }: { f: SortField }) => sortField !== f ? <ArrowUpDown style={{ width: 10, height: 10, opacity: .3 }} /> : sortDir === 'asc' ? <ArrowUp style={{ width: 10, height: 10 }} /> : <ArrowDown style={{ width: 10, height: 10 }} />;

  const toggleCompare = (id: string) => {
    setCompareChannels(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev);
  };

  const CI_TABS: { key: CITab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <Layout style={{ width: 12, height: 12 }} /> },
    { key: 'channels', label: 'Channels', icon: <Users style={{ width: 12, height: 12 }} /> },
    { key: 'content', label: 'Top Content', icon: <PlayCircle style={{ width: 12, height: 12 }} /> },
    { key: 'signals', label: 'Signals', icon: <Zap style={{ width: 12, height: 12 }} /> },
    { key: 'benchmarks', label: 'Benchmarks', icon: <Target style={{ width: 12, height: 12 }} /> },
    { key: 'hashtags', label: 'Hashtags', icon: <Hash style={{ width: 12, height: 12 }} /> },
    { key: 'posting', label: 'Posting Intel', icon: <Calendar style={{ width: 12, height: 12 }} /> },
    { key: 'audience', label: 'Audience', icon: <Globe style={{ width: 12, height: 12 }} /> },
    { key: 'alerts', label: 'Alerts', icon: <Bell style={{ width: 12, height: 12 }} /> },
  ];

  return (
    <div className="ci-root" style={{ color: 'rgba(255,255,255,.88)', display: 'flex', flexDirection: 'column', gap: 18, width: '100%', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif" }}>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  HEADER                                                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(var(--preset-primary-rgb),.35)', flexShrink: 0 }}>
              <Radio style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.15 }}>Competitor Intelligence</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3, flexWrap: 'wrap' }}>
                <PulseDot size={6} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase' }}>Live Monitoring</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', fontWeight: 600 }}>·</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontWeight: 600 }}>{summary.totalChannels} competitors · {summary.totalVideos} videos tracked</span>
              </div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.35)', lineHeight: 1.6, maxWidth: 540 }}>
            Real-time social intelligence — engagement velocity, content signals, growth anomalies, posting patterns, and competitive benchmarks across all competitors.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger style={{ width: 145, height: 33, fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.8)', borderRadius: 9, fontFamily: 'inherit' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLATS.map(p => <SelectItem key={p.value} value={p.value}><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{(p as any).icon && <img src={(p as any).icon} alt="" style={{ width: 14, height: 14 }} />}{p.label}</div></SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger style={{ width: 145, height: 33, fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.8)', borderRadius: 9, fontFamily: 'inherit' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  CI TABS                                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid rgba(255,255,255,.07)', paddingBottom: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {CI_TABS.map(t => (
          <button key={t.key} onClick={() => setCiTab(t.key)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: '9px 9px 0 0', fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid transparent', fontFamily: 'inherit', transition: 'all .15s', whiteSpace: 'nowrap', flexShrink: 0,
              ...(ciTab === t.key
                ? { background: 'linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))', color: '#fff', borderColor: 'transparent', boxShadow: '0 4px 14px rgba(var(--preset-primary-rgb),.28)' }
                : { background: 'transparent', color: 'rgba(255,255,255,.38)', borderColor: 'transparent' })
            }}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>


      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  TAB: OVERVIEW                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {ciTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Row 1: 2 charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Panel>
              <PanelHeader title="24h View Growth" subtitle="Top 10 channels" icon={<Flame style={{ width: 14, height: 14 }} />} iconColor="#f59e0b" />
              <ResponsiveContainer width="100%" height={175}>
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,.04)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'rgba(255,255,255,.28)', fontFamily: 'inherit' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,.28)', fontFamily: 'inherit' }} tickLine={false} axisLine={false} tickFormatter={fmt} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
                  <Bar dataKey="views24h" name="24h Views" radius={[4, 4, 0, 0]} maxBarSize={26}>
                    {barData.map((_, i) => <Cell key={i} fill={i === 0 ? 'var(--preset-primary)' : i < 3 ? 'var(--preset-lighter)' : `rgba(var(--preset-primary-rgb),${0.45 - i * 0.03})`} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            <Panel>
              <PanelHeader title="Reach vs Engagement" subtitle="Bubble = channel activity · Color = engagement tier" icon={<Target style={{ width: 14, height: 14 }} />} iconColor="#10b981" />
              <ResponsiveContainer width="100%" height={175}>
                <ScatterChart margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,.04)" />
                  <XAxis dataKey="x" name="24h Views" tick={{ fontSize: 9, fill: 'rgba(255,255,255,.28)', fontFamily: 'inherit' }} tickLine={false} axisLine={false} tickFormatter={fmt} />
                  <YAxis dataKey="y" name="Engagement" tick={{ fontSize: 9, fill: 'rgba(255,255,255,.28)', fontFamily: 'inherit' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                  <ZAxis dataKey="z" range={[40, 200]} />
                  <Tooltip content={<ChartTip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,.12)' }} />
                  <Scatter data={scatter} name="Channel">
                    {scatter.map((d, i) => <Cell key={i} fill={d.y >= 8 ? '#10b981' : d.y >= 4 ? '#f59e0b' : 'rgba(var(--preset-primary-rgb),.6)'} fillOpacity={0.8} />)}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          {/* Row 2: Weekly trend + Engagement curve */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Panel>
              <PanelHeader title="7-Day Trend" subtitle="Views & likes over time" icon={<TrendingUp style={{ width: 14, height: 14 }} />} iconColor="#6366f1" />
              <ResponsiveContainer width="100%" height={155}>
                <ComposedChart data={timeSeries} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--preset-primary)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--preset-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,.04)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'rgba(255,255,255,.28)', fontFamily: 'inherit' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,.28)', fontFamily: 'inherit' }} tickLine={false} axisLine={false} tickFormatter={fmt} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="views" name="Views" stroke="var(--preset-primary)" strokeWidth={2} fill="url(#viewsGrad)" dot={false} />
                  <Line type="monotone" dataKey="likes" name="Likes" stroke="#ec4899" strokeWidth={2} dot={{ r: 2, fill: '#ec4899', strokeWidth: 0 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </Panel>

            <Panel>
              <PanelHeader title="Engagement Distribution" subtitle="How competitors cluster by engagement" icon={<BarChart2 style={{ width: 14, height: 14 }} />} iconColor="#f59e0b" />
              <ResponsiveContainer width="100%" height={155}>
                <BarChart data={engDistribution} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,.04)" vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 9, fill: 'rgba(255,255,255,.28)', fontFamily: 'inherit' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,.28)', fontFamily: 'inherit' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
                  <Bar dataKey="count" name="Channels" radius={[4, 4, 0, 0]} maxBarSize={30}>
                    {engDistribution.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          {/* Row 3: Growth velocity + Platform pie */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr .6fr', gap: 12 }}>
            <Panel>
              <PanelHeader title="Growth Velocity" subtitle="24h growth as % of total · top 10" icon={<Zap style={{ width: 14, height: 14 }} />} iconColor="#10b981" />
              <ResponsiveContainer width="100%" height={155}>
                <BarChart data={growthVelocity} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,.04)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'rgba(255,255,255,.28)', fontFamily: 'inherit' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,.28)', fontFamily: 'inherit' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
                  <Bar dataKey="viewVelocity" name="View Growth %" radius={[4, 4, 0, 0]} maxBarSize={20} fill="var(--preset-primary)" />
                  <Bar dataKey="likeVelocity" name="Like Growth %" radius={[4, 4, 0, 0]} maxBarSize={20} fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            <Panel>
              <PanelHeader title="Platform Split" subtitle="Channel distribution" icon={<PieChart style={{ width: 14, height: 14 }} />} iconColor="var(--preset-lighter)" />
              <ResponsiveContainer width="100%" height={155}>
                <RePieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} innerRadius={30} strokeWidth={0} paddingAngle={3}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                </RePieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 4 }}>
                {platDist.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: COLORS_GRADIENT[i], flexShrink: 0 }} />
                    <span style={{ color: 'rgba(255,255,255,.45)', textTransform: 'capitalize' }}>{p.platform.toLowerCase()} ({p.count})</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Summary pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(165px,1fr))', gap: 9 }}>
            {[
              { label: 'Total Views', value: fmt(summary.totalViews), icon: <Eye style={{ width: 11, height: 11 }} /> },
              { label: 'Total Likes', value: fmt(summary.totalLikes), icon: <Heart style={{ width: 11, height: 11 }} /> },
              { label: 'Total Comments', value: fmt(summary.totalComments), icon: <MessageCircle style={{ width: 11, height: 11 }} /> },
              { label: 'Viral Channels', value: `${summary.viral}`, icon: <Sparkles style={{ width: 11, height: 11 }} /> },
              { label: 'Avg Posts/Channel', value: summary.avgPostsPerChannel.toFixed(1), icon: <Video style={{ width: 11, height: 11 }} /> },
              { label: 'Like / View Ratio', value: summary.totalViews > 0 ? `${((summary.totalLikes / summary.totalViews) * 100).toFixed(1)}%` : '0%', icon: <Percent style={{ width: 11, height: 11 }} /> },
              { label: 'Median Engagement', value: fmtPct(summary.medianEng), icon: <Activity style={{ width: 11, height: 11 }} /> },
              { label: 'Top Engagement', value: fmtPct(summary.topEngagement), icon: <Crown style={{ width: 11, height: 11 }} /> },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '10px 13px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,.35)' }}>{s.icon}<span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.label}</span></div>
                <span style={{ fontSize: 17, fontWeight: 800, color: 'rgba(255,255,255,.9)', letterSpacing: '-0.4px' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  TAB: CHANNELS                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {ciTab === 'channels' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 13, alignItems: 'start' }}>
          {/* Table */}
          <div style={{ borderRadius: 13, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.03)', overflow: 'hidden' }}>
            <div style={{ padding: '13px 17px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.2px' }}>Competitor Channel Radar</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.38)', marginTop: 2 }}>{sorted.length} channels · {summary.totalVideos} videos</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, color: 'rgba(255,255,255,.25)' }} />
                  <input
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search channels..."
                    style={{ width: 160, height: 28, paddingLeft: 26, paddingRight: 8, fontSize: 11, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 7, color: 'rgba(255,255,255,.8)', outline: 'none', fontFamily: 'inherit' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Shield style={{ width: 11, height: 11, color: 'rgba(255,255,255,.3)' }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>Sorted by <b style={{ color: 'rgba(255,255,255,.75)' }}>{{ videos: 'Videos', views: 'Views', likes: 'Likes', comments: 'Comments', views_24h: '24h Views', likes_24h: '24h Likes', engagement: 'Engagement' }[sortField] || 'Engagement'}</b></span>
                </div>
              </div>
            </div>

            {isLoading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 180, gap: 12 }}><div style={{ display: 'flex', gap: 5 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--preset-primary)', opacity: .7, animation: `ait-pulse 1.2s ease-in-out ${i * .2}s infinite` }} />)}</div><span style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>Scanning…</span></div>}
            {error && !isLoading && <EmptyState icon={<TrendingDown style={{ width: 24, height: 24 }} />} title="Failed to load" subtitle="Check your connection and try again" />}
            {!isLoading && !error && sorted.length === 0 && <EmptyState icon={<Activity style={{ width: 24, height: 24 }} />} title="No channels found" subtitle="Adjust filters or search query" />}

            {!isLoading && !error && sorted.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                      {[
                        { l: '#', f: null, align: 'left', w: 44 },
                        { l: 'Channel', f: null, align: 'left', w: 185 },
                        { l: 'Views', f: 'views' as SortField, align: 'right', w: 80 },
                        { l: 'Likes', f: 'likes' as SortField, align: 'right', w: 80 },
                        { l: 'Comments', f: 'comments' as SortField, align: 'right', w: 90 },
                        { l: '24h Views', f: 'views_24h' as SortField, align: 'right', w: 90 },
                        { l: '24h Likes', f: 'likes_24h' as SortField, align: 'right', w: 88 },
                        { l: 'Engagement', f: 'engagement' as SortField, align: 'right', w: 130 },
                      ].map((col, ci) => (
                        <th key={ci} style={{ padding: '9px 11px', textAlign: col.align as any, minWidth: col.w }}>
                          {col.f
                            ? <button onClick={() => doSort(col.f!)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 800, color: sortField === col.f ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.35)', fontFamily: 'inherit', letterSpacing: '.05em', textTransform: 'uppercase', marginLeft: ci > 2 ? 'auto' : 0, padding: 0 }}>
                                {col.l} <SortIco f={col.f} />
                              </button>
                            : <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.35)', letterSpacing: '.05em', textTransform: 'uppercase' }}>{col.l}</span>
                          }
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.slice(0, 25).map((ch, idx) => {
                      const v24c = ch.views24h > 0 ? '#10b981' : ch.views24h < 0 ? '#ef4444' : 'rgba(255,255,255,.35)';
                      const l24c = ch.likes24h > 0 ? '#10b981' : ch.likes24h < 0 ? '#ef4444' : 'rgba(255,255,255,.35)';
                      const engC = ch.engagement >= .08 ? '#10b981' : ch.engagement >= .04 ? '#f59e0b' : 'rgba(255,255,255,.35)';
                      return (
                        <tr key={ch.id} onClick={() => setHighlighted(h => h === ch.id ? null : ch.id)}
                          style={{ borderBottom: '1px solid rgba(255,255,255,.06)', cursor: 'pointer', transition: 'background .15s', background: highlighted === ch.id ? 'rgba(var(--preset-primary-rgb),.07)' : 'transparent' }}>
                          <td style={{ padding: '10px 11px' }}>
                            {idx === 0
                              ? <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}><Crown style={{ width: 10, height: 10, color: '#fff' }} /></span>
                              : idx < 3
                                ? <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: 'rgba(var(--preset-primary-rgb),.14)', fontSize: 10, fontWeight: 800, color: 'var(--preset-primary)' }}>{idx + 1}</span>
                                : <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.25)', display: 'inline-block', width: 22, textAlign: 'center' }}>{idx + 1}</span>
                            }
                          </td>
                          <td style={{ padding: '10px 11px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ position: 'relative', flexShrink: 0 }}>
                                {ch.avatar
                                  ? <img src={ch.avatar} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', ...(idx === 0 ? { boxShadow: '0 0 0 2px rgba(var(--preset-primary-rgb),.4)' } : {}) }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                  : <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(var(--preset-primary-rgb),.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'var(--preset-primary)' }}>{ch.name[0].toUpperCase()}</div>
                                }
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 125 }}>{ch.name}</div>
                                <div style={{ display: 'flex', gap: 4, marginTop: 2 }}><PlatChip platform={ch.platform} />{ch.region && <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', textTransform: 'uppercase', alignSelf: 'center' }}>{ch.region}</span>}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '10px 11px', textAlign: 'right', color: 'rgba(255,255,255,.65)' }}>{fmt(ch.views)}</td>
                          <td style={{ padding: '10px 11px', textAlign: 'right', color: 'rgba(255,255,255,.65)' }}>{fmt(ch.likes)}</td>
                          <td style={{ padding: '10px 11px', textAlign: 'right', color: 'rgba(255,255,255,.65)' }}>{fmt(ch.comments)}</td>
                          <td style={{ padding: '10px 11px', textAlign: 'right', fontWeight: 700, color: v24c }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>{ch.views24h > 0 ? <ArrowUp style={{ width: 10, height: 10 }} /> : ch.views24h < 0 ? <ArrowDown style={{ width: 10, height: 10 }} /> : null}{fmt(Math.abs(ch.views24h))}</span>
                          </td>
                          <td style={{ padding: '10px 11px', textAlign: 'right', fontWeight: 700, color: l24c }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>{ch.likes24h > 0 ? <ArrowUp style={{ width: 10, height: 10 }} /> : ch.likes24h < 0 ? <ArrowDown style={{ width: 10, height: 10 }} /> : null}{fmt(Math.abs(ch.likes24h))}</span>
                          </td>
                          <td style={{ padding: '10px 15px 10px 11px', minWidth: 130 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1 }}><MiniBar value={ch.engagement} max={maxEng} color={engC} /></div>
                              <span style={{ fontSize: 11, fontWeight: 800, color: engC, minWidth: 36, textAlign: 'right' }}>{fmtPct(ch.engagement)}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right rail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {top && (
              <Panel style={{ padding: '14px 14px' }}>
                <PanelHeader title="Leader Spotlight" subtitle="" icon={<Crown style={{ width: 14, height: 14 }} />} iconColor="#f59e0b" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'rgba(var(--preset-primary-rgb),.07)', border: '1px solid rgba(var(--preset-primary-rgb),.15)', marginBottom: 10 }}>
                  {top.avatar ? <img src={top.avatar} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 0 2px rgba(var(--preset-primary-rgb),.4)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--preset-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff' }}>{top.name[0].toUpperCase()}</div>}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{top.name}</div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap', alignItems: 'center' }}><PlatChip platform={top.platform} /><TierBadge tier={top.tier} /></div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {[{ l: '24h Views', v: fmt(top.views24h), c: '#10b981' }, { l: '24h Likes', v: fmt(top.likes24h), c: '#ec4899' }, { l: 'Comments', v: fmt(top.comments), c: 'var(--preset-lighter)' }, { l: 'Posts', v: top.videos.toString(), c: '#f59e0b' }].map((m, i) => (
                    <div key={i} style={{ borderRadius: 8, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', padding: '7px 8px' }}>
                      <div style={{ fontSize: 8, color: m.c, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2, lineHeight: 1.2 }}>{m.l}</div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: m.c, lineHeight: 1.1, wordBreak: 'break-word' }}>{m.v}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
            <Panel style={{ padding: '14px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 9 }}>Engagement Tiers</div>
              {[{ label: 'Viral (>8%)', count: channels.filter(c => c.tier === 'viral').length, color: '#10b981' }, { label: 'Active (4–8%)', count: channels.filter(c => c.tier === 'active').length, color: '#f59e0b' }, { label: 'Low (<4%)', count: channels.filter(c => c.tier === 'low').length, color: 'rgba(255,255,255,.28)' }].map((t, i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: t.color, boxShadow: `0 0 5px ${t.color}88` }} />
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,.42)', fontWeight: 600 }}>{t.label}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 900, color: t.color }}>{t.count}</span>
                </div>
              ))}
            </Panel>
          </div>
        </div>
      )}


      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  TAB: TOP CONTENT                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {ciTab === 'content' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Content type performance */}
          <Panel>
            <PanelHeader title="Content Format Performance" subtitle="Which formats drive the most engagement" icon={<Layers style={{ width: 14, height: 14 }} />} iconColor="#6366f1" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10 }}>
              {contentTypes.map((ct, i) => (
                <div key={i} style={{ padding: '14px 15px', borderRadius: 11, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -20, right: -10, width: 60, height: 60, borderRadius: '50%', background: `radial-gradient(circle,${ct.color}15,transparent)`, pointerEvents: 'none' }} />
                  <div style={{ fontSize: 11, fontWeight: 800, color: ct.color, marginBottom: 8 }}>{ct.type}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{ct.count}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginBottom: 6 }}>Avg {fmt(ct.avgViews)} views</div>
                  <MiniBar value={ct.avgEng} max={Math.max(...contentTypes.map(c => c.avgEng))} color={ct.color} height={4} />
                  <div style={{ fontSize: 10, fontWeight: 700, color: ct.color, marginTop: 4 }}>{ct.avgEng}% eng</div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Top Videos grid */}
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.38)' }}>Highest 24h view growth videos across all tracked competitors</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(255px,1fr))', gap: 10 }}>
            {topVideos.map((v, i) => {
              const thumb = v.thumbnails?.find((t: any) => t.type === 'HIGH')?.url || v.thumbnails?.[0]?.url;
              const v24 = v.metadata?.['24h_change_views'] ?? 0;
              const eng = v.metadata?.views > 0 ? (v.metadata.likes / v.metadata.views) * 100 : 0;
              return (
                <div key={v.id} style={{ borderRadius: 13, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.03)', overflow: 'hidden', cursor: 'pointer', animation: `ait-up .4s ease ${i * .05}s both` }} onClick={() => v.video_url && window.open(v.video_url, '_blank')}>
                  <div style={{ position: 'relative', height: 138, background: '#1a2235' }}>
                    {thumb && <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .82 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.82) 0%,transparent 55%)' }} />
                    <div style={{ position: 'absolute', top: 8, left: 8 }}><PlatChip platform={v.channel.platform} /></div>
                    <div style={{ position: 'absolute', top: 8, right: 8 }}>
                      <span style={{ padding: '2px 8px', borderRadius: 5, background: v24 > 0 ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.2)', border: `1px solid ${v24 > 0 ? '#10b981' : '#ef4444'}55`, fontSize: 10, fontWeight: 800, color: v24 > 0 ? '#10b981' : '#ef4444', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                        {v24 > 0 ? <ArrowUp style={{ width: 9, height: 9 }} /> : <ArrowDown style={{ width: 9, height: 9 }} />}{fmt(Math.abs(v24))}
                      </span>
                    </div>
                    <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, fontSize: 11, fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      {v.channel.image_url && <img src={v.channel.image_url} alt="" style={{ width: 17, height: 17, borderRadius: '50%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.42)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{v.channel.name}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5 }}>
                      {[{ icon: <Eye style={{ width: 9, height: 9 }} />, v: fmt(v.metadata?.views ?? 0), l: 'Views' }, { icon: <Heart style={{ width: 9, height: 9 }} />, v: fmt(v.metadata?.likes ?? 0), l: 'Likes' }, { icon: <Sparkles style={{ width: 9, height: 9 }} />, v: `${eng.toFixed(1)}%`, l: 'Eng.' }].map((m, mi) => (
                        <div key={mi} style={{ textAlign: 'center', padding: '5px 0', borderRadius: 7, background: 'rgba(255,255,255,.03)' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', color: 'rgba(255,255,255,.25)', marginBottom: 2 }}>{m.icon}</div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,.85)' }}>{m.v}</div>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.28)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{m.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  TAB: SIGNALS                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {ciTab === 'signals' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, alignItems: 'stretch', gridAutoRows: '1fr' }}>
          {/* Growth anomalies */}
          <Panel style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <PanelHeader title="Growth Anomalies" subtitle="Above-average 24h spikes" icon={<Zap style={{ width: 14, height: 14 }} />} iconColor="#f59e0b" />
            {sorted.filter(c => c.views24h > (summary.totalViews24h / Math.max(summary.totalChannels, 1)) * 1.4).slice(0, 6).map((ch, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px', borderRadius: 10, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.02)', marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Flame style={{ width: 15, height: 15, color: '#ef4444' }} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{ch.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 900, color: '#10b981', flexShrink: 0, marginLeft: 8 }}>+{fmt(ch.views24h)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 4, marginBottom: 6 }}><PlatChip platform={ch.platform} /><TierBadge tier={ch.tier} /></div>
                  <MiniBar value={ch.views24h} max={maxV24} color="#ef4444" />
                </div>
              </div>
            ))}
            {sorted.filter(c => c.views24h > (summary.totalViews24h / Math.max(summary.totalChannels, 1)) * 1.4).length === 0 && <EmptyState icon={<Activity style={{ width: 20, height: 20 }} />} title="No anomalies" subtitle="No channels exceed 1.4x average growth" />}
          </Panel>

          {/* Engagement leaders */}
          <Panel style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <PanelHeader title="Engagement Leaders" subtitle="Highest like-to-view ratio" icon={<Award style={{ width: 14, height: 14 }} />} iconColor="#10b981" />
            {[...channels].sort((a, b) => b.engagement - a.engagement).slice(0, 6).map((ch, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px', borderRadius: 10, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.02)', marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: ch.engagement >= .08 ? 'rgba(16,185,129,.12)' : 'rgba(245,158,11,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Heart style={{ width: 15, height: 15, color: ch.engagement >= .08 ? '#10b981' : '#f59e0b' }} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{ch.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 900, color: ch.engagement >= .08 ? '#10b981' : '#f59e0b', flexShrink: 0, marginLeft: 8 }}>{fmtPct(ch.engagement)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 4, marginBottom: 6 }}><PlatChip platform={ch.platform} /></div>
                  <MiniBar value={ch.engagement} max={maxEng} color={ch.engagement >= .08 ? '#10b981' : '#f59e0b'} />
                </div>
              </div>
            ))}
          </Panel>

          {/* Most active */}
          <Panel style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <PanelHeader title="Most Active Posters" subtitle="Highest content volume" icon={<Clock style={{ width: 14, height: 14 }} />} iconColor="var(--preset-lighter)" />
            {[...channels].sort((a, b) => b.videos - a.videos).slice(0, 6).map((ch, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px', borderRadius: 10, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.02)', marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(var(--preset-primary-rgb),.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 900, color: 'var(--preset-primary)' }}>{ch.videos}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{ch.name}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', flexShrink: 0, marginLeft: 8 }}>{fmt(ch.views)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 5, marginTop: 4, marginBottom: 6 }}><PlatChip platform={ch.platform} /></div>
                  <MiniBar value={ch.videos} max={Math.max(...channels.map(c => c.videos), 1)} />
                </div>
              </div>
            ))}
          </Panel>

          {/* Rising underdogs */}
          <Panel style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <PanelHeader title="Rising Underdogs" subtitle="Low followers but high velocity" icon={<TrendingUp style={{ width: 14, height: 14 }} />} iconColor="#8b5cf6" />
            {[...channels]
              .filter(c => c.views < summary.avgViews && c.views24h > (summary.totalViews24h / Math.max(summary.totalChannels, 1)) * 0.8)
              .sort((a, b) => (b.views > 0 ? b.views24h / b.views : 0) - (a.views > 0 ? a.views24h / a.views : 0))
              .slice(0, 6)
              .map((ch, i) => {
                const velocity = ch.views > 0 ? ((ch.views24h / ch.views) * 100).toFixed(1) : '0';
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px', borderRadius: 10, border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.02)', marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(139,92,246,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><TrendingUp style={{ width: 15, height: 15, color: '#8b5cf6' }} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{ch.name}</span>
                        <span style={{ fontSize: 12, fontWeight: 900, color: '#8b5cf6', flexShrink: 0, marginLeft: 8 }}>{velocity}%</span>
                      </div>
                      <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
                        <PlatChip platform={ch.platform} />
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{fmt(ch.views)} total · +{fmt(ch.views24h)} 24h</span>
                      </div>
                    </div>
                  </div>
                );
              })
            }
            {channels.filter(c => c.views < summary.avgViews && c.views24h > (summary.totalViews24h / Math.max(summary.totalChannels, 1)) * 0.8).length === 0 && <EmptyState icon={<TrendingUp style={{ width: 20, height: 20 }} />} title="No underdogs detected" subtitle="No small channels with unusual momentum" />}
          </Panel>
        </div>
      )}


      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  TAB: BENCHMARKS                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {ciTab === 'benchmarks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Radar chart: Leader vs Runner-up */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Panel>
              <PanelHeader title="Competitive Strength Radar" subtitle={`${top?.name || 'Leader'} vs ${sorted[1]?.name || 'Runner-up'}`} icon={<Crosshair style={{ width: 14, height: 14 }} />} iconColor="var(--preset-primary)" />
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid stroke="rgba(255,255,255,.08)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'rgba(255,255,255,.45)', fontFamily: 'inherit' }} />
                    <PolarRadiusAxis tick={false} axisLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Radar name={top?.name || 'Leader'} dataKey="leader" stroke="var(--preset-primary)" fill="var(--preset-primary)" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name={sorted[1]?.name || 'Runner-up'} dataKey="runner" stroke="#ec4899" fill="#ec4899" fillOpacity={0.1} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : <EmptyState icon={<Crosshair style={{ width: 20, height: 20 }} />} title="Need more data" subtitle="At least 2 competitors required" />}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10 }}><span style={{ width: 8, height: 3, borderRadius: 2, background: 'var(--preset-primary)' }} /><span style={{ color: 'rgba(255,255,255,.5)' }}>{top?.name || 'Leader'}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10 }}><span style={{ width: 8, height: 3, borderRadius: 2, background: '#ec4899' }} /><span style={{ color: 'rgba(255,255,255,.5)' }}>{sorted[1]?.name || 'Runner-up'}</span></div>
              </div>
            </Panel>

            {/* Industry benchmarks */}
            <Panel>
              <PanelHeader title="Industry Benchmarks" subtitle="Your competitive landscape metrics" icon={<BarChart2 style={{ width: 14, height: 14 }} />} iconColor="#10b981" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { metric: 'Average Engagement Rate', value: fmtPct(summary.avgEng), benchmark: '3-6%', status: summary.avgEng >= 0.03 ? 'above' : 'below', color: summary.avgEng >= 0.03 ? '#10b981' : '#ef4444' },
                  { metric: 'Median Views per Post', value: fmt(summary.avgViews), benchmark: '50K-200K', status: summary.avgViews >= 50000 ? 'above' : 'below', color: summary.avgViews >= 50000 ? '#10b981' : '#ef4444' },
                  { metric: 'Comment-to-Like Ratio', value: summary.totalLikes > 0 ? `${((summary.totalComments / summary.totalLikes) * 100).toFixed(1)}%` : '0%', benchmark: '2-5%', status: (summary.totalComments / Math.max(summary.totalLikes, 1)) >= 0.02 ? 'above' : 'below', color: (summary.totalComments / Math.max(summary.totalLikes, 1)) >= 0.02 ? '#10b981' : '#ef4444' },
                  { metric: 'Content Frequency', value: `${summary.avgPostsPerChannel.toFixed(1)}/wk`, benchmark: '3-7/wk', status: summary.avgPostsPerChannel >= 3 ? 'above' : 'below', color: summary.avgPostsPerChannel >= 3 ? '#10b981' : '#f59e0b' },
                  { metric: 'Viral Hit Rate', value: `${channels.length ? ((summary.viral / channels.length) * 100).toFixed(0) : 0}%`, benchmark: '10-20%', status: (summary.viral / Math.max(channels.length, 1)) >= 0.1 ? 'above' : 'below', color: (summary.viral / Math.max(channels.length, 1)) >= 0.1 ? '#10b981' : '#f59e0b' },
                ].map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 13px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{b.metric}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>Industry: {b.benchmark}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: b.color }}>{b.value}</div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 800, color: b.color, textTransform: 'uppercase' }}>
                        {b.status === 'above' ? <ArrowUp style={{ width: 8, height: 8 }} /> : <ArrowDown style={{ width: 8, height: 8 }} />}
                        {b.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Your targets vs leader */}
          {top && (
            <Panel>
              <PanelHeader title="Beat the Leader — Your Targets" subtitle={`Outperform ${top.name} to claim the #1 spot`} icon={<TargetIcon style={{ width: 14, height: 14 }} />} iconColor="var(--preset-primary)" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
                {[
                  { label: 'Beat their 24h views', target: fmt(top.views24h), icon: <Eye style={{ width: 13, height: 13 }} />, color: '#10b981', desc: `Currently ${fmt(top.views24h)} views in 24h` },
                  { label: 'Beat their 24h likes', target: fmt(top.likes24h), icon: <Heart style={{ width: 13, height: 13 }} />, color: '#ec4899', desc: `Currently ${fmt(top.likes24h)} likes in 24h` },
                  { label: 'Match engagement rate', target: fmtPct(top.engagement), icon: <Sparkles style={{ width: 13, height: 13 }} />, color: top.engagement >= .08 ? '#10b981' : '#f59e0b', desc: `${top.tier === 'viral' ? 'Viral tier' : 'Active tier'} performer` },
                  { label: 'Match post volume', target: `${top.videos} posts`, icon: <Video style={{ width: 13, height: 13 }} />, color: 'var(--preset-lighter)', desc: `Maintain consistent output` },
                  { label: 'Comment velocity', target: fmt(top.comments), icon: <MessageCircle style={{ width: 13, height: 13 }} />, color: '#6366f1', desc: `Drive conversation like them` },
                  { label: 'Total reach target', target: fmt(top.views), icon: <Globe style={{ width: 13, height: 13 }} />, color: '#f59e0b', desc: `Overall viewership benchmark` },
                ].map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 15px', borderRadius: 11, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ color: b.color }}>{b.icon}</div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.55)' }}>{b.label}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', marginTop: 1 }}>{b.desc}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 17, fontWeight: 900, color: b.color, flexShrink: 0, marginLeft: 12 }}>{b.target}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderRadius: 10, border: '1px dashed rgba(var(--preset-primary-rgb),.22)', background: 'rgba(var(--preset-primary-rgb),.04)', padding: '12px 15px', marginTop: 12 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.45)', lineHeight: 1.7 }}>
                  🏆 <b style={{ color: 'rgba(255,255,255,.7)' }}>{top.name}</b> dominates with <b style={{ color: '#f59e0b' }}>{fmt(top.views24h)}</b> 24h views and <b style={{ color: '#10b981' }}>{fmtPct(top.engagement)}</b> engagement. Matching their cadence of <b style={{ color: 'var(--preset-lighter)' }}>{top.videos} posts</b> and targeting their engagement rate puts you squarely in the top competitive tier.
                </p>
              </div>
            </Panel>
          )}

          {/* Side-by-side comparison */}
          <Panel>
            <PanelHeader title="Channel Comparison Matrix" subtitle="Top 5 channels side by side" icon={<Layers style={{ width: 14, height: 14 }} />} iconColor="#8b5cf6" />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase' }}>Metric</th>
                    {sorted.slice(0, 5).map((ch, i) => (
                      <th key={i} style={{ padding: '8px 10px', textAlign: 'center', fontSize: 10, fontWeight: 800, color: i === 0 ? 'var(--preset-primary)' : 'rgba(255,255,255,.55)', maxWidth: 100 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { metric: 'Total Views', fn: (c: AggChannel) => fmt(c.views) },
                    { metric: 'Total Likes', fn: (c: AggChannel) => fmt(c.likes) },
                    { metric: 'Comments', fn: (c: AggChannel) => fmt(c.comments) },
                    { metric: '24h Views', fn: (c: AggChannel) => fmt(c.views24h) },
                    { metric: 'Engagement', fn: (c: AggChannel) => fmtPct(c.engagement) },
                  ].map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                      <td style={{ padding: '8px 10px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.45)' }}>{row.metric}</td>
                      {sorted.slice(0, 5).map((ch, ci) => {
                        const val = row.fn(ch);
                        const isMax = sorted.slice(0, 5).every(other => {
                          if (row.metric === 'Engagement') return ch.engagement >= other.engagement;
                          if (row.metric === '24h Views') return ch.views24h >= other.views24h;
                          if (row.metric === 'Total Views') return ch.views >= other.views;
                          return true;
                        });
                        return (
                          <td key={ci} style={{ padding: '8px 10px', textAlign: 'center', fontSize: 12, fontWeight: 800, color: isMax && ci === 0 ? 'var(--preset-primary)' : 'rgba(255,255,255,.7)' }}>
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}


      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  TAB: HASHTAGS                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {ciTab === 'hashtags' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Hashtag cloud visual */}
          <Panel>
            <PanelHeader title="Trending Hashtag Universe" subtitle="Size = usage frequency · Color = engagement rate" icon={<Hash style={{ width: 14, height: 14 }} />} iconColor="#8b5cf6" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '10px 0', justifyContent: 'center', minHeight: 100 }}>
              {hashtags.slice(0, 25).map((h, i) => {
                const sizeScale = 0.7 + (h.count / Math.max(...hashtags.map(x => x.count), 1)) * 1.2;
                const engColor = h.engagement >= 0.08 ? '#10b981' : h.engagement >= 0.04 ? '#f59e0b' : 'rgba(var(--preset-primary-rgb),.6)';
                return (
                  <span key={i} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, padding: `${4 * sizeScale}px ${10 * sizeScale}px`,
                    borderRadius: 8, background: `${engColor}12`, border: `1px solid ${engColor}33`,
                    fontSize: 11 * sizeScale, fontWeight: 700, color: engColor, cursor: 'default',
                    transition: 'transform .15s', animation: `ait-up .4s ease ${i * .03}s both`,
                  }}>
                    {h.tag}
                    <span style={{ fontSize: 9, opacity: .6, fontWeight: 600 }}>({h.count})</span>
                  </span>
                );
              })}
            </div>
          </Panel>

          {/* Hashtag table */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Panel>
              <PanelHeader title="Top Hashtags by Reach" subtitle="Sorted by total views" icon={<Eye style={{ width: 14, height: 14 }} />} iconColor="#6366f1" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {hashtags.slice(0, 12).map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 9, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.25)', width: 18, textAlign: 'center' }}>{i + 1}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6' }}>{h.tag}</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>×{h.count}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>{fmt(h.views)} views</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: h.engagement >= 0.08 ? '#10b981' : h.engagement >= 0.04 ? '#f59e0b' : 'rgba(255,255,255,.4)' }}>{(h.engagement * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Hashtag Performance Chart" subtitle="Views vs engagement" icon={<BarChart3 style={{ width: 14, height: 14 }} />} iconColor="#ec4899" />
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hashtags.slice(0, 10).map(h => ({ tag: h.tag, views: h.views, eng: +(h.engagement * 100).toFixed(2) }))} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,.04)" vertical={false} />
                  <XAxis dataKey="tag" tick={{ fontSize: 9, fill: 'rgba(255,255,255,.3)', fontFamily: 'inherit' }} tickLine={false} axisLine={false} angle={-35} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,.28)', fontFamily: 'inherit' }} tickLine={false} axisLine={false} tickFormatter={fmt} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
                  <Bar dataKey="views" name="Views" radius={[4, 4, 0, 0]} maxBarSize={24}>
                    {hashtags.slice(0, 10).map((_, i) => <Cell key={i} fill={COLORS_GRADIENT[i % COLORS_GRADIENT.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          {/* Hashtag insights */}
          <Panel>
            <PanelHeader title="Hashtag Strategy Insights" subtitle="Actionable recommendations" icon={<Lightbulb style={{ width: 14, height: 14 }} />} iconColor="#f59e0b" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 10 }}>
              {[
                { title: 'High-Reach, Low-Competition', desc: `Tags like ${hashtags[2]?.tag || '#trending'} have broad reach but aren't oversaturated. Use these to maximize discovery.`, icon: <Globe style={{ width: 14, height: 14 }} />, color: '#10b981' },
                { title: 'Engagement Boosters', desc: `Tags like ${hashtags.sort((a, b) => b.engagement - a.engagement)[0]?.tag || '#viral'} drive the highest engagement. Prioritize these for community building.`, icon: <Heart style={{ width: 14, height: 14 }} />, color: '#ec4899' },
                { title: 'Competitor Favorites', desc: `Most frequently used: ${hashtags[0]?.tag || '#fyp'} (${hashtags[0]?.count || 0} uses). Study why competitors lean into this tag.`, icon: <Users style={{ width: 14, height: 14 }} />, color: '#6366f1' },
                { title: 'Underused Opportunity', desc: `Tags like ${hashtags[hashtags.length - 1]?.tag || '#niche'} have fewer competitors but decent views. Low-hanging fruit for differentiation.`, icon: <Zap style={{ width: 14, height: 14 }} />, color: '#f59e0b' },
              ].map((insight, i) => (
                <div key={i} style={{ padding: '14px 16px', borderRadius: 11, background: `${insight.color}08`, border: `1px solid ${insight.color}22` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, color: insight.color }}>
                    {insight.icon}
                    <span style={{ fontSize: 12, fontWeight: 800 }}>{insight.title}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,.45)', lineHeight: 1.7 }}>{insight.desc}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}


      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  TAB: POSTING INTEL                                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {ciTab === 'posting' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Posting heatmap */}
          <Panel>
            <PanelHeader title="Optimal Posting Heatmap" subtitle="When competitors post · Intensity = post count" icon={<Calendar style={{ width: 14, height: 14 }} />} iconColor="#6366f1" />
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(24, 1fr)', gap: 2, minWidth: 600 }}>
                {/* Header hours */}
                <div />
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,.25)', padding: '4px 0' }}>
                    {h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`}
                  </div>
                ))}
                {/* Rows */}
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <React.Fragment key={day}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', display: 'flex', alignItems: 'center', paddingRight: 8 }}>{day}</div>
                    {Array.from({ length: 24 }, (_, h) => {
                      const cell = postingHeatmap.find(c => c.day === day && c.hour === h);
                      const maxVal = Math.max(...postingHeatmap.map(c => c.value), 1);
                      const intensity = cell ? cell.value / maxVal : 0;
                      return (
                        <div key={h} title={`${day} ${h}:00 — ${cell?.value || 0} posts · ${fmt(cell?.views || 0)} views`}
                          style={{
                            width: '100%', aspectRatio: '1', borderRadius: 3,
                            background: intensity > 0.7 ? 'var(--preset-primary)' : intensity > 0.4 ? `rgba(var(--preset-primary-rgb),${0.3 + intensity * 0.4})` : intensity > 0.15 ? `rgba(var(--preset-primary-rgb),.15)` : 'rgba(255,255,255,.03)',
                            cursor: 'default', transition: 'background .2s',
                          }}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, justifyContent: 'center' }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>Less</span>
                {[0.03, 0.15, 0.35, 0.6, 1].map((v, i) => (
                  <div key={i} style={{ width: 14, height: 14, borderRadius: 3, background: v < 0.1 ? 'rgba(255,255,255,.03)' : `rgba(var(--preset-primary-rgb),${v})` }} />
                ))}
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>More</span>
              </div>
            </div>
          </Panel>

          {/* Posting frequency + Best times */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Panel>
              <PanelHeader title="Weekly Post Volume" subtitle="How many posts per day" icon={<BarChart3 style={{ width: 14, height: 14 }} />} iconColor="#10b981" />
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={timeSeries} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,.04)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'rgba(255,255,255,.28)', fontFamily: 'inherit' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,.28)', fontFamily: 'inherit' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
                  <Bar dataKey="posts" name="Posts" radius={[4, 4, 0, 0]} maxBarSize={24} fill="var(--preset-primary)" />
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            <Panel>
              <PanelHeader title="Best Posting Windows" subtitle="Derived from top-performing content" icon={<Clock style={{ width: 14, height: 14 }} />} iconColor="#f59e0b" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { window: '11:00 AM – 1:00 PM', label: 'Lunch Peak', score: 95, color: '#10b981', desc: 'Highest engagement window across all platforms' },
                  { window: '6:00 PM – 9:00 PM', label: 'Evening Surge', score: 88, color: '#6366f1', desc: 'Strong reach with casual browsing audience' },
                  { window: '8:00 AM – 10:00 AM', label: 'Morning Commute', score: 72, color: '#f59e0b', desc: 'Good for short-form content & stories' },
                  { window: '9:00 PM – 11:00 PM', label: 'Late Night', score: 55, color: 'rgba(255,255,255,.35)', desc: 'Niche audience, lower but loyal reach' },
                ].map((w, i) => (
                  <div key={i} style={{ padding: '11px 13px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 800, color: w.color }}>{w.window}</span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginLeft: 8 }}>{w.label}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 900, color: w.color }}>{w.score}%</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginBottom: 5 }}>{w.desc}</div>
                    <MiniBar value={w.score} max={100} color={w.color} height={3} />
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Posting cadence insights */}
          <Panel>
            <PanelHeader title="Content Cadence Analysis" subtitle="How competitors pace their publishing" icon={<Repeat style={{ width: 14, height: 14 }} />} iconColor="#ec4899" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
              {sorted.slice(0, 6).map((ch, i) => {
                const postsPerDay = (ch.videos / 7).toFixed(1);
                return (
                  <div key={i} style={{ padding: '13px 15px', borderRadius: 11, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                      {ch.avatar ? <img src={ch.avatar} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(var(--preset-primary-rgb),.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: 'var(--preset-primary)' }}>{ch.name[0]}</div>}
                      <span style={{ fontSize: 11, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      <div><div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', fontWeight: 700, textTransform: 'uppercase' }}>Posts/Day</div><div style={{ fontSize: 15, fontWeight: 900, color: 'var(--preset-primary)' }}>{postsPerDay}</div></div>
                      <div><div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', fontWeight: 700, textTransform: 'uppercase' }}>Total</div><div style={{ fontSize: 15, fontWeight: 900 }}>{ch.videos}</div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      )}


      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  TAB: AUDIENCE                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {ciTab === 'audience' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Region breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Panel>
              <PanelHeader title="Geographic Distribution" subtitle="Where competitors concentrate" icon={<Globe style={{ width: 14, height: 14 }} />} iconColor="#10b981" />
              {(() => {
                const regionMap: Record<string, { count: number; views: number; likes: number }> = {};
                channels.forEach(ch => {
                  const r = ch.region || 'UNKNOWN';
                  const ex = regionMap[r];
                  if (!ex) regionMap[r] = { count: 1, views: ch.views, likes: ch.likes };
                  else regionMap[r] = { count: ex.count + 1, views: ex.views + ch.views, likes: ex.likes + ch.likes };
                });
                const regions = Object.entries(regionMap)
                  .map(([r, d]) => ({ region: r, ...d }))
                  .sort((a, b) => b.views - a.views);
                const maxRegViews = Math.max(...regions.map(r => r.views), 1);
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {regions.slice(0, 8).map((r, i) => (
                      <div key={i} style={{ padding: '10px 12px', borderRadius: 9, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 14 }}>{r.region === 'MALAYSIA' ? '🇲🇾' : r.region === 'US' ? '🇺🇸' : r.region === 'INDONESIA' ? '🇮🇩' : '🌍'}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>{r.region.toLowerCase()}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 10, fontSize: 11 }}>
                            <span style={{ color: 'rgba(255,255,255,.4)' }}>{r.count} ch</span>
                            <span style={{ fontWeight: 800, color: 'rgba(255,255,255,.7)' }}>{fmt(r.views)}</span>
                          </div>
                        </div>
                        <MiniBar value={r.views} max={maxRegViews} color="#10b981" height={3} />
                      </div>
                    ))}
                  </div>
                );
              })()}
            </Panel>

            <Panel>
              <PanelHeader title="Audience Engagement by Platform" subtitle="Which platforms drive deeper connection" icon={<Heart style={{ width: 14, height: 14 }} />} iconColor="#ec4899" />
              {(() => {
                const platMap: Record<string, { channels: number; views: number; likes: number; comments: number }> = {};
                channels.forEach(ch => {
                  const ex = platMap[ch.platform];
                  if (!ex) {
                    platMap[ch.platform] = { channels: 1, views: ch.views, likes: ch.likes, comments: ch.comments };
                  } else {
                    platMap[ch.platform] = {
                      channels: ex.channels + 1,
                      views: ex.views + ch.views,
                      likes: ex.likes + ch.likes,
                      comments: ex.comments + ch.comments,
                    };
                  }
                });
                return Object.entries(platMap).map(([p, d]) => (
                  <div key={p} style={{ padding: '14px 16px', borderRadius: 11, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <PlatChip platform={p} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.6)' }}>{d.channels} channels</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Avg Views</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: 'rgba(255,255,255,.85)' }}>{fmt(d.views / d.channels)}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Avg Likes</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: '#ec4899' }}>{fmt(d.likes / d.channels)}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Eng Rate</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: '#10b981' }}>{d.views > 0 ? ((d.likes / d.views) * 100).toFixed(1) : 0}%</div>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </Panel>
          </div>

          {/* Audience quality signals */}
          <Panel>
            <PanelHeader title="Audience Quality Signals" subtitle="Indicators of real, engaged audiences vs inflated metrics" icon={<Shield style={{ width: 14, height: 14 }} />} iconColor="#f59e0b" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10 }}>
              {[
                {
                  title: 'Comment-to-Like Ratio',
                  value: summary.totalLikes > 0 ? `${((summary.totalComments / summary.totalLikes) * 100).toFixed(1)}%` : '0%',
                  benchmark: '2-5% healthy',
                  status: (summary.totalComments / Math.max(summary.totalLikes, 1)) >= 0.02 ? 'healthy' : 'low',
                  color: (summary.totalComments / Math.max(summary.totalLikes, 1)) >= 0.02 ? '#10b981' : '#f59e0b',
                  desc: 'Higher ratios indicate genuine audience interaction, not passive scrolling.',
                  icon: <MessageCircle style={{ width: 13, height: 13 }} />,
                },
                {
                  title: 'Engagement Consistency',
                  value: `${((summary.topEngagement - summary.bottomEngagement) * 100).toFixed(1)}%`,
                  benchmark: '<5% spread = consistent',
                  status: (summary.topEngagement - summary.bottomEngagement) < 0.05 ? 'consistent' : 'varied',
                  color: (summary.topEngagement - summary.bottomEngagement) < 0.05 ? '#10b981' : '#6366f1',
                  desc: 'Low variance means predictable performance. High variance may indicate bought engagement.',
                  icon: <Activity style={{ width: 13, height: 13 }} />,
                },
                {
                  title: 'Views-to-Engagement Drop-off',
                  value: `${(100 - (summary.avgEng * 100)).toFixed(1)}%`,
                  benchmark: '<95% normal',
                  status: summary.avgEng >= 0.05 ? 'healthy' : 'high',
                  color: summary.avgEng >= 0.05 ? '#10b981' : '#ef4444',
                  desc: 'Percentage of viewers who watch but don\'t engage. Lower = more compelling content.',
                  icon: <Eye style={{ width: 13, height: 13 }} />,
                },
              ].map((sig, i) => (
                <div key={i} style={{ padding: '15px 17px', borderRadius: 12, background: `${sig.color}08`, border: `1px solid ${sig.color}22` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, color: sig.color }}>
                    {sig.icon}
                    <span style={{ fontSize: 12, fontWeight: 800 }}>{sig.title}</span>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: sig.color, marginBottom: 4 }}>{sig.value}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginBottom: 6 }}>Benchmark: {sig.benchmark}</div>
                  <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,.4)', lineHeight: 1.6 }}>{sig.desc}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}


      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  TAB: ALERTS                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {ciTab === 'alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Live alerts */}
          <Panel>
            <PanelHeader title="Live Competitive Alerts" subtitle="Auto-detected events requiring your attention" icon={<Bell style={{ width: 14, height: 14 }} />} iconColor="#ef4444" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(() => {
                const alerts: { severity: 'critical' | 'warning' | 'info'; title: string; desc: string; time: string; channel?: string }[] = [];

                // Generate real alerts based on data
                const spikeChannels = sorted.filter(c => c.views24h > (summary.totalViews24h / Math.max(summary.totalChannels, 1)) * 2);
                spikeChannels.forEach(ch => {
                  alerts.push({ severity: 'critical', title: `Viral spike detected: ${ch.name}`, desc: `+${fmt(ch.views24h)} views in 24h — 2x above average. Review their latest content immediately.`, time: '2h ago', channel: ch.name });
                });

                const highEngNew = channels.filter(c => c.engagement >= 0.1 && c.videos <= 2);
                highEngNew.forEach(ch => {
                  alerts.push({ severity: 'warning', title: `New high-engagement competitor: ${ch.name}`, desc: `${fmtPct(ch.engagement)} engagement with only ${ch.videos} posts. Rapid momentum detected.`, time: '5h ago', channel: ch.name });
                });

                if (summary.avgEng < 0.03) {
                  alerts.push({ severity: 'info', title: 'Industry engagement is low', desc: `Average engagement across competitors is ${fmtPct(summary.avgEng)} — below typical 3-6% range. Opportunity to stand out.`, time: '1d ago' });
                }

                if (summary.fastRising > 2) {
                  alerts.push({ severity: 'critical', title: `Multiple fast-rising competitors (${summary.fastRising})`, desc: 'More than 2 competitors are showing aggressive growth. Consider accelerating your content strategy.', time: '6h ago' });
                }

                alerts.push({ severity: 'info', title: `${summary.totalVideos} videos tracked this period`, desc: `Across ${summary.totalChannels} competitors on ${platDist.length} platform${platDist.length > 1 ? 's' : ''}. Data is fresh and comprehensive.`, time: 'now' });

                if (sorted.length >= 2 && sorted[1].views24h > sorted[0].views24h * 0.9) {
                  alerts.push({ severity: 'warning', title: 'Leadership position contested', desc: `${sorted[1].name} is within 10% of the leader's 24h views. Competitive shift may be underway.`, time: '3h ago' });
                }

                return alerts.slice(0, 8).map((alert, i) => {
                  const sevMap = {
                    critical: { color: '#ef4444', bg: 'rgba(239,68,68,.08)', border: 'rgba(239,68,68,.2)', icon: <AlertTriangle style={{ width: 14, height: 14 }} /> },
                    warning: { color: '#f59e0b', bg: 'rgba(245,158,11,.08)', border: 'rgba(245,158,11,.2)', icon: <AlertTriangle style={{ width: 14, height: 14 }} /> },
                    info: { color: '#6366f1', bg: 'rgba(99,102,241,.08)', border: 'rgba(99,102,241,.2)', icon: <Info style={{ width: 14, height: 14 }} /> },
                  }[alert.severity];
                  return (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 16px', borderRadius: 11, background: sevMap.bg, border: `1px solid ${sevMap.border}`, animation: `ait-up .4s ease ${i * .06}s both` }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: `${sevMap.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sevMap.color, flexShrink: 0 }}>
                        {sevMap.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: sevMap.color }}>{alert.title}</div>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', flexShrink: 0, whiteSpace: 'nowrap' }}>{alert.time}</span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(255,255,255,.45)', lineHeight: 1.6 }}>{alert.desc}</p>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </Panel>

          {/* Trend summary / executive brief */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Panel>
              <PanelHeader title="Executive Brief" subtitle="Key takeaways for decision-makers" icon={<FileText style={{ width: 14, height: 14 }} />} iconColor="var(--preset-primary)" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { emoji: '📊', text: `You're tracking ${summary.totalChannels} competitors with ${summary.totalVideos} active pieces of content across ${platDist.length} platform${platDist.length > 1 ? 's' : ''}.` },
                  { emoji: '🔥', text: `${summary.fastRising} competitor${summary.fastRising !== 1 ? 's' : ''} flagged as fast-rising — they combine rapid growth with strong engagement.` },
                  { emoji: '📈', text: `The market average engagement is ${fmtPct(summary.avgEng)}, ${summary.avgEng >= 0.05 ? 'above' : 'below'} the typical 3-6% benchmark.` },
                  { emoji: '🏆', text: top ? `${top.name} leads the pack with ${fmt(top.views24h)} 24h views and ${fmtPct(top.engagement)} engagement.` : 'No clear leader detected.' },
                  { emoji: '💡', text: `To compete, aim for ${top ? fmtPct(top.engagement) : '5%+'} engagement and ${top ? `${top.videos}+ posts` : '3+ posts'} per week minimum.` },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 9, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{item.emoji}</span>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.55)', lineHeight: 1.7 }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Action Items" subtitle="Recommended next steps" icon={<Lightbulb style={{ width: 14, height: 14 }} />} iconColor="#f59e0b" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { priority: 'HIGH', action: 'Analyze top competitor content formats', desc: 'Study what content types are driving engagement for fast-rising competitors', color: '#ef4444' },
                  { priority: 'HIGH', action: 'Optimize posting schedule', desc: 'Align your posting times with the peak engagement windows (11AM-1PM, 6PM-9PM)', color: '#ef4444' },
                  { priority: 'MED', action: 'Adopt high-performing hashtags', desc: `Start using trending tags like ${hashtags[0]?.tag || '#trending'} in your content`, color: '#f59e0b' },
                  { priority: 'MED', action: 'Increase content volume', desc: `Match the leader\'s cadence of ${top?.videos || 3}+ posts per period`, color: '#f59e0b' },
                  { priority: 'LOW', action: 'Expand to secondary platforms', desc: platDist.length < 2 ? 'Consider cross-platform presence for broader reach' : 'Deepen presence on less-saturated platforms', color: '#6366f1' },
                  { priority: 'LOW', action: 'Monitor rising underdogs', desc: 'Set up tracking for small channels showing unusual growth velocity', color: '#6366f1' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 13px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
                    <span style={{ padding: '2px 6px', borderRadius: 4, background: `${item.color}18`, border: `1px solid ${item.color}44`, fontSize: 8, fontWeight: 900, color: item.color, letterSpacing: '.05em', flexShrink: 0, marginTop: 1 }}>{item.priority}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{item.action}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// MAIN: AITrend
// ─────────────────────────────────────────────────────────────────────────────
const AITrend: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isTrendsRoute = pathname === '/intelligence' && searchParams?.get('tab') === 'trends';

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'music' | 'trend' | 'topvideo' | 'content'>('topvideo');
  const [selectedChannelForContent, setSelectedChannelForContent] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevChatsRef = useRef<string>('');
  const user_id = 'demo-user-id';

  const createChatTrendingMutation = useCreateChatTrending();
  const createRoomMutation = useCreateRoom();
  const { data: musicTrendData } = useMusicTrend();

  const suggestedPrompts = [
    "What are the top clothing trends for 2024?",
    "Which clothing techniques are gaining popularity?",
    "Analyze artisanal vs commercial clothing trends",
    "What's trending in premium clothing products?",
    "Show me emerging sustainable clothing trends",
    "What are consumers looking for in clothing experiences?",
  ];

  useEffect(() => {
    if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
  }, [messages]);

  const handleSelectChat = (roomId: string, chats: Chat[]) => {
    const chatKey = `${roomId}-${JSON.stringify(chats)}`;
    if (chatKey === prevChatsRef.current) return;
    prevChatsRef.current = chatKey;
    setCurrentRoomId(roomId);
    setActiveTab('ai');
    if (chats && Array.isArray(chats) && chats.length > 0) {
      setMessages(chats.map(chat => ({ id: chat.id, content: chat.message || '', sender: chat.role === 'USER' ? 'user' : 'ai' as const, timestamp: new Date(chat.created_at) })));
    } else {
      setMessages([]);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    const userMessage: Message = { id: Date.now().toString(), content: content.trim(), sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    const tempId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: tempId, content: '', sender: 'ai', timestamp: new Date() }]);
    try {
      let roomId = currentRoomId;
      if (!roomId) {
        const roomData = await createRoomMutation.mutateAsync({ category: Category.TREND, user_id });
        roomId = roomData.data.rooms.id;
        setCurrentRoomId(roomId);
      }
      if (!roomId) throw new Error('Failed to get room ID');
      const response = await createChatTrendingMutation.mutateAsync({ room_id: roomId, message: content.trim(), role: 'USER' });
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');
      let acc = '', actualId = tempId;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        for (const line of chunk.split('\n').filter((l: string) => l.trim())) {
          try {
            const json = line.replace(/^data:\s*/, '').trim();
            if (!json || json === '[DONE]') continue;
            const data = JSON.parse(json);
            if (data.type === 'chat_created') { actualId = data.data.chat.id; setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: actualId } : m)); }
            else if (data.type === 'ai_response_chunk' && data.content) { acc += data.content; setMessages(prev => prev.map(m => m.id === actualId ? { ...m, content: acc } : m)); }
            else if (data.type === 'response_complete') setIsTyping(false);
          } catch { }
        }
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setMessages(prev => [...prev, { id: Date.now().toString(), content: 'Sorry, there was an error. Please try again.', sender: 'ai', timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => { setMessages([]); setCurrentRoomId(null); setInputValue(''); setIsTyping(false); prevChatsRef.current = ''; setActiveTab('ai'); };
  const handleChannelClick = (channelId: string) => { setSelectedChannelForContent(channelId); setActiveTab('content'); };

  const tabItems = [
    { key: 'topvideo' as const, label: 'Charts', icon: TrendingUp },
    { key: 'trend' as const, label: 'Competitors', icon: BarChart3 },
    { key: 'content' as const, label: 'Content', icon: Target },
    { key: 'music' as const, label: 'Music', icon: Music },
    { key: 'ai' as const, label: 'Chat', icon: Sparkles },
  ];

  const tabDescriptions: Record<string, string> = {
    topvideo: 'Channel analytics, rankings, and trending video insights',
    trend: 'Real-time competitor social intelligence & engagement signals',
    content: 'Explore and analyze social media video content',
    music: 'Current trending music and audio tracks',
    ai: 'Chat with AI about trends and market insights',
  };

  const globalStyles = `
    @keyframes ait-pulse { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(2.4);opacity:0} }
    @keyframes ait-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  `;

  // Standalone "Trends" route: show only Competitor Intelligence dashboard
  if (isTrendsRoute) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="h-full overflow-y-auto">
          <div className="flex flex-col gap-5 w-full p-4 md:p-6">
            <CompetitorIntelligence />
          </div>
        </div>
      </>
    );
  }

  // ── CHAT TAB ────────────────────────────────────────────────────────────────
  if (activeTab === 'ai') {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="flex w-full h-full min-h-0 overflow-hidden">
          <div className="flex-shrink-0 h-full">
            <ChatHistory currentChatType={Category.TREND} onNewChat={handleNewChat} onSelectChat={handleSelectChat} />
          </div>
          <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
            <div className="flex items-center gap-2 md:gap-4 p-2 sm:p-3 md:p-5 border-b border-slate-200/50 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] flex-shrink-0">
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 text-slate-600 dark:text-slate-400" onClick={() => { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('toggleChatHistory')); }}><MessageSquare className="h-4 w-4" /></Button>
              <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-white dark:border-white/10 shadow-sm">
                <AvatarFallback className="text-white font-bold" style={{ background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` }}><TrendingUp className="h-4 w-4 md:h-5 md:w-5" /></AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100">Trend Analyzer</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Online · Trend Expert</p>
              </div>
              <div className="flex gap-1.5">
                {tabItems.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <Button key={tab.key} variant="ghost" size="sm" className="h-7 text-[10px] md:text-xs font-medium px-2 rounded-lg border transition-all duration-200"
                      style={activeTab === tab.key ? { background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))`, color: '#fff', borderColor: 'transparent' } : { background: `rgba(var(--preset-primary-rgb), 0.06)`, color: `var(--preset-primary)`, borderColor: `rgba(var(--preset-primary-rgb), 0.15)` }}
                      onClick={() => setActiveTab(tab.key)}>
                      <Icon className="h-3 w-3 mr-1" />{tab.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {messages.length === 0 && (
              <ScrollArea className="flex-1 min-h-0 overflow-hidden">
                <div className="p-4 md:p-6 space-y-4">
                  <Card className="bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
                    <CardContent className="p-4 md:p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md flex-shrink-0" style={{ background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` }}><TrendingUp className="w-4 h-4 text-white" /></div>
                        <div><h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Welcome to Trend Analyzer</h3><p className="text-xs text-muted-foreground">Your trend expert for market movements, emerging patterns, and industry insights.</p></div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><MessageCircle className="w-3.5 h-3.5" style={{ color: `var(--preset-primary)` }} />Try asking me</h4>
                    <div className="grid gap-2">
                      {suggestedPrompts.slice(0, 3).map((prompt, index) => (
                        <Button key={index} variant="ghost" className="justify-start h-auto p-3 text-left bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06] rounded-xl" onClick={() => handleSendMessage(prompt)}>
                          <MessageCircle className="h-3.5 w-3.5 mr-2.5 flex-shrink-0" style={{ color: `rgba(var(--preset-primary-rgb), 0.5)` }} /><span className="text-xs text-slate-600 dark:text-slate-400">{prompt}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}

            {messages.length > 0 && (
              <ScrollArea className="flex-1 p-3 md:p-6 overflow-hidden min-h-0" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map(message => (
                    <div key={message.id} className={`flex gap-2 md:gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {message.sender === 'ai' && (
                        <Avatar className="h-7 w-7 md:h-8 md:w-8 border border-slate-200 dark:border-white/10 shadow-sm flex-shrink-0">
                          <AvatarFallback className="text-white" style={{ background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` }}><TrendingUp className="h-3.5 w-3.5" /></AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[85%] md:max-w-[75%] ${message.sender === 'user' ? 'order-1' : ''}`}>
                        <Card className={`${message.sender === 'user' ? 'text-white border-transparent' : 'bg-white dark:bg-white/[0.03] border-slate-200/60 dark:border-white/[0.06]'} shadow-sm rounded-2xl overflow-hidden`} style={message.sender === 'user' ? { background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` } : undefined}>
                          <CardContent className="p-3 md:p-4">
                            {message.sender === 'user' ? <div className="text-xs md:text-sm">{message.content}</div> : <Markdown content={message.content || ''} className="text-xs md:text-sm" />}
                          </CardContent>
                        </Card>
                        <p className={`text-[10px] text-muted-foreground mt-1.5 px-1 ${message.sender === 'user' ? 'text-right' : ''}`}>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      {message.sender === 'user' && (
                        <Avatar className="h-7 w-7 md:h-8 md:w-8 border border-slate-200 dark:border-white/10 shadow-sm flex-shrink-0">
                          <AvatarFallback className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300"><User className="h-3.5 w-3.5" /></AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            <div className="p-2.5 md:p-4 border-t border-slate-200/50 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] flex-shrink-0">
              <div className="flex gap-2 md:gap-3">
                <Input ref={inputRef} value={inputValue} onChange={e => setInputValue(e.target.value)}
                  placeholder="Ask me about trends and market insights..."
                  className="h-10 md:h-12 text-sm bg-white dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.08] rounded-xl shadow-sm focus:ring-2"
                  style={{ '--tw-ring-color': `rgba(var(--preset-primary-rgb), 0.2)` } as React.CSSProperties}
                  onKeyPress={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(inputValue); } }}
                  disabled={isTyping}
                />
                <Button onClick={() => handleSendMessage(inputValue)} disabled={!inputValue.trim() || isTyping}
                  className="h-10 w-10 md:h-12 md:w-12 text-white rounded-xl shadow-md hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  style={{ background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))` }}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">Trend Analyzer provides insights based on market data and trends.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── DASHBOARD TABS ──────────────────────────────────────────────────────────
  return (
    <>
      <style>{globalStyles}</style>
      <div className="h-full overflow-y-auto">
        <div className="flex flex-col gap-5 w-full p-4 md:p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Trend Analyzer</h2>
              <p className="text-muted-foreground">{tabDescriptions[activeTab]}</p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {tabItems.map(tab => {
                const isActive = activeTab === tab.key;
                const Icon = tab.icon;
                return (
                  <Button key={tab.key} variant="ghost" size="sm"
                    className="h-8 text-xs font-medium px-3 rounded-lg border transition-all duration-200"
                    style={isActive ? { background: `linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))`, color: '#fff', borderColor: 'transparent' } : { background: `rgba(var(--preset-primary-rgb), 0.06)`, color: `var(--preset-primary)`, borderColor: `rgba(var(--preset-primary-rgb), 0.15)` }}
                    onClick={() => setActiveTab(tab.key)}>
                    <Icon className="h-3.5 w-3.5 mr-1.5" />{tab.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {activeTab === 'topvideo' && <TopTrendingVideos onChannelClick={handleChannelClick} />}
          {activeTab === 'trend' && <CompetitorIntelligence />}
          {activeTab === 'content' && <SocialContentAnalysis />}
          {activeTab === 'music' && (
            Array.isArray(musicTrendData?.songs) && musicTrendData.songs.length > 0
              ? <MusicScreen />
              : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md mb-4"
                    style={{ background: `rgba(var(--preset-primary-rgb), 0.1)` }}
                  >
                    <Music className="w-6 h-6" style={{ color: `var(--preset-primary)` }} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Music Trends Under Construction</h2>
                  <p className="text-sm text-muted-foreground">Check back soon for the hottest trending tracks!</p>
                </div>
              )
          )}
        </div>
      </div>
    </>
  );
};

export default AITrend;