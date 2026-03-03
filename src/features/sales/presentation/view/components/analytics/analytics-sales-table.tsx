import { capitalizeFirstLetter, formatCurrency, formatDateToMMDDYYYY, getPlatformName, isAdmin } from "@/src/core/constant/helper";
import { AnalyticsSalesEntity } from "@/src/features/sales/data/model/analytics-entity";
import DialogAnalyticsSalesTable from "./dialog-analytics-sales-table";
import { useSession } from "@/src/core/lib/dummy-session-provider";
import { DashboardPanel } from "@/src/core/shared/view/components/dashboard-panel";

const AnalyticsSalesTable = ({
    data,
    isLimit,
}: {
    data: AnalyticsSalesEntity[];
    isLimit: boolean;
}) => {
    const combinedData = data
        .reduce(
            (acc, curr) => {
                const existingEntry = acc.find(
                    (item) =>
                        formatDateToMMDDYYYY(item.date || "") ===
                        formatDateToMMDDYYYY(curr.date || "")
                );

                if (existingEntry) {
                    existingEntry.total_visitors =
                        (existingEntry.total_visitors || 0) +
                        (curr.total_visitors || 0);
                    existingEntry.total_orders =
                        (existingEntry.total_orders || 0) +
                        (curr.total_orders || 0);
                    existingEntry.total_revenues =
                        (existingEntry.total_revenues || 0) +
                        (curr.total_revenues || 0);
                    existingEntry.platforms = [
                        ...(existingEntry.platforms || []),
                        curr.type || "",
                    ];
                } else {
                    acc.push({
                        ...curr,
                        platforms: [curr.type || ""],
                    });
                }
                return acc;
            },
            [] as (AnalyticsSalesEntity & { platforms?: string[] })[]
        )
        .sort(
            (a, b) =>
                new Date(b.date || "").getTime() -
                new Date(a.date || "").getTime()
        );

    const limitData = isLimit ? combinedData.slice(0, 5) : combinedData;

    const { data: session } = useSession();

    return (
        <DashboardPanel
            title="Recent conversions"
            description="Latest platform activity"
            actions={isLimit ? <DialogAnalyticsSalesTable /> : null}
            footer={limitData.length > 0 ? `Showing ${limitData.length}${isLimit ? ` of ${combinedData.length}` : ""} conversion${combinedData.length !== 1 ? "s" : ""}` : undefined}
            className="h-full"
        >
            <div className="flex-1 overflow-auto min-h-0">
                <table className="w-full">
                    <thead className="sticky top-0 z-10 bg-muted/30">
                        <tr className="border-b border-border/80">
                            <th className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-5 py-2.5">Date</th>
                            <th className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-5 py-2.5">Platform</th>
                            <th className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-5 py-2.5">Orders</th>
                            <th className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-5 py-2.5">Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {limitData.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-5 py-10 text-center text-sm text-muted-foreground">
                                    No conversions yet. Data will appear here as sales come in.
                                </td>
                            </tr>
                        ) : limitData.map((conversion, index) => (
                            <tr key={index} className="border-b border-border/60 last:border-0 hover:bg-muted/40 transition-colors">
                                <td className="px-5 py-2.5 text-xs font-medium">{conversion.date}</td>
                                <td className="px-5 py-2.5">
                                    <div className="flex gap-1 flex-wrap">
                                        {conversion.platforms?.map((platform, i) => (
                                            <span
                                                key={i}
                                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
                                                style={{ backgroundColor: getPlatformName(platform).color }}
                                            >
                                                {capitalizeFirstLetter(platform)}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-5 py-2.5 text-xs tabular-nums">{conversion.total_orders}</td>
                                <td className="px-5 py-2.5 text-xs font-semibold tabular-nums">
                                    {isAdmin(session?.user_entity || {}) ? formatCurrency(conversion.total_revenues || 0) : "********"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardPanel>
    );
};

export default AnalyticsSalesTable;
