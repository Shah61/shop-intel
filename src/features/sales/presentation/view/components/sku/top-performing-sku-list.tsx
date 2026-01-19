"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

// Define the SKU entity type
interface SkuEntity {
    id: string;
    name: string;
    sales: number;
    percentage: number;
    color: string;
    quantity: number;
}

// Sample SKU data with quantity added
export const skuData: SkuEntity[] = [
    { id: 'NBSS030', name: 'NBSS 030', sales: 63064.61, percentage: 14.2, color: '#4CAF50', quantity: 4218 },
    { id: 'NBBFSMIST', name: 'NBBFSMist', sales: 61961.55, percentage: 13.9, color: '#2196F3', quantity: 3985 },
    { id: 'NBFMB', name: 'NBFMB', sales: 53590.55, percentage: 12.1, color: '#9C27B0', quantity: 3312 },
    { id: 'NBFSMIST', name: 'NBFSMist', sales: 45843.09, percentage: 10.3, color: '#FF9800', quantity: 2756 },
    { id: 'NBM100', name: 'NBM 100', sales: 45817.7, percentage: 10.3, color: '#F44336', quantity: 2910 },
    { id: 'NBSFS', name: 'NBSFS', sales: 43595.76, percentage: 9.8, color: '#E91E63', quantity: 2633 },
    { id: 'NBM003_15', name: '15 NBM 003', sales: 25713.18, percentage: 5.8, color: '#673AB7', quantity: 1628 },
    { id: 'NBSFSMIST', name: 'NBSFSMist', sales: 20402.35, percentage: 4.6, color: '#00BCD4', quantity: 1275 },
    { id: 'NBM003', name: 'NBM 003', sales: 6324.31, percentage: 1.4, color: '#795548', quantity: 421 },
];

// Format currency
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export function TopPerformingSkusList() {
    const router = useRouter();

    return (
        <Card className="border shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col items-start">
                            <p className="text-lg font-bold">Top Performing SKUs</p>
                            <p className="text-sm text-muted-foreground font-normal">Here is the top performing SKUs</p>
                        </div>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-2">
                <div className="space-y-4">
                    {skuData.slice(0, 5).map((sku) => (
                        <div key={sku.id} className="flex items-center gap-6">
                            <div className="w-6 text-center text-sm text-muted-foreground">
                                {sku.id.slice(-3)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between">
                                    <p className="text-sm text-foreground truncate" title={sku.name}>
                                        {sku.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                                        {formatCurrency(sku.quantity)} units
                                    </p>
                                </div>

                                <div className="mt-2 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${sku.percentage}%`,
                                            backgroundColor: sku.color
                                        }}
                                    />
                                </div>
                            </div>

                            <Badge
                                className="ml-2 font-medium px-2.5 py-1 text-xs rounded-md"
                                style={{
                                    backgroundColor: `${sku.color}20`,
                                    color: sku.color
                                }}
                            >
                                {sku.percentage}%
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="flex-col gap-2 text-sm pt-0 pb-6">
                <Button
                    onClick={() => router.push('/sales/sku')}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary text-sm w-full flex items-center justify-center"
                >
                    View more
                    <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}