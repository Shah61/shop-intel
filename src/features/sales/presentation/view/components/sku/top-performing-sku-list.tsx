"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { DashboardPanel } from "@/src/core/shared/view/components/dashboard-panel";

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
        <DashboardPanel
            title="Top performing SKUs"
            description="Best sellers by revenue share"
            actions={
                <Button variant="ghost" size="sm" onClick={() => router.push("/sales/sku")} className="text-xs h-7">
                    View more <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Button>
            }
        >
            <div className="px-5 py-3 space-y-4">
                {skuData.slice(0, 5).map((sku) => (
                    <div key={sku.id} className="flex items-center gap-3">
                        <div className="w-8 shrink-0 text-center text-[10px] font-medium text-muted-foreground tabular-nums">
                            #{sku.id.slice(-3)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                                <p className="text-xs font-medium truncate" title={sku.name}>{sku.name}</p>
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatCurrency(sku.quantity)} units</span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-[width]"
                                    style={{ width: `${sku.percentage}%`, backgroundColor: sku.color }}
                                />
                            </div>
                        </div>
                        <span className="text-[10px] font-semibold tabular-nums shrink-0 w-8 text-right" style={{ color: sku.color }}>
                            {sku.percentage}%
                        </span>
                    </div>
                ))}
            </div>
        </DashboardPanel>
    );
}