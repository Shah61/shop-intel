"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import Map, { Marker, Popup, NavigationControl, ScaleControl } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Store, Crown, AlertTriangle, ArrowUp, ArrowDown, DollarSign,
  ShoppingBag, Users, Footprints, Target, Star, ChevronRight,
  ChevronLeft, Eye, Activity, Flame, Heart, Clock, Award,
  BarChart3, Layers, Zap, Calendar, UserCheck, UserMinus,
  Phone, Tag, Info, CreditCard, BarChart2, PieChart as PieChartIcon,
  TrendingUp, Building2, Search, Video, Percent, MessageCircle,
  Sparkles, Radio, MapPin, Package, Lightbulb, Bell, FileText,
  LayoutGrid, LineChart as LineChartIcon, Hash,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LineChart, Line,
  ComposedChart, PieChart as RePieChart, Pie, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { useTheme } from "next-themes";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
interface BranchData {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  status: "open" | "closed" | "renovating";
  manager: string;
  phone: string;
  openedDate: string;
  sqft: number;
  operatingHours: string;
  todayRevenue: number;
  monthRevenue: number;
  monthlyTarget: number;
  todayOrders: number;
  monthOrders: number;
  avgOrderValue: number;
  footTraffic: number;
  conversionRate: number;
  returnRate: number;
  customerSatisfaction: number;
  revenueTrend: number;
  ordersTrend: number;
  trafficTrend: number;
  targetAchievement: number;
  topCategory: string;
  bestSeller: string;
  staffPresent: number;
  staffCount: number;
  avgServiceTime: number;
}

