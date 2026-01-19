"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
    TrendingUp, 
    DollarSign, 
    Eye, 
    MousePointer, 
    UserPlus,
    AlertTriangle,
    ShoppingCart,
    CreditCard,
    Package,
    RefreshCw
} from "lucide-react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip
} from "recharts";

// Campaign data with detailed metrics
const generateRandomDate = (start: Date, end: Date) => {
	const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
	return date.toISOString().split('T')[0]
}

const campaignNamePhrases = [
	"clothing Lovers",
	"Dark Indulgence",
	"Cocoa Crush",
	"Sweet Tooth Squad",
	"Velvet Delight",
	"Midnight Cacao",
	"Hazelnut Harmony",
	"Caramel Drizzle",
	"Mint Bliss",
	"Berry Burst",
	"Premium Truffle",
	"Crispy Crunch",
	"Silky Smooth",
	"Fudge Fantasy",
	"Cookie Crumble",
	"Mocha Magic",
	"Almond Avalanche",
	"Sea Salt Sensation",
	"Golden Praline",
	"Cacao Classic"
]

const objectives = ["Brand Awareness", "Conversions", "Traffic", "Engagement"]
const performances = ["Excellent", "Good", "Average"]
const statuses = ["Active", "Paused"]
const placements = ["Facebook Feed", "Instagram Stories", "Reels", "Audience Network"]
const formats = ["Video", "Image", "Carousel"]

const generateShopIntelCampaigns = (count: number) => {
	const list: any[] = []
	for (let i = 1; i <= count; i++) {
		const phrase = campaignNamePhrases[(i - 1) % campaignNamePhrases.length]
		const spend = Math.round((5000 + Math.random() * 25000) * 100) / 100
		const reach = Math.floor(20000 + Math.random() * 600000)
		const impressions = Math.floor(reach * (1.5 + Math.random() * 2.5))
		const clicks = Math.floor(impressions * (0.01 + Math.random() * 0.05))
		const ctr = Math.round((clicks / Math.max(impressions, 1)) * 10000) / 100
		const cpc = Math.round((spend / Math.max(clicks, 1)) * 100) / 100
		const conversions = Math.floor(clicks * (0.03 + Math.random() * 0.1))
		const roas = Math.round((1 + Math.random() * 4) * 100) / 100
		const purchaseRevenue = Math.round(spend * roas * 100) / 100
		const costPerPurchase = Math.round((spend / Math.max(conversions, 1)) * 100) / 100
		const cpm = Math.round(((spend / Math.max(impressions, 1)) * 1000) * 100) / 100
		const cpp = costPerPurchase
		const frequency = Math.round((1.2 + Math.random() * 3) * 100) / 100
		list.push({
			id: i,
			name: `Shop-Intel - ${phrase}`,
			objective: objectives[i % objectives.length],
			spend,
			reach,
			impressions,
			clicks,
			ctr,
			cpc,
			conversions,
			roas,
			status: statuses[i % statuses.length],
			performance: performances[i % performances.length],
			accountName: `Shop-Intel Account ${((i - 1) % 9) + 1}`,
			currency: "MYR",
			startDate: generateRandomDate(new Date(2024, 0, 1), new Date(2024, 11, 1)),
			endDate: generateRandomDate(new Date(2025, 0, 1), new Date(2025, 11, 1)),
			purchaseCount: conversions,
			purchaseRevenue,
			costPerPurchase,
			cpm,
			cpp,
			frequency
		})
	}
	return list
}

const campaigns: any[] = generateShopIntelCampaigns(120)

