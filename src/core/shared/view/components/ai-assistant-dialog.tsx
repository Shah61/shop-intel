import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Message } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, DollarSign, ShoppingCart, Users } from "lucide-react";

// Type definitions for tool responses
interface SalesData {
    date: string;
    total_revenues: number;
    total_orders: number;
    total_visitors: number;
    conversion_rate?: number;
    total_conversions?: number;
    type: string;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(value);
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Component to display sales metrics
const SalesMetrics = ({ data }: { data: SalesData[] }) => {
    // Calculate totals
    const todaysData = data.filter(item => {
        const today = new Date().toISOString().split('T')[0];
        return item.date === today;
    });

    const totalRevenue = todaysData.reduce((sum, item) => sum + item.total_revenues, 0);
    const totalOrders = todaysData.reduce((sum, item) => sum + item.total_orders, 0);
    const totalVisitors = todaysData.reduce((sum, item) => sum + (item.total_visitors || 0), 0);

    // Get data from previous day for comparison
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayFormatted = yesterdayDate.toISOString().split('T')[0];

    const yesterdayData = data.filter(item => item.date === yesterdayFormatted);
    const yesterdayRevenue = yesterdayData.reduce((sum, item) => sum + item.total_revenues, 0);
    const yesterdayOrders = yesterdayData.reduce((sum, item) => sum + item.total_orders, 0);

    // Calculate change percentages
    const revenueChange = yesterdayRevenue ? ((totalRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
    const ordersChange = yesterdayOrders ? ((totalOrders - yesterdayOrders) / yesterdayOrders) * 100 : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-gray-500">Revenue</div>
                    <div className="bg-green-100 p-1 rounded-full">
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                </div>
                <div className="text-2xl font-bold mb-1">{formatCurrency(totalRevenue)}</div>
                <div className={`text-xs flex items-center ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {revenueChange >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                    {Math.abs(revenueChange).toFixed(1)}% from yesterday
                </div>
            </Card>

            <Card className="p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-gray-500">Orders</div>
                    <div className="bg-blue-100 p-1 rounded-full">
                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </div>
                </div>
                <div className="text-2xl font-bold mb-1">{totalOrders}</div>
                <div className={`text-xs flex items-center ${ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {ordersChange >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                    {Math.abs(ordersChange).toFixed(1)}% from yesterday
                </div>
            </Card>

            <Card className="p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-gray-500">Visitors</div>
                    <div className="bg-purple-100 p-1 rounded-full">
                        <Users className="h-4 w-4 text-purple-600" />
                    </div>
                </div>
                <div className="text-2xl font-bold mb-1">{totalVisitors}</div>
                <div className="text-xs text-gray-500">
                    Conversion: {((totalOrders / (totalVisitors || 1)) * 100).toFixed(1)}%
                </div>
            </Card>
        </div>
    );
};

// Component to display sales data in a chart
const SalesChart = ({ data }: { data: SalesData[] }) => {
    // Aggregate data by date (combining shopify and physical)
    const aggregatedData = data.reduce((acc: Record<string, any>, item) => {
        const date = item.date;
        if (!acc[date]) {
            acc[date] = {
                date: formatDate(date),
                revenue: 0,
                orders: 0,
            };
        }

        acc[date].revenue += item.total_revenues;
        acc[date].orders += item.total_orders;

        return acc;
    }, {});

    // Convert to array and sort by date
    const chartData = Object.values(aggregatedData).sort((a: any, b: any) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return (
        <div className="w-full h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" name="Revenue ($)" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#82ca9d" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

// Component to display detailed sales data table
const SalesTable = ({ data }: { data: SalesData[] }) => {
    return (
        <div className="overflow-x-auto mt-4">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitors</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <Badge variant={item.type === 'shopify' ? 'outline' : 'secondary'}>
                                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.total_revenues)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.total_orders}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.total_visitors}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Component to render the tool response visualization
const ToolResponseView = ({ data }: { data: any }) => {
    // Check if we have sales data
    if (!data || !Array.isArray(data) || !data.length) {
        return <div className="text-gray-500 text-center py-4">No sales data available</div>;
    }

    return (
        <Card className="p-4 my-4">
            <SalesMetrics data={data} />

            <Tabs defaultValue="chart" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="chart">Chart</TabsTrigger>
                    <TabsTrigger value="table">Table</TabsTrigger>
                </TabsList>
                <TabsContent value="chart">
                    <SalesChart data={data} />
                </TabsContent>
                <TabsContent value="table">
                    <SalesTable data={data} />
                </TabsContent>
            </Tabs>
        </Card>
    );
};

// Enhanced message card to handle tool invocations
const MessageCard = ({ message }: { message: Message }) => {
    const isUser = message.role === "user";
    const hasToolResponse = message.content === "" && message.toolInvocations && message.toolInvocations.length > 0;

    message.toolInvocations

    // Extract tool response data if available
    const toolResponse = hasToolResponse
        ? message.toolInvocations?.[0]
        : null;

    return (
        <div className={`flex flex-col gap-2 p-3 rounded-lg ${isUser ? 'bg-blue-50 ml-auto' : 'bg-gray-50'} max-w-[95%] mb-2`}>
            <div className="text-sm font-medium text-gray-700 mb-1">
                {isUser ? 'You' : 'Assistant'}
            </div>

            {message.content && (
                <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
            )}

            {hasToolResponse && (
                <ToolResponseView data={toolResponse} />
            )}
        </div>
    );
};

const AIAssistantDialog = () => {
    // Mock chat - no API calls
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Simulate AI response
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `This is a demo response to: "${input}". In a production environment, this would connect to an AI service to provide real sales performance insights.`,
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsLoading(false);
        }, 1000);
    };

    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <DollarSign className="h-4 w-4" />
                    Sales Assistant
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl h-[90vh] p-0 overflow-hidden">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle>Sales Performance Assistant</DialogTitle>
                    <DialogDescription>
                        Ask me anything about your sales performance and metrics
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col h-[calc(90vh-180px)]">
                    <div
                        className="flex-1 overflow-y-auto p-4 space-y-4"
                        ref={messagesContainerRef}
                    >
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <p>How can I help with your sales data today?</p>
                                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                    {['What are today\'s sales?', 'Compare this week vs last week', 'Top selling products'].map((suggestion) => (
                                        <Button
                                            key={suggestion}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                // @ts-ignore - handleSubmit expects an event but we're bypassing that
                                                handleSubmit({ preventDefault: () => { } }, { inputValue: suggestion });
                                            }}
                                        >
                                            {suggestion}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <MessageCard key={message.id} message={message} />
                            ))
                        )}

                        {isLoading && (
                            <div className="flex justify-center items-center py-2">
                                <div className="animate-pulse flex space-x-1">
                                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                                    <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t mt-auto">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit(e);
                            }}
                            className="flex flex-row gap-2"
                        >
                            <Input
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Ask about your sales performance..."
                                className="flex-1"
                            />
                            <Button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                            >
                                {isLoading ? "Thinking..." : "Ask"}
                            </Button>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AIAssistantDialog;