"use client";

import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { 
    MoreHorizontal,
    Eye,
    Calendar,
    MapPin,
    Users,
    Clock,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ExternalLink,
    ShoppingBag,
    Wrench,
    Rocket,
    Megaphone,
    Star,
    Package,
    FolderOpen,
    Tag,
    Gift,
    Zap,
    Target,
    TrendingUp,
    Settings,
    Layers,
    AlertCircle
} from "lucide-react";
import { EventEntity, EventFilterParams } from "../../../data/model/user-activity-entity";
import { usePrefetchEvent, useEventByIdQuery } from "../../../data/user-activity-tanstack";

interface EventsDataTableProps {
    events: EventEntity[];
    isLoading?: boolean;
    filters: EventFilterParams;
    onFiltersChange: (filters: EventFilterParams) => void;
    onEventView?: (event: EventEntity) => void;
    className?: string;
}

const UserActivityDataTable: React.FC<EventsDataTableProps> = ({
    events,
    isLoading = false,
    filters,
    onFiltersChange,
    onEventView,
    className
}) => {
    const [sortConfig, setSortConfig] = useState<{
        key: keyof EventEntity;
        direction: 'asc' | 'desc';
    }>({
        key: 'created_at',
        direction: 'desc'
    });

    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { prefetchEvent } = usePrefetchEvent();
    const { data: selectedEvent, isLoading: isEventLoading } = useEventByIdQuery(selectedEventId);

    const handleViewEvent = (event: EventEntity) => {
        setSelectedEventId(event.id);
        setIsDialogOpen(true);
        // Also call the provided onEventView callback if exists
        onEventView?.(event);
    };

    const handleSort = (key: keyof EventEntity) => {
        let direction: 'asc' | 'desc' = 'asc';
        
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        
        setSortConfig({ key, direction });
        onFiltersChange({
            ...filters,
            sort_by: key as string,
            sort_order: direction
        });
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTypeColor = (type?: string, eventName?: string) => {
        const lowerType = type?.toLowerCase() || '';
        const lowerName = eventName?.toLowerCase() || '';

        // Orders and Shopping
        if (lowerType === 'order' || lowerName.includes('order') || lowerName.includes('purchase') || lowerName.includes('checkout')) {
            return 'bg-blue-100 text-blue-800 border-blue-200';
        }
        
        // Categories
        if (lowerType === 'category' || lowerType === 'categories' || lowerName.includes('category') || lowerName.includes('categories') || lowerName.includes('classification')) {
            return 'bg-green-100 text-green-800 border-green-200';
        }
        
        // Collections
        if (lowerType === 'collection' || lowerType === 'collections' || lowerName.includes('collection') || lowerName.includes('collections') || lowerName.includes('group')) {
            return 'bg-purple-100 text-purple-800 border-purple-200';
        }
        
        // Discount
        if (lowerType === 'discount' || lowerName.includes('discount') || lowerName.includes('coupon') || lowerName.includes('sale')) {
            return 'bg-red-100 text-red-800 border-red-200';
        }
        
        // Products
        if (lowerType === 'product' || lowerName.includes('product') || lowerName.includes('inventory') || lowerName.includes('stock')) {
            return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        }
        
        // Tags and Labels
        if (lowerName.includes('tag') || lowerName.includes('label') || lowerName.includes('keyword')) {
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
        
        // Launches and Releases
        if (lowerType === 'launch' || lowerName.includes('launch') || lowerName.includes('release') || lowerName.includes('debut')) {
            return 'bg-orange-100 text-orange-800 border-orange-200';
        }
        
        // Workshops and Training
        if (lowerType === 'workshop' || lowerName.includes('workshop') || lowerName.includes('training') || lowerName.includes('tutorial')) {
            return 'bg-teal-100 text-teal-800 border-teal-200';
        }
        
        // Gifts and Rewards
        if (lowerName.includes('gift') || lowerName.includes('reward') || lowerName.includes('bonus')) {
            return 'bg-red-100 text-red-800 border-red-200';
        }
        
        // Analytics and Tracking
        if (lowerName.includes('analytics') || lowerName.includes('tracking') || lowerName.includes('metric') || lowerName.includes('report')) {
            return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        }
        
        // Campaign and Marketing
        if (lowerName.includes('campaign') || lowerName.includes('marketing') || lowerName.includes('advertisement')) {
            return 'bg-purple-100 text-purple-800 border-purple-200';
        }
        
        // System and Configuration
        if (lowerName.includes('system') || lowerName.includes('config') || lowerName.includes('setting') || lowerName.includes('admin')) {
            return 'bg-gray-100 text-gray-800 border-gray-200';
        }
        
        // Events and Activities
        if (lowerName.includes('event') || lowerName.includes('activity') || lowerName.includes('action')) {
            return 'bg-amber-100 text-amber-800 border-amber-200';
        }

        // Default fallback
        return 'bg-slate-100 text-slate-800 border-slate-200';
    };

    const getEventIconAndBg = (event: EventEntity) => {
        // Check event name for more specific categorization
        const eventName = event.name?.toLowerCase() || '';
        const eventType = event.type?.toLowerCase() || '';

        // Orders and Shopping
        if (eventType === 'order' || eventName.includes('order') || eventName.includes('purchase') || eventName.includes('checkout')) {
            return {
                icon: <ShoppingBag className="h-3 w-3 text-blue-600" />,
                bgClass: 'bg-blue-100'
            };
        }
        
        // Categories
        if (eventType === 'category' || eventType === 'categories' || eventName.includes('category') || eventName.includes('categories') || eventName.includes('classification')) {
            return {
                icon: <FolderOpen className="h-3 w-3 text-green-600" />,
                bgClass: 'bg-green-100'
            };
        }
        
        // Collections
        if (eventType === 'collection' || eventType === 'collections' || eventName.includes('collection') || eventName.includes('collections') || eventName.includes('group')) {
            return {
                icon: <Layers className="h-3 w-3 text-purple-600" />,
                bgClass: 'bg-purple-100'
            };
        }
        
        // Discount
        if (eventType === 'discount' || eventName.includes('discount') || eventName.includes('coupon') || eventName.includes('sale')) {
            return {
                icon: <Tag className="h-3 w-3 text-red-600" />,
                bgClass: 'bg-red-100'
            };
        }
        
        // Products
        if (eventType === 'product' || eventName.includes('product') || eventName.includes('inventory') || eventName.includes('stock')) {
            return {
                icon: <ShoppingBag className="h-3 w-3 text-indigo-600" />,
                bgClass: 'bg-indigo-100'
            };
        }
        
        // Tags and Labels
        if (eventName.includes('tag') || eventName.includes('label') || eventName.includes('keyword')) {
            return {
                icon: <Tag className="h-3 w-3 text-yellow-600" />,
                bgClass: 'bg-yellow-100'
            };
        }
        
        // Launches and Releases
        if (eventType === 'launch' || eventName.includes('launch') || eventName.includes('release') || eventName.includes('debut')) {
            return {
                icon: <Rocket className="h-3 w-3 text-orange-600" />,
                bgClass: 'bg-orange-100'
            };
        }
        
        // Workshops and Training
        if (eventType === 'workshop' || eventName.includes('workshop') || eventName.includes('training') || eventName.includes('tutorial')) {
            return {
                icon: <Wrench className="h-3 w-3 text-teal-600" />,
                bgClass: 'bg-teal-100'
            };
        }
        
        // Gifts and Rewards
        if (eventName.includes('gift') || eventName.includes('reward') || eventName.includes('bonus')) {
            return {
                icon: <Gift className="h-3 w-3 text-red-600" />,
                bgClass: 'bg-red-100'
            };
        }
        
        // Analytics and Tracking
        if (eventName.includes('analytics') || eventName.includes('tracking') || eventName.includes('metric') || eventName.includes('report')) {
            return {
                icon: <TrendingUp className="h-3 w-3 text-emerald-600" />,
                bgClass: 'bg-emerald-100'
            };
        }
        
        // Campaign and Marketing
        if (eventName.includes('campaign') || eventName.includes('marketing') || eventName.includes('advertisement')) {
            return {
                icon: <Target className="h-3 w-3 text-purple-600" />,
                bgClass: 'bg-purple-100'
            };
        }
        
        // System and Configuration
        if (eventName.includes('system') || eventName.includes('config') || eventName.includes('setting') || eventName.includes('admin')) {
            return {
                icon: <Settings className="h-3 w-3 text-gray-600" />,
                bgClass: 'bg-gray-100'
            };
        }
        
        // Events and Activities
        if (eventName.includes('event') || eventName.includes('activity') || eventName.includes('action')) {
            return {
                icon: <Zap className="h-3 w-3 text-amber-600" />,
                bgClass: 'bg-amber-100'
            };
        }

        // Default fallback
        return {
            icon: <Calendar className="h-3 w-3 text-slate-600" />,
            bgClass: 'bg-slate-100'
        };
    };

    const getEventIcon = (event: EventEntity) => {
        return getEventIconAndBg(event).icon;
    };

    const getSortIcon = (column: keyof EventEntity) => {
        if (sortConfig.key !== column) {
            return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
        }
        return sortConfig.direction === 'asc' 
            ? <ArrowUp className="ml-2 h-4 w-4" />
            : <ArrowDown className="ml-2 h-4 w-4" />;
    };

    const SortableHeader = ({ 
        column, 
        children 
    }: { 
        column: keyof EventEntity; 
        children: React.ReactNode;
    }) => (
        <Button
            variant="ghost"
            className="h-auto p-0 font-medium hover:bg-transparent"
            onClick={() => handleSort(column)}
        >
            {children}
            {getSortIcon(column)}
        </Button>
    );

    const formatEventType = (event: EventEntity) => {
        if (event.type) {
            return event.type.charAt(0).toUpperCase() + event.type.slice(1);
        }
        // Infer type from event name if not explicitly set
        const eventName = event.name.toLowerCase();
        if (eventName.includes('order')) {
            return 'Order';
        }
        if (eventName.includes('category') || eventName.includes('categories')) {
            return 'Categories';
        }
        if (eventName.includes('collection') || eventName.includes('collections')) {
            return 'Collections';
        }
        if (eventName.includes('discount') || eventName.includes('coupon')) {
            return 'Discount';
        }
        if (eventName.includes('product')) {
            return 'Product';
        }
        return 'Event';
    };

    if (isLoading) {
        return (
            <Card className={cn("p-6", className)}>
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-8" />
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    if (events.length === 0) {
        return (
            <Card className={cn("p-12 text-center", className)}>
                <div className="mx-auto max-w-sm">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No user activity found</h3>
                    <p className="text-muted-foreground">
                        No user activity match your current filters. Try adjusting your search criteria.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className={cn("overflow-hidden", className)}>
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-b">
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead className="min-w-[300px]">
                            <SortableHeader column="name">Event Details</SortableHeader>
                        </TableHead>
                        <TableHead className="min-w-[100px]">Type</TableHead>
                        <TableHead className="min-w-[120px]">
                            <SortableHeader column="created_at">Created</SortableHeader>
                        </TableHead>
                        <TableHead className="min-w-[120px]">
                            <SortableHeader column="updated_at">Updated</SortableHeader>
                        </TableHead>
                        <TableHead className="min-w-[140px]">User</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {events.map((event) => (
                        <TableRow 
                            key={event.id} 
                            className="hover:bg-muted/50 cursor-pointer group"
                            onMouseEnter={() => prefetchEvent(event.id)}
                            onClick={() => handleViewEvent(event)}
                        >
                            <TableCell>
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className={cn("text-xs font-medium", getEventIconAndBg(event).bgClass)}>
                                        {getEventIcon(event)}
                                    </AvatarFallback>
                                </Avatar>
                            </TableCell>
                            
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="font-medium text-sm leading-tight flex items-center gap-2">
                                        {event.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {event.description}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <span className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground font-mono">
                                            {event.id}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            
                            <TableCell>
                                <Badge 
                                    variant="outline" 
                                    className={cn("text-xs", getTypeColor(event.type, event.name))}
                                >
                                    {formatEventType(event)}
                                </Badge>
                            </TableCell>
                            
                            <TableCell>
                                <div className="text-sm">
                                    <div>{new Date(event.created_at).toLocaleDateString()}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(event.created_at).toLocaleTimeString()}
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="text-sm">
                                    <div>{new Date(event.updated_at).toLocaleDateString()}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(event.updated_at).toLocaleTimeString()}
                                    </div>
                                </div>
                            </TableCell>
                            
                            <TableCell>
                                {event.user && (
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium">
                                            {event.user.name && event.user.name !== '-' ? event.user.name : 'Unknown'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {event.user.email}
                                        </div>
                                    </div>
                                )}
                            </TableCell>
                            
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[160px]">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewEvent(event);
                                            }}
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(event.id);
                                            }}
                                        >
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Copy ID
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Event Details Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedEvent && getEventIcon(selectedEvent)}
                            Event Details
                        </DialogTitle>
                        <DialogDescription>
                            Detailed information about the selected event
                        </DialogDescription>
                    </DialogHeader>
                    
                    {isEventLoading ? (
                        <div className="space-y-4 p-4">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    ) : selectedEvent ? (
                        <div className="space-y-6 p-4">
                            {/* Event Header */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold">{selectedEvent.name}</h3>
                                    <Badge 
                                        variant="outline" 
                                        className={cn("text-xs", getTypeColor(selectedEvent.type, selectedEvent.name))}
                                    >
                                        {formatEventType(selectedEvent)}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                            </div>

                            {/* Event ID */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Event ID</h4>
                                <div className="bg-muted p-2 rounded font-mono text-xs">
                                    {selectedEvent.id}
                                </div>
                            </div>

                            {/* Event Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        Created
                                    </h4>
                                    <div className="text-sm">
                                        <div>{new Date(selectedEvent.created_at).toLocaleDateString()}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(selectedEvent.created_at).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        Updated
                                    </h4>
                                    <div className="text-sm">
                                        <div>{new Date(selectedEvent.updated_at).toLocaleDateString()}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(selectedEvent.updated_at).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* User Information */}
                            {selectedEvent.user && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        User Information
                                    </h4>
                                    <div className="bg-muted/50 p-3 rounded">
                                        <div className="text-sm font-medium">
                                            {selectedEvent.user.name && selectedEvent.user.name !== '-' 
                                                ? selectedEvent.user.name 
                                                : 'Unknown User'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {selectedEvent.user.email}
                                        </div>
                                        {selectedEvent.user.role && (
                                            <Badge variant="secondary" className="mt-2 text-xs">
                                                {selectedEvent.user.role}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Additional Event Data */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Raw Event Data</h4>
                                <div className="bg-muted p-3 rounded text-xs font-mono max-h-40 overflow-y-auto">
                                    <pre>{JSON.stringify(selectedEvent, null, 2)}</pre>
                                </div>
                            </div>
                        </div>
                    ) : selectedEventId ? (
                        <div className="p-4 text-center text-muted-foreground">
                            <div className="space-y-2">
                                <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
                                <h4 className="font-medium">Event not found</h4>
                                <p className="text-sm">
                                    The event with ID {selectedEventId} could not be loaded.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 text-center text-muted-foreground">
                            No event selected
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default UserActivityDataTable; 