const generateShopIntelAdSets = (count: number) => {
	const list: any[] = []
	for (let i = 1; i <= count; i++) {
		const phrase = campaignNamePhrases[(i + 5) % campaignNamePhrases.length]
		const spend = Math.round((3000 + Math.random() * 20000) * 100) / 100
		const impressions = Math.floor(50000 + Math.random() * 1200000)
		const reach = Math.floor(impressions * (0.3 + Math.random() * 0.4))
		const clicks = Math.floor(impressions * (0.01 + Math.random() * 0.05))
		const ctr = Math.round((clicks / Math.max(impressions, 1)) * 10000) / 100
		const cpc = Math.round((spend / Math.max(clicks, 1)) * 100) / 100
		const conversions = Math.floor(clicks * (0.03 + Math.random() * 0.1))
		const roas = Math.round((1 + Math.random() * 4) * 100) / 100
		const purchaseRevenue = Math.round(spend * roas * 100) / 100
		const costPerPurchase = Math.round((spend / Math.max(conversions, 1)) * 100) / 100
		const cpm = Math.round(((spend / Math.max(impressions, 1)) * 1000) * 100) / 100
		const cpp = costPerPurchase
		const frequency = Math.round((1.2 + Math.random() * 3) * 100) / 100
		list.push({
			id: i,
			name: `Shop-Intel - ${phrase}`,
			placement: placements[i % placements.length],
			spend,
			impressions,
			reach,
			ctr,
			cpc,
			conversions,
			roas,
			accountName: `Shop-Intel Account ${((i - 1) % 9) + 1}`,
			currency: "MYR",
			startDate: generateRandomDate(new Date(2024, 0, 1), new Date(2024, 11, 1)),
			endDate: generateRandomDate(new Date(2025, 0, 1), new Date(2025, 11, 1)),
			purchaseCount: conversions,
			purchaseRevenue,
			costPerPurchase,
			cpm,
			cpp,
			frequency
		})
	}
	return list
}

const adSets: any[] = generateShopIntelAdSets(120)

const generateShopIntelCreatives = (count: number) => {
	const list: any[] = []
	for (let i = 1; i <= count; i++) {
		const phrase = campaignNamePhrases[(i + 10) % campaignNamePhrases.length]
		const spend = Math.round((1500 + Math.random() * 10000) * 100) / 100
		const impressions = Math.floor(20000 + Math.random() * 500000)
		const ctr = Math.round((1 + Math.random() * 6) * 100) / 100
		const cpc = Math.round((spend / Math.max(1, Math.floor(impressions * (ctr / 100)))) * 100) / 100
		const conversions = Math.floor((impressions * (ctr / 100)) * (0.05 + Math.random() * 0.12))
		const engagement_rate = Math.round((3 + Math.random() * 10) * 100) / 100
		list.push({
			id: i,
			name: `Shop-Intel - ${phrase}`,
			format: formats[i % formats.length],
			duration: formats[i % formats.length] === 'Video' ? `${10 + (i % 20)}s` : undefined,
			cards: formats[i % formats.length] === 'Carousel' ? (2 + (i % 4)) : undefined,
			spend,
			impressions,
			ctr,
			cpc,
			conversions,
			engagement_rate,
			accountName: `Shop-Intel Account ${((i - 1) % 9) + 1}`,
			currency: "MYR",
			startDate: generateRandomDate(new Date(2024, 0, 1), new Date(2024, 11, 1)),
			endDate: generateRandomDate(new Date(2025, 0, 1), new Date(2025, 11, 1)),
			purchaseCount: conversions,
			purchaseRevenue: Math.round(spend * (1 + Math.random() * 4) * 100) / 100,
			costPerPurchase: Math.round((spend / Math.max(conversions, 1)) * 100) / 100,
			cpm: Math.round(((spend / Math.max(impressions, 1)) * 1000) * 100) / 100,
			cpp: Math.round((spend / Math.max(conversions, 1)) * 100) / 100,
			frequency: Math.round((1.2 + Math.random() * 3) * 100) / 100
		})
	}
	return list
}

const creatives: any[] = generateShopIntelCreatives(120)

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

// Helper functions for dynamic charts
const getMetricColor = (metric: string) => {
    switch (metric) {
        case "reach": return "#10B981"; // Green
        case "impressions": return "#3B82F6"; // Blue
        case "spend": return "#10B981"; // Green
        case "clicks": return "#3B82F6"; // Blue
        case "cpm": return "#8B5CF6"; // Purple
        case "cpc": return "#F59E0B"; // Orange
        case "ctr": return "#EF4444"; // Red
        case "cpp": return "#06B6D4"; // Cyan
        default: return "#10B981";
    }
};

const getMetricLabel = (metric: string) => {
    switch (metric) {
        case "reach": return "Reach";
        case "impressions": return "Impressions";
        case "spend": return "Spend (RM)";
        case "clicks": return "Clicks";
        case "cpm": return "CPM (RM)";
        case "cpc": return "CPC (RM)";
        case "ctr": return "CTR (%)";
        case "cpp": return "CPP (RM)";
        default: return "Reach";
    }
};

