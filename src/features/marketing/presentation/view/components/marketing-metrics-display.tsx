import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
    Eye, 
    Heart, 
    MessageCircle, 
    Share, 
    Bookmark, 
    Download,
    TrendingUp,
    TrendingDown,
    Minus,
    Clock,
    User,
    ExternalLink
} from "lucide-react";
import { MarketingLink, MarketingLinkMetadata } from "../../../data/model/marketing-entity";
import { format, parseISO } from "date-fns";

interface MarketingMetricsDisplayProps {
    link: MarketingLink;
}

interface MetricItemProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    change?: number | string | null;
    changeLabel?: string;
}

const MetricItem = ({ icon, label, value, change, changeLabel }: MetricItemProps) => {
    const formatValue = (val: number | string) => {
        if (val === "not found" || val === "" || val === null || val === undefined) {
            return "N/A";
        }
        
        if (typeof val === 'number') {
            // Format large numbers more compactly
            if (val >= 1000000) {
                return (val / 1000000).toFixed(1) + "M";
            } else if (val >= 1000) {
                return (val / 1000).toFixed(1) + "K";
            }
            return val.toLocaleString();
        }
        
        return val.toString();
    };

    const formatChange = (changeVal: number | string) => {
        if (changeVal === "not found" || changeVal === "" || changeVal === null || changeVal === undefined || changeVal === 0) {
            return null;
        }
        
        const numVal = typeof changeVal === 'number' ? changeVal : parseInt(changeVal.toString());
        if (isNaN(numVal)) return null;
        
        return numVal;
    };

    const changeValue = change ? formatChange(change) : null;

    return (
        <div className="text-center p-2 rounded-lg bg-muted/20 border border-muted">
            <div
                className="flex items-center justify-center mb-1"
                style={{ color: "var(--preset-lighter)" }}
            >
                {icon}
            </div>
            <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
            <div className="text-sm font-bold">{formatValue(value)}</div>
            {changeValue !== null && (
                <div className="flex items-center justify-center gap-1 mt-1">
                    {changeValue > 0 ? (
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                    ) : changeValue < 0 ? (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                    ) : (
                        <Minus className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span
                        className={`text-xs ${
                            changeValue > 0
                                ? "text-emerald-500"
                                : changeValue < 0
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                        }`}
                    >
                        {changeValue > 0 ? "+" : ""}
                        {changeValue}
                    </span>
                </div>
            )}
        </div>
    );
};

const getPlatformMetrics = (platform: string, metadata: MarketingLinkMetadata) => {
    switch (platform) {
        case 'TIKTOK':
            return [
                {
                    icon: <Eye className="h-4 w-4" />,
                    label: "Views",
                    value: metadata.views || "N/A",
                    change: metadata["24h_change_views"],
                    changeLabel: "24h"
                },
                {
                    icon: <Heart className="h-4 w-4" />,
                    label: "Likes",
                    value: metadata.likes || "N/A",
                    change: metadata["24h_change_likes"],
                    changeLabel: "24h"
                },
                {
                    icon: <MessageCircle className="h-4 w-4" />,
                    label: "Comments",
                    value: metadata.comments || "N/A",
                    change: metadata["24h_change_comments"],
                    changeLabel: "24h"
                },
                {
                    icon: <Share className="h-4 w-4" />,
                    label: "Shares",
                    value: metadata.shares || "N/A",
                    change: metadata["24h_change_shares"],
                    changeLabel: "24h"
                },
                {
                    icon: <Bookmark className="h-4 w-4" />,
                    label: "Saves",
                    value: metadata.saves || "N/A",
                    change: metadata["24h_change_saves"],
                    changeLabel: "24h"
                },
                {
                    icon: <Download className="h-4 w-4" />,
                    label: "Downloads",
                    value: metadata.downloads || "N/A",
                    change: null
                }
            ];
        
        case 'TWITTER':
            return [
                {
                    icon: <Eye className="h-4 w-4" />,
                    label: "Views",
                    value: metadata.views || "N/A",
                    change: metadata["24h_change_views"],
                    changeLabel: "24h"
                },
                {
                    icon: <Heart className="h-4 w-4" />,
                    label: "Likes",
                    value: metadata.likes || "N/A",
                    change: metadata["24h_change_likes"],
                    changeLabel: "24h"
                },
                {
                    icon: <MessageCircle className="h-4 w-4" />,
                    label: "Replies",
                    value: metadata.replies || "N/A",
                    change: metadata["24h_change_replies"],
                    changeLabel: "24h"
                },
                {
                    icon: <Share className="h-4 w-4" />,
                    label: "Retweets",
                    value: metadata.retweets || "N/A",
                    change: metadata["24h_change_retweets"],
                    changeLabel: "24h"
                },
                {
                    icon: <Bookmark className="h-4 w-4" />,
                    label: "Bookmarks",
                    value: metadata.bookmarks || "N/A",
                    change: metadata["24h_change_bookmarks"],
                    changeLabel: "24h"
                }
            ];
        
        default:
            // Generic metrics for other platforms
            return [
                {
                    icon: <Eye className="h-4 w-4" />,
                    label: "Views",
                    value: metadata.views || "N/A",
                    change: metadata["24h_change_views"],
                    changeLabel: "24h"
                },
                {
                    icon: <Heart className="h-4 w-4" />,
                    label: "Likes",
                    value: metadata.likes || "N/A",
                    change: metadata["24h_change_likes"],
                    changeLabel: "24h"
                },
                {
                    icon: <MessageCircle className="h-4 w-4" />,
                    label: "Comments",
                    value: metadata.comments || "N/A",
                    change: metadata["24h_change_comments"],
                    changeLabel: "24h"
                },
                {
                    icon: <Share className="h-4 w-4" />,
                    label: "Shares",
                    value: metadata.shares || "N/A",
                    change: metadata["24h_change_shares"],
                    changeLabel: "24h"
                }
            ];
    }
};

export const MarketingMetricsDisplay = ({ link }: MarketingMetricsDisplayProps) => {
    if (!link.metadata) {
        return (
            <Card className="border border-muted">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {link.platform}
                            </Badge>
                            <a 
                                href={link.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs flex items-center gap-1"
                                style={{ color: "var(--preset-primary)" }}
                            >
                                <ExternalLink className="h-3 w-3" />
                                View Link
                            </a>
                        </div>
                    </div>
                    <div className="text-center py-4 text-muted-foreground">
                        <div className="text-sm">No metrics available</div>
                        <div className="text-xs">Tracking data not found</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const metrics = getPlatformMetrics(link.platform, link.metadata);
    const lastTracked = link.metadata.last_tracked ? 
        format(parseISO(link.metadata.last_tracked), 'MMM dd, HH:mm') : 
        "N/A";

    return (
        <Card className="border border-muted">
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            {link.platform}
                        </Badge>
                        <a 
                            href={link.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs flex items-center gap-1"
                            style={{ color: "var(--preset-primary)" }}
                        >
                            <ExternalLink className="h-3 w-3" />
                            View Link
                        </a>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Last: {lastTracked}</span>
                    </div>
                </div>

                {/* Metrics Grid - Compact Horizontal Layout */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-3">
                    {metrics.map((metric, index) => (
                        <MetricItem
                            key={index}
                            icon={metric.icon}
                            label={metric.label}
                            value={metric.value}
                            change={metric.change}
                            changeLabel={metric.changeLabel}
                        />
                    ))}
                </div>

                {/* Compact Footer Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-muted">
                    {(link.metadata.author_nickname || link.metadata.author_id) && (
                        <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{link.metadata.author_nickname || "Unknown"}</span>
                        </div>
                    )}
                    {link.platform === 'TIKTOK' && link.metadata.video_length && (
                        <div>
                            Duration: {Math.round((parseInt(link.metadata.video_length.toString()) / 1000))}s
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}; 