"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Affiliaters, Commission } from "../../../data/model/affiliates-model";
import { useGetUnPaidCommission } from "../../../presentation/tanstack/affiliates-tanstack";
import { Checkbox } from "@/components/ui/checkbox";
import toast from 'react-hot-toast';
import { formatCurrency } from "@/src/core/constant/helper";
import React from "react";

interface CreatePayoutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    affiliate: Affiliaters;
    onSubmit?: (values: any) => Promise<void>;
}

const CreatePayoutDialog = ({
    open,
    onOpenChange,
    affiliate,
    onSubmit
}: CreatePayoutDialogProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);

    const { data: unpaidCommissions, isLoading: isLoadingCommissions } = useGetUnPaidCommission(
        affiliate.unpaid_commissions_id
    );

    // Reset state when dialog closes
    React.useEffect(() => {
        if (!open) {
            setSelectedCommissions([]);
            setIsSubmitting(false);
        }
    }, [open]);

    const totalSelectedAmount = (unpaidCommissions || [])
        .filter((commission) => selectedCommissions.includes(commission.id))
        .reduce((sum, commission) => sum + commission.commission, 0);

    const handleCommissionToggle = (commissionId: string) => {
        setSelectedCommissions((prev) =>
            prev.includes(commissionId)
                ? prev.filter((id) => id !== commissionId)
                : [...prev, commissionId]
        );
    };

    const handleSubmit = async () => {
        try {
            if (selectedCommissions.length === 0) {
                toast.error("Please select at least one commission");
                return;
            }

            setIsSubmitting(true);
            const payload = {
                user_affiliate_id: affiliate.user_affiliate.id,
                commission_ids: selectedCommissions,
                payout_amount: totalSelectedAmount
            };
            await onSubmit?.(payload);

            onOpenChange(false);
        } catch (error) {
            console.error("Failed to create payout:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create Payout</DialogTitle>
                    <DialogDescription>
                        Create a payout for {affiliate.user_affiliate.first_name} {affiliate.user_affiliate.last_name}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label className="text-sm font-medium">Affiliate</Label>
                        <div className="rounded-lg border p-3">
                            <div className="font-medium">
                                {affiliate.user_affiliate.first_name} {affiliate.user_affiliate.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {affiliate.user_affiliate.email}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                                ID: {affiliate.user_affiliate.id}
                            </div>

                            <div className="text-sm text-muted-foreground mt-1">
                                Total Unpaid Commissions: {affiliate.total_unpaid_commission_amount}
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between border-t pt-3">
                                    <h3 className="text-sm font-medium">Bank Details</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Bank Name</span>
                                        <p className="font-medium">{affiliate.user_affiliate.bank_detail.bank_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Account Number</span>
                                        <p className="font-medium">{affiliate.user_affiliate.bank_detail.account_number}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Account Holder</span>
                                        <p className="font-medium">{affiliate.user_affiliate.bank_detail.account_holder}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-sm font-medium">Unpaid Commissions</Label>
                        {isLoadingCommissions ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : (
                            <div className="rounded-lg border divide-y">
                                <div className="p-3 flex items-center space-x-3 bg-muted">
                                    <Checkbox
                                        checked={selectedCommissions.length === unpaidCommissions?.length}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedCommissions(unpaidCommissions?.map(c => c.id) || []);
                                            } else {
                                                setSelectedCommissions([]);
                                            }
                                        }}
                                    />
                                    <Label className="font-medium">Select All</Label>
                                </div>
                                {unpaidCommissions?.map((commission) => (
                                    <div key={commission.id} className="p-3 flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                checked={selectedCommissions.includes(commission.id)}
                                                onCheckedChange={() => handleCommissionToggle(commission.id)}
                                            />
                                            <div>
                                                <div className="font-medium">Order #{commission.order_id}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Sales: {formatCurrency(commission.total_sales)} | Commission: {formatCurrency(commission.commission)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-sm">
                                            {new Date(commission.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg border bg-muted">
                        <span className="font-medium">Total Selected Amount:</span>
                        <span className="text-lg font-bold">{formatCurrency(totalSelectedAmount)}</span>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || selectedCommissions.length === 0}>
                        {isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create Payout
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePayoutDialog;