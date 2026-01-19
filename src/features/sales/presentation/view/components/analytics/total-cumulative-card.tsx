import { Skeleton } from "@/components/ui/skeleton";
import { ChartBar, TrendingUp } from "lucide-react";

interface TotalCumulativeCardProps {
    totalSales: number;
    totalOrders: number;
    avgOrderValue: number;
    isLoading: boolean;
}

const TotalCumulativeCard = (
    {
        totalSales,
        totalOrders,
        avgOrderValue,
        isLoading,
    }: TotalCumulativeCardProps
) => {
    return (
        <div className="border rounded-xl p-4 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between">
                <div>
                    <div>
                        <div className="flex flex-row items-center gap-2 flex-1">
                            <ChartBar className="h-5 w-5 text-blue-500" />
                            <p className="md:text-lg text-md font-semibold line-clamp-2">Total Cumulative Sales</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Total Performance metrics for all platforms</p>
                    </div>
                    {
                        isLoading ? (
                            <Skeleton className="h-10 w-50" />
                        ) : (
                            <p className="text-3xl font-bold mt-4">RM {totalSales.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</p>
                        )
                    }
                </div>
                <div className="text-right">
                    <div className="text-right mb-2">
                        <p className="text-sm opacity-90 mb-2">Total Orders</p>
                        {
                            isLoading ? (
                                <Skeleton className="h-5 w-30" />
                            ) : (
                                <p className="text-2xl font-semibold">{totalOrders.toLocaleString()}</p>
                            )
                        }
                    </div>
                    <div className="text-right">
                        <p className="text-sm opacity-90 mb-2">Avg. Order Value</p>
                        {
                            isLoading ? (
                                <Skeleton className="h-5 w-30" />
                            ) : (
                                <p className="text-lg font-medium">RM {avgOrderValue.toFixed(2)}</p>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>

    )
}

export default TotalCumulativeCard;