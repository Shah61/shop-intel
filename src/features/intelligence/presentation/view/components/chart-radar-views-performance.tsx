"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

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

export const description = "A radar chart comparing Shop-Intel vs Top Competitor performance"

const chartData = [
  { metric: "Views", ["Shop-Intel"]: 72, competitor: 85 },
  { metric: "Likes", ["Shop-Intel"]: 65, competitor: 78 },
  { metric: "Comments", ["Shop-Intel"]: 58, competitor: 82 },
  { metric: "Shares", ["Shop-Intel"]: 45, competitor: 71 },
  { metric: "Saves", ["Shop-Intel"]: 62, competitor: 76 }
]

const chartConfig = {
  ["Shop-Intel"]: {
    label: "Shop-Intel",
    color: "hsl(var(--chart-1))",
  },
  competitor: {
    label: "Top Competitor",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ChartRadarGridCircle() {
  return (
    <div className="w-full">
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[280px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                hideLabel 
                className="bg-white/95 dark:bg-black/95 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50"
              />}
            />
            <PolarGrid gridType="circle" className="stroke-slate-200 dark:stroke-slate-700" />
            <PolarAngleAxis dataKey="metric" className="text-xs fill-slate-600 dark:fill-slate-400" />
            <Radar
              dataKey="Shop-Intel"
              fill="var(--color-Shop-Intel)"
              fillOpacity={0.3}
              stroke="var(--color-Shop-Intel)"
              strokeWidth={2}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
            <Radar
              dataKey="competitor"
              fill="var(--color-competitor)"
              fillOpacity={0.3}
              stroke="var(--color-competitor)"
              strokeWidth={2}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-4">
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]"></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Shop-Intel Beauty</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]"></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Top Competitor</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 leading-none font-medium text-slate-600 dark:text-slate-400">
          <TrendingUp className="h-4 w-4 text-orange-500" />
          Competitor outperforming by 18% on average
        </div>
        <div className="text-muted-foreground flex items-center gap-2 leading-none text-slate-500">
          Based on last 30 days performance data
        </div>
      </CardFooter>
    </div>
  )
}