type BranchTab = "overview" | "revenue" | "traffic" | "staff" | "compare";

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════
const BRANCHES: BranchData[] = [
  {
    id: "br-001", name: "Pavilion KL Flagship", code: "PVL-KL",
    address: "168 Jalan Bukit Bintang", city: "Kuala Lumpur", state: "W.P. Kuala Lumpur",
    lat: 3.149, lng: 101.713, status: "open",
    manager: "Sarah Ahmad", phone: "+60 3-2118 8888",
    openedDate: "2019-03-15", sqft: 3200, operatingHours: "10 AM – 10 PM",
    todayRevenue: 28450, monthRevenue: 842000, monthlyTarget: 900000,
    todayOrders: 156, monthOrders: 4520, avgOrderValue: 186.3,
    footTraffic: 1240, conversionRate: 12.6, returnRate: 3.2, customerSatisfaction: 4.7,
    revenueTrend: 14.2, ordersTrend: 8.5, trafficTrend: 6.3,
    targetAchievement: 94, topCategory: "Cleansers", bestSeller: "Hydrating Cloud Cleanser",
    staffPresent: 15, staffCount: 18, avgServiceTime: 4.2,
  },
  {
    id: "br-002", name: "Mid Valley Megamall", code: "MVL-KL",
    address: "Mid Valley City, Lingkaran Syed Putra", city: "Kuala Lumpur", state: "W.P. Kuala Lumpur",
    lat: 3.118, lng: 101.677, status: "open",
    manager: "Ahmad Razak", phone: "+60 3-2938 3333",
    openedDate: "2020-07-01", sqft: 2800, operatingHours: "10 AM – 10 PM",
    todayRevenue: 22100, monthRevenue: 695000, monthlyTarget: 800000,
    todayOrders: 128, monthOrders: 3890, avgOrderValue: 172.7,
    footTraffic: 980, conversionRate: 13.1, returnRate: 2.8, customerSatisfaction: 4.5,
    revenueTrend: 9.8, ordersTrend: 11.2, trafficTrend: 4.1,
    targetAchievement: 87, topCategory: "Sun Care", bestSeller: "Daily UV Defense SPF 50",
    staffPresent: 12, staffCount: 14, avgServiceTime: 3.8,
  },
  {
    id: "br-003", name: "Sunway Pyramid", code: "SWP-PJ",
    address: "3 Jalan PJS 11/15, Bandar Sunway", city: "Petaling Jaya", state: "Selangor",
    lat: 3.073, lng: 101.607, status: "open",
    manager: "Lim Wei Ling", phone: "+60 3-5612 8888",
    openedDate: "2021-01-20", sqft: 2400, operatingHours: "10 AM – 10 PM",
    todayRevenue: 18900, monthRevenue: 578000, monthlyTarget: 700000,
    todayOrders: 104, monthOrders: 3200, avgOrderValue: 181.6,
    footTraffic: 820, conversionRate: 12.7, returnRate: 3.5, customerSatisfaction: 4.4,
    revenueTrend: 6.5, ordersTrend: 5.2, trafficTrend: -1.3,
    targetAchievement: 82, topCategory: "Serums", bestSeller: "Niacinamide 10% Serum",
    staffPresent: 10, staffCount: 12, avgServiceTime: 4.5,
  },
  {
    id: "br-004", name: "IOI City Mall", code: "IOI-PU",
    address: "IOI Resort City, Lebuh IRC", city: "Putrajaya", state: "Putrajaya",
    lat: 2.972, lng: 101.711, status: "open",
    manager: "Nurul Huda", phone: "+60 3-8328 8888",
    openedDate: "2022-05-10", sqft: 2100, operatingHours: "10 AM – 10 PM",
    todayRevenue: 14200, monthRevenue: 432000, monthlyTarget: 450000,
    todayOrders: 82, monthOrders: 2650, avgOrderValue: 163.0,
    footTraffic: 640, conversionRate: 12.8, returnRate: 2.9, customerSatisfaction: 4.6,
    revenueTrend: 18.3, ordersTrend: 15.6, trafficTrend: 12.1,
    targetAchievement: 96, topCategory: "Moisturizers", bestSeller: "Ceramide Barrier Cream",
    staffPresent: 9, staffCount: 10, avgServiceTime: 3.5,
  },
  {
    id: "br-005", name: "Bangi Gateway", code: "BGW-BG",
    address: "Persiaran Bangi, Seksyen 15", city: "Bangi", state: "Selangor",
    lat: 2.946, lng: 101.778, status: "open",
    manager: "Faizal Ibrahim", phone: "+60 3-8912 1234",
    openedDate: "2023-02-28", sqft: 1800, operatingHours: "10 AM – 9:30 PM",
    todayRevenue: 9800, monthRevenue: 312000, monthlyTarget: 350000,
    todayOrders: 58, monthOrders: 1920, avgOrderValue: 162.5,
    footTraffic: 480, conversionRate: 12.1, returnRate: 3.8, customerSatisfaction: 4.3,
    revenueTrend: 22.5, ordersTrend: 19.8, trafficTrend: 15.4,
    targetAchievement: 89, topCategory: "Body Care", bestSeller: "Rice Milk Body Lotion",
    staffPresent: 7, staffCount: 8, avgServiceTime: 4.0,
  },
  {
    id: "br-006", name: "1 Utama Shopping Centre", code: "UTM-PJ",
    address: "1 Lebuh Bandar Utama", city: "Petaling Jaya", state: "Selangor",
    lat: 3.150, lng: 101.616, status: "open",
    manager: "Tan Mei Hua", phone: "+60 3-7726 6688",
    openedDate: "2020-11-15", sqft: 2600, operatingHours: "10 AM – 10 PM",
    todayRevenue: 20500, monthRevenue: 628000, monthlyTarget: 750000,
    todayOrders: 112, monthOrders: 3450, avgOrderValue: 182.0,
    footTraffic: 890, conversionRate: 12.6, returnRate: 3.1, customerSatisfaction: 4.5,
    revenueTrend: 7.8, ordersTrend: 6.2, trafficTrend: 2.8,
    targetAchievement: 84, topCategory: "Treatments", bestSeller: "Retinol Night Renewal Cream",
    staffPresent: 11, staffCount: 13, avgServiceTime: 4.1,
  },
  {
    id: "br-007", name: "The Curve", code: "CRV-PJ",
    address: "6 Jalan PJU 7/3, Mutiara Damansara", city: "Petaling Jaya", state: "Selangor",
    lat: 3.157, lng: 101.612, status: "renovating",
    manager: "Azman Shah", phone: "+60 3-7710 5555",
    openedDate: "2021-08-01", sqft: 1600, operatingHours: "Closed for renovation",
    todayRevenue: 0, monthRevenue: 89000, monthlyTarget: 500000,
    todayOrders: 0, monthOrders: 580, avgOrderValue: 153.4,
    footTraffic: 0, conversionRate: 0, returnRate: 0, customerSatisfaction: 4.2,
    revenueTrend: -100, ordersTrend: -100, trafficTrend: -100,
    targetAchievement: 18, topCategory: "Tools", bestSeller: "Reusable Sheet Mask + Headband",
    staffPresent: 0, staffCount: 6, avgServiceTime: 0,
  },
  {
    id: "br-008", name: "Gurney Plaza Penang", code: "GRN-PN",
    address: "170 Gurney Drive", city: "George Town", state: "Penang",
    lat: 5.437, lng: 100.311, status: "open",
    manager: "Chong Wai Kit", phone: "+60 4-228 8888",
    openedDate: "2022-12-01", sqft: 2000, operatingHours: "10 AM – 10 PM",
    todayRevenue: 16300, monthRevenue: 498000, monthlyTarget: 550000,
    todayOrders: 92, monthOrders: 2800, avgOrderValue: 177.9,
    footTraffic: 720, conversionRate: 12.8, returnRate: 2.6, customerSatisfaction: 4.6,
    revenueTrend: 11.4, ordersTrend: 9.3, trafficTrend: 7.8,
    targetAchievement: 91, topCategory: "Essences", bestSeller: "Vitamin C Glow Essence",
    staffPresent: 9, staffCount: 10, avgServiceTime: 3.9,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════
const fmtN = (n: number) => { if (!n || isNaN(n)) return "0"; if (n >= 1e6) return `${(n/1e6).toFixed(1)}M`; if (n >= 1e3) return `${(n/1e3).toFixed(1)}K`; return n.toLocaleString(); };
const fmtRM = (n: number) => { if (n >= 1e6) return `RM ${(n/1e6).toFixed(2)}M`; if (n >= 1e3) return `RM ${(n/1e3).toFixed(1)}K`; return `RM ${n.toLocaleString()}`; };
const sc = (s: string) => s === "open" ? { bg: "#10b981", ring: "rgba(16,185,129,.35)", label: "OPEN", glow: "0 0 12px rgba(16,185,129,.5)" } : s === "renovating" ? { bg: "#f59e0b", ring: "rgba(245,158,11,.35)", label: "RENOVATING", glow: "0 0 12px rgba(245,158,11,.5)" } : { bg: "#ef4444", ring: "rgba(239,68,68,.35)", label: "CLOSED", glow: "0 0 12px rgba(239,68,68,.5)" };
const perfC = (p: number) => p >= 90 ? "#10b981" : p >= 75 ? "#f59e0b" : "#ef4444";
const MAP_STYLE_DARK = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const MAP_STYLE_LIGHT = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const genWeekly = (b: BranchData) => ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i) => { const m = (i >= 5 ? 1.3 : 0.7) + Math.random() * 0.5; return { day: d, revenue: Math.round(b.todayRevenue * m), orders: Math.round(b.todayOrders * m), target: Math.round(b.monthlyTarget / 30) }; });
const genMonthly = (b: BranchData) => Array.from({ length: 6 }, (_, i) => { const mo = new Date(); mo.setMonth(mo.getMonth()-(5-i)); return { month: mo.toLocaleDateString("en-US",{month:"short"}), revenue: Math.round((b.monthRevenue/6)*(0.7+Math.random()*0.6)*(1+i*0.03)), orders: Math.round((b.monthOrders/6)*(0.7+Math.random()*0.6)*(1+i*0.03)) }; });
const genHourly = (b: BranchData) => Array.from({ length: 13 }, (_, i) => { const h = 10+i; const pk = (h>=12&&h<=14)||(h>=17&&h<=20); const base = b.footTraffic/13; return { hour: `${h>12?h-12:h}${h>=12?"PM":"AM"}`, traffic: Math.round(base*(pk?1.8+Math.random()*.5:0.5+Math.random()*.7)), conversion: +(b.conversionRate*(0.8+Math.random()*0.4)).toFixed(1) }; });
const CATS = [{ name:"Cleansers & SPF", value:38, color:"var(--preset-primary)" },{ name:"Serums & Essences", value:24, color:"#6366f1" },{ name:"Moisturizers", value:18, color:"#ec4899" },{ name:"Treatments", value:12, color:"#f59e0b" },{ name:"Body & Lip", value:8, color:"rgba(255,255,255,.2)" }];

// ═══════════════════════════════════════════════════════════════════════════
// MICRO COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════
const PulseDot: React.FC<{color?:string;size?:number}> = ({color="#10b981",size=7}) => (
  <span style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center",width:size,height:size,flexShrink:0}}>
    <span style={{position:"absolute",inset:0,borderRadius:"50%",background:color,opacity:0.4,animation:"br-pulse 2s ease-in-out infinite"}} />
    <span style={{width:size,height:size,borderRadius:"50%",background:color,display:"block"}} />
  </span>
);

const MiniBar: React.FC<{value:number;max:number;color?:string;height?:number}> = ({value,max,color="var(--preset-primary)",height=4}) => (
  <div style={{height,background:"rgba(255,255,255,.07)",borderRadius:99,overflow:"hidden"}}>
    <div style={{width:`${max>0?Math.min((value/max)*100,100):0}%`,height:"100%",background:color,borderRadius:99,transition:"width .8s cubic-bezier(.4,0,.2,1)"}} />
  </div>
);

const Panel: React.FC<{children:React.ReactNode;style?:React.CSSProperties}> = ({children,style}) => (
  <div style={{borderRadius:14,border:"1px solid rgba(255,255,255,.07)",background:"rgba(255,255,255,.025)",padding:"18px 20px",position:"relative",overflow:"hidden",...style}}>{children}</div>
);

