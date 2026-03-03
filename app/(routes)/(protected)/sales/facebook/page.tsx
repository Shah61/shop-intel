"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DataCard from "@/src/core/shared/view/components/data-card";
import { PageHeader, PageSection } from "@/src/core/shared/view/components/page-section";
import {
    DollarSign,
    Eye,
    MousePointer,
    Target,
    Search,
    Download,
    Award,
    BarChart3,
    Users,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from "recharts";

const generateFacebookCampaigns = () => {
    const campaigns: any[] = [];
    const campaignTypes = [
        "clothing Lovers", "Premium Collection", "Valentine Special", "Easter Delight", "Summer Treats",
        "Dark clothing", "Milk clothing", "White clothing", "Hazelnut Crunch", "Caramel Bliss",
        "Strawberry Dream", "Mint Fresh", "Orange Zest", "Raspberry Ripple", "Vanilla Cream",
        "Coconut Paradise", "Almond Joy", "Peanut Butter", "Cookies & Cream", "Rocky Road",
        "Birthday Celebration", "Anniversary Special", "Holiday Collection", "Gift Box", "Party Pack",
        "Luxury Selection", "Artisan Crafted", "Organic Choice", "Sugar Free", "Gluten Free",
        "Kids Favorite", "Adult Indulgence", "Corporate Gifts", "Wedding Favors", "Graduation Treats",
        "Mother's Day", "Father's Day", "Christmas Magic", "New Year Joy", "Back to School",
        "Halloween Spooky", "Thanksgiving Feast", "Black Friday", "Cyber Monday", "Flash Sale",
        "Limited Edition", "Seasonal Special", "Regional Favorite", "International Blend", "Local Pride",
        "Morning Boost", "Afternoon Pick", "Evening Relax", "Midnight Snack", "Weekend Treat",
        "Workplace Energy", "Study Buddy", "Gym Reward", "Travel Companion", "Home Comfort",
        "Date Night", "Movie Night", "Game Night", "Book Club", "Coffee Break",
        "Tea Time", "Dessert Time", "Snack Time", "Treat Time", "Reward Time",
        "Achievement", "Milestone", "Success", "Victory", "Celebration",
        "Memories", "Nostalgia", "Tradition", "Heritage", "Legacy",
        "Innovation", "Revolution", "Evolution", "Transformation", "Discovery",
        "Adventure", "Exploration", "Journey", "Experience", "Adventure",
        "Passion", "Love", "Joy", "Happiness", "Bliss",
        "Comfort", "Warmth", "Cozy", "Snug", "Peaceful",
        "Energetic", "Vibrant", "Dynamic", "Active", "Lively",
        "Elegant", "Sophisticated", "Refined", "Classy", "Premium",
        "Playful", "Fun", "Cheerful", "Bright", "Colorful",
        "Mysterious", "Intriguing", "Fascinating", "Captivating", "Enchanting",
    ];
    const performanceScores = ["Excellent", "Good", "Average", "Needs Work"];
    const statuses = ["Active", "Paused", "Completed"];
    const accounts = ["Shop-Intel Main", "Shop-Intel Secondary", "Shop-Intel Premium"];

    for (let i = 1; i <= 120; i++) {
        const campaignType = campaignTypes[Math.floor(Math.random() * campaignTypes.length)];
        const performanceScore = performanceScores[Math.floor(Math.random() * performanceScores.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const account = accounts[Math.floor(Math.random() * accounts.length)];
        let baseSpend, baseReach, baseImpressions, baseClicks, baseCTR, baseCPC, baseCPM;
        switch (performanceScore) {
            case "Excellent": baseSpend = 12000 + Math.random() * 8000; baseReach = 40000 + Math.random() * 30000; baseImpressions = 80000 + Math.random() * 60000; baseClicks = 2000 + Math.random() * 1500; baseCTR = 2.2 + Math.random() * 0.8; baseCPC = 4.5 + Math.random() * 1.5; baseCPM = 12.0 + Math.random() * 3.0; break;
            case "Good": baseSpend = 8000 + Math.random() * 6000; baseReach = 25000 + Math.random() * 20000; baseImpressions = 50000 + Math.random() * 40000; baseClicks = 1200 + Math.random() * 1000; baseCTR = 1.8 + Math.random() * 0.6; baseCPC = 5.0 + Math.random() * 1.5; baseCPM = 13.0 + Math.random() * 3.0; break;
            case "Average": baseSpend = 5000 + Math.random() * 5000; baseReach = 15000 + Math.random() * 15000; baseImpressions = 30000 + Math.random() * 30000; baseClicks = 600 + Math.random() * 800; baseCTR = 1.5 + Math.random() * 0.5; baseCPC = 6.0 + Math.random() * 2.0; baseCPM = 15.0 + Math.random() * 4.0; break;
            default: baseSpend = 3000 + Math.random() * 4000; baseReach = 8000 + Math.random() * 12000; baseImpressions = 15000 + Math.random() * 25000; baseClicks = 300 + Math.random() * 500; baseCTR = 1.0 + Math.random() * 0.8; baseCPC = 7.0 + Math.random() * 3.0; baseCPM = 18.0 + Math.random() * 5.0;
        }
        const startDate = new Date(2025, 0, 1 + Math.floor(Math.random() * 60));
        const endDate = new Date(startDate.getTime() + (30 + Math.random() * 30) * 24 * 60 * 60 * 1000);
        campaigns.push({ id: i, name: `Shop-Intel - ${campaignType}`, accountName: account, spend: Math.round(baseSpend!), reach: Math.round(baseReach!), impressions: Math.round(baseImpressions!), clicks: Math.round(baseClicks!), ctr: Math.round(baseCTR! * 100) / 100, cpc: Math.round(baseCPC! * 100) / 100, cpm: Math.round(baseCPM! * 100) / 100, performanceScore, startDate: startDate.toISOString().split("T")[0], endDate: endDate.toISOString().split("T")[0], status });
    }
    return campaigns;
};

const facebookCampaigns = generateFacebookCampaigns();

const generateFacebookAds = () => {
    const ads: any[] = [];
    const adTypes = ["clothing Bar", "Truffle Box", "Gift Set", "Party Pack", "Luxury Collection", "Dark Delight", "Milk Magic", "White Wonder", "Hazelnut Heaven", "Caramel Dream", "Strawberry Surprise", "Mint Marvel", "Orange Bliss", "Raspberry Joy", "Vanilla Velvet", "Coconut Cream", "Almond Art", "Peanut Perfection", "Cookie Crunch", "Rocky Road", "Birthday Box", "Anniversary Gift", "Holiday Hamper", "Gift Wrapped", "Party Favor", "Luxury Line", "Artisan Special", "Organic Choice", "Sugar Free", "Gluten Free"];
    const creativeTypes = ["Video", "Image", "Carousel", "Collection"];
    const statuses = ["Active", "Paused", "Completed"];
    const campaignNames = facebookCampaigns.map((c) => c.name);
    for (let i = 1; i <= 120; i++) {
        const adType = adTypes[Math.floor(Math.random() * adTypes.length)];
        const creativeType = creativeTypes[Math.floor(Math.random() * creativeTypes.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const campaignName = campaignNames[Math.floor(Math.random() * campaignNames.length)];
        const baseSpend = 1000 + Math.random() * 5000;
        ads.push({ id: i, name: `Shop-Intel - ${adType}`, campaignName, spend: Math.round(baseSpend), reach: Math.round(5000 + Math.random() * 20000), impressions: Math.round(10000 + Math.random() * 40000), clicks: Math.round(200 + Math.random() * 1000), ctr: Math.round((1.5 + Math.random() * 1.5) * 100) / 100, cpc: Math.round((4.0 + Math.random() * 4.0) * 100) / 100, cpm: Math.round((10.0 + Math.random() * 10.0) * 100) / 100, creativeType, status });
    }
    return ads;
};

const facebookAds = generateFacebookAds();

const campaignPerformanceData = [
    { date: "Jan 15", spend: 12500, reach: 45000, impressions: 89000, clicks: 2200 },
    { date: "Jan 20", spend: 8900, reach: 32000, impressions: 65000, clicks: 1800 },
    { date: "Jan 25", spend: 15600, reach: 58000, impressions: 120000, clicks: 3100 },
    { date: "Jan 30", spend: 7200, reach: 28000, impressions: 52000, clicks: 1400 },
    { date: "Feb 05", spend: 9800, reach: 35000, impressions: 72000, clicks: 1900 },
    { date: "Feb 10", spend: 6800, reach: 25000, impressions: 48000, clicks: 1200 },
];

const performanceBadgeStyles: Record<string, string> = {
    Excellent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    Good: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
    Average: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    "Needs Work": "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
};

const statusBadgeStyles: Record<string, string> = {
    Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    Paused: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    Completed: "bg-muted text-muted-foreground",
};

const formatCurrency = (v: number) => new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR", minimumFractionDigits: 2 }).format(v);
const formatNumber = (v: number) => new Intl.NumberFormat("en-MY").format(v);
const formatDate = (s: string) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function FacebookMarketingDashboard() {
    const [activeTab, setActiveTab] = useState("campaigns");
    const [dateRange, setDateRange] = useState({ start: "2025-01-01", end: "2025-02-28" });
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMetric, setSelectedMetric] = useState("REACH");
    const [campaignPage, setCampaignPage] = useState(1);
    const [adPage, setAdPage] = useState(1);
    const itemsPerPage = 20;

    const filteredCampaigns = facebookCampaigns.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.accountName.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredAds = facebookAds.filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.campaignName.toLowerCase().includes(searchTerm.toLowerCase()));
    const totalCampaignPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
    const totalAdPages = Math.ceil(filteredAds.length / itemsPerPage);
    const paginatedCampaigns = filteredCampaigns.slice((campaignPage - 1) * itemsPerPage, campaignPage * itemsPerPage);
    const paginatedAds = filteredAds.slice((adPage - 1) * itemsPerPage, adPage * itemsPerPage);

    const topCampaigns = [...facebookCampaigns]
        .sort((a, b) => {
            switch (selectedMetric) {
                case "REACH": return b.reach - a.reach;
                case "IMPRESSIONS": return b.impressions - a.impressions;
                case "SPEND": return b.spend - a.spend;
                case "CLICKS": return b.clicks - a.clicks;
                default: return b.reach - a.reach;
            }
        })
        .slice(0, 6);

    const metrics = {
        highestSpend: Math.max(...facebookCampaigns.map((c) => c.spend)),
        highestReach: Math.max(...facebookCampaigns.map((c) => c.reach)),
        highestImpressions: Math.max(...facebookCampaigns.map((c) => c.impressions)),
        highestClicks: Math.max(...facebookCampaigns.map((c) => c.clicks)),
    };

    const tabs = [
        { id: "campaigns", label: "Campaigns", icon: BarChart3 },
        { id: "ads", label: "Ads", icon: Target },
    ];

    return (
        <div className="space-y-10">
            <PageHeader
                title="Facebook Marketing"
                description="Manage campaigns and ads, track spend, reach, impressions, and clicks."
                actions={
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white dark:bg-card text-sm font-medium hover:bg-accent transition-colors shrink-0">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                }
            />

            {/* Hero */}
            <PageSection title="Campaign overview" description="Peak metrics across all campaigns in the selected period.">
                <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-6 sm:p-8 text-white ring-1 ring-blue-500/20">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <p className="text-sm font-medium opacity-90 mb-1">Total campaigns</p>
                            <p className="text-4xl sm:text-5xl font-bold tracking-tight">{formatNumber(facebookCampaigns.length)}</p>
                            <p className="text-xs opacity-80 mt-2">Max spend {formatCurrency(metrics.highestSpend)} · Max reach {formatNumber(metrics.highestReach)}</p>
                        </div>
                        <div className="flex gap-8">
                            <div>
                                <p className="text-xs opacity-80 uppercase tracking-wider mb-1">Impressions (max)</p>
                                <p className="text-2xl font-bold">{formatNumber(metrics.highestImpressions)}</p>
                            </div>
                            <div className="w-px bg-white/20" />
                            <div>
                                <p className="text-xs opacity-80 uppercase tracking-wider mb-1">Clicks (max)</p>
                                <p className="text-2xl font-bold">{formatNumber(metrics.highestClicks)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </PageSection>

            {/* Metric Cards */}
            <PageSection title="Key metrics" description="Highest spend, reach, impressions, and clicks across campaigns.">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DataCard icon={<DollarSign className="w-5 h-5 text-blue-600" />} title="Highest Spend" value={formatCurrency(metrics.highestSpend)} description="Top performing campaign" variant="blue" />
                <DataCard icon={<Users className="w-5 h-5 text-emerald-600" />} title="Highest Reach" value={formatNumber(metrics.highestReach)} description="Maximum audience reached" variant="emerald" />
                <DataCard icon={<Eye className="w-5 h-5 text-violet-600" />} title="Highest Impressions" value={formatNumber(metrics.highestImpressions)} description="Most impressions recorded" variant="violet" />
                <DataCard icon={<MousePointer className="w-5 h-5 text-amber-600" />} title="Highest Clicks" value={formatNumber(metrics.highestClicks)} description="Best click performance" variant="amber" />
            </div>
            </PageSection>

            {/* Search and Date */}
            <PageSection title="Filters" description="Date range and search campaigns or ads.">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2 items-center">
                    <input type="date" value={dateRange.start} onChange={(e) => setDateRange((p) => ({ ...p, start: e.target.value }))} className="h-10 px-3 rounded-xl border border-border bg-white dark:bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
                    <span className="text-muted-foreground text-sm">to</span>
                    <input type="date" value={dateRange.end} onChange={(e) => setDateRange((p) => ({ ...p, end: e.target.value }))} className="h-10 px-3 rounded-xl border border-border bg-white dark:bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
                </div>
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input placeholder="Search campaigns..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-white dark:bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
                </div>
            </div>
            </PageSection>

            {/* Tab Navigation */}
            <div className="rounded-2xl border border-border bg-white dark:bg-card p-1.5 shadow-sm w-fit">
                <div className="flex items-center gap-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium whitespace-nowrap rounded-xl transition-all ${activeTab === tab.id ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent/60"}`}>
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Campaigns Tab */}
            {activeTab === "campaigns" && (
                <div className="space-y-8">
                    <PageSection title="Top performing campaigns" description="Ranked by selected metric. Switch metric in the dropdown.">
                    <div className="bg-white dark:bg-card rounded-2xl border border-border">
                        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-500" />
                                <h3 className="text-[15px] font-semibold">Top Performing Campaigns</h3>
                            </div>
                            <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)} className="h-8 px-2.5 rounded-lg border border-border bg-white dark:bg-card text-[13px] font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/20">
                                <option value="REACH">Reach</option>
                                <option value="IMPRESSIONS">Impressions</option>
                                <option value="SPEND">Spend</option>
                                <option value="CLICKS">Clicks</option>
                            </select>
                        </div>
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {topCampaigns.map((c, i) => (
                                <div key={c.id} className="rounded-xl ring-1 ring-border/60 p-4 hover:shadow-md hover:shadow-black/[0.03] transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-lg shrink-0">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</span>
                                            <span className="text-sm font-semibold truncate">{c.name}</span>
                                        </div>
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${performanceBadgeStyles[c.performanceScore] || "bg-muted text-muted-foreground"}`}>{c.performanceScore}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-[13px]">
                                        <div><span className="text-muted-foreground text-xs">Spend</span><p className="font-semibold">{formatCurrency(c.spend)}</p></div>
                                        <div><span className="text-muted-foreground text-xs">CTR</span><p className="font-semibold">{c.ctr}%</p></div>
                                        <div><span className="text-muted-foreground text-xs">Reach</span><p className="font-semibold">{formatNumber(c.reach)}</p></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    </PageSection>

                    <PageSection title="Performance over time" description="Spend and reach trend.">
                    <div className="bg-white dark:bg-card rounded-2xl border border-border">
                        <div className="px-5 py-4 border-b border-border">
                            <h3 className="text-[15px] font-semibold">Campaign Performance Over Time</h3>
                        </div>
                        <div className="p-5">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={campaignPerformanceData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                                    <RechartsTooltip />
                                    <Line type="monotone" dataKey="spend" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3, fill: "#3B82F6", strokeWidth: 0 }} />
                                    <Line type="monotone" dataKey="reach" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: "#10B981", strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    </PageSection>

                    <PageSection title="All campaigns" description="Paginated list with details. Use search to filter.">
                    <div className="bg-white dark:bg-card rounded-2xl border border-border">
                        <div className="px-5 py-4 border-b border-border">
                            <h3 className="text-[15px] font-semibold">All Campaigns</h3>
                        </div>
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paginatedCampaigns.map((c) => (
                                <div key={c.id} className="rounded-xl ring-1 ring-border/60 p-4 hover:shadow-md hover:shadow-black/[0.03] transition-all">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold truncate">{c.name}</p>
                                            <p className="text-xs text-muted-foreground">{c.accountName}</p>
                                        </div>
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ml-2 ${performanceBadgeStyles[c.performanceScore] || "bg-muted text-muted-foreground"}`}>{c.performanceScore}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[13px] mb-2">
                                        <div><span className="text-muted-foreground text-xs">Spend</span><p className="font-semibold">{formatCurrency(c.spend)}</p></div>
                                        <div><span className="text-muted-foreground text-xs">Reach</span><p className="font-semibold">{formatNumber(c.reach)}</p></div>
                                        <div><span className="text-muted-foreground text-xs">Impressions</span><p className="font-semibold">{formatNumber(c.impressions)}</p></div>
                                        <div><span className="text-muted-foreground text-xs">Clicks</span><p className="font-semibold">{formatNumber(c.clicks)}</p></div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-border">
                                        <span className="text-[11px] text-muted-foreground">{formatDate(c.startDate)} – {formatDate(c.endDate)}</span>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <button className="text-[12px] font-medium text-foreground hover:underline">Details</button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>{c.name}</DialogTitle>
                                                </DialogHeader>
                                                <div className="grid grid-cols-2 gap-6 mt-4">
                                                    <div className="space-y-2 text-sm">
                                                        <p className="font-semibold mb-2">Campaign Info</p>
                                                        <p><span className="text-muted-foreground">Account:</span> {c.accountName}</p>
                                                        <p><span className="text-muted-foreground">Status:</span> {c.status}</p>
                                                        <p><span className="text-muted-foreground">Period:</span> {formatDate(c.startDate)} – {formatDate(c.endDate)}</p>
                                                    </div>
                                                    <div className="space-y-2 text-sm">
                                                        <p className="font-semibold mb-2">Performance</p>
                                                        <p><span className="text-muted-foreground">Spend:</span> {formatCurrency(c.spend)}</p>
                                                        <p><span className="text-muted-foreground">Reach:</span> {formatNumber(c.reach)}</p>
                                                        <p><span className="text-muted-foreground">Impressions:</span> {formatNumber(c.impressions)}</p>
                                                        <p><span className="text-muted-foreground">CTR:</span> {c.ctr}% · <span className="text-muted-foreground">CPC:</span> {formatCurrency(c.cpc)}</p>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="px-5 py-4 border-t border-border flex items-center justify-between">
                            <button disabled={campaignPage === 1} onClick={() => setCampaignPage((p) => Math.max(1, p - 1))} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
                            <span className="text-sm text-muted-foreground">Page {campaignPage} of {totalCampaignPages} ({filteredCampaigns.length} campaigns)</span>
                            <button disabled={campaignPage === totalCampaignPages} onClick={() => setCampaignPage((p) => Math.min(totalCampaignPages, p + 1))} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
                        </div>
                    </div>
                    </PageSection>
                </div>
            )}

            {activeTab === "ads" && (
                <PageSection title="Ad performance" description="All ads with spend, reach, CTR, CPC, and status.">
                <div className="bg-white dark:bg-card rounded-2xl border border-border">
                    <div className="px-5 py-4 border-b border-border">
                        <h3 className="text-[15px] font-semibold">Ad Performance</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    {["Ad Name", "Campaign", "Type", "Spend", "Reach", "CTR", "CPC", "Status"].map((h) => (
                                        <th key={h} className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedAds.map((ad) => (
                                    <tr key={ad.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                                        <td className="px-5 py-3 text-[13px] font-medium whitespace-nowrap">{ad.name}</td>
                                        <td className="px-5 py-3 text-[13px] text-muted-foreground whitespace-nowrap max-w-[200px] truncate">{ad.campaignName}</td>
                                        <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${ad.creativeType === "Video" ? "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400" : "bg-muted text-muted-foreground"}`}>{ad.creativeType}</span></td>
                                        <td className="px-5 py-3 text-[13px] font-medium whitespace-nowrap">{formatCurrency(ad.spend)}</td>
                                        <td className="px-5 py-3 text-[13px] whitespace-nowrap">{formatNumber(ad.reach)}</td>
                                        <td className="px-5 py-3 text-[13px] whitespace-nowrap">{ad.ctr}%</td>
                                        <td className="px-5 py-3 text-[13px] whitespace-nowrap">{formatCurrency(ad.cpc)}</td>
                                        <td className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${statusBadgeStyles[ad.status] || "bg-muted text-muted-foreground"}`}>{ad.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-5 py-4 border-t border-border flex items-center justify-between">
                        <button disabled={adPage === 1} onClick={() => setAdPage((p) => Math.max(1, p - 1))} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
                        <span className="text-sm text-muted-foreground">Page {adPage} of {totalAdPages} ({filteredAds.length} ads)</span>
                        <button disabled={adPage === totalAdPages} onClick={() => setAdPage((p) => Math.min(totalAdPages, p + 1))} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
                    </div>
                </div>
                </PageSection>
            )}
        </div>
    );
}
