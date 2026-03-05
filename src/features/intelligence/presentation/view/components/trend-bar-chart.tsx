import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Channel, ChannelsParams } from '../../../data/model/trend-model';
import { useTopChannels } from '../../tanstack/trend-tanstack';

interface Metric {
  value: string;
  label: string;
  icon: any;
}

interface TrendBarChartProps {
  selectedMetric: string;
  selectedChannel: string | null;
  metrics: Metric[];
  onChannelSelect: (channelId: string) => void;
  platform?: "INSTAGRAM" | "TIKTOK" | "YOUTUBE";
  region?: string;
}

// Color palette for different channels
const colorPalette = [
  '#ec4899', // pink-500
  '#8b5cf6', // violet-500
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#a855f7', // purple-500
  '#14b8a6', // teal-500
  '#eab308', // yellow-500
  '#dc2626', // red-600
  '#2563eb', // blue-600
  '#059669', // emerald-600
  '#7c3aed', // violet-600
  '#db2777', // pink-600
  '#0891b2', // cyan-600
  '#65a30d', // lime-600
  '#ea580c', // orange-600
];

const TrendBarChart: React.FC<TrendBarChartProps> = ({
  selectedMetric,
  selectedChannel,
  metrics,
  onChannelSelect,
  platform,
  region,
}) => {
  // Map UI metric values to API types
  const getApiType = (metric: string): "LIKE" | "COMMENT" | "SHARE" | "VIEW" | "24H_CHANGE" => {
    switch (metric) {
      case 'change24h':
      case '24h_change':
        return '24H_CHANGE';
      case 'views':
        return 'VIEW';
      case 'likes':
        return 'LIKE';
      case 'comments':
        return 'COMMENT';
      case 'shares':
        return 'SHARE';
      default:
        return 'VIEW';
    }
  };

  // Prepare API parameters
  const apiParams: ChannelsParams = useMemo(() => {
    const params: ChannelsParams = {
      type: getApiType(selectedMetric),
    };
    
    if (platform) {
      params.platform = platform;
    }
    
    if (region) {
      params.region = region;
    }
    
    return params;
  }, [selectedMetric, platform, region]);

  // Fetch channels data
  const { data: channelsData, isLoading, error } = useTopChannels(apiParams);
  const channels = channelsData?.data?.channels || [];
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getMetricDataKey = () => {
    // Map the chart data to use the correct field from summary_metadata
    return (d: Channel) => {
      const metadata = d.summary_metadata;
      switch (selectedMetric) {
        case 'change24h':
        case '24h_change':
          return Math.abs(metadata.total_24h_change);
        case 'views':
          return metadata.total_views;
        case 'likes':
          return metadata.total_likes;
        case 'comments':
          return metadata.total_comments;
        default:
          return metadata.total_views;
      }
    };
  };

  const getChannelColor = (index: number, isSelected: boolean) => {
    if (isSelected) {
      return '#e11d48'; // Rose-600 for selected
    }
    return colorPalette[index % colorPalette.length];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const channel: Channel = payload[0].payload;
      const metricLabel = metrics.find(m => m.value === selectedMetric)?.label;
      const metadata = channel.summary_metadata;
      
      let value: number | string;
      switch (selectedMetric) {
        case 'change24h':
        case '24h_change':
          const changeValue = metadata.total_24h_change;
          const sign = changeValue >= 0 ? '+' : '-';
          value = `${sign}${Math.abs(changeValue)}%`;
          break;
        case 'views':
          value = formatNumber(metadata.total_views);
          break;
        case 'likes':
          value = formatNumber(metadata.total_likes);
          break;
        case 'comments':
          value = formatNumber(metadata.total_comments);
          break;
        default:
          value = formatNumber(metadata.total_views);
      }

      // Check if dark mode is active
      const isDark = document.documentElement.classList.contains('dark');

      const tooltipStyle = {
        backgroundColor: isDark ? '#111827' : '#ffffff', // gray-900 for dark, white for light
        color: isDark ? '#f9fafb' : '#111827', // gray-50 for dark, gray-900 for light
        border: `1px solid ${isDark ? '#000000' : '#e5e7eb'}`, // black for dark, gray-200 for light
        borderRadius: '8px',
        padding: '8px',
        fontSize: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      };

      const titleStyle = {
        fontWeight: '500',
        color: isDark ? '#f9fafb' : '#111827',
        margin: '0 0 4px 0',
      };

      const metricStyle = {
        color: isDark ? '#f472b6' : '#ec4899', // pink-400 for dark, pink-600 for light
        margin: '0',
      };

      const detailStyle = {
        color: isDark ? '#9ca3af' : '#6b7280', // gray-400 for dark, gray-500 for light
        fontSize: '10px',
        margin: '4px 0 0 0',
      };

      return (
        <div style={tooltipStyle}>
          <p style={titleStyle}>{label}</p>
          <p style={metricStyle}>
            {metricLabel}: {value}
          </p>
          <p style={detailStyle}>
            {channel.platform} • {channel.region}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `rgba(var(--preset-primary-rgb), 0.1)` }}>
              <TrendingUp className="h-4 w-4" style={{ color: `var(--preset-primary)` }} />
            </div>
            Top 20 Channels by {metrics.find(m => m.value === selectedMetric)?.label}
          </CardTitle>
          {selectedChannel && (
            <div
              className="text-sm font-medium px-3 py-1 rounded-lg border"
              style={{
                color: `var(--preset-primary)`,
                background: `rgba(var(--preset-primary-rgb), 0.06)`,
                borderColor: `rgba(var(--preset-primary-rgb), 0.15)`,
              }}
            >
              Selected: {channels.find((c: Channel) => c.id === selectedChannel)?.name}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading channels...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-500">Error loading channels</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channels.slice(0, 20)} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid stroke="transparent" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  height={20}
                />
                <YAxis tickFormatter={formatNumber} fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey={getMetricDataKey()}
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={(data: Channel) => onChannelSelect(data.id)}
                >
                  {channels.slice(0, 20).map((entry: Channel, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getChannelColor(index, selectedChannel === entry.id)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendBarChart; 