"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from "recharts";
import {
  MapPin, Truck, Package, Building, Globe, Search, Download, MessageSquare,
  Clock, Navigation, Phone, Mail, Calendar, Users, Eye, Plus, Filter,
  TrendingUp, TrendingDown, Activity, Sparkles, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, Zap, Shield, Star, Box, Layers, BarChart3,
  CheckCircle, AlertTriangle, ArrowRight, ExternalLink, RefreshCw,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// DATA GENERATION (all original data preserved exactly)
// ─────────────────────────────────────────────────────────────────────────────
const generateNinjaVanLocations = () => {
  const locations: any[] = [];
  const types = ["Shop", "Kiosk", "Locker"];
  const partners = ["NinjaVan Malaysia", "NinjaVan Singapore", "NinjaVan Thailand", "NinjaVan Indonesia", "NinjaVan Philippines"];
  const services = [["Pack Creation","Post Creation"],["Pack Creation","Post Creation","Customer Returns"],["Pack Creation","Post Creation","Customer Returns","Express Delivery"],["Pack Creation","Post Creation","Customer Returns","Express Delivery","COD"],["Pack Creation","Post Creation","Customer Returns","Express Delivery","COD","Insurance"]];
  const acceptedSizes = [["Small","Medium"],["Small","Medium","Large"],["Small","Medium","Large","Extra Large"],["Small","Medium","Large","Extra Large","Oversized"]];
  const malaysianCities = [{name:"Kuala Lumpur",lat:3.1579,lng:101.7118},{name:"Petaling Jaya",lat:3.1073,lng:101.6083},{name:"Shah Alam",lat:3.0733,lng:101.5185},{name:"Subang Jaya",lat:3.0498,lng:101.5854},{name:"Klang",lat:3.0333,lng:101.45},{name:"Kajang",lat:2.9926,lng:101.7909},{name:"Ampang",lat:3.1412,lng:101.7003},{name:"Cheras",lat:3.0498,lng:101.5854},{name:"Kepong",lat:3.2105,lng:101.6401},{name:"Setapak",lat:3.2,lng:101.7},{name:"Gombak",lat:3.25,lng:101.65},{name:"Hulu Langat",lat:3,lng:101.8},{name:"Sepang",lat:2.7,lng:101.7},{name:"Kuala Selangor",lat:3.35,lng:101.25},{name:"Sabak Bernam",lat:3.8,lng:100.95},{name:"Johor Bahru",lat:1.4927,lng:103.7414},{name:"Kulai",lat:1.65,lng:103.6},{name:"Kota Tinggi",lat:1.7333,lng:103.9},{name:"Mersing",lat:2.4333,lng:103.8333},{name:"Segamat",lat:2.5,lng:102.8167},{name:"Batu Pahat",lat:1.85,lng:102.9333},{name:"Muar",lat:2.05,lng:102.5667},{name:"Pontian",lat:1.4833,lng:103.3833},{name:"Kluang",lat:2.0333,lng:103.3167},{name:"Tebrau",lat:1.6,lng:103.8},{name:"Pasir Gudang",lat:1.4667,lng:103.9},{name:"Skudai",lat:1.5333,lng:103.6667},{name:"Gelang Patah",lat:1.45,lng:103.6},{name:"Senai",lat:1.6,lng:103.65},{name:"Kuantan",lat:3.8077,lng:103.326},{name:"Temerloh",lat:3.45,lng:102.4167},{name:"Bentong",lat:3.5167,lng:101.9167},{name:"Raub",lat:3.8,lng:101.85},{name:"Jerantut",lat:3.9333,lng:102.3667},{name:"Ipoh",lat:4.5841,lng:101.0829},{name:"Taiping",lat:4.85,lng:100.7333},{name:"Teluk Intan",lat:4.0167,lng:101.0167},{name:"Kampar",lat:4.3,lng:101.15},{name:"George Town",lat:5.4164,lng:100.3327},{name:"Butterworth",lat:5.4,lng:100.3667},{name:"Bukit Mertajam",lat:5.3667,lng:100.4667},{name:"Bayan Lepas",lat:5.2833,lng:100.2667},{name:"Alor Setar",lat:6.1254,lng:100.3673},{name:"Sungai Petani",lat:5.65,lng:100.4833},{name:"Langkawi",lat:6.35,lng:99.8},{name:"Kangar",lat:6.4333,lng:100.2},{name:"Kota Bharu",lat:6.1333,lng:102.25},{name:"Kuala Terengganu",lat:5.3333,lng:103.1333},{name:"Seremban",lat:2.7297,lng:101.9381},{name:"Port Dickson",lat:2.5167,lng:101.8},{name:"Nilai",lat:2.8167,lng:101.8},{name:"Malacca City",lat:2.1896,lng:102.2501},{name:"Alor Gajah",lat:2.3833,lng:102.2167},{name:"Kota Kinabalu",lat:5.9804,lng:116.0735},{name:"Sandakan",lat:5.8333,lng:118.1167},{name:"Tawau",lat:4.25,lng:117.9},{name:"Kuching",lat:1.5533,lng:110.3593},{name:"Miri",lat:4.4,lng:113.9833},{name:"Sibu",lat:2.3,lng:111.8167},{name:"Bintulu",lat:3.1667,lng:113.0333}];
  const malls = ["Suria KLCC","Pavilion KL","Mid Valley","1 Utama","Sunway Pyramid","IOI City Mall","The Gardens Mall","Berjaya Times Square","Lot 10","Fahrenheit 88","Nu Sentral","Avenue K","The Exchange TRX","Gurney Plaza","Queensbay Mall","City Square Mall","AEON Tebrau","Toppen Mall"];
  let id = 1;
  malaysianCities.forEach(city => {
    const cityMalls = malls.slice(0, Math.floor(Math.random() * 5) + 3);
    cityMalls.forEach(mall => {
      const type = types[Math.floor(Math.random() * types.length)];
      const partner = partners[Math.floor(Math.random() * partners.length)];
      const serviceSet = services[Math.floor(Math.random() * services.length)];
      const sizeSet = acceptedSizes[Math.floor(Math.random() * acceptedSizes.length)];
      const operatingHours = type === "Locker" ? {monday:"24/7",tuesday:"24/7",wednesday:"24/7",thursday:"24/7",friday:"24/7",saturday:"24/7",sunday:"24/7"} : {monday:"09:00-22:00",tuesday:"09:00-22:00",wednesday:"09:00-22:00",thursday:"09:00-22:00",friday:"09:00-22:00",saturday:"10:00-22:00",sunday:"10:00-20:00"};
      locations.push({id:id++,name:`BeautyLab ${type} ${mall}`,partner,type,address:`Level ${Math.floor(Math.random()*5)+1}, ${mall}, ${city.name}, Malaysia`,coordinates:{lat:city.lat+(Math.random()-.5)*.1,lng:city.lng+(Math.random()-.5)*.1},acceptedSizes:sizeSet,operatingDays:7,services:serviceSet,operatingHours});
    });
  });
  return locations;
};
const nvLocations = generateNinjaVanLocations();

const generateNinjaVanOrders = () => {
  const orders: any[] = [];
  const statuses = ["Delivered","In Transit","Pending Pickup","Out for Delivery","Failed Delivery","Returned"];
  const names = ["Ahmad bin Ismail","Sarah Tan","Mohammed Ali","Jennifer Lee","Raj Kumar","Fatimah binti Hassan","David Chen","Priya Sharma","Hassan Abdullah","Lisa Wong","Kumar Rajan","Aisha Rahman","Michael Tan","Nurul Huda","James Lim","Siti Aminah","Robert Ng","Zainab Ibrahim","Kevin Ooi","Mariam Ali"];
  const itemSets = [["Cloud Cleanser 150ml","Niacinamide Serum 30ml"],["UV Defense SPF 50 — 50ml"],["Retinol Night Cream 30ml","Ceramide Barrier Cream 50ml","Lip Recovery Balm 10g"],["Vitamin C Glow Essence 30ml","HA Rose Toner 200ml"],["Peptide Eye Cream 15ml","Velvet Matte Lipstick — Rose"],["Rice Milk Body Lotion 250ml","Rose Quartz Gua Sha"],["Barrier Repair Mini Kit","Hydrating Sheet Mask 5pc"],["Travel Minis Set","Biodegradable Cotton Rounds"],["Double Cleanse Duo","Micellar Water Refill 400ml"],["BeautyLab — Full Face & Body Routine Kit"]];
  const streets = ["Jalan Ampang","Jalan Bukit Bintang","Jalan Petaling","Jalan Sultan Ismail","Jalan Tun Razak","Jalan Pudu","Jalan Imbi","Jalan Raja Chulan","Jalan Tuanku Abdul Rahman","Jalan Masjid India"];
  const areas = ["Kuala Lumpur","Petaling Jaya","Shah Alam","Subang Jaya","Klang","Kajang","Seremban","Malacca","Johor Bahru","Ipoh","Penang"];
  let oid = 1;
  for (let i = 0; i < 500; i++) {
    const status = statuses[Math.floor(Math.random()*statuses.length)];
    const name = names[Math.floor(Math.random()*names.length)];
    const phone = `+601${Math.floor(Math.random()*9e7)+1e7}`;
    const addr = `${Math.floor(Math.random()*999)+1} ${streets[Math.floor(Math.random()*streets.length)]}, ${Math.floor(Math.random()*89999)+10000} ${areas[Math.floor(Math.random()*areas.length)]}`;
    const pickup = nvLocations[Math.floor(Math.random()*nvLocations.length)];
    const delivery = nvLocations[Math.floor(Math.random()*nvLocations.length)];
    const items = itemSets[Math.floor(Math.random()*itemSets.length)];
    const weight = Math.round((Math.random()*2+.1)*100)/100;
    const value = Math.round((Math.random()*200+50)*100)/100;
    const hasAWB = Math.random()>.15;
    const awb = hasAWB?`MY${Math.floor(Math.random()*9e8)+1e8}`:null;
    const created = new Date(); created.setDate(created.getDate()-Math.floor(Math.random()*30)); created.setHours(Math.floor(Math.random()*12)+8,Math.floor(Math.random()*60),0,0);
    const est = new Date(created); est.setDate(est.getDate()+Math.floor(Math.random()*5)+1);
    const delivered = status==="Delivered"?new Date(est):null;
    const tracking = [{timestamp:created.toISOString(),status:"Order Created",location:pickup.name}];
    if(status!=="Pending Pickup"){const t=new Date(created);t.setHours(t.getHours()+Math.floor(Math.random()*6)+2);tracking.push({timestamp:t.toISOString(),status:"Picked Up",location:pickup.name});}
    if(["In Transit","Out for Delivery","Delivered"].includes(status)){const t=new Date(created);t.setHours(t.getHours()+Math.floor(Math.random()*12)+6);tracking.push({timestamp:t.toISOString(),status:"In Transit",location:"NinjaVan Hub"});}
    if(["Out for Delivery","Delivered"].includes(status)){const t=new Date(est);t.setHours(t.getHours()-Math.floor(Math.random()*4)-1);tracking.push({timestamp:t.toISOString(),status:"Out for Delivery",location:delivery.name});}
    if(status==="Delivered")tracking.push({timestamp:delivered!.toISOString(),status:"Delivered",location:delivery.name});
    orders.push({id:`NV${String(oid++).padStart(3,'0')}`,awb,status,customerName:name,customerPhone:phone,customerAddress:addr,pickupLocation:pickup.name,deliveryLocation:delivery.name,items,totalWeight:weight,totalValue:value,createdAt:created.toISOString(),estimatedDelivery:est.toISOString(),deliveredAt:delivered?.toISOString(),trackingUpdates:tracking});
  }
  return orders;
};
const nvOrders = generateNinjaVanOrders();

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n: number) => { if (n >= 1e6) return `${(n/1e6).toFixed(1)}M`; if (n >= 1e3) return `${(n/1e3).toFixed(1)}K`; return n.toLocaleString(); };
const fmtRM = (n: number) => new Intl.NumberFormat("en-MY",{style:"currency",currency:"MYR",minimumFractionDigits:2}).format(n);
const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});

