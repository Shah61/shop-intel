import { ChartBar } from "lucide-react";

interface TotalCumulativeCardProps {
    totalSales: number;
    totalOrders: number;
    avgOrderValue: number;
    isLoading: boolean;
}

const TotalCumulativeCard = ({
    totalSales,
    totalOrders,
    avgOrderValue,
    isLoading,
}: TotalCumulativeCardProps) => {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-card rounded-2xl border border-border p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-3">
                        <div className="h-4 w-44 bg-muted rounded animate-pulse" />
                        <div className="h-9 w-52 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="flex gap-8">
                        <div className="space-y-2">
                            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                            <div className="h-7 w-24 bg-muted rounded animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                            <div className="h-7 w-24 bg-muted rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-foreground dark:bg-card rounded-2xl p-6 text-background dark:text-foreground dark:border dark:border-border">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <ChartBar className="w-5 h-5 opacity-70" />
                        <p className="text-sm font-medium opacity-70">
                            Total Cumulative Sales
                        </p>
                    </div>
                    <p className="text-3xl font-bold tracking-tight">
                        RM{" "}
                        {totalSales.toLocaleString("en-MY", {
                            minimumFractionDigits: 2,
                        })}
                    </p>
                    <p className="text-xs opacity-50 mt-1">
                        All platforms combined
                    </p>
                </div>
                <div className="flex gap-8">
                    <div>
                        <p className="text-sm opacity-60 mb-1">Total Orders</p>
                        <p className="text-2xl font-bold">
                            {totalOrders.toLocaleString()}
                        </p>
                    </div>
                    <div className="w-px bg-current opacity-15" />
                    <div>
                        <p className="text-sm opacity-60 mb-1">
                            Avg. Order Value
                        </p>
                        <p className="text-xl font-semibold">
                            RM {avgOrderValue.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TotalCumulativeCard;