const PanelHeader: React.FC<{title:string;subtitle?:string;icon:React.ReactNode;iconColor?:string}> = ({title,subtitle,icon,iconColor="var(--preset-primary)"}) => (
  <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:14}}>
    <div style={{width:30,height:30,borderRadius:8,background:`${iconColor}18`,display:"flex",alignItems:"center",justifyContent:"center",color:iconColor,flexShrink:0}}>{icon}</div>
    <div><div style={{fontSize:13,fontWeight:800,letterSpacing:"-0.2px"}}>{title}</div>{subtitle&&<div style={{fontSize:11,color:"rgba(255,255,255,.38)",marginTop:1}}>{subtitle}</div>}</div>
  </div>
);

const ChartTip: React.FC<any> = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return (<div style={{background:"#141c2b",border:"1px solid rgba(var(--preset-primary-rgb),.2)",borderRadius:10,padding:"9px 13px",fontSize:12,backdropFilter:"blur(12px)",boxShadow:"0 8px 32px rgba(0,0,0,.4)"}}>
    {label&&<div style={{color:"rgba(255,255,255,.4)",marginBottom:5,fontSize:11}}>{label}</div>}
    {payload.map((p:any,i:number)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:7,color:"rgba(255,255,255,.8)",marginBottom:2}}><span style={{width:7,height:7,borderRadius:"50%",background:p.color||p.fill,flexShrink:0}} /><span style={{color:"rgba(255,255,255,.4)",marginRight:2}}>{p.name}:</span><b>{typeof p.value==="number"&&p.value>999?fmtN(p.value):p.value}</b></div>))}
  </div>);
};

