import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateToMMDDYYYY, isAdmin } from "@/src/core/constant/helper";
import { ArrowRightIcon } from "lucide-react";
import { ShopifyConversionRate } from "@/src/features/sales/data/model/shopify-entity";
import { useSession } from "@/src/core/lib/dummy-session-provider";
import { DashboardPanel } from "@/src/core/shared/view/components/dashboard-panel";


// const conversionData: ConversionEntity[] = [
//     { visitors: 234, orders: 45, conversionRate: 19.2, date: "03/14/2024" },
//     { visitors: 567, orders: 89, conversionRate: 15.7, date: "03/15/2024" },
//     { visitors: 432, orders: 67, conversionRate: 15.5, date: "03/16/2024" },
//     { visitors: 789, orders: 156, conversionRate: 19.8, date: "03/17/2024" },
//     { visitors: 345, orders: 78, conversionRate: 22.6, date: "03/18/2024" },
//     { visitors: 678, orders: 134, conversionRate: 19.8, date: "03/19/2024" },
//     { visitors: 456, orders: 98, conversionRate: 21.5, date: "03/20/2024" },
// ];

const ShopifyConversionTable = (
    { conversionRate,
        onSelectTap,
        selectedTab
    }:
        {
            conversionRate: ShopifyConversionRate[],
            onSelectTap: () => void,
            selectedTab: string
        }) => {


    const { data: session } = useSession()
    const isUserAdmin = isAdmin(session?.user_entity || {})

    const rows = selectedTab === "campaigns" ? conversionRate : conversionRate.slice(0, 7);

    return (
        <DashboardPanel
            title="List conversion"
            description="Conversion rate by date"
            actions={selectedTab !== "campaigns" ? (
                <Button variant="ghost" size="sm" onClick={onSelectTap} className="text-xs h-7">
                    View all <ArrowRightIcon className="h-3.5 w-3.5 ml-0.5" />
                </Button>
            ) : undefined}
            className="h-full"
        >
            <div className="flex-1 overflow-auto min-h-0">
                <table className="w-full">
                    <thead className="sticky top-0 z-10 bg-muted/30">
                        <tr className="border-b border-border/80">
                            <th className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-5 py-2.5">Date</th>
                            <th className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-5 py-2.5">Revenue</th>
                            <th className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-5 py-2.5">Orders</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr><td colSpan={3} className="px-5 py-8 text-center text-sm text-muted-foreground">No data yet</td></tr>
                        ) : rows.map((conversion) => (
                            <tr key={conversion.date} className="border-b border-border/60 last:border-0 hover:bg-muted/40 transition-colors">
                                <td className="px-5 py-2.5 text-xs font-medium">{formatDateToMMDDYYYY(conversion.date)}</td>
                                <td className="px-5 py-2.5 text-xs tabular-nums">{formatCurrency(conversion.total_revenues)}</td>
                                <td className="px-5 py-2.5 text-xs tabular-nums">{conversion.total_orders}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardPanel>
    )
}

export default ShopifyConversionTable;
