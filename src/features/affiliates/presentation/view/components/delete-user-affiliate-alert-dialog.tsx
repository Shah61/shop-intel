import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Trash2, UserX } from "lucide-react";
import { Affiliaters } from "../../../data/model/affiliates-model";

interface DeleteUserAffiliateAlertDialogProps {
    affiliate: Affiliaters;
    onDelete: (affiliate: Affiliaters) => void;
}

const DeleteUserAffiliateAlertDialog = ({ affiliate, onDelete }: DeleteUserAffiliateAlertDialogProps) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <div className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                    Delete Affiliate
                    <UserX className="ml-2 h-4 w-4" />
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the affiliate account for{" "}
                        <span className="font-semibold">{affiliate.user_affiliate.first_name} {affiliate.user_affiliate.last_name}</span>{" "}
                        and remove their data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(affiliate)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteUserAffiliateAlertDialog;