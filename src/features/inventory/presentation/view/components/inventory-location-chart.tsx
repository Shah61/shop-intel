"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useGetInventoryStockByLocation } from "@/src/features/inventory/presentation/tanstack/inventory-tanstack"

export const description = "A stacked bar chart showing inventory by location"

const chartConfig = {
  iStore: {
    label: "iStore",
    color: "hsl(217, 91%, 60%)", // blue-500
  },
  physicalStore: {
    label: "Physical Store",
    color: "hsl(142, 76%, 36%)", // emerald-600
  },
  warehouse: {
    label: "Warehouse",
    color: "hsl(25, 95%, 53%)", // orange-500
  }
} satisfies ChartConfig

export function ChartBarStacked() {
  const { inventoryStockByLocation, isLoading } = useGetInventoryStockByLocation();

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle>Inventory by Location</CardTitle>
          <CardDescription>Loading stock distribution data...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-[280px] md:min-h-[320px] lg:min-h-[300px] flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  const stockData = inventoryStockByLocation?.data?.stockDistributionByLocation;
  const chartData = stockData ? [
    {
      location: "iStore",
      totalStock: stockData.totalStockIStore || 0,
      fill: "var(--color-iStore)"
    },
    {
      location: "Physical Store",
      totalStock: stockData.totalStockPhysicalStore || 0,
      fill: "var(--color-physicalStore)"
    },
    {
      location: "Warehouse",
      totalStock: stockData.totalStockSepang || 0,
      fill: "var(--color-warehouse)"
    }
  ] : [];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Inventory by Location</CardTitle>
        <CardDescription>Stock distribution across all locations</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[280px] md:min-h-[320px] lg:min-h-[300px]">
        <div className="h-full w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid vertical={false} className="stroke-muted" />
              <XAxis
                dataKey="location"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                className="text-xs fill-muted-foreground"
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="totalStock"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm pt-2">
        <div className="flex gap-2 leading-none font-medium">
          Stock distribution overview <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none text-center">
          Comparing inventory levels across all locations
        </div>
      </CardFooter>
    </Card>
  )
}
