import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    User,
    TrendingUp,
    TrendingDown,
    Eye,
    Package,
    Warehouse,
    Mail,
    AlertTriangle
} from "lucide-react";
import { InventoryLog, INVENTORY_LOG_TYPES } from "../../../data/model/record-entity";

interface InventoryRecordCardProps {
    record: InventoryLog;
}

export const InventoryRecordCard = ({ record }: InventoryRecordCardProps) => {
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const isPositiveChange = record.log_type === INVENTORY_LOG_TYPES.ADDED || 
                            record.log_type === INVENTORY_LOG_TYPES.RESTOCKED;

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* SKU Badge */}
                            {record.inventory?.sku?.sku_no && (
                                <Badge variant="outline" className="text-xs font-mono">
                                    <Package className="h-3 w-3 mr-1" />
                                    SKU: {record.inventory.sku.sku_no}
                                </Badge>
                            )}
                            
                            {/* Operation Type Badge */}
                            <Badge 
                                variant={isPositiveChange ? "default" : "secondary"}
                                className={`text-xs ${
                                    isPositiveChange
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                }`}
                            >
                                {isPositiveChange ? (
                                    <>
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        {record.log_type}
                                    </>
                                ) : (
                                    <>
                                        <TrendingDown className="h-3 w-3 mr-1" />
                                        {record.log_type}
                                    </>
                                )}
                            </Badge>

                            {/* Warehouse Badge */}
                            {record.inventory?.warehouse?.name && (
                                <Badge variant="secondary" className="text-xs">
                                    <Warehouse className="h-3 w-3 mr-1" />
                                    {record.inventory.warehouse.name}
                                </Badge>
                            )}

                            {/* Low Stock Warning */}
                            {record.inventory?.quantity && record.inventory?.threshold_quantity && 
                             record.inventory.quantity <= record.inventory.threshold_quantity && (
                                <Badge variant="destructive" className="text-xs">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Low Stock
                                </Badge>
                            )}
                        </div>

                        {/* Log Info */}
                        <div>
                            <h4 className="font-semibold text-base">
                                {record.metadata?.title || `Inventory Log #${record.id.slice(-8)}`}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                Changed {Math.abs(record.quantity_change)} units
                                {" • "}
                                Stock: {record.quantity_before} → {record.quantity_after}
                                {record.inventory?.quantity && (
                                    <>
                                        {" • "}
                                        Current: {record.inventory.quantity}
                                    </>
                                )}
                                {record.inventory?.threshold_quantity && (
                                    <>
                                        {" • "}
                                        Threshold: {record.inventory.threshold_quantity}
                                    </>
                                )}
                            </p>
                            {record.metadata?.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {record.metadata.description}
                                </p>
                            )}
                        </div>

                        {/* Notes */}
                        {record.notes && (
                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-sm text-muted-foreground">
                                    <strong>Notes:</strong> {record.notes}
                                </p>
                            </div>
                        )}

                        {/* Additional Info */}
                        {(record.metadata?.source || record.metadata?.ip_address) && (
                            <div className="bg-muted/30 rounded-lg p-3">
                                <p className="text-sm text-muted-foreground">
                                    {record.metadata.source && (
                                        <>
                                            <strong>Source:</strong> {record.metadata.source}
                                        </>
                                    )}
                                    {record.metadata.ip_address && (
                                        <span className={record.metadata.source ? "ml-3" : ""}>
                                            <strong>IP:</strong> {record.metadata.ip_address}
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            {/* User Info */}
                            <div className="flex items-center gap-1">
                                {record.user?.email ? (
                                    <>
                                        <Mail className="h-3 w-3" />
                                        {record.user.email}
                                    </>
                                ) : (
                                    <>
                                        <User className="h-3 w-3" />
                                        User ID: {record.user_id.slice(-8)}
                                    </>
                                )}
                            </div>
                            
                            {/* Timestamp */}
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimestamp(record.created_at)}
                            </div>

                            {/* Record ID */}
                            <div className="flex items-center gap-1 font-mono">
                                ID: {record.id.slice(-8)}
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};