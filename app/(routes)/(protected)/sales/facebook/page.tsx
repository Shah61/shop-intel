"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RePieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, Eye, MousePointer, Target, Search,
  Download, Award, BarChart3, Users, Zap, Crown, ArrowUp, ArrowDown,
  Activity, Sparkles, Globe, ArrowUpDown, Flame, Clock, Percent,
  Layout, Layers, ArrowLeft, ArrowRight, ExternalLink, Calendar as CalendarIcon,
  Filter, ChevronLeft, ChevronRight, X,
} from "lucide-react";
import DateRangePickerPro, { type DateRange, type Timeframe } from "@/components/ui/date-range-picker-pro";
import { startOfMonth, endOfMonth } from "date-fns";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const genCampaigns = () => {
  const c: any[] = [];
  const types = ["Hydration Heroes","SPF Every Day","Glass Skin Launch","Ramadan Glow","Barrier Repair","Retinol Nights","Vitamin C AM","Sensitive Skin Safe","Acne Care Edit","K-Beauty Inspired","Body Care Essentials","Lip Care Obsessed","Eye Revive Week","Mother's Day Glow","Father's Day Grooming","Holiday Gift Sets","Black Friday Skincare","Cyber Monday Bundles","Flash Sale Serums","Limited Edition Essence","Seasonal Hydration","Brightening Focus","Pore Refining","Anti-Aging Clinic","Teen Clear Skin","Men's Basics","Travel Minis","Subscription Boxes","Influencer Collab","Clean Beauty Picks","Halal Certified Edit","Cruelty Free Only","Reef Safe SPF","Fragrance Free","Dermocosmetic","Post-Facial Care","Pre-Wedding Glow","Humid Climate Kit","PM Repair","AM Protection","Double Cleanse","Skin Cycling","Barrier SOS","Redness Relief","Dark Spot Patrol","Undereye Rescue","Neck & Decollete","Hand Cream Love","Foot Care Spa","Beauty Skincare ShopIntel Launch","Watsons Conquest","Sephora Lookalike","Guardian Promo Match","TikTok Viral Routine"];
  const scores = ["Excellent","Good","Average","Needs Work"];
  const statuses = ["Active","Paused","Completed"];
  const accounts = ["Shop-Intel Main","Shop-Intel Secondary","Shop-Intel Premium"];
  for (let i = 1; i <= 120; i++) {
    const score = scores[Math.floor(Math.random()*scores.length)];
    let bS:number,bR:number,bI:number,bC:number,bCTR:number,bCPC:number,bCPM:number;
    switch(score){case"Excellent":bS=12e3+Math.random()*8e3;bR=4e4+Math.random()*3e4;bI=8e4+Math.random()*6e4;bC=2e3+Math.random()*1500;bCTR=2.2+Math.random()*.8;bCPC=4.5+Math.random()*1.5;bCPM=12+Math.random()*3;break;case"Good":bS=8e3+Math.random()*6e3;bR=25e3+Math.random()*2e4;bI=5e4+Math.random()*4e4;bC=1200+Math.random()*1e3;bCTR=1.8+Math.random()*.6;bCPC=5+Math.random()*1.5;bCPM=13+Math.random()*3;break;case"Average":bS=5e3+Math.random()*5e3;bR=15e3+Math.random()*15e3;bI=3e4+Math.random()*3e4;bC=600+Math.random()*800;bCTR=1.5+Math.random()*.5;bCPC=6+Math.random()*2;bCPM=15+Math.random()*4;break;default:bS=3e3+Math.random()*4e3;bR=8e3+Math.random()*12e3;bI=15e3+Math.random()*25e3;bC=300+Math.random()*500;bCTR=1+Math.random()*.8;bCPC=7+Math.random()*3;bCPM=18+Math.random()*5;}
    const sd=new Date(2025,0,1+Math.floor(Math.random()*60));
    const ed=new Date(sd.getTime()+(30+Math.random()*30)*864e5);
    c.push({id:i,name:`Shop-Intel - ${types[Math.floor(Math.random()*types.length)]}`,accountName:accounts[Math.floor(Math.random()*accounts.length)],spend:Math.round(bS),reach:Math.round(bR),impressions:Math.round(bI),clicks:Math.round(bC),ctr:Math.round(bCTR*100)/100,cpc:Math.round(bCPC*100)/100,cpm:Math.round(bCPM*100)/100,performanceScore:score,startDate:sd.toISOString().split('T')[0],endDate:ed.toISOString().split('T')[0],status:statuses[Math.floor(Math.random()*statuses.length)]});
  }
  return c;
};
const fbCampaigns = genCampaigns();

const genAds = () => {
  const a: any[] = [];
  const types = ["Serum Duo","Cleanser Refill","SPF Twin Pack","Night Cream Jar","Essence Limited","Toner Jumbo","Eye Cream Mini","Body Lotion Gift","Lip Mask Set","Sheet Mask Box","Retinol Starter","Niacinamide Boost","Vitamin C Ampoule","Hyaluronic Splash","Centella Calm","Peptide Lift","Ceramide Rich","Brightening Peel","Hydrating Mist","Micellar Jumbo","Clay Mask Single","Exfoliating Pads","Cooling Eye Gel","Neck Cream","Hand Serum","Travel Pouch","Routine Card","Refill Pod","Gua Sha Stone","Ice Roller","Beauty Skincare ShopIntel Kit"];
  const creatives=["Video","Image","Carousel","Collection"];
  const statuses=["Active","Paused","Completed"];
  for(let i=1;i<=120;i++){
    const camp=fbCampaigns[Math.floor(Math.random()*fbCampaigns.length)];
    a.push({id:i,name:`Shop-Intel - ${types[Math.floor(Math.random()*types.length)]}`,campaignName:camp.name,campaignId:camp.id,spend:Math.round(1e3+Math.random()*5e3),reach:Math.round(5e3+Math.random()*2e4),impressions:Math.round(1e4+Math.random()*4e4),clicks:Math.round(200+Math.random()*1e3),ctr:Math.round((1.5+Math.random()*1.5)*100)/100,cpc:Math.round((4+Math.random()*4)*100)/100,cpm:Math.round((10+Math.random()*10)*100)/100,creativeType:creatives[Math.floor(Math.random()*creatives.length)],status:statuses[Math.floor(Math.random()*statuses.length)]});
  }
  return a;
};
const fbAds = genAds();

const perfData = [{date:"Jan 15",spend:12500,reach:45000,impressions:89000,clicks:2200},{date:"Jan 20",spend:8900,reach:32000,impressions:65000,clicks:1800},{date:"Jan 25",spend:15600,reach:58000,impressions:120000,clicks:3100},{date:"Jan 30",spend:7200,reach:28000,impressions:52000,clicks:1400},{date:"Feb 05",spend:9800,reach:35000,impressions:72000,clicks:1900},{date:"Feb 10",spend:6800,reach:25000,impressions:48000,clicks:1200}];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmt=(n:number)=>{if(n>=1e6)return`${(n/1e6).toFixed(1)}M`;if(n>=1e3)return`${(n/1e3).toFixed(1)}K`;return n.toLocaleString();};
const fmtRM=(n:number)=>`RM${n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1e3?`${(n/1e3).toFixed(1)}K`:n.toLocaleString()}`;
const fmtFull=(n:number)=>new Intl.NumberFormat("en-MY",{style:"currency",currency:"MYR",minimumFractionDigits:2}).format(n);
const fmtDate=(d:string)=>new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const COLORS=['#8b5cf6','#6366f1','#ec4899','#f59e0b','#10b981','#06b6d4','#ef4444'];
const SCORE_C:Record<string,string>={Excellent:'#10b981',Good:'#6366f1',Average:'#f59e0b','Needs Work':'#ef4444'};
const STATUS_C:Record<string,string>={Active:'#10b981',Paused:'#f59e0b',Completed:'rgba(255,255,255,.25)'};
const CREATIVE_C:Record<string,string>={Video:'#8b5cf6',Image:'#3b82f6',Carousel:'#10b981',Collection:'#ef4444'};
type ChartMode='area'|'line'|'bar';
type MainTab='overview'|'campaigns'|'ads'|'insights';
type SortField='spend'|'reach'|'impressions'|'clicks'|'ctr'|'cpc'|'cpm';

