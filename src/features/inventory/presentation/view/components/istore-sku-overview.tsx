"use client"

import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { RadialBar, RadialBarChart, PolarRadiusAxis, Label } from "recharts"
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
import { Badge } from "@/components/ui/badge"

export const description = "A radial chart showing individual SKU stock distribution"

const radialChartConfig = {
  availableQty: {
    label: "Available",
    color: "hsl(142, 76%, 36%)", // green
  },
  processingQty: {
    label: "Processing", 
    color: "hsl(217, 91%, 60%)", // blue
  },
  allocatingQty: {
    label: "Allocating",
    color: "hsl(25, 95%, 53%)", // orange
  },
  reservedQty: {
    label: "Reserved",
    color: "hsl(262, 83%, 58%)", // purple
  },
  damagedQty: {
    label: "Damaged",
    color: "hsl(0, 84%, 60%)", // red
  },
} satisfies ChartConfig

interface SkuIndividualChartProps {
  skuNo: string
  skuDesc: string
  goodQty: number
  availableQty: number
  processingQty: number
  damagedQty: number
  allocatingQty: number
  reservedQty: number
  thresholdQty: number
  skuStatus: string
  country: string
  storageClientSkuNo: string
}

export function SkuIndividualChart({ 
  skuNo, 
  skuDesc, 
  goodQty,
  availableQty,
  processingQty,
  damagedQty,
  allocatingQty,
  reservedQty,
  thresholdQty,
  skuStatus,
  country,
  storageClientSkuNo
}: SkuIndividualChartProps) {
  
  // Create radial chart data based on actual stock levels
  const radialData = [{ 
    category: "stock", 
    availableQty: Math.max(availableQty, 1), 
    processingQty: Math.max(processingQty, 1),
    allocatingQty: Math.max(allocatingQty, 1),
    reservedQty: Math.max(reservedQty, 1),
    damagedQty: Math.max(damagedQty, 1)
  }]
  
  const totalStock = goodQty
  const isLowStock = totalStock < 10
  const isOutOfStock = availableQty === 0

  const getTrendIcon = () => {
    if (isOutOfStock) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    } else if (availableQty > thresholdQty * 2) {
      return <TrendingUp className="h-4 w-4 text-emerald-500" />
    } else if (availableQty <= thresholdQty) {
      return <TrendingDown className="h-4 w-4 text-orange-500" />
    } else {
      return <TrendingUp className="h-4 w-4 text-blue-500" />
    }
  }

  const getStockStatus = () => {
    if (availableQty === 0) {
      return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
    } else if (availableQty <= thresholdQty && thresholdQty > 0) {
      return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Low Stock</Badge>
    } else {
      return <Badge className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">In Stock</Badge>
    }
  }

  const getStockDescription = () => {
    if (isOutOfStock) return "Stock depleted"
    if (isLowStock) return "Low stock alert active"
    return "Stock levels normal"
  }

  return (
    <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-400">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {skuNo}
              {isLowStock && (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
              {isOutOfStock && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </CardTitle>
            <CardDescription className="text-sm mt-1">{skuDesc}</CardDescription>
          </div>
          {getStockStatus()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Radial Chart for Stock Distribution - Made More Prominent */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg p-4">
          <h4 className="text-sm font-medium text-center text-muted-foreground">Stock Distribution</h4>
          <div className="flex justify-center pt-8 pb-0 mb-0">
            <ChartContainer config={radialChartConfig} className="w-[360px] h-[200px]">
              <RadialBarChart
                data={radialData}
                startAngle={180}
                endAngle={0}
                innerRadius={70}
                outerRadius={140}
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) - 8}
                              className="fill-foreground text-lg font-bold"
                            >
                              {totalStock}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 8}
                              className={`text-xs ${isLowStock || isOutOfStock ? 'fill-orange-500' : 'fill-muted-foreground'}`}
                            >
                              {isOutOfStock ? 'Out of Stock!' : isLowStock ? 'Low Stock!' : 'Total Units'}
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </PolarRadiusAxis>
                <RadialBar
                  dataKey="availableQty"
                  stackId="a"
                  cornerRadius={4}
                  fill="var(--color-availableQty)"
                  className="stroke-transparent stroke-2"
                />
                <RadialBar
                  dataKey="processingQty"
                  fill="var(--color-processingQty)"
                  stackId="a"
                  cornerRadius={4}
                  className="stroke-transparent stroke-2"
                />
                <RadialBar
                  dataKey="allocatingQty"
                  fill="var(--color-allocatingQty)"
                  stackId="a"
                  cornerRadius={4}
                  className="stroke-transparent stroke-2"
                />
                <RadialBar
                  dataKey="reservedQty"
                  fill="var(--color-reservedQty)"
                  stackId="a"
                  cornerRadius={4}
                  className="stroke-transparent stroke-2"
                />
                <RadialBar
                  dataKey="damagedQty"
                  fill="var(--color-damagedQty)"
                  stackId="a"
                  cornerRadius={4}
                  className="stroke-transparent stroke-2"
                />
              </RadialBarChart>
            </ChartContainer>
          </div>
        </div>

        {/* Stock Breakdown - Updated with actual fields */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <div className="font-semibold text-emerald-700 dark:text-emerald-400">{availableQty}</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-500">Available</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="font-semibold text-blue-700 dark:text-blue-400">{processingQty}</div>
            <div className="text-xs text-blue-600 dark:text-blue-500">Processing</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
            <div className="font-semibold text-orange-700 dark:text-orange-400">{allocatingQty}</div>
            <div className="text-xs text-orange-600 dark:text-orange-500">Allocating</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <div className="font-semibold text-purple-700 dark:text-purple-400">{reservedQty}</div>
            <div className="text-xs text-purple-600 dark:text-purple-500">Reserved</div>
          </div>
          {damagedQty > 0 && (
            <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-900/20 col-span-2">
              <div className="font-semibold text-red-700 dark:text-red-400">{damagedQty}</div>
              <div className="text-xs text-red-600 dark:text-red-500">Damaged</div>
            </div>
          )}
        </div>

        {/* Additional SKU Information */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Client SKU:</span> {storageClientSkuNo}
            </div>
            <div>
              <span className="font-medium">Country:</span> {country}
            </div>
            <div>
              <span className="font-medium">Status:</span> 
              <Badge variant={skuStatus === 'ACTIVE' ? 'default' : 'secondary'} className="ml-1 text-xs">
                {skuStatus}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Utilization:</span> {Math.round((availableQty / goodQty) * 100)}%
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none">
              {getTrendIcon()}
              <span className="font-medium">
                {getStockDescription()}
              </span>
            </div>
            <div className="text-muted-foreground leading-none">
              Real-time inventory status for this SKU
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
} 