// ═══════════════════════════════════════════════════════════════════════════
// MAP MARKER
// ═══════════════════════════════════════════════════════════════════════════
const BranchMarker: React.FC<{
  branch:BranchData; isSelected:boolean; isHovered:boolean; rank:number;
  isLight:boolean;
  onHover:(id:string|null)=>void; onClick:()=>void;
}> = ({branch,isSelected,isHovered,rank,isLight,onHover,onClick}) => {
  const s = sc(branch.status);
  const sz = isSelected ? 20 : isHovered ? 16 : 12;
  const active = branch.status === "open";
  return (
    <div onClick={onClick} onMouseEnter={()=>onHover(branch.id)} onMouseLeave={()=>onHover(null)}
      style={{position:"relative",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",width:sz+24,height:sz+24}}>
      {active&&<span style={{position:"absolute",width:sz+20,height:sz+20,borderRadius:"50%",border:`2px solid ${s.bg}`,opacity:0,animation:"br-marker-pulse 2.5s ease-out infinite",pointerEvents:"none"}} />}
      {active&&isSelected&&<span style={{position:"absolute",width:sz+20,height:sz+20,borderRadius:"50%",border:`2px solid ${s.bg}`,opacity:0,animation:"br-marker-pulse 2.5s ease-out 1.25s infinite",pointerEvents:"none"}} />}
      <span style={{position:"absolute",width:sz+8,height:sz+8,borderRadius:"50%",background:`radial-gradient(circle, ${s.ring}, transparent 70%)`,transition:"all .3s",opacity:isSelected?1:isHovered?.7:.4,pointerEvents:"none"}} />
      <span style={{position:"relative",width:sz,height:sz,borderRadius:"50%",background:s.bg,border:isSelected?`2.5px solid ${active && isLight ? "#10b981" : "#fff"}`:"1.5px solid rgba(255,255,255,.3)",boxShadow:isSelected||isHovered?s.glow:"none",transition:"all .25s",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2}}>
        {isSelected&&rank<=3&&<Crown style={{width:8,height:8,color:"#fff"}} />}
      </span>
      <span style={{position:"absolute",top:"100%",left:"50%",transform:"translateX(-50%)",marginTop:2,fontSize:9,fontWeight:isSelected?800:600,color:isSelected?"rgba(255,255,255,.9)":"rgba(255,255,255,.4)",whiteSpace:"nowrap",textShadow:"0 1px 4px rgba(0,0,0,.8)",pointerEvents:"none"}}>{branch.code}</span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAP POPUP
// ═══════════════════════════════════════════════════════════════════════════
const BranchPopupContent: React.FC<{branch:BranchData;rank:number;onSelect:()=>void;isLight:boolean}> = ({branch,rank,onSelect,isLight}) => {
  const s = sc(branch.status);
  const isOpen = branch.status==="open";
  return (
    <div style={{background:isLight?"rgba(255,255,255,.96)":"rgba(14,20,30,.95)",backdropFilter:"blur(16px)",border:`1px solid ${isLight?"rgba(148,163,184,.4)":"rgba(255,255,255,.1)"}`,borderRadius:14,padding:"16px 18px",minWidth:260,maxWidth:300,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",color:isLight?"rgba(15,23,42,.9)":"rgba(255,255,255,.88)",boxShadow:isLight?"0 10px 30px rgba(2,6,23,.12)":"0 12px 48px rgba(0,0,0,.6)"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
            <span style={{fontSize:14,fontWeight:800,letterSpacing:"-0.3px"}}>{branch.name}</span>
            {rank<=3&&isOpen&&<span style={{display:"inline-flex",alignItems:"center",gap:2,padding:"1px 5px",borderRadius:4,background:"rgba(245,158,11,.15)",fontSize:8,fontWeight:900,color:"#f59e0b"}}><Crown style={{width:7,height:7}} />#{rank}</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 7px",borderRadius:5,background:`${s.bg}18`,border:`1px solid ${s.bg}44`,fontSize:9,fontWeight:800,color:s.bg}}><span style={{width:5,height:5,borderRadius:"50%",background:s.bg}} />{s.label}</span>
            <span style={{fontSize:10,color:isLight?"rgba(51,65,85,.7)":"rgba(255,255,255,.35)"}}>{branch.city}</span>
          </div>
        </div>
      </div>
      {isOpen ? (
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            {[{l:"Revenue",v:fmtRM(branch.todayRevenue),t:branch.revenueTrend,ic:<DollarSign style={{width:10,height:10}} />},{l:"Orders",v:String(branch.todayOrders),t:branch.ordersTrend,ic:<ShoppingBag style={{width:10,height:10}} />},{l:"Traffic",v:fmtN(branch.footTraffic),t:null,ic:<Footprints style={{width:10,height:10}} />},{l:"Target",v:`${branch.targetAchievement}%`,t:null,ic:<Target style={{width:10,height:10}} />}].map((m,i)=>(
              <div key={i} style={{padding:"8px 10px",borderRadius:8,background:isLight?"rgba(248,250,252,.9)":"rgba(255,255,255,.04)",border:`1px solid ${isLight?"rgba(148,163,184,.25)":"rgba(255,255,255,.06)"}`}}>
                <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:3,color:isLight?"rgba(51,65,85,.75)":"rgba(255,255,255,.3)"}}>{m.ic}<span style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".04em"}}>{m.l}</span></div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:14,fontWeight:800}}>{m.v}</span>
                  {m.t!==null&&<span style={{display:"inline-flex",alignItems:"center",gap:1,fontSize:9,fontWeight:800,color:m.t>=0?"#10b981":"#ef4444"}}>{m.t>=0?<ArrowUp style={{width:8,height:8}} />:<ArrowDown style={{width:8,height:8}} />}{Math.abs(m.t).toFixed(1)}%</span>}
                </div>
              </div>
            ))}
          </div>
          <div style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:isLight?"rgba(51,65,85,.75)":"rgba(255,255,255,.35)"}}>Monthly Target</span><span style={{fontSize:10,fontWeight:800,color:perfC(branch.targetAchievement)}}>{branch.targetAchievement}%</span></div>
            <MiniBar value={branch.targetAchievement} max={100} color={perfC(branch.targetAchievement)} />
          </div>
        </>
      ) : (
        <div style={{padding:"16px 12px",borderRadius:8,background:isLight?"rgba(245,158,11,.1)":"rgba(245,158,11,.06)",border:"1px solid rgba(245,158,11,.2)",display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <AlertTriangle style={{width:14,height:14,color:"#f59e0b",flexShrink:0}} />
          <span style={{fontSize:11,color:isLight?"rgba(120,53,15,.9)":"rgba(255,255,255,.5)"}}>Branch is currently {branch.status}</span>
        </div>
      )}
      <button onClick={onSelect} style={{width:"100%",padding:"9px 14px",borderRadius:9,background:"linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))",border:"none",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5,boxShadow:"0 4px 16px rgba(var(--preset-primary-rgb),.3)",fontFamily:"inherit"}}>
        View Full Details <ChevronRight style={{width:12,height:12}} />
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// BRANCH DETAIL PANEL
// ═══════════════════════════════════════════════════════════════════════════
const BranchDetail: React.FC<{branch:BranchData;allBranches:BranchData[];onClose:()=>void}> = ({branch,allBranches,onClose}) => {
  const [tab, setTab] = useState<BranchTab>("overview");
  const s = sc(branch.status);
  const hourly = useMemo(()=>genHourly(branch),[branch]);
  const weekly = useMemo(()=>genWeekly(branch),[branch]);
  const monthly = useMemo(()=>genMonthly(branch),[branch]);
  const open = allBranches.filter(b=>b.status==="open").sort((a,b)=>b.todayRevenue-a.todayRevenue);
  const rank = open.findIndex(b=>b.id===branch.id)+1;

  const TABS:{key:BranchTab;label:string;icon:React.ReactNode}[] = [
    {key:"overview",label:"Overview",icon:<LayoutGrid style={{width:12,height:12}} />},
    {key:"revenue",label:"Revenue",icon:<DollarSign style={{width:12,height:12}} />},
    {key:"traffic",label:"Traffic",icon:<Footprints style={{width:12,height:12}} />},
    {key:"staff",label:"Staff",icon:<Users style={{width:12,height:12}} />},
    {key:"compare",label:"Compare",icon:<BarChart3 style={{width:12,height:12}} />},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14,animation:"br-slideIn .3s ease"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
        <button onClick={onClose} style={{width:34,height:34,borderRadius:9,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"rgba(255,255,255,.5)",flexShrink:0}}>
          <ChevronLeft style={{width:16,height:16}} />
        </button>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <h3 style={{margin:0,fontSize:18,fontWeight:800,letterSpacing:"-0.4px"}}>{branch.name}</h3>
            <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 8px",borderRadius:5,background:`${s.bg}18`,border:`1px solid ${s.bg}44`,fontSize:9,fontWeight:800,color:s.bg}}><PulseDot size={5} color={s.bg} />{s.label}</span>
            {rank<=3&&rank>0&&<span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 8px",borderRadius:5,background:"rgba(245,158,11,.12)",border:"1px solid rgba(245,158,11,.3)",fontSize:9,fontWeight:800,color:"#f59e0b"}}><Crown style={{width:8,height:8}} />#{rank}</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4,flexWrap:"wrap",fontSize:11,color:"rgba(255,255,255,.4)"}}>
            <span style={{display:"flex",alignItems:"center",gap:3}}><MapPin style={{width:10,height:10}} />{branch.address}, {branch.city}</span>
            <span style={{color:"rgba(255,255,255,.15)"}}>•</span>
            <span>{branch.sqft.toLocaleString()} sqft</span>
            <span style={{color:"rgba(255,255,255,.15)"}}>•</span>
            <span>{branch.operatingHours}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:2,borderBottom:"1px solid rgba(255,255,255,.07)",overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"7px 13px",borderRadius:"9px 9px 0 0",fontSize:11,fontWeight:700,cursor:"pointer",border:"1px solid transparent",fontFamily:"inherit",transition:"all .15s",whiteSpace:"nowrap",flexShrink:0,...(tab===t.key?{background:"linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))",color:"#fff",boxShadow:"0 4px 14px rgba(var(--preset-primary-rgb),.28)"}:{background:"transparent",color:"rgba(255,255,255,.38)"})}}>{t.icon}{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab==="overview"&&branch.status==="open"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:10}}>
            {[
              {l:"Today Revenue",v:fmtRM(branch.todayRevenue),ic:<DollarSign style={{width:14,height:14}} />,ac:"var(--preset-primary)",t:branch.revenueTrend},
              {l:"Today Orders",v:String(branch.todayOrders),ic:<ShoppingBag style={{width:14,height:14}} />,ac:"#6366f1",t:branch.ordersTrend},
              {l:"Foot Traffic",v:branch.footTraffic.toLocaleString(),ic:<Footprints style={{width:14,height:14}} />,ac:"#10b981",t:branch.trafficTrend},
              {l:"Avg Order",v:`RM ${branch.avgOrderValue.toFixed(0)}`,ic:<CreditCard style={{width:14,height:14}} />,ac:"#ec4899",t:null},
              {l:"Conversion",v:`${branch.conversionRate}%`,ic:<Target style={{width:14,height:14}} />,ac:"#f59e0b",t:null},
              {l:"Satisfaction",v:`${branch.customerSatisfaction}/5`,ic:<Star style={{width:14,height:14}} />,ac:"#f59e0b",t:null},
            ].map((k,i)=>(
              <div key={i} style={{borderRadius:12,border:"1px solid rgba(255,255,255,.07)",background:"rgba(255,255,255,.03)",padding:"14px 16px",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:"-35%",right:"-12%",width:90,height:90,borderRadius:"50%",background:`radial-gradient(circle,${k.ac}15,transparent 70%)`,pointerEvents:"none"}} />
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{width:28,height:28,borderRadius:7,background:`${k.ac}18`,display:"flex",alignItems:"center",justifyContent:"center",color:k.ac}}>{k.ic}</div>
                  {k.t!==null&&<span style={{display:"inline-flex",alignItems:"center",gap:2,fontSize:10,fontWeight:800,color:k.t>=0?"#10b981":"#ef4444"}}>{k.t>=0?<ArrowUp style={{width:9,height:9}} />:<ArrowDown style={{width:9,height:9}} />}{Math.abs(k.t).toFixed(1)}%</span>}
                </div>
                <div style={{fontSize:20,fontWeight:800,letterSpacing:"-0.4px",color:"rgba(255,255,255,.92)",marginBottom:3}}>{k.v}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,.35)",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em"}}>{k.l}</div>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1.2fr .8fr",gap:12}}>
            <Panel>
              <PanelHeader title="This Week's Revenue" subtitle="Daily vs target" icon={<BarChart2 style={{width:14,height:14}} />} />
              <ResponsiveContainer width="100%" height={180}>
                <ComposedChart data={weekly} margin={{top:0,right:0,left:-22,bottom:0}}>
                  <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,.04)" vertical={false} />
                  <XAxis dataKey="day" tick={{fontSize:10,fill:"rgba(255,255,255,.3)"}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize:9,fill:"rgba(255,255,255,.25)"}} tickLine={false} axisLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="revenue" name="Revenue" radius={[4,4,0,0]} maxBarSize={22}>{weekly.map((_,i)=><Cell key={i} fill={i===weekly.length-1?"var(--preset-primary)":`rgba(var(--preset-primary-rgb),${0.3+i*0.08})`} />)}</Bar>
                  <Line type="monotone" dataKey="target" name="Target" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </Panel>
            <Panel>
              <PanelHeader title="Sales by Category" subtitle="Current month" icon={<PieChartIcon style={{width:14,height:14}} />} iconColor="#ec4899" />
              <ResponsiveContainer width="100%" height={140}>
                <RePieChart><Pie data={CATS} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={52} innerRadius={28} strokeWidth={0} paddingAngle={3}>{CATS.map((c,i)=><Cell key={i} fill={c.color} />)}</Pie><Tooltip content={<ChartTip />} /></RePieChart>
              </ResponsiveContainer>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginTop:6}}>{CATS.map((c,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10}}><span style={{width:6,height:6,borderRadius:"50%",background:c.color}} /><span style={{color:"rgba(255,255,255,.4)"}}>{c.name}</span></div>))}</div>
            </Panel>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Panel>
              <PanelHeader title="Monthly Target" subtitle={`${fmtRM(branch.monthRevenue)} of ${fmtRM(branch.monthlyTarget)}`} icon={<Target style={{width:14,height:14}} />} iconColor={perfC(branch.targetAchievement)} />
              <div style={{position:"relative",width:130,height:130,margin:"0 auto"}}>
                <svg viewBox="0 0 120 120" style={{transform:"rotate(-90deg)"}}><circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="10" /><circle cx="60" cy="60" r="50" fill="none" stroke={perfC(branch.targetAchievement)} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(branch.targetAchievement/100)*314} 314`} style={{transition:"stroke-dasharray 1s ease"}} /></svg>
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:26,fontWeight:900,color:perfC(branch.targetAchievement)}}>{branch.targetAchievement}%</span><span style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>achieved</span></div>
              </div>
              <div style={{textAlign:"center",marginTop:10,fontSize:12,color:"rgba(255,255,255,.5)"}}>Remaining: <b style={{color:"rgba(255,255,255,.8)"}}>{fmtRM(branch.monthlyTarget-branch.monthRevenue)}</b></div>
            </Panel>
            <Panel>
              <PanelHeader title="Branch Details" icon={<Info style={{width:14,height:14}} />} iconColor="var(--preset-lighter)" />
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[{l:"Manager",v:branch.manager,ic:<UserCheck style={{width:11,height:11}} />},{l:"Phone",v:branch.phone,ic:<Phone style={{width:11,height:11}} />},{l:"Opened",v:new Date(branch.openedDate).toLocaleDateString("en-MY",{year:"numeric",month:"long"}),ic:<Calendar style={{width:11,height:11}} />},{l:"Best Seller",v:branch.bestSeller,ic:<Star style={{width:11,height:11}} />},{l:"Top Category",v:branch.topCategory,ic:<Tag style={{width:11,height:11}} />},{l:"Return Rate",v:`${branch.returnRate}%`,ic:<BarChart2 style={{width:11,height:11}} />}].map((d,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:i<5?"1px solid rgba(255,255,255,.05)":"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,color:"rgba(255,255,255,.35)"}}>{d.ic}<span style={{fontSize:11}}>{d.l}</span></div>
                    <span style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.75)"}}>{d.v}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* REVENUE */}
      {tab==="revenue"&&branch.status==="open"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Panel>
            <PanelHeader title="6-Month Revenue Trend" icon={<TrendingUp style={{width:14,height:14}} />} />
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthly} margin={{top:0,right:0,left:-22,bottom:0}}>
                <defs><linearGradient id="mRevG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--preset-primary)" stopOpacity={.3} /><stop offset="100%" stopColor="var(--preset-primary)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,.04)" vertical={false} />
                <XAxis dataKey="month" tick={{fontSize:10,fill:"rgba(255,255,255,.3)"}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize:9,fill:"rgba(255,255,255,.25)"}} tickLine={false} axisLine={false} tickFormatter={v=>fmtRM(v)} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--preset-primary)" strokeWidth={2} fill="url(#mRevG)" dot={{r:3,fill:"var(--preset-primary)",strokeWidth:0}} />
              </AreaChart>
            </ResponsiveContainer>
          </Panel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {[{l:"Month Revenue",v:fmtRM(branch.monthRevenue),c:"var(--preset-primary)"},{l:"Month Orders",v:branch.monthOrders.toLocaleString(),c:"#6366f1"},{l:"Avg Order Value",v:`RM ${branch.avgOrderValue.toFixed(0)}`,c:"#ec4899"}].map((m,i)=>(
              <div key={i} style={{borderRadius:12,background:`${m.c}08`,border:`1px solid ${m.c}22`,padding:"14px 16px",textAlign:"center"}}><div style={{fontSize:22,fontWeight:900,color:m.c}}>{m.v}</div><div style={{fontSize:10,color:"rgba(255,255,255,.35)",fontWeight:700,textTransform:"uppercase",marginTop:4}}>{m.l}</div></div>
            ))}
          </div>
        </div>
      )}

      {/* TRAFFIC */}
      {tab==="traffic"&&branch.status==="open"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Panel>
            <PanelHeader title="Hourly Foot Traffic" subtitle="Today" icon={<Footprints style={{width:14,height:14}} />} iconColor="#10b981" />
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={hourly} margin={{top:0,right:0,left:-22,bottom:0}}>
                <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,.04)" vertical={false} />
                <XAxis dataKey="hour" tick={{fontSize:9,fill:"rgba(255,255,255,.3)"}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize:9,fill:"rgba(255,255,255,.25)"}} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="traffic" name="Visitors" radius={[4,4,0,0]} maxBarSize={18}>{hourly.map((d,i)=><Cell key={i} fill={d.traffic>(branch.footTraffic/13)*1.3?"#10b981":"rgba(var(--preset-primary-rgb),.4)"} />)}</Bar>
                <Line type="monotone" dataKey="conversion" name="Conversion %" stroke="#f59e0b" strokeWidth={2} dot={{r:2,fill:"#f59e0b",strokeWidth:0}} />
              </ComposedChart>
            </ResponsiveContainer>
          </Panel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {[{l:"Peak Hour",v:"12–1 PM",sub:"Lunch rush",c:"#10b981"},{l:"Avg Dwell",v:`${branch.avgServiceTime} min`,sub:"Per customer",c:"#6366f1"},{l:"Conversion",v:`${branch.conversionRate}%`,sub:"Walk-in → buy",c:"#f59e0b"}].map((m,i)=>(
              <Panel key={i}><div style={{fontSize:10,color:"rgba(255,255,255,.35)",fontWeight:700,textTransform:"uppercase",marginBottom:8}}>{m.l}</div><div style={{fontSize:20,fontWeight:900,color:m.c}}>{m.v}</div><div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:2}}>{m.sub}</div></Panel>
            ))}
          </div>
        </div>
      )}

      {/* STAFF */}
      {tab==="staff"&&branch.status==="open"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>
            {[{l:"Total Staff",v:branch.staffCount,ic:<Users style={{width:14,height:14}} />,c:"var(--preset-primary)"},{l:"Present",v:branch.staffPresent,ic:<UserCheck style={{width:14,height:14}} />,c:"#10b981"},{l:"Absent",v:branch.staffCount-branch.staffPresent,ic:<UserMinus style={{width:14,height:14}} />,c:"#ef4444"},{l:"Avg Service",v:`${branch.avgServiceTime}m`,ic:<Clock style={{width:14,height:14}} />,c:"#f59e0b"}].map((k,i)=>(
              <Panel key={i}><div style={{color:k.c,marginBottom:10}}>{k.ic}</div><div style={{fontSize:22,fontWeight:900,color:k.c}}>{k.v}</div><div style={{fontSize:10,color:"rgba(255,255,255,.35)",fontWeight:700,textTransform:"uppercase",marginTop:4}}>{k.l}</div></Panel>
            ))}
          </div>
          <Panel>
            <PanelHeader title="Attendance Rate" icon={<UserCheck style={{width:14,height:14}} />} iconColor="#10b981" />
            <div style={{position:"relative",width:120,height:120,margin:"0 auto 12px"}}>
              <svg viewBox="0 0 120 120" style={{transform:"rotate(-90deg)"}}><circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="10" /><circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${((branch.staffPresent/branch.staffCount)*100/100)*314} 314`} /></svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:22,fontWeight:900,color:"#10b981"}}>{Math.round((branch.staffPresent/branch.staffCount)*100)}%</span></div>
            </div>
            <div style={{textAlign:"center",fontSize:12,color:"rgba(255,255,255,.45)"}}><b style={{color:"#10b981"}}>{branch.staffPresent}</b> of <b>{branch.staffCount}</b> present</div>
          </Panel>
        </div>
      )}

      {/* COMPARE */}
      {tab==="compare"&&(
        <Panel>
          <PanelHeader title="Branch vs Network Average" icon={<BarChart3 style={{width:14,height:14}} />} iconColor="#8b5cf6" />
          {(()=>{
            const avg={revenue:open.reduce((s,b)=>s+b.todayRevenue,0)/open.length,orders:open.reduce((s,b)=>s+b.todayOrders,0)/open.length,traffic:open.reduce((s,b)=>s+b.footTraffic,0)/open.length,conv:open.reduce((s,b)=>s+b.conversionRate,0)/open.length,aov:open.reduce((s,b)=>s+b.avgOrderValue,0)/open.length,sat:open.reduce((s,b)=>s+b.customerSatisfaction,0)/open.length};
            return [{m:"Revenue",b:branch.todayRevenue,a:avg.revenue,f:fmtRM},{m:"Orders",b:branch.todayOrders,a:avg.orders,f:(v:number)=>v.toFixed(0)},{m:"Traffic",b:branch.footTraffic,a:avg.traffic,f:(v:number)=>v.toFixed(0)},{m:"Conversion",b:branch.conversionRate,a:avg.conv,f:(v:number)=>`${v.toFixed(1)}%`},{m:"Avg Order",b:branch.avgOrderValue,a:avg.aov,f:(v:number)=>`RM ${v.toFixed(0)}`},{m:"Satisfaction",b:branch.customerSatisfaction,a:avg.sat,f:(v:number)=>`${v.toFixed(1)}/5`}].map((r,i)=>{
              const diff=r.b-r.a;const pct=r.a>0?((diff/r.a)*100):0;const up=diff>=0;
              return (<div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 13px",borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",marginBottom:8}}>
                <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.55)",minWidth:100}}>{r.m}</div>
                <div style={{display:"flex",alignItems:"center",gap:16}}>
                  <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:800,color:"rgba(255,255,255,.85)"}}>{r.f(r.b)}</div><div style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>This branch</div></div>
                  <div style={{width:1,height:24,background:"rgba(255,255,255,.08)"}} />
                  <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.45)"}}>{r.f(r.a)}</div><div style={{fontSize:9,color:"rgba(255,255,255,.3)"}}>Network avg</div></div>
                  <span style={{display:"inline-flex",alignItems:"center",gap:2,padding:"2px 7px",borderRadius:5,background:up?"rgba(16,185,129,.12)":"rgba(239,68,68,.12)",border:`1px solid ${up?"rgba(16,185,129,.3)":"rgba(239,68,68,.3)"}`,fontSize:10,fontWeight:800,color:up?"#10b981":"#ef4444",minWidth:48,justifyContent:"center"}}>{up?<ArrowUp style={{width:8,height:8}} />:<ArrowDown style={{width:8,height:8}} />}{Math.abs(pct).toFixed(1)}%</span>
                </div>
              </div>);
            });
          })()}
        </Panel>
      )}

      {branch.status!=="open"&&(
        <Panel style={{textAlign:"center",padding:"48px 24px"}}>
          <AlertTriangle style={{width:40,height:40,color:"#f59e0b",margin:"0 auto 16px"}} />
          <h3 style={{fontSize:18,fontWeight:800,marginBottom:4}}>Branch Under Renovation</h3>
          <p style={{fontSize:13,color:"rgba(255,255,255,.4)",maxWidth:400,margin:"0 auto"}}>Live metrics are paused. Historical data is still available.</p>
        </Panel>
      )}
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════════════════
// BRANCH CARD (sidebar list)
// ═══════════════════════════════════════════════════════════════════════════
const BranchCard: React.FC<{branch:BranchData;isSelected:boolean;rank:number;onClick:()=>void;onHover:(id:string|null)=>void}> = ({branch,isSelected,rank,onClick,onHover}) => {
  const s = sc(branch.status);
  return (
    <div onClick={onClick} onMouseEnter={()=>onHover(branch.id)} onMouseLeave={()=>onHover(null)}
      style={{borderRadius:13,padding:"14px 16px",cursor:"pointer",transition:"all .2s",border:isSelected?"1px solid rgba(var(--preset-primary-rgb),.35)":"1px solid rgba(255,255,255,.07)",background:isSelected?"rgba(var(--preset-primary-rgb),.06)":"rgba(255,255,255,.025)",boxShadow:isSelected?"0 4px 20px rgba(var(--preset-primary-rgb),.1)":"none"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:branch.status==="open"?10:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:32,height:32,borderRadius:9,background:isSelected?"linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))":"rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {rank<=3?<Crown style={{width:14,height:14,color:isSelected?"#fff":"#f59e0b"}} />:<Store style={{width:14,height:14,color:isSelected?"#fff":"rgba(255,255,255,.4)"}} />}
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:800,letterSpacing:"-0.2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:155}}>{branch.name}</div>
            <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
              <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"1px 5px",borderRadius:4,background:`${s.bg}15`,border:`1px solid ${s.bg}33`,fontSize:8,fontWeight:800,color:s.bg}}><PulseDot size={4} color={s.bg} />{s.label}</span>
              <span style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{branch.city}</span>
            </div>
          </div>
        </div>
        <ChevronRight style={{width:13,height:13,color:"rgba(255,255,255,.2)",flexShrink:0}} />
      </div>
      {branch.status==="open"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          <div style={{padding:"6px 8px",borderRadius:7,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.05)"}}>
            <div style={{fontSize:8,color:"rgba(255,255,255,.3)",fontWeight:700,textTransform:"uppercase",marginBottom:1}}>Revenue</div>
            <div style={{fontSize:13,fontWeight:900}}>{fmtRM(branch.todayRevenue)}</div>
          </div>
          <div style={{padding:"6px 8px",borderRadius:7,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.05)"}}>
            <div style={{fontSize:8,color:"rgba(255,255,255,.3)",fontWeight:700,textTransform:"uppercase",marginBottom:1}}>Target</div>
            <div style={{fontSize:13,fontWeight:900,color:perfC(branch.targetAchievement)}}>{branch.targetAchievement}%</div>
          </div>
        </div>
      )}
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════
const BranchesPage: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const mapRef = useRef<MapRef>(null);
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [hoveredId, setHoveredId] = useState<string|null>(null);
  const [popupBranch, setPopupBranch] = useState<BranchData|null>(null);
  const [detailBranch, setDetailBranch] = useState<BranchData|null>(null);
  const [sortBy, setSortBy] = useState<"revenue"|"orders"|"target">("revenue");
  const [searchQ, setSearchQ] = useState("");

  const rankedIds = useMemo(()=>BRANCHES.filter(b=>b.status==="open").sort((a,b)=>b.todayRevenue-a.todayRevenue).map(b=>b.id),[]);
  const getRank = (id:string)=>rankedIds.indexOf(id)+1;

  const sorted = useMemo(()=>{
    let f = BRANCHES.filter(b=>b.name.toLowerCase().includes(searchQ.toLowerCase())||b.city.toLowerCase().includes(searchQ.toLowerCase())||b.code.toLowerCase().includes(searchQ.toLowerCase()));
    return f.sort((a,b)=>{if(a.status!=="open"&&b.status==="open")return 1;if(a.status==="open"&&b.status!=="open")return -1;const m={revenue:a.todayRevenue-b.todayRevenue,orders:a.todayOrders-b.todayOrders,target:a.targetAchievement-b.targetAchievement};return -(m[sortBy]);});
  },[searchQ,sortBy]);

  const net = useMemo(()=>{const o=BRANCHES.filter(b=>b.status==="open");return{rev:o.reduce((s,b)=>s+b.todayRevenue,0),orders:o.reduce((s,b)=>s+b.todayOrders,0),traffic:o.reduce((s,b)=>s+b.footTraffic,0),active:o.length,total:BRANCHES.length,staff:o.reduce((s,b)=>s+b.staffPresent,0),staffT:o.reduce((s,b)=>s+b.staffCount,0),avgSat:o.length?o.reduce((s,b)=>s+b.customerSatisfaction,0)/o.length:0};},[]);

  const flyTo = useCallback((b:BranchData)=>{
    if(mapRef.current) mapRef.current.flyTo({center:[b.lng,b.lat],zoom:14,pitch:45,bearing:-15,duration:1400,essential:true});
  },[]);

  const handleMarkerClick = useCallback((b:BranchData)=>{setPopupBranch(b);setSelectedId(b.id);flyTo(b);},[flyTo]);
  const handlePopupClose = useCallback(()=>{setPopupBranch(null);if(mapRef.current)mapRef.current.flyTo({center:[101.5,3.5],zoom:8,pitch:30,bearing:0,duration:1200});},[]);
  const handleViewDetail = useCallback((id:string)=>{setPopupBranch(null);setDetailBranch(BRANCHES.find(b=>b.id===id)||null);},[]);
  const handleCloseDetail = useCallback(()=>{setDetailBranch(null);if(mapRef.current)mapRef.current.flyTo({center:[101.5,3.5],zoom:8,pitch:30,bearing:0,duration:1200});},[]);

  const handleCardClick = useCallback((b:BranchData)=>{setSelectedId(b.id);setPopupBranch(b);flyTo(b);},[flyTo]);

  return (
    <>
      <style>{`
        @keyframes br-pulse{0%,100%{transform:scale(1);opacity:.4}50%{transform:scale(2.4);opacity:0}}
        @keyframes br-marker-pulse{0%{transform:scale(.8);opacity:.8}100%{transform:scale(2.2);opacity:0}}
        @keyframes br-slideIn{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
        @keyframes br-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .maplibregl-popup-content{background:transparent!important;box-shadow:none!important;padding:0!important;border-radius:14px!important}
        .maplibregl-popup-tip{display:none!important}
        .maplibregl-popup-close-button{color:rgba(255,255,255,.4)!important;font-size:18px!important;right:8px!important;top:8px!important;width:24px!important;height:24px!important;display:flex!important;align-items:center!important;justify-content:center!important;border-radius:6px!important;background:rgba(255,255,255,.06)!important}
        .maplibregl-popup-close-button:hover{color:rgba(255,255,255,.8)!important;background:rgba(255,255,255,.12)!important}
        .maplibregl-ctrl-bottom-left,.maplibregl-ctrl-bottom-right{opacity:.4}
        .branches-theme.light-mode{background:#fff;color:#0f172a}
        .branches-theme.light-mode [style*="rgba(255,255,255"], .branches-theme.light-mode [style*="rgba(255, 255, 255"]{
          color:rgba(15,23,42,.86)!important;
          border-color:rgba(148,163,184,.35)!important;
          background:rgba(255,255,255,.92)!important;
        }
        .branches-theme.light-mode .recharts-cartesian-grid line{stroke:rgba(148,163,184,.24)!important}
        .branches-theme.light-mode .recharts-text,.branches-theme.light-mode .recharts-legend-item-text,.branches-theme.light-mode svg text,.branches-theme.light-mode svg tspan{fill:rgba(30,41,59,.82)!important}
        .branches-theme.light-mode .maplibregl-popup-close-button{color:rgba(15,23,42,.5)!important;background:rgba(241,245,249,.95)!important}
        .branches-theme.light-mode .maplibregl-popup-close-button:hover{color:rgba(15,23,42,.8)!important;background:rgba(226,232,240,.95)!important}
        .branches-theme.light-mode .maplibregl-ctrl-group{background:rgba(255,255,255,.95)!important;border:1px solid rgba(148,163,184,.35)!important}
        .branches-theme.light-mode .maplibregl-ctrl-group button span{filter:invert(0)!important}
      `}</style>

<div className={`branches-theme ${isLight ? "light-mode" : ""}`} style={{color:isLight?"#0f172a":"rgba(255,255,255,.88)",display:"flex",flexDirection:"column",gap:18,width:"100%",minHeight:"100vh",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',sans-serif"}}>

        {/* HEADER */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
              <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(var(--preset-primary-rgb),.35)",flexShrink:0}}><Building2 style={{width:18,height:18,color:"#fff"}} /></div>
              <div>
                <h2 style={{margin:0,fontSize:22,fontWeight:800,letterSpacing:"-0.5px",lineHeight:1.15}}>Branch Network</h2>
                <div style={{display:"flex",alignItems:"center",gap:7,marginTop:3}}>
                  <PulseDot size={6} color="#10b981" />
                  <span style={{fontSize:10,color:"rgba(255,255,255,.4)",fontWeight:700,letterSpacing:".07em",textTransform:"uppercase"}}>Live</span>
                  <span style={{fontSize:10,color:"rgba(255,255,255,.25)"}}>·</span>
                  <span style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{net.active}/{net.total} branches active</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{position:"relative"}}><Search style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",width:13,height:13,color:"rgba(255,255,255,.25)"}} /><input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search..." style={{width:170,height:33,paddingLeft:28,paddingRight:10,fontSize:12,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:9,color:"rgba(255,255,255,.8)",outline:"none",fontFamily:"inherit"}} /></div>
            <Select value={sortBy} onValueChange={v=>setSortBy(v as any)}><SelectTrigger style={{width:125,height:33,fontSize:12,fontWeight:700,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",color:"rgba(255,255,255,.8)",borderRadius:9,fontFamily:"inherit"}}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="revenue">By Revenue</SelectItem><SelectItem value="orders">By Orders</SelectItem><SelectItem value="target">By Target %</SelectItem></SelectContent></Select>
          </div>
        </div>

        {/* KPI STRIP */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(148px,1fr))",gap:10}}>
          {[
            {l:"Today Revenue",v:fmtRM(net.rev),ic:<DollarSign style={{width:14,height:14}} />,ac:"var(--preset-primary)"},
            {l:"Today Orders",v:net.orders.toLocaleString(),ic:<ShoppingBag style={{width:14,height:14}} />,ac:"#6366f1"},
            {l:"Foot Traffic",v:net.traffic.toLocaleString(),ic:<Footprints style={{width:14,height:14}} />,ac:"#10b981"},
            {l:"Staff Present",v:`${net.staff}/${net.staffT}`,ic:<Users style={{width:14,height:14}} />,ac:"#ec4899"},
            {l:"Avg Satisfaction",v:`${net.avgSat.toFixed(1)}/5`,ic:<Star style={{width:14,height:14}} />,ac:"#f59e0b"},
          ].map((k,i)=>(
            <div key={i} style={{borderRadius:13,border:"1px solid rgba(255,255,255,.07)",background:"rgba(255,255,255,.03)",padding:"14px 16px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:"-40%",right:"-15%",width:100,height:100,borderRadius:"50%",background:`radial-gradient(circle,${k.ac}15,transparent 70%)`,pointerEvents:"none"}} />
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div style={{width:28,height:28,borderRadius:7,background:`${k.ac}18`,display:"flex",alignItems:"center",justifyContent:"center",color:k.ac}}>{k.ic}</div>
                <PulseDot size={5} color={k.ac} />
              </div>
              <div style={{fontSize:20,fontWeight:800,letterSpacing:"-0.4px",color:"rgba(255,255,255,.92)",marginBottom:3}}>{k.v}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.35)",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em"}}>{k.l}</div>
            </div>
          ))}
        </div>

        {/* DETAIL VIEW or MAP+LIST */}
        {detailBranch ? (
          <BranchDetail branch={detailBranch} allBranches={BRANCHES} onClose={handleCloseDetail} />
        ) : (
<div style={{display:"grid",gridTemplateColumns:"1fr 330px",gap:14,alignItems:"stretch",flex:1,minHeight:0}}>
{/* MAP */}
<div style={{position:"relative",borderRadius:16,overflow:"hidden",border:"1px solid rgba(255,255,255,.06)",minHeight:500}}>              <Map ref={mapRef} initialViewState={{longitude:101.5,latitude:3.5,zoom:8,pitch:30,bearing:0}} style={{width:"100%",height:"100%",minHeight:500}} mapStyle={isLight ? MAP_STYLE_LIGHT : MAP_STYLE_DARK} maxZoom={18} minZoom={6} maxBounds={[[99.5,1.0],[104.5,7.5]]} attributionControl={false}>
                <NavigationControl position="bottom-right" showCompass showZoom />
                <ScaleControl position="bottom-left" />
                {BRANCHES.map(b=>(
                  <Marker key={b.id} longitude={b.lng} latitude={b.lat} anchor="center">
                    <BranchMarker branch={b} isSelected={selectedId===b.id||popupBranch?.id===b.id} isHovered={hoveredId===b.id} rank={getRank(b.id)} isLight={isLight} onHover={setHoveredId} onClick={()=>handleMarkerClick(b)} />
                  </Marker>
                ))}
                {popupBranch&&(
                  <Popup
                    longitude={popupBranch.lng}
                    latitude={popupBranch.lat}
                    anchor="top-left"
                    offset={[14, -120] as [number, number]}
                    closeOnClick={false}
                    onClose={handlePopupClose}
                    maxWidth="320px"
                  >
                    <BranchPopupContent branch={popupBranch} rank={getRank(popupBranch.id)} onSelect={()=>handleViewDetail(popupBranch.id)} isLight={isLight} />
                  </Popup>
                )}
              </Map>
              {/* Overlay: legend */}
              <div style={{position:"absolute",top:14,right:14,display:"flex",gap:8,padding:"8px 12px",borderRadius:10,background:isLight?"rgba(255,255,255,.92)":"rgba(10,15,24,.85)",backdropFilter:"blur(8px)",border:`1px solid ${isLight?"rgba(148,163,184,.35)":"rgba(255,255,255,.06)"}`,zIndex:10}}>
                {[{l:"Open",c:"#10b981"},{l:"Renovating",c:"#f59e0b"},{l:"Closed",c:"#ef4444"}].map((l,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:isLight?"rgba(51,65,85,.88)":"rgba(255,255,255,.45)"}}><span style={{width:7,height:7,borderRadius:"50%",background:l.c,boxShadow:`0 0 6px ${l.c}66`}} />{l.l}</div>))}
              </div>
            </div>

            {/* BRANCH LIST */}
            <div style={{display:"flex",flexDirection:"column",gap:8,overflowY:"auto",paddingRight:4}}>              <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,.4)",padding:"0 4px",marginBottom:2}}>{sorted.length} Branches</div>
              {sorted.map((b,i)=>(
                <BranchCard key={b.id} branch={b} isSelected={selectedId===b.id} rank={i+1} onClick={()=>handleCardClick(b)} onHover={setHoveredId} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BranchesPage;