// ─────────────────────────────────────────────────────────────────────────────
// MICRO COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const PulseDot:React.FC<{color?:string;size?:number}>=({color='var(--preset-primary)',size=7})=>(<span style={{position:'relative',display:'inline-flex',alignItems:'center',justifyContent:'center',width:size,height:size,flexShrink:0}}><span style={{position:'absolute',inset:0,borderRadius:'50%',background:color,opacity:0.4,animation:'fb-pulse 2s ease-in-out infinite'}}/><span style={{width:size,height:size,borderRadius:'50%',background:color,display:'block'}}/></span>);

const AnimNum:React.FC<{value:number;format?:(v:number)=>string}>=({value,format:f})=>{const[n,setN]=useState(0);const raf=useRef(0);useEffect(()=>{const s=performance.now(),d=800;const t=(now:number)=>{const p=Math.min((now-s)/d,1),e=1-Math.pow(1-p,3);setN(Math.floor(e*value));if(p<1)raf.current=requestAnimationFrame(t);};raf.current=requestAnimationFrame(t);return()=>cancelAnimationFrame(raf.current);},[value]);return<>{f?f(n):n.toLocaleString()}</>;};

const ChartTip:React.FC<any>=({active,payload,label})=>{if(!active||!payload?.length)return null;return(<div className="chart-tip" style={{background:'#141c2b',border:'1px solid rgba(var(--preset-primary-rgb),.2)',borderRadius:10,padding:'9px 13px',fontSize:12,backdropFilter:'blur(12px)',boxShadow:'0 8px 32px rgba(0,0,0,.4)'}}>{label&&<div style={{color:'rgba(255,255,255,.4)',marginBottom:5,fontSize:11}}>{label}</div>}{payload.map((p:any,i:number)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:7,color:'rgba(255,255,255,.8)',marginBottom:2}}><span style={{width:7,height:7,borderRadius:'50%',background:p.color||p.fill,flexShrink:0}}/><span style={{color:'rgba(255,255,255,.4)',marginRight:2}}>{p.name}:</span><b>{typeof p.value==='number'?fmt(p.value):p.value}</b></div>))}</div>);};

const Panel:React.FC<{children:React.ReactNode;style?:React.CSSProperties}>=({children,style})=>(<div style={{borderRadius:14,border:'1px solid rgba(255,255,255,.07)',background:'rgba(255,255,255,.025)',padding:'18px 20px',position:'relative',overflow:'hidden',...style}}>{children}</div>);
const PanelHeader:React.FC<{title:string;subtitle?:string;icon:React.ReactNode;iconColor?:string;action?:React.ReactNode}>=({title,subtitle,icon,iconColor='var(--preset-primary)',action})=>(<div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}><div style={{display:'flex',alignItems:'center',gap:9}}><div style={{width:30,height:30,borderRadius:8,background:`${iconColor}18`,display:'flex',alignItems:'center',justifyContent:'center',color:iconColor,flexShrink:0}}>{icon}</div><div><div style={{fontSize:13,fontWeight:800,letterSpacing:'-0.2px'}}>{title}</div>{subtitle&&<div style={{fontSize:11,color:'rgba(255,255,255,.38)',marginTop:1}}>{subtitle}</div>}</div></div>{action}</div>);
const MiniBar:React.FC<{value:number;max:number;color?:string;height?:number}>=({value,max,color='var(--preset-primary)',height=3})=>(<div style={{height,background:'rgba(255,255,255,.07)',borderRadius:99,overflow:'hidden'}}><div style={{width:`${max>0?Math.min((value/max)*100,100):0}%`,height:'100%',background:color,borderRadius:99,transition:'width .8s cubic-bezier(.4,0,.2,1)'}}/></div>);

const ScoreBadge:React.FC<{score:string}>=({score})=>{const c=SCORE_C[score]||'rgba(255,255,255,.3)';return<span style={{display:'inline-flex',alignItems:'center',gap:3,padding:'2px 8px',borderRadius:5,background:`${c}15`,border:`1px solid ${c}33`,fontSize:9,fontWeight:800,color:c,letterSpacing:'.05em'}}>{score.toUpperCase()}</span>;};
const StatusBadge:React.FC<{status:string}>=({status})=>{const c=STATUS_C[status]||'rgba(255,255,255,.3)';return<span style={{display:'inline-flex',alignItems:'center',gap:3,padding:'2px 8px',borderRadius:5,background:`${c}15`,border:`1px solid ${c}33`,fontSize:9,fontWeight:800,color:c,letterSpacing:'.05em'}}>{status==='Active'&&<Activity style={{width:8,height:8}}/>}{status.toUpperCase()}</span>;};
const CreativeBadge:React.FC<{type:string}>=({type})=>{const c=CREATIVE_C[type]||'rgba(255,255,255,.3)';return<span style={{display:'inline-flex',alignItems:'center',gap:3,padding:'2px 8px',borderRadius:5,background:`${c}15`,border:`1px solid ${c}33`,fontSize:9,fontWeight:800,color:c,letterSpacing:'.05em'}}>{type.toUpperCase()}</span>;};

const ChartModeBtn:React.FC<{mode:ChartMode;current:ChartMode;label:string;icon:React.ReactNode;onClick:()=>void}>=({mode,current,label,icon,onClick})=>(<button onClick={onClick} style={{display:'inline-flex',alignItems:'center',gap:4,padding:'4px 10px',borderRadius:7,fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:'inherit',border:'none',transition:'all .15s',...(current===mode?{background:'var(--preset-primary)',color:'#fff',boxShadow:'0 2px 8px rgba(var(--preset-primary-rgb),.3)'}:{background:'rgba(255,255,255,.05)',color:'rgba(255,255,255,.4)'})}}>{icon}{label}</button>);

const LazyLoader:React.FC<{text:string}>=({text})=>(<div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'24px',gap:12}}><div style={{position:'relative',width:44,height:44}}><div style={{position:'absolute',inset:0,borderRadius:'50%',border:'3px solid rgba(var(--preset-primary-rgb),.1)'}}/><div style={{position:'absolute',inset:0,borderRadius:'50%',border:'3px solid transparent',borderTopColor:'var(--preset-primary)',animation:'fb-spin .9s cubic-bezier(.4,0,.2,1) infinite'}}/><div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',animation:'fb-bounce 1.2s ease-in-out infinite'}}><Sparkles style={{width:16,height:16,color:'var(--preset-primary)'}}/></div></div><span style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.4)'}}>{text}</span></div>);

// Exact loader animation used in Intelligence "Top Performing Videos"
const TopVideosLoadMoreMascots: React.FC<{ text: string }> = ({ text }) => {
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
          <animate attributeName="r" values="35;45;35" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Core Orb */}
        <circle cx="50" cy="50" r="28" fill="url(#aiGradient)">
          <animate attributeName="r" values="26;30;26" dur="2.2s" repeatCount="indefinite" />
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
        {text}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN DETAIL PANEL (slide-in detail view)
