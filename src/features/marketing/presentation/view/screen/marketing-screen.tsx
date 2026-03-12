"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
    Plus,
    DollarSign, 
    Target,
    ExternalLink,
    Activity,
    Clock,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Trash2,
    TrendingUp,
    Package,
    Edit,
    Filter,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Import the hooks and types
import { 
    useMarketingAnalytics, 
    useCreateMarketing, 
    useDeleteMarketingItem
} from "../../tanstack/marketing-tanstack";
import { 
    MarketingFilters, 
    CreateMarketingItemRequest,
    MarketingItem
} from "../../../data/model/marketing-entity";
import { MarketingChart } from "@/src/features/marketing/presentation/view/components/marketing-chart";
import { MarketingDialog } from "@/src/features/marketing/presentation/view/components/marketing-dialog";
import { EditDialog } from "@/src/features/marketing/presentation/view/components/edit-dialog";
import AddMarketingItemDialog from "../components/add-marketing-item-dialog";
import { MarketingMetricsDisplay } from "../components/marketing-metrics-display";

interface CampaignForm {
    name: string;
    items: CreateMarketingItemRequest[];
}

const MarketingScreen = () => {
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)),
        endDate: new Date()
    });
    const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MarketingItem | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
    const [campaignForm, setCampaignForm] = useState<CampaignForm>({
        name: "",
        items: [{
            name: "",
            description: "",
            cost: 0,
            duration: 7,
            start_date: new Date().toISOString().split('T')[0],
            links: [{
                link: "",
                platform: "FACEBOOK"
            }]
        }]
    });

    // API filters based on date range and platform
    const apiFilters: MarketingFilters = useMemo(() => {
        const filters: MarketingFilters = {
            start_date: format(dateRange.startDate, 'yyyy-MM-dd'),
            end_date: format(dateRange.endDate, 'yyyy-MM-dd'),
        };
        
        if (selectedPlatform && selectedPlatform !== 'all') {
            filters.platform = selectedPlatform;
        }
        
        return filters;
    }, [dateRange.startDate, dateRange.endDate, selectedPlatform]);

    // Use the analytics hook
    const { analytics, isLoading, error, marketingItems } = useMarketingAnalytics(apiFilters);
    const createMarketingMutation = useCreateMarketing();
    const deleteMarketingItemMutation = useDeleteMarketingItem();

    // Filter marketing items based on search query
    const filteredMarketingItems = useMemo(() => {
        if (!searchQuery.trim()) {
            return marketingItems;
        }
        
        const query = searchQuery.toLowerCase();
        return marketingItems.filter(item => 
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.marketing.name.toLowerCase().includes(query) ||
            item.marketing_links?.some(link => 
                link.platform.toLowerCase().includes(query)
            )
        );
    }, [marketingItems, searchQuery]);

    // Group marketing items by month and campaign
    const groupedMarketingItems = useMemo(() => {
        const groupedByMonth: Record<string, { month: string; campaigns: any[] }> = {};
        
        filteredMarketingItems.forEach(item => {
            const startDate = new Date(item.start_date);
            const monthKey = format(startDate, 'yyyy-MM');
            const monthDisplay = format(startDate, 'MMMM yyyy');
            
            if (!groupedByMonth[monthKey]) {
                groupedByMonth[monthKey] = {
                    month: monthDisplay,
                    campaigns: []
                };
            }
            
            // Find existing campaign or create new one
            const existingCampaign = groupedByMonth[monthKey].campaigns.find(
                c => c.campaign.id === item.marketing_id
            );
            
            if (existingCampaign) {
                existingCampaign.items.push(item);
            } else {
                groupedByMonth[monthKey].campaigns.push({
                    campaign: item.marketing,
                    items: [item]
                });
            }
        });
        
        // Convert to array and sort by month (newest first)
        return Object.entries(groupedByMonth)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([monthKey, data]) => ({
                monthKey,
                ...data
            }));
    }, [filteredMarketingItems]);

    const handleCampaignFormChange = (field: keyof CampaignForm, value: any) => {
        setCampaignForm(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index: number, field: keyof CreateMarketingItemRequest, value: any) => {
        setCampaignForm(prev => ({
            ...prev,
            items: prev.items.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const addNewItem = () => {
        setCampaignForm(prev => ({
            ...prev,
            items: [...prev.items, {
                name: "",
                description: "",
                cost: 0,
                duration: 7,
                start_date: new Date().toISOString().split('T')[0],
                links: [{
                    link: "",
                    platform: "FACEBOOK"
                }]
            }]
        }));
    };

    const removeItem = (index: number) => {
        setCampaignForm(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        // This function is likely unused since we're using MarketingDialog component
        // But keeping it for backward compatibility
        if (!campaignForm.name || campaignForm.items.length === 0) {
            // Using console.warn instead of alert for better UX
            console.warn('Please fill in all required fields');
            return;
        }

        try {
            await createMarketingMutation.mutateAsync({
                name: campaignForm.name,
                marketing_items: campaignForm.items.map(item => ({
                    ...item,
                    start_date: new Date(item.start_date).toISOString()
                }))
            });
            
            setIsDialogOpen(false);
            setCampaignForm({
                name: "",
                items: [{
                    name: "",
                    description: "",
                    cost: 0,
                    duration: 7,
                    start_date: new Date().toISOString().split('T')[0],
                    links: [{
                        link: "",
                        platform: "FACEBOOK"
                    }]
                }]
            });
        } catch (error) {
            console.error('Failed to create campaign:', error);
        }
    };

    const handleDeleteMarketingItem = async (id: string) => {
        setItemToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        
        try {
            await deleteMarketingItemMutation.mutateAsync(itemToDelete);
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        } catch (error) {
            console.error('Failed to delete item:', error);
            // You could add a toast notification here instead of alert
        }
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const handleEditItem = (item: MarketingItem) => {
        setEditingItem(item);
    };

    const toggleMonthExpansion = (monthKey: string) => {
        setExpandedMonths(prev => {
            const newSet = new Set(prev);
            if (newSet.has(monthKey)) {
                newSet.delete(monthKey);
            } else {
                newSet.add(monthKey);
            }
            return newSet;
        });
    };

    const isMonthExpanded = (monthKey: string) => {
        return expandedMonths.has(monthKey);
    };

    const getPlatformColor = (platform: string) => {
        const base = "bg-muted/40"
        const map: Record<string, string> = {
            FACEBOOK: "bg-primary/15",
            INSTAGRAM: "bg-primary/15",
            TIKTOK: "bg-primary/15",
            YOUTUBE: "bg-primary/20",
            GOOGLE: "bg-primary/15",
            OTHER: base,
        }
        return map[platform] || base
    };

    const getStatusBadge = (item: MarketingItem) => {
        const now = new Date();
        const startDate = new Date(item.start_date);
        const endDate = new Date(item.end_date);

        if (now < startDate) {
            return (
                <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Upcoming
                </Badge>
            );
        } else if (now >= startDate && now <= endDate) {
            return (
                <Badge
                    className="text-xs border border-[rgba(var(--preset-primary-rgb),0.4)] bg-[rgba(var(--preset-primary-rgb),0.08)] text-[var(--preset-primary)]"
                >
                    <Activity className="w-3 h-3 mr-1" />
                    Active
                </Badge>
            );
        } else {
            return (
                <Badge variant="outline" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                </Badge>
            );
        }
    };

    const getDurationDisplay = (duration: number) => {
        return `${duration} day${duration !== 1 ? 's' : ''}`;
    };

    const getCampaignTotalCost = (items: MarketingItem[]) => {
        return items.reduce((total, item) => total + item.cost, 0);
    };

    const getCampaignActiveItems = (items: MarketingItem[]) => {
        const now = new Date();
        return items.filter(item => {
            const startDate = new Date(item.start_date);
            const endDate = new Date(item.end_date);
            return now >= startDate && now <= endDate;
        }).length;
    };

    // Financial metrics similar to TikTok dashboard
    const financialMetrics = [
        {
            title: "Total Spend",
            value: `RM${analytics.totalCost.toLocaleString()}`,
            change: "+12.5%",
            trending: "up",
            icon: <DollarSign className="h-5 w-5" style={{ color: "var(--preset-lighter)" }} />,
            description: "Total marketing investment"
        },
        {
            title: "Campaign Items",
            value: analytics.totalItems,
            change: "+8.2%",
            trending: "up",
            icon: <Package className="h-5 w-5" style={{ color: "var(--preset-lighter)" }} />,
            description: "Active marketing items"
        },
        {
            title: "Active Items",
            value: analytics.activeItems,
            change: "-2.1%",
            trending: "down",
            icon: <Activity className="h-5 w-5" style={{ color: "var(--preset-lighter)" }} />,
            description: "Currently running"
        },
        {
            title: "Avg Cost",
            value: `RM${analytics.avgCostPerItem.toFixed(0)}`,
            change: "+5.3%",
            trending: "up",
            icon: <TrendingUp className="h-5 w-5" style={{ color: "var(--preset-lighter)" }} />,
            description: "Per campaign item"
        }
    ];

    const handleStartDateSelect = (date: Date | undefined) => {
        if (date) {
            setDateRange(prev => ({ ...prev, startDate: date }));
        }
    };

    const handleEndDateSelect = (date: Date | undefined) => {
        if (date) {
            setDateRange(prev => ({ ...prev, endDate: date }));
        }
    };

    // Replace the DateRangeSelector component with this improved version
    const DateRangeSelector = () => (
        <div className="w-full space-y-6 md:space-y-0 md:flex md:items-end md:gap-8">
            <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" style={{ color: "var(--preset-lighter)" }} />
                    <Label className="text-sm font-medium">Filter Marketing Data</Label>
                </div>
                
                {/* Platform Filter */}
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Platform</Label>
                    <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="All platforms" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All platforms</SelectItem>
                            <SelectItem value="FACEBOOK">Facebook</SelectItem>
                            <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                            <SelectItem value="TIKTOK">TikTok</SelectItem>
                            <SelectItem value="YOUTUBE">YouTube</SelectItem>
                            <SelectItem value="GOOGLE">Google</SelectItem>
                            <SelectItem value="TWITTER">Twitter</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Range */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={`w-full justify-start text-left font-normal ${!dateRange.startDate && "text-muted-foreground"}`}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange.startDate ? format(dateRange.startDate, "PPP") : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dateRange.startDate}
                                    onSelect={handleStartDateSelect}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">End Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={`w-full justify-start text-left font-normal ${!dateRange.endDate && "text-muted-foreground"}`}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange.endDate ? format(dateRange.endDate, "PPP") : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dateRange.endDate}
                                    onSelect={handleEndDateSelect}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>
        </div>
    );

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) {
            return 'N/A';
        }
        return format(parseISO(dateString), 'MMM d, yyyy');
    };

    if (error) {
    return (
            <div className="min-h-screen bg-background p-6 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
                        <p className="text-muted-foreground mb-4">Failed to load marketing data. Please try again.</p>
                        <Button onClick={() => window.location.reload()} className="w-full">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start gap-6 w-full max-w-none">
            {/* Header */}
            <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <div>
                    <h2 className="text-2xl font-bold mt-8">Marketing Analytics Dashboard</h2>
                    <p className="text-muted-foreground">
                        {isLoading ? 'Loading...' : `Campaign metrics & performance analysis`}
                    </p>
                </div>
            </div>

            {/* Date Range & Create Button */}
            <Card className="w-full p-4">
                <DateRangeSelector />
            </Card>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-20 w-full">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                        <span className="text-lg">Loading marketing data...</span>
                    </div>
                </div>
            )}

            {!isLoading && (
                <>
                    {/* Main Dashboard Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full">
                        {/* Financial Overview Cards - 2x2 Grid */}
                        <div className="lg:col-span-2 h-[320px]">
                            <div className="grid grid-cols-2 gap-4 h-full">
                                {financialMetrics.map((metric, index) => (
                                    <Card key={index} className="rounded-lg border p-6 flex flex-col justify-between">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                {metric.icon}
                                                <span className="text-xs font-medium text-muted-foreground">{metric.title}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <div className="text-2xl font-bold">{metric.value}</div>
                                            <div className="text-xs text-muted-foreground mt-1">{metric.description}</div>
                            </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Marketing Performance Chart */}
                        <div className="lg:col-span-3 h-[320px]">
                            <div className="h-full">
                                <MarketingChart startDate={dateRange.startDate} endDate={dateRange.endDate} platform={selectedPlatform !== 'all' ? selectedPlatform : undefined} />
                            </div>
                        </div>
                    </div>

                    {/* Marketing Campaigns List */}
                    <Card className="w-full">
                        <CardHeader className="border-b border-border">
                    <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                <Target className="h-5 w-5" style={{ color: "var(--preset-lighter)" }} />
                                Marketing Campaigns ({groupedMarketingItems.reduce((total, month) => total + month.campaigns.length, 0)})
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Search Bar */}
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="Search campaigns"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-64 h-9 pr-8"
                                        />
                                        <Filter className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <MarketingDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} isLoading={isLoading} />
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {groupedMarketingItems.length === 0 ? (
                                <div className="text-center py-20">
                                    <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No marketing campaigns found</h3>
                                    <p className="text-muted-foreground mb-6">Get started by creating your first marketing campaign</p>
                                    <Button onClick={() => setIsDialogOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Campaign
                                    </Button>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {groupedMarketingItems.map((monthGroup) => (
                                        <div key={monthGroup.monthKey} className="p-4">
                                            {/* Month Header with Toggle */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <h2 className="text-xl font-bold text-foreground">
                                                        {monthGroup.month}
                                                    </h2>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {monthGroup.campaigns.length} campaign{monthGroup.campaigns.length !== 1 ? 's' : ''}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <AddMarketingItemDialog
                                                        marketingId={monthGroup.campaigns[0]?.campaign?.id || ''}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleMonthExpansion(monthGroup.monthKey)}
                                                        className="flex items-center gap-2 text-[var(--preset-primary)] hover:text-[var(--preset-primary)]/90 hover:bg-[rgba(var(--preset-primary-rgb),0.08)]"
                                                    >
                                                        {isMonthExpanded(monthGroup.monthKey) ? (
                                                            <>
                                                                <ChevronUp className="h-4 w-4" />
                                                                Show Less
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown className="h-4 w-4" />
                                                                Show More
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Campaigns (only show if expanded) */}
                                            {isMonthExpanded(monthGroup.monthKey) && (
                                                <div className="space-y-3">
                                                    {monthGroup.campaigns.map((campaignGroup) => (
                                                        <div key={campaignGroup.campaign.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                                                            {/* Campaign Header */}
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-[var(--preset-primary)]">{campaignGroup.campaign.name}</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            Campaign ID: {campaignGroup.campaign.id.slice(0, 8)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-[var(--preset-primary)]">
                                                            RM{getCampaignTotalCost(campaignGroup.items).toLocaleString()}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Total Campaign Cost
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Campaign Summary */}
                                                <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
                                                    <div className="text-center">
                                                        <div className="text-lg font-semibold">{campaignGroup.items.length}</div>
                                                        <div className="text-xs text-muted-foreground">Total Items</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-lg font-semibold">{getCampaignActiveItems(campaignGroup.items)}</div>
                                                        <div className="text-xs text-muted-foreground">Active Items</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-lg font-semibold">
                                                            RM{(getCampaignTotalCost(campaignGroup.items) / campaignGroup.items.length).toFixed(0)}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">Avg Cost/Item</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Campaign Items */}
                                            <div className="space-y-3">
                                                <h4 className="text-lg font-semibold text-muted-foreground">Marketing Items</h4>
                                                <div className="grid gap-3">
                                                    {campaignGroup.items.map((item: MarketingItem) => (
                                                        <Card key={item.id} className="border-l-4 border-l-[var(--preset-primary)]">
                                                            <CardContent className="p-3">
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-3 mb-2">
                                                                            <h5 className="text-lg font-semibold">{item.name}</h5>
                                                                            {getStatusBadge(item)}
                                                                            <div className="flex gap-2">
                                                                                                                                                {item.marketing_links && item.marketing_links.map((link: any, linkIndex: number) => (
                                                                    <Badge key={linkIndex} variant="outline" className={`${getPlatformColor(link.platform)} bg-opacity-10 text-xs`}>
                                                                        {link.platform}
                                                                    </Badge>
                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                                                                    </div>
                                                                    <div className="flex items-start gap-6">
                                                                        <div className="text-right">
                                                                            <div className="text-xl font-bold text-[var(--preset-primary)]">
                                                                                RM{item.cost.toLocaleString()}
                                                                            </div>
                                                                            <div className="text-sm text-muted-foreground">
                                                                                {getDurationDisplay(item.duration)}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleEditItem(item)}
                                                                                className="text-muted-foreground hover:text-foreground hover:bg-muted/20"
                                                                            >
                                                                                <Edit className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleDeleteMarketingItem(item.id)}
                                                                                disabled={deleteMarketingItemMutation.isPending}
                                                                                className="text-destructive hover:text-destructive bg-transparent hover:bg-destructive/10"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-2 bg-muted/20 rounded-lg mb-4">
                                                                    <div className="space-y-1">
                                                                        <span className="text-xs text-muted-foreground">Start Date</span>
                                                                        <p className="text-sm font-medium">{formatDate(item.start_date)}</p>
                                                                    </div>
                                                                    
                                                                    <div className="space-y-1">
                                                                        <span className="text-xs text-muted-foreground">End Date</span>
                                                                        <p className="text-sm font-medium">{formatDate(item.end_date)}</p>
                                                                    </div>
                                                                    
                                                                    <div className="space-y-1">
                                                                        <span className="text-xs text-muted-foreground">Created</span>
                                                                        <p className="text-sm font-medium">{formatDate(item.created_at)}</p>
                                                                    </div>
                                                                    
                                                                    <div className="space-y-1 lg:col-span-1">
                                                                        <span className="text-xs text-muted-foreground">Campaign Links</span>
                                                                        {item.marketing_links && item.marketing_links.length > 0 ? (
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {item.marketing_links.map((link: any, linkIndex: number) => (
                                                                                    <a 
                                                                                        key={linkIndex}
                                                                                        href={link.link} 
                                                                                        target="_blank" 
                                                                                        rel="noopener noreferrer"
                                                                                        className="inline-flex items-center gap-1.5 text-xs px-2 py-1 bg-[rgba(var(--preset-primary-rgb),0.08)] text-[var(--preset-primary)] hover:bg-[rgba(var(--preset-primary-rgb),0.16)] hover:text-[var(--preset-primary)] rounded-md font-medium transition-colors"
                                                                                        title={link.link}
                                                                                    >
                                                                                        <ExternalLink className="h-3 w-3" />
                                                                                        {link.platform}
                                                                                    </a>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-sm text-muted-foreground">No links available</span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Real-time Metrics Display */}
                                                                {item.marketing_links && item.marketing_links.length > 0 && (
                                                                    <div className="space-y-2">
                                                                        <h6 className="text-sm font-semibold text-muted-foreground">Performance Metrics</h6>
                                                                        <div className="space-y-2">
                                                                            {item.marketing_links.map((link: any, linkIndex: number) => (
                                                                                <MarketingMetricsDisplay 
                                                                                    key={linkIndex}
                                                                                    link={link}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            <EditDialog 
                item={editingItem}
                isOpen={!!editingItem}
                onOpenChange={(open) => !open && setEditingItem(null)}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this marketing item
                            and remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            disabled={deleteMarketingItemMutation.isPending}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {deleteMarketingItemMutation.isPending ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default MarketingScreen;
