import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Plus, RefreshCw, AlertTriangle, X } from "lucide-react";
import { CreateMarketingItemRequest, CreateMarketingLinkRequest } from "../../../data/model/marketing-entity";
import { useCreateMarketing } from "../../tanstack/marketing-tanstack";
import { MarketingItemForm } from "./marketing-item-form";

interface CampaignForm {
    name: string;
    description: string;
    items: CreateMarketingItemRequest[];
}

interface MarketingDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    isLoading?: boolean;
}

export const MarketingDialog = ({ isOpen, onOpenChange, isLoading }: MarketingDialogProps) => {
    const [campaignForm, setCampaignForm] = useState<CampaignForm>({
        name: "",
        description: "",
        items: [{
            name: "",
            description: "",
            cost: 0,
            duration: 7,
            start_date: new Date().toISOString().split('T')[0],
            links: [{
                link: "",
                platform: "FACEBOOK"
            }]
        }]
    });

    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [showValidationDialog, setShowValidationDialog] = useState(false);

    const createMarketingMutation = useCreateMarketing();

    const handleCampaignFormChange = (field: keyof CampaignForm, value: any) => {
        setCampaignForm(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index: number, field: keyof CreateMarketingItemRequest, value: any) => {
        setCampaignForm(prev => ({
            ...prev,
            items: prev.items.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const addNewItem = () => {
        setCampaignForm(prev => ({
            ...prev,
            items: [...prev.items, {
                name: "",
                description: "",
                cost: 0,
                duration: 7,
                start_date: new Date().toISOString().split('T')[0],
                links: [{
                    link: "",
                    platform: "FACEBOOK"
                }]
            }]
        }));
    };

    const removeItem = (index: number) => {
        setCampaignForm(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const validateForm = (): string[] => {
        const errors: string[] = [];
        
        // Validate campaign name
        if (!campaignForm.name.trim()) {
            errors.push("Campaign name is required");
        }
        
        // Validate items
        if (campaignForm.items.length === 0) {
            errors.push("At least one marketing item is required");
        }
        
        // Validate each item
        campaignForm.items.forEach((item, index) => {
            const itemNumber = index + 1;
            
            if (!item.name.trim()) {
                errors.push(`Item ${itemNumber}: Name is required`);
            }
            
            if (!item.description.trim()) {
                errors.push(`Item ${itemNumber}: Description is required`);
            }
            
            if (item.cost <= 0) {
                errors.push(`Item ${itemNumber}: Cost must be greater than 0`);
            }
            
            if (item.duration <= 0) {
                errors.push(`Item ${itemNumber}: Duration must be greater than 0`);
            }
            
            if (!item.start_date) {
                errors.push(`Item ${itemNumber}: Start date is required`);
            }
            
            // Validate links
            if (!item.links.length) {
                errors.push(`Item ${itemNumber}: At least one marketing link is required`);
            } else {
                item.links.forEach((link, linkIndex) => {
                    if (!link.link.trim()) {
                        errors.push(`Item ${itemNumber}, Link ${linkIndex + 1}: URL is required`);
                    }
                    if (!link.platform) {
                        errors.push(`Item ${itemNumber}, Link ${linkIndex + 1}: Platform is required`);
                    }
                });
            }
        });
        
        return errors;
    };

    const handleSubmit = async () => {
        const errors = validateForm();
        
        if (errors.length > 0) {
            setValidationErrors(errors);
            setShowValidationDialog(true);
            return;
        }

        try {
            await createMarketingMutation.mutateAsync({
                name: campaignForm.name,
                marketing_items: campaignForm.items.map(item => ({
                    ...item,
                    start_date: new Date(item.start_date).toISOString()
                }))
            });
            
            onOpenChange(false);
            setCampaignForm({
                name: "",
                description: "",
                items: [{
                    name: "",
                    description: "",
                    cost: 0,
                    duration: 7,
                    start_date: new Date().toISOString().split('T')[0],
                                    links: [{
                    link: "",
                    platform: "FACEBOOK"
                }]
                }]
            });
            setValidationErrors([]);
        } catch (error) {
            console.error('Failed to create campaign:', error);
            setValidationErrors(['Failed to create campaign. Please try again.']);
            setShowValidationDialog(true);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button disabled={isLoading} className="w-full md:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Create New Campaign</DialogTitle>
                    <DialogDescription>
                        Design your marketing campaign with multiple items and platforms
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Campaign Details Card */}
                    <Card className="border-border bg-card">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="campaignName" className="text-base font-medium text-foreground">Campaign Name</Label>
                                    <Input
                                        id="campaignName"
                                        value={campaignForm.name}
                                        onChange={(e) => handleCampaignFormChange('name', e.target.value)}
                                        placeholder="e.g., Holiday Beauty Collection 2024"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="campaignDescription" className="text-base font-medium text-foreground">Campaign Description</Label>
                                    <Input
                                        id="campaignDescription"
                                        value={campaignForm.description}
                                        onChange={(e) => handleCampaignFormChange('description', e.target.value)}
                                        placeholder="Brief description of the campaign"
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Marketing Items Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-medium text-foreground">Marketing Items</Label>
                            <Button type="button" onClick={addNewItem} variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </div>
                        
                        <div className="grid gap-6">
                            {campaignForm.items.map((item, index) => (
                                <MarketingItemForm
                                    key={index}
                                    item={item}
                                    index={index}
                                    onItemChange={handleItemChange}
                                    onRemove={removeItem}
                                    canRemove={campaignForm.items.length > 1}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button 
                        onClick={handleSubmit}
                        disabled={createMarketingMutation.isPending}
                    >
                        {createMarketingMutation.isPending ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Campaign
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/* Validation Error Dialog */}
            <AlertDialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-destructive/10">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            </div>
                            <div className="flex-1">
                                <AlertDialogTitle className="text-lg font-semibold text-destructive">
                                    Validation Required
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-sm mt-1 text-muted-foreground">
                                    Please fix the following issues before proceeding:
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>
                    
                    <div className="max-h-60 overflow-y-auto">
                        <div className="space-y-2">
                            {validationErrors.map((error, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5"
                                >
                                    <X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-foreground">{error}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <AlertDialogFooter>
                        <AlertDialogAction 
                            onClick={() => setShowValidationDialog(false)}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            Got it, I'll fix these
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    );
}; 