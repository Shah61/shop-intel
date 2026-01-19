import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid
} from "recharts";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { LineChart as LineChartIcon, TrendingUp, RefreshCw, Calendar } from "lucide-react";
import { useMarketingHistoricalData } from "../../tanstack/marketing-tanstack";
import { format } from "date-fns";

interface MarketingChartProps {
  startDate: Date;
  endDate: Date;
  platform?: string;
}

type ChartType = 'area' | 'line';

export function MarketingChart({ startDate, endDate, platform }: MarketingChartProps) {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [showByMonth, setShowByMonth] = useState<boolean>(false);

  // Fetch historical data using the API
  const { data: historicalDataResponse, isLoading, error } = useMarketingHistoricalData({
    start_date: format(startDate, 'yyyy-MM-dd'),
    end_date: format(endDate, 'yyyy-MM-dd'),
    platform,
  });

  // Transform API data for chart consumption
  const chartData = useMemo(() => {
    if (!historicalDataResponse?.data?.historicalData) return [];
    
    if (showByMonth) {
      // Group by month
      const monthlyData = historicalDataResponse.data.historicalData.reduce((acc, point) => {
        const monthKey = format(new Date(point.start_date), 'yyyy-MM');
        const monthDisplay = format(new Date(point.start_date), 'MMM yyyy');
        
        if (!acc[monthKey]) {
          acc[monthKey] = {
            date: monthDisplay,
            spend: 0,
            formattedDate: monthDisplay,
            monthKey
          };
        }
        
        acc[monthKey].spend += point.value;
        return acc;
      }, {} as Record<string, any>);
      
      return Object.values(monthlyData).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
    } else {
      // Show daily data
      return historicalDataResponse.data.historicalData.map(point => ({
        date: format(new Date(point.start_date), 'MMM dd'),
        spend: point.value,
        formattedDate: format(new Date(point.start_date), 'MMMM dd, yyyy')
      }));
    }
  }, [historicalDataResponse, showByMonth]);

  const totalSpend = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.spend, 0);
  }, [chartData]);

  const averageSpend = useMemo(() => {
    if (chartData.length === 0) return 0;
    
    if (showByMonth) {
      return totalSpend / chartData.length; // Average per month
    } else {
      return totalSpend / chartData.length; // Average per day
    }
  }, [totalSpend, chartData.length, showByMonth]);

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <XAxis 
              dataKey="date" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `RM${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                background: "white", 
                border: "1px solid #e5e5e5",
                borderRadius: "6px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
              formatter={(value: number) => [`RM${value.toFixed(2)}`, 'Marketing Spend']}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return payload[0].payload.formattedDate;
                }
                return label;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="spend" 
              stroke="rgba(236, 72, 153, 1)" 
              fill="rgba(236, 72, 153, 0.3)"
              strokeWidth={2}
            />
          </AreaChart>
        );
      
      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            <XAxis 
              dataKey="date" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `RM${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                background: "white", 
                border: "1px solid #e5e5e5",
                borderRadius: "6px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
              formatter={(value: number) => [`RM${value.toFixed(2)}`, 'Marketing Spend']}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return payload[0].payload.formattedDate;
                }
                return label;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="spend" 
              stroke="rgba(236, 72, 153, 1)" 
              strokeWidth={3}
              dot={{ fill: "rgba(236, 72, 153, 1)", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );
    }
  };

  if (error) {
    return (
      <Card className="w-full h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-muted-foreground mb-2">Failed to load chart data</div>
            <div className="text-sm text-muted-foreground">Please try again later</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Marketing Spend Overview</CardTitle>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>Total: RM{totalSpend.toFixed(2)}</span>
              <span>Avg: RM{averageSpend.toFixed(2)}/{showByMonth ? 'month' : 'day'}</span>
              <span>{showByMonth ? 'Months' : 'Days'}: {chartData.length}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={showByMonth ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setShowByMonth(!showByMonth)}
              disabled={isLoading}
            >
              <Calendar className="h-4 w-4 mr-1" />
              {showByMonth ? 'Show Daily' : 'Show Monthly'}
            </Button>
            <Button 
              variant={chartType === 'area' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setChartType('area')}
              disabled={isLoading}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Area
            </Button>
            <Button 
              variant={chartType === 'line' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setChartType('line')}
              disabled={isLoading}
            >
              <LineChartIcon className="h-4 w-4 mr-1" />
              Line
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-2 flex-1">
        <div className="h-[220px] w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading chart data...</span>
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-muted-foreground mb-2">No data available</div>
                <div className="text-sm text-muted-foreground">No marketing spend data for the selected period</div>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 