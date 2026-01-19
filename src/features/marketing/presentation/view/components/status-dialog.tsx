import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface StatusDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    status: 'success' | 'error';
    title: string;
    description: string;
}

export const StatusDialog = ({
    isOpen,
    onOpenChange,
    status,
    title,
    description
}: StatusDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {status === 'success' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}; 