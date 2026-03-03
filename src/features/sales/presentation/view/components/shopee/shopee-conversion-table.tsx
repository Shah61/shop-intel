import { Button } from "@/components/ui/button";
import { formatDateToMMDDYYYY, formatCurrency, isAdmin } from "@/src/core/constant/helper";
import { ArrowRightIcon } from "lucide-react";
import { ShopeeConversionRate } from "@/src/features/sales/data/model/shopee-entity";
import { useSession } from "@/src/core/lib/dummy-session-provider";
import { DashboardPanel } from "@/src/core/shared/view/components/dashboard-panel";
import { useState } from "react";

const ShopeeConversionTable = ({
    conversionRate,
    onSelectTap,
    selectedTab,
    onLoadMore
}: {
    conversionRate: ShopeeConversionRate[],
    onSelectTap: () => void,
    selectedTab: string,
    onLoadMore: () => void
}) => {
    const { data: session } = useSession();
    const isUserAdmin = isAdmin(session?.user_entity || {});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const sortedConversionRate = [...conversionRate].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const totalPages = Math.ceil(sortedConversionRate.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage === totalPages) {
            onLoadMore();
        } else {
            setCurrentPage(prev => prev + 1);
        }
    };

    const getCurrentPageData = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedConversionRate.slice(startIndex, startIndex + itemsPerPage);
    };

    const rows = selectedTab === "campaigns" ? getCurrentPageData() : sortedConversionRate.slice(0, 7);

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
            {selectedTab === "campaigns" && (
                <div className="px-5 py-3 border-t border-border/80 flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>Previous</Button>
                    <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleNextPage}>Next</Button>
                </div>
            )}
        </DashboardPanel>
    );
};

export default ShopeeConversionTable;