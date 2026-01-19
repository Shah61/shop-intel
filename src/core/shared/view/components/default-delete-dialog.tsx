import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface DefaultDeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    itemName?: string;
}

const DefaultDeleteDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    itemName,
}: DefaultDeleteDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {itemName ? `Delete ${itemName}?` : title}
                    </DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Delete
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DefaultDeleteDialog;