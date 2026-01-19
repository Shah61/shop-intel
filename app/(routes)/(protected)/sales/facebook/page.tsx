"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
    TrendingUp, 
    DollarSign, 
    Eye, 
    MousePointer, 
    Target, 
    Calendar,
    Search,
    Download,
    Award,
    BarChart3,
    Users,
    Zap
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from "recharts";

// Generate expanded Facebook campaigns data
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
        "Mysterious", "Intriguing", "Fascinating", "Captivating", "Enchanting"
    ];

    const performanceScores = ["Excellent", "Good", "Average", "Needs Work"];
    const statuses = ["Active", "Paused", "Completed"];
    const accounts = ["Shop-Intel Main", "Shop-Intel Secondary", "Shop-Intel Premium"];

    for (let i = 1; i <= 120; i++) {
        const campaignType = campaignTypes[Math.floor(Math.random() * campaignTypes.length)];
        const performanceScore = performanceScores[Math.floor(Math.random() * performanceScores.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const account = accounts[Math.floor(Math.random() * accounts.length)];
        
        // Generate realistic metrics based on performance score
        let baseSpend, baseReach, baseImpressions, baseClicks, baseCTR, baseCPC, baseCPM;
        
        switch (performanceScore) {
            case "Excellent":
                baseSpend = 12000 + Math.random() * 8000;
                baseReach = 40000 + Math.random() * 30000;
                baseImpressions = 80000 + Math.random() * 60000;
                baseClicks = 2000 + Math.random() * 1500;
                baseCTR = 2.2 + Math.random() * 0.8;
                baseCPC = 4.5 + Math.random() * 1.5;
                baseCPM = 12.0 + Math.random() * 3.0;
                break;
            case "Good":
                baseSpend = 8000 + Math.random() * 6000;
                baseReach = 25000 + Math.random() * 20000;
                baseImpressions = 50000 + Math.random() * 40000;
                baseClicks = 1200 + Math.random() * 1000;
                baseCTR = 1.8 + Math.random() * 0.6;
                baseCPC = 5.0 + Math.random() * 1.5;
                baseCPM = 13.0 + Math.random() * 3.0;
                break;
            case "Average":
                baseSpend = 5000 + Math.random() * 5000;
                baseReach = 15000 + Math.random() * 15000;
                baseImpressions = 30000 + Math.random() * 30000;
                baseClicks = 600 + Math.random() * 800;
                baseCTR = 1.5 + Math.random() * 0.5;
                baseCPC = 6.0 + Math.random() * 2.0;
                baseCPM = 15.0 + Math.random() * 4.0;
                break;
            default: // Needs Work
                baseSpend = 3000 + Math.random() * 4000;
                baseReach = 8000 + Math.random() * 12000;
                baseImpressions = 15000 + Math.random() * 25000;
                baseClicks = 300 + Math.random() * 500;
                baseCTR = 1.0 + Math.random() * 0.8;
                baseCPC = 7.0 + Math.random() * 3.0;
                baseCPM = 18.0 + Math.random() * 5.0;
        }

        const startDate = new Date(2025, 0, 1 + Math.floor(Math.random() * 60));
        const endDate = new Date(startDate.getTime() + (30 + Math.random() * 30) * 24 * 60 * 60 * 1000);

        campaigns.push({
            id: i,
            name: `Shop-Intel - ${campaignType}`,
            accountName: account,
            spend: Math.round(baseSpend),
            reach: Math.round(baseReach),
            impressions: Math.round(baseImpressions),
            clicks: Math.round(baseClicks),
            ctr: Math.round(baseCTR * 100) / 100,
            cpc: Math.round(baseCPC * 100) / 100,
            cpm: Math.round(baseCPM * 100) / 100,
            performanceScore,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            status
        });
    }

    return campaigns;
};

const facebookCampaigns = generateFacebookCampaigns();

// Generate expanded Facebook ads data
const generateFacebookAds = () => {
    const ads: any[] = [];
    const adTypes = [
        "clothing Bar", "Truffle Box", "Gift Set", "Party Pack", "Luxury Collection",
        "Dark Delight", "Milk Magic", "White Wonder", "Hazelnut Heaven", "Caramel Dream",
        "Strawberry Surprise", "Mint Marvel", "Orange Bliss", "Raspberry Joy", "Vanilla Velvet",
        "Coconut Cream", "Almond Art", "Peanut Perfection", "Cookie Crunch", "Rocky Road",
        "Birthday Box", "Anniversary Gift", "Holiday Hamper", "Gift Wrapped", "Party Favor",
        "Luxury Line", "Artisan Special", "Organic Choice", "Sugar Free", "Gluten Free",
        "Kids Pack", "Adult Treat", "Corporate Gift", "Wedding Favor", "Graduation Gift",
        "Mother's Love", "Father's Pride", "Christmas Joy", "New Year Gift", "School Treat",
        "Halloween Fun", "Thanksgiving Feast", "Black Friday Deal", "Cyber Monday", "Flash Sale",
        "Limited Time", "Seasonal Special", "Regional Favorite", "International Mix", "Local Pride",
        "Morning Energy", "Afternoon Boost", "Evening Treat", "Midnight Snack", "Weekend Joy",
        "Workplace Reward", "Study Snack", "Gym Treat", "Travel Companion", "Home Comfort",
        "Date Night", "Movie Snack", "Game Night", "Book Club", "Coffee Break",
        "Tea Time", "Dessert Delight", "Snack Attack", "Treat Time", "Reward Box",
        "Achievement Gift", "Milestone Mark", "Success Story", "Victory Treat", "Celebration Box",
        "Memory Lane", "Nostalgic Treat", "Traditional Gift", "Heritage Box", "Legacy Collection",
        "Innovation Hub", "Revolutionary Mix", "Evolution Box", "Transformation Gift", "Discovery Pack",
        "Adventure Kit", "Exploration Box", "Journey Gift", "Experience Pack", "Adventure Treat",
        "Passion Project", "Love Gift", "Joy Box", "Happiness Pack", "Bliss Collection",
        "Comfort Zone", "Warmth Gift", "Cozy Treat", "Snug Box", "Peaceful Pack",
        "Energy Boost", "Vibrant Mix", "Dynamic Pack", "Active Treat", "Lively Gift",
        "Elegant Box", "Sophisticated Gift", "Refined Treat", "Classy Pack", "Premium Collection",
        "Playful Mix", "Fun Pack", "Cheerful Gift", "Bright Box", "Colorful Treat",
        "Mystery Box", "Intriguing Gift", "Fascinating Pack", "Captivating Treat", "Enchanting Box"
    ];

    const creativeTypes = ["Video", "Image", "Carousel", "Collection"];
    const statuses = ["Active", "Paused", "Completed"];
    const campaignNames = facebookCampaigns.map(c => c.name);

    for (let i = 1; i <= 120; i++) {
        const adType = adTypes[Math.floor(Math.random() * adTypes.length)];
        const creativeType = creativeTypes[Math.floor(Math.random() * creativeTypes.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const campaignName = campaignNames[Math.floor(Math.random() * campaignNames.length)];
        
        // Generate realistic metrics
        const baseSpend = 1000 + Math.random() * 5000;
        const baseReach = 5000 + Math.random() * 20000;
        const baseImpressions = 10000 + Math.random() * 40000;
        const baseClicks = 200 + Math.random() * 1000;
        const baseCTR = 1.5 + Math.random() * 1.5;
        const baseCPC = 4.0 + Math.random() * 4.0;
        const baseCPM = 10.0 + Math.random() * 10.0;

        ads.push({
            id: i,
            name: `Shop-Intel - ${adType}`,
            campaignName,
            spend: Math.round(baseSpend),
            reach: Math.round(baseReach),
            impressions: Math.round(baseImpressions),
            clicks: Math.round(baseClicks),
            ctr: Math.round(baseCTR * 100) / 100,
            cpc: Math.round(baseCPC * 100) / 100,
            cpm: Math.round(baseCPM * 100) / 100,
            creativeType,
            status
        });
    }

    return ads;
};

const facebookAds = generateFacebookAds();

// Chart data
const campaignPerformanceData = [
    { date: "Jan 15", spend: 12500, reach: 45000, impressions: 89000, clicks: 2200 },
    { date: "Jan 20", spend: 8900, reach: 32000, impressions: 65000, clicks: 1800 },
    { date: "Jan 25", spend: 15600, reach: 58000, impressions: 120000, clicks: 3100 },
    { date: "Jan 30", spend: 7200, reach: 28000, impressions: 52000, clicks: 1400 },
    { date: "Feb 05", spend: 9800, reach: 35000, impressions: 72000, clicks: 1900 },
    { date: "Feb 10", spend: 6800, reach: 25000, impressions: 48000, clicks: 1200 }
];

const getPerformanceColor = (score: string) => {
    switch (score) {
        case "Excellent": return "bg-green-500";
        case "Good": return "bg-blue-500";
        case "Average": return "bg-yellow-500";
        case "Needs Work": return "bg-red-500";
        default: return "bg-gray-500";
    }
};

const getPerformanceTextColor = (score: string) => {
    switch (score) {
        case "Excellent": return "text-green-600";
        case "Good": return "text-blue-600";
        case "Average": return "text-yellow-600";
        case "Needs Work": return "text-red-600";
        default: return "text-gray-600";
    }
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-MY").format(value);
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
    });
};

export default function FacebookMarketingDashboard() {
    const [activeTab, setActiveTab] = useState("campaigns");
    const [selectedAccount, setSelectedAccount] = useState("all");
    const [dateRange, setDateRange] = useState({ start: "2025-01-01", end: "2025-02-28" });
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMetric, setSelectedMetric] = useState("REACH");
    
    // Pagination state
    const [campaignPage, setCampaignPage] = useState(1);
    const [adPage, setAdPage] = useState(1);
    const itemsPerPage = 20;

    const filteredCampaigns = facebookCampaigns.filter(campaign =>
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.accountName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredAds = facebookAds.filter(ad =>
        ad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.campaignName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination calculations
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
        highestSpend: Math.max(...facebookCampaigns.map(c => c.spend)),
        highestReach: Math.max(...facebookCampaigns.map(c => c.reach)),
        highestImpressions: Math.max(...facebookCampaigns.map(c => c.impressions)),
        highestClicks: Math.max(...facebookCampaigns.map(c => c.clicks))
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        Facebook Marketing
                    </h1>
                    <p className="text-muted-foreground">Manage your Facebook campaigns and track performance</p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Accounts</SelectItem>
                            <SelectItem value="main">Shop-Intel Main</SelectItem>
                            <SelectItem value="secondary">Shop-Intel Secondary</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">Highest Spend</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{formatCurrency(metrics.highestSpend)}</div>
                        <p className="text-xs text-blue-600">Campaign: Hair Care Promotion</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">Highest Reach</CardTitle>
                        <Users className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{formatNumber(metrics.highestReach)}</div>
                        <p className="text-xs text-green-600">Campaign: Hair Care Promotion</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-600">Highest Impressions</CardTitle>
                        <Eye className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-700">{formatNumber(metrics.highestImpressions)}</div>
                        <p className="text-xs text-purple-600">Campaign: Hair Care Promotion</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-600">Highest Clicks</CardTitle>
                        <MousePointer className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-700">{formatNumber(metrics.highestClicks)}</div>
                        <p className="text-xs text-orange-600">Campaign: Hair Care Promotion</p>
                    </CardContent>
                </Card>
            </div>

            {/* Date Range and Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex gap-2">
                    <Input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-40"
                    />
                    <span className="flex items-center text-muted-foreground">to</span>
                    <Input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-40"
                    />
                </div>
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search campaigns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="campaigns" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Campaigns
                    </TabsTrigger>
                    <TabsTrigger value="ads" className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Ads
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="campaigns" className="space-y-6">
                    {/* Top Performing Campaigns */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-yellow-500" />
                                    Top Performing Campaigns
                                </CardTitle>
                                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="REACH">REACH</SelectItem>
                                        <SelectItem value="IMPRESSIONS">IMPRESSIONS</SelectItem>
                                        <SelectItem value="SPEND">SPEND</SelectItem>
                                        <SelectItem value="CLICKS">CLICKS</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {topCampaigns.map((campaign, index) => (
                                    <Card key={campaign.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">
                                                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}
                                                    </span>
                                                    <CardTitle className="text-sm">{campaign.name}</CardTitle>
                                                </div>
                                                <Badge className={getPerformanceColor(campaign.performanceScore)}>
                                                    {campaign.performanceScore}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Spend:</span>
                                                <span className="font-medium">{formatCurrency(campaign.spend)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">CTR:</span>
                                                <span className="font-medium">{campaign.ctr}%</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Rank:</span>
                                                <span className="font-medium">#{index + 1}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Campaign Analytics Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Campaign Performance Over Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={campaignPerformanceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Line type="monotone" dataKey="spend" stroke="#3B82F6" strokeWidth={2} />
                                    <Line type="monotone" dataKey="reach" stroke="#10B981" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* All Campaigns */}
                    <Card>
                        <CardHeader>
                            <CardTitle>All Campaigns</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {paginatedCampaigns.map((campaign) => (
                                    <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-sm">{campaign.name}</CardTitle>
                                                    <p className="text-xs text-muted-foreground">{campaign.accountName}</p>
                                                </div>
                                                <Badge className={getPerformanceColor(campaign.performanceScore)}>
                                                    {campaign.performanceScore}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Spend:</span>
                                                    <p className="font-medium">{formatCurrency(campaign.spend)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Reach:</span>
                                                    <p className="font-medium">{formatNumber(campaign.reach)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Impressions:</span>
                                                    <p className="font-medium">{formatNumber(campaign.impressions)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Clicks:</span>
                                                    <p className="font-medium">{formatNumber(campaign.clicks)}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                <div>
                                                    <span className="text-muted-foreground">CTR:</span>
                                                    <p className="font-medium">{campaign.ctr}%</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">CPC:</span>
                                                    <p className="font-medium">{formatCurrency(campaign.cpc)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">CPM:</span>
                                                    <p className="font-medium">{formatCurrency(campaign.cpm)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</span>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm">Details</Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle>{campaign.name} - Campaign Details</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-6">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <h4 className="font-semibold mb-2">Campaign Information</h4>
                                                                    <div className="space-y-2 text-sm">
                                                                        <div><span className="text-muted-foreground">Account:</span> {campaign.accountName}</div>
                                                                        <div><span className="text-muted-foreground">Status:</span> {campaign.status}</div>
                                                                        <div><span className="text-muted-foreground">Start Date:</span> {formatDate(campaign.startDate)}</div>
                                                                        <div><span className="text-muted-foreground">End Date:</span> {formatDate(campaign.endDate)}</div>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold mb-2">Performance Metrics</h4>
                                                                    <div className="space-y-2 text-sm">
                                                                        <div><span className="text-muted-foreground">Total Spend:</span> {formatCurrency(campaign.spend)}</div>
                                                                        <div><span className="text-muted-foreground">Reach:</span> {formatNumber(campaign.reach)}</div>
                                                                        <div><span className="text-muted-foreground">Impressions:</span> {formatNumber(campaign.impressions)}</div>
                                                                        <div><span className="text-muted-foreground">Clicks:</span> {formatNumber(campaign.clicks)}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold mb-2">Efficiency Metrics</h4>
                                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                                    <div>
                                                                        <span className="text-muted-foreground">CTR:</span>
                                                                        <p className="font-medium">{campaign.ctr}%</p>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-muted-foreground">CPC:</span>
                                                                        <p className="font-medium">{formatCurrency(campaign.cpc)}</p>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-muted-foreground">CPM:</span>
                                                                        <p className="font-medium">{formatCurrency(campaign.cpm)}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            {/* Campaign Pagination */}
                            <div className="flex items-center justify-between mt-6">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    disabled={campaignPage === 1}
                                    onClick={() => setCampaignPage(p => Math.max(1, p - 1))}
                                >
                                    Previous
                                </Button>
                                <div className="text-sm text-muted-foreground">
                                    Page {campaignPage} of {totalCampaignPages} ({filteredCampaigns.length} campaigns)
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    disabled={campaignPage === totalCampaignPages}
                                    onClick={() => setCampaignPage(p => Math.min(totalCampaignPages, p + 1))}
                                >
                                    Next
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="ads" className="space-y-6">
                    {/* Ads Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ad Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ad Name</TableHead>
                                        <TableHead>Campaign</TableHead>
                                        <TableHead>Creative Type</TableHead>
                                        <TableHead>Spend</TableHead>
                                        <TableHead>Reach</TableHead>
                                        <TableHead>CTR</TableHead>
                                        <TableHead>CPC</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedAds.map((ad) => (
                                        <TableRow key={ad.id}>
                                            <TableCell className="font-medium">{ad.name}</TableCell>
                                            <TableCell>{ad.campaignName}</TableCell>
                                            <TableCell>
                                                <Badge variant={ad.creativeType === "Video" ? "default" : "secondary"}>
                                                    {ad.creativeType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatCurrency(ad.spend)}</TableCell>
                                            <TableCell>{formatNumber(ad.reach)}</TableCell>
                                            <TableCell>{ad.ctr}%</TableCell>
                                            <TableCell>{formatCurrency(ad.cpc)}</TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-500">{ad.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {/* Ads Pagination */}
                            <div className="flex items-center justify-between mt-6">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    disabled={adPage === 1}
                                    onClick={() => setAdPage(p => Math.max(1, p - 1))}
                                >
                                    Previous
                                </Button>
                                <div className="text-sm text-muted-foreground">
                                    Page {adPage} of {totalAdPages} ({filteredAds.length} ads)
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    disabled={adPage === totalAdPages}
                                    onClick={() => setAdPage(p => Math.min(totalAdPages, p + 1))}
                                >
                                    Next
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
