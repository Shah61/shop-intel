"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Save, RefreshCw } from "lucide-react";

export const InventoryForm = () => {
    const [formData, setFormData] = useState({
        warehouse: "",
        inventory: "",
        sku: "",
        notes: "",
        quantityToAdd: "",
        quantityToRemove: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log("Form submitted:", formData);
        alert("Inventory updated successfully!");
        
        setIsSubmitting(false);
        handleReset();
    };

    const handleReset = () => {
        setFormData({
            warehouse: "",
            inventory: "",
            sku: "",
            notes: "",
            quantityToAdd: "",
            quantityToRemove: ""
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Update Inventory
                    </CardTitle>
                    <CardDescription>
                        Simple inventory management - add or remove stock from your inventory.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Warehouse Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="warehouse">Choose Warehouse *</Label>
                            <Select onValueChange={(value) => handleInputChange("warehouse", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Warehouse" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="warehouse-a">Warehouse A - KL</SelectItem>
                                    <SelectItem value="warehouse-b">Warehouse B - Selangor</SelectItem>
                                    <SelectItem value="store-kl">Store - Kuala Lumpur</SelectItem>
                                    <SelectItem value="store-sg">Store - Singapore</SelectItem>
                                    <SelectItem value="online-fulfillment">Online Fulfillment Center</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Inventory Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="inventory">Choose Inventory *</Label>
                            <Select onValueChange={(value) => handleInputChange("inventory", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Inventory" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="beauty-cream">Beauty Cream</SelectItem>
                                    <SelectItem value="facial-cleanser">Facial Cleanser</SelectItem>
                                    <SelectItem value="moisturizer">Moisturizer</SelectItem>
                                    <SelectItem value="serum">Anti-Aging Serum</SelectItem>
                                    <SelectItem value="toner">Refreshing Toner</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* SKU Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="sku">Choose SKU *</Label>
                            <Select onValueChange={(value) => handleInputChange("sku", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select SKU" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SKU001">SKU001 - Beauty Cream 50ml</SelectItem>
                                    <SelectItem value="SKU002">SKU002 - Facial Cleanser 100ml</SelectItem>
                                    <SelectItem value="SKU003">SKU003 - Moisturizer 75ml</SelectItem>
                                    <SelectItem value="SKU004">SKU004 - Serum 30ml</SelectItem>
                                    <SelectItem value="SKU005">SKU005 - Toner 200ml</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Quantity Management */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="quantityToAdd">Quantity to Add</Label>
                                <Input
                                    id="quantityToAdd"
                                    type="number"
                                    min="0"
                                    value={formData.quantityToAdd}
                                    onChange={(e) => handleInputChange("quantityToAdd", e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quantityToRemove">Quantity to Remove</Label>
                                <Input
                                    id="quantityToRemove"
                                    type="number"
                                    min="0"
                                    value={formData.quantityToRemove}
                                    onChange={(e) => handleInputChange("quantityToRemove", e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => handleInputChange("notes", e.target.value)}
                                placeholder="Add any notes about this stock update..."
                                rows={3}
                            />
                        </div>

                        {/* Form Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-6">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-none"
                            >
                                {isSubmitting ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Update Inventory
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleReset}
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-none"
                            >
                                Reset Form
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
