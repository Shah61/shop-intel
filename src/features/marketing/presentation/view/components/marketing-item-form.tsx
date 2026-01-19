import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { CreateMarketingItemRequest, CreateMarketingLinkRequest } from "../../../data/model/marketing-entity";

interface MarketingItemFormProps {
    item: CreateMarketingItemRequest;
    index: number;
    onItemChange: (index: number, field: keyof CreateMarketingItemRequest, value: any) => void;
    onRemove: (index: number) => void;
    canRemove: boolean;
}

export const MarketingItemForm = ({ 
    item, 
    index, 
    onItemChange, 
    onRemove,
    canRemove 
}: MarketingItemFormProps) => {
    const handleLinkChange = (linkIndex: number, field: keyof CreateMarketingLinkRequest, value: string) => {
        const updatedLinks = item.links.map((link, i) => 
            i === linkIndex ? { ...link, [field]: value } : link
        );
        onItemChange(index, 'links', updatedLinks);
    };

    const addNewLink = () => {
        const newLink: CreateMarketingLinkRequest = {
            link: "",
            platform: "FACEBOOK"
        };
        onItemChange(index, 'links', [...item.links, newLink]);
    };

    const removeLink = (linkIndex: number) => {
        if (item.links.length > 1) {
            const updatedLinks = item.links.filter((_, i) => i !== linkIndex);
            onItemChange(index, 'links', updatedLinks);
        }
    };

    return (
        <Card className="relative border-border bg-card">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-foreground">Item {index + 1}</CardTitle>
                    {canRemove && (
                        <Button 
                            type="button" 
                            onClick={() => onRemove(index)}
                            variant="ghost" 
                            size="sm"
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-foreground">Name</Label>
                        <Input
                            value={item.name}
                            onChange={(e) => onItemChange(index, 'name', e.target.value)}
                            placeholder="Social Media Campaign"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-foreground">Cost (RM)</Label>
                        <Input
                            type="number"
                            min="0"
                            value={item.cost || ''}
                            onChange={(e) => onItemChange(index, 'cost', Number(e.target.value))}
                            placeholder="1000"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-foreground">Duration (Days)</Label>
                        <Input
                            type="number"
                            min="1"
                            value={item.duration || ''}
                            onChange={(e) => onItemChange(index, 'duration', Number(e.target.value))}
                            placeholder="7"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-foreground">Start Date</Label>
                        <Input
                            type="date"
                            value={item.start_date}
                            onChange={(e) => onItemChange(index, 'start_date', e.target.value)}
                            className="mt-1"
                        />
                    </div>
                </div>
                
                <div>
                    <Label className="text-sm font-medium text-foreground">Description</Label>
                    <Textarea
                        value={item.description}
                        onChange={(e) => onItemChange(index, 'description', e.target.value)}
                        placeholder="Describe this marketing campaign..."
                        className="mt-1"
                        rows={3}
                    />
                </div>

                {/* Marketing Links Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-foreground">Marketing Links</Label>
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
                        {item.links.map((link, linkIndex) => (
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
                                {item.links.length > 1 && (
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
            </CardContent>
        </Card>
    );
}; 