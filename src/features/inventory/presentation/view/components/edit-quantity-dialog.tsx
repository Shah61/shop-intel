"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Plus, Minus, Save, X, RefreshCw } from "lucide-react";
import { useUpdateInventoryQuantity } from "../../tanstack/inventory-tanstack";
import { SkuItem } from "../../../data/model/inventory-entity";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/src/core/lib/dummy-session-provider";

interface EditQuantityDialogProps {
    sku: SkuItem;
}

export function EditQuantityDialog({ sku }: EditQuantityDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [operation, setOperation] = useState<"add" | "remove">("add");
    const [quantity, setQuantity] = useState("");
    const [thresholdQuantity, setThresholdQuantity] = useState(sku.threshold_quantity.toString());
    const [notes, setNotes] = useState("");
    const { toast } = useToast();
    const { data: session } = useSession();
    
    const updateQuantityMutation = useUpdateInventoryQuantity();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const quantityNum = parseInt(quantity);
        const thresholdNum = parseInt(thresholdQuantity);
        
        if (isNaN(quantityNum) || quantityNum <= 0) {
            toast({
                title: "Invalid Quantity",
                description: "Please enter a valid positive number",
                variant: "destructive",
            });
            return;
        }

        if (isNaN(thresholdNum) || thresholdNum < 0) {
            toast({
                title: "Invalid Threshold",
                description: "Please enter a valid threshold quantity (0 or greater)",
                variant: "destructive",
            });
            return;
        }

        // For remove operation, check if we have enough stock
        if (operation === "remove" && quantityNum > sku.quantity) {
            toast({
                title: "Insufficient Stock",
                description: `Cannot remove ${quantityNum} units. Only ${sku.quantity} units available.`,
                variant: "destructive",
            });
            return;
        }

        const quantityChange = operation === "add" ? quantityNum : -quantityNum;

        // Check if we have user session
        if (!session?.user_entity?.id) {
            toast({
                title: "Authentication Error",
                description: "User session not found. Please log in again.",
                variant: "destructive",
            });
            return;
        }

        try {
            await updateQuantityMutation.mutateAsync({
                inventoryId: sku.id,
                quantityChange: quantityChange,
                userId: session.user_entity.id,
                thresholdQuantity: thresholdNum,
                notes: notes.trim() || undefined,
            });

            toast({
                title: "Inventory Updated",
                description: `Successfully ${operation === "add" ? "added" : "removed"} ${quantityNum} units ${operation === "add" ? "to" : "from"} ${sku.sku.sku_name}`,
            });

            setIsOpen(false);
            setQuantity("");
            setThresholdQuantity(sku.threshold_quantity.toString());
            setNotes("");
            setOperation("add");
        } catch (error) {
            toast({
                title: "Update Failed",
                description: "Failed to update inventory. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleCancel = () => {
        setIsOpen(false);
        setQuantity("");
        setThresholdQuantity(sku.threshold_quantity.toString());
        setNotes("");
        setOperation("add");
    };

    const isLoading = updateQuantityMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit Quantity
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Update Inventory
                    </DialogTitle>
                    <DialogDescription>
                        Update the quantity for <strong>{sku.sku.sku_name}</strong> (SKU: {sku.sku.sku_no})
                        <br />
                        Current stock: <strong>{sku.quantity}</strong> units | Threshold: <strong>{sku.threshold_quantity}</strong> units
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {/* Operation Type */}
                        <div className="space-y-3">
                            <Label>Select Operation</Label>
                            <div className="flex space-x-2">
                                <Button
                                    type="button"
                                    variant={operation === "add" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setOperation("add")}
                                    className="flex-1"
                                    disabled={isLoading}
                                >
                                    <Plus className="h-3 w-3 mr-1 text-green-600" />
                                    Add Stock
                                </Button>
                                <Button
                                    type="button"
                                    variant={operation === "remove" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setOperation("remove")}
                                    className="flex-1"
                                    disabled={isLoading}
                                >
                                    <Minus className="h-3 w-3 mr-1 text-red-600" />
                                    Remove Stock
                                </Button>
                            </div>
                        </div>

                        {/* Quantity Input */}
                        <div className="space-y-2">
                            <Label htmlFor="quantity">
                                Quantity to {operation === "add" ? "Add" : "Remove"}
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                max={operation === "remove" ? sku.quantity : undefined}
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="Enter quantity"
                                required
                                disabled={isLoading}
                            />
                            {operation === "remove" && (
                                <p className="text-xs text-muted-foreground">
                                    Maximum removable: {sku.quantity} units
                                </p>
                            )}
                        </div>

                        {/* Threshold Quantity Input */}
                        <div className="space-y-2">
                            <Label htmlFor="thresholdQuantity">
                                Threshold Quantity
                            </Label>
                            <Input
                                id="thresholdQuantity"
                                type="number"
                                min="0"
                                value={thresholdQuantity}
                                onChange={(e) => setThresholdQuantity(e.target.value)}
                                placeholder="Enter threshold quantity"
                                required
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Minimum stock level before alerting (current: {sku.threshold_quantity})
                            </p>
                        </div>

                        {/* Notes Field */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">
                                Notes (Optional)
                            </Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add notes about this inventory change..."
                                rows={3}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Record why this inventory change was made for audit purposes.
                            </p>
                        </div>

                        {/* Result Preview */}
                        {quantity && !isNaN(parseInt(quantity)) && thresholdQuantity && !isNaN(parseInt(thresholdQuantity)) && (
                            <div className="p-3 bg-muted rounded-lg">
                                <Label className="text-sm font-medium">Changes Preview:</Label>
                                <div className="space-y-1 mt-1">
                                    <p className="text-sm text-muted-foreground">
                                        Stock: {sku.quantity} {operation === "add" ? "+" : "-"} {quantity} = {" "}
                                        <span className="font-semibold">
                                            {operation === "add" 
                                                ? sku.quantity + parseInt(quantity)
                                                : sku.quantity - parseInt(quantity)
                                            } units
                                        </span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Threshold: {sku.threshold_quantity} → {" "}
                                        <span className="font-semibold">{thresholdQuantity} units</span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isLoading}
                        >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !quantity || isNaN(parseInt(quantity)) || !thresholdQuantity || isNaN(parseInt(thresholdQuantity))}
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="h-3 w-3 mr-1" />
                                    Update Stock
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}