const getMetricDataKey = (metric: string) => {
    switch (metric) {
        case "reach": return "reach";
        case "impressions": return "impressions";
        case "spend": return "spend";
        case "clicks": return "clicks";
        case "cpm": return "cpm";
        case "cpc": return "cpc";
        case "ctr": return "ctr";
        case "cpp": return "cpp";
        default: return "reach";
    }
};

// Chart data for overview
const metricDistributionData = [
    { name: "Shop-Intel Ad 1", value: 31, color: "#10B981" },
    { name: "Shop-Intel Ad 2", value: 18, color: "#3B82F6" },
    { name: "Shop-Intel Ad 3", value: 17, color: "#8B5CF6" },
    { name: "Shop-Intel Ad 4", value: 25, color: "#EF4444" },
    { name: "Shop-Intel Ad 5", value: 9, color: "#F59E0B" }
];

const metricPerformanceData = [
    { name: "Shop-Intel Ad 1", reach: 180000, impressions: 450000, spend: 8500, clicks: 12000, cpm: 18.89, cpc: 0.71, ctr: 2.67, cpp: 47.22 },
    { name: "Shop-Intel Ad 2", reach: 520000, impressions: 1200000, spend: 18500, clicks: 28000, cpm: 15.42, cpc: 0.66, ctr: 2.33, cpp: 66.07 },
    { name: "Shop-Intel Ad 3", reach: 95000, impressions: 220000, spend: 6800, clicks: 8500, cpm: 30.91, cpc: 0.80, ctr: 3.86, cpp: 71.58 },
    { name: "Shop-Intel Ad 4", reach: 420000, impressions: 980000, spend: 15600, clicks: 24000, cpm: 15.92, cpc: 0.65, ctr: 2.45, cpp: 65.00 },
    { name: "Shop-Intel Ad 5", reach: 320000, impressions: 750000, spend: 12800, clicks: 19000, cpm: 17.07, cpc: 0.67, ctr: 2.53, cpp: 142.22 }
];

