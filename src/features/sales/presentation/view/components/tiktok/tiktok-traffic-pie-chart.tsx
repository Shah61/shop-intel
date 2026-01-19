import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend } from "recharts"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

// Import the TrafficEntity interface
export interface TrafficEntity {
    visitors: number;
    orders: number;
    conversionRate: number;
    date: string;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: { active: boolean, payload: any, label: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background rounded-lg shadow-md p-2 border border-gray-100">
                <p className="font-medium text-xs mb-1">{payload[0].name}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={`item-${index}`} className="flex items-center gap-2 py-0.5">
                        <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: entry.payload.color }}
                        />
                        <span className="text-gray-600 text-xs">{entry.name}</span>
                        <span className="font-semibold ml-auto text-xs">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// TikTok-inspired darker color palette
const colors = {
    visitors: "#1AC0BB", // Darker teal/cyan
    orders: "#E6173D", // Darker red/pink
    conversion: "#333333", // Dark gray
    // Shades for monthly breakdowns
    visitorsShades: ["#1AC0BB", "#14A6A1", "#0E8C88"],
    ordersShades: ["#E6173D", "#C21434", "#9E102A"],
    conversionShades: ["#333333", "#555555", "#777777"]
};

// Sample quarterly data from our previous implementation
const quarterlyData = {
    "Q1 2023": [
        { visitors: 150, orders: 65, conversionRate: 85, date: "2023-01-01" },
        { visitors: 185, orders: 78, conversionRate: 90, date: "2023-02-01" },
        { visitors: 205, orders: 95, conversionRate: 95, date: "2023-03-01" },
    ],
    "Q2 2023": [
        { visitors: 220, orders: 105, conversionRate: 90, date: "2023-04-01" },
        { visitors: 235, orders: 120, conversionRate: 92, date: "2023-05-01" },
        { visitors: 250, orders: 130, conversionRate: 95, date: "2023-06-01" },
    ],
    "Q3 2023": [
        { visitors: 270, orders: 140, conversionRate: 98, date: "2023-07-01" },
        { visitors: 290, orders: 155, conversionRate: 100, date: "2023-08-01" },
        { visitors: 310, orders: 170, conversionRate: 103, date: "2023-09-01" },
    ],
    "Q4 2023": [
        { visitors: 330, orders: 185, conversionRate: 105, date: "2023-10-01" },
        { visitors: 350, orders: 200, conversionRate: 110, date: "2023-11-01" },
        { visitors: 370, orders: 215, conversionRate: 115, date: "2023-12-01" },
    ],
    "Q1 2024": [
        { visitors: 186, orders: 80, conversionRate: 100, date: "2024-01-01" },
        { visitors: 305, orders: 200, conversionRate: 100, date: "2024-02-01" },
        { visitors: 237, orders: 120, conversionRate: 100, date: "2024-03-01" },
    ],
    "Q2 2024": [
        { visitors: 73, orders: 190, conversionRate: 100, date: "2024-04-01" },
        { visitors: 209, orders: 130, conversionRate: 100, date: "2024-05-01" },
        { visitors: 214, orders: 140, conversionRate: 100, date: "2024-06-01" },
    ],
    "Q3 2024": [
        { visitors: 258, orders: 160, conversionRate: 120, date: "2024-07-01" },
        { visitors: 342, orders: 210, conversionRate: 135, date: "2024-08-01" },
        { visitors: 370, orders: 230, conversionRate: 150, date: "2024-09-01" },
    ],
    "Q4 2024": [
        { visitors: 410, orders: 250, conversionRate: 180, date: "2024-10-01" },
        { visitors: 470, orders: 290, conversionRate: 200, date: "2024-11-01" },
        { visitors: 520, orders: 320, conversionRate: 230, date: "2024-12-01" },
    ],
}

// Yearly totals
const yearlyData = {
    "2023": {
        visitors: Object.values(quarterlyData)
            .filter(q => q[0].date.startsWith("2023"))
            .flatMap(q => q)
            .reduce((sum, item) => sum + item.visitors, 0),
        orders: Object.values(quarterlyData)
            .filter(q => q[0].date.startsWith("2023"))
            .flatMap(q => q)
            .reduce((sum, item) => sum + item.orders, 0),
        conversionRate: Object.values(quarterlyData)
            .filter(q => q[0].date.startsWith("2023"))
            .flatMap(q => q)
            .reduce((sum, item) => sum + item.conversionRate, 0) / 12, // Average conversion rate
    },
    "2024": {
        visitors: Object.values(quarterlyData)
            .filter(q => q[0].date.startsWith("2024"))
            .flatMap(q => q)
            .reduce((sum, item) => sum + item.visitors, 0),
        orders: Object.values(quarterlyData)
            .filter(q => q[0].date.startsWith("2024"))
            .flatMap(q => q)
            .reduce((sum, item) => sum + item.orders, 0),
        conversionRate: Object.values(quarterlyData)
            .filter(q => q[0].date.startsWith("2024"))
            .flatMap(q => q)
            .reduce((sum, item) => sum + item.conversionRate, 0) / 12, // Average conversion rate
    }
}

