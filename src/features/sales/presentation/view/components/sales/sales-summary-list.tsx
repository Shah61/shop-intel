"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Download, Filter, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const salesData = [
    {
        date: "1 Jan 2024",
        shopee: "RM3,672.33",
        tiktok: "RM2,409.68",
        website: "RM89.99",
        total: "RM6,172.00",
        change: 4.2
    },
    {
        date: "2 Jan 2024",
        shopee: "RM2,160.56",
        tiktok: "RM3,463.58",
        website: "RM434.96",
        total: "RM6,059.10",
        change: -1.8
    },
    {
        date: "3 Jan 2024",
        shopee: "RM1,907.48",
        tiktok: "RM5,243.18",
        website: "RM268.97",
        total: "RM7,419.63",
        change: 22.5
    },
    {
        date: "4 Jan 2024",
        shopee: "RM1,804.73",
        tiktok: "RM1,737.78",
        website: "RM218.98",
        total: "RM3,761.49",
        change: -49.3
    },
    {
        date: "5 Jan 2024",
        shopee: "RM1,790.81",
        tiktok: "RM4,901.22",
        website: "RM588.93",
        total: "RM7,280.96",
        change: 93.6
    },
    {
        date: "6 Jan 2024",
        shopee: "RM1,296.80",
        tiktok: "RM777.87",
        website: "RM213.94",
        total: "RM2,288.61",
        change: -68.6
    },
    {
        date: "7 Jan 2024",
        shopee: "RM1,745.67",
        tiktok: "RM2,791.40",
        website: "-",
        total: "RM4,537.07",
        change: 98.2
    },
    {
        date: "8 Jan 2024",
        shopee: "RM1,821.76",
        tiktok: "RM865.91",
        website: "RM89.99",
        total: "RM2,777.66",
        change: -38.8
    },
    {
        date: "9 Jan 2024",
        shopee: "RM792.79",
        tiktok: "RM1,537.49",
        website: "RM89.99",
        total: "RM2,420.27",
        change: -12.9
    },
    {
        date: "10 Jan 2024",
        shopee: "RM1,102.89",
        tiktok: "RM3,933.55",
        website: "-",
        total: "RM5,036.44",
        change: 108.1
    },
    {
        date: "11 Jan 2024",
        shopee: "RM2,573.28",
        tiktok: "RM1,597.83",
        website: "RM139.98",
        total: "RM4,311.09",
        change: -14.4
    }
];

const totalSales = {
    shopee: "RM1,795,354.01",
    tiktok: "RM5,831,006.47",
    website: "RM197,896.42",
    grandTotal: "RM7,824,256.90"
};

export function SalesSummaryCards() {
    const [expanded, setExpanded] = useState(false);
    const [timeframe, setTimeframe] = useState("week");

    // Determine how many items to display based on expanded state
    const displayData = expanded ? salesData : salesData.slice(0, 5);

    // Platform color scheme
    const platformColors = {
        shopee: "bg-[#EE4D2D]/10 text-[#EE4D2D]",
        tiktok: "bg-[#FF004F]/10 text-[#FF004F]",
        website: "bg-[#7755CC]/10 text-[#7755CC]"
    };

    return (
        <Card className="h-full shadow-sm hover:shadow-md transition-shadow w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <div>
                    <CardTitle className="text-lg font-semibold">Sales Overview</CardTitle>
                    <CardDescription>Daily sales breakdown by platform</CardDescription>
                </div>
                <div className="flex items-center gap-1.5">
                    <Select value={timeframe} onValueChange={setTimeframe}>
                        <SelectTrigger className="h-8 w-[130px]">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Last 7 days</SelectItem>
                            <SelectItem value="2weeks">Last 14 days</SelectItem>
                            <SelectItem value="month">Last 30 days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="px-2 pb-1 w-full">
                <ScrollArea className="h-[360px] pr-4 w-full">
                    <div className="space-y-3">
                        {displayData.map((day, index) => (
                            <div
                                key={day.date}
                                className="rounded-lg border bg-card p-3 hover:shadow-sm transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-sm text-muted-foreground">{day.date}</span>
                                    <div className="flex items-center">
                                        <span className={`text-sm font-semibold ${day.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {day.change >= 0 ? '+' : ''}{day.change}%
                                        </span>
                                        <Badge className="ml-2 font-medium">{day.total}</Badge>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="rounded-md px-2.5 py-1.5 flex flex-col">
                                        <span className="text-xs font-medium text-muted-foreground mb-0.5">Shopee</span>
                                        <span className="font-medium">{day.shopee}</span>
                                    </div>
                                    <div className="rounded-md px-2.5 py-1.5 flex flex-col">
                                        <span className="text-xs font-medium text-muted-foreground mb-0.5">TikTok</span>
                                        <span className="font-medium">{day.tiktok}</span>
                                    </div>
                                    <div className="rounded-md px-2.5 py-1.5 flex flex-col">
                                        <span className="text-xs font-medium text-muted-foreground mb-0.5">Website</span>
                                        <span className="font-medium">{day.website}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Summary Footer
                <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold">Grand Total</span>
                        <Badge variant="outline" className="font-semibold text-sm">
                            {totalSales.grandTotal}
                        </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-1">
                        <Badge variant="outline" className={`justify-center ${platformColors.shopee}`}>
                            Shopee
                        </Badge>
                        <Badge variant="outline" className={`justify-center ${platformColors.tiktok}`}>
                            TikTok
                        </Badge>
                        <Badge variant="outline" className={`justify-center ${platformColors.website}`}>
                            Website
                        </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center font-medium text-sm">{totalSales.shopee}</div>
                        <div className="text-center font-medium text-sm">{totalSales.tiktok}</div>
                        <div className="text-center font-medium text-sm">{totalSales.website}</div>
                    </div>
                </div> */}

                {/* Toggle Expand/Collapse */}
                {/* <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                    className="w-full mt-3 text-muted-foreground"
                >
                    {expanded ? (
                        <><ChevronUp className="h-4 w-4 mr-1" /> Show Less</>
                    ) : (
                        <><ChevronDown className="h-4 w-4 mr-1" /> Show More</>
                    )}
                </Button> */}
            </CardContent>
        </Card>
    );
}