// ─────────────────────────────────────────────────────────────────────────────
const CampaignDetail:React.FC<{campaign:any;onBack:()=>void}>=({campaign:c,onBack})=>{
  // Find related ads
  const relatedAds=useMemo(()=>fbAds.filter(a=>a.campaignId===c.id||a.campaignName===c.name),[c]);
  const radarData=[{metric:'Reach',value:(c.reach/70000)*100},{metric:'CTR',value:(c.ctr/3)*100},{metric:'Clicks',value:(c.clicks/3500)*100},{metric:'Impressions',value:(c.impressions/140000)*100},{metric:'CPC Eff.',value:Math.max(0,100-(c.cpc/10)*100)},{metric:'CPM Eff.',value:Math.max(0,100-(c.cpm/23)*100)}];
  const scoreColor=SCORE_C[c.performanceScore]||'rgba(255,255,255,.3)';
  const statusColor=STATUS_C[c.status]||'rgba(255,255,255,.3)';

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16,animation:'fb-up .35s ease both'}}>
      {/* Back + title */}
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <button onClick={onBack} style={{display:'inline-flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:8,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:'rgba(255,255,255,.6)',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}><ArrowLeft style={{width:12,height:12}}/>Back to Campaigns</button>
      </div>

      {/* Hero card */}
      <div style={{borderRadius:14,border:`1px solid ${scoreColor}22`,background:`linear-gradient(135deg, ${scoreColor}08, rgba(255,255,255,.02))`,padding:'24px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-30%',right:'-10%',width:200,height:200,borderRadius:'50%',background:`radial-gradient(circle,${scoreColor}12,transparent 70%)`,pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,flexWrap:'wrap',gap:12}}>
            <div>
              <div style={{fontSize:20,fontWeight:900,letterSpacing:'-0.4px',marginBottom:6}}>{c.name}</div>
              <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}><ScoreBadge score={c.performanceScore}/><StatusBadge status={c.status}/><span style={{fontSize:10,color:'rgba(255,255,255,.3)'}}>{c.accountName}</span></div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:28,fontWeight:900,color:scoreColor,letterSpacing:'-0.5px'}}>{fmtRM(c.spend)}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginTop:2}}>Total Campaign Spend</div>
            </div>
          </div>

          {/* Date range bar */}
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',borderRadius:10,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',marginBottom:16}}>
            <CalendarIcon style={{width:12,height:12,color:'rgba(255,255,255,.3)'}}/>
            <span style={{fontSize:11,color:'rgba(255,255,255,.5)'}}>{fmtDate(c.startDate)}</span>
            <div style={{flex:1}}><MiniBar value={c.status==='Completed'?100:c.status==='Active'?60:0} max={100} color={statusColor} height={4}/></div>
            <span style={{fontSize:11,color:'rgba(255,255,255,.5)'}}>{fmtDate(c.endDate)}</span>
          </div>

          {/* Metric grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))',gap:10}}>
            {[
              {label:'Reach',value:fmt(c.reach),icon:<Users style={{width:12,height:12}}/>,accent:'#10b981'},
              {label:'Impressions',value:fmt(c.impressions),icon:<Eye style={{width:12,height:12}}/>,accent:'#8b5cf6'},
              {label:'Clicks',value:fmt(c.clicks),icon:<MousePointer style={{width:12,height:12}}/>,accent:'#f59e0b'},
              {label:'CTR',value:`${c.ctr}%`,icon:<Percent style={{width:12,height:12}}/>,accent:c.ctr>=2?'#10b981':c.ctr>=1.5?'#f59e0b':'#ef4444'},
              {label:'CPC',value:fmtFull(c.cpc),icon:<DollarSign style={{width:12,height:12}}/>,accent:'#06b6d4'},
              {label:'CPM',value:fmtFull(c.cpm),icon:<DollarSign style={{width:12,height:12}}/>,accent:'#ec4899'},
            ].map((m,i)=>(
              <div key={i} style={{padding:'12px',borderRadius:10,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',textAlign:'center'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:4,color:m.accent,marginBottom:6}}>{m.icon}<span style={{fontSize:8,fontWeight:800,textTransform:'uppercase',letterSpacing:'.06em'}}>{m.label}</span></div>
                <div style={{fontSize:18,fontWeight:900,color:m.accent}}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Radar + efficiency side by side */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Panel>
          <PanelHeader title="Performance Radar" subtitle="Normalized across all campaigns" icon={<Target style={{width:14,height:14}}/>} iconColor={scoreColor}/>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} margin={{top:10,right:30,bottom:10,left:30}}>
              <PolarGrid stroke="rgba(255,255,255,.08)"/>
              <PolarAngleAxis dataKey="metric" tick={{fontSize:9,fill:'rgba(255,255,255,.4)'}}/>
              <PolarRadiusAxis tick={false} axisLine={false}/>
              <Radar name="Performance" dataKey="value" stroke={scoreColor} fill={scoreColor} fillOpacity={0.2} strokeWidth={2}/>
            </RadarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel>
          <PanelHeader title="Efficiency Breakdown" subtitle="Cost vs performance ratios" icon={<Zap style={{width:14,height:14}}/>} iconColor="#f59e0b"/>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {[
              {label:'Cost per Click',value:fmtFull(c.cpc),benchmark:'RM6.00',isGood:c.cpc<6,pct:Math.min((6/c.cpc)*100,100)},
              {label:'Cost per 1K Impressions',value:fmtFull(c.cpm),benchmark:'RM15.00',isGood:c.cpm<15,pct:Math.min((15/c.cpm)*100,100)},
              {label:'Click-Through Rate',value:`${c.ctr}%`,benchmark:'2.0%',isGood:c.ctr>=2,pct:Math.min((c.ctr/3)*100,100)},
              {label:'Reach Efficiency',value:`${((c.reach/c.spend)*100).toFixed(0)}/RM`,benchmark:'>500/RM',isGood:(c.reach/c.spend)>5,pct:Math.min(((c.reach/c.spend)/10)*100,100)},
            ].map((m,i)=>(
              <div key={i} style={{padding:'10px 12px',borderRadius:9,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                  <span style={{fontSize:11,fontWeight:700}}>{m.label}</span>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontSize:12,fontWeight:900,color:m.isGood?'#10b981':'#f59e0b'}}>{m.value}</span>
                    <span style={{fontSize:9,color:'rgba(255,255,255,.25)'}}>vs {m.benchmark}</span>
                  </div>
                </div>
                <MiniBar value={m.pct} max={100} color={m.isGood?'#10b981':'#f59e0b'} height={4}/>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Related Ads */}
      {relatedAds.length>0&&(
        <Panel>
          <PanelHeader title={`Related Ads (${relatedAds.length})`} subtitle="Ads running under this campaign" icon={<Layers style={{width:14,height:14}}/>} iconColor="#8b5cf6"/>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:10}}>
            {relatedAds.slice(0,6).map((ad,i)=>(
              <div key={ad.id} style={{padding:'12px 14px',borderRadius:11,border:'1px solid rgba(255,255,255,.07)',background:'rgba(255,255,255,.02)',animation:`fb-up .3s ease ${i*.05}s both`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <span style={{fontSize:11,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:130}}>{ad.name.replace('Shop-Intel - ','')}</span>
                  <CreativeBadge type={ad.creativeType}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
                  {[{l:'Spend',v:fmtRM(ad.spend)},{l:'CTR',v:`${ad.ctr}%`},{l:'Reach',v:fmt(ad.reach)}].map((m,mi)=>(
                    <div key={mi} style={{textAlign:'center',padding:'4px',borderRadius:6,background:'rgba(255,255,255,.03)'}}>
                      <div style={{fontSize:8,color:'rgba(255,255,255,.3)',textTransform:'uppercase',marginBottom:2}}>{m.l}</div>
                      <div style={{fontSize:11,fontWeight:800,color:'rgba(255,255,255,.7)'}}>{m.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AD DETAIL PANEL
// ─────────────────────────────────────────────────────────────────────────────
const AdDetail:React.FC<{ad:any;onBack:()=>void}>=({ad:a,onBack})=>{
  const parentCampaign=fbCampaigns.find(c=>c.name===a.campaignName);
  const creativeColor=CREATIVE_C[a.creativeType]||'rgba(255,255,255,.3)';

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16,animation:'fb-up .35s ease both'}}>
      <button onClick={onBack} style={{display:'inline-flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:8,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:'rgba(255,255,255,.6)',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit',alignSelf:'flex-start'}}><ArrowLeft style={{width:12,height:12}}/>Back to Ads</button>

      {/* Hero */}
      <div style={{borderRadius:14,border:`1px solid ${creativeColor}22`,background:`linear-gradient(135deg, ${creativeColor}08, rgba(255,255,255,.02))`,padding:'24px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-30%',right:'-10%',width:180,height:180,borderRadius:'50%',background:`radial-gradient(circle,${creativeColor}12,transparent 70%)`,pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,flexWrap:'wrap',gap:12}}>
            <div>
              <div style={{fontSize:20,fontWeight:900,letterSpacing:'-0.4px',marginBottom:6}}>{a.name}</div>
              <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}><CreativeBadge type={a.creativeType}/><StatusBadge status={a.status}/></div>
              <div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginTop:6}}>Campaign: <span style={{color:'rgba(255,255,255,.6)',fontWeight:700}}>{a.campaignName.replace('Shop-Intel - ','')}</span></div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:28,fontWeight:900,color:creativeColor,letterSpacing:'-0.5px'}}>{fmtRM(a.spend)}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginTop:2}}>Ad Spend</div>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(100px,1fr))',gap:10}}>
            {[
              {label:'Reach',value:fmt(a.reach),accent:'#10b981'},
              {label:'Impressions',value:fmt(a.impressions),accent:'#8b5cf6'},
              {label:'Clicks',value:fmt(a.clicks),accent:'#f59e0b'},
              {label:'CTR',value:`${a.ctr}%`,accent:a.ctr>=2?'#10b981':'#f59e0b'},
              {label:'CPC',value:fmtFull(a.cpc),accent:'#06b6d4'},
              {label:'CPM',value:fmtFull(a.cpm),accent:'#ec4899'},
            ].map((m,i)=>(
              <div key={i} style={{padding:'12px',borderRadius:10,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',textAlign:'center'}}>
                <div style={{fontSize:8,fontWeight:800,color:m.accent,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6}}>{m.label}</div>
                <div style={{fontSize:18,fontWeight:900,color:m.accent}}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Parent campaign info */}
      {parentCampaign&&(
        <Panel>
          <PanelHeader title="Parent Campaign" subtitle={parentCampaign.name} icon={<Target style={{width:14,height:14}}/>} iconColor="var(--preset-primary)"/>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:8}}>
            {[{l:'Campaign Spend',v:fmtRM(parentCampaign.spend)},{l:'Campaign Reach',v:fmt(parentCampaign.reach)},{l:'Score',v:parentCampaign.performanceScore},{l:'Status',v:parentCampaign.status}].map((m,i)=>(
              <div key={i} style={{padding:'10px 12px',borderRadius:9,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)'}}>
                <div style={{fontSize:8,color:'rgba(255,255,255,.3)',fontWeight:700,textTransform:'uppercase',marginBottom:3}}>{m.l}</div>
                <div style={{fontSize:14,fontWeight:800,color:'rgba(255,255,255,.7)'}}>{m.v}</div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Ad efficiency comparison vs campaign avg */}
      <Panel>
        <PanelHeader title="Ad vs Campaign Average" subtitle="How this ad compares to its parent" icon={<BarChart3 style={{width:14,height:14}}/>} iconColor="#f59e0b"/>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {parentCampaign&&[
            {label:'CTR',adVal:a.ctr,campVal:parentCampaign.ctr,unit:'%'},
            {label:'CPC',adVal:a.cpc,campVal:parentCampaign.cpc,unit:'RM',lower:true},
            {label:'CPM',adVal:a.cpm,campVal:parentCampaign.cpm,unit:'RM',lower:true},
          ].map((m,i)=>{
            const better=m.lower?(a as any)[m.label.toLowerCase()]<(parentCampaign as any)[m.label.toLowerCase()]:(a as any)[m.label.toLowerCase()]>(parentCampaign as any)[m.label.toLowerCase()];
            return (
              <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',borderRadius:9,background:better?'rgba(16,185,129,.04)':'rgba(245,158,11,.04)',border:`1px solid ${better?'rgba(16,185,129,.12)':'rgba(245,158,11,.12)'}`}}>
                <span style={{fontSize:11,fontWeight:700}}>{m.label}</span>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{textAlign:'right'}}><div style={{fontSize:8,color:'rgba(255,255,255,.3)'}}>This Ad</div><div style={{fontSize:13,fontWeight:900,color:better?'#10b981':'#f59e0b'}}>{m.unit==='RM'?fmtFull(m.adVal):`${m.adVal}${m.unit}`}</div></div>
                  <div style={{width:1,height:24,background:'rgba(255,255,255,.08)'}}/>
                  <div style={{textAlign:'right'}}><div style={{fontSize:8,color:'rgba(255,255,255,.3)'}}>Campaign</div><div style={{fontSize:13,fontWeight:800,color:'rgba(255,255,255,.5)'}}>{m.unit==='RM'?fmtFull(m.campVal):`${m.campVal}${m.unit}`}</div></div>
                  {better?<ArrowUp style={{width:12,height:12,color:'#10b981'}}/>:<ArrowDown style={{width:12,height:12,color:'#f59e0b'}}/>}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PERF CHART
// ─────────────────────────────────────────────────────────────────────────────
const PerfChart:React.FC=()=>{
  const[chartMode,setChartMode]=useState<ChartMode>('area');
  const ax={tick:{fontSize:9,fill:'rgba(255,255,255,.25)'},tickLine:false,axisLine:false};
  const gd={strokeDasharray:"2 2",stroke:"rgba(255,255,255,.04)",vertical:false};
  const cm={data:perfData,margin:{top:5,right:5,left:-20,bottom:0}};
  const render=()=>{
    if(chartMode==='bar')return<BarChart {...cm}><CartesianGrid {...gd as any}/><XAxis dataKey="date" {...ax}/><YAxis {...ax} tickFormatter={fmt}/><Tooltip content={<ChartTip/>} cursor={{fill:'rgba(255,255,255,.03)'}}/><Bar dataKey="spend" name="Spend" radius={[4,4,0,0]} maxBarSize={24}>{perfData.map((_,i)=><Cell key={i} fill={i===perfData.length-1?'var(--preset-primary)':`rgba(var(--preset-primary-rgb),${.3+(i/perfData.length)*.5})`}/>)}</Bar></BarChart>;
    if(chartMode==='line')return<LineChart {...cm}><CartesianGrid {...gd as any}/><XAxis dataKey="date" {...ax}/><YAxis {...ax} tickFormatter={fmt}/><Tooltip content={<ChartTip/>}/><Line type="monotone" dataKey="spend" name="Spend" stroke="var(--preset-primary)" strokeWidth={2.5} dot={{r:3,fill:'var(--preset-primary)',strokeWidth:0}}/><Line type="monotone" dataKey="reach" name="Reach" stroke="#10b981" strokeWidth={2} dot={{r:2,fill:'#10b981',strokeWidth:0}}/></LineChart>;
    return<AreaChart {...cm}><defs><linearGradient id="fbSG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--preset-primary)" stopOpacity={.25}/><stop offset="100%" stopColor="var(--preset-primary)" stopOpacity={0}/></linearGradient><linearGradient id="fbRG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={.2}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><CartesianGrid {...gd as any}/><XAxis dataKey="date" {...ax}/><YAxis {...ax} tickFormatter={fmt}/><Tooltip content={<ChartTip/>}/><Area type="monotone" dataKey="spend" name="Spend" stroke="var(--preset-primary)" strokeWidth={2} fill="url(#fbSG)" dot={false}/><Area type="monotone" dataKey="reach" name="Reach" stroke="#10b981" strokeWidth={2} fill="url(#fbRG)" dot={false}/></AreaChart>;
  };
  return<Panel style={{height:'100%',display:'flex',flexDirection:'column'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12,flexWrap:'wrap',gap:8}}><div><div style={{fontSize:13,fontWeight:800}}>Campaign Performance</div><div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginTop:3}}>Spend & reach over time</div></div><div style={{display:'flex',gap:4}}><ChartModeBtn mode="area" current={chartMode} label="Area" icon={<TrendingUp style={{width:10,height:10}}/>} onClick={()=>setChartMode('area')}/><ChartModeBtn mode="line" current={chartMode} label="Line" icon={<Activity style={{width:10,height:10}}/>} onClick={()=>setChartMode('line')}/><ChartModeBtn mode="bar" current={chartMode} label="Bar" icon={<BarChart3 style={{width:10,height:10}}/>} onClick={()=>setChartMode('bar')}/></div></div><div style={{flex:1,minHeight:0}}><ResponsiveContainer width="100%" height="100%">{render()}</ResponsiveContainer></div><div style={{display:'flex',justifyContent:'center',gap:16,marginTop:8}}>{[{l:'Spend',c:'var(--preset-primary)'},{l:'Reach',c:'#10b981'}].map((x,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:5,fontSize:10}}><span style={{width:8,height:3,borderRadius:2,background:x.c}}/><span style={{color:'rgba(255,255,255,.45)'}}>{x.l}</span></div>))}</div></Panel>;
};


// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function FacebookMarketingDashboard(){
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const[mainTab,setMainTab]=useState<MainTab>('overview');
  const[searchTerm,setSearchTerm]=useState('');
  const[selectedAccount,setSelectedAccount]=useState('all');
  const[selectedMetric,setSelectedMetric]=useState('REACH');
  const[timeframe,setTimeframe]=useState<Timeframe>('daily');
  const[dateRange,setDateRange]=useState<DateRange>(()=>{const n=new Date();return{from:startOfMonth(n),to:endOfMonth(n)};});
  const[sortField,setSortField]=useState<SortField>('spend');
  const[sortDir,setSortDir]=useState<'asc'|'desc'>('desc');
  const[selectedCampaign,setSelectedCampaign]=useState<any>(null);
  const[selectedAd,setSelectedAd]=useState<any>(null);
  const perPage=20;

  // Infinite scroll state (replaces campaignPage/adPage pagination)
  const [visibleCampaignCount, setVisibleCampaignCount] = useState(perPage);
  const [visibleAdsCount, setVisibleAdsCount] = useState(perPage);
  const [loadingCampaignMore, setLoadingCampaignMore] = useState(false);
  const [loadingAdsMore, setLoadingAdsMore] = useState(false);

  const sentinelCampaignRef = useRef<HTMLDivElement | null>(null);
  const sentinelAdsRef = useRef<HTMLDivElement | null>(null);
  const loadCampaignLockRef = useRef(false);
  const loadAdsLockRef = useRef(false);
  const sortedLenRef = useRef(0);
  const adsLenRef = useRef(0);
  const visibleCampaignRef = useRef(perPage);
  const visibleAdsRef = useRef(perPage);

  const filtered=useMemo(()=>fbCampaigns.filter(c=>c.name.toLowerCase().includes(searchTerm.toLowerCase())||c.accountName.toLowerCase().includes(searchTerm.toLowerCase())),[searchTerm]);
  const filteredAds=useMemo(()=>fbAds.filter(a=>a.name.toLowerCase().includes(searchTerm.toLowerCase())||a.campaignName.toLowerCase().includes(searchTerm.toLowerCase())),[searchTerm]);
  const sorted=useMemo(()=>[...filtered].sort((a,b)=>{const d=sortDir==='asc'?1:-1;return((a as any)[sortField]-(b as any)[sortField])*d;}),[filtered,sortField,sortDir]);

  sortedLenRef.current = sorted.length;
  adsLenRef.current = filteredAds.length;
  visibleCampaignRef.current = visibleCampaignCount;
  visibleAdsRef.current = visibleAdsCount;

  const paged=sorted.slice(0,visibleCampaignCount);
  const pagedAds=filteredAds.slice(0,visibleAdsCount);
  const hasMoreCampaigns = visibleCampaignCount < sorted.length;
  const hasMoreAds = visibleAdsCount < filteredAds.length;

  const doSort=(f:SortField)=>{if(sortField===f)setSortDir(d=>d==='asc'?'desc':'asc');else{setSortField(f);setSortDir('desc');}};
  const SortIco=({f}:{f:SortField})=>sortField!==f?<ArrowUpDown style={{width:10,height:10,opacity:.3}}/>:sortDir==='asc'?<ArrowUp style={{width:10,height:10}}/>:<ArrowDown style={{width:10,height:10}}/>;

  // Reset visible counts when list ordering/search changes.
  useEffect(()=>{setVisibleCampaignCount(perPage); visibleCampaignRef.current = perPage;},[sorted]);
  useEffect(()=>{setVisibleAdsCount(perPage); visibleAdsRef.current = perPage;},[filteredAds]);

  const handleLoadMoreCampaigns = useCallback(()=>{
    if(loadCampaignLockRef.current) return;
    if(visibleCampaignRef.current >= sortedLenRef.current) return;
    loadCampaignLockRef.current = true;
    setLoadingCampaignMore(true);
    window.setTimeout(()=>{
      setVisibleCampaignCount((prev)=>Math.min(prev + perPage, sortedLenRef.current));
      setLoadingCampaignMore(false);
      loadCampaignLockRef.current = false;
    },650);
  },[perPage]);

  const handleLoadMoreAds = useCallback(()=>{
    if(loadAdsLockRef.current) return;
    if(visibleAdsRef.current >= adsLenRef.current) return;
    loadAdsLockRef.current = true;
    setLoadingAdsMore(true);
    window.setTimeout(()=>{
      setVisibleAdsCount((prev)=>Math.min(prev + perPage, adsLenRef.current));
      setLoadingAdsMore(false);
      loadAdsLockRef.current = false;
    },650);
  },[perPage]);

  // Infinite scroll observers (like Intelligence Top Performing Videos)
  useEffect(()=>{
    if(mainTab !== 'campaigns') return;
    const el = sentinelCampaignRef.current;
    if(!el || loadingCampaignMore || !hasMoreCampaigns) return;
    const observer = new IntersectionObserver((entries)=>{
      const entry = entries[0];
      if(entry?.isIntersecting && !loadCampaignLockRef.current) handleLoadMoreCampaigns();
    }, { root: null, rootMargin: '200px', threshold: 0 });
    observer.observe(el);
    return ()=>observer.disconnect();
  },[mainTab,hasMoreCampaigns,loadingCampaignMore,handleLoadMoreCampaigns]);

  useEffect(()=>{
    if(mainTab !== 'ads') return;
    const el = sentinelAdsRef.current;
    if(!el || loadingAdsMore || !hasMoreAds) return;
    const observer = new IntersectionObserver((entries)=>{
      const entry = entries[0];
      if(entry?.isIntersecting && !loadAdsLockRef.current) handleLoadMoreAds();
    }, { root: null, rootMargin: '200px', threshold: 0 });
    observer.observe(el);
    return ()=>observer.disconnect();
  },[mainTab,hasMoreAds,loadingAdsMore,handleLoadMoreAds]);

  const topCampaigns=useMemo(()=>[...fbCampaigns].sort((a,b)=>{const k=selectedMetric.toLowerCase();return(b as any)[k]-(a as any)[k];}).slice(0,6),[selectedMetric]);
  const metrics=useMemo(()=>({totalSpend:fbCampaigns.reduce((s,c)=>s+c.spend,0),totalReach:fbCampaigns.reduce((s,c)=>s+c.reach,0),totalImp:fbCampaigns.reduce((s,c)=>s+c.impressions,0),totalClicks:fbCampaigns.reduce((s,c)=>s+c.clicks,0),avgCTR:fbCampaigns.reduce((s,c)=>s+c.ctr,0)/fbCampaigns.length,active:fbCampaigns.filter(c=>c.status==='Active').length,excellent:fbCampaigns.filter(c=>c.performanceScore==='Excellent').length}),[]);
  const scoreDist=useMemo(()=>['Excellent','Good','Average','Needs Work'].map(s=>({name:s,value:fbCampaigns.filter(c=>c.performanceScore===s).length,fill:SCORE_C[s]})),[]);
  const creativeDist=useMemo(()=>['Video','Image','Carousel','Collection'].map(s=>({name:s,value:fbAds.filter(a=>a.creativeType===s).length,fill:CREATIVE_C[s]})),[]);
  const scatterData=useMemo(()=>fbCampaigns.map(c=>({x:c.spend,y:c.ctr,z:c.reach/1e3,name:c.name.replace('Shop-Intel - ',''),score:c.performanceScore})),[]);

  const TABS:{key:MainTab;label:string;icon:React.ReactNode}[]=[{key:'overview',label:'Overview',icon:<Layout style={{width:12,height:12}}/>},{key:'campaigns',label:'Campaigns',icon:<BarChart3 style={{width:12,height:12}}/>},{key:'ads',label:'Ads',icon:<Target style={{width:12,height:12}}/>},{key:'insights',label:'Insights',icon:<Sparkles style={{width:12,height:12}}/>}];

  const gs=`@keyframes fb-pulse{0%,100%{transform:scale(1);opacity:.4}50%{transform:scale(2.4);opacity:0}}@keyframes fb-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes fb-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes fb-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
  .facebook-theme.light-mode{background:#f8fafc;color:#111827;}
  .facebook-theme.light-mode [style*="rgba(255,255,255"], .facebook-theme.light-mode [style*="rgba(255, 255, 255"]{
    color:rgba(17,24,39,.86)!important;border-color:rgba(var(--preset-primary-rgb),.16)!important;
  }
  .facebook-theme.light-mode .chart-tip{
    background:rgba(255,255,255,.98)!important;border:1px solid rgba(var(--preset-primary-rgb),.2)!important;box-shadow:0 8px 24px rgba(15,23,42,.12)!important;
  }
  .facebook-theme.light-mode .recharts-cartesian-grid line{stroke:rgba(148,163,184,.24)!important;}
  .facebook-theme.light-mode .recharts-text,.facebook-theme.light-mode .recharts-legend-item-text,.facebook-theme.light-mode svg text,.facebook-theme.light-mode svg tspan{fill:rgba(30,41,59,.82)!important;}
  `;

  // If viewing campaign detail
  if(selectedCampaign) return(<><style>{gs}</style><div className={`facebook-theme ${isLight ? 'light-mode' : ''} h-full overflow-y-auto -mt-4 sm:-mt-6 lg:-mt-8`} style={{color:isLight?'#111827':'rgba(255,255,255,.88)',fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif"}}><div style={{display:'flex',flexDirection:'column',gap:18,padding:'16px 24px',background:isLight?'#ffffff':'transparent'}}><CampaignDetail campaign={selectedCampaign} onBack={()=>setSelectedCampaign(null)}/></div></div></>);
  if(selectedAd) return(<><style>{gs}</style><div className={`facebook-theme ${isLight ? 'light-mode' : ''} h-full overflow-y-auto -mt-4 sm:-mt-6 lg:-mt-8`} style={{color:isLight?'#111827':'rgba(255,255,255,.88)',fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif"}}><div style={{display:'flex',flexDirection:'column',gap:18,padding:'16px 24px',background:isLight?'#ffffff':'transparent'}}><AdDetail ad={selectedAd} onBack={()=>setSelectedAd(null)}/></div></div></>);

  // Pagination removed: campaigns & ads now lazy-load via IntersectionObserver

  return(
    <><style>{gs}</style>
    <div className={`facebook-theme ${isLight ? 'light-mode' : ''} h-full overflow-y-auto -mt-4 sm:-mt-6 lg:-mt-8`} style={{color:isLight?'#111827':'rgba(255,255,255,.88)',fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif"}}>
      <div style={{display:'flex',flexDirection:'column',gap:18,padding:'16px 24px',background:isLight?'#ffffff':'transparent'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:5}}>
              <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 20px rgba(59,130,246,.35)',flexShrink:0}}><Globe style={{width:18,height:18,color:'#fff'}}/></div>
              <div><h2 style={{margin:0,fontSize:22,fontWeight:800,letterSpacing:'-0.5px',lineHeight:1.15}}>Facebook Marketing</h2><div style={{display:'flex',alignItems:'center',gap:7,marginTop:3}}><PulseDot size={6} color="#3b82f6"/><span style={{fontSize:10,color:'rgba(255,255,255,.4)',fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase'}}>Campaign Manager</span><span style={{fontSize:10,color:'rgba(255,255,255,.25)'}}>·</span><span style={{fontSize:10,color:'rgba(255,255,255,.3)'}}>{fbCampaigns.length} campaigns · {fbAds.length} ads</span></div></div>
            </div>
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
            <DateRangePickerPro value={dateRange} onChange={setDateRange} placeholder="Pick range" label="" timeframe={timeframe} onTimeframeChange={setTimeframe} className="min-w-[240px]"/>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}><SelectTrigger style={{width:160,height:33,fontSize:12,fontWeight:700,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:'rgba(255,255,255,.8)',borderRadius:9}}><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Accounts</SelectItem><SelectItem value="main">Shop-Intel Main</SelectItem><SelectItem value="secondary">Shop-Intel Secondary</SelectItem><SelectItem value="premium">Shop-Intel Premium</SelectItem></SelectContent></Select>
            <button style={{display:'inline-flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:9,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:'rgba(255,255,255,.6)',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit',height:33}}><Download style={{width:11,height:11}}/>Export</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:2,borderBottom:'1px solid rgba(255,255,255,.07)'}}>
          {TABS.map(t=><button key={t.key} onClick={()=>{setMainTab(t.key);setSelectedCampaign(null);setSelectedAd(null);}} style={{display:'inline-flex',alignItems:'center',gap:5,padding:'7px 16px',borderRadius:'9px 9px 0 0',fontSize:11,fontWeight:700,cursor:'pointer',border:'1px solid transparent',fontFamily:'inherit',transition:'all .15s',whiteSpace:'nowrap',...(mainTab===t.key?{background:'linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))',color:'#fff',boxShadow:'0 4px 14px rgba(var(--preset-primary-rgb),.28)'}:{background:'transparent',color:'rgba(255,255,255,.38)'})}}>{t.icon}{t.label}</button>)}
        </div>

        {/* Search (campaigns & ads) */}
        {(mainTab==='campaigns'||mainTab==='ads')&&<div style={{position:'relative',maxWidth:300}}><Search style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',width:13,height:13,color:'rgba(255,255,255,.25)'}}/><input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search..." style={{width:'100%',height:32,paddingLeft:30,paddingRight:10,fontSize:11,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:8,color:'rgba(255,255,255,.8)',outline:'none',fontFamily:'inherit'}}/></div>}

        {/* ═══ OVERVIEW ═══ */}
        {mainTab==='overview'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10}}>
            {[{label:'Total Spend',value:metrics.totalSpend,fmtFn:fmtRM,icon:<DollarSign style={{width:14,height:14}}/>,accent:'#3b82f6',delay:'0s'},{label:'Total Reach',value:metrics.totalReach,fmtFn:fmt,icon:<Users style={{width:14,height:14}}/>,accent:'#10b981',delay:'.06s'},{label:'Total Impressions',value:metrics.totalImp,fmtFn:fmt,icon:<Eye style={{width:14,height:14}}/>,accent:'#8b5cf6',delay:'.12s'},{label:'Total Clicks',value:metrics.totalClicks,fmtFn:fmt,icon:<MousePointer style={{width:14,height:14}}/>,accent:'#f59e0b',delay:'.18s'},{label:'Avg CTR',value:metrics.avgCTR,fmtFn:(v:number)=>`${v.toFixed(2)}%`,icon:<Percent style={{width:14,height:14}}/>,accent:'#ec4899',delay:'.24s'},{label:'Active',value:metrics.active,fmtFn:(v:number)=>v.toString(),icon:<Activity style={{width:14,height:14}}/>,accent:'#06b6d4',delay:'.30s'}].map((k,i)=>(
              <div key={i} style={{borderRadius:13,border:'1px solid rgba(255,255,255,.07)',background:'rgba(255,255,255,.03)',padding:'11px 13px',position:'relative',overflow:'hidden',animation:`fb-up .45s ease ${k.delay} both`}}>
                <div style={{position:'absolute',top:'-40%',right:'-15%',width:100,height:100,borderRadius:'50%',background:`radial-gradient(circle,${k.accent}18,transparent 70%)`,pointerEvents:'none'}}/>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:8}}><div style={{width:26,height:26,borderRadius:7,background:`${k.accent}18`,display:'flex',alignItems:'center',justifyContent:'center',color:k.accent,flexShrink:0}}>{k.icon}</div><PulseDot size={4} color={k.accent}/></div>
                <div style={{fontSize:20,fontWeight:800,letterSpacing:'-0.4px',lineHeight:1.1,color:'rgba(255,255,255,.92)',marginBottom:3}}><AnimNum value={k.value} format={k.fmtFn}/></div>
                <div style={{fontSize:9,color:'rgba(255,255,255,.38)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em'}}>{k.label}</div>
              </div>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:12,minHeight:300}}>
            <PerfChart/>
            <Panel>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><div style={{display:'flex',alignItems:'center',gap:8}}><Award style={{width:14,height:14,color:'#f59e0b'}}/><span style={{fontSize:13,fontWeight:800}}>Top Performers</span></div>
                <select value={selectedMetric} onChange={e=>setSelectedMetric(e.target.value)} style={{height:26,padding:'0 8px',borderRadius:6,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:'rgba(255,255,255,.7)',fontSize:10,fontFamily:'inherit'}}>{['REACH','IMPRESSIONS','SPEND','CLICKS'].map(m=><option key={m} value={m}>{m}</option>)}</select>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {topCampaigns.map((c,i)=>{const val=(c as any)[selectedMetric.toLowerCase()];const mx=(topCampaigns[0] as any)[selectedMetric.toLowerCase()];return(
                  <div key={c.id} onClick={()=>setSelectedCampaign(c)} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:9,background:i===0?'rgba(245,158,11,.06)':'rgba(255,255,255,.02)',border:`1px solid ${i===0?'rgba(245,158,11,.15)':'rgba(255,255,255,.06)'}`,cursor:'pointer',transition:'background .15s',animation:`fb-up .4s ease ${i*.05}s both`}}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(var(--preset-primary-rgb),.06)'} onMouseLeave={e=>e.currentTarget.style.background=i===0?'rgba(245,158,11,.06)':'rgba(255,255,255,.02)'}>
                    <span style={{width:22,height:22,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:900,flexShrink:0,...(i===0?{background:'linear-gradient(135deg,#f59e0b,#ef4444)',color:'#fff'}:i<3?{background:'rgba(var(--preset-primary-rgb),.1)',color:'var(--preset-primary)'}:{background:'rgba(255,255,255,.05)',color:'rgba(255,255,255,.3)'})}}>{i===0?<Crown style={{width:10,height:10}}/>:i+1}</span>
                    <div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name.replace('Shop-Intel - ','')}</div><MiniBar value={val} max={mx} color={i===0?'#f59e0b':'var(--preset-primary)'} height={3}/></div>
                    <div style={{textAlign:'right',flexShrink:0}}><div style={{fontSize:12,fontWeight:900,color:i===0?'#f59e0b':'rgba(255,255,255,.7)'}}>{selectedMetric==='SPEND'?fmtRM(val):fmt(val)}</div><ScoreBadge score={c.performanceScore}/></div>
                  </div>);
                })}
              </div>
            </Panel>
          </div>
        </div>}

        {/* ═══ CAMPAIGNS ═══ */}
        {mainTab==='campaigns'&&<div style={{borderRadius:14,border:'1px solid rgba(255,255,255,.07)',background:'rgba(255,255,255,.025)',overflow:'hidden'}}>
          <div style={{padding:'13px 17px',borderBottom:'1px solid rgba(255,255,255,.07)',display:'flex',alignItems:'center',justifyContent:'space-between'}}><div style={{fontSize:13,fontWeight:800}}>All Campaigns ({sorted.length})</div><div style={{fontSize:10,color:'rgba(255,255,255,.35)'}}>Click any row to view details</div></div>
          <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
            <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,.07)'}}>
              {[{l:'#',f:null,w:36},{l:'Campaign',f:null,w:200},{l:'Score',f:null,w:80},{l:'Status',f:null,w:80},{l:'Spend',f:'spend' as SortField,w:90},{l:'Reach',f:'reach' as SortField,w:80},{l:'Imp.',f:'impressions' as SortField,w:80},{l:'Clicks',f:'clicks' as SortField,w:70},{l:'CTR',f:'ctr' as SortField,w:60},{l:'CPC',f:'cpc' as SortField,w:70}].map((col,ci)=>(
                <th key={ci} style={{padding:'9px 11px',textAlign:ci>3?'right':'left',minWidth:col.w}}>
                  {col.f?<button onClick={()=>doSort(col.f!)} style={{background:'none',border:'none',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:3,fontSize:10,fontWeight:800,color:sortField===col.f?'rgba(255,255,255,.85)':'rgba(255,255,255,.35)',fontFamily:'inherit',letterSpacing:'.05em',textTransform:'uppercase',padding:0}}>{col.l}<SortIco f={col.f}/></button>
                  :<span style={{fontSize:10,fontWeight:800,color:'rgba(255,255,255,.35)',letterSpacing:'.05em',textTransform:'uppercase'}}>{col.l}</span>}
                </th>))}
            </tr></thead>
            <tbody>{paged.map((c,idx)=>(
              <tr key={c.id} onClick={()=>setSelectedCampaign(c)} style={{borderBottom:'1px solid rgba(255,255,255,.06)',cursor:'pointer',transition:'background .15s'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(var(--preset-primary-rgb),.04)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'10px 11px',fontSize:11,fontWeight:700,color:'rgba(255,255,255,.25)'}}>{idx+1}</td>
                <td style={{padding:'10px 11px'}}><div style={{fontSize:12,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:180}}>{c.name}</div><div style={{fontSize:10,color:'rgba(255,255,255,.3)',marginTop:1}}>{c.accountName}</div></td>
                <td style={{padding:'10px 11px'}}><ScoreBadge score={c.performanceScore}/></td>
                <td style={{padding:'10px 11px'}}><StatusBadge status={c.status}/></td>
                <td style={{padding:'10px 11px',textAlign:'right',fontWeight:700,color:'rgba(255,255,255,.7)'}}>{fmtRM(c.spend)}</td>
                <td style={{padding:'10px 11px',textAlign:'right',color:'rgba(255,255,255,.6)'}}>{fmt(c.reach)}</td>
                <td style={{padding:'10px 11px',textAlign:'right',color:'rgba(255,255,255,.6)'}}>{fmt(c.impressions)}</td>
                <td style={{padding:'10px 11px',textAlign:'right',color:'rgba(255,255,255,.6)'}}>{fmt(c.clicks)}</td>
                <td style={{padding:'10px 11px',textAlign:'right',fontWeight:700,color:c.ctr>=2?'#10b981':c.ctr>=1.5?'#f59e0b':'rgba(255,255,255,.5)'}}>{c.ctr}%</td>
                <td style={{padding:'10px 11px',textAlign:'right',color:'rgba(255,255,255,.5)'}}>{fmtFull(c.cpc)}</td>
              </tr>
            ))}</tbody>
          </table></div>
          {(hasMoreCampaigns || loadingCampaignMore) && sorted.length > perPage && (
            <div
              ref={sentinelCampaignRef}
              aria-hidden
              style={{ minHeight: loadingCampaignMore ? 8 : 24, borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {loadingCampaignMore ? <TopVideosLoadMoreMascots text="Fetching campaigns" /> : null}
            </div>
          )}
        </div>}

        {/* ═══ ADS ═══ */}
        {mainTab==='ads'&&<div style={{borderRadius:14,border:'1px solid rgba(255,255,255,.07)',background:'rgba(255,255,255,.025)',overflow:'hidden'}}>
          <div style={{padding:'13px 17px',borderBottom:'1px solid rgba(255,255,255,.07)',display:'flex',alignItems:'center',justifyContent:'space-between'}}><div style={{fontSize:13,fontWeight:800}}>All Ads ({filteredAds.length})</div><div style={{fontSize:10,color:'rgba(255,255,255,.35)'}}>Click any row to view details</div></div>
          <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
            <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,.07)'}}>
              {['#','Ad Name','Campaign','Creative','Spend','Reach','CTR','CPC','Status'].map((h,i)=>(
                <th key={i} style={{padding:'9px 11px',textAlign:i>=4?'right':'left',fontSize:10,fontWeight:800,color:'rgba(255,255,255,.35)',letterSpacing:'.05em',textTransform:'uppercase'}}>{h}</th>))}
            </tr></thead>
            <tbody>{pagedAds.map((a,idx)=>(
              <tr key={a.id} onClick={()=>setSelectedAd(a)} style={{borderBottom:'1px solid rgba(255,255,255,.06)',cursor:'pointer',transition:'background .15s'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(var(--preset-primary-rgb),.04)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'10px 11px',fontSize:11,fontWeight:700,color:'rgba(255,255,255,.25)'}}>{idx+1}</td>
                <td style={{padding:'10px 11px',fontSize:12,fontWeight:700,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.name}</td>
                <td style={{padding:'10px 11px',fontSize:10,color:'rgba(255,255,255,.4)',maxWidth:130,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.campaignName.replace('Shop-Intel - ','')}</td>
                <td style={{padding:'10px 11px'}}><CreativeBadge type={a.creativeType}/></td>
                <td style={{padding:'10px 11px',textAlign:'right',fontWeight:700,color:'rgba(255,255,255,.7)'}}>{fmtRM(a.spend)}</td>
                <td style={{padding:'10px 11px',textAlign:'right',color:'rgba(255,255,255,.6)'}}>{fmt(a.reach)}</td>
                <td style={{padding:'10px 11px',textAlign:'right',fontWeight:700,color:a.ctr>=2?'#10b981':a.ctr>=1.5?'#f59e0b':'rgba(255,255,255,.5)'}}>{a.ctr}%</td>
                <td style={{padding:'10px 11px',textAlign:'right',color:'rgba(255,255,255,.5)'}}>{fmtFull(a.cpc)}</td>
                <td style={{padding:'10px 11px'}}><StatusBadge status={a.status}/></td>
              </tr>
            ))}</tbody>
          </table></div>
          {(hasMoreAds || loadingAdsMore) && filteredAds.length > perPage && (
            <div
              ref={sentinelAdsRef}
              aria-hidden
              style={{ minHeight: loadingAdsMore ? 8 : 24, borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {loadingAdsMore ? <TopVideosLoadMoreMascots text="Fetching ads" /> : null}
            </div>
          )}
        </div>}

        {/* ═══ INSIGHTS ═══ */}
        {mainTab==='insights'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {[{title:'Performance Scores',data:scoreDist,icon:<Award style={{width:14,height:14}}/>},{title:'Ad Creative Types',data:creativeDist,icon:<Layers style={{width:14,height:14}}/>}].map((ch,ci)=>(
              <Panel key={ci}><PanelHeader title={ch.title} icon={ch.icon} iconColor={COLORS[ci]}/>
                <div style={{display:'flex',alignItems:'center',gap:16}}>
                  <div style={{width:90,height:90,flexShrink:0}}><ResponsiveContainer width="100%" height="100%"><RePieChart><Pie data={ch.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={38} innerRadius={22} strokeWidth={0} paddingAngle={2}>{ch.data.map((d:any,i:number)=><Cell key={i} fill={d.fill}/>)}</Pie></RePieChart></ResponsiveContainer></div>
                  <div style={{flex:1,display:'flex',flexDirection:'column',gap:4}}>{ch.data.map((d:any,i:number)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:7,height:7,borderRadius:'50%',background:d.fill,flexShrink:0}}/><span style={{fontSize:10,color:'rgba(255,255,255,.5)',flex:1}}>{d.name}</span><span style={{fontSize:11,fontWeight:800,color:'rgba(255,255,255,.7)'}}>{d.value}</span></div>))}</div>
                </div>
              </Panel>
            ))}
          </div>
          <Panel>
            <PanelHeader title="Spend vs CTR Efficiency" subtitle="Bubble = reach · Color = score" icon={<Target style={{width:14,height:14}}/>} iconColor="#10b981"/>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart margin={{top:5,right:5,left:-15,bottom:0}}>
                <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,.04)"/>
                <XAxis dataKey="x" name="Spend" tick={{fontSize:9,fill:'rgba(255,255,255,.25)'}} tickLine={false} axisLine={false} tickFormatter={(v:number)=>`RM${fmt(v)}`}/>
                <YAxis dataKey="y" name="CTR" tick={{fontSize:9,fill:'rgba(255,255,255,.25)'}} tickLine={false} axisLine={false} tickFormatter={(v:number)=>`${v}%`}/>
                <ZAxis dataKey="z" range={[30,200]}/>
                <Tooltip content={<ChartTip/>} cursor={{strokeDasharray:'3 3',stroke:'rgba(255,255,255,.12)'}}/>
                <Scatter data={scatterData} name="Campaign">{scatterData.map((d,i)=><Cell key={i} fill={SCORE_C[d.score]||'rgba(var(--preset-primary-rgb),.5)'} fillOpacity={.8}/>)}</Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div style={{display:'flex',justifyContent:'center',gap:14,marginTop:8}}>{Object.entries(SCORE_C).map(([k,c])=>(<div key={k} style={{display:'flex',alignItems:'center',gap:5,fontSize:10}}><span style={{width:7,height:7,borderRadius:'50%',background:c}}/><span style={{color:'rgba(255,255,255,.4)'}}>{k}</span></div>))}</div>
          </Panel>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Panel><PanelHeader title="Key Findings" icon={<Sparkles style={{width:14,height:14}}/>} iconColor="#f59e0b"/>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {[{e:'🎯',t:`${metrics.excellent} campaigns rated "Excellent" — ${((metrics.excellent/fbCampaigns.length)*100).toFixed(0)}% of total.`},{e:'💰',t:`Average CPC is ${fmtFull(fbCampaigns.reduce((s,c)=>s+c.cpc,0)/fbCampaigns.length)}. Excellent campaigns average 25% lower CPC.`},{e:'📈',t:'Top CTR performers correlate with higher spend. Consider scaling top 20%.'},{e:'⚠️',t:`${fbCampaigns.filter(c=>c.performanceScore==='Needs Work').length} campaigns need optimization — review targeting & creative.`}].map((item,i)=>(
                  <div key={i} style={{display:'flex',gap:10,padding:'10px 12px',borderRadius:9,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)'}}><span style={{fontSize:16,flexShrink:0}}>{item.e}</span><p style={{margin:0,fontSize:11,color:'rgba(255,255,255,.5)',lineHeight:1.6}}>{item.t}</p></div>
                ))}
              </div>
            </Panel>
            <Panel><PanelHeader title="Actions" icon={<Zap style={{width:14,height:14}}/>} iconColor="#ef4444"/>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {[{p:'HIGH',a:'Scale top 10 campaigns',d:'Increase budget 30% for Excellent-rated',c:'#ef4444'},{p:'HIGH',a:'Pause underperformers',d:`${fbCampaigns.filter(c=>c.performanceScore==='Needs Work'&&c.status==='Active').length} active campaigns need review`,c:'#ef4444'},{p:'MED',a:'A/B test creatives',d:'Video ads show higher CTR — test more',c:'#f59e0b'},{p:'LOW',a:'Consolidate accounts',d:'3 accounts may fragment budget',c:'#6366f1'}].map((item,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 12px',borderRadius:9,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)'}}>
                    <span style={{padding:'2px 6px',borderRadius:4,background:`${item.c}18`,border:`1px solid ${item.c}44`,fontSize:8,fontWeight:900,color:item.c,letterSpacing:'.05em',flexShrink:0,marginTop:1}}>{item.p}</span>
                    <div><div style={{fontSize:11,fontWeight:700,marginBottom:2}}>{item.a}</div><div style={{fontSize:10,color:'rgba(255,255,255,.35)',lineHeight:1.5}}>{item.d}</div></div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>}

      </div>
    </div></>
  );
}