const TiktokTrafficPieChart = () => {
    const [selectedQuarter, setSelectedQuarter] = useState("Q4 2024")
    const [selectedMetric, setSelectedMetric] = useState("visitors")
    const [selectedYear, setSelectedYear] = useState<null | string>(null)

    // Get quarter data
    const getQuarterData = () => {
        // If viewing yearly data
        if (selectedYear) {
            return [
                { name: "Visitors", value: yearlyData[selectedYear as keyof typeof yearlyData].visitors, color: colors.visitors },
                { name: "Orders", value: yearlyData[selectedYear as keyof typeof yearlyData].orders, color: colors.orders },
                { name: "Conversion Rate", value: yearlyData[selectedYear as keyof typeof yearlyData].conversionRate, color: colors.conversion }
            ]
        }

        // If viewing distribution of a single metric across months in a quarter
        const quarterItems = quarterlyData[selectedQuarter as keyof typeof quarterlyData]

        if (selectedMetric === "visitors") {
            return quarterItems.map((item, index) => ({
                name: new Date(item.date).toLocaleString('default', { month: 'short' }),
                value: item.visitors,
                color: colors.visitorsShades[index]
            }))
        } else if (selectedMetric === "orders") {
            return quarterItems.map((item, index) => ({
                name: new Date(item.date).toLocaleString('default', { month: 'short' }),
                value: item.orders,
                color: colors.ordersShades[index]
            }))
        } else {
            return quarterItems.map((item, index) => ({
                name: new Date(item.date).toLocaleString('default', { month: 'short' }),
                value: item.conversionRate,
                color: colors.conversionShades[index]
            }))
        }
    }

    // Get data for distribution of metrics in a specific quarter
    const getMetricsDistribution = () => {
        if (selectedYear) {
            return [
                { name: "Visitors", value: yearlyData[selectedYear as keyof typeof yearlyData].visitors, color: colors.visitors },
                { name: "Orders", value: yearlyData[selectedYear as keyof typeof yearlyData].orders, color: colors.orders },
                { name: "Conversion Rate", value: yearlyData[selectedYear as keyof typeof yearlyData].conversionRate, color: colors.conversion }
            ]
        }

        const quarterTotal = quarterlyData[selectedQuarter as keyof typeof quarterlyData].reduce(
            (acc, item) => {
                acc.visitors += item.visitors
                acc.orders += item.orders
                acc.conversionRate += item.conversionRate / 3 // Average for the quarter
                return acc
            },
            { visitors: 0, orders: 0, conversionRate: 0 }
        )

        return [
            { name: "Visitors", value: quarterTotal.visitors, color: colors.visitors },
            { name: "Orders", value: quarterTotal.orders, color: colors.orders },
            { name: "Conversion Rate", value: quarterTotal.conversionRate, color: colors.conversion }
        ]
    }

    // Format the data for the pie chart
    const pieData = selectedMetric === "all" ? getMetricsDistribution() : getQuarterData()

    // Format values based on metric type
    const formatValue = (value: number, metric: string) => {
        if (metric === "Conversion Rate" || (selectedMetric === "conversionRate")) {
            return `${value.toFixed(1)}%`;
        }
        return value.toLocaleString();
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <CardTitle className="text-lg font-bold">Traffic Metrics Distribution</CardTitle>
                        <CardDescription>
                            {selectedMetric === "all"
                                ? `Distribution of metrics${selectedYear ? ` for ${selectedYear}` : ` in ${selectedQuarter}`}`
                                : `${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} by month${selectedYear ? ` in ${selectedYear}` : ` in ${selectedQuarter}`}`
                            }
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    {selectedMetric === "all" ? "All Metrics" : selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedMetric("all")}>
                                    All Metrics
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSelectedMetric("visitors")}>
                                    Visitors
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSelectedMetric("orders")}>
                                    Orders
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSelectedMetric("conversionRate")}>
                                    Conversion Rate
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    {selectedYear ? selectedYear : selectedQuarter}
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setSelectedYear("2023"); setSelectedQuarter(""); }}>
                                    2023 (Full Year)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSelectedYear("2024"); setSelectedQuarter(""); }}>
                                    2024 (Full Year)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSelectedYear(null); setSelectedQuarter("Q1 2023"); }}>
                                    Q1 2023
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSelectedYear(null); setSelectedQuarter("Q2 2023"); }}>
                                    Q2 2023
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSelectedYear(null); setSelectedQuarter("Q3 2023"); }}>
                                    Q3 2023
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSelectedYear(null); setSelectedQuarter("Q4 2023"); }}>
                                    Q4 2023
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSelectedYear(null); setSelectedQuarter("Q1 2024"); }}>
                                    Q1 2024
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSelectedYear(null); setSelectedQuarter("Q2 2024"); }}>
                                    Q2 2024
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSelectedYear(null); setSelectedQuarter("Q3 2024"); }}>
                                    Q3 2024
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSelectedYear(null); setSelectedQuarter("Q4 2024"); }}>
                                    Q4 2024
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Legend
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                iconType="circle"
                                iconSize={10}
                                formatter={(value) => <span className="text-xs font-medium">{value}</span>}
                            />

                            <RechartsTooltip
                                content={<CustomTooltip active={false} payload={[]} label="" />}
                                formatter={(value, name, props) => {
                                    return [formatValue(value as number, name as string), name];
                                }}
                            />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export default TiktokTrafficPieChart;