import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Plus, Trash2, Copy } from "lucide-react";
import { CreateMarketingItemRequest, CreateMarketingLinkRequest } from "../../../data/model/marketing-entity";
import { StatusDialog } from "./status-dialog";
import { useCreateManyMarketingItems } from "../../tanstack/marketing-tanstack";

interface AddMarketingItemDialogProps {

    marketingId: string;
}

const AddMarketingItemDialog = ({marketingId }: AddMarketingItemDialogProps) => {
    const [items, setItems] = useState<CreateMarketingItemRequest[]>([{
        name: "",
        description: "",
        cost: 0,
        duration: 0,
        start_date: "",
        marketing_id: marketingId,
        links: []
    }]);

    const createMutation = useCreateManyMarketingItems();

    const [statusDialog, setStatusDialog] = useState<{
        isOpen: boolean;
        status: 'success' | 'error';
        title: string;
        description: string;
    }>({
        isOpen: false,
        status: 'success',
        title: '',
        description: ''
    });

    const handleInputChange = (itemIndex: number, field: keyof CreateMarketingItemRequest, value: any) => {
        setItems(prev => prev.map((item, index) => 
            index === itemIndex ? { ...item, [field]: value } : item
        ));
    };

    const handleLinkChange = (itemIndex: number, linkIndex: number, field: keyof CreateMarketingLinkRequest, value: string) => {
        setItems(prev => prev.map((item, index) => {
            if (index !== itemIndex) return item;
            
            const updatedLinks = item.links.map((link, i) => 
                i === linkIndex ? { ...link, [field]: value } : link
            );
            return { ...item, links: updatedLinks };
        }));
    };

    const addNewLink = (itemIndex: number) => {
        const newLink: CreateMarketingLinkRequest = {
            link: "",
            platform: "FACEBOOK"
        };
        setItems(prev => prev.map((item, index) => 
            index === itemIndex 
                ? { ...item, links: [...item.links, newLink] }
                : item
        ));
    };

    const removeLink = (itemIndex: number, linkIndex: number) => {
        setItems(prev => prev.map((item, index) => {
            if (index !== itemIndex) return item;
            
            const updatedLinks = item.links.filter((_, i) => i !== linkIndex);
            
            if (updatedLinks.length === 0) {
                return {
                    ...item,
                    links: [{
                        link: "",
                        platform: "FACEBOOK"
                    }]
                };
            }
            
            return { ...item, links: updatedLinks };
        }));
    };

    const addNewItem = () => {
        setItems(prev => [...prev, {
            name: "",
            description: "",
            cost: 0,
            duration: 0,
            start_date: "",
            links: []
        }]);
    };

    const duplicateItem = (itemIndex: number) => {
        setItems(prev => [...prev, { ...prev[itemIndex] }]);
    };

    const removeItem = (itemIndex: number) => {
        if (items.length <= 1) return;
        setItems(prev => prev.filter((_, index) => index !== itemIndex));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // Validate required fields
            const isValid = items.every(item => 
                item.name && 
                item.description && 
                item.cost > 0 && 
                item.duration > 0 && 
                item.start_date
            );

            if (!isValid) {
                setStatusDialog({
                    isOpen: true,
                    status: 'error',
                    title: 'Validation Error',
                    description: 'Please fill in all required fields for each item.'
                });
                return;
            }

            // Format the data to match the required payload
            const payload = items.map(item => ({
                marketing_id: marketingId,
                name: item.name,
                description: item.description,
                cost: item.cost,
                duration: item.duration,
                start_date: item.start_date,
                links: item.links.map(link => ({
                    link: link.link,
                    platform: link.platform
                }))
            }));

            console.log('🔄 Creating marketing items:', payload);
            
            await createMutation.mutateAsync(payload);
            
            // Show success dialog
            setStatusDialog({
                isOpen: true,
                status: 'success',
                title: 'Creation Successful',
                description: 'Your marketing items have been created successfully.'
            });
            
        } catch (error) {
            console.error('❌ Failed to create marketing items:', error);
            setStatusDialog({
                isOpen: true,
                status: 'error',
                title: 'Creation Failed',
                description: 'There was a problem creating the marketing items. Please try again.'
            });
        }
    };

    const handleStatusDialogClose = (open: boolean) => {
        setStatusDialog(prev => ({ ...prev, isOpen: open }));
        
    };

    return (
        <>
            <Dialog >
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Marketing Items
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground">
                            <Plus className="h-5 w-5 text-pink-500 dark:text-pink-400" />
                            Add Marketing Items
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Create multiple marketing items with the details below.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {items.map((item, itemIndex) => (
                            <div key={itemIndex} className="p-4 border border-border rounded-lg space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Item {itemIndex + 1}</h3>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => duplicateItem(itemIndex)}
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Duplicate
                                        </Button>
                                        {items.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeItem(itemIndex)}
                                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`name-${itemIndex}`} className="text-foreground">Name</Label>
                                    <Input
                                        id={`name-${itemIndex}`}
                                        value={item.name}
                                        onChange={(e) => handleInputChange(itemIndex, 'name', e.target.value)}
                                        placeholder="Marketing item name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`description-${itemIndex}`} className="text-foreground">Description</Label>
                                    <Textarea
                                        id={`description-${itemIndex}`}
                                        value={item.description}
                                        onChange={(e) => handleInputChange(itemIndex, 'description', e.target.value)}
                                        placeholder="Brief description"
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`cost-${itemIndex}`} className="text-foreground">Cost (RM)</Label>
                                        <Input
                                            id={`cost-${itemIndex}`}
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.cost}
                                            onChange={(e) => handleInputChange(itemIndex, 'cost', Number(e.target.value))}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`duration-${itemIndex}`} className="text-foreground">Duration (days)</Label>
                                        <Input
                                            id={`duration-${itemIndex}`}
                                            type="number"
                                            min="1"
                                            value={item.duration}
                                            onChange={(e) => handleInputChange(itemIndex, 'duration', Number(e.target.value))}
                                            placeholder="7"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`start_date-${itemIndex}`} className="text-foreground">Start Date</Label>
                                    <Input
                                        id={`start_date-${itemIndex}`}
                                        type="date"
                                        value={item.start_date}
                                        onChange={(e) => handleInputChange(itemIndex, 'start_date', e.target.value)}
                                    />
                                </div>

                                {/* Marketing Links Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-foreground">Marketing Links</Label>
                                        <Button 
                                            type="button" 
                                            onClick={() => addNewLink(itemIndex)}
                                            variant="outline" 
                                            size="sm"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Link
                                        </Button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {item.links.map((link, linkIndex) => (
                                            <div key={linkIndex} className="flex gap-3 p-3 border border-border rounded-lg bg-muted/30 dark:bg-muted/20">
                                                <div className="flex-1">
                                                    <Label className="text-xs font-medium text-muted-foreground">Platform</Label>
                                                    <Select 
                                                        onValueChange={(value) => handleLinkChange(itemIndex, linkIndex, 'platform', value)} 
                                                        value={link.platform}
                                                    >
                                                        <SelectTrigger className="mt-1 h-9">
                                                            <SelectValue placeholder="Select platform" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="FACEBOOK">Facebook</SelectItem>
                                                            <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                                                            <SelectItem value="TIKTOK">TikTok</SelectItem>
                                                            <SelectItem value="YOUTUBE">YouTube</SelectItem>
                                                            <SelectItem value="GOOGLE">Google</SelectItem>
                                                            <SelectItem value="TWITTER">Twitter</SelectItem>
                                                            <SelectItem value="OTHER">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex-[2]">
                                                    <Label className="text-xs font-medium text-muted-foreground">Campaign Link</Label>
                                                    <Input
                                                        value={link.link}
                                                        onChange={(e) => handleLinkChange(itemIndex, linkIndex, 'link', e.target.value)}
                                                        placeholder="https://..."
                                                        className="mt-1 h-9"
                                                    />
                                                </div>
                                                <div className="flex items-end">
                                                    <Button
                                                        type="button"
                                                        onClick={() => removeLink(itemIndex, linkIndex)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 h-9"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-between items-center">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={addNewItem}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Another Item
                            </Button>

                            <div className="flex gap-2">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    
                                    disabled={createMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit"
                                    disabled={createMutation.isPending}
                                >
                                    {createMutation.isPending ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Items'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <StatusDialog
                isOpen={statusDialog.isOpen}
                onOpenChange={handleStatusDialogClose}
                status={statusDialog.status}
                title={statusDialog.title}
                description={statusDialog.description}
            />
        </>
    );
};

export default AddMarketingItemDialog; 