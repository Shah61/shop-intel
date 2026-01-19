import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Edit, Check, Plus, Trash2 } from "lucide-react";
import { MarketingItem, UpdateMarketingItemRequest, CreateMarketingLinkRequest } from "../../../data/model/marketing-entity";
import { useUpdateMarketingItem } from "../../tanstack/marketing-tanstack";
import { StatusDialog } from "./status-dialog";

interface EditDialogProps {
    item: MarketingItem | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export const EditDialog = ({ item, isOpen, onOpenChange }: EditDialogProps) => {
    const [formData, setFormData] = useState<Partial<UpdateMarketingItemRequest>>({});
    const updateMutation = useUpdateMarketingItem();
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

    // Reset form and status dialog when item changes or dialog closes
    useEffect(() => {
        if (!isOpen) {
            setStatusDialog(prev => ({ ...prev, isOpen: false }));
        }
        if (item) {
            setFormData({
                name: item.name,
                description: item.description,
                cost: item.cost,
                duration: item.duration,
                start_date: item.start_date ? item.start_date.split('T')[0] : '',
                end_date: item.end_date ? item.end_date.split('T')[0] : '',
                links: item.marketing_links?.map(link => ({
                    link: link.link,
                    platform: link.platform
                })) || []
            });
        }
    }, [item, isOpen]);

    const handleStatusDialogClose = (open: boolean) => {
        setStatusDialog(prev => ({ ...prev, isOpen: open }));
        if (!open) {
            onOpenChange(false); // Close the edit dialog only after status dialog is closed
        }
    };

    const handleInputChange = (field: keyof UpdateMarketingItemRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLinkChange = (linkIndex: number, field: keyof CreateMarketingLinkRequest, value: string) => {
        if (!formData.links) return;
        
        const updatedLinks = formData.links.map((link, i) => 
            i === linkIndex ? { ...link, [field]: value } : link
        );
        setFormData(prev => ({ ...prev, links: updatedLinks }));
    };

    const addNewLink = () => {
        const newLink: CreateMarketingLinkRequest = {
            link: "",
            platform: "FACEBOOK"
        };
        setFormData(prev => ({ 
            ...prev, 
            links: [...(prev.links || []), newLink]
        }));
    };

    const removeLink = (linkIndex: number) => {
        if (!formData.links || formData.links.length <= 1) return;
        
        const updatedLinks = formData.links.filter((_, i) => i !== linkIndex);
        setFormData(prev => ({ ...prev, links: updatedLinks }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!item) return;

        try {
            // Only send changed fields
            const changedFields: Partial<UpdateMarketingItemRequest> = {};
            
            if (formData.name !== item.name) changedFields.name = formData.name;
            if (formData.description !== item.description) changedFields.description = formData.description;
            if (formData.cost !== item.cost) changedFields.cost = formData.cost;
            if (formData.duration !== item.duration) changedFields.duration = formData.duration;
            const originalStartDate = item.start_date ? item.start_date.split('T')[0] : '';
            const originalEndDate = item.end_date ? item.end_date.split('T')[0] : '';
            
            if (formData.start_date !== originalStartDate) {
                changedFields.start_date = formData.start_date;
            }
            if (formData.end_date !== originalEndDate) {
                changedFields.end_date = formData.end_date;
            }
            
            // Check if links have changed
            const originalLinks = item.marketing_links || [];
            const currentLinks = formData.links || [];
            
            // Create sets for comparison (ignoring order)
            const originalLinkSet = new Set(
                originalLinks.map(link => `${link.link}|${link.platform}`)
            );
            const currentLinkSet = new Set(
                currentLinks.map(link => `${link.link}|${link.platform}`)
            );
            
            // Check if sets are different (different lengths or different content)
            const linksChanged = originalLinkSet.size !== currentLinkSet.size ||
                [...originalLinkSet].some(linkKey => !currentLinkSet.has(linkKey)) ||
                [...currentLinkSet].some(linkKey => !originalLinkSet.has(linkKey));
            
            if (linksChanged) {
                changedFields.links = currentLinks;
                console.log('📝 Links changed detected:', {
                    original: originalLinks.map(l => ({ link: l.link, platform: l.platform })),
                    current: currentLinks,
                    originalCount: originalLinks.length,
                    currentCount: currentLinks.length
                });
            }

            // If no changes, show status dialog
            if (Object.keys(changedFields).length === 0) {
                console.log('❌ No changes detected');
                setStatusDialog({
                    isOpen: true,
                    status: 'error',
                    title: 'No Changes Made',
                    description: 'You haven\'t made any changes to the marketing item.'
                });
                return;
            }

            console.log('🔄 Updating marketing item:', {
                itemId: item.id,
                changedFields: changedFields,
                originalItem: {
                    name: item.name,
                    description: item.description,
                    cost: item.cost,
                    duration: item.duration,
                    start_date: item.start_date,
                    end_date: item.end_date,
                    marketing_links: item.marketing_links
                }
            });

            const result = await updateMutation.mutateAsync({
                itemId: item.id,
                data: changedFields
            });

            console.log('✅ Update successful! Response:', result);
            
            // Show success dialog and keep edit dialog open until status is acknowledged
            setStatusDialog({
                isOpen: true,
                status: 'success',
                title: 'Update Successful',
                description: 'Your marketing item has been updated successfully.'
            });
            
        } catch (error) {
            console.error('❌ Failed to update marketing item:', error);
            // Show error dialog
            setStatusDialog({
                isOpen: true,
                status: 'error',
                title: 'Update Failed',
                description: 'There was a problem updating the marketing item. Please try again.'
            });
        }
    };

    if (!item) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground">
                            <Edit className="h-5 w-5 text-pink-500 dark:text-pink-400" />
                            Edit Marketing Item
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Update the details of your marketing item.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-foreground">Name</Label>
                            <Input
                                id="name"
                                value={formData.name || ''}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Marketing item name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-foreground">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description || ''}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Brief description"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cost" className="text-foreground">Cost (RM)</Label>
                                <Input
                                    id="cost"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.cost || ''}
                                    onChange={(e) => handleInputChange('cost', Number(e.target.value))}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="duration" className="text-foreground">Duration (days)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    min="1"
                                    value={formData.duration || ''}
                                    onChange={(e) => handleInputChange('duration', Number(e.target.value))}
                                    placeholder="7"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date" className="text-foreground">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={formData.start_date || ''}
                                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="end_date" className="text-foreground">End Date</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={formData.end_date || ''}
                                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Marketing Links Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-foreground">Marketing Links</Label>
                                <Button 
                                    type="button" 
                                    onClick={addNewLink}
                                    variant="outline" 
                                    size="sm"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Link
                                </Button>
                            </div>
                            
                            <div className="space-y-3">
                                {(formData.links || []).map((link, linkIndex) => (
                                    <div key={linkIndex} className="flex gap-3 p-3 border border-border rounded-lg bg-muted/30 dark:bg-muted/20">
                                        <div className="flex-1">
                                            <Label className="text-xs font-medium text-muted-foreground">Platform</Label>
                                            <Select 
                                                onValueChange={(value) => handleLinkChange(linkIndex, 'platform', value)} 
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
                                                onChange={(e) => handleLinkChange(linkIndex, 'link', e.target.value)}
                                                placeholder="https://..."
                                                className="mt-1 h-9"
                                            />
                                        </div>
                                        {(formData.links || []).length > 1 && (
                                            <div className="flex items-end">
                                                <Button
                                                    type="button"
                                                    onClick={() => removeLink(linkIndex)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 h-9"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => onOpenChange(false)}
                                disabled={updateMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit"
                                disabled={updateMutation.isPending}
                            >
                                {updateMutation.isPending ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Item'
                                )}
                            </Button>
                        </DialogFooter>
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
