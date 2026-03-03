"use client"

import { LabelList, RadialBar, RadialBarChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useGetStockDistribution } from "../../tanstack/inventory-tanstack"
import { DashboardPanel } from "@/src/core/shared/view/components/dashboard-panel"

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
      <DashboardPanel title="Inventory distribution" description="Stock allocation across categories" className="h-full">
        <div className="flex-1 min-h-[260px] flex items-center justify-center text-sm text-muted-foreground">Loading…</div>
      </DashboardPanel>
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
    <DashboardPanel
      title="Inventory distribution"
      description="Stock allocation across categories"
      footer="Current stock distribution across all locations"
      className="h-full"
    >
      <div className="flex-1 min-h-[260px] md:min-h-[280px] flex items-center justify-center px-2 py-4">
        <ChartContainer config={chartConfig} className="w-full h-full max-h-[260px]">
          <RadialBarChart
            data={chartData}
            startAngle={-90}
            endAngle={380}
            innerRadius={36}
            outerRadius={100}
          >
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="category" />} />
            <RadialBar dataKey="quantity" background>
              <LabelList position="insideStart" dataKey="category" className="fill-white capitalize mix-blend-luminosity" fontSize={9} />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </div>
    </DashboardPanel>
  )
}