// Detailed Campaign Modal Component
const CampaignDetailModal = ({ campaign, isOpen, onClose }: { campaign: any; isOpen: boolean; onClose: () => void }) => {
    if (!campaign) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{campaign.name}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <div className="text-sm text-blue-600">Total Spend</div>
                            <div className="text-xl font-bold text-blue-700">{formatCurrency(campaign.spend)}</div>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                            <div className="text-sm text-green-600">Reach</div>
                            <div className="text-xl font-bold text-green-700">{formatNumber(campaign.reach)}</div>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                            <div className="text-sm text-purple-600">Impressions</div>
                            <div className="text-xl font-bold text-purple-700">{formatNumber(campaign.impressions)}</div>
                        </div>
                        <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                            <div className="text-sm text-orange-600">Clicks</div>
                            <div className="text-xl font-bold text-orange-700">{formatNumber(campaign.clicks)}</div>
                        </div>
                    </div>

                    {/* Business Performance Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Business Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">Purchase Count</div>
                                    <div className="text-lg font-semibold">{formatNumber(campaign.purchaseCount)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Purchase Revenue</div>
                                    <div className="text-lg font-semibold">{formatCurrency(campaign.purchaseRevenue)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">ROAS</div>
                                    <div className="text-lg font-semibold">{campaign.roas}x</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Cost Per Purchase</div>
                                    <div className="text-lg font-semibold">{formatCurrency(campaign.costPerPurchase)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* CTR and Audience Quality */}
                    <Card>
                        <CardHeader>
                            <CardTitle>CTR & Audience Quality</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">CTR All</div>
                                    <div className="text-lg font-semibold">{campaign.ctr}%</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Link Click CTR</div>
                                    <div className="text-lg font-semibold">1.33%</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Audience Quality</div>
                                    <div className="text-lg font-semibold">0.30</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Cost Per Checkout</div>
                                    <div className="text-lg font-semibold">RM 16</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cost Efficiency Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cost Efficiency Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">CPM</div>
                                    <div className="text-lg font-semibold">{formatCurrency(campaign.cpm)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">CPP</div>
                                    <div className="text-lg font-semibold">{formatCurrency(campaign.cpp)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Frequency</div>
                                    <div className="text-lg font-semibold">{campaign.frequency}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">CPC</div>
                                    <div className="text-lg font-semibold">{formatCurrency(campaign.cpc)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Revenue Generating Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Generating Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <div className="font-medium">Onsite Web App Purchase</div>
                                            <div className="text-sm text-muted-foreground">Conversions: {campaign.purchaseCount}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{formatCurrency(campaign.purchaseRevenue)}</div>
                                        <div className="text-sm text-muted-foreground">Cost per Conversion: {formatCurrency(campaign.costPerPurchase)}</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Eye className="h-5 w-5 text-green-600" />
                                        <div>
                                            <div className="font-medium">Offsite Conversion.Fb Pixel View Content</div>
                                            <div className="text-sm text-muted-foreground">Conversions: 9,560</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">RM 1,595,854</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <div className="font-medium">Offsite Conversion.Fb Pixel Add Payment Info</div>
                                            <div className="text-sm text-muted-foreground">Conversions: 181</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">RM 28,222</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Package className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <div className="font-medium">Offsite Conversion.Fb Pixel Add To Cart</div>
                                            <div className="text-sm text-muted-foreground">Conversions: 2,208</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">RM 423,673</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ad Details & Metadata */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ad Details & Metadata</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Campaign ID:</span>
                                    <div className="font-medium">120223683483850451</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Campaign Name:</span>
                                    <div className="font-medium">{campaign.name}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Campaign Period:</span>
                                    <div className="font-medium">{campaign.startDate} to {campaign.endDate}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Account Name:</span>
                                    <div className="font-medium">{campaign.accountName}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Currency:</span>
                                    <div className="font-medium">{campaign.currency}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Created Time:</span>
                                    <div className="font-medium">2025-05-05</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function FacebookMarketingTab() {
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState("reach");
	// Pagination state
	const [campaignPage, setCampaignPage] = useState(1);
	const [adsetPage, setAdsetPage] = useState(1);
	const itemsPerPage = 20;

	// Derived pagination slices
	const totalCampaignPages = Math.ceil(campaigns.length / itemsPerPage);
	const totalAdsetPages = Math.ceil(adSets.length / itemsPerPage);
	const paginatedCampaigns = campaigns.slice((campaignPage - 1) * itemsPerPage, campaignPage * itemsPerPage);
	const paginatedAdSets = adSets.slice((adsetPage - 1) * itemsPerPage, adsetPage * itemsPerPage);

    const openCampaignModal = (campaign: any) => {
        setSelectedCampaign(campaign);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Facebook Marketing Dashboard</h2>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                    <TabsTrigger value="adsets">Ad Sets</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-bold">Performance Overview</CardTitle>
                                    <p className="text-sm text-muted-foreground">Spend (RM) • Top 20</p>
                                    <p className="text-lg font-medium">Ad performance by {getMetricLabel(selectedMetric).toLowerCase()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="reach">By Reach</SelectItem>
                                            <SelectItem value="impressions">By Impressions</SelectItem>
                                            <SelectItem value="spend">By Spend</SelectItem>
                                            <SelectItem value="clicks">By Clicks</SelectItem>
                                            <SelectItem value="cpm">By CPM</SelectItem>
                                            <SelectItem value="cpc">By CPC</SelectItem>
                                            <SelectItem value="ctr">By CTR</SelectItem>
                                            <SelectItem value="cpp">By CPP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <RefreshCw className="h-4 w-4" />
                                        <span>Ref</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Metric Distribution - Pie Chart */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Metric Distribution</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={metricDistributionData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, value }) => `${name} (${value}%)`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {metricDistributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Metric Performance - Line Chart */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Metric Performance</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart
                                            data={metricPerformanceData}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Line 
                                                type="monotone" 
                                                dataKey={getMetricDataKey(selectedMetric)} 
                                                stroke={getMetricColor(selectedMetric)} 
                                                strokeWidth={3}
                                                dot={{ fill: getMetricColor(selectedMetric), strokeWidth: 2, r: 6 }}
                                                activeDot={{ r: 8, stroke: getMetricColor(selectedMetric), strokeWidth: 2 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="campaigns">
                    <Card>
                        <CardHeader>
                            <CardTitle>Campaigns</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Campaign</TableHead>
                                        <TableHead>Objective</TableHead>
                                        <TableHead>Spend</TableHead>
                                        <TableHead>Reach</TableHead>
                                        <TableHead>CTR</TableHead>
                                        <TableHead>CPC</TableHead>
                                        <TableHead>Conversions</TableHead>
                                        <TableHead>ROAS</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
									{paginatedCampaigns.map((campaign) => (
                                        <TableRow key={campaign.id}>
                                            <TableCell className="font-medium">{campaign.name}</TableCell>
                                            <TableCell>{campaign.objective}</TableCell>
                                            <TableCell>{formatCurrency(campaign.spend)}</TableCell>
                                            <TableCell>{formatNumber(campaign.reach)}</TableCell>
                                            <TableCell>{campaign.ctr}%</TableCell>
                                            <TableCell>{formatCurrency(campaign.cpc)}</TableCell>
                                            <TableCell>{formatNumber(campaign.conversions)}</TableCell>
                                            <TableCell>{campaign.roas}x</TableCell>
                                            <TableCell>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => openCampaignModal(campaign)}
                                                >
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
							<div className="flex items-center justify-between mt-4">
								<Button variant="outline" size="sm" disabled={campaignPage === 1} onClick={() => setCampaignPage(p => Math.max(1, p - 1))}>Previous</Button>
								<div className="text-sm">Page {campaignPage} of {totalCampaignPages}</div>
								<Button variant="outline" size="sm" disabled={campaignPage === totalCampaignPages} onClick={() => setCampaignPage(p => Math.min(totalCampaignPages, p + 1))}>Next</Button>
							</div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="adsets">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ad Sets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ad Set</TableHead>
                                        <TableHead>Spend</TableHead>
                                        <TableHead>Impressions</TableHead>
                                        <TableHead>CTR</TableHead>
                                        <TableHead>CPC</TableHead>
                                        <TableCell>Conversions</TableCell>
                                        <TableCell>ROAS</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
									{paginatedAdSets.map((adset) => (
                                        <TableRow key={adset.id}>
                                            <TableCell className="font-medium">{adset.name}</TableCell>
                                            <TableCell>{formatCurrency(adset.spend)}</TableCell>
                                            <TableCell>{formatNumber(adset.impressions)}</TableCell>
                                            <TableCell>{adset.ctr}%</TableCell>
                                            <TableCell>{formatCurrency(adset.cpc)}</TableCell>
                                            <TableCell>{formatNumber(adset.conversions)}</TableCell>
                                            <TableCell>{adset.roas}x</TableCell>
                                            <TableCell>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => openCampaignModal(adset)}
                                                >
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
							<div className="flex items-center justify-between mt-4">
								<Button variant="outline" size="sm" disabled={adsetPage === 1} onClick={() => setAdsetPage(p => Math.max(1, p - 1))}>Previous</Button>
								<div className="text-sm">Page {adsetPage} of {totalAdsetPages}</div>
								<Button variant="outline" size="sm" disabled={adsetPage === totalAdsetPages} onClick={() => setAdsetPage(p => Math.min(totalAdsetPages, p + 1))}>Next</Button>
							</div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="creatives">
                    <Card>
                        <CardHeader>
                            <CardTitle>Creatives</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Creative</TableHead>
                                        <TableHead>Format</TableHead>
                                        <TableHead>Spend</TableHead>
                                        <TableHead>Impressions</TableHead>
                                        <TableHead>CTR</TableHead>
                                        <TableHead>CPC</TableHead>
                                        <TableCell>Conversions</TableCell>
                                        <TableCell>Engagement Rate</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {creatives.map((creative) => (
                                        <TableRow key={creative.id}>
                                            <TableCell className="font-medium">{creative.name}</TableCell>
                                            <TableCell>{creative.format}</TableCell>
                                            <TableCell>{formatCurrency(creative.spend)}</TableCell>
                                            <TableCell>{formatNumber(creative.impressions)}</TableCell>
                                            <TableCell>{creative.ctr}%</TableCell>
                                            <TableCell>{formatCurrency(creative.cpc)}</TableCell>
                                            <TableCell>{formatNumber(creative.conversions)}</TableCell>
                                            <TableCell>{creative.engagement_rate}%</TableCell>
                                            <TableCell>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => openCampaignModal(creative)}
                                                >
                                                    View Details
                                                </Button>
                                                </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Campaign Detail Modal */}
            <CampaignDetailModal 
                campaign={selectedCampaign}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
