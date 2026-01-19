"use client"

import { TrendingUp } from "lucide-react"
import { LabelList, RadialBar, RadialBarChart } from "recharts"

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
import { useGetStockDistribution } from "../../tanstack/inventory-tanstack"

export const description = "A radial chart with inventory distribution"

const chartConfig = {
  quantity: {
    label: "Quantity",
  },
  available: {
    label: "Available",
    color: "hsl(142, 91.00%, 26.30%)", // emerald-600
  },
  processing: {
    label: "Processing",
    color: "hsl(217, 91%, 60%)", // blue-500
  },
  damaged: {
    label: "Damaged",
    color: "hsl(0, 84%, 60%)", // red-500
  },
  allocating: {
    label: "Allocating",
    color: "hsl(25, 95%, 53%)", // orange-500
  },
  good: {
    label: "Good",
    color: "hsl(262, 83%, 58%)", // purple-500
  },
} satisfies ChartConfig

export function ChartRadialLabel() {
  const { stockDistribution, isLoading } = useGetStockDistribution();

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle>Inventory Distribution</CardTitle>
          <CardDescription>Loading stock allocation data...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-[280px] md:min-h-[320px] lg:min-h-[300px] flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  const stockData = stockDistribution?.data?.stockDistribution;
  const chartData = stockData ? [
    { category: "allocating", quantity: stockData.allocatingQty, fill: "var(--color-allocating)" },
    { category: "processing", quantity: stockData.processingQty, fill: "var(--color-processing)" },
    { category: "damaged", quantity: stockData.damagedQty, fill: "var(--color-damaged)" },
    { category: "good", quantity: stockData.goodQty, fill: "var(--color-good)" },
    { category: "available", quantity: stockData.availableQty, fill: "var(--color-available)" },
  ] : [];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Inventory Distribution</CardTitle>
        <CardDescription>Stock allocation across categories</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[280px] md:min-h-[320px] lg:min-h-[300px] flex items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="w-full h-full max-h-[280px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={-90}
            endAngle={380}
            innerRadius={40}
            outerRadius={120}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="category" />}
            />
            <RadialBar dataKey="quantity" background>
              <LabelList
                position="insideStart"
                dataKey="category"
                className="fill-white capitalize mix-blend-luminosity"
                fontSize={10}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-2">
        <div className="flex items-center gap-2 leading-none font-medium">
          Inventory levels stable this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none text-center">
          Current stock distribution across all locations
        </div>
      </CardFooter>
    </Card>
  )
}
