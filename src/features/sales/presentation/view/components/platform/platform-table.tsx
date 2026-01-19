import React, { useEffect, useState } from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    TableHead,
    TableFooter
} from "@/components/ui/table";
import { ArrowDownIcon, ArrowRightIcon } from "lucide-react";
import {
    PlatformEntity,
    Platform,
    PlatformSalesByDate,
    PlatformTotals
} from "@/src/features/sales/data/model/platform-entity";
import { transformPlatformData } from '@/src/features/sales/data/services/platform-api.service';

// Sample data - this would typically come from an API
const mockPlatformEntities: PlatformEntity[] = [
    { id: "1", platform: Platform.SHOPEE, amount: 16671.17, date: "1 Jan 2025" },
    { id: "2", platform: Platform.TIKTOK, amount: 7937.63, date: "1 Jan 2025" },
    { id: "3", platform: Platform.WEBSITE, amount: 444.94, date: "1 Jan 2025" },
    { id: "4", platform: Platform.SHOPEE, amount: 6760.65, date: "2 Jan 2025" },
    { id: "5", platform: Platform.TIKTOK, amount: 7454.6, date: "2 Jan 2025" },
    { id: "6", platform: Platform.WEBSITE, amount: 4149.53, date: "2 Jan 2025" },
    { id: "7", platform: Platform.SHOPEE, amount: 8461.1, date: "3 Jan 2025" },
    { id: "8", platform: Platform.TIKTOK, amount: 11105.69, date: "3 Jan 2025" },
    { id: "9", platform: Platform.WEBSITE, amount: 524.93, date: "3 Jan 2025" },
    { id: "10", platform: Platform.SHOPEE, amount: 4830.75, date: "4 Jan 2025" },
    { id: "11", platform: Platform.TIKTOK, amount: 16889.13, date: "4 Jan 2025" },
    { id: "12", platform: Platform.WEBSITE, amount: 584.93, date: "4 Jan 2025" },
    { id: "13", platform: Platform.SHOPEE, amount: 4099.86, date: "5 Jan 2025" },
    { id: "14", platform: Platform.TIKTOK, amount: 19331.75, date: "5 Jan 2025" },
    { id: "15", platform: Platform.SHOPEE, amount: 4051.4, date: "6 Jan 2025" },
    { id: "16", platform: Platform.TIKTOK, amount: 12570.05, date: "6 Jan 2025" },
    { id: "17", platform: Platform.WEBSITE, amount: 690.89, date: "6 Jan 2025" },
    { id: "18", platform: Platform.SHOPEE, amount: 5462.57, date: "7 Jan 2025" },
    { id: "19", platform: Platform.TIKTOK, amount: 10418.08, date: "7 Jan 2025" },
    { id: "20", platform: Platform.WEBSITE, amount: 1864.51, date: "7 Jan 2025" },
    { id: "21", platform: Platform.SHOPEE, amount: 9688.3, date: "8 Jan 2025" },
    { id: "22", platform: Platform.TIKTOK, amount: 9974.41, date: "8 Jan 2025" },
    { id: "23", platform: Platform.WEBSITE, amount: 824.91, date: "8 Jan 2025" },
    { id: "24", platform: Platform.SHOPEE, amount: 6085.79, date: "9 Jan 2025" },
    { id: "25", platform: Platform.TIKTOK, amount: 10854.45, date: "9 Jan 2025" },
    { id: "26", platform: Platform.WEBSITE, amount: 529.94, date: "9 Jan 2025" },
    { id: "27", platform: Platform.SHOPEE, amount: 7654.7, date: "10 Jan 2025" },
    { id: "28", platform: Platform.TIKTOK, amount: 11648.26, date: "10 Jan 2025" },
    { id: "29", platform: Platform.WEBSITE, amount: 254.97, date: "10 Jan 2025" },
    { id: "30", platform: Platform.SHOPEE, amount: 2376.37, date: "11 Jan 2025" },
    { id: "31", platform: Platform.TIKTOK, amount: 8876.11, date: "11 Jan 2025" },
    { id: "32", platform: Platform.WEBSITE, amount: 219.97, date: "11 Jan 2025" },
    { id: "33", platform: Platform.PHYSICAL, amount: 6909.28, date: "11 Jan 2025" },
];

// Helper function to format currency
const formatCurrency = (value: number) => {
    return value.toFixed(2);
};

// Helper function to determine cell background color
const getCellBackgroundClass = (value: number) => {
    if (value === 0) return "";
    if (value < 5000) return "bg-gray-50";
    if (value < 10000) return "bg-green-50";
    return "bg-green-100";
};

const PlatformSalesTable = () => {
    const [dailyData, setDailyData] = useState<PlatformSalesByDate[]>([]);
    const [totals, setTotals] = useState<PlatformTotals>({ physical: 0, shopee: 0, tiktok: 0, website: 0, total: 0 });

    useEffect(() => {
        // In a real app, you would fetch data from an API here
        const { dailyData, totals } = transformPlatformData(mockPlatformEntities);
        setDailyData(dailyData);
        setTotals(totals);
    }, []);

    return (
        <Card className="hover:shadow-lg transition-shadow h-full w-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex flex-col items-start">
                        <p className="text-lg font-bold">Platform / Subtotal</p>
                        <p className="text-sm text-muted-foreground font-normal">Daily sales breakdown by platform</p>
                    </div>

                    <Button variant="ghost" size="sm">
                        <span className="hidden md:inline-block">View All</span>
                        <ArrowRightIcon className="h-4 w-4" />
                    </Button>

                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[110px] font-semibold">Date</TableHead>
                            <TableHead className="text-right font-semibold">Physical</TableHead>
                            <TableHead className="text-right font-semibold">Shopee</TableHead>
                            <TableHead className="text-right font-semibold">TikTok</TableHead>
                            <TableHead className="text-right font-semibold">Website</TableHead>
                            <TableHead className="text-right font-semibold">Grand total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dailyData.slice(0, 4).map((data) => (
                            <TableRow key={data.date} className="hover:bg-muted/10">
                                <TableCell className="font-medium">{data.date}</TableCell>
                                <TableCell className={`text-right }`}>
                                    {data.physical === 0 ? "-" : formatCurrency(data.physical)}
                                </TableCell>
                                <TableCell className={`text-right`}>
                                    {formatCurrency(data.shopee)}
                                </TableCell>
                                <TableCell className={`text-right`}>
                                    {formatCurrency(data.tiktok)}
                                </TableCell>
                                <TableCell className={`text-right`}>
                                    {data.website === 0 ? "-" : formatCurrency(data.website)}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatCurrency(data.total)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="bg-muted/20 font-bold">
                            <TableCell>Grand total</TableCell>
                            <TableCell className="text-right">{formatCurrency(totals.physical)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(totals.shopee)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(totals.tiktok)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(totals.website)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(totals.total)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    );
};

export default PlatformSalesTable;