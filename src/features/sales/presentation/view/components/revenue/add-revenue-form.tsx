"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar, Clock, Loader2, PlusCircle } from "lucide-react"

// Form schema using zod
const formSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    sku: z.string().min(1, "SKU is required"),
    quantity: z.coerce.number().positive("Quantity must be positive"),
    subtotal: z.coerce.number().positive("Subtotal must be positive"),
    platform: z.string().min(1, "Platform is required"),
    type: z.string().min(1, "Type is required"),
    quarter: z.string().min(1, "Quarter is required"),
})

const AddRevenueForm = () => {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Initialize form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            orderId: "",
            date: new Date().toISOString().split("T")[0],
            time: new Date().toTimeString().split(" ")[0].substring(0, 8),
            sku: "",
            quantity: 1,
            subtotal: 0,
            platform: "Shopee",
            type: "Single",
            quarter: "Q1"
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Log the form data (replace with your actual submission logic)
            console.log("Form submitted:", values)

            // Close the dialog and reset form on successful submission
            setOpen(false)
            form.reset({
                orderId: "",
                date: new Date().toISOString().split("T")[0],
                time: new Date().toTimeString().split(" ")[0].substring(0, 8),
                sku: "",
                quantity: 1,
                subtotal: 0,
                platform: "Shopee",
                type: "Single",
                quarter: "Q1"
            })
        } catch (error) {
            console.error("Error submitting form:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const platforms = ["Shopee", "TikTok", "Facebook", "Instagram", "Website"]
    const types = ["Single", "Bundle", "Wholesale"]
    const quarters = ["Q1", "Q2", "Q3", "Q4"]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 ">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Revenue
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Revenue Entry</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new revenue entry
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="orderId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Order ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter Order ID" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-2">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    className="pl-9"
                                                />
                                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Time</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="time"
                                                    step="1"
                                                    {...field}
                                                    className="pl-9"
                                                />
                                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="sku"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SKU</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter SKU" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantity</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Enter quantity"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="subtotal"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subtotal</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Enter amount"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="platform"
                                render={({ field }) => (
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
                                                {platforms.map(platform => (
                                                    <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {types.map(type => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="quarter"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quarter</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select quarter" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {quarters.map(quarter => (
                                                    <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-primary hover:bg-primary/90"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : "Save Entry"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default AddRevenueForm