import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DataCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    trending: "up" | "down";
    change: string;
    isLoading?: boolean;
    description?: string;
}

const DataCard = ({ icon, title, value, trending, change, isLoading, description }: DataCardProps) => {
    return (
        <div className="border rounded-xl p-4 transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-col items-start gap-2 w-full">

                <div className="flex flex-row items-center justify-between gap-2  w-full">
                    <div className="flex flex-row items-center gap-2 flex-1">
                        {icon}
                        <p className="md:text-lg text-md font-semibold line-clamp-2">{title}</p>
                    </div>

                    {/* <Badge variant={trending === "up" ? "default" : "secondary"}>
                        {trending === "up" ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                        {change}
                    </Badge> */}
                </div>
                {isLoading ? (
                    <div className="flex flex-col items-start ">
                        <Skeleton className="h-10 w-20" />
                        <Skeleton className="h-10 w-20" />
                    </div>
                ) : (
                    <div className="flex flex-col items-start ">
                        <p className="md:text-3xl text-2xl font-bold mb-1 line-clamp-2">{value}</p>
                        <p className="text-xs text-muted-foreground" >{description ?? "Compared to previous period"}</p>
                    </div>
                )}




            </div>
        </div>
    )
};

export default DataCard;


{/* <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
            {icon}
            <CardTitle className="md:text-lg text-md">{title}</CardTitle>
        </div>
        <Badge variant={trending === "up" ? "default" : "secondary"}>
            {trending === "up" ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
            {change}
        </Badge>
    </CardHeader>
    <CardContent>
        <div className="md:text-3xl text-2xl font-bold mb-1">{value}</div>
        <p className="text-xs text-muted-foreground">Compared to previous period</p>
    </CardContent>
</Card> */}