const TYPE_C: Record<string,string> = {Shop:'#3b82f6',Kiosk:'#f59e0b',Locker:'#8b5cf6'};
const STATUS_C: Record<string,string> = {Delivered:'#10b981','In Transit':'#3b82f6','Pending Pickup':'#f59e0b','Out for Delivery':'#8b5cf6','Failed Delivery':'#ef4444',Returned:'#6b7280'};
type MainTab = 'overview' | 'network' | 'orders';

// ─────────────────────────────────────────────────────────────────────────────
// MICRO COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const PulseDot: React.FC<{color?:string;size?:number}> = ({color='var(--preset-primary)',size=8}) => (<span style={{position:'relative',display:'inline-flex',alignItems:'center',justifyContent:'center',width:size,height:size,flexShrink:0}}><span style={{position:'absolute',inset:0,borderRadius:'50%',background:color,opacity:0.4,animation:'nv-pulse 2s ease-in-out infinite'}}/><span style={{width:size,height:size,borderRadius:'50%',background:color,display:'block'}}/></span>);

const AnimNum: React.FC<{value:number;format?:(v:number)=>string}> = ({value,format:f}) => {
  const [n,setN]=useState(0);const raf=useRef(0);
  useEffect(()=>{const s=performance.now(),d=800;const t=(now:number)=>{const p=Math.min((now-s)/d,1),e=1-Math.pow(1-p,3);setN(Math.floor(e*value));if(p<1)raf.current=requestAnimationFrame(t);};raf.current=requestAnimationFrame(t);return()=>cancelAnimationFrame(raf.current);},[value]);
  return<>{f?f(n):n.toLocaleString()}</>;
};

