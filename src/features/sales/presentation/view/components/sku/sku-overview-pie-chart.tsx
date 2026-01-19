"use client"

import { TrendingUp } from "lucide-react"
import { Cell, LabelList, Pie, PieChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

export function SkuOverviewPieChart() {
    const chartData = [
        { product: "cleanser", sales: 275, fill: "#3b82f6" }, // blue
        { product: "mist", sales: 200, fill: "#10b981" }, // green
        { product: "glowSerum", sales: 187, fill: "#8b5cf6" }, // purple
        { product: "reliefSerum", sales: 173, fill: "#f59e0b" }, // amber
        { product: "moisturiser", sales: 150, fill: "#ec4899" }, // pink
        { product: "sunscreen", sales: 135, fill: "#06b6d4" }, // cyan
    ];

    const chartConfig = {
        sales: { label: "Sales" },
        cleanser: { label: "Foam Cleanser", color: "#3b82f6" },
        mist: { label: "Water Mist", color: "#10b981" },
        glowSerum: { label: "Glow Serum", color: "#8b5cf6" },
        reliefSerum: { label: "Relief Serum", color: "#f59e0b" },
        moisturiser: { label: "Moisturiser", color: "#ec4899" },
        sunscreen: { label: "Sunscreen", color: "#06b6d4" },
    };

    return (
        <Card className="h-full">
            <CardHeader className="px-6 pt-6 pb-0 items-center">
                <CardTitle className="text-base font-medium">SKU Distribution</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square h-[230px] [&_.recharts-text]:fill-foreground"
                >
                    <PieChart>
                        <ChartTooltip
                            content={<ChartTooltipContent nameKey="visitors" hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="sales"
                            nameKey="product"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            fill="#8884d8"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm pt-0 pb-6">
                <div className="flex items-center gap-2 font-medium leading-none">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing SKU distribution for the last 6 months
                </div>
            </CardFooter>
        </Card>
    );
}