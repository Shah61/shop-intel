"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useGetInventoryStockByLocation } from "@/src/features/inventory/presentation/tanstack/inventory-tanstack"
import { DashboardPanel } from "@/src/core/shared/view/components/dashboard-panel"

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
      <DashboardPanel title="Inventory by location" description="Stock distribution across locations" className="h-full">
        <div className="flex-1 min-h-[260px] flex items-center justify-center text-sm text-muted-foreground">Loading…</div>
      </DashboardPanel>
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
    <DashboardPanel
      title="Inventory by location"
      description="Stock distribution across all locations"
      footer="Comparing inventory levels across all locations"
      className="h-full"
    >
      <div className="flex-1 min-h-[260px] px-2 py-4">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
            <CartesianGrid vertical={false} className="stroke-border/60" />
            <XAxis dataKey="location" tickLine={false} tickMargin={8} axisLine={false} className="text-[11px] fill-muted-foreground" />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="totalStock" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>
    </DashboardPanel>
  )
}
