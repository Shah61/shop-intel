"use client"

import { TrendingUp, TrendingDown, AlertTriangle, Package } from "lucide-react"
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
import { SkuItem } from "../../../data/model/inventory-entity"
import { EditQuantityDialog } from "./edit-quantity-dialog"

const radialChartConfig = {
  currentStock: {
    label: "Current Stock",
    color: "hsl(142, 76%, 36%)", // green
  },
  thresholdLevel: {
    label: "Threshold Level", 
    color: "hsl(217, 91%, 60%)", // blue
  },
} satisfies ChartConfig

interface WarehouseSkuOverviewProps {
  sku: SkuItem
}

export function WarehouseSkuOverview({ sku }: WarehouseSkuOverviewProps) {
  
  const isOutOfStock = sku.quantity === 0
  const isLowStock = sku.threshold_quantity > 0 && sku.quantity <= sku.threshold_quantity
  
  // Create radial chart data for threshold comparison
  const radialData = [{
    category: "stock",
    currentStock: Math.max(sku.quantity, 1),
    thresholdLevel: sku.threshold_quantity > 0 ? Math.max(sku.threshold_quantity, 1) : 1
  }]
  
  const getTrendIcon = () => {
    if (isOutOfStock) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    } else if (isLowStock) {
      return <TrendingDown className="h-4 w-4 text-orange-500" />
    } else {
      return <TrendingUp className="h-4 w-4 text-emerald-500" />
    }
  }

  const getStockStatus = () => {
    if (isOutOfStock) {
      return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
    } else if (isLowStock) {
      return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Low Stock</Badge>
    } else {
      return <Badge className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">In Stock</Badge>
    }
  }

  const getStockDescription = () => {
    if (isOutOfStock) return "Stock depleted"
    if (isLowStock) return "Below threshold level"
    return "Stock levels normal"
  }

  const getUtilizationColor = () => {
    if (isOutOfStock) return "text-red-600 dark:text-red-400"
    if (isLowStock) return "text-orange-600 dark:text-orange-400"
    return "text-emerald-600 dark:text-emerald-400"
  }

  return (
    <Card className={`border-l-4 ${isOutOfStock ? 'border-l-red-500' : isLowStock ? 'border-l-orange-500' : 'border-l-emerald-500'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {sku.sku.sku_no}
              {isLowStock && (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
              {isOutOfStock && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </CardTitle>
            <CardDescription className="text-sm mt-1">{sku.sku.sku_name}</CardDescription>
          </div>
          {getStockStatus()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Half Donut Chart for Stock vs Threshold */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg p-4">
          <h4 className="text-sm font-medium text-center text-muted-foreground">Stock vs Threshold</h4>
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
                              {sku.quantity}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 8}
                              className={`text-xs ${isLowStock || isOutOfStock ? 'fill-orange-500' : 'fill-muted-foreground'}`}
                            >
                              {isOutOfStock ? 'Out of Stock!' : isLowStock ? 'Low Stock!' : 'Units Available'}
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </PolarRadiusAxis>
                <RadialBar
                  dataKey="currentStock"
                  stackId="a"
                  cornerRadius={4}
                  fill="var(--color-currentStock)"
                  className="stroke-transparent stroke-2"
                />
                {sku.threshold_quantity > 0 && (
                  <RadialBar
                    dataKey="thresholdLevel"
                    fill="var(--color-thresholdLevel)"
                    stackId="a"
                    cornerRadius={4}
                    className="stroke-transparent stroke-2"
                  />
                )}
              </RadialBarChart>
            </ChartContainer>
          </div>
        </div>

        {/* Stock Information */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <div className={`text-lg font-semibold ${getUtilizationColor()}`}>
              {sku.quantity}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-500">Current Stock</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {sku.threshold_quantity}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-500">Threshold Level</div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span className="font-medium">Warehouse:</span>
              <span className="text-right">{sku.warehouse.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">SKU ID:</span>
              <span className="text-right font-mono">{sku.id.slice(-8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Last Updated:</span>
              <span className="text-right">{new Date(sku.updated_at).toLocaleDateString()}</span>
            </div>
            {sku.threshold_quantity > 0 && (
              <div className="flex justify-between">
                <span className="font-medium">Stock Level:</span>
                <span className={`text-right font-medium ${getUtilizationColor()}`}>
                  {sku.quantity > sku.threshold_quantity 
                    ? `${Math.round((sku.quantity / sku.threshold_quantity) * 100)}% above threshold`
                    : sku.quantity === sku.threshold_quantity
                    ? 'At threshold level'
                    : `${Math.round((sku.quantity / sku.threshold_quantity) * 100)}% of threshold`
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 space-y-3">
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none">
              {getTrendIcon()}
              <span className="font-medium">
                {getStockDescription()}
              </span>
            </div>
            <div className="text-muted-foreground leading-none">
              Real-time warehouse inventory status
            </div>
          </div>
        </div>
        
        {/* Edit Quantity Button */}
        <div className="w-full">
          <EditQuantityDialog sku={sku} />
        </div>
      </CardFooter>
    </Card>
  )
} 