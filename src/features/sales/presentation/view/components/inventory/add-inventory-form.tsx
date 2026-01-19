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
import { Loader2, PlusCircle } from "lucide-react"

// Form schema using zod
const formSchema = z.object({
    sku: z.string().min(1, "SKU is required"),
    source: z.string().default("ODIN"),
    qty_now: z.coerce.number().int("Quantity must be a whole number"),
})

const AddInventoryForm = () => {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Initialize form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sku: "",
            source: "ODIN",
            qty_now: 0,
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
                sku: "",
                source: "ODIN",
                qty_now: 0,
            })
        } catch (error) {
            console.error("Error submitting form:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 ">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Inventory
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Inventory Item</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new inventory item
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                        <FormField
                            control={form.control}
                            name="source"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Source</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter source" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="qty_now"
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
                                className="bg-primary hover:bg-primary/90 "
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Adding...
                                    </>
                                ) : "Confirm"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default AddInventoryForm