const Panel: React.FC<{children:React.ReactNode;style?:React.CSSProperties}> = ({children,style}) => (<div style={{borderRadius:18,border:'1px solid rgba(255,255,255,.07)',background:'rgba(255,255,255,.025)',padding:'24px 28px',position:'relative',overflow:'hidden',...style}}>{children}</div>);
const PanelHeader: React.FC<{title:string;subtitle?:string;icon:React.ReactNode;iconColor?:string;action?:React.ReactNode}> = ({title,subtitle,icon,iconColor='var(--preset-primary)',action}) => (<div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18}}><div style={{display:'flex',alignItems:'center',gap:12}}><div style={{width:38,height:38,borderRadius:10,background:`${iconColor}18`,display:'flex',alignItems:'center',justifyContent:'center',color:iconColor,flexShrink:0}}>{icon}</div><div><div style={{fontSize:17,fontWeight:800,letterSpacing:'-0.3px'}}>{title}</div>{subtitle&&<div style={{fontSize:13,color:'rgba(255,255,255,.38)',marginTop:2}}>{subtitle}</div>}</div></div>{action}</div>);
const MiniBar: React.FC<{value:number;max:number;color?:string;height?:number}> = ({value,max,color='var(--preset-primary)',height=6}) => (<div style={{height,background:'rgba(255,255,255,.07)',borderRadius:99,overflow:'hidden'}}><div style={{width:`${max>0?Math.min((value/max)*100,100):0}%`,height:'100%',background:color,borderRadius:99,transition:'width .8s cubic-bezier(.4,0,.2,1)'}}/></div>);

const TypeBadge: React.FC<{type:string}> = ({type}) => {const c=TYPE_C[type]||'rgba(255,255,255,.3)';return<span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'4px 12px',borderRadius:8,background:`${c}15`,border:`1px solid ${c}33`,fontSize:11,fontWeight:800,color:c,letterSpacing:'.05em'}}>{type.toUpperCase()}</span>;};
const StatusBadge: React.FC<{status:string}> = ({status}) => {const c=STATUS_C[status]||'rgba(255,255,255,.3)';return<span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'4px 12px',borderRadius:8,background:`${c}15`,border:`1px solid ${c}33`,fontSize:11,fontWeight:800,color:c,letterSpacing:'.05em'}}>{status.toUpperCase()}</span>;};

const FilterBtn: React.FC<{active:boolean;label:string;onClick:()=>void;count?:number}> = ({active,label,onClick,count}) => (
  <button onClick={onClick} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',border:'none',transition:'all .15s',...(active?{background:'var(--preset-primary)',color:'#fff',boxShadow:'0 2px 10px rgba(var(--preset-primary-rgb),.3)'}:{background:'rgba(255,255,255,.05)',color:'rgba(255,255,255,.45)'})}}>
    {label}{count!==undefined&&<span style={{padding:'1px 7px',borderRadius:5,background:active?'rgba(255,255,255,.2)':'rgba(255,255,255,.08)',fontSize:10,fontWeight:800}}>{count}</span>}
  </button>
);

const Loader: React.FC = () => (<div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'48px'}}><Sparkles style={{width:24,height:24,color:'var(--preset-primary)',animation:'nv-spin 1.5s ease-in-out infinite'}}/></div>);

const EmptyState: React.FC<{icon:React.ReactNode;title:string;subtitle:string}> = ({icon,title,subtitle}) => (<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'64px 24px',textAlign:'center',gap:14}}><div style={{opacity:.25}}>{icon}</div><div style={{fontSize:18,fontWeight:700,color:'rgba(255,255,255,.5)'}}>{title}</div><div style={{fontSize:14,color:'rgba(255,255,255,.3)'}}>{subtitle}</div></div>);


// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function NinjaVanDashboard() {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const [mainTab,setMainTab]=useState<MainTab>('overview');
  const [selectedType,setSelectedType]=useState('all');
  const [searchTerm,setSearchTerm]=useState('');
  const [locPage,setLocPage]=useState(1);
  const [ordPage,setOrdPage]=useState(1);
  const [isLP,setIsLP]=useState(false);
  const [selectedLocation,setSelectedLocation]=useState<any>(null);
  const [selectedOrder,setSelectedOrder]=useState<any>(null);
  const locPerPage=18;
  const ordPerPage=25;

  const filteredLoc=useMemo(()=>nvLocations.filter(l=>(selectedType==='all'||l.type.toLowerCase()===selectedType)&&(l.name.toLowerCase().includes(searchTerm.toLowerCase())||l.address.toLowerCase().includes(searchTerm.toLowerCase()))),[selectedType,searchTerm]);
  const totalLocPages=Math.ceil(filteredLoc.length/locPerPage);
  const pagedLoc=filteredLoc.slice((locPage-1)*locPerPage,locPage*locPerPage);
  const totalOrdPages=Math.ceil(nvOrders.length/ordPerPage);
  const pagedOrd=nvOrders.slice((ordPage-1)*ordPerPage,ordPage*ordPerPage);

  const goPage=(setter:React.Dispatch<React.SetStateAction<number>>,p:number)=>{setIsLP(true);setTimeout(()=>{setter(p);setIsLP(false);},400);};

  const stats=useMemo(()=>({total:nvLocations.length,shops:nvLocations.filter(l=>l.type==='Shop').length,kiosks:nvLocations.filter(l=>l.type==='Kiosk').length,lockers:nvLocations.filter(l=>l.type==='Locker').length,totalOrders:nvOrders.length,delivered:nvOrders.filter(o=>o.status==='Delivered').length,inTransit:nvOrders.filter(o=>o.status==='In Transit').length,pending:nvOrders.filter(o=>o.status==='Pending Pickup').length,outForDel:nvOrders.filter(o=>o.status==='Out for Delivery').length,failed:nvOrders.filter(o=>o.status==='Failed Delivery').length,awbGenerated:nvOrders.filter(o=>o.awb).length,totalValue:nvOrders.reduce((s,o)=>s+o.totalValue,0)}),[]);

  const statusDist=useMemo(()=>['Delivered','In Transit','Pending Pickup','Out for Delivery','Failed Delivery','Returned'].map(s=>({name:s,value:nvOrders.filter(o=>o.status===s).length,fill:STATUS_C[s]})),[]);
  const typeDist=useMemo(()=>['Shop','Kiosk','Locker'].map(t=>({name:t,value:nvLocations.filter(l=>l.type===t).length,fill:TYPE_C[t]})),[]);

  const TABS:{key:MainTab;label:string;icon:React.ReactNode}[]=[{key:'overview',label:'Overview',icon:<BarChart3 style={{width:14,height:14}}/>},{key:'network',label:'Delivery Network',icon:<MapPin style={{width:14,height:14}}/>},{key:'orders',label:'Orders & AWB',icon:<Package style={{width:14,height:14}}/>}];

  const gs=`@keyframes nv-pulse{0%,100%{transform:scale(1);opacity:.4}50%{transform:scale(2.4);opacity:0}}@keyframes nv-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes nv-spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@keyframes nv-glow{0%,100%{box-shadow:0 0 12px rgba(139,92,246,.15)}50%{box-shadow:0 0 28px rgba(139,92,246,.35)}}@keyframes nv-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}@keyframes nv-fadeScale{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}@keyframes nv-slideRight{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}@keyframes nv-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}@keyframes nv-bar{from{width:0}to{width:var(--bar-w)}}
  .ninjavan-theme.light-mode{background:#f8fafc;color:#111827;}
  .ninjavan-theme.light-mode [style*="rgba(255,255,255"], .ninjavan-theme.light-mode [style*="rgba(255, 255, 255"]{
    color:rgba(17,24,39,.86)!important;border-color:rgba(var(--preset-primary-rgb),.16)!important;background:rgba(255,255,255,.92)!important;
  }
  .ninjavan-theme.light-mode .recharts-cartesian-grid line{stroke:rgba(148,163,184,.24)!important;}
  .ninjavan-theme.light-mode .recharts-text,.ninjavan-theme.light-mode .recharts-legend-item-text,.ninjavan-theme.light-mode svg text,.ninjavan-theme.light-mode svg tspan{fill:rgba(30,41,59,.82)!important;}
  `;

  // Pagination bar
  const PaginationBar=({page,total,setter,count,label}:{page:number;total:number;setter:React.Dispatch<React.SetStateAction<number>>;count:number;label:string})=>(
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 24px',borderRadius:14,border:'1px solid rgba(255,255,255,.07)',background:'rgba(255,255,255,.025)'}}>
      <span style={{fontSize:13,color:'rgba(255,255,255,.35)'}}>Page {page} of {total} · {count} {label}</span>
      <div style={{display:'flex',gap:4}}>
        <button disabled={page===1} onClick={()=>goPage(setter,page-1)} style={{display:'inline-flex',alignItems:'center',gap:4,padding:'8px 16px',borderRadius:10,background:page===1?'rgba(255,255,255,.02)':'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:page===1?'rgba(255,255,255,.2)':'rgba(255,255,255,.6)',fontSize:12,fontWeight:700,cursor:page===1?'default':'pointer',fontFamily:'inherit'}}><ChevronLeft style={{width:14,height:14}}/>Prev</button>
        {Array.from({length:Math.min(total,7)},(_,i)=>{const p=total<=7?i+1:page<=4?i+1:page>=total-3?total-6+i:page-3+i;return<button key={p} onClick={()=>goPage(setter,p)} style={{width:32,height:32,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,cursor:'pointer',border:'none',fontFamily:'inherit',...(p===page?{background:'var(--preset-primary)',color:'#fff',boxShadow:'0 2px 8px rgba(var(--preset-primary-rgb),.3)'}:{background:'rgba(255,255,255,.05)',color:'rgba(255,255,255,.4)'})}}>{p}</button>;})}
        <button disabled={page===total} onClick={()=>goPage(setter,page+1)} style={{display:'inline-flex',alignItems:'center',gap:4,padding:'8px 16px',borderRadius:10,background:page===total?'rgba(255,255,255,.02)':'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:page===total?'rgba(255,255,255,.2)':'rgba(255,255,255,.6)',fontSize:12,fontWeight:700,cursor:page===total?'default':'pointer',fontFamily:'inherit'}}>Next<ChevronRight style={{width:14,height:14}}/></button>
      </div>
    </div>
  );

  // Location detail dialog — rendered inline
  const LocationDetailDialog = () => {
    if(!selectedLocation) return null;
    const l = selectedLocation;
    const c = TYPE_C[l.type]||'#3b82f6';
    const dayOrder = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    const dayShort: Record<string,string> = {monday:'Mon',tuesday:'Tue',wednesday:'Wed',thursday:'Thu',friday:'Fri',saturday:'Sat',sunday:'Sun'};
    const isToday = (d:string) => {const now=new Date();const days=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];return days[now.getDay()]===d;};

    return (
      <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:24}} onClick={()=>setSelectedLocation(null)}>
        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,.65)',backdropFilter:'blur(8px)'}}/>
        <div onClick={e=>e.stopPropagation()} style={{position:'relative',width:'100%',maxWidth:720,maxHeight:'85vh',overflowY:'auto',borderRadius:22,border:`1px solid ${c}25`,background:'#0c1220',animation:'nv-fadeScale .3s ease both',boxShadow:`0 24px 64px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.05), inset 0 1px 0 rgba(255,255,255,.05)`}}>

          {/* Hero banner */}
          <div style={{position:'relative',padding:'32px 32px 24px',overflow:'hidden'}}>
            <div style={{position:'absolute',inset:0,background:`linear-gradient(135deg,${c}15,transparent 60%)`,pointerEvents:'none'}}/>
            <div style={{position:'absolute',top:-40,right:-40,width:180,height:180,borderRadius:'50%',background:`radial-gradient(circle,${c}20,transparent 70%)`,pointerEvents:'none'}}/>

            {/* Close button */}
            <button onClick={()=>setSelectedLocation(null)} style={{position:'absolute',top:16,right:16,width:32,height:32,borderRadius:8,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'rgba(255,255,255,.4)',zIndex:2}}>✕</button>

            <div style={{position:'relative',zIndex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                <TypeBadge type={l.type}/>
                <span style={{fontSize:12,color:'rgba(255,255,255,.35)'}}>{l.partner}</span>
              </div>
              <div style={{fontSize:26,fontWeight:900,letterSpacing:'-0.5px',marginBottom:8}}>{l.name}</div>
              <div style={{display:'flex',alignItems:'center',gap:8,fontSize:14,color:'rgba(255,255,255,.45)'}}>
                <MapPin style={{width:16,height:16,color:c,flexShrink:0}}/>
                {l.address}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6,marginTop:4,fontSize:12,color:'rgba(255,255,255,.25)'}}>
                <Globe style={{width:12,height:12}}/>{l.coordinates.lat.toFixed(4)}, {l.coordinates.lng.toFixed(4)}
              </div>
            </div>
          </div>

          <div style={{padding:'0 32px 32px',display:'flex',flexDirection:'column',gap:24}}>

            {/* Action buttons */}
            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px 20px',borderRadius:12,background:`linear-gradient(135deg,${c},${c}cc)`,color:'#fff',fontSize:14,fontWeight:700,border:'none',cursor:'pointer',fontFamily:'inherit',boxShadow:`0 4px 16px ${c}40`}}>
                <Navigation style={{width:16,height:16}}/>Get Directions
              </button>
              <button style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px 20px',borderRadius:12,background:'rgba(139,92,246,.1)',border:'1px solid rgba(139,92,246,.25)',color:'#a78bfa',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                <MessageSquare style={{width:16,height:16}}/>Move to Chat
              </button>
            </div>

            {/* Operating hours — visual calendar strip */}
            <div>
              <div style={{fontSize:12,fontWeight:800,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12}}>Operating Hours</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6}}>
                {dayOrder.map((day) => {
                  const hours = l.operatingHours[day] as string;
                  const is24 = hours === '24/7';
                  const today = isToday(day);
                  return (
                    <div key={day} style={{padding:'14px 8px',borderRadius:14,background: today ? `${c}12` : 'rgba(255,255,255,.03)',border: today ? `2px solid ${c}40` : '1px solid rgba(255,255,255,.06)',textAlign:'center',position:'relative',transition:'all .15s'}}>
                      {today && <div style={{position:'absolute',top:6,right:6,width:6,height:6,borderRadius:'50%',background:c,boxShadow:`0 0 8px ${c}`}}/>}
                      <div style={{fontSize:11,fontWeight:800,color: today ? c : 'rgba(255,255,255,.5)',marginBottom:8,textTransform:'uppercase'}}>{dayShort[day]}</div>
                      {is24 ? (
                        <div style={{fontSize:13,fontWeight:900,color:'#10b981'}}>24/7</div>
                      ) : (
                        <>
                          <div style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,.7)'}}>{hours.split('-')[0]}</div>
                          <div style={{width:12,height:1,background:'rgba(255,255,255,.15)',margin:'4px auto'}}/>
                          <div style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,.5)'}}>{hours.split('-')[1]}</div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Services */}
            <div>
              <div style={{fontSize:12,fontWeight:800,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12}}>Available Services</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:8}}>
                {l.services.map((s:string, i:number) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',borderRadius:12,background:'rgba(var(--preset-primary-rgb),.06)',border:'1px solid rgba(var(--preset-primary-rgb),.12)',animation:`nv-slideRight .3s ease ${i*.06}s both`}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:'var(--preset-primary)',boxShadow:'0 0 8px rgba(var(--preset-primary-rgb),.4)',flexShrink:0}}/>
                    <span style={{fontSize:13,fontWeight:700,color:'var(--preset-primary)'}}>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accepted sizes — visual chips with size indicator */}
            <div>
              <div style={{fontSize:12,fontWeight:800,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12}}>Accepted Parcel Sizes</div>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                {l.acceptedSizes.map((size:string, i:number) => {
                  const sizeMap: Record<string,{w:number;color:string}> = {Small:{w:24,color:'#10b981'},Medium:{w:32,color:'#3b82f6'},Large:{w:40,color:'#f59e0b'},'Extra Large':{w:48,color:'#8b5cf6'},Oversized:{w:56,color:'#ef4444'}};
                  const s = sizeMap[size]||{w:30,color:'rgba(255,255,255,.3)'};
                  return (
                    <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,padding:'14px 18px',borderRadius:12,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.08)',minWidth:80}}>
                      <div style={{width:s.w,height:s.w*.6,borderRadius:6,background:`${s.color}20`,border:`1.5px solid ${s.color}50`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <Package style={{width:s.w*.35,height:s.w*.35,color:s.color}}/>
                      </div>
                      <span style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.6)'}}>{size}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick stats */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
              {[{l:'Operating Days',v:`${l.operatingDays} days/week`,icon:<Calendar style={{width:14,height:14}}/>,c:'#3b82f6'},{l:'Services',v:`${l.services.length} available`,icon:<Zap style={{width:14,height:14}}/>,c:'#10b981'},{l:'Sizes',v:`${l.acceptedSizes.length} accepted`,icon:<Package style={{width:14,height:14}}/>,c:'#f59e0b'}].map((s,i)=>(
                <div key={i} style={{textAlign:'center',padding:'16px',borderRadius:12,background:`${s.c}08`,border:`1px solid ${s.c}18`}}>
                  <div style={{display:'flex',justifyContent:'center',color:s.c,marginBottom:6}}>{s.icon}</div>
                  <div style={{fontSize:15,fontWeight:800,color:s.c,marginBottom:2}}>{s.v}</div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,.3)',fontWeight:700,textTransform:'uppercase'}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };


  // Order detail view
  if(selectedOrder){const o=selectedOrder;return(<><style>{gs}</style><div className={`ninjavan-theme ${isLight ? 'light-mode' : ''} h-full overflow-y-auto`} style={{color:isLight?'#111827':'rgba(255,255,255,.88)',fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif"}}><div style={{display:'flex',flexDirection:'column',gap:20,padding:'24px 32px',animation:'nv-up .35s ease both',background:isLight?'#ffffff':'transparent'}}>
    <button onClick={()=>setSelectedOrder(null)} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:10,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:'rgba(255,255,255,.6)',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',alignSelf:'flex-start'}}><ChevronLeft style={{width:14,height:14}}/>Back to Orders</button>
    <Panel style={{borderLeft:`4px solid ${STATUS_C[o.status]||'#3b82f6'}`}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div><div style={{fontSize:24,fontWeight:900,marginBottom:6}}>Order {o.id}</div><div style={{display:'flex',alignItems:'center',gap:8}}><StatusBadge status={o.status}/>{o.awb&&<span style={{padding:'4px 10px',borderRadius:7,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',fontSize:11,fontWeight:700,color:'rgba(255,255,255,.5)',fontFamily:'monospace'}}>AWB: {o.awb}</span>}</div></div>
        <div style={{textAlign:'right'}}><div style={{fontSize:28,fontWeight:900,color:'var(--preset-primary)'}}>{fmtRM(o.totalValue)}</div><div style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>Order Value</div></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
        {[{l:'Customer',v:o.customerName,icon:<Users style={{width:14,height:14}}/>},{l:'Phone',v:o.customerPhone,icon:<Phone style={{width:14,height:14}}/>},{l:'Pickup',v:o.pickupLocation,icon:<MapPin style={{width:14,height:14}}/>},{l:'Delivery',v:o.deliveryLocation,icon:<Navigation style={{width:14,height:14}}/>}].map((f,i)=>(
          <div key={i} style={{padding:'14px 16px',borderRadius:12,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,color:'rgba(255,255,255,.3)',marginBottom:6}}>{f.icon}<span style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em'}}>{f.l}</span></div>
            <div style={{fontSize:14,fontWeight:700,color:'rgba(255,255,255,.7)'}}>{f.v}</div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:20}}><div style={{fontSize:11,color:'rgba(255,255,255,.3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8}}>Items</div><div style={{display:'flex',flexWrap:'wrap',gap:6}}>{o.items.map((item:string,i:number)=>(<span key={i} style={{padding:'6px 14px',borderRadius:9,background:'rgba(var(--preset-primary-rgb),.08)',border:'1px solid rgba(var(--preset-primary-rgb),.15)',fontSize:12,fontWeight:700,color:'var(--preset-primary)'}}>{item}</span>))}</div></div>
      <div><div style={{fontSize:11,color:'rgba(255,255,255,.3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:12}}>Tracking Timeline</div><div style={{display:'flex',flexDirection:'column',gap:0,position:'relative',paddingLeft:24}}>
        <div style={{position:'absolute',left:8,top:8,bottom:8,width:2,background:'rgba(255,255,255,.06)',borderRadius:1}}/>
        {o.trackingUpdates.map((u:any,i:number)=>{const isLast=i===o.trackingUpdates.length-1;const c=isLast?STATUS_C[o.status]||'#3b82f6':'rgba(255,255,255,.15)';return(
          <div key={i} style={{position:'relative',paddingBottom:20}}>
            <div style={{position:'absolute',left:-20,top:4,width:14,height:14,borderRadius:'50%',background:c,border:'3px solid #0f1724',zIndex:1}}>{isLast&&<span style={{position:'absolute',inset:-3,borderRadius:'50%',background:c,opacity:.3,animation:'nv-pulse 2s infinite'}}/>}</div>
            <div><div style={{fontSize:14,fontWeight:700,marginBottom:2}}>{u.status}</div><div style={{fontSize:12,color:'rgba(255,255,255,.4)'}}>{u.location}</div><div style={{fontSize:11,color:'rgba(255,255,255,.25)',marginTop:2}}>{fmtDate(u.timestamp)}</div></div>
          </div>
        );})}
      </div></div>
    </Panel>
  </div></div></>);}

  return(
    <><style>{gs}</style>
    <LocationDetailDialog/>
    <div className={`ninjavan-theme ${isLight ? 'light-mode' : ''} h-full overflow-y-auto`} style={{color:isLight?'#111827':'rgba(255,255,255,.88)',fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif"}}>
      <div style={{display:'flex',flexDirection:'column',gap:24,padding:'24px 32px',background:isLight?'#ffffff':'transparent'}}>

        {/* ═══ HEADER ═══ */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:8}}>
              <div style={{width:52,height:52,borderRadius:16,background:'linear-gradient(135deg,#f97316,#ea580c)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 6px 28px rgba(249,115,22,.35)',flexShrink:0}}><Truck style={{width:24,height:24,color:'#fff'}}/></div>
              <div><h2 style={{margin:0,fontSize:28,fontWeight:900,letterSpacing:'-0.6px',lineHeight:1.15}}>NinjaVan Integration</h2><div style={{display:'flex',alignItems:'center',gap:8,marginTop:4}}><PulseDot size={8} color="#f97316"/><span style={{fontSize:13,color:'rgba(255,255,255,.4)',fontWeight:700,letterSpacing:'.05em',textTransform:'uppercase'}}>Delivery Network</span><span style={{color:'rgba(255,255,255,.2)'}}>·</span><span style={{fontSize:13,color:'rgba(255,255,255,.35)'}}>{stats.total} locations · {stats.totalOrders} orders</span></div></div>
            </div>
          </div>
          <button style={{display:'inline-flex',alignItems:'center',gap:6,padding:'10px 18px',borderRadius:10,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',color:'rgba(255,255,255,.6)',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}><Download style={{width:14,height:14}}/>Export</button>
        </div>

        {/* ═══ TABS ═══ */}
        <div style={{display:'flex',gap:4,borderBottom:'2px solid rgba(255,255,255,.07)'}}>
          {TABS.map(t=><button key={t.key} onClick={()=>setMainTab(t.key)} style={{display:'inline-flex',alignItems:'center',gap:7,padding:'10px 20px',borderRadius:'12px 12px 0 0',fontSize:13,fontWeight:700,cursor:'pointer',border:'1px solid transparent',fontFamily:'inherit',transition:'all .15s',whiteSpace:'nowrap',...(mainTab===t.key?{background:'linear-gradient(135deg,var(--preset-primary),var(--preset-lighter))',color:'#fff',boxShadow:'0 4px 14px rgba(var(--preset-primary-rgb),.28)'}:{background:'transparent',color:'rgba(255,255,255,.38)'})}}>{t.icon}{t.label}</button>)}
        </div>

        {/* ═══ OVERVIEW ═══ */}
        {mainTab==='overview'&&(<div style={{display:'flex',flexDirection:'column',gap:20}}>
          {/* KPI Strip */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:'clamp(8px,1.2vw,12px)'}}>
            {[
              {label:'Total Locations',value:stats.total,icon:<Globe style={{width:18,height:18}}/>,accent:'#f97316',delay:'0s'},
              {label:'Shops',value:stats.shops,icon:<Building style={{width:18,height:18}}/>,accent:'#3b82f6',delay:'.06s'},
              {label:'Kiosks',value:stats.kiosks,icon:<Truck style={{width:18,height:18}}/>,accent:'#f59e0b',delay:'.12s'},
              {label:'Lockers',value:stats.lockers,icon:<Package style={{width:18,height:18}}/>,accent:'#8b5cf6',delay:'.18s'},
              {label:'Total Orders',value:stats.totalOrders,icon:<Box style={{width:18,height:18}}/>,accent:'#10b981',delay:'.24s'},
              {label:'Delivered',value:stats.delivered,icon:<CheckCircle style={{width:18,height:18}}/>,accent:'#10b981',delay:'.30s'},
            ].map((k,i)=>(
              <div key={i} style={{borderRadius:16,border:'1px solid rgba(255,255,255,.07)',background:'rgba(255,255,255,.03)',padding:'clamp(12px,1.8vw,20px)',position:'relative',overflow:'hidden',animation:`nv-up .5s ease ${k.delay} both`}}>
                <div style={{position:'absolute',top:'-40%',right:'-15%',width:120,height:120,borderRadius:'50%',background:`radial-gradient(circle,${k.accent}18,transparent 70%)`,pointerEvents:'none'}}/>
                <div style={{display:'flex',alignItems:'center',gap:'clamp(6px,1vw,10px)',marginBottom:'clamp(8px,1.2vw,14px)'}}><div style={{width:'clamp(26px,3vw,36px)',height:'clamp(26px,3vw,36px)',borderRadius:10,background:`${k.accent}18`,display:'flex',alignItems:'center',justifyContent:'center',color:k.accent}}>{k.icon}</div><PulseDot size={4} color={k.accent}/></div>
                <div style={{fontSize:'clamp(20px,3.2vw,32px)',fontWeight:900,letterSpacing:'-0.5px',color:'rgba(255,255,255,.92)',marginBottom:4,lineHeight:1}}><AnimNum value={k.value}/></div>
                <div style={{fontSize:'clamp(9px,1.1vw,11px)',color:'rgba(255,255,255,.38)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* AI Insights + Charts */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            {/* AI Insights — premium animated panel */}
            <Panel style={{background:'linear-gradient(145deg,rgba(139,92,246,.08),rgba(99,102,241,.03),rgba(236,72,153,.04))',borderColor:'rgba(139,92,246,.2)',animation:'nv-glow 4s ease-in-out infinite',position:'relative',overflow:'hidden'}}>
              {/* Shimmer overlay */}
              <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,transparent 0%,rgba(139,92,246,.04) 50%,transparent 100%)',backgroundSize:'200% 100%',animation:'nv-shimmer 6s infinite linear',pointerEvents:'none'}}/>

              <div style={{position:'relative',zIndex:1}}>
                {/* Header with Move to Chat */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:42,height:42,borderRadius:12,background:'linear-gradient(135deg,#8b5cf6,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(139,92,246,.4)',animation:'nv-float 3s ease-in-out infinite'}}>
                      <Sparkles style={{width:20,height:20,color:'#fff'}}/>
                    </div>
                    <div>
                      <div style={{fontSize:18,fontWeight:900,letterSpacing:'-0.3px',background:'linear-gradient(135deg,#c4b5fd,#a78bfa,#818cf8)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>AI Delivery Insights</div>
                      <div style={{fontSize:12,color:'rgba(255,255,255,.35)',marginTop:2}}>Real-time network intelligence</div>
                    </div>
                  </div>
                  <button style={{display:'inline-flex',alignItems:'center',gap:6,padding:'10px 18px',borderRadius:10,background:'linear-gradient(135deg,#8b5cf6,#6366f1)',color:'#fff',fontSize:12,fontWeight:700,border:'none',cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 16px rgba(139,92,246,.35)',transition:'transform .15s'}} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'} onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                    <MessageSquare style={{width:14,height:14}}/>Move to Chat
                  </button>
                </div>

                {/* Hero stats with animated progress rings */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,marginBottom:22}}>
                  {[
                    {l:'Delivery Success',v:'98.5%',pct:98.5,c:'#10b981',icon:<CheckCircle style={{width:16,height:16}}/>},
                    {l:'Avg Delivery Time',v:'2.3 hrs',pct:77,c:'#3b82f6',icon:<Clock style={{width:16,height:16}}/>},
                    {l:'Customer Rating',v:'4.8/5',pct:96,c:'#f59e0b',icon:<Star style={{width:16,height:16}}/>}
                  ].map((m,i)=>(
                    <div key={i} style={{textAlign:'center',padding:'20px 14px',borderRadius:14,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',animation:`nv-up .5s ease ${i*.1}s both`,position:'relative',overflow:'hidden'}}>
                      <div style={{position:'absolute',bottom:0,left:0,right:0,height:`${m.pct*.6}%`,background:`linear-gradient(to top,${m.c}08,transparent)`,transition:'height 1s ease',pointerEvents:'none'}}/>
                      <div style={{position:'relative',zIndex:1}}>
                        <div style={{display:'flex',justifyContent:'center',color:m.c,marginBottom:8}}>{m.icon}</div>
                        <div style={{fontSize:28,fontWeight:900,color:m.c,letterSpacing:'-0.5px',marginBottom:4,textShadow:`0 0 20px ${m.c}30`}}>{m.v}</div>
                        <div style={{fontSize:10,color:'rgba(255,255,255,.35)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em'}}>{m.l}</div>
                        {/* Mini progress bar */}
                        <div style={{marginTop:8,height:3,background:'rgba(255,255,255,.06)',borderRadius:99,overflow:'hidden'}}>
                          <div style={{width:`${m.pct}%`,height:'100%',background:m.c,borderRadius:99,boxShadow:`0 0 8px ${m.c}50`}}/>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Insight cards with priority labels */}
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {[
                    {priority:'INFO',color:'#3b82f6',icon:<Package style={{width:14,height:14}}/>,title:'AWB Generation',text:`${stats.awbGenerated} of ${stats.totalOrders} orders have AWB generated`,pct:Math.round(stats.awbGenerated/stats.totalOrders*100)},
                    {priority:'LIVE',color:'#8b5cf6',icon:<Truck style={{width:14,height:14}}/>,title:'In Transit',text:`${stats.inTransit} orders moving across ${stats.total} delivery points`,pct:Math.round(stats.inTransit/stats.totalOrders*100)},
                    {priority:'ALERT',color:'#ef4444',icon:<AlertTriangle style={{width:14,height:14}}/>,title:'Failed Deliveries',text:`${stats.failed} deliveries failed — review addresses & contact details`,pct:Math.round(stats.failed/stats.totalOrders*100)},
                    {priority:'TIP',color:'#10b981',icon:<TrendingUp style={{width:14,height:14}}/>,title:'Performance',text:`${stats.delivered} successful deliveries — ${Math.round(stats.delivered/stats.totalOrders*100)}% success rate`,pct:Math.round(stats.delivered/stats.totalOrders*100)},
                  ].map((item,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'14px 16px',borderRadius:12,background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.06)',animation:`nv-slideRight .4s ease ${i*.08+.2}s both`,transition:'background .15s'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.04)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.02)'}>
                      <div style={{width:32,height:32,borderRadius:8,background:`${item.color}15`,display:'flex',alignItems:'center',justifyContent:'center',color:item.color,flexShrink:0,marginTop:1}}>{item.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                          <span style={{padding:'1px 6px',borderRadius:4,background:`${item.color}18`,border:`1px solid ${item.color}30`,fontSize:8,fontWeight:900,color:item.color,letterSpacing:'.06em'}}>{item.priority}</span>
                          <span style={{fontSize:13,fontWeight:700}}>{item.title}</span>
                        </div>
                        <p style={{margin:0,fontSize:12,color:'rgba(255,255,255,.4)',lineHeight:1.6}}>{item.text}</p>
                        <div style={{marginTop:6,height:3,background:'rgba(255,255,255,.06)',borderRadius:99,overflow:'hidden'}}>
                          <div style={{width:`${item.pct}%`,height:'100%',background:`linear-gradient(90deg,${item.color},${item.color}80)`,borderRadius:99,boxShadow:`0 0 6px ${item.color}40`}}/>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            {/* Donut charts side by side */}
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <Panel>
                <PanelHeader title="Order Status" subtitle="Current delivery breakdown" icon={<Activity style={{width:18,height:18}}/>} iconColor="#10b981"/>
                <div style={{display:'flex',alignItems:'center',gap:20}}>
                  <div style={{width:120,height:120,flexShrink:0}}><ResponsiveContainer width="100%" height="100%"><RePieChart><Pie data={statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={52} innerRadius={32} strokeWidth={0} paddingAngle={2}>{statusDist.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Pie></RePieChart></ResponsiveContainer></div>
                  <div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}>{statusDist.filter(d=>d.value>0).map((d,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:8}}><span style={{width:8,height:8,borderRadius:'50%',background:d.fill,flexShrink:0}}/><span style={{fontSize:12,color:'rgba(255,255,255,.5)',flex:1}}>{d.name}</span><span style={{fontSize:13,fontWeight:800,color:'rgba(255,255,255,.7)'}}>{d.value}</span></div>))}</div>
                </div>
              </Panel>
              <Panel>
                <PanelHeader title="Location Types" subtitle="Network composition" icon={<Layers style={{width:18,height:18}}/>} iconColor="#f97316"/>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {typeDist.map((t,i)=>{const maxV=Math.max(...typeDist.map(d=>d.value));return(
                    <div key={i}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><div style={{display:'flex',alignItems:'center',gap:8}}><span style={{width:10,height:10,borderRadius:'50%',background:t.fill}}/><span style={{fontSize:14,fontWeight:700}}>{t.name}</span></div><span style={{fontSize:18,fontWeight:900,color:t.fill}}>{t.value}</span></div><MiniBar value={t.value} max={maxV} color={t.fill} height={8}/></div>
                  );})}
                </div>
              </Panel>
            </div>
          </div>
        </div>)}

        {/* ═══ NETWORK ═══ */}
        {mainTab==='network'&&(<div style={{display:'flex',flexDirection:'column',gap:20}}>
          {/* Search + filter */}
          <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
            <div style={{position:'relative',flex:1,minWidth:200}}><Search style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',width:16,height:16,color:'rgba(255,255,255,.25)'}}/><input value={searchTerm} onChange={e=>{setSearchTerm(e.target.value);setLocPage(1);}} placeholder="Search locations..." style={{width:'100%',height:44,paddingLeft:40,paddingRight:14,fontSize:14,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:12,color:'rgba(255,255,255,.8)',outline:'none',fontFamily:'inherit'}}/></div>
            <FilterBtn active={selectedType==='all'} label="All" count={stats.total} onClick={()=>{setSelectedType('all');setLocPage(1);}}/>
            <FilterBtn active={selectedType==='shop'} label="Shops" count={stats.shops} onClick={()=>{setSelectedType('shop');setLocPage(1);}}/>
            <FilterBtn active={selectedType==='kiosk'} label="Kiosks" count={stats.kiosks} onClick={()=>{setSelectedType('kiosk');setLocPage(1);}}/>
            <FilterBtn active={selectedType==='locker'} label="Lockers" count={stats.lockers} onClick={()=>{setSelectedType('locker');setLocPage(1);}}/>
          </div>

          {isLP?<Loader/>:(
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:14}}>
              {pagedLoc.map((l,idx)=>{const c=TYPE_C[l.type]||'#3b82f6';return(
                <div key={l.id} onClick={()=>setSelectedLocation(l)} style={{borderRadius:16,border:`1px solid ${c}22`,borderLeft:`4px solid ${c}`,background:'rgba(255,255,255,.025)',padding:'20px',cursor:'pointer',transition:'all .15s',animation:`nv-up .35s ease ${idx*.02}s both`,position:'relative',overflow:'hidden'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(var(--preset-primary-rgb),.04)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.025)'}>
                  <div style={{position:'absolute',top:'-30%',right:'-15%',width:120,height:120,borderRadius:'50%',background:`radial-gradient(circle,${c}08,transparent 70%)`,pointerEvents:'none'}}/>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                    <div style={{flex:1,minWidth:0}}><div style={{fontSize:15,fontWeight:800,marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.name}</div><div style={{fontSize:12,color:'rgba(255,255,255,.35)'}}>{l.partner}</div></div>
                    <TypeBadge type={l.type}/>
                  </div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,.4)',marginBottom:12,display:'flex',alignItems:'flex-start',gap:6}}><MapPin style={{width:13,height:13,flexShrink:0,marginTop:1}}/><span style={{overflow:'hidden',textOverflow:'ellipsis',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'} as any}>{l.address}</span></div>
                  <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>{l.services.slice(0,2).map((s:string,i:number)=>(<span key={i} style={{padding:'3px 9px',borderRadius:6,background:'rgba(var(--preset-primary-rgb),.08)',border:'1px solid rgba(var(--preset-primary-rgb),.12)',fontSize:10,fontWeight:700,color:'var(--preset-primary)'}}>{s}</span>))}{l.services.length>2&&<span style={{padding:'3px 9px',borderRadius:6,background:'rgba(255,255,255,.05)',fontSize:10,fontWeight:700,color:'rgba(255,255,255,.3)'}}>+{l.services.length-2}</span>}</div>
                  <div style={{display:'flex',gap:16,fontSize:11,color:'rgba(255,255,255,.3)'}}>
                    <span style={{display:'flex',alignItems:'center',gap:4}}><Package style={{width:11,height:11}}/>{l.acceptedSizes.length} sizes</span>
                    <span style={{display:'flex',alignItems:'center',gap:4}}><Clock style={{width:11,height:11}}/>{l.operatingDays}d/week</span>
                  </div>
                </div>
              );})}
            </div>
          )}
          <PaginationBar page={locPage} total={totalLocPages} setter={setLocPage} count={filteredLoc.length} label="locations"/>
        </div>)}

        {/* ═══ ORDERS ═══ */}
        {mainTab==='orders'&&(<div style={{display:'flex',flexDirection:'column',gap:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:17,fontWeight:800}}>Orders & AWB Tracking</div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:12,color:'rgba(255,255,255,.3)'}}>{stats.awbGenerated} of {stats.totalOrders} AWB generated</span>
              <MiniBar value={stats.awbGenerated} max={stats.totalOrders} color="#10b981" height={6}/>
            </div>
          </div>

          <div style={{borderRadius:16,border:'1px solid rgba(255,255,255,.07)',background:'rgba(255,255,255,.025)',overflow:'hidden'}}>
            {isLP?<Loader/>:(
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                  <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,.07)'}}>
                    {['Order','AWB','Status','Customer','Pickup','Value','Created'].map((h,i)=>(
                      <th key={i} style={{padding:'12px 14px',textAlign:i>=5?'right':'left',fontSize:11,fontWeight:800,color:'rgba(255,255,255,.35)',letterSpacing:'.05em',textTransform:'uppercase'}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>{pagedOrd.map((o,idx)=>(
                    <tr key={o.id} onClick={()=>setSelectedOrder(o)} style={{borderBottom:'1px solid rgba(255,255,255,.06)',cursor:'pointer',transition:'background .15s'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(var(--preset-primary-rgb),.04)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'12px 14px',fontWeight:800,color:'rgba(255,255,255,.8)'}}>{o.id}</td>
                      <td style={{padding:'12px 14px'}}>{o.awb?<span style={{fontFamily:'monospace',fontSize:11,color:'rgba(255,255,255,.5)',padding:'3px 8px',borderRadius:5,background:'rgba(255,255,255,.05)'}}>{o.awb}</span>:<span style={{fontSize:11,color:'rgba(255,255,255,.2)'}}>—</span>}</td>
                      <td style={{padding:'12px 14px'}}><StatusBadge status={o.status}/></td>
                      <td style={{padding:'12px 14px'}}><div style={{fontSize:13,fontWeight:700}}>{o.customerName}</div><div style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>{o.customerPhone}</div></td>
                      <td style={{padding:'12px 14px',fontSize:12,color:'rgba(255,255,255,.4)',maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.pickupLocation.replace('Shop-Intel ','')}</td>
                      <td style={{padding:'12px 14px',textAlign:'right',fontWeight:700,color:'rgba(255,255,255,.7)'}}>{fmtRM(o.totalValue)}</td>
                      <td style={{padding:'12px 14px',textAlign:'right',fontSize:12,color:'rgba(255,255,255,.4)'}}>{fmtDate(o.createdAt)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
          <PaginationBar page={ordPage} total={totalOrdPages} setter={setOrdPage} count={nvOrders.length} label="orders"/>
        </div>)}

      </div>
    </div></>
  );
}