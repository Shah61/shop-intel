"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

// Validation schema
const formSchema = z.object({
    date: z.date({
        required_error: "Sales date is required",
    }),
    platform: z.string({
        required_error: "Platform is required",
    }),
    sku: z.string({
        required_error: "SKU is required",
    }),
    quantity: z.number({
        required_error: "Quantity is required",
    }).min(1, "Quantity must be at least 1"),
    unitPrice: z.number({
        required_error: "Unit price is required",
    }).min(0.01, "Unit price must be greater than 0"),
    discount: z.number().default(0),
    shippingFee: z.number().default(0),
    notes: z.string().optional(),
});

// Define the form data type
type SalesFormValues = z.infer<typeof formSchema>;

// Sample SKU data for dropdown
const skuOptions = [
    { id: 'NBSS030', name: 'NBSS 030' },
    { id: 'NBBFSMIST', name: 'NBBFSMist' },
    { id: 'NBFMB', name: 'NBFMB' },
    { id: 'NBFSMIST', name: 'NBFSMist' },
    { id: 'NBM100', name: 'NBM 100' },
    { id: 'NBSFS', name: 'NBSFS' },
    { id: 'NBM003_15', name: '15 NBM 003' },
    { id: 'NBSFSMIST', name: 'NBSFSMist' },
    { id: 'NBM003', name: 'NBM 003' },
];

// Platform options
const platformOptions = [
    { id: 'shopee', name: 'Shopee' },
    { id: 'tiktok', name: 'TikTok' },
    { id: 'website', name: 'Website' },
    { id: 'physical', name: 'Physical Store' },
];

const AddSalesForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form
    const form = useForm<SalesFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date(),
            quantity: 1,
            unitPrice: 0,
            discount: 0,
            shippingFee: 0,
            notes: "",
        },
    });

    // Calculate total amount
    const watchQuantity = form.watch("quantity") || 0;
    const watchUnitPrice = form.watch("unitPrice") || 0;
    const watchDiscount = form.watch("discount") || 0;
    const watchShippingFee = form.watch("shippingFee") || 0;

    const totalAmount = (watchQuantity * watchUnitPrice) - watchDiscount + watchShippingFee;

    // Form submission handler
    const onSubmit = async (values: SalesFormValues) => {
        setIsSubmitting(true);
        try {
            // In a real app, you would send this data to your API
            console.log('Form Data:', values);

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Reset form after successful submission
            form.reset({
                date: new Date(),
                platform: "",
                sku: "",
                quantity: 1,
                unitPrice: 0,
                discount: 0,
                shippingFee: 0,
                notes: "",
            });

            // Show success notification (in a real app)
            alert("Sales record added successfully!");
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-3xl mx-auto shadow-sm">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-semibold">Add Sales Record</CardTitle>
                <CardDescription>
                    Enter the details of the new sales transaction
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Date Field */}
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }: { field: any }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full pl-3 text-left font-normal h-10"
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span className="text-muted-foreground">Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Platform Field */}
                            <FormField
                                control={form.control}
                                name="platform"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Platform</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select platform" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {platformOptions.map((platform) => (
                                                    <SelectItem
                                                        key={platform.id}
                                                        value={platform.id}
                                                    >
                                                        {platform.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* SKU Field */}
                        <FormField
                            control={form.control}
                            name="sku"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>Product SKU</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select product SKU" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {skuOptions.map((sku) => (
                                                <SelectItem
                                                    key={sku.id}
                                                    value={sku.id}
                                                >
                                                    {sku.id} - {sku.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Quantity Field */}
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                placeholder="Enter quantity"
                                                {...form.register("quantity", { valueAsNumber: true })}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Unit Price Field */}
                            <FormField
                                control={form.control}
                                name="unitPrice"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Unit Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min={0}
                                                placeholder="0.00"
                                                {...form.register("unitPrice", { valueAsNumber: true })}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Total Amount (Read-only) */}
                            <div>
                                <FormLabel>Total Amount</FormLabel>
                                <Input
                                    value={totalAmount.toFixed(2)}
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Discount Field */}
                            <FormField
                                control={form.control}
                                name="discount"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Discount</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min={0}
                                                placeholder="0.00"
                                                {...form.register("discount", { valueAsNumber: true })}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Shipping Fee Field */}
                            <FormField
                                control={form.control}
                                name="shippingFee"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Shipping Fee</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min={0}
                                                placeholder="0.00"
                                                {...form.register("shippingFee", { valueAsNumber: true })}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Notes Field */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Add any additional notes here (optional)"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>

                    <Separator />

                    <CardFooter className="flex justify-between pt-6">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => form.reset()}
                            disabled={isSubmitting}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {isSubmitting ? "Saving..." : "Save Record"}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
};

export default